#!/usr/bin/env python3
"""Metin varyant üreteci — özgünlük test kümesi ve demo için.

Bir özgün metinden dört varyant üretir:
  birebir_kopya   metnin aynısı
  kismi_kopya     --ortusme oranınca cümle/sözcük korunur, gerisi değişir
  yeniden_yazim   eş anlamlı sözcükler ve sözcük sırası değişir
  kisaltma        metnin ilk bölümü alınır

Her varyant `parent_id` ve `variant_type` ile etiketlenir. Üretim
deterministiktir: aynı --seed aynı varyantları verir.

Örnek:
    python3 scripts/gen_text_variants.py --metin "Roket denemesi..." \\
        --tur kismi_kopya --ortusme 0.6 --seed 3
    python3 scripts/gen_text_variants.py --girdi data/metin/ozgun.jsonl \\
        --out data/metin/varyant.jsonl --seed 42
"""
from __future__ import annotations

import argparse
import json
import random
from datetime import datetime, timezone
from pathlib import Path

VARYANT_TURLERI = ('birebir_kopya', 'kismi_kopya', 'yeniden_yazim', 'kisaltma')

# Küçük Türkçe eş anlamlı tablosu. Yeniden yazım varyantı bunu kullanır;
# amaç doğal dil üretmek değil, sözcük düzeyinde örtüşmeyi düşürmektir.
ES_ANLAMLILAR = {
    'deneme': 'test', 'test': 'deneme',
    'sonuç': 'netice', 'netice': 'sonuç',
    'çalışma': 'uğraş', 'proje': 'çalışma',
    'başarılı': 'olumlu', 'olumlu': 'başarılı',
    'yüksek': 'fazla', 'fazla': 'yüksek',
    'düşük': 'az', 'az': 'düşük',
    'yeni': 'taze', 'ilk': 'birinci',
    'büyük': 'geniş', 'geniş': 'büyük',
    'hızlı': 'çabuk', 'çabuk': 'hızlı',
    'ölçüm': 'ölçme', 'veri': 'bilgi',
    'takım': 'ekip', 'ekip': 'takım',
    'sistem': 'düzenek', 'düzenek': 'sistem',
    'tasarım': 'kurgu', 'model': 'örnek',
    'sorun': 'problem', 'problem': 'sorun',
    'gelişim': 'ilerleme', 'ilerleme': 'gelişim',
}

DOLGU = [
    'Ayrıntıları önümüzdeki günlerde paylaşacağım.',
    'Bu konuda geri bildirim almak isterim.',
    'Süreci baştan gözden geçirmek gerekti.',
    'Beklediğimizden farklı bir tablo çıktı.',
    'Ölçümleri yeniden almayı planlıyoruz.',
    'Atölyede bir sonraki adımı konuşacağız.',
]


def birebir_kopya(metin: str, rnd: random.Random, ortusme: float) -> str:
    return metin


def kismi_kopya(metin: str, rnd: random.Random, ortusme: float) -> str:
    """Metnin --ortusme kadarını korur, kalanını dolgu cümlelerle değiştirir."""
    kelimeler = metin.split()
    korunacak = max(1, int(len(kelimeler) * ortusme))
    govde = ' '.join(kelimeler[:korunacak])
    ek = rnd.choice(DOLGU)
    return f'{govde} {ek}'


def yeniden_yazim(metin: str, rnd: random.Random, ortusme: float) -> str:
    """Eş anlamlı değişimi ve cümle içi sözcük sırası oynaması."""
    cikti = []
    for cumle in metin.split('. '):
        kelimeler = cumle.split()
        kelimeler = [
            ES_ANLAMLILAR.get(k.lower().strip('.,!?'), k) if rnd.random() < 0.55 else k
            for k in kelimeler
        ]
        # Bitişik iki sözcüğü yer değiştir
        if len(kelimeler) > 3:
            i = rnd.randrange(len(kelimeler) - 1)
            kelimeler[i], kelimeler[i + 1] = kelimeler[i + 1], kelimeler[i]
        cikti.append(' '.join(kelimeler))
    return '. '.join(cikti)


def kisaltma(metin: str, rnd: random.Random, ortusme: float) -> str:
    kelimeler = metin.split()
    n = max(3, int(len(kelimeler) * rnd.uniform(0.30, 0.55)))
    return ' '.join(kelimeler[:n]).rstrip('.,;') + '.'


URETICILER = {
    'birebir_kopya': birebir_kopya,
    'kismi_kopya': kismi_kopya,
    'yeniden_yazim': yeniden_yazim,
    'kisaltma': kisaltma,
}


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    kaynak = ap.add_mutually_exclusive_group(required=True)
    kaynak.add_argument('--metin', help='Tek özgün metin')
    kaynak.add_argument('--girdi', type=Path, help='Özgün kayıtların JSONL dosyası')
    ap.add_argument('--out', type=Path, help='Çıktı JSONL dosyası')
    ap.add_argument('--tur', choices=VARYANT_TURLERI, help='Yalnızca bu türü üret')
    ap.add_argument('--ortusme', type=float, default=0.6,
                    help='kismi_kopya için korunacak oran (varsayılan: 0.6)')
    ap.add_argument('--seed', type=int, default=1, help='Rastgelelik tohumu')
    a = ap.parse_args()

    if a.metin:
        ozgunler = [{'id': 'ozgun-1', 'text': a.metin}]
    else:
        ozgunler = [json.loads(s) for s in a.girdi.read_text(encoding='utf-8').splitlines() if s.strip()]

    turler = [a.tur] if a.tur else list(VARYANT_TURLERI)
    kayitlar = []

    for oi, kayit in enumerate(ozgunler):
        for ti, tur in enumerate(turler):
            tohum = a.seed + oi * 100 + ti
            rnd = random.Random(tohum)
            metin = URETICILER[tur](kayit['text'], rnd, a.ortusme)
            kayitlar.append({
                'id': f"{kayit['id']}--{tur}",
                'text': metin,
                'label': 'varyant',
                'source': 'sentetik',
                'parent_id': kayit['id'],
                'variant_type': tur,
                'seed': tohum,
                'collected_at': datetime.now(timezone.utc).date().isoformat(),
                'labeler_1': None, 'labeler_2': None, 'labeler_3': None,
                'final_label': 'varyant',
                'notes': f'{tur} varyantı' + (f' (örtüşme {a.ortusme})' if tur == 'kismi_kopya' else ''),
            })

    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        with a.out.open('a', encoding='utf-8') as f:
            for k in kayitlar:
                f.write(json.dumps(k, ensure_ascii=False) + '\n')
        print(f'{len(kayitlar)} kayıt -> {a.out}')
    else:
        for k in kayitlar:
            print(f"{k['variant_type']:16} {k['text']}")

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
