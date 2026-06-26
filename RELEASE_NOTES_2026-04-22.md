# Ocean2Joy v2.0 — Release Notes (22 April 2026)

> **Контекст:** этот релиз объединяет несколько итераций работы и закрывает четыре крупные задачи:
> 1. Полная независимость продакшена от инфраструктуры Emergent.
> 2. Админ-CMS для демо-видео (загрузка видео + постеров через `/admin`).
> 3. JSON-LD структурированные данные (VideoObject, Organization, ProfessionalService, WebSite, FAQPage, BreadcrumbList, Service).
> 4. SEO-слой для всех публичных страниц: per-page title/description/canonical, OG/Twitter, robots.txt, sitemap.xml, hreflang.
>
> Всё протестировано: `testing_agent_v3_fork` → 16/16 бэкенд PASS, e2e фронтенд PASS (create/edit/delete demo videos, JSON-LD emission, per-page meta). Плюс Playwright-проверки на 9 публичных страницах.
>
> **До этого релиза в продакшен ничего из перечисленного не пушилось.** Это один большой консолидированный pull-request.

---

## 1. Цели релиза

| № | Задача | Статус |
|---|---|---|
| 1 | Убрать все ссылки на инфраструктуру Emergent из продакшен-кода | ✅ |
| 2 | Корректные browser-вкладки и meta для SEO + AI-поиска | ✅ |
| 3 | JSON-LD VideoObject для демо-роликов (Google Video Search) | ✅ |
| 4 | Organization + ProfessionalService JSON-LD (Knowledge Graph) | ✅ |
| 5 | Админ-CMS для демо-видео: добавление, редактирование, замена файлов, reorder, удаление | ✅ |
| 6 | Диагностические эндпоинты для Resend (почему пропали уведомления на проде) | ✅ |
| 7 | Per-page SEO (title, description, OG/Twitter, canonical) на всех 15 страницах | ✅ |
| 8 | robots.txt с явным allow-листом AI-краулеров (GPTBot, PerplexityBot, ClaudeBot и др.) | ✅ |
| 9 | sitemap.xml со всеми публичными URL | ✅ |
| 10 | FAQPage schema на `/how-it-works` (для FAQ rich results в Google) | ✅ |
| 11 | BreadcrumbList schema на всех вложенных публичных страницах | ✅ |
| 12 | Service schema на detail-страницах услуг | ✅ |
| 13 | Фикс замечаний Google Search Console (uploadDate timezone, vertical logo) | ✅ |

---

## 2. Удалены ссылки на Emergent (6 мест)

| Файл | Что было | Что стало |
|---|---|---|
| `backend/routes/public.py` | 2 видео на `customer-assets.emergentagent.com/.../Demo*_720p_O2J2.mp4` | Локальные файлы `frontend/public/videos/Ocean2Joy_Demo*_720p.mp4` (раздаются frontend-nginx) |
| `frontend/public/index.html` | `<script src="https://assets.emergent.sh/scripts/emergent-main.js">` | Удалён |
| `frontend/public/index.html` | Блок `<a id="emergent-badge">` → `app.emergent.sh` | Удалён |
| `frontend/public/index.html` | PostHog-трекер с Emergent-токеном `phc_xAvL2Iq4...` | Удалён |
| `frontend/package.json` (devDependencies) | `@emergentbase/visual-edits` → `assets.emergent.sh/npm/...` | Удалён через `yarn remove`. `craco.config.js` имеет graceful try/catch — сборка работает без него. |
| `frontend/yarn.lock` | Автосгенерировано после `yarn remove` | — |

**Проверка после деплоя:**
```bash
curl -s https://ocean2joy.com/ | grep -iE "emergent|posthog"
# Ожидание: пусто
```

---

## 3. Новые бэкенд-эндпоинты

### Публичные
```
GET  /api/demo-videos                            # список из MongoDB, сортировка по order
GET  /api/public/demo-media/{id}/video           # стриминг MP4 для uploaded-записей (FileResponse)
GET  /api/public/demo-media/{id}/poster          # стриминг постера
```

