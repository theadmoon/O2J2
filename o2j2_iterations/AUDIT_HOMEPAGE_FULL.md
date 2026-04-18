# АУДИТ HOMEPAGE: Полное сравнение O2J2 vs Прототип

**Дата**: 2026-04-18
**Файл O2J2**: `/app/frontend/src/pages/Homepage.jsx` (421 строка)
**Прототип**: `https://github.com/theadmoon/ocean2joy/blob/main/frontend/src/pages/Homepage.js` (506 строк)
**Метод**: Построчное сравнение кода + DevTools проверка

---

## ГЛОБАЛЬНЫЕ ПАТТЕРНЫ (повторяются во всех секциях)

| # | Проблема | O2J2 (текущий) | Прототип (эталон) | Рекомендация |
|---|----------|----------------|-------------------|--------------|
| G1 | Размер заголовков | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` | Привести к прототипу |
| G2 | data-testid атрибуты | Присутствуют в каждой секции | **НЕТ ни одного** | Удалить все |
| G3 | Формат комментариев | `{/* ====== N. NAME ====== */}` | `{/* Name */}` | Привести к прототипу |

---

## СЕКЦИЯ 1: HERO SECTION ✅

**Статус: СОВПАДАЕТ** (исправлено в Tasks #011, #012, Hero fix)

- ✅ `min-h-[600px]` — совпадает
- ✅ `text-yellow-300` — совпадает
- ✅ `to="/request"` — совпадает
- ✅ `to="/services"` — совпадает
- ✅ Нет data-testid — совпадает
- ✅ Комментарий `{/* Hero Section */}` — совпадает

---

## СЕКЦИЯ 2: SERVICES OVERVIEW ⚠️ (1 расхождение)

| # | Проблема | O2J2 | Прототип | Рекомендация |
|---|----------|------|----------|--------------|
| S1 | Заголовок | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` | Уменьшить |

Остальное совпадает (карточки, кнопки, pricing, line-clamp-3).

---

## СЕКЦИЯ 3: WHY CHOOSE US ❌ (9 расхождений)

| # | Проблема | O2J2 | Прототип | Рекомендация |
|---|----------|------|----------|--------------|
| W1 | Комментарий | `{/* ====== 3. WHY CHOOSE US ====== */}` | `{/* Why Choose Us */}` | Заменить |
| W2 | Атрибуты секции | `id="how-it-works" data-testid="why-choose-section"` | Ничего | Удалить |
| W3 | Заголовок | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` | Уменьшить |
| W4 | Текст бренда | `Ocean2Joy Wave?` (большая J) | `Ocean2joy Wave?` (маленькая j) | Исправить |
| W5 | Карточки: иконки | Иконки в градиентных кругах (FaVideo, FaMagic, FaRocket, FaCheckCircle) | **Простой текст h3+p, БЕЗ иконок, БЕЗ кругов** | Убрать иконки |
| W6 | data-testid карточек | `data-testid={why-card-${i}}` | Нет | Удалить |
| W7 | Описание "Custom Made" | `"Every video tailored to your brand, message, and audience"` | `"Every project tailored to your specific vision and needs"` | Заменить текст |
| W8 | Описание "Digital Delivery" | `"Fast electronic delivery with no physical shipping hassles"` | `"Fast electronic delivery through secure client portal"` | Заменить текст |
| W9 | Описание "Revisions Included" | `"We work with you until the final product is perfect"` | `"Multiple revision rounds to ensure your satisfaction"` | Заменить текст |

---

## СЕКЦИЯ 4: DEMO VIDEOS ❌ (5 расхождений)

| # | Проблема | O2J2 | Прототип | Рекомендация |
|---|----------|------|----------|--------------|
| D1 | Комментарий | `{/* ====== 4. DEMO VIDEOS ====== */}` | `{/* Demo Videos Section */}` | Заменить |
| D2 | Атрибуты секции | `id="demo-videos" data-testid="demo-videos-section"` | Ничего | Удалить |
| D3 | Заголовок | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` | Уменьшить |
| D4 | Vimeo видео #1 | `824804225` | `115098447` | Вернуть оригинал |
| D5 | data-testid видео | `data-testid="demo-vimeo-1"`, `"demo-vimeo-2"` | Нет | Удалить |

