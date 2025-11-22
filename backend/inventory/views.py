from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models  # <--- Added 'models' here
from django.db.models import Sum
from datetime import timedelta
from django.utils import timezone
from .models import (
    Warehouse, ProductCategory, Product, Stock,
    Receipt, ReceiptItem, DeliveryOrder, DeliveryItem,
    InternalTransfer, TransferItem, StockAdjustment, StockLedger
)
from .serializers import (
    WarehouseSerializer, ProductCategorySerializer, ProductSerializer, StockSerializer,
    ReceiptSerializer, ReceiptItemSerializer, DeliveryOrderSerializer, DeliveryItemSerializer,
    InternalTransferSerializer, TransferItemSerializer, StockAdjustmentSerializer, StockLedgerSerializer
)

# Standard CRUD Views
class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filterset_fields = ['warehouse', 'product']

# --- OPERATIONS WITH BUSINESS LOGIC ---

class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        receipt = self.get_object()
        if receipt.status != Receipt.DRAFT:
            return Response({"error": "Only draft receipts can be validated"}, status=400)

        with transaction.atomic():
            # 1. Update Status
            receipt.status = Receipt.DONE
            receipt.save()

            # 2. Update Stock & Ledger
            for item in receipt.items.all():
                stock, created = Stock.objects.get_or_create(
                    product=item.product, 
                    warehouse=receipt.warehouse
                )
                stock.quantity += item.quantity
                stock.save()

                # Log to Ledger
                StockLedger.objects.create(
                    product=item.product,
                    warehouse=receipt.warehouse,
                    change=item.quantity,
                    balance=stock.quantity,
                    source_type='Receipt',
                    source_id=receipt.id
                )

        return Response({"status": "Receipt Validated", "new_status": receipt.status})

class ReceiptItemViewSet(viewsets.ModelViewSet):
    queryset = ReceiptItem.objects.all()
    serializer_class = ReceiptItemSerializer

class DeliveryOrderViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.all()
    serializer_class = DeliveryOrderSerializer

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        delivery = self.get_object()
        if delivery.status != DeliveryOrder.DRAFT:
            return Response({"error": "Only draft deliveries can be validated"}, status=400)

        with transaction.atomic():
            # Check availability first
            for item in delivery.items.all():
                stock = Stock.objects.filter(product=item.product, warehouse=delivery.warehouse).first()
                if not stock or stock.quantity < item.quantity:
                    return Response(
                        {"error": f"Insufficient stock for {item.product.name}"}, 
                        status=400
                    )

            # Process Delivery
            delivery.status = DeliveryOrder.DONE
            delivery.save()

            for item in delivery.items.all():
                stock = Stock.objects.get(product=item.product, warehouse=delivery.warehouse)
                stock.quantity -= item.quantity
                stock.save()

                StockLedger.objects.create(
                    product=item.product,
                    warehouse=delivery.warehouse,
                    change=-item.quantity,
                    balance=stock.quantity,
                    source_type='Delivery',
                    source_id=delivery.id
                )

        return Response({"status": "Delivery Validated"})

class DeliveryItemViewSet(viewsets.ModelViewSet):
    queryset = DeliveryItem.objects.all()
    serializer_class = DeliveryItemSerializer

class InternalTransferViewSet(viewsets.ModelViewSet):
    queryset = InternalTransfer.objects.all()
    serializer_class = InternalTransferSerializer

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != InternalTransfer.DRAFT:
            return Response({"error": "Only draft transfers can be validated"}, status=400)

        with transaction.atomic():
            transfer.status = InternalTransfer.DONE
            transfer.save()

            for item in transfer.items.all():
                # Decrease Source
                source_stock, _ = Stock.objects.get_or_create(product=item.product, warehouse=transfer.from_warehouse)
                if source_stock.quantity < item.quantity:
                    return Response({"error": f"Insufficient stock in source for {item.product.name}"}, status=400)
                
                source_stock.quantity -= item.quantity
                source_stock.save()
                
                StockLedger.objects.create(
                    product=item.product, warehouse=transfer.from_warehouse,
                    change=-item.quantity, balance=source_stock.quantity,
                    source_type='Transfer Out', source_id=transfer.id
                )

                # Increase Dest
                dest_stock, _ = Stock.objects.get_or_create(product=item.product, warehouse=transfer.to_warehouse)
                dest_stock.quantity += item.quantity
                dest_stock.save()

                StockLedger.objects.create(
                    product=item.product, warehouse=transfer.to_warehouse,
                    change=item.quantity, balance=dest_stock.quantity,
                    source_type='Transfer In', source_id=transfer.id
                )

        return Response({"status": "Transfer Validated"})

