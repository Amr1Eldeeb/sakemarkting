import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { ImageUrlService } from '../../services/image-url.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { Employee } from '../../services/models';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private imageUrl = inject(ImageUrlService);

  employees = signal<Employee[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.employees.set([]);
        this.loading.set(false);
        this.error.set(getApiErrorMessage(err, 'Failed to load team members.'));
      }
    });
  }

  getImageUrl(url: string): string {
    return this.imageUrl.resolve(url);
  }
}
