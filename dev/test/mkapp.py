import re,sys
s=open('/home/claude/blocs-mahe/dev/index.master.html',encoding='utf-8').read()
a=s.index('<script>\n')+len('<script>\n'); b=s.rindex('</script>')
js=s[a:b]
hook="window.__t={startGame,exitGame,P,cam,joy,keys,getG:()=>G,getS:()=>S,lobby,renderShop,switchTab,BR_BY_ID,MB,GAMES,MITEMS,VEH,MWPN:(typeof MWPN!=='undefined'?MWPN:null),ENG:ENG,FRUITS:(typeof FRUITS!=='undefined'?FRUITS:null),ALLY:(typeof ALLY!=='undefined'?ALLY:null),MOON:(typeof MOON!=='undefined'?MOON:null),OBW,BRMUT,BENV,PET_BY_ID,RAR,sanitizeItem,newEgg,PAL,SLIME,HEROES,GFX,gfxApply,heroUse,getPA:()=>PA};\n"
i=js.rindex('})();')
js=js[:i]+hook+js[i:]
open('/home/claude/test/app.js','w',encoding='utf-8').write(js)
print(len(js))
