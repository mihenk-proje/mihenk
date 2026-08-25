#!/usr/bin/env python3
"""Toplanan metinleri şemaya uygun JSONL havuzuna aktarır.

Etiketleme havuzunu oluşturmak için kullanılır. Metinleri üretmez, yalnızca
ekibin topladığı/yazdığı metinleri şemaya sokar.

`--source` alanı zorunludur ve doğru işaretlenmesi kritiktir:
  ozgun_yazim         ekip üyelerinin kendi yazdığı metin
  kamuya_acik_kaynak  açık lisanslı/kamuya açık kaynaktan alınan metin
  sentetik            betikle üretilmiş metin

Sentetik metni `ozgun_yazim` diye işaretlemek veri bütünlüğü ihlalidir;
final raporunda sentetik oran açıkça beyan edilecektir.

Girdi biçimi: her satır bir metin (boş satırlar atlanır).

Metinler toplanır, yazılmaz: varsayılan kaynak `kamuya_acik_kaynak`.

Örnek:
    python3 scripts/ingest_texts.py --girdi toplanan.txt \\
        --out data/metin/nitelik_havuzu.jsonl
    python3 scripts/ingest_texts.py --girdi yazilan.txt \\
        --source ozgun_yazim --out data/metin/nitelik_havuzu.jsonl
"""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

KAYNAKLAR = ('ozgun_yazim', 'kamuya_acik_kaynak', 'sentetik')


def mevcut_kimlikler(yol: Path) -> set[str]:
    if not yol.exists():
        return set()
    return {
        json.loads(s)['id']
        for s in yol.read_text(encoding='utf-8').splitlines()
        if s.strip()
    }


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--girdi', type=Path, required=True, help='Her satırı bir metin olan dosya')
    ap.add_argument('--out', type=Path, required=True, help='Hedef JSONL havuzu (eklenir)')
    ap.add_argument('--source', choices=KAYNAKLAR, default='kamuya_acik_kaynak',
                    help='Kaydın kaynağı (varsayılan: kamuya_acik_kaynak)')
    ap.add_argument('--onek', default='m', help='Kimlik öneki (varsayılan: m)')
    ap.add_argument('--asgari-uzunluk', type=int, default=1,
                    help='Bu uzunluğun altındaki satırlar atlanır (varsayılan: 1)')
    a = ap.parse_args()

    satirlar = [
        s.strip()
        for s in a.girdi.read_text(encoding='utf-8').splitlines()
        if s.strip() and len(s.strip()) >= a.asgari_uzunluk
    ]
    if not satirlar:
        print('girdi dosyasında işlenecek satır yok')
        return 1

    a.out.parent.mkdir(parents=True, exist_ok=True)
    varolan = mevcut_kimlikler(a.out)
    bugun = date.today().isoformat()

    yazilan = 0
    with a.out.open('a', encoding='utf-8') as f:
        for i, metin in enumerate(satirlar, 1):
            kid = f'{a.onek}-{i:05d}'
            if kid in varolan:
                continue
            f.write(json.dumps({
                'id': kid,
                'text': metin,
                'label': None,
                'source': a.source,
                'collected_at': bugun,
                'labeler_1': None, 'labeler_2': None, 'labeler_3': None,
                'final_label': None,
                'split': None,
                'notes': '',
            }, ensure_ascii=False) + '\n')
            yazilan += 1

    print(f'{yazilan} kayıt eklendi -> {a.out}')
    print(f'  kaynak: {a.source}')
    print(f'  havuzdaki toplam: {len(mevcut_kimlikler(a.out))}')
    if a.source == 'sentetik':
        print('  NOT: sentetik oran final raporunda beyan edilmelidir.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
