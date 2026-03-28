# Масштабирование и развитие платформы

> Архитектура рассчитана на 3,500+ DAU, десятки модулей и независимые команды.

## Текущее состояние

| Метрика | Значение |
|---------|----------|
| Модулей | 4 (catalog, dashboard, orders, analytics) |
| Фреймворков | 2 (React, Vue) |
| Команд | 2 (условно) |
| Initial load | ~64 KB (shell + UI kit + contracts) |
| Lazy module | 140-180 KB каждый |

## Масштабирование по осям

### 1. Горизонтальное: больше модулей

```
Сейчас:           4 модуля, 2 команды
Ожидаемый рост:   10-20 модулей, 3-5 команд (1-2 года)
Теоретический:    50+ модулей (ограничение организационное, не техническое)
```

**Как добавить модуль:**
1. Одна запись в `module-registry.ts` (id, label, route, factory)
2. Модуль в `modules/` со своим `package.json`
3. `pnpm install && pnpm start`

Shell не меняется. Другие модули не знают о новом.

**При 20+ модулях:**
- Группировка в sidebar (разделы: Продажи, Склад, Аналитика, Админ)
- Ролевая фильтрация: менеджер видит одни модули, админ — другие
- Feature flags: модуль скрыт пока не включён для этого дилера

### 2. Вертикальное: глубина модулей

Каждый модуль может расти внутри независимо:

```
module-catalog/
  src/
    pages/
      list/          ← lazy route
      detail/        ← lazy route
      compare/       ← lazy route (future)
    components/
    hooks/
    api/
```

Route-level splitting внутри модуля — Vite/webpack делает автоматически через `React.lazy()` / Vue `defineAsyncComponent`.

### 3. Нагрузочное: 3,500+ DAU

#### CDN и кэширование

```
Пользователь → CDN → Shell (кэш: immutable, content-hash)
                  → Module chunks (кэш: immutable, content-hash)
                  → UI Kit (кэш: immutable)

Gateway → Load Balancer → N инстансов (stateless)
```

**Shell + модули = статика.** Деплой на CDN (CloudFlare, S3+CloudFront, Nginx с кэшем). Content-hash в именах файлов — бесконечный кэш, инвалидация через новый hash.

При 3,500 DAU:
- ~500-700 concurrent users в пиковый час (9:00-11:00)
- Shell + модули на CDN → нагрузка на сервер ~0 (статика)
- Gateway → единственная точка нагрузки (API запросы)

**Что это даёт пользователю:**
- Быстрая загрузка через CDN — первый экран за <1 секунду
- Мгновенная навигация между модулями (lazy loading, нет перезагрузки страницы)
- Нулевой downtime при обновлении модулей (новый chunk деплоится, старый кэш истекает)
- Одинаковая скорость для всех дилерских центров независимо от локации (CDN edge)

#### Gateway масштабирование

```
Low (до 1K DAU):    1 инстанс Gateway, прямое подключение к Delphi
Medium (1-5K DAU):  2-3 инстанса за Load Balancer, кэш Redis
High (5K+ DAU):     N инстансов, Redis кэш, read replicas для Delphi
```

Gateway stateless → горизонтальное масштабирование без изменения кода.

**Кэширование в Gateway:**
```
GET /api/vehicles    → Redis кэш 30 сек (каталог меняется редко)
GET /api/dashboard   → Redis кэш 10 сек (агрегация тяжёлая)
POST /api/orders     → без кэша (write операция)
```

**Отказоустойчивость Gateway:**

| Риск | Митигация |
|------|-----------|
| Gateway недоступен | Несколько инстансов за Load Balancer, health checks, auto-restart |
| Delphi adapter timeout | Circuit breaker: после 3 ошибок — fallback на кэшированные данные |
| Redis недоступен | Gateway работает без кэша (повышенная нагрузка на Delphi, но не падает) |
| Деплой нового Gateway | Rolling update: старые инстансы обслуживают запросы пока новые стартуют |

