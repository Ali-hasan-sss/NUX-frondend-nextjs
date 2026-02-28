تم التحقق من المشروع: خريطة الموقع في الويب تعتمد على Leaflet وOpenStreetMap وليست Google Maps. رسالة ApiNotActivatedMapError تظهر عادة عندما يتم تحميل Maps JavaScript API ولم تفعّل الـ API في المشروع.
إليك ما يمكنك فعله:

1. إذا كانت الخريطة فعلاً Google Maps (في مكان آخر أو تطبيق آخر)
   افتح Google Cloud Console.
   اختر المشروع الذي أنشأت فيه المفتاح AIzaSyAQLryLiSJFySJZjjNxgsYIvBe1FrXwu2Y.
   من القائمة الجانبية: APIs & Services → Library.
   ابحث عن "Maps JavaScript API" → اضغط Enable.
   (إذا كنت تستخدم اختيار عنوان أو بحث أماكن) ابحث عن "Places API" أو "Geocoding API" حسب الحاجة وفعّلها أيضاً.
   تأكد أن تقييدات المفتاح (Application restrictions / API restrictions) تسمح باستخدام المفتاح من نطاق موقعك (مثلاً HTTP referrers لموقعك).
   بعد التفعيل، أعد تحميل الصفحة؛ رسالة "This page didn't load Google Maps correctly" يجب أن تختفي إذا كان الخطأ فقط عدم تفعيل الـ API
