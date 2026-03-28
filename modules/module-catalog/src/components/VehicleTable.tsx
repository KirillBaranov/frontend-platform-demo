import type { Vehicle } from '@platform/contracts';

interface Props {
  vehicles: Vehicle[];
  onSelect: (vehicle: Vehicle) => void;
  onCreateOrder: (vehicle: Vehicle) => void;
  tradeInEnabled: boolean;
  networkMode: boolean;
}

const DEALER_NAMES: Record<string, string> = {
  'dealer-1': 'Центральный',
  'dealer-2': 'Южный',
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  in_stock: { label: 'В наличии', className: 'badge badge-success' },
  reserved: { label: 'Зарезервирован', className: 'badge badge-warning' },
  sold: { label: 'Продан', className: 'badge badge-neutral' },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
}

export function VehicleTable({ vehicles, onSelect, onCreateOrder, tradeInEnabled, networkMode }: Props) {
  if (vehicles.length === 0) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p className="text-muted">Автомобили не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <table className="table table-clickable">
        <thead>
          <tr>
            <th>Марка / Модель</th>
            <th>Год</th>
            <th>Цена</th>
            <th>Пробег</th>
            <th>Цвет</th>
            {networkMode && <th>Дилер</th>}
            <th>Статус</th>
            {tradeInEnabled && <th>Trade-in</th>}
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => {
            const status = STATUS_MAP[vehicle.status] ?? { label: vehicle.status, className: 'badge badge-neutral' };
            return (
              <tr key={vehicle.id} onClick={() => onSelect(vehicle)}>
                <td>
                  <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                  <div className="text-xs text-muted">{vehicle.vin}</div>
                </td>
                <td>{vehicle.year}</td>
                <td className="font-semibold">{formatPrice(vehicle.price)}</td>
                <td>{vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString('ru-RU')} км` : 'Новый'}</td>
                <td>{vehicle.color}</td>
                {networkMode && <td><span className="badge badge-neutral">{DEALER_NAMES[vehicle.dealerId] ?? vehicle.dealerId}</span></td>}
                <td><span className={status.className}>{status.label}</span></td>
                {tradeInEnabled && (
                  <td>
                    {vehicle.status === 'in_stock' ? (
                      <span className="badge badge-success">Доступен</span>
                    ) : (
                      <span className="badge badge-neutral">—</span>
                    )}
                  </td>
                )}
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    {vehicle.status === 'in_stock' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onCreateOrder(vehicle)}
                      >
                        Заказ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
