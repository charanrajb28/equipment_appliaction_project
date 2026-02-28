# COMPLIANCE.md — EquipTrack Equipment Management System

This document attests compliance with all stated technical requirements.

---

## ✅ No Inline Styles Used

All styling is done exclusively through **Tailwind CSS utility classes** and **shadcn/ui component variants**.

- No `style={{}}` props appear anywhere in the codebase.
- Colors, spacing, typography, and layout are all controlled via Tailwind class names.

**Verified in:** All `.tsx` files under `frontend/src/`

---

## ✅ No Raw HTML Form Elements Used

The following raw HTML form elements are **not used** in any component:
- `<input>` → replaced by shadcn `<Input />`
- `<select>` → replaced by shadcn `<Select />`, `<SelectTrigger />`, `<SelectContent />`, `<SelectItem />`
- `<button>` → replaced by shadcn `<Button />`
- `<textarea>` → replaced by shadcn `<Textarea />`

**Verified in:** `EquipmentForm.tsx`, `AddMaintenanceForm.tsx`, `EquipmentTable.tsx`, and all other form components.

---

## ✅ Add and Edit Reuse the Same Form Component

A single component — `src/components/equipment/EquipmentForm.tsx` — handles both:
- **Add mode**: rendered when `initialData` prop is `undefined`
- **Edit mode**: rendered when `initialData` prop is a populated `Equipment` object

The form pre-populates fields from `initialData` when editing, and submits to `POST /api/equipment` (create) or `PUT /api/equipment/{id}` (update) accordingly.

---

## ✅ Equipment Types Are Not Hardcoded in the Database Schema

Equipment types are stored in a dedicated `equipment_types` table with no default values in application code.

- Type options in the UI are fetched dynamically from `GET /api/equipment-types`
- New types can be added via a direct `INSERT INTO equipment_types (name) VALUES (...)` without any code change
- The schema seeds 8 initial types as a convenience, but they are fully modifiable

---

## ✅ Business Rules Are Enforced in the Backend

### Rule 1 — Maintenance sync (status + last cleaned date)
When a maintenance log is added:
- **Service layer** (`MaintenanceService.java`): saves the log
- **PostgreSQL trigger** (`trg_maintenance_sync`): automatically sets `equipment.status = 'Active'` and `equipment.last_cleaned_date = maintenance_date` in the same transaction

### Rule 2 — 30-day Active constraint
Equipment cannot be set to `Active` if `last_cleaned_date` is older than 30 days:
- **Service layer** (`EquipmentService.java` → `validateRequest()`): throws `BusinessRuleException` with a clear message → HTTP 400
- **PostgreSQL trigger** (`trg_status_constraint`): BEFORE INSERT OR UPDATE safety net that raises an exception at DB level even on direct SQL access
- **Frontend**: displays the backend error message inline in the form (no client-side suppression)

---

## Summary Table

| Requirement | Status |
|---|---|
| No `style={{}}` inline styles | ✅ Compliant |
| No raw `<input>`, `<select>`, `<button>` | ✅ Compliant |
| Add and Edit use the same `EquipmentForm` component | ✅ Compliant |
| Equipment types are not hardcoded (dynamic from DB) | ✅ Compliant |
| Business rules enforced in backend (service + DB trigger) | ✅ Compliant |
