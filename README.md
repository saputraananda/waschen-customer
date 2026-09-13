# My Waschen

Portal pelanggan Waschen Laundry. React (Vite) + Express, dijalankan bersamaan dengan `concurrently`.

Fitur utama: lacak progres cucian via nomor nota / scan barcode (tanpa login), login akun portal, dan instalasi PWA.

## Struktur

```
api/              Backend Express (routes, controllers, db)
src/              Frontend React (pages, components, utils)
public/           Static assets & ikon PWA
server.js         Entry point Express
vite.config.js    Konfigurasi Vite + PWA
```

## Menjalankan

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:8000`
- Backend: `http://localhost:8001` (di-proxy lewat `/api`)

Butuh file `.env` berisi kredensial database. Lihat `api/db/pool.js` untuk variabel yang dipakai.

## Scripts

| Script               | Deskripsi                          |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Server & client bersamaan          |
| `npm run dev:server` | Backend saja (nodemon)             |
| `npm run dev:client` | Frontend saja (Vite)               |
| `npm run build`      | Build frontend untuk production    |
| `npm start`          | Jalankan server production         |
| `npm run preview`    | Preview hasil build                |

## API Tracking

| Endpoint                      | Keterangan                                     |
| ----------------------------- | ---------------------------------------------- |
| `GET /api/tracking/work-statuses` | Daftar tahapan pengerjaan                  |
| `GET /api/tracking/:orderNo`      | Detail progres order (read-only, publik)   |

Endpoint tracking bersifat publik dan hanya mengembalikan field yang aman — data sensitif pelanggan tidak diekspos.
