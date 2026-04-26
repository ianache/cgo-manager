# Implementation Plan: FEAT03 - Gestión de Usuarios (Iteration 2) - REVISED (v4)

**Objective:** Implement management for Products, Modules, Features, and Actions with comprehensive multi-language support and RBAC. This includes migrating to PostgreSQL, using JSONB for translated fields, table prefix `tb_`, and role restrictions for Features and Actions.

---

## 1. Database & Schema Migration

### Technical Transition
- **DB Provider:** Switch from MySQL to **PostgreSQL**.
- **Prisma Configuration:** 
    - Update `datasource db` in `schema.prisma`.
    - Update `DATABASE_URL` in `.env`.
- **Naming Convention:** 
    - **Prefix:** All table names must start with `tb_` (e.g., `tb_products`).
    - **Pluralization:** Use plural names for tables.
    - **Identifiers:** `snake_case` for all identifiers.
    - **Primary Keys:** Must be `UUID`.

### New Models (All names and descriptions use JSONB)
- `tb_languages`: id (uuid), iso_code (string, unique), name (string), is_active (boolean, default true).
- `tb_products`: id (uuid), name (**jsonb**), description (**jsonb**, optional), icon (string, optional), is_active (boolean, default true).
- `tb_modules`: id (uuid), name (**jsonb**), description (**jsonb**, optional), icon (string, optional), is_active (boolean, default true), product_id (uuid, FK).
- `tb_features`: id (uuid), name (**jsonb**), description (**jsonb**, optional), icon (string, optional), is_active (boolean, default true), module_id (uuid, FK), **allowed_roles** (text array).
- `tb_actions`: id (uuid), name (**jsonb**), description (**jsonb**, optional), icon (string, optional), is_active (boolean, default true), feature_id (uuid, FK), **allowed_roles** (text array).

---

## 2. Backend Integration (BFF)

### CRUD & Translation Logic
- Implement NestJS controllers and services for all entities.
- **Language Management:** Endpoints for `tb_languages` (seeded with 'en' and 'es').
- **JSONB Handling:** Manage structured translation objects in `name` and `description`.
- **Role Sync:** Sync `allowed_roles` with Keycloak role names.

### Security (RBAC)
- Implement `RolesGuard` in the BFF.
- **Admin Only:** Only users with the **'Admin'** role can access management endpoints.

---

## 3. Frontend Data Access (`shared-data-access`)

- **Interfaces:**
    - Use `Record<string, string>` for localized fields.
    - Entities include `allowed_roles: string[]` where applicable.
- **API Methods:** Full CRUD for Products, Modules, Features, Actions, and Languages.

---

## 4. UI Implementation (`apps/micro-ui/security`)

### Multi-language Editor (Popup Modal)
- Create a **Reusable Translation Table Modal**:
    - Reusable for `name` and `description`.
    - First column: Language name.
    - Second column: Inline editable value.

### Role Selector Component
- Reusable checkbox list/combobox to select Keycloak roles for **Features** and **Actions**.

### Management Pages
- Based on the "User Directory" layout.
- Integration of the Translation Editor popup and Role Selector.
- **Toasts:** Real-time feedback via `ToastService`.

---

## 5. Verification Strategy

- **Schema Check:** Prefix `tb_`, `snake_case`, and `allowed_roles` array in PostgreSQL.
- **Relational Integrity:** Cascading or restricted deletes for the hierarchy.
- **Workflow Test:** 
    1. Define 'en' and 'es' in languages.
    2. Create a Feature: set translations for name/description and assign 'Manager' role.
    3. Verify data persists correctly in PostgreSQL.
- **Build Validation:** `nx build bff` and `nx build security`.
