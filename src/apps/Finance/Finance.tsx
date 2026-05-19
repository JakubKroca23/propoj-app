import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useFinanceStore, FinanceTransaction } from '@/stores/financeStore';
import './Finance.css';

const CATEGORIES = ['Plat', 'Bydlení', 'Jídlo', 'Zábava', 'Služby', 'Ostatní'];

// Výchozí barvy pro kategorie
const CATEGORY_COLORS: Record<string, string> = {
  Plat: 'var(--emerald-accent, #10b981)',
  Bydlení: 'var(--blue-accent, #3b82f6)',
  Jídlo: 'var(--amber-accent, #f59e0b)',
  Zábava: 'var(--pink-accent, #ec4899)',
  Služby: 'var(--purple-accent, #a855f7)',
  Ostatní: 'var(--slate-accent, #64748b)'
};

export default function Finance() {
  const { user } = useAuthStore();
  const { transactions, isLoading, loadTransactions, addTransaction, deleteTransaction } = useFinanceStore();

  // Stav formuláře
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Jídlo');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filtry
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all'); // YYYY-MM

  useEffect(() => {
    if (user?.$id) {
      loadTransactions(user.$id);
    }
  }, [user?.$id]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.$id) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Zadejte prosím platnou kladnou částku.');
      return;
    }

    await addTransaction(user.$id, type, parsedAmount, category, date, description.trim());

    // Reset formuláře kromě data a typu
    setAmount('');
    setDescription('');
  };

  // Výpočet agregací pro aktuálně filtrovaný nebo celkový pohled
  const currentMonthString = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // Bilance za tento měsíc
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthString));
  
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthBalance = currentMonthIncome - currentMonthExpense;

  // Celková bilance ze všech transakcí
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Filtrace transakcí pro tabulku
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterMonth !== 'all' && !t.date.startsWith(filterMonth)) return false;
    return true;
  });

  // Získání unikátních měsíců pro filtr
  const months = Array.from(new Set(transactions.map(t => t.date.slice(0, 7)))).sort((a, b) => b.localeCompare(a));

  // --- SVG BAR CHART DATA (Příjmy vs Výdaje za tento měsíc) ---
  const maxBarValue = Math.max(currentMonthIncome, currentMonthExpense, 1000);
  const incomeBarHeight = (currentMonthIncome / maxBarValue) * 120;
  const expenseBarHeight = (currentMonthExpense / maxBarValue) * 120;

  // --- SVG DONUT CHART DATA (Distribuce výdajů za tento měsíc) ---
  const categoryExpenses: Record<string, number> = {};
  CATEGORIES.forEach(c => { categoryExpenses[c] = 0; });
  
  currentMonthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (CATEGORIES.includes(t.category)) {
        categoryExpenses[t.category] += t.amount;
      } else {
        categoryExpenses['Ostatní'] = (categoryExpenses['Ostatní'] || 0) + t.amount;
      }
    });

  const totalFilteredExpense = Object.values(categoryExpenses).reduce((sum, val) => sum + val, 0);

  // Výpočet úhlů/strokeDasharray pro donut
  let accumulatedPercent = 0;
  const donutData = Object.entries(categoryExpenses)
    .filter(([_, val]) => val > 0)
    .map(([cat, val]) => {
      const percentage = (val / totalFilteredExpense) * 100;
      const startPercent = accumulatedPercent;
      accumulatedPercent += percentage;
      return {
        category: cat,
        value: val,
        percentage,
        startPercent,
        color: CATEGORY_COLORS[cat] || '#64748b'
      };
    });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="finance-app">
      {/* 1. Summary Cards */}
      <header className="finance-summary-grid">
        <div className="summary-card income">
          <span className="card-label">Příjmy (tento měsíc)</span>
          <span className="card-value">{formatCurrency(currentMonthIncome)}</span>
        </div>
        <div className="summary-card expense">
          <span className="card-label">Výdaje (tento měsíc)</span>
          <span className="card-value">{formatCurrency(currentMonthExpense)}</span>
        </div>
        <div className={`summary-card balance ${currentMonthBalance >= 0 ? 'positive' : 'negative'}`}>
          <span className="card-label">Bilance (tento měsíc)</span>
          <span className="card-value">
            {currentMonthBalance > 0 ? '+' : ''}
            {formatCurrency(currentMonthBalance)}
          </span>
        </div>
      </header>

      {/* 2. Middle Area: Form & Charts */}
      <div className="finance-main-content">
        {/* Formulář */}
        <section className="finance-card form-section">
          <h3>Nová transakce</h3>
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-group-row">
              <label className={`type-btn income ${type === 'income' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  checked={type === 'income'}
                  onChange={() => {
                    setType('income');
                    setCategory('Plat');
                  }}
                />
                Příjem
              </label>
              <label className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  checked={type === 'expense'}
                  onChange={() => {
                    setType('expense');
                    setCategory('Jídlo');
                  }}
                />
                Výdaj
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Částka (Kč)</label>
              <input
                id="amount"
                type="number"
                required
                min="1"
                step="any"
                placeholder="Např. 1500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Kategorie</label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {type === 'income' ? (
                  <>
                    <option value="Plat">Plat</option>
                    <option value="Ostatní">Ostatní příjmy</option>
                  </>
                ) : (
                  CATEGORIES.filter(c => c !== 'Plat').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Datum</label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Popis</label>
              <input
                id="description"
                type="text"
                placeholder="Např. Nákup v Lidlu"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit-transaction">
              Uložit transakci
            </button>
          </form>
        </section>

        {/* SVG Grafy */}
        <section className="finance-card charts-section">
          <h3>Vizualizace (tento měsíc)</h3>
          <div className="charts-container">
            {/* Bar Chart */}
            <div className="chart-wrapper">
              <span className="chart-title">Porovnání bilance</span>
              <svg width="100%" height="160" viewBox="0 0 200 160" className="svg-chart">
                {/* Mřížka pozadí */}
                <line x1="20" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.08)" strokeDasharray="2" />
                <line x1="20" y1="80" x2="180" y2="80" stroke="rgba(255,255,255,0.08)" strokeDasharray="2" />
                <line x1="20" y1="140" x2="180" y2="140" stroke="rgba(255,255,255,0.2)" />

                {/* Bar Příjmy */}
                <rect
                  x="50"
                  y={140 - incomeBarHeight}
                  width="30"
                  height={incomeBarHeight}
                  rx="4"
                  fill="var(--emerald-accent, #10b981)"
                  opacity="0.85"
                />
                {/* Bar Výdaje */}
                <rect
                  x="120"
                  y={140 - expenseBarHeight}
                  width="30"
                  height={expenseBarHeight}
                  rx="4"
                  fill="var(--rose-accent, #f43f5e)"
                  opacity="0.85"
                />

                {/* Hodnoty nad sloupci */}
                <text x="65" y={130 - incomeBarHeight} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  {currentMonthIncome > 0 ? `${(currentMonthIncome / 1000).toFixed(1)}k` : '0'}
                </text>
                <text x="135" y={130 - expenseBarHeight} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  {currentMonthExpense > 0 ? `${(currentMonthExpense / 1000).toFixed(1)}k` : '0'}
                </text>

                {/* Popisky pod sloupci */}
                <text x="65" y="154" textAnchor="middle" fill="var(--text-secondary, #94a3b8)" fontSize="10">Příjmy</text>
                <text x="135" y="154" textAnchor="middle" fill="var(--text-secondary, #94a3b8)" fontSize="10">Výdaje</text>
              </svg>
            </div>

            {/* Donut Chart */}
            <div className="chart-wrapper">
              <span className="chart-title">Struktura výdajů</span>
              {totalFilteredExpense === 0 ? (
                <div className="no-chart-data">
                  <span>Žádné výdaje tento měsíc</span>
                </div>
              ) : (
                <div className="donut-chart-box">
                  <svg width="120" height="120" viewBox="0 0 42 42" className="svg-donut">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    
                    {donutData.map((slice, idx) => {
                      const strokeDash = `${slice.percentage} ${100 - slice.percentage}`;
                      // Otočení kruhu o 25% (90 stupňů zpět) pro počátek nahoře
                      const strokeOffset = 100 - slice.startPercent + 25;
                      return (
                        <circle
                          key={idx}
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="4.2"
                          strokeDasharray={strokeDash}
                          strokeDashoffset={strokeOffset}
                        />
                      );
                    })}

                    {/* Vnitřní text s celkovými výdaji */}
                    <g className="donut-text">
                      <text x="50%" y="47%" textAnchor="middle" fill="var(--text-secondary, #94a3b8)" fontSize="3">
                        Výdaje
                      </text>
                      <text x="50%" y="62%" textAnchor="middle" fill="#fff" fontSize="4.2" fontWeight="bold">
                        {currentMonthExpense > 9999 ? `${(currentMonthExpense / 1000).toFixed(0)}k` : currentMonthExpense}
                      </text>
                    </g>
                  </svg>

                  {/* Legenda donut grafu */}
                  <div className="donut-legend">
                    {donutData.map((slice, idx) => (
                      <div key={idx} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: slice.color }}></span>
                        <span className="legend-label">{slice.category}</span>
                        <span className="legend-percent">{slice.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 3. Bottom Area: Filter & History Table */}
      <section className="finance-card history-section">
        <header className="history-header">
          <h3>Historie transakcí</h3>
          <div className="history-filters">
            {/* Filtr Typu */}
            <div className="filter-group">
              <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">Všechny typy</option>
                <option value="income">Pouze příjmy</option>
                <option value="expense">Pouze výdaje</option>
              </select>
            </div>

            {/* Filtr Kategorie */}
            <div className="filter-group">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">Všechny kategorie</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filtr Měsíce */}
            <div className="filter-group">
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option value="all">Všechna období</option>
                {months.map(m => {
                  const [yr, mn] = m.split('-');
                  return (
                    <option key={m} value={m}>
                      {mn}/{yr}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="finance-loading">Načítám transakce...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="finance-empty">
            <span>Žádné transakce neodpovídají filtrům.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="finance-table-data">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Typ</th>
                  <th>Částka</th>
                  <th>Kategorie</th>
                  <th>Popis</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.$id} className={t.type}>
                    <td className="col-date">{new Date(t.date).toLocaleDateString('cs-CZ')}</td>
                    <td className="col-type">
                      <span className={`badge ${t.type}`}>
                        {t.type === 'income' ? 'Příjem' : 'Výdaj'}
                      </span>
                    </td>
                    <td className={`col-amount font-bold ${t.type}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="col-cat">
                      <span className="cat-indicator" style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#64748b' }}></span>
                      {t.category}
                    </td>
                    <td className="col-desc" title={t.description}>{t.description || '—'}</td>
                    <td className="col-actions">
                      <button
                        onClick={() => {
                          if (confirm('Opravdu smazat transakci?')) {
                            deleteTransaction(t.$id);
                          }
                        }}
                        className="btn-delete-trans"
                        title="Smazat transakci"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
