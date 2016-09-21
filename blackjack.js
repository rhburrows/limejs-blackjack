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
  var CARD_WIDTH = 100;
  // cards are 2.5" x 3.5"
  var CARD_HEIGHT = 100 * (3.5 / 2.5);
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

    // Technically we're dealing out of order...
    this.dealerHand = [ this.deck.pop(), this.deck.pop() ];
    this.playerHands = [[ this.deck.pop(), this.deck.pop() ]];
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
    } else {
      addGameView(this.game, newView);
    }

    this.view.removeAllChildren();
    this.view.appendChild(newView);
  };

  function addGameView(game, parentView) {
    var dealerHand = new lime.Node().setPosition(200, 150);
    addHand(game.dealerHand, dealerHand, true);

    var playerHands = new lime.Node().setPosition(200, 550);
    goog.array.forEach(game.playerHands, function(hand) {
      addHand(hand, playerHands, false);
    });

    parentView.appendChild(dealerHand);
    parentView.appendChild(playerHands);
  }

  function addHand(hand, node, isDealer) {
    var offset = 0;
    for (var i = 0; i < hand.length; i++) {
      var card = hand[i];
      var cardView = new lime.Sprite()
          .setSize(CARD_WIDTH, CARD_HEIGHT)
          .setPosition(offset, 0);
      if (isDealer && i < hand.length - 1) {
        cardView.setFill('images/back.png');
      } else {
        cardView.setFill(card.image);
      }
      node.appendChild(cardView);

      offset += 25;
    }
  }

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
