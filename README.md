# TechStore

Інтернет-магазин комп'ютерних комплектуючих. Переддипломна практика — переписана версія
оригінального статичного сайту на стек **React + Express + Firebase**.

```
techstore/
├── frontend/   # React 18 + Vite + React Router (SPA)
├── backend/    # Node.js + Express (REST API)
└── firebase/   # firestore.rules / storage.rules / emulators / seed
```

## Стек

- **Frontend:** React 18, Vite, React Router, Context API
- **Backend:** Node.js, Express
- **БД:** Firebase Firestore
- **Файли:** Firebase Storage
- **Авторизація:** Firebase Authentication (JWT)
- **Деплой:** Firebase Hosting + Cloud Functions (опціонально)

## Швидкий старт (без Firebase)

Працює "з коробки" — React читає товари з локального JSON, кошик у `localStorage`.

```bash
# фронтенд
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

## Запуск з власним API (in-memory, без Firebase)

```bash
# термінал 1 — Express API
cd backend
npm install
cp .env.example .env
npm run dev          # → http://localhost:4000
```

```bash
# термінал 2 — фронтенд (вимкнути локальний JSON)
cd frontend
echo "VITE_USE_LOCAL_DATA=false" > .env
npm run dev
```

Vite проксує `/api/*` на `http://localhost:4000`, тож фронт ходить у Express замість локального JSON.

## Підключення реального Firebase

### 1. Створити проєкт

1. Перейти на https://console.firebase.google.com → **Add project**.
2. Увімкнути в проєкті:
   - **Firestore Database** (Native mode)
   - **Authentication** → провайдер **Email/Password**
   - **Storage**

### 2. Web-config для фронтенду

Project Settings → **General** → **Your apps** → Web app → копіювати config у `frontend/.env`:

```env
VITE_USE_LOCAL_DATA=false
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=....appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Service account для backend і seed

Project Settings → **Service accounts** → **Generate new private key**. Збережіть JSON-файл
(напр. `firebase/serviceAccount.json`, він у `.gitignore`):

```env
# backend/.env
GOOGLE_APPLICATION_CREDENTIALS=/абсолютний/шлях/до/serviceAccount.json
FIREBASE_PROJECT_ID=ваш-project-id
ADMIN_EMAILS=твій_email@example.com
```

### 4. Завантажити товари і картинки

```bash
cd firebase
npm install
export GOOGLE_APPLICATION_CREDENTIALS=/абсолютний/шлях/до/serviceAccount.json
node seed.js
```

Скрипт:
- залиє 22 товари з `firebase/seed/products.json` у колекцію `products`,
- завантажить картинки з `frontend/public/pic/*` у Storage під `products/`.

### 5. Призначити адміна

```bash
node firebase/set-admin.js твій_email@example.com
```

Виставляє custom claim `admin: true` для користувача Firebase Auth. Після цього треба
перевійти у фронтенд — кнопка «Адмін» з'явиться у шапці.

### 6. Правила безпеки

Залити в Firebase:

```bash
# спочатку увійти
npx firebase-tools login

# вибрати проєкт
cd firebase
npx firebase-tools use --add

# залити правила
npx firebase-tools deploy --only firestore:rules,storage
```

## Firebase Emulator (локально, без реального проєкту)

```bash
cd firebase
npx firebase-tools emulators:start
```

В інших терміналах:

```bash
# backend
USE_FIREBASE_EMULATOR=true npm run dev

# фронтенд
VITE_USE_FIREBASE_EMULATOR=true npm run dev
```

```bash
# залити seed-дані в емулятор
cd firebase
USE_FIREBASE_EMULATOR=true FIREBASE_PROJECT_ID=demo-techstore node seed.js
```

## Деплой

### Frontend → Firebase Hosting

```bash
cd frontend && npm run build
cd ../firebase && npx firebase-tools deploy --only hosting
```

### Backend → Cloud Run / Render / Railway

Express-сервер деплоїться як звичайний Node.js-додаток. Не забути виставити змінні
середовища з `backend/.env.example` (особливо `GOOGLE_APPLICATION_CREDENTIALS`).

## API ендпоінти

| Метод | Шлях                | Доступ   | Опис                                          |
|-------|---------------------|----------|-----------------------------------------------|
| GET   | `/api/health`       | публічно | Перевірка статусу                             |
| GET   | `/api/products`     | публічно | `?category=CPU&search=...`                    |
| GET   | `/api/products/:id` | публічно | Один товар                                    |
| POST  | `/api/products`     | admin    | Створення товару                              |
| PUT   | `/api/products/:id` | admin    | Оновлення                                     |
| DELETE| `/api/products/:id` | admin    | Видалення                                     |
| POST  | `/api/orders`       | публічно | Створення замовлення (можна гостем)           |
| GET   | `/api/orders/my`    | auth     | Замовлення поточного користувача              |

Авторизація — `Authorization: Bearer <Firebase ID Token>`. Без `GOOGLE_APPLICATION_CREDENTIALS`
API працює "у пам'яті" і пропускає валідацію токенів (зручно для розробки).

## Що зроблено за планом практики

- [x] Замінити `products.json` на Firebase Firestore (з fallback in-memory та локальним JSON для dev).
- [x] Написати власне API (Node.js + Express, JWT через Firebase Auth).
- [x] Переписати фронтенд на React + Vite з React Router.
- [x] Авторизація (Email/Password) + захищена адмінка з CRUD товарів.
- [x] Кошик з оформленням замовлення (валідація форми, збереження в Firestore).
- [x] Live-пошук, фільтри по категоріях, ціні, наявності, сортування.
- [x] Адаптивна верстка (перенесена з оригінального `style.css`).
- [x] Firebase Security Rules для Firestore і Storage.
- [x] Скрипти `seed.js` та `set-admin.js`.
- [x] Підтримка Firebase Emulator Suite.

## Структура коду фронтенду

```
frontend/src/
├── api/
│   ├── client.js          # fetch-клієнт API + локальний fallback
│   └── firebase.js        # Firebase SDK init (з підтримкою емулятора)
├── components/
│   ├── Layout.jsx         # Header + Footer + Outlet
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   └── ProtectedRoute.jsx # захист адмінки
├── context/
│   ├── AuthContext.jsx    # Firebase Auth (login/register/logout)
│   ├── CartContext.jsx    # кошик + localStorage
│   └── ToastContext.jsx   # сповіщення
├── pages/
│   ├── Home.jsx           # головна + live-пошук
│   ├── Catalog.jsx        # каталог з фільтрами і сортуванням
│   ├── Product.jsx        # деталі товару + рекомендації
│   ├── Cart.jsx           # кошик + форма замовлення
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Admin.jsx          # CRUD товарів
│   └── NotFound.jsx
├── utils/format.js
└── App.jsx
```

## Ліцензія

MIT — навчальний проєкт.
