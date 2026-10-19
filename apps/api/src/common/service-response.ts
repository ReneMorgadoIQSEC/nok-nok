export interface ServiceResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

export function ok<T>(data: T | null = null, message = 'OK'): ServiceResponse<T> {
  return { success: true, data, message };
}

export function fail(message: string, data: unknown = null): ServiceResponse {
  return { success: false, data, message };
}
