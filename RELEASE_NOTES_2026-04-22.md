# Ocean2Joy v2.0 — Release Notes (22 April 2026)

> **Контекст для разработчика:** этот релиз (1) полностью убирает зависимость от инфраструктуры Emergent (external CDN, трекинг-скрипты, Emergent-бейдж), (2) добавляет SEO-слой (мета-теги per-page, JSON-LD, sitemap, robots.txt), (3) вводит админ-CMS для демо-видео с загрузкой файлов и постеров, (4) добавляет Resend-диагностику. Все изменения оттестированы testing-агентом (16/16 backend PASS + полный e2e на фронте).

---

## 1. Цели релиза

| № | Задача | Статус |
|---|---|---|
| 1 | Сделать продакшен полностью независимым от Emergent (хостинг ассетов, трекинг, бейджи) | ✅ |
| 2 | Корректные `<title>` + meta description для браузерной вкладки и SEO | ✅ |
| 3 | JSON-LD VideoObject для демо-видео + Organization/WebSite schema для AI-поисковиков | ✅ |
| 4 | Админ-панель: загрузка и управление демо-видео с постерами | ✅ |
| 5 | Диагностика Resend (почему могли пропасть уведомления на проде) | ✅ |
| 6 | Per-page meta-теги для всех публичных страниц (для быстрой индексации нового сайта в Google + Perplexity/ChatGPT Search/Claude) | ✅ |
| 7 | `robots.txt` + `sitemap.xml` | ✅ |

---

## 2. Найдены и удалены ссылки на Emergent (6 мест)

