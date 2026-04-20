import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSaleDto } from './create-sale.dto';

export class UpdateSaleDto extends PartialType(
	OmitType(CreateSaleDto, ['invoiceDate', 'invoiceType'] as const)
) {}
