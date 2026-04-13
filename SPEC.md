# KIE — Спецификация сайта-портфолио

## Исходники

`/webflowBackup/` — оригинальный экспорт из Webflow.
**Файлы в этой папке не трогать.** Использовать только как справочник.

```
webflowBackup/
├── index.html
├── work.html
├── about.html
├── case.html
├── search.html
├── 401.html
├── 404.html
├── css/
│   ├── igors-fresh-site-d75b78.webflow.css  ← основные стили, источник для globals.css
│   ├── webflow.css                           ← в Next.js не используется
│   └── normalize.css                         ← в Next.js не используется
├── js/
│   └── webflow.js                            ← в Next.js не используется
└── images/                                   ← исходные изображения
```

---

## Обзор

Личное портфолио Игоря Колесника — продуктового дизайнера.
Услуги: UI/UX Design, Web Design, Web Development, Branding.

---

## Стек

| Слой | Инструмент |
|---|---|
| Фреймворк | Next.js 15 App Router |
| Анимации | GSAP + FLIP plugin |
| CMS | Sanity (free tier) |
| Шрифты | `next/font/google` — Inconsolata 400, 700 |
| Изображения | `next/image` |
| Хостинг | Vercel (free tier) |
| Домен | Зарегистрирован на Beget, DNS указывает на Vercel |

---

## Страницы

| Маршрут | Файл | Лейаут |
|---|---|---|
| `/` | `app/(site)/page.tsx` | layoutIndex |
| `/work` | `app/(site)/work/page.tsx` | layoutWork |
| `/work/[slug]` | `app/(site)/work/[slug]/page.tsx` | layoutCase |
| `/about` | `app/(site)/about/page.tsx` | layoutAbout |
| `/search` | `app/(site)/search/page.tsx` | — |
| `not-found` | `app/(site)/not-found.tsx` | — |
| `/studio` | `app/studio/[[...tool]]/page.tsx` | — (изолированный) |

---

## Структура файлов

```
app/
  layout.tsx                     ← минимальный HTML shell (html/body/font)
  globals.css
  (site)/
    layout.tsx                   ← page-wrap + PageBackground + PageContent
    page.tsx
    about/page.tsx
    work/page.tsx
    work/[slug]/page.tsx
    not-found.tsx
  studio/
    layout.tsx                   ← пустой pass-through
    [[...tool]]/page.tsx         ← NextStudio (без KIE хрома)
```

---

## DOM-структура

```
pageWrap
├── pageBackground          ← постоянный, никогда не размонтируется
│   ├── showreelWrap        ← виден на /
│   ├── workgalleryWrap     ← виден на /work
│   └── caseSlider          ← виден на /work/[slug]
└── pageContent             ← класс лейаута меняется при смене маршрута
    └── mainContainer       ← остаётся, анимирует позицию через GSAP FLIP
        ├── nav
        └── contentContainer
            └── {children}  ← indexWrap / workWrap / caseWrap / aboutWrap
```

### Классы лейаута pageContent
- `/` → `layout-index`
- `/work` → `layout-work`
- `/work/[slug]` → `layout-case`
- `/about` → `layout-about`

---

## Переходы между страницами

Два независимых механизма в зависимости от маршрута назначения.

### pageBackground — fade между блоками

Реализован в `components/PageBackground.tsx` через GSAP. Управляет тремя слотами: `showreel-wrap`, `workgallery-wrap`, `case-slider`.

**Активные секции по маршруту:**
- `/`, `/contact`, `/about`, `/work` → `showreel-wrap`
- `/work/[slug]` → `case-slider`
- `workgallery-wrap` — hover-галерея на `/work`, управляется отдельно через `data-active`

**Подготовка в `useLayoutEffect` на `pathname`** (до анимации):
- Если секция изменилась: новый блок → `display: block`, `opacity: 0` (готов к кросс-фейду)
- Если переход между кейсами (case → case): `case-slider` → `opacity: 0` (fade-in после загрузки слайдов)
- Первый рендер: начальные состояния через `gsap.set` без анимации