| Файл | Что убрано | Замена |
|---|---|---|
| `backend/routes/public.py` | 2 видео на `customer-assets.emergentagent.com` | Локальные файлы `/videos/Ocean2Joy_Demo1_720p.mp4`, `Ocean2Joy_Demo2_720p.mp4` (раздаются nginx'ом фронта) |
| `frontend/public/index.html` (line 52 старый) | `<script src="https://assets.emergent.sh/scripts/emergent-main.js">` | Полностью удалён |
| `frontend/public/index.html` (lines 67–111 старые) | «Made with Emergent» бейдж → `app.emergent.sh` | Полностью удалён |
| `frontend/public/index.html` (lines 112–182 старые) | PostHog-трекер с токеном Emergent (`phc_xAvL2Iq4...`) | Полностью удалён |
| `frontend/package.json` (devDependencies) | `@emergentbase/visual-edits` → `assets.emergent.sh` | Удалён через `yarn remove`. `craco.config.js` уже имеет try/catch → сборка продолжает работать без него. |
| `frontend/yarn.lock` | Автосгенерировано после `yarn remove` | — |

**Проверено:** `grep -rn "emergentagent\|emergent.sh\|emergentbase" src/ public/ backend/ --exclude-dir=node_modules` → 0 совпадений (кроме `.env`, где preview-URL для dev, на продакшене будет `ocean2joy.com`).

---

## 3. Новые бэкенд-эндпоинты

### Demo Videos (публичные)
```
GET  /api/demo-videos                            # список из MongoDB, отсортирован по order
GET  /api/public/demo-media/{id}/video           # стриминг MP4 для uploaded-записей
GET  /api/public/demo-media/{id}/poster          # стриминг постера
```

### Demo Videos (admin-only, требуется сессионная cookie админа)
```
GET    /api/admin/demo-videos                    # список с метаданными
POST   /api/admin/demo-videos                    # создать (multipart: title, description, tags, video, poster)
PUT    /api/admin/demo-videos/{id}               # обновить title/description/tags (JSON body)
POST   /api/admin/demo-videos/{id}/video         # заменить видеофайл (multipart: file)
POST   /api/admin/demo-videos/{id}/poster        # заменить постер
DELETE /api/admin/demo-videos/{id}               # удалить запись + файлы с диска
POST   /api/admin/demo-videos/reorder            # {order: [id1, id2, ...]}
```

### Resend диагностика (admin-only)
```
GET   /api/admin/notifications/diagnostics       # показывает env-конфиг Resend (ключ маскируется)
POST  /api/admin/notifications/test              # отправляет тестовое письмо с полным ответом Resend
```

### Размерные лимиты
- Видео: **200 MB** (`MAX_VIDEO_MB = 200`)
- Постер: **10 MB** (`MAX_POSTER_MB = 10`)
- Валидация расширений: видео `.mp4 .mov .webm .m4v`; постер `.png .jpg .jpeg .webp`.

---

## 4. Изменения в БД (MongoDB)

Новая коллекция **`demo_videos`**:
```js
{
  id: "demo-1" | "demo-<uuid8>",
  title, description, tags: [str],
  order: int,
  video_storage: "static" | "uploaded",
  video_url: str | null,             // если static
  video_filename, video_original_name, video_size,   // если uploaded
  poster_storage: "static" | "uploaded",
  poster_url: str | null,
  poster_filename, poster_original_name, poster_size,
  created_at, updated_at  (ISO UTC strings)
}
```

**Seed** (`backend/database/seed.py`) на первом запуске вставляет 2 записи (`demo-1`, `demo-2`) со `storage="static"`, указывающие на `/videos/Ocean2Joy_Demo*_720p.mp4`. Если коллекция уже не пуста — ничего не делает (идемпотентно).

**Индекс:** `db.demo_videos.createIndex({id:1}, {unique:true})`.

---

## 5. Новая файловая структура загрузок

```
/app/backend/uploads/demo_media/
  └── <demo-id>/
      ├── video/video.<ext>
      └── poster/poster.<ext>
```

В docker-compose.yml уже есть volume `backend_uploads` → `/app/backend/uploads`. Новая папка `demo_media` создастся автоматически.

---

## 6. SEO-слой (новое)

### 6.1. Per-page meta через кастомный хук `useSeo`

Файл: `frontend/src/hooks/useSeo.js` (нет новых npm-зависимостей).

Применён ко всем страницам:

| Роут | Title | robots |
|---|---|---|
| `/` | Ocean2Joy — Digital Video Production Studio | index,follow |
| `/services` | Video Production Services \| Ocean2Joy | index,follow |
| `/services/:id` | `{service.title}` \| Ocean2Joy (динамически) | index,follow |
| `/how-it-works` | How It Works — 12-Stage Video Production Workflow \| Ocean2Joy | index,follow |
| `/contact` | Contact Ocean2Joy — Video Production Studio | index,follow |
| `/legal` | Legal Information \| Ocean2Joy | index,follow |
| `/policies/terms` | Terms of Service \| Ocean2Joy | index,follow |
| `/policies/digital_delivery` | Digital Delivery Policy \| Ocean2Joy | index,follow |
| `/policies/refund` | Refund & Cancellation Policy \| Ocean2Joy | index,follow |
| `/policies/revision` | Revision Policy \| Ocean2Joy | index,follow |
| `/policies/privacy` | Privacy Policy \| Ocean2Joy | index,follow |
| `/login`, `/register` | — | **noindex, nofollow** |
| `/dashboard`, `/profile`, `/projects/*`, `/admin` | — | **noindex, nofollow** |

Для каждой страницы хук выставляет:
- `document.title`
- `meta[name="description"]` (уникальный контент)
- `meta[property="og:title|og:description|og:type|og:image|og:url"]`
- `meta[name="twitter:card|twitter:title|twitter:description|twitter:image"]`
- `link[rel="canonical"]`
- `meta[name="robots"]`

### 6.2. JSON-LD structured data

**В `frontend/public/index.html` (статично, видно всем ботам без JS):**
- `Organization` schema — идентичность бренда (название, логотип, адрес, основатель, tax ID)
- `WebSite` schema — канонический сайт

**На Homepage (`Homepage.jsx`, динамически через `useEffect`):**
- `VideoObject[]` schema — по одной записи на каждое демо-видео, с абсолютными URL, `uploadDate` из `created_at` из БД, `publisher`=Ocean2Joy.

### 6.3. `robots.txt`

`frontend/public/robots.txt` — разрешает краулинг публичных страниц, запрещает `/admin`, `/dashboard`, `/profile`, `/projects`, `/login`, `/register`, `/api/`. Явно указаны allow для:
- Googlebot, Googlebot-Image, Googlebot-Video, Bingbot, DuckDuckBot, YandexBot, Applebot
- **AI-краулеры:** GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-Web, Google-Extended, Applebot-Extended

### 6.4. `sitemap.xml`

`frontend/public/sitemap.xml` — 13 публичных URL с приоритетами. Ссылается на `https://ocean2joy.com/...`. После деплоя нужно будет **один раз** добавить в Google Search Console и Bing Webmaster Tools.

---

## 7. Полный список изменённых/новых файлов

### Создано (7 новых файлов)
```
frontend/src/hooks/useSeo.js                       — SEO hook, 60 строк
frontend/src/components/admin/DemoVideosManager.jsx — Admin UI для демо-видео, ~380 строк
frontend/public/robots.txt                         — crawler directives
frontend/public/sitemap.xml                        — static sitemap
frontend/public/videos/Ocean2Joy_Demo1_720p.mp4    — 36 MB (self-hosted demo 1)
frontend/public/videos/Ocean2Joy_Demo2_720p.mp4    — 13 MB (self-hosted demo 2)
```
*(Примечание: `/app/frontend/public/videos/Demo*_O2J2.mp4` — **удалены** и переименованы в `Ocean2Joy_Demo*_720p.mp4` для лучшей SEO-подписи в URL.)*

### Изменено (15 файлов)

**Backend:**
```
backend/routes/public.py          — новая helper _build_public_demo_video, GET /api/demo-videos теперь из БД, + GET /api/public/demo-media/{id}/{video,poster}
backend/routes/admin.py           — CRUD для demo_videos (~220 строк) + Resend diagnostics + test endpoints
backend/database/seed.py          — seed демо-видео + индекс demo_videos(id)
```

**Frontend:**
```
frontend/public/index.html        — убраны Emergent-скрипты/бейдж/PostHog, добавлены: proper title, meta description, OG/Twitter, favicon, theme-color, Organization + WebSite JSON-LD
frontend/package.json             — удалён @emergentbase/visual-edits
frontend/yarn.lock                — автосгенерировано
frontend/src/pages/Homepage.jsx              — useSeo, JSON-LD VideoObject useEffect, URL-resolver для /api/public/...
frontend/src/pages/Services.jsx              — useSeo
frontend/src/pages/ServiceDetails.jsx        — useSeo (динамически)
frontend/src/pages/HowItWorks.jsx            — useSeo
frontend/src/pages/Contact.jsx               — useSeo
frontend/src/pages/LegalInformation.jsx      — useSeo
frontend/src/pages/Policies.jsx              — useSeo (динамически per type)
frontend/src/pages/Login.jsx                 — useSeo (noindex)
frontend/src/pages/Register.jsx              — useSeo (noindex)
frontend/src/pages/ClientDashboard.jsx       — useSeo (noindex)
frontend/src/pages/NewProject.jsx            — useSeo (noindex)
frontend/src/pages/ProjectDetails.jsx        — useSeo (noindex)
frontend/src/pages/Profile.jsx               — useSeo (noindex)
frontend/src/pages/AdminPanel.jsx            — useSeo (noindex) + подключен <DemoVideosManager/>
```

**Нетронутые:** все `utils/*`, `context/*`, все компоненты `OperationalChain/*`, все файлы бэкенда кроме перечисленных выше. API-контракты существующих эндпоинтов **не менялись** — регрессий не ожидается.

---

## 8. Пошаговая инструкция для деплоя

### Предпосылки
- Ты пуллишь последние изменения из GitHub.
- На сервере установлены Docker + Docker Compose.
- Структура деплоя уже существует (из `/app/deploy/` предыдущего релиза).

### Шаг 1. Забрать код
```bash
cd /opt/ocean2joy   # или где у тебя репо
git pull
```

### Шаг 2. (Опционально, но рекомендуется) сделать бэкап Mongo
```bash
docker exec o2j_mongo mongodump --archive=/tmp/o2j_backup_$(date +%F).archive --db=ocean2joy_v2
docker cp o2j_mongo:/tmp/o2j_backup_$(date +%F).archive ./backup/
```

### Шаг 3. Пересобрать backend + frontend
```bash
docker compose build backend frontend
docker compose up -d backend frontend
```
Backend при старте увидит пустую коллекцию `demo_videos` и автоматически вставит 2 дефолтных записи (это single-run seed).

### Шаг 4. Быстрые smoke-тесты (curl)
```bash
# 1. Публичный список демо-видео из БД
curl https://ocean2joy.com/api/demo-videos | jq .
#    Ожидание: массив из 2 объектов с video_url="/videos/Ocean2Joy_Demo*_720p.mp4"

# 2. Самохостинг видео
curl -I https://ocean2joy.com/videos/Ocean2Joy_Demo1_720p.mp4
#    Ожидание: HTTP/2 200, content-type: video/mp4

# 3. robots.txt + sitemap
curl https://ocean2joy.com/robots.txt
curl https://ocean2joy.com/sitemap.xml
#    Ожидание: обычный plain-text и валидный XML

# 4. HTML без Emergent
curl -s https://ocean2joy.com/ | grep -iE "emergent|posthog" | head
#    Ожидание: пусто

# 5. Organization + WebSite JSON-LD присутствуют
curl -s https://ocean2joy.com/ | grep -c '"@type": "Organization"'
#    Ожидание: 1 (или больше)
```

### Шаг 5. Проверки через браузер
1. Открыть `https://ocean2joy.com/` → вкладка называется **«Ocean2Joy — Digital Video Production Studio»**, favicon — логотип.
2. DevTools → Elements → `<head>`: должны быть:
   - `<title>`, `meta[name=description]`, `meta[property=og:*]`, `link[rel=canonical]`
   - 2 скрипта `<script type="application/ld+json">` (Organization + WebSite)
   - 3-й скрипт с id `ocean2joy-videoobject-ld` (появляется через ~1 сек после загрузки).
3. Правый нижний угол — **НЕТ чёрной плашки** «Made with Emergent».
4. Network вкладка: **нет** запросов к `assets.emergent.sh`, `app.emergent.sh`, `us.i.posthog.com`, `customer-assets.emergentagent.com`.
5. Перейти на `/services`, `/how-it-works`, `/policies/terms` — у каждой страницы уникальный `<title>` и `meta description`.

### Шаг 6. Проверить Resend и загрузку через админку
1. Войти на `https://ocean2joy.com/login` как `admin@ocean2joy.com`.
2. Открыть в адресной строке: `https://ocean2joy.com/api/admin/notifications/diagnostics` → должны быть правильные email, API-ключ замаскирован.
3. Открыть: `https://ocean2joy.com/api/admin/notifications/test` через POST (можно через Postman или curl с сессионной cookie) → должен прийти email. Если не приходит — ответ содержит точный текст ошибки Resend.
4. Перейти в `/admin` → прокрутить вниз до секции **«Demo Videos»** → там 2 демо-записи с превью постерами.
5. Клик **«+ Add new video»** → загрузить свой MP4 (≤200MB) и PNG/JPG (≤10MB) → нажать **Create** → новая запись появляется в списке и сразу отображается на homepage.
6. Протестировать Edit / Replace video / Replace poster / стрелки reorder / Delete.

### Шаг 7. SEO-регистрация (в первые 24 часа после деплоя)

**Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)):
1. Add Property → Domain → `ocean2joy.com` (верификация через DNS TXT).
2. Sitemaps → добавить `https://ocean2joy.com/sitemap.xml`.
3. URL Inspection → `https://ocean2joy.com/` → **Test Live URL** → **Request Indexing**.
4. Повторить Request Indexing для `/services`, `/how-it-works`, `/contact` (главные публичные).

