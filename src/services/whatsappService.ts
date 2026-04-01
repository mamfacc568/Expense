// WhatsApp Service for MF Cash
// Update this URL to your Hostinger VPS IP address
const API_URL = 'http://YOUR_VPS_IP:3000/api';

interface ExpenseNotification {
  amount: number;
  description: string;
  accountName: string;
  date?: string;
  category?: string;
}

interface DepositNotification {
  amount: number;
  source: string;
  date?: string;
}

// Check if WhatsApp server is connected
export async function checkWhatsAppStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/status`);
    const data = await response.json();
    return data.whatsapp === 'connected';
  } catch (error) {
    console.log('WhatsApp server not available');
    return false;
  }
}

// Send expense notification
export async function sendExpenseNotification(data: ExpenseNotification): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        description: data.description,
        accountName: data.accountName,
        date: data.date || new Date().toLocaleDateString('en-IN'),
        category: data.category || 'N/A',
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.log('Failed to send WhatsApp notification:', error);
    return false;
  }
}

// Send deposit notification
export async function sendDepositNotification(data: DepositNotification): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        source: data.source,
        date: data.date || new Date().toLocaleDateString('en-IN'),
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.log('Failed to send WhatsApp notification:', error);
    return false;
  }
}
