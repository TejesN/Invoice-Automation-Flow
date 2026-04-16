import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAYMENT_METHODS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useRole } from '@/context/RoleContext';

export function RequestPaymentForm({ invoiceId, remaining, onSuccess, onCancel }) {
  const { role } = useRole();

  const schema = z.object({
    amount: z.coerce.number().positive('Amount must be positive').max(remaining + 0.001, `Cannot exceed ${formatCurrency(remaining)}`),
    payment_date: z.string().min(1, 'Required'),
    method: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { payment_date: new Date().toISOString().split('T')[0] },
  });

  async function onSubmit(data) {
    await onSuccess({ ...data, invoice_id: invoiceId, requested_by: role });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
        This payment request will be sent to an approver before being recorded.
      </div>

      <div className="space-y-1.5">
        <Label>Amount <span className="text-muted-foreground font-normal">(max {formatCurrency(remaining)})</span></Label>
        <Input type="number" step="0.01" max={remaining} placeholder="0.00" {...register('amount')} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Payment Date</Label>
        <Input type="date" {...register('payment_date')} />
      </div>

      <div className="space-y-1.5">
        <Label>Method (optional)</Label>
        <Select onValueChange={v => setValue('method', v)}>
          <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Reference # (optional)</Label>
        <Input placeholder="Check # / Transaction ID" {...register('reference')} />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-500 hover:bg-amber-600">
          {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
