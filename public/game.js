//Gestion locale du jeu

// Import du canvas HTML
var canvas  = document.querySelector('#canvas');
var context = canvas.getContext('2d');
// Dimensions du canvas
var width = canvas.width;
var height = canvas.height;
// Côtés des carrés du canvas
var side = 1/3 * width;
var side2 = 1/4 * width;

// Future liste des participants
let players = [];
// Futur état du plateau
let game_state = [];
// Futurs scores
let players_scores = [];
// Permet d'annoncer la fin d'une partie. 0:partie en cours ; 1:partie terminée
let end = 0;
var gagnant;

// Variable qui donne l'état du participant dans le processus de choix du pseudo, de sa couleur
// s'il est joueur... Voir beginPseudo() et beginCouleur().
var r = 'new';
// Futur id du participant local
var player_id;
// Futur pseudo du participant local
var pseudo;
// Future couleur du joueur local
var couleur;
// Variable "à qui le tour" qui annonce qui est le prochain à jouer
var whoseTurn;
// Variable qui indique si le participant joue ou s'il est spectateur
var isPlaying;


// Ecoute de l'évènement 'message'. Le participant reçoit sont état de
// jeu de la part du serveur
socket.on('message', function(playState){
  isPlaying = playState;
});

// Ecoute de l'évènement 'should_begin'. Le participant vient d'être transformé
// en joueur, il doit donc choisir sa couleur
socket.on('should_begin', function(){
  beginColor();
});

// Ecoute de l'évènement 'Turn'. Le serveur dit au joueur qui
// doit jouer le prochain coup
socket.on('Turn', function(Turn){
  whoseTurn = Turn;
});

// Ecoute de l'évènement 'players_list'. Le joueur reçoit la liste
// des participants à jour de la part du serveur
socket.on('players_list', function(list) {
  players = list;
});

// Ecoute de l'évènement 'game_state'. Le joueur reçoit l'état
// du plateau à jour de la part du serveur
socket.on('game_state', function(list) {
  game_state = list;
});

// Ecoute de l'évènement 'scores'. Le joueur reçoit la liste
// des scores à jour de la part du serveur
socket.on('scores', function(list) {
  players_scores = list;
});

socket.on('win_alert', function(variable) {
  winAlert(variable);
});

// Ecoute de l'évènement 'is_ending'. Le joueur reçoit un message indiquant
// la fin du jeu.
socket.on('is_ending', function(variable) {
  // La valeur de 'variable' dépend du gagnant de la partie
  // (s'il n'y a pas eu match nul)
  end = variable;

  // On augmente le score du joueur qui a gagné
  players.forEach(function(player) {
        if (end == player.id){
          player.score +=1;
        }
        console.log(player.score);
  });
});

// Ecoute de l'évènement 'reset'. Il faut localement reset le jeu.
socket.on('reset', function() {
  console.log('client reset');
  eraseBoard();

  // on reset le jeu
  game_state = [0,0,0,0,0,0,0,0,0];
  // on reset les score
  players.forEach(function(player) {
        player.score = 0;
  });
});

function winAlert(fin){
  //n'est jamais evaluée... Bug ?
  console.log('ON EST ICI');
  if (fin == 1 && fin != player_id){
    alert('FIN DU JEU - JOUEUR MOUTON GAGNE');
  }// ou que le joueur -1 gagne
  else if (fin == -1 && fin != player_id){
    alert('FIN DU JEU - JOUEUR TIGRE GAGNE');
  }
  else if (fin == 2){
    alert('FIN DU JEU - MATCH NUL');
  }
};

// Au lancement de la page, initialisation du pseudo du nouveau participant
function beginPseudo(){
  // Si le participant vient tout juste d'arriver
  if (r == 'new'){
    pseudo = prompt('Quel est votre pseudo ?', 'Joueur');
    // Le participant passe dans l'état 'pseudo' après avoir choisi son pseudo
    r = 'pseudo';
    // Le participant communique son nom au serveur
    socket.emit('nouveau_pseudo', pseudo);
    // On l'envoie choisir sa couleur
    beginColor();
  }
};

