# Blocs Mahé — notes pour reprendre le projet

Jeu fait pour le fils de Yaiche, en français, sur téléphone. Tous les noms et dessins doivent rester **originaux** (pas de personnages ni de marques existants).

- Jeu en ligne : https://yoniyaiche-droid.github.io/Blocs-mahe/ (PWA installée sur le téléphone)
- Aperçu Claude (artefact) : slug `7aabf7c8-6b16-4642-9b02-0fc58bc9dbae`
- Un seul fichier HTML, three.js r128 (cdnjs), tout le code dans une seule fonction `(function(){ … })()`.

## Fichiers

| Chemin | Rôle |
|---|---|
| `dev/index.master.html` | **Source principale** à modifier (sans les balises PWA). |
| `index.html` (racine) | Version publiée = source + balises PWA + mise à jour automatique + service worker. Générée par `deploy.py`, ne pas modifier à la main. |
| `deploy.py` | `python3 deploy.py chemin/vers/index.master.html "message"` : ajoute les balises PWA, numérote la version (`<meta name="build">`), change le cache de `sw.js`, commit et push. |
| `sw.js`, `manifest.webmanifest`, icônes | PWA (hors connexion, mise à jour auto au menu seulement, jamais en pleine partie). |
| `dev/parts/*.js`, `*.css` | Morceaux ajoutés récemment, **déjà intégrés** dans `index.master.html` (gardés pour référence ; le dernier : `royale2.js` + `royale2.css`). |
| `dev/test/` | Tests simulés sous Node (faux DOM, faux three.js). |
| `dev/browser/` | Tests dans un vrai Chrome sans écran (puppeteer). |

## Jeux (objet `GAMES[id]`, liste du menu `GAME_LIST`)

`startGame(id)` fait `G=Object.create(GAMES[id])` puis appelle `start()`, `update(dt)`, `hud()`, `onAction()`, `onKey(code)`, `stop()`…