class TransferItemViewSet(viewsets.ModelViewSet):
    queryset = TransferItem.objects.all()
    serializer_class = TransferItemSerializer

class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.all()
    serializer_class = StockAdjustmentSerializer
    
    def perform_create(self, serializer):
        with transaction.atomic():
            adj = serializer.save()
            stock, _ = Stock.objects.get_or_create(product=adj.product, warehouse=adj.warehouse)
            
            diff = adj.counted_quantity - stock.quantity
            stock.quantity = adj.counted_quantity
            stock.save()

            StockLedger.objects.create(
                product=adj.product, warehouse=adj.warehouse,
                change=diff, balance=stock.quantity,
                source_type='Adjustment', source_id=adj.id
            )

class StockLedgerViewSet(viewsets.ModelViewSet):
    queryset = StockLedger.objects.all().order_by('-created_at')
    serializer_class = StockLedgerSerializer

# --- DASHBOARD API ---

class DashboardStatsViewSet(viewsets.ViewSet):
    """
    Returns KPIs for the Dashboard
    """
    def list(self, request):
        # 1. Total Products
        total_products = Product.objects.count()

        # 2. Low Stock Count
        # models.F allows us to compare columns within the same database query
        low_stock_count = Stock.objects.filter(
            quantity__lt=models.F('product__low_stock_threshold')
        ).count()

        # 3. Pending Operations
        pending_receipts = Receipt.objects.filter(status=Receipt.DRAFT).count()
        pending_deliveries = DeliveryOrder.objects.filter(status=DeliveryOrder.DRAFT).count()
        pending_transfers = InternalTransfer.objects.filter(status=InternalTransfer.DRAFT).count()

        return Response({
            "total_products": total_products,
            "low_stock_items": low_stock_count,
            "pending_receipts": pending_receipts,
            "pending_deliveries": pending_deliveries,
            "pending_transfers": pending_transfers
        })

    @action(detail=False, methods=['get'], url_path='operations-overview')
    def operations_overview(self, request):
        """
        Returns monthly operations data for the last 6 months
        """
        # Get receipts and deliveries by month
        operations_data = []
        
        for i in range(6):
            # Calculate the start and end of each month
            month_start = timezone.now() - timedelta(days=30 * (5-i))
            month_end = timezone.now() - timedelta(days=30 * (4-i))
            
            # Count receipts and deliveries for this month
            receipts_count = Receipt.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end,
                status=Receipt.DONE
            ).count()
            
            deliveries_count = DeliveryOrder.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end,
                status=DeliveryOrder.DONE
            ).count()
            
            # Format month name
            month_name = month_start.strftime("%b %Y")
            
            operations_data.append({
                "period": month_name,
                "receipts": receipts_count,
                "deliveries": deliveries_count
            })
        
        return Response(operations_data)

    @action(detail=False, methods=['get'], url_path='inventory-composition')
    def inventory_composition(self, request):
        """
        Returns inventory composition by product category
        """
        # Get total quantity by category
        composition_data = Stock.objects.values(
            'product__category__name'
        ).annotate(
            total_quantity=Sum('quantity')
        ).filter(
            total_quantity__gt=0
        ).order_by('-total_quantity')
        
        # Format data for pie chart
        formatted_data = []
        for item in composition_data:
            category_name = item['product__category__name'] or 'Uncategorized'
            formatted_data.append({
                "name": category_name,
                "value": item['total_quantity']
            })
        
        return Response(formatted_data)