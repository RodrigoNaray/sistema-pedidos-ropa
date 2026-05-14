import { IsOptional, IsIn } from 'class-validator';

export class ListarNotificacionesDto {
  @IsOptional()
  @IsIn(['all', 'unread'])
  filtro?: string;
}