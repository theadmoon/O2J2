# Ocean2Joy v2.0 — Additional Release Notes (23 April 2026)

> **Дополнение к основному релизу `RELEASE_NOTES_2026-04-22.md`.** Этот документ фиксирует обновления ПО ДИРЕКТИВЕ «было-стало» от владельца сайта. Работа выполнена ПОВЕРХ изменений предыдущего релиза, в рамках того же ещё-не-запушенного PR'а.
>
> Протестировано: `testing_agent_v3_fork` iteration_5 → **12/12 backend PASS + 100% на публичных страницах**. ProjectDetails UX верифицирован вручную через Playwright: service_type `<select>` работает (`custom_video` → `ai_video` переключается и сохраняется), Brief & attachments collapsible открыт по умолчанию, кнопка «Add file» видна сразу.

---

## Цель директивы

Устранить **рассинхрон между страницами сайта** — где-то email-first, где-то portal-first; где-то pay-after-acceptance, где-то «immediately start production». Привести публичный сайт в соответствие с подписанными legal-документами, канонической 12-стадийной цепочкой и portal-first принципом.

---

## 1. Переименование stage labels (display-only)

Директива requires rename Stage 10/11 на клиент-видимых экранах без изменения внутренних ключей БД (для API-стабильности):

| Stage | status_key (БД) | Было (display_name) | Стало (display_name) |
|---|---|---|---|
| 10 | `payment_sent` | Payment Sent | **Payment Reported** |
| 11 | `payment_received` | Payment Received | **Payment Confirmed** |

**Затронутые файлы:**
- `backend/utils/constants.py` — `OPERATIONAL_CHAIN_STAGES` строки 51-52 (`display_name`)
- `backend/routes/notifications.py` — словарь user-friendly labels
- `backend/routes/documents.py` — текст инструкций в PDF/TXT invoice (кнопка «Report Payment» вместо «Mark Payment Sent»)
- `frontend/src/components/OperationalChain/ChainTimeline.jsx` — stages array + комментарий
- `frontend/src/components/OperationalChain/StageActions.jsx` — кнопки и заголовки модалок: «Report Payment», «Confirm Payment»
- `frontend/src/components/OperationalChain/PaymentProofPanel.jsx` — комментарий

**ВАЖНО:** `Payment Received From:` / `Payment Received By:` в PDF/TXT инвойсах/актах — это НЕ stage labels, а документ-семантика («кто платил / кому»). Эти заголовки **сохранены как есть**.

---

## 2. Политики: substantive_version_date = 21.10.2025

Все 5 политик (Terms, Digital Delivery, Refund, Revision, Privacy) получили новое поле `substantive_version_date: "2025-10-21T00:00:00Z"`.

**Frontend rendering** (`frontend/src/pages/Policies.jsx`):
- Было: `Last updated: 4/21/2026`
- Стало: `Substantive version in force from: 21/10/2025` (en-GB формат ДД/ММ/ГГГГ)

Fallback: если `substantive_version_date` отсутствует — показывается `updated_at` (обратная совместимость).

---

## 3. Контент политик (`backend/routes/public.py`)

**Terms of Service:**
- Section 3 (12-Stage Chain): обновлены formulation для всех 12 стадий, акцент «inside the portal», добавлен unifying disclaimer про UTC timestamps как portal-side events, Stage 10 = «Payment Reported», Stage 11 = «Payment Confirmed».
- Section 7 (IP): «at Stage 11 — Payment Confirmed» вместо «at Stage 11».
- Section 9 (Communication): переписано как «Portal-First», добавлено явное указание что email — emergency fallback only.
- Section 12 (Changes): «Substantive version in force from» вместо «Last updated».

**Digital Delivery:**
- Section 2: удалены упоминания «Google Drive, Dropbox, Yandex Disk», удалено «PayPal-compliance»; заменены на нейтральные «Delivery URL» / «file-access entry» концепты.
- Section 4-7: "cloud URL" → "file-access entry inside the portal"; «server-side beacon» → «portal records the exact access time».

