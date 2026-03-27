import { useState } from 'react';
import type { VehicleFilters as Filters } from '@platform/data-source';

interface Props {
  onFilter: (filters: Filters) => void;
  brands: string[];
}

export function VehicleFilters({ onFilter, brands }: Props) {
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  const apply = () => {
    onFilter({
      brand: brand || undefined,
      status: (status as Filters['status']) || undefined,
      priceFrom: priceFrom ? Number(priceFrom) : undefined,
      priceTo: priceTo ? Number(priceTo) : undefined,
    });
  };

  const reset = () => {
    setBrand('');
    setStatus('');
    setPriceFrom('');
    setPriceTo('');
    onFilter({});
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
          <div className="input-group">
            <label className="input-label">Марка</label>
            <select
              className="input select"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">Все марки</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Статус</label>
            <select
              className="input select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Все</option>
              <option value="in_stock">В наличии</option>
              <option value="reserved">Зарезервирован</option>
              <option value="sold">Продан</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Цена от</label>
            <input
              className="input"
              type="number"
              placeholder="1 000 000"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Цена до</label>
            <input
              className="input"
              type="number"
              placeholder="10 000 000"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          <div className="flex gap-2" style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-primary" onClick={apply}>Применить</button>
            <button className="btn btn-ghost" onClick={reset}>Сбросить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
