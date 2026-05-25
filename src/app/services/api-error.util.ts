import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Cannot reach the server. Make sure the API is running and CORS is enabled.';
    }
    const body = error.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object') {
      const msg = (body as { message?: string; title?: string; detail?: string }).message
        ?? (body as { title?: string }).title
        ?? (body as { detail?: string }).detail;
      if (msg) return msg;
    }
    if (error.status === 401) return 'Invalid email or password.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status === 404) return 'The requested resource was not found.';
  }
  return fallback;
}