**Refund:**
- Section 1: «actual funds are transferred only after the client has inspected and accepted the work at Stage 9, and are reported at Stage 10 — Payment Reported, then confirmed at Stage 11 — Payment Confirmed».
- Section 2: «before the payment is reported at Stage 10, by posting a cancellation request in the project chat inside the portal».
- Section 4: переименован в «Refunds After Payment (Post-Stage 11 — Payment Confirmed)».
- Section 7: email → emergency fallback only.

**Revision:**
- Section 1: «inside the project chat and the deliverables list in the portal» (явно portal).
- Section 3: «cloud URL» → «file-access entry», «beacon» → «portal access-time record».
- Section 8: email → emergency fallback only.

**Privacy:**
- Section 9: «How We Communicate With You (Portal-First)» (вместо «In-Portal First»); уточнено что email = «emergency fallback only».
- Section 10: «Currently Semi-Manual» (вместо «Currently Manual»); явно прописана Pay-After-Acceptance модель с переходами Stage 10 → Stage 11, UTC-timestamps как portal-side events.
- Section 13: «Substantive version in force from» вместо «Last updated».

---

## 4. Публичные страницы (React)

### Homepage.jsx
- **«HAVE QUESTIONS FIRST?»** блок переписан: CTA «Chat with us — get a quick answer», 4 буллета про portal-first, no-payment-to-open-workspace.
- **Hero-подзаголовок**: «Live-action with actors, cinematic VFX and AI-generated video — all delivered digitally. Pay only after you accept the final result.»
- **«Payments — currently semi-manual»** intro: удалена фраза «Once you confirm your order, you'll receive payment details directly». Новый текст: «Payment details are made available inside the project portal as part of the formal project workflow.»
- **«How Payment Works»**: полная замена. Новый текст описывает ровно Stage 9 → Stage 10 (Payment Reported) → Stage 11 (Payment Confirmed) → Certificate of Completion. Никаких «immediately start production».
- **Example-preview microcopy**: «Example preview — the actual project chat opens after you create a project in the portal.»

### Services.jsx
- Блок «All Services Delivered Digitally»: переписан на portal-first формулировку, удалено «custom-made by our in-house team».

### ServiceDetails.jsx
- «How It Works» 5-шаговый список полностью переписан:
  1. Submit in the Portal
  2. Order Activation and Invoice
  3. Invoice Signature and Production
  4. Delivery, File Access, Client Acceptance
  5. Payment Reporting, Confirmation, Completion
- Под списком добавлен disclaimer про portal-only + email-emergency-fallback + Pay-After-Acceptance.

### HowItWorks.jsx
- Все 6 видимых шагов полностью переписаны с новой терминологией и правильным маппингом на 12-стадийную цепочку:
  1. Submit Your Project in the Portal
  2. Order Activation and Invoice Issuance
  3. Invoice Signature and Production Start
  4. In-House Production and Portal Communication
  5. Electronic Delivery, File Access & Client Acceptance
  6. Payment Reporting, Confirmation, and Completion
- **FAQ секция (7 Q&A) сохранена** — все ответы проверены на соответствие новой терминологии и директиве. FAQPage JSON-LD для Google rich results не затронут.

### Contact.jsx
- **Intro**: portal-first + email = emergency fallback.
- **Email блок**: «Emergency fallback contact only» (вместо «Response within 24 hours»).
- **Поддержка note**: «Email is used only in exceptional situations when portal communication is temporarily unavailable» (вместо «Support available via email 24/7»).
- **Новый блок «Portal Communication»** добавлен в контактную сетку — объясняет, что portal = основной канал.

### Layout/Footer.jsx
- Добавлена строка: «Primary project communication takes place inside the secure client portal. Email is used only as an emergency fallback channel.»

### Policies.jsx
- Отображение даты: «Substantive version in force from: ДД/ММ/ГГГГ» (en-GB).

---

## 5. 🐞 Баг-фикс: chat-entry project creation

