export interface Stock {
  symbol: string;
  name: string;
  addedAt: string;
  price?: number;
  change?: number;
  changePercent?: number;
}
