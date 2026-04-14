# Настройка базы данных (PostgreSQL)

## Требования

- **Docker** и **Docker Compose** (для локальной PostgreSQL)
- **Node.js 18+**
- **npm**

## Быстрый старт

### 1. Запуск PostgreSQL через Docker

```bash
docker-compose up -d
```

Это создаст контейнер `skinmetrics-postgres` с:
- Пользователь: `postgres`
- Пароль: `postgres`
- База данных: `skinmetrics`
- Порт: `5432`

### 2. Настройка переменных окружения

```bash
# Файл .env уже создан. Проверьте что DATABASE_URL корректный:
cat .env
```

По умолчанию:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skinmetrics?schema=public"
```

### 3. Генерация Prisma Client

```bash
npm run db:generate
```

### 4. Применение миграций и seeding

```bash
# Полный setup: generate + migrate + seed
npm run db:setup
```

Или по отдельности:
```bash
npm run db:migrate    # Применить миграции
npm run db:seed       # Заполнить тестовыми данными
```

### 5. Просмотр данных через Prisma Studio

```bash
npm run db:studio
```

Откроется `http://localhost:5555` — GUI для просмотра БД.

## Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run db:generate` | Сгенерировать Prisma Client |
| `npm run db:migrate` | Применить миграции (development) |
| `npm run db:migrate:prod` | Применить миграции (production, без prompt) |
| `npm run db:seed` | Заполнить БД тестовыми данными |
| `npm run db:studio` | Открыть Prisma Studio (GUI) |
| `npm run db:reset` | Сбросить БД (удалить все данные и миграции) |
| `npm run db:setup` | Полный setup: generate + migrate + seed |

## Миграции

### Создать новую миграцию

```bash
npx prisma migrate dev --name add_some_feature
```

### Применить миграции на production

```bash
npm run db:migrate:prod
```

### Откатить миграцию

```bash
npx prisma migrate dev --name revert_migration
# или
npx prisma migrate reset
```

## Если у вас уже есть PostgreSQL

Если PostgreSQL уже запущен на вашем компьютере (не через Docker), измените `DATABASE_URL` в `.env`:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/skinmetrics?schema=public"
```

Убедитесь что:
1. База данных `skinmetrics` создана (или пользователь имеет права на создание)
2. Порт правильный (обычно `5432`)

## Структура БД

### Модели

| Модель | Описание |
|--------|----------|
| `User` | Пользователь (auth, настройки) |
| `PortfolioItem` | Предмет в портфеле |
| `PriceHistory` | История цен портфеля |
| `Transaction` | История транзакций (покупки/продажи) |
| `PriceAlert` | Алерты изменения цен |
| `WishlistItem` | Список желаемого |
| `PriceCache` | Кэш цен Steam Market |

## Остановка PostgreSQL

```bash
docker-compose down
```

С данными ничего не произойдёт — они хранятся в Docker volume `postgres_data`.

Для полного удаления:
```bash
docker-compose down -v
```
