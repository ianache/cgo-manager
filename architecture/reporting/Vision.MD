# Vision & Architectural Strategy: Generic Reporting Platform

## 1. Visión del Producto
Desarrollar una solución de reportería y analítica multitenant, altamente parametrizable, que permita a los usuarios de negocio diseñar, programar y distribuir reportes basados en un modelo semántico unificado, eliminando la dependencia de desarrollos a medida para cada nuevo reporte.

## 2. Estrategia Arquitectural
La arquitectura se basa en el desacoplamiento total de las capas de presentación, lógica de negocio, semántica y federación de datos. 
- **Data-Driven:** La interfaz se construye dinámicamente basada en metadatos.
- **Security-First:** Aislamiento estricto de tenants mediante Service Accounts dinámicas mapeadas en el BFF.
- **Agile Infrastructure:** Uso de contenedores en K8s para escalabilidad horizontal del procesamiento de datos.

## 3. Registro de Decisiones de Arquitectura (ADR)

| ID | Decisión | Justificación |
| :--- | :--- | :--- |
| **ADR-001** | **Federación con Trino** | Permite consultas JOIN entre MySQL 5.5, Postgres y MongoDB sin procesos ETL costosos. |
| **ADR-002** | **Capa Semántica con Cube** | Centraliza la lógica de Facts & Dimensions, asegurando consistencia en métricas (Single Source of Truth). |
| **ADR-003** | **Patrón BFF (Node.js)** | Centraliza la seguridad, inyección de `tenant_id` y abstracción de la infraestructura para el Frontend. |
| **ADR-004** | **Identidad por Tenant (SA)** | Uso de Cuentas de Servicio únicas por tenant para auditoría granular y trazabilidad de consumos. |
| **ADR-005** | **Micro-UI Angular** | Facilita la integración modular en el portal principal y permite despliegues independientes (MFE). |
| **ADR-006** | **Worker Asíncrono (Python)** | Delegación de tareas pesadas (generación de Excel/Parquet) a workers especializados (Pandas/Polars). |
| **ADR-007** | **Distribución Omnicanal** | Desacoplamiento de la generación del archivo de su envío (Email, FTP, WhatsApp). |

## 4. Stack Tecnológico
- **Frontend:** Angular 17+ (Signals, Module Federation).
- **BFF:** Node.js (NestJS / Fastify).
- **Semántica:** Cube (Semantic Layer).
- **Federación:** Trino (vía K8s v1.34).
- **Storage:** MinIO (Landing Zone para reportes generados).
- **Seguridad:** Keycloak (Auth) + HashiCorp Vault (Secrets Management).