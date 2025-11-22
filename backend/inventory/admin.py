from django.contrib import admin
from .models import (
    Warehouse, ProductCategory, Product, Stock,
    Receipt, ReceiptItem, DeliveryOrder, DeliveryItem,
    InternalTransfer, TransferItem, StockAdjustment, StockLedger
)

# Basic Registrations
admin.site.register(ProductCategory)
admin.site.register(ReceiptItem)
admin.site.register(DeliveryItem)
admin.site.register(TransferItem)

# --- INLINES (This lets you see connected data inside a parent form) ---

class StockInline(admin.TabularInline):
    model = Stock
    extra = 0 # Don't show empty rows by default
    readonly_fields = ('quantity',) # Best practice: Quantity should change via Operations, not here
    can_delete = False

class ReceiptItemInline(admin.TabularInline):
    model = ReceiptItem
    extra = 1

class DeliveryItemInline(admin.TabularInline):
    model = DeliveryItem
    extra = 1

# --- CUSTOMIZED ADMIN VIEWS ---

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')
    # This is the magic line: It shows the Stock table INSIDE the Warehouse page
    inlines = [StockInline] 

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'unit')
    search_fields = ('name', 'sku')
    # Optional: See which warehouses have this product inside the Product page
    inlines = [StockInline]

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'quantity')
    list_filter = ('warehouse', 'product')

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'warehouse', 'status', 'created_at')
    list_filter = ('status', 'warehouse')
    inlines = [ReceiptItemInline] # Add items directly inside the Receipt Header

@admin.register(DeliveryOrder)
class DeliveryOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'warehouse', 'status', 'created_at')
    list_filter = ('status', 'warehouse')
    inlines = [DeliveryItemInline] # Add items directly inside the Delivery Header

@admin.register(InternalTransfer)
class InternalTransferAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_warehouse', 'to_warehouse', 'status')

@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'counted_quantity')

@admin.register(StockLedger)
class StockLedgerAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'product', 'warehouse', 'change', 'balance', 'source_type')
    ordering = ('-created_at',)