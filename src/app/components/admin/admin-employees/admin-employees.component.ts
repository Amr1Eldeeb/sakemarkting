import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { ToastService } from '../../../services/toast.service';
import { getApiErrorMessage } from '../../../services/api-error.util';
import { Employee } from '../../../services/models';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-employees.component.html',
  styleUrl: './admin-employees.component.scss'
})
export class AdminEmployeesComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private imageUrl = inject(ImageUrlService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  employees = signal<Employee[]>([]);
  filtered = signal<Employee[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  saving = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  editingId = signal<number | null>(null);
  deleteTarget = signal<Employee | null>(null);
  selectedFile = signal<File | null>(null);

  form = this.fb.group({
    fullName: ['', Validators.required],
    subTitle: ['', Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.filtered.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.employees.set([]);
        this.filtered.set([]);
        this.loading.set(false);
        this.loadError.set(getApiErrorMessage(err, 'Failed to load employees.'));
        this.toast.error(this.loadError()!);
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(
      this.employees().filter((employee) => employee.fullName.toLowerCase().includes(query))
    );
  }

  openModal(employee?: Employee): void {
    this.form.reset();
    this.selectedFile.set(null);
    if (employee) {
      this.editingId.set(employee.id);
      this.form.patchValue({ fullName: employee.fullName, subTitle: employee.subTitle });
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
    formData.append('fullName', this.form.value.fullName!);
    formData.append('subTitle', this.form.value.subTitle!);
    if (this.selectedFile()) {
      formData.append('image', this.selectedFile()!);
    }

    const request = this.editingId()
      ? this.employeeService.update(this.editingId()!, formData)
      : this.employeeService.create(formData);

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

  confirmDelete(employee: Employee): void {
    this.deleteTarget.set(employee);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmed(): void {
    if (!this.deleteTarget()) {
      return;
    }

    this.saving.set(true);
    this.employeeService.delete(this.deleteTarget()!.id).subscribe({
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
