import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="max-w-md w-full backdrop-blur-md bg-white/70 p-8 rounded-2xl shadow-xl border border-white/30 transition-all hover:shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            EdTech Financials
          </h1>
          <p class="text-slate-500 mt-2">Manage trainings and invoices with ease</p>
        </div>

        <div class="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button 
            type="button"
            (click)="selectedRole.set('ADMIN')"
            [class]="selectedRole() === 'ADMIN' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'"
            class="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all"
          >
            Admin
          </button>
          <button 
            type="button"
            (click)="selectedRole.set('CLIENT')"
            [class]="selectedRole() === 'CLIENT' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'"
            class="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all"
          >
            Client
          </button>
          <button 
            type="button"
            (click)="selectedRole.set('TRAINER')"
            [class]="selectedRole() === 'TRAINER' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'"
            class="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all"
          >
            Trainer
          </button>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              [(ngModel)]="email" 
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="user@edutech.com"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              [(ngModel)]="password" 
              required
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            >
          </div>

          <p *ngIf="error()" class="text-red-500 text-sm text-center">{{ error() }}</p>

          <button 
            type="submit" 
            [disabled]="loading() || !loginForm.form.valid"
            class="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {{ loading() ? 'Signing in...' : 'Sign In as ' + selectedRole().toLowerCase() }}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
            <p class="text-xs text-slate-400">
                Demo: admin@edutech.com / client@techcorp.com / trainer@edutech.com
            </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  selectedRole = signal<'ADMIN' | 'CLIENT' | 'TRAINER'>('ADMIN');
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: (users) => {
        const user = users.find(u => u.role === this.selectedRole());
        if (user) {
          this.router.navigate([user.role.toLowerCase()]);
        } else {
          this.error.set(`Invalid ${this.selectedRole().toLowerCase()} credentials`);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Something went wrong. Is JSON Server running on port 5000?');
        this.loading.set(false);
      }
    });
  }
}
