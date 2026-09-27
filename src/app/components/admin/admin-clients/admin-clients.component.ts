import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { ToastService } from '../../../services/toast.service';
import { getApiErrorMessage } from '../../../services/api-error.util';
import { Client } from '../../../services/models';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.scss'
})
export class AdminClientsComponent implements OnInit, OnDestroy {
  private clientService = inject(ClientService);
  private imageUrl = inject(ImageUrlService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private previewObjectUrl: string | null = null;

  clients = signal<Client[]>([]);
  filtered = signal<Client[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  editingId = signal<number | null>(null);
  deleteTarget = signal<Client | null>(null);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  form = this.fb.group({ name: ['', Validators.required] });

  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.clearPreviewUrl(); }

  load(): void {
    this.loading.set(true);
    this.clientService.getAll().subscribe({
      next: (data) => { this.clients.set(data); this.filtered.set(data); this.loading.set(false); },
      error: (err) => { this.clients.set([]); this.filtered.set([]); this.loading.set(false); this.toast.error(getApiErrorMessage(err, 'Failed to load clients.')); }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.clients().filter(client => client.name.toLowerCase().includes(query)));
  }

  openModal(client?: Client): void {
    this.clearPreviewUrl();
    this.form.reset();
    this.selectedFile.set(null);
    this.editingId.set(client?.id ?? null);
    this.imagePreview.set(client ? this.getImageUrl(client) : null);
    if (client) this.form.patchValue({ name: client.name });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.clearPreviewUrl(); }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.clearPreviewUrl();
    this.selectedFile.set(file);
    this.previewObjectUrl = URL.createObjectURL(file);
    this.imagePreview.set(this.previewObjectUrl);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.editingId() && !this.selectedFile()) { this.toast.error('Please select a client image.'); return; }

    const formData = new FormData();
    formData.append('Name', this.form.value.name!);
    if (this.selectedFile()) formData.append('Image', this.selectedFile()!);

    this.saving.set(true);
    const request = this.editingId() ? this.clientService.update(this.editingId()!, formData) : this.clientService.create(formData);
    request.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); this.toast.success(`Client ${this.editingId() ? 'updated' : 'added'} successfully.`); },
      error: (err) => { this.saving.set(false); this.toast.error(getApiErrorMessage(err, 'Unable to save client.')); }
    });
  }

  confirmDelete(client: Client): void { this.deleteTarget.set(client); this.showDeleteConfirm.set(true); }

  deleteConfirmed(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.saving.set(true);
    this.clientService.delete(target.id).subscribe({
      next: () => { this.saving.set(false); this.showDeleteConfirm.set(false); this.deleteTarget.set(null); this.load(); this.toast.success('Client deleted successfully.'); },
      error: (err) => { this.saving.set(false); this.toast.error(getApiErrorMessage(err, 'Unable to delete client.')); }
    });
  }

  isInvalid(field: string): boolean { const control = this.form.get(field); return !!(control?.invalid && control.touched); }
  getImageUrl(client: Client): string { return this.imageUrl.resolve(client.imageUrl ?? client.image); }

  private clearPreviewUrl(): void {
    if (this.previewObjectUrl) URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = null;
  }
}
