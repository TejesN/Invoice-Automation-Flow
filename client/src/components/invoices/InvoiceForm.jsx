import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES } from '@/lib/constants';

const schema = z.object({
  vendor_id: z.string().min(1, 'Vendor is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  currency: z.string().default('USD'),
  exchange_rate: z.coerce.number().positive().default(1.0),
  notes: z.string().optional(),
});

export function InvoiceForm({ vendors, onSubmit, defaultValues, prefillValues, loading }) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', exchange_rate: 1.0, ...defaultValues },
  });

  const currency = watch('currency');

  // Auto-fill from OCR extraction
  useEffect(() => {
    if (!prefillValues) return;
    if (prefillValues.invoice_number) setValue('invoice_number', prefillValues.invoice_number);
    if (prefillValues.amount)         setValue('amount', prefillValues.amount);
    if (prefillValues.issueDate)      setValue('issue_date', prefillValues.issueDate);
    if (prefillValues.dueDate)        setValue('due_date', prefillValues.dueDate);
    if (prefillValues.notes)          setValue('notes', prefillValues.notes);
    if (prefillValues.vendor_id)      setValue('vendor_id', String(prefillValues.vendor_id));
    if (prefillValues.currency)       setValue('currency', prefillValues.currency, { shouldValidate: true });
    if (prefillValues.exchange_rate)  setValue('exchange_rate', prefillValues.exchange_rate);
  }, [prefillValues, setValue]);

  // Reset exchange rate to 1 when user manually switches to USD
  const prevCurrencyRef = useRef(currency);
  useEffect(() => {
    if (prevCurrencyRef.current !== currency) {
      prevCurrencyRef.current = currency;
      if (currency === 'USD') setValue('exchange_rate', 1.0);
    }
  }, [currency, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label>Vendor</Label>
        <Select value={watch('vendor_id') || ''} onValueChange={v => setValue('vendor_id', v, { shouldValidate: true })}>
          <SelectTrigger><SelectValue placeholder="Select vendor..." /></SelectTrigger>
          <SelectContent>
            {vendors.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.vendor_id && <p className="text-xs text-destructive">{errors.vendor_id.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="invoice_number">Invoice Number</Label>
        <Input id="invoice_number" placeholder="INV-2024-001" {...register('invoice_number')} />
        {errors.invoice_number && <p className="text-xs text-destructive">{errors.invoice_number.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount ({currency || 'USD'})</Label>
          <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={currency || 'USD'} onValueChange={v => setValue('currency', v, { shouldValidate: true })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currency && currency !== 'USD' && (
        <div className="space-y-1.5">
          <Label htmlFor="exchange_rate">Exchange Rate to USD <span className="text-muted-foreground font-normal">(1 {currency} = ? USD)</span></Label>
          <Input id="exchange_rate" type="number" step="0.0001" placeholder="e.g. 1.08" {...register('exchange_rate')} />
          {errors.exchange_rate && <p className="text-xs text-destructive">{errors.exchange_rate.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="issue_date">Issue Date</Label>
          <Input id="issue_date" type="date" {...register('issue_date')} />
          {errors.issue_date && <p className="text-xs text-destructive">{errors.issue_date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Due Date</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
          {errors.due_date && <p className="text-xs text-destructive">{errors.due_date.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" placeholder="Any additional notes..." {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Invoice'}
      </Button>
    </form>
  );
}
