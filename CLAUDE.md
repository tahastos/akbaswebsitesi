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

## Sitenin parça adları (ortak dil)

Kullanıcı siteyi anlatırken bu adları kullanır; sen de yanıtlarında aynı adları kullan. **Siteye yeni bir parça eklendiğinde ona hemen bir ad ver, buraya ekle ve kullanıcıya söyle.** Ad değişirse burayı güncelle.

**1. Ev Bölümü** (`#hero`, `js/hero.js`): sayfanın en başı, kaydırdıkça döşenen 3B daire.
- **Logo:** sol üstteki "AKBAŞ DESIGN" yazısı ve altındaki satır (`.brand`).
- **Ev modeli:** 3B daire (`canvas#c`).
- **Ev yazıları:** alttaki değişen büyük cümleler (`.caps`).
- **Ev noktaları:** sağdaki 7 nokta (`.dots`).
- **Çevirme ipucu:** "Evi çevirmek için sürükleyin" yazısı (`.hhint`).
- **Ev adımları** (kaydırma sırası, `KF` dizisi): Ev 1 Boş ev, Ev 2 Plan, Ev 3 Mutfak, Ev 4 Salon ve balkon, Ev 5 Yatak odası, Ev 6 Banyo-çalışma-antre, Ev 7 Bitmiş ev.
- **Odalar:** Yatak odası, Çalışma odası, Salon, Balkon, Banyo, Mutfak, Antre (koridor) ve Hol (salon kapısının önü).
- **Tasarlayalım butonu:** Ev 7'deki "Evinizi birlikte tasarlayalım" butonu (`.cta`).

**2. Süreç Bölümü** (`#surec`, `js/process.js`): "Fikirden teslime altı adım".
- **Süreç başlığı:** başlık ve altındaki açıklama (`.phead`).
- **Süreç sahnesi:** sürüklenen 3B sahne (`.pstage canvas`).
- **Süreç kartı:** sahnenin üstündeki numara ve adım adı (`.pinfo`).
- **Süreç okları:** önceki ve sonraki adım düğmeleri (`.pnav`); **Sürükleme ipucu:** "Sağa sürükleyin" (`.phint`).
- **Adım listesi:** altındaki altı adımlık liste (`.ptrack`).
- **Süreç adımları:** Süreç 1 Ön Görüşme, Süreç 2 Keşif ve Röleve, Süreç 3 3D Tasarım, Süreç 4 Proje Onayı, Süreç 5 İmalat, Süreç 6 Montaj ve Teslim.

**3. WhatsApp butonu:** sağ altta her zaman duran yeşil buton (`.wa`).

**Henüz yok, eklenince adı burada kesinleşecek:** Menü, Portfolyo, İletişim, Alt bilgi (footer).

## Dosya yapısı

