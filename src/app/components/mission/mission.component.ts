import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  templateUrl: './mission.component.html',
  
  styleUrl: './mission.component.scss'
})
export class MissionComponent {
  values = [
    { icon: 'bi-lightbulb-fill', color: '#6c63ff', title: 'Innovation', desc: 'Constantly pushing boundaries with creative and technological innovations.' },
    { icon: 'bi-star-fill', color: '#00d4ff', title: 'Excellence', desc: 'Delivering exceptional quality in everything we do, every time.' },
    { icon: 'bi-shield-check-fill', color: '#ff6b9d', title: 'Integrity', desc: 'Building trust through transparency, honesty, and ethical practices.' },
    { icon: 'bi-graph-up-arrow', color: '#ffd700', title: 'Results', desc: 'Focused on measurable outcomes that drive real business growth.' }
  ];

  deliveryItems = [
    { icon: 'bi-people-fill', title: 'Expert Team', desc: 'Seasoned professionals who are passionate about delivering excellence.' },
    { icon: 'bi-bar-chart-fill', title: 'Data-Driven', desc: 'Every decision backed by comprehensive analytics and market insights.' },
    { icon: 'bi-rocket-fill', title: 'Innovation', desc: 'Pioneering new technologies and approaches to stay ahead of the curve.' },
    { icon: 'bi-headset', title: 'Client Focus', desc: 'Your success is our priority — we go above and beyond expectations.' },
    { icon: 'bi-check-circle-fill', title: 'Quality Assured', desc: 'Rigorous quality controls ensure every deliverable meets highest standards.' },
    { icon: 'bi-globe', title: 'Global Standards', desc: 'International best practices adapted for regional market nuances.' }
  ];
}
