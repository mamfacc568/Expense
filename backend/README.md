# MF Cash WhatsApp Server

## Deployment Instructions for Hostinger VPS

### Step 1: Upload Files
Upload the `backend` folder to your Hostinger VPS using FTP or File Manager.

### Step 2: Install Dependencies
Connect to your VPS via SSH and run:
```bash
cd backend
npm install
```

### Step 3: Configure Phone Numbers
Edit `server.js` and change the `NOTIFICATION_NUMBERS` array:
```javascript
const NOTIFICATION_NUMBERS = [
  '919876543210',  // Your number with country code (no +)
];
```

### Step 4: Start the Server
```bash
node server.js
```

### Step 5: Scan QR Code
1. The terminal will show a QR code
2. Open WhatsApp on your phone
3. Go to Settings > Linked Devices > Link a Device
4. Scan the QR code shown in terminal

### Step 6: Keep Server Running (Important!)
Install PM2 to keep the server running 24/7:
```bash
npm install -g pm2
pm2 start server.js --name "mf-cash-whatsapp"
pm2 save
pm2 startup
```

### Step 7: Update Frontend
In your frontend app, update the API URL in `src/services/whatsappService.ts`:
```typescript
const API_URL = 'http://YOUR_VPS_IP:3000/api';
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Check server status |
| `/api/expense` | POST | Send expense notification |
| `/api/deposit` | POST | Send deposit notification |
| `/api/send` | POST | Send custom message |

## Expense Notification Request
```json
POST /api/expense
{
  "amount": 5000,
  "description": "Office supplies",
  "accountName": "Office Account",
  "date": "01-Apr-2026",
  "category": "Supplies"
}
```

## Deposit Notification Request
```json
POST /api/deposit
{
  "amount": 10000,
  "source": "Cash from sales",
  "date": "01-Apr-2026"
}
```

## Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
kill -9 <PID>
```

### WhatsApp disconnected
The server will auto-reconnect. If issues persist:
```bash
pm2 restart mf-cash-whatsapp
```

### Clear WhatsApp session and re-scan
```bash
rm -rf .wwebjs_auth
pm2 restart mf-cash-whatsapp
```
