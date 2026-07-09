/**
 * Formate un prix en FCFA (Franc CFA)
 * @param {number} price - Le prix à formater
 * @returns {string} - Le prix formaté (ex: "850 000 FCFA")
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace('XOF', 'FCFA');
}
