import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  userName: string = '';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.userName = savedName;
      this.cdr.detectChanges();
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');

    this.router.navigate(['/login']);
    this.cdr.detectChanges();

  }
}
