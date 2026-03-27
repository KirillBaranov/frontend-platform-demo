<script setup lang="ts">
defineProps<{
  vehicle: {
    brand: string;
    model: string;
    price: number;
    year: number;
    vehicleId: string;
  } | null;
}>();

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}
</script>

<template>
  <div class="card" v-if="vehicle">
    <div class="card-header">
      <h3>Выбранный автомобиль</h3>
      <span class="badge badge-info">cross-module event</span>
    </div>
    <div class="card-body">
      <div class="flex items-center justify-between mb-2">
        <span class="font-semibold" style="font-size: var(--font-size-lg)">
          {{ vehicle.brand }} {{ vehicle.model }}
        </span>
        <span class="badge badge-neutral">{{ vehicle.year }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted">Цена</span>
        <span class="font-semibold">{{ formatPrice(vehicle.price) }}</span>
      </div>
      <div class="text-xs text-muted mt-2" style="font-family: var(--font-mono)">
        ID: {{ vehicle.vehicleId }}
      </div>
      <div class="mt-2" style="padding:var(--space-2);background:var(--color-primary-light);border-radius:var(--radius-md);font-size:var(--font-size-xs);color:var(--color-primary)">
        Этот блок обновился через событие VehicleSelected v2 из модуля Каталог (React → Vue)
      </div>
    </div>
  </div>
  <div class="card" v-else>
    <div class="card-body" style="text-align:center;color:var(--color-text-muted);padding:var(--space-6)">
      <div class="text-sm">Выберите автомобиль в каталоге</div>
      <div class="text-xs mt-2">Cross-module событие VehicleSelected отобразится здесь</div>
    </div>
  </div>
</template>
