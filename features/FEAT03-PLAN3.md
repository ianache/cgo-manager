# Implementation Plan: FEAT03 - Gestión de Usuarios (Iteration 3)

**Objective:** Implement local user persistence, enriched header with user profile dropdown, and dedicated modals for Profile, Settings (RBAC), and Logout.

---

## 1. Database & Persistence (BFF)

### Prisma Schema Update
- Add `User` model mapped to `tb_users`:
    - `id`: UUID (Primary Key, matches Keycloak user ID).
    - `email`: String (Mandatory).
    - `is_active`: Boolean (Default: true, mapped to `is_active`).
    - `avatar`: LongText (To store 50x50 Base64 image).

### Auto-Registration on Login
- Modify `AuthController.callback` in the BFF:
    - Extract Keycloak user ID and email from the token.
    - Check if the user exists in `tb_users`.
    - If missing, perform an automatic registration (upsert logic).

---

## 2. Header & Navigation (Shared UI Kit)

### Topbar Enhancement (`topbar.component.ts/html`)
- **User Identity:** Display current user's name and avatar in the top-right corner.
- **Action Dropdown:**
    - **Profile**: Triggers `ProfileModal`.
    - **Settings**: Triggers `SettingsModal`.
    - **Logout**: Triggers `LogoutModal`.

---

## 3. Profile & Settings Modals

### Profile Modal (`ProfileModalComponent`)
- Display ID, Name, and Email (read-only).
- **Avatar Management:**
    - Upload functionality for local images.
    - Validation: Dimensions 50x50 pixels, format JPEG/PNG.
    - Base64 conversion before saving via BFF.

### Settings Modal (`SettingsModalComponent`)
- **Password Management:** Form to update user password in Keycloak.
- **RBAC Visualization:**
    - **Left Section:** List of assigned Keycloak Roles (Read-only).
    - **Right Section:** Detailed list of Features/Actions allowed for the user.
    - **Grouping:** Sort by Module -> Feature.
    - **Localization:** Display descriptions in the user's current locale.
    - **Badges:** Display Actions as small labels for each feature.

### Logout Modal (`LogoutModalComponent`)
- Simple confirmation popup to end the session.

---

## 4. API & Data Access

### BFF Endpoints
- `GET /api/users/me`: Enriched profile info.
- `PATCH /api/users/me/avatar`: Update avatar only.
- `GET /api/users/me/permissions`: Retrieve the hierarchical list of Modules/Features based on roles.
- `POST /api/users/me/password`: Change password logic.

### Frontend Service
- Update `ApiService` to include profile, avatar, and permission fetching.

---

## 5. Verification Strategy

- **Registration Test:** Log in with a new Keycloak user and verify a record appears in `tb_users`.
- **Avatar Test:** Upload an image and verify it is correctly stored as Base64 and displayed in the header.
- **Permission Check:** Verify the Settings modal correctly hides features the user's roles don't have.
- **Build Validation:** `nx build shell`, `nx build bff`, and `nx build security`.
