# รวมสิ่งที่แก้ไข

1. เปลี่ยนจาก Hard-coded เป็นการใช้ Environment Variables

```js
const supabaseUrl = 'https://xxxx.supabase.co'
const supabaseKey = 'xxxxxxxxxxxxxxxxxxxxxxxx'
```

เปลี่ยนเป็น

```js
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
```

> วิธีใช้ให้ copy ไฟล์ `.env.example` เป็น `.env` และกรอกค่าให้ถูกต้อง
> จากนั่นจึงรัน `npm run ...` ได้ปกติ
