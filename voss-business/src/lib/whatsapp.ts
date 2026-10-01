/** Public business contact, supplied by the VOSS owner. */
export const WHATSAPP_NUMBER = '923107417990';
export const FACEBOOK_PAGE = 'https://www.facebook.com/p/Vosspk-61593772016374/';
export const META_INBOX = 'https://business.facebook.com/latest/inbox';
export function whatsappLink(message = '') {
  return `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
export function customerWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, '').replace(/^0/, '92');
  return /^923\d{9}$/.test(digits) ? `https://wa.me/${digits}` : null;
}