**Кросс-фейд** (через `signalBackgroundTransition` из `lib/backgroundTransitionSignal.ts`):
- Сигнал вызывается из `onTransitionReady` обоих типов переходов — синхронно с моментом когда снапшоты сделаны
- Принимает `(prevPathname, nextPathname)` — определяет направление по секциям
- Если секция изменилась: fade-out старого блока (700ms), fade-in нового (1500ms); по завершению старый → `display: none`
- Если секция та же (case → case): сигнал ничего не делает — fade-in придёт от `slidesReadySignal`

**Fade-in после загрузки слайдов** (через `signalSlidesReady` из `lib/slidesReadySignal.ts`):
- `SlideShowcase` вызывает сигнал после получения данных из Sanity
- `PageBackground` делает fade-in `case-slider` (900ms, power1.out)
- Гарантирует что контент уже в DOM до появления блока

**Оверлей `showreel-overlay`** управляется CSS через `data-visible` — не затронут GSAP:
- `data-visible="true"` на `/` и `/about` (backdrop blur + подложка)
- На `/work` оверлей прозрачен

### Тип 1 — FLIP (index ↔ work ↔ about ↔ work/slug)

Реализован в `components/PageContent.tsx` через GSAP Flip plugin + `next-view-transitions`.

**Запуск** (`startTransition`):
1. `Flip.getState(mainContainerEl)` — снимает текущую позицию
2. `previousPathnameRef.current = pathnameRef.current` — запоминает откуда уходим
3. `transitionRouter.push(href, { onTransitionReady })` — запускает View Transition

**В `onTransitionReady`** (снапшоты сделаны, новый DOM готов):
- `suppressViewTransition()` — подавляет дефолтный кросс-фейд (old → opacity:0, new → opacity:1)
- `signalBackgroundTransition(prev, next)` — запускает кросс-фейд фона
- `Flip.from(state)` — анимирует `mainContainer` из старой позиции в новую (950ms, expo.inOut)
- `gsap.fromTo(contentEl, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.6 })` — появление контента

### Тип 2 — Polygon clip-path via View Transition API (→ /contact и ← /contact)

Реализован через `next-view-transitions` + Web Animations API.

**Инфраструктура:**
- `app/layout.tsx` оборачивает приложение в `<ViewTransitions>` — перехватывает навигацию и активирует нативный `document.startViewTransition()`
- CSS в `globals.css` отключает дефолтный кросс-фейд, задаёт стекинг слоёв и скрывает новый DOM до `onTransitionReady`:
  ```css
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
  ::view-transition-new(root) { z-index: 10000; opacity: 0; }
  ::view-transition-old(root) { z-index: 1; }
  ::view-transition-image-pair(root) { background: black; }
  ```

**Запуск** (`startContactTransition`):
1. `previousPathnameRef.current = pathnameRef.current` — запоминает откуда уходим
2. `transitionRouter.push(href, { onTransitionReady })` — запускает View Transition

**В `onTransitionReady`** (снапшоты сделаны, новый DOM готов):
- `signalBackgroundTransition(prev, next)` — кросс-фейд фона (если секция изменилась)
- `triggerPolygonTransition()` — анимирует псевдоэлементы View Transition API

**Анимация старой страницы** (`::view-transition-old(root)`):
```
brightness(1) + translateY(0%) → brightness(0) + translateY(30%)
duration: 950ms, cubic-bezier(0.77, 0, 0.175, 1), fill: forwards
```

**Анимация новой страницы** (`::view-transition-new(root)`):
```
opacity:1 + clipPath: polygon(100% 0%, 100% 0, 0 0, 0 0%)
→ opacity:1 + clipPath: polygon(100% 100%, 100% 0, 0 0, 0 100%)
duration: 950ms, cubic-bezier(0.77, 0, 0.175, 1), fill: forwards
```
Новая страница «въезжает» сверху, раскрываясь вниз как шторка. `opacity: 1` в первом кейфрейме необходим — CSS по умолчанию скрывает `::view-transition-new(root)` через `opacity: 0`.

**Маршрутизация:**
- `startTransition` и `startContactTransition` оба используют `transitionRouter` из `next-view-transitions`
- `startTransition` — для всех переходов кроме `/contact`; подавляет дефолтный кросс-фейд через `suppressViewTransition()`
- `startContactTransition` — только для `/contact`; запускает polygon-анимацию
- Оба колбэка передаются через `TransitionContext` в `Nav` и `TransitionLink`

