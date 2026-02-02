import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
   selector: 'app-admin-finance',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Financial Management</h2>
        <div class="flex gap-4">
           <div class="bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 flex flex-col min-w-[140px] shadow-sm shadow-emerald-50">
              <span class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Total Revenue</span>
              <span class="text-xl font-black text-emerald-700">₹{{ totalRevenue() | number:'1.0-0' }}</span>
           </div>
           <div class="bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 flex flex-col min-w-[140px] shadow-sm shadow-amber-50">
              <span class="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pending Payouts</span>
              <span class="text-xl font-black text-amber-700">₹{{ pendingPayouts() | number:'1.0-0' }}</span>
           </div>
           <div class="bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 flex flex-col min-w-[140px] shadow-sm shadow-indigo-50">
              <span class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Net Profit</span>
              <span class="text-xl font-black text-indigo-700">₹{{ netProfit() | number:'1.0-0' }}</span>
           </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-slate-200">
         <button (click)="activeTab.set('CLIENT')" 
                 [class]="activeTab() === 'CLIENT' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'"
                 class="px-6 py-3 border-b-2 font-bold text-sm transition-all">Client Invoices</button>
         <button (click)="activeTab.set('TRAINER')" 
                 [class]="activeTab() === 'TRAINER' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'"
                 class="px-6 py-3 border-b-2 font-bold text-sm transition-all">Trainer Payouts</button>
      </div>

      <!-- Client Invoices Table -->
      <div *ngIf="activeTab() === 'CLIENT'" class="backdrop-blur-md bg-white/70 rounded-2xl shadow-sm border border-white/30 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-[11px] font-bold">
            <tr *ngFor="let training of clientInvoices()" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4 text-slate-800">{{ training.clientInvoice.invoiceNumber }}</td>
              <td class="px-6 py-4 text-slate-600">{{ training.clientInvoice.companyName }}</td>
              <td class="px-6 py-4 text-slate-900 font-extrabold">₹{{ training.clientInvoice.totalAmount | number:'1.0-0' }}</td>
              <td class="px-6 py-4">
                <span [class]="training.clientInvoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'" class="px-2 py-1 rounded-full text-[10px] tracking-widest uppercase">
                  {{ training.clientInvoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                 <button (click)="viewInvoice(training)" class="text-primary-600 hover:text-primary-800 transition-colors">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Invoice Details Modal -->
      <div *ngIf="showInvoiceModal()" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
           <!-- Fixed Header -->
           <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 class="text-xl font-bold text-slate-800">Invoice Details</h3>
              <button (click)="showInvoiceModal.set(false)" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">✕</button>
           </div>
           
           <!-- Scrollable Content -->
           <div class="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div class="flex justify-between items-start">
                 <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoice Number</p>
                    <h4 class="text-lg font-bold text-slate-800">{{ selectedInvoice()?.clientInvoice?.invoiceNumber }}</h4>
                 </div>
                 <div class="text-right">
                    <span [class]="selectedInvoice()?.clientInvoice?.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'" class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                       {{ selectedInvoice()?.clientInvoice?.status }}
                    </span>
                 </div>
              </div>

              <div class="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Training</p>
                    <p class="text-sm font-bold text-slate-700">{{ selectedInvoice()?.title }}</p>
                    <p class="text-[10px] text-slate-500">{{ selectedInvoice()?.technology }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Client</p>
                    <p class="text-sm font-bold text-slate-700">{{ selectedInvoice()?.clientInvoice?.companyName }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">PO Reference</p>
                    <p class="text-sm font-bold text-slate-700">{{ selectedInvoice()?.clientInvoice?.poReference }}</p>
                 </div>
                 <div>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Due Date</p>
                    <p class="text-sm font-bold text-slate-700">{{ selectedInvoice()?.clientInvoice?.dueDate | date:'mediumDate' }}</p>
                 </div>
              </div>

              <div class="space-y-3">
                 <div class="flex justify-between text-sm py-2 border-b border-slate-50">
                    <span class="text-slate-500">Service Fee (Subtotal)</span>
                    <span class="font-bold text-slate-700">₹{{ selectedInvoice()?.clientInvoice?.cost | number:'1.0-0' }}</span>
                 </div>
                 <div class="flex justify-between text-sm py-2 border-b border-slate-50">
                    <span class="text-slate-500">GST Input (18%)</span>
                    <span class="font-bold text-slate-700">₹{{ selectedInvoice()?.clientInvoice?.gst | number:'1.0-0' }}</span>
                 </div>
                 <div class="flex justify-between text-lg pt-4 border-t border-slate-100 mt-2">
                    <span class="font-bold text-slate-800">Grand Total</span>
                    <span class="font-extrabold text-primary-600">₹{{ selectedInvoice()?.clientInvoice?.totalAmount | number:'1.0-0' }}</span>
                 </div>
              </div>

              <button (click)="showInvoiceModal.set(false)" class="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 mt-4">
                 Close View
              </button>
           </div>
        </div>
      </div>

      <!-- Trainer Payouts -->
      <div *ngIf="activeTab() === 'TRAINER'" class="grid grid-cols-1 gap-4">
         <div *ngFor="let training of trainerInvoices()" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div class="flex items-center gap-4">
               <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-xl">👨‍🏫</div>
               <div>
                  <h4 class="font-bold text-slate-800">{{ getTrainerName(training.trainerId) }}</h4>
                  <p class="text-xs text-slate-500">{{ training.title }}</p>
               </div>
            </div>
            <div class="flex items-center gap-8">
               <div class="text-right">
                  <p class="text-[10px] text-slate-400 font-bold uppercase">Invoice Amount</p>
                  <p class="text-lg font-bold text-slate-800">₹{{ training.budget | number:'1.0-0' }}</p>
               </div>
               <div class="flex gap-2">
                  <button 
                    *ngIf="training.trainerInvoice.status === 'Pending Approval'"
                    (click)="approveTrainerInvoice(training)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                    Approve & Release
                  </button>
                  <span 
                    *ngIf="training.trainerInvoice.status === 'Released'"
                    class="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                    Paid ✅
                  </span>
                  <button class="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200">
                    Reject
                  </button>
               </div>
            </div>
         </div>
         <div *ngIf="trainerInvoices().length === 0" class="py-20 text-center">
            <p class="text-slate-400">No trainer invoices pending approval.</p>
         </div>
      </div>
    </div>
  `
})
export class AdminFinanceComponent implements OnInit {
   trainings = signal<any[]>([]);
   trainers = signal<any[]>([]);
   activeTab = signal<'CLIENT' | 'TRAINER'>('CLIENT');

   showInvoiceModal = signal(false);
   selectedInvoice = signal<any>(null);

   clientInvoices = computed(() => this.trainings().filter(t => t.clientInvoice));
   trainerInvoices = computed(() => this.trainings().filter(t => t.trainerInvoice));

   totalRevenue = computed(() => this.clientInvoices().filter(t => t.clientInvoice.status === 'Paid').reduce((acc, curr) => acc + curr.clientInvoice.totalAmount, 0));
   pendingPayouts = computed(() => this.trainerInvoices().filter(t => t.trainerInvoice.status === 'Pending Approval').reduce((acc, curr) => acc + curr.budget, 0));

   netProfit = computed(() => {
      const paidTrainings = this.trainings().filter(t => t.clientInvoice?.status === 'Paid');
      const totalRev = paidTrainings.reduce((acc, curr) => acc + (curr.clientInvoice?.totalAmount || 0), 0);
      const totalExp = paidTrainings.reduce((acc, curr) => acc + (curr.budget || 0), 0);
      return totalRev - totalExp;
   });

   constructor(private data: DataService, private auth: AuthService) { }

   ngOnInit() {
      this.loadData();
   }

   loadData() {
      this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
      this.data.get<any[]>('trainers').subscribe(d => this.trainers.set(d));
   }

   getTrainerName(id: string) {
      return this.trainers().find(t => t.id === id)?.name || 'Unknown Trainer';
   }

   viewInvoice(training: any) {
      this.selectedInvoice.set(training);
      this.showInvoiceModal.set(true);
   }

   approveTrainerInvoice(training: any) {
      if (!confirm('Approve this invoice and release payment?')) return;

      const updated = {
         ...training,
         trainerInvoice: { ...training.trainerInvoice, status: 'Released' }
      };

      this.data.put('trainings', updated).subscribe(() => {
         this.data.post('auditLogs', {
            timestamp: new Date().toISOString(),
            userId: this.auth.currentUser()?.id,
            action: 'APPROVE_TRAINER_INVOICE',
            details: `Admin approved payout for ${this.getTrainerName(training.trainerId)} - ${training.title}`
         }).subscribe();

         this.loadData();
      });
   }
}
