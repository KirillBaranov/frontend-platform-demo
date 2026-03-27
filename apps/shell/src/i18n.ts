/**
 * Minimal i18n stub.
 *
 * Modules use t('catalog.title') — they don't know the implementation.
 * Currently: simple key-value map from a JSON file.
 * Future: plug in i18next, vue-i18n, or any other i18n library.
 *
 * The shell owns the i18n instance and passes t() to modules via context.
 */

const translations: Record<string, Record<string, string>> = {
  ru: {
    'app.title': 'Платформа',
    'nav.catalog': 'Каталог',
    'nav.dashboard': 'Дашборд',
    'catalog.title': 'Каталог автомобилей',
    'catalog.filter.brand': 'Марка',
    'catalog.filter.year': 'Год',
    'catalog.filter.price': 'Цена',
    'catalog.status.in_stock': 'В наличии',
    'catalog.status.reserved': 'Зарезервирован',
    'catalog.status.sold': 'Продан',
    'dashboard.title': 'Дашборд менеджера',
    'dashboard.total_vehicles': 'Всего автомобилей',
    'dashboard.in_stock': 'В наличии',
    'dashboard.orders': 'Заказы',
    'dashboard.revenue': 'Выручка',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка загрузки модуля',
    'common.retry': 'Повторить',
  },
};

let currentLocale = 'ru';

/** Translation function passed to modules via ModuleContext. */
export function t(key: string): string {
  return translations[currentLocale]?.[key] ?? key;
}

/** Change locale (triggers re-render if modules support it). */
export function setLocale(locale: string): void {
  currentLocale = locale;
}

/** Get current locale. */
export function getLocale(): string {
  return currentLocale;
}
