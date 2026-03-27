import { useEffect, useState, useCallback } from 'react';
import type { Order, ModuleContext } from '@platform/contracts';
import { getDataSource } from '@platform/data-source';
import { OrderTable } from './components/OrderTable.js';

interface Props {
  context: ModuleContext;
}

export function App({ context }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const ds = await getDataSource();
      const data = await ds.orders.getAll();
      setOrders(data);
    } catch (err) {
      console.error('[Orders] Failed to load:', err);
      context.eventBus.publish({
        version: 1,
        type: 'Notification',
        level: 'error',
        message: 'Не удалось загрузить заказы',
      });
    } finally {
      setLoading(false);
    }
  }, [context.eventBus]);

  useEffect(() => {
    loadOrders();

    // Listen for new orders from catalog
    const unsub = context.eventBus.subscribe('OrderCreated', () => {
      loadOrders();
    });

    return unsub;
  }, [loadOrders, context.eventBus]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const ds = await getDataSource();
      const updated = await ds.orders.updateStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o)),
      );

      context.eventBus.publish({
        version: 1,
        type: 'Notification',
        level: 'success',
        message: `Заказ ${orderId} → ${newStatus}`,
      });

      context.eventBus.publish({
        version: 1,
        type: 'DashboardRefreshRequested',
      });
    } catch (err) {
      console.error('[Orders] Failed to update status:', err);
      context.eventBus.publish({
        version: 1,
        type: 'Notification',
        level: 'error',
        message: `Не удалось обновить заказ ${orderId}`,
      });
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2>Управление заказами</h2>
        <button className="btn btn-secondary btn-sm" onClick={loadOrders}>
          ↻ Обновить
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card stat-card">
          <div className="stat-label">Всего заказов</div>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Ожидают</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {orders.filter((o) => o.status === 'pending').length}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Завершены</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {orders.filter((o) => o.status === 'completed').length}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Выручка</div>
          <div className="stat-value">
            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(totalRevenue)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="module-loading">{context.t('common.loading')}</div>
      ) : (
        <OrderTable
          orders={orders}
          onStatusChange={handleStatusChange}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}
    </div>
  );
}
