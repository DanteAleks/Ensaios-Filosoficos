"""Build reproducible hybrid Peregrini font collection from approved core outlines
and licensed vector foundations. Do not remove origin/license documentation.
"""
from pathlib import Path
import copy,csv,json,unicodedata,math,hashlib
import numpy as np
from scipy.interpolate import splprep,splev
from fontTools.ttLib import TTFont,newTable
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.recordingPen import RecordingPen,DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools import subset
import pathops
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'projeto/bases/DejaVuSerif.ttf';MATH=ROOT/'projeto/bases/latinmodern-math.otf'
CORE={k:json.loads((ROOT/'projeto/referencias'/f'{k}-contornos.json').read_text()) for k in ['display','iluminada']}
MATH_SYMBOLS='¬∧∨⊻→↔⇒⇔∀∃∄⊤⊥⊢⊨□◇∈∉∋∅⊂⊃⊆⊇∪∩∖⊄⊈ℕℤℚℝℂ+−±∓×÷⋅/=≠≈≡<>≤≥∝∞∑∏√∛∫∬∭∮∂∇∠∟°′″∥⊕⊗∘⌈⌉⌊⌋⟨⟩⁰¹²³ⁿ₀₁₂₃…⋯'
PEREGRINI='ABKXДEΦЖИЯЮГЛЉMHЊOПPRCTЧYVЗN'
RUSSIAN='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
GREEK='ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
LATIN='ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÇÉÊÍÓÔÕÚÜĀĒĪŌŪȲĂĔĬŎŬÆŒ'
MARKS=[0x300,0x301,0x302,0x303,0x304,0x306,0x307,0x308,0x30a,0x30b,0x30c,0x313,0x314,0x342,0x344,0x345,0x327]
EXPECTED=set(map(ord,PEREGRINI+PEREGRINI.lower()+RUSSIAN+RUSSIAN.lower()+GREEK+GREEK.lower()+'ς'+LATIN+LATIN.lower()+MATH_SYMBOLS))|set(MARKS)|set(range(32,127))
EXPECTED |= {cp for cp in range(0x1f00,0x2000) if unicodedata.category(chr(cp))!='Cn'}
HOMOGRAPHS=['AАΑ','BВΒ','EЕΕ','HНΗ','IІΙ','KКΚ','MМΜ','NΝ','OОΟ','PРΡ','CС','TТΤ','XХΧ','YΥ','ZΖ','ΦФ','ГΓ','ПΠ','aа','cс','eе','oо','pр','xх']

def bounds_record(rec):
 p=BoundsPen(None);rec.replay(p);return p.bounds

def record_glyph(f,n):
 gs=f.getGlyphSet();p=DecomposingRecordingPen(gs);gs[n].draw(p);return p

def fit_outline(paths):
 """Smooth bitmap-derived contours with periodic cubic splines; keep tiny
 contours polygonal. The original drawing is retained in source JSON."""
 p=RecordingPen()
 for raw in paths:
  a=np.array(raw,dtype=float)
  a=a[np.r_[True,np.linalg.norm(np.diff(a,axis=0),axis=1)>.05]]
  if len(a)<3:continue
  if len(a)<8:
   p.moveTo(tuple(a[0]));[p.lineTo(tuple(pt)) for pt in a[1:]];p.closePath();continue
  if np.linalg.norm(a[0]-a[-1])<.01:a=a[:-1]
  ring=np.vstack([a,a[0]])
  lengths=np.r_[0,np.cumsum(np.linalg.norm(np.diff(ring,axis=0),axis=1))]
  samples=np.linspace(0,lengths[-1],max(16,int(lengths[-1]/4)))
  ring=np.column_stack([np.interp(samples,lengths,ring[:,j]) for j in (0,1)])
  # One pixel in the reference corresponds to about 4–12 font units.
  # This removes high-frequency raster stair steps without replacing shapes.
  try:
   tck,u=splprep(ring.T,s=len(ring)*2.5**2,per=True,k=3)
   knots=np.unique(tck[0]);knots=knots[(knots>=0)&(knots<=1)]
   if len(knots)<2:raise ValueError('no intervals')
   p.moveTo(tuple(splev(knots[0],tck)))
   for l,r in zip(knots[:-1],knots[1:]):
    if r-l<1e-10:continue
    x0=np.array(splev(l,tck));x1=np.array(splev(r,tck))
    d0=np.array(splev(l,tck,der=1));d1=np.array(splev(r,tck,der=1))
    p.curveTo(tuple(x0+d0*(r-l)/3),tuple(x1-d1*(r-l)/3),tuple(x1))
   p.closePath()
  except (ValueError,TypeError):
   p.moveTo(tuple(a[0]));[p.lineTo(tuple(pt)) for pt in a[1:]];p.closePath()
 return p

