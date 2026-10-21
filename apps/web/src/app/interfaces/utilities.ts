export interface UtilitiesResult {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    estado: number;
    descripcion: string;
  };
}

const VERIFICATION_ERRORS: Record<number, string> = {
  [-7]: 'Código incorrecto. Verifica que el código ingresado sea el último que recibiste.',
};

export function asUtilitiesResult(payload: unknown): UtilitiesResult | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = (payload as UtilitiesResult).data;
  if (!data || typeof data.estado !== 'number') {
    return null;
  }

  return payload as UtilitiesResult;
}

export function verificationEstado(payload: unknown): number | null {
  return asUtilitiesResult(payload)?.data.estado ?? null;
}

export function verificationErrorMessage(payload: unknown, fallback: string): string | null {
  const result = asUtilitiesResult(payload);
  if (!result) {
    return fallback;
  }

  if (result.data.estado === 0) {
    return null;
  }

  const mapped = VERIFICATION_ERRORS[result.data.estado];
  if (mapped) {
    return mapped;
  }

  const descripcion =
    typeof result.data.descripcion === 'string' ? result.data.descripcion.trim() : '';
  return descripcion || fallback;
}
