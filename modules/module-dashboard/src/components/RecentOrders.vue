<script setup lang="ts">
import type { DashboardStats } from '@platform/contracts';

defineProps<{
  orders: DashboardStats['recentOrders'];
}>();

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: 'Ожидает', className: 'badge badge-warning' },
  confirmed: { label: 'Подтверждён', className: 'badge badge-info' },
  completed: { label: 'Завершён', className: 'badge badge-success' },
  cancelled: { label: 'Отменён', className: 'badge badge-error' },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>Последние заказы</h3>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Клиент</th>
          <th>Автомобиль</th>
          <th>Сумма</th>
          <th>Статус</th>
          <th>Дата</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td class="text-muted text-sm">{{ order.id }}</td>
          <td class="font-medium">{{ order.customerName }}</td>
          <td>{{ order.vehicleBrand }} {{ order.vehicleModel }}</td>
          <td class="font-semibold">{{ formatCurrency(order.totalPrice) }}</td>
          <td>
            <span :class="STATUS_MAP[order.status]?.className ?? 'badge badge-neutral'">
              {{ STATUS_MAP[order.status]?.label ?? order.status }}
            </span>
          </td>
          <td class="text-sm text-muted">{{ formatDate(order.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
