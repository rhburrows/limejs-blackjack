goog.provide("blackjack.GameView");

goog.require("lime.Node");
goog.require("lime.RoundedRect");
goog.require("lime.Label");
goog.require("lime.Sprite");

(function() {
  var CARD_WIDTH  = 100;
  var CARD_HEIGHT = CARD_WIDTH * (3.5 / 2.5);

  blackjack.GameView = function(width, height) {
    this.width = width;
    this.height = height;
    this.view = new lime.Node()
      .setSize(width, height)
      .setAnchorPoint(0, 0);
  };

  blackjack.GameView.prototype.render = function(controller, game) {
    var newView = new lime.Node();
    if (!game) {
      var startButton = new lime.RoundedRect()
          .setFill('#c00')
          .setSize(250, 50)
          .setStroke(1, '#000')
          .setPosition(this.width / 2 - 125, this.height / 2 - 25);
      var startLabel = new lime.Label()
          .setText('Start Game')
          .setFontColor('#fff');
      startButton.appendChild(startLabel);
      goog.events.listen(startButton, ['mousedown','touchstart'], controller.start.bind(controller));

      newView.appendChild(startButton);
    } else {
      addGameView(game, newView);
    }

    if (game && game.state === 'player-wins') {
      var playerWinLabel = new lime.Label()
          .setText("You win!")
          .setFontColor("#000")
          .setFontSize(50)
          .setPosition(this.width / 2 - 100, this.height / 2);
      newView.appendChild(playerWinLabel);
    } else if (game && game.state === 'dealer-wins') {
      var dealerWinLabel = new lime.Label()
          .setText("Dealer wins!")
          .setFontColor("#000")
          .setFontSize(50)
          .setPosition(this.width / 2 - 100, this.height / 2);
      newView.appendChild(dealerWinLabel);
    } else if (game && game.state === 'draw') {
      var drawLabel = new lime.Label()
          .setText("Its a draw")
          .setFontColor("#000")
          .setFontSize(50)
          .setPosition(this.width / 2 - 100, this.height / 2);
      newView.appendChild(drawLabel);
    }

    this.view.removeAllChildren();
    this.view.appendChild(newView);
  }

  function addGameView(game, parentView) {
    var node = new lime.Node();

    var dealerHand = new lime.Node().setPosition(200, 100);
    addHand(game.dealerHand, dealerHand, true);

    var playerHands = new lime.Node().setPosition(200, 500);
    goog.array.forEach(game.playerHands, function(hand) {
      addHand(hand, playerHands, false);
    });

    node.appendChild(dealerHand);
    node.appendChild(playerHands);

    parentView.appendChild(node);
  }

  function addHand(hand, node, isDealer) {
    var offset = 0;
    for (var i = 0; i < hand.length; i++) {
      var card = hand[i];
      var cardView = new lime.Sprite()
          .setSize(CARD_WIDTH, CARD_HEIGHT)
          .setPosition(offset, 50);
      if (isDealer && i == 0) {
        cardView.setFill('images/back.png');
      } else {
        cardView.setFill(card.image);
      }
      node.appendChild(cardView);

      offset += 25;
    }
  }
})();
