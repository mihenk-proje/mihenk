// MİHENK Doğrulama Kütüphanesi
// Tüm fonksiyonlar saf (pure) ve tarayıcıda çalışabilir şekilde tasarlanmıştır.

/**
 * Metni Türkçeye özgü kurallarla normalize eder (küçük harf, noktalama temizliği, boşluk kırpma).
 */
export function normalizeTurkce(metin: string): string {
  // Türkçeye özgü küçük harfe çevirme
  let norm = metin.toLocaleLowerCase('tr-TR')
  // Noktalama işaretlerini ve özel karakterleri boşlukla değiştir
  norm = norm.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
  // Ardışık boşlukları teke indir ve baştaki/sondaki boşlukları kırp
  norm = norm.replace(/\s{2,}/g, ' ').trim()
  return norm
}

/**
 * Normalize edilmiş metni belirtilen uzunlukta (n) kayan parçalara (n-gram) ayırır.
 * Karakter tabanlı n-gram (default n=5) mikroblog gönderileri için kelime tabanlıdan daha etkilidir.
 */
export function parcalaraAyir(metin: string, n = 5): Set<string> {
  const norm = normalizeTurkce(metin)
  // Boşlukları tamamen kaldırıp saf karakter dizisi üzerinden n-gram çıkar (daha sıkı kontrol)
  const bitisik = norm.replace(/\s+/g, '')
  const parcalar = new Set<string>()
  
  if (bitisik.length < n) {
    parcalar.add(bitisik)
    return parcalar
  }

  for (let i = 0; i <= bitisik.length - n; i++) {
    parcalar.add(bitisik.substring(i, i + n))
  }
  return parcalar
}

/**
 * İki parça kümesi arasındaki Jaccard benzerliğini hesaplar (Kesişim / Birleşim).
 * Sonuç 0 ile 1 arasındadır.
 */
export function jaccardBenzerligi(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  if (a.size === 0 || b.size === 0) return 0

  const kesisim = new Set([...a].filter(x => b.has(x)))
  const birlesim = new Set([...a, ...b])

  return kesisim.size / birlesim.size
}

/**
 * Metnin niteliğini ölçer (uzunluk, kelime çeşitliliği, spam tekrarı vb.).
 */
export function olcMetinNiteligi(metin: string) {
  const norm = normalizeTurkce(metin)
  const kelimeler = norm.split(' ').filter(k => k.length > 0)
  
  // 1. Uzunluk kontrolü
  const karakterSayisi = metin.length
  const kelimeSayisi = kelimeler.length
  
  // 2. Tip-token oranı (kelime çeşitliliği)
  const benzersizKelimeler = new Set(kelimeler)
  const tipTokenOrani = kelimeSayisi > 0 ? benzersizKelimeler.size / kelimeSayisi : 0
  
  // 3. Ardışık tekrar kontrolü (Örn: "çooook", "spam spam spam")
  const ardisikKarakterTekrari = (metin.match(/(.)\1{4,}/g) || []).length > 0
  let ardisikKelimeTekrari = false
  for (let i = 0; i < kelimeler.length - 2; i++) {
    if (kelimeler[i] === kelimeler[i+1] && kelimeler[i] === kelimeler[i+2]) {
      ardisikKelimeTekrari = true
      break
    }
  }

  // 4. İçerik dışı oran (emoji, link, hashtag)
  const emojiSayisi = (metin.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) || []).length
  const linkSayisi = (metin.match(/https?:\/\/[^\s]+/g) || []).length
  
  // Sadece emoji ve linkten oluşma durumu
  const yalnizcaIcerikDisi = kelimeSayisi === 0 && (emojiSayisi > 0 || linkSayisi > 0)

  // 5. Büyük harf oranı
  const harfler = metin.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '')
  const buyukHarfler = harfler.replace(/[^A-ZĞÜŞİÖÇ]/g, '')
  const buyukHarfOrani = harfler.length > 0 ? buyukHarfler.length / harfler.length : 0

  // Skor hesaplama (0-100)
  let skor = 100
  const gerekce: string[] = []

  if (karakterSayisi < 15) {
    skor -= 40
    gerekce.push('Uzunluk: Yetersiz (Çok kısa)')
  } else if (karakterSayisi < 30) {
    skor -= 15
    gerekce.push('Uzunluk: Sınırda')
  }

  if (kelimeSayisi > 5 && tipTokenOrani < 0.4) {
    skor -= 30
    gerekce.push('Kelime Çeşitliliği: Düşük (Tekrarlı anlatım)')
  }

  if (ardisikKarakterTekrari || ardisikKelimeTekrari) {
    skor -= 50
    gerekce.push('İçerik Niteliği Düşük: Anlamsız tekrar tespit edildi')
  }

  if (yalnizcaIcerikDisi) {
    skor -= 80
    gerekce.push('İçerik Niteliği Düşük: Sadece emoji veya bağlantı içeriyor')
  }

  if (harfler.length > 10 && buyukHarfOrani > 0.8) {
    skor -= 20
    gerekce.push('Yazım: Tamamı büyük harf')
  }

  // Taban ve tavan sınırları
  skor = Math.max(0, Math.min(100, skor))
  
  if (skor >= 80 && gerekce.length === 0) {
    gerekce.push('Anlatım Zenginliği: Yeterli')
  }

  return { skor, gerekce }
}