### Файлы

| Файл | Роль |
|---|---|
| `app/layout.tsx` | `<ViewTransitions>` — подключает View Transition API |
| `app/globals.css` | CSS-правила для `::view-transition-*` псевдоэлементов |
| `components/PageContent.tsx` | Оба типа переходов, `TransitionContext.Provider`, вызывает `signalBackgroundTransition` из `onTransitionReady` |
| `components/PageBackground.tsx` | GSAP fade между фоновыми блоками; регистрирует обработчик сигналов |
| `components/SlideShowcase.tsx` | Слайды кейса из Sanity, вызывает `signalSlidesReady` после загрузки |
| `components/TransitionContext.tsx` | Context с `startTransition` и `startPolygonTransition` |
| `components/TransitionLink.tsx` | `<a>`-обёртка, выбирает нужный тип перехода |
| `components/Nav.tsx` | Вызывает `startPolygonTransition` для `/contact` |
| `lib/backgroundTransitionSignal.ts` | Pub-sub: сигнал от `PageContent` к `PageBackground`, принимает `(prevPathname, nextPathname)` |
| `lib/slidesReadySignal.ts` | Pub-sub: сигнал от `SlideShowcase` к `PageBackground` после загрузки данных |

---

## Навигация

`nav` находится внутри `mainContainer` — сохраняется на всех страницах.

Активное состояние ссылки: определяется через `usePathname()`, применяется как CSS-класс (заменяет `w--current` из Webflow).

Ссылки:
- `work` → `/work`
- `about` → `/about`
- `contact` → TBD (модалка или `/contact`)

### Nav padding

`.nav` игнорирует `padding` родительского `main-container` через отрицательные margins и задаёт собственные отступы:

```css
.nav {
  padding: var(--_spacing---space--3);
  margin: calc(-1 * var(--_spacing---space--3)) calc(-1 * var(--_spacing---space--3)) 0;
}
.layout-about .nav {
  margin: 0; /* у main-container на about padding: 0, компенсация не нужна */
}
```

Это обеспечивает стабильную позицию nav при FLIP-переходах между layouts с разным padding.

---

## Страница `/about` — поведение Nav и кнопки закрытия

### DOM

```
.page-content.layout-about
  .main-container
    nav                  ← скрывается при входе на /about
    .content-container
  button.about-close-btn ← сиблинг main-container, не внутри него
```

`.about-close-btn` позиционирован абсолютно внутри `.page-content`:
- горизонтально: `left: calc(50% + 31rem)` — вплотную правее `main-container`
- вертикально: `top: 50%; transform: translateY(-50%)` — по центру Y страницы

### Анимации (GSAP, `components/PageContent.tsx`)

**При входе на `/about`** (в `useLayoutEffect` после смены pathname):
- Nav: `opacity → 0` (300ms, power1.in), затем `display: none` — убирается из потока
- Кнопка: `opacity 0 → 1` (300ms, power1.out, delay 700ms)

**При уходе с `/about`**:
- Nav: `display: flex` восстанавливается мгновенно, затем `opacity 0 → 1` (400ms, power1.out, delay 600ms) — синхронно с появлением `contentContainer`
- Кнопка: `opacity → 0` (200ms, power1.in)

**Прямой заход на `/about`** (первый рендер): состояния выставляются через `gsap.set` без анимации.

### Паттерн «вернуться на предыдущую страницу»

Используется в кнопке закрытия `/about`. Применить повторно для любого другого элемента:

**1. В `PageContent.tsx` уже есть два ref:**
```ts
const previousPathnameRef = useRef<string>('') // маршрут до текущего
const pathnameRef = useRef(pathname)            // всегда актуальный pathname
pathnameRef.current = pathname                  // обновляется каждый рендер
```

**2. `startTransition` сохраняет предыдущий маршрут перед навигацией:**
```ts
previousPathnameRef.current = pathnameRef.current // запомнили откуда уходим
flipStateRef.current = Flip.getState(el)
// ... fade out, router.push(href)
```

**3. Кнопка/элемент вызывает `startTransition` с сохранённым маршрутом:**
```ts
const handleClose = () => {
  const target = previousPathnameRef.current || '/'
  startTransition(target)
}
```

