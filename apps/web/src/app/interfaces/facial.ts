export interface FacialCompareResult {
  estado: number;
  descripcion: string;
}

const COMPARE_FALLBACK = 'No logramos validar la prueba de vida. Por favor, vuelve a intentarlo.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isFacialMatch(payload: unknown): boolean {
  return isRecord(payload) && payload['estado'] === 0;
}

export function facialErrorMessage(payload: unknown): string {
  if (!isRecord(payload)) {
    return COMPARE_FALLBACK;
  }

  const descripcion = payload['descripcion'];
  if (typeof descripcion === 'string' && descripcion.trim()) {
    return descripcion.trim();
  }

  const message = payload['message'];
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return COMPARE_FALLBACK;
}
