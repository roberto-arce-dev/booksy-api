import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateDescargaDto } from './create-descarga.dto';

export class UpdateDescargaDto extends PartialType(CreateDescargaDto) {
  @ApiPropertyOptional({ description: 'URL de la imagen asociada' })
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiPropertyOptional({ description: 'URL del thumbnail asociado' })
  @IsOptional()
  @IsString()
  imagenThumbnail?: string;
}
