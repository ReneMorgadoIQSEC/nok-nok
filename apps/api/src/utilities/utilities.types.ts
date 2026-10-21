export interface UtilitiesResult {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    estado: number;
    descripcion: string;
  };
}