**Проблема (из отчёта владельца):**
> Пользователь нажимает «Chat with us» на главной, регистрируется, попадает в форму проекта. Далее в операционной цепочке:
> 1. Невозможно загрузить brief/script — кнопка отсутствует.
> 2. Невозможно сменить тип услуги — заблокирован в дефолте.

**Root cause:**
1. `ProjectDetails.jsx` имел `detailsExpanded=false` по умолчанию — `ReferenceFiles` компонент с кнопкой Upload рендерится ВНУТРИ collapsed секции. Auto-expand работал только при `user.role !== 'admin' && !project.invoice_sent_at` + была race condition при фреш-регистрации.
2. Backend PATCH `/api/projects/{id}` whitelist полей НЕ включал `service_type` — клиенты могли править только `project_title` и `payment_method`.

**Фикс:**
- `backend/routes/projects.py` — PATCH теперь принимает `service_type` с валидацией по whitelist `{custom_video, video_editing, ai_video}`. Редактирование заблокировано после `invoice_sent_at` (как для других полей).
- `frontend/src/pages/ProjectDetails.jsx`:
  - `detailsExpanded` default = `true` (раскрыт сразу).
  - Service type rendering: заменён статичный `<span>` на интерактивный `<select>` с `data-testid="project-service-type-select"`. Select активен для клиента и админа до `invoice_sent_at`, после этого деградирует в статичный label.

**Верифицировано через Playwright:** клиент создаёт проект → открывает его страницу → видит `<select>` с опциями Custom Video / Video Editing / AI Video → переключает на «AI Video» → значение сохраняется (PATCH 200) → на странице отображается «AI Video». Кнопка «Add file» в «Additional reference files» видна без кликов.

---

## 6. Что НЕ трогалось

| Область | Статус |
|---|---|
| Цены, phone, email, tax ID, PayPal email, Georgia registration | НЕ тронуто |
| Категории услуг и их описания | НЕ тронуто |
| Turnaround times / revision counts | НЕ тронуто |
| Сhат CTA «Chat with us — get a quick answer» | СОХРАНЁН (переработан только текст вокруг него) |
| 12-стадийная цепочка (переходы, endpoints, данные) | НЕ тронуто |
| JSON-LD schema (Organization, ProfessionalService, WebSite, VideoObject, FAQPage, BreadcrumbList, Service) | НЕ тронуто |
| SEO: meta description Homepage, canonical, OG/Twitter, robots.txt, sitemap.xml | НЕ тронуто |
| Admin CMS для демо-видео | НЕ тронуто |
| Resend diagnostics endpoints | НЕ тронуто |
| PDF templates для не-invoice документов | Semantic labels «Payment Received From/By» сохранены (они НЕ stage labels) |

---

## 7. Полный diff-список файлов (relative to previous release)

**Backend (5):**
```
backend/routes/public.py           — 5 политик: substantive_version_date + контент-правки
backend/routes/projects.py         — PATCH: service_type добавлен в whitelist
backend/utils/constants.py         — OPERATIONAL_CHAIN_STAGES display names для stages 10-11
backend/routes/notifications.py    — label dict для stages 10-11
backend/routes/documents.py        — PDF/TXT инструкция «Report Payment»
```

**Frontend (10):**
```
frontend/src/pages/Homepage.jsx                          — 5 блоков переписаны
frontend/src/pages/Services.jsx                          — «All Services» блок
frontend/src/pages/ServiceDetails.jsx                    — «How It Works» 5-шагов
frontend/src/pages/HowItWorks.jsx                        — 6 шагов переписаны, FAQ сохранён
frontend/src/pages/Contact.jsx                           — 4 правки (intro, email, support, +Portal block)
frontend/src/pages/Policies.jsx                          — substantive_version_date rendering
frontend/src/pages/ProjectDetails.jsx                    — default expand + service_type select
frontend/src/components/Layout/Footer.jsx                — portal-first disclaimer
frontend/src/components/OperationalChain/ChainTimeline.jsx   — stage labels 10-11
frontend/src/components/OperationalChain/StageActions.jsx    — buttons + modals
frontend/src/components/OperationalChain/PaymentProofPanel.jsx — comment only
```

---

