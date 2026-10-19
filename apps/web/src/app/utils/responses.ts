import { ServiceResponse } from '../models/services';

export const ok = <T>(data: T, message = 'Request successful'): ServiceResponse<T> => ({
  success: true,
  data,
  message,
});

export const fail = <T>(message = 'Request failed'): ServiceResponse<T> => ({
  success: false,
  data: null as T,
  message,
});