/**
 * Görselden algısal hash (dHash) hesaplar.
 */
export async function hesaplaDHash(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // 9x8 boyutlarına küçült
      canvas.width = 9
      canvas.height = 8
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve('')

      ctx.drawImage(img, 0, 0, 9, 8)
      const imageData = ctx.getImageData(0, 0, 9, 8)
      const data = imageData.data

      // Gri tonlamaya çevir (Luminance formülü)
      const gray = new Uint8Array(9 * 8)
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      }

      // Her satırda yanyana pikselleri karşılaştır (8 piksel x 8 satır = 64 bit)
      let hashStr = ''
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const left = gray[y * 9 + x]
          const right = gray[y * 9 + x + 1]
          hashStr += left > right ? '1' : '0'
        }
      }
      
      // Binary'i Hexadecimal'e çevir
      let hexHash = ''
      for (let i = 0; i < hashStr.length; i += 4) {
        hexHash += parseInt(hashStr.substring(i, i + 4), 2).toString(16)
      }
      
      resolve(hexHash)
    }
    img.onerror = () => resolve('') // Hata durumunda boş dön
    img.src = imageUrl
  })
}

/**
 * İki dHash dizgesi (hex formatında) arasındaki Hamming mesafesini hesaplar.
 */
export function hammingMesafesi(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 64
  
  let mesafe = 0
  for (let i = 0; i < hash1.length; i++) {
    const b1 = parseInt(hash1[i], 16).toString(2).padStart(4, '0')
    const b2 = parseInt(hash2[i], 16).toString(2).padStart(4, '0')
    for (let j = 0; j < 4; j++) {
      if (b1[j] !== b2[j]) mesafe++
    }
  }
  return mesafe
}

/**
 * Görselin çaba ve kalite seviyesini ölçer (Entropi, Bulanıklık, Renk çeşitliliği).
 */
export async function olcDusukCaba(imageUrl: string) {
  return new Promise<{skor: number, gerekce: string[]}>((resolve) => {
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // İşlemi hızlandırmak için küçültülmüş boyutta çalış (50x50)
      canvas.width = 50
      canvas.height = 50
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve({ skor: 100, gerekce: [] })

      ctx.drawImage(img, 0, 0, 50, 50)
      const imageData = ctx.getImageData(0, 0, 50, 50)
      const data = imageData.data
      
      // 1. Entropi hesaplama (Gri tonlama üzerinden)
      const histogram = new Array(256).fill(0)
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
        histogram[gray]++
      }
      
      let entropy = 0
      const totalPixels = 50 * 50
      for (let i = 0; i < 256; i++) {
        if (histogram[i] > 0) {
          const p = histogram[i] / totalPixels
          entropy -= p * Math.log2(p)
        }
      }

      // 2. Baskın renk oranı
      const maxCount = Math.max(...histogram)
      const maxColorRatio = maxCount / totalPixels

      let skor = 100
      const gerekce: string[] = []

      // Düşük entropi (tek renk, boş veya çok basit görsel)
      if (entropy < 4.0) {
        skor -= 50
        gerekce.push('Görsel Çaba: Düşük (Çok basit görsel/doku)')
      }

      if (maxColorRatio > 0.85) {
        skor -= 40
        gerekce.push('Görsel Çaba: Tek renk ağırlıklı')
      }

      if (skor >= 80) {
        gerekce.push('Görsel Kalite: İyi')
      }

      resolve({ skor: Math.max(0, skor), gerekce })
    }
    img.onerror = () => resolve({ skor: 100, gerekce: [] })
    img.src = imageUrl
  })
}

// Ölçeklenebilirlik: Üretimde tüm kümelerle karşılaştırma yerine MinHash + LSH kullanılacaktır.
const PROTOTIP_KOPYA_ESIGI = 0.70

/**
 * Ana doğrulama orkestrasyon fonksiyonu.
 * Gönderinin türüne göre ilgili kademeleri çalıştırır ve nihai skoru hesaplar.
 */