Ключевой принцип: **graceful degradation** — частичная деградация лучше полного отказа. Кэш недоступен → медленнее, но работает. Один адаптер упал → остальные данные приходят.

#### Bundle оптимизация для 3.5K пользователей

| Стратегия | Эффект | Когда внедрить |
|-----------|--------|---------------|
| Content-hash filenames | Бесконечный кэш на CDN | Сразу (Vite делает по умолчанию) |
| Shared deps (import maps) | React/Vue не дублируются | При 5+ модулях |
| Service Worker precache | Offline-first, мгновенная навигация | При стабильном release cycle |
| Lazy module loading | Грузим только активный модуль | Уже реализовано |
| Route splitting внутри модулей | Грузим только активную страницу | При росте модулей |
| Compression (gzip/brotli) | -70% размера на CDN | Сразу (Nginx/CloudFlare) |

**Расчёт трафика:**
```
3,500 DAU × 64 KB initial + 170 KB avg module = ~800 MB/день
С CDN кэшем (90% hit rate):                    = ~80 MB/день на origin
```

Это ничто для любого CDN.

### 4. Организационное: независимые команды

```
Команда A (React):  module-catalog, module-orders
Команда B (Vue):    module-dashboard, module-analytics
Команда C (любой):  module-finance, module-reports (future)
```

**Независимость обеспечивается:**
- Свой `package.json` — свои зависимости, свой build
- Свой CI pipeline — тесты модуля не зависят от других
- Общение только через `@platform/contracts` — нет прямых импортов
- Деплой модуля = обновление chunk URL в registry, без пересборки shell

**При 5+ команд:**
- CODEOWNERS по директориям: `modules/module-catalog/ @team-a`
- PR в contracts — обязательный ревью от всех команд
- Versioning contracts (v1, v2) — старые модули продолжают работать

### 5. Миграционное: уход от Delphi

```
Фаза 1 (сейчас):   Delphi = source of truth, Gateway нормализует
Фаза 2 (6-12 мес): Новые сервисы для write-операций, Delphi для read
Фаза 3 (12-24 мес): Delphi → read replica, новые сервисы = primary
Фаза 4 (24+ мес):  Delphi выведен, Gateway адаптеры переключены
```

**Gateway изолирует миграцию:** Модули не знают что адаптер поменялся. Delphi adapter → New Service adapter — одна замена файла в Gateway.

## Feature flags стратегия

Feature flags — центральный механизм управления delivery и rollout.

**Уровни управления:**

```
Глобальный:       trade_in_enabled = false   (для всех дилеров)
Per-dealer:       dealer-42: { trade_in_enabled: true }   (включён для одного)
Percentage:       new_ui: 30%   (30% пользователей видят новый UI)
Kill switch:      experimental_feature: false → мгновенное отключение
```

**Delivery сценарии:**

| Сценарий | Как реализуется |
|----------|----------------|
| Новый модуль в разработке | Flag `module_x_enabled = false`, команда работает, пользователи не видят |
| Постепенный rollout | 10% → 30% → 70% → 100% (с мониторингом на каждом шаге) |
| Критический баг в модуле | Kill switch: `module_x_enabled = false` — мгновенно скрыт без деплоя |
| Разные сценарии для дилеров | Per-dealer config: дилер A видит Trade-in, дилер B — нет |
| A/B тестирование (future) | Флаг + analytics: вариант A vs вариант B, метрики конверсии |

**Текущие флаги:**

| Флаг | Управляет | Тип |
|------|-----------|-----|
| `network_mode` | Дашборд: данные одного дилера vs агрегация по всей сети | Global |
| `trade_in_enabled` | Видимость Trade-in функционала в каталоге | Per-dealer ready |
| `devtools_enabled` | Platform DevTools панель | Debug |

