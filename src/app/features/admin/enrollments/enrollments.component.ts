import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Training Management</h2>
        <div class="flex gap-2">
           <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase tabular-nums">
             {{ pendingRequests().length }} Requests
           </span>
        </div>
      </div>

      <div class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Training</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trainer</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-[11px] font-bold">
            <tr *ngFor="let training of trainings()" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">{{ training.title }}</div>
                <div class="text-[10px] text-slate-400 font-normal uppercase mt-0.5">{{ training.technology }}</div>
              </td>
              <td class="px-6 py-4 text-slate-600">
                {{ getClientName(training.clientId) }}
              </td>
              <td class="px-6 py-4">
                <div *ngIf="training.trainerId" class="text-primary-600">
                  {{ getTrainerName(training.trainerId) }}
                </div>
                <div *ngIf="!training.trainerId" class="text-amber-500 italic">
                  Not Assigned
                </div>
              </td>
              <td class="px-6 py-4">
                <span [class]="getStatusClass(training.status)" class="px-2 py-1 rounded-full text-[10px] tracking-widest uppercase">
                  {{ training.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  *ngIf="!training.trainerId" 
                  (click)="openAssignModal(training)"
                  class="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-all text-[10px] uppercase font-bold"
                >
                  Assign Trainer
                </button>
                <div class="flex justify-end gap-2">
                   <button 
                     *ngIf="training.status === 'Completed' && !training.clientInvoice"
                     (click)="generateInvoice(training)"
                     class="px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-[9px] uppercase font-bold"
                   >
                     Generate Invoice
                   </button>
                   <button (click)="openTracker(training)" class="text-slate-400 hover:text-slate-600 transition-colors">👁️</button>
                   <button (click)="deleteTraining(training.id)" class="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="trainings().length === 0" class="py-20 text-center">
           <p class="text-slate-400">No training requests found.</p>
        </div>
      </div>

      <!-- Training Tracker Modal -->
      <div *ngIf="showTrackerModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          <!-- Fixed Header -->
          <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
             <div>
                <h3 class="text-xl font-bold text-slate-800">Training Progress Tracker</h3>
                <p class="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Tracking: {{ selectedTraining()?.title }}</p>
             </div>
             <button (click)="showTrackerModal.set(false)" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">✕</button>
          </div>
          
          <!-- Scrollable Content -->
          <div class="p-8 overflow-y-auto custom-scrollbar flex-1">
             <!-- Visual Timeline -->
             <div class="relative px-4">
                <div class="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                
                <div class="space-y-10 relative">
                   <div *ngFor="let step of trackerSteps; let i = index" class="flex items-start gap-10">
                      <div [class]="getStepCircleClass(step.status)" class="w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-md z-10 transition-all duration-500 shrink-0">
                      </div>
                      <div class="flex-1 pt-1">
                         <h4 [class]="isStepActive(step.status) ? 'text-slate-800' : 'text-slate-400'" class="font-bold text-base">{{ step.label }}</h4>
                         <p class="text-xs text-slate-500 mt-0.5">{{ step.desc }}</p>
                         <div *ngIf="isStepCompleted(step.status)" class="mt-2 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span class="text-[9px] font-bold text-green-600 uppercase">Completed</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div class="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                <div class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm"></div>
                   <div>
                      <p class="text-[9px] text-slate-500 font-bold uppercase">Client</p>
                      <p class="text-xs font-bold text-slate-700">{{ getClientName(selectedTraining()?.clientId) }}</p>
                   </div>
                </div>
                <div *ngIf="selectedTraining()?.trainerId" class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm"></div>
                   <div>
                      <p class="text-[9px] text-slate-500 font-bold uppercase">Trainer</p>
                      <p class="text-xs font-bold text-slate-700">{{ getTrainerName(selectedTraining()?.trainerId) }}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- Assign Trainer Modal -->
      <div *ngIf="showAssignModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 class="text-xl font-bold text-slate-800">Assign Trainer</h3>
             <button (click)="showAssignModal.set(false)" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div class="p-8 space-y-6">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <p class="text-xs text-slate-500 uppercase font-bold tracking-wider">Training</p>
               <h4 class="text-lg font-bold text-slate-800">{{ selectedTraining().title }}</h4>
               <p class="text-sm text-slate-600">{{ selectedTraining().technology }}</p>
            </div>

            <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               <div *ngFor="let trainer of filteredTrainers()" 
                    (click)="selectedTrainerId.set(trainer.id)"
                    [class]="selectedTrainerId() === trainer.id ? 'border-primary-500 bg-primary-50' : 'border-slate-100 hover:border-slate-300'"
                    class="p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between">
                  <div class="flex items-center gap-4">
                     <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                        👨‍🏫
                     </div>
                     <div>
                        <h5 class="font-bold text-slate-800">{{ trainer.name }}</h5>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{{ trainer.techStack.join(', ') }}</p>
                     </div>
                  </div>
                  <div class="text-right">
                     <div class="text-amber-500 font-bold">★ {{ trainer.rating }}</div>
                     <div class="text-[10px] text-slate-400">Exp: {{ trainer.experience }}y</div>
                  </div>
               </div>
            </div>

            <div class="flex gap-4">
              <button (click)="showAssignModal.set(false)" class="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button (click)="assignTrainer()" [disabled]="!selectedTrainerId()" class="flex-1 btn-primary">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminEnrollmentsComponent implements OnInit {
  trainings = signal<any[]>([]);
  trainers = signal<any[]>([]);
  clients = signal<any[]>([]);

  showAssignModal = signal(false);
  showTrackerModal = signal(false);
  selectedTraining = signal<any>(null);
  selectedTrainerId = signal<string | null>(null);

  trackerSteps = [
    { status: 'Requested', label: 'Requested', desc: 'Client raised training request' },
    { status: 'Trainer Assigned', label: 'Assigned', desc: 'Admin assigned a trainer' },
    { status: 'Active', label: 'In Progress', desc: 'Training is currently being delivered' },
    { status: 'Completed', label: 'Delivered', desc: 'Trainer marked training as completed' },
    { status: 'Invoice Generated', label: 'Billed', desc: 'Admin generated client invoice' },
    { status: 'Payment Done', label: 'Paid', desc: 'Client confirmed payment' }
  ];

  pendingRequests = computed(() => this.trainings().filter(t => t.status === 'Requested'));

  filteredTrainers = computed(() => {
    if (!this.selectedTraining()) return this.trainers();
    const tech = this.selectedTraining().technology.toLowerCase();
    return this.trainers().filter(t =>
      t.techStack.some((ts: string) => ts.toLowerCase().includes(tech)) ||
      tech.includes(t.techStack[0].toLowerCase())
    );
  });

  constructor(private data: DataService, private auth: AuthService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
    this.data.get<any[]>('trainers').subscribe(d => this.trainers.set(d));
    this.data.get<any[]>('clients').subscribe(d => this.clients.set(d));
  }

  getClientName(id: string) {
    return this.clients().find(c => c.id === id)?.name || 'Unknown Client';
  }

  getTrainerName(id: string) {
    return this.trainers().find(t => t.id === id)?.name || 'Unknown Trainer';
  }

  openAssignModal(training: any) {
    this.selectedTraining.set(training);
    this.selectedTrainerId.set(null);
    this.showAssignModal.set(true);
  }

  openTracker(training: any) {
    this.selectedTraining.set(training);
    this.showTrackerModal.set(true);
  }

  getStepCircleClass(stepStatus: string) {
    const training = this.selectedTraining();
    if (!training) return 'bg-slate-100 text-slate-300';

    const statusOrder = ['Requested', 'Trainer Assigned', 'Active', 'Completed', 'Invoice Generated', 'Payment Done'];
    const currentIdx = statusOrder.indexOf(training.status);
    const stepIdx = statusOrder.indexOf(stepStatus);

    if (training.status === stepStatus) return 'bg-primary-600 text-white shadow-primary-500/50 scale-110';
    if (stepIdx < currentIdx) return 'bg-green-100 text-green-600';
    return 'bg-slate-50 text-slate-300 border-2 border-slate-100';
  }

  isStepActive(stepStatus: string) {
    return this.selectedTraining()?.status === stepStatus;
  }

  isStepCompleted(stepStatus: string) {
    const statusOrder = ['Requested', 'Trainer Assigned', 'Active', 'Completed', 'Invoice Generated', 'Payment Done'];
    const currentIdx = statusOrder.indexOf(this.selectedTraining()?.status || '');
    const stepIdx = statusOrder.indexOf(stepStatus);
    return stepIdx < currentIdx;
  }

  assignTrainer() {
    if (!this.selectedTrainerId() || !this.selectedTraining()) return;

    const updated = {
      ...this.selectedTraining(),
      trainerId: this.selectedTrainerId(),
      status: 'Trainer Assigned',
      trainerPO: { filename: `TPO_${this.selectedTrainerId()}_${this.selectedTraining().id}.pdf`, status: 'Generated' }
    };

    this.data.put('trainings', updated).subscribe(() => {
      // Audit log
      this.data.post('auditLogs', {
        timestamp: new Date().toISOString(),
        userId: this.auth.currentUser()?.id,
        action: 'ASSIGN_TRAINER',
        details: `Assigned ${this.getTrainerName(updated.trainerId)} to ${updated.title}`
      }).subscribe();

      // Notification to Client
      this.data.post('notifications', {
        userId: updated.clientId, // Assuming user ID matches client ID for demo simplicity or map it
        message: `Trainer has been assigned to your request: ${updated.title}`,
        read: false,
        timestamp: new Date().toISOString()
      }).subscribe();

      this.showAssignModal.set(false);
      this.loadData();
    });
  }

  generateInvoice(training: any) {
    const cost = training.budget;
    const gstCount = cost * 0.18;
    const total = cost + gstCount;
    const invoiceNo = `INV-CL-${Math.floor(1000 + Math.random() * 9000)}`;

    const clientInvoice = {
      invoiceNumber: invoiceNo,
      companyName: this.getClientName(training.clientId),
      trainingName: training.title,
      technology: training.technology,
      duration: '5 Days', // Simulation
      cost: cost,
      gst: gstCount,
      totalAmount: total,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      poReference: training.clientPO?.filename || 'PO_PENDING',
      status: 'Generated'
    };

    const updated = { ...training, clientInvoice, status: 'Invoice Generated' };

    this.data.put('trainings', updated).subscribe(() => {
      this.data.post('auditLogs', {
        timestamp: new Date().toISOString(),
        userId: this.auth.currentUser()?.id,
        action: 'GENERATE_INVOICE',
        details: `Generated client invoice ${invoiceNo} for ${training.title}`
      }).subscribe();

      this.loadData();
    });
  }

  deleteTraining(id: string) {
    if (confirm('Are you sure you want to delete this training request?')) {
      this.data.delete('trainings', id).subscribe(() => this.loadData());
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Requested': return 'bg-amber-100 text-amber-700';
      case 'Trainer Assigned': return 'bg-indigo-100 text-indigo-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
