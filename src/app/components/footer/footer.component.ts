import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  
  styleUrl: './footer.component.scss'
})
export class FooterComponent {  currentYear = new Date().getFullYear();
isLoggedIn = !!localStorage.getItem('token');
}
