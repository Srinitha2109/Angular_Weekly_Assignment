import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-admin-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-slate-800">Freelance Trainers</h2>
        <button (click)="openModal()" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
          + Register Trainer
        </button>
      </div>

      <!-- Register/Edit Trainer Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 class="text-xl font-bold text-slate-800">{{ isEdit ? 'Edit Trainer' : 'Register Trainer' }}</h3>
             <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form (ngSubmit)="saveTrainer()" #trainerForm="ngForm" class="p-8 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" name="name" [(ngModel)]="currentTrainer.name" required placeholder="John Doe">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" name="email" [(ngModel)]="currentTrainer.email" required placeholder="john@example.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
                <input type="number" name="experience" [(ngModel)]="currentTrainer.experience" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                <input type="number" name="rating" [(ngModel)]="currentTrainer.rating" step="0.1" min="0" max="5" required>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1">Tech Stack (Comma separated)</label>
                <input type="text" name="techStack" [ngModel]="currentTrainer.techStack.join(', ')" (ngModelChange)="updateTechStack($event)" required placeholder="Angular, React, Node.js">
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" (click)="closeModal()" class="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="submit" [disabled]="!trainerForm.form.valid" class="flex-1 btn-primary">
                {{ saving() ? 'Saving...' : 'Save Trainer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50/50">
            <tr>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Tech Stack</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Experience</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Rating</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let trainer of trainers()" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-slate-800">{{ trainer.name }}</div>
                <div class="text-xs text-slate-500">{{ trainer.email }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let tech of trainer.techStack" class="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded text-xs">
                    {{ tech }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ trainer.experience }} years</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                  ★ {{ trainer.rating }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <button (click)="openModal(trainer)" class="text-primary-600 hover:text-primary-800 font-medium mr-3">Edit</button>
                <button (click)="deleteTrainer(trainer.id)" class="text-red-600 hover:text-red-800 font-medium">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="trainers().length === 0" class="py-20 text-center">
           <p class="text-slate-400">No trainers registered yet.</p>
        </div>
      </div>
    </div>
  `
})
export class AdminTrainersComponent implements OnInit {
  trainers = signal<any[]>([]);
  showModal = signal(false);
  saving = signal(false);
  isEdit = false;

  currentTrainer = {
    id: '',
    name: '',
    email: '',
    techStack: [] as string[],
    experience: 0,
    rating: 0,
    availability: true,
    workload: 0
  };

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadTrainers();
  }

  loadTrainers() {
    this.dataService.get<any[]>('trainers').subscribe(data => {
      this.trainers.set(data);
    });
  }

  openModal(trainer: any = null) {
    if (trainer) {
      this.isEdit = true;
      this.currentTrainer = { ...trainer, techStack: [...trainer.techStack] };
    } else {
      this.isEdit = false;
      this.currentTrainer = {
        id: '',
        name: '',
        email: '',
        techStack: [],
        experience: 0,
        rating: 0,
        availability: true,
        workload: 0
      };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  updateTechStack(value: string) {
    this.currentTrainer.techStack = value.split(',').map(s => s.trim()).filter(s => !!s);
  }

  generatePassword(length: number = 8): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  saveTrainer() {
    this.saving.set(true);
    if (this.isEdit) {
      this.dataService.put('trainers', this.currentTrainer).subscribe(() => {
        this.loadTrainers();
        this.closeModal();
        this.saving.set(false);
      });
    } else {
      const id = Math.random().toString(36).substr(2, 9);
      const password = this.generatePassword();
      const newTrainer = { ...this.currentTrainer, id };

      // 1. Create Trainer Record
      this.dataService.post('trainers', newTrainer).subscribe(() => {
        // 2. Create User Record for Login
        const newUser = {
          id,
          email: newTrainer.email,
          password: password,
          name: newTrainer.name,
          role: 'TRAINER'
        };

        this.dataService.post('users', newUser).subscribe(() => {
          // 3. Simulate "Sending Email" by logging and notifying
          this.dataService.post('auditLogs', {
            timestamp: new Date().toISOString(),
            userId: 'admin',
            action: 'TRAINER_ONBOARDING_EMAIL_SENT',
            details: `Sent onboarding email to ${newTrainer.email}. Credentials: [Password: ${password}]`
          }).subscribe();

          this.dataService.post('notifications', {
            id: Math.random().toString(36).substr(2, 9),
            userId: id, // For the trainer
            message: `Welcome ${newTrainer.name}! Your account is ready. Your temporary password is: ${password}`,
            type: 'WELCOME',
            timestamp: new Date().toISOString(),
            read: false
          }).subscribe();

          alert(`Trainer Registered Successfully!\n\nCredentials sent to simulated email:\nEmail: ${newTrainer.email}\nPassword: ${password}\n\n(These details are also logged in Audit Logs)`);

          this.loadTrainers();
          this.closeModal();
          this.saving.set(false);
        });
      });
    }
  }

  deleteTrainer(id: string) {
    if (confirm('Are you sure you want to delete this trainer?')) {
      this.dataService.delete('trainers', id).subscribe(() => {
        this.loadTrainers();
      });
    }
  }
}
