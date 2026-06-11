export const DEFAULT_WHATSAPP_NUMBER = "6282318560003";
export const DEFAULT_WHATSAPP_MESSAGE = "Halo LUDO, saya ingin reservasi meja.";

export function createWhatsappUrl(phoneNumber: string, message: string) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
