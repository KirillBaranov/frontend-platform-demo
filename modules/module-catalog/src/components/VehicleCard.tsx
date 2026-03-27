import type { Vehicle } from '@platform/contracts';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
  onCreateOrder: (vehicle: Vehicle) => void;
  tradeInEnabled: boolean;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  in_stock: { label: 'В наличии', className: 'badge badge-success' },
  reserved: { label: 'Зарезервирован', className: 'badge badge-warning' },
  sold: { label: 'Продан', className: 'badge badge-neutral' },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

export function VehicleCard({ vehicle, onClose, onCreateOrder, tradeInEnabled }: Props) {
  const status = STATUS_MAP[vehicle.status] ?? { label: vehicle.status, className: 'badge badge-neutral' };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{vehicle.brand} {vehicle.model} ({vehicle.year})</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 gap-4">
          {/* Vehicle image placeholder */}
          <div style={{
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <div>Фото автомобиля</div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Статус</span>
              <span className={status.className}>{status.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">VIN</span>
              <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)' }}>{vehicle.vin}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Цвет</span>
              <span className="text-sm">{vehicle.color}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Пробег</span>
              <span className="text-sm">{vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString('ru-RU')} км` : 'Новый'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Год выпуска</span>
              <span className="text-sm">{vehicle.year}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <div className="flex items-center justify-between">
                <span className="text-muted">Цена</span>
                <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                  {formatPrice(vehicle.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {vehicle.status === 'in_stock' && (
        <div className="card-footer">
          {tradeInEnabled && (
            <button className="btn btn-secondary">Trade-in</button>
          )}
          <button className="btn btn-primary" onClick={() => onCreateOrder(vehicle)}>
            Оформить заказ
          </button>
        </div>
      )}
    </div>
  );
}
