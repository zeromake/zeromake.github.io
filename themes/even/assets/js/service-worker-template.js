// lastmod: {{ .Date.Format "2006-01-02T15:04:05Z07:00" }}
var cacheName = "hugo-even-{{ now.Unix }}";
var filesToCache = [
  "404.html",
  "index.html",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "public/logo-48.png",
  "public/logo-120.png",
  "public/logo-144.png",
  "img/zeromake.svg",
  "public/alipay-qr-code.svg",
  "public/wechat-qr-code.png",
{{- if .Site.Params.publicCDN.enable -}}
  {{ .Site.Params.publicCDN.cache }}
{{- end }}
];

// Cache the application assets
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(filesToCache)));
});

// cache-first
// If you want to use cache first, you should change cacheName manually

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
      .then(response => {
        if (response.status === 404) return caches.match('404.html');
        return caches.open(cacheName).then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      })
      .catch(error => console.log('Error, ', error)),
  );
});

// network first
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.open(cacheName).then(function (cache) {
//       return fetch(event.request)
//         .then(function (response) {
//           if (response.status === 404) return caches.match('404.html');
//           cache.put(event.request, response.clone());
//           return response;
//         })
//         .catch(function () {
//           return caches.match(event.request);
//         });
//     }),
//   );
// });

// Delete outdated caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [cacheName];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
