import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Woolworths Full Cream Milk 2L',
    category: 'Dairy',
    emoji: '🥛',
    prices: { woolworths: 3.10, coles: 3.10, aldi: 3.10, iga: 3.25 },
    specials: { iga: 2.90 },
    history: [3.10, 3.10, 3.00, 3.00, 2.90, 2.90, 3.10, 3.10, 3.10, 3.10, 3.10, 3.10],
    daysLeft: 2
  },
  {
    id: '2',
    name: 'San Remo Spaghetti 500g',
    category: 'Pantry',
    emoji: '🍝',
    prices: { woolworths: 2.80, coles: 2.80, aldi: 2.50, iga: 3.00 },
    specials: { woolworths: 1.40, coles: 1.40 },
    history: [2.80, 2.80, 1.40, 2.80, 2.80, 2.80, 1.40, 2.80, 2.80, 2.80, 2.80, 2.80],
    daysLeft: 4
  },
  {
    id: '3',
    name: 'Mainland Tasty Cheese 500g',
    category: 'Dairy',
    emoji: '🧀',
    prices: { woolworths: 11.50, coles: 12.00, aldi: 9.90, iga: 12.50 },
    specials: { coles: 8.50 },
    history: [11.50, 11.00, 11.00, 10.50, 10.50, 11.50, 11.50, 11.50, 11.50, 11.50, 11.50, 11.50],
    daysLeft: 5
  },
  {
    id: '4',
    name: 'Cadbury Dairy Milk 180g',
    category: 'Pantry',
    emoji: '🍫',
    prices: { woolworths: 6.00, coles: 6.00, aldi: 5.50, iga: 6.50 },
    specials: { woolworths: 3.50, coles: 3.50 },
    history: [6.00, 3.00, 6.00, 6.00, 3.50, 6.00, 6.00, 3.00, 6.00, 6.00, 6.00, 6.00],
    daysLeft: 3
  },
  {
    id: '5',
    name: 'Huggies Ultra Dry Nappies 52pk',
    category: 'Household',
    emoji: '👶',
    prices: { woolworths: 32.00, coles: 32.00, aldi: 28.00, iga: 35.00 },
    specials: { woolworths: 24.00 },
    history: [32.00, 32.00, 32.00, 24.00, 32.00, 32.00, 32.00, 32.00, 24.00, 32.00, 32.00, 32.00],
    daysLeft: 6
  },
  {
    id: '6',
    name: 'Beef Mince 500g',
    category: 'Meat',
    emoji: '🥩',
    prices: { woolworths: 8.00, coles: 8.50, aldi: 7.50, iga: 9.00 },
    specials: { aldi: 6.00 },
    history: [8.00, 8.00, 7.50, 7.50, 8.00, 8.00, 8.00, 8.00, 8.00, 8.00, 8.00, 8.00],
    daysLeft: 1
  },
  {
    id: '7',
    name: 'Pink Lady Apples 1kg',
    category: 'Fruit & Veg',
    emoji: '🍎',
    prices: { woolworths: 4.50, coles: 4.50, aldi: 3.90, iga: 5.00 },
    specials: { coles: 3.50 },
    history: [4.50, 4.00, 3.50, 4.50, 4.50, 5.00, 5.00, 4.50, 4.50, 4.50, 4.50, 4.50],
    daysLeft: 7
  },
  {
    id: '8',
    name: 'Tip Top The One White Bread 700g',
    category: 'Bakery',
    emoji: '🍞',
    prices: { woolworths: 4.20, coles: 4.20, aldi: 3.50, iga: 4.50 },
    specials: { woolworths: 3.20 },
    history: [4.20, 4.20, 4.20, 3.20, 4.20, 4.20, 4.20, 4.20, 4.20, 4.20, 4.20, 4.20],
    daysLeft: 2
  },
  {
    id: '9',
    name: 'Coca-Cola 24 x 375ml',
    category: 'Drinks',
    emoji: '🥤',
    prices: { woolworths: 36.00, coles: 36.00, aldi: 32.00, iga: 38.00 },
    specials: { woolworths: 18.00, coles: 18.00 },
    history: [36.00, 18.00, 36.00, 36.00, 18.00, 36.00, 36.00, 18.00, 36.00, 36.00, 36.00, 36.00],
    daysLeft: 3
  },
  {
    id: '10',
    name: 'Finish Ultimate Pro 46pk',
    category: 'Household',
    emoji: '🧼',
    prices: { woolworths: 45.00, coles: 45.00, aldi: 40.00, iga: 48.00 },
    specials: { coles: 22.50 },
    history: [45.00, 45.00, 22.50, 45.00, 45.00, 45.00, 22.50, 45.00, 45.00, 45.00, 45.00, 45.00],
    daysLeft: 5
  },
  { id: '11', name: 'Avocado Each', category: 'Fruit & Veg', emoji: '🥑', prices: { woolworths: 1.50, coles: 1.50, aldi: 1.20, iga: 1.80 }, specials: { woolworths: 1.00 }, history: [1.50, 1.20, 1.00, 2.50, 2.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50] },
  { id: '12', name: 'Free Range Eggs 12pk', category: 'Dairy', emoji: '🥚', prices: { woolworths: 5.50, coles: 5.50, aldi: 4.80, iga: 6.00 }, specials: {}, history: [5.50, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50] },
  { id: '13', name: 'Chicken Breast 1kg', category: 'Meat', emoji: '🍗', prices: { woolworths: 15.00, coles: 15.00, aldi: 13.50, iga: 16.00 }, specials: { iga: 12.00 }, history: [15.00, 14.50, 14.00, 15.00, 15.00, 15.00, 15.00, 15.00, 15.00, 15.00, 15.00, 15.00] },
  { id: '14', name: 'Bega Peanut Butter 475g', category: 'Pantry', emoji: '🥜', prices: { woolworths: 6.50, coles: 6.50, aldi: 5.80, iga: 7.00 }, specials: { woolworths: 5.00 }, history: [6.50, 6.50, 5.00, 6.50, 6.50, 6.50, 6.50, 6.50, 6.50, 6.50, 6.50, 6.50] },
  { id: '15', name: 'Vegemite 380g', category: 'Pantry', emoji: '🏺', prices: { woolworths: 7.00, coles: 7.00, aldi: 6.50, iga: 7.50 }, specials: {}, history: [7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00] },
  { id: '16', name: 'Helga\'s Wholemeal Bread', category: 'Bakery', emoji: '🍞', prices: { woolworths: 5.00, coles: 5.00, aldi: 4.20, iga: 5.50 }, specials: { coles: 4.00 }, history: [5.00, 5.00, 5.00, 4.00, 5.00, 5.00, 5.00, 5.00, 5.00, 5.00, 5.00, 5.00] },
  { id: '17', name: 'Banana 1kg', category: 'Fruit & Veg', emoji: '🍌', prices: { woolworths: 4.00, coles: 4.00, aldi: 3.50, iga: 4.50 }, specials: { aldi: 2.90 }, history: [4.00, 3.50, 3.00, 3.50, 4.00, 4.00, 4.00, 4.00, 4.00, 4.00, 4.00, 4.00] },
  { id: '18', name: 'Chobani Greek Yogurt 907g', category: 'Dairy', emoji: '🍦', prices: { woolworths: 8.50, coles: 8.50, aldi: 7.50, iga: 9.00 }, specials: { woolworths: 6.50 }, history: [8.50, 8.50, 6.50, 8.50, 8.50, 8.50, 8.50, 8.50, 8.50, 8.50, 8.50, 8.50] },
  { id: '19', name: 'Lamb Chops 1kg', category: 'Meat', emoji: '🥩', prices: { woolworths: 22.00, coles: 23.00, aldi: 19.50, iga: 25.00 }, specials: { coles: 18.00 }, history: [22.00, 21.00, 20.00, 22.00, 22.00, 23.00, 23.00, 22.00, 22.00, 22.00, 22.00, 22.00] },
  { id: '20', name: 'V Energy Drink 4pk', category: 'Drinks', emoji: '🔋', prices: { woolworths: 11.00, coles: 11.00, aldi: 9.50, iga: 12.00 }, specials: { woolworths: 7.00 }, history: [11.00, 11.00, 7.00, 11.00, 11.00, 11.00, 7.00, 11.00, 11.00, 11.00, 11.00, 11.00] },
  { id: '21', name: 'Uncle Tobys Oats 1kg', category: 'Pantry', emoji: '🥣', prices: { woolworths: 7.50, coles: 7.50, aldi: 6.80, iga: 8.00 }, specials: { coles: 5.50 }, history: [7.50, 7.50, 5.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50] },
  { id: '22', name: 'Nescafe Blend 43 500g', category: 'Pantry', emoji: '☕', prices: { woolworths: 24.00, coles: 24.00, aldi: 20.00, iga: 26.00 }, specials: { woolworths: 16.00 }, history: [24.00, 24.00, 16.00, 24.00, 24.00, 24.00, 16.00, 24.00, 24.00, 24.00, 24.00, 24.00] },
  { id: '23', name: 'Weet-Bix 1.2kg', category: 'Pantry', emoji: '🌾', prices: { woolworths: 6.00, coles: 6.00, aldi: 5.50, iga: 6.50 }, specials: { iga: 5.00 }, history: [6.00, 6.00, 6.00, 5.00, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00] },
  { id: '24', name: 'Red Bull 4pk', category: 'Drinks', emoji: '🐂', prices: { woolworths: 12.00, coles: 12.00, aldi: 10.50, iga: 13.00 }, specials: { coles: 8.00 }, history: [12.00, 12.00, 8.00, 12.00, 12.00, 12.00, 8.00, 12.00, 12.00, 12.00, 12.00, 12.00] },
  { id: '25', name: 'Colgate Total 200g', category: 'Household', emoji: '🪥', prices: { woolworths: 10.00, coles: 10.00, aldi: 8.50, iga: 11.00 }, specials: { woolworths: 5.00 }, history: [10.00, 10.00, 5.00, 10.00, 10.00, 10.00, 5.00, 10.00, 10.00, 10.00, 10.00, 10.00] },
  { id: '26', name: 'Dairy Milk Marvellous Creations', category: 'Pantry', emoji: '🍬', prices: { woolworths: 6.00, coles: 6.00, aldi: 5.50, iga: 6.50 }, specials: { coles: 3.50 }, history: [6.00, 6.00, 3.50, 6.00, 6.00, 6.00, 3.50, 6.00, 6.00, 6.00, 6.00, 6.00] },
  { id: '27', name: 'Smith\'s Variety Pack 20pk', category: 'Pantry', emoji: '🥔', prices: { woolworths: 10.00, coles: 10.00, aldi: 9.00, iga: 11.00 }, specials: { woolworths: 7.00 }, history: [10.00, 10.00, 7.00, 10.00, 10.00, 10.00, 7.00, 10.00, 10.00, 10.00, 10.00, 10.00] },
  { id: '28', name: 'Oral-B Toothbrush', category: 'Household', emoji: '🪥', prices: { woolworths: 5.00, coles: 5.00, aldi: 4.50, iga: 5.50 }, specials: { coles: 2.50 }, history: [5.00, 5.00, 2.50, 5.00, 5.00, 5.00, 2.50, 5.00, 5.00, 5.00, 5.00, 5.00] },
  { id: '29', name: 'Gillette Fusion 5 Cartridges', category: 'Household', emoji: '🪒', prices: { woolworths: 35.00, coles: 35.00, aldi: 32.00, iga: 38.00 }, specials: { woolworths: 25.00 }, history: [35.00, 35.00, 25.00, 35.00, 35.00, 35.00, 25.00, 35.00, 35.00, 35.00, 35.00, 35.00] },
  { id: '30', name: 'Fairy Platinum 52pk', category: 'Household', emoji: '🧼', prices: { woolworths: 48.00, coles: 48.00, aldi: 42.00, iga: 52.00 }, specials: { coles: 24.00 }, history: [48.00, 48.00, 24.00, 48.00, 48.00, 48.00, 24.00, 48.00, 48.00, 48.00, 48.00, 48.00] },
  { id: '31', name: 'Quilton Toilet Tissue 36pk', category: 'Household', emoji: '🧻', prices: { woolworths: 22.00, coles: 22.00, aldi: 19.50, iga: 24.00 }, specials: { woolworths: 16.00 }, history: [22.00, 16.00, 22.00, 22.00, 16.00, 22.00, 22.00, 16.00, 22.00, 22.00, 22.00, 22.00] },
  { id: '32', name: 'Milo 1.1kg', category: 'Drinks', emoji: '🥤', prices: { woolworths: 14.50, coles: 14.50, aldi: 13.00, iga: 16.00 }, specials: { coles: 11.00 }, history: [14.50, 14.50, 11.00, 14.50, 14.50, 14.50, 11.00, 14.50, 14.50, 14.50, 14.50, 14.50] },
  { id: '33', name: 'Twinings Tea 100pk', category: 'Drinks', emoji: '☕', prices: { woolworths: 13.50, coles: 13.50, aldi: 12.00, iga: 15.00 }, specials: { woolworths: 7.50 }, history: [13.50, 13.50, 7.50, 13.50, 13.50, 13.50, 7.50, 13.50, 13.50, 13.50, 13.50, 13.50] },
  { id: '34', name: 'Kettle Chips 175g', category: 'Pantry', emoji: '🥔', prices: { woolworths: 6.00, coles: 6.00, aldi: 5.50, iga: 6.50 }, specials: { coles: 3.50 }, history: [6.00, 6.00, 3.50, 6.00, 6.00, 6.00, 3.50, 6.00, 6.00, 6.00, 6.00, 6.00] },
  { id: '35', name: 'Connoisseur Ice Cream 1L', category: 'Dairy', emoji: '🍦', prices: { woolworths: 12.00, coles: 12.00, aldi: 10.50, iga: 13.50 }, specials: { woolworths: 8.00 }, history: [12.00, 12.00, 8.00, 12.00, 12.00, 12.00, 8.00, 12.00, 12.00, 12.00, 12.00, 12.00] },
  { id: '36', name: 'Omo Washing Powder 2kg', category: 'Household', emoji: '🧺', prices: { woolworths: 26.00, coles: 26.00, aldi: 22.00, iga: 28.00 }, specials: { coles: 13.00 }, history: [26.00, 26.00, 13.00, 26.00, 26.00, 26.00, 13.00, 26.00, 26.00, 26.00, 26.00, 26.00] },
  { id: '37', name: 'Head & Shoulders 660ml', category: 'Household', emoji: '🧴', prices: { woolworths: 18.00, coles: 18.00, aldi: 16.00, iga: 20.00 }, specials: { woolworths: 12.00 }, history: [18.00, 18.00, 12.00, 18.00, 18.00, 18.00, 12.00, 18.00, 18.00, 18.00, 18.00, 18.00] },
  { id: '38', name: 'Palmolive Soap 4pk', category: 'Household', emoji: '🧼', prices: { woolworths: 6.00, coles: 6.00, aldi: 5.00, iga: 7.00 }, specials: { coles: 4.00 }, history: [6.00, 6.00, 4.00, 6.00, 6.00, 6.00, 4.00, 6.00, 6.00, 6.00, 6.00, 6.00] },
  { id: '39', name: 'Whiskas Dry Cat Food 1kg', category: 'Household', emoji: '🐱', prices: { woolworths: 9.00, coles: 9.00, aldi: 8.00, iga: 10.00 }, specials: { woolworths: 7.00 }, history: [9.00, 9.00, 7.00, 9.00, 9.00, 9.00, 7.00, 9.00, 9.00, 9.00, 9.00, 9.00] },
  { id: '40', name: 'Pedigree Dog Food 3kg', category: 'Household', emoji: '🐶', prices: { woolworths: 15.00, coles: 15.00, aldi: 13.50, iga: 17.00 }, specials: { coles: 12.00 }, history: [15.00, 15.00, 12.00, 15.00, 15.00, 15.00, 12.00, 15.00, 15.00, 15.00, 15.00, 15.00] },
  { id: '41', name: 'Carman\'s Muesli Bars 6pk', category: 'Pantry', emoji: '🍫', prices: { woolworths: 6.50, coles: 6.50, aldi: 5.80, iga: 7.50 }, specials: { woolworths: 4.50 }, history: [6.50, 6.50, 4.50, 6.50, 6.50, 6.50, 4.50, 6.50, 6.50, 6.50, 6.50, 6.50] },
  { id: '42', name: 'Vogels Bread 600g', category: 'Bakery', emoji: '🍞', prices: { woolworths: 7.00, coles: 7.00, aldi: 6.50, iga: 7.80 }, specials: { aldi: 5.50 }, history: [7.00, 7.00, 7.00, 5.50, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00, 7.00] },
  { id: '43', name: 'Abbotts Bakery Bread', category: 'Bakery', emoji: '🍞', prices: { woolworths: 4.80, coles: 4.80, aldi: 4.20, iga: 5.20 }, specials: { woolworths: 3.80 }, history: [4.80, 4.80, 4.80, 3.80, 4.80, 4.80, 4.80, 4.80, 4.80, 4.80, 4.80, 4.80] },
  { id: '44', name: 'Powerade 600ml', category: 'Drinks', emoji: '🥤', prices: { woolworths: 4.00, coles: 4.00, aldi: 3.50, iga: 4.50 }, specials: { coles: 2.50 }, history: [4.00, 4.00, 2.50, 4.00, 4.00, 4.00, 2.50, 4.00, 4.00, 4.00, 4.00, 4.00] },
  { id: '45', name: 'Bundaberg Ginger Beer 10pk', category: 'Drinks', emoji: '🍺', prices: { woolworths: 14.00, coles: 14.00, aldi: 12.50, iga: 15.50 }, specials: { woolworths: 11.00 }, history: [14.00, 14.00, 11.00, 14.00, 14.00, 14.00, 11.00, 14.00, 14.00, 14.00, 14.00, 14.00] },
  { id: '46', name: 'Strepsils 16pk', category: 'Household', emoji: '💊', prices: { woolworths: 12.00, coles: 12.00, aldi: 10.50, iga: 13.50 }, specials: { coles: 9.00 }, history: [12.00, 12.00, 9.00, 12.00, 12.00, 12.00, 9.00, 12.00, 12.00, 12.00, 12.00, 12.00] },
  { id: '47', name: 'Nurofen 24pk', category: 'Household', emoji: '💊', prices: { woolworths: 8.50, coles: 8.50, aldi: 7.50, iga: 10.00 }, specials: { woolworths: 6.50 }, history: [8.50, 8.50, 6.50, 8.50, 8.50, 8.50, 6.50, 8.50, 8.50, 8.50, 8.50, 8.50] },
  { id: '48', name: 'Morning Fresh Liquid 900ml', category: 'Household', emoji: '🧼', prices: { woolworths: 9.00, coles: 9.00, aldi: 8.00, iga: 10.50 }, specials: { coles: 4.50 }, history: [9.00, 9.00, 4.50, 9.00, 9.00, 9.00, 4.50, 9.00, 9.00, 9.00, 9.00, 9.00] },
  { id: '49', name: 'Aeroplane Jelly', category: 'Pantry', emoji: '🍮', prices: { woolworths: 1.50, coles: 1.50, aldi: 1.20, iga: 1.80 }, specials: { aldi: 1.00 }, history: [1.50, 1.50, 1.20, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50, 1.50] },
  { id: '50', name: 'Bickfords Cordial 750ml', category: 'Drinks', emoji: '🥤', prices: { woolworths: 5.50, coles: 5.50, aldi: 4.80, iga: 6.50 }, specials: { woolworths: 4.00 }, history: [5.50, 5.50, 4.00, 5.50, 5.50, 5.50, 4.00, 5.50, 5.50, 5.50, 5.50, 5.50] },
  { id: '51', name: 'Mainland Salted Butter 250g', category: 'Dairy', emoji: '🧈', prices: { woolworths: 6.00, coles: 6.00, aldi: 5.00, iga: 7.00 }, specials: { iga: 5.50 }, history: [6.00, 6.00, 6.00, 5.50, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00] },
  { id: '52', name: 'Devondale Milk 1L', category: 'Dairy', emoji: '🥛', prices: { woolworths: 2.20, coles: 2.20, aldi: 2.00, iga: 2.50 }, specials: { coles: 1.80 }, history: [2.20, 2.20, 1.80, 2.20, 2.20, 2.20, 2.20, 2.20, 2.20, 2.20, 2.20, 2.20] },
  { id: '53', name: 'Philadelphia Cream Cheese', category: 'Dairy', emoji: '🧀', prices: { woolworths: 5.50, coles: 5.50, aldi: 4.80, iga: 6.50 }, specials: { woolworths: 4.00 }, history: [5.50, 5.50, 4.00, 5.50, 5.50, 5.50, 4.00, 5.50, 5.50, 5.50, 5.50, 5.50] },
  { id: '54', name: 'Golden Circle Juice 1L', category: 'Drinks', emoji: '🧃', prices: { woolworths: 3.50, coles: 3.50, aldi: 2.80, iga: 4.00 }, specials: { coles: 1.75 }, history: [3.50, 3.50, 1.75, 3.50, 3.50, 3.50, 1.75, 3.50, 3.50, 3.50, 3.50, 3.50] },
  { id: '55', name: 'Lipton Ice Tea 1.5L', category: 'Drinks', emoji: '🧋', prices: { woolworths: 5.00, coles: 5.00, aldi: 4.20, iga: 6.00 }, specials: { woolworths: 3.00 }, history: [5.00, 5.00, 3.00, 5.00, 5.00, 5.00, 3.00, 5.00, 5.00, 5.00, 5.00, 5.00] },
  { id: '56', name: 'Heinz Tomato Soup 535g', category: 'Pantry', emoji: '🥫', prices: { woolworths: 3.50, coles: 3.50, aldi: 3.00, iga: 4.00 }, specials: { iga: 2.50 }, history: [3.50, 3.50, 3.50, 2.50, 3.50, 3.50, 3.50, 3.50, 3.50, 3.50, 3.50, 3.50] },
  { id: '57', name: 'John West Tuna 95g', category: 'Pantry', emoji: '🐟', prices: { woolworths: 2.50, coles: 2.50, aldi: 2.00, iga: 3.00 }, specials: { woolworths: 1.25, coles: 1.25 }, history: [2.50, 2.50, 1.25, 2.50, 2.50, 2.50, 1.25, 2.50, 2.50, 2.50, 2.50, 2.50] },
  { id: '58', name: 'Leggo\'s Pasta Sauce 500g', category: 'Pantry', emoji: '🍅', prices: { woolworths: 4.00, coles: 4.00, aldi: 3.50, iga: 4.80 }, specials: { aldi: 2.50 }, history: [4.00, 4.00, 4.00, 2.50, 4.00, 4.00, 4.00, 4.00, 4.00, 4.00, 4.00, 4.00] },
  { id: '59', name: 'McCain Chips 750g', category: 'Pantry', emoji: '🍟', prices: { woolworths: 5.50, coles: 5.50, aldi: 4.80, iga: 6.50 }, specials: { woolworths: 3.50 }, history: [5.50, 5.50, 3.50, 5.50, 5.50, 5.50, 3.50, 5.50, 5.50, 5.50, 5.50, 5.50] },
  { id: '60', name: 'Birds Eye Fish Fingers 1kg', category: 'Pantry', emoji: '🐟', prices: { woolworths: 16.00, coles: 16.00, aldi: 14.50, iga: 18.00 }, specials: { coles: 12.00 }, history: [16.00, 16.00, 12.00, 16.00, 16.00, 16.00, 12.00, 16.00, 16.00, 16.00, 16.00, 16.00] }
];

export const getCheapestForProduct = (product: Product) => {
  const allPrices = [
    { store: 'woolworths' as const, price: product.specials.woolworths ?? product.prices.woolworths },
    { store: 'coles' as const, price: product.specials.coles ?? product.prices.coles },
    { store: 'aldi' as const, price: product.specials.aldi ?? product.prices.aldi },
    { store: 'iga' as const, price: product.specials.iga ?? product.prices.iga },
  ];
  return allPrices.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
};

export const getStorePrice = (product: Product, store: string) => {
  const s = store as keyof typeof product.prices;
  return product.specials[s] ?? product.prices[s];
};
