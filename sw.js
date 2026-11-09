// Money Tracker service worker v18 - แคชฟอนต์/ไอคอน/กราฟ + ไฟล์ของเว็บ (เปิดจากแคชก่อน แล้วอัปเดตเบื้องหลัง)
const SHELL = "mt-shell-v18";
const CDN = "mt-cdn-v4";
const CDN_HOSTS = [
  "fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com",
  "cdn.jsdelivr.net", "lh3.googleusercontent.com"
];

const PRECACHE = ["./", "./index.html", "./features.js", "./extras.js", "./i18n.js", "./catedit.js", "./manifest.json", "./icon-192.png", "./icon-512.png",
  "./vendor/chart.umd.min.js",
  "./vendor/fa/css/fontawesome.min.css",
  "./vendor/fa/css/solid.min.css",
  "./vendor/fa/webfonts/fa-solid-900.woff2",
  "./vendor/fonts.css",
  "./vendor/fonts/noto-sans-lao-lao-400-normal.woff2",
  "./vendor/fonts/noto-sans-lao-lao-600-normal.woff2",
  "./vendor/fonts/noto-sans-lao-lao-700-normal.woff2",
  "./vendor/fonts/prompt-latin-400-normal.woff2",
  "./vendor/fonts/prompt-latin-500-normal.woff2",
  "./vendor/fonts/prompt-latin-600-normal.woff2",
  "./vendor/fonts/prompt-latin-700-normal.woff2",
  "./vendor/fonts/prompt-latin-800-normal.woff2",
  "./vendor/fonts/prompt-thai-400-normal.woff2",
  "./vendor/fonts/prompt-thai-500-normal.woff2",
  "./vendor/fonts/prompt-thai-600-normal.woff2",
  "./vendor/fonts/prompt-thai-700-normal.woff2",
  "./vendor/fonts/prompt-thai-800-normal.woff2",
  "./vendor/sweetalert2.all.min.js"];

// ติดตั้งครั้งแรก: เก็บไฟล์หลักไว้ในเครื่องเลย การเปิดครั้งต่อไปจึงไม่ต้องรอเน็ต
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(SHELL).then((cache) =>
      Promise.all(PRECACHE.map((u) => cache.add(new Request(u, { cache: "reload" })).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL && k !== CDN).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // ของจาก CDN (ฟอนต์ ไอคอน Chart.js รูปหมู): ใช้ของในเครื่องก่อน แล้วอัปเดตเบื้องหลัง
  if (CDN_HOSTS.indexOf(url.hostname) !== -1) {
    e.respondWith(
      caches.open(CDN).then((cache) =>
        cache.match(req).then((hit) => {
          const net = fetch(req).then((res) => {
            if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
            return res;
          }).catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }

  // ไฟล์ของเว็บเราเอง: เปิดจากแคชทันที แล้วดึงของใหม่เบื้องหลัง (deploy ใหม่จะเห็นในการเปิดครั้งถัดไป)
  if (url.origin === location.origin) {
    let finish; e.waitUntil(new Promise((r) => { finish = r; }));
    e.respondWith(
      caches.open(SHELL).then((cache) =>
        cache.match(req, { ignoreSearch: true }).then((h0) => (h0 || req.mode !== "navigate" ? h0 : cache.match("./index.html"))).then((hit) => {
          const net = fetch(req, { cache: "no-cache" }).then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          });
          net.then(finish, finish);
          if (hit) return hit;
          return net.catch(() => cache.match("./index.html"));
        })
      ).catch(() => fetch(req))
    );
  }
  // คำขอไป script.google.com (ข้อมูลจริง) ปล่อยผ่านตามปกติ
});
