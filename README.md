<img width="2391" height="841" alt="Gemini_Generated_Image_5fl5l75fl5l75fl5" src="https://github.com/user-attachments/assets/0f28fed1-35a3-4063-a17f-2a6febb1d728" />



# QuickTrace

> Inventory & deliveries management — Django backend + Next.js frontend

QuickTrace is a small inventory and delivery tracking application. It uses a Django backend (REST API + admin) in `backend/` and a React.js frontend (TypeScript + React) in `frontend/`.

**Project layout**
- `backend/`: Django project with apps like `inventory` and core settings.
- `frontend/`: React.js app and UI components.

**Tech stack**
- Backend: Python, Django, Django REST Framework, SQLite/Postgres
- Frontend: React.js, TypeScript, Tailwind/CSS

## Getting started


Prerequisites
- Python 3.10+ (or compatible Python 3.x)
- Node.js 16+ and a package manager (`pnpm` recommended, `npm` works)
- (Optional) PostgreSQL or other DB if you configure it in `backend/core/settings.py`

### Backend (Django)

1. Create and activate a Python virtual environment

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies

```powershell
pip install -r requirements.txt
```

3. Environment variables

Create a `.env` or set environment variables used by Django. Example keys you may need in development:

```
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
# or for Postgres: postgres://USER:PASSWORD@HOST:PORT/NAME
```

Place this `.env` in `backend/` or configure your shell to export them. You can use `python-dotenv` or a settings loader if the project includes one.

4. Apply migrations and create a superuser

```powershell
python manage.py migrate
python manage.py createsuperuser
```

5. Run the development server

```powershell
python manage.py runserver
```

6. Run backend tests

```powershell
python manage.py test
```

### Frontend (Next.js)

1. Install dependencies (from repo root or `frontend/`)

```powershell
cd frontend
npm install    
```

2. Environment variables

Create `.env.local` (Next.js) inside `frontend/` with keys like:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

3. Run the dev server

```powershell
npm dev        
```

4. Build for production

```powershell
pnpm build
pnpm start
```

## Development workflow
- Start the backend API with `python manage.py runserver`.
- Start the frontend with `npm dev`.
- Use the Django admin at `http://127.0.0.1:8000/admin` to manage data.
- The frontend by default should call the API (see `NEXT_PUBLIC_API_URL`), update it if your backend runs on a different host/port.

## Useful paths & files
- Backend settings: `backend/core/settings.py`
- Django entrypoint: `backend/manage.py`
- Frontend app pages: `frontend/app/`
- Frontend components: `frontend/components/`

## Testing
- Backend: `python manage.py test` (from `backend/`)
- Frontend: follow available scripts in `frontend/package.json` (if tests configured). If none, consider adding Jest/React Testing Library.

## Deployment notes
- Backend: configure `ALLOWED_HOSTS`, `DEBUG=False`, secure `DJANGO_SECRET_KEY`, and production DB. Collect static files if serving via Django: `python manage.py collectstatic`.
- Frontend: build with `pnpm build` and serve via Vercel, Netlify, or a Node server.

## Contributing
- Please open issues or PRs. Keep changes focused and add tests for new features.

## License
This repository includes a `LICENSE` file at the project root. Refer to it for license details.

## Maintainer / Contact
- Unnat Malik : [Linkedin](www.linkedin.com/in/unnat-malik), [Github](https://github.com/UnnatMalik)

- Tanmay Shinde : [Linkedin](https://www.linkedin.com/in/tanmay-shinde-8a13b6170/), [Github](https://github.com/AlphaNOVA23)

- Tanushree Tiwari : [Linkedin](https://www.linkedin.com/in/tanushree-t-225697287/), [Github](https://github.com/T-shrex)

- Sahil Singh : [Linkedin](https://www.linkedin.com/in/sahilsingh123/), [Github](https://github.com/Sahilrs2)
---

