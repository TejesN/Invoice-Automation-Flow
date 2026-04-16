export const INVOICE_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  PAID: 'paid',
};

export const STATUS_LABELS = {
  pending: 'Pending',
  partial: 'Partial',
  overdue: 'Overdue',
  paid: 'Paid',
};

export const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'AED', label: 'AED — UAE Dirham' },
];

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
];
