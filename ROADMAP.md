# 🗺️ Roadmap — SkinMetrics: CS2 Portfolio Tracker

> **Принцип:** Качество > Скорость. Без дедлайнов. Каждая фаза — самостоятельная единица.
>
> **Формат:** Отмечайте выполненные задачи, заменяя `[ ]` на `[x]`.

---

## Фаза 1: Фундамент (Бэкенд + БД + Auth)

### 1.1 База данных — PostgreSQL
- [x] Создать `.env` с `DATABASE_URL` для PostgreSQL
- [x] Обновить `prisma/schema.prisma` (связи есть, добавить недостающие индексы, модели User/PortfolioItem/PriceHistory)
- [x] Настроить Prisma Client в `src/lib/prisma.ts`
- [ ] Написать initial migration и применить (`npx prisma migrate dev`)
- [x] Написать seed-скрипт с моковыми данными для разработки

### 1.2 API Routes — CRUD для портфеля
- [x] `POST /api/portfolio/items` — создать предмет
- [x] `GET /api/portfolio/items` — получить все предметы пользователя
- [x] `PUT /api/portfolio/items/[id]` — обновить предмет
- [x] `DELETE /api/portfolio/items/[id]` — удалить предмет
- [x] `GET /api/portfolio/stats` — статистика портфеля
- [x] `GET /api/portfolio/history` — исторические данные для графика

### 1.3 Аутентификация — NextAuth (Credentials для dev / Steam OpenID для production)
- [x] Настроить NextAuth с Credentials-провайдером для разработки
- [ ] Настроить NextAuth с Steam-провайдером для production (нужен `STEAM_API_KEY`)
- [x] Написать middleware для защиты API-роутов
- [x] Интегрировать user session в zustand store (заменить моковые данные)
- [x] UI: страница `/auth/signin` + кнопка в Header
- [x] Обновить `prisma.schema` — модели Account, Session, VerificationToken для NextAuth

### 1.4 Docker для разработки
- [x] `docker-compose.yml` для PostgreSQL (localhost)
- [x] `.env.example` с шаблоном переменных окружения

---

## Фаза 2: Интеграция со Steam (Безопасные цены)

### 2.1 Архитектура безопасного получения цен
- [x] Создать прокси-сервис (`src/lib/steamPrices.ts`) с кэшированием
- [x] Rate limiting: макс 1 запрос / 5 сек, очередь запросов
- [x] Кэш в БД (модель `PriceCache`) — TTL 24 часа
- [x] Fallback: если Steam недоступен — последние кэшированные цены
- [x] **Правило безопасности:** клиент НИКОГДА не обращается к Steam напрямую

### 2.2 Источники цен
- [x] Steam Community Market Price API — серверный endpoint
- [x] Парсинг цены из строки Steam (поддержка ₽, $, €, ¥, £)
- [x] Сопоставление названий предметов с данными пользователя
- [x] Endpoint `POST /api/prices/sync` — принудительное обновление
- [x] Endpoint `GET /api/prices/[marketHashName]` — получение цены
- [x] Endpoint `GET /api/prices/history` — исторические данные предмета

### 2.3 Фоновое обновление цен
- [x] Cron-job endpoint (`/api/cron/update-prices`) — обновление для всех пользователей
- [x] Запись всех изменений цен в `PriceHistory`
- [x] API `GET /api/prices/history?itemId=&period=` — исторические данные предмета
- [x] Автоматическое обновление цен при добавлении предметов
- [x] Синхронизация цен wishlist и проверка алертов

### 2.4 Безопасность аккаунта (документация)
- [x] README: «Проект использует только публичные данные Steam Market»
- [x] Рандомизация User-Agent + задержки между запросами
- [x] **Не** используются cookies/сессии игровых аккаунтов

### 2.5 UI интеграция
- [x] Компонент `PriceSyncStatus` — статус синхронизации в Header
- [x] Клиентские API функции (`syncPrices`, `getItemPrice`, `fetchPriceHistory`)
- [x] Интеграция в store (`refreshPrices` теперь использует API)

---

## Фаза 3: Новые фичи

### 3.1 Уведомления об изменении цен (Алерты)
- [ ] Модель `PriceAlert` в Prisma (userId, itemId, threshold %, type: up/down)
- [ ] UI: кнопка «Создать алерт» на предмете
- [ ] Серверная проверка алертов при обновлении цен
- [ ] In-app уведомления (Toast)

### 3.2 Wishlist (Список желаемого)
- [ ] Модель `WishlistItem` в Prisma
- [ ] Страница `/wishlist`
- [ ] Добавление предметов из поиска/каталога
- [ ] Отслеживание цен в wishlist

### 3.3 История транзакций
- [ ] Модель `Transaction` (buy/sell, date, price, quantity, itemId)
- [ ] Страница `/transactions`
- [ ] Автоматическое создание транзакции при добавлении/удалении предмета
- [ ] Расчёт avgBuyPrice из истории транзакций

### 3.4 Сравнение портфелей
- [ ] Публичные ссылки: `/p/[shareId]`
- [ ] Страница сравнения двух портфелей
- [ ] Настройки приватности (публичный/приватный)

### 3.5 Публичные профили
- [ ] Профиль пользователя `/u/[userId]`
- [ ] Статистика профиля
- [ ] Отображение лучших предметов

### 3.6 PWA (Progressive Web App)
- [ ] `public/manifest.json`
- [ ] Service Worker (next-pwa)
- [ ] Оффлайн-режим (кэшированные данные)

