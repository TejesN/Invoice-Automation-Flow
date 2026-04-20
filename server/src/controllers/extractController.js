const Anthropic = require('@anthropic-ai/sdk');

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY is not set. PDF/image extraction will fail.');
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Supported currencies in the app
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'CHF', 'AED'];

const SYSTEM_PROMPT = `You are an invoice data extractor. When given an invoice document or image, extract the key fields and respond ONLY with a valid JSON object — no markdown, no explanation.

Required JSON keys:
- vendorName: string (supplier/vendor company name)
- invoiceNumber: string (invoice ID or reference number)
- amount: number (total amount due, numeric only, no currency symbols)
- currency: string (3-letter ISO currency code, e.g. USD, INR, EUR, GBP. Detect from currency symbols: ₹=INR, €=EUR, £=GBP, $=USD, ¥=JPY, A$=AUD, S$=SGD, C$=CAD, CHF=CHF, AED=AED. Default to USD if unclear)
- issueDate: string (YYYY-MM-DD format)
- dueDate: string (YYYY-MM-DD format, or same as issueDate if not found)
- notes: string (any relevant notes or description, empty string if none)

If a field cannot be determined, use an empty string for strings and 0 for numbers.`;

async function fetchExchangeRate(currency) {
  if (currency === 'USD') return 1.0;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!res.ok) throw new Error('Rate fetch failed');
    const data = await res.json();
    const rate = data.rates?.[currency];
    if (!rate) return null;
    // API gives units of currency per 1 USD, we want USD per 1 unit
    return Math.round((1 / rate) * 100000) / 100000;
  } catch (err) {
    console.error('Exchange rate fetch error:', err.message);
    return null;
  }
}

async function extract(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded. Use multipart/form-data with field name "file".' });

    const { buffer, mimetype } = req.file;
    const base64 = buffer.toString('base64');

    const contentBlock = mimetype === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : { type: 'image', source: { type: 'base64', media_type: mimetype, data: base64 } };

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            contentBlock,
            { type: 'text', text: 'Extract the invoice fields from this document and return the JSON object.' },
          ],
        },
      ],
    });

    const raw = message.content.find(b => b.type === 'text')?.text?.trim() || '';

    // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let extracted;
    try {
      extracted = JSON.parse(text);
    } catch {
      console.error('Extract parse failure. Raw response:', raw);
      return res.status(422).json({ error: 'Could not parse invoice data from document. Try a clearer image or PDF.' });
    }

    // Normalise and validate currency
    const rawCurrency = (extracted.currency || 'USD').toString().toUpperCase().trim();
    const currency = SUPPORTED_CURRENCIES.includes(rawCurrency) ? rawCurrency : 'USD';

    // Fetch live exchange rate if non-USD
    let exchangeRate = 1.0;
    if (currency !== 'USD') {
      const rate = await fetchExchangeRate(currency);
      if (rate !== null) {
        exchangeRate = rate;
      } else {
        console.warn(`Could not fetch exchange rate for ${currency}, defaulting to 1.0`);
      }
    }

    res.json({
      ...extracted,
      currency,
      exchangeRate,
    });
  } catch (err) {
    // Give a clear message for missing API key instead of raw SDK error
    if (err.message?.includes('apiKey') || err.message?.includes('authToken') || err.message?.includes('authentication')) {
      return res.status(503).json({ error: 'Invoice extraction is not configured. Please contact your administrator to set up the API key.' });
    }
    next(err);
  }
}

module.exports = { extract };
