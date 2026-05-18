export type Category = 'Meat' | 'Dairy' | 'Pantry' | 'Fruit & Veg' | 'Bakery' | 'Drinks' | 'Household';

export interface Prices {
  woolworths: number;
  coles: number;
  aldi: number;
  iga: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  prices: Prices;
  specials: Partial<Prices>;
  history: number[];
  daysLeft?: number;
}

export type Store = keyof Prices;

export interface ListProduct extends Product {
  quantity: number;
}

export interface SavingsLog {
  id: string;
  date: string;
  store: Store;
  amountSpent: number;
  amountSaved: number;
}

export type Tab = 'home' | 'list' | 'deals' | 'compare' | 'savings';
