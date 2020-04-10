# PROJET APPLICATIONS WEB : CODAGE D'UN MORPION - jeu multijoueur en Javascript.

## Morpion nouvelle génération où le tigre veut manger le mouton, mais peut-être que le mouton saura s'échapper. A vous de montrer si vous êtes plus malin que le joueur d'en face !
Rendu de **Jules Vanaret** et **Victoire Miossec**

## Fonctionnalités du jeu
- Le jeu s'ouvre grâce au makefile joint à ce dossier. Il suffit donc de taper la commande `make` dans votre terminal, une fois que celui-ci est dans le dossier morpion. Vous n'aurez plus qu'à lancer une partie dans votre navigateur en vous connectant au port 3003 : `localhost:3003` dans la barre d'adresse de votre navigateur.

- Si le makefile ne fonctionne pas (question de compatibilité des systèmes d'exploitation par exemple) : tapez les commandes suivantes (ou équivalentes selon votre OS)
  - `sudo apt install npm`
  - `npm install`
  - `npm install socket.io`
  - npm run devstart`
  - ouvrez un onglet de votre navigateur et connectez-vous au port 3003 en tapant dans la barre d'adresse : `localhost:3003`

- En ouvrant un deuxième onglet (`localhost:3003`), vous connectez un deuxième joueur et ainsi de suite.

- Les deux premiers joueurs connectés s'affrontent - après avoir choisi pseudo et couleur - sur le plateau de morpion. Les suivants qui se connectent observent la partie.

- Chaque joueur peut interagir *via* le chat.

- Si un joueur se déconnecte (en fermant son onglet) :
  - soit il était joueur actif, prenant part à la partie, auquel cas le premier joueur dans la file d'attente le remplace
  - soit il était passif, attendant patiemment son tour, auquel cas la file d'attente remonte.

## Bugs que nous ne sommes pas parvenus à régler
Si le jeu marche dans son ensemble, il subsiste néanmoins quelques bugs que nous ne sommes pas parvenus à localiser, malgré de longues heures passées à débugger et commenter notre code.

- Le premier, aléatoire : quand on ouvre un nouvel onglet de joueur actif (*id est* l'un des deux premiers onglets ouverts de la partie), l'étape de saisie de la couleur est parfois passée et le navigateur nous envoie directement sur le plateau, sans assigner de couleur au joueur, chose visible dans la colonne du chat : quand une couleur a été assignée à un joueur, c'est notifié. La couleur reste `undefined` et le jeu bloque pour les suivants.
Il suffit en général de fermer le ou les onglets et de se remettre sur le port 3003 une ou plusieurs fois de suite jusqu'à ce que la partie fonctionne. Ce bug est quasiment systématique à l'ouverture du tout premier onglet. Une fois celui-ci fermé, puis rouvert, le bug n'apparaît plus qu'aléatoirement.

- Un autre bug est l'affichage de plusieurs boîtes de dialogues à la suite pour signaler à un joueur qu'il a gagné à la fin d'une partie, au lieu d'une seule et unique fois (nombre qui varie également aléatoirement la boîte de dialogue ne s'ouvre parfois qu'une fois comme dix d'affilée selon les parties).

- Enfin, il arrive - rarement - que les scores ne se mettent pas à jour dès le début et restent à 0 après la première partie (pour ensuite s'incrémenter à partir de la deuxième).

## Qui a fait quoi ?
- Codage de la structure HTML + Plateau de référence + Placement des pions : **Victoire Miossec**
- Codage des règles du jeu pour gagner : **Victoire Miossec**
- Codage du choix des couleurs et pseudo : **Jules Vanaret** pour les fonctions de base, **Victoire Miossec** pour les résolutions de conflit (deux joueurs qui choisiraient la même couleur)
- Codage du tour à tour (fonction qui permet de ne pas jouer deux cases de suite et de ne pouvoir jouer qu'après le tour de l'adversaire) : **Jules Vanaret**
- Codage de la liste d'attente des joueurs passifs : **Jules Vanaret**
- Codage du décompte des scores, de leur mise à jour et affichage : **Victoire Miossec**
- Codage de l'esthétique du jeu : **Victoire Miossec**
- Codage du chat : **Jules Vanaret**
