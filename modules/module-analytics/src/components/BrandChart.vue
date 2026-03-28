<script setup lang="ts">
import type { DashboardStats } from '@platform/contracts';

const props = defineProps<{
  brands: DashboardStats['topBrands'];
}>();

function getMaxCount(): number {
  return Math.max(...props.brands.map((b) => b.count), 1);
}

const COLORS = [
  'var(--color-primary)',
  '#8b5cf6',
  'var(--color-success)',
  'var(--color-warning)',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#84cc16',
];
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>Распределение по маркам</h3>
    </div>
    <div class="card-body">
      <div style="display:flex;align-items:flex-end;gap:12px;height:200px;padding-top:var(--space-4)">
        <div
          v-for="(brand, i) in brands"
          :key="brand.brand"
          style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"
        >
          <span class="text-xs font-semibold">{{ brand.count }}</span>
          <div
            :style="{
              width: '100%',
              maxWidth: '60px',
              height: `${(brand.count / getMaxCount()) * 160}px`,
              background: COLORS[i % COLORS.length],
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              transition: 'height 0.3s ease',
              minHeight: '20px',
            }"
          />
          <span class="text-xs text-muted" style="text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;max-width:70px" :title="brand.brand">
            {{ brand.brand }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
