import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

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

        <div class="mt-6 text-center">
           <button (click)="openRequestModal()" class="text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">
              New here? Send registration request to admin →
           </button>
        </div>

        <!-- Registration Request Modal -->
        <div *ngIf="showRequestModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div class="bg-white rounded-3xl  w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
              <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 class="text-xl font-bold text-slate-800">Registration Request</h3>
                 <button (click)="showRequestModal.set(false)" class="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form (ngSubmit)="submitRequest()" #requestForm="ngForm" class="p-8 space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" name="reqName" [(ngModel)]="newRequest.name" required placeholder="John Doe">
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" name="reqEmail" [(ngModel)]="newRequest.email" required placeholder="john@example.com">
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Requested Role</label>
                    <select name="reqRole" [(ngModel)]="newRequest.role" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
                       <option value="TRAINER">Trainer</option>
                       <option value="CLIENT">Client</option>
                    </select>
                 </div>
                 <div *ngIf="newRequest.role === 'TRAINER'">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Tech Stack</label>
                    <input type="text" name="reqTech" [(ngModel)]="newRequest.techStack" placeholder="Angular, React, etc.">
                 </div>
                 <div *ngIf="newRequest.role === 'CLIENT'">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                    <input type="text" name="reqCompany" [(ngModel)]="newRequest.company" placeholder="Tech Corp">
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Brief Introduction</label>
                    <textarea name="reqBio" [(ngModel)]="newRequest.bio" rows="3" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" placeholder="Tell us about yourself or your organization..."></textarea>
                 </div>

                 <div class="flex gap-4 pt-4">
                    <button type="button" (click)="showRequestModal.set(false)" class="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                       Cancel
                    </button>
                    <button type="submit" [disabled]="!requestForm.form.valid || submitting()" class="flex-1 btn-primary">
                       {{ submitting() ? 'Sending...' : 'Send Request' }}
                    </button>
                 </div>
              </form>
           </div>
        </div>

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

  showRequestModal = signal(false);
  submitting = signal(false);
  newRequest = {
    name: '',
    email: '',
    role: 'TRAINER' as 'TRAINER' | 'CLIENT',
    techStack: '',
    company: '',
    bio: ''
  };

  constructor(private authService: AuthService, private router: Router, private data: DataService) { }

  openRequestModal() {
    this.newRequest = { name: '', email: '', role: 'TRAINER', techStack: '', company: '', bio: '' };
    this.showRequestModal.set(true);
  }

  submitRequest() {
    this.submitting.set(true);
    const request = {
      ...this.newRequest,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      timestamp: new Date().toISOString()
    };

    this.data.post('registrationRequests', request).subscribe(() => {
      alert('Request sent successfully! Admin will review your request and get back to you via email.');
      this.showRequestModal.set(false);
      this.submitting.set(false);
    });
  }

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
