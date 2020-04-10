// Import du canvas HTML
var canvas  = document.querySelector('#canvas');
var context = canvas.getContext('2d');
// Dimensions du canvas
var width = canvas.width;
var height = canvas.height;
// Côtés des carrés du canvas
var side = 1/3 * width;
var side2 = 1/4 * width;

// Dessine le plateau de jeu sur le canvas
function drawBoard(side, side2){
  context.fillStyle = "#555B61";
  context.fillRect(0, 0, side, side);
  context.fillRect(2*side, 0, side, side);
  context.fillRect(side, side, side, side);
  context.fillRect(0, 2*side, side, side);
  context.fillRect(2*side, 2*side, side, side);

  context.fillStyle = "#555B61";
  context.font = '48px Optima';
  context.fillText('Scores :', 0, width+side2);
  context.fillText('Tigre', 1.5*side2, width+side2);
  context.fillText('Mouton', 2.5*side2, width+side2);
};
drawBoard(side, side2);
