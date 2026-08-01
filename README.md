# Fleet Portal — MVP

بوابة إدارة أسطول (مركبات + سائقين + رحلات) — Backend بـ Express/TypeScript، Frontend بـ React/TypeScript/Tailwind.

## التشغيل محليًا

### 1) Backend

```bash
cd backend
npm install
npm run dev
```
يشتغل على `http://localhost:4000`. البيانات محفوظة في الذاكرة (in-memory) — كافي للتجربة، غيّرها بقاعدة بيانات حقيقية قبل الإنتاج (راجع `src/data/store.ts`).

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```
يشتغل على `http://localhost:5173`.

### تسجيل الدخول التجريبي
- Email: `admin@fleet.com`
- Password: `admin123`

## البنية

```
fleet-portal/
├── backend/     # Express API — routes: /api/vehicles, /api/drivers, /api/trips, /api/auth
└── frontend/    # React + Vite + Tailwind — pages: Dashboard, Vehicles, Drivers, Trips, Login
```

## الخطوات التالية (Phase 2)
1. استبدال `store.ts` بقاعدة بيانات حقيقية (PostgreSQL + Prisma مُقترح)
2. تتبع GPS مباشر (Mapbox/Google Maps + WebSocket لتحديث الموقع)
3. تنبيهات تلقائية (صيانة قربت / رخصة سائق هتخلص)
4. تقارير مصاريف الوقود والصيانة
5. رفع hashing لكلمات المرور (bcrypt) بدل plaintext — ضروري قبل أي بيئة حقيقية

## النشر (Deployment)
- **Frontend**: Vercel أو Netlify — `npm run build` وارفع مجلد `dist`
- **Backend**: Railway أو Render — اضبط متغير البيئة `JWT_SECRET`
- **قاعدة البيانات**: Supabase أو Railway Postgres
