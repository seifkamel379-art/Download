# خطوات النشر — GrabIt

دليل خطوة بخطوة لنشر الموقع: السيرفر على **Render** (مجاني، بدون فيزا) والواجهة على **Netlify** (مجاني، بدون فيزا).

---

## 1) ارفع المشروع على GitHub

(لو رفعته قبل كده تخطى الخطوة)

1. اعمل حساب على [github.com](https://github.com) لو لسه ماعندكش.
2. اعمل Repository جديد فاضي (مثلًا اسمه `grabit`). خلّيه **Public**.
3. ارجع لـ Replit، افتح تبويب **Git** على اليسار، وارفع المشروع لـ GitHub.

> لو محتاج مساعدة، استعمل زرار **Create Repository** الموجود في تبويب Git داخل Replit، هيرفعهولك أوتوماتيك.

---

## 2) السيرفر على Render (مجاني)

Render هيشغّل الـ API اللي بيستخرج روابط الفيديوهات.

1. ادخل على [render.com](https://render.com) وسجّل بحساب GitHub بتاعك (مجاني، **مايطلبش فيزا**).
2. من لوحة التحكم اضغط **New +** → **Blueprint**.
3. اختر الـ Repository بتاع `grabit` اللي رفعته.
4. Render هيلاقي ملف `render.yaml` بشكل أوتوماتيكي ويقترح إنشاء الخدمة `grabit-api`. اضغط **Apply**.
5. استنى التظبيط (أول مرة بياخد 5–10 دقايق لأنه بيحمّل yt-dlp).
6. لما يخلص، هتلاقي **URL الخدمة** فوق، شكله كده:

   ```
   https://grabit-api.onrender.com
   ```

   **انسخ الـ URL ده** — هتحتاجه في الخطوة الجاية.

7. تأكّد إنه شغّال بزيارة:

   ```
   https://grabit-api.onrender.com/api/healthz
   ```

   لازم تشوف: `{"status":"ok"}`.

> ⚠️ **ملاحظة:** الخطة المجانية في Render بتنام السيرفر بعد 15 دقيقة بدون استخدام. أول طلب بعد النوم بياخد ~30 ثانية. ده طبيعي.

---

## 3) الواجهة على Netlify (مجاني)

1. ادخل على [netlify.com](https://netlify.com) وسجّل بحساب GitHub (مجاني، **مايطلبش فيزا**).
2. اضغط **Add new site** → **Import an existing project** → اختار **GitHub** → اختار repo `grabit`.
3. Netlify هيقرأ ملف `artifacts/downloader/netlify.toml` بشكل أوتوماتيك. لكن لازم تظبط حاجة واحدة:
   - في صفحة الإعدادات اللي ظاهرة قبل النشر اضغط على **Base directory** وحطّ:

     ```
     artifacts/downloader
     ```

4. اضغط **Deploy site**.
5. لما يخلص أول build، روح **Site settings → Environment variables** واضغط **Add a variable**، وضيف المتغيرات دي:

   | الاسم          | القيمة                                |
   |----------------|---------------------------------------|
   | `VITE_API_URL` | `https://grabit-api.onrender.com` (الـ URL من Render) |
   | `PORT`         | `5173`                                |
   | `BASE_PATH`    | `/`                                   |

6. ارجع لتبويب **Deploys** واضغط **Trigger deploy** → **Deploy site** علشان يعيد البناء بالمتغيرات الجديدة.
7. لما يخلص، Netlify هيديك URL شكله:

   ```
   https://your-site-name.netlify.app
   ```

   ده موقعك! افتحه واتفرّج.

---

## 4) (اختياري) دومين خاص بيك

- في Netlify: **Site settings → Domain management** تقدر تربط دومين مجاني `.netlify.app` أو دومين بتاعك.

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| Render build فشل | افتح **Logs** في Render، غالبًا الحل إعادة المحاولة (Manual Deploy). |
| الموقع شغال بس مفيش تحميل | تأكّد إن `VITE_API_URL` صح، وإن سيرفر Render فايق (افتح `/api/healthz`). |
| الفيديو بياخد وقت ينزل | الخطة المجانية في Render فيها bandwidth محدود — ده طبيعي. |
| فيديو معين مش بينزل | بعض المنصات بتغيّر حمايتها. yt-dlp بتتحدث باستمرار — اعمل **Manual Deploy** في Render علشان ينزّل أحدث نسخة. |

---

## للتطوير المحلي على Replit

كل حاجة شغّالة هنا أوتوماتيك:
- الواجهة في `artifacts/downloader/`
- السيرفر في `artifacts/api-server/`

افتح المعاينة في Replit وكل شيء جاهز.
