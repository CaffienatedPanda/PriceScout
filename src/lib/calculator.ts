/**
 * Profit/overhead calculator for resale flipping decisions.
 *
 * All inputs are plain numbers so this module has zero dependencies and can
 * be unit tested (or reused server-side) without touching React or the
 * Gemini client.
 */

export type FeeModel = {
  /** Marketplace/platform fee, as a percent of the sale price (e.g. 13.25 for eBay). */
  platformFeePercent: number;
  /** Fixed payment-processing fee per order (e.g. PayPal's ~$0.49). */
  paymentFixedFee: number;
  /** Payment-processing fee, as a percent of the sale price (e.g. 2.9). */
  paymentFeePercent: number;
};

export type CalculatorInput = {
  /** What you'd pay (or think you can pay) to acquire the item. */
  itemCost: number;
  /** Expected resale/sale price. */
  salePrice: number;
  /** Shipping cost you'll eat (materials + postage), if you cover it. */
  shippingCost: number;
  /** Anything else: sales tax paid on acquisition, cleaning supplies, mileage, etc. */
  miscCost: number;
  fees: FeeModel;
};

export type CalculatorResult = {
  platformFeeAmount: number;
  paymentFeeAmount: number;
  totalFees: number;
  totalCost: number;
  netProfit: number;
  /** Net profit as a percent of sale price. */
  marginPercent: number;
  /** Net profit as a percent of item cost — the "return on the buy". */
  roiPercent: number;
  /** Simple worthwhile/marginal/skip verdict for quick field triage. */
  verdict: "worthwhile" | "marginal" | "skip";
};

export const PLATFORM_PRESETS: Record<string, FeeModel> = {
  ebay: { platformFeePercent: 13.25, paymentFixedFee: 0.3, paymentFeePercent: 2.9 },
  poshmark: { platformFeePercent: 20, paymentFixedFee: 0, paymentFeePercent: 0 },
  mercari: { platformFeePercent: 10, paymentFixedFee: 0.3, paymentFeePercent: 2.9 },
  facebook: { platformFeePercent: 5, paymentFixedFee: 0, paymentFeePercent: 0 },
  custom: { platformFeePercent: 0, paymentFixedFee: 0, paymentFeePercent: 0 },
};

export function calculate(input: CalculatorInput): CalculatorResult {
  const { itemCost, salePrice, shippingCost, miscCost, fees } = input;

  const platformFeeAmount = round2((salePrice * fees.platformFeePercent) / 100);
  const paymentFeeAmount = round2(
    fees.paymentFixedFee + (salePrice * fees.paymentFeePercent) / 100,
  );
  const totalFees = round2(platformFeeAmount + paymentFeeAmount);
  const totalCost = round2(itemCost + shippingCost + miscCost + totalFees);
  const netProfit = round2(salePrice - totalCost);

  const marginPercent = salePrice > 0 ? round2((netProfit / salePrice) * 100) : 0;
  const roiPercent = itemCost > 0 ? round2((netProfit / itemCost) * 100) : 0;

  let verdict: CalculatorResult["verdict"] = "skip";
  if (netProfit >= 15 && marginPercent >= 20) verdict = "worthwhile";
  else if (netProfit > 0) verdict = "marginal";

  return {
    platformFeeAmount,
    paymentFeeAmount,
    totalFees,
    totalCost,
    netProfit,
    marginPercent,
    roiPercent,
    verdict,
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