function beginColor(){
  // Si le joueur a choisi son pseudo...
  if (r=='pseudo') {
    // ... et qu'il est joueur...
    if (isPlaying==1) {
      // ... il choisit sa couleur.
      while(true){
        //disons qu'il la choisit si l'autre joueur ne l'a pas déjà choisie !
        if (players.length > 1 && (players[0].c == 'mouton' || players[0].c == 'tigre')) {
          if (players[0].c == 'tigre'){
            couleur = 'mouton';
          }
          else{
            couleur = 'tigre';
          }
        }
        else {
          couleur = prompt('tigre ou mouton ?', 'mouton');
        }
        //si ce n'est pas le cas donc, il choisit sa couleur parmi les deux proposées
        if (couleur == 'tigre' || couleur == 'mouton'){
          break;
        }
        // Mauvais choix
        else {
          alert('Mauvaise saisie ! Veuillez re-saisir votre couleur.');
        }
      }
      // Attribution des id selon la couleur
      if (couleur == 'mouton'){
        player_id = 1;
      }
      else{
        player_id = -1;
      }
    // Le joueur communique sa couleur au serveur
    socket.emit('nouveau_couleur', [couleur, player_id]);
    // Le joueur passe dans l'état 'all' lorsqu'il a choisi son pseudo et sa couleur
    r='all';
    }
  // Si il est arrivé ici sans remplir son pseudo, on l'envoie le choisir
  }
  else {
    beginPseudo();
  }
};

// Permet de vérifier à chaque instant si l'état du plateau est tel qu'un des joueurs a gagné
// ou qu'il y a match nul
function checkWin(){
  var filled = 0;

  // Vérifie si tout le plateau a été rempli
  for (i=0; i<game_state.length; i++){
    if (game_state[i] != 0){
      filled += 1;
    }
  }
  //joueur mouton gagne
  //en colonne
  if (end == 0){
    if ((game_state[0] == game_state[1] && game_state[1] == game_state[2] && game_state[2] == 1) || (game_state[3] == game_state[4] && game_state[4] == game_state[5] && game_state[5] == 1) || (game_state[6] == game_state[7] && game_state[7] == game_state[8] && game_state[8] == 1)){
      end = 1;
    }
    //en ligne
    else if ((game_state[0] == game_state[3] && game_state[3] == game_state[6] && game_state[6] == 1) || (game_state[1] == game_state[4] && game_state[4] == game_state[7] && game_state[7] == 1) || (game_state[2] == game_state[5] && game_state[5] == game_state[8] && game_state[8] == 1)){
      end = 1;
    }
    //en diagonale
    else if ((game_state[0] == game_state[4] && game_state[4] == game_state[8] && game_state[8] == 1) || (game_state[2] == game_state[4] && game_state[4] == game_state[6] && game_state[6] == 1)){
      end = 1;
    }
    //joueur tigre gagne
    //en colonne
    else if ((game_state[0] == game_state[1] && game_state[1] == game_state[2] && game_state[2] == -1) || (game_state[3] == game_state[4] && game_state[4] == game_state[5] && game_state[5] == -1) || (game_state[6] == game_state[7] && game_state[7] == game_state[8] && game_state[8] == -1)){
      end = -1;
    }
    //en ligne
    else if ((game_state[0] == game_state[3] && game_state[3] == game_state[6] && game_state[6] == -1) || (game_state[1] == game_state[4] && game_state[4] == game_state[7] && game_state[7] == -1) || (game_state[2] == game_state[5] && game_state[5] == game_state[8] && game_state[8] == -1)){
      end = -1;
    }
    //en diagonale
    else if ((game_state[0] == game_state[4] && game_state[4] == game_state[8] && game_state[8] == -1) || (game_state[2] == game_state[4] && game_state[4] == game_state[6] && game_state[6] == -1)){
      end = -1;
    }
    else{
      if (filled == 9){
        end = 2;
      }
    }
  }
  // On donne l'état de la partie : qui a gagné/ match nul/ partie en cours
  socket.emit('is_ending', end);
};


// Permet de tracer à chaque instant le plateau
function drawGame(){
  // on efface le score précédent
  context.fillStyle = "white";
  context.fillRect(1.5*side2, width+side2+15,2*side,100);
  context.fillRect(2.5*side2, width+side2+15,100,200);
  //on écrit le score actuel
  context.fillStyle = "#555B61";
  context.font = '48px serif';
  context.fillText(players_scores[1], 1.5*side2, width+1.5*side2);
  context.fillText(players_scores[0], 2.5*side2, width+1.5*side2);

  // Pour chaque cas du jeu, on affiche l'image associé à l'état de la case
  for (i = 0; i < game_state.length; i++) {
    // si la case est vide
    if (game_state[i] != 0) {
      // si c'est le joeur mouton qui a joué
      if (game_state[i] == 1) {
        img = document.getElementById("mouton");
      }
      //sinon ,si c'est le joueur tigre qui a joué
      else {
        img = document.getElementById("tigre");
      }
      var abs = Math.floor(i/3) * side;
      var ord = i%3 * side;

      context.drawImage(img, abs, ord, side,side);
    }
  }
};

