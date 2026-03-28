# HomeTutor

Production-style full-stack tutoring marketplace:

- ackend: Express + MongoDB + JWT auth + RBAC + booking/message/notification/admin APIs
- rontend: React + Vite + Tailwind + role-based SaaS dashboards

## Quick Start

### Backend
1. cd backend
2. 
pm install
3. copy .env.example to .env and update values
4. 
pm run seed
5. 
pm run dev

### Frontend
1. cd frontend
2. 
pm install
3. create .env with VITE_API_URL=http://localhost:5000/api
4. 
pm run dev

## Test Accounts
- Student: student@hometutor.com / Student@123
- Tutor: 	utor@hometutor.com / Tutor@123
- Admin: from .env (ADMIN_EMAIL / ADMIN_PASSWORD)
