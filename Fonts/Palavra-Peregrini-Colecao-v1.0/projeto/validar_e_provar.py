from pathlib import Path
import json,unicodedata,runpy,hashlib,shutil
from fontTools.ttLib import TTFont
from PIL import Image,ImageDraw,ImageFont
import uharfbuzz as hb
ROOT=Path(__file__).resolve().parents[1]
spec=runpy.run_path(str(ROOT/'projeto/construir.py'))
P=spec['PEREGRINI'];RU=spec['RUSSIAN'];GR=spec['GREEK'];LA=spec['LATIN'];M=spec['MATH_SYMBOLS'];EXPECTED=spec['EXPECTED']
labelpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def shape(path,text,direction='ltr'):
 data=path.read_bytes();face=hb.Face(data);font=hb.Font(face);hb.ot_font_set_funcs(font)
 b=hb.Buffer();b.add_str(text);b.guess_segment_properties();b.direction=direction;hb.shape(font,b)
 return [(x.codepoint,x.cluster,p.x_advance,p.x_offset,p.y_offset) for x,p in zip(b.glyph_infos,b.glyph_positions)]

samples=[P+P.lower(),'Árvore, ação, razão, bênção, órgão, avó, avô e essência.','CЛОVО — г r n п — Љ Њ — Hh Nn','Съешь ещё этих мягких французских булок, да выпей чаю.','ἄνθρωπος λόγος ψυχή ᾧ ᾇ Ἅ Ἧ ῷ ῥ ΐ ΰ','Ā Ē Ī Ō Ū Ȳ Ă Ĕ Ĭ Ŏ Ŭ Æ Œ — lumen et veritas.',M]
reports=[]
for fam in ['Display','Texto','Iluminada']:
 paths=[ROOT/'fontes'/ext/f'PalavraPeregrini{fam}-Regular.{ext}' for ext in ['ttf','otf','woff2']]
 maps=[TTFont(p).getBestCmap() for p in paths]
 assert maps[0]==maps[1]==maps[2]
 required=EXPECTED if fam!='Iluminada' else {cp for cp in EXPECTED if cp<0x2000 and unicodedata.category(chr(cp)) in ['Lu','Lt']}
 assert not(required-set(maps[0])),(fam,required-set(maps[0]))
 if fam=='Iluminada':assert not any(unicodedata.category(chr(cp)) in ['Ll','Nd'] for cp in maps[0])
 shaped=[]
 for path in paths[:2]:
  for sample in samples if fam!='Iluminada' else [P,RU,GR,LA,'Ἀ Ἁ Ἄ Ἅ Ἠ Ἡ Ἦ Ἧ ᾈ ᾉ ᾌ ᾍ']:
   for norm in ['NFC','NFD']:
    line=unicodedata.normalize(norm,sample)
    got=shape(path,line);assert all(g[0]!=0 for g in got),(fam,path.name,line)
  rtl=shape(path,P,'rtl');assert all(g[0] for g in rtl)
  assert [g[1] for g in rtl]==sorted([g[1] for g in rtl],reverse=True)
  shaped.append(path.suffix)
 report={'family':fam,'unicode_count':len(maps[0]),'glyph_count':len(TTFont(paths[0]).getGlyphOrder()),'formats_equal_cmap':True,'required_missing':[],'shaping_NFC_NFD':shaped,'RTL_forced_shaping_only':True,'tested_in_Word':False}
 reports.append(report)

