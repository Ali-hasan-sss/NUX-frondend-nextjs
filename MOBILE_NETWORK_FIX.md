# 📱 حل مشكلة الشبكة مع الموبايل

## 🔍 تشخيص المشكلة

### الخطوة 1: تشغيل التشخيص
```bash
npm run debug-network
```
سيظهر لك عناوين IP المتاحة وتعليمات الوصول.

## 🛠️ الحلول المحتملة

### الحل 1: إعدادات Windows Firewall
1. افتح Windows Defender Firewall
2. اختر "Allow an app or feature through Windows Defender Firewall"
3. اضغط "Change Settings" ثم "Allow another app"
4. أضف Node.js و Next.js للشبكات الخاصة والعامة

### الحل 2: تشغيل Backend على جميع الشبكات
```bash
# في مجلد back_end
# عدل src/index.ts لاستخدام 0.0.0.0
```

### الحل 3: التحقق من CORS
تأكد من أن Backend يقبل طلبات من IP الخاص بك:
- تم تحديث إعدادات CORS لقبول `https://YOUR_IP:3000`
- تأكد من إعادة تشغيل Backend بعد التغيير

### الحل 4: اختبار الاتصال
```bash
# من الموبايل، جرب الوصول إلى:
https://YOUR_IP:3000      # Frontend
http://YOUR_IP:5000/api   # Backend API
```

## 🔧 خطوات التشغيل الصحيحة

### 1. تشغيل Backend
```bash
cd back_end
npm run dev
```
تأكد أنه يعمل على `0.0.0.0:5000` وليس `localhost:5000`

### 2. تشغيل Frontend مع HTTPS
```bash
cd website
npm run dev:https
```

### 3. اختبار من الكمبيوتر
- افتح `https://localhost:3000`
- جرب تسجيل الدخول - يجب أن يعمل

### 4. اختبار من الموبايل
- استخدم `https://YOUR_IP:3000`
- اقبل التحذير الأمني
- جرب تسجيل الدخول

## 🚨 أخطاء شائعة وحلولها

### خطأ "Network Error"
**السبب**: Backend غير متاح من الشبكة
**الحل**: 
```bash
# عدل back_end/src/index.ts
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

### خطأ "CORS Error"
**السبب**: Origin غير مسموح
**الحل**: تم إصلاحه في `security.ts` - أعد تشغيل Backend

### خطأ "SSL Certificate"
**السبب**: الشهادة غير موثوقة
**الحل**: اقبل التحذير في المتصفح أو أضف الشهادة للثقة

### خطأ "Connection Timeout"
**السبب**: Firewall أو Antivirus
**الحل**: 
1. أوقف Windows Firewall مؤقتاً للاختبار
2. أضف استثناءات للمنافذ 3000 و 5000
3. تحقق من إعدادات Antivirus

## 📋 قائمة التحقق

- [ ] Backend يعمل على `0.0.0.0:5000`
- [ ] Frontend يعمل على `https://0.0.0.0:3000`
- [ ] Windows Firewall يسمح بالاتصالات
- [ ] الكمبيوتر والموبايل على نفس WiFi
- [ ] تم قبول شهادة SSL في المتصفح
- [ ] إعدادات CORS محدثة في Backend
- [ ] Backend تم إعادة تشغيله بعد تغيير CORS

## 🔍 اختبار سريع

### من الكمبيوتر:
```bash
curl http://localhost:5000/api/health
```

### من الموبايل:
افتح `http://YOUR_IP:5000/api/health` في المتصفح

إذا لم يعمل، المشكلة في إعدادات الشبكة أو Firewall.
