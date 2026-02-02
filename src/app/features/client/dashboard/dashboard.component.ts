import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div class="mb-10 px-2">
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Client Portal
          </h1>
        </div>

        <nav class="flex-1 space-y-2">
          <a routerLink="/client" routerLinkActive="bg-primary-50 text-primary-600" [routerLinkActiveOptions]="{exact: true}" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg"></span> Dashboard
          </a>
          <a routerLink="requests" routerLinkActive="bg-primary-50 text-primary-600" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg"></span> My Requests
          </a>
          <a routerLink="invoices" routerLinkActive="bg-primary-50 text-primary-600" class="flex items-center px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <span class="mr-3 text-lg"></span> Invoices
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
          <header class="mb-8 flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-slate-800">Welcome, {{ auth.currentUser()?.name }}!</h2>
              <p class="text-slate-500">Track and manage your training requests.</p>
            </div>
            <div class="flex items-center gap-4">
               <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span class="text-sm font-medium text-slate-600">Account Active</span>
               </div>
            </div>
          </header>

          <div *ngIf="isDashboardHome()">
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p class="text-slate-500 text-sm font-medium">Total Requests</p>
                <p class="text-2xl font-bold text-slate-800 mt-2">{{ myTrainings().length }}</p>
              </div>
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p class="text-slate-500 text-sm font-medium">Active Trainings</p>
                <p class="text-2xl font-bold text-slate-800 mt-2">{{ activeTrainings() }}</p>
              </div>
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p class="text-slate-500 text-sm font-medium">Notifications</p>
                <p class="text-2xl font-bold text-slate-800 mt-2">{{ notifications().length }}</p>
              </div>
            </div>

            <!-- Dashboard Home Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div class="lg:col-span-2 space-y-6">
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <span class="mr-2"></span> Recent Activity
                    </h3>
                    <div class="space-y-4">
                      <div *ngFor="let training of myTrainings().slice(0, 3)" class="flex items-start p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mr-4">
                          
                        </div>
                        <div class="flex-1">
                          <h4 class="font-semibold text-slate-800">{{ training.title }}</h4>
                          <div class="flex items-center gap-3 mt-1">
                             <span class="text-xs text-slate-500">{{ training.technology }}</span>
                             <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                             <span [class]="getStatusClass(training.status)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                               {{ training.status }}
                             </span>
                          </div>
                        </div>
                        <div class="text-right">
                           <span class="text-sm font-bold text-slate-800">₹{{ training.budget }}</span>
                        </div>
                      </div>
                      <div *ngIf="myTrainings().length === 0" class="py-12 text-center">
                         <p class="text-slate-400">No recent activity found.</p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gradient-to-br from-primary-600 to-secondary-600 p-8 rounded-3xl text-white shadow-xl shadow-primary-500/20">
                     <h3 class="text-xl font-bold mb-2">Need more training?</h3>
                     <p class="text-primary-50 mb-6">Raise a new request today and get the best trainers for your team.</p>
                     <a routerLink="requests" class="inline-block px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-all">
                        New Request 
                     </a>
                  </div>
               </div>

               <div class="space-y-6">
                  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <span class="mr-2"></span> Notifications
                    </h3>
                    <div class="space-y-3">
                      <div *ngFor="let note of notifications()" class="p-3 bg-slate-50 rounded-lg text-sm border-l-4 border-primary-500">
                        <p class="text-slate-700">{{ note.message }}</p>
                        <span class="text-[10px] text-slate-400 mt-2 block">{{ note.timestamp | date:'short' }}</span>
                      </div>
                      <div *ngIf="notifications().length === 0" class="text-center py-6">
                        <p class="text-slate-400 text-sm italic">You're all caught up!</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  trainings = signal<any[]>([]);
  notifications = signal<any[]>([]);

  myTrainings = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return [];
    return this.trainings().filter(t => t.clientId === (user as any).companyId || t.clientId === user.id);
  });
  activeTrainings = computed(() => this.myTrainings().filter(t => t.status === 'Active').length);

  constructor(public auth: AuthService, private data: DataService) { }

  ngOnInit() {
    this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
    this.data.get<any[]>('notifications').subscribe(d => {
      const userId = this.auth.currentUser()?.id;
      this.notifications.set(d.filter(n => n.userId === userId));
    });
  }

  isDashboardHome() {
    return window.location.pathname === '/client';
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Requested': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