### Admin-only (требуется cookie-сессия админа)
```
GET    /api/admin/demo-videos                    # список с метаданными
POST   /api/admin/demo-videos                    # создать (multipart: title, description, tags, video, poster)
PUT    /api/admin/demo-videos/{id}               # обновить title/description/tags (JSON body)
POST   /api/admin/demo-videos/{id}/video         # заменить видеофайл
POST   /api/admin/demo-videos/{id}/poster        # заменить постер
DELETE /api/admin/demo-videos/{id}               # удалить запись + файлы с диска
POST   /api/admin/demo-videos/reorder            # {order: [id1, id2, ...]}

GET    /api/admin/notifications/diagnostics      # ввод env Resend (ключ маскируется)
POST   /api/admin/notifications/test             # отправить тестовое письмо
```

### Лимиты и валидация
- Видео: 200 MB (`MAX_VIDEO_MB`), расширения `.mp4 .mov .webm .m4v`
- Постер: 10 MB (`MAX_POSTER_MB`), расширения `.png .jpg .jpeg .webp`

---

## 4. MongoDB — новая коллекция `demo_videos`

```js
{
  id: "demo-1" | "demo-<uuid8>",
  title, description, tags: [str],
  order: int,
  video_storage: "static" | "uploaded",
  video_url: str | null,              // static: "/videos/Ocean2Joy_Demo1_720p.mp4"
  video_filename, video_original_name, video_size,  // uploaded
  poster_storage: "static" | "uploaded",
  poster_url: str | null,             // static: "/posters/demo1.png"
  poster_filename, poster_original_name, poster_size,
  created_at, updated_at              // ISO UTC strings
}
```

**Seed** (`backend/database/seed.py`): при первом старте backend'а, если коллекция пуста, вставляются 2 записи (`demo-1`, `demo-2`) со `storage="static"`. Идемпотентно.

**Индекс:** `demo_videos.id` unique.

**Структура загрузок:**
```
/app/backend/uploads/demo_media/<demo-id>/
  ├── video/video.<ext>
  └── poster/poster.<ext>
```
Персистится через существующий Docker volume `backend_uploads`. Изменений в `docker-compose.yml` **не требуется**.

---

## 5. SEO-слой

### 5.1. Per-page meta через кастомный хук `useSeo`

Файл: `frontend/src/hooks/useSeo.js` (без новых npm-зависимостей).

Применён ко всем 15 страницам. Выставляет:
- `document.title`
- `meta[name="description"]`
- `meta[property="og:title|og:description|og:type|og:image|og:url"]`
- `meta[name="twitter:card|twitter:title|twitter:description|twitter:image"]`
- `link[rel="canonical"]`
- `meta[name="robots"]` (`index,follow,max-image-preview:large,max-snippet:-1` для публичных; `noindex,nofollow` для auth/admin)

| Роут | Title | robots |
|---|---|---|
| `/` | Ocean2Joy — Digital Video Production Studio | index |
| `/services` | Video Production Services \| Ocean2Joy | index |
| `/services/:id` | `{service.title}` \| Ocean2Joy (динамически) | index |
| `/how-it-works` | How It Works — 12-Stage Video Production Workflow \| Ocean2Joy | index |
| `/contact` | Contact Ocean2Joy — Video Production Studio | index |
| `/legal` | Legal Information \| Ocean2Joy | index |
| `/policies/terms` | Terms of Service \| Ocean2Joy | index |
| `/policies/digital_delivery` | Digital Delivery Policy \| Ocean2Joy | index |
| `/policies/refund` | Refund & Cancellation Policy \| Ocean2Joy | index |
| `/policies/revision` | Revision Policy \| Ocean2Joy | index |
| `/policies/privacy` | Privacy Policy \| Ocean2Joy | index |
| `/login`, `/register` | — | **noindex, nofollow** |
| `/dashboard`, `/profile`, `/projects/*`, `/admin` | — | **noindex, nofollow** |

### 5.2. Meta description (главная)

**Было (172 симв., Google обрезал/подменял):**
> "Ocean2Joy is a boutique digital video production studio. End-to-end video creation through a transparent 12-stage workflow — pay only after you accept the final result."

**Стало (138 симв., упоминает все 3 продукта):**
> "Digital video production studio. Live-action with actors, cinematic VFX and AI-generated video. Pay only after you accept the final result."

Параллельно **синхронизирован видимый hero-подзаголовок** на Homepage — Google охотнее принимает meta, когда формулировки встречаются в видимом тексте:
- Было: "Professional video production services delivered digitally. From custom filming to AI-powered content."
- Стало: "Live-action with actors, cinematic VFX and AI-generated video — all delivered digitally. Pay only after you accept the final result."

