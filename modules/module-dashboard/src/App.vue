<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { ModuleContext, DashboardStats, VehicleSelected } from '@platform/contracts';
import { isMinVersion } from '@platform/contracts';
import { getDataSource } from '@platform/data-source';
import StatCards from './components/StatCards.vue';
import RecentOrders from './components/RecentOrders.vue';
import TopBrands from './components/TopBrands.vue';
import SelectedVehicle from './components/SelectedVehicle.vue';
import SalesFunnel from './components/SalesFunnel.vue';

const props = defineProps<{ context: ModuleContext }>();

const stats = ref<DashboardStats | null>(null);
const loading = ref(true);
const networkMode = ref(props.context.featureFlags.network_mode ?? false);
const selectedVehicle = ref<{ brand: string; model: string; price: number; year: number; vehicleId: string } | null>(null);

let unsubOrderCreated: (() => void) | null = null;
let unsubVehicleSelected: (() => void) | null = null;
let unsubDashboardRefresh: (() => void) | null = null;

async function loadStats() {
  loading.value = true;
  try {
    const ds = await getDataSource();
    stats.value = await ds.dashboard.getStats();
  } catch (err) {
    console.error('[Dashboard] Failed to load stats:', err);
    props.context.eventBus.publish({
      version: 1,
      type: 'Notification',
      level: 'error',
      message: 'Не удалось загрузить дашборд',
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();

  // Cross-module: order created in catalog → refresh dashboard
  unsubOrderCreated = props.context.eventBus.subscribe('OrderCreated', (event) => {
    props.context.eventBus.publish({
      version: 1,
      type: 'Notification',
      level: 'info',
      message: `Новый заказ ${event.orderId} — обновляем дашборд`,
    });
    loadStats();
  });

  // Cross-module: vehicle selected in catalog → show in dashboard
  unsubVehicleSelected = props.context.eventBus.subscribe('VehicleSelected', (event: VehicleSelected) => {
    if (isMinVersion(event, 2) && 'price' in event) {
      // v2 event has price and year
      selectedVehicle.value = {
        brand: event.brand,
        model: event.model,
        price: event.price,
        year: event.year,
        vehicleId: event.vehicleId,
      };
    } else {
      // v1 fallback — no price/year
      selectedVehicle.value = {
        brand: event.brand,
        model: event.model,
        price: 0,
        year: 0,
        vehicleId: event.vehicleId,
      };
    }
  });

  // Cross-module: orders module requests dashboard refresh after status change
  unsubDashboardRefresh = props.context.eventBus.subscribe('DashboardRefreshRequested', () => {
    loadStats();
  });
});

onUnmounted(() => {
  unsubOrderCreated?.();
  unsubVehicleSelected?.();
  unsubDashboardRefresh?.();
});
</script>

<template>
  <div class="flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h2>{{ context.t('dashboard.title') }}</h2>
        <span :class="['badge', networkMode ? 'badge-info' : 'badge-neutral']">
          {{ networkMode ? 'Вся сеть' : 'Дилер 1' }}
        </span>
      </div>
      <button class="btn btn-secondary btn-sm" @click="loadStats">
        ↻ Обновить
      </button>
    </div>

    <div v-if="loading" class="module-loading">
      {{ context.t('common.loading') }}
    </div>

    <template v-else-if="stats">
      <StatCards :stats="stats" :network-mode="networkMode" />

      <div class="grid grid-cols-3 gap-4">
        <div style="grid-column: span 2">
          <div class="flex-col gap-4">
            <RecentOrders :orders="stats.recentOrders" />
            <SalesFunnel :stats="stats" />
          </div>
        </div>
        <div class="flex-col gap-4">
          <TopBrands :brands="stats.topBrands" />
          <SelectedVehicle :vehicle="selectedVehicle" />
        </div>
      </div>
    </template>
  </div>
</template>
