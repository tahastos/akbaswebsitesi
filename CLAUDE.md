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
2. **"Fikirden teslime altı adım" (`#surec`):** Kaydırdıkça ilerleyen, ORYZO tarzı bir carousel içinde ikinci bir 3B sahne. Altı hizmet adımı: Ön Görüşme, Keşif ve Röleve, 3D Tasarım, Proje Onayı, İmalat, Montaj ve Teslim.

Sonraki planlar: ev modelini ve hizmet bölümünü geliştirmeye devam etmek, ardından siteye yeni bölümler eklemek (henüz konuşulmadı; muhtemelen menü, iletişim, portfolyo ve footer).

## Sitenin parça adları (ortak dil)

Kullanıcı siteyi anlatırken bu adları kullanır; sen de yanıtlarında aynı adları kullan. **Siteye yeni bir parça eklendiğinde ona hemen bir ad ver, buraya ekle ve kullanıcıya söyle.** Ad değişirse burayı güncelle.

**1. Ev Bölümü** (`#hero`, `js/hero.js`): sayfanın en başı, kaydırdıkça döşenen 3B daire.
- **Logo:** sol üstteki "AKBAŞ DESIGN" yazısı ve üstündeki küçük satır (`.brand`). Ev 1'de dev, sonra küçülür.
- **Menü:** sağ üstteki Ev / Süreç / İletişim bağlantıları (`.menu`). İletişim şimdilik WhatsApp'a gidiyor.
- **Ev kartı:** sol alttaki yarı saydam kart, "Ev 01 / 07" sayacı içinde (`.hcard`).
- **Kaydırma ipucu:** alt ortadaki "Kaydırarak devam edin" (`.hscroll`).
- **Ev modeli:** 3B daire (`canvas#c`).
- **Ev yazıları:** alttaki değişen büyük cümleler (`.caps`).
- **Ev noktaları:** sağdaki 7 nokta (`.dots`).
- **Çevirme ipucu:** "Evi çevirmek için sürükleyin" yazısı (`.hhint`).
- **Ev adımları** (kaydırma sırası, `KF` dizisi): Ev 1 Boş ev, Ev 2 Plan, Ev 3 Mutfak, Ev 4 Salon ve balkon, Ev 5 Yatak odası, Ev 6 Banyo-çalışma-antre, Ev 7 Bitmiş ev.
- **Odalar:** Yatak odası, Çalışma odası, Salon, Balkon, Banyo, Mutfak, Antre (koridor) ve Hol (salon kapısının önü).
- **Tasarlayalım butonu:** Ev 7'deki "Evinizi birlikte tasarlayalım" butonu (`.cta`).

