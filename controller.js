goog.provide("blackjack.Controller");

goog.require("lime.Node");
goog.require("lime.RoundedRect");
goog.require("lime.Label");
goog.require("lime.Sprite");

goog.require("blackjack.Game");

(function() {
  var WIDTH  = 1024;
  var HEIGHT = 768;
  var CARD_WIDTH = 100;
  // playing cards are 2.5" x 3.5"
  var CARD_HEIGHT = 100 * (3.5 / 2.5);
  var DEALER_DELAY = 500;

  blackjack.Controller = function() {
    this.view = new lime.Node()
      .setSize(WIDTH, HEIGHT)
      .setAnchorPoint(0, 0);
    this.redraw();
  };

  blackjack.Controller.prototype.start = function() {
    this.game = new blackjack.Game();
    this.redraw();
    lime.scheduleManager.scheduleWithDelay(this.dealerAction, this, DEALER_DELAY);
  };

  blackjack.Controller.prototype.dealerAction = function() {
    switch(this.game.state) {
    case "dealing":
      this.game.dealCard();
      break;
    case "player-turn":
      this.game.checkForBlackjacks();
      break;
    case "dealerTurn":
      //this.game.takeDealerAction();
      break;
    } 

    this.redraw();
  };

  blackjack.Controller.prototype.redraw = function() {
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

    if (this.game && this.game.state === 'player-wins') {
      var playerWinLabel = new lime.Label()
          .setText("You win!")
          .setFontColor("#000")
    p      .setFontSize(50)
          .setPosition(WIDTH / 2 - 100, HEIGHT / 2);
      newView.appendChild(playerWinLabel);
    } else if (this.game && this.game.state === 'dealer-wins') {
      var dealerWinLabel = new lime.Label()
          .setText("Dealer wins!")
          .setFontColor("#000")
          .setFontSize(50)
          .setPosition(WIDTH / 2 - 100, HEIGHT / 2);
      newView.appendChild(dealerWinLabel);
    } else if (this.game && this.game.state === 'draw') {
      var drawLabel = new lime.Label()
          .setText("Its a draw")
          .setFontColor("#000")
          .setFontSize(50)
          .setPosition(WIDTH / 2 - 100, HEIGHT / 2);
      newView.appendChild(drawLabel);
    }

    this.view.removeAllChildren();
    this.view.appendChild(newView);
  };

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
