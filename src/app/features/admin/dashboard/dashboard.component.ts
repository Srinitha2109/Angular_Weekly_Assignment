import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div class="mb-10 px-2">
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            EdTech Admin
          </h1>
        </div>

        <nav class="flex-1 space-y-2">
          <a routerLink="/admin" routerLinkActive="bg-primary-50 text-primary-600" [routerLinkActiveOptions]="{exact: true}" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg"></span> Dashboard
          </a>
          <a routerLink="trainers" routerLinkActive="bg-primary-50 text-primary-600" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg"></span> Trainers
          </a>
          <a routerLink="enrollments" routerLinkActive="bg-primary-50 text-primary-600" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg"></span> Enrollments
          </a>
          <a routerLink="finance" routerLinkActive="bg-primary-50 text-primary-600" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg"></span> Finance
          </a>
        </nav>

        <div class="mt-auto pt-6 border-t border-slate-100">
          <button (click)="auth.logout()" class="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <span class="mr-3 text-lg">🚪</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-8 max-w-7xl mx-auto">
          <header class="mb-8">
            <h2 class="text-2xl font-bold text-slate-800">Hello, {{ auth.currentUser()?.name }}!</h2>
            <p class="text-slate-500">System overview and management.</p>
          </header>

          <div *ngIf="isDashboardHome()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <!-- Total Revenue Card -->
            <div class="group relative backdrop-blur-md bg-white/70 p-6 rounded-3xl shadow-sm border border-white/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div class="flex justify-between items-start mb-4">
              </div>
              <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1">₹{{ totalRevenue() | number:'1.0-0' }}</h3>
              
              <!-- Horizontal Bar -->
              <div class="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full w-[75%] group-hover:w-[85%] transition-all duration-700"></div>
              </div>
            </div>

            <!-- Active Trainings Card -->
            <div class="group relative backdrop-blur-md bg-white/70 p-6 rounded-3xl shadow-sm border border-white/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full uppercase tracking-widest">Running</span>
              </div>
              <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Trainings</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1">{{ activeTrainings() }}</h3>
              
              <!-- Horizontal Bar -->
              <div class="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-primary-400 to-indigo-500 rounded-full w-[0%] group-hover:w-[70%] transition-all duration-700"></div>
              </div>
            </div>

            <!-- Pending Requests Card -->
            <div class="group relative backdrop-blur-md bg-white/70 p-6 rounded-3xl shadow-sm border border-white/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-widest">Priority</span>
              </div>
              <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Requests</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1">{{ pendingRequests() }}</h3>
              
              <!-- Horizontal Bar -->
              <div class="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-[0%] group-hover:w-[55%] transition-all duration-700"></div>
              </div>
            </div>

            <!-- Total Trainers Card -->
            <div class="group relative backdrop-blur-md bg-white/70 p-6 rounded-3xl shadow-sm border border-white/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-bold text-secondary-600 bg-secondary-50 px-2 py-1 rounded-full uppercase tracking-widest">Freelance</span>
              </div>
              <p class="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Trainers</p>
              <h3 class="text-2xl font-black text-slate-800 mt-1">{{ totalTrainers() }}</h3>
              
              <!-- Horizontal Bar -->
              <div class="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-secondary-400 to-rose-500 rounded-full w-[30%] group-hover:w-[90%] transition-all duration-700"></div>
              </div>
            </div>
          </div>

          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  trainers = signal<any[]>([]);
  trainings = signal<any[]>([]);

  totalRevenue = computed(() => this.trainings().reduce((acc, curr) => acc + (curr.budget || 0), 0));
  activeTrainings = computed(() => this.trainings().filter(e => e.status === 'Active').length);
  pendingRequests = computed(() => this.trainings().filter(e => e.status === 'Requested').length);
  totalTrainers = computed(() => this.trainers().length);

  constructor(public auth: AuthService, private data: DataService, private router: Router) { }

  ngOnInit() {
    this.data.get<any[]>('trainers').subscribe(d => this.trainers.set(d));
    this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
  }

  isDashboardHome() {
    return this.router.url === '/admin';
  }
}
