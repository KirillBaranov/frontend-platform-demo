import type { Order } from '@platform/contracts';

interface Props {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; next?: Order['status']; nextLabel?: string }> = {
  pending: { label: 'Ожидает', className: 'badge badge-warning', next: 'confirmed', nextLabel: 'Подтвердить' },
  confirmed: { label: 'Подтверждён', className: 'badge badge-info', next: 'completed', nextLabel: 'Завершить' },
  completed: { label: 'Завершён', className: 'badge badge-success' },
  cancelled: { label: 'Отменён', className: 'badge badge-error' },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderTable({ orders, onStatusChange, filter, onFilterChange }: Props) {
  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  return (
    <div className="flex-col gap-4">
      {/* Status filter tabs */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Все', count: orders.length },
          { value: 'pending', label: 'Ожидают', count: orders.filter((o) => o.status === 'pending').length },
          { value: 'confirmed', label: 'Подтверждены', count: orders.filter((o) => o.status === 'confirmed').length },
          { value: 'completed', label: 'Завершены', count: orders.filter((o) => o.status === 'completed').length },
          { value: 'cancelled', label: 'Отменены', count: orders.filter((o) => o.status === 'cancelled').length },
        ].map((tab) => (
          <button
            key={tab.value}
            className={`btn ${filter === tab.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => onFilterChange(tab.value)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="card">
        {filteredOrders.length === 0 ? (
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p className="text-muted">Нет заказов в этой категории</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Клиент</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'badge badge-neutral' };
                return (
                  <tr key={order.id}>
                    <td className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{order.id}</td>
                    <td>
                      <div className="font-medium">{order.customerName}</div>
                      {order.customerPhone && (
                        <div className="text-xs text-muted">{order.customerPhone}</div>
                      )}
                    </td>
                    <td className="font-semibold">{formatPrice(order.totalPrice)}</td>
                    <td><span className={config.className}>{config.label}</span></td>
                    <td className="text-sm text-muted">{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        {config.next && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onStatusChange(order.id, config.next!)}
                          >
                            {config.nextLabel}
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => onStatusChange(order.id, 'cancelled')}
                          >
                            Отменить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
