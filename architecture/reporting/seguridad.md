# **Controles de Seguridad ISO 27001**

Para que esta PoC sea viable en un entorno corporativo bajo **ISO 27001**, debemos pasar de "funciona" a "está blindado".

## 🔐 Anexo de Seguridad: Controles ISO 27001
### 1. Control de Acceso (A.9) - Impersonación y Least Privilege
 * **Aislamiento de Tenants:** El mecanismo de **Service Accounts** por tenant en el BFF asegura el cumplimiento del principio de "mínimo privilegio". Cada SA solo tiene permisos de SELECT en las vistas de Trino correspondientes a su tenant_id.
 * **Gestión de Secretos:** Prohibido el uso de variables de entorno para credenciales de bases de datos legacy. Usaremos **HashiCorp Vault** con rotación automática de credenciales para MySQL 5.5 y Postgres.
### 2. Cifrado y Protección de Datos (A.10 / A.18)
 * **Data at Rest:** Los archivos temporales en **MinIO** (Landing Zone) deben estar cifrados mediante **SSE-S3** o **SSE-KMS**. Se aplicará una política de purga automática (Life Cycle Policy) de 24 horas para minimizar la superficie de exposición.
 * **Data in Transit:** TLS 1.3 obligatorio en todas las capas (Browser ↔ BFF ↔ Cube ↔ Trino).
 * **Enmascaramiento Dinámico:** Si el reporte incluye PII (Información de Identificación Personal), Cube aplicará reglas de enmascaramiento antes de que el Worker de Python genere el archivo.
### 3. Seguridad en el Desarrollo y Operaciones (A.12 / A.14)
 * **Validación de Inputs:** El BFF aplicará un esquema de validación estricto (JSON Schema) para prevenir **Inyección de SQL/Trino**. El usuario nunca escribe SQL; solo elige miembros del modelo semántico.
 * **Registro y Monitoreo (Logging):** Se implementará un **Audit Trail** inmutable. Cada vez que se genera o descarga un reporte, se registra: *Quién, Cuándo, Qué filtros usó y el Hash del archivo generado*.
### 4. Seguridad en las Comunicaciones (A.13)
 * **Canales de Envío:** * **Email:** Uso obligatorio de **TLS** y validación de dominios autorizados.
   * **SFTP:** Solo se permiten conexiones con intercambio de llaves SSH (RSA 4096), gestionadas desde Vault.
   * **WhatsApp:** Uso de Webhooks firmados para validar la integridad de la comunicación.
