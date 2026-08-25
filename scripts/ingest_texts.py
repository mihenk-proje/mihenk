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
import random
import re
from datetime import date
from pathlib import Path

KAYNAKLAR = ('ozgun_yazim', 'kamuya_acik_kaynak', 'sentetik')
ALANLAR = ('mikroblog_gonderisi', 'urun_yorumu')


def mevcut_kayitlar(yol: Path) -> list[dict]:
    if not yol.exists():
        return []
    return [json.loads(s) for s in yol.read_text(encoding='utf-8').splitlines() if s.strip()]


def sonraki_sira(kayitlar: list[dict], onek: str) -> int:
    """Aynı önekle numaralanmış son kaydın ardından devam eder.

    Havuza sonradan ekleme yapılırken numaralandırma sıfırdan başlarsa
    kimlikler çakışır ve yeni kayıtlar sessizce atlanır.
    """
    desen = re.compile(rf'^{re.escape(onek)}-(\d+)$')
    sayilar = [int(m.group(1)) for k in kayitlar if (m := desen.match(k['id']))]
    return max(sayilar, default=0) + 1


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--girdi', type=Path, required=True, help='Her satırı bir metin olan dosya')
    ap.add_argument('--out', type=Path, required=True, help='Hedef JSONL havuzu (eklenir)')
    ap.add_argument('--source', choices=KAYNAKLAR, default='kamuya_acik_kaynak',
                    help='Kaydın kaynağı (varsayılan: kamuya_acik_kaynak)')
    ap.add_argument('--onek', default='m', help='Kimlik öneki (varsayılan: m)')
    ap.add_argument('--domain', choices=ALANLAR, default='mikroblog_gonderisi',
                    help='İçeriğin alanı (varsayılan: mikroblog_gonderisi)')
    ap.add_argument('--karistir', action='store_true',
                    help='Ekleme sonrası havuzun tamamını yeniden karıştırır')
    ap.add_argument('--seed', type=int, default=42, help='Karıştırma tohumu')
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
    havuz = mevcut_kayitlar(a.out)
    mevcut_metinler = {k.get('text') for k in havuz}
    sira = sonraki_sira(havuz, a.onek)
    bugun = date.today().isoformat()

    yeni = []
    for metin in satirlar:
        if metin in mevcut_metinler:
            continue
        yeni.append({
            'id': f'{a.onek}-{sira + len(yeni):05d}',
            'text': metin,
            'label': None,
            'source': a.source,
            'domain': a.domain,
            'collected_at': bugun,
            'labeler_1': None, 'labeler_2': None, 'labeler_3': None,
            'final_label': None,
            'split': None,
            'notes': '',
        })

    havuz.extend(yeni)

    if a.karistir:
        # Sonradan eklenen kayitlar dosya sonuna yigilirsa etiketleyici
        # belirli bir noktadan sonra alanin degistigini fark eder; bu,
        # kaynagi gostermemek icin alinan onlemi bosa cikarir.
        random.Random(a.seed).shuffle(havuz)

    with a.out.open('w', encoding='utf-8') as f:
        for k in havuz:
            f.write(json.dumps(k, ensure_ascii=False) + '\n')

    print(f'{len(yeni)} kayıt eklendi -> {a.out}')
    print(f'  kaynak: {a.source}   alan: {a.domain}')
    print(f'  havuzdaki toplam: {len(havuz)}')
    if a.karistir:
        print(f'  havuz yeniden karıştırıldı (seed={a.seed})')
    else:
        print('  UYARI: --karistir verilmedi; yeni kayıtlar dosya sonunda,')
        print('         etiketleyici alan değişimini fark edebilir.')
    from collections import Counter
    for alan, n in Counter(k.get('domain', '?') for k in havuz).most_common():
        print(f'    {alan:24} {n}')
    if a.source == 'sentetik':
        print('  NOT: sentetik oran final raporunda beyan edilmelidir.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
