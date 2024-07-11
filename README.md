# Fastify Backend Task

# Установка

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Создайте файл `.env` и добавьте следующие переменные:

   DB_USER=your_db_user
   DB_HOST=your_db_host
   DB_NAME=your_db_name
   DB_PASSWORD=your_db_password
   DB_PORT=your_db_port
   REDIS_URL=your_redis_url


## Запуск
```bash
npm run build
npm start
```

## Эндпоинты

### GET /api/items

Возвращает список предметов с минимальными ценами (tradable и non-tradable) и кеширует ответ на 1 час.

### POST /api/users/:id/balance

Списание баланса пользователя. Пример тела запроса:

```json
{
  "amount": 100
}