## 8. Пошаговый деплой (поверх предыдущей инструкции)

Это **тот же самый git push** — изменения наслаиваются. Инструкция деплоя не меняется:

```bash
cd /opt/ocean2joy
git pull                                                  # заберёт оба релиза в одном PR
docker compose build backend frontend
docker compose up -d backend frontend

# Mongo не требует патчей. Все существующие проекты продолжат работать:
# - status_keys в БД остались (payment_sent / payment_received)
# - display_names рендерятся из constants.py, применяются автоматически
# - Новое поле substantive_version_date живёт только в Python-коде, не в БД
```

**Smoke-тест после деплоя (в дополнение к списку из предыдущего релиза):**
```bash
# 1. Canonical stage labels в Terms
curl -s https://ocean2joy.com/api/policies/terms | grep -oE "Payment (Reported|Confirmed|Sent|Received)" | sort -u
# Ожидание: только «Payment Reported» и «Payment Confirmed» (никаких «Payment Sent»/«Payment Received»)

# 2. substantive_version_date присутствует во всех 5 политиках
for t in terms digital_delivery refund revision privacy; do
  echo -n "$t: "
  curl -s https://ocean2joy.com/api/policies/$t | python3 -c "import sys,json;print(json.load(sys.stdin)['substantive_version_date'])"
done
# Ожидание: 2025-10-21T00:00:00Z для всех пяти

# 3. Удалены упоминания облачных провайдеров
curl -s https://ocean2joy.com/api/policies/digital_delivery | grep -iE "google drive|dropbox|yandex disk"
# Ожидание: пусто

# 4. PATCH service_type работает
# (залогинься как client и через DevTools проверь: PATCH /api/projects/{id} с body {"service_type":"ai_video"})

# 5. /how-it-works FAQ-секция
curl -s https://ocean2joy.com/how-it-works | grep -c "Frequently Asked Questions"
# Ожидание: ≥ 1 (в SSR или можно проверить визуально)
```

---

## 9. Рекомендуемый commit message (финальный для всего PR'а)

```
chore: Emergent-independent production + SEO layer + content directive

Previous commit (base):
- Remove Emergent trackers/badge/PostHog/visual-edits
- Self-host demo videos at /videos/Ocean2Joy_Demo*_720p.mp4
- Admin CMS /admin → Demo Videos (CRUD + streaming endpoints)
- Resend diagnostics /api/admin/notifications/{diagnostics,test}
- Per-page SEO (useSeo hook) across all 15 routes
- JSON-LD: Organization + ProfessionalService + WebSite + VideoObject
- FAQPage on /how-it-works, BreadcrumbList on sub-pages, Service schema
- robots.txt with AI crawlers allow-list
- sitemap.xml

This commit adds (content directive 2026-04-23):
- Policy content rewrite: substantive_version_date=2025-10-21 + portal-first wording
- Rename stage labels: "Payment Sent"→"Payment Reported", "Payment Received"→"Payment Confirmed"
  (display only, status_keys in DB preserved for API stability)
- Homepage/Services/ServiceDetails/HowItWorks/Contact rewrites: portal-first, pay-after-acceptance,
  email = emergency fallback only
- Fix: chat-entry project flow bug — PATCH /projects/{id} accepts service_type now;
  ProjectDetails Brief&attachments expanded by default, service_type inline-edit select

Tested: testing_agent_v3_fork iteration_5 12/12 backend PASS + 100% public pages.
No regressions in existing 12-stage operational chain, PDF generation, auth, or project isolation.
```

---

## 10. Что дальше (бэклог)

Не меняется относительно предыдущего релиза:
- **P1:** верифицировать домен `ocean2joy.com` в Resend → расширить уведомления.
- **P1:** отдельная страница `/showreel` (Google Video index).
- **P2:** Tier-2 React hooks refactoring (useCallback).
- **P2:** Refactor `backend/routes/documents.py` → Jinja2.
- **P2:** UI/UX редизайн Project Workspace (`design_agent_full_stack`).
- **P3:** Google Business Profile, оригинальные фотографии, ItemList schema.
