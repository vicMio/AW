// Lorsqu'un message doit être envoyé :
send.onsubmit = function(event) {
  // Empêche la page de se réactualiser
  event.preventDefault();
  // Emet l'évènement 'chat message' et le contenu du message avec
  socket.emit('chat message', { msg: message.value });
  // Reset 'value'
  message.value = '';
};

// Si un message a été émis :
socket.on('chat message', function(msg_from_server) {
  // Crée un élément <li>
  const li = document.createElement('li');
  // On change le innerHTML de ce nouvel élément avec la succession pseudo+message
  li.innerHTML = '<p style="font-family: Optima;"><strong>' + msg_from_server.p + '</strong> ' + Object.values(msg_from_server.msg) + '</p>';
  // On l'ajoute au chat
  chat.appendChild(li);
});

// Quand un autre participant se connecte, on affiche l'information :
socket.on('autre_chat', function(txt) {
  // Crée un élément <li>
  const li = document.createElement('li');
  // On change le innerHTML de ce nouvel élément avec le message
  li.innerHTML = '<p style="font-family: Optima;"><em>' + txt + ' a rejoint le Chat !';
  // On l'ajoute au chat
  chat.appendChild(li);
});

// Quand un autre participant se connecte, on affiche l'information :
socket.on('enleve_chat', function(txt) {
  // Crée un élément <li>
  const li = document.createElement('li');
  // On change le innerHTML de ce nouvel élément avec le message
  li.innerHTML = '<p style="font-family: Optima;"><em>' + txt + ' a quitté le Chat !';
  // On l'ajoute au chat
  chat.appendChild(li);
});




// Quand un joueur choisi sa couleur :
socket.on('autre_joueur_chat', function(arr) {
  // Crée un élément <li>
  const lii = document.createElement('li');
  // On change le innerHTML de ce nouvel élément
  lii.innerHTML = '<p style="font-family: Optima;"><em>' + arr[0] + ' jouera ' + arr[1] + '.</em></p>';
  // On l'ajoute au chat
  chat.appendChild(lii);
});
