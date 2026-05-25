import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealDirective],
  templateUrl: './about.component.html',
  
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  timeline = [
    { year: '2016', title: 'Company Founded', desc: 'Sake Marketing Solutions was founded with a vision to redefine digital marketing.' },
    { year: '2018', title: 'Regional Expansion', desc: 'Expanded operations to cover the entire MENA region with 50+ clients.' },
    { year: '2020', title: 'ISO Certification', desc: 'Achieved ISO 9001 certification for quality management excellence.' },
    { year: '2022', title: 'Global Reach', desc: 'Extended services to Europe and North America with 200+ active clients.' },
    { year: '2024', title: 'AI Integration', desc: 'Launched AI-powered marketing analytics platform for our clients.' }
  ];

  goals = [
    { icon: 'bi-globe', color: '#6c63ff', title: 'Global Reach', desc: 'Serve clients across 20+ countries with tailored digital strategies.' },
    { icon: 'bi-graph-up-arrow', color: '#00d4ff', title: 'Drive Growth', desc: 'Deliver measurable ROI and sustainable business growth.' },
    { icon: 'bi-lightbulb-fill', color: '#ff6b9d', title: 'Innovate', desc: 'Stay ahead with cutting-edge technology and creative solutions.' },
    { icon: 'bi-heart-fill', color: '#ffd700', title: 'Build Trust', desc: 'Earn lasting partnerships through integrity and excellence.' }
  ];

  achievements = [
    { icon: 'bi-trophy-fill', color: '#6c63ff', value: '500+', label: 'Projects Completed' },
    { icon: 'bi-people-fill', color: '#00d4ff', value: '300+', label: 'Happy Clients' },
    { icon: 'bi-award-fill', color: '#ff6b9d', value: '25+', label: 'Industry Awards' },
    { icon: 'bi-star-fill', color: '#ffd700', value: '5.0', label: 'Average Rating' }
  ];
}
