// LoanBuddy PWA Service Worker
const CACHE_NAME = 'loanbuddy-v1.0.0';
const STATIC_CACHE = 'loanbuddy-static-v1.0.0';
const DYNAMIC_CACHE = 'loanbuddy-dynamic-v1.0.0';

// Arquivos essenciais para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/dashboard.css',
  '/css/loans.css',
  '/css/borrowers.css',
  '/css/payments.css',
  '/css/reports.css',
  '/css/settings.css',
  '/js/app.js',
  '/js/data.js',
  '/js/ui.js',
  '/js/forms.js',
  '/js/charts.js',
  '/js/reports.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js'
];

// Arquivos que devem sempre vir da rede
const NETWORK_FIRST = [
  '/api/',
  '/sync/'
];

// Instalar Service Worker e fazer cache dos recursos estáticos
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Fazendo cache dos arquivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Cache dos arquivos estáticos concluído');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Erro ao fazer cache dos arquivos estáticos:', error);
      })
  );
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', event => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado e caches limpos');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições e aplicar estratégias de cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições de extensões do navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Estratégia: Cache First para recursos estáticos
  if (STATIC_FILES.some(file => request.url.includes(file)) || 
      request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'font') {
    
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Estratégia: Network First para APIs e dados dinâmicos
  if (NETWORK_FIRST.some(path => request.url.includes(path))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Estratégia: Stale While Revalidate para páginas HTML
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Estratégia padrão: Network First
  event.respondWith(networkFirst(request));
});

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache First falhou:', error);
    return new Response('Recurso não disponível offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network First tentando cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retorna página offline se disponível
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    return new Response('Conteúdo não disponível offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Sincronização em background
self.addEventListener('sync', event => {
  console.log('[SW] Evento de sincronização:', event.tag);
  
  if (event.tag === 'loan-sync') {
    event.waitUntil(syncLoans());
  } else if (event.tag === 'payment-sync') {
    event.waitUntil(syncPayments());
  } else if (event.tag === 'borrower-sync') {
    event.waitUntil(syncBorrowers());
  }
});

// Funções de sincronização
async function syncLoans() {
  try {
    console.log('[SW] Sincronizando empréstimos...');
    // Implementar lógica de sincronização de empréstimos
    const pendingLoans = await getPendingItems('loans');
    
    for (const loan of pendingLoans) {
      try {
        await fetch('/api/loans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loan.data)
        });
        
        await removePendingItem('loans', loan.id);
        console.log('[SW] Empréstimo sincronizado:', loan.id);
      } catch (error) {
        console.error('[SW] Erro ao sincronizar empréstimo:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Erro na sincronização de empréstimos:', error);
  }
}

async function syncPayments() {
  try {
    console.log('[SW] Sincronizando pagamentos...');
    const pendingPayments = await getPendingItems('payments');
    
    for (const payment of pendingPayments) {
      try {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payment.data)
        });
        
        await removePendingItem('payments', payment.id);
        console.log('[SW] Pagamento sincronizado:', payment.id);
      } catch (error) {
        console.error('[SW] Erro ao sincronizar pagamento:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Erro na sincronização de pagamentos:', error);
  }
}

async function syncBorrowers() {
  try {
    console.log('[SW] Sincronizando mutuários...');
    const pendingBorrowers = await getPendingItems('borrowers');
    
    for (const borrower of pendingBorrowers) {
      try {
        await fetch('/api/borrowers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(borrower.data)
        });
        
        await removePendingItem('borrowers', borrower.id);
        console.log('[SW] Mutuário sincronizado:', borrower.id);
      } catch (error) {
        console.error('[SW] Erro ao sincronizar mutuário:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Erro na sincronização de mutuários:', error);
  }
}

// Funções auxiliares para gerenciar itens pendentes
async function getPendingItems(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LoanBuddyOffline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function removePendingItem(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LoanBuddyOffline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Notificações push
self.addEventListener('push', event => {
  console.log('[SW] Recebida notificação push:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível no LoanBuddy',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LoanBuddy', options)
  );
});

// Clique em notificações
self.addEventListener('notificationclick', event => {
  console.log('[SW] Clique em notificação:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Clique na notificação (não em uma ação)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker do LoanBuddy carregado!');