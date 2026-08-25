#!/usr/bin/env python3
"""UCI Turkish User Review Dataset'ten etiketleme havuzu oluşturur.

Kaynak: https://archive.ics.uci.edu/dataset/769/turkish+user+review+dataset
Lisans: CC BY 4.0

Metin ÜRETMEZ, yalnızca kaynaktaki ham metni seçer ve şemaya sokar.

KAYNAK ETİKETİ ALINMAZ. Kaynağın kendi sınıflandırması (varsa) bu görevle
ilgisizdir ve etiketleyiciyi yanıltır; yalnızca ham metin alınır.

KATMANLI ÖRNEKLEME. Havuz uzunluk ve benzersiz kelime oranının birleşik
sırasına göre iki katmana ayrılır (kısa/tekrarlı ve uzun/zengin) ve
ikisinden eşit sayıda çekilir. Bu ÖN-ETİKETLEME DEĞİLDİR: havuzun tek
uçta yığılmasını engeller, nihai kararı etiketleyici verir.

DUYGU DENGESİ UYGULANAMIYOR. Kaynak bir duygu analizi çalışmasından geliyor
ve duygu ile uzunluk korelasyonlu olabilir (olumsuz yorumlar kısa olma
eğiliminde); bu durumda kısa katman olumsuz yorumlarla dolar ve
etiketleyiciler düşük çaba yerine olumsuzluğu etiketlemeye başlayabilir.
Ancak indirilen dosya düz metindir ve duygu etiketi sütunu içermez, bu
yüzden duyguya göre dengeleme yapılamamaktadır. Yerine ürün kategorisine
göre dengeleme uygulanır: her katman sekiz kategoriden eşit çeker, böylece
kısa katmanın tek bir ürün tipiyle dolması engellenir. Bu tam bir çözüm
değildir; sınır sunumda beyan edilir ve pilot sonrası uyuşmazlıkların
olumsuz yorumlarda kümelenip kümelenmediği kontrol edilir.

Örnek:
    python3 scripts/collect_texts.py --girdi dataset.txt --count 2500 \\
        --seed 42 --out data/metin/nitelik_havuzu.jsonl
    python3 scripts/collect_texts.py --girdi dataset.txt --pilot 100 \\
        --seed 42 --out data/metin/pilot_havuzu.jsonl
"""
from __future__ import annotations

import argparse
import json
import random
import re
import unicodedata
from collections import defaultdict
from datetime import date
from pathlib import Path

KAYNAK_ADI = 'UCI Turkish User Review Dataset'
KAYNAK_URL = 'https://archive.ics.uci.edu/dataset/769/turkish+user+review+dataset'

BASLIK_DESENI = re.compile(r'^[A-ZÇĞİÖŞÜ\s]+-{3,}\s*$')
# Aşırı uçlar elenir: 3 karakterin altı anlamsız, 800 üstü mikroblog ölçeğinin dışında
EN_AZ_KARAKTER = 3
EN_COK_KARAKTER = 800

# Pilot için sınır durum bandı: nitelik/düşük çaba ayrımının fiilen
# tartışmalı olduğu uzunluk aralığı. Bu bandın altı apaçık düşük çaba,
# üstü apaçık nitelikli olma eğiliminde ve pilotu kolaylaştırır.
PILOT_EN_AZ = 25
PILOT_EN_COK = 150


def turkce_orani(metin: str) -> float:
    """Latin harf oranı — Türkçe olmayan/bozuk kayıtları elemek için kaba ölçü."""
    harfler = [c for c in metin if c.isalpha()]
    if not harfler:
        return 0.0
    latin = sum(1 for c in harfler if 'LATIN' in unicodedata.name(c, ''))
    return latin / len(harfler)


def olcu(metin: str) -> dict:
    kelimeler = metin.lower().split()
    return {
        'karakter': len(metin),
        'kelime': len(kelimeler),
        'ttr': len(set(kelimeler)) / len(kelimeler) if kelimeler else 0.0,
    }


def oku(yol: Path) -> list[dict]:
    """Kategori başlıklarını izleyerek yorumları okur."""
    kayitlar, kategori = [], 'bilinmiyor'
    for satir in yol.read_text(encoding='utf-8', errors='replace').splitlines():
        s = satir.strip()
        if not s:
            continue
        if BASLIK_DESENI.match(s):
            kategori = s.rstrip('-').strip().lower()
            continue
        if not (EN_AZ_KARAKTER <= len(s) <= EN_COK_KARAKTER):
            continue
        if turkce_orani(s) < 0.9:
            continue
        kayitlar.append({'text': s, 'kategori': kategori, **olcu(s)})
    return kayitlar


def katmanla(kayitlar: list[dict]) -> tuple[list[dict], list[dict]]:
    """Uzunluk ve TTR sıralarının ortalamasına göre iki katman."""
    n = len(kayitlar)
    uz_sira = {id(k): i for i, k in enumerate(sorted(kayitlar, key=lambda x: x['karakter']))}
    ttr_sira = {id(k): i for i, k in enumerate(sorted(kayitlar, key=lambda x: x['ttr']))}
    for k in kayitlar:
        k['_bilesik'] = (uz_sira[id(k)] + ttr_sira[id(k)]) / (2 * n)

    sirali = sorted(kayitlar, key=lambda x: x['_bilesik'])
    orta = len(sirali) // 2
    return sirali[:orta], sirali[orta:]


