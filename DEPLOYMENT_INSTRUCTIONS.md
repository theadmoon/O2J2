# Инструкция по развертыванию Ocean2Joy (версия 2026-08-26)

## Краткое описание изменений

Все внешние ресурсы (изображения Unsplash и видео Vimeo) теперь локализованы.
Сайт полностью автономен и не зависит от внешних сервисов.

## Что было сделано

1. ✅ Скачаны все изображения с Unsplash.com (5 файлов, ~1 MB)
2. ✅ Размещены в `/frontend/public/images/`
3. ✅ Заменены все ссылки в коде на локальные пути
4. ✅ Заменены Vimeo iframe на HTML5 video с локальными файлами
5. ✅ Проверено отсутствие внешних зависимостей

## Структура файлов

```
/app/frontend/public/
├── images/                              (НОВАЯ ПАПКА)
│   ├── hero-bg.jpg                     (591 KB) - фон главной страницы
│   ├── ocean-auth-bg.jpg               (290 KB) - фон login/register
│   ├── service-custom-video.jpg        (49 KB)  - карточка услуги
│   ├── service-video-editing.jpg       (64 KB)  - карточка услуги
│   └── service-ai-video.jpg            (46 KB)  - карточка услуги
├── videos/                              (существующая)
│   ├── Ocean2Joy_Demo1_720p.mp4        (36 MB)
│   └── Ocean2Joy_Demo2_720p.mp4        (13 MB)
└── posters/                             (существующая)
    ├── demo1.png                        (1.1 MB)
    └── demo2.png                        (1.7 MB)
```

## Развертывание

### Вариант 1: Git Pull (если настроен git remote)

```bash
cd /opt/ocean2joy
git pull
docker compose build frontend backend
docker compose up -d
```

### Вариант 2: Клонирование репозитория

```bash
# Если репозиторий еще не склонирован
cd /opt
git clone https://github.com/theadmoon/O2J2.git ocean2joy
cd ocean2joy

# Настроить .env файлы (если нужно)
# frontend/.env - REACT_APP_BACKEND_URL
# backend/.env - MONGO_URL, DB_NAME

# Собрать и запустить
docker compose build
docker compose up -d
```

## Проверка после развертывания

### 1. Проверка доступности изображений

```bash
curl -I https://ocean2joy.com/images/hero-bg.jpg
curl -I https://ocean2joy.com/images/ocean-auth-bg.jpg
```

Ожидаемый результат: `HTTP/2 200`

### 2. Проверка отсутствия внешних ссылок

Откройте https://ocean2joy.com в браузере и:
- Откройте DevTools → Network
- Перезагрузите страницу
- Убедитесь, что НЕТ запросов к:
  - `images.unsplash.com` ❌
  - `player.vimeo.com` ❌

### 3. Визуальная проверка

Проверьте страницы:
- ✅ `/` - главная страница с фоновым изображением и двумя видео
- ✅ `/login` - страница входа с фоном
- ✅ `/register` - страница регистрации с фоном
- ✅ `/services` - страница услуг с тремя карточками и изображениями

## Изменённые файлы

- `frontend/src/pages/Homepage.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `backend/routes/public.py`
- `frontend/public/images/` (новая папка с 5 изображениями)

## Никаких изменений в:

- API endpoints
- База данных MongoDB
- Конфигурация Docker
- Конфигурация Nginx
- .env файлы

## Размер изменений

- Новые файлы: ~1.0 MB (изображения)
- Изменённые файлы: 4 файла кода
- Увеличение размера Docker image: ~1.0 MB

## Поддержка

Все изменения следуют архитектуре предыдущих релизов.
Использована та же структура папок, что и для видео.
Совместимость со всеми существующими функциями сохранена.

---

**Результат:** Сайт ocean2joy.com теперь полностью автономен ✅
