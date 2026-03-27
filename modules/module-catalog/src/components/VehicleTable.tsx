import type { Vehicle } from '@platform/contracts';

interface Props {
  vehicles: Vehicle[];
  onSelect: (vehicle: Vehicle) => void;
  onCreateOrder: (vehicle: Vehicle) => void;
  tradeInEnabled: boolean;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  in_stock: { label: 'В наличии', className: 'badge badge-success' },
  reserved: { label: 'Зарезервирован', className: 'badge badge-warning' },
  sold: { label: 'Продан', className: 'badge badge-neutral' },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
}

export function VehicleTable({ vehicles, onSelect, onCreateOrder, tradeInEnabled }: Props) {
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
            <th>Статус</th>
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
                <td><span className={status.className}>{status.label}</span></td>
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
                    {tradeInEnabled && vehicle.status === 'in_stock' && (
                      <button className="btn btn-secondary btn-sm">
                        Trade-in
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
