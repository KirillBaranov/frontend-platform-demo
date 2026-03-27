# ADR-005: CSS-first UI Kit

## Статус
Принято

## Контекст
Команды работают на разных фреймворках (React, Vue, и потенциально Svelte, Solid в будущем). Нужен единый визуальный стиль без vendor lock-in. Дизайнера на старте нет.

Варианты:
- Компонентная библиотека (shadcn, Vuetify, etc.) — привязана к фреймворку
- Web Components — универсальны, но тяжелее в реализации
- CSS-only — работает везде, минимальный overhead

## Решение
UI Kit реализован как чистый CSS: design tokens (CSS custom properties) + CSS-классы для компонентов.

```css
/* Любой фреймворк — один и тот же класс */
<button class="btn btn-primary">Заказ</button>
```

### Структура

```
ui-kit/
  tokens/     ← CSS custom properties (цвета, типографика, отступы, тени)
  base/       ← reset + layout utilities
  components/ ← .btn, .card, .table, .badge, .input, .sidebar
  index.css   ← один import
```

### Подключение в модуле

```typescript
import '@platform/ui-kit'; // один import, работает в React, Vue, vanilla
```

## Последствия

### Положительные
- Работает в любом фреймворке без обёрток и адаптеров
- Дизайнер придёт → меняет tokens → все модули обновляются
- Минимальный размер (~12KB)
- Нет runtime overhead (CSS, не JS)

### Отрицательные
- Нет интерактивных компонентов (модалки, дропдауны) — каждый модуль реализует сам
- Нет автодополнения в IDE для CSS-классов (решается через Tailwind intellisense)
- Менее выразительный API чем компонентная библиотека

### Эволюция
При необходимости — добавить Web Components для сложных интерактивных элементов (`<ui-modal>`, `<ui-data-table>`). Они работают нативно в любом фреймворке и дополняют CSS-классы.
