# Implementation Plan: FEAT03 - Gestión de Usuarios (Iteration 5) - Manage Feature Actions

**Objective:** Implement granular role management for Actions within the "Actions Management" drawer. Ensure that roles assigned to an action are a subset of the roles assigned to its parent feature.

---

## 1. UI: Enhanced Action Management

### Component: Features Management (`apps/micro-ui/security/.../features`)
- **Action Drawer Expansion:** The "Actions Management" drawer table will be updated from 2 to 3 columns:
    1. **Action Name:** Localized name.
    2. **Status:** Enabled/Disabled toggle.
    3. **Allowed Roles:** A new interactive column for assigning Keycloak roles.

### Logic: Role Subset Restriction
- The list of roles available to select for an **Action** must be dynamically filtered.
- Only roles present in the `feature.allowed_roles` array of the parent feature will be displayed in the action's role selector.

### Component: Inline Role Selector
- Use a compact version of the `RoleSelectorComponent` or a custom combobox with checkboxes within the table cell.
- **Requirement:** If an action has an empty roles list, show the message: *"No roles assigned."*

---

## 2. Backend Integration (BFF)

### API Persistence
- Continue using `PUT /security-mgmt/actions/:id` to save changes to `is_active` and `allowed_roles`.
- Ensure the BFF continues to handle JSON-to-Text conversion for MySQL 5.6 compatibility.

---

## 3. Interaction & Feedback

- **Real-time Saving:** Changes to roles in the action table should trigger an immediate save to provide a "live-editing" experience.
- **Toasts:** Use `ToastService` to notify success ("Permisos actualizados") or failure.
- **Empty States:** Handle cases where the parent feature itself has no roles (thus, sub-actions cannot have roles either).

---

## 4. Verification Strategy

- **RBAC Consistency:** 
    1. Assign 'Admin' and 'Manager' roles to a Feature.
    2. Open Actions Manager for that feature.
    3. Verify that the Action role selector ONLY shows 'Admin' and 'Manager'.
    4. Remove 'Manager' from the Feature and verify it is no longer available/selected in the sub-actions.
- **Build Validation:** `nx build bff` and `nx build security`.
