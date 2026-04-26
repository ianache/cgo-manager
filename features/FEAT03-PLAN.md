# Implementation Plan: FEAT03 - Gestión de Usuarios (Iteration 1)

**Objective:** Enable secure user management by integrating the BFF with Keycloak Admin API for retrieving, editing, and saving user information and roles.

---

## 1. Backend Integration (BFF)

### Keycloak Service Enhancement (`apps/bff/src/app/keycloak.service.ts`)
- **Admin Token Management:** Implement a mechanism to obtain and cache an Access Token for the Keycloak Admin API (Client Credentials Flow).
- **User Management Methods:**
    - `getUsers()`: Fetch users from the `Apps` realm.
    - `getUserById(id)`: Fetch specific user details.
    - `updateUser(id, data)`: Update user attributes (first name, last name, enabled status).
- **Role Management Methods:**
    - `getAvailableRoles()`: Retrieve all roles from the Realm and the specific Client ID.
    - `getUserRoles(userId)`: Get current role mappings for a user.
    - `updateUserRoles(userId, roleNames)`: Synchronize user roles (mapping and unmapping).

### API Endpoints (`apps/bff/src/app/app.controller.ts`)
- `GET /users`: List users with basic info.
- `GET /users/:id`: Get detailed user info including roles.
- `GET /roles`: List all assignable roles (Realm + Client).
- `PUT /users/:id`: Update user information and role assignments in Keycloak.

---

## 2. Frontend Data Access (`libs/shared/data-access/src/lib/api.ts`)

- **Interfaces:**
    - `KeycloakUser`: { id, username, email, firstName, lastName, enabled, lastLogin }
    - `KeycloakRole`: { id, name, containerId, clientRole }
- **ApiService Methods:**
    - `getUsers()`
    - `getUserById(id)`
    - `updateUser(id, data)`
    - `getAvailableRoles()`

---

## 3. UI Implementation (`apps/micro-ui/security`)

### User Directory (`user-directory.component.ts`)
- Replace mock `allUsers` array with an observable stream from `api.getUsers()`.
- Map Keycloak attributes to the table columns (Name, Email, Roles, Last Login, Status).

### User Edit & Role Assignment (`user-edit.component.ts`)
- **Role Selector:** Implement a multi-select component (combobox with checkboxes) to display available roles fetched from the BFF.
- **Form Integration:**
    - Load user data and existing roles on initialization.
    - Handle the "enabled" status as a toggle.
- **Save Logic:** Call `api.updateUser()` sending both the profile data and the array of selected roles.

---

## 4. Verification Strategy

- **Integration Test:** Verify that changing a user's role in the Backoffice UI reflects immediately in the Keycloak Admin Console.
- **Security Check:** Ensure the Admin Token is never exposed to the frontend; only the user-specific data should be transmitted.
- **Build Validation:** Run `nx build bff` and `nx build security` to ensure type safety and compilation.
