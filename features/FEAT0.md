# Gols
Preparar la estructura inicial de la solucion
# Requirements
necesito configurar este proyecto (monorepo) como una solucion que tiene un frontend (Angular ultima version) como un framework principal, varias microui (desarrolladas con Angular y basadas en componentes reutilizables según un System Design para UX/UI comun con el frontend y un bff (NodeJS).

# ReqSpec

Configurar un monorepo robusto utilizando Nx, que es el estándar de la industria para ecosistemas de Angular.
  Este enfoque nos permitirá compartir el Design System (basado en la especificación "The Precision Orbit" que recuperamos de Stitch)
  entre el frontend principal y las Micro UIs, manteniendo un BFF en Node.js sincronizado.

  Estrategia de Arquitectura
   1. Nx Workspace: Gestión del monorepo.
   2. Frontend Principal (Shell): Aplicación Angular que orquestará la experiencia.
   3. Micro UIs (Remote Apps): Aplicaciones Angular independientes para Dashboard, Tenants, Tracking y Config.
   4. Shared Design System: Librería de componentes Angular (ui-kit) que implementa los tokens de Stitch.
   5. BFF (Node.js): Aplicación NestJS para centralizar la lógica de negocio y consumo de APIs.

# Acceptance Criteria
- Se ha creado un proyecto Angular para el frontend
- Se ha creado un proyecto Angular para cada microui
- Se ha creado un proyecto NodeJS para el bff
- Se ha creado un proyecto para cada microui
