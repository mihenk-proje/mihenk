#!/usr/bin/env python3
"""Eşik sağlamasında kullanılan örnekleri geliştirme kümesine sabitler.

Jaccard eşiği (0,35) ve dHash kırpma sınırı, aşağıdaki beş metin ve beş
görsel üzerinde yapılan bir ön sağlamayla doğrulandı. Bu örnekler eşik
seçimini etkilediği için **nihai test bölünmesine giremez**; aksi hâlde
eşik test kümesiyle kontamine olur ve raporun "test kümesi sürecin hiçbir
aşamasına girmez" taahhüdü ihlal edilir.

Betik bu örnekleri `splits/gelistirme.jsonl` içine `split: gelistirme` ve
`leak_guard: true` işaretiyle yazar. `scripts/threshold_sweep.py` ve
`scripts/evaluate.py` bu dosyayı okuyup test bölünmesinden dışlar.

Örnek:
    python3 scripts/fix_dev_split.py
    python3 scripts/fix_dev_split.py --dogrula   # yalnızca kontrol eder
"""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

SPLIT_DOSYASI = Path('splits/gelistirme.jsonl')

# 2026-08-25 eşik sağlamasında kullanılan metinler
SAGLAMA_METINLERI = [
    'Roket motorunun ikinci ateşleme denemesinde basınç eğrisi beklenenden yumuşak çıktı ve yakıt akışını yeniden ayarladık.',
    'İHA gövdesinin karbon fiber katmanlarını yeniden hesapladık, ağırlık üç yüz gram düştü.',
    'Tarım sensörü prototipinde toprak nemi ölçümü iki günlük saha testinde tutarlı sonuç verdi.',
    'Denizaltı itki sisteminin akım çekişini azaltmak için pervane adımını değiştirdik.',
    'Açık kaynak kütüphanenin belgelerini Türkçeye çevirdik ve örnek projeleri güncelledik.',
    'İHA gövdesinin karbon fiber katmanlarını yeniden hesapladık ve ağırlık üç yüz gram düştü, sonuçlar beklentimizin üzerinde.',
]

# Aynı sağlamada kullanılan görseller (dHash kırpma ölçümü)
SAGLAMA_GORSELLERI = [
    'public/seed/etkinlik-yuzme-yarisi.webp',
    'public/seed/etkinlik-rihtim-gemiler.webp',
    'public/seed/etkinlik-sahne-acilis.webp',
    'public/seed/etkinlik-odul-toreni.webp',
    'public/seed/etkinlik-kursu-konusma.webp',
]

GEREKCE = (
    'Eşik sağlamasında (2026-08-25) kullanıldı; eşik seçimini etkilediği için '
    'test bölünmesine giremez.'
)


def kayitlar() -> list[dict]:
    bugun = date.today().isoformat()
    out = []
    for i, metin in enumerate(SAGLAMA_METINLERI, 1):
        out.append({
            'id': f'saglama-metin-{i:02d}',
            'text': metin,
            'label': 'ozgun',
            'source': 'ozgun_yazim',
            'collected_at': bugun,
            'labeler_1': None, 'labeler_2': None, 'labeler_3': None,
            'final_label': None,
            'split': 'gelistirme',
            'leak_guard': True,
            'notes': GEREKCE,
        })
    for i, yol in enumerate(SAGLAMA_GORSELLERI, 1):
        out.append({
            'id': f'saglama-gorsel-{i:02d}',
            'image_path': yol,
            'label': 'ozgun',
            'source': 'kamuya_acik_kaynak',
            'collected_at': bugun,
            'labeler_1': None, 'labeler_2': None, 'labeler_3': None,
            'final_label': None,
            'split': 'gelistirme',
            'leak_guard': True,
            'notes': GEREKCE,
        })
    return out


def yasakli_kimlikler() -> set[str]:
    """Test bölünmesine giremeyecek kayıt kimlikleri."""
    if not SPLIT_DOSYASI.exists():
        return set()
    return {
        json.loads(s)['id']
        for s in SPLIT_DOSYASI.read_text(encoding='utf-8').splitlines()
        if s.strip() and json.loads(s).get('leak_guard')
    }


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--dogrula', action='store_true',
                    help='Yazmaz, yalnızca dosyanın güncel olup olmadığını kontrol eder')
    a = ap.parse_args()

    yeni = kayitlar()

    if a.dogrula:
        if not SPLIT_DOSYASI.exists():
            print('HATA: splits/gelistirme.jsonl yok')
            return 1
        mevcut = yasakli_kimlikler()
        eksik = {k['id'] for k in yeni} - mevcut
        if eksik:
            print(f'HATA: sızıntı koruması eksik kayıt: {sorted(eksik)}')
            return 1
        print(f'✓ {len(mevcut)} kayıt sızıntı korumasıyla sabitlenmiş')
        return 0

    SPLIT_DOSYASI.parent.mkdir(parents=True, exist_ok=True)
    with SPLIT_DOSYASI.open('w', encoding='utf-8') as f:
        for k in yeni:
            f.write(json.dumps(k, ensure_ascii=False) + '\n')

    print(f'{len(yeni)} kayıt -> {SPLIT_DOSYASI}')
    print(f'  {len(SAGLAMA_METINLERI)} metin, {len(SAGLAMA_GORSELLERI)} görsel')
    print('  hepsi split=gelistirme, leak_guard=true')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
