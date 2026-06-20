# Task Tracker — CI/CD Pipeline Demo

Aplikasi static web sederhana (Task Tracker) yang digunakan sebagai proyek demo
untuk Tugas Besar Manajemen Konfigurasi dan Evolusi PL — implementasi pipeline
CI/CD lengkap menggunakan GitHub Actions: **Continuous Integration**,
**Continuous Testing**, **Continuous Inspection (SonarCloud)**, dan
**Continuous Deployment (GitHub Pages)**.

---

## 1. Struktur Proyek

```
cicd-demo/
├── .github/workflows/
│   ├── ci.yml              # CI: install, lint, test, build
│   ├── sonarcloud.yml      # Continuous Inspection via SonarCloud
│   └── deploy.yml          # CD: build + deploy ke GitHub Pages
├── src/
│   ├── app.js               # Logic murni (createTask, toggleTask, dll) — diuji unit test
│   ├── ui.js                 # Kode DOM yang memakai logic dari app.js
│   ├── index.html
│   └── style.css
├── tests/
│   └── app.test.js           # 16 unit test (Jest) untuk src/app.js
├── build.js                  # Build script: validasi + copy src/ -> dist/
├── package.json
├── .eslintrc.js
├── sonar-project.properties
└── .gitignore
```

---

## 2. Setup Lokal

```bash
npm install
npm run lint     # ESLint
npm test         # Jest, 16 test + coverage report
npm run build    # Hasil ada di folder dist/
```

---

## 3. Penjelasan Workflow GitHub Actions

### a. `ci.yml` — Continuous Integration & Continuous Testing

**Trigger:** setiap `push` ke branch `main` dan setiap `pull_request` yang
menargetkan `main`.

**Langkah-langkah:**
1. `actions/checkout@v4` — clone repo ke runner.
2. `actions/setup-node@v4` — install Node.js 20 dengan cache npm supaya
   build lebih cepat di run berikutnya.
