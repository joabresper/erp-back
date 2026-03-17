import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The description of the role',
    example: 'Admin role',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The level of the role (higher means more permissions)',
    example: 10,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  level: number;
}
