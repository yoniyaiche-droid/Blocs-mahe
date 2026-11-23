#!/usr/bin/env python3
"""Publie une nouvelle version : python3 deploy.py chemin/vers/index.html "message" """
import re,sys,time,subprocess
src,msg=sys.argv[1],(sys.argv[2] if len(sys.argv)>2 else 'Mise à jour')
h=open(src,encoding='utf-8').read()
old=open('index.html',encoding='utf-8').read()
tags=old[old.index('<link rel="manifest"'):old.index('<link rel="apple-touch-icon" href="icon-192.png">')+len('<link rel="apple-touch-icon" href="icon-192.png">')]+"\n"
build=str(int(time.time()))
upd='''<meta name="build" content="%s">
<script>(function(){var B="%s",ready=false;function ingame(){var h=document.getElementById("hud");return h&&h.classList.contains("on")}function go(){if(ingame()){setTimeout(go,3000);return}location.reload()}function chk(){if(ready||!navigator.onLine)return;fetch("index.html?c="+Date.now(),{cache:"no-store"}).then(function(r){return r.text()}).then(function(t){var m=t.match(/name="build" content="(\\d+)"/);if(m&&m[1]!==B){ready=true;if(navigator.serviceWorker)navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.update()})});go()}}).catch(function(){})}document.addEventListener("visibilitychange",function(){if(!document.hidden)chk()});setTimeout(chk,8000);setInterval(chk,600000)})();</script>
'''%(build,build)
i=h.index('<meta name="viewport"'); j=h.index('\n',i)+1
out=h[:j]+tags+upd+h[j:]
reg='<script>if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0){addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>\n'
k=out.rindex('</body>'); out=out[:k]+reg+out[k:]
open('index.html','w',encoding='utf-8').write(out)
s=open('sw.js',encoding='utf-8').read()
s=re.sub(r"const CACHE='[^']*'","const CACHE='blocs-mahe-"+build+"'",s); open('sw.js','w',encoding='utf-8').write(s)
subprocess.run(['git','add','-A'],check=True)
subprocess.run(['git','commit','-q','-m',msg+"\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01TtNEadCxBEtiwj42aMs3xN"],check=True)
subprocess.run(['git','push','-q','origin','main'],check=True)
print('publié, build',build)