3. `npm ci` — install dependency persis sesuai `package-lock.json` (lebih
   deterministik daripada `npm install`, mencegah masalah "works on my
   machine").
4. `npm run lint` — menjalankan ESLint. Jika ada syntax error atau pelanggaran
   aturan lint, step ini **gagal** dan seluruh job berhenti (fail fast) —
   ini mencegah kode yang rusak masuk ke `main`.
5. `npm test` — menjalankan 16 unit test dengan Jest mencakup fungsi inti:
   `createTask`, `toggleTask`, `removeTask`, `filterTasks`, `getStats`.
   Jika satu saja gagal, job gagal.
6. `npm run build` — compile/bundling sederhana: memvalidasi sintaks tiap
   file JS dan menyalin `src/` ke `dist/`. Jika ada file yang hilang atau
   sintaks salah, build gagal dengan pesan error yang jelas.
7. Upload artifact (`dist/` dan `coverage/`) supaya hasil build dan laporan
   coverage bisa diunduh dari halaman Actions run.

**Variabel/Environment:** Tidak ada secret khusus diperlukan untuk job ini —
hanya `GITHUB_TOKEN` bawaan GitHub Actions (otomatis tersedia).

### b. `sonarcloud.yml` — Continuous Inspection

**Trigger:** sama seperti CI, `push`/`pull_request` ke `main`.

**Langkah penting:**
- `fetch-depth: 0` saat checkout — SonarCloud butuh history git lengkap
  (bukan shallow clone) supaya bisa menghitung *new code* vs *old code* dan
  blame info dengan akurat.
- Menjalankan test dulu (`npm test`) supaya file `coverage/lcov.info`
  ter-generate, lalu SonarCloud scanner membaca file itu untuk menampilkan
  metrik code coverage di dashboard.
- Action `SonarSource/sonarcloud-github-action@master` membaca konfigurasi
  dari `sonar-project.properties` dan mengirim hasil analisis ke
  SonarCloud, sekaligus memberi status check pada PR (Quality Gate).

**Secret yang dibutuhkan (disetel di Settings → Secrets and variables → Actions):**
- `SONAR_TOKEN` — token dari SonarCloud (My Account → Security → Generate Token).
- `GITHUB_TOKEN` — otomatis disediakan GitHub, tidak perlu disetel manual.

### c. `deploy.yml` — Continuous Deployment/Delivery

**Trigger:** hanya `push` ke `main` (artinya hanya kode yang sudah lolos
review/merge yang di-deploy) + `workflow_dispatch` untuk trigger manual saat
demo.

**Dua job terpisah:**
1. **build** — install dependency, jalankan test lagi (safety net terakhir
   sebelum deploy), build ke `dist/`, lalu upload sebagai *Pages artifact*
   menggunakan `actions/upload-pages-artifact@v3`.
2. **deploy** — mengambil artifact dari job `build` (lewat `needs: build`)
   dan mem-publish ke GitHub Pages menggunakan `actions/deploy-pages@v4`.
   URL hasil deploy otomatis muncul di output job (`page_url`).

**Permission khusus** (`pages: write`, `id-token: write`) diperlukan supaya
job punya izin mem-publish ke GitHub Pages menggunakan OIDC token, tanpa
perlu menyimpan token/password manual sebagai secret.

---

## 4. Cara Setup di GitHub (langkah lengkap untuk video demo)

1. Buat repository baru di GitHub (public, agar SonarCloud free tier &
   GitHub Pages bisa dipakai gratis tanpa biaya).
2. Push seluruh isi folder ini ke repo tersebut (lihat bagian 6 di bawah).
3. **Aktifkan GitHub Pages:** Settings → Pages → Source: pilih
   **GitHub Actions** (bukan branch `gh-pages`, karena kita pakai
   `actions/deploy-pages`).
4. **Setup SonarCloud:**
   - Buka https://sonarcloud.io, login dengan akun GitHub.
   - "+" → Analyze new project → pilih repo ini.
   - Catat **Organization Key** dan **Project Key**, masukkan ke
     `sonar-project.properties`.
   - Buka My Account → Security → Generate Token → simpan tokennya.
   - Di GitHub repo: Settings → Secrets and variables → Actions →
     New repository secret → nama `SONAR_TOKEN`, isi dengan token tadi.
5. Push perubahan apa pun ke `main` atau buka Pull Request untuk memicu
   ketiga workflow di atas. Lihat hasilnya di tab **Actions**.

---

## 5. Simulasi yang Perlu Didemokan (sesuai instruksi tugas)

### Continuous Integration — sukses & gagal
- **Sukses:** buat branch baru, ubah `src/app.js` secara valid (misal tambah
  fungsi baru), buka PR ke `main`. Tunjukkan job `ci.yml` hijau karena
  lint, test, dan build semua lolos.
- **Gagal:** sengaja rusak sintaks, misal hapus tanda kurung tutup di
  `src/app.js`, lalu push ke branch/PR yang sama. Tunjukkan step **Lint**
  atau **Build** merah, dan jelaskan pesan error yang muncul di log.

### Continuous Testing — sukses & gagal
- **Sukses:** jalankan PR dengan kode yang tidak mengubah logic — semua 16
  test lolos seperti biasa.
- **Gagal:** ubah salah satu fungsi di `src/app.js` agar berperilaku salah,
  contoh: di `getStats`, ganti `Math.round((done / total) * 100)` menjadi
  nilai yang salah (misal selalu `0`). Push ke PR — step **Run automated
  tests** akan merah karena assertion `expect(stats).toEqual(...)` gagal.
  Jelaskan di video baris log Jest yang menunjukkan *expected* vs
  *received*.

### Continuous Inspection — SonarCloud
- Tunjukkan dashboard SonarCloud project setelah analisis pertama selesai
  (Quality Gate, code smells, coverage %, duplications).
  Lakukan perubahan kecil yang sengaja menimbulkan "code smell" (misal
  variabel tidak terpakai atau fungsi terlalu kompleks), push, lalu
  tunjukkan SonarCloud mendeteksinya dan check pada PR menjadi gagal/warning.

### Continuous Deployment — GitHub Pages
- Setelah PR di-merge ke `main`, tunjukkan job `deploy.yml` berjalan
  otomatis di tab Actions, lalu buka URL GitHub Pages yang dihasilkan
  (`https://<username>.github.io/<repo>/`) untuk membuktikan perubahan
  sudah live tanpa langkah manual.

---

## 6. Push ke GitHub (jika belum pernah)

```bash
git init
git add .
git commit -m "Initial commit: task tracker app with CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

Setelah push pertama, buka tab **Actions** di GitHub untuk melihat ketiga
workflow berjalan otomatis.