def ttglyph(rec):
 p=TTGlyphPen(None);rec.replay(Cu2QuPen(p,1.1));return p.glyph()

def transform(rec,matrix):
 p=RecordingPen();rec.replay(TransformPen(p,matrix));return p

def mapped_core(paths,destination):
 rec=fit_outline(paths);src=bounds_record(rec)
 if not src or not destination:return rec
 x0,y0,x1,y1=src;X0,Y0,X1,Y1=destination
 sx=(X1-X0)/(x1-x0);sy=(Y1-Y0)/(y1-y0)
 return transform(rec,(sx,0,0,sy,X0-x0*sx,Y0-y0*sy))

def install(f,n,rec):
 g=ttglyph(rec);f['glyf'][n]=g;g.recalcBounds(f['glyf'])
 advance,_=f['hmtx'][n];f['hmtx'][n]=(advance,g.xMin if g.numberOfContours else 0)


def update_cmap(f,cmap):FontBuilder(font=f).setupCharacterMap(cmap)

def extend_greek_marks(f,origins):
 cmap=f.getBestCmap()
 cmap[0x342]=cmap[0x303]
 origins[0x342]='Perispômeni combinante: glifo de til da base, código Unicode próprio'
 for cp,source,model in [(0x344,0x385,0x308),(0x345,0x37a,0x323)]:
  n=f'ppmark{cp:04X}';ref=cmap[model]
  rec=record_glyph(f,cmap[source]);b=bounds_record(rec);m=bounds_record(record_glyph(f,ref))
  dx=(m[0]+m[2]-b[0]-b[2])/2
  dy=(m[1]-b[1]) if cp==0x344 else (m[3]-b[3])
  g=ttglyph(transform(rec,(1,0,0,1,dx,dy)));order=list(f.getGlyphOrder())
  f['glyf'][n]=g;g.recalcBounds(f['glyf']);f['hmtx'][n]=(0,g.xMin);order.append(n);f.setGlyphOrder(order)
  if 'GDEF' in f and f['GDEF'].table.GlyphClassDef:
   f['GDEF'].table.GlyphClassDef.classDefs[n]=3
  for lookup in f['GPOS'].table.LookupList.Lookup:
   for sub0 in lookup.SubTable:
    sub=sub0.ExtSubTable if hasattr(sub0,'ExtSubTable') else sub0
    for covattr,arrayattr,recordsattr,countattr in [('MarkCoverage','MarkArray','MarkRecord','MarkCount'),('Mark1Coverage','Mark1Array','MarkRecord','MarkCount'),('Mark2Coverage','Mark2Array','Mark2Record','Mark2Count')]:
     if not hasattr(sub,covattr):continue
     cov=getattr(sub,covattr)
     if ref not in cov.glyphs:continue
     arr=getattr(sub,arrayattr);records=getattr(arr,recordsattr);idx=cov.glyphs.index(ref)
     cov.glyphs.append(n);records.append(copy.deepcopy(records[idx]));setattr(arr,countattr,len(records))
  cmap[cp]=n;origins[cp]='Marca grega composta: contornos DejaVu e ancoragem OpenType adaptada'
 update_cmap(f,cmap)



