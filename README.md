# Akbaş Design web sitesi

İç mimarlık ve dekorasyon şirketi Akbaş Design için tek sayfalık site: kaydırdıkça döşenen 3B ev modeli ve "Fikirden teslime altı adım" süreç bölümü.

## Yapı

- `index.html`: sayfa iskeleti ve metinler
- `css/style.css`: stiller
- `js/shared.js`: iki 3B sahnenin ortak yardımcıları
- `js/hero.js`: kaydırdıkça kurulan ev modeli
- `js/process.js`: 6 adımlı süreç sahnesi

Three.js (r128) CDN'den yükleniyor; kurulum ya da derleme gerekmiyor.

## Yerelde çalıştırma

- En kolayı: `index.html` dosyasına çift tıkla.
- Yerel sunucuyla (Windows, Node/Python gerekmez):

  ```
  powershell -NoProfile -ExecutionPolicy Bypass -File .claude/serve.ps1
  ```

  Sonra tarayıcıda `http://localhost:5500` adresini aç.
