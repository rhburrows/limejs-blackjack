(function() {
  goog.provide('blackjack');

  goog.require('lime.Director');
  goog.require('lime.Scene');
  goog.require('lime.Sprite');
  goog.require('lime.Node');

  var WIDTH  = 1024;
  var HEIGHT = 768;
  var NUM_DECKS = 4;
  var SUIT_OFFSETS = [ "CLUBS", "DIAMONDS", "HEARTS", "SPADES" ];

  //================================================================================
  // Game Model
  //================================================================================
  function Game() {
    this.deck = [];
  }

  //================================================================================
  // Game Controller / Views
  //================================================================================
  function GameController(game) {
    this.game = game;
    this.view = new lime.Node()
      .setSize(WIDTH, HEIGHT)
      .setAnchorPoint(0, 0);
  }

  //================================================================================
  // Entry Point
  //================================================================================
  blackjack.start = function() {
    var director = new lime.Director(document.body);
    var scene = new lime.Scene().setRenderer(lime.Renderer.DOM);
    var background = new lime.Sprite()
        .setFill('images/background.png')
        .setSize(WIDTH, HEIGHT)
        .setAnchorPoint(0, 0);

    var game = new Game();
    var gameController = new GameController(game);

    scene.appendChild(background);
    scene.appendChild(gameController.view);
    director.replaceScene(scene);
  };

  goog.exportSymbol('blackjack.start', blackjack.start);
})();
