// file: lambda/checkPriceThreshold.ts
const PRICE_THRESHOLD: number = parseFloat(process.env.PRICE_THRESHOLD || '10.5');

export const handler = async (event: { prices: Array<{ price: number, startDate: string, endDate: string }> }): Promise<{ Payload: { lowPrices: Array<{ price: number, startDate: string, endDate: string }> } }> => {
  const lowPrices = event.prices.filter(priceInfo => priceInfo.price < PRICE_THRESHOLD);
  return { Payload: { lowPrices: lowPrices } };
};
