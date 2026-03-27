<script setup lang="ts">
import type { DashboardStats } from '@platform/contracts';

defineProps<{
  brands: DashboardStats['topBrands'];
}>();
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>Популярные марки</h3>
    </div>
    <div class="card-body">
      <div v-for="brand in brands" :key="brand.brand" class="flex items-center justify-between mb-2">
        <span class="font-medium">{{ brand.brand }}</span>
        <div class="flex items-center gap-2">
          <div
            style="height: 8px; border-radius: 4px; background: var(--color-primary)"
            :style="{ width: `${Math.max(brand.count * 40, 20)}px` }"
          />
          <span class="text-sm text-muted">{{ brand.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