def kategori_dengeli_cek(katman: list[dict], adet: int, rnd: random.Random) -> list[dict]:
    """Katmandan, ürün kategorilerine olabildiğince eşit dağılarak çeker."""
    kovalar = defaultdict(list)
    for k in katman:
        kovalar[k['kategori']].append(k)
    for kova in kovalar.values():
        rnd.shuffle(kova)

    secilen, kategoriler = [], sorted(kovalar)
    while len(secilen) < adet and any(kovalar[c] for c in kategoriler):
        for c in kategoriler:
            if len(secilen) >= adet:
                break
            if kovalar[c]:
                secilen.append(kovalar[c].pop())
    return secilen


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--girdi', type=Path, required=True, help='UCI dataset.txt yolu')
    ap.add_argument('--out', type=Path, required=True, help='Çıktı JSONL')
    ap.add_argument('--count', type=int, default=2500, help='Toplanacak kayıt (varsayılan: 2500)')
    ap.add_argument('--pilot', type=int,
                    help='Pilot kipi: sınır durumları yoğunlaştırılmış N kayıt seçer')
    ap.add_argument('--seed', type=int, default=42, help='Rastgelelik tohumu')
    ap.add_argument('--onek', default='m', help='Kimlik öneki')
    a = ap.parse_args()

    rnd = random.Random(a.seed)
    kayitlar = oku(a.girdi)
    print(f'kaynaktan okunan geçerli yorum: {len(kayitlar)}')

    kisa, uzun = katmanla(kayitlar)
    print(f'  kısa/tekrarlı katman : {len(kisa)}')
    print(f'  uzun/zengin katman   : {len(uzun)}')

    if a.pilot:
        # SINIR DURUM YOĞUNLAŞTIRMASI.
        # Kolay örneklerle yapılan pilot yanıltıcı yüksek kappa verir ve
        # kılavuzdaki boşlukları göstermez. Zor bölge, nitelik/düşük çaba
        # ayrımının fiilen tartışmalı olduğu yerdir: orta uzunlukta
        # (çok kısa değil ki apaçık düşük çaba olsun, çok uzun değil ki
        # apaçık nitelikli olsun) ve tekrar oranı ortada olan metinler.
        #
        # Ayrım, modelin düşük çaba skoruna göre değil, ham dil
        # özelliklerine göre yapılır; pilotu modelin kendi çıktısına
        # dayandırmak ölçümü modele bağlar.
        aday = [k for k in kayitlar if PILOT_EN_AZ <= k['karakter'] <= PILOT_EN_COK]
        if aday:
            ttrler = sorted(k['ttr'] for k in aday)
            alt = ttrler[len(ttrler) // 3]
            ust = ttrler[2 * len(ttrler) // 3]
            orta_ttr = [k for k in aday if alt <= k['ttr'] <= ust]
            if len(orta_ttr) >= a.pilot:
                aday = orta_ttr
        secilen = kategori_dengeli_cek(aday, a.pilot, rnd)
        print(f'\nPİLOT: {PILOT_EN_AZ}-{PILOT_EN_COK} karakter bandındaki '
              f'{len(aday)} adaydan {len(secilen)} kayıt')
        print('  sınır durumlar yoğunlaştırıldı: orta uzunluk + orta tekrar oranı')
        print('  (kolay örneklerle yapılan pilot kappa\'yı yanıltıcı yükseltir)')
    else:
        yari = a.count // 2
        secilen = kategori_dengeli_cek(kisa, yari, rnd) + kategori_dengeli_cek(uzun, a.count - yari, rnd)
        print(f'\nkatman başına çekilen: {yari} / {a.count - yari}')

    rnd.shuffle(secilen)

    bugun = date.today().isoformat()
    a.out.parent.mkdir(parents=True, exist_ok=True)
    with a.out.open('w', encoding='utf-8') as f:
        for i, k in enumerate(secilen, 1):
            f.write(json.dumps({
                'id': f'{a.onek}-{i:05d}',
                'text': k['text'],
                'label': None,
                'source': 'kamuya_acik_kaynak',
                'source_name': KAYNAK_ADI,
                'source_url': KAYNAK_URL,
                'source_license': 'CC BY 4.0',
                'collected_at': bugun,
                'labeler_1': None, 'labeler_2': None, 'labeler_3': None,
                'final_label': None,
                'split': None,
                'notes': '',
            }, ensure_ascii=False) + '\n')

    dagilim = defaultdict(int)
    for k in secilen:
        dagilim[k['kategori']] += 1
    uzunluklar = sorted(k['karakter'] for k in secilen)

    print(f'\n{len(secilen)} kayıt -> {a.out}')
    print(f'  uzunluk: ortanca {uzunluklar[len(uzunluklar)//2]}  '
          f'en az {uzunluklar[0]}  en çok {uzunluklar[-1]}')
    print(f'  < 40 karakter: {sum(1 for u in uzunluklar if u < 40)} '
          f'({sum(1 for u in uzunluklar if u < 40)/len(uzunluklar):.1%})')
    print('  kategori dağılımı:')
    for c, n in sorted(dagilim.items(), key=lambda x: -x[1]):
        print(f'    {c:20} {n}')
    print('\n  NOT: kaynak etiketi alınmadı, kayıtlarda duygu bilgisi yok.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
