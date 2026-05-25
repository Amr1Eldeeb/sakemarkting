import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ServiceApiService } from '../../../services/service-api.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { ToastService } from '../../../services/toast.service';
import { getApiErrorMessage } from '../../../services/api-error.util';
import { MarketingService } from '../../../services/models';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-services.component.html',
  styleUrl: './admin-services.component.scss'
})
export class AdminServicesComponent implements OnInit {
  private serviceApi = inject(ServiceApiService);
  private imageUrl = inject(ImageUrlService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  services = signal<MarketingService[]>([]);
  filtered = signal<MarketingService[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  saving = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  editingId = signal<number | null>(null);
  deleteTarget = signal<MarketingService | null>(null);
  selectedFile = signal<File | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.serviceApi.getAll().subscribe({
      next: (data) => {
        this.services.set(data);
        this.filtered.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.services.set([]);
        this.filtered.set([]);
        this.loading.set(false);
        this.loadError.set(getApiErrorMessage(err, 'Failed to load services.'));
        this.toast.error(this.loadError()!);
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.services().filter((service) => service.name.toLowerCase().includes(query)));
  }

  openModal(service?: MarketingService): void {
    this.form.reset();
    this.selectedFile.set(null);
    if (service) {
      this.editingId.set(service.id);
      this.form.patchValue({ name: service.name, description: service.description });
    } else {
      this.editingId.set(null);
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formData = new FormData();
    formData.append('name', this.form.value.name!);
    formData.append('description', this.form.value.description!);
    if (this.selectedFile()) {
      formData.append('image', this.selectedFile()!);
    }

    const request = this.editingId()
      ? this.serviceApi.update(this.editingId()!, formData)
      : this.serviceApi.create(formData);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
        this.toast.success('Item saved successfully');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(getApiErrorMessage(err, 'An error occurred. Please try again.'));
      }
    });
  }

  confirmDelete(service: MarketingService): void {
    this.deleteTarget.set(service);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget()) {
      return;
    }

    this.saving.set(true);
    this.serviceApi.delete(this.deleteTarget()!.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.showDeleteConfirm.set(false);
        this.load();
        this.toast.success('Item deleted successfully');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(getApiErrorMessage(err, 'An error occurred. Please try again.'));
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }

  getImageUrl(url: string): string {
    return this.imageUrl.resolve(url);
  }
}