def distinct_ge_and_r(f,origins):
 """Give Cyrillic г and Latin r deliberately different silhouettes.
 г is architectural: a long flat lintel, one vertical support, a short
 squared terminal at the far right and an asymmetric base.
 r is calligraphic: a curved rising shoulder ending in a round leaf-like drop.
 """
 cmap=f.getBestCmap()
 def rectangle(x0,y0,x1,y1):
  q=pathops.Path();p=q.getPen();p.moveTo((x0,y0));p.lineTo((x1,y0));p.lineTo((x1,y1));p.lineTo((x0,y1));p.closePath();return q
 def unite(*items):
  out=items[0]
  for item in items[1:]:out=pathops.op(out,item,pathops.PathOp.UNION)
  return out
 def recording(q):
  out=RecordingPen();q.draw(out);return out
 ge_stem=rectangle(176,82,354,1000)
 ge_top=rectangle(115,936,1010,1110)
 ge_end=rectangle(858,806,1010,1010)
 ge_foot=pathops.Path();p=ge_foot.getPen()
 p.moveTo((92,0));p.lineTo((510,0));p.lineTo((510,76));p.lineTo((354,98));p.lineTo((176,98));p.lineTo((92,70));p.closePath()
 ge=unite(ge_stem,ge_top,ge_end,ge_foot);ge.convertConicsToQuads()
 r_stem=rectangle(158,76,334,954)
 r_foot=pathops.Path();p=r_foot.getPen()
 p.moveTo((70,0));p.lineTo((515,0));p.lineTo((515,72));p.lineTo((334,100));p.lineTo((158,100));p.lineTo((70,72));p.closePath()
 shoulder=pathops.Path();p=shoulder.getPen();p.moveTo((268,822))
 p.curveTo((390,1052),(586,1140),(765,1002));p.curveTo((822,958),(848,880),(843,814));p.endPath()
 shoulder.stroke(142,pathops.LineCap.ROUND_CAP,pathops.LineJoin.ROUND_JOIN,4);shoulder.convertConicsToQuads()
 drop=pathops.Path();p=drop.getPen();p.moveTo((782,927));p.curveTo((858,950),(929,908),(944,837));p.curveTo((953,770),(906,710),(839,714));p.curveTo((780,720),(746,786),(782,927));p.closePath()
 rr=unite(r_stem,r_foot,shoulder,drop);rr.convertConicsToQuads()
 for cp,q,advance,origin in [
  (0x0433,ge,1080,'Peregrini 1.1: г angular, lintel longo e terminal quadrado'),
  (0x0072,rr,1030,'Peregrini 1.1: r caligráfico, ombro curvo e terminal em gota')]:
  n=cmap[cp];g=ttglyph(recording(q));f['glyf'][n]=g;g.recalcBounds(f['glyf']);f['hmtx'][n]=(advance,g.xMin);origins[cp]=origin

def extend_math(f,origins):
 mf=TTFont(MATH);mc=mf.getBestCmap();c=f.getBestCmap();scale=f['head'].unitsPerEm/mf['head'].unitsPerEm
 additions=[cp for cp in mc if cp not in c and (0x2000<=cp<=0x2bff or 0x1d400<=cp<=0x1d7ff)]
 order=list(f.getGlyphOrder())
 for cp in additions:
  n=f'ppmath{cp:05X}';rec=transform(record_glyph(mf,mc[cp]),(scale,0,0,scale,0,0));g=ttglyph(rec)
  f['glyf'][n]=g;g.recalcBounds(f['glyf']);f['hmtx'][n]=(round(mf['hmtx'][mc[cp]][0]*scale),g.xMin if g.numberOfContours else 0)
  c[cp]=n;order.append(n);origins[cp]='Latin Modern Math: adaptação de escala; licença GUST'
 f.setGlyphOrder(order);update_cmap(f,c)