# Copyable linguistic specimen: all required alphabet/mark/math characters.
lines=['PALAVRA PEREGRINI — TEXTO DE TESTE COMPLETO','Aplicar Display ou Texto; para Iluminada, usar o arquivo exclusivo de capitulares.','As sequências abaixo são testes tipográficos; não constituem afirmações ou traduções.','']
def section(title,body):lines.extend([title,body,''])
section('1. PEREGRINI',P+'\n'+P.lower()+'\nCЛОVО CЛOVO — гrгr rгrг nпnп пnпn — ЉЊЉЊ ЛЉ НЊ — Hh Nn Pp Rr\nAN EN ИN ON YN ЯN ЮN — an en иn on yn яn юn')
section('2. PORTUGUÊS E ALFABETO LATINO',LA+'\n'+LA.lower()+'\nÀ noite, a árvore lança à praça folhas, raízes e símbolos. João vê a avó, o avô, o órgão e a bênção.\nÁurea, êxito, ímpar, ótimo, útil, frequência, açúcar, pão, limões, K, W, Y, k, w, y.')
section('3. RUSSO',RU+'\n'+RU.lower()+'\nСъешь ещё этих мягких французских булок, да выпей чаю.\nЁЖ Ёж ёж — ЙИ йи — ЬЪ ьъ — ШЩ шщ — ЫИ ыи — ЭЕ эе.')
section('4. GREGO',GR+'\n'+GR.lower()+' ς\nλόγος ψυχή φύσις ἄνθρωπος — Σ σ ς — Φ φ ϕ — Θ θ ϑ — Π π ϖ')
poly=''.join(chr(cp) for cp in range(0x1f00,0x2000) if unicodedata.category(chr(cp))!='Cn')
section('5. GREGO POLITÔNICO — TODOS OS CARACTERES ATRIBUÍDOS DO BLOCO', '\n'.join(' '.join(poly[i:i+16]) for i in range(0,len(poly),16)))
section('6. ACENTOS EM SEQUÊNCIAS DECOMPOSTAS (BASE + MARCA)',unicodedata.normalize('NFD','À Á Â Ã Ä Ā Ă Ç É Ê Ē Ĕ Í Ī Ĭ Ó Ô Õ Ō Ŏ Ú Ü Ū Ŭ Ἀ Ἁ Ἄ Ἅ ᾈ ᾉ ᾌ ᾍ ἄ ἇ ᾇ ᾧ ῷ ΐ ΰ'))
section('7. LATIM', 'Aurea folia, lumen et veritas: ā ē ī ō ū ȳ; ă ĕ ĭ ŏ ŭ; æ œ.\nVIA LVX VERITAS — Via lux veritas — Jj Uu Vv Ww — Ææ Œœ.')
section('8. NÚMEROS E PONTUAÇÃO','0123456789 9876543210\n'+''.join(chr(cp) for cp in range(33,127) if not chr(cp).isalnum())+'\n« » “ ” ‘ ’ … – — − · ° ′ ″')
section('9. LÓGICA, MATEMÁTICA E ESTATÍSTICA',' '.join(M)+'\nμ σ ρ β χ ε θ λ α ω — x̄ ȳ σ² μ₀ α₁ β₂ χ²\n∀x (P(x) → Q(x)); ∃y (y ∈ A ∩ B); A ⊆ B; ∅ ≠ ℝ.\n¬p ∧ q ∨ r; p ⇒ q; p ⇔ q; Γ ⊢ φ; Γ ⊨ φ; □p; ◇q.\n∑ ∏ ∫ ∬ ∭ ∮ ∂ ∇ √ ∛ ∞ ≈ ≡ ± ∓ × ÷ ⊕ ⊗.')
section('10. DIFERENÇAS QUE NÃO DEVEM SER PERDIDAS','O О Ο 0 ∅ — P Р Ρ — H Н Η — A А Α — B В Β — E Е Ε\nN И Η — г r n п — h н — − – — - — ∈ ε — ∑ Σ — ∏ Π — φ ф ϕ')
(ROOT/'Teste-completo-Palavra-Peregrini.txt').write_text('\n'.join(lines),encoding='utf-8')
# Full codepoint atlas, including optional extended repertoire inherited from foundations.
f=TTFont(ROOT/'fontes/ttf/PalavraPeregriniDisplay-Regular.ttf');c=f.getBestCmap()
atlas=['CATÁLOGO EXAUSTIVO — DISPLAY E TEXTO','Cada linha identifica um código presente nas fontes; marcas combinantes são precedidas por A para visualização.','']
for cp in sorted(c):
 ch=chr(cp);cat=unicodedata.category(ch)
 shown=('A'+ch) if cat.startswith('M') else ch
 if cat in ['Cc','Cf','Cs','Cn'] or cat.startswith('Z'):shown='[caractere de controle/espaçamento]'
 atlas.append(f'U+{cp:04X}\t{shown}\t{unicodedata.name(ch,"SEM NOME")}')
(ROOT/'documentacao/Catalogo-exaustivo.txt').write_text('\n'.join(atlas),encoding='utf-8')
main=ROOT/'Teste-completo-Palavra-Peregrini.txt'
test=main.read_text()
missing=EXPECTED-set(map(ord,test))
if missing:
 test+='\n11. COMPLEMENTO DO REPERTÓRIO REQUERIDO\n'+' '.join(('A' if unicodedata.category(chr(cp)).startswith('M') else '')+chr(cp) for cp in sorted(missing))+'\n'
