# 🧪 PharmaTrack: Professional Equipment Lifecycle Manager

PharmaTrack is a premium, enterprise-grade Equipment Management System (EMS) designed for pharmaceutical manufacturing and laboratory environments. It provides full-lifecycle tracking of critical assets, from procurement to decommissioning, with a heavy focus on **GMP (Good Manufacturing Practice) Compliance**.

---

## 🏗️ Architecture & Technology Stack

The project follows a modern, decoupled architecture ensuring high performance, scalability, and strict type safety across the entire stack.

### 🌐 Frontend (Next.js Application)
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4.0 (Modern utility-first CSS)
- **UI Components**: shadcn/ui (Radix UI Primitives)
- **Visualizations**: Recharts (Dynamic SVG charting)
- **Icons**: Lucide React (Premium stroke icons)
- **Date Handling**: date-fns (Robust ISO-8601 formatting)
- **Form Management**: React Hook Form + Zod (Schema-based validation)
- **State Management**: React Hooks (useCallback, useMemo, useEffect)

### ⚙️ Backend (Spring Boot REST API)
- **Framework**: [Spring Boot 3.4.x](https://spring.io/projects/spring-boot)
- **Language**: Java 17
- **Database Access**: Spring Data JPA (Hibernate)
- **Security**: CORS-enabled for secure cross-origin resource sharing
- **Validation**: Jakarta Bean Validation
- **Efficiency**: Project Lombok for clean, boilerplate-free code
- **Persistence**: PostgreSQL 16+

---

## 🚀 Getting Started

### 1. Database Provisioning
PharmaTrack uses PostgreSQL for relational data and low-level business logic (triggers).

```sql
-- Create the database
CREATE DATABASE pharma_track_db;

-- Initialize schema and seed data (Equipment Types & Initial Assets)
-- Run the following command from the project root:
-- psql -U your_user -d pharma_track_db -f db/schema.sql
```

### 2. Backend Initialization
1. Navigate to `/backend`.
2. Configure your credentials in `src/main/resources/application.properties`.
3. Build and package the application:
   ```bash
   ./mvnw clean package
   ```
4. Execute the JAR:
   ```bash
   java -jar target/equipment-management-0.0.1-SNAPSHOT.jar
   ```
   *The API server starts at `http://localhost:8080`.*

### 3. Frontend Initialization
1. Navigate to `/frontend`.
2. Install the enterprise dependency tree:
   ```bash
   npm install
   ```
3. Configure the environment:
   `NEXT_PUBLIC_API_URL=http://localhost:8080`
4. Launch the development experience:
   ```bash
   npm run dev
   ```
   *Access the dashboard at `http://localhost:3000`.*

---

## 💎 Advanced Features & UX

### 📊 Intelligent Data Visualization
- **Health Score Algorithm**: Assets are dynamically graded (Excellent, Good, Fair, Overdue) based on their maintenance history and compliance deadlines.
- **Dynamic Pie Chart**: Real-time breakdown of factory health. Even 0% states remain visible in the legend for full audit transparency.
- **KPI Metrics**: Instant count of Live Assets, Active Units, and Critical Overdue items.

### � Search & Directory Engine
- **Global Logs Directory**: A dedicated audit-ready table for all maintenance history across the entire site.
- **Multi-Factor Filtering**: Filter logs by Equipment Category, Start Date, or End Date.
- **Dynamic Sorting**: Logs are automatically sorted chronologically (Newest First) to ensure the most recent interventions are always visible.

### 🛠️ Maintenance Lifecycle
- **Unified Hero Card**: A premium high-density display of asset metadata, including Asset IDs, Type Tags, and Service Recency.
- **Compliance Guardrails**: The system prevents marking equipment as "Active" if it has missed its 30-day sanitation window.
- **Audit-Ready Logs**: Every maintenance action is captured with performer details, timestamps, and technician notes.

---

## 📦 Full Dependency List

### Frontend (npm)
| Package | Purpose |
| :--- | :--- |
| `next` | Core Framework |
| `react/react-dom` | UI Library |
| `recharts` | Data Visualization |
| `date-fns` | Compliance-accurate date logic |
| `zod` | Runtime type validation |
| `lucide-react` | Professional Iconography |
| `axios` | Backend communication |
| `tailwindcss` | Design System |

### Backend (Maven)
| Artifact | Purpose |
| :--- | :--- |
| `spring-boot-starter-web` | API REST Layer |
| `spring-boot-starter-data-jpa` | Database ORM |
| `spring-boot-starter-validation` | Input Sanitization |
| `postgresql` | Database Driver |
| `lombok` | Code Cleanliness |

---

## 🔒 Governance & Support
This documentation is maintained as part of the system's technical governance. For operational support or regulatory inquiries, refer to the `COMPLIANCE.md` file located in the root repository.
