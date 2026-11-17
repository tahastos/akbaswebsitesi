# Akbaş Design web sitesi: Claude için proje notları

Bu dosya projeyle birlikte her bilgisayara gider. Masaüstü bilgisayarda yapılan ilk çalışma oturumunun (17 Kasım 2026) özeti ve çalışma kuralları burada.

## Kullanıcı ve çalışma şekli

- Kullanıcı Akbaş Design adlı iç mimarlık ve dekorasyon şirketinin sahibi (İstanbul ve Bursa). **Türkçe konuşur; yanıtlar Türkçe olmalı.**
- Yazılımcı değil. Teknik adımları sade anlat, komutları kendin çalıştır.
- **İki bilgisayarda çalışıyor:** bir masaüstü ve bir laptop. Senkronizasyon GitHub üzerinden:
  - Depo: https://github.com/tahastos/akbaswebsitesi (herkese açık, dal `main`).
  - **Oturumun başında, dosyalara dokunmadan önce `git pull`.**
  - İş bitince değişiklikleri commit edip push etmeyi **teklif et**; kullanıcı onaylamadan push etme. Kullanıcı "kaydet ve gönder" ya da "GitHub'dan son hâli çek" dediğinde bunu yap.
  - Kullanıcı GitHub Desktop kullanmıyor; pull ve push işlerini Claude yapıyor. Her bilgisayarda ilk push'ta Git Credential Manager tarayıcıdan GitHub girişi ister, girişi kullanıcı yapar. Masaüstünde ilk push "Invalid username or token" hatası verdi. Sebep, kayıtlı eski ve geçersiz bir girişti; `git credential reject` ile silinince yeni giriş penceresi açıldı ve push başarılı oldu.
- Telefondan erişim **istemiyor**. GitHub Pages ya da Netlify kurulmayacak; site yalnızca iki bilgisayarda yerelde açılıyor.
- Masaüstünde Node ve Python yok (laptopta da olmadığını varsay). Derleme aracı, npm ya da Prettier kullanılmıyor.

## Projenin amacı

Şirketin web sitesi. Ana sayfanın iki bölümü var:

1. **Giriş (hero):** Kaydırdıkça döşenen 3B bir daire modeli. Kamera oda oda geziyor, ev sürüklenerek yana çevrilebiliyor.
2. **"Fikirden teslime altı adım" (`#surec`):** Sürüklenerek ya da sekmelerle gezilen ikinci bir 3B sahne. Altı hizmet adımı: Ön Görüşme, Keşif ve Röleve, 3D Tasarım, Proje Onayı, İmalat, Montaj ve Teslim.

Sonraki planlar: ev modelini ve hizmet bölümünü geliştirmeye devam etmek, ardından siteye yeni bölümler eklemek (henüz konuşulmadı; muhtemelen menü, iletişim, portfolyo ve footer).

## Dosya yapısı

