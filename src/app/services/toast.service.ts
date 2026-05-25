import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'info', message: string): void {
    const id = Math.random().toString(36).substring(2);
    const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
    const toast: ToastMessage = { id, type, message, icon: icons[type] };
    this.toasts.update(t => [...t, toast]);
    setTimeout(() => this.remove(id), 4500);
  }

  remove(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  success(msg: string) { this.show('success', msg); }
  error(msg: string) { this.show('error', msg); }
  info(msg: string) { this.show('info', msg); }
}
