// Service Worker لتطبيق Mouse Stream
const CACHE_NAME = 'mouse-stream-v2.1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/hls.js@latest'
];

// التثبيت
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// التنشيط
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
    // تجاهل طلبات HLS والفيديو
    if (event.request.url.includes('.m3u8') || 
        event.request.url.includes('.ts') ||
        event.request.url.includes('mediatailor') ||
        event.request.url.includes('ottv.pro')) {
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // العودة من الكاش إذا موجود
                if (response) {
                    return response;
                }
                
                // جلب من الشبكة
                return fetch(event.request)
                    .then(response => {
                        // التحقق من صحة الاستجابة
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // استنساخ الاستجابة
                        const responseToCache = response.clone();
                        
                        // إضافة للكاش
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // العودة للصفحة الرئيسية إذا فشل الاتصال
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return new Response('Connection failed', {
                            status: 503,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// معالجة الدفع
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'محتوى جديد متاح!',
        icon: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1',
            url: './'
        },
        actions: [
            {
                action: 'watch',
                title: 'مشاهدة'
            },
            {
                action: 'close',
                title: 'إغلاق'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Mouse Streaming Hub', options)
    );
});

// معالجة النقر على الإشعار
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'watch') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});