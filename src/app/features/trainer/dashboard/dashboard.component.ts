import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div class="mb-10 px-2">
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Trainer Portal
          </h1>
        </div>

        <nav class="flex-1 space-y-2">
          <a routerLink="/trainer" routerLinkActive="bg-primary-50 text-primary-600" [routerLinkActiveOptions]="{exact: true}" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg">📊</span> Dashboard
          </a>
          <a routerLink="assignments" routerLinkActive="bg-primary-50 text-primary-600" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg">📚</span> My Trainings
          </a>
          <a routerLink="invoices" routerLinkActive="bg-primary-50 text-primary-600" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg">📄</span> My Invoices
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
            <h2 class="text-2xl font-bold text-slate-800">Welcome, {{ auth.currentUser()?.name }}!</h2>
            <p class="text-slate-500">Track your trainings and payments.</p>
          </header>

          <div *ngIf="isDashboardHome()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p class="text-slate-500 text-sm font-medium">Active Assignments</p>
              <p class="text-2xl font-bold text-slate-800 mt-2">{{ activeAssignments() }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p class="text-slate-500 text-sm font-medium">Pending PO Acceptance</p>
              <p class="text-2xl font-bold text-slate-800 mt-2 text-indigo-600">{{ pendingInvoices() }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p class="text-slate-500 text-sm font-medium">Completed Sessions</p>
              <p class="text-2xl font-bold text-slate-800 mt-2 text-green-600">{{ completedAssignments() }}</p>
            </div>
          </div>

          <router-outlet></router-outlet>
          
          <div *ngIf="isDashboardHome() && activeAssignments() === 0" class="mt-8 bg-white/60 backdrop-blur-md p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div class="text-5xl mb-6">🚀</div>
             <h3 class="text-2xl font-black text-slate-800">Ready to Start Teaching?</h3>
             <p class="text-slate-500 max-w-sm mx-auto mt-4 text-base">You don't have any active assignments yet. Once an administrator assigns you to a training, you'll see it here.</p>
             <div class="mt-8">
                <a routerLink="assignments" class="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-slate-200">
                   Check for Requests
                </a>
             </div>
          </div>
          
          <div *ngIf="isDashboardHome() && activeAssignments() > 0" class="mt-8 bg-white/60 backdrop-blur-md p-10 rounded-3xl border border-slate-100 text-center">
             <div class="text-4xl mb-4">📚</div>
             <h3 class="text-xl font-bold text-slate-800">You have active trainings!</h3>
             <p class="text-slate-500 mt-2">Head over to the assignments tab to manage your sessions and mark them as completed.</p>
          </div>
        </div>
      </main>
    </div>
  `
})
export class TrainerDashboardComponent implements OnInit {
  trainings = signal<any[]>([]);

  activeAssignments = computed(() => this.trainings().filter(e => e.status === 'Active' && e.trainerId === this.auth.currentUser()?.id).length);
  completedAssignments = computed(() => this.trainings().filter(e => e.status === 'Completed' && e.trainerId === this.auth.currentUser()?.id).length);
  pendingInvoices = computed(() => this.trainings().filter(i => i.status === 'Trainer Assigned' && i.trainerId === this.auth.currentUser()?.id).length);

  constructor(public auth: AuthService, private data: DataService, private router: Router) { }

  ngOnInit() {
    this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
  }

  isDashboardHome() {
    return this.router.url === '/trainer';
  }
}
