const CACHE_NAME = 'mao-travel-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/data.json',
  '/manifest.json',
  '/404.html',
  // 如果需要缓存子页面，可以按需添加，例如：
  // '/NorthChina/NorthChina-Beijing.html',
  // '/EastChina/EastChina-Jiangsu.html',
  // '/China/China-HongKong.html',
  // '/Asia/Asia-Japan.html',
  // '/Asia/Asia-Vietnam.html'
];

// 安装 Service Worker，缓存关键文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('缓存失败:', err))
  );
  self.skipWaiting(); // 立即激活
});

// 拦截请求，优先使用缓存，缓存没有则从网络获取
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存命中，直接返回缓存
        if (response) {
          return response;
        }
        // 否则从网络获取
        return fetch(event.request).then(networkResponse => {
          // 可选：将新请求加入缓存（便于离线使用）
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // 如果网络和缓存都没有，返回一个友好提示（可选）
          // 对于图片等资源，可以返回占位图
        });
      })
  );
});

// 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('删除旧缓存:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim(); // 立即接管页面
);