- `index.html`: iskelet ve metinler (hero başlıkları `.caps`, adım noktaları `.dots`, sürükleme ipucu `.hhint`, süreç adımları `.ptrack`).
- `css/style.css`: tüm stiller. Renkler `:root` değişkenlerinde, karanlık mod destekleniyor.
- `js/shared.js`: `window.AKBAS` altında iki sahnenin ortak yardımcıları: `M` (malzeme), `B` (yuvarlatılmış kutu), `BX`, `Cy`, `Sp`, `canvasTex`, `makeRnd`, `makeRenderer`, `clamp`, `e3`, `ss`.
- `js/hero.js`: ev modeli (okunur biçimde yazılmış).
- `js/process.js`: süreç sahnesi. **Kodun büyük kısmı hâlâ sıkıştırılmış (minified) tek satırlar hâlinde.** Dokunulan kısımlar zamanla okunur hâle getirilecek.
- Three.js **r128**, cdnjs'den klasik `<script>` ile yükleniyor. ES module kullanılmıyor, böylece `index.html`'e çift tıklayınca (file://) da çalışıyor. Bu yapıyı bozma.
- `.claude/serve.ps1` ve `.claude/launch.json`: Node gerektirmeyen PowerShell yerel sunucusu, `http://localhost:5500`. Tarayıcı önizlemesi için "site" adlı yapılandırmayla başlatılıyor.

## Ev modeli (`js/hero.js`): mevcut durum

- **L biçimli 2+1 daire**, ölçüler metre cinsinden. x doğuya, z öne doğru artıyor (24 Kasım 2026'da büyütüldü):
  - Yatak odası 0–5.0 × 0–5.0 (25 m²)
  - Çalışma odası 5.0–8.4 × 0–3.8 (12,9 m²)
  - Salon 8.4–15.0 × 0–7.4 (48,8 m²)
  - Banyo 0–5.0 × 5.0–7.6 (13 m²)
  - Mutfak ve yemek alanı 0–5.0 × 7.6–11.6 (20 m²)
  - Koridor 5.0–6.6 × 3.8–11.6 (giriş kapısı z=11.6'da) ve hol 6.6–8.4 × 3.8–7.4
  - Balkon 11.6–14.8 × 7.6–8.9 (4,8 m²), salondan kapıyla giriliyor (kapı x 12.5–13.5)
- **Bütün kapı boşlukları 1,0 m.**
- Arkadaki iki dış duvar (z=0 ve x=0) tam boy ve pencereli. Diğer bütün duvarlar mimari kesit gibi `LOW` (1,05 m) yüksekliğinde kesik, üstlerinde koyu bir kapak var. Bu kararın sebebi: kamera odaların içine bakabilsin, site ağırlaşmasın.
- Kaydırma 7 adım: boş ev → kuşbakışı plan (oda adları ve m² etiketleri) → mutfak ve yemek → salon → yatak odası → banyo, çalışma ve antre → akşam ışığında bitmiş ev ve WhatsApp butonu. Kamera pozları `KF` dizisinde (yaw ve pitch derece cinsinden, `rx`/`ry` kadraj yarı genişlikleri).
- Eşyalar `reg(nesne, başlangıç, bitiş, mod)` ile kayıtlı, kaydırma değerine göre sahneye giriyor (`drop`, `grow`, `pop`).
- Mobil: dikey ekranda kadraj ve açı otomatik ayarlanıyor. Kaydırma ilerlemesi sticky sahne yüksekliğine göre hesaplanıyor, adres çubuğu atlamalarından etkilenmiyor.

### Kullanıcının ev modeliyle ilgili istekleri (yapıldı)

- Mantıklı bir plan: antre ve koridor olmalı.
- Salon ve mutfak ayrı odalar olsun. Salonda TV ünitesi, bir koltuk ve iki berjer; yemek masası mutfakta.
- Kamera oda oda gezsin, ev elle çevrilebilsin, mobilde senkron düzgün olsun, site yorulmasın.
- 24 Kasım 2026 istekleri:
  - Ev büyütüldü; mutfak L tezgâhlı (sol duvar + banyo duvarı boyunca alçak tezgâh), çalışma odası büyük, içinde iki kitaplık.
  - Yatak 180×200 (eskiden 160×200); diğer eşyalar standart ölçüde.
  - Banyoda **küvet yok**: köşede duşakabin, sol duvarda çekmeceli lavabo dolabı, yatak odası duvarında boy dolabı + alt dolap (üstünde üst dolap), klozet mutfak tarafındaki duvarda.
  - Küçük bir balkon eklendi (eskiden "balkon olmasın" deniyordu, kullanıcı fikrini değiştirdi): boy dolabı, küçük masa, iki sandalye, çiçeklik.
  - TV duvarındaki yeşil çıtalar dalgalı değil, **düz ve tavana kadar**. Duvarın iki yanında alt kısmı kapaklı, üstü açık raflı boy dolapları var.
  - Lambader salon kapısının önünden kaldırıldı, koltuğun sağ ucunun yanına alındı.

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
- Kare ya da dikey ekranda Ev 4'te balkon, alttaki ev yazısının arkasında kalabiliyor; geniş ekranda sorun yok.
- `js/process.js`'in okunur hâle getirilmesi bekliyor.
- Sitede henüz menü, iletişim, footer, portfolyo ya da SEO için HTML içerik yok.
- Depo herkese açık. Gizli bilgi (şifre, kişisel veri) ekleme.

## Doğrulama

Görsel değişikliklerden sonra yerel sunucuyu başlat ve tarayıcıda kontrol et. Hero adımlarına gitmek için sayfa kaydırması kullan: `scrollTo(0, (hero.offsetHeight - stage.offsetHeight) * k / 6)`, k 0–6 arası. `window.__setT(v)` de var, ama kaydırma olayı onu ezebilir. Konsolda hata olmadığını kontrol et.