def decorate(rec):
 """Vector engraved border and attached botanical branch; all paths are
 monochrome and remain scalable. Used for additional uppercase repertoire."""
 b=bounds_record(rec)
 if not b:return rec
 x0,y0,x1,y1=b;h=y1-y0
 if h<300:return rec
 base=pathops.Path();rec.replay(base.getPen())
 # Interior engraving follows the actual letter rather than generic overlay.
 boundary=pathops.Path(base);boundary.stroke(44,pathops.LineCap.ROUND_CAP,pathops.LineJoin.ROUND_JOIN,4);boundary.convertConicsToQuads()
 inner=pathops.op(base,boundary,pathops.PathOp.DIFFERENCE)
 groove=pathops.Path(inner);groove.stroke(9,pathops.LineCap.ROUND_CAP,pathops.LineJoin.ROUND_JOIN,4);groove.convertConicsToQuads()
 cut=pathops.op(base,groove,pathops.PathOp.DIFFERENCE)
 # Larger attached foliage, matched to the density of the approved initials.
 deco=cut
 w=x1-x0
 for branch_index in range(2):
  start=(x0+w*.12,y0+h*.05) if branch_index==0 else (x1-w*.12,y0+h*.055)
  end=(x0+w*.35,y0+h*.86) if branch_index==0 else (x1-w*.32,y0+h*.49)
  c1=(start[0]-h*.06,start[1]+h*.25) if branch_index==0 else (start[0]+h*.06,start[1]+h*.17)
  c2=(end[0]-h*.03,end[1]-h*.16) if branch_index==0 else (end[0]+h*.07,end[1]-h*.14)
  vine=pathops.Path();vp=vine.getPen();vp.moveTo(start);vp.curveTo(c1,c2,end);vp.endPath()
  vine.stroke(14,pathops.LineCap.ROUND_CAP,pathops.LineJoin.ROUND_JOIN,4);vine.convertConicsToQuads()
  deco=pathops.op(deco,vine,pathops.PathOp.UNION)
  count=5 if branch_index==0 else 3
  for k in range(count):
   t=(k+1)/(count+1)
   x,y=[(1-t)**3*start[j]+3*(1-t)**2*t*c1[j]+3*(1-t)*t*t*c2[j]+t**3*end[j] for j in (0,1)]
   side=-1 if (k+branch_index)%2==0 else 1
   length=h*(.145 if branch_index==0 else .115)
   tip=(x+side*length*.64,y+length)
   leaf=pathops.Path();lp=leaf.getPen();lp.moveTo((x,y))
   lp.curveTo((x+side*length*.85,y+length*.16),(tip[0]+side*length*.1,tip[1]-length*.16),tip)
   lp.curveTo((x+side*length*.05,y+length*.69),(x-side*length*.06,y+length*.22),(x,y));lp.closePath()
   vein=pathops.Path();v=vein.getPen();v.moveTo((x,y+length*.1));v.curveTo((x+side*length*.2,y+length*.45),(tip[0]-side*length*.12,tip[1]-length*.21),(tip[0],tip[1]-length*.07));v.endPath()
   vein.stroke(7,pathops.LineCap.ROUND_CAP,pathops.LineJoin.ROUND_JOIN,4);vein.convertConicsToQuads()
   leaf=pathops.op(leaf,vein,pathops.PathOp.DIFFERENCE)
   deco=pathops.op(deco,leaf,pathops.PathOp.UNION)
 out=RecordingPen();deco.draw(out);return out


