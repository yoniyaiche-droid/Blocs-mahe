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
| `dev/parts/*.js` | Morceaux ajoutés récemment, **déjà intégrés** dans `index.master.html` (gardés pour référence). |
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
- `royale` Bataille Royale : inchangée sauf musique et couleurs.
- `mc` Monde de Blocs (monde infini) : armes 150-154, fusée 160, missions, argent, alliés, Lune ; **jeu à distance** (PeerJS 1.5.4 via jsDelivr/unpkg, code de 5 lettres, monde partagé, avatars, messages rapides). Ids d'objets pris : 100-102, 110-119, 130-142, 150-154, 160.
- `pirates` Océan des Fruits : îles, bateau, 6 fruits mystiques qui transforment, boss.

Outils communs : `addSky`, `setLights`, `texMat`/`texC` (textures dessinées), `addAmb` (particules), musique `SONGS`/`bgmPlay` (bouton 🎵), `introCard`, `openChoice`/`closeChoice`.

Sauvegarde : `S` dans `localStorage` (valeurs par défaut `DEF`, nettoyage au chargement). Le monde Minecraft est dans `cubiverse-mc-v1`.

## Pièges connus

- Un élément HTML créé seulement par `hudHTML` n'existe pas au chargement : ne pas faire `$('id').addEventListener` au niveau du module (ça a bloqué tout le menu). Utiliser une délégation sur `#hud`.
- `G.sky` était déjà utilisé par un ancien jeu : le dôme de ciel s'appelle `G.skyDome`.
- Le faux DOM des tests Node n'a pas `querySelector`.

## Tester (les chemins dans les scripts sont ceux de l'ancienne session : à adapter)

1. `dev/test/mkapp.py` lit la page et écrit `app.js` avec un accès `window.__t`. Puis `SEED=7 node harness.js`, `SEED=3 node t_pir.js`, `SEED=11 node t_mc2.js`, `SEED=5 node t_modern.js` → « TOUT EST OK ».
2. Chrome : récupérer three.js r128 par git (pas d'accès réseau direct) :
   `git clone --depth 1 --branch r128 --filter=blob:none --sparse https://github.com/mrdoob/three.js && cd three.js && git sparse-checkout set build`
   puis `python3 mk.py`, un serveur `python3 -m http.server 8767`, et `node run.js http://127.0.0.1:8767/game_t.html x.png t_all.js` (puppeteer dans `/opt/npm-tools/node_modules`, Chrome dans `/usr/bin/google-chrome`). `run2.js` teste le jeu à distance avec deux téléphones simulés.

## Idées pas encore faites

- Bataille Royale : nouveautés de gameplay.
- Jeu à distance pour d'autres jeux que le Monde de Blocs (animaux et véhicules garés non partagés).
- Export / import de la sauvegarde.
- Tests au toucher sur un vrai téléphone (jamais faits).
