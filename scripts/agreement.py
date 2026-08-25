#!/usr/bin/env python3
"""Etiketleyiciler arası uzlaşma ölçümü ve uyuşmazlık yönlendirmesi.

İki etiketleyicinin bağımsız kararlarını karşılaştırır, Cohen's kappa
hesaplar ve uyuşmazlıkları üçüncü değerlendiriciye yönlendirmek üzere ayrı
bir dosyaya yazar.

Bu betik etiketleme BİTTİKTEN sonra çalıştırılır. Etiketleme sürerken
çalıştırılması körlemeyi bozmaz (kimseye karar göstermez) ama yarım veri
üzerinde kappa yanıltıcı olur.

Kappa yorumu (Landis & Koch):
    < 0,00  uzlaşma yok        0,41–0,60  orta
    0,00–0,20  önemsiz         0,61–0,80  güçlü
    0,21–0,40  zayıf           0,81–1,00  neredeyse tam

Örnek:
    python3 scripts/agreement.py
    python3 scripts/agreement.py --uyeler uye1 uye2 --out data/etiketler/uyusmazlik.jsonl
"""
from __future__ import annotations

import argparse
import itertools
import json
from collections import Counter
from pathlib import Path

HAVUZ = Path('data/metin/nitelik_havuzu.jsonl')
ETIKET_DIZINI = Path('data/etiketler')
SINIFLAR = ('nitelikli', 'dusuk_cabali', 'emin_degilim')


def kararlari_oku(uye: str) -> dict[str, str]:
    yol = ETIKET_DIZINI / f'{uye}.jsonl'
    if not yol.exists():
        return {}
    kararlar: dict[str, str] = {}
    for s in yol.read_text(encoding='utf-8').splitlines():
        if not s.strip():
            continue
        k = json.loads(s)
        if k.get('karar') is None:
            kararlar.pop(k['id'], None)
        else:
            kararlar[k['id']] = k['karar']
    return kararlar


def cohen_kappa(a: list[str], b: list[str]) -> float:
    """(po - pe) / (1 - pe)"""
    n = len(a)
    if n == 0:
        return float('nan')
    po = sum(1 for x, y in zip(a, b) if x == y) / n
    sa, sb = Counter(a), Counter(b)
    pe = sum((sa[s] / n) * (sb[s] / n) for s in set(a) | set(b))
    return 1.0 if pe == 1 else (po - pe) / (1 - pe)


def yorum(k: float) -> str:
    if k != k:
        return 'hesaplanamadı'
    for esik, ad in ((0.81, 'neredeyse tam'), (0.61, 'güçlü'), (0.41, 'orta'),
                     (0.21, 'zayıf'), (0.0, 'önemsiz')):
        if k >= esik:
            return ad
    return 'uzlaşma yok'


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--uyeler', nargs='+', default=['uye1', 'uye2'],
                    help='Karşılaştırılacak etiketleyiciler (varsayılan: uye1 uye2)')
    ap.add_argument('--out', type=Path, default=ETIKET_DIZINI / 'uyusmazlik.jsonl',
                    help='Uyuşmazlıkların yazılacağı dosya')
    a = ap.parse_args()

    metinler = (
        {json.loads(s)['id']: json.loads(s)['text']
         for s in HAVUZ.read_text(encoding='utf-8').splitlines() if s.strip()}
        if HAVUZ.exists() else {}
    )

    kararlar = {u: kararlari_oku(u) for u in a.uyeler}
    for u, k in kararlar.items():
        print(f'{u}: {len(k)} karar')

    bos = [u for u, k in kararlar.items() if not k]
    if bos:
        print(f'\nHATA: şu etiketleyicilerin kararı yok: {", ".join(bos)}')
        return 1

    print()
    uyusmazliklar: dict[str, dict] = {}

    for u1, u2 in itertools.combinations(a.uyeler, 2):
        ortak = sorted(set(kararlar[u1]) & set(kararlar[u2]))
        if not ortak:
            print(f'{u1} × {u2}: ortak etiketlenmiş kayıt yok')
            continue

        v1 = [kararlar[u1][i] for i in ortak]
        v2 = [kararlar[u2][i] for i in ortak]
        k = cohen_kappa(v1, v2)
        ayni = sum(1 for x, y in zip(v1, v2) if x == y)

        print(f'=== {u1} × {u2} ===')
        print(f'  ortak kayıt      : {len(ortak)}')
        print(f'  ham uyum         : {ayni / len(ortak):.1%} ({ayni}/{len(ortak)})')
        print(f"  Cohen's kappa    : {k:.3f}  ({yorum(k)})")

        print(f'\n  karışıklık matrisi ({u1} satır, {u2} sütun)')
        basliklar = [s for s in SINIFLAR if s in set(v1) | set(v2)]
        print('  ' + ' ' * 16 + ''.join(f'{s[:12]:>14}' for s in basliklar))
        for s1 in basliklar:
            satir = ''.join(
                f'{sum(1 for x, y in zip(v1, v2) if x == s1 and y == s2):>14}'
                for s2 in basliklar
            )
            print(f'  {s1:16}{satir}')

        for i in ortak:
            if kararlar[u1][i] != kararlar[u2][i]:
                kayit = uyusmazliklar.setdefault(i, {
                    'id': i,
                    'text': metinler.get(i, ''),
                    'kararlar': {},
                    'notes': 'Bağımsız etiketleyiciler uzlaşmadı; üçüncü değerlendirici gerekli.',
                })
                kayit['kararlar'][u1] = kararlar[u1][i]
                kayit['kararlar'][u2] = kararlar[u2][i]
        print()

    if uyusmazliklar:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        with a.out.open('w', encoding='utf-8') as f:
            for kayit in sorted(uyusmazliklar.values(), key=lambda x: x['id']):
                f.write(json.dumps(kayit, ensure_ascii=False) + '\n')
        print(f'{len(uyusmazliklar)} uyuşmazlık -> {a.out}')
        print('  Üçüncü değerlendirici için: python3 scripts/label.py --uye uye3')
    else:
        print('Uyuşmazlık yok.')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
