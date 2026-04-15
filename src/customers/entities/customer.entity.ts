export class Customer {
	id!: string;
	name!: string
	email!: string | null;
	phone!: string | null;
	address!: string | null;
	city!: string | null;
	postalCode!: string | null;
	taxId!: string | null;
	taxCondition!: string | null;
	active!: boolean;
	createdAt!: Date;
	updatedAt!: Date | null;
}
