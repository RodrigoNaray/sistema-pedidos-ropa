export interface PedidoPendienteDto {
  id: string;
  codigo: string;
  emailComprador: string;
  telefonoComprador: string;
  totalCentavos: number;
  creadoEn: Date;
  vencidoEn: Date;
  itemsCount: number;
}