### 5.3. JSON-LD structured data

**Статически в `index.html` (видно ботам без JS):**

1. **`Organization` + `ProfessionalService`** с `@id: #organization`
   - `logo` → `logo-vertical.png` (вертикальная композиция — для Knowledge Graph)
   - `image` → то же
   - `address`: Tbilisi, GE
   - `taxID: 302335809`
   - `slogan`, `alternateName`
   - `hasOfferCatalog`: 3 `Service` (custom-video, video-editing, ai-video) с URL и описаниями
   - `knowsAbout`: массив из 11 тематических ключевых слов

2. **`WebSite`** с `@id: #website`, `publisher: { @id: #organization }`, `inLanguage: en`

**Динамически через React-хук `useJsonLd` (файл `frontend/src/hooks/useJsonLd.js`):**

| Страница | Schema |
|---|---|
| `/` | `VideoObject[]` (по одной на каждое демо из БД, с `contentUrl`, `thumbnailUrl`, `publisher`, **полным ISO `uploadDate` с timezone**) |
| `/how-it-works` | `FAQPage` (7 Q&A) + `BreadcrumbList` |
| `/services` | `BreadcrumbList` |
| `/services/:id` | `BreadcrumbList` + `Service` (с `provider: {@id: #organization}`) |
| `/contact` | `BreadcrumbList` |
| `/legal` | `BreadcrumbList` |
| `/policies/:type` | `BreadcrumbList` |

### 5.4. FAQ на `/how-it-works`

7 реальных клиентских вопросов (оплата, сроки, ревизии, форматы, скрипт/кастинг, методы оплаты, работа с международными клиентами). Реализованы как **видимый `<details>` accordion** над CTA + JSON-LD FAQPage. Google требует, чтобы FAQ-контент был видимым — иначе FAQ rich result не появляется.

### 5.5. Фиксы по отчёту Google Search Console

- **«Invalid datetime for uploadDate — missing timezone»** → `VideoObject.uploadDate` теперь полный ISO 8601 с timezone (пример: `"2026-04-22T09:23:48+00:00"`) вместо `"2026-04-22"`.
- **Горизонтальный лого в Knowledge Graph** → `Organization.logo` и `publisher.logo` переведены на `logo-vertical.png`. OG/Twitter image оставлены горизонтальными (16:9 — стандарт для социальных карточек).

### 5.6. `robots.txt`

`frontend/public/robots.txt` — allow/disallow по роутам + явный allow-лист для:
- Стандартных ботов: Googlebot, Googlebot-Image, Googlebot-Video, Bingbot, DuckDuckBot, YandexBot, Applebot
- **AI-краулеров:** GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-Web, Google-Extended, Applebot-Extended

### 5.7. `sitemap.xml`

`frontend/public/sitemap.xml` — 13 публичных URL с приоритетами и `changefreq`. Ссылается на `https://ocean2joy.com/...`.

---

## 6. Полный список изменённых/новых файлов

### Создано (9 новых)
```
frontend/src/hooks/useSeo.js                       — SEO hook, ~60 строк
frontend/src/hooks/useJsonLd.js                    — JSON-LD injection hook, ~30 строк
frontend/src/components/admin/DemoVideosManager.jsx — Admin UI для демо-видео, ~380 строк
frontend/public/robots.txt                         — crawler directives + AI bots
frontend/public/sitemap.xml                        — static sitemap (13 URL)
frontend/public/videos/Ocean2Joy_Demo1_720p.mp4    — 36 MB
frontend/public/videos/Ocean2Joy_Demo2_720p.mp4    — 13 MB
RELEASE_NOTES_2026-04-22.md                        — этот документ
backend/uploads/demo_media/                        — (создастся автоматически при первой загрузке)
```

### Удалено (2 старых видеофайла)
```
frontend/public/videos/Demo1_720p_O2J2.mp4    → переименовано в Ocean2Joy_Demo1_720p.mp4
frontend/public/videos/Demo2_720p_O2J2.mp4    → переименовано в Ocean2Joy_Demo2_720p.mp4
```

### Изменено (20 файлов)