`previousPathnameRef` доступен только внутри `PageContent`. Если элемент находится вне `PageContent` — нужно передать `handleClose` через `TransitionContext` (по аналогии с `startTransition` и `startPolygonTransition`).

---

## CMS — Sanity

Используется только для кейсов. Весь остальной контент захардкожен во фронтенде.

### Схема кейса

```ts
Case {
  title: string
  slug: slug
  tags: string[]
  coverImage: image
  slides: Slide[]
}

Slide = MediaSlide | InfoSlide | ListSlide

MediaSlide {
  _type: 'mediaSlide'
  media: image | video
}

InfoSlide {
  _type: 'infoSlide'
  title: string
  description: text
  tags: string[]
}

ListSlide {
  _type: 'listSlide'
  items: string[]
}
```

Sanity Studio встроен на маршрут `/studio` (Next.js app router).

---

## CSS

Один файл `app/globals.css` — собран из Webflow-экспорта, почищен.

### Что оставлено
- Кастомные свойства (CSS-переменные для темы, типографики, отступов)
- Стили компонентов (nav, layouts, wraps, tags и т.д.)
- Адаптивная система через CSS container queries + data-атрибуты (`data-large-columns` и др.)
- Стили State Manager (`data-state`, `data-trigger`)

### Что удалено
- `webflow.css` — удалён полностью
- `normalize.css` — заменён встроенным сбросом Next.js или `modern-normalize`
- Правила `wf-design-mode`
- Классы рантайма Webflow: `w-embed`, `w-mod-js`, `w-mod-touch`
- Стили `guide_wrap`
- Инлайн-блоки `<style>` из HTML-страниц

---

## Страница работ — `/work`

### Список проектов (`workwrap`)

Каждый `worknameitem` рендерится из документа `Case` в Sanity (поля `title` и `slug`). Список подгружается на сервере, по одному элементу на кейс.

### Блок тегов (`work-description`)

Расположен под списком проектов. Поведение:

- **Состояние по умолчанию** — отображается один `.tag` с текстом «Hover» (плейсхолдер, кейс не выбран).
- **При наведении на `worknameitem`** — плейсхолдер «Hover» заменяется тегами кейса с анимацией. Теги берутся из поля `tags` документа `Case`.
  - Первый тег → `.tag` (основной)
  - Все остальные → `.tag.is-secondary`
- **При уходе курсора** — теги анимированно уходят, плейсхолдер «Hover» возвращается.

> Анимация смены тегов реализуется через GSAP (Этап 6).

---

## Захардкоженный контент (не из CMS)

- Ссылки в навигации
- Заголовок и подзаголовок на главной
- Контент страницы «О себе» (биография, список услуг, прайс, навыки)

---

## Этапы реализации

| # | Этап | Статус |
|---|---|---|
| 1 | **Init Next.js** — `create-next-app`, TypeScript, App Router, без Tailwind, структура папок | ✅ Готово |
| 2 | **globals.css** — перенести стили из Webflow export, выкинуть `w-*`, webflow.css, normalize.css | ✅ Готово |
| 3 | **Root layout** — `pageWrap`, `pageBackground`, `pageContent`, `mainContainer`, nav | ✅ Готово |
| 4 | **Страницы** — index, work, about, not-found (статический контент) | ✅ Готово (scaffolded) |
| 5 | **Sanity** — схема кейсов, Studio на `/studio`, dynamic route `/work/[slug]` | ✅ Готово |
| 5a | **Страница /work** — серверный компонент, подтягивает кейсы из Sanity, рендерит `worknameitem` со ссылками на `/work/[slug]` | ✅ Готово |
| 5b | **Страница /work/[slug]** — исправлена структура `case-wrap` по оригиналу Webflow: `case-name-indicator` (заголовок + прогресс-тег), `case-divider`, навигация `prev-case` / `next-case`; `next-case` всегда виден и циклически ведёт на первый кейс с последнего | ✅ Готово |
| 6 | **GSAP анимации** — page transitions, FLIP для mainContainer, fades | — | page transitions, FLIP для mainContainer, splittext при переходах готово

---

## Вне скоупа для v1

- Поиск
- Контактная форма / модалка
- GSAP-анимации (структура готова, анимации добавляются позже)
- Переключатель тёмной/светлой темы (CSS-переменные готовы)
