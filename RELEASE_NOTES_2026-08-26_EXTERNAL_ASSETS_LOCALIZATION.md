# Ocean2Joy — Release Notes

**Release tag**: `v2.0.26-external-assets-localization`  
**Date**: 2026-08-26  
**Scope**: Локализация всех внешних ресурсов (изображения + видео). **No API, no schema, no data migration changes.**

---

## 1. Контекст

После успешного переноса видео-файлов на собственный хостинг (релиз 2026-04-22), в коде остались ссылки на внешние ресурсы:
- **Изображения с Unsplash.com** (5 уникальных изображений)
- **Видео с Vimeo** (2 iframe embed'а)

Это создавало две проблемы:
1. **Блокировка загрузки изображений** внешним сервисом (Unsplash блокирует прямые запросы)
2. **Зависимость от внешних сервисов** (Vimeo) для критически важного контента
3. **Несоответствие подходу** к полной автономности сайта

Данный релиз полностью устраняет все внешние зависимости, перенося все ресурсы на локальный хостинг.

---

## 2. Изменения

### 2.1. Созданы локальные копии изображений

Все изображения с Unsplash.com скачаны и размещены в `/app/frontend/public/images/`:

| Файл | Исходный URL | Назначение |
|------|--------------|------------|
| `hero-bg.jpg` (591 KB) | `photo-1599622465858` | Фон hero-секции главной страницы |
| `ocean-auth-bg.jpg` (290 KB) | `photo-1507525428034` | Фон страниц Login & Register |
| `service-custom-video.jpg` (49 KB) | `photo-1492619375914` | Карточка услуги "Custom Video Production" |
| `service-video-editing.jpg` (64 KB) | `photo-1551818255-e6e10975bc17` | Карточка услуги "Video Editing" |
| `service-ai-video.jpg` (46 KB) | `photo-1677442135136` | Карточка услуги "AI-Generated Video" |

**Общий размер:** ~1.0 MB

### 2.2. Заменены ссылки на изображения

**Frontend:**
- `frontend/src/pages/Homepage.jsx` (строка 148): hero background
  - **Было:** `url('https://images.unsplash.com/photo-1599622465858-a0b63fdc9b80?auto=format&fit=crop&w=1920&q=80')`
  - **Стало:** `url('/images/hero-bg.jpg')`

- `frontend/src/pages/Login.jsx` (строка 10): константа OCEAN_BG
  - **Было:** `"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"`
  - **Стало:** `"/images/ocean-auth-bg.jpg"`

- `frontend/src/pages/Register.jsx` (строка 10): константа OCEAN_BG
  - **Было:** `"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"`
  - **Стало:** `"/images/ocean-auth-bg.jpg"`

**Backend:**
- `backend/routes/public.py` — SERVICES массив (строки 58, 74, 90):
  - Custom Video: `/images/service-custom-video.jpg`
  - Video Editing: `/images/service-video-editing.jpg`
  - AI Video: `/images/service-ai-video.jpg`

### 2.3. Заменены Vimeo iframe на локальные видео

Вместо внешних iframe с Vimeo, теперь используются локальные видео-файлы с HTML5 `<video>` тегом:

**`frontend/src/pages/Homepage.jsx` (строки 314-357):**

**Было:**
```jsx
<iframe
  src="https://player.vimeo.com/video/115098447?background=1&autoplay=0&loop=0&byline=0&title=0"
  className="w-full h-full"
  frameBorder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
  title="Custom Video Production Demo"
></iframe>
```

**Стало:**
```jsx
<video
  className="w-full h-full"
  controls
  poster="/posters/demo1.png"
  title="Custom Video Production Demo"
>
  <source src="/videos/Ocean2Joy_Demo1_720p.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

То же самое для второго видео (`demo2`).

**Преимущества:**
- ✅ Полный контроль над плеером
- ✅ Нет зависимости от внешних сервисов
- ✅ Работает без интернета (для локальной разработки)
- ✅ Используются существующие локальные постеры (`/posters/demo1.png`, `/posters/demo2.png`)

---

## 3. Полный список изменённых файлов

### Создано (5 новых файлов)
```
frontend/public/images/hero-bg.jpg                  — 591 KB
frontend/public/images/ocean-auth-bg.jpg            — 290 KB
frontend/public/images/service-custom-video.jpg     — 49 KB
frontend/public/images/service-video-editing.jpg    — 64 KB
frontend/public/images/service-ai-video.jpg         — 46 KB
RELEASE_NOTES_2026-08-26_EXTERNAL_ASSETS_LOCALIZATION.md — этот документ
```

### Изменено (4 файла)
```
frontend/src/pages/Homepage.jsx     — hero bg + замена iframe на <video>
frontend/src/pages/Login.jsx        — OCEAN_BG константа
frontend/src/pages/Register.jsx     — OCEAN_BG константа
backend/routes/public.py            — SERVICES.image_url (3 услуги)
```

### НЕ менялось
- Все API endpoints
- MongoDB схемы и данные
- Структура проекта (используется существующая папка `/videos/` и `/posters/`)
- SEO meta, JSON-LD
- Операционная цепочка
- Аутентификация

---

## 4. Пошаговая инструкция деплоя

### Предпосылки
- Docker + Docker Compose установлены
- Репозиторий уже клонирован

### Шаг 1. Забрать код
```bash
cd /opt/ocean2joy   # или где лежит репо
git pull
```

### Шаг 2. Пересобрать контейнеры
```bash
docker compose build frontend backend
docker compose up -d frontend backend
```

**Важно:** Новые изображения попадут в образ frontend при сборке. Hot reload НЕ подхватит новые статические файлы — требуется пересборка.

### Шаг 3. Smoke-тесты

```bash
API=https://ocean2joy.com

# 1. Проверка доступности изображений
for img in hero-bg.jpg ocean-auth-bg.jpg service-custom-video.jpg service-video-editing.jpg service-ai-video.jpg; do
  echo -n "$img: "
  curl -I $API/images/$img 2>/dev/null | head -1
done
# Ожидание: HTTP/2 200 для всех

# 2. Проверка API услуг
curl -s $API/api/services | python3 -c "
import sys, json
services = json.load(sys.stdin)
for s in services:
    assert s['image_url'].startswith('/images/'), f'{s[\"id\"]}: still external URL'
    assert 'unsplash' not in s['image_url'], f'{s[\"id\"]}: contains unsplash'
print('✓ All service images are local')
"

# 3. Проверка отсутствия внешних ссылок в HTML
curl -s $API/ | grep -iE "unsplash|vimeo" && echo "❌ Found external links" || echo "✓ No external links"

# 4. Проверка видео
curl -I $API/videos/Ocean2Joy_Demo1_720p.mp4 | head -1
curl -I $API/videos/Ocean2Joy_Demo2_720p.mp4 | head -1
# Ожидание: HTTP/2 200
```

### Шаг 4. Проверки в браузере

1. **Главная страница** (`/`):
   - Hero-секция показывает фоновое изображение (океан)
   - Два демо-видео отображаются с постерами
   - Кликабельные плееры с контролами

2. **Страницы Login/Register** (`/login`, `/register`):
   - Фоновое изображение загружается

3. **Страница Services** (`/services`):
   - Три карточки услуг показывают изображения

4. **DevTools → Network**:
   - Нет запросов к `images.unsplash.com`
   - Нет запросов к `player.vimeo.com`
   - Все изображения грузятся с `/images/`
   - Видео грузятся с `/videos/`

5. **DevTools → Console**:
   - Нет ошибок 404 для изображений
   - Нет CORS ошибок

---

## 5. QA / Regression Checklist

### 5.1. Automated checks

```bash
# Проверка отсутствия внешних URL в исходниках
cd /app
grep -r "unsplash\|vimeo" frontend/src backend/routes --include="*.js" --include="*.jsx" --include="*.py"
# Ожидание: пусто (exit code 1)

# Проверка наличия всех файлов
ls -lh frontend/public/images/
# Ожидание: 5 файлов jpg

# Проверка размера изображений (не должны быть слишком большими)
du -sh frontend/public/images/
# Ожидание: ~1.0M
```

### 5.2. Manual UI checks

1. `/` — hero-секция с океанским фоном, два видео с плеерами
2. `/login` — океанский фон
3. `/register` — океанский фон
4. `/services` — три карточки с изображениями
5. `/services/custom-video` — изображение загружается
6. `/services/video-editing` — изображение загружается
7. `/services/ai-video` — изображение загружается

### 5.3. Performance

- **До**: Зависимость от Unsplash CDN (может быть заблокирован)
- **После**: Все ресурсы локальные, быстрая загрузка

---

## 6. Impact

- **API contract**: Без изменений
- **Database**: Без изменений
- **SEO / JSON-LD**: Без изменений
- **Размер репозитория**: +1.0 MB (изображения)
- **Размер Docker image (frontend)**: +1.0 MB
- **Внешние зависимости**: **Полностью устранены** ✅

---

## 7. Commit message (рекомендуемый)

```
chore: localize all external assets (images + videos)

- Download and store all Unsplash images locally in /frontend/public/images/
  (5 images: hero-bg, auth bg, 3 service cards, total ~1.0 MB)
- Replace all image_url references: unsplash.com → /images/*.jpg
- Replace Vimeo iframe embeds with HTML5 <video> tags using existing local files
  (/videos/Ocean2Joy_Demo1_720p.mp4, /videos/Ocean2Joy_Demo2_720p.mp4)
- Use existing local posters (/posters/demo1.png, /posters/demo2.png)

Result: Zero external dependencies for all site assets.
Site is now fully self-hosted and works without internet access.

Files changed:
- frontend/src/pages/Homepage.jsx (hero bg + video players)
- frontend/src/pages/Login.jsx (auth bg)
- frontend/src/pages/Register.jsx (auth bg)
- backend/routes/public.py (service image URLs)
- +5 new image files in frontend/public/images/

No API, schema, or data changes. No regressions expected.
```

---

## 8. Следующие шаги (опционально)

**Рекомендации для будущих улучшений:**

1. **Оптимизация изображений:**
   - Можно дополнительно сжать изображения (WebP формат)
   - Создать responsive версии (разные размеры для мобильных)

2. **Lazy loading:**
   - Добавить `loading="lazy"` для изображений ниже fold
   - Добавить `preload="none"` для видео

3. **CDN (опционально):**
   - Если нужна глобальная доставка, можно настроить собственный CDN
   - Но для текущей задачи это не требуется

---

## 9. Поддержка

Все изменения сделаны в соответствии с архитектурой предыдущих релизов:
- Используется та же структура папок (`/public/images/`, `/public/videos/`, `/public/posters/`)
- Применён тот же подход с локальными путями
- Сохранена совместимость со всеми существующими функциями

**Результат:** Сайт ocean2joy.com теперь полностью автономен и не зависит от внешних ресурсов.
