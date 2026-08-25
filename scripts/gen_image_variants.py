#!/usr/bin/env python3
"""Görsel varyant üreteci — özgünlük test kümesi ve demo için.

Bir özgün görselden dört dönüşüm üretir: yeniden boyutlandırma, JPEG
sıkıştırma, kırpma ve filtre. Her varyant `parent_id` ve `variant_type`
ile etiketlenir, çıktı JSONL şemasına yazılır.

Demo akışındaki "algısal hash eşleşti" örneği de bu betikle üretilir;
böylece jüriye gösterilen dönüşüm ile ölçümde kullanılan üretim mantığı
aynı olur.

Üretim deterministiktir: aynı --seed aynı varyantları verir.

Örnek:
    python3 scripts/gen_image_variants.py --girdi public/seed/foto.webp \\
        --out-dir public/seed --tur kirpma_filtre --seed 3
    python3 scripts/gen_image_variants.py --girdi-dir data/gorsel/ozgun \\
        --out-dir data/gorsel/varyant --count 4 --seed 42
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

VARYANT_TURLERI = ('yeniden_boyutlandirma', 'sikistirma', 'kirpma', 'filtre', 'kirpma_filtre')


def yeniden_boyutlandirma(im: Image.Image, r: np.random.Generator) -> Image.Image:
    oran = float(r.uniform(0.45, 0.8))
    kucuk = im.resize((max(1, int(im.width * oran)), max(1, int(im.height * oran))), Image.LANCZOS)
    return kucuk.resize(im.size, Image.LANCZOS)


def sikistirma(im: Image.Image, r: np.random.Generator) -> Image.Image:
    from io import BytesIO

    tampon = BytesIO()
    im.save(tampon, 'JPEG', quality=int(r.integers(18, 42)))
    tampon.seek(0)
    return Image.open(tampon).convert('RGB')


def kirpma(im: Image.Image, r: np.random.Generator) -> Image.Image:
    pay = float(r.uniform(0.10, 0.24))
    sol, ust = int(im.width * pay), int(im.height * pay)
    sag, alt = im.width - int(im.width * pay * r.uniform(0.4, 1.0)), im.height - int(
        im.height * pay * r.uniform(0.4, 1.0)
    )
    return im.crop((sol, ust, sag, alt))


def filtre(im: Image.Image, r: np.random.Generator) -> Image.Image:
    out = ImageEnhance.Color(im).enhance(float(r.uniform(0.35, 1.7)))
    out = ImageEnhance.Contrast(out).enhance(float(r.uniform(0.7, 1.5)))
    out = ImageEnhance.Brightness(out).enhance(float(r.uniform(0.8, 1.25)))
    if r.random() < 0.5:
        out = out.filter(ImageFilter.GaussianBlur(float(r.uniform(0.4, 1.3))))
    return out


def kirpma_filtre(im: Image.Image, r: np.random.Generator) -> Image.Image:
    """Demo senaryosu: kırpılmış + filtreli hâl — en yaygın 'başkasının görseli' vakası."""
    return filtre(kirpma(im, r), r)


URETICILER = {
    'yeniden_boyutlandirma': yeniden_boyutlandirma,
    'sikistirma': sikistirma,
    'kirpma': kirpma,
    'filtre': filtre,
    'kirpma_filtre': kirpma_filtre,
}


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    kaynak = ap.add_mutually_exclusive_group(required=True)
    kaynak.add_argument('--girdi', type=Path, help='Tek özgün görsel')
    kaynak.add_argument('--girdi-dir', type=Path, help='Özgün görsellerin bulunduğu dizin')
    ap.add_argument('--out-dir', type=Path, required=True, help='Çıktı dizini')
    ap.add_argument('--tur', choices=VARYANT_TURLERI, help='Yalnızca bu türü üret')
    ap.add_argument('--count', type=int, default=4, help='Görsel başına varyant sayısı (varsayılan: 4)')
    ap.add_argument('--seed', type=int, default=1, help='Rastgelelik tohumu')
    ap.add_argument('--jsonl', type=Path, help='Kayıtların yazılacağı JSONL dosyası')
    ap.add_argument('--bicim', default='webp', choices=('webp', 'jpg', 'png'), help='Çıktı biçimi')
    a = ap.parse_args()

    girdiler = (
        [a.girdi]
        if a.girdi
        else sorted(
            p for p in a.girdi_dir.iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}
        )
    )
    if not girdiler:
        ap.error('girdi görseli bulunamadı')

    a.out_dir.mkdir(parents=True, exist_ok=True)
    turler = [a.tur] if a.tur else list(VARYANT_TURLERI[: a.count])
    kayitlar = []

    for gi, yol in enumerate(girdiler):
        im = Image.open(yol).convert('RGB')
        parent_id = yol.stem
        for ti, tur in enumerate(turler):
            r = np.random.default_rng(a.seed + gi * 100 + ti)
            varyant = URETICILER[tur](im, r)
            ad = f'{parent_id}--{tur}.{a.bicim}'
            hedef = a.out_dir / ad
            varyant.save(hedef, quality=82, method=6) if a.bicim == 'webp' else varyant.save(hedef)
            kayitlar.append(
                {
                    'id': hedef.stem,
                    'image_path': str(hedef),
                    'label': 'varyant',
                    'source': 'sentetik',
                    'parent_id': parent_id,
                    'variant_type': tur,
                    'seed': a.seed + gi * 100 + ti,
                    'collected_at': datetime.now(timezone.utc).date().isoformat(),
                    'labeler_1': None,
                    'labeler_2': None,
                    'labeler_3': None,
                    'final_label': 'varyant',
                    'notes': f'{yol.name} görselinden {tur} dönüşümüyle üretildi',
                }
            )
            print(f'{tur:24} {parent_id:34} -> {hedef.name}  ({hedef.stat().st_size / 1024:.0f} KB)')

    if a.jsonl:
        a.jsonl.parent.mkdir(parents=True, exist_ok=True)
        with a.jsonl.open('a', encoding='utf-8') as f:
            for k in kayitlar:
                f.write(json.dumps(k, ensure_ascii=False) + '\n')
        print(f'\n{len(kayitlar)} kayıt -> {a.jsonl}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
