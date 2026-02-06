// VAT calculation utilities
export const VAT_RATE = 0.15; // 15% VAT

export function calculateVAT(priceExclVAT: number): number {
  return Math.round(priceExclVAT * VAT_RATE * 100) / 100;
}

export function calculateTotalWithVAT(priceExclVAT: number): number {
  return Math.round(priceExclVAT * (1 + VAT_RATE) * 100) / 100;
}

export function getDisplayPrice(price: number, vatEnabled: boolean): {
  priceExclVAT: number;
  vatAmount: number;
  totalPrice: number;
} {
  if (!vatEnabled) {
    return {
      priceExclVAT: price,
      vatAmount: 0,
      totalPrice: price,
    };
  }
  return {
    priceExclVAT: price,
    vatAmount: calculateVAT(price),
    totalPrice: calculateTotalWithVAT(price),
  };
}
