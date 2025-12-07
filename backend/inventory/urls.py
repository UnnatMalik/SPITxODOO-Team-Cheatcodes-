from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet, ProductCategoryViewSet, ProductViewSet, StockViewSet,
    ReceiptViewSet, ReceiptItemViewSet,
    DeliveryOrderViewSet, DeliveryItemViewSet,
    InternalTransferViewSet, TransferItemViewSet,
    StockAdjustmentViewSet, StockLedgerViewSet, DashboardStatsViewSet
)
from .auth_views import signup, login

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet)
router.register(r'categories', ProductCategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'stock', StockViewSet)

# Operations
router.register(r'receipts', ReceiptViewSet)
router.register(r'receipt-items', ReceiptItemViewSet)
router.register(r'deliveries', DeliveryOrderViewSet)
router.register(r'delivery-items', DeliveryItemViewSet)
router.register(r'transfers', InternalTransferViewSet)
router.register(r'transfer-items', TransferItemViewSet)
router.register(r'adjustments', StockAdjustmentViewSet)
router.register(r'ledger', StockLedgerViewSet)
router.register(r'dashboard', DashboardStatsViewSet, basename='dashboard')


urlpatterns = [
    path('', include(router.urls)),
    path('auth/signup/', signup),
    path('auth/login/', login),
]