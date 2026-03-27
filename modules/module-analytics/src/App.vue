<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { ModuleContext, DashboardStats, Vehicle } from '@platform/contracts';
import { getDataSource } from '@platform/data-source';
import BrandChart from './components/BrandChart.vue';
import StockStatus from './components/StockStatus.vue';
import PriceDistribution from './components/PriceDistribution.vue';

const props = defineProps<{ context: ModuleContext }>();

const stats = ref<DashboardStats | null>(null);
const vehicles = ref<Vehicle[]>([]);
const loading = ref(true);

let unsubOrderCreated: (() => void) | null = null;

async function loadData() {
  loading.value = true;
  try {
    const ds = await getDataSource();
    const [statsData, vehiclesData] = await Promise.all([
      ds.dashboard.getStats(),
      ds.vehicles.getAll(),
    ]);
    stats.value = statsData;
    vehicles.value = vehiclesData;
  } catch (err) {
    console.error('[Analytics] Failed to load:', err);
    props.context.eventBus.publish({
      version: 1,
      type: 'Notification',
      level: 'error',
      message: 'Не удалось загрузить аналитику',
    });
  } finally {
    loading.value = false;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

onMounted(() => {
  loadData();

  unsubOrderCreated = props.context.eventBus.subscribe('OrderCreated', () => {
    loadData();
  });
});

onUnmounted(() => {
  unsubOrderCreated?.();
});
</script>

<template>
  <div class="flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2>Аналитика</h2>
      <button class="btn btn-secondary btn-sm" @click="loadData">
        ↻ Обновить
      </button>
    </div>

    <div v-if="loading" class="module-loading">
      {{ context.t('common.loading') }}
    </div>

    <template v-else-if="stats">
      <!-- Summary row -->
      <div class="grid grid-cols-4 gap-4">
        <div class="card stat-card">
          <div class="stat-label">Средняя цена</div>
          <div class="stat-value" style="font-size:var(--font-size-xl)">
            {{ formatCurrency(vehicles.reduce((s, v) => s + v.price, 0) / (vehicles.length || 1)) }}
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Мин. цена</div>
          <div class="stat-value" style="font-size:var(--font-size-xl)">
            {{ formatCurrency(Math.min(...vehicles.map(v => v.price))) }}
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Макс. цена</div>
          <div class="stat-value" style="font-size:var(--font-size-xl)">
            {{ formatCurrency(Math.max(...vehicles.map(v => v.price))) }}
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Конверсия</div>
          <div class="stat-value" style="font-size:var(--font-size-xl)">
            {{ stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0 }}%
          </div>
          <div class="stat-change text-muted">завершённые / всего заказов</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-2 gap-4">
        <BrandChart :brands="stats.topBrands" />
        <StockStatus :stats="stats" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <PriceDistribution :vehicles="vehicles" />

        <!-- Year distribution (inline, simple) -->
        <div class="card">
          <div class="card-header">
            <h3>По году выпуска</h3>
          </div>
          <div class="card-body flex-col gap-2">
            <div
              v-for="year in [...new Set(vehicles.map(v => v.year))].sort().reverse()"
              :key="year"
              class="flex items-center gap-3"
            >
              <span class="text-sm font-medium" style="width:40px">{{ year }}</span>
              <div style="flex:1">
                <div
                  :style="{
                    width: `${(vehicles.filter(v => v.year === year).length / vehicles.length) * 100}%`,
                    height: '24px',
                    background: 'var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 'var(--space-2)',
                    color: 'white',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    minWidth: '24px',
                  }"
                >
                  {{ vehicles.filter(v => v.year === year).length }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
