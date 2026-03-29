# Архитектура платформы

## Обзор

Micro-frontend платформа с четырьмя ключевыми слоями:

```
┌──────────────────────────────────────────────────────────────┐
│  Shell (vanilla TS) — оркестратор, живёт десятилетия         │
├──────────────────────────────────────────────────────────────┤
│  Modules — независимые micro-frontends (React, Vue, any)     │
├──────────────────────────────────────────────────────────────┤
│  Contracts + Data Source — стабильный слой между слоями      │
├──────────────────────────────────────────────────────────────┤
│  Gateway BFF — агрегация данных из legacy + новых сервисов   │
└──────────────────────────────────────────────────────────────┘
```

## Принципы

### 1. Фреймворк-агностичность
Shell и contracts не зависят от фреймворков. Модули выбирают свой стек. Замена фреймворка в модуле = реализация того же контракта.

### 2. Независимость команд
Каждый модуль — отдельный пакет, отдельный build, отдельный deploy. Команды не блокируют друг друга.

### 3. Контракты как стабильный слой
Модули не импортируют друг друга. Всё общение через typed events и commands из `@platform/contracts`. Версионирование позволяет эволюцию без breaking changes.

### 4. Данные через адаптеры
Модули не знают откуда данные. `@platform/data-source` абстрагирует mock/HTTP/gRPC. Переключение — одна env variable.

### 5. Error isolation
Краш модуля не роняет shell и другие модули. `try/catch` вокруг `mount()`, fallback UI.

## Слои подробно

### Shell (`apps/shell/`)
- **module-loader** — динамический import, lazy loading, error boundary
- **router** — hash-based, маппинг path → moduleId
- **event-bus** — typed pub/sub для events, registry для commands
- **feature-flags** — JSON config, hot-reload, onChange listeners
- **auth-context** — централизованная аутентификация
- **i18n** — минимальная интернационализация (extensible)

### Contracts (`packages/contracts/`)
- **events** — версионированные: VehicleSelected v1/v2, OrderCreated v1
- **commands** — NavigateTo, ShowNotification, SetFeatureFlag
- **ModuleDefinition** — mount/unmount/onFeatureFlagsChanged
- **schemas** — Zod валидация на границах (Vehicle, Order, DashboardStats)

### Data Source (`packages/data-source/`)
- **IVehicleSource, IOrderSource, IDashboardSource** — интерфейсы
- **mock** — offline, CI, GitHub Pages
- **http** — fetch к Gateway BFF

### Gateway (`services/gateway/`)
- **BFF** — один endpoint для всех модулей
- **Delphi adapter** — нормализация UPPER_CASE → camelCase
- **Агрегация** — дашборд собирает данные из нескольких адаптеров

## Интеграция с host-приложением (WebView Bridge)

Shell живёт внутри WebView desktop-приложения (Delphi, Electron). Два канала:

| Канал | Назначение |
|-------|-----------|
| **API / BFF** | данные — HTTP через Gateway |
| **Bridge** | платформа — `postMessage` (контекст, lifecycle, native) |

Правило: данные — через API, платформенные вещи — через bridge.

**Host → Web:** начальный контекст, refresh, lifecycle (show/hide/close)
**Web → Host:** открыть legacy-форму, print/file dialog, платформенная навигация

Формат: `{ type, requestId, action, payload }` — `requestId` для request/response, события без него.

## Deploy

```
Разработка:   pnpm start → shell (3000) + gateway (4000) одновременно
GitHub Pages: mock mode → shell + модули без backend
Продакшен:    каждый модуль — отдельный chunk на CDN
              shell загружает из registry (JSON с URL модулей)
              обновление модуля = новый URL, без передеплоя shell
```

## Масштабирование

| Метрика | Текущее | Потолок |
|---------|---------|---------|
| Модулей | 2 (catalog, dashboard) | 50+ (lazy loading) |
| Команд | 2 (React, Vue) | Неограничено |
| Адаптеров | 2 (mock, http) | Любое количество |
| Feature flags | 3 | Любое количество |

## ADR Index

| ADR | Тема |
|-----|------|
| [001](adr/001-shell-vanilla-ts.md) | Shell на vanilla TypeScript |
| [002](adr/002-contracts-layer.md) | Contracts Layer |
| [003](adr/003-gateway-bff.md) | Gateway BFF |
| [004](adr/004-feature-flags.md) | Feature Flags |
| [005](adr/005-css-first-ui-kit.md) | CSS-first UI Kit |
| [006](adr/006-bundle-optimization.md) | Bundle Optimization |
| [007](adr/007-data-source-adapters.md) | Data Source Adapters |
