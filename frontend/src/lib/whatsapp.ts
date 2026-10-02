import { formatIDR } from './utils';

const DEFAULT_WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';

/**
 * Generates official formatted WhatsApp inquiry link:
 * "Halo Usaha Baru Cycle, saya tertarik dengan [Product Name] seharga [Price]. Apakah stok masih ada?"
 */
export function generateWhatsAppOrderUrl(productName: string, price: number | string): string {
  const formattedPrice = formatIDR(price);
  const text = `Halo Usaha Baru Cycle, saya tertarik dengan ${productName} seharga ${formattedPrice}. Apakah stok masih ada?`;
  return `https://wa.me/${DEFAULT_WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates WhatsApp link to directly reply/contact a customer from Admin dashboard
 */
export function generateCustomerContactUrl(customerWa: string, customerName: string, productName: string): string {
  let cleanNumber = customerWa.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  }
  const text = `Halo Kak ${customerName}, terima kasih telah menghubungi Usaha Baru Cycle terkait ${productName}. Ada yang bisa kami bantu?`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
