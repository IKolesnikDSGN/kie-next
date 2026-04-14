# Деплой и управление проектом

## Где сайт

- **Продакшн:** https://www.kie-design.com
- **Vercel:** https://vercel.com (аккаунт IKolesnikDSGN)
- **GitHub:** https://github.com/IKolesnikDSGN/kie-next
- **Sanity CMS:** https://sanity.io/manage → проект `9ndx0o91`

## Как запустить локально

```bash
cd /Applications/Design-Library/Projects/KIE-Next
npm run dev
```

Открыть в браузере: http://localhost:3000

## Как запушить изменения на сайт

```bash
git add .
git commit -m "Описание изменений"
git push
```

Vercel автоматически подхватит пуш и задеплоит новую версию. Обычно занимает 1–2 минуты.

## Редактирование контента (Sanity Studio)

Локально: http://localhost:3000/studio  
На продакшне: https://www.kie-design.com/studio

## Структура проекта

```
app/          — страницы Next.js
components/   — компоненты
lib/          — утилиты и клиент Sanity
sanity/       — схемы контента
public/       — статичные файлы (без изображений — они в Sanity)
```
