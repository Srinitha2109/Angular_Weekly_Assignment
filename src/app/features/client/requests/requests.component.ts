import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-client-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">My Training Requests</h2>
        <button (click)="showForm.set(true)" class="btn-primary flex items-center gap-2">
          <span>+</span> New Request
        </button>
      </div>

      <!-- New Request Form Modal -->
      <div *ngIf="showForm()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 class="text-xl font-bold text-slate-800">Raise New Request</h3>
             <button (click)="showForm.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
          </div>
          <form (ngSubmit)="submitRequest()" #requestForm="ngForm" class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Training Title</label>
                <input type="text" name="title" [(ngModel)]="newRequest.title" required placeholder="e.g., Angular Mastery">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Technology</label>
                <input type="text" name="technology" [(ngModel)]="newRequest.technology" required placeholder="e.g., Angular 21">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                <input type="date" name="date" [(ngModel)]="newRequest.preferredDates" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Estimated Budget (₹)</label>
                <input type="number" name="budget" [(ngModel)]="newRequest.budget" required placeholder="50000">
              </div>
            </div>

            <div>
               <label class="block text-sm font-medium text-slate-700 mb-1">Upload Client PO (Simulation)</label>
               <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer bg-slate-50">
                  <span class="text-2xl mb-2 block">📄</span>
                  <p class="text-sm text-slate-500">Click to select PO file or drag and drop</p>
                  <p class="text-xs text-slate-400 mt-1">PDF, JPG up to 10MB</p>
               </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" (click)="showForm.set(false)" class="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="submit" [disabled]="!requestForm.form.valid" class="flex-1 btn-primary">
                {{ submitting() ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Technology</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Budget</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 uppercase text-[11px] font-bold">
            <tr *ngFor="let req of requests()" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4 text-slate-800">{{ req.title }}</td>
              <td class="px-6 py-4"><span class="px-2 py-1 bg-slate-100 rounded-lg">{{ req.technology }}</span></td>
              <td class="px-6 py-4 text-slate-500">{{ req.preferredDates | date:'mediumDate' }}</td>
              <td class="px-6 py-4">
                <span [class]="getStatusClass(req.status)" class="px-2 py-1 rounded-full text-[10px] tracking-widest uppercase">
                  {{ req.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-slate-900">₹{{ req.budget }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="requests().length === 0" class="py-20 text-center">
           <p class="text-slate-400">You haven't raised any training requests yet.</p>
        </div>
      </div>
    </div>
  `
})
export class ClientRequestsComponent implements OnInit {
    requests = signal<any[]>([]);
    showForm = signal(false);
    submitting = signal(false);

    newRequest = {
        title: '',
        technology: '',
        preferredDates: '',
        budget: 0
    };

    constructor(private data: DataService, private auth: AuthService) { }

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.data.get<any[]>('trainings').subscribe(data => {
            const clientId = (this.auth.currentUser() as any)?.companyId || this.auth.currentUser()?.id;
            this.requests.set(data.filter(r => r.clientId === clientId));
        });
    }

    submitRequest() {
        this.submitting.set(true);
        const userId = this.auth.currentUser()?.id;
        const clientId = (this.auth.currentUser() as any)?.companyId || userId;

        const payload = {
            ...this.newRequest,
            clientId,
            status: 'Requested',
            clientPO: { filename: 'PO_Pending.pdf', status: 'Uploaded' },
            trainerId: null,
            trainerPO: null,
            clientInvoice: null,
            trainerInvoice: null
        };

        this.data.post<any>('trainings', payload).subscribe(() => {
            // Log Audit
            this.data.post('auditLogs', {
                timestamp: new Date().toISOString(),
                userId,
                action: 'RAISE_REQUEST',
                details: `Client raised request for ${payload.title}`
            }).subscribe();

            this.showForm.set(false);
            this.submitting.set(false);
            this.loadRequests();
            this.resetForm();
        });
    }

    resetForm() {
        this.newRequest = { title: '', technology: '', preferredDates: '', budget: 0 };
    }

    getStatusClass(status: string) {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700';
            case 'Requested': return 'bg-amber-100 text-amber-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    }
}
