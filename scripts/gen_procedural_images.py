#!/usr/bin/env python3
"""Kod ile üretilen görseller — ödüllendirilen demo gönderileri için.

MİHENK'in iddiası "başkasının içeriğini kendininmiş gibi paylaşanı yakalıyorum"
olduğu için, sistemin "Doğrulandı · jeton kazandı" dediği bir gönderide dış
kaynaklı fotoğraf bulunamaz. Bu betik, kurgusal bir kullanıcının kendi üretmiş
olabileceği türden görseller üretir: devre deseni, topografya haritası ve
ölçüm grafiği.

Üretim deterministiktir: aynı --seed aynı görseli verir.

Örnek:
    python3 scripts/gen_procedural_images.py --tur devre --seed 7 \\
        --out public/seed/uretim-devre.webp
    python3 scripts/gen_procedural_images.py --hepsi --out-dir public/seed
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GENISLIK, YUKSEKLIK = 1200, 800

# Bazalt/pirinç paleti — arayüzün tasarım jetonlarıyla uyumlu
ZEMIN = (18, 24, 26)
IZ = (200, 149, 68)
IZ_SOLUK = (122, 96, 52)
VURGU = (232, 228, 218)


def _rng(seed: int) -> np.random.Generator:
    return np.random.default_rng(seed)


def devre(seed: int) -> Image.Image:
    """Baskı devre kartı izlerini andıran desen."""
    r = _rng(seed)
    img = Image.new('RGB', (GENISLIK, YUKSEKLIK), ZEMIN)
    d = ImageDraw.Draw(img)

    # Dik açılı izler
    for _ in range(46):
        x, y = int(r.integers(40, GENISLIK - 40)), int(r.integers(40, YUKSEKLIK - 40))
        renk = IZ if r.random() < 0.55 else IZ_SOLUK
        kalinlik = int(r.integers(2, 5))
        for _ in range(int(r.integers(2, 6))):
            uzunluk = int(r.integers(50, 220))
            if r.random() < 0.5:
                x2, y2 = min(max(x + (uzunluk if r.random() < 0.5 else -uzunluk), 20), GENISLIK - 20), y
            else:
                x2, y2 = x, min(max(y + (uzunluk if r.random() < 0.5 else -uzunluk), 20), YUKSEKLIK - 20)
            d.line([(x, y), (x2, y2)], fill=renk, width=kalinlik)
            x, y = x2, y2

    # Lehim pedleri
    for _ in range(70):
        x, y = int(r.integers(30, GENISLIK - 30)), int(r.integers(30, YUKSEKLIK - 30))
        yc = int(r.integers(4, 9))
        d.ellipse([x - yc, y - yc, x + yc, y + yc], fill=IZ, outline=VURGU)
        d.ellipse([x - yc // 3, y - yc // 3, x + yc // 3, y + yc // 3], fill=ZEMIN)

    # Entegre gövdeleri
    for _ in range(5):
        x, y = int(r.integers(80, GENISLIK - 220)), int(r.integers(80, YUKSEKLIK - 140))
        g, h = int(r.integers(90, 190)), int(r.integers(50, 100))
        d.rectangle([x, y, x + g, y + h], fill=(38, 46, 49), outline=IZ_SOLUK, width=2)
        for i in range(6):
            bx = x + 12 + i * (g - 24) // 5
            d.rectangle([bx - 3, y - 7, bx + 3, y], fill=IZ)
            d.rectangle([bx - 3, y + h, bx + 3, y + h + 7], fill=IZ)

    return img


def topografya(seed: int) -> Image.Image:
    """Eş yükselti eğrilerinden oluşan arazi haritası."""
    r = _rng(seed)
    # Yumuşatılmış gürültüden yükseklik alanı
    kaba = r.random((14, 20))
    alan = np.array(
        Image.fromarray((kaba * 255).astype(np.uint8)).resize(
            (GENISLIK, YUKSEKLIK), Image.BICUBIC
        ),
        dtype=float,
    )
    alan = np.array(
        Image.fromarray(alan.astype(np.uint8)).filter(ImageFilter.GaussianBlur(18)),
        dtype=float,
    )
    alan = (alan - alan.min()) / max(float(np.ptp(alan)), 1e-6)

    img = Image.new('RGB', (GENISLIK, YUKSEKLIK), ZEMIN)
    piks = np.array(img)

    # Eş yükselti bantları
    seviye = 14
    basamak = (alan * seviye) % 1.0
    egri = (basamak < 0.06)
    ana = egri & (((alan * seviye).astype(int) % 4) == 0)

    piks[egri] = IZ_SOLUK
    piks[ana] = IZ
    img = Image.fromarray(piks)

    # Ölçüm noktaları
    d = ImageDraw.Draw(img)
    for _ in range(12):
        x, y = int(r.integers(60, GENISLIK - 60)), int(r.integers(60, YUKSEKLIK - 60))
        d.line([(x - 7, y), (x + 7, y)], fill=VURGU, width=2)
        d.line([(x, y - 7), (x, y + 7)], fill=VURGU, width=2)
    return img


def izgara(seed: int) -> Image.Image:
    """Ölçüm grafiği: ızgara üzerinde sönümlü salınım izi."""
    r = _rng(seed)
    img = Image.new('RGB', (GENISLIK, YUKSEKLIK), ZEMIN)
    d = ImageDraw.Draw(img)

    for x in range(0, GENISLIK, 60):
        d.line([(x, 0), (x, YUKSEKLIK)], fill=(34, 42, 45), width=1)
    for y in range(0, YUKSEKLIK, 60):
        d.line([(0, y), (GENISLIK, y)], fill=(34, 42, 45), width=1)
    d.line([(0, YUKSEKLIK // 2), (GENISLIK, YUKSEKLIK // 2)], fill=IZ_SOLUK, width=2)

    # İki sönümlü sinüs izi
    for kanal, (renk, kayma) in enumerate(((IZ, 0.0), (VURGU, 1.1))):
        genlik = 150 + r.random() * 90
        frekans = 0.010 + r.random() * 0.013
        sonum = 0.0014 + r.random() * 0.0016
        noktalar = []
        for x in range(0, GENISLIK, 2):
            y = YUKSEKLIK / 2 + genlik * math.exp(-sonum * x) * math.sin(frekans * x + kayma)
            noktalar.append((x, y + (kanal * 26)))
        d.line(noktalar, fill=renk, width=3)

    return img


URETICILER = {'devre': devre, 'topografya': topografya, 'izgara': izgara}


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument('--tur', choices=sorted(URETICILER), help='Üretilecek görsel türü')
    ap.add_argument('--hepsi', action='store_true', help='Tüm türleri üret')
    ap.add_argument('--seed', type=int, default=1, help='Rastgelelik tohumu (varsayılan: 1)')
    ap.add_argument('--out', type=Path, help='Tek görsel için çıktı yolu')
    ap.add_argument('--out-dir', type=Path, default=Path('public/seed'), help='--hepsi için çıktı dizini')
    ap.add_argument('--kalite', type=int, default=82, help='WebP kalitesi (varsayılan: 82)')
    a = ap.parse_args()

    if not a.hepsi and not a.tur:
        ap.error('--tur ya da --hepsi verilmeli')

    turler = sorted(URETICILER) if a.hepsi else [a.tur]
    a.out_dir.mkdir(parents=True, exist_ok=True)

    for i, tur in enumerate(turler):
        img = URETICILER[tur](a.seed + i)
        hedef = a.out if (a.out and not a.hepsi) else a.out_dir / f'uretim-{tur}.webp'
        hedef.parent.mkdir(parents=True, exist_ok=True)
        img.save(hedef, 'WEBP', quality=a.kalite, method=6)
        print(f'{tur:12} seed={a.seed + i}  ->  {hedef}  ({hedef.stat().st_size / 1024:.0f} KB)')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