**Конфигурация:** сейчас — JSON. При росте — API endpoint (shell запрашивает флаги при загрузке, поддерживает hot-reload без перезагрузки).

## Альтернативы и обоснование выбора

| Подход | Плюсы | Минусы | Почему не выбран |
|--------|-------|--------|-----------------|
| Монолитный SPA | Простота разработки | Tight coupling, медленные релизы, одна команда блокирует всех | Не масштабируется на 5+ команд |
| Iframe microfrontends | Полная изоляция | Плохой UX (нет общей навигации, scroll issues), сложная коммуникация | Пользовательский опыт неприемлем |
| Module Federation (Webpack 5) | Runtime интеграция, отдельный деплой | Привязка к webpack, сложная конфигурация, версионирование shared deps | Избыточно на старте, запланировано при 10+ модулей |
| **Выбранный: Shell + dynamic import** | Простота, framework-agnostic, lazy loading из коробки | Все модули в монорепе (на старте) | Оптимальный баланс: работает сейчас, расширяется до Module Federation позже |

**Путь эволюции:**
```
Сейчас:      Shell + dynamic import (монорепо, pnpm workspace)
При 10+ мод: Module Federation (независимый деплой, отдельные репо)
При 20+ мод: Micro-frontend registry API (динамическая загрузка по URL)
```

Каждый шаг — эволюция, не переписывание. Shell и contracts остаются, меняется только способ загрузки модулей.

## Точки расширения

### Уже заложены

| Точка | Где | Как расширить |
|-------|-----|---------------|
| Новый модуль | `module-registry.ts` | Одна запись |
| Новый data source | `packages/data-source/` | Новый файл (grpc.ts, ws.ts) |
| Новый feature flag | `contracts/feature-flags.ts` | Добавить в тип + DEFAULT_FLAGS |
| Новый event/command | `contracts/events.ts` / `commands.ts` | Новая версия + тип |
| Новый backend adapter | `services/gateway/src/` | Новый *-adapter.ts |
| Новый CSS компонент | `packages/ui-kit/components/` | Новый .css файл |

### Планируемые

| Точка | Что даёт | Когда |
|-------|----------|-------|
| Module Federation | Независимый деплой модулей без монорепо | При 10+ модулей |
| Micro-frontend registry API | Динамическая загрузка модулей по URL | При независимом деплое |
| WebSocket в data-source | Real-time обновления (склад, заказы) | При требовании real-time |
| Auth provider swap | SSO/SAML вместо mock auth | При интеграции с корпоративной auth |
| i18n provider swap | i18next вместо простого map | При мультиязычности |
| Dark theme | CSS variables swap, уже есть flag | По запросу |
| A/B testing | Feature flags + analytics | При продуктовых экспериментах |
| Error tracking | Sentry/аналог подключение в shell | При production deploy |

## Мониторинг (рекомендация для 3.5K DAU)

```
Frontend:
  - Web Vitals (LCP, FID, CLS) → модуль-специфичные метрики
  - Module load time (уже в DevTools)
  - Error rate per module (error boundary catches)
  - Feature flag usage analytics

Gateway:
  - Request latency (p50, p95, p99)
  - Error rate by endpoint
  - Delphi adapter latency (миграционный индикатор)
  - Cache hit rate (Redis)

Infrastructure:
  - CDN cache hit rate
  - Gateway CPU/memory per instance
  - Concurrent WebSocket connections (future)
```

## Performance бюджет

| Метрика | Бюджет | Текущее |
|---------|--------|---------|
| Initial load (shell) | < 100 KB | ~64 KB ✅ |
| Module chunk | < 300 KB | 140-180 KB ✅ |
| Time to Interactive | < 2s (3G) | ~1.2s ✅ |
| API response (p95) | < 500ms | ~200ms (mock) |
| Module mount time | < 300ms | ~50-100ms ✅ |

При превышении бюджета — сигнал для оптимизации (code split, lazy load, кэш).
