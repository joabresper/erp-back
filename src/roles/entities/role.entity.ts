import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";

export class RoleEntity implements Role {
	@ApiProperty({
		description: 'The id of the role',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;
	
	@ApiProperty({
		description: 'The name of the role',
		example: 'admin',
	})
	name: string;
	
	@ApiProperty({
		description: 'The description of the role',
		example: 'Admin role',
	})
	description: string | null;
}
