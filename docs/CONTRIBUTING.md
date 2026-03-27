# Руководство для разработчиков

## Структура команд

Каждая команда владеет одним или несколькими модулями. Команды независимы:
- Свой стек (React, Vue, Svelte, vanilla)
- Свой цикл релизов
- Свои внутренние решения

**Общее для всех:**
- Реализация контракта `ModuleDefinition`
- Использование `@platform/contracts` для событий и типов
- Использование `@platform/ui-kit` для визуальной консистентности
- Использование `@platform/data-source` для данных

## PR Flow

```
feature branch → PR → lint + typecheck + tests → code review → merge to main
```

### Требования к PR
- [ ] Lint проходит (`pnpm lint`)
- [ ] TypeScript проходит (`pnpm typecheck`)
- [ ] Unit тесты проходят (`pnpm test`)
- [ ] E2E тесты проходят (`pnpm test:e2e`) — если затронуты интеграции
- [ ] Описание: что, зачем, как тестировать

### Commit Convention

```
feat(catalog): add vehicle filter by year
fix(dashboard): fix stat card layout on mobile
docs(adr): add ADR-008 for websocket integration
refactor(shell): extract router into separate module
test(e2e): add cross-module order creation test
```

Формат: `type(scope): description`

## Code Review Standards

- **Контракты** — ревью от tech lead (изменения влияют на все модули)
- **Модули** — ревью от команды-владельца
- **Shell** — ревью от tech lead + тестирование со всеми модулями
- **Gateway** — ревью от tech lead + backend team

## Delivery

Модули деплоятся независимо. Обновление module-catalog не требует пересборки module-dashboard.

```
main branch → CI → build module → deploy chunk to CDN → update registry
```

Shell загружает модули из registry (JSON с URL). Обновление модуля = новый URL в registry.
