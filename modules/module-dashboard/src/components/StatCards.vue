<script setup lang="ts">
import type { DashboardStats } from '@platform/contracts';

defineProps<{
  stats: DashboardStats;
  networkMode: boolean;
}>();

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}
</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    <div class="card stat-card">
      <div class="stat-label">Автомобилей всего</div>
      <div class="stat-value">{{ stats.totalVehicles }}</div>
      <div class="stat-change positive">{{ stats.vehiclesInStock }} в наличии</div>
    </div>

    <div class="card stat-card">
      <div class="stat-label">Заказов</div>
      <div class="stat-value">{{ stats.totalOrders }}</div>
      <div class="stat-change">{{ stats.pendingOrders }} ожидают</div>
    </div>

    <div class="card stat-card">
      <div class="stat-label">Выручка</div>
      <div class="stat-value">{{ formatCurrency(stats.revenue) }}</div>
      <div class="stat-change positive">{{ stats.completedOrders }} завершено</div>
    </div>

    <div class="card stat-card">
      <div class="stat-label">Средний чек</div>
      <div class="stat-value">{{ formatCurrency(stats.averageOrderValue) }}</div>
      <div v-if="networkMode" class="stat-change">по всей сети</div>
      <div v-else class="stat-change">ваш дилерский центр</div>
    </div>
  </div>
</template>
