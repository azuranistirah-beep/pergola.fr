# Deploy pergolafr.com ke Hostinger Business

Panduan ini asumsinya kamu punya plan **Hostinger Business Hosting** (yang support Node.js + MySQL) dan udah menyelesaikan Fase 1–2 (migrasi InsForge → MySQL). Semua artefak siap-import ada di `migration/`.

---

## 1. Setup MySQL Database di hPanel

1. Login ke hPanel Hostinger.
2. **Databases → MySQL Databases**.
3. Klik **Create New Database**:
   - Database name: `pergolafr` (atau nama lain)
   - User: buat user baru (mis. `pergolafr_admin`)
   - Password: generate strong password → **catat/save**
4. Setelah dibuat, catat:
   - **Host**: biasanya `localhost` atau `mysql.hostinger.com` (lihat di hPanel)
   - **Port**: 3306
   - **Database**, **User**, **Password**

---

## 2. Import Data

Ada 2 cara — pilih salah satu.

### Cara A — via phpMyAdmin (paling gampang untuk 552 KB)

1. hPanel → **Databases → phpMyAdmin** → klik database `pergolafr`.
2. Tab **Import**:
   - Upload `migration/mysql-schema.sql` → **Go**
3. Tab **Import** lagi:
   - Upload `migration/mysql-data.sql` → **Go**
4. Tab **Import** lagi:
   - Upload `migration/mysql-fk.sql` → **Go**

Kalau upload gagal karena size limit → pakai Cara B.

### Cara B — via CLI dari komputer kamu (butuh MySQL client)

```bash
# Ganti nilai sesuai kredensial yang kamu catat di step 1.
export MYSQL_PWD="your-password"
MYSQL_CMD="mysql -h your-host.hostinger.com -u pergolafr_admin pergolafr"

$MYSQL_CMD < migration/mysql-schema.sql
$MYSQL_CMD < migration/mysql-data.sql
$MYSQL_CMD < migration/mysql-fk.sql

# Verify:
$MYSQL_CMD -e "SELECT COUNT(*) FROM products; SELECT COUNT(*) FROM product_media;"
# Expect: 351 products, 1382 product_media
```

---

## 3. Setup Node.js App di hPanel

1. hPanel → **Advanced → Node.js**.
2. Klik **Create Application**:
   - Node.js version: **20.x** atau lebih baru (Next 16 butuh Node ≥ 18.18)
   - Application mode: **Production**
   - Application root: `/domains/pergolafr.com` (default)
   - Application URL: `https://pergolafr.com`
   - Application startup file: `node_modules/.bin/next` — nanti dioverride
   - Passenger log: default

3. Setelah dibuat, hPanel akan kasih tombol **Setup Node.js** — buka.

---

## 4. Push Repo ke Hostinger

Ada 2 opsi:

### Opsi A — Git deploy (paling clean)

1. Di Hostinger hPanel: **Git → Create Repository**
2. Pilih **Custom repository** atau **Connect GitHub** (kalau repo di GitHub).
3. Repository URL: `git@github.com:israanwar/pergolafr.com.git` (atau URL kamu)
4. Branch: `main`
5. Deploy path: `/domains/pergolafr.com`

Aktifkan **Auto-Deploy** jika mau tiap push ke `main` otomatis re-deploy.

### Opsi B — FTP/File Manager upload

Kalau nggak pakai git:

```bash
# Build lokal dulu
npm run build

# Upload folder-folder ini via File Manager:
# - .next/
# - public/
# - node_modules/   (atau install ulang di server)
# - package.json
# - package-lock.json
# - next.config.ts
```

---

## 5. Set Environment Variables

Di hPanel → **Node.js → Environment Variables**, tambahkan:

```
MYSQL_URL=mysql://pergolafr_admin:your-password@localhost:3306/pergolafr
ADMIN_SESSION_SECRET=<hasil dari `openssl rand -hex 32`>
NEXT_PUBLIC_SITE_URL=https://pergolafr.com
NODE_ENV=production
```

**Jangan lupa**: `ADMIN_SESSION_SECRET` baru → semua session admin lama akan invalidated (users perlu login ulang). Ini normal untuk pertama kali deploy.

---

## 6. Install & Build di Server

Buka **Node.js Terminal** di hPanel (biasanya ada tombol khusus) atau **SSH**:

```bash
cd ~/domains/pergolafr.com

# Install deps (production only, skip devDependencies)
npm ci --omit=dev

# Build Next.js
npm run build
```

Kalau `npm ci` gagal karena missing devDeps saat build, jalankan penuh:
```bash
npm install
npm run build
```

---

## 7. Configure Startup

Di hPanel → **Node.js → Startup file**:
- Ganti dari `node_modules/.bin/next` menjadi custom command:
  ```
  npm run start
  ```
  atau langsung: `node_modules/next/dist/bin/next start`

Restart aplikasi (**Restart App** button).

---

## 8. Test

Buka:
- `https://pergolafr.com/` — homepage
- `https://pergolafr.com/pergolas` — product listing (351 products)
- `https://pergolafr.com/pergolas/beaumont-14x10` — product detail
- `https://pergolafr.com/admin/login` — login admin
  - Email: `admin@pergolafr.com`
  - Password: hash BCrypt lama masih valid — pakai password yang sudah kamu tau, atau reset via CLI (lihat scripts/admin-reset-password.mjs — perlu update untuk MySQL nanti)

---

## 9. Troubleshooting

**`ECONNREFUSED 127.0.0.1:3306`**
→ Host MySQL salah. Cek di hPanel — kadang perlu pakai `mysql.hostinger.com` bukan `localhost`.

**`Access denied for user`**
→ Password salah, atau user belum di-grant access ke database. Di hPanel → MySQL → assign user ke database.

**`Table 'pergolafr.products' doesn't exist`**
→ Import SQL belum jalan. Cek phpMyAdmin, ada tabel apa aja.

**Admin login "invalid" padahal password bener**
→ `ADMIN_SESSION_SECRET` belum di-set → lihat step 5.

**Gambar produk 404**
→ Cek `public/images/products/<slug>/` ada di server. Kalau deploy via git, folder ini otomatis include. Kalau via FTP, pastikan folder `public/` ke-upload lengkap.

**Static pages tidak keupdate setelah edit admin**
→ `revalidatePath("/", "layout")` sudah di-call di action, tapi Next standalone mode kadang butuh restart. Tekan **Restart App** di hPanel.

---

## 10. Upload Admin (Product Images)

Foto yang diupload lewat admin panel disimpan di `public/uploads/products/<slug>/<timestamp>.jpg`.

**Penting**: folder `public/uploads/` sudah di `.gitignore` — jadi TIDAK ke-wipe kalau `git pull`. Tapi kalau kamu deploy via FTP dan replace folder `public/`, folder uploads bisa hilang.

**Recommended**: setelah first deploy, buat folder `public/uploads/products/` di server (kalau belum ada) dan chmod 755:
```bash
mkdir -p public/uploads/products && chmod -R 755 public/uploads
```

---

## Selesai! 🎉

Site kamu sekarang jalan di Hostinger, InsForge sudah bisa di-cancel subscription. Untuk future updates:
1. Push ke `main` → auto-deploy jalan (kalau enabled)
2. Atau manual: SSH → `git pull && npm ci && npm run build && npm run start`

Migration artefacts (`migration/*.sql`, `migration/convert-pg-to-mysql.mjs`) bisa kamu simpan di git untuk arsip, atau delete kalau sudah nggak butuh.