- `obby` Parcours Arc-en-ciel : 4 mondes (`OBW` : Bonbons, Volcan, Glace, Espace), étoiles, fantôme (`localStorage` `blocsmahe-ghost-v1`), pièges (tombe, clignote, tapis, glace `ice`, barres qui tournent, jets de feu).
- `arena` Arène des Slimes : colisée de nuit, slimes `split`/`spit`/`bomb`/`king`, bonus, combos, améliorations toutes les 3 vagues (`openChoice`).
- `island` Île au Trésor : île tropicale, 10 gemmes, 3 trésors à creuser (+20 s), crabes, coucher de soleil.
- `build` Bâtisseur : 4 ambiances (`BENV`, `S.buildEnv`), annuler, remplir, pipette, matières texturées (`PAL`).
- `eggs` Voleurs d'Œufs : ferme, ❗ des gardiens, animaux brillants (`sh`), œuf doré, compagnon.
- `brainrot` Brainrot Bazar : néons, mutations (`BRMUT`, `S.br.muts`), fête disco, pluie de billets, album (`S.br.dex`).
- `royale` Bataille Royale (section 18, `parts/royale2.js`) : au départ, choix du mode (`RB_MODES` : `easy` Tranquille, `classic`, `duo` avec un robot allié ; retenu dans `S.rb.mode`), la montgolfière attend ce choix (`G.setMode(k)`). Île modernisée (ciel, plage, chemins, fontaine, phare, moulin, bateaux, tempête animée). Équipes : `team` 0 = joueur + allié, pas de tir ami. 5 cases d'objets (touche 1-5) ; nouveaux objets empilables `grenade` (Bonbombe, ×3, lancer en cloche) et `grapple` (Grappin, ×4) ; les robots ne les ramassent pas. Karts (`G.karts`, bouton `#bKart` ou touche R, on bouscule les robots), champignons rebondissants (`G.pads`, vol plané), ravitaillements avec ballons au début des phases de tempête 2 et 4 (`spawnDrop`), robots qui construisent un mur quand on les touche (`buildAt`), chiffres de dégâts (`#dmgNums`), séries d'éliminations, record `S.best.royaleKills`.
- Section 19 (`parts/core3.js`) : **héros inventés** `HEROES` (3 par nouveau jeu, `g` = id du jeu, `pk` = petit avantage, `av` = avatar complet), `heroPick(G,gid,cb)` ouvre le choix au début du jeu, `heroUse` remplace `PA`. Les héros s'achètent comme avatars (boutique, `S.owned.hero`). Nouveaux chapeaux/visages, accessoires `ACCS` (`S.avatar.acc`, `buildAcc`, animés), couleur de cheveux `S.avatar.hair`. Boutons propres à un jeu : `gxSet(html)` dans `#gx`, clics par `data-k` → `G.onBtn(k,appuyé)`. Caméra libre : `G.camUpd(dt)`. Nouveaux jeux ajoutés au menu par `GAME_EXTRA.push(...)`.
- **Qualité graphique** (`GFXL`, bouton ✨ de l'accueil, `S.gfx` auto/high/med/low, `S.gfxAuto`) : Haute = post-traitement maison (`gfxRender` : rendu dans une cible MSAA, lueur sur les zones très lumineuses, couleurs, vignette, FXAA si pas de WebGL2), ombres 2048 ; Moyenne = ombres 1024 + vignette CSS ; Basse = sans ombres. En auto, si moins de 40 images/s pendant 4 s, la qualité baisse d'un cran. Réglage par jeu : `G.bloom` (force), `G.bloomTh` (seuil de luminance).
- `race` Turbo Bolides (section 20) : circuit fermé (spline `RC_PTS`, `rcTrack`, route en ruban), ville au coucher du soleil (immeubles instanciés aux fenêtres lumineuses, palmiers, lampadaires, mer), physique arcade maison (`G.frozen`, `car.h` cap / `car.vh` direction du mouvement pour le dérapage, sauts sur les bosses), 5 adversaires sur des couloirs, turbo (jauge remplie en dérapant, en sautant, en bousculant), 3 tours, mini-carte. `S.race`.
- `plat` Royaume Saute-Nuage (section 21) : plateformes vue de côté, physique maison sur une grille de cases (`G.frozen`, `step`), niveaux assemblés à partir de morceaux `PK` (12 lignes, légende en tête de section) listés par monde dans `PWORLDS[i].lv`, 3 grandes étoiles par monde, ennemis inventés `PE`, bonus (bulle, feuille-boomerang `#bAct`, chaussures à ressort), plateformes mobiles, lanternes (reprise), arrivée en montgolfière. `S.plat` (mondes ouverts, étoiles, records). Un robot coureur dans `t_plat.js` vérifie qu'on peut finir les 4 mondes.
- `jungle` Course de la Jungle (section 22) : couloir 3D vers -z (caméra fixe derrière, `cam.yaw=0`), physique commune `stepPlayer` + grille de collisions empruntée à la Bataille Royale (`solid/gridAdd/query`), niveaux assemblés depuis les morceaux `JK` (7 colonnes de 1,5 m, légende en tête de section) listés dans `JLV[i].lv`. Toupie (`#bAct`/E), caisses (baies, rebond, reprise, pétard à mèche, luciole gardienne, fer), ennemis inventés, troncs qui roulent dans leur morceau, tronc qui se balance, nénuphars au ras de la berge, pierre-soleil à l'arrivée, gemme si toutes les caisses sont cassées. `S.jungle`.
- `temple` Temple d'Émeraude (section 23) : une aventure en 7 salles le long de -z (coordonnées écrites en dur dans `build`), caméra orbitale normale, `stepPlayer` + grille de collisions de la Bataille Royale. Salle 2 : blocs poussés en marchant dedans (`blocks`, dalles `plates`, dalle ↺ de remise à zéro), mur de lianes (`vine`). Salle 3 : pics en rangées alternées + fléchettes. Salle 4 : leviers dans l'ordre de la fresque (`order`, tiré au hasard). Salle 5 : lave, dalles qui tombent, plateforme mobile. Salle 6 : rocher (`boulder`) qui finit dans le trou. Salle 7 : idole d'émeraude. 5 reliques, lance-pierre (`#bAct`/E), radar de la Pr Pistache via `#compass`, 3 lumières qui suivent les torches proches. `S.temple`.
- `beast` Bestioles Magiques (section 24, `parts/beast.js`) : île en 4 zones (`BS_ZONES` : Prairie, Forêt, Plage, Volcan) + village (fontaine qui soigne, boutique de Marchande Pomme, Mamie Tisane) + arène de la Capitaine Orage (champion `BS_CHAMP`, badge). 19 bestioles inventées (`BS_SP`, 6 types `BS_T`, forces `BS_STRONG`, attaques `BS_M`, évolutions par niveau), 3 de départ (`pickStarter`). Les bestioles errantes (`roam`) lancent un combat au contact. Combat au tour par tour dans une scène à part (`mkBattleScene`, échangée avec `this.scene` le temps du combat), file d'actions `this.inB.q` jouée dans `updBattle` (`say`, `q`, `qAttack`, `turn`, `throwJar`, `afterTurn`, `giveXp`, `endBattle`). Bocaux pour capturer, baies pour soigner, équipe de 6 max (le reste dans `box`), album (`dexMenu`). Défaite = retour au village soigné. `S.beast`.
- `mc` Monde de Blocs (monde infini) : armes 150-154, fusée 160, missions, argent, alliés, Lune ; **jeu à distance** (PeerJS 1.5.4 via jsDelivr/unpkg, code de 5 lettres, monde partagé, avatars, messages rapides). Ids d'objets pris : 100-102, 110-119, 130-142, 150-154, 160.
- `pirates` Océan des Fruits : îles, bateau, 6 fruits mystiques qui transforment, boss.

Outils communs : `addSky`, `setLights`, `texMat`/`texC` (textures dessinées), `addAmb` (particules), musique `SONGS`/`bgmPlay` (bouton 🎵), `introCard`, `openChoice`/`closeChoice`.

Sauvegarde : `S` dans `localStorage` (valeurs par défaut `DEF`, nettoyage au chargement). Le monde Minecraft est dans `cubiverse-mc-v1`.

## Pièges connus

- Un élément HTML créé seulement par `hudHTML` n'existe pas au chargement : ne pas faire `$('id').addEventListener` au niveau du module (ça a bloqué tout le menu). Utiliser une délégation sur `#hud`.
- `G.sky` était déjà utilisé par un ancien jeu : le dôme de ciel s'appelle `G.skyDome`.
- Le faux DOM des tests Node n'a pas `querySelector`.

## Tester (les scripts lisent `/home/claude/blocs-mahe/dev/index.master.html` et travaillent dans `/home/claude/test` et `/home/claude/browser` : copier `dev/test/*` et `dev/browser/*` dans ces dossiers)

1. `dev/test/mkapp.py` lit la page et écrit `app.js` avec un accès `window.__t`. Puis `SEED=7 node harness.js`, `SEED=3 node t_pir.js`, `SEED=11 node t_mc2.js`, `SEED=5 node t_modern.js`, `SEED=5 node t_royale.js`, `SEED=4 node t_race.js`, `SEED=3 node t_plat.js`, `SEED=3 node t_jungle.js`, `SEED=3 node t_temple.js`, `SEED=3 node t_beast.js` → « TOUT EST OK ». Attention : quelques vérifications de `harness.js` dépendent de la graine (déjà vrai avant la Bataille Royale, ex. graines 1, 4, 21) ; en cas d'échec isolé hors du jeu modifié, essayer une autre graine.
2. Chrome : récupérer three.js r128 par git (pas d'accès réseau direct) :
   `git clone --depth 1 --branch r128 --filter=blob:none --sparse https://github.com/mrdoob/three.js && cd three.js && git sparse-checkout set build`
   puis `python3 mk.py`, un serveur `python3 -m http.server 8767 --bind 127.0.0.1` (le lancer seul, comme tâche de fond), et `node run.js http://127.0.0.1:8767/game_t.html x.png t_all.js` (puppeteer dans `/opt/npm-tools/node_modules`, Chrome dans `/usr/bin/google-chrome`). `run2.js` teste le jeu à distance avec deux téléphones simulés. `t_royale_look.js` prend des captures de la Bataille Royale (`r1_choix.png`…). Même principe pour `t_race_look.js`, `t_plat_look.js`, `t_jungle_look.js`, `t_temple_look.js`, `t_beast_look2.js`.

## Idées pas encore faites

- Bataille Royale : jouer à distance avec des copains (comme le Monde de Blocs).
- Jeu à distance pour d'autres jeux que le Monde de Blocs (animaux et véhicules garés non partagés).
- Export / import de la sauvegarde.
- Tests au toucher sur un vrai téléphone (jamais faits).
