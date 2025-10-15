export const getAccuratePosition = (opts?: {
  desiredAccuracy?: number; // بالمتر، مثلا 10
  maxAttempts?: number; // عدد محاولات
  totalTimeout?: number; // مهلة إجمالية بالمللي ثانية
}): Promise<GeolocationPosition> => {
  const {
    desiredAccuracy = 10,
    maxAttempts = 12,
    totalTimeout = 45000,
  } = opts || {};

  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      return reject(new Error("Geolocation not supported"));
    }

    let watchId: number | null = null;
    const samples: GeolocationPosition[] = [];
    const start = Date.now();

    const tryResolve = () => {
      if (samples.length === 0) return false;

      // نفلتر العينات ذات الدقة الكبيرة، ثم نختار أفضل عينة أو الوسيط
      const good = samples.filter(
        (s) => typeof s.coords.accuracy === "number" && s.coords.accuracy < 2000
      );
      if (good.length === 0) return false;

      // اختر العينة ذات أصغر دقة (الأفضل)
      good.sort((a, b) => a.coords.accuracy - b.coords.accuracy);
      const best = good[0];

      // إذا الدقّة كافية فحلّ
      if (best.coords.accuracy <= desiredAccuracy) {
        return resolve(best);
      }

      // إذا وصلنا لعدد محاولات كافٍ أو لم يتبق وقت، نعيد أفضل ما لدينا
      if (samples.length >= maxAttempts || Date.now() - start >= totalTimeout) {
        return resolve(best);
      }

      return false;
    };

    const clearWatchSafe = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    // خيارات: enableHighAccuracy مهم جداً
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        // تحقق سريع من قيم شاذة
        const { latitude, longitude, accuracy } = pos.coords;
        if (!isFinite(latitude) || !isFinite(longitude)) {
          return; // تجاهل
        }

        // تجاهل قيم غير معقولة جداً
        if (accuracy && accuracy > 100000) {
          // GPS broken
          clearWatchSafe();
          return reject(new Error("GPS malfunction: extremely poor accuracy"));
        }

        samples.push(pos);

        // حاول حلّ إذا ممكن
        if (tryResolve()) {
          clearWatchSafe();
        }
        // وإلا تابع حتى تنتهي المحاولات/الوقت
      },
      (err) => {
        clearWatchSafe();
        // إذا لدينا عينات سابقة نعيدها كحل احتياطي
        if (samples.length > 0) {
          // نأخذ أفضل عينة
          samples.sort(
            (a, b) =>
              (a.coords.accuracy ?? Infinity) - (b.coords.accuracy ?? Infinity)
          );
          return resolve(samples[0]);
        }
        return reject(err);
      },
      options
    );

    // مهلة إجمالية كـ fallback
    setTimeout(() => {
      if (watchId !== null) {
        clearWatchSafe();
        if (samples.length > 0) {
          samples.sort(
            (a, b) =>
              (a.coords.accuracy ?? Infinity) - (b.coords.accuracy ?? Infinity)
          );
          return resolve(samples[0]);
        } else {
          return reject(
            new Error("Could not obtain GPS location within time limit")
          );
        }
      }
    }, totalTimeout);
  });
};
