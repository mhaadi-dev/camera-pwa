self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  self.registration.showNotification(data.title || 'Camera App', {
    body: data.body || 'Notification',
    icon: '/icons/icon-192x192.png',
  });
});