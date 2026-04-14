# 🚀 Инструкция по деплою — SkinMetrics

## Содержание
- [Требования](#требования)
- [Деплой через Docker (рекомендуется)](#деплой-через-docker)
- [Деплой на VPS (Ubuntu)](#деплой-на-vps-ubuntu)
- [Nginx + SSL](#nginx--ssl)
- [Бэкапы](#бэкапы)
- [Мониторинг](#мониторинг)

---

## Требования

- Сервер с Docker и Docker Compose
- Доменное имя (для SSL)
- Минимум: 1 CPU, 1GB RAM, 10GB диск

## Деплой через Docker

### 1. Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Клонируем репозиторий
git clone https://github.com/your-username/skinmetrics.git
cd skinmetrics
```

### 2. Настройка переменных окружения

```bash
cp .env.production .env

# Генерируем секреты
openssl rand -hex 32  # NEXTAUTH_SECRET
openssl rand -hex 32  # CRON_SECRET
openssl rand -hex 32  # DB_PASSWORD
openssl rand -hex 32  # REDIS_PASSWORD
```

Заполните `.env`:
```env
DATABASE_URL=postgresql://skinmetrics:YOUR_DB_PASSWORD@postgres:5432/skinmetrics
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET
CRON_SECRET=YOUR_CRON_SECRET
DB_PASSWORD=YOUR_DB_PASSWORD
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
```

### 3. Запуск

```bash
docker compose -f docker-compose.prod.yml up -d

# Проверяем статус
docker compose -f docker-compose.prod.yml ps

# Смотрим логи
docker compose -f docker-compose.prod.yml logs -f app
```

### 4. Миграции БД

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

---

## Деплой на VPS (Ubuntu)

### Ручная установка (без Docker)

```bash
# Устанавливаем Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Устанавливаем PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Создаём БД
sudo -u postgres psql
CREATE DATABASE skinmetrics;
CREATE USER skinmetrics WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE skinmetrics TO skinmetrics;
\q

# Собираем приложение
npm ci
npx prisma generate
npm run build

# Запускаем
npm run start
```

### systemd service

```bash
sudo nano /etc/systemd/system/skinmetrics.service
```

```ini
[Unit]
Description=SkinMetrics CS2 Portfolio Tracker
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/skinmetrics
EnvironmentFile=/opt/skinmetrics/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable skinmetrics
sudo systemctl start skinmetrics
sudo systemctl status skinmetrics
```

---

## Nginx + SSL

### 1. Установка Nginx

```bash
sudo apt install -y nginx
```

### 2. Конфигурация

```bash
sudo nano /etc/nginx/sites-available/skinmetrics
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/skinmetrics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 3 * * * certbot renew --quiet
```

---

## Бэкапы

### Автоматический бэкап БД

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/opt/backups/skinmetrics"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U skinmetrics skinmetrics | gzip > "$BACKUP_DIR/skinmetrics_$DATE.sql.gz"

# Удаляем бэкапы старше 30 дней
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Crontab

```bash
# Ежедневный бэкап в 2:00
0 2 * * * /opt/scripts/backup.sh
```

### Восстановление

```bash
gunzip -c skinmetrics_20260413_020000.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U skinmetrics -d skinmetrics
```

---

## Мониторинг

### Healthcheck

```bash
# Проверка доступности
curl -f http://localhost:3000/ || echo "App is down!"

# Проверка БД
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Логи приложения
docker compose -f docker-compose.prod.yml logs -f app --tail=100
```

### Uptime Monitoring

Рекомендуемые сервисы:
- **UptimeRobot** (бесплатно, 50 мониторов)
- **Better Stack** (бесплатно, 10 мониторов)
- **Healthchecks.io** (для cron-задач)

Настройте мониторинг URL: `https://your-domain.com/`

---

## Обновление приложения

```bash
cd /opt/skinmetrics
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

---

## Troubleshooting

### Приложение не запускается
```bash
docker compose -f docker-compose.prod.yml logs app
```

### Ошибка подключения к БД
```bash
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml exec postgres pg_isready
```

### Перезапуск сервиса
```bash
docker compose -f docker-compose.prod.yml restart app
```

### Очистка unused образов
```bash
docker image prune -af
docker volume prune -f
```
