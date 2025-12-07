from django.db import models
from django.contrib.auth.models import User
from django.db import transaction
from django.core.exceptions import ValidationError

# 1. Common Base Model
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

# 2. Warehouse & Product Models
class Warehouse(BaseModel):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name

class ProductCategory(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Product(BaseModel):
    name = models.CharField(max_length=150)
    sku = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True)
    unit = models.CharField(max_length=50)
    
    # --- NEW FIELD ADDED HERE ---
    low_stock_threshold = models.IntegerField(default=10) 
    # ----------------------------

    def __str__(self):
        return f"{self.name} ({self.sku})"

# 3. Stock Tracking Model
class Stock(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    quantity = models.FloatField(default=0)

    class Meta:
        unique_together = ('product', 'warehouse')

    def __str__(self):
        return f"{self.product.name} - {self.warehouse.name}: {self.quantity}"

# 4. Receipts (Incoming Stock)
class Receipt(BaseModel):
    DRAFT = 'draft'
    WAITING = 'waiting'
    DONE = 'done'
    CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (WAITING, 'Waiting'),
        (DONE, 'Done'),
        (CANCELLED, 'Cancelled'),
    ]

    supplier = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def validate_receipt(self):
        if self.status != self.DRAFT:
            raise ValidationError("Only draft receipts can be validated.")

        with transaction.atomic():
            for item in self.items.all():
                stock, created = Stock.objects.get_or_create(
                    product=item.product, 
                    warehouse=self.warehouse
                )
                stock.quantity += item.quantity
                stock.save()

                StockLedger.objects.create(
                    product=item.product,
                    warehouse=self.warehouse,
                    change=item.quantity,
                    balance=stock.quantity,
                    source_type='Receipt',
                    source_id=self.id
                )

            self.status = self.DONE
            self.save()

    def __str__(self):
        return f"Receipt #{self.id} - {self.supplier}"

class ReceiptItem(BaseModel):
    receipt = models.ForeignKey(Receipt, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.FloatField()

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

# 5. Delivery Orders (Outgoing Stock)
class DeliveryOrder(BaseModel):
    DRAFT = 'draft'
    READY = 'ready'
    DONE = 'done'
    CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (READY, 'Ready'),
        (DONE, 'Done'),
        (CANCELLED, 'Cancelled'),
    ]

    customer = models.CharField(max_length=150)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def validate_delivery(self):
        if self.status != self.DRAFT:
            raise ValidationError("Only draft deliveries can be validated.")

        with transaction.atomic():
            for item in self.items.all():
                stock = Stock.objects.filter(product=item.product, warehouse=self.warehouse).first()
                if not stock or stock.quantity < item.quantity:
                    raise ValidationError(f"Insufficient stock for {item.product.name}")

            self.status = self.DONE
            self.save()

            for item in self.items.all():
                stock = Stock.objects.get(product=item.product, warehouse=self.warehouse)
                stock.quantity -= item.quantity
                stock.save()

                StockLedger.objects.create(
                    product=item.product,
                    warehouse=self.warehouse,
                    change=-item.quantity,
                    balance=stock.quantity,
                    source_type='Delivery',
                    source_id=self.id
                )

    def __str__(self):
        return f"Delivery #{self.id} - {self.customer}"

class DeliveryItem(BaseModel):
    delivery = models.ForeignKey(DeliveryOrder, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.FloatField()

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

# 6. Internal Transfers
class InternalTransfer(BaseModel):
    DRAFT = 'draft'
    WAITING = 'waiting'
    DONE = 'done'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (WAITING, 'Waiting'),
        (DONE, 'Done'),
    ]

    from_warehouse = models.ForeignKey(Warehouse, related_name="source_transfers", on_delete=models.CASCADE)
    to_warehouse = models.ForeignKey(Warehouse, related_name="destination_transfers", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Transfer #{self.id}"

class TransferItem(BaseModel):
    transfer = models.ForeignKey(InternalTransfer, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.FloatField()

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

# 7. Adjustments (Fix mismatches)
class StockAdjustment(BaseModel):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    counted_quantity = models.FloatField()
    reason = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Adjustment #{self.id}"

# 8. Ledger (Every Movement Logged)
class StockLedger(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)

    change = models.FloatField() 
    balance = models.FloatField() 

    source_type = models.CharField(max_length=50)
    source_id = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} ({self.change})"