// Por ahora no se usa

export enum InvoiceType {
   A,
   B,
   C,
   TICKET,
   NOTA_CREDITO
}

export enum PaymentStatus {
   PENDING,        // Pendiente de pago
   PAID,           // Pagado
   CANCELLED,      // Cancelado
   PARTIALLY_PAID, // Pago parcial (señas)
   REFUNDED        // Devuelta (se cobró y se devolvió la plata)
}

export enum PaymentMethod {
   CASH,            // Efectivo
   DEBIT_CARD,      // Débito
   CREDIT_CARD,	 // Crédito
   TRANSFER,        // Transferencia bancaria
   ACCOUNT_CREDIT   // "Cuenta Corriente" (El famoso "fíado" para clientes de confianza)
}