import { useEffect, useState, useCallback } from 'react';
import type { Vehicle, ModuleContext } from '@platform/contracts';
import { getDataSource, type VehicleFilters } from '@platform/data-source';
import { VehicleFilters as Filters } from './components/VehicleFilters.js';
import { VehicleTable } from './components/VehicleTable.js';
import { VehicleCard } from './components/VehicleCard.js';
import { OrderModal } from './components/OrderModal.js';

interface Props {
  context: ModuleContext;
}

type ViewMode = 'table' | 'detail';

export function App({ context }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [orderVehicle, setOrderVehicle] = useState<Vehicle | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const tradeInEnabled = context.featureFlags.trade_in_enabled ?? false;
  const networkMode = context.featureFlags.network_mode ?? false;

  const loadVehicles = useCallback(async (filters?: VehicleFilters) => {
    setLoading(true);
    try {
      const ds = await getDataSource();
      const appliedFilters: VehicleFilters = {
        ...filters,
        // Без "Вся сеть" — показываем только dealer-1 (текущий дилер)
        ...(!networkMode && !filters?.dealerId ? { dealerId: 'dealer-1' } : {}),
      };
      const data = await ds.vehicles.getAll(appliedFilters);
      setVehicles(data);

      if (brands.length === 0) {
        const uniqueBrands = [...new Set(data.map((v) => v.brand))].sort();
        setBrands(uniqueBrands);
      }
    } catch (err) {
      console.error('[Catalog] Failed to load vehicles:', err);
      context.eventBus.publish({
        version: 1,
        type: 'Notification',
        level: 'error',
        message: 'Не удалось загрузить каталог',
      });
    } finally {
      setLoading(false);
    }
  }, [context.eventBus, brands.length, networkMode]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setViewMode('detail');

    context.eventBus.publish({
      version: 2,
      type: 'VehicleSelected',
      vehicleId: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      price: vehicle.price,
      year: vehicle.year,
    });
  };

  const handleOpenOrderModal = (vehicle: Vehicle) => {
    setOrderVehicle(vehicle);
  };

  const handleCreateOrder = async (data: { customerName: string; customerPhone: string; comment: string }) => {
    if (!orderVehicle) return;

    try {
      const ds = await getDataSource();
      const order = await ds.orders.create({
        vehicleId: orderVehicle.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone || undefined,
        comment: data.comment || undefined,
        totalPrice: orderVehicle.price,
      });

      context.eventBus.publish({
        version: 1,
        type: 'OrderCreated',
        orderId: order.id,
        vehicleId: orderVehicle.id,
        customerName: order.customerName,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
      });

      context.eventBus.publish({
        version: 1,
        type: 'Notification',
        level: 'success',
        message: `Заказ ${order.id} создан: ${orderVehicle.brand} ${orderVehicle.model}`,
      });

      setOrderVehicle(null);
      setSelectedVehicle(null);
      setViewMode('table');
      await loadVehicles();
    } catch (err) {
      console.error('[Catalog] Failed to create order:', err);
      context.eventBus.publish({
        version: 1,
        type: 'Notification',
        level: 'error',
        message: 'Не удалось создать заказ',
      });
    }
  };

  return (
    <div className="flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2>{context.t('catalog.title')}</h2>
          <span className={`badge ${networkMode ? 'badge-info' : 'badge-neutral'}`}>
            {networkMode ? 'Вся сеть' : 'Дилер 1'}
          </span>
          {viewMode === 'detail' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setViewMode('table'); setSelectedVehicle(null); }}
            >
              ← К списку
            </button>
          )}
        </div>
        <span className="text-sm text-muted">{vehicles.length} автомобилей</span>
      </div>

      {viewMode === 'table' && (
        <>
          <Filters onFilter={loadVehicles} brands={brands} />

          {loading ? (
            <div className="module-loading">{context.t('common.loading')}</div>
          ) : (
            <VehicleTable
              vehicles={vehicles}
              onSelect={handleSelect}
              onCreateOrder={handleOpenOrderModal}
              tradeInEnabled={tradeInEnabled}
              networkMode={networkMode}
            />
          )}
        </>
      )}

      {viewMode === 'detail' && selectedVehicle && (
        <VehicleCard
          vehicle={selectedVehicle}
          onClose={() => { setViewMode('table'); setSelectedVehicle(null); }}
          onCreateOrder={handleOpenOrderModal}
          tradeInEnabled={tradeInEnabled}
        />
      )}

      {orderVehicle && (
        <OrderModal
          vehicle={orderVehicle}
          onSubmit={handleCreateOrder}
          onClose={() => setOrderVehicle(null)}
        />
      )}
    </div>
  );
}
