// WhatsApp Service for MF Cash
const API_URL = 'http://147.93.96.52:3000/api';

interface ExpenseNotification {
  amount: number;
  description: string;
  accountName: string;
  date?: string;
  category?: string;
  imageUrl?: string;
}

interface DepositNotification {
  amount: number;
  source: string;
  date?: string;
}

interface ScrapSaleNotification {
  amount: number;
  vendorName: string;
  date?: string;
  imageUrl?: string;
}

interface ScrapPaymentNotification {
  amount: number;
  vendorName: string;
  paymentMethod: string;
  upiName?: string;
  date?: string;
}

// Convert image URL to base64
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.log('Failed to convert image');
    return null;
  }
}

// Send expense notification (only if > 10000)
export async function sendExpenseNotification(data: ExpenseNotification): Promise<boolean> {
  try {
    let image = null;
    if (data.imageUrl) image = await imageUrlToBase64(data.imageUrl);

    const response = await fetch(`${API_URL}/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: data.amount,
        description: data.description,
        accountName: data.accountName,
        date: data.date || new Date().toLocaleDateString('en-IN'),
        category: data.category || 'N/A',
        image,
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.log('WhatsApp error:', error);
    return false;
  }
}

// Send deposit notification
export async function sendDepositNotification(data: DepositNotification): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: data.amount,
        source: data.source,
        date: data.date || new Date().toLocaleDateString('en-IN'),
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.log('WhatsApp error:', error);
    return false;
  }
}

// Send scrap sale notification (only if > 10000)
export async function sendScrapSaleNotification(data: ScrapSaleNotification): Promise<boolean> {
  try {
    let image = null;
    if (data.imageUrl) image = await imageUrlToBase64(data.imageUrl);

    const response = await fetch(`${API_URL}/scrap-sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: data.amount,
        vendorName: data.vendorName,
        date: data.date || new Date().toLocaleDateString('en-IN'),
        image,
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.log('WhatsApp error:', error);
    return false;
  }
}

// Send scrap payment notification
export async function sendScrapPaymentNotification(data: ScrapPaymentNotification): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/scrap-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: data.amount,
        vendorName: data.vendorName,
        paymentMethod: data.paymentMethod,
        upiName: data.upiName || '',
        date: data.date || new Date().toLocaleDateString('en-IN'),
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.log('WhatsApp error:', error);
    return false;
  }
}
