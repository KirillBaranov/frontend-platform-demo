# ADR-006: Bundle Optimization Strategy

## Статус
Принято

## Контекст
Enterprise приложение с 10+ модулями. Наивный подход (один бандл) = 5-10MB. Пользователь ждёт загрузку всех модулей, даже если использует один.

## Решение
Три уровня разделения бандла:

### Level 1: Module-level splitting
Shell загружает модули динамически через `import()`. Vite/Webpack автоматически создаёт отдельные чанки. Пользователь открыл Дашборд → грузится только dashboard chunk. Каталог не загружен, пока не нужен.

```typescript
// shell/module-loader.ts
const registry = {
  catalog:   () => import('@platform/module-catalog'),
  dashboard: () => import('@platform/module-dashboard'),
};
```

### Level 2: Route-level splitting (внутри модуля)
Каждый модуль может делить внутренние маршруты на чанки:

```
module-catalog/list   → catalog-list.chunk.js   (80KB)
module-catalog/detail → catalog-detail.chunk.js  (40KB)
```

### Level 3: Shared dependencies
React и Vue не дублируются между модулями. Shared через Import Maps (браузерный стандарт):

```html
<script type="importmap">
{
  "imports": {
    "react": "/shared/react.production.min.js",
    "vue": "/shared/vue.esm-browser.prod.js"
  }
}
</script>
```

## Метрики

| Пакет | Размер |
|-------|--------|
| Shell (initial) | ~48 KB |
| UI Kit | ~12 KB |
| Contracts | ~4 KB |
| **Initial load** | **~64 KB** |
| module-catalog | ~180 KB (lazy) |
| module-dashboard | ~150 KB (lazy) |

## Последствия

### Положительные
- Первый экран за <100KB
- Модули загружаются по требованию
- Shared deps не дублируются
- Bundle analysis через `pnpm analyze`

### Отрицательные
- Первая навигация к модулю — небольшая задержка загрузки
- Import maps — относительно новая технология (поддержка: все modern browsers)
