#!/usr/bin/env python3
"""Çift körlemeli etiketleme aracı.

Her metni tek tek gösterir ve tek tuşla etiket alır. Etiketleyici kimliği
anonimdir (uye1/uye2/uye3); isim veya e-posta yazılmaz.

KÖRLEME YAPISALDIR. Her etiketleyici kendi dosyasına yazar
(data/etiketler/uye1.jsonl) ve araç diğer etiketleyicilerin dosyalarını
hiçbir koşulda açmaz. Başkasının kararını göstermemek bir arayüz tercihi
değil, dosya düzeninin garantisidir.

Kaldığı yerden devam eder: kendi dosyasında etiketlenmiş kayıtları atlar.

Etiketler:
  1  nitelikli      bilgi veren, çaba görünen içerik
  2  düşük çabalı   içeriksiz, çok kısa, tekrarlı ya da özensiz
  3  emin değilim   üçüncü değerlendiriciye bırakılır
  g  geri al        son kararı sil
  q  çık            ilerleme kaydedilmiştir

Örnek:
    python3 scripts/label.py --uye uye1
    python3 scripts/label.py --uye uye2 --limit 200
    python3 scripts/label.py --uye uye1 --durum
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

HAVUZ = Path('data/metin/nitelik_havuzu.jsonl')
ETIKET_DIZINI = Path('data/etiketler')
UYELER = ('uye1', 'uye2', 'uye3')

ETIKETLER = {'1': 'nitelikli', '2': 'dusuk_cabali', '3': 'emin_degilim'}


def tek_tus() -> str:
    """Enter beklemeden tek tuş okur. Terminal ham kipi yoksa satır okumaya düşer."""
    try:
        import termios
        import tty
    except ImportError:
        return (sys.stdin.readline().strip() or ' ')[0]

    fd = sys.stdin.fileno()
    try:
        eski = termios.tcgetattr(fd)
    except termios.error:
        return (sys.stdin.readline().strip() or ' ')[0]
    try:
        tty.setraw(fd)
        return sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, eski)


def havuzu_oku() -> list[dict]:
    if not HAVUZ.exists():
        print(f'HATA: {HAVUZ} yok.')
        print('Önce havuzu oluşturun:')
        print('  python3 scripts/ingest_texts.py --girdi toplanan.txt \\')
        print(f'      --source ozgun_yazim --out {HAVUZ}')
        sys.exit(1)
    return [json.loads(s) for s in HAVUZ.read_text(encoding='utf-8').splitlines() if s.strip()]


def kendi_kararlarim(uye: str) -> dict[str, str]:
    """Yalnızca bu üyenin dosyası okunur. Diğer üyelerin dosyalarına dokunulmaz."""
    yol = ETIKET_DIZINI / f'{uye}.jsonl'
    if not yol.exists():
        return {}
    kararlar = {}
    for s in yol.read_text(encoding='utf-8').splitlines():
        if not s.strip():
            continue
        k = json.loads(s)
        if k.get('karar') is None:
            kararlar.pop(k['id'], None)  # geri alınmış
        else:
            kararlar[k['id']] = k['karar']
    return kararlar


def karar_yaz(uye: str, kayit_id: str, karar: str | None, sure_sn: float) -> None:
    ETIKET_DIZINI.mkdir(parents=True, exist_ok=True)
    with (ETIKET_DIZINI / f'{uye}.jsonl').open('a', encoding='utf-8') as f:
        f.write(json.dumps({
            'id': kayit_id,
            'karar': karar,
            'etiketleyici': uye,
            'zaman': datetime.now(timezone.utc).isoformat(timespec='seconds'),
            'sure_sn': round(sure_sn, 1),
        }, ensure_ascii=False) + '\n')


def sar(metin: str, en: int = 76) -> str:
    kelimeler, satirlar, simdiki = metin.split(), [], ''
    for k in kelimeler:
        if len(simdiki) + len(k) + 1 > en:
            satirlar.append(simdiki)
            simdiki = k
        else:
            simdiki = f'{simdiki} {k}'.strip()
    if simdiki:
        satirlar.append(simdiki)
    return '\n  '.join(satirlar)


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument('--uye', choices=UYELER, required=True, help='Anonim etiketleyici kimliği')
    ap.add_argument('--limit', type=int, help='Bu oturumda en fazla kaç kayıt etiketlensin')
    ap.add_argument('--durum', action='store_true', help='Yalnızca ilerlemeyi gösterir')
    a = ap.parse_args()

    havuz = havuzu_oku()
    kararlar = kendi_kararlarim(a.uye)
    kalan = [k for k in havuz if k['id'] not in kararlar]

    if a.durum:
        print(f'{a.uye}: {len(kararlar)}/{len(havuz)} etiketlendi, {len(kalan)} kaldı')
        if kararlar:
            from collections import Counter
            for etiket, adet in Counter(kararlar.values()).most_common():
                print(f'  {etiket:16} {adet}')
        return 0

    if not kalan:
        print(f'{a.uye}: havuzdaki {len(havuz)} kaydın tamamı etiketlenmiş.')
        return 0

    if a.limit:
        kalan = kalan[: a.limit]

    print(f'\n{"=" * 78}')
    print(f'  ETİKETLEME — {a.uye}')
    print(f'  havuz: {len(havuz)}   etiketlenen: {len(kararlar)}   bu oturum: {len(kalan)}')
    print(f'  1 nitelikli   2 düşük çabalı   3 emin değilim   g geri al   q çık')
    print(f'{"=" * 78}')

    baslangic = time.time()
    sayac = 0
    son_id: str | None = None
    i = 0

    while i < len(kalan):
        kayit = kalan[i]
        gecen = time.time() - baslangic
        hiz = sayac / gecen * 60 if gecen > 5 and sayac else 0
        kalan_dk = (len(kalan) - sayac) / hiz if hiz else 0

        print(f'\n[{sayac + 1}/{len(kalan)}]  {kayit["id"]}'
              + (f'   ~{hiz:.0f}/dk   kalan ~{kalan_dk:.0f} dk' if hiz else ''))
        print(f'  {sar(kayit["text"])}')
        print('  > ', end='', flush=True)

        soru_basi = time.time()
        tus = tek_tus()

        if tus in ('q', '\x03'):
            print('çıkılıyor')
            break

        if tus == 'g':
            if son_id is None:
                print('geri alınacak karar yok')
                continue
            karar_yaz(a.uye, son_id, None, 0)
            print(f'geri alındı: {son_id}')
            i -= 1
            sayac -= 1
            son_id = None
            continue

        if tus not in ETIKETLER:
            print('geçersiz tuş')
            continue

        etiket = ETIKETLER[tus]
        karar_yaz(a.uye, kayit['id'], etiket, time.time() - soru_basi)
        print(etiket)
        son_id = kayit['id']
        sayac += 1
        i += 1

    gecen = time.time() - baslangic
    toplam = len(kendi_kararlarim(a.uye))
    print(f'\n{"=" * 78}')
    print(f'  bu oturum: {sayac} kayıt, {gecen / 60:.1f} dk'
          + (f' ({sayac / gecen * 60:.0f}/dk)' if gecen > 0 and sayac else ''))
    print(f'  toplam: {toplam}/{len(havuz)}   kalan: {len(havuz) - toplam}')
    print(f'{"=" * 78}\n')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
