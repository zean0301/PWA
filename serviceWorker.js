var preCacheFile = 'pre-v1.1.0'; // 存在 Cache Storage 的資料夾名，預存用
var autoCacheFile = 'letswrite-v1.1.0'; // 存在 Cache Storage 的資料夾名稱，自動存用

const assets = [
    'img/icon_192.png',
    'img/icon_512.png'
];

var limitCacheSize = function (name, size) {
    caches.open(name).then(function (cache) {
        cache.keys().then(function (key) {
            if (key.length > size) {
                cache.delete(key[0]).then(limitCacheSize(name, size));
            }

        })
    })
}

// install event
self.addEventListener('install', function (e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(preCacheFile).then(cache => {
            cache.addAll(assets);
        })
    );

});

// activate event
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key) {
                if (preCacheFile.indexOf(key) === -1 && autoCacheFile.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    )
});

// fetch event
self.addEventListener('fetch', function (e) {

    if (!(e.request.url.indexOf('http') === 0)) return;
    if (e.request.url.indexOf('admin') > -1) return;
    if (e.request.url.indexOf('google') > -1) return;
    if (e.request.url.indexOf('fbevents') > -1) return;

    e.respondWith(
        caches.open(autoCacheFile).then(function (cache) {

            return fetch(e.request).then(function (response) {

                cache.put(e.request.url, response.clone());

                limitCacheSize(autoCacheFile, 100);

                return response;

            })

        })
            .catch(() => {
                return caches.match(e.request);
            })
    )
});