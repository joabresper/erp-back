import { InvoiceType } from "@prisma/client";


export class InvoiceSecuence {
	id!: string;
	type!: InvoiceType;
	prefix!: number;
	lastNumber!: number;
	updatedAt!: Date;
}