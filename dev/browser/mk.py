s=open('/home/claude/cubiverse/index.html',encoding='utf-8').read()
a=s.index('<script>\n'); b=s.rindex('</script>')
js=s[a:b]; i=js.rindex('})();')
hook="window.__t={startGame,exitGame,P,cam,joy,keys,inp,getG:()=>G,getS:()=>S,GAMES,MITEMS,VEH,MWPN,FRUITS,ALLY,MOON,ENG,PA:()=>PA,NET,netHost,netJoin,netSay,netOpenPanel,getMode:()=>mode,BGM,getAC:()=>AC};\n"
open('/home/claude/browser/game_t.html','w',encoding='utf-8').write(s[:a]+js[:i]+hook+js[i:]+s[b:])
