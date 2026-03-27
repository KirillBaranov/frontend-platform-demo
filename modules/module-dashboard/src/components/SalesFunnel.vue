<script setup lang="ts">
import type { DashboardStats } from '@platform/contracts';

const props = defineProps<{
  stats: DashboardStats;
}>();

const stages = [
  { key: 'totalOrders', label: 'Всего заказов', color: 'var(--color-primary)' },
  { key: 'pendingOrders', label: 'Ожидают', color: 'var(--color-warning)' },
  { key: 'completedOrders', label: 'Завершены', color: 'var(--color-success)' },
] as const;

function getWidth(value: number): string {
  const max = props.stats.totalOrders || 1;
  return `${Math.max((value / max) * 100, 8)}%`;
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>Воронка продаж</h3>
    </div>
    <div class="card-body flex-col gap-3">
      <div
        v-for="stage in stages"
        :key="stage.key"
        class="flex items-center gap-3"
      >
        <span class="text-sm" style="width:120px;flex-shrink:0;color:var(--color-text-secondary)">
          {{ stage.label }}
        </span>
        <div style="flex:1;position:relative">
          <div
            :style="{
              width: getWidth((stats as any)[stage.key]),
              height: '28px',
              background: stage.color,
              borderRadius: 'var(--radius-md)',
              transition: 'width 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 'var(--space-2)',
              color: 'white',
              fontSize: 'var(--font-size-xs)',
              fontWeight: '600',
              minWidth: '32px',
            }"
          >
            {{ (stats as any)[stage.key] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
