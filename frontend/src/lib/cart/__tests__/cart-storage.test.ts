import { describe, it, expect, beforeEach } from 'vitest';
import {
  obtenerItemsDelCarrito,
  agregarAlCarrito,
  actualizarCantidadEnCarrito,
  eliminarDelCarrito,
  vaciarCarrito,
  obtenerTotalDelCarrito,
  obtenerCantidadTotalDeItems,
  elCarritoEstaVacio,
} from '../cart-storage';

type ItemSinSubtotal = Parameters<typeof agregarAlCarrito>[0];

describe('cart-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('elCarritoEstaVacio', () => {
    it('debe retornar true cuando el carrito esta vacio', () => {
      expect(elCarritoEstaVacio()).toBe(true);
    });

    it('debe retornar false cuando el carrito tiene items', () => {
      agregarAlCarrito({
        productoId: '1',
        nombre: 'Camiseta',
        talle: 'M',
        precioUnitarioCentavos: 15000,
        cantidad: 1,
      });
      expect(elCarritoEstaVacio()).toBe(false);
    });
  });

  describe('obtenerItemsDelCarrito', () => {
    it('debe retornar array vacio cuando no hay items', () => {
      const items = obtenerItemsDelCarrito();
      expect(items).toEqual([]);
    });

    it('debe retornar los items almacenados correctamente', () => {
      const itemData: ItemSinSubtotal = {
        productoId: 'prod-1',
        nombre: 'Camiseta basica',
        talle: 'M',
        precioUnitarioCentavos: 15000,
        cantidad: 2,
      };
      agregarAlCarrito(itemData);

      const items = obtenerItemsDelCarrito();

      expect(items).toHaveLength(1);
      expect(items[0]?.productoId).toBe('prod-1');
      expect(items[0]?.nombre).toBe('Camiseta basica');
      expect(items[0]?.talle).toBe('M');
      expect(items[0]?.precioUnitarioCentavos).toBe(15000);
      expect(items[0]?.cantidad).toBe(2);
      expect(items[0]?.subtotalCentavos).toBe(30000);
    });
  });

  describe('agregarAlCarrito', () => {
    it('debe agregar un producto al carrito', () => {
      const itemData2: ItemSinSubtotal = {
        productoId: 'prod-2',
        nombre: 'Pantalon deportivo',
        talle: 'L',
        precioUnitarioCentavos: 25000,
        cantidad: 1,
      };
      agregarAlCarrito(itemData2);

      const items = obtenerItemsDelCarrito();
      expect(items).toHaveLength(1);
      expect(items[0]?.productoId).toBe('prod-2');
    });

    it('debe calcular el subtotal correctamente', () => {
      const itemData3: ItemSinSubtotal = {
        productoId: 'prod-3',
        nombre: 'Zapatillas urbanas',
        talle: '42',
        precioUnitarioCentavos: 45000,
        cantidad: 3,
      };
      agregarAlCarrito(itemData3);

      const items = obtenerItemsDelCarrito();
      expect(items[0]?.subtotalCentavos).toBe(135000);
    });

    it('debe actualizar la cantidad si el producto ya existe (mismo productoId + talle)', () => {
      const itemData4: ItemSinSubtotal = {
        productoId: 'prod-4',
        nombre: 'Camisa elegante',
        talle: 'M',
        precioUnitarioCentavos: 20000,
        cantidad: 1,
      };
      agregarAlCarrito(itemData4);

      const itemData5: ItemSinSubtotal = {
        productoId: 'prod-4',
        nombre: 'Camisa elegante',
        talle: 'M',
        precioUnitarioCentavos: 20000,
        cantidad: 5,
      };
      agregarAlCarrito(itemData5);

      const items = obtenerItemsDelCarrito();
      expect(items).toHaveLength(1);
      expect(items[0]?.cantidad).toBe(5);
      expect(items[0]?.subtotalCentavos).toBe(100000);
    });
  });

  describe('actualizarCantidadEnCarrito', () => {
    it('debe actualizar la cantidad de un producto existente', () => {
      const itemData6: ItemSinSubtotal = {
        productoId: 'prod-5',
        nombre: 'Bermuda casual',
        talle: '38',
        precioUnitarioCentavos: 12000,
        cantidad: 2,
      };
      agregarAlCarrito(itemData6);
      actualizarCantidadEnCarrito('prod-5', '38', 4);

      const items = obtenerItemsDelCarrito();
      expect(items[0]?.cantidad).toBe(4);
      expect(items[0]?.subtotalCentavos).toBe(48000);
    });

    it('debe eliminar el producto si la cantidad es cero', () => {
      const itemData7: ItemSinSubtotal = {
        productoId: 'prod-6',
        nombre: 'Gorra deportiva',
        talle: 'U',
        precioUnitarioCentavos: 8000,
        cantidad: 1,
      };
      agregarAlCarrito(itemData7);
      actualizarCantidadEnCarrito('prod-6', 'U', 0);

      expect(elCarritoEstaVacio()).toBe(true);
    });

    it('no debe hacer nada si el producto no existe', () => {
      const itemData8: ItemSinSubtotal = {
        productoId: 'prod-7',
        nombre: 'Bufanda',
        talle: 'U',
        precioUnitarioCentavos: 6000,
        cantidad: 1,
      };
      agregarAlCarrito(itemData8);
      actualizarCantidadEnCarrito('prod-inexistente', 'U', 5);

      const items = obtenerItemsDelCarrito();
      expect(items).toHaveLength(1);
      expect(items[0]?.productoId).toBe('prod-7');
    });
  });

  describe('eliminarDelCarrito', () => {
    it('debe eliminar el producto y retornar true', () => {
      const itemData9: ItemSinSubtotal = {
        productoId: 'prod-8',
        nombre: 'Calcetines pack',
        talle: 'U',
        precioUnitarioCentavos: 5000,
        cantidad: 2,
      };
      agregarAlCarrito(itemData9);

      const resultado = eliminarDelCarrito('prod-8', 'U');

      expect(resultado).toBe(true);
      expect(elCarritoEstaVacio()).toBe(true);
    });

    it('debe retornar false si el producto no existe', () => {
      const resultado = eliminarDelCarrito('prod-noexiste', 'U');
      expect(resultado).toBe(false);
    });
  });

  describe('vaciarCarrito', () => {
    it('debe remover todos los productos del carrito', () => {
      agregarAlCarrito({
        productoId: 'prod-9',
        nombre: 'Chaqueta impermeable',
        talle: 'L',
        precioUnitarioCentavos: 55000,
        cantidad: 1,
      });
      agregarAlCarrito({
        productoId: 'prod-10',
        nombre: 'Cinturon de cuero',
        talle: 'M',
        precioUnitarioCentavos: 18000,
        cantidad: 2,
      });

      vaciarCarrito();

      expect(elCarritoEstaVacio()).toBe(true);
      expect(obtenerItemsDelCarrito()).toHaveLength(0);
    });
  });

  describe('obtenerTotalDelCarrito', () => {
    it('debe retornar 0 cuando el carrito esta vacio', () => {
      const total = obtenerTotalDelCarrito();
      expect(total).toBe(0);
    });

    it('debe retornar la suma de subtotales', () => {
      agregarAlCarrito({
        productoId: 'prod-11',
        nombre: 'Polo algodon',
        talle: 'M',
        precioUnitarioCentavos: 15000,
        cantidad: 2,
      });
      agregarAlCarrito({
        productoId: 'prod-12',
        nombre: 'Short deportivo',
        talle: 'L',
        precioUnitarioCentavos: 12000,
        cantidad: 1,
      });

      const total = obtenerTotalDelCarrito();
      expect(total).toBe(42000);
    });
  });

  describe('obtenerCantidadTotalDeItems', () => {
    it('debe retornar 0 cuando el carrito esta vacio', () => {
      const cantidad = obtenerCantidadTotalDeItems();
      expect(cantidad).toBe(0);
    });

    it('debe retornar la suma de cantidades', () => {
      agregarAlCarrito({
        productoId: 'prod-13',
        nombre: 'Remera basica',
        talle: 'S',
        precioUnitarioCentavos: 8000,
        cantidad: 3,
      });
      agregarAlCarrito({
        productoId: 'prod-14',
        nombre: 'Pantalon chino',
        talle: 'M',
        precioUnitarioCentavos: 22000,
        cantidad: 2,
      });

      const cantidad = obtenerCantidadTotalDeItems();
      expect(cantidad).toBe(5);
    });
  });
});