**Примечание по D4**: Vimeo 115098447 использовался в прототипе. В O2J2 заменён на 824804225 из-за ошибки "This video does not exist" в preview-среде. Требуется решение супервайзера: вернуть оригинальный URL или оставить замену.

---

## СЕКЦИЯ 5: PAYMENTS ❌ (6 расхождений)

| # | Проблема | O2J2 | Прототип | Рекомендация |
|---|----------|------|----------|--------------|
| P1 | Комментарий | `{/* ====== 5. PAYMENTS SECTION ====== */}` | `{/* Payments Section */}` | Заменить |
| P2 | data-testid секции | `data-testid="payments-section"` | Нет | Удалить |
| P3 | Заголовок | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` | Уменьшить |
| P4 | Отступ заголовка | `mb-16` | `mb-12` | Уменьшить |
| P5 | data-testid карточек | `data-testid="payment-bank"`, `"payment-paypal"`, `"payment-info"` | Нет | Удалить |
| P6 | "Quick & Easy" | Без emoji | `💡 Quick & Easy` (с emoji) | Добавить 💡 |

---

## СЕКЦИЯ 6: CTA ❌ (6 расхождений)

| # | Проблема | O2J2 | Прототип | Рекомендация |
|---|----------|------|----------|--------------|
| C1 | Комментарий | `{/* ====== 6. CTA SECTION ====== */}` | `{/* CTA Section */}` | Заменить |
| C2 | data-testid секции | `data-testid="cta-section"` | Нет | Удалить |
| C3 | Заголовок | `text-4xl md:text-5xl` | `text-3xl md:text-5xl` (base 3xl!) | Исправить base |
| C4 | Кнопка маршрут | `to={user && user.id ? "/projects/new" : "/register"}` | `to="/request"` | Заменить |
| C5 | data-testid кнопки | `data-testid="cta-button"` | Нет | Удалить |
| C6 | Ссылка "contact us" | `to="/login"` | `to="/contact"` | Заменить |

---

## СВОДНАЯ ТАБЛИЦА

| Секция | Расхождений | Критичность | Статус |
|--------|-------------|-------------|--------|
| Hero | 0 | — | ✅ Совпадает |
| Services | 1 | Низкая | ⚠️ Только заголовок |
| Why Choose Us | 9 | **Высокая** | ❌ Иконки + тексты + атрибуты |
| Demo Videos | 5 | Средняя | ❌ Атрибуты + Vimeo URL |
| Payments | 6 | Средняя | ❌ Атрибуты + отступ + emoji |
| CTA | 6 | Средняя | ❌ Маршруты + атрибуты |
| **ИТОГО** | **27** | | |

---

## ВОПРОСЫ ДЛЯ СУПЕРВАЙЗЕРА

1. **data-testid**: Удалить ВСЕ атрибуты data-testid из Homepage? (Прототип не содержит ни одного, но они нужны для автотестирования)
2. **Vimeo 115098447**: Вернуть оригинальный URL? (Видео может быть удалено/заблокировано)
3. **Why Choose Us иконки**: Убрать иконки в кругах полностью? (Визуально они добавляют ценность, но прототип их не содержит)
4. **Заголовки text-3xl vs text-4xl**: Применить ко ВСЕМ секциям (Services, Why Choose Us, Demo Videos, Payments)? Или оставить более крупные?
5. **id="how-it-works" и id="demo-videos"**: Удалить? (Они нужны для навигации из Navbar — если удалить, anchor links сломаются)

---

## РЕКОМЕНДАЦИЯ ИСПОЛНИТЕЛЯ

Предлагаю разделить на 2 группы:

**Группа A — Безусловные исправления** (не требуют решения):
- G3: Формат комментариев → короткий
- W1, D1, P1, C1: Комментарии
- W4: Ocean2joy (маленькая j)
- W7, W8, W9: Тексты описаний
- P4: mb-16 → mb-12
- P6: Добавить 💡
- C4: Кнопка → /request
- C6: Ссылка → /contact

**Группа B — Требуют решения супервайзера**:
- G1: Размер заголовков (text-4xl vs text-3xl)
- G2: Удаление data-testid
- W5: Удаление иконок
- D4: Vimeo URL
- W2, D2: Удаление id= (ломает навигацию)