export async function dogrula(gonderi: any, gecmisGonderiler: any[], hesapYasGun: number = 30) {
  const gerekce: string[] = []
  let nihaiSkor = 0
  let dogrulamaDurumu: 'gecti' | 'kismi' | 'gecemedi' = 'gecti'
  
  const startTotal = performance.now()
  let metinParcalari: string[] | null = null
  let gorselHash: string | null = null

  // KADEME 1: Metin Özgünlüğü
  const startMetinOzg = performance.now()
  let kopyaBulundu = false
  let metinOzgSkoru = 100

  if (gonderi.metin) {
    const parcalar = parcalaraAyir(gonderi.metin)
    metinParcalari = Array.from(parcalar)
    
    // Geçmişle karşılaştır
    for (const eski of gecmisGonderiler) {
      if (!eski.metinParcalari || eski.id === gonderi.id) continue
      
      const benzerlik = jaccardBenzerligi(parcalar, new Set(eski.metinParcalari))
      if (benzerlik >= PROTOTIP_KOPYA_ESIGI) {
        kopyaBulundu = true
        gerekce.push('Bu metin daha önce paylaşılmış bir gönderiyle büyük ölçüde örtüşüyor.')
        break
      }
    }
  }
  console.log(`[MİHENK] Kademe 1 (metin özgünlük): ${(performance.now() - startMetinOzg).toFixed(2)}ms`)

  if (kopyaBulundu) {
    return { skor: 0, durumu: 'gecemedi', gerekce, metinParcalari, gorselHash }
  }

  // KADEME 1b: Metin Niteliği
  const startMetinNitelik = performance.now()
  let metinNitelikSkoru = 100
  if (gonderi.metin) {
    const { skor, gerekce: mg } = olcMetinNiteligi(gonderi.metin)
    metinNitelikSkoru = skor
    gerekce.push(...mg)
  }
  console.log(`[MİHENK] Kademe 1b (metin nitelik): ${(performance.now() - startMetinNitelik).toFixed(2)}ms`)

  // KADEME 2: Görsel Kontroller
  let gorselOzgSkoru = 100
  let gorselCabaSkoru = 100
  if (gonderi.gorselUrl) {
    const startGorsel = performance.now()
    
    // Görsel kopya kontrolü
    gorselHash = await hesaplaDHash(gonderi.gorselUrl)
    let gorselKopyaBulundu = false
    
    for (const eski of gecmisGonderiler) {
      if (!eski.gorselHash || eski.id === gonderi.id) continue
      const mesafe = hammingMesafesi(gorselHash, eski.gorselHash)
      if (mesafe <= 10) {
        gorselKopyaBulundu = true
        gerekce.push('Bu görsel daha önce platformda kullanılmış.')
        break
      }
    }

    if (gorselKopyaBulundu) {
      console.log(`[MİHENK] Kademe 2 (görsel): ${(performance.now() - startGorsel).toFixed(2)}ms`)
      return { skor: 0, durumu: 'gecemedi', gerekce, metinParcalari, gorselHash }
    }

    // Görsel çaba kontrolü
    const caba = await olcDusukCaba(gonderi.gorselUrl)
    gorselCabaSkoru = caba.skor
    gerekce.push(...caba.gerekce)
    
    console.log(`[MİHENK] Kademe 2 (görsel): ${(performance.now() - startGorsel).toFixed(2)}ms`)
  }

  // KADEME 3: Hesap Davranışı (Kazanım katsayısı)
  let katsayi = 1.0
  if (hesapYasGun < 3) {
    katsayi = 0.5
    gerekce.push('Hesap Yaşı: Yeni hesap koruması devrede')
  }

  // SKOR BİRLEŞTİRME
  if (gonderi.tur === 'metin') {
    nihaiSkor = (metinOzgSkoru * 0.55) + (metinNitelikSkoru * 0.45)
  } else if (gonderi.tur === 'metinGorsel') {
    nihaiSkor = (metinOzgSkoru * 0.35) + (metinNitelikSkoru * 0.25) + (gorselOzgSkoru * 0.25) + (gorselCabaSkoru * 0.15)
  } else if (gonderi.tur === 'anket') {
    // Ankette seçenek çeşitliliğini basitçe simüle ediyoruz, varsayılan olarak iyi kabul ediyoruz
    nihaiSkor = (metinOzgSkoru * 0.50) + (metinNitelikSkoru * 0.30) + (100 * 0.20) 
  }

  nihaiSkor = Math.round(nihaiSkor * katsayi)

  if (nihaiSkor >= 60) dogrulamaDurumu = 'gecti'
  else if (nihaiSkor >= 40) dogrulamaDurumu = 'kismi'
  else dogrulamaDurumu = 'gecemedi'

  if (dogrulamaDurumu === 'gecti') {
    gerekce.unshift('Özgünlük: Bu içeriğe daha önce rastlanmadı')
  }

  console.log(`[MİHENK] Toplam: ${(performance.now() - startTotal).toFixed(2)}ms`)

  return {
    skor: nihaiSkor,
    durumu: dogrulamaDurumu,
    gerekce,
    metinParcalari,
    gorselHash
  }
}
