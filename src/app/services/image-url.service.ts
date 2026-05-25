import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageUrlService {
  resolve(url: string | null | undefined): string {
    if (!url?.trim()) {
      return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${environment.imageBaseUrl}${path}`;
  }
}
