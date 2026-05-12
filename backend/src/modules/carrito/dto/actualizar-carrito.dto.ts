import { IsInt, Min } from 'class-validator';

export class ActualizarCarritoDto {
  @IsInt()
  @Min(1)
  cantidad!: number;
}