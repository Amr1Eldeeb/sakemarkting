import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {
  @Output() loadingDone = new EventEmitter<void>();

  displayText = '';
  progress = 0;
  fadeOut = false;
  particles: { style: string }[] = [];

  private fullText = 'Sake Marketing Solutions';
  private typingSpeed = 80;

  ngOnInit(): void {
    this.generateParticles();
    this.startTyping();
    this.startProgress();
  }

  private generateParticles(): void {
    this.particles = Array.from({ length: 15 }, () => ({
      style: `
        width: ${Math.random() * 6 + 2}px;
        height: ${Math.random() * 6 + 2}px;
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 6 + 4}s;
        animation-delay: ${Math.random() * 3}s;
        background: ${['#6c63ff', '#00d4ff', '#ff6b9d'][Math.floor(Math.random() * 3)]};
      `
    }));
  }

  private startTyping(): void {
    let i = 0;
    const type = () => {
      if (i < this.fullText.length) {
        this.displayText = this.fullText.substring(0, ++i);
        setTimeout(type, this.typingSpeed);
      }
    };
    setTimeout(type, 600);
  }

  private startProgress(): void {
    const interval = setInterval(() => {
      this.progress += 1.5;
      if (this.progress >= 100) {
        clearInterval(interval);
        this.progress = 100;
        setTimeout(() => {
          this.fadeOut = true;
          setTimeout(() => this.loadingDone.emit(), 800);
        }, 400);
      }
    }, 40);
  }
}
