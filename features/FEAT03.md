# Feature: Gestión de Usuarios

Goal: Gestionar la seguridad de la plataforma a través de la gestión de usuarios.

# Iteration 1

## Usuarios

- Obtener la información requerida de los usuarios (name, email, role(s), last login date, status), según diseño de UX/UI, desde el bff quien debe conectarse con Keycloak para obtener la información.
- Al editar usuario "Edit User" se debe poder asignar uno o varios roles (combox con checkboxes) de los disponibles en keycloak al nivel de todo el Realm Apps y del client_id de la aplicacion. 
- Guardar la información del usuario en el bff quien debe conectarse con Keycloak para guardar la información (en keyckoak deben quedar guardado los roles asignados)  

# Iteration 2

## Requirements 

- I need to add a new options in "security" to manage products, modules, features and actions. These options should be available only for users with role 'Admin'.
- The management of products, modules, features and actions should be done using the bff.
- Based products, modules an features pages based on "User Directory" page in "security" microui.
- Use Toast for notification on successful o failed operations.
- Use the existing services from bff.
- I need all attribute with type lang string to be able to edit them for all available languages using a pupop form that show a standard table with header where the first column is the language and the subsequent columns are the values for the attribute in each language. The table should allow edit only the value columns inline editing. You can add new languages using the bff.

### Conceptual Model

- Product (application or software products): has attributes id (guid) as primary key, name (lang string list) is mandatory, description (lang string list) is optional, icon (string) is optional, isActive (boolean) as mandatory (default value is true)
- Module (application or software modules): has attributes id (guid) as primary key, name (lang string list) is mandatory, description (lang string list) is optional, icon (string) is optional, isActive (boolean) as mandatory (default value is true), product_id (guid)FK to product
- Feature (application or software features): has attributes id (guid) as primary key, name (lang string list) is mandatory, description (lang string list) is optional, icon (string) is optional, isActive (boolean) as mandatory (default value is true), module_id (guid) FK to module and allowed roles (array of role names in keycloak)
- Actions (application or software actions): has attributes id (guid) as primary key, name (lang string list) is mandatory, description (lang string list) is optional, icon (string) is optional, isActive (boolean) as mandatory (default value is true), feature_id (guid) FK to feature and allowed roles (array of role names in keycloak)
- Any property of type "lang string" (lang string list) must be saved in the database as a jsonb field (for "lang" use the iso code). Two default language must exist 'en' and 'es'

### Physical Model

- You must name tables using as plural form the word 
- All tables must start with "tb_" prefix.
- You must use snake_case for all identifiers.
- You must use UUID for all primary keys.
- You must use FK to reference parent entities.

### Technical Constraints
- You must use PostgreSql.
- You must use Prisma as ORM.
- You must use NestJS as framework.
- You must use TypeScript as language.

### Acceptance Criteria

# Iteracion 3

## Requirements

- The first time a user login a basic information must be stored in bff database (use the existing services from bff). The basic information is:
    - id (guid) as primary key (must be keycloak user id), 
    - email (string) is mandatory (must be keycloak user email), 
    - isActive (boolean) as mandatory (default value is true)
    - avatar as an image a user can upload from a local path with dimensions of 50x50 pixels, format jpeg or png and must be converted to base64 to be stored in the database using bff service.
- When user is already registered in bff database, it should not be stored again.
- I need autheticated user name and avatar appears in top right corner of header (same as current app name appears in top left corner)
- When user clicks on user name, a dropdown should appear with the following options:
    - Profile
    - Settings
    - Logout
- When user clicks on Profile option, it should appear a popup form to edit the user profile information (id, user name, email and avatar (50x50 pixels, format jpeg or png)). Only avatar can be edited.
- When user clicks on Settings option, it should appear a popup form to edit the user settings information (change password) and the list of all roles assigned to the user (must be read only) to the left and a list of all features assigned to the user (must be read only) to the right. The list of features must be sorted by module name and then by feature name, description (in user locale language) and badges(must be shown as small labels) for each actions.
- When user clicks on Logout option, it should appear a popup form to logout the user.

### Conceptual Model

- Profile: is an entity that represents the profile of a user. It has the following attributes: 
    - id (guid) as primary key, name (lang string list) is mandatory, description (lang string list) is optional, icon (string) is optional, isActive (boolean) as mandatory (default value is true)

# Iteracion 4 - Manage Modules

## Requirements
El contexto de este requerimiento es el formulario "Module Management".

- Cuando se seleccione "Edit" en un modulo, se debe abrir el formulario "Edit Module" (usar la misma base del formulario "New Module").
- El formulario de edicion debe tener los mismos campos que el formulario de edicion de cada Product.
- Cuando se seleccione el icono "features" de cada modulo se dene navegar el formulario de los "Features Management" para el modulo seleccionado.
- Cuando se seleccione el icono "Actions" de cada feature se debe mostrar un formulario que se muestre usando el mismo comportamiento del formulario de edicion de "Edit Module". Este formulario debe contener una tabla (usar el componente reutilizabla de tabla con encabezado con titulo "Actions Management" y subtitulo el nombre de la feature seleccionada) con dos columnas, la primera columna debe mostrar el nombre de la accion y la segunda columna debe mostrar el estado de la accion (enabled o disabled).
- Todos los cambios se deben registrar en BD a través del API de BFF.

# Iteracion 5 - Manage Feature Actions
## Requirments

El contexto de este requerimiento es el formulario "Edit Feature".

- Cuando se seleccione "Edit" en una feature, se debe abrir el formulario "Edit Actions" (actions representa las acciones que un usuario puede realizar sobre el feature/funcionalidad, por ejemplo, la funcionalidad puede ser "Buscar unidades" y una acción dentro de esta funcionalidad puede ser eliminar , agregar una unidad). Las acciones dan un nivel de control mas granulado dentro de una feature/funcionalidad.
- El formulario "Edit Actions" debe tener una tabla tres columnas: la primera columna debe mostrar el nombre de la accion, la segunda columna debe mostrar el estado de la accion (enabled o disabled), la tercera debe permitir seleccionar (combobox con check boxes delante de cada role) los roles permitidos para ejecutar la acción de todos los roles asignados a la funcionalidad/feature. En caso de que la accion no tenga roles asignados, se debe mostrar un message indicando que no hay roles asignados. 
- Todos los cambios se deben registrar en BD a través del API de BFF.  

# Iteracion5 - Fix Manage Features
## Requirements
- En microui "security" el formulario "Action Management" debe permitir editar una action seleccionada de la tabla. Utilizar el mismo formulario "New Action".