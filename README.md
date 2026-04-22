# Notification System for Requests

ระบบนี้ถูกย้ายจาก Google Apps Script มาเป็น Next.js + Supabase โดยยังคง logic หลักเดิมไว้:

- บันทึกคำขอใหม่พร้อมตรวจสอบเลขบัตรประชาชน
- ป้องกันการบันทึกซ้ำในวันเดียวกันสำหรับบุคคลเดียวกัน
- ส่ง Telegram notification เมื่อมีคำขอใหม่
- ใช้ inline buttons ใน Telegram เพื่ออัปเดตสถานะจากค่าใน `app_settings`
- อัปเดตสถานะจากหน้า dashboard และเลือกส่งแจ้งเตือน Telegram เพิ่มได้

## Stack

- Next.js App Router
- React 19
- Supabase (Postgres)
- Telegram Bot API

## Setup

1. คัดลอก `.env.example` เป็น `.env.local`
2. ใส่ค่า `NEXT_PUBLIC_SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY`
3. รัน SQL ในไฟล์ `supabase/schema.sql` ผ่าน Supabase SQL editor
4. ใส่ค่า Telegram ในตาราง `app_settings`
5. ติดตั้ง dependency และรัน dev server

```bash
npm install
npm run dev
```

## Important Routes

- `POST /api/requests` สร้างคำขอใหม่
- `GET /api/requests` โหลดรายการคำขอสำหรับ dashboard
- `PATCH /api/requests/:requestId/status` อัปเดตสถานะจาก dashboard
- `POST /api/telegram/webhook` รับ callback จาก Telegram

## Telegram Webhook

หลัง deploy ให้ตั้ง webhook ไปที่:

```text
https://your-domain.example/api/telegram/webhook
```

หรือตั้งผ่านสคริปต์ในโปรเจ็กต์:

```bash
npm run telegram:webhook:info
npm run telegram:webhook:set
```

หมายเหตุ:
- Telegram ต้องใช้ `https` public URL เท่านั้น
- `http://localhost:3000` ใช้เป็น webhook ปลายทางจริงไม่ได้
- ถ้าทดสอบบนเครื่อง ให้ใช้ tunnel เช่น `ngrok` หรือ `cloudflared` แล้วใส่ URL นั้นใน `TELEGRAM_WEBHOOK_URL`

จากนั้นเมื่อผู้ใช้กดปุ่มใน Telegram ระบบจะ:

1. อ่านข้อความปุ่มและค่าสถานะจาก `app_settings`
2. ตอบกลับในแชทให้เร็วที่สุด
3. ค่อยบันทึกสถานะลงตาราง `requests` ตามหลัง

## Notes

- ไฟล์ Google Apps Script เดิม (`Code.gs`, `*.html`) ยังถูกเก็บไว้เป็น reference ใน workspace นี้
- ฝั่ง dashboard ยังคงใช้ชุดสถานะเดิมเหมือนระบบเก่า








โปรเจกต์นี้ deploy ขึ้นเว็บได้เลย และทางที่ง่ายสุดคือ Vercel เพราะเป็น Next.js ที่มี API ฝั่งเซิร์ฟเวอร์ด้วย ไม่ใช่เว็บ static ธรรมดา ผมลอง npm run build ให้แล้วและผ่านเรียบร้อย ดังนั้นตอนนี้เหลือแค่ตั้งค่า Supabase + env + Telegram webhook

ตัวแปรที่โปรเจกต์ใช้ดูได้ใน .env.example (line 1) และสคริปต์ที่ใช้ตั้ง webhook อยู่ใน package.json (line 5) กับ scripts/telegram-webhook.mjs (line 79)

เตรียมฐานข้อมูล Supabase
รันไฟล์ supabase/schema.sql (line 1) ใน Supabase SQL Editor ก่อน เพื่อสร้างตาราง requests และ app_settings

ใส่ค่าใน app_settings
อย่างน้อยต้องมี TELEGRAM_BOT_TOKEN และ TELEGRAM_CHAT_ID ไม่งั้นระบบส่ง Telegram ไม่ได้

เตรียม Environment Variables
เอาค่าจาก .env.local ไปใส่ใน Vercel Project Settings > Environment Variables
ต้องมีอย่างน้อย:

NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL ถ้าจะเก็บ URL ฝั่ง server แยก
NEXT_PUBLIC_APP_URL=https://ชื่อเว็บของคุณ.vercel.app หลัง deploy ครั้งแรก
หรือ TELEGRAM_WEBHOOK_URL=https://ชื่อเว็บของคุณ.vercel.app/api/telegram/webhook
SUPABASE_SERVICE_ROLE_KEY ต้องเป็น service_role จริง ๆ ไม่ใช่ anon

Deploy ขึ้น Vercel
วิธีง่ายสุดคือ push repo ขึ้น GitHub แล้วไปที่ Vercel > New Project > import repo นี้ > Deploy
ถ้าใช้ CLI:

npm i -g vercel
vercel
vercel --prod
ตั้ง Telegram webhook หลังเว็บขึ้นแล้ว
พอได้ URL จริงของเว็บแล้ว ให้ใส่ URL นั้นในทั้ง Vercel env และ .env.local บนเครื่องคุณ แล้วสั่ง:

npm run telegram:webhook:set
npm run telegram:webhook:info
จุดสำคัญคือสคริปต์นี้อ่านค่าจาก .env.local บนเครื่องคุณ ไม่ได้อ่านจาก Vercel โดยตรง

ทดสอบจริง
เปิดหน้าเว็บที่ deploy แล้ว

ลองส่งคำขอ 1 รายการ
เช็กว่ามี row เข้า Supabase
เช็กว่า Telegram เด้ง
ลองกดปุ่มใน Telegram แล้วดูว่าสถานะในฐานข้อมูลอัปเดต
ถ้าจะเอาให้จบเร็วสุด แนะนำลำดับนี้: Supabase -> Vercel deploy -> ใส่ NEXT_PUBLIC_APP_URL -> redeploy -> set webhook




ถ้าแก้เฉพาะไฟล์ใน components เช่น src/components/request-console.tsx ก็ยังต้อง deploy ใหม่ ครับ เพราะมันเป็นส่วนหนึ่งของโค้ดหน้าเว็บ

สรุปคือ:

ถ้าแก้ component, page, layout, css
ต้อง redeploy เพื่อให้หน้าเว็บจริงอัปเดต
ถ้าเปิด npm run dev บนเครื่อง
จะเห็นผลทันทีแค่ในเครื่องคุณ
เว็บที่คนอื่นเข้าผ่านลิงก์ production
จะยังเป็นเวอร์ชันเดิม จนกว่าจะ deploy รอบใหม่
ถ้าใช้ GitHub + Vercel

แก้โค้ด

git add .
git commit -m "update component"
git push
แล้ว Vercel จะ deploy ให้เอง


ถ้าอยาก ผมช่วยเช็กให้ได้ว่าโปรเจกต์นี้ตอนนี้เหมาะกับ flow แบบ push แล้ว auto deploy หรือ deploy manual มากกว่ากันครับ