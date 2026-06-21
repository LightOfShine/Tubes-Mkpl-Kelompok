# 📝 Task Tracker — CI/CD Pipeline Demo

> **Tugas Besar Manajemen Konfigurasi dan Evolusi Perangkat Lunak**

Ini adalah aplikasi **To-Do List** sederhana yang dilengkapi dengan pipeline **CI/CD** (Continuous Integration / Continuous Deployment) otomatis.

🔗 **Website Live:** [https://lightofshine.github.io/Tubes-Mkpl-Kelompok/](https://lightofshine.github.io/Tubes-Mkpl-Kelompok/)

---

## 🤔 Apa Sih CI/CD Itu?

Bayangkan Anda punya pabrik kue. Setiap kali membuat kue baru, Anda harus:
1. 🔨 **Memanggang** (Build) — apakah adonannya bisa dipanggang?
2. 🧪 **Mencicipi** (Test) — apakah rasanya enak?
3. 🔍 **Memeriksa** (Inspect) — apakah bentuknya rapi?
4. 🚀 **Mengirim** (Deploy) — kirim ke toko agar pelanggan bisa beli

**CI/CD melakukan semua itu secara OTOMATIS untuk kode kita.**

Setiap kali kita `git push` (mengirim kode ke GitHub), sebuah "robot" bernama **GitHub Actions** akan otomatis:

```
Push Kode → Build → Test → Inspect → Deploy ke Website
```

Jika salah satu tahap gagal, kode **tidak akan sampai** ke website. Jadi website selalu aman! ✅

---

## 🏗️ Struktur Proyek (Isi Folder)

```
📁 cicd-demo/
│
├── 📁 .github/workflows/
│   └── 📄 ci.yml                ← 🤖 "Otak" pipeline CI/CD (4 tahap otomatis)
│
├── 📁 src/                      ← 💻 Kode aplikasi
│   ├── 📄 index.html            ← Halaman web (struktur tabel)
│   ├── 📄 style.css             ← Tampilan visual (warna, font, dll)
│   ├── 📄 app.js                ← ⭐ Logika inti (fungsi-fungsi murni)
│   └── 📄 ui.js                 ← Kode tampilan (menghubungkan logika ke layar)
│
├── 📁 tests/
│   └── 📄 app.test.js           ← 🧪 20 unit test otomatis
│
├── 📄 build.js                  ← 🔨 Script untuk build (copy + validasi)
├── 📄 sonar-project.properties  ← 🔍 Konfigurasi SonarCloud
├── 📄 .eslintrc.js              ← 📏 Aturan penulisan kode (linting)
├── 📄 package.json              ← 📦 Daftar dependensi & script
└── 📄 .gitignore                ← 🚫 File yang tidak perlu di-upload
```

---

## 🎯 Tentang Aplikasi: To-Do List

Aplikasi sederhana untuk mencatat daftar tugas, dengan fitur:

| Fitur | Cara Pakai |
|-------|------------|
| ➕ **Tambah tugas** | Ketik di kotak input, klik "Tambah" |
| ✏️ **Edit tugas** | Klik tombol "Edit" → ubah judul → klik "Simpan" |
| ☑️ **Tandai selesai** | Centang checkbox pada tugas |
| 🗑️ **Hapus tugas** | Klik tombol "Hapus" |
| 🔍 **Filter** | Klik "Semua" / "Belum Selesai" / "Selesai" |
| 💾 **Data tersimpan** | Data disimpan di browser (tidak hilang walau refresh) |

Data ditampilkan dalam **tabel** dengan kolom: **No**, **Status**, **Nama Tugas**, **Aksi**.

---

## ⚙️ Cara Menjalankan di Komputer Sendiri

```bash
# 1. Install semua yang dibutuhkan
npm install

# 2. Cek gaya penulisan kode (linting)
npm run lint

# 3. Jalankan semua test otomatis
npm test

# 4. Build proyek (copy src → dist)
npm run build

# 5. Jalankan website secara lokal
npm start
```

---

## 🤖 Pipeline CI/CD — 4 Tahap Otomatis

File konfigurasi: `.github/workflows/ci.yml`

Setiap kali ada `git push` ke branch `main`, **4 tahap** ini berjalan otomatis secara berurutan:

### Tahap 1: 🔨 Continuous Integration (Build)

**Pertanyaan yang dijawab:** *"Apakah kodenya bisa dikompilasi?"*

Yang dilakukan:
1. Download kode dari GitHub
2. Install Node.js dan semua dependensi (`npm ci`)
3. Jalankan `npm run build` — script `build.js` akan:
   - Memeriksa apakah syntax JavaScript-nya benar
   - Menyalin file dari folder `src/` ke folder `dist/`
   - Jika ada syntax error → **GAGAL** ❌

**Jika gagal:** Semua tahap berikutnya **tidak jalan**.

---

### Tahap 2: 🧪 Continuous Testing

**Pertanyaan yang dijawab:** *"Apakah kodenya berjalan sesuai harapan?"*

Yang dilakukan:
1. Jalankan `npm run lint` — memeriksa gaya penulisan kode (ESLint)
2. Jalankan `npm test` — menjalankan **20 unit test** menggunakan Jest

**20 test ini menguji:**

| Fungsi | Apa yang Diuji | Jumlah Test |
|--------|---------------|:-----------:|
| `createTask()` | Buat tugas baru, validasi input kosong, trim spasi | 5 |
| `toggleTask()` | Ubah status selesai/belum, cek array tidak berubah | 3 |
| `removeTask()` | Hapus tugas, ID tidak ditemukan | 2 |
| `editTask()` | Edit judul, trim spasi, validasi input | 4 |
| `filterTasks()` | Filter selesai, belum selesai, semua | 3 |
| `getStats()` | Hitung statistik, list kosong, semua selesai | 3 |

**Hasil:** 20/20 test ✅ PASS, Coverage **100%** pada `app.js`

**Jika gagal:** Tahap Inspection dan Deployment **tidak jalan**.

---

### Tahap 3: 🔍 Continuous Inspection (SonarCloud)

**Pertanyaan yang dijawab:** *"Apakah kualitas kodenya bagus?"*

Yang dilakukan:
1. Download laporan coverage dari tahap sebelumnya
2. Kirim kode ke **SonarCloud** untuk dianalisis
3. SonarCloud memeriksa:
   - **Bugs** — ada bug tersembunyi?
   - **Security** — ada celah keamanan?
   - **Code Smells** — ada kode yang kurang rapi?
   - **Coverage** — berapa persen kode yang diuji?

**Quality Gate:** SonarCloud memberikan nilai "Passed" ✅ atau "Failed" ❌

🔗 **Dashboard:** [SonarCloud Project](https://sonarcloud.io/project/overview?id=LightOfShine_Tubes-Mkpl-Kelompok)

---

### Tahap 4: 🚀 Continuous Deployment (GitHub Pages)

**Pertanyaan yang dijawab:** *"Apakah website-nya sudah bisa diakses publik?"*

Yang dilakukan:
1. Ambil hasil build dari Tahap 1
2. Upload ke GitHub Pages
3. Website langsung live di internet! 🌐

🔗 **Website:** [https://lightofshine.github.io/Tubes-Mkpl-Kelompok/](https://lightofshine.github.io/Tubes-Mkpl-Kelompok/)

**Catatan:** Tahap ini hanya berjalan jika push ke branch `main` (bukan pull request).

---

## 🔑 Kenapa `app.js` dan `ui.js` Dipisah?

Ini menggunakan prinsip **Separation of Concerns** (Pemisahan Tanggung Jawab):

| File | Isi | Bisa Diuji Otomatis? |
|------|-----|:--------------------:|
| `app.js` | Logika murni (pure functions): buat, edit, hapus, filter tugas | ✅ Ya (100% coverage) |
| `ui.js` | Kode tampilan (DOM): menampilkan data ke layar browser | ❌ Tidak (butuh browser) |

**Analoginya:**
- `app.js` = **Koki** — tugasnya memasak (logika). Bisa diuji: "apakah masakannya enak?"
- `ui.js` = **Pelayan** — tugasnya menyajikan ke meja (tampilan). Cara penyajiannya berbeda-beda.

Dengan memisahkan keduanya, kita bisa menguji "koki" tanpa perlu "restoran" (browser).

---

## 📊 Cara Melihat Hasil Pipeline

1. Buka repository di GitHub
2. Klik tab **Actions** di bagian atas
3. Terlihat daftar semua pipeline yang pernah berjalan
4. Klik salah satu untuk melihat detail setiap tahap
5. ✅ Hijau = sukses, ❌ Merah = gagal

---

## 🧪 Skenario Demo Kegagalan

### Demo 1: Build Gagal (Continuous Integration ❌)

**Cara:** Hapus tanda `}` penutup di fungsi `createTask` pada `app.js` (syntax error).

**Hasil:** Tahap 1 (Build) langsung gagal. Tahap 2, 3, 4 tidak berjalan.

**Kesimpulan:** CI menangkap kesalahan penulisan kode sedini mungkin.

---

### Demo 2: Test Gagal (Continuous Testing ❌)

**Cara:** Hapus validasi `if` dan `.trim()` di fungsi `createTask` pada `app.js` (syntax benar, tapi logika salah).

**Hasil:** Tahap 1 (Build) sukses ✅, tapi Tahap 2 (Test) gagal karena 3 test tidak lolos. Tahap 3, 4 tidak berjalan.

**Kesimpulan:** CT memastikan kode tidak hanya bisa di-build, tapi juga berjalan **sesuai harapan**.

---

### Demo 3: Semua Sukses ✅

**Cara:** Kembalikan kode ke semula, push lagi.

**Hasil:** Semua 4 tahap hijau. Website otomatis ter-deploy.

---

## 🔧 Teknologi yang Digunakan

| Teknologi | Fungsi |
|-----------|--------|
| **JavaScript** | Bahasa pemrograman utama |
| **HTML & CSS** | Tampilan website |
| **Jest** | Framework unit testing |
| **ESLint** | Linter (pemeriksa gaya kode) |
| **GitHub Actions** | Platform CI/CD (otomatisasi pipeline) |
| **SonarCloud** | Inspeksi kualitas kode |
| **GitHub Pages** | Hosting website (gratis) |

---

## 👥 Kelompok

Tubes Manajemen Konfigurasi dan Evolusi Perangkat Lunak

---

> **Ringkasan:** Setiap `git push` → Robot GitHub Actions otomatis Build → Test → Inspect → Deploy. Jika ada yang gagal, website tidak ter-update. Jika semua lolos, website langsung live. Itulah kekuatan CI/CD! 🚀
