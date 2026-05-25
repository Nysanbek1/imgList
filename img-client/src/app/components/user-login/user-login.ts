import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../servis/user.servis';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './user-login.html',
  styleUrl: './user-login.scss',
})
export class UserLogin implements OnInit{
  formLoginUser!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formLoginUser = this.fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.formLoginUser.valid) {
      this.userService.loginUser(this.formLoginUser.value).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']); 
        },
        error: (err) => {
          console.error('Ошибка авторизации:', err);
        }
      });
    }
  }
}
