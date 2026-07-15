const CACHE_NAME = 'trans-bygagoos-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/login',
  '/assets/logo/b-trans.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-courses') {
    event.waitUntil(syncPendingCourses());
  }
});

async function syncPendingCourses() {
  const db = await openDB();
  const courses = await db.getAll('pending-courses');
  
  for (const course of courses) {
    try {
      await fetch('https://trans-bygagoos.onrender.com/api/v1/courses/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: [course] })
      });
      await db.delete('pending-courses', course.id);
    } catch (e) {
      console.log('Sync failed, will retry');
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TransByGagoos', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('pending-courses', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
