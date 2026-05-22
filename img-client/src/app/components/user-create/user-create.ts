import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../servis/user.servis';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// 1. Создаем функцию-валидатор для совпадения полей
export const matchPasswordsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const passwordTwo = control.get('passwordTwo');

  // Если поля еще не инициализированы или пустые, не ругаемся
  if (!password || !passwordTwo || !password.value || !passwordTwo.value) {
    return null;
  }

  // Если значения не совпадают, возвращаем объект ошибки
  return password.value === passwordTwo.value ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss',
})
export class UserCreate implements OnInit {
  formCreateUser!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formCreateUser = this.fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordTwo: ['', [Validators.required, Validators.minLength(6)]]
    }, { 
      validators: matchPasswordsValidator 
    });
  }

  onSubmit(): void {
    if (this.formCreateUser.valid) {
      const signupData = {
        name: this.formCreateUser.value.name,
        password: this.formCreateUser.value.password
      };

      this.userService.createUser(signupData).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          alert(err.error?.message || 'Ошибка регистрации');
        }
      });
    }
  }
}