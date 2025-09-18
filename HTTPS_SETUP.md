# إعداد HTTPS المحلي للتطبيق

هذا الدليل يوضح كيفية تشغيل التطبيق على HTTPS محلياً لضمان عمل GPS والـ APIs الأخرى التي تتطلب اتصال آمن.

## 🚀 الطريقة السريعة (مستحسنة)

### الخطوة 1: تثبيت mkcert

```bash
# على Windows (باستخدام Chocolatey)
choco install mkcert

# أو باستخدام Scoop
scoop install mkcert

# على macOS (باستخدام Homebrew)
brew install mkcert

# على Linux (Ubuntu/Debian)
sudo apt install libnss3-tools
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/
```

### الخطوة 2: إعداد الشهادات

```bash
# تشغيل هذا الأمر مرة واحدة فقط
npm run setup-ssl

# أو على Windows
npm run setup-ssl-win
```

### الخطوة 3: تشغيل التطبيق مع HTTPS

```bash
npm run dev:https
```

## 🌐 الوصول للتطبيق

بعد تشغيل الأمر، ستحصل على:

- **المحلي**: https://localhost:3000
- **الشبكة**: https://YOUR_IP_ADDRESS:3000 (للوصول من الهاتف)

## 📱 الوصول من الهاتف

1. تأكد من أن الكمبيوتر والهاتف على نفس الشبكة
2. اكتشف IP address الكمبيوتر:

   ```bash
   # Windows
   ipconfig

   # macOS/Linux
   ifconfig
   ```

3. افتح المتصفح في الهاتف واذهب إلى: `https://YOUR_IP:3000`
4. اقبل التحذير الأمني (الشهادة محلية)

## 🔧 استكشاف الأخطاء

### خطأ "SSL certificates not found"

```bash
# أعد إنشاء الشهادات
rm -rf certs
npm run setup-ssl
```

### خطأ "Port already in use"

```bash
# غير المنفذ
PORT=3001 npm run dev:https
```

### خطأ "mkcert not found"

- تأكد من تثبيت mkcert حسب نظام التشغيل
- أعد تشغيل Terminal بعد التثبيت

## 🔒 لماذا HTTPS مهم؟

- **Geolocation API**: يتطلب HTTPS للعمل بدقة عالية
- **Camera/Microphone**: معظم المتصفحات تتطلب HTTPS
- **Service Workers**: تعمل فقط على HTTPS
- **Secure Cookies**: تعمل بشكل صحيح على HTTPS
- **Modern APIs**: العديد من APIs الحديثة تتطلب HTTPS

## 📂 بنية المجلدات

```
website/
├── certs/                    # شهادات SSL (تُنشأ تلقائياً)
│   ├── localhost.pem         # شهادة SSL
│   └── localhost-key.pem     # مفتاح SSL الخاص
├── server.js                 # خادم HTTPS المخصص
└── HTTPS_SETUP.md           # هذا الملف
```

## ⚠️ ملاحظات مهمة

- الشهادات محلية فقط وآمنة
- لا تستخدم هذه الإعدادات في الإنتاج
- الشهادات صالحة لـ localhost و 127.0.0.1 فقط
- قد تحتاج لقبول التحذير الأمني في المتصفح أول مرة

## 🎯 الفوائد

✅ **GPS يعمل بدقة عالية**  
✅ **لا مشاكل مع Geolocation API**  
✅ **تجربة مطابقة للإنتاج**  
✅ **اختبار كامل للـ PWA**  
✅ **أمان كامل للـ APIs**
