import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ChangeStatusDto {
  @ApiProperty({
	description: "Indicates if the product is active",
	example: true,
  })
  @IsBoolean({ message: "Active status must be a boolean value" })
  active!: boolean;
}