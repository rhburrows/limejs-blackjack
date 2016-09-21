(function() {
  goog.provide('blackjack');

  goog.require('lime.Director');
  goog.require('lime.Scene');
  goog.require('lime.Sprite');
  goog.require('lime.Node');
  goog.require('lime.RoundedRect');
  goog.require('lime.Label');

  var WIDTH  = 1024;
  var HEIGHT = 768;
  var SUIT_OFFSETS = [ "CLUBS", "DIAMONDS", "HEARTS", "SPADES" ];

  //================================================================================
  // Game Model
  //================================================================================
  function intToCard(i) {
    var suitIndex = Math.floor((i - 1) / 13)
    var cardValue = i - (suitIndex * 13);
    var suitChar = SUIT_OFFSETS[suitIndex].substr(0,1).toLowerCase();
    var paddedValue = cardValue;
    if (cardValue < 10) {
      var paddedValue = "0" + cardValue;
    }

    return {
      value: cardValue,
      suit: SUIT_OFFSETS[suitIndex],
      image: "images/" + suitChar + paddedValue + ".png"
    };
  }

  function cardToInt(card) {
    card.value * SUIT_OFFSETS.indexOf(card.suit);
  }

  function Game() {
    this.deck = goog.array.map(goog.array.range(1, 53), function(i) {
      return intToCard(i);
    });
    goog.array.shuffle(this.deck);
  }

  //================================================================================
  // Game Controller / Views
  //================================================================================
  function GameController() {
    this.view = new lime.Node()
      .setSize(WIDTH, HEIGHT)
      .setAnchorPoint(0, 0);
    this.redraw();
  }

  GameController.prototype.start = function() {
    this.game = new Game();
    this.redraw();
  };

  GameController.prototype.redraw = function() {
    var newView = new lime.Node();
    if (!this.game) {
      var startButton = new lime.RoundedRect()
          .setFill('#c00')
          .setSize(250, 50)
          .setStroke(1, '#000')
          .setPosition(WIDTH / 2 - 125, HEIGHT / 2 - 25);
      var startLabel = new lime.Label()
          .setText('Start Game')
          .setFontColor('#fff');
      startButton.appendChild(startLabel);
      goog.events.listen(startButton, ['mousedown','touchstart'], this.start.bind(this));

      newView.appendChild(startButton);
    }

    this.view.removeAllChildren();
    this.view.appendChild(newView);
  };

  //================================================================================
  // Entry Point
  //================================================================================
  blackjack.start = function() {
    var director = new lime.Director(document.body);
    var scene = new lime.Scene().setRenderer(lime.Renderer.CANVAS);
    var background = new lime.Sprite()
        .setFill('images/background.png')
        .setSize(WIDTH, HEIGHT)
        .setAnchorPoint(0, 0);
    var gameController = new GameController();

    scene.appendChild(background);
    scene.appendChild(gameController.view);
    director.replaceScene(scene);
  };

  goog.exportSymbol('blackjack.start', blackjack.start);
})();