**Bing Webmaster Tools** ([bing.com/webmasters](https://www.bing.com/webmasters)):
- Add Site → `https://ocean2joy.com` → Import from Google Search Console (1 клик).

**Yandex Webmaster** (если нужен русскоязычный трафик):
- [webmaster.yandex.com](https://webmaster.yandex.com) → Add Site → submit sitemap.

**AI-поисковики** (Perplexity / ChatGPT Search / Claude) **не принимают** явные submission'ы — они **сами** краулят сайты через свои боты (их уже разрешил `robots.txt`). Типичный срок первой индексации: 1–3 недели.

### Шаг 8. Если что-то пошло не так (troubleshooting)

| Симптом | Проверка | Решение |
|---|---|---|
| `GET /api/demo-videos` вернул `[]` | `docker exec o2j_mongo mongosh ocean2joy_v2 --eval 'db.demo_videos.countDocuments()'` | Перезапустить backend (`docker compose restart backend`) — seed запустится |
| `GET /videos/Ocean2Joy_Demo1_720p.mp4` → 404 | В образе фронта файла нет | Проверить, что файлы закоммичены в git и скопированы в образ (`docker compose build frontend` без кэша: `--no-cache`) |
| Новое видео через админку уходит в 413 | Upload > 200 MB | Уменьшить видео или поднять `MAX_VIDEO_MB` в `backend/routes/admin.py` |
| В Nginx лог: `client intended to send too large body` | Nginx-лимит меньше `MAX_VIDEO_MB` | В `/app/deploy/nginx.conf` → `client_max_body_size 250M;` → `docker compose restart nginx` |
| Title на вкладке — старый «Emergent Fullstack App» | Браузерный / CDN кэш | Ctrl+Shift+R; очистить Cloudflare кэш если есть |
| Resend тестовое письмо падает 502 | Ответ содержит точный текст ошибки Resend | Смотри таблицу в истории чата: смена `ADMIN_NOTIFY_EMAIL`, `SENDER_EMAIL=onboarding@resend.dev`, верификация API-ключа |

---

## 9. Что **НЕ** менялось (для спокойствия)

- 12-этапная операционная цепочка (все stage-transitions)
- PDF-генерация (WeasyPrint, 11 шаблонов в `documents.py`)
- JWT-аутентификация, hash_password, cookie settings
- Схема `users`, `projects`, `messages` — без изменений
- Клиентская изоляция (`user_id` filter на `/api/projects`)
- Все существующие publicAPI (услуги, политики, платежи) — контракты не трогались
- `docker-compose.yml`, `nginx.conf`, `backend.Dockerfile` — **не менялись**
- `frontend.Dockerfile` — **не менялся** (он просто копирует `/public` и `/src`, наши новые файлы пролетят автоматически)

---

## 10. Что рекомендуется сделать в следующих релизах (P1/P2)

1. **Верифицировать домен `ocean2joy.com` в Resend** ([resend.com/domains](https://resend.com/domains)) — разблокирует отправку с `noreply@ocean2joy.com` на любые адреса клиентов. Сейчас testing-mode ограничивает получателя одним emailом.
2. **Добавить отдельную страницу `/showreel`** с одним большим видео — Google Search Console писал «Video isn't on a watch page». На такой странице VideoObject получит priority, а не supplementary.
3. **Tier-2 React Hooks fixes** (отложено из прошлого форка): обернуть init-функции в `useCallback` в `ProjectDetails`, `ClientDashboard`, `AdminPanel`, `AuthContext`, `ChatContainer`, `NotificationBell`.
4. **Рефакторинг `backend/routes/documents.py`** (~2100 строк → Jinja2).
5. **UI/UX редизайн Project Workspace** под стилистику Homepage (вызов `design_agent_full_stack`).

---

**Что проверял testing-агент (iteration_4):** 16/16 бэкенд-тестов PASS (CRUD, upload, size/extension caps, auth guards, streaming endpoints, reorder, cleanup) + полный e2e на фронте (Create modal, Edit, Delete, JSON-LD, отображение Homepage).
