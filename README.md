# EquipTrack — Equipment Management System

A full-stack web application for managing equipment and maintenance lifecycle.

**Stack:** Next.js 16 (frontend) · Spring Boot 3.4 / Java 21 (backend) · PostgreSQL 16 (database)

---

## Project Structure

```
equipment_appliaction_project/
├── backend/      Spring Boot REST API
├── frontend/     Next.js 16 web application
├── db/
│   └── schema.sql  PostgreSQL schema + triggers + seed data
├── README.md
└── COMPLIANCE.md
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| Java | 21 |
| Maven | 3.9+ |
| PostgreSQL | 14+ |

---

## Database Setup

1. Start PostgreSQL and create the database:
```sql
CREATE DATABASE equipment_db;
```

2. Run the schema (from the project root):
```bash
psql -U postgres -d equipment_db -f db/schema.sql
```

This creates all tables, indexes, triggers, and seeds 8 equipment types.

---

## Backend Setup & Run

1. Update credentials in `backend/src/main/resources/application.properties` if different from defaults:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/equipment_db
spring.datasource.username=postgres
spring.datasource.password=postgres
```

2. Build and run:
```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

---

## Frontend Setup & Run

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env.local` (already included):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Start the dev server:
```bash
npm run dev
```

The app will be at `http://localhost:3000`

---

## REST API Reference

### Equipment
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/equipment` | List all equipment |
| POST | `/api/equipment` | Create equipment |
| PUT | `/api/equipment/{id}` | Update equipment |
| DELETE | `/api/equipment/{id}` | Delete equipment |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/maintenance` | Log a maintenance event |
| GET | `/api/equipment/{id}/maintenance` | Get maintenance history |

### Types
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/equipment-types` | List all equipment types |

---

## Additional Libraries Used

### Frontend
```bash
npm install axios date-fns recharts lucide-react react-hook-form @hookform/resolvers zod
npx shadcn@latest init
npx shadcn@latest add button input label select badge table dialog sheet form textarea skeleton separator card tabs tooltip popover calendar
```

### Backend
All via `pom.xml` (Maven):
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `postgresql` (JDBC driver)
- `lombok`

---

## Key Features

- Equipment CRUD with full validation
- Dynamic equipment types (seeded from DB, no hardcoded values)
- Maintenance logging with automatic status + date sync (via PostgreSQL trigger)
- 30-day Active status constraint (enforced in both service layer and DB trigger)
- Dashboard with KPI cards, status chart, overdue alerts, activity feed
- Equipment health score (Excellent / Good / Fair / Overdue)
- Search, filter by status/type, sortable columns, pagination
- No inline styles · No raw HTML form elements · Fully compliant

---

## Assumptions

- PostgreSQL runs locally on port 5432 with user `postgres` and password `postgres`
- Spring Boot runs on port 8080; Next.js on port 3000
- Equipment types are managed directly in the `equipment_types` table (no UI required per spec)
- The 30-day rule is calculated based on `last_cleaned_date` vs the current server date
