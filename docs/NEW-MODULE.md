# Создание нового модуля

Время: ~5 минут. Результат: рабочий модуль в sidebar.

## Шаг 1: Скопировать шаблон

```bash
cp -r modules/module-template modules/module-your-name
```

## Шаг 2: Обновить package.json

```json
{
  "name": "@platform/module-your-name",
  "dependencies": {
    "@platform/contracts": "workspace:*",
    "@platform/data-source": "workspace:*",
    "@platform/ui-kit": "workspace:*",
    "react": "^19.0.0"        // ← или vue, svelte, solid, etc.
  }
}
```

## Шаг 3: Реализовать mount/unmount

```typescript
// src/index.ts
import type { ModuleDefinition } from '@platform/contracts';

const myModule: ModuleDefinition = {
  id: 'your-name',
  name: 'Название в sidebar',
  route: '/your-name',

  async mount(container, context) {
    // React: createRoot(container).render(...)
    // Vue:   createApp(App).mount(container)
    // Vanilla: container.innerHTML = '...'
  },

  async unmount() {
    // Очистить: root.unmount(), app.unmount(), etc.
  },
};

export default myModule;
```

## Шаг 4: Зарегистрировать в shell

```typescript
// apps/shell/src/main.ts

// Добавить импорт (lazy)
loader.register('your-name', () => import('@platform/module-your-name'));

// Добавить маршрут
router.addRoute('/your-name', 'your-name');
```

## Шаг 5: Запустить

```bash
pnpm install
pnpm start
```

Новый модуль появится в sidebar. Готово.

## Коммуникация с другими модулями

```typescript
// Отправить событие
context.eventBus.publish({
  version: 1,
  type: 'OrderCreated',
  orderId: '123',
  vehicleId: 'v-001',
  customerName: 'Клиент',
  totalPrice: 3000000,
  createdAt: new Date().toISOString(),
});

// Подписаться на события
const unsub = context.eventBus.subscribe('VehicleSelected', (event) => {
  console.log('Selected:', event.vehicleId);
});

// Показать уведомление
context.eventBus.execute({
  version: 1,
  type: 'ShowNotification',
  level: 'success',
  message: 'Готово!',
});
```

## Чеклист

- [ ] `package.json` обновлён
- [ ] `mount()` рендерит UI в container
- [ ] `unmount()` очищает всё (listeners, timers, DOM)
- [ ] Зарегистрирован в shell (loader + router)
- [ ] Использует `@platform/ui-kit` для стилей
- [ ] Получает данные через `@platform/data-source`
- [ ] Не импортирует из других модулей (только из contracts)
