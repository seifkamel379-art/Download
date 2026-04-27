# خطوات النشر — GrabIt

دليل خطوة بخطوة لنشر الموقع مجانًا **بدون أي كارت ائتماني**:
- السيرفر على **Hugging Face Spaces** (مجاني تمامًا، بس إيميل)
- الواجهة على **Netlify** (مجاني، بدون كارت)

---

## 1) ارفع المشروع على GitHub

(لو رفعته قبل كده تخطى الخطوة)

1. اعمل حساب على [github.com](https://github.com).
2. اعمل Repository جديد فاضي (مثلًا اسمه `grabit`). خلّيه **Public**.
3. ارجع لـ Replit، افتح تبويب **Git** على اليسار، واضغط **Create Repository** علشان يرفعهولك أوتوماتيك.
4. سجّل اسم الـ repo بالظبط، شكله كده:

   ```
   https://github.com/USERNAME/grabit.git
   ```

   هتحتاج الرابط ده في الخطوة الجاية.

---

## 2) السيرفر على Hugging Face Spaces (مجاني، بدون كارت)

1. ادخل على [huggingface.co/join](https://huggingface.co/join) واعمل حساب بالإيميل (بس).
2. بعد التسجيل، ادخل على [huggingface.co/new-space](https://huggingface.co/new-space).
3. املأ النموذج كده:
   - **Space name**: `grabit-api` (أو أي اسم تحبه)
   - **License**: `mit`
   - **Select the Space SDK**: اختار **Docker** ← مهم
   - **Docker template**: اختار **Blank**
   - **Space hardware**: سيب الافتراضي **CPU basic · Free**
   - **Public** أو **Private**: اختار **Public**
4. اضغط **Create Space**.
5. هيفتحلك الـ Space وهتلاقي تبويب **Files** فوق. اضغط عليه.
6. هترفع ملفين بس من المشروع بتاعك (موجودين في فولدر `huggingface/` في الريبو):

   **أ) ملف `Dockerfile`:**
   - افتح ملف `huggingface/Dockerfile` من Replit.
   - **مهم جدًا:** غيّر السطر ده:

     ```
     ARG GITHUB_REPO=https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
     ```

     بحيث يكون فيه رابط الـ GitHub repo بتاعك من الخطوة 1، يعني مثلًا:

     ```
     ARG GITHUB_REPO=https://github.com/USERNAME/grabit.git
     ```

   - في صفحة الـ Space اضغط **Add file** → **Create a new file**.
   - الاسم: `Dockerfile` (بحرف D كبير، بدون أي امتداد).
   - الصق محتوى الملف بعد التعديل.
   - اضغط **Commit new file to main**.

   **ب) ملف `README.md`:**
   - في نفس صفحة Files اضغط **Add file** → **Create a new file**.
   - الاسم: `README.md`.
   - افتح ملف `huggingface/README.md` من Replit وانسخ كل محتواه والصقه.
   - اضغط **Commit new file to main**.

7. بمجرد ما ترفع الملفين، Hugging Face هيبدأ يبني السيرفر تلقائيًا. اضغط تبويب **App** فوق علشان تشوف اللوغ.
8. أول build بياخد **5–10 دقايق** (لأنه بيحمّل Node, Python, ffmpeg, yt-dlp). استنى لحد ما تشوف:

   ```
   Server listening port: 7860
   ```

9. **رابط السيرفر بتاعك** هيكون شكله كده:

   ```
   https://USERNAME-grabit-api.hf.space
   ```

   تقدر تشوفه فوق في تبويب **App** (في زرار "Direct URL" أو من الـ embed).

10. اختبره بزيارة:

    ```
    https://USERNAME-grabit-api.hf.space/api/healthz
    ```

    لازم تشوف: `{"status":"ok"}`.

> ✅ **مفيش كارت، مفيش حدود زمنية للتشغيل، 16GB RAM مجاني.** الـ Space بيدخل في وضع Sleep بعد 48 ساعة بدون استخدام، وأول طلب بعد كده بياخد ~30 ثانية يصحى.

---

## 3) الواجهة على Netlify (مجاني، بدون كارت)

1. ادخل على [netlify.com](https://netlify.com) وسجّل بحساب GitHub.
2. اضغط **Add new site** → **Import an existing project** → **GitHub** → اختار repo `grabit`.
3. في صفحة الإعدادات قبل النشر:
   - **Base directory**: `artifacts/downloader`
   - الباقي سيبه افتراضي (Netlify بيقرأ ملف `netlify.toml` تلقائيًا).
4. اضغط **Deploy site**.
5. لما يخلص أول build، روح **Site settings → Environment variables** → **Add a variable**، وضيف:

   | الاسم          | القيمة                                              |
   |----------------|------------------------------------------------------|
   | `VITE_API_URL` | رابط Hugging Face بتاعك (من الخطوة 9 فوق)         |
   | `PORT`         | `5173`                                               |
   | `BASE_PATH`    | `/`                                                  |

   مثال على القيمة:
   ```
   VITE_API_URL = https://username-grabit-api.hf.space
   ```

6. ارجع لتبويب **Deploys** واضغط **Trigger deploy** → **Deploy site** علشان يعيد البناء بالمتغيرات الجديدة.
7. بعد ما يخلص، Netlify هيديك URL شكله:

   ```
   https://your-site-name.netlify.app
   ```

   ده موقعك! افتحه واتفرّج.

---

## 4) لما تعدّل الكود

- **الواجهة**: Netlify بيعيد البناء أوتوماتيك مع كل push على GitHub. اعمل push وخلاص.
- **السيرفر**: Hugging Face بيستخدم نسخة مكلونة من GitHub، علشان يجيب آخر تعديلاتك ادخل على الـ Space → **Settings** → **Factory rebuild**. هيعيد build من الصفر بأحدث كود.

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| Hugging Face build فشل | اضغط تبويب **Logs**، غالبًا الحل تعديل رابط GitHub داخل Dockerfile أو إعادة المحاولة. |
| الموقع شغّال بس مفيش تحميل | تأكّد إن `VITE_API_URL` صح، وإن السيرفر فايق (افتح `/api/healthz`). |
| فيديو معيّن مش بينزل | بعض المنصات بتغيّر حمايتها. yt-dlp بتتحدث باستمرار — اعمل **Factory rebuild** في Hugging Face علشان ينزّل أحدث نسخة. |
| السيرفر بطيء أول مرة | لو الـ Space نام (بعد 48 ساعة من عدم الاستخدام) أول طلب بياخد ~30 ثانية. اللي بعده طبيعي. |
| طلع لي خطأ CORS | السيرفر مفتوح لأي origin، فلو حصل ده اعمل rebuild للـ Space. |

---

## للتطوير المحلي على Replit

كل حاجة شغّالة هنا أوتوماتيك:
- الواجهة في `artifacts/downloader/`
- السيرفر في `artifacts/api-server/`

افتح المعاينة في Replit وكل شيء جاهز.
