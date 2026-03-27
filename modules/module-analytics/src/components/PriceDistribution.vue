<script setup lang="ts">
import type { Vehicle } from '@platform/contracts';

const props = defineProps<{
  vehicles: Vehicle[];
}>();

interface PriceBucket {
  range: string;
  count: number;
  color: string;
}

function getBuckets(): PriceBucket[] {
  const buckets: PriceBucket[] = [
    { range: '< 3М', count: 0, color: 'var(--color-success)' },
    { range: '3-4М', count: 0, color: 'var(--color-primary)' },
    { range: '4-5М', count: 0, color: '#8b5cf6' },
    { range: '5М+', count: 0, color: 'var(--color-warning)' },
  ];

  for (const v of props.vehicles) {
    if (v.price < 3_000_000) buckets[0].count++;
    else if (v.price < 4_000_000) buckets[1].count++;
    else if (v.price < 5_000_000) buckets[2].count++;
    else buckets[3].count++;
  }

  return buckets;
}

function getMaxCount(): number {
  return Math.max(...getBuckets().map((b) => b.count), 1);
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>Распределение по цене</h3>
    </div>
    <div class="card-body">
      <div class="flex-col gap-3">
        <div
          v-for="bucket in getBuckets()"
          :key="bucket.range"
          class="flex items-center gap-3"
        >
          <span class="text-sm" style="width:50px;flex-shrink:0;text-align:right;color:var(--color-text-secondary)">
            {{ bucket.range }}
          </span>
          <div style="flex:1">
            <div
              :style="{
                width: `${(bucket.count / getMaxCount()) * 100}%`,
                height: '24px',
                background: bucket.color,
                borderRadius: 'var(--radius-md)',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 'var(--space-2)',
                color: 'white',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                minWidth: bucket.count > 0 ? '24px' : '0',
              }"
            >
              {{ bucket.count > 0 ? bucket.count : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
