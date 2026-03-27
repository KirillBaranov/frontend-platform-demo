# ADR-007: Data Source Adapters

## Статус
Принято

## Контекст
Модули получают данные из разных источников: сейчас — mock для демо и HTTP к Gateway, в будущем — gRPC, WebSocket, IPC к Delphi процессу. Модули не должны знать откуда данные приходят.

Дополнительно: платформа должна работать в разных режимах:
- GitHub Pages (демо) — без backend, только mock data
- Локальная разработка — HTTP к Gateway BFF
- CI/тесты — детерминированные mock data
- Продакшен — HTTP/gRPC к реальным сервисам

## Решение
Пакет `@platform/data-source` реализует adapter pattern:

```
packages/data-source/
  types.ts   ← интерфейсы: IVehicleSource, IOrderSource, IDashboardSource
  mock.ts    ← реализация: mock data (offline, CI, GitHub Pages)
  http.ts    ← реализация: fetch к Gateway BFF
  index.ts   ← экспортирует активную реализацию по env/config
```

### Использование в модулях

```typescript
import { getDataSource } from '@platform/data-source';

const ds = await getDataSource();
const vehicles = await ds.vehicles.getAll({ brand: 'BMW' });
```

Модуль не знает и не выбирает реализацию. Это делает `index.ts` на основе `VITE_DATA_SOURCE` env.

### Валидация на границе
HTTP адаптер валидирует ответы через Zod схемы из `@platform/contracts`. Если бэкенд вернул невалидные данные — ошибка ловится на границе, не внутри модуля.

## Последствия

### Положительные
- Модули полностью изолированы от источника данных
- Добавление нового адаптера (gRPC, WebSocket) = один файл, ноль изменений в модулях
- Детерминированные тесты (mock mode)
- GitHub Pages deployment (mock mode, без backend)
- Валидация данных предотвращает runtime ошибки от невалидных ответов

### Отрицательные
- Дополнительный слой абстракции (но минимальный — ~100 строк)
- Mock data может разойтись с реальными данными (митигируется Zod схемами)
