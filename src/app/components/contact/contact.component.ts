import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { ToastService } from '../../services/toast.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { ConsultationRequest } from '../../services/models';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RevealDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private consultationService = inject(ConsultationService);
  private toast = inject(ToastService);

  submitting = signal(false);

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    companyName: [''],
    estimatedBudget: [''],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  contactInfo = [
    { icon: 'bi-geo-alt-fill', color: '#6c63ff', label: 'Address', value: '123 Digital Hub, Cairo, Egypt' },
    { icon: 'bi-telephone-fill', color: '#00d4ff', label: 'Phone', value: '+20 100 000 0000' },
    { icon: 'bi-envelope-fill', color: '#ff6b9d', label: 'Email', value: 'info@sakemarketing.com' },
    { icon: 'bi-clock-fill', color: '#ffd700', label: 'Working Hours', value: 'Mon - Fri: 9:00 AM - 6:00 PM' }
  ];

  socials = [
    { name: 'Facebook', icon: 'bi-facebook' },
    { name: 'Twitter', icon: 'bi-twitter-x' },
    { name: 'LinkedIn', icon: 'bi-linkedin' },
    { name: 'Instagram', icon: 'bi-instagram' },
    { name: 'WhatsApp', icon: 'bi-whatsapp' }
  ];

  isInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control?.invalid && control.touched);
  }

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const payload = this.contactForm.getRawValue() as ConsultationRequest;
    this.submitting.set(true);
    this.consultationService.submit(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Your message has been sent successfully! We\'ll contact you within 24 hours.');
        this.contactForm.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(getApiErrorMessage(err, 'Failed to send message. Please try again.'));
      }
    });
  }
}
