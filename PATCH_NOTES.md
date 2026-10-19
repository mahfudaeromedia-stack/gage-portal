# UI Foundation Consolidation

## Perubahan

- `assets/global-ui-canonical.css` dikonsolidasikan menjadi satu lapisan foundation tanpa membuat folder atau stylesheet baru.
- Sumber token `:root` dipangkas dari 3 menjadi 1.
- Tinggi kontrol distandardisasi menjadi 38px; kontrol compact menjadi 34px.
- Aturan tombol primary, secondary, danger, hover, focus, field, select, tabel, dan overlay disatukan.
- Lapisan historis R107, R108, dan CBNR R4 serta konflik kontrol 42/48px dihapus dari stylesheet global.
- Ukuran stylesheet global turun dari 43.595 byte / 542 baris menjadi 23.268 byte / 281 baris.
- Jumlah `!important` tetap 0 pada seluruh file CSS.

## Perlindungan regresi

- Ditambahkan `tests/css-foundation-consolidation-contract.js` untuk mengunci satu sumber token, geometri kontrol, pola tombol, select, overlay, keseimbangan kurung CSS, dan larangan `!important`.
- Kontrak regresi lama diselaraskan dengan selector canonical dan perilaku checklist yang memang aktif; pemeriksaan fungsionalnya tidak dihapus.
- `npm test`: lulus 58 kontrak regresi.
- Kontrak khusus CSS foundation: lulus.

## Dampak deployment

- Delta tidak mengubah Firebase rules, indexes, Functions, environment variables, atau struktur data.
- Terapkan file delta pada root repository lalu deploy Netlify seperti biasa.
- UAT visual tetap disarankan untuk halaman Dashboard, Master Data, Fasilitas & Operasional, TV & Digital Signage, Monitoring, modal, dan tampilan mobile.
