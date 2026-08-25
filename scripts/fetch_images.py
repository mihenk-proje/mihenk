#!/usr/bin/env python3
"""Unsplash Lite'tan görsel özgünlük ölçüm kümesini indirir.

Kaynak: https://unsplash.com/data  (Unsplash Lite Dataset, 25k foto)
Lisans: Unsplash Lisansı — ticari ve ticari olmayan kullanıma açık.

YENİDEN DAĞITIM YASAĞI. Unsplash Terms, "Licensed Data"nın tamamen veya
kısmen yeniden dağıtılmasını yasaklar. Depo herkese açık olduğu için:

  - İndirilen görsel dosyaları .gitignore ile dışlanır, commit edilmez.
  - Yayımlanan manifest yalnızca kendi ürettiğimiz alanları taşır:
    seçtiğimiz photo_id, hesapladığımız dHash ve uyguladığımız dönüşüm.
    Unsplash'in meta alanları (fotoğrafçı adı, açıklama, EXIF, konum)
    manifest'e YAZILMAZ.
  - Seçim tohumludur: üçüncü taraf, Unsplash'ten kendi kopyasını alıp
    aynı --seed ile bu betiği çalıştırarak birebir aynı kümeyi üretir.
    Manifest'teki id listesi yalnızca doğrulama kolaylığı sağlar.

Çıktı:
  data/images/originals/  500 görsel — özgünlük referansı
  data/images/normal/     500 görsel — düşük çaba karşılaştırması
  data/images/manifest.jsonl

Örnek:
    python3 scripts/fetch_images.py --tsv photos.tsv000 --seed 42
    python3 scripts/fetch_images.py --tsv photos.tsv000 --count 20 --seed 42
"""
from __future__ import annotations

import argparse
import csv
import json
import random
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

import numpy as np
from PIL import Image

KAYNAK_ADI = 'Unsplash Lite Dataset'
KAYNAK_URL = 'https://unsplash.com/data'
GENISLIK = 800  # dHash ve entropi ölçümü için fazlasıyla yeterli


def dhash(im: Image.Image) -> str:
    """src/lib/verification/index.ts içindeki hesaplaDHash ile aynı: 9x8 gri, komşu fark."""
    k = im.convert('RGB').resize((9, 8), Image.BILINEAR)
    a = np.asarray(k, dtype=float)
    g = a[:, :, 0] * 0.299 + a[:, :, 1] * 0.587 + a[:, :, 2] * 0.114
    bitler = ''.join('1' if g[y, x] > g[y, x + 1] else '0' for y in range(8) for x in range(8))
    return ''.join(f'{int(bitler[i:i + 4], 2):x}' for i in range(0, 64, 4))


def indir(foto_id: str, url: str, hedef: Path) -> dict | None:
    try:
        istek = Request(f'{url}?w={GENISLIK}&fm=jpg&q=80',
                        headers={'User-Agent': 'mihenk-research/1.0'})
        with urlopen(istek, timeout=45) as yanit:
            veri = yanit.read()
        im = Image.open(BytesIO(veri)).convert('RGB')
        hedef.parent.mkdir(parents=True, exist_ok=True)
        im.save(hedef, 'JPEG', quality=85)
        return {'photo_id': foto_id, 'image_path': str(hedef),
                'dhash': dhash(im), 'width': im.width, 'height': im.height}
    except Exception as e:
        print(f'  atlandı {foto_id}: {type(e).__name__}', file=sys.stderr)
        return None


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--tsv', type=Path, required=True,
                    help='Unsplash Lite photos.tsv000 yolu')
    ap.add_argument('--out-dir', type=Path, default=Path('data/images'), help='Çıktı kökü')
    ap.add_argument('--count', type=int, default=1000, help='Toplam görsel (varsayılan: 1000)')
    ap.add_argument('--seed', type=int, default=42, help='Seçim tohumu')
    ap.add_argument('--isci', type=int, default=8, help='Eşzamanlı indirme (varsayılan: 8)')
    a = ap.parse_args()

    with a.tsv.open(encoding='utf-8') as f:
        satirlar = [
            (s['photo_id'], s['photo_image_url'])
            for s in csv.DictReader(f, delimiter='\t')
            if s.get('photo_id') and s.get('photo_image_url')
        ]
    print(f'TSV\'de {len(satirlar)} foto')

    secilen = random.Random(a.seed).sample(satirlar, min(a.count, len(satirlar)))
    yari = len(secilen) // 2
    gorevler = [(fid, url, 'originals') for fid, url in secilen[:yari]]
    gorevler += [(fid, url, 'normal') for fid, url in secilen[yari:]]
    print(f'seçilen {len(gorevler)}  (originals {yari} / normal {len(gorevler) - yari})')
    print(f'indiriliyor ({a.isci} eşzamanlı)…')

    bugun = date.today().isoformat()
    kayitlar = []
    with ThreadPoolExecutor(max_workers=a.isci) as havuz:
        isler = {
            havuz.submit(indir, fid, url, a.out_dir / kume / f'{fid}.jpg'): (fid, kume)
            for fid, url, kume in gorevler
        }
        for i, is_ in enumerate(as_completed(isler), 1):
            fid, kume = isler[is_]
            sonuc = is_.result()
            if sonuc:
                kayitlar.append({
                    'id': f'g-{fid}',
                    **sonuc,
                    'kume': kume,
                    'label': 'ozgun',
                    'source': 'kamuya_acik_kaynak',
                    'source_name': KAYNAK_ADI,
                    'source_url': KAYNAK_URL,
                    'source_license': 'Unsplash License',
                    # Unsplash meta alanlari (fotografci, aciklama, EXIF) bilerek yazilmaz
                    'variant_type': None,
                    'parent_id': None,
                    'collected_at': bugun,
                    'split': None,
                })
            if i % 100 == 0:
                print(f'  {i}/{len(gorevler)}')

    kayitlar.sort(key=lambda k: k['id'])
    manifest = a.out_dir / 'manifest.jsonl'
    manifest.parent.mkdir(parents=True, exist_ok=True)
    with manifest.open('w', encoding='utf-8') as f:
        for k in kayitlar:
            f.write(json.dumps(k, ensure_ascii=False) + '\n')

    basarisiz = len(gorevler) - len(kayitlar)
    print(f'\n{len(kayitlar)} görsel indirildi'
          + (f', {basarisiz} başarısız' if basarisiz else ''))
    print(f'manifest -> {manifest}')
    print(f'  seçim tohumu: {a.seed} (aynı tohum aynı kümeyi verir)')
    print('  görsel dosyaları .gitignore ile dışlanır; yeniden dağıtım yasaktır.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
