// Tipos para el sistema de mesas con múltiples bills

export interface DetalleCuenta {
  detalleId?: number;
  billId: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Cuenta {
  billId: number;
  tableId: string;
  cashRegister: number;
  customer: string;
  date: Date | string;
  ultimaModificacion: Date | string;
  status: 'draft' | 'open' | 'closed'; // draft = sin productos aún
  detalles: DetalleCuenta[];
  total: number;
  numeroCuenta?: number; // Número de subcuenta (1, 2, 3, etc.)
}

export interface Mesa {
  tableId: string; // ej: "A2", "B5"
  zone: string; // ej: "zone A", "zone B"
  status: 'disponible' | 'ocupada' | 'reservada';
  bills: Cuenta[];
  numeroMesa: number; // Número dentro de la zone
}

export interface MesaResponse {
  success: boolean;
  data: Mesa[];
  message?: string;
}

export interface CuentaResponse {
  success: boolean;
  data: Cuenta;
  message?: string;
}
