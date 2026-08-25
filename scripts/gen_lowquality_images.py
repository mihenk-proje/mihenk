#!/usr/bin/env python3
"""Düşük çabalı görsel üreteci.

Düşük çaba kademesinin ölçülebilmesi için olumsuz örnek üretir. Üç aile:

  tek_renk    düz renk ya da iki renkli degrade — hiç ayrıntı yok
  bulanik     ağır Gauss bulanıklığı — kenar yanıtı çöker
  gurultu     yapısız rastgele gürültü — entropi yüksek ama içerik yok

`gurultu` ailesi bilinçli olarak zor bir vakadır: entropi tek başına
kullanılsaydı gürültü "zengin" görünürdü. Laplas varyansı ve baskın renk
oranıyla birlikte doğru sınıflanır; bu aile o birleşimi sınar.

Üretim deterministiktir (--seed). Çıktı, src/lib/verification/dusukCaba.ts
içindeki eşiklere göre doğrulanır ve manifest'e yazılır.

Örnek:
    python3 scripts/gen_lowquality_images.py --count 500 --seed 42
    python3 scripts/gen_lowquality_images.py --count 12 --aile bulanik --seed 7
"""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BOYUT = (800, 533)
AILELER = ('tek_renk', 'bulanik', 'gurultu')


def tek_renk(r: np.random.Generator) -> Image.Image:
    taban = tuple(int(x) for x in r.integers(0, 256, 3))
    im = Image.new('RGB', BOYUT, taban)
    if r.random() < 0.45:
        # Hafif degrade — yine de baskın renk oranı yüksek kalır
        ikinci = tuple(int(min(255, max(0, c + r.integers(-28, 29)))) for c in taban)
        d = ImageDraw.Draw(im)
        for y in range(BOYUT[1]):
            t = y / BOYUT[1]
            d.line([(0, y), (BOYUT[0], y)],
                   fill=tuple(int(taban[i] * (1 - t) + ikinci[i] * t) for i in range(3)))
    return im


def bulanik(r: np.random.Generator) -> Image.Image:
    # Birkaç kaba lekeden oluşan görüntü, sonra ağır bulanıklık
    im = Image.new('RGB', BOYUT, tuple(int(x) for x in r.integers(60, 200, 3)))
    d = ImageDraw.Draw(im)
    for _ in range(int(r.integers(2, 6))):
        x, y = int(r.integers(0, BOYUT[0])), int(r.integers(0, BOYUT[1]))
        yc = int(r.integers(80, 260))
        d.ellipse([x - yc, y - yc, x + yc, y + yc],
                  fill=tuple(int(v) for v in r.integers(40, 220, 3)))
    return im.filter(ImageFilter.GaussianBlur(float(r.uniform(14, 30))))


def gurultu(r: np.random.Generator) -> Image.Image:
    dizi = r.integers(0, 256, (BOYUT[1], BOYUT[0], 3), dtype=np.uint8)
    return Image.fromarray(dizi, 'RGB')


URETICILER = {'tek_renk': tek_renk, 'bulanik': bulanik, 'gurultu': gurultu}


def olcu(im: Image.Image) -> dict:
    """dusukCaba.ts ile aynı bileşenler: entropi, Laplas varyansı, baskın renk."""
    k = np.asarray(im.convert('RGB').resize((50, 50), Image.BILINEAR), dtype=float)
    g = k[:, :, 0] * 0.299 + k[:, :, 1] * 0.587 + k[:, :, 2] * 0.114

    histogram = np.bincount(np.round(g).astype(int).ravel(), minlength=256)
    p = histogram[histogram > 0] / g.size
    entropi = float(-(p * np.log2(p)).sum())
    tek_renk_orani = float(histogram.max() / g.size)

    # 3x3 Laplas: -4*merkez + dört komşu
    ic = g[1:-1, 1:-1]
    yanit = -4 * ic + g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:]
    return {
        'entropi': round(entropi, 3),
        'laplas_varyansi': round(float(yanit.var()), 2),
        'tek_renk_orani': round(tek_renk_orani, 4),
    }


def dusuk_caba_skoru(m: dict) -> float:
    """src/lib/verification/dusukCaba.ts gorselDusukCabaSkoru ile aynı."""
    kelepce = lambda x: max(0.0, min(1.0, x))
    bilesenler = (
        kelepce((6.0 - m['entropi']) / 6.0) * 0.25,
        kelepce((200 - m['laplas_varyansi']) / 180) * 0.60,
        kelepce((m['tek_renk_orani'] - 0.15) / 0.5) * 0.15,
    )
    return round(sum(bilesenler), 4)


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--count', type=int, default=500, help='Üretilecek görsel (varsayılan: 500)')
    ap.add_argument('--seed', type=int, default=42, help='Rastgelelik tohumu')
    ap.add_argument('--aile', choices=AILELER, help='Yalnızca bu aileyi üret')
    ap.add_argument('--out-dir', type=Path, default=Path('data/images/lowquality'))
    ap.add_argument('--manifest', type=Path, default=Path('data/images/lowquality_manifest.jsonl'))
    a = ap.parse_args()

    aileler = [a.aile] if a.aile else list(AILELER)
    a.out_dir.mkdir(parents=True, exist_ok=True)
    bugun = date.today().isoformat()

    kayitlar = []
    for i in range(a.count):
        aile = aileler[i % len(aileler)]
        r = np.random.default_rng(a.seed + i)
        im = URETICILER[aile](r)
        ad = f'dc-{aile}-{i:04d}.jpg'
        hedef = a.out_dir / ad
        im.save(hedef, 'JPEG', quality=85)

        m = olcu(im)
        kayitlar.append({
            'id': hedef.stem,
            'image_path': str(hedef),
            'label': 'dusuk_cabali',
            'source': 'sentetik',
            'aile': aile,
            'seed': a.seed + i,
            'olculer': m,
            'dusuk_caba_skoru': dusuk_caba_skoru(m),
            'collected_at': bugun,
            'split': None,
        })

    a.manifest.parent.mkdir(parents=True, exist_ok=True)
    with a.manifest.open('w', encoding='utf-8') as f:
        for k in kayitlar:
            f.write(json.dumps(k, ensure_ascii=False) + '\n')

    print(f'{len(kayitlar)} görsel -> {a.out_dir}')
    print(f'manifest -> {a.manifest}')
    print('\n=== ÜRETİLEN GÖRSELLER EŞİĞİ GEÇİYOR MU? (düşük çaba ≥ 0,65) ===')
    for aile in aileler:
        alt = [k for k in kayitlar if k['aile'] == aile]
        skorlar = [k['dusuk_caba_skoru'] for k in alt]
        yakalanan = sum(1 for s in skorlar if s >= 0.65)
        ort = sum(skorlar) / len(skorlar)
        print(f'  {aile:10} n={len(alt):4}  ort skor={ort:.3f}  '
              f'eşiği geçen={yakalanan}/{len(alt)}')
        if yakalanan < len(alt):
            en_dusuk = min(alt, key=lambda k: k['dusuk_caba_skoru'])
            print(f'    en düşük: {en_dusuk["dusuk_caba_skoru"]:.3f}  {en_dusuk["olculer"]}')
    print('\n  NOT: source=sentetik; oran final raporunda beyan edilmelidir.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
