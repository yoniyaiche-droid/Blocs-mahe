s=open('/home/claude/blocs-mahe/dev/index.master.html',encoding='utf-8').read()
a=s.index('<script>\n'); b=s.rindex('</script>')
js=s[a:b]; i=js.rindex('})();')
hook="window.__t={startGame,exitGame,P,cam,joy,keys,inp,getG:()=>G,getS:()=>S,TU,TUTO,tutoStart,tutoEnd,pauseMenu,getPause:()=>PAUSE,GAMES,MITEMS,VEH,MWPN,FRUITS,ALLY,MOON,ENG,PA:()=>PA,NET,netHost,netJoin,netSay,netOpenPanel,netSync,netPeers,netLive,netLeave,netClosePanel,netSuggest,showResult,switchTab,shareMenu,openChoice,closeChoice,getMode:()=>mode,BGM,getAC:()=>AC,HEROES,GFX,gfxApply,heroUse,refreshLobbyAvatar,bsNew};\n;if(!/tuto/.test((typeof location!=='undefined'&&location.search)||'')) Object.keys(GAMES).forEach(k=>{ S.tuto[k]=1; }); if(!/ez/.test(location.search)){ S.ez.cam=false; S.ez.aim=false; }"
open('/home/claude/browser/game_t.html','w',encoding='utf-8').write(s[:a]+js[:i]+hook+js[i:]+s[b:])
