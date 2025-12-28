import { ApiProperty } from "@nestjs/swagger";
import { Permission } from "@prisma/client";

export class PermissionEntity implements Permission {
	@ApiProperty({
		description: 'The id of the permission',
		example: '123e4567-e89b-12d3-a456-426614174000'
	})
	id: string

	@ApiProperty({
		description: 'The name of the permission',
		example: 'user.create'
	})
	name: string;

	@ApiProperty({
		description: 'The description of the permission',
		example: 'Permission to create an user'
	})
	description: string | null;
}