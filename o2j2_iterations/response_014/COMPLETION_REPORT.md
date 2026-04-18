# Task #014 — Все страницы из прототипа

## Статус: ВЫПОЛНЕНО

---

## Добавлено 7 страниц из прототипа

| Страница | Маршрут | Источник | Строк |
|----------|---------|----------|-------|
| Services | `/services` | `Homepage.js` → `/frontend/src/pages/Services.js` | 161 |
| ServiceDetails | `/services/:serviceId` | `/frontend/src/pages/ServiceDetails.js` | 260 |
| HowItWorks | `/how-it-works` | `/frontend/src/pages/HowItWorks.js` | 253 |
| Contact | `/contact` | `/frontend/src/pages/Contact.js` | 256 |
| QuickRequest | `/request` | `/frontend/src/pages/QuickRequest.js` | 253 |
| LegalInformation | `/legal` | `/frontend/src/pages/LegalInformation.js` | 338 |
| Policies | `/policies/:type` | `/frontend/src/pages/Policies.js` | 121 |

## Backend endpoints добавлены

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/services/{service_id}` | GET | Детали сервиса (features, genres, output_format, etc.) |
| `/api/contact` | POST | Отправка контактного сообщения |
| `/api/quick-request` | POST | Быстрая заявка + авто-создание пользователя |
| `/api/policies/{type}` | GET | terms, digital_delivery, refund, revision, privacy |

## Маршруты в App.js

```
/services              → Services (список всех сервисов)
/services/:serviceId   → ServiceDetails (детали конкретного сервиса)
/how-it-works          → HowItWorks (3 шага процесса)
/contact               → Contact (форма обратной связи)
/request               → QuickRequest (быстрая заявка на проект)
/legal                 → LegalInformation (юридическая информация)
/policies/:type        → Policies (terms, refund, digital_delivery, revision, privacy)
```

## Зависимости
- `react-markdown` установлен (для страницы Policies)

## Скриншоты (7 файлов)

| Файл | Страница |
|------|----------|
| `services.png` | /services — 3 карточки сервисов |
| `service_details.png` | /services/custom-video — детали с features, pricing |
| `how_it_works.png` | /how-it-works — 3 шага процесса |
| `contact.png` | /contact — форма обратной связи |
| `request.png` | /request — форма быстрой заявки |
| `legal.png` | /legal — юридическая информация |
| `policies_terms.png` | /policies/terms — Terms of Service (markdown) |
