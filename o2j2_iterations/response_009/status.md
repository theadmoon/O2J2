# Task #009 Complete

## Исправления применены

1. **Navbar "Start Project" button**: shadow-md → shadow-lg (ВИДИМАЯ ТЕНЬ)
2. **Services "Learn More" buttons**: shadow-sm → shadow-md, hover:shadow-md → hover:shadow-lg (ВИДИМЫЕ ТЕНИ)
3. **Navbar высота**: Проверено h-24, DevTools показывает height = 96px

## Скриншоты
- 09_navbar_fixed.jpg — Navbar с shadow-lg на кнопке "Start Project"
- 09_services_fixed.jpg — Services с shadow-md на кнопках "Learn More"
- 09_navbar_devtools.jpg — DevTools: navbar height = 96px

## Проверка
- [x] Кнопка "Start Project": тень ВИДНА
- [x] Кнопки "Learn More": тени ВИДНЫ по умолчанию
- [x] Navbar высота: 96px (h-24)

## Точные изменения (diff)
### Navbar.jsx строка 76:
```
- shadow-md
+ shadow-lg
```

### Homepage.jsx строка 163:
```
- shadow-sm hover:shadow-md
+ shadow-md hover:shadow-lg
```

### Navbar.jsx строка 43:
```
h-24 — уже корректно, подтверждено: computed height = 96px
```
