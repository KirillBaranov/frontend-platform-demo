<script setup lang="ts">
import type { DashboardStats } from '@platform/contracts';

const props = defineProps<{
  stats: DashboardStats;
}>();

interface Segment {
  label: string;
  value: number;
  color: string;
  percentage: string;
}

function getSegments(): Segment[] {
  const total = props.stats.totalVehicles || 1;
  return [
    {
      label: 'В наличии',
      value: props.stats.vehiclesInStock,
      color: 'var(--color-success)',
      percentage: `${Math.round((props.stats.vehiclesInStock / total) * 100)}%`,
    },
    {
      label: 'Зарезервированы',
      value: props.stats.vehiclesReserved,
      color: 'var(--color-warning)',
      percentage: `${Math.round((props.stats.vehiclesReserved / total) * 100)}%`,
    },
    {
      label: 'Проданы',
      value: props.stats.vehiclesSold,
      color: 'var(--color-text-muted)',
      percentage: `${Math.round((props.stats.vehiclesSold / total) * 100)}%`,
    },
  ];
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>Статус склада</h3>
    </div>
    <div class="card-body">
      <!-- Horizontal stacked bar -->
      <div style="display:flex;height:32px;border-radius:var(--radius-md);overflow:hidden;margin-bottom:var(--space-4)">
        <div
          v-for="seg in getSegments()"
          :key="seg.label"
          :style="{
            flex: seg.value,
            background: seg.color,
            transition: 'flex 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            minWidth: seg.value > 0 ? '24px' : '0',
          }"
        >
          {{ seg.value > 0 ? seg.value : '' }}
        </div>
      </div>

      <!-- Legend -->
      <div class="flex-col gap-2">
        <div
          v-for="seg in getSegments()"
          :key="seg.label"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <div :style="{ width: '12px', height: '12px', borderRadius: '3px', background: seg.color }" />
            <span class="text-sm">{{ seg.label }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium">{{ seg.value }}</span>
            <span class="text-xs text-muted" style="width:36px;text-align:right">{{ seg.percentage }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
