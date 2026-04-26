# Implementation Plan: FEAT03 - Gestión de Usuarios (Iteration 4) - Manage Modules

**Objective:** Enhance the management of Modules, Features, and Actions. Implement hierarchical navigation, full editing capabilities, and a granular action status manager.

---

## 1. Backend Extensions (BFF)

### Security Management Service (`apps/bff/src/app/security-mgmt.service.ts`)
- Implement update methods for all entities (missing in Iteration 2):
    - `updateModule(id, data)`
    - `updateFeature(id, data)`
    - `updateAction(id, data)`
- Ensure JSON serialization/deserialization for MySQL 5.6 compatibility in all update methods.

### Security Management Controller (`apps/bff/src/app/security-mgmt.controller.ts`)
- Add `PUT` endpoints:
    - `PUT /security-mgmt/modules/:id`
    - `PUT /security-mgmt/features/:id`
    - `PUT /security-mgmt/actions/:id`

---

## 2. UI: Module Management Evolution

### Components & Actions (`apps/micro-ui/security/.../modules`)
- **Edit Functionality:** 
    - Update `ModulesComponent` to handle `isEdit` state.
    - Pre-fill the form drawer when clicking the Edit button.
- **Hierarchical Navigation:**
    - Update the "Features" icon action in the table.
    - Navigate to the Features page passing `module_id` as a query parameter.

---

## 3. UI: Feature Management & Action Status

### Filtering (`apps/micro-ui/security/.../features`)
- Update `FeaturesComponent` to subscribe to route query parameters.
- Automatically filter the list when a `module_id` is provided.

### Actions Manager (Drawer)
- Implement a new UI flow for the "Actions" icon in the Features table.
- **Visual Pattern:** Use the same sliding drawer (form-drawer) used for editing modules.
- **Content:**
    - **Header:** Title "Actions Management" | Subtitle: Current Feature Name.
    - **Table:** 2-column table:
        1. **Action Name:** Localized value.
        2. **Status:** Visual indicator and toggle button (Enabled/Disabled).
- **Persistence:** Save status changes immediately using `api.updateAction`.

---

## 4. Cross-Cutting Concerns

- **Toasts:** Integrate `ToastService` for all new update operations (Module update, Feature update, Action toggle).
- **Navigation:** Ensure breadcrumbs in the Topbar reflect the deeper navigation levels if possible.
- **Build Validation:** `nx build bff` and `nx build security`.

---

## 5. Verification Strategy

- **Module Edit:** Edit a module name and verify it updates in the list and database.
- **Navigation Flow:** Click "Details" in Product -> Navigate to Modules (filtered) -> Click "Features" in Module -> Navigate to Features (filtered).
- **Action Toggle:** Open the Action drawer from a Feature, toggle an action's status, close, and re-open to verify persistence.
