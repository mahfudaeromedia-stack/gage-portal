# Audit Penamaan Versi Historis — Ground Experience Portal

## Keputusan canonical
Nomor patch `Pxx`, `Rxx`, dan varian desimal adalah **identitas riwayat perubahan**, bukan identitas bisnis atau kontrak fungsi baru. Penjelasan perubahan disimpan di `HISTORICAL-BASELINE.md`; aturan yang masih berlaku di `CANONICAL-BASELINE-LEDGER.md`. Penamaan runtime baru menggunakan domain/fungsi, bukan nomor patch.

## Audit source (11 Oktober 2026)
Pemindaian pola versi pada file teks yang relevan menemukan **49 file** dengan **801 baris** yang mengandung token mirip versi. Angka ini termasuk CSS class, string, komentar, cache-busting URL, test, dan beberapa teks yang belum tentu penanda patch; bukan 801 fungsi bermasalah.

Kelompok temuan:
- **Identitas implementasi internal:** contoh `PLANNING_PAGES_P22`, `P83_MASTER_REFERENCE_KINDS`. Aman diubah setelah memastikan semua referensi dan pengujian.
- **Kontrak UI lintas file:** contoh `ge-p29-*`, `p26-*`, `r70-*` dan `window.geP29*`. Jangan rename satu sisi saja; migrasi JS, HTML, CSS, event handler, dan tes secara atomik.
- **Runtime/API/route global:** contoh `window.P40_CLEAN_PAGES`, `window.P40_CLEAN_ALIASES`. Harus diaudit terhadap boot, routing, dependensi, dan kompatibilitas sebelum mengganti.
- **Data/Storage ID:** contoh `GE_V257_HISTORY_P15`, `GE_V257_PUBLICATION_P13`, `source:p11-*`, dan skema versi. Jangan diganti tanpa migrasi kompatibel; berisiko memutus data historis.
- **Cache version:** `?v=r60`, `?v=r104` dan sejenisnya. Ganti kelak dengan build/content hash setelah asset pipeline teruji, bukan hapus langsung.
- **Historical regression:** label Rxx di `tests/regression-gate.js` masih dapat dipakai untuk mengidentifikasi sejarah tes, tetapi pengujian canonical sebaiknya menilai perilaku, bukan mensyaratkan komentar/string versi.

## Perubahan source yang telah dilaksanakan
1. `assets/edition1-business-runtime.js`: `PLANNING_PAGES_P22` → `PLANNING_ACCESS_PAGES` (2 referensi).
2. `assets/master-reference.js`: `P83_MASTER_REFERENCE_KINDS` → `MASTER_CURRENCY_POSITION_REFERENCES`; komentar versi menjadi komentar domain.
3. `assets/planning-domains.js`: komentar P83 diubah menjadi penjelasan koleksi `boSpaces`.

## Verifikasi
`node --check` pada ketiga file berhasil; `npm run build` berhasil, 58 regression checks lulus. **Belum** ada validasi interaksi browser atau Firebase atas seluruh penamaan yang tersisa.

## Aturan migrasi lanjutan
1. Catat identifier lama dan referensi lintas file.
2. Tentukan canonical name berdasarkan domain, bukan patch.
3. Migrasi semua caller, selector, registry, dan tes secara atomik.
4. Pertahankan alias sementara hanya jika diperlukan kompatibilitas; catat rencana penghapusannya.
5. Jangan mengubah persisted ID atau Firestore collection tanpa skema migrasi dan rollback.
6. Jalankan test, build, browser smoke test, serta verifikasi Firebase bila tersedia.

## Cleanup lanjutan — domain runtime exports (11 Oktober 2026)
- `GX_P33_P37_INIT` → `GX_PRESENTATION_INIT` (`assets/presentation-stabilization.js`).
- `GXP27Password` → `GXPasswordService` (`assets/password.js`).
- `AccessAssistanceP32` → `GXAccessAssistance` (`assets/access-assistance.js`).
- Audit statis sebelum rename: tidak ditemukan pemanggil di berkas JS lain pada direktori `assets`.
- `P40_CLEAN_ALIASES`, `P40_CLEAN_PAGES`, key storage, dan class CSS lintas file **belum** diubah karena merupakan kontrak runtime/data; tidak boleh diganti tanpa migrasi dan validasi interaksi.

## Cleanup aman fungsi lokal (11 Oktober 2026)
`geProgressToneR17` → `geProgressTone`; `geEnsureStationMaterialViewR65` → `geEnsureStationMaterialView`; `geP29RenderTableBaseR4` → `renderLoungeTableBase` pada `assets/edition1-business-runtime.js`. `pmPageKeyR2` **tidak diubah** karena ditemukan caller pada `assets/page-identity.js`. Nama DOM ID, persisted key, dan public API tidak dimigrasi.
