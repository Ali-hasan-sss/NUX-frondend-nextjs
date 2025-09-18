# 🔒 تشغيل التطبيق مع HTTPS محلياً

## 🚀 البدء السريع

### الخطوة 1: تثبيت mkcert

```bash
# Windows (Chocolatey)
choco install mkcert

# Windows (Scoop)
scoop install mkcert
```

### الخطوة 2: إعداد الشهادات

```bash
# تشغيل مرة واحدة فقط
npm run setup-ssl-win

# أو تشغيل الـ script مباشرة
setup-https.bat
```

### الخطوة 3: تشغيل التطبيق

```bash
npm run dev:https
```

## 🌟 النتيجة

سيعمل التطبيق على:

- **🔒 https://localhost:3000** - للوصول المحلي
- **🌐 https://YOUR_IP:3000** - للوصول من الهاتف

## ✅ الفوائد

- **GPS يعمل بدقة عالية** 🎯
- **Geolocation API يعمل بكامل قوته** 📍
- **كاميرا وميكروفون يعملان** 📷
- **تجربة مطابقة للإنتاج** 🚀
- **لا مشاكل مع الـ APIs الآمنة** 🛡️

## 🔧 استكشاف الأخطاء

### إذا لم يعمل mkcert:

1. تأكد من تثبيته بشكل صحيح
2. أعد تشغيل PowerShell كمسؤول
3. جرب التثبيت اليدوي من [GitHub](https://github.com/FiloSottile/mkcert/releases)

### إذا ظهر خطأ "certificates not found":

```bash
# احذف المجلد وأعد الإنشاء
rmdir /s certs
npm run setup-ssl-win
```

## 📱 الوصول من الهاتف

1. تأكد من أن الهاتف والكمبيوتر على نفس WiFi
2. اكتشف IP الكمبيوتر: `ipconfig`
3. افتح `https://YOUR_IP:3000` في الهاتف
4. اقبل التحذير الأمني (الشهادة محلية وآمنة)

## 🎉 الآن GPS سيعمل بدقة مثل Google Maps!

مع HTTPS، ستحصل على:

- دقة GPS عالية جداً
- لا تأثير من Proxy أو VPN على الدقة
- عمل كامل لجميع الـ APIs الحديثة
