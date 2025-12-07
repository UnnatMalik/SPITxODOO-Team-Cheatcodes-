<img width="2391" height="841" alt="Gemini_Generated_Image_5fl5l75fl5l75fl5" src="https://github.com/user-attachments/assets/0f28fed1-35a3-4063-a17f-2a6febb1d728" />



# QuickTrace

> Modern Inventory & Warehouse Management System — Django REST API + Next.js Dashboard

QuickTrace is a comprehensive inventory and warehouse management application with real-time tracking, operations management, and analytics. It features a powerful Django backend with REST API and a modern Next.js frontend with interactive dashboards and charts.

**Project Structure**
- `backend/`: Django REST API with inventory management, receipts, deliveries, transfers, and stock tracking
- `frontend/`: Next.js 14 application with TypeScript, Tailwind CSS, and Recharts for data visualization

**Tech Stack**
- **Backend**: Python 3.10+, Django 5.2, Django REST Framework, PostgreSQL, Token Authentication
- **Frontend**: Next.js 14, TypeScript, React, Tailwind CSS, Recharts, shadcn/ui components
- **Features**: Real-time inventory tracking, operations overview, stock adjustments, transfer management, analytics dashboard

## Quick Start (Recommended)

### One-Command Startup

Simply run the batch file from the project root:

```bash
start.bat
```

This will automatically start both backend and frontend servers in separate windows.

- **Backend**: http://127.0.0.1:8000
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://127.0.0.1:8000/admin

## Manual Setup

### Prerequisites
- Python 3.10+ 
- Node.js 18+ 
- pnpm (recommended) - Install with: `npm install -g pnpm`
- PostgreSQL (configured in settings.py)

### Backend Setup (Django)

1. **Navigate to backend and create virtual environment**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. **Install dependencies**

```powershell
pip install -r requirements.txt
```

3. **Configure Database**

Update `backend/core/settings.py` with your PostgreSQL credentials:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'quicktrace_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

4. **Run migrations and create superuser**

```powershell
python manage.py migrate
python manage.py createsuperuser
```

5. **Populate sample data (Optional)**

```powershell
python populate_data.py
```

This creates sample warehouses, products, receipts, deliveries, and historical data for charts.

6. **Start the development server**

```powershell
python manage.py runserver
```

Backend API will be available at: `http://127.0.0.1:8000/api/`

### Frontend Setup (Next.js)

1. **Navigate to frontend and install dependencies**

```powershell
cd frontend
pnpm install
```

2. **Configure API endpoint**

Create `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

3. **Run the development server**

```powershell
pnpm dev
```

Frontend will be available at: `http://localhost:3000`

4. **Build for production**

```powershell
pnpm build
pnpm start
```## Features

### Dashboard
- **Real-time KPIs**: Total products, low stock alerts, pending operations
- **Operations Overview**: 6-month trend chart showing receipts vs deliveries
- **Inventory Composition**: Pie chart breakdown by product category
- **Live data connection**: All charts pull from actual database

### Inventory Management
- **Products**: Complete product catalog with categories and SKUs
- **Stock Tracking**: Multi-warehouse, multi-location stock management
- **Stock Adjustments**: Manual stock corrections with audit trail
- **Low Stock Alerts**: Automatic tracking of items below threshold

### Operations
- **Receipts**: Inbound goods receiving with supplier tracking
- **Deliveries**: Outbound shipments with customer management
- **Internal Transfers**: Stock movement between warehouses/locations
- **Status Tracking**: Draft, Pending, Done statuses for all operations

### User Interface
- **Modern Design**: Clean, responsive interface with dark mode support
- **Sidebar Navigation**: Organized menu with Main, Operations, Inventory, System sections
- **User Profile**: Profile dropdown with logout functionality
- **Interactive Charts**: Recharts integration for data visualization

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login (returns token)

### Dashboard
- `GET /api/dashboard/` - Dashboard statistics
- `GET /api/dashboard/operations-overview/` - 6-month operations data
- `GET /api/dashboard/inventory-composition/` - Inventory by category

### Resources
- `GET /api/products/` - List all products
- `GET /api/stock/` - Stock levels by location
- `GET /api/receipts/` - Receipt operations
- `GET /api/deliveries/` - Delivery operations
- `GET /api/transfers/` - Transfer operations
- `GET /api/adjustments/` - Stock adjustments
- `GET /api/ledger/` - Stock movement history

All endpoints require Token authentication (except auth endpoints).

## Development Workflow

### Using start.bat (Recommended)
```bash
# From project root
start.bat
```