**2. Süreç Bölümü** (`#surec`, `js/process.js`): oryzo.ai'deki "So portable, it's wearable" carousel'inden uyarlandı (24 Kasım 2026).
- **Tek sahne (Ev → Süreç geçişi):** Kullanıcı sitenin ORYZO gibi tek sahne hissi vermesini istedi; bölümler arasında normal sayfa kayması görünmemeli.
  - `#hero` 910svh; hero.js `tot`'u buna göre hesaplar (`stage.offsetHeight * 2.5` = 210svh bindirme + 40svh bekleme).
  - Ev 7 tamamlandıktan sonra, Süreç geçişi başlamadan önce 40svh (~3 fare kaydırması) bekleme payı var. Kullanıcı 25 Kasım 2026'da istedi; eskiden bekleme yoktu ve tek kaydırmada Süreç'e iniliyordu. "Fazla gelirse azaltırız" dedi: azaltmak için CSS'teki 910'u ve hero.js'teki 2,5'i birlikte değiştir (her 10svh = 0,1).
  - Genel bakış kadrajları (Ev 1, 2, 7) aynı gün ~%15 genişletildi. Geniş ekranda model hafifçe aşağıda duruyor (`setViewOffset` −0,04); eskiden üst köşe dev logonun altında kalıyordu.
  - `#surec` 510svh, `margin-top:-210svh` ve `z-index:3` ile evin üstüne biner.
  - İlk 110svh geçiştir (`applyK`, k 0→1):
    - kesikli çerçeve tam ekrandan çerçeve boyuna küçülür ve ev bu çerçevenin içinde bir fotoğrafa dönüşür;
    - dışı kararır (çerçevenin `box-shadow`'u), sonra Süreç zemini gelir;
    - çerçevenin içinde Ön Görüşme belirir;
    - en son başlık, Adım şeridi ve Süreç kartı gelir.
  - Geçişin ortasında kaydırma bırakılırsa yöne göre ilk adıma ya da Ev 7'ye oturur.
  - Menüdeki "Süreç" bağlantısı geçişi atlayıp ilk adıma gider.
- Geçişten sonra sayfa kaydırıldıkça adımlar ilerler, sürükleme yok.
- **Adım yakalama (snap):** Kullanıcı her adımın çerçevede tam ortalanmasını istedi.
  - İlk sürümde geçiş zor geldi, çok kaydırmak gerekiyordu. Şimdiki çözüm yöne bakan yakalama (`snapToStep`, `PUSH=.1`): kaydırma 110 ms durunca, son adımdan o yöne bir adımın %10'u (yaklaşık 40 px, tek fare tıkından az) kaydırılmışsa bir sonraki adıma geçilir, daha azsa yerinde kalınır.
  - Hafif mıknatıs (`magnet`, `HOLD=.08`).
  - Otomatik kaydırma sürerken yeni yakalama yapılmaz.
- **Süreç başlığı:** sol üstte "FİKİRDEN TESLİME," (soluk, büyük harf) ve altında "altı adımda." (`.phead`).
- **Süreç çerçevesi / Süreç sahnesi:** ortadaki kesikli çerçeve; içinde bej stüdyo zemini üstünde 3B sahne (`.pstage`, `.pstage canvas`).
- **Süreç kartı:** çerçevenin altındaki koyu bilgi şeridi. Solda ikon, numara ve adım adı; sağda açıklama (`.pinfo`).
- **Adım şeridi:** yanlarda akan küçük resimler (`.pstrip .pthumb`). Geçilenler solda, sıradakiler sağda; tıklayınca o adıma kaydırır. Resimler 3B sahneden bir kez çizilip webp olarak üretiliyor.
- **Süreç kaydırma ipucu:** alt ortadaki "Kaydırarak devam edin" (`.pscroll`).
- `.ptrack` listesi gizli; yalnızca adım adları ve açıklamaları için veri kaynağı.
- **Süreç adımları:** Süreç 1 Ön Görüşme, Süreç 2 Keşif ve Röleve, Süreç 3 3D Tasarım, Süreç 4 Proje Onayı, Süreç 5 İmalat, Süreç 6 Montaj ve Teslim.

**3. WhatsApp butonu:** sağ altta her zaman duran yeşil buton (`.wa`).

**Henüz yok, eklenince adı burada kesinleşecek:** Portfolyo, İletişim bölümü, Alt bilgi (footer).

## Dosya yapısı

- `index.html`: iskelet ve metinler (hero başlıkları `.caps`, adım noktaları `.dots`, sürükleme ipucu `.hhint`, süreç adımları `.ptrack`).
- `css/style.css`: tüm stiller. Renkler `:root` değişkenlerinde.
  - **Görsel dil (24 Kasım 2026):** Kullanıcı Refero Styles'taki ORYZO AI stilini seçti (https://styles.refero.design/style/1f204e95-454a-437e-845b-c1b169d35607).
  - Site her zaman koyu; ayrı bir açık mod yok. Zemin sıcak koyu (#100904), yazı krem (#ffedd7), yüzey Bark (#382416), çizgiler kesikli ince (#40372e, #6c5f51).
  - Tek vurgu turuncu (#dc5000): yalnızca küçük etiketlerde, butonda asla kullanılmaz.
  - Yazı tipi Outfit. ORYZO'nun gövde yazısı ücretli Halyard Display (Adobe Fonts). Logosu ise font değil, özel çizilmiş bir SVG.
  - Yan yana karşılaştırmada Outfit en yakın ücretsiz font çıktı.
  - Ağırlıklar: logo 700, büyük harfli başlık ve etiketler 600, gövde 400. Gövde metni normal harfli ve sola yaslı.
  - Kullanıcının Adobe Creative Cloud aboneliği olursa gerçek Halyard kullanılabilir.
  - Düzen oryzo.ai'den alındı: Ev Bölümü'nün zemini yeşil kesim matı (ızgaralı), ilk adımda dev logo, sağ üstte küçük menü, sol altta yarı saydam kart, altta "Kaydırarak devam edin", sağ kenarda krem dikey şerit içinde Ev noktaları. Süreç Bölümü koyu "void" zeminde.
  - Köşe yuvarlaklıkları: kart 12px, çerçeveli buton 22.5px, dolu buton 36px. Gölge yok.
  - Canvas UI efektleri denendi, hiçbiri beğenilmedi ve silindi; tekrar önerme. React Bits'teki tasarımları ise beğeniyor.
  - "Tek Ev" fikri denendi (25 Kasım 2026), beğenilmedi ve silindi; tekrar önerme. Fikir şuydu: ORYZO'daki bardak altlığı gibi, bütün sayfa boyunca arkada sabit duran tek bir ev; ev Süreç adımlarıyla birlikte kurulup dönüyor, kartlar önünden kayıyor. Kullanıcı mevcut site yapısıyla (Ev Bölümü, sonra Süreç Bölümü) devam etmek istiyor.
- `js/shared.js`: `window.AKBAS` altında iki sahnenin ortak yardımcıları: `M` (malzeme), `B` (yuvarlatılmış kutu), `BX`, `Cy`, `Sp`, `canvasTex`, `makeRnd`, `makeRenderer`, `clamp`, `e3`, `ss`.
- `js/hero.js`: ev modeli (okunur biçimde yazılmış).
- `js/process.js`: Süreç Bölümü (kaydırma, Adım şeridi ve altı stüdyo sahnesi). Okunur biçimde yazıldı.
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

24 Kasım 2026'da baştan yazıldı. Kod artık okunur biçimde.

**Yapı:**
- Altı ayrı dikey "stüdyo fotoğrafı" sahnesi var. Her biri kendi renkli fon kâğıdının (sweep) önünde.
- Sahneler x ekseninde `SP` (4,2 m) arayla yan yana dizili. Kaydırınca kamera yana kayıyor ve sonraki sahne ORYZO'daki gibi sağdan çerçeveye giriyor; geçişte çerçeve ikiye bölünmüş görünüyor.
- Kullanıcının isteği: sahneler evle sınırlı değil, her adımı en iyi anlatan şekilde ve çerçevede güzel duracak biçimde kurulsun.
- Kamera uzaklığı, fon duvarı çerçeveyi tam dolduracak şekilde en-boy oranına göre hesaplanıyor.
- Güneş ışığı kamerayla birlikte kayıyor.
- İçerik çerçevenin üst %75'inde duruyor, çünkü alttaki Süreç kartı altını kapatıyor.

**Sahneler:**
1. **Ön Görüşme:** Fon bej. Masada iki kişi, arkada sehpada moodboard; balonlarda "Tarzınız, bütçeniz?" ve "Sade ve ferah".
2. **Keşif ve Röleve:** Fon yeşil-gri. Pencereli boş oda köşesi ve ölçü çizgileri (1,20 / 1,30 / 2,70 m). Yerde sarı lazer metreden sol duvara kırmızı ışın (3,40 m), bir kişi okuyor, bir kişi not alıyor.
   - Tripod kullanma: inşaat işi gibi duruyordu.
   - Işın insanların gövdesinden geçmesin diye yerde.
3. **3D Tasarım:** Fon lacivert. Mavi tel kafes kanepe, sehpa, lambader, tablo ve bitki. Tek bir koltuk katı ve renkli, yanında "Render" etiketi.
4. **Proje Onayı:** Fon kiremit. Ekranda 6. sahnenin render'ı, masada numuneler, imzalı kâğıt, büyük pirinç onay işareti ve "Onaylandı" etiketi.
5. **İmalat:** Fon karamel. Alet panosu, yaslı keresteler, tezgâh, yarım dolap gövdesi, önlüklü usta ve talaş.
6. **Montaj ve Teslim:** Fon sıcak kum. Kanepe, koltuk, sehpada anahtar, yanan lambader, bitki, tablo ve "Hoş geldiniz!" etiketi.

**Diğer:**
- Bu sahne sayfa açılırken değil, bölüme yaklaşınca kuruluyor (IntersectionObserver ile tembel yükleme).

## Açık işler ve notlar

- WhatsApp numarası örnek numara (`905000000000`, `index.html` içinde iki yerde). Gerçek numara kullanıcıdan alınacak.
- Kare ya da dikey ekranda Ev 4'te balkon, alttaki ev yazısının arkasında kalabiliyor; geniş ekranda sorun yok.
- Sitede henüz menü, iletişim, footer, portfolyo ya da SEO için HTML içerik yok.
- Depo herkese açık. Gizli bilgi (şifre, kişisel veri) ekleme.

## Doğrulama

Görsel değişikliklerden sonra yerel sunucuyu başlat ve tarayıcıda kontrol et. Hero adımlarına gitmek için sayfa kaydırması kullan: `scrollTo(0, (hero.offsetHeight - stage.offsetHeight) * k / 6)`, k 0–6 arası. `window.__setT(v)` de var, ama kaydırma olayı onu ezebilir. Konsolda hata olmadığını kontrol et.
