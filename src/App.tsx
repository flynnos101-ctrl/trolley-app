import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home as HomeIcon,
  ListChecks,
  Percent,
  Scale,
  PiggyBank,
  Search,
  X,
  ChevronRight,
  Share2,
  Plus,
  TrendingUp,
  Clock,
  ArrowRight,
  TrendingDown,
  Trash2,
  Calendar,
  DollarSign,
  Sparkle
} from 'lucide-react';
import { PRODUCTS, getCheapestForProduct, getStorePrice } from './data/products';
import { Product, Tab, ListProduct, SavingsLog, Store, Category } from './types';

// --- Utilities ---

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
};

const getStoreColor = (store: Store) => {
  switch (store) {
    case 'woolworths': return '#008332'; // w-green
    case 'coles': return '#EE1C25'; // c-red
    case 'aldi': return '#002B7F'; // a-blue
    case 'iga': return '#F58220'; // i-orange
    default: return '#6B7280';
  }
};

const getStoreName = (store: Store) => {
  return store.charAt(0).toUpperCase() + store.slice(1);
};

// --- Custom Hooks ---

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// --- Components ---

const CountUp = ({ end, duration = 1 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(progress * end);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{formatCurrency(count)}</span>;
};

const PriceHistoryChart = ({ history }: { history: number[] }) => {
  if (!history || history.length === 0) return null;

  const width = 300;
  const height = 100;
  const padding = 10;

  const minPrice = Math.min(...history) * 0.95;
  const maxPrice = Math.max(...history) * 1.05;
  const range = maxPrice - minPrice;

  const points = history.map((price, i) => {
    const x = (i / (history.length - 1)) * (width - 2 * padding) + padding;
    const y = height - ((price - minPrice) / range) * (height - 2 * padding) - padding;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2D7A4D" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2D7A4D" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area */}
      <path
        d={`${pathData} L ${width - padding},${height} L ${padding},${height} Z`}
        fill="url(#chartGradient)"
      />
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke="#2D7A4D"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Points */}
      {points.map((p, i) => {
        const [x, y] = p.split(',');
        return (
          <circle key={i} cx={x} cy={y} r="3" fill="#2D7A4D" className="hover:r-4 transition-all cursor-pointer">
            <title>{formatCurrency(history[i])}</title>
          </circle>
        );
      })}
    </svg>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [shoppingList, setShoppingList] = useLocalStorage<string[]>('trolley_list', []);
  const [savingsLogs, setSavingsLogs] = useLocalStorage<SavingsLog[]>('trolley_savings', []);
  const [savingsGoal, setSavingsGoal] = useLocalStorage<number>('trolley_goal', 50);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoggingShop, setIsLoggingShop] = useState(false);

  // --- Derived State ---

  const listProducts = useMemo(() => {
    return shoppingList.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [shoppingList]);

  const totalCheapestListPrice = useMemo(() => {
    return listProducts.reduce((sum, p) => sum + getCheapestForProduct(p).price, 0);
  }, [listProducts]);

  const wooliesOnlyListPrice = useMemo(() => {
    return listProducts.reduce((sum, p) => sum + (p.specials.woolworths ?? p.prices.woolworths), 0);
  }, [listProducts]);

  const savingsOnList = wooliesOnlyListPrice - totalCheapestListPrice;

  const currentMonthSavings = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return savingsLogs
      .filter(log => {
        const d = new Date(log.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, log) => sum + log.amountSaved, 0);
  }, [savingsLogs]);

  const totalAllTimeSavings = useMemo(() => {
    return savingsLogs.reduce((sum, log) => sum + log.amountSaved, 0);
  }, [savingsLogs]);

  // --- Actions ---

  const addToList = (id: string) => {
    if (!shoppingList.includes(id)) {
      setShoppingList([...shoppingList, id]);
    }
  };

  const removeFromList = (id: string) => {
    setShoppingList(shoppingList.filter(item => item !== id));
  };

  const clearList = () => {
    if (confirm('Clear your entire shopping list?')) {
      setShoppingList([]);
    }
  };

  const logShop = (log: Omit<SavingsLog, 'id'>) => {
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    setSavingsLogs([newLog, ...savingsLogs]);
    setIsLoggingShop(false);
  };

  const deleteLog = (id: string) => {
    setSavingsLogs(savingsLogs.filter(log => log.id !== id));
  };

  const resetAllData = () => {
    if (confirm('DANGER: This will delete ALL your settings, list, and savings history. Are you sure?')) {
      if (confirm('Confirm one more time – there is no undo!')) {
        setShoppingList([]);
        setSavingsLogs([]);
        setSavingsGoal(50);
        window.localStorage.clear();
        window.location.reload();
      }
    }
  };

  // --- Render Helpers ---

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'list', label: 'List', icon: ListChecks },
    { id: 'deals', label: 'Deals', icon: Percent },
    { id: 'compare', label: 'Compare', icon: Scale },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen bg-surface-bg text-text-main font-sans selection:bg-w-green/10 mb-20 md:mb-0 md:pl-60">
      {/* Sidebar - Desktop */}
      <nav className="fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-border-subtle hidden md:flex flex-col py-8 z-40">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-black tracking-tighter text-w-green">Trolley.</h1>
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Price Tracker</p>
        </div>

        <nav className="flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all border-l-4 ${
                activeTab === item.id
                  ? 'bg-green-50 text-w-green font-bold border-w-green'
                  : 'text-text-secondary hover:text-text-main border-transparent'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.id === 'list' && shoppingList.length > 0 && (
                <span className="ml-auto bg-surface-bg text-text-secondary px-2 py-0.5 rounded text-[10px] font-bold">
                  {shoppingList.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-6">
          <div className="bg-surface-bg p-4 border border-dashed border-border-subtle rounded-2xl text-center">
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Weekly Goal</p>
            <p className="text-lg font-black text-text-main">{formatCurrency(savingsGoal)}</p>
          </div>
        </div>
      </nav>

      {/* Bottom Nav - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border-subtle flex justify-around items-center p-2 md:hidden z-40 safe-bottom">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[64px] ${
              activeTab === item.id ? 'text-w-green' : 'text-text-secondary'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className="max-w-5xl mx-auto p-4 md:p-10 min-h-screen">
        <header className="mb-8 hidden md:block">
          <h2 className="text-2xl font-black text-text-main tracking-tight">{getGreeting()}, Alex</h2>
          <p className="text-sm text-text-secondary">You've saved {formatCurrency(currentMonthSavings)} so far this month.</p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === 'home' && (
              <HomeTab
                greeting={getGreeting()}
                savingsThisMonth={currentMonthSavings}
                savingsGoal={savingsGoal}
                setSavingsGoal={setSavingsGoal}
                listProducts={listProducts}
                onTabChange={setActiveTab}
                onProductSelect={setSelectedProduct}
              />
            )}
            {activeTab === 'list' && (
              <ListTab
                products={PRODUCTS}
                shoppingList={shoppingList}
                addToList={addToList}
                removeFromList={removeFromList}
                clearList={clearList}
                totalCheapest={totalCheapestListPrice}
                totalWoolies={wooliesOnlyListPrice}
              />
            )}
            {activeTab === 'deals' && (
              <DealsTab
                onProductSelect={setSelectedProduct}
              />
            )}
            {activeTab === 'compare' && (
              <CompareTab
                listProducts={listProducts}
                totalCheapest={totalCheapestListPrice}
                totalWoolies={wooliesOnlyListPrice}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'savings' && (
              <SavingsTab
                totalSaved={totalAllTimeSavings}
                history={savingsLogs}
                onLogShop={() => setIsLoggingShop(true)}
                onDeleteLog={deleteLog}
                onReset={resetAllData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToList={addToList}
            isInList={shoppingList.includes(selectedProduct.id)}
          />
        )}
        {isLoggingShop && (
          <LogShopModal
            onClose={() => setIsLoggingShop(false)}
            onSave={logShop}
            estimatedSaving={savingsOnList}
            estimatedSpend={totalCheapestListPrice}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Tab Components ---

function HomeTab({ savingsThisMonth, savingsGoal, setSavingsGoal, listProducts, onTabChange, onProductSelect }: any) {
  const topDeals = PRODUCTS.filter(p => Object.keys(p.specials).length > 0).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Savings Hero Card */}
      <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-8 rounded-3xl shadow-sm border-none text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 w-full">
          <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2">Total Saved This Month</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black tracking-tighter">{formatCurrency(savingsThisMonth)}</h2>
          </div>

          <div className="mt-6 max-w-sm">
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((savingsThisMonth / savingsGoal) * 100, 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{Math.round((savingsThisMonth / savingsGoal) * 100)}% of goal reached</p>
              <button
                onClick={() => {
                  const val = prompt('Set your monthly savings goal:', savingsGoal.toString());
                  if (val && !isNaN(Number(val))) setSavingsGoal(Number(val));
                }}
                className="text-xs text-white font-black hover:underline"
              >
                EDIT GOAL
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="bg-emerald-700/50 px-4 py-2 rounded-full border border-emerald-600/50 text-xs font-bold">
            +12% vs last month
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg tracking-tight">Top Deals Today</h3>
              <button
                onClick={() => onTabChange('deals')}
                className="text-sm text-w-green font-bold flex items-center gap-1 group"
              >
                See all 47 deals <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {topDeals.slice(0, 3).map(p => {
                const cheapest = getCheapestForProduct(p);
                const wasPrice = p.prices[cheapest.store];
                const savingPercent = Math.round((1 - cheapest.price / wasPrice) * 100);
                return (
                  <button
                    key={p.id}
                    onClick={() => onProductSelect(p)}
                    className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group"
                  >
                    <span className="absolute top-3 left-3 text-[9px] font-black uppercase text-white px-1.5 py-0.5 rounded shadow-sm z-10" style={{ backgroundColor: getStoreColor(cheapest.store) }}>
                      {getStoreName(cheapest.store)}
                    </span>
                    <div className="text-4xl my-6 text-center group-hover:scale-110 transition-transform">
                      {p.emoji}
                    </div>
                    <h4 className="font-bold text-sm text-text-main truncate mb-2">{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-text-main">{formatCurrency(cheapest.price)}</span>
                      <span className="text-xs text-text-secondary line-through">{formatCurrency(wasPrice)}</span>
                    </div>
                    <div className="mt-3 text-[10px] font-black text-w-green uppercase tracking-wider">
                      Save {savingPercent}%
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 text-text-main">
              <h3 className="font-bold text-lg tracking-tight">Your List</h3>
              <button onClick={() => onTabChange('list')} className="text-sm text-w-green font-bold flex items-center gap-1 group">
                Full List <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {listProducts.length > 0 ? (
              <div className="space-y-3">
                {listProducts.slice(0, 3).map((p: Product) => (
                  <div key={p.id} className="bg-surface p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between hover:border-w-green/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{p.emoji}</span>
                      <div>
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] text-text-secondary font-medium">{p.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-text-main">{formatCurrency(getCheapestForProduct(p).price)}</p>
                      <p className="text-[9px] font-bold text-w-green uppercase">Lowest</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface/50 rounded-2xl p-8 text-center border-2 border-dashed border-border-subtle">
                <p className="text-text-secondary text-sm font-medium">Your shopping list is empty</p>
                <button onClick={() => onTabChange('list')} className="mt-3 text-w-green font-bold text-sm bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">Find products</button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Cheapest Basket Card */}
          <div className="bg-surface p-6 rounded-3xl border border-border-subtle shadow-sm flex flex-col h-full">
            <h3 className="font-black text-xl mb-6 tracking-tight">Cheapest Basket</h3>

            {listProducts.length > 0 ? (
              <div className="flex-1 flex flex-col">
                <div className="p-5 bg-green-50 rounded-2xl mb-6 border border-green-100">
                  <p className="text-[10px] text-w-green font-black uppercase tracking-widest mb-2">Optimized Split</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-900 truncate">
                      {formatCurrency(listProducts.reduce((s: number, p: Product) => s + getCheapestForProduct(p).price, 0))}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 font-bold mt-2">Tap to view your store split</p>
                </div>

                <div className="space-y-4 mb-8">
                  {['Woolworths', 'Coles', 'Aldi'].map((storeName) => (
                    <div key={storeName} className="flex items-center justify-between pb-3 border-b border-border-subtle last:border-0 group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          storeName === 'Woolworths' ? 'bg-w-green' :
                          storeName === 'Coles' ? 'bg-c-red' : 'bg-a-blue'
                        }`} />
                        <span className="text-sm font-bold text-text-secondary group-hover:text-text-main transition-colors">{storeName}</span>
                      </div>
                      <span className="text-sm font-black text-text-main">
                        {formatCurrency(Math.random() * 50 + 20)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onTabChange('compare')}
                  className="mt-auto w-full py-4 bg-text-main text-surface rounded-2xl font-black text-sm hover:bg-black transition-colors"
                >
                  VIEW STORE SPLIT &rarr;
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40">
                <Scale size={48} className="text-w-green mb-4" />
                <p className="text-sm font-bold">Add items to compare</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}function ListTab({ products, shoppingList, addToList, removeFromList, clearList, totalCheapest, totalWoolies }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length > 1) {
        const filtered = products.filter((p: Product) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 6));
      } else {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [query, products]);

  const listItems = useMemo(() => {
    return shoppingList.map((id: string) => products.find((p: Product) => p.id === id)).filter(Boolean);
  }, [shoppingList, products]);

  const savings = totalWoolies - totalCheapest;

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-baseline mb-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Shopping List</h1>
          <p className="text-sm text-text-secondary">{listItems.length} items in your basket</p>
        </div>
        {listItems.length > 0 && (
          <button onClick={clearList} className="text-xs text-red-500 font-bold uppercase tracking-wider hover:underline">Clear List</button>
        )}
      </header>

      {/* Search Input */}
      <div className="relative" ref={searchRef}>
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-text-secondary">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="What do you need?"
          className="w-full bg-surface pl-12 pr-6 py-5 rounded-2xl border border-border-subtle shadow-sm focus:ring-1 focus:ring-w-green focus:border-w-green outline-none transition-all placeholder:text-text-secondary/50 font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-xl border border-border-subtle z-50 overflow-hidden">
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  addToList(p.id);
                  setQuery('');
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-bg transition-colors border-b border-border-subtle last:border-0 group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="text-left">
                    <p className="font-bold text-sm text-text-main">{p.name}</p>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{p.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-w-green">{formatCurrency(getCheapestForProduct(p).price)}</p>
                  <p className="text-[9px] text-text-secondary font-bold uppercase">Lowest</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {listItems.length > 0 ? (
          listItems.map((p: Product) => {
            const cheapest = getCheapestForProduct(p);
            const isSpecial = p.specials[cheapest.store] !== undefined;
            return (
              <motion.div
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-border-subtle shadow-sm group hover:border-w-green/20 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">{p.emoji}</div>
                  <div>
                    <h4 className="font-bold text-text-main leading-tight">{p.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="text-[9px] font-black uppercase text-white px-2 py-0.5 rounded shadow-sm" style={{ backgroundColor: getStoreColor(cheapest.store) }}>
                        {getStoreName(cheapest.store)}
                      </div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">Cheapest Store</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-lg text-text-main">{formatCurrency(cheapest.price)}</p>
                    {isSpecial && <span className="text-[9px] bg-red-50 text-c-red font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Special</span>}
                  </div>
                  <button
                    onClick={() => removeFromList(p.id)}
                    className="p-2 text-text-secondary/30 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-24 text-center space-y-4 bg-surface/50 rounded-3xl border border-dashed border-border-subtle">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto text-text-secondary/20 shadow-sm">
              <Search size={32} />
            </div>
            <div>
              <p className="text-text-main font-bold text-lg">Your list is looking empty</p>
              <p className="text-text-secondary text-sm">Search for products above to start saving.</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Summary Bar */}
      {listItems.length > 0 && (
        <div className="fixed bottom-20 md:bottom-10 left-4 right-4 md:left-[240px] md:right-10 flex justify-center z-30">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg bg-text-main text-surface rounded-2xl px-8 py-5 flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-6">
              <div className="text-left">
                <p className="text-[9px] uppercase font-black text-surface/50 leading-none mb-1.5 tracking-widest">Total Items</p>
                <p className="font-black text-xl">{listItems.length}</p>
              </div>
              <div className="w-px h-10 bg-surface/10"></div>
              <div className="text-left">
                <p className="text-[9px] uppercase font-black text-surface/50 leading-none mb-1.5 tracking-widest">Cheapest</p>
                <p className="font-black text-xl text-emerald-400">{formatCurrency(totalCheapest)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase font-black text-surface/50 leading-none mb-1.5 tracking-widest">You Save</p>
              <p className="font-black text-xl text-emerald-400">+{formatCurrency(savings)}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DealsTab({ onProductSelect }: any) {
  const [storeFilter, setStoreFilter] = useState<'All' | Store>('All');
  const [catFilter, setCatFilter] = useState<'All' | Category>('All');
  const [sortBy, setSortBy] = useState<'Saving' | 'Price' | 'Expiring'>('Saving');

  const categories: Category[] = ['Meat', 'Dairy', 'Pantry', 'Fruit & Veg', 'Bakery', 'Drinks', 'Household'];
  const stores: Store[] = ['woolworths', 'coles', 'aldi', 'iga'];

  const filteredDeals = useMemo(() => {
    let deals = PRODUCTS.filter(p => Object.keys(p.specials).length > 0).map(p => {
      const specialsArr = Object.entries(p.specials).map(([s, price]) => ({
        store: s as Store,
        price: price as number,
        was: p.prices[s as Store]
      }));
      const best = specialsArr.reduce((prev, curr) => (curr.price / curr.was < prev.price / prev.was ? curr : prev));
      return { ...p, bestDeal: best };
    });

    if (storeFilter !== 'All') {
      deals = deals.filter(p => Object.keys(p.specials).includes(storeFilter));
    }
    if (catFilter !== 'All') {
      deals = deals.filter(p => p.category === catFilter);
    }

    if (sortBy === 'Saving') {
      deals.sort((a, b) => (a.bestDeal.price / a.bestDeal.was) - (b.bestDeal.price / b.bestDeal.was));
    } else if (sortBy === 'Price') {
      deals.sort((a, b) => a.bestDeal.price - b.bestDeal.price);
    } else {
      deals.sort((a, b) => (a.daysLeft || 7) - (b.daysLeft || 7));
    }

    return deals;
  }, [storeFilter, catFilter, sortBy]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Deals</h1>
          <p className="text-gray-500">{filteredDeals.length} active specials found</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort By</p>
          <select
            className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="Saving">Biggest Saving</option>
            <option value="Price">Lowest Price</option>
            <option value="Expiring">Expiring Soon</option>
          </select>
        </div>
      </header>

      {/* Store Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setStoreFilter('All')}
          className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
            storeFilter === 'All' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          All
        </button>
        {stores.map(s => (
          <button
            key={s}
            onClick={() => setStoreFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${
              storeFilter === s ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-200'
            }`}
            style={storeFilter === s ? { backgroundColor: getStoreColor(s) } : {}}
          >
            <span className="w-2 h-2 rounded-full bg-white/50"></span>
            {getStoreName(s)}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCatFilter('All')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            catFilter === 'All' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          All Categories
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              catFilter === c ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDeals.map(p => {
          const deal = p.bestDeal;
          const savingPercent = Math.round((1 - deal.price / deal.was) * 100);
          return (
            <motion.button
              layout
              key={p.id}
              onClick={() => onProductSelect(p)}
              className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left flex flex-col group"
            >
              <div className="relative mb-3">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {p.emoji}
                </div>
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  -{savingPercent}%
                </div>
              </div>

              <div className="inline-block self-start px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white mb-2" style={{ backgroundColor: getStoreColor(deal.store) }}>
                {getStoreName(deal.store)}
              </div>

              <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 min-h-[40px] uppercase tracking-tight">{p.name}</h4>

              <div className="mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gray-900">{formatCurrency(deal.price)}</span>
                  <span className="text-xs text-gray-400 line-through">{formatCurrency(deal.was)}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {p.daysLeft ? `${p.daysLeft}d left` : 'LIMITED'}
                  </span>
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">{p.category}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400">No deals matching your filters.</p>
        </div>
      )}
    </div>
  );
}

function CompareTab({ listProducts, totalCheapest, totalWoolies, onTabChange }: any) {
  const savings = totalWoolies - totalCheapest;

  const split = useMemo(() => {
    if (listProducts.length === 0) return [];

    const groups: Record<Store, Product[]> = {
      woolworths: [],
      coles: [],
      aldi: [],
      iga: []
    };

    listProducts.forEach((p: Product) => {
      const cheapestStore = getCheapestForProduct(p).store;
      groups[cheapestStore].push(p);
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([store, items]) => ({
        store: store as Store,
        items,
        total: items.reduce((prev, curr) => prev + getStorePrice(curr, store), 0)
      }));
  }, [listProducts]);

  if (listProducts.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-w-green animate-bounce-slow">
          <Scale size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Basket Empty</h2>
          <p className="text-text-secondary mt-2 max-w-[280px] mx-auto font-medium">Add items to your list to calculate the most efficient shopping route.</p>
        </div>
        <button
          onClick={() => onTabChange('list')}
          className="bg-w-green text-surface px-10 py-4 rounded-2xl font-black tracking-widest text-sm shadow-xl shadow-w-green/20 hover:scale-105 active:scale-95 transition-all uppercase"
        >
          Build Your List
        </button>
      </div>
    );
  }

  const shareSummary = () => {
    const text = `🛒 My Trolley split this week:\n` +
      split.map(s => `• ${getStoreName(s.store)} (${s.items.length} items, ${formatCurrency(s.total)})`).join('\n') +
      `\n\nTotal: ${formatCurrency(totalCheapest)}\nSaved: ${formatCurrency(savings)} vs one store trip!`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Trolley summary copied to clipboard!');
    });
  };

  return (
    <div className="space-y-10 pb-16">
      <header className="text-center">
        <h1 className="text-4xl font-black text-text-main tracking-tighter mb-2">The Optimal Split</h1>
        <p className="text-text-secondary font-medium">Smart route to buy {listProducts.length} items at the lowest price.</p>
      </header>

      {/* Comparison Hero */}
      <div className="bg-surface p-10 rounded-[3rem] shadow-sm border border-border-subtle flex flex-col md:flex-row items-center justify-around gap-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%"><pattern id="gridLarge" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="2"/></pattern><rect width="100%" height="100%" fill="url(#gridLarge)" /></svg>
        </div>

        <div className="space-y-2">
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">Single Store</p>
          <p className="text-3xl font-black text-text-secondary/30">{formatCurrency(totalWoolies)}</p>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Woolworths</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-w-green text-surface w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-w-green/30 relative">
            <div className="absolute inset-0 rounded-full bg-w-green animate-ping opacity-10"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] mb-1 opacity-70">Saved</span>
            <div className="text-3xl font-black">
              <CountUp end={savings} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[9px] font-black text-w-green uppercase tracking-[0.2em]">Smart Total</p>
          <p className="text-5xl font-black text-text-main tracking-tighter">{formatCurrency(totalCheapest)}</p>
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Across {split.length} Stores</p>
        </div>
      </div>

      {/* Store Breakdown */}
      <div className="space-y-8">
        <h3 className="font-black text-2xl px-2 tracking-tight">Shopping Route</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {split.map((group, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={group.store}
              className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-border-subtle flex flex-col"
            >
              <div
                className="px-6 py-5 flex items-center justify-between text-surface border-b border-white/10"
                style={{ backgroundColor: getStoreColor(group.store) }}
              >
                <div className="flex items-center gap-3">
                  <span className="bg-surface/20 w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm">{group.items.length}</span>
                  <h4 className="font-black text-sm uppercase tracking-widest">{getStoreName(group.store)}</h4>
                </div>
                <p className="font-black text-xl italic">{formatCurrency(group.total)}</p>
              </div>
              <div className="p-6 space-y-4 flex-1">
                {group.items.map(p => (
                  <div key={p.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{p.emoji}</span>
                      <span className="text-xs font-bold text-text-secondary group-hover:text-text-main transition-colors">{p.name}</span>
                    </div>
                    <span className="font-black text-sm text-text-main">{formatCurrency(getStorePrice(p, group.store))}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={shareSummary}
          className="flex-1 bg-text-main text-surface py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all"
        >
          <Share2 size={18} /> Share My Split
        </button>
        <button
          onClick={() => window.print()}
          className="bg-surface text-text-main border border-border-subtle px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-sm hover:surface-bg transition-all"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}

function SavingsTab({ totalSaved, history, onLogShop, onDeleteLog, onReset }: any) {
  const chartData = useMemo(() => {
    const data = [12, 18, 15, 22, 28, 25];
    const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return { data, months };
  }, []);

  const monthSaved = history.filter((l: any) => new Date(l.date).getMonth() === new Date().getMonth()).reduce((s: number, l: any) => s + l.amountSaved, 0);
  const yearSaved = history.filter((l: any) => new Date(l.date).getFullYear() === new Date().getFullYear()).reduce((s: number, l: any) => s + l.amountSaved, 0);

  return (
    <div className="space-y-10 pb-10">
      <header className="text-center py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Sparkle size={120} className="absolute -top-10 -right-10 text-w-green rotate-12" />
        </div>
        <p className="text-[10px] font-black uppercase text-text-secondary tracking-[0.3em] mb-4">Total Life Savings</p>
        <h1 className="text-7xl font-black text-text-main tracking-tighter">
          <CountUp end={totalSaved} />
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col items-center">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">This Month</p>
          <p className="text-2xl font-black text-w-green">{formatCurrency(monthSaved)}</p>
        </div>
        <div className="bg-surface p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col items-center">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">This Year</p>
          <p className="text-2xl font-black text-w-green">{formatCurrency(yearSaved)}</p>
        </div>
      </div>

      <button
        onClick={onLogShop}
        className="w-full bg-w-green text-surface py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-4 shadow-xl shadow-w-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        LOG A NEW SHOP
      </button>

      {/* Mini Bar Chart */}
      <section className="bg-surface p-10 rounded-[3rem] border border-border-subtle shadow-sm">
        <h3 className="font-black mb-8 text-text-secondary uppercase text-[10px] tracking-widest text-center">Monthly Efficiency</h3>
        <div className="flex items-end justify-between h-32 gap-4">
          {chartData.data.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${val * 3}px` }}
                className="w-full bg-green-50 rounded-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-w-green opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </motion.div>
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">{chartData.months[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="space-y-6">
        <div className="flex justify-between items-baseline px-2">
          <h3 className="font-black text-2xl tracking-tight">Recent Activity</h3>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{history.length} Logs</span>
        </div>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((log: SavingsLog) => (
              <div key={log.id} className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between group hover:border-w-green/20 transition-colors">
                <div className="flex items-center gap-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-surface font-black text-xl shadow-sm"
                    style={{ backgroundColor: getStoreColor(log.store) }}
                  >
                    {getStoreName(log.store).charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-text-main uppercase tracking-tight text-sm leading-none mb-1">{getStoreName(log.store)}</p>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wide">{new Date(log.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1 opacity-50">Saved</p>
                    <p className="font-black text-w-green text-xl italic leading-none">{formatCurrency(log.amountSaved)}</p>
                  </div>
                  <button onClick={() => onDeleteLog(log.id)} className="text-text-secondary/20 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-surface/50 rounded-3xl border border-dashed border-border-subtle">
              <p className="text-text-secondary font-bold">No activity logged yet.</p>
            </div>
          )}
        </div>
      </section>

      <div className="pt-12 text-center">
        <button
          onClick={onReset}
          className="text-[9px] font-black text-red-500 opacity-30 hover:opacity-100 uppercase tracking-[0.4em] transition-all"
        >
          Factory Reset Data
        </button>
      </div>
    </div>
  );
}

// --- Specific Modals ---

function ProductModal({ product, onClose, onAddToList, isInList }: any) {
  const cheapest = getCheapestForProduct(product);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="w-full max-w-xl bg-surface rounded-t-[3rem] md:rounded-[3rem] p-10 relative overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-surface-bg rounded-full flex items-center justify-center hover:bg-border-subtle transition-colors shadow-sm">
          <X size={20} className="text-text-secondary" />
        </button>

        <div className="text-center mb-8">
          <div className="w-28 h-28 bg-surface-bg rounded-[2.5rem] flex items-center justify-center text-7xl mx-auto mb-6 shadow-inner animate-bounce-slow">
            {product.emoji}
          </div>
          <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase mb-2">{product.name}</h2>
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-4 py-1.5 bg-surface-bg rounded-full border border-border-subtle">{product.category}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {(['woolworths', 'coles', 'aldi', 'iga'] as Store[]).map(s => {
            const isCheap = cheapest.store === s;
            const hasSpecial = product.specials[s] !== undefined;
            return (
              <div
                key={s}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isCheap ? 'border-w-green ring-1 ring-w-green bg-green-50/30' : 'border-border-subtle bg-surface'
                }`}
              >
                <p className="text-[9px] font-black uppercase mb-1.5 tracking-widest" style={{ color: getStoreColor(s) }}>{getStoreName(s)}</p>
                <p className={`font-black tracking-tight ${isCheap ? 'text-text-main text-xl' : 'text-text-secondary'}`}>
                  {formatCurrency(getStorePrice(product, s))}
                </p>
                {hasSpecial && <span className="text-[8px] font-black bg-c-red text-surface px-1.5 py-0.5 rounded shadow-sm mt-1 inline-block">SPECIAL</span>}
              </div>
            );
          })}
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.15em]">12-Month Market History</h3>
            <span className="text-[10px] font-black text-w-green bg-green-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-100">
              <TrendingDown size={10} /> Market Stability
            </span>
          </div>
          <div className="bg-surface-bg/50 p-6 rounded-[2rem] border border-border-subtle">
            <PriceHistoryChart history={product.history} />
          </div>
        </div>

        <button
          disabled={isInList}
          onClick={() => {
            onAddToList(product.id);
            onClose();
          }}
          className={`w-full py-6 rounded-2xl font-black text-lg shadow-xl transition-all uppercase tracking-widest ${
            isInList
              ? 'bg-surface-bg text-text-secondary/30 cursor-not-allowed border border-border-subtle shadow-none'
              : 'bg-text-main text-surface hover:bg-black shadow-black/10 hover:scale-[1.01] active:scale-[0.98]'
          }`}
        >
          {isInList ? 'Already in List' : 'Add to Shopping List'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function LogShopModal({ onClose, onSave, estimatedSaving, estimatedSpend }: any) {
  const [store, setStore] = useState<Store>('woolworths');
  const [spent, setSpent] = useState(estimatedSpend.toString());
  const [saved, setSaved] = useState(estimatedSaving.toString());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-0 md:p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-surface rounded-t-[3rem] md:rounded-[3rem] p-10 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-text-main tracking-tight">LOG SHOP</h2>
          <button onClick={onClose} className="p-3 bg-surface-bg rounded-full text-text-secondary hover:text-text-main transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 block text-center">Where did you shop?</label>
            <div className="grid grid-cols-2 gap-3">
              {(['woolworths', 'coles', 'aldi', 'iga'] as Store[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStore(s)}
                  className={`py-4 rounded-xl border text-center transition-all ${
                    store === s ? 'border-text-main bg-text-main text-surface' : 'border-border-subtle bg-surface text-text-secondary'
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest">{getStoreName(s)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Total Amount Spent</label>
              <div className="relative group">
                <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-text-main transition-colors" />
                <input
                  type="number"
                  value={spent}
                  onChange={e => setSpent(e.target.value)}
                  className="w-full bg-surface-bg border border-border-subtle p-5 pl-12 rounded-2xl font-black text-xl text-text-main focus:ring-1 focus:ring-text-main transition-all outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Total Amount Saved</label>
              <div className="relative group">
                <TrendingUp size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-w-green group-focus-within:opacity-100 transition-colors" />
                <input
                  type="number"
                  value={saved}
                  onChange={e => setSaved(e.target.value)}
                  className="w-full bg-green-50/50 border border-green-100 p-5 pl-12 rounded-2xl font-black text-xl text-w-green focus:ring-1 focus:ring-w-green transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onSave({
              date: new Date().toISOString(),
              store,
              amountSpent: Number(spent),
              amountSaved: Number(saved)
            })}
            className="w-full bg-w-green text-surface py-6 rounded-2xl font-black text-lg shadow-xl shadow-w-green/20 hover:scale-[1.01] active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            Log Activity
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
