import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-vision',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  templateUrl: './vision.component.html',
  
  styleUrl: './vision.component.scss'
})
export class VisionComponent {
  goals = [
    { year: '2025', color: '#6c63ff', icon: 'bi-globe', title: 'Regional Leadership', desc: 'Become the #1 digital agency in MENA with presence in 15+ countries.' },
    { year: '2026', color: '#00d4ff', icon: 'bi-robot', title: 'AI-Powered Platform', desc: 'Launch proprietary AI marketing analytics and automation tools.' },
    { year: '2027', color: '#ff6b9d', icon: 'bi-people-fill', title: '1000+ Clients', desc: 'Serve over 1000 satisfied clients across all major industry verticals.' },
    { year: '2028', color: '#ffd700', icon: 'bi-building', title: 'Global Expansion', desc: 'Open offices in London, New York, and Dubai.' }
  ];

  futureItems = [
    { icon: 'bi-cpu-fill', color: '#6c63ff', title: 'AI & Machine Learning', desc: 'Integrating AI-powered solutions to revolutionize digital marketing strategies.' },
    { icon: 'bi-globe2', color: '#00d4ff', title: 'Global Impact', desc: 'Transforming businesses across 20+ countries with cutting-edge digital solutions.' },
    { icon: 'bi-people-fill', color: '#ff6b9d', title: 'Talent Development', desc: 'Building the largest digital talent hub to nurture the next generation of experts.' },
    { icon: 'bi-shield-check-fill', color: '#ffd700', title: 'Trust & Security', desc: 'Maintaining the highest standards of data security and client confidentiality.' },
    { icon: 'bi-leaf-fill', color: '#00c864', title: 'Sustainability', desc: 'Committed to sustainable business practices and positive social impact.' },
    { icon: 'bi-star-fill', color: '#ff8c42', title: 'Excellence', desc: 'Never settling for anything less than exceptional in everything we deliver.' }
  ];
}
