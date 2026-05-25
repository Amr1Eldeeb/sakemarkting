import { Component, OnInit, OnDestroy, inject, signal, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { ServiceApiService } from '../../services/service-api.service';
import { ConsultationService } from '../../services/consultation.service';
import { ImageUrlService } from '../../services/image-url.service';
import { ToastService } from '../../services/toast.service';
import { getApiErrorMessage } from '../../services/api-error.util';
import { Employee, MarketingService, ConsultationRequest } from '../../services/models';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private employeeService = inject(EmployeeService);
  private serviceApi = inject(ServiceApiService);
  private consultationService = inject(ConsultationService);
  private imageUrl = inject(ImageUrlService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  typingTexts = ['Digital Marketing', 'Web Development', 'Branding & SEO', 'Creative Agency'];
  currentTypingText = signal('');
  private typingInterval: ReturnType<typeof setInterval> | undefined;

  services = signal<MarketingService[]>([]);
  employees = signal<Employee[]>([]);
  servicesLoading = signal(true);
  employeesLoading = signal(true);
  servicesError = signal<string | null>(null);
  employeesError = signal<string | null>(null);

  counters = [
    { label: 'Projects Completed', icon: 'bi-trophy-fill', value: 0, target: 500, suffix: '+', color: '#6c63ff' },
    { label: 'Happy Clients', icon: 'bi-people-fill', value: 0, target: 300, suffix: '+', color: '#00d4ff' },
    { label: 'Team Members', icon: 'bi-person-workspace', value: 0, target: 50, suffix: '+', color: '#ff6b9d' },
    { label: 'Years Experience', icon: 'bi-star-fill', value: 0, target: 8, suffix: '+', color: '#ffd700' }
  ];

  faqItems = [
    { q: 'What services does Sake Marketing Solutions offer?', a: 'We offer a comprehensive suite of digital services including web development, digital marketing, branding, SEO, social media management, content creation, and mobile app development.', open: false },
    { q: 'How long does a typical project take?', a: 'Project timelines vary based on complexity and scope. A typical website takes 4-8 weeks, while comprehensive marketing campaigns are planned on a monthly basis. We always provide detailed timelines upfront.', open: false },
    { q: 'Do you work with international clients?', a: 'Absolutely! We work with clients globally. Our team is experienced in handling projects across different time zones and cultures.', open: false },
    { q: 'What makes Sake Marketing different from other agencies?', a: 'Our unique combination of deep regional expertise, international standards, data-driven approach, and commitment to measurable results sets us apart.', open: false },
    { q: 'How do you handle project communication?', a: 'We assign a dedicated project manager to each client and maintain regular communication through weekly reports, milestone meetings, and an always-available support channel.', open: false },
    { q: 'What is your pricing model?', a: 'We offer flexible pricing models including project-based, monthly retainer, and custom enterprise packages. Contact us for a free consultation and tailored quote.', open: false }
  ];

  testimonials = [
    { name: 'Ahmed Al-Rashid', company: 'TechCorp Arabia', text: 'Sake Marketing transformed our digital presence completely. Our online revenue grew by 300% within 6 months!', rating: 5, avatar: 'A' },
    { name: 'Sarah Johnson', company: 'Global Ventures LLC', text: 'Absolutely world-class service. Their team is professional, creative, and delivers beyond expectations every time.', rating: 5, avatar: 'S' },
    { name: 'Omar Al-Farsi', company: 'InnoTech Solutions', text: 'The best digital agency we\'ve ever worked with. Outstanding results, exceptional communication, and brilliant creativity.', rating: 5, avatar: 'O' },
    { name: 'Maria Santos', company: 'Santos Brands', text: 'Professional, innovative, and results-driven. Sake Marketing is our go-to partner for all digital needs.', rating: 5, avatar: 'M' }
  ];

  technologies = [
    { name: 'Angular', icon: 'bi-bootstrap', color: '#dd0031', bg: 'rgba(221,0,49,0.1)' },
    { name: '.NET', icon: 'bi-microsoft', color: '#512bd4', bg: 'rgba(81,43,212,0.1)' },
    { name: 'SQL Server', icon: 'bi-database-fill', color: '#00758f', bg: 'rgba(0,117,143,0.1)' },
    { name: 'Azure', icon: 'bi-cloud-fill', color: '#0078d4', bg: 'rgba(0,120,212,0.1)' },
    { name: 'Docker', icon: 'bi-box-fill', color: '#2496ed', bg: 'rgba(36,150,237,0.1)' },
    { name: 'Bootstrap', icon: 'bi-bootstrap-fill', color: '#7952b3', bg: 'rgba(121,82,179,0.1)' },
    { name: 'Firebase', icon: 'bi-fire', color: '#ffca28', bg: 'rgba(255,202,40,0.1)' },
    { name: 'GitHub', icon: 'bi-github', color: '#ffffff', bg: 'rgba(255,255,255,0.05)' }
  ];

  processSteps = [
    { num: '01', icon: 'bi-lightbulb-fill', title: 'Planning', desc: 'Deep dive into your goals and requirements to craft a winning strategy.', color: '#6c63ff' },
    { num: '02', icon: 'bi-pen-fill', title: 'Design', desc: 'Creating stunning, user-focused designs that captivate your audience.', color: '#00d4ff' },
    { num: '03', icon: 'bi-code-slash', title: 'Development', desc: 'Building robust, scalable solutions with cutting-edge technology.', color: '#ff6b9d' },
    { num: '04', icon: 'bi-shield-check-fill', title: 'Testing', desc: 'Rigorous quality assurance to ensure flawless performance.', color: '#ffd700' },
    { num: '05', icon: 'bi-rocket-fill', title: 'Launch', desc: 'Smooth deployment and ongoing support for your success.', color: '#00c864' }
  ];

  whyUsItems = [
    { icon: 'bi-people-fill', title: 'Expert Team', desc: 'Seasoned professionals with years of industry experience.' },
    { icon: 'bi-graph-up-arrow', title: 'Proven Results', desc: 'Track record of delivering measurable business outcomes.' },
    { icon: 'bi-headset', title: '24/7 Support', desc: 'Round-the-clock dedicated support for all your needs.' },
    { icon: 'bi-lightbulb-fill', title: 'Innovation First', desc: 'Always at the forefront of digital innovation and trends.' },
    { icon: 'bi-clock-fill', title: 'On-Time Delivery', desc: 'We meet deadlines without compromising on quality.' },
    { icon: 'bi-currency-dollar', title: 'Competitive Pricing', desc: 'Premium quality solutions at competitive market prices.' }
  ];

  clients = ['DeepSoluations', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Adobe', 'Salesforce', 'Oracle'];

  consultForm!: FormGroup;
  submitting = signal(false);

  activeTestimonial = signal(0);
  private testimonialInterval: ReturnType<typeof setInterval> | undefined;

  achievements = ['Award-Winning Agency', 'ISO Certified', 'Global Reach'];
  particles: { style: Record<string, string> }[] = [];

  ngOnInit(): void {
    this.loadServices();
    this.loadEmployees();
    this.initForm();
    this.startTyping();
    this.startTestimonialSlider();
    this.generateParticles();
    this.initCounters();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
  }

  getImageUrl(url: string): string {
    return this.imageUrl.resolve(url);
  }

  private generateParticles(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.particles = Array.from({ length: 20 }, () => ({
      style: {
        width: `${Math.random() * 4 + 2}px`,
        height: `${Math.random() * 4 + 2}px`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 10 + 8}s`,
        animationDelay: `${Math.random() * 5}s`,
        background: ['#6c63ff', '#00d4ff', '#ff6b9d'][Math.floor(Math.random() * 3)]
      }
    }));
  }

  private startTyping(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    let charIndex = 0;
    let deleting = false;
    let textIdx = 0;

    this.typingInterval = setInterval(() => {
      const current = this.typingTexts[textIdx];
      if (!deleting) {
        this.currentTypingText.set(current.substring(0, ++charIndex));
        if (charIndex >= current.length) deleting = true;
      } else {
        this.currentTypingText.set(current.substring(0, --charIndex));
        if (charIndex === 0) {
          deleting = false;
          textIdx = (textIdx + 1) % this.typingTexts.length;
        }
      }
    }, 100);
  }

  private initCounters(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.counters.forEach(counter => {
            const duration = 2000;
            const step = counter.target / (duration / 16);
            const interval = setInterval(() => {
              counter.value = Math.min(counter.value + Math.ceil(step), counter.target);
              if (counter.value >= counter.target) clearInterval(interval);
            }, 16);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    setTimeout(() => {
      const el = document.getElementById('counters-section');
      if (el) observer.observe(el);
    }, 500);
  }

  private loadServices(): void {
    this.servicesLoading.set(true);
    this.servicesError.set(null);
    this.serviceApi.getAll().subscribe({
      next: (data) => {
        this.services.set(data.slice(0, 6));
        this.servicesLoading.set(false);
      },
      error: (err) => {
        this.services.set([]);
        this.servicesLoading.set(false);
        this.servicesError.set(getApiErrorMessage(err, 'Failed to load services.'));
      }
    });
  }

  private loadEmployees(): void {
    this.employeesLoading.set(true);
    this.employeesError.set(null);
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees.set(data.slice(0, 8));
        this.employeesLoading.set(false);
      },
      error: (err) => {
        this.employees.set([]);
        this.employeesLoading.set(false);
        this.employeesError.set(getApiErrorMessage(err, 'Failed to load team members.'));
      }
    });
  }

  private initForm(): void {
    this.consultForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      companyName: [''],
      estimatedBudget: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private startTestimonialSlider(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.testimonialInterval = setInterval(() => {
      this.activeTestimonial.set((this.activeTestimonial() + 1) % this.testimonials.length);
    }, 5000);
  }

  submitConsultation(): void {
    if (this.consultForm.invalid) {
      this.consultForm.markAllAsTouched();
      return;
    }

    const payload = this.consultForm.getRawValue() as ConsultationRequest;
    this.submitting.set(true);
    this.consultationService.submit(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Your consultation request has been sent successfully! We\'ll contact you within 24 hours.');
        this.consultForm.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(getApiErrorMessage(err, 'Failed to send request. Please try again.'));
      }
    });
  }

  toggleFaq(index: number): void {
    this.faqItems = this.faqItems.map((item, i) => ({
      ...item,
      open: i === index ? !item.open : false
    }));
  }

  setTestimonial(i: number): void {
    this.activeTestimonial.set(i);
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
    this.startTestimonialSlider();
  }

  getServiceIcon(index: number): string {
    const icons = ['bi-globe', 'bi-megaphone-fill', 'bi-search', 'bi-palette-fill', 'bi-share-fill', 'bi-phone-fill'];
    return icons[index % icons.length];
  }

  getServiceColor(index: number): string {
    const colors = ['#6c63ff', '#00d4ff', '#ff6b9d', '#ffd700', '#00c864', '#ff8c42'];
    return colors[index % colors.length];
  }

  isInvalid(field: string): boolean {
    const ctrl = this.consultForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
