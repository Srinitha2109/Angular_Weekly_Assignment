import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-requests',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-800">Registration Requests</h2>
        <p class="text-slate-500">Review and approve new trainers and clients.</p>
      </div>

      <div class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50/50">
            <tr>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Request Details</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Additional Info</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th class="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let req of requests()" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">{{ req.name }}</div>
                <div class="text-xs text-slate-500">{{ req.email }}</div>
                <div class="text-[10px] text-slate-400 mt-1">{{ req.timestamp | date:'medium' }}</div>
              </td>
              <td class="px-6 py-4">
                <span [class]="req.role === 'TRAINER' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'" class="px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
                  {{ req.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div *ngIf="req.role === 'TRAINER'" class="text-xs text-slate-600">
                   <span class="font-bold">Tech:</span> {{ req.techStack }}
                </div>
                <div *ngIf="req.role === 'CLIENT'" class="text-xs text-slate-600">
                   <span class="font-bold">Company:</span> {{ req.company }}
                </div>
                <div class="text-[10px] text-slate-400 mt-1 truncate max-w-xs" [title]="req.bio">{{ req.bio }}</div>
              </td>
              <td class="px-6 py-4">
                 <span [class]="getStatusClass(req.status)" class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {{ req.status }}
                 </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div *ngIf="req.status === 'Pending'" class="flex justify-end gap-2">
                   <button (click)="approveRequest(req)" class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                      Approve
                   </button>
                   <button (click)="rejectRequest(req)" class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200">
                      Reject
                   </button>
                </div>
                <button *ngIf="req.status !== 'Pending'" (click)="deleteRequest(req.id)" class="text-slate-400 hover:text-red-500 transition-colors">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="requests().length === 0" class="py-20 text-center">
           <div class="text-5xl mb-4">📥</div>
           <p class="text-slate-400">No registration requests found.</p>
        </div>
      </div>
    </div>
  `
})
export class AdminRequestsComponent implements OnInit {
    requests = signal<any[]>([]);

    constructor(private data: DataService, private auth: AuthService) { }

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.data.get<any[]>('registrationRequests').subscribe(d => this.requests.set(d));
    }

    getStatusClass(status: string) {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700';
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    }

    generatePassword(length: number = 8): string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    approveRequest(req: any) {
        if (!confirm(`Approve registration request for ${req.name}?`)) return;

        const password = this.generatePassword();
        const id = req.id;

        // 1. Create Profile (Trainer or Client)
        const profilePath = req.role === 'TRAINER' ? 'trainers' : 'clients';
        const profileData = req.role === 'TRAINER' ? {
            id,
            name: req.name,
            email: req.email,
            techStack: req.techStack ? req.techStack.split(',').map((s: string) => s.trim()) : [],
            experience: 0,
            rating: 0,
            availability: true,
            workload: 0
        } : {
            id,
            name: req.name,
            email: req.email,
            company: req.company,
            activeTrainings: 0,
            totalSpent: 0
        };

        this.data.post(profilePath, profileData).subscribe(() => {
            // 2. Create User Account
            const newUser = {
                id,
                email: req.email,
                password: password,
                name: req.name,
                role: req.role
            };

            this.data.post('users', newUser).subscribe(() => {
                // 3. Update Request Status
                this.data.put('registrationRequests', { ...req, status: 'Approved' }).subscribe(() => {
                    // 4. Audit Log & Notifications
                    this.data.post('auditLogs', {
                        timestamp: new Date().toISOString(),
                        userId: 'admin',
                        action: 'APPROVE_REGISTRATION',
                        details: `Admin approved ${req.role} request from ${req.email}. Credentials: [Password: ${password}]`
                    }).subscribe();

                    this.data.post('notifications', {
                        id: Math.random().toString(36).substr(2, 9),
                        userId: id,
                        message: `Your registration request has been approved! Temporary password: ${password}`,
                        type: 'WELCOME',
                        timestamp: new Date().toISOString(),
                        read: false
                    }).subscribe();

                    alert(`Request Approved!\n\nUser account created for ${req.email}.\nTemporary Password: ${password}`);
                    this.loadRequests();
                });
            });
        });
    }

    rejectRequest(req: any) {
        if (!confirm(`Reject registration request from ${req.name}?`)) return;
        this.data.put('registrationRequests', { ...req, status: 'Rejected' }).subscribe(() => this.loadRequests());
    }

    deleteRequest(id: string) {
        if (confirm('Delete this request record?')) {
            this.data.delete('registrationRequests', id).subscribe(() => this.loadRequests());
        }
    }
}
