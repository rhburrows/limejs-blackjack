goog.provide('blackjack');

goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Sprite');

goog.require('blackjack.Controller');

(function() {
  var WIDTH  = 1024;
  var HEIGHT = 768;

  blackjack.start = function() {
    var director = new lime.Director(document.body);
    var scene = new lime.Scene().setRenderer(lime.Renderer.CANVAS);
    var background = new lime.Sprite()
        .setFill('images/background.png')
        .setSize(WIDTH, HEIGHT)
        .setAnchorPoint(0, 0);
    var gameController = new blackjack.Controller();

    scene.appendChild(background);
    scene.appendChild(gameController.view);
    director.replaceScene(scene);
  };

  goog.exportSymbol('blackjack.start', blackjack.start);
})();
