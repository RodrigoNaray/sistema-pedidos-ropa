# Sistema de Pedidos para Tienda de Ropa

Este proyecto es una solución completa para la gestión de una tienda de ropa en línea. Está dividido en dos partes principales: el backend y el frontend.

## Descripción General

El sistema permite a los usuarios navegar por un catálogo de productos, agregar artículos al carrito, realizar pedidos y seguir las instrucciones de pago. Los administradores pueden gestionar productos, confirmar pagos y configurar la tienda.

### Tecnologías Utilizadas

- **Backend**: NestJS, Prisma ORM, TypeScript
- **Frontend**: Next.js, React, TypeScript
- **Base de Datos**: PostgreSQL

## Estructura del Proyecto

```
.
├── backend/   # API REST para la lógica del negocio
├── frontend/  # Interfaz de usuario
```

### Backend

El backend está construido con NestJS y utiliza Prisma ORM para la gestión de la base de datos. Incluye módulos para:

- Autenticación
- Gestión de productos
- Gestión de pedidos
- Notificaciones

#### Scripts Útiles

- `pnpm prisma:generate`: Generar el cliente de Prisma.
- `pnpm prisma:migrate`: Aplicar migraciones a la base de datos.
- `pnpm seed`: Poblar la base de datos con datos iniciales.

### Frontend

El frontend está desarrollado con Next.js utilizando el App Router. Proporciona una experiencia de usuario moderna y fluida.

#### Scripts Útiles

- `pnpm dev`: Iniciar el servidor de desarrollo.
- `pnpm build`: Construir la aplicación para producción.
- `pnpm start`: Iniciar el servidor en modo producción.

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/RodrigoNaray/sistema-pedidos-ropa.git
   ```
2. Instalar dependencias y configurar archivos .env en `frontend` y `backend`:
   ```bash
   pnpm install
   ```
3. Crear la base de datos en PostgreSQL y configurar las credenciales en el archivo `.env` del backend.
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_base_datos"
   ```

4. Ejecutar las migraciones de la base de datos:
   ```bash
   pnpm prisma:migrate
   ```

5. Poblar la base de datos con datos iniciales:
   ```bash
   pnpm seed
   ```
6. Iniciar el proyecto completo (backend y frontend) con un solo comando:
   ```bash
   pnpm dev
   ```

