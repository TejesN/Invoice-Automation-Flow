require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { migrate } = require('./db/migrate');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/payment-requests', require('./routes/paymentRequests'));

app.use(errorHandler);

migrate();

app.listen(PORT, () => {
  console.log(`AP Automation server running on http://localhost:${PORT}`);
});
