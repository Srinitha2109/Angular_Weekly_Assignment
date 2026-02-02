import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
   selector: 'app-client-invoices',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">My Invoices</h2>
        <div class="flex gap-2 text-[10px] font-bold uppercase">
           <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
             {{ pendingInvoices().length }} Pending
           </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div *ngFor="let training of myInvoicedTrainings()" class="backdrop-blur-md bg-white/70 rounded-3xl shadow-sm border border-white/30 overflow-hidden divide-y divide-slate-100">
           <!-- Invoice Header -->
           <div class="p-8 flex justify-between items-start">
              <div>
                 <span [class]="getInvoiceStatusClass(training.clientInvoice.status)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest mb-2 inline-block">
                    {{ training.clientInvoice.status }}
                 </span>
                 <h3 class="text-xl font-bold text-slate-800">Invoice #{{ training.clientInvoice.invoiceNumber }}</h3>
                 <p class="text-sm text-slate-500 mt-1">Due Date: {{ training.clientInvoice.dueDate | date:'mediumDate' }}</p>
              </div>
              <div class="text-right">
                 <p class="text-sm text-slate-400 font-bold uppercase">Total Amount</p>
                 <p class="text-3xl font-bold text-primary-600">₹{{ training.clientInvoice.totalAmount | number:'1.0-0' }}</p>
              </div>
           </div>

           <!-- Details Grid -->
           <div class="px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                 <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Training</p>
                 <p class="text-sm font-bold text-slate-700">{{ training.clientInvoice.trainingName }}</p>
                 <p class="text-xs text-slate-500">{{ training.clientInvoice.technology }}</p>
              </div>
              <div>
                 <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Company</p>
                 <p class="text-sm font-bold text-slate-700">{{ training.clientInvoice.companyName }}</p>
              </div>
              <div>
                 <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">PO Reference</p>
                 <p class="text-sm font-bold text-slate-700">{{ training.clientInvoice.poReference }}</p>
              </div>
              <div>
                 <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Duration</p>
                 <p class="text-sm font-bold text-slate-700">{{ training.clientInvoice.duration }}</p>
              </div>
           </div>

           <!-- Tax Breakdown -->
           <div class="px-8 py-6 bg-slate-50/50 flex flex-col items-end gap-2">
              <div class="flex justify-between w-full max-w-xs text-sm">
                 <span class="text-slate-500">Subtotal:</span>
                 <span class="font-bold text-slate-700">₹{{ training.clientInvoice.cost | number:'1.0-0' }}</span>
              </div>
              <div class="flex justify-between w-full max-w-xs text-sm">
                 <span class="text-slate-500">GST (18%):</span>
                 <span class="font-bold text-slate-700">₹{{ training.clientInvoice.gst | number:'1.0-0' }}</span>
              </div>
              <div class="flex justify-between w-full max-w-xs text-base pt-2 border-t border-slate-200 mt-2">
                 <span class="font-bold text-slate-800">Total:</span>
                 <span class="font-extrabold text-primary-600">₹{{ training.clientInvoice.totalAmount | number:'1.0-0' }}</span>
              </div>
           </div>

           <!-- Actions -->
           <div class="px-8 py-4 flex justify-between items-center bg-white/50">
              <button class="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center gap-2">
                 <span></span> Download PDF
              </button>
              <div class="flex gap-3">
                 <button 
                   *ngIf="training.clientInvoice.status !== 'Paid'"
                   (click)="markAsPaid(training)"
                   class="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all">
                   Mark Payment as Done
                 </button>
                 <span 
                   *ngIf="training.clientInvoice.status === 'Paid'"
                   class="px-6 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm flex items-center gap-2">
                   Payment Completed 
                 </span>
              </div>
           </div>
        </div>

        <div *ngIf="myInvoicedTrainings().length === 0" class="py-20 text-center">
           <div class="text-4xl mb-4"></div>
           <p class="text-slate-400">No invoices generated yet.</p>
        </div>
      </div>
    </div>
  `
})
export class ClientInvoicesComponent implements OnInit {
   trainings = signal<any[]>([]);

   myInvoicedTrainings = computed(() => {
      const user = this.auth.currentUser();
      if (!user) return [];
      const clientId = (user as any).companyId || user.id;
      return this.trainings().filter(t => t.clientId === clientId && t.clientInvoice);
   });

   pendingInvoices = computed(() => this.myInvoicedTrainings().filter(t => t.clientInvoice.status !== 'Paid'));

   constructor(private data: DataService, private auth: AuthService) { }

   ngOnInit() {
      this.loadData();
   }

   loadData() {
      this.data.get<any[]>('trainings').subscribe(d => this.trainings.set(d));
   }

   markAsPaid(training: any) {
      if (!confirm('Mark this invoice as paid?')) return;

      const updated = {
         ...training,
         status: 'Payment Done',
         clientInvoice: { ...training.clientInvoice, status: 'Paid' }
      };

      this.data.put('trainings', updated).subscribe(() => {
         this.data.post('auditLogs', {
            timestamp: new Date().toISOString(),
            userId: this.auth.currentUser()?.id,
            action: 'PAYMENT_DONE',
            details: `Client marked payment as done for invoice ${training.clientInvoice.invoiceNumber}`
         }).subscribe();

         this.loadData();
      });
   }

   getInvoiceStatusClass(status: string) {
      switch (status) {
         case 'Paid': return 'bg-green-100 text-green-700';
         case 'Generated': return 'bg-amber-100 text-amber-700';
         default: return 'bg-slate-100 text-slate-700';
      }
   }
}
