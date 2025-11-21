import type { Mesa, Cuenta } from "../types/mesa";
import { BACKEND_API_URL } from "../config/api";

/**
 * Servicio para manejar todas las llamadas API relacionadas con mesas y cuentas
 */
export class MesaApiService {
  private static BASE_URL = BACKEND_API_URL;

  /**
   * Obtener todas las mesas desde el backend
   */
  static async getMesas(): Promise<Mesa[]> {
    // Datos estáticos de ejemplo con estructura completa
    return [
      {
        tableId: "1",
        numeroMesa: 1,
        zone: "ZONA A",
        status: "disponible",
        bills: [],
      },
      {
        tableId: "2",
        zone: "ZONA B",
        numeroMesa: 2,
        status: "ocupada",
        bills: [
          {
            billId: 201,
            cashRegister: 1,
            customer: "Juan Perez",
            total: 80,
            date: new Date().toISOString(),
            tableId: "2",
            status: "open",
            ultimaModificacion: new Date().toISOString(),
            detalles: [],
            numeroCuenta: 1,
          },
        ],
      },
      {
        tableId: "3",
        numeroMesa: 3,
        zone: "ZONA C",
        status: "disponible",
        bills: [],
      },
      {
        tableId: "4",
        numeroMesa: 4,
        zone: "ZONA A",
        status: "reservada",
        bills: [
          {
            billId: 202,
            cashRegister: 2,
            customer: "Maria Lopez",
            total: 50,
            date: new Date().toISOString(),
            tableId: "4",
            status: "draft",
            ultimaModificacion: new Date().toISOString(),
            detalles: [],
            numeroCuenta: 1,
          },
        ],
      },
      {
        tableId: "5",
        numeroMesa: 5,
        zone: "ZONA B",
        status: "disponible",
        bills: [],
      },
    ];
    // try {
    //   const response = await fetch(`${this.BASE_URL}/tables`);
    //   if (!response.ok) {
    //     throw new Error("Error al obtener mesas");
    //   }
    //   const data = await response.json();
    //   return data.data || [];
    // } catch (error) {
    //   console.error("Error en getMesas:", error);
    //   throw error;
    // }
  }

  /**
   * Crear una nueva cuenta en una mesa
   */
  static async createBill(
    nuevaCuenta: Omit<Cuenta, "billId">
  ): Promise<Cuenta> {
    // Datos estáticos de ejemplo
    return {
      billId: 100,
      cashRegister: 1,
      customer: nuevaCuenta.customer,
      total: nuevaCuenta.total,
      date: new Date().toISOString(),
      tableId: nuevaCuenta.tableId,
      status: "open",
      ultimaModificacion: new Date().toISOString(),
      detalles: [],
      numeroCuenta: 1,
    };
    // try {
    //   const response = await fetch(`${this.BASE_URL}/bills`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(nuevaCuenta),
    //   });
    //   if (!response.ok) {
    //     const error = await response.json();
    //     throw new Error(error.message || "Error al crear la cuenta");
    //   }
    //   const data = await response.json();
    //   return {
    //     billId: data.data.billId,
    //     cashRegister: data.data.cashRegisterId,
    //     customer: data.data.customer,
    //     total: data.data.total,
    //     date: data.data.date,
    //     tableId: data.data.tableId,
    //     status: data.data.status,
    //     ultimaModificacion: data.data.updatedAt,
    //     detalles: [],
    //     numeroCuenta: data.data.numeroCuenta,
    //   };
    // } catch (error) {
    //   console.error("Error en createBill:", error);
    //   throw error;
    // }
  }

  /**
   * Obtener detalles de una cuenta específica
   */
  static async getBillDetails(billId: number): Promise<any[]> {
    // Datos estáticos de ejemplo compatibles con DetalleCuenta
    return [
      {
        detalleId: 1,
        billId: billId,
        productoId: 1,
        nombreProducto: "Café Americano",
        cantidad: 2,
        precioUnitario: 25,
        subtotal: 50,
      },
      {
        detalleId: 2,
        billId: billId,
        productoId: 7,
        nombreProducto: "Té Verde",
        cantidad: 1,
        precioUnitario: 20,
        subtotal: 20,
      },
      {
        detalleId: 3,
        billId: billId,
        productoId: 19,
        nombreProducto: "Cheesecake",
        cantidad: 1,
        precioUnitario: 35,
        subtotal: 35,
      },
      {
        detalleId: 4,
        billId: billId,
        productoId: 25,
        nombreProducto: "Sandwich Jamón",
        cantidad: 1,
        precioUnitario: 32,
        subtotal: 32,
      },
    ];
    // try {
    //   const response = await fetch(
    //     `${this.BASE_URL}/bill-details/bill/${billId}`
    //   );
    //   if (!response.ok) {
    //     throw new Error("Error al obtener detalles de la cuenta");
    //   }
    //   const details = await response.json();
    //   return details.data || [];
    // } catch (error) {
    //   console.error("Error en getBillDetails:", error);
    //   throw error;
    // }
  }

  /**
   * Cerrar todas las cuentas de una mesa
   */
  static async closeTableBills(tableId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/bills/table/${tableId}/close`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al cerrar cuentas");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en closeTableBills:", error);
      throw error;
    }
  }
}