**Backend (3):**
```
backend/routes/public.py           — DB-driven GET /api/demo-videos + streaming endpoints + helper _build_public_demo_video
backend/routes/admin.py            — CRUD для demo_videos (~220 строк) + Resend diagnostics + test
backend/database/seed.py           — seed demo_videos + индекс
```

**Frontend root (3):**
```
frontend/public/index.html         — убраны Emergent-скрипты/бейдж/PostHog; добавлены: title, meta description, OG/Twitter с width/height, favicon, theme-color, Organization+ProfessionalService+WebSite JSON-LD с @id-связью
frontend/package.json              — удалён @emergentbase/visual-edits
frontend/yarn.lock                 — автосгенерировано
```

**Frontend pages (14):**
```
frontend/src/pages/Homepage.jsx              — useSeo, VideoObject JSON-LD (useJsonLd-совместимо), hero-подзаголовок обновлён, URL-resolver для /api/public/demo-media/, publisher.logo → вертикальный
frontend/src/pages/Services.jsx              — useSeo + BreadcrumbList
frontend/src/pages/ServiceDetails.jsx        — useSeo + BreadcrumbList + Service JSON-LD (динамически)
frontend/src/pages/HowItWorks.jsx            — useSeo + FAQPage schema (7 Q&A) + BreadcrumbList + видимый FAQ accordion
frontend/src/pages/Contact.jsx               — useSeo + BreadcrumbList
frontend/src/pages/LegalInformation.jsx      — useSeo + BreadcrumbList
frontend/src/pages/Policies.jsx              — useSeo + BreadcrumbList (per type)
frontend/src/pages/Login.jsx                 — useSeo (noindex)
frontend/src/pages/Register.jsx              — useSeo (noindex)
frontend/src/pages/ClientDashboard.jsx       — useSeo (noindex)
frontend/src/pages/NewProject.jsx            — useSeo (noindex)
frontend/src/pages/ProjectDetails.jsx        — useSeo (noindex)
frontend/src/pages/Profile.jsx               — useSeo (noindex)
frontend/src/pages/AdminPanel.jsx            — useSeo (noindex) + подключён <DemoVideosManager/>
```

### **НЕ** менялось
- `docker-compose.yml`, `nginx.conf`, `backend.Dockerfile`, `frontend.Dockerfile` — без изменений
- Операционная цепочка (все stage-transitions в `project_actions.py`)
- PDF-генерация (11 WeasyPrint-шаблонов в `documents.py`)
- JWT-аутентификация, cookie-настройки, hash_password
- Схемы `users`, `projects`, `messages` — без изменений
- Client isolation — без изменений
- API-контракты существующих endpoints — без изменений. **Регрессий не ожидается.**

---

## 7. Пошаговая инструкция деплоя

### Предпосылки
- На сервере установлены Docker + Docker Compose.
- Репозиторий уже клонирован из предыдущего деплоя, структура `/app/deploy/*` существует.

### Шаг 1. Забрать код
```bash
cd /opt/ocean2joy   # или где лежит репо
git pull
```

### Шаг 2. (Рекомендуется) бэкап Mongo
```bash
docker exec o2j_mongo mongodump --archive=/tmp/o2j_backup_$(date +%F).archive --db=ocean2joy_v2
docker cp o2j_mongo:/tmp/o2j_backup_$(date +%F).archive ./backup/
```

### Шаг 3. Пересобрать backend + frontend
```bash
docker compose build backend frontend
docker compose up -d backend frontend
```

Backend при первом рестарте увидит пустую коллекцию `demo_videos` → автоматически засеет 2 демо-записи со ссылками на `/videos/Ocean2Joy_Demo*_720p.mp4`. **Никаких ручных скриптов Mongo не требуется.**

### Шаг 4. Smoke-тесты через curl
```bash
# 1. HTML чист от Emergent
curl -s https://ocean2joy.com/ | grep -iE "emergent|posthog"
# Ожидание: пусто

# 2. Самохостинг видео
curl -I https://ocean2joy.com/videos/Ocean2Joy_Demo1_720p.mp4
# Ожидание: HTTP/2 200, content-type: video/mp4

# 3. API демо-видео из БД
curl https://ocean2joy.com/api/demo-videos | jq '.[] | {id, video_url, created_at}'
# Ожидание: 2 объекта с video_url="/videos/Ocean2Joy_Demo*_720p.mp4"

# 4. robots.txt + sitemap
curl -I https://ocean2joy.com/robots.txt     # 200, text/plain
curl -I https://ocean2joy.com/sitemap.xml    # 200, application/xml

# 5. Organization + ProfessionalService JSON-LD присутствуют
curl -s https://ocean2joy.com/ | grep -c "ProfessionalService"
# Ожидание: ≥ 1

# 6. Meta description (новая, короткая, 3 продукта)
curl -s https://ocean2joy.com/ | grep -o 'name="description"[^>]*'
# Ожидание: "Digital video production studio. Live-action with actors, cinematic VFX and AI-generated video..."
```

