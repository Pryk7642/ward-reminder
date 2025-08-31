self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', event => {
  // สำหรับ offline cache ถ้าต้องการ
});
