# Стратегия тестирования

Два уровня тестов. Каждый проверяет свой слой, не дублируя остальные.

## Пирамида

```
        ┌───────┐
        │  E2E  │   Playwright — пользовательские сценарии (6 suites, 30+ тестов)
        ├───────┤
        │ Unit  │   Vitest — контракты, event bus, feature flags, data source (48 тестов)
        └───────┘
```

## Unit Tests

**Что:** изолированная логика без DOM и сети.

**Покрытие:**
- Event bus: publish/subscribe, type safety, unsubscribe, error isolation, versioned events
- Feature flags: get/set/toggle, onChange listeners, bulk update, unknown flags
- Contracts: Zod schema validation (vehicle, order — корректные и невалидные данные)
- Events: version checking (isMinVersion), v1/v2 coexistence
- Data source: mock adapter — vehicles (фильтрация по марке, цене, статусу), orders (CRUD), dashboard (агрегация, суммы)

**Команда:**
```bash
pnpm test                                     # все пакеты
pnpm --filter @platform/contracts test         # контракты
pnpm --filter @platform/shell test             # event bus + feature flags
pnpm --filter @platform/data-source test       # mock data source
```

## E2E Tests (Playwright)

**Что:** пользовательские сценарии через браузер. Тестируют поведение, не DOM-структуру.

**6 Test Suites:**

| Suite | Что проверяет |
|-------|--------------|
| `cross-module.spec.ts` | Навигация между 4 модулями, создание заказа через модалку, cross-module events (React → Vue) |
| `feature-flags.spec.ts` | Trade-in toggle, network mode, DevTools feature flag (panel + button visibility) |
| `gateway-integration.spec.ts` | Health endpoint, vehicles CRUD + фильтрация, orders CRUD, dashboard агрегация, Delphi нормализация |
| `orders-module.spec.ts` | Список заказов, фильтры по статусу, summary cards |
| `analytics-module.spec.ts` | Графики по маркам, ценам, годам, статус склада |

**Команда:**
```bash
pnpm test:e2e                # headless
pnpm test:e2e --headed       # с браузером
pnpm test:e2e --ui           # Playwright UI mode
```

## Принципы

1. **Тесты framework-agnostic** — E2E тестируют поведение, не DOM-структуру. Заменили React на Solid — тесты не меняются.
2. **Mock data по умолчанию** — unit тесты детерминированы, не зависят от сети.
3. **Каждый уровень независим** — unit можно запустить без build, E2E требует build + server.
