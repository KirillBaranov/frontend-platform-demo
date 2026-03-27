import { useState } from 'react';
import type { Vehicle } from '@platform/contracts';

interface Props {
  vehicle: Vehicle;
  onSubmit: (data: { customerName: string; customerPhone: string; comment: string }) => void;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

export function OrderModal({ vehicle, onSubmit, onClose }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ customerName: customerName.trim(), customerPhone, comment });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: 480, maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header">
          <h3>Новый заказ</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body flex-col gap-4">
            {/* Vehicle summary */}
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div className="font-medium">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
              <div className="text-sm text-muted">{vehicle.vin}</div>
              <div className="font-semibold mt-2">{formatPrice(vehicle.price)}</div>
            </div>

            <div className="input-group">
              <label className="input-label">Имя клиента *</label>
              <input
                className="input"
                type="text"
                placeholder="Иван Иванов"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">Телефон</label>
              <input
                className="input"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Комментарий</label>
              <textarea
                className="input"
                placeholder="Дополнительные пожелания клиента..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
          <div className="card-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!customerName.trim() || submitting}
            >
              {submitting ? 'Оформляем...' : 'Оформить заказ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
