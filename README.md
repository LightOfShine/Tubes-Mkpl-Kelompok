# Task Tracker — CI/CD Pipeline Demo

**Tugas Besar Manajemen Konfigurasi dan Evolusi Perangkat Lunak**

Aplikasi To-Do List sederhana dengan pipeline CI/CD lengkap menggunakan GitHub Actions.

| Link | URL |
|------|-----|
| **Live Website** | https://lightofshine.github.io/Tubes-Mkpl-Kelompok/ |
| **GitHub Actions** | https://github.com/LightOfShine/Tubes-Mkpl-Kelompok/actions |
| **SonarCloud** | https://sonarcloud.io/project/overview?id=LightOfShine_Tubes-Mkpl-Kelompok |

---

## Struktur Proyek

```
├── .github/workflows/ci.yml   → Pipeline CI/CD (4 job berurutan)
├── src/
│   ├── app.js                  → Logic inti (pure functions, 100% test coverage)
│   ├── ui.js                   → DOM rendering (tabel, edit inline, localStorage)
│   ├── index.html              → Halaman utama
│   └── style.css               → Styling dark theme
├── tests/app.test.js           → 20 unit test (Jest)
├── build.js                    → Build script (validasi syntax + copy ke dist/)
├── sonar-project.properties    → Konfigurasi SonarCloud
├── .eslintrc.js                → Konfigurasi ESLint
└── package.json                → Dependencies & npm scripts
```

---

## Pipeline CI/CD

Setiap `git push` ke `main` men-trigger 4 job yang berjalan **berurutan** (setiap job memiliki `needs` ke job sebelumnya):

| Job | Apa yang Dilakukan | Gagal Jika |
|-----|--------------------|------------|
| **1. Continuous Integration** | `npm ci` → `npm run build` (validasi syntax JS, copy `src/` → `dist/`) | Syntax error atau file hilang |
| **2. Continuous Testing** | `npm run lint` (ESLint) → `npm test` (Jest, 20 test, coverage 100%) | Lint error atau test gagal |
| **3. Continuous Inspection** | SonarCloud scan (bugs, code smells, security, coverage) | Quality Gate failed |
| **4. Continuous Deployment** | Upload `dist/` ke GitHub Pages → live di URL publik | Hanya jalan pada push ke `main` |

Jika satu job gagal, job berikutnya **tidak dieksekusi** → deployment tidak terjadi.

---

## Arsitektur Kode

`app.js` berisi **pure functions** yang dipisah dari `ui.js` (DOM) agar bisa di-unit test tanpa browser:

| Fungsi | Deskripsi |
|--------|-----------|
| `createTask(title)` | Buat task baru, validasi input |
| `toggleTask(tasks, id)` | Toggle status done/pending |
| `removeTask(tasks, id)` | Hapus task by ID |
| `editTask(tasks, id, newTitle)` | Edit judul task |
| `filterTasks(tasks, status)` | Filter by `'all'`/`'done'`/`'pending'` |
| `getStats(tasks)` | Hitung total, done, percent |

Semua fungsi **immutable** — mengembalikan array baru, tidak mengubah array asli.

---

## Setup Lokal

```bash
npm install          # Install dependencies
npm run lint         # Jalankan ESLint
npm test             # Jalankan 20 unit test + coverage report
npm run build        # Build ke dist/
```

---

## Skenario Demo Kegagalan

### 1. CI Gagal (Build Error)
Hapus `}` penutup fungsi di `app.js` → syntax error → job **Continuous Integration** gagal, job 2-4 tidak jalan.

### 2. CT Gagal (Test Error)
Hapus validasi `if` di `createTask()` → syntax valid tapi logic salah → job **Continuous Integration** sukses, job **Continuous Testing** gagal (3 test fail), job 3-4 tidak jalan.

### 3. Sukses
Kembalikan kode → semua 4 job hijau → website otomatis ter-deploy.

---

## Tech Stack

**Runtime:** Node.js 20 · **Test:** Jest · **Lint:** ESLint · **Inspection:** SonarCloud · **CI/CD:** GitHub Actions · **Hosting:** GitHub Pages
