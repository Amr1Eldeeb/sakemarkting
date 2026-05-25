import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceApiService } from '../../services/service-api.service';
import { ImageUrlService } from '../../services/image-url.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { MarketingService } from '../../services/models';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealDirective],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  private serviceApi = inject(ServiceApiService);
  private imageUrl = inject(ImageUrlService);

  services = signal<MarketingService[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.serviceApi.getAll().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.services.set([]);
        this.loading.set(false);
        this.error.set(getApiErrorMessage(err, 'Failed to load services.'));
      }
    });
  }

  getImageUrl(url: string): string {
    return this.imageUrl.resolve(url);
  }

  getColor(i: number): string {
    return ['#6c63ff', '#00d4ff', '#ff6b9d', '#ffd700', '#00c864', '#ff8c42'][i % 6];
  }

  getIcon(i: number): string {
    return ['bi-globe', 'bi-megaphone-fill', 'bi-search', 'bi-palette-fill', 'bi-share-fill', 'bi-phone-fill'][i % 6];
  }
}