def rename(f,family):
 original_license=f['name'].getDebugName(13) or 'See bundled licenses.'
 f['name'].names=[]
 FontBuilder(font=f).setupNameTable({'familyName':family,'styleName':'Regular','uniqueFontIdentifier':family.replace(' ','')+'-1.100','fullName':family+' Regular','psName':family.replace(' ','')+'-Regular','version':'Version 1.100','copyright':'Peregrini artwork and adaptations; includes Bitstream/DejaVu and Latin Modern components. See accompanying credits and licenses.','description':'Hybrid Peregrini collection. Original approved core drawings refined; extended repertoire from credited open vector foundations.','licenseDescription':original_license+'; mathematical additions under GUST Font License. See bundled licenses.'})
 f['head'].fontRevision=1.1
 # Clear stale names/signatures and math metrics that were not recalibrated.
 for tag in ['DSIG','FFTM','MATH']:
  if tag in f:del f[tag]
 f['OS/2'].fsType=0
 # Uniform generous metrics for all polytonic marks and capital ornaments.
 f['hhea'].ascent=2350;f['hhea'].descent=-650;f['hhea'].lineGap=0
 f['OS/2'].sTypoAscender=2350;f['OS/2'].sTypoDescender=-650;f['OS/2'].sTypoLineGap=0
 f['OS/2'].usWinAscent=2700;f['OS/2'].usWinDescent=900
 f['OS/2'].fsSelection |= (1<<7)
 f['OS/2'].version=max(f['OS/2'].version,4)
 for field,default in [('sxHeight',1063),('sCapHeight',1493),('usDefaultChar',0),('usBreakChar',32),('usMaxContext',8)]:
  if not hasattr(f['OS/2'],field):setattr(f['OS/2'],field,default)


def export(f,stem):
 path=ROOT/'fontes/ttf'/f'{stem}.ttf';f.save(path)
 web=TTFont(path);web.flavor='woff2';web.save(ROOT/'fontes/woff2'/f'{stem}.woff2')
 # Real CFF OTF, not a renamed TrueType file; keep layout tables and names.
 src=TTFont(path);gs=src.getGlyphSet();cs={}
 for n in src.getGlyphOrder():
  pen=T2CharStringPen(src['hmtx'][n][0],None)
  rec=DecomposingRecordingPen(gs);gs[n].draw(rec);rec.replay(pen);cs[n]=pen.getCharString()
 ot=copy.deepcopy(src)
 for tag in ['glyf','loca','fpgm','prep','cvt ','gasp']:
  if tag in ot:del ot[tag]
 ot.sfntVersion='OTTO';ot['maxp']=newTable('maxp');ot['maxp'].tableVersion=0x00005000;ot['maxp'].numGlyphs=len(cs)
 fb=FontBuilder(font=ot,isTTF=False)
 fb.setupCFF(stem,{'FullName':src['name'].getDebugName(4),'FamilyName':src['name'].getDebugName(1),'Weight':'Regular'},cs,{})
 ot.save(ROOT/'fontes/otf'/f'{stem}.otf')


