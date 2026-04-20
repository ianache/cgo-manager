# Iniciar servicios

Para iniciar todo el ecosistema de cgomanager de forma simultánea, utilizaremos las capacidades de orquestación de Nx. Dado que
  tenemos un BFF (Backend) y un sistema de Microfrontends (Frontend), necesitamos que ambos procesos corran en paralelo.

  Aquí tienes las dos formas principales de hacerlo:

  1. El comando "Todo en Uno" (Recomendado)
  Puedes ejecutar este comando en tu terminal para levantar el BFF y el Shell con todas sus Micro UIs conectadas:

   1 npx nx run-many --target=serve --projects=bff,shell --devRemotes=dashboard,tenants,tracking,config

  ¿Qué hace este comando?
   * run-many: Le dice a Nx que ejecute una tarea en múltiples proyectos.
   * --target=serve: Inicia el modo desarrollo (live-reload).
   * --projects=bff,shell: Inicia el backend y el orquestador frontend.
   * --devRemotes=...: Es la "magia" de Module Federation; le indica al Shell que también debe levantar y conectar dinámicamente las
     4 Micro UIs.

  ---

  2. Ejecución por separado (Para mejor depuración)
  Si prefieres tener los logs separados para el backend y el frontend, abre dos terminales:

  Terminal 1: Backend (BFF)

```
npx nx serve bff
```
  Puerto por defecto: http://localhost:3000

  Terminal 2: Frontend (Shell + Micro UIs)

```
npx nx serve shell --devRemotes=dashboard,tenants,tracking,config
```
  Puerto por defecto: http://localhost:4200

  ---

  3. Configuración para mayor comodidad (package.json)
  Para no tener que recordar estos comandos largos, voy a añadir un acceso directo en tu package.json.

  I will add a start:all script to the package.json file to simplify the process of launching the entire monorepo, including the BFF
  and all micro-UIs.


  ✓  Edit  package.json → Accepted (+2, -1)

       3   "version": "1.0.0",
       4   "main": "index.js",
       5   "scripts": {
       6 -   "test": "echo \"Error: no test specified\" && exit 1"
       6 +   "start:all": "nx run-many --target=serve --projects=bff,shell --devRemotes=dashboard,tenants,tracking,config",
       7 +   "test": "nx run-many --target=test --all"
       8   },
       9   "keywords": [],
      10   "author": "",


✦ Recordatorios Importantes antes de iniciar:

   1. Keycloak: El BFF intentará conectarse a https://oauth2.qa.comsatel.com.pe al arrancar. Si no tienes conexión o el client_secret
      es incorrecto, el proceso del BFF podría mostrar errores, pero el Frontend seguirá funcionando (aunque no podrás pasar el
      login).
   2. Puertos: Nx asignará automáticamente puertos correlativos a las Micro UIs (ej. 4201, 4202, etc.). El Shell sabe encontrarlos
      gracias a la configuración de Module Federation que generamos.
   3. Primer Inicio: La primera vez puede tardar un poco más mientras Nx construye la caché de las librerías compartidas (ui-kit y
      data-access).

  Ahora solo tienes que ejecutar:

```
npm run start:all
```

# Storybook

```
npx nx storybook shared-ui-kit --watch
```
o
```
npm run storybook
```