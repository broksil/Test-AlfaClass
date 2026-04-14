const CACHE_NAME = 'alfaclass-v1';
const DYNAMIC_CACHE = 'alfaclass-images-v1';
const urlsToCache = [
  './',
  './index.html',
  './صور/شعار التطبيق.png',
  './صور/ألفاكلاس.png'
];

// تنصيب Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// جلب الملفات من الكاش مع تخزين الصور ديناميكياً للعمل بدون إنترنت
self.addEventListener('fetch', event => {
  const req = event.request;

  // إذا كان الطلب لصورة (مثل صور المنشورات من Cloudinary)
  if (req.destination === 'image' || req.url.includes('res.cloudinary.com')) {
    event.respondWith(
      caches.match(req).then(cachedRes => {
        if (cachedRes) return cachedRes; // إرجاع الصورة من الكاش إذا كانت موجودة
        
        return fetch(req).then(fetchRes => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(req, fetchRes.clone()); // حفظ نسخة من الصورة الجديدة في الكاش
            return fetchRes;
          });
        });
      })
    );
  } else {
    // التعامل مع باقي الملفات الأساسية
    event.respondWith(
      caches.match(req).then(response => response || fetch(req))
    );
  }
});