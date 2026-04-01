const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = 3000;

// ============================================
// CONFIGURATION - Change these numbers
// ============================================
const NOTIFICATION_NUMBERS = [
  '91XXXXXXXXXX',  // Your WhatsApp number (with country code, no +)
  // Add more numbers if needed
];
// ============================================

// Middleware
app.use(cors());
app.use(express.json());

// WhatsApp Client
let client;
let isClientReady = false;

// Initialize WhatsApp
function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log('\n============================================');
    console.log('SCAN THIS QR CODE WITH YOUR WHATSAPP:');
    console.log('============================================\n');
    qrcode.generate(qr, { small: true });
    console.log('\n============================================');
  });

  client.on('ready', () => {
    console.log('\n✅ WhatsApp Client is ready!');
    console.log('============================================\n');
    isClientReady = true;
  });

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp disconnected:', reason);
    isClientReady = false;
    // Try to reconnect
    setTimeout(() => {
      console.log('🔄 Trying to reconnect...');
      client.initialize();
    }, 5000);
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    isClientReady = false;
  });

  console.log('🚀 Starting WhatsApp client...');
  client.initialize();
}

// ============================================
// SEND MESSAGE FUNCTION
// ============================================
async function sendMessage(number, message) {
  if (!isClientReady) {
    console.log('⚠️ WhatsApp not ready yet');
    return { success: false, error: 'WhatsApp not connected' };
  }

  try {
    // Format number: remove +, spaces, - and add @c.us
    const formattedNumber = number.replace(/[\s+\-]/g, '') + '@c.us';
    await client.sendMessage(formattedNumber, message);
    console.log(`✅ Message sent to ${number}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send to ${number}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// SEND TO ALL CONFIGURED NUMBERS
// ============================================
async function sendToAll(message) {
  const results = [];
  for (const number of NOTIFICATION_NUMBERS) {
    const result = await sendMessage(number, message);
    results.push({ number, ...result });
  }
  return results;
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    whatsapp: isClientReady ? 'connected' : 'disconnected'
  });
});

// Send expense notification
app.post('/api/expense', async (req, res) => {
  const { amount, description, accountName, date, category } = req.body;

  if (!amount || !description || !accountName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);

  const message = `🔴 *EXPENSE ALERT - MF Cash*
━━━━━━━━━━━━━━━━━━━━
💰 *Amount:* ${formattedAmount}
📝 *Description:* ${description}
📁 *Account:* ${accountName}
📂 *Category:* ${category || 'N/A'}
📅 *Date:* ${date || new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
_MF Cash - Expense Tracker_`;

  const results = await sendToAll(message);
  res.json({ success: true, results });
});

// Send deposit notification
app.post('/api/deposit', async (req, res) => {
  const { amount, source, date } = req.body;

  if (!amount || !source) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);

  const message = `🟢 *CASH RECEIVED - MF Cash*
━━━━━━━━━━━━━━━━━━━━
💰 *Amount:* ${formattedAmount}
📥 *Source:* ${source}
📅 *Date:* ${date || new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
_Cash added to Main Account_
_MF Cash - Expense Tracker_`;

  const results = await sendToAll(message);
  res.json({ success: true, results });
});

// Send custom message
app.post('/api/send', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Missing number or message' });
  }

  const result = await sendMessage(number, message);
  res.json(result);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('\n============================================');
  console.log(`🚀 MF Cash WhatsApp Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log('============================================\n');
  initWhatsApp();
});