- `index.html`: iskelet ve metinler (hero başlıkları `.caps`, adım noktaları `.dots`, sürükleme ipucu `.hhint`, süreç adımları `.ptrack`).
- `css/style.css`: tüm stiller. Renkler `:root` değişkenlerinde, karanlık mod destekleniyor.
- `js/shared.js`: `window.AKBAS` altında iki sahnenin ortak yardımcıları: `M` (malzeme), `B` (yuvarlatılmış kutu), `BX`, `Cy`, `Sp`, `canvasTex`, `makeRnd`, `makeRenderer`, `clamp`, `e3`, `ss`.
- `js/hero.js`: ev modeli (okunur biçimde yazılmış).
- `js/process.js`: süreç sahnesi. **Kodun büyük kısmı hâlâ sıkıştırılmış (minified) tek satırlar hâlinde.** Dokunulan kısımlar zamanla okunur hâle getirilecek.
- Three.js **r128**, cdnjs'den klasik `<script>` ile yükleniyor. ES module kullanılmıyor, böylece `index.html`'e çift tıklayınca (file://) da çalışıyor. Bu yapıyı bozma.
- `.claude/serve.ps1` ve `.claude/launch.json`: Node gerektirmeyen PowerShell yerel sunucusu, `http://localhost:5500`. Tarayıcı önizlemesi için "site" adlı yapılandırmayla başlatılıyor.

## Ev modeli (`js/hero.js`): mevcut durum

- **L biçimli 2+1 daire**, ölçüler metre cinsinden. x doğuya, z öne doğru artıyor:
  - Yatak odası 0–4.6 × 0–4.6
  - Çalışma odası 4.6–7.4 × 0–3.4
  - Salon 7.4–13.2 × 0–6.8
  - Banyo 0–4.6 × 4.6–7.0
  - Mutfak ve yemek alanı 0–4.6 × 7.0–10
  - Koridor 4.6–6.0 × 3.4–10 (giriş kapısı z=10'da) ve hol 6.0–7.4 × 3.4–6.8
- Arkadaki iki dış duvar (z=0 ve x=0) tam boy ve pencereli. Diğer bütün duvarlar mimari kesit gibi `LOW` (1,05 m) yüksekliğinde kesik, üstlerinde koyu bir kapak var. Bu kararın sebebi: kamera odaların içine bakabilsin, site ağırlaşmasın.
- Kaydırma 7 adım: boş ev → kuşbakışı plan (oda adları ve m² etiketleri) → mutfak ve yemek → salon → yatak odası → banyo, çalışma ve antre → akşam ışığında bitmiş ev ve WhatsApp butonu. Kamera pozları `KF` dizisinde (yaw ve pitch derece cinsinden, `rx`/`ry` kadraj yarı genişlikleri).
- Eşyalar `reg(nesne, başlangıç, bitiş, mod)` ile kayıtlı, kaydırma değerine göre sahneye giriyor (`drop`, `grow`, `pop`).
- Mobil: dikey ekranda kadraj ve açı otomatik ayarlanıyor. Kaydırma ilerlemesi sticky sahne yüksekliğine göre hesaplanıyor, adres çubuğu atlamalarından etkilenmiyor.

### Kullanıcının ev modeliyle ilgili istekleri (yapıldı)

- Mantıklı bir plan: antre ve koridor olmalı.
- Balkon olmasın.
- Salon ve mutfak ayrı odalar olsun. Salonda TV ünitesi, bir koltuk ve iki berjer; yemek masası mutfakta.
- Banyoda küvet kapının önünde durmasın. Yerleşim: duş köşede, lavabo sol duvarda, küvet yatak odası duvarında, klozet karşı duvarda.
- Kamera oda oda gezsin, ev elle çevrilebilsin, mobilde senkron düzgün olsun, site yorulmasın.
- Yatak odası ve çalışma odası için şimdilik ek istek yok.

## Süreç sahnesi (`js/process.js`): mevcut durum

- 3B model sahnede tam ortalı. Eskiden yazıya yer açmak için sağa kaydırılmıştı, kullanıcı ortalanmasını istedi.
- **Ön Görüşme:** koyu platform ve yeşil halı, renkli kıyafetli ve koyu tenli figürler, masada laptop, kat planı ve numuneler, arkada sunum panosu. Konuşma balonlarında yazı var ("Tarzınız, bütçeniz?" ve "Sade ve ferah"). Kullanıcı önceki hâlinde fazla beyazlık olduğunu ve anlaşılmadığını söylemişti.
- **Keşif ve Röleve:** Tripodlu lazer kaldırıldı (inşaat işi gibi duruyordu; bu şirket iç mimarlık yapıyor). Elde tutulan sarı lazer metreyle ölçüm yapan bir kişi ve not alan bir kişi var. Ölçü etiketleri koyu zeminli ve büyük; pencere ölçüleri görünür.
- **3D Tasarım:** mavi tel kafes çizgiler ve hafif saydam dolgu.
- **Proje Onayı:** daha koyu platform, halı ve ceviz masa (beyazlık azaltıldı).
- **İmalat** ve **Montaj ve Teslim:** kullanıcı memnun, değiştirilmedi.
- Bu sahne sayfa açılırken değil, bölüme yaklaşınca kuruluyor (IntersectionObserver ile tembel yükleme).

## Açık işler ve notlar

- WhatsApp numarası örnek numara (`905000000000`, `index.html` içinde iki yerde). Gerçek numara kullanıcıdan alınacak.
- Mobilde mutfak yakın planı biraz küçük görünebilir. Son plan değişikliğinden sonra mobil görünüm ayrıca test edilmedi.
- `js/process.js`'in okunur hâle getirilmesi bekliyor.
- Sitede henüz menü, iletişim, footer, portfolyo ya da SEO için HTML içerik yok.
- Depo herkese açık. Gizli bilgi (şifre, kişisel veri) ekleme.

## Doğrulama

Görsel değişikliklerden sonra yerel sunucuyu başlat ve tarayıcıda kontrol et. Hero adımlarına gitmek için sayfa kaydırması kullan: `scrollTo(0, (hero.offsetHeight - stage.offsetHeight) * k / 6)`, k 0–6 arası. `window.__setT(v)` de var, ama kaydırma olayı onu ezebilir. Konsolda hata olmadığını kontrol et.
