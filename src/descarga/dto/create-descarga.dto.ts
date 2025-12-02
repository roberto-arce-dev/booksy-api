import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDescargaDto {
  @ApiProperty({
    example: '6640c6f8a3d2b3e4f8c12345',
    description: 'ID del libro a descargar/comprar',
  })
  @IsMongoId()
  libro: string;

  @ApiPropertyOptional({
    example: '663fa2d9b5e4c1a2d3e98765',
    description: 'ID del cliente (solo para operaciones administrativas)',
  })
  @IsOptional()
  @IsMongoId()
  cliente?: string;

  @ApiPropertyOptional({
    enum: ['pdf', 'epub', 'mobi'],
    default: 'pdf',
    description: 'Formato solicitado por el cliente',
  })
  @IsOptional()
  @IsEnum(['pdf', 'epub', 'mobi'])
  formato?: string;
}
