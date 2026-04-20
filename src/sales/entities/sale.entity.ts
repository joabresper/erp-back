import { InvoiceType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { Sale as PrismaSale, SaleItem as PrismaSaleItem } from "@prisma/client";

export class Sale {
	id!: string;
	createdAt!: Date;
	totalAmount!: number;
	totalDiscountAmount!: number
	paymentStatus!: PaymentStatus;
	paymentMethod!: PaymentMethod
	invoiceNumber!: string;
	invoiceDate!: Date;
	invoiceType!: InvoiceType;
	items!: SaleItem[];
	customerId!: string;
	customer!: CustomerData;
	createdById!: string;

	constructor(partial: Partial<PrismaSale>) {
		Object.assign(this, {
			...partial,
			totalAmount: partial.totalAmount ? Number(partial.totalAmount) : 0,
			totalDiscountAmount: partial.totalDiscountAmount ? Number(partial.totalDiscountAmount) : 0,
		});
	}
}

export class SaleItem {
	id!: string;
	productName!: string;
	productSku!: string;
	quantity!: number;
	unitPrice!: number;
	discountAmount!: number;
	subtotalAmount!: number;
	productId!: string;
	saleId!: string;

	constructor(partial: Partial<PrismaSaleItem>) {
		Object.assign(this, {
			...partial,
			quantity: partial.quantity ? Number(partial.quantity) : 0,
			unitPrice: partial.unitPrice ? Number(partial.unitPrice) : 0,
			discountAmount: partial.discountAmount ? Number(partial.discountAmount) : 0,
			subtotalAmount: partial.subtotalAmount ? Number(partial.subtotalAmount) : 0,
		});
	}
}

export interface CustomerData {
	name: string;
	email: string | null;
}
