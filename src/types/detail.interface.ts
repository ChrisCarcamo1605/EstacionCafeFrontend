export interface Detail {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
  isEditable: boolean;
  originalQuantity: number;
}

export interface Product {
  productId: number;
  name: string;
  productTypeId: number;
  price: number;
}

export interface ProductType {
  productTypeId: number;
  name: string;
}

export interface BillDetail {
  detalleId: number;
  billId: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