// Permet de redessiner le plateau nu après un reset
function drawBoard(){
  //dessine le plateau
  context.fillStyle = "#555B61";
  context.fillRect(0, 0, side, side);
  context.fillRect(2*side, 0, side, side);
  context.fillRect(side, side, side, side);
  context.fillRect(0, 2*side, side, side);
  context.fillRect(2*side, 2*side, side, side);

  //dessine le tableau des scores
  context.fillStyle = "#555B61";
  context.font = '48px Optima';
  context.fillText('Scores :', 0, width+side2);
  context.fillText('Tigre', 1.5*side2, width+side2);
  context.fillText('Mouton', 2.5*side2, width+side2);
};


// Permet d'effacer le plateau après un reset
function eraseBoard(){
  context.clearRect(0, 0, width, height);
  drawBoard();
};


// Récupère les coordonnées de la souris dans le canvas
function getCoords(el,event) {
  var ox = el.scrollLeft - el.offsetLeft,
  oy = el.scrollTop - el.offsetTop;
  while(el=el.offsetParent){
    ox += el.scrollLeft - el.offsetLeft;
    oy += el.scrollTop - el.offsetTop;
  }
  return {x:event.clientX + ox , y:event.clientY + oy};
};


// Indique où va devoir etre tracé le pattern du participant selon
// l'endroit où il a cliqué et son statut dans la partie
canvas.onclick = function(e) {
  var coords = getCoords(this,e);
  var x = coords.x;
  var y = coords.y;

  var abs = Math.floor(x/side);
  var ord = Math.floor(y/side);

  // Indice de la case sur laquelle le participant a cliqué
  var ind = 3*abs+ord;

  // Si la case étati vide, que le participant est joueur, et que c'est son tour...
  if (game_state[ind] == 0 && couleur==whoseTurn && (isPlaying==1)) {
    // ... on change l'état de la case du plateau...
    game_state[ind] = player_id;
    // ... et on prévient le serveur qu'un nouveau tour commence.
    socket.emit('new_turn','');
  }

  // On prévient le serveur de l'avancé actuel de la partie
  socket.emit('game_changed', game_state, players_scores);

};






// Update régulière pour que le participant demande s'il est joueur, si la partie est
// terminée, si le plateau doit être redessiné...
function update() {
  console.log(isPlaying);
  if (isPlaying >= 0){


  // Le joueur demande son statut
  socket.emit('amIplaying','');
  document.getElementById('whoseTurnHTML').innerHTML = "<p> C'est au tour du joueur possédant le pion "+whoseTurn+" de jouer !</p>";


  // Si le joeur vient d'arriver, on l'envoie choisir un pseudo
  if (r == 'new'){
    beginPseudo();
    console.log(couleur);
  }

  // On met à jour le plateau, les scores, et on vérifie si la partie est terminée
  drawGame();
  checkWin();
  //bypass un bug : parfois le plateau n'est pas effacé à la fin d'une partie
  if (game_state[0] == 0 && game_state[1] == 0 && game_state[2] == 0 && game_state[3] == 0 && game_state[4] == 0 && game_state[5] == 0 && game_state[6] == 0 && game_state[7] == 0 && game_state[8] == 0){
    context.fillStyle = "#555B61";
    context.fillRect(0, 0, side, side);
    context.fillRect(2*side, 0, side, side);
    context.fillRect(side, side, side, side);
    context.fillRect(0, 2*side, side, side);
    context.fillRect(2*side, 2*side, side, side);

    context.fillStyle = "white";
    context.fillRect(side, 0, side, side);
    context.fillRect(0, side, side, side);
    context.fillRect(2*side, side, side, side);
    context.fillRect(side, 2*side, side, side);
  }

  // Selon les parties, l'alert s'affiche une fois ou plusieurs fois de suite... Impossible de trouver d'où le bug vient.
  // Si la partie est terminée...
  if (end !== 0) {
    // ... et que le joeur 1 gagne
    if (end == player_id && end == 1){
      socket.emit('win_alert', end);
      console.log(game_state);
      players_scores[0]+=1;
      alert('FIN DU JEU - JOUEUR MOUTON GAGNE');
    }// ou que le joueur -1 gagne
    else if (end == player_id && end == -1){
      socket.emit('win_alert', end);
      console.log(game_state);
      players_scores[1]+=1;
      alert('FIN DU JEU - JOUEUR TIGRE GAGNE');
    }
    else if (end == 2){
      alert('FIN DU JEU - MATCH NUL');
    }
    // On efface le plateau
    eraseBoard();
    // On réinitialise l'état de jeu
    end = 0;
    // On prévient le serveur de la fin
    socket.emit('is_ending', end);
    game_state = [0,0,0,0,0,0,0,0,0];
    socket.emit('game_changed', game_state, players_scores);
  }
  }
  // Lance la nouvelle étape de boucle
  requestAnimationFrame(update);
};



// premier appel
requestAnimationFrame(update);
