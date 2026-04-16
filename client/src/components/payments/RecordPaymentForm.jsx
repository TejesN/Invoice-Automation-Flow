import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAYMENT_METHODS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export function RecordPaymentForm({ invoiceId, remaining, onSuccess, onCancel }) {
  const schema = z.object({
    amount: z.coerce.number().positive('Amount must be positive').max(remaining + 0.001, `Cannot exceed balance of ${formatCurrency(remaining)}`),
    payment_date: z.string().min(1, 'Payment date is required'),
    method: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { payment_date: new Date().toISOString().split('T')[0] },
  });

  return (
    <form onSubmit={handleSubmit(onSuccess)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pay_amount">Amount <span className="text-muted-foreground font-normal">(max {formatCurrency(remaining)})</span></Label>
        <Input id="pay_amount" type="number" step="0.01" max={remaining} placeholder="0.00" {...register('amount')} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pay_date">Payment Date</Label>
        <Input id="pay_date" type="date" {...register('payment_date')} />
        {errors.payment_date && <p className="text-xs text-destructive">{errors.payment_date.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Method (optional)</Label>
        <Select onValueChange={v => setValue('method', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select method..." />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reference">Reference # (optional)</Label>
        <Input id="reference" placeholder="Check # / Transaction ID" {...register('reference')} />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Recording...' : 'Record Payment'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