### Шаг 5. Проверки в браузере
1. **Вкладка браузера:** "Ocean2Joy — Digital Video Production Studio". Favicon — ваш вертикальный логотип.
2. **DevTools → Elements → `<head>`** должен содержать:
   - `<title>`, `meta[name=description]`, канонические `meta[property=og:*]`, `link[rel=canonical]`
   - 2 статических `<script type="application/ld+json">`: Organization и WebSite
   - Через ~1 сек после загрузки: 3-й скрипт `id="ocean2joy-videoobject-ld"` с VideoObject[]
3. **Правый нижний угол** — пусто (нет «Made with Emergent»).
4. **Network вкладка** — нет запросов к `assets.emergent.sh`, `app.emergent.sh`, `us.i.posthog.com`, `customer-assets.emergentagent.com`.
5. **Клик по роутам** `/services`, `/how-it-works`, `/policies/terms` — у каждой уникальный `<title>` и `<meta description>`.
6. **`/how-it-works`** — прокрутить вниз: есть видимый блок «Frequently Asked Questions» с 7 раскрывающимися вопросами.

### Шаг 6. Проверить Resend и админ-CMS

1. Войти `https://ocean2joy.com/login` как `admin@ocean2joy.com` / `admin123`.
2. Открыть в адресной строке:
   ```
   https://ocean2joy.com/api/admin/notifications/diagnostics
   ```
   → Должны быть правильные email, API-ключ замаскирован.
3. Через curl с сессионной cookie или Postman POST на `/api/admin/notifications/test` → должно прийти тестовое письмо (если не приходит — ответ содержит точный текст ошибки Resend).
4. Перейти в `/admin` → прокрутить вниз до секции **«Demo Videos»** → там 2 засеянные демо-записи с превью постеров.
5. Клик **«+ Add new video»** → загрузить свой MP4 (≤200MB) и PNG/JPG (≤10MB) → Create → новая запись появляется в списке и сразу видна на Homepage.
6. Протестировать Edit / Replace video / Replace poster / стрелки reorder / Delete.

### Шаг 7. SEO-регистрация (в первые 24 часа после деплоя)