def build(family):
 f=TTFont(BASE);cmap=f.getBestCmap();origins={cp:'DejaVu Serif: base vetorial licenciada' for cp in cmap}
 extend_math(f,origins);extend_greek_marks(f,origins);cmap=f.getBestCmap()
 if family=='Display':
  source=CORE['display']
  # Only alphabetic drawings: alpha punctuation was provisional geometry.
  for ch,(w,paths) in source.items():
   if not ch.isalpha() or ord(ch) not in cmap:continue
   n=cmap[ord(ch)];dst=bounds_record(record_glyph(f,n))
   install(f,n,mapped_core(paths,dst));origins[ord(ch)]='Peregrini: contorno aprovado suavizado e ajustado às métricas'
  # Apply the same design to encoded homographs without changing Unicode.
  for group in HOMOGRAPHS:
   base=group[0]
   if base not in source:continue
   rec=record_glyph(f,cmap[ord(base)])
   for ch in group[1:]:
    if ord(ch) in cmap:
     dst=bounds_record(record_glyph(f,cmap[ord(ch)]));sb=bounds_record(rec)
     install(f,cmap[ord(ch)],transform(rec,((dst[2]-dst[0])/(sb[2]-sb[0]),0,0,(dst[3]-dst[1])/(sb[3]-sb[1]),dst[0]-sb[0]*(dst[2]-dst[0])/(sb[2]-sb[0]),dst[1]-sb[1]*(dst[3]-dst[1])/(sb[3]-sb[1]))))
     origins[ord(ch)]='Peregrini: desenho compartilhado, código Unicode distinto'
 elif family=='Iluminada':
  # Keep encoded uppercase/titlecase from Latin, Greek and Cyrillic, all
  # required combining marks and spaces. No lowercase/digit cmap entries.
  capset={cp for cp in cmap if (cp<0x530 or 0x1e00<=cp<=0x1fff) and unicodedata.category(chr(cp)) in ['Lu','Lt']}
  keep=capset|{cp for cp in cmap if unicodedata.category(chr(cp)) in ['Mn','Mc'] and cp<0x370}|{32,160}
  raw=copy.deepcopy(f);rawmap=raw.getBestCmap()
  source=CORE['iluminada'];baseNames={}
  # Decorate simple base capitals first, so composites inherit their outlines.
  for cp in sorted(capset):
   n=cmap[cp]
   if n in baseNames or f['glyf'][n].isComposite():continue
   ch=chr(cp);rec=record_glyph(raw,n)
   if ch in source:
    rec=mapped_core(source[ch][1],bounds_record(rec));origin='Peregrini Iluminada: desenho aprovado suavizado'
   else:
    # Homographs reuse the approved shape when available.
    ref=next((group[0] for group in HOMOGRAPHS if ch in group and group[0] in source),None)
    if ref:rec=mapped_core(source[ref][1],bounds_record(rec));origin='Peregrini Iluminada: desenho equivalente, Unicode distinto'
    else:rec=decorate(rec);origin='DejaVu Serif adaptada com gravura e ornamentação vetorial Peregrini'
   install(f,n,rec);origins[cp]=origin;baseNames[n]=True
  # Some apparently plain capitals are aliases/composites. Those inherit the
  # decorated referenced base. Accents retain the original component offsets.
  for cp in sorted(capset):
   n=cmap[cp]
   if f['glyf'][n].isComposite():origins[cp]='Composição Unicode com base ornamental e sinais da base DejaVu'
  options=subset.Options();options.hinting=False;options.notdef_glyph=True;options.notdef_outline=True;options.recommended_glyphs=True;options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*'];options.layout_features=['*']
  sub=subset.Subsetter(options=options);sub.populate(unicodes=keep);sub.subset(f)
  origins={cp:origins[cp] for cp in f.getBestCmap()}
 if family in ['Display','Texto']:
  distinct_ge_and_r(f,origins)
 # Strip stale point-index hint programs from modified/composite outlines.
 if family!='Texto':
  for g in f['glyf'].glyphs.values():g.removeHinting()
  for tag in ['fpgm','prep','cvt ','gasp']:
   if tag in f:del f[tag]
 rename(f,'Palavra Peregrini '+family)
 export(f,'PalavraPeregrini'+family+'-Regular')
 coverage=f.getBestCmap()
 with open(ROOT/'documentacao'/f'Unicode-{family}.csv','w') as file:
  w=csv.writer(file);w.writerow(['Unicode','Caractere','Nome','Origem'])
  for cp in sorted(coverage):w.writerow([f'U+{cp:04X}',chr(cp),unicodedata.name(chr(cp),''),origins.get(cp,'Base licenciada')])
 return {'family':family,'unicode_count':len(coverage),'glyph_count':len(f.getGlyphOrder()),'missing_required':sorted(EXPECTED-set(coverage)) if family!='Iluminada' else sorted({cp for cp in EXPECTED if cp<0x2000 and unicodedata.category(chr(cp)) in ['Lu','Lt']} - set(coverage))}

if __name__=='__main__':
 reports=[]
 for fam in ['Display','Texto','Iluminada']:
  r=build(fam);reports.append(r);print(r,flush=True)
 (ROOT/'documentacao/Construcao.json').write_text(json.dumps(reports,indent=2))
