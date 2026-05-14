import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de datos...');

  // Administrador por defecto
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.administrador.upsert({
    where: { email: 'admin@tienda.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@tienda.com',
      claveHash: passwordHash,
    },
  });

  // Configuracion de tienda por defecto
  await prisma.configuracionTienda.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      nombreTienda: 'Tienda de Ropa',
      whatsappContacto: '+598991234567',
      banco: 'Banco de la Nacion Argentina',
      cbu: '0000003123000001234567',
      alias: 'tienda.ropa.pago',
      titular: 'Tienda de Ropa SRL',
      mensajeTransferencia: 'Por favor enviar el comprobante por WhatsApp junto con el codigo de referencia.',
      pedidoVencimientoHoras: 48,
      estadoProductoBorrador: true,
      actualizadoEn: new Date(),
    },
  });

  // Pedido de ejemplo para notificaciones
  const pedidoCreado = await prisma.pedido.create({
    data: {
      emailComprador: 'cliente@ejemplo.com',
      telefonoComprador: '+598987654321',
      estado: 'PENDIENTE_PAGO',
      totalCentavos: 5000,
      codigo: 'PEDIDO-001',
      creadoEn: new Date(),
      confirmadoEn: null,
      vencidoEn: new Date(Date.now() + 48 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productoId: (await prisma.producto.findFirst({ select: { id: true } }))!,
            cantidad: 2,
            precioUnitarioCentavos: 2500,
            subtotalCentavos: 5000,
          },
        ],
      },
    },
    include: { items: true },
  });

  // Notificaciones de ejemplo
  await prisma.notificacion.createMany({
    data: [
      {
        canal: 'PANEL',
        mensaje: 'Nuevo pedido recibido: PEDIDO-001',
        leida: false,
        pedidoId: pedidoCreado.id,
        creadoEn: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        canal: 'PANEL',
        mensaje: 'Pago confirmado para pedido: PEDIDO-001',
        leida: false,
        pedidoId: pedidoCreado.id,
        creadoEn: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        canal: 'EMAIL',
        mensaje: 'Pedido PEDIDO-001 esta por vencer',
        leida: true,
        pedidoId: pedidoCreado.id,
        creadoEn: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        canal: 'PANEL',
        mensaje: 'Stock del producto Camiseta Basica bajo de 20 unidades',
        leida: true,
        pedidoId: null,
        creadoEn: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Productos de prueba
  const productos = [
    {
      nombre: 'Camiseta Basica',
      descripcion: 'Camiseta de algodo organico, ideal para uso diario. Suave, comoda y transpirable.',
      talle: 'M',
      precioCentavos: 1500,
      stock: 50,
      imagenes: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    },
    {
      nombre: 'Pantalón Chino',
      descripcion: 'Pantalon chino de corte clasico. Tela stretch de alta comodidad.',
      talle: 'L',
      precioCentavos: 3500,
      stock: 30,
      imagenes: ['https://images.unsplash.com/photo-1624378439575-d870780311d4?w=400&h=400&fit=crop'],
    },
    {
      nombre: 'Remera Deporte',
      descripcion: 'Remera tecnica con tecnologia Dry-Fit para actividades deportivas.',
      talle: 'S',
      precioCentavos: 2800,
      stock: 40,
      imagenes: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop'],
    },
    {
      nombre: 'Campera Impermeable',
      descripcion: 'Campera con capa impermeable y capucha integrada. Perfecta para la lluvia.',
      talle: 'XL',
      precioCentavos: 8500,
      stock: 15,
      imagenes: ['https://images.unsplash.com/photo-1551028719-00167b16e658?w=400&h=400&fit=crop'],
    },
    {
      nombre: 'Bermuda Casual',
      descripcion: 'Bermuda de algodon liviano con bolsillos laterales.',
      talle: 'M',
      precioCentavos: 2200,
      stock: 35,
      imagenes: ['https://images.unsplash.com/photo-1591195853838-8e900a29e9b8?w=400&h=400&fit=crop'],
    },
    {
      nombre: 'Sueter Lana',
      descripcion: 'Sueter de lana merino con cuello redondo. Abrigado y elegante.',
      talle: 'L',
      precioCentavos: 4500,
      stock: 20,
      imagenes: ['https://images.unsplash.com/photo-1576566588028-4147f3842627?w=400&h=400&fit=crop'],
    },
  ];

  for (const prod of productos) {
    await prisma.producto.create({
      data: {
        ...prod,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      },
    });
  }

  console.log('Seed completado con exito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());