// Socket.io
const socketio = require('socket.io');


module.exports = function(server) {
  // Initialisation du serveur socket.io
  const io = socketio(server);
  // Liste des participants
  const players = {};
  // Etat du plateau. 0:case vide ; 1:mouton ; -1:tire
  var game_state = [0,0,0,0,0,0,0,0,0];
  // Scores mouton, tigre
  var players_scores = [0,0];
  var end = 0;
  // Variable "à qui le tour ?" qui gère le fait qu'un joueur ne peut joeur que
  // si c'est son tour. La variable change à chaque tour.
  var whoseTurn = 'tigre';
  // Un id unique donné à chaque participant. Cette variable sera incrémentée
  // à chaque fois qu'un participant se connecte.
  var unique_id = 0;

  // Ecoute de l'évènement connection
  io.on('connection', function(socket) {
    console.log('Un utilisateur se connecte');

    // On initialise le profil du joueur
    players[socket.id] = {
      pseudo: 'undefined',
      c: 'undefined', // Mouton ou tigre
      score: 0,
      isPlaying : 0, // 1:joueur ; 0:participant
      u_id : unique_id
    };

    // L'id unique du serveur est incrémenté
    unique_id = unique_id+1;

    // Si il y a 2 joueurs ou moins, le participant qui arrive est
    // immédiatement transformé en joueur
    if (Object.keys(players).length < 3) {
      players[socket.id].isPlaying = 1;
      // On communique cette information directement au joueur
      io.to(`${socket.id}`).emit('message', players[socket.id].isPlaying);
    }
    else{
      players[socket.id].isPlaying = 0;
      // On communique cette information directement au joueur
      io.to(`${socket.id}`).emit('message', players[socket.id].isPlaying);
    };

    // Ecoute de l'évènement 'nouveau pseudo', pour modifier le profil du joueur
    socket.on('nouveau_pseudo', function(txt) {
      players[socket.id].pseudo = txt;
      // On affiche un message dans le chat pour dire qu'un joueur est arrivé
      io.emit('autre_chat',txt);
    });

    // Ecoute de l'évènement 'nouveau_couleur', pour modifier la couleur (mouton/tigre)
    // dans le profil du joueur
    socket.on('nouveau_couleur', function(arr) {
      players[socket.id].c = arr[0];
      var newarr = [players[socket.id].pseudo, arr[0]];
      // On affiche un message dans le chat pour dire quel couleur le joueur joue
      io.emit('autre_joueur_chat',newarr);
    });

    // Ecoute de l'évènement 'amIplaying'. Un participant demande régulièrement s'il
    // est devenu un joueur ou pas
    socket.on('amIplaying',function(){
      io.to(`${socket.id}`).emit('message', players[socket.id].isPlaying);
    });

    // Ecoute de l'évènement 'game_changed'. Un joueur vient de faire un coup, l'état de jeu change.
    socket.on('game_changed', function(arr, arr2, fin) {
      game_state = arr;
      players_scores = arr2;
      end = fin;
    });

    // Ecoute de l'évènement 'chat message'. Un participant a écrit un message, qu'il
    // faut afficher sur les chats des autres participants.
    socket.on('chat message', function(data) {
      msg_from_server = {msg:data, p:players[socket.id].pseudo};
      io.emit('chat message', msg_from_server);
    });

    // Ecoute de l'évènement 'new_turn'. Un joueur vient de jouer, il perd donc sa capacité
    // de jouer tant que son adversaire n'a pas joué à son tour.
    socket.on('new_turn',function(){
      if (whoseTurn=='tigre'){
        whoseTurn = 'mouton';
      } else {
        whoseTurn = 'tigre';
      }
    });

    // Ecoute de l'évènement 'disconnect'. Un participant se disconnecte.
    socket.on('disconnect', function() {
      io.emit('enleve_chat',players[socket.id].pseudo);


    	// Si ce participant jouait...
      if (players[socket.id].isPlaying==1) {
      	// ... on considère l'ensemble des participants (joueurs ou non) qu'il reste...
        for (var socketid in io.sockets.sockets) {
        	// ... on trouve le premier qui ne jouait pas...
          if (players[socketid].isPlaying==0) {
          	// pour le transformer en joueur.
            players[socketid].isPlaying = 1;
            // Transformation qui lui est ensuite communiquée
            io.to(`${socketid}`).emit('message', 1);

            console.log('about to reset');
            // On envoie un signal pour reset le plateau
            io.emit('reset','');
            // On reset la version du serveur, et les scores
            game_state = [0,0,0,0,0,0,0,0,0];
            players_scores = [0,0];

            // On dit au nouveau joueur qu'il doit maintenant choisir sa couleur
            io.to(`${socketid}`).emit('should_begin', players[socket.id].c);

            // On ne transforme pas d'autres joueurs
            break;
          }
        }
      }

      console.log('Un utilisateur se deconnecte');
      // On supprime le profil du participant
      delete players[socket.id];
      console.log(Object.keys(players).length + ' participant(s) restant !');

      io.emit('someone_disconnected','');

      // On reset le plateau si il ne reste plus qu'un joueur en jeu, qui doit
      // alors attendre la connexion d'un autre participant
      if (Object.keys(players).length < 2) {
        console.log('about to reset');
        io.emit('reset','');
        game_state = [0,0,0,0,0,0,0,0,0];

        players_scores = [0,0];
      }
    });


  });

  function update() {
    // On émet régulièrement la liste des participants, l'etat du jeu, les scores,
    // et la variable qui détermine qui doit joeur le prochain coup
    io.emit('players_list', Object.values(players));
    io.emit('game_state', Object.values(game_state));
    io.emit('partie_ending', end);
    io.emit('scores', Object.values(players_scores));
    io.emit('Turn', whoseTurn);
  };

  // Le jeu s'actualise à 10 fps
  setInterval(update, 1000/10);

};