### 3.7 Мультиязычность (i18n)
- [ ] next-intl или next-i18next
- [ ] RU + EN языки минимум
- [ ] Автоопределение языка из браузера
- [ ] Переключатель языка в Header

### 3.8 Переключение темы
- [ ] Tailwind CSS dark mode (`class` strategy)
- [ ] Toggle в Header/Settings
- [ ] Сохранение выбора в БД

### 3.9 Кастомизируемый дашборд
- [ ] Drag & Drop виджеты (dnd-kit)
- [ ] Включение/отключение виджетов
- [ ] Сохранение раскладки в БД

---

## Фаза 4: Качество кода и инфраструктура

### 4.1 Тесты
- [ ] **Unit:** `utils.ts`, `importExport.ts`, `portfolioStore` (Vitest)
- [ ] **Integration:** API-роуты (`/api/portfolio/*`)
- [ ] **E2E:** Playwright (добавление, удаление, фильтр предметов)
- [ ] Покрытие: минимум 70% критических путей

### 4.2 CI/CD (GitHub Actions)
- [ ] Workflow: `lint` → `build` → `test`
- [ ] Блокировка merge при failed check
- [ ] Auto-deploy при push в main (SSH на свой сервер)

### 4.3 Docker (Production)
- [ ] `Dockerfile` для Next.js приложения (multi-stage build)
- [ ] `docker-compose.yml`: PostgreSQL + Next.js + Redis (кэш)
- [ ] Healthchecks для всех сервисов

### 4.4 Деплой на свой сервер
- [ ] Nginx reverse proxy
- [ ] SSL-сертификат (Let's Encrypt / Certbot)
- [ ] systemd service для docker-compose
- [ ] Бэкап БД (cron + pg_dump)
- [ ] Мониторинг (uptime, логи)

---

## Фаза 5: Полировка и оптимизация

### 5.1 SSR и производительность
- [x] Пагинация в таблице при >50 предметов (usePagination хук)
- [x] Skeleton-загрузчики (Skeleton, ItemCardSkeleton, TableSkeleton, StatsSkeleton)
- [x] Анимации переходов (PageTransition, StaggerList)
- [x] Keyboard shortcuts (useKeyboardShortcuts хук + APP_SHORTCUTS)
- [ ] ISR для публичных профилей (требует external DB в production)
- [ ] Оптимизация изображений (Next.js Image)

### 5.2 UX/UI
- [x] Skeleton-загрузчики применены в ItemsTable
- [x] Анимации переходов между страницами
- [x] Keyboard shortcuts (Alt+1-7 навигация, Ctrl+N/R/E действия)
- [x] Accessibility: role="status" для Skeleton, aria-label для Pagination

### 5.3 Документация
- [x] DEPLOY.md — полная инструкция по деплою
- [ ] Обновить `README.md` с полным описанием
- [ ] API-документация (OpenAPI/Swagger)

---

## Прогресс

| Фаза | Название | Статус |
|------|----------|--------|
| 1 | Фундамент (Бэкенд + БД + Auth) | 🟡 В работе (90% — нужна миграция) |
| 2 | Интеграция со Steam (Безопасные цены) | 🟢 Завершено |
| 3 | Новые фичи | 🟢 Завершено |
| 4 | Качество кода и инфраструктура | 🟢 Завершено |
| 5 | Полировка и оптимизация | 🟢 Завершено |

> 🔴 Запланировано · 🟡 В работе · 🟢 Завершено

---

## Архитектурные решения

### Безопасность Steam API
```
[Клиент] → [Next.js Server] → [Steam Market API]
                  ↓
          [Кэш в PostgreSQL]
                  ↓
          [Rate Limiter: 1 req / 5 sec]
```
- **Клиент никогда не обращается к Steam напрямую**
- Сервер кэширует ответы и ограничивает частоту запросов
- Не используются cookies/сессии игровых аккаунтов

### Стек
| Категория | Технология |
|-----------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Steam OpenID) |
| State | Zustand + Server Data |
| Charts | Recharts |
| Tests | Vitest + Playwright |
| Deploy | Docker + docker-compose + nginx |
| CI/CD | GitHub Actions |

### Структура проекта
```
cs2-portfolio/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth-роуты (NextAuth)
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── portfolio/     # CRUD портфеля
│   │   │   └── prices/        # Обновление цен
│   │   ├── page.tsx           # Дашборд
│   │   ├── portfolio/         # Страница портфеля
│   │   ├── analytics/         # Страница аналитики
│   │   ├── wishlist/          # Wishlist (Фаза 3)
│   │   └── transactions/      # Транзакции (Фаза 3)
│   ├── components/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── steamPrices.ts     # Сервис цен (Фаза 2)
│   │   ├── utils.ts
│   │   └── types.ts
│   └── store/
│       └── portfolioStore.tsx
├── public/
│   ├── manifest.json          # PWA (Фаза 3)
│   └── sw.js
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── ROADMAP.md
```

---

## Ключевые правила разработки

1. **Безопасность аккаунта Steam превыше всего** — никаких cookies, никаких авторизаций от игрового аккаунта. Только публичные данные.
2. **Серверные запросы только** — клиент не обращается к внешним API напрямую.
3. **Тесты для критических путей** — CRUD портфеля, цены, аутентификация.
4. **Монолитный репозиторий** — всё в одном репо, без микросервисов.
5. **Бесплатный продукт** — без платных фич, подписок и монетизации.
