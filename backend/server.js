const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = 3000;

// ============================================
// CONFIGURATION
// ============================================
const NOTIFICATION_NUMBERS = [
  '918448790859',  // Receiver number (country code + number, no +)
];
// ============================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let client;
let isClientReady = false;

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
  });

  client.on('ready', () => {
    console.log('\n✅ WhatsApp Client is ready!');
    isClientReady = true;
  });

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp disconnected:', reason);
    isClientReady = false;
    setTimeout(() => {
      console.log('🔄 Reconnecting...');
      client.initialize();
    }, 5000);
  });

  console.log('🚀 Starting WhatsApp client...');
  client.initialize();
}

// Send message to number
async function sendMessage(number, message) {
  if (!isClientReady) return { success: false, error: 'Not connected' };
  try {
    const chatId = number.replace(/[\s+\-]/g, '') + '@c.us';
    await client.sendMessage(chatId, message);
    console.log(`✅ Message sent to ${number}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// Send message with image
async function sendMessageWithImage(number, message, imageBase64) {
  if (!isClientReady) return { success: false, error: 'Not connected' };
  try {
    const chatId = number.replace(/[\s+\-]/g, '') + '@c.us';
    
    if (imageBase64) {
      const media = new MessageMedia('image/jpeg', imageBase64.split(',')[1]);
      await client.sendMessage(chatId, media, { caption: message });
      console.log(`✅ Message with image sent to ${number}`);
    } else {
      await client.sendMessage(chatId, message);
      console.log(`✅ Message sent to ${number}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// Send to all configured numbers
async function sendToAll(message, imageBase64 = null) {
  const results = [];
  for (const number of NOTIFICATION_NUMBERS) {
    const result = imageBase64 
      ? await sendMessageWithImage(number, message, imageBase64)
      : await sendMessage(number, message);
    results.push({ number, ...result });
  }
  return results;
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

// ============================================
// API ENDPOINTS
// ============================================

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', whatsapp: isClientReady ? 'connected' : 'disconnected' });
});

// Expense notification (with image support)
app.post('/api/expense', async (req, res) => {
  const { amount, description, accountName, date, category, image } = req.body;
  if (!amount || !description || !accountName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const message = `🔴 *EXPENSE ALERT - MF Cash*
━━━━━━━━━━━━━━━━━━━━
💰 *Amount:* ${formatCurrency(amount)}
📝 *Description:* ${description}
📁 *Account:* ${accountName}
📂 *Category:* ${category || 'N/A'}
📅 *Date:* ${date || new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
_MF Cash - Expense Tracker_`;

  const results = await sendToAll(message, image);
  res.json({ success: true, results });
});

// Deposit notification
app.post('/api/deposit', async (req, res) => {
  const { amount, source, date } = req.body;
  if (!amount || !source) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const message = `🟢 *CASH RECEIVED - MF Cash*
━━━━━━━━━━━━━━━━━━━━
💰 *Amount:* ${formatCurrency(amount)}
📥 *Source:* ${source}
📅 *Date:* ${date || new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
_Cash added to Main Account_
_MF Cash - Expense Tracker_`;

  const results = await sendToAll(message);
  res.json({ success: true, results });
});

// Scrap sale notification (with image support)
app.post('/api/scrap-sale', async (req, res) => {
  const { amount, vendorName, date, image } = req.body;
  if (!amount || !vendorName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const message = `🟠 *SCRAP SOLD - MF Cash*
━━━━━━━━━━━━━━━━━━━━
💰 *Amount:* ${formatCurrency(amount)}
👤 *Vendor:* ${vendorName}
📅 *Date:* ${date || new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
_Scrap sale recorded_
_MF Cash - Expense Tracker_`;

  const results = await sendToAll(message, image);
  res.json({ success: true, results });
});

// Scrap payment notification
app.post('/api/scrap-payment', async (req, res) => {
  const { amount, vendorName, paymentMethod, upiName, date } = req.body;
  if (!amount || !vendorName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const methodText = paymentMethod === 'upi' 
    ? `📱 *UPI Payment*${upiName ? `\n🔖 *UPI ID:* ${upiName}` : ''}`
    : `💵 *Cash Payment*`;

  const message = `🟢 *SCRAP PAYMENT RECEIVED - MF Cash*
━━━━━━━━━━━━━━━━━━━━
💰 *Amount:* ${formatCurrency(amount)}
👤 *Vendor:* ${vendorName}
${methodText}
📅 *Date:* ${date || new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
_Payment received from vendor_
_MF Cash - Expense Tracker_`;

  const results = await sendToAll(message);
  res.json({ success: true, results });
});

// Custom message
app.post('/api/send', async (req, res) => {
  const { number, message } = req.body;
  if (!number || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const result = await sendMessage(number, message);
  res.json(result);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('\n============================================');
  console.log(`🚀 MF Cash WhatsApp Server on port ${PORT}`);
  console.log('============================================\n');
  initWhatsApp();
});