### Manual Start
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

### Access Points
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000/api/
- **Django Admin**: http://127.0.0.1:8000/admin
- **API Documentation**: Available at admin panel

## Project Structure

```
QuickTrace/
├── backend/
│   ├── core/                 # Django project settings
│   │   ├── settings.py       # Configuration
│   │   └── urls.py          # URL routing
│   ├── inventory/           # Main app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # DRF serializers
│   │   └── urls.py          # App URLs
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── products/        # Products page
│   │   ├── receipts/        # Receipts page
│   │   └── ...
│   ├── components/          # React components
│   │   ├── layout/
│   │   │   └── sidebar.tsx  # Navigation sidebar
│   │   └── ui/             # shadcn/ui components
│   ├── package.json
│   └── tsconfig.json
├── populate_data.py         # Sample data generator
├── start.bat               # Startup script
└── README.md

```

## Testing

### Backend Tests
```powershell
cd backend
python manage.py test
```

### Frontend Tests
```powershell
cd frontend
pnpm test  # If configured
```

## Database Schema

### Core Models
- **Warehouse**: Physical storage locations
- **ProductCategory**: Product classification
- **Product**: Product master data with SKU, pricing
- **Stock**: Current inventory levels by location
- **StockLedger**: Complete audit trail of stock movements

### Operations Models
- **Receipt / ReceiptItem**: Inbound goods receiving
- **DeliveryOrder / DeliveryItem**: Outbound shipments
- **InternalTransfer / TransferItem**: Inter-warehouse transfers
- **StockAdjustment**: Manual stock corrections

## Troubleshooting

### Backend Issues
- **Database connection error**: Check PostgreSQL is running and credentials in settings.py
- **Migration errors**: Run `python manage.py migrate --run-syncdb`
- **Import errors**: Ensure virtual environment is activated

### Frontend Issues
- **Module not found**: Run `pnpm install` in frontend directory
- **API connection failed**: Verify backend is running on port 8000
- **Charts not showing data**: Check browser console for API errors, ensure endpoints return data

### Common Solutions
```powershell
# Reset database
cd backend
python manage.py flush
python manage.py migrate
python populate_data.py

# Clear frontend cache
cd frontend
pnpm clean  # or remove .next folder
pnpm dev
```

## Deployment

### Backend Deployment
1. **Configure production settings**:
   - Set `DEBUG = False` in settings.py
   - Update `ALLOWED_HOSTS` with your domain
   - Secure `SECRET_KEY` (use environment variable)
   - Configure production database

2. **Collect static files**:
```powershell
python manage.py collectstatic
```

3. **Deploy options**:
   - AWS EC2 / Azure VM with Gunicorn + Nginx
   - Heroku with PostgreSQL addon
   - Railway / Render for quick deployment

### Frontend Deployment
1. **Build production bundle**:
```powershell
pnpm build
```

2. **Deploy options**:
   - **Vercel** (recommended for Next.js): `vercel deploy`
   - **Netlify**: Connect GitHub repo
   - **Docker**: Use included Dockerfile if available
   - **Node server**: `pnpm start` after build

3. **Environment variables**:
   - Set `NEXT_PUBLIC_API_URL` to production backend URL
   - Configure other environment-specific variables

## Technologies Used

### Backend
- Django 5.2 - Web framework
- Django REST Framework - API development
- PostgreSQL - Database
- Token Authentication - Security

### Frontend
- Next.js 14 - React framework with app router
- TypeScript - Type safety
- Tailwind CSS - Styling
- Recharts - Data visualization
- shadcn/ui - Component library
- Lucide React - Icons


## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style conventions
- All tests pass
- New features include tests
- Documentation is updated

## License

This project is licensed under the terms specified in the LICENSE file at the project root.

## Team & Contact

**Maintainers:**

- **Unnat Malik** - [LinkedIn](https://www.linkedin.com/in/unnat-malik) | [GitHub](https://github.com/UnnatMalik)

- **Tanmay Shinde** - [LinkedIn](https://www.linkedin.com/in/tanmay-shinde-8a13b6170/) | [GitHub](https://github.com/AlphaNOVA23)

- **Tanushree Tiwari** - [LinkedIn](https://www.linkedin.com/in/tanushree-t-225697287/) | [GitHub](https://github.com/T-shrex)

- **Sahil Singh** - [LinkedIn](https://www.linkedin.com/in/sahilsingh123/) | [GitHub](https://github.com/Sahilrs2)

---

**Built with ❤️ by Team Cheatcodes**

