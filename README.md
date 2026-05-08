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
2. Instalar dependencias:
   ```bash
   pnpm install
   ```
3. Configurar las variables de entorno en ambos directorios (`backend` y `frontend`).