test+='\n12. CATÁLOGO EXAUSTIVO DE TODOS OS CÓDIGOS DISPONÍVEIS\n'+'\n'.join(atlas)
main.write_text(test,encoding='utf-8')
assert EXPECTED<=set(map(ord,test))
ic=TTFont(ROOT/'fontes/ttf/PalavraPeregriniIluminada-Regular.ttf').getBestCmap()
caps=[chr(cp) for cp in sorted(ic) if unicodedata.category(chr(cp)) in ['Lu','Lt']]
(ROOT/'Teste-capitulares-Iluminada.txt').write_text('\n'.join(' '.join(caps[i:i+12]) for i in range(0,len(caps),12)),encoding='utf-8')

# Actual font proofs. Font-rendering raster outputs, no generated-image substitutions.
color='#17362a';paper='#faf7ee'
label=ImageFont.truetype(labelpath,28)
def title(draw,t):draw.text((55,25),t,font=label,fill=color)
def grid(fam,letters,filename,cols=7,size=150):
 rows=math.ceil(len(letters)/cols)
 im=Image.new('RGB',(1800,130+rows*240),paper);d=ImageDraw.Draw(im);title(d,'Palavra Peregrini '+fam+' — prova dos arquivos reais')
 font=ImageFont.truetype(str(ROOT/'fontes/ttf'/f'PalavraPeregrini{fam}-Regular.ttf'),size)
 for i,ch in enumerate(letters):
  row,col=divmod(i,cols);x=55+col*247;y=90+row*240
  d.text((x,y),ch,font=font,fill=color)
 im.save(ROOT/'provas'/filename)
import math
grid('Display',[a+a.lower() for a in P],'Display-Peregrini.png',7,115)
grid('Iluminada',list(P),'Iluminada-Peregrini.png')
grid('Iluminada',list('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'Iluminada-Latino.png')
grid('Iluminada',list(RU),'Iluminada-Russo.png')
grid('Iluminada',list(GR+'ἈἉἌἍᾈᾉᾌᾍ'),'Iluminada-Grego.png')
for fam in ['Display','Texto']:
 im=Image.new('RGB',(1900,1700),paper);d=ImageDraw.Draw(im);title(d,'Palavra Peregrini '+fam+' — idiomas, acentos e símbolos')
 font=ImageFont.truetype(str(ROOT/'fontes/ttf'/f'PalavraPeregrini{fam}-Regular.ttf'),51)
 prooflines=samples+[' '.join(M[:36]),' '.join(M[36:72]),' '.join(M[72:]),'Á À Â Ã Ç É Ê Í Ó Ô Õ Ú Ü — Ā Ē Ī Ō Ū Ȳ Æ Œ','A\u0301 A\u0304 α\u0313\u0301 α\u0314\u0342\u0345 — x\u0304 y\u0304']
 y=95
 for s in prooflines:
  # Wrap at spaces, then at characters for the dense alphabet sequence.
  words=s.split(' ');row=''
  for word in words:
   candidate=(row+' '+word).strip()
   if d.textlength(candidate,font=font)>1750 and row:
    d.text((55,y),row,font=font,fill=color);y+=83;row=word
   else:row=candidate
  if d.textlength(row,font=font)>1750:
   current=''
   for char in row:
    if d.textlength(current+char,font=font)>1750:
     d.text((55,y),current,font=font,fill=color);y+=83;current=char
    else:current+=char
   row=current
  d.text((55,y),row,font=font,fill=color);y+=90
 # Expand canvas only if needed instead of clipping hidden lines.
 if y>1700:raise AssertionError(('proof overflow',fam,y))
 im.save(ROOT/'provas'/f'{fam}-Idiomas.png')
# A compact comparison at the intended reading scale.
im=Image.new('RGB',(1800,850),paper);d=ImageDraw.Draw(im);title(d,'Display · Texto · Iluminada — funções diferentes')
for fam,y,text in [('Display',100,'Palavra Peregrini — CЛОVО'),('Texto',300,'Clareza, reflexão e ordem na escrita.'),('Iluminada',490,'A Љ Њ Ж')]:
 size=70 if fam!='Iluminada' else 220
 d.text((65,y),text,font=ImageFont.truetype(str(ROOT/'fontes/ttf'/f'PalavraPeregrini{fam}-Regular.ttf'),size),fill=color)
im.save(ROOT/'provas/Comparacao-das-familias.png')
(ROOT/'documentacao/Validacao.json').write_text(json.dumps(reports,indent=2))
print(json.dumps(reports,indent=2))
