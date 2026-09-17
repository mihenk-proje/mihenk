# Katkı Rehberi

Bu depo TEKNOFEST NSosyal İnovasyon Yarışması'na sunulan MİHENK prototipini
barındırır. Değerlendirme **kör** yürütülmektedir; aşağıdaki kimlik kuralı
bunun içindir ve isteğe bağlı değildir.

## 1. Kimlik — ilk iş bu

Depoda hiçbir yerde kişi adı, kişisel e-posta, okul veya danışman adı
bulunmaz; **commit yazar bilgisi dâhil**. Depoya katkı vermeden önce bir kez:

```bash
git config user.name "mihenk-proje"
git config user.email "mihenk-proje@users.noreply.github.com"
```

`--global` kullanmayın; ayar yalnızca bu depo için geçerli olsun. GitHub'ın
"Co-authored-by" satırlarını da eklemeyin — bunlar gerçek adları taşır.

Kontrol:

```bash
git log --format='%an <%ae>' | sort -u   # tek satır dönmeli
```

## 2. Dal modeli

`main` her zaman dağıtılabilir durumdadır; Vercel doğrudan buradan yayınlar.
Doğrudan `main`'e commit atılmaz.

| Önek | Kullanım |
|---|---|
| `arayuz/` | Arayüz ve tasarım |
| `dogrulama/` | Doğrulama motoru ve eşikler |
| `olcum/` | Veri kümesi ve ölçüm boru hattı |
| `altyapi/` | CI, yapılandırma, sürüm |
| `belge/` | Yalnızca dokümantasyon |

Akış: dal aç → çalış → PR aç → CI yeşile dönsün → birleştir.

## 3. Commit mesajları

[Conventional Commits](https://www.conventionalcommits.org/) kullanılır:

```
feat(store): urun onizleme penceresine kalan sure bilgisi eklendi
fix(verification): kopya gerekcesi gerekce listesinin basina alindi
test(a11y): klavyeyle uctan uca gezinme denetimi eklendi
```

Tür: `feat` · `fix` · `docs` · `test` · `refactor` · `chore` · `a11y`.
Konu satırı Türkçe, ne yapıldığını söyler. Gövdede *neden* yapıldığını ve
varsa ölçülen değeri yazın — bu depodaki commit gövdeleri ölçüm kaydı işlevi
de görüyor.

Tek seferlik toplu yükleme yapılmaz; her mantıksal değişiklik ayrı commit.

## 4. Kalite kapıları

CI her PR'da şunları çalıştırır ve hepsi geçmeden birleştirilmez:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # 76 birim testi
npm run build       # üretim derlemesi
```

Yerelde de aynısını çalıştırın. **Node 22+ zorunludur** (`.nvmrc`): test
paketi TypeScript kaynağını yerel tip soymayla doğrudan çalıştırır.

### Tarayıcı denetimleri

Ağır bağımlılık taşıdıkları için `npm test` dışındadırlar. Arayüze dokunan
her PR'da elle çalıştırılır:

```bash
npm i --no-save puppeteer-core
npm run build && npx next start -p 3100 &
node test/tarayici/klavye.mjs     # klavyeyle uçtan uca gezinme, 26 kontrol
node test/tarayici/hareket.mjs    # prefers-reduced-motion, 8 kontrol
```

> `test/tarayici/klavye.mjs` odaklanabilir öğe sayısına duyarlıdır. Arayüze
> yeni düğme eklerseniz bu denetimi mutlaka çalıştırın.

## 5. Erişilebilirlik — gerilemez

Altı ekran, iki tema, Lighthouse **100/100/100/100**. Bir PR bu skoru
düşürüyorsa birleştirilmez. Yeni renk eklerken kontrast ölçülür (normal
metin ≥ 4,5 · büyük metin ve grafik sınırları ≥ 3).

## 6. Veri bütünlüğü

- Betikle üretilen her kayıt `source: sentetik` olarak işaretlenir; sunumda
  sentetik oran beyan edilir.
- Hiçbir platformdan içerik kazınmaz; depoda kazıma betiği bulunmaz.
- Eşik taraması yalnızca `gelistirme` + `dogrulama` bölünmelerini okur.
  `test` bölünmesi yalnızca `evaluate.py` tarafından, bir kez okunur.
- Ölçüm sonucu rapordaki değerden farklı çıkarsa **ölçülen değer uygulanır**,
  rapora geri uydurulmaz; fark CHANGELOG'a gerekçesiyle yazılır.

Ayrıntı: [`splits/README.md`](splits/README.md) · [`data/README.md`](data/README.md)
