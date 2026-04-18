# ReqSpec: Reporting & Analytics Micro-UI (For Gemini Code Assist)

## 1. Objetivo
Generar una Micro-UI autocontenida en Angular que permita la gestión, diseño y auditoría de reportes parametrizables, consumiendo un modelo semántico (Facts & Dimensions).

## 2. Requerimientos Técnicos del Frontend
- **Framework:** Angular 17+.
- **Estado:** Reactividad basada en **Angular Signals**.
- **Arquitectura:** Micro-frontend (Remote Module) integrable en un Shell.
- **UI:** Tailwind CSS + Reutilización de componentes compartidos (`shared-ui-lib`).

## 3. Especificaciones de Componentes

### C1: Report Designer (Wizard)
- **Input:** Lista de Cubos y Miembros (Measures/Dimensions) obtenidos del BFF (vía API de Cube).
- **Funcionalidad:**
    - Selección de métricas y dimensiones mediante interfaz visual.
    - Constructor de filtros dinámicos (columna, operador, valor).
    - Configuración de salida (CSV, XLSX, Parquet).
    - Configuración de entrega (Email, FTP, WhatsApp).
    - Configuración de recurrencia (Selector de frecuencia y generador de Cron).

### C2: Execution & Audit Logs
- **Vista:** Tabla con historial de ejecuciones filtrada por tenant.
- **Campos Requeridos:** ID, Nombre Reporte, Origen (Manual/Programado), Estado (Success/Error), Fecha/Hora, Link de descarga temporal.
- **Acción:** Botón de re-intento y modal de visualización de errores detallados.

## 4. Master Prompt para Generación de Código
> "Actúa como un Arquitecto Senior. Genera el código para una Micro-UI de reportería en Angular 17. 
> 1. Crea un servicio 'ReportService' que se conecte a un BFF, gestionando el manejo de errores y estados de carga.
> 2. Diseña un componente 'ReportDesigner' con un formulario reactivo dividido en pasos (Steppers).
> 3. El componente debe permitir elegir Measures y Dimensions de un modelo dimensional.
> 4. Asegura que el componente sea multitenant-ready, recuperando el contexto del usuario desde un store central.
> 5. Estilo visual: Minimalista Bauhaus, usando Tailwind CSS."

## 5. Contrato de Datos (Interface)
```typescript
export interface ReportDefinition {
  id?: string;
  name: string;
  cubeName: string;
  measures: string[];
  dimensions: string[];
  filters: Array<{ member: string; operator: string; values: any[] }>;
  format: 'xlsx' | 'csv' | 'parquet';
  delivery: {
    channel: 'email' | 'ftp' | 'whatsapp';
    destination: string;
  };
  schedule?: {
    cron: string;
    enabled: boolean;
  };
}