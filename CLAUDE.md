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
- **Ev kartı:** sol alttaki yarı saydam kart, "Ev 01 / 04" sayacı içinde (`.hcard`).
- **Kaydırma ipucu:** alt ortadaki "Kaydırarak devam edin" (`.hscroll`).
- **Ev modeli:** 3B daire (`canvas#c`).
- **Ev yazıları:** alttaki değişen büyük cümleler (`.caps`).
- **Ev noktaları:** sağdaki 4 nokta (`.dots`).
- **Çevirme ipucu:** "Evi çevirmek için sürükleyin" yazısı (`.hhint`).
- **Ev adımları** (kaydırma sırası, `KF` dizisi, 25 Kasım 2026'dan beri 4 adım): Ev 1 Boş ev, Ev 2 Plan (oda adları), Ev 3 Bütün odalar birlikte döşeniyor, Ev 4 Bitmiş ev (akşam ışığı). Eskiden 7 adımdı ve kamera odaları tek tek geziyordu; kullanıcı "çok uzun, tek bir anda birden fazla odayı oluştur" dedi.
- **Odalar:** Yatak odası, Çalışma odası, Salon, Balkon, Banyo, Mutfak, Antre (koridor) ve Hol (salon kapısının önü).
- **Tasarlayalım butonu:** Ev 4'teki "Evinizi birlikte tasarlayalım" butonu (`.cta`).

**2. Süreç Bölümü** (`#surec`, `js/process.js`): oryzo.ai'deki "So portable, it's wearable" carousel'inden uyarlandı (24 Kasım 2026).
- **Tek sahne (Ev → Süreç geçişi):** Kullanıcı sitenin ORYZO gibi tek sahne hissi vermesini istedi; bölümler arasında normal sayfa kayması görünmemeli.
  - `#hero` 755svh (390svh Ev adımları + 365); hero.js `tot`'u buna göre hesaplar (`stage.offsetHeight * 3.65` = 340svh bindirme + 25svh bekleme).
  - Son Ev adımı (Ev 4) tamamlandıktan sonra, Süreç geçişi başlamadan önce 25svh (~2 fare kaydırması) bekleme payı var. Geçmişi (25 Kasım 2026): eskiden bekleme yoktu ve tek kaydırmada Süreç'e iniliyordu; önce 40svh yapıldı, kullanıcı uzun buldu ve "çok da kısa olmasın" dedi, 25svh'ye indirildi. Değiştirmek için CSS'teki 755'i ve hero.js'teki 3,65'i birlikte değiştir (her 10svh = 0,1).
  - Genel bakış kadrajları aynı gün ~%15 genişletildi. Geniş ekranda model hafifçe aşağıda duruyor (`setViewOffset` −0,04); eskiden üst köşe dev logonun altında kalıyordu.
  - `#surec` 640svh, `margin-top:-340svh` ve `z-index:3` ile evin üstüne biner.
  - İlk 240svh geçiştir (`applyK`, k 0→1; `TR` = ekranın 2,4 katı, hero.js `transK` de 2,4 kullanır). 110svh ve 160svh denendi; kullanıcı ikisini de "sert, bir anda geçiyor" diye buldu (25 Kasım 2026). Değiştirmek için hepsini birlikte değiştir: process.js `TR`, hero.js `transK` çarpanı, `#surec` yüksekliği ve margin'i, `#hero` yüksekliği ve hero.js `tot` çarpanı.
  - 25 Kasım 2026'dan beri çerçeve **evin planından doğuyor** (kullanıcının fikri):
    - k 0–.26: hero.js evi yumuşakça döndürüp tam tepeye çıkarır (yaw 90, pitch 89,6; smootherstep). k .14–.32 arasında lens daralır ve kamera uzaklaşır (dolly zoom, `FOV` 28 → `FOV_TOP` 8); böylece tepeden görüntü düz bir plan çizimi gibi olur. Kullanıcı sırayı böyle istedi: "önce yumuşakça dönsün, yukarıdan dikdörtgen olsun, sonra kaysın". Plan, uzun kenarı dikey olarak ekranın ortasında büyük görünür; Ev yazısı, Ev kartı ve noktalar çekilir (`--hk`).
    - k .26–.42: kesikli çerçeve evin dış hattına **tam yapışık** belirir (krem çizgi), dışı bordoya kararır. Kararma, Ev Bölümü zemininin üstüne bordo bir katmanla yapılır (`.stage` arka planında `--sk`); eskiden dev bir `box-shadow`'du ve her karede yeniden çizildiği için site kasıyordu. Çerçeve doğarken planın oranını alır (`--fsx/--fsy`), aradaki yeşil şerit bu yüzden görünmez. Kullanıcı yeşil şeridi istemedi.
    - k .40–.52: çerçevenin içinde Ön Görüşme **bulanık** belirir ve evi örter. Kullanıcı: "küçülürken ev görünmesin". Boş krem kartla inmesi de denendi; kullanıcı "1. adımın net olmayan hâliyle insin" dedi.
    - k .50–.84: çerçeve küçülür, 3:4 orana döner ve asıl yerine kayar; sahne .60–.92 arasında netleşir (`--bl` 16px → 0).
    - k .84–1: krem Süreç zemini (çizgi bordoya döner), en son başlık, Adım şeridi ve Süreç kartı gelir.
    - Akıcılık: process.js geçiş değerini kaydırmaya doğrudan bağlamaz. `kS`, her karede `kTarget`'ı (gerçek kaydırma) yumuşakça izler; böylece fare tekerleğinin adımları zıplama yapmaz. `kS` `AKBAS.kT` olarak yayınlanır ve hero.js kamerayı buna göre kurar. Ev, bulanık sahnenin altında kaldıktan sonra (k > .56) evin tuvali gizlenir ve hiç çizilmez. Çerçeve ölçüleri yalnızca ekran boyutu değişince okunur. Ölçüm (masaüstü, 25 Kasım 2026): ortalama kare 6 ms, en uzun 11 ms, takılan kare yok.
    - Bağlantı: process.js her adımda çerçevenin dış dikdörtgenini `AKBAS.frame` olarak yayınlar (`cx, cy, w, h`, ekran pikseli). hero.js `fitTop()` evin üstten görünen hattını (taban köşeleri, duvar tepeleri) ekrana izdüşürüp kamerayı planı tam bu dikdörtgene oturtacak şekilde ayarlar ve hattın oranını `AKBAS.planAspect` olarak geri yayınlar.
  - Geçişin ortasında kaydırma bırakılırsa yöne göre ilk adıma ya da Ev 4'e oturur. Bu otomatik kaydırmayı tarayıcının hızlı `smooth`'u değil, process.js `softScroll` yapar: smootherstep eğrisi, mesafeye göre 1,2–3,2 sn (tam geçiş ≈2,7 sn; 1,4 sn kullanıcıya hızlı geldi). Tekerlek, dokunma, tuş ya da tıklama gelirse hemen durur.
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
  - **Renkler (25 Kasım 2026'da değişti):** ORYZO'nun koyu renkleri bırakıldı; kullanıcı arka planı fazla karanlık buldu. Yerine kurumsal renkler geldi. **Kural: arayüzde bu renkler dışında renk yok.** Türetilmiş ton, renk geçişi (gradient) ya da renkli gölge eklenmez; yalnızca aynı rengin saydamlığı (ızgara çizgileri, geçişteki kararma) kullanılabilir. Değişkenler `style.css` başında:
    - Bordo `#5A0E27` (Pantone 7421 C): yazılar (krem zeminde), Ev kartı, Süreç kartı, çerçeve, WhatsApp butonu.
    - Altın `#D39D3F` (Pantone 7563 C): küçük etiketler ("EV 01 / 04", adım numaraları), Tasarlayalım butonu, seçili Ev noktası, kesikli ayraçlar.
    - Krem `#F4EDE1` (4. renk, Claude önerdi, kullanıcı kabul etti): Süreç Bölümü zemini, bordo/yeşil üstündeki yazılar, Ev noktaları şeridi.
    - Yeşil `#1E3B2F`: Ev Bölümü zemini, üstünde soluk krem ızgara. Ev Bölümü'ndeki yazılar krem.
    - Mavi `#75B7E5` (Pantone 2915 C): kurumsal renk ama şu an arayüzde kullanılmıyor. Kullanıcı bunu biliyor; bir yere koymayı önerebilirsin.
  - Renk seçim süreci: dört palet denendi (bordo-adaçayı-krem; kırmızı-bej-yeşil; bordo-kum-krem-buz mavisi; bordo-mavi-altın + krem), dördüncüsü seçildi. Ev Bölümü zemini için mavi, altın ve kesim matı deseni (cetvel, açı çizgileri, şablonlar) denendi, hiçbiri beğenilmedi; tekrar önerme.
  - 3B sahnelerin içi (evdeki eşyalar, Süreç stüdyo fonları, figürler, ölçü etiketleri) hâlâ eski renklerde. Kullanıcıya bunları da 4 renge çevirmek soruldu, henüz karar vermedi.
  - Yazı tipi Outfit. ORYZO'nun gövde yazısı ücretli Halyard Display (Adobe Fonts). Logosu ise font değil, özel çizilmiş bir SVG.
  - Yan yana karşılaştırmada Outfit en yakın ücretsiz font çıktı.
  - Ağırlıklar: logo 700, büyük harfli başlık ve etiketler 600, gövde 400. Gövde metni normal harfli ve sola yaslı.
  - Kullanıcının Adobe Creative Cloud aboneliği olursa gerçek Halyard kullanılabilir.
  - Düzen oryzo.ai'den alındı: Ev Bölümü'nün zemini ızgaralı, ilk adımda dev logo, sağ üstte küçük menü, sol altta kart, altta "Kaydırarak devam edin", sağ kenarda krem dikey şerit içinde Ev noktaları.
  - Köşe yuvarlaklıkları: kart 12px, çerçeveli buton 22.5px, dolu buton 36px. Gölge yok.
  - Canvas UI efektleri denendi, hiçbiri beğenilmedi ve silindi; tekrar önerme. React Bits'teki tasarımları ise beğeniyor.
  - "Tek Ev" fikri denendi (25 Kasım 2026), beğenilmedi ve silindi; tekrar önerme. Fikir şuydu: ORYZO'daki bardak altlığı gibi, bütün sayfa boyunca arkada sabit duran tek bir ev; ev Süreç adımlarıyla birlikte kurulup dönüyor, kartlar önünden kayıyor. Kullanıcı mevcut site yapısıyla (Ev Bölümü, sonra Süreç Bölümü) devam etmek istiyor.
- `js/shared.js`: `window.AKBAS` altında iki sahnenin ortak yardımcıları: `M` (malzeme), `B` (yuvarlatılmış kutu), `BX`, `Cy`, `Sp`, `canvasTex`, `makeRnd`, `makeRenderer`, `clamp`, `e3`, `ss`.
- `js/hero.js`: ev modeli (okunur biçimde yazılmış).
- `js/process.js`: Süreç Bölümü (kaydırma, Adım şeridi ve altı stüdyo sahnesi). Okunur biçimde yazıldı.
- Three.js **r128**, cdnjs'den klasik `<script>` ile yükleniyor. ES module kullanılmıyor, böylece `index.html`'e çift tıklayınca (file://) da çalışıyor. Bu yapıyı bozma.
- `.claude/serve.ps1` ve `.claude/launch.json`: Node gerektirmeyen PowerShell yerel sunucusu, `http://localhost:5500`. Tarayıcı önizlemesi için "site" adlı yapılandırmayla başlatılıyor.

## Ev modeli (`js/hero.js`): mevcut durum

- **Dikdörtgen 2+1 daire, 15,0 × 11,6 m** (25 Kasım 2026'ya kadar L biçimliydi). Ölçüler metre cinsinden; x doğuya, z öne doğru artıyor. Kullanıcı planın dikdörtgen olmasını istedi, çünkü Süreç çerçevesi bu dikdörtgenden doğuyor (aşağıda). Bunun için salon öne doğru uzatıldı (kamerada "sola"); ev küçültülmedi.
  - Yatak odası 0–5.0 × 0–5.0 (25 m²)
  - Çalışma odası 5.0–8.4 × 0–3.8 (12,9 m²)
  - Salon 8.4–15.0 × 0–11.6 + okuma köşesi 6.6–8.4 × 7.4–11.6, balkon hariç (78,7 m²). Okuma köşesinde berjer, lambader, yan sehpa ve alçak kitaplık var; salonun ön duvarında konsol ve büyük bir bitki var.
  - Banyo 0–5.0 × 5.0–7.6 (13 m²)
  - Mutfak ve yemek alanı 0–5.0 × 7.6–11.6 (20 m²)
  - Koridor 5.0–6.6 × 3.8–11.6 (giriş kapısı z=11.6'da) ve hol 6.6–8.4 × 3.8–7.4
  - Balkon dikdörtgenin içinde, sağ ön köşede: 11.6–15.0 × 10.0–11.6 (5,4 m²). Dış iki yüzü cam korkuluklu, salondan kapıyla giriliyor (kapı x 12.6–13.6). Sabitleri `LW0`, `LZ0`; banyodaki `BZ0` ile karıştırma.
- **Bütün kapı boşlukları 1,0 m.**
- Arkadaki iki dış duvar (z=0 ve x=0) tam boy ve pencereli. Diğer bütün duvarlar mimari kesit gibi `LOW` (1,05 m) yüksekliğinde kesik, üstlerinde koyu bir kapak var. Bu kararın sebebi: kamera odaların içine bakabilsin, site ağırlaşmasın.
- Kaydırma 4 adım: boş ev → kuşbakışı plan (oda adları ve m² etiketleri) → bütün odalar birlikte döşeniyor → akşam ışığında bitmiş ev ve Tasarlayalım butonu. Kamera hep bütün evi gösteriyor; oda oda tur yok. Kamera pozları `KF` dizisinde (yaw ve pitch derece cinsinden, `rx`/`ry` kadraj yarı genişlikleri).
- Eşyalar `reg(nesne, başlangıç, bitiş, mod)` ile kayıtlı, kaydırma değerine göre sahneye giriyor (`drop`, `grow`, `pop`). Kodda zamanlar hâlâ eski oda turu birimleriyle yazılı (mutfak 1.2–2.2, salon 2.2–3.2, yatak 3.2–4.2, banyo/çalışma/antre 4.2–5.2). `FURNISH()` bunları Ev 3'e (t 1.1–2.15) sıkıştırır: her oda kendi sırasını korur, odalar .09 arayla başlar. Böylece ev tek seferde, hafif bir dalgayla dolar. Yeni eşya eklerken o odanın eski aralığında bir zaman vermek yeterli.
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
- Sitede henüz menü, iletişim, footer, portfolyo ya da SEO için HTML içerik yok.
- Depo herkese açık. Gizli bilgi (şifre, kişisel veri) ekleme.

## Doğrulama

Görsel değişikliklerden sonra yerel sunucuyu başlat ve tarayıcıda kontrol et. Hero adımlarına gitmek için sayfa kaydırması kullan: `scrollTo(0, (hero.offsetHeight - stage.offsetHeight) * k / 6)`, k 0–6 arası. `window.__setT(v)` de var, ama kaydırma olayı onu ezebilir. Konsolda hata olmadığını kontrol et.