**Google Search Console** — [search.google.com/search-console](https://search.google.com/search-console)
1. Add Property → Domain → `ocean2joy.com` → верификация через DNS TXT.
2. Sitemaps → `https://ocean2joy.com/sitemap.xml`.
3. URL Inspection → главная → **Test Live URL** → **Request Indexing**.
4. Повторить для `/services`, `/services/custom-video`, `/services/video-editing`, `/services/ai-video`, `/how-it-works`.

**Google Rich Results Test** — [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- Вставить `https://ocean2joy.com/` → ✅ Organization + ProfessionalService + WebSite + VideoObject (2 items, без warnings про uploadDate)
- Вставить `https://ocean2joy.com/how-it-works` → ✅ FAQ (7 items) + Breadcrumbs
- Вставить `https://ocean2joy.com/services/custom-video` → ✅ Breadcrumbs + Service

**Bing Webmaster Tools** — [bing.com/webmasters](https://www.bing.com/webmasters) → Add Site → **Import from Google Search Console** (1 клик).

**Yandex Webmaster** (если нужен русскоязычный трафик) — [webmaster.yandex.com](https://webmaster.yandex.com) → Add Site → submit sitemap.

**AI-поисковики (Perplexity, ChatGPT Search, Claude)** — **НЕ** принимают submission'ы. Они сами краулят сайты своими ботами, которые уже разрешены в `robots.txt`. Первая индексация типично за 1–3 недели.

### Шаг 8. Troubleshooting

| Симптом | Проверка | Решение |
|---|---|---|
| `GET /api/demo-videos` вернул `[]` | `docker exec o2j_mongo mongosh ocean2joy_v2 --eval 'db.demo_videos.countDocuments()'` | Перезапустить backend: `docker compose restart backend` — seed сработает |
| `GET /videos/Ocean2Joy_Demo1_720p.mp4` → 404 | Файл не попал в образ фронта | Пересобрать без кэша: `docker compose build --no-cache frontend && docker compose up -d frontend` |
| Загрузка нового видео в 413 | Upload > 200 MB | Уменьшить видео, либо поднять `MAX_VIDEO_MB` в `backend/routes/admin.py` |
| Nginx лог: `client intended to send too large body` | Nginx-лимит меньше `MAX_VIDEO_MB` | В `deploy/nginx.conf` → `client_max_body_size 250M;` → `docker compose restart nginx` |
| Title на вкладке старый («Emergent \| Fullstack App») | Браузерный/CDN кэш | Ctrl+Shift+R; очистить Cloudflare кэш |
| Google всё ещё показывает старое описание | Google-кэш | Request Indexing в Search Console; рассасывается 2–4 недели |
| Resend тестовое письмо 502 | Ответ содержит точный текст ошибки Resend | Частые причины: `ADMIN_NOTIFY_EMAIL` ≠ email Resend-аккаунта; `SENDER_EMAIL` ≠ `onboarding@resend.dev` и не верифицированный домен; invalid API key |

---

## 8. Бэклог — что можно сделать в следующих релизах

**P1 (рекомендуется):**
- **Верифицировать домен `ocean2joy.com` в Resend** ([resend.com/domains](https://resend.com/domains)) — разблокирует отправку с `noreply@ocean2joy.com` и произвольные адреса получателей.
- **Отдельная страница `/showreel`** с одним главным видео по центру — Google Search Console писал «Video isn't on a watch page». На watch-page VideoObject попадёт в Google Video-выдачу с полноценной карточкой.
- **`ItemList` schema на `/services`** — Google покажет карусель из 3 услуг прямо в SERP.

**P2 (технический долг):**
- Tier-2 React Hooks fixes (`useCallback` в ProjectDetails, ClientDashboard, AdminPanel, AuthContext, ChatContainer, NotificationBell).
- Рефакторинг `backend/routes/documents.py` (~2100 строк → Jinja2 templates).
- UI/UX редизайн Project Workspace под стилистику Homepage (`design_agent_full_stack`).

**P3 (nice-to-have):**
- Google Business Profile для Tbilisi.
- Оригинальные фотографии вместо Unsplash stock на главной и service-карточках.
- Серверный sitemap (API-эндпоинт) для автогенерации при добавлении новых услуг/политик.

---

## 9. Тестовые учётные данные (для верификации после деплоя)

```
Admin:       admin@ocean2joy.com / admin123
Test Client: client@test.com     / client123
```

*(Если пароль админа уже изменён на проде через `ADMIN_PASSWORD` в `.env` — используй текущее значение оттуда.)*

---

## 10. Git commit message (рекомендуемый)

```
chore: Emergent-independent production + demo videos CMS + SEO layer

- Remove all references to emergentagent.com / emergent.sh / emergentbase
  (trackers, Emergent badge, @emergentbase/visual-edits devDep)
- Self-host demo videos at /videos/Ocean2Joy_Demo*_720p.mp4
- Replace browser tab title, meta description, favicon, theme-color
- Add Organization + ProfessionalService + WebSite JSON-LD (with @id linking)
- Emit VideoObject JSON-LD on homepage (full ISO uploadDate with timezone)
- Per-page SEO (title, description, canonical, OG/Twitter, robots) across all 15 routes
- FAQPage schema on /how-it-works (7 Q&A, visible accordion for rich results)
- BreadcrumbList schema on all public sub-pages
- Service schema on service detail pages (linked to Organization via @id)
- robots.txt with explicit allow for AI crawlers (GPTBot, PerplexityBot, ClaudeBot, etc.)
- sitemap.xml with 13 public URLs
- Admin CMS: /admin panel — demo videos upload, replace, reorder, delete (CRUD + streaming endpoints)
- Resend diagnostics endpoints: /api/admin/notifications/{diagnostics,test}

Files: +9, ~20, -2 (old demo video filenames).
Tested: testing_agent_v3_fork 16/16 backend PASS + full e2e frontend.
No regressions on existing flows (12-stage chain, PDF generation, auth, project isolation).
```
