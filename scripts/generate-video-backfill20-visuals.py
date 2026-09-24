#!/usr/bin/env python3
"""Rebuild the September 2026 video-article SVGs with Python's standard library.

Inputs, translations, numerical series and accessible descriptions are in
scripts/data/video-backfill20-2026-09-23.json. Source calculations live beside
the relevant published articles in source-data.json. Qualitative diagrams
are explicitly labelled editorial, never presented as measured outcomes.
"""
import html
import json
import sys
from pathlib import Path
import textwrap
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
# An optional data path lets later articles reuse the same checked renderer.
DATA = json.loads((ROOT/(sys.argv[1] if len(sys.argv)>1 else 'scripts/data/video-backfill20-2026-09-23.json')).read_text())
PAPER, INK, MUTED, GREEN, TAN, RULE = '#f7f4ee', '#1b1712', '#655e55', '#2f5d4f', '#a87653', '#d9d3c8'

def esc(s):
    return html.escape(str(s), quote=True)

def lines(s, width, size):
    # Conservative character width leaves room for wider glyphs and diacritics.
    return textwrap.wrap(s, width=max(8,int(width/(size*.59))), break_long_words=False, break_on_hyphens=False) or ['']

def render(item, lang, mobile):
    t=item[lang]
    width=420 if mobile else 900
    pad=24 if mobile else 40
    inner=width-2*pad
    title_size=27 if mobile else 36
    body_size=18 if mobile else 23
    small_size=15 if mobile else 18
    parts=[]
    def txt(s,x,y,size=body_size,color=INK,weight='normal',anchor='start',serif=False):
        parts.append(f'<text x="{x}" y="{y}" fill="{color}" font-family="{("Georgia, serif" if serif else "Arial, sans-serif")}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{esc(s)}</text>')
    def block(s,x,y,w,size=body_size,color=INK,weight='normal',serif=False):
        for line in lines(s,w,size):
            txt(line,x,y,size,color,weight,serif=serif)
            y+=size*1.4
        return y
    y=pad+title_size
    y=block(t['title'],pad,y,inner,title_size,serif=True)+8
    y=block(t['subtitle'],pad,y,inner,small_size,MUTED)+18
    parts.append(f'<path d="M {pad} {y-5} H {width-pad}" stroke="{RULE}"/>')
    y+=20
    if item['type']=='bars':
        values=item['values']
        assert len(values)==len(t['labels'])==len(t['display'])
        assert all(v>=0 for v in values) and max(values)>0
        maximum=max(values)
        for i,(label,value,display) in enumerate(zip(t['labels'],values,t['display'])):
            y=block(label,pad,y,inner,body_size)
            txt(display,width-pad,y+small_size,small_size,INK,'bold',anchor='end')
            y+=small_size+12
            parts.append(f'<rect x="{pad}" y="{y}" width="{inner}" height="22" rx="3" fill="{RULE}"/>')
            parts.append(f'<rect x="{pad}" y="{y}" width="{inner*value/maximum:.3f}" height="22" rx="3" fill="{GREEN if i%2 else TAN}"/>')
            y+=22+30
        txt('0',pad,y-8,small_size,MUTED)
        txt('All bars start at zero' if lang=='en' else 'Të gjithë shiritat fillojnë nga zero',width-pad,y-8,small_size,MUTED,anchor='end')
        y+=20
    else:
        gap=20
        cols=1 if mobile else 2
        cell_width=inner if cols==1 else (inner-gap)/2
        for start in range(0,len(t['items']),cols):
            row=t['items'][start:start+cols]
            if len(row)==1:
                cell_width=inner
            heights=[]
            for heading,body in row:
                h=len(lines(heading,cell_width-36,body_size))*body_size*1.4
                h+=len(lines(body,cell_width-36,body_size))*body_size*1.4+65
                heights.append(h)
            height=max(heights)
            for col,(heading,body) in enumerate(row):
                x=pad+col*(cell_width+gap)
                parts.append(f'<rect x="{x}" y="{y}" width="{cell_width}" height="{height}" rx="7" fill="#fffdf8" stroke="{RULE}"/>')
                yy=block(heading,x+18,y+32,cell_width-36,body_size,GREEN,'bold')+12
                block(body,x+18,yy,cell_width-36,body_size)
            y+=height+gap
        y+=8
    y=block(t['foot'],pad,y,inner,small_size,MUTED)
    height=int(y+pad)
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc"><title id="title">{esc(t["title"])}</title><desc id="desc">{esc(t["alt"])}</desc><rect width="100%" height="100%" fill="{PAPER}"/>'+''.join(parts)+'</svg>\n'
    ET.fromstring(svg)
    return svg

count=0
for item in DATA['visuals']:
    folder=ROOT/'public/writing'/item['slug']
    folder.mkdir(parents=True,exist_ok=True)
    for lang in ('en','sq'):
        for mobile in (False,True):
            (folder/f'{item["name"]}-{lang}{"-mobile" if mobile else ""}.svg').write_text(render(item,lang,mobile))
            count+=1
print(f'Generated {count} accessible SVGs for {len(DATA["articles"])} bilingual articles.')
