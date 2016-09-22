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
    if (!game) return;

    var newView = new lime.Node();
    this.renderGame(game, newView, controller);

    if (game && game.state === 'player-wins') {
      this.displayResult("You win!");
      return;
    } else if (game && game.state === 'dealer-wins') {
      this.displayResult("Dealer wins!");
      return;
    } else if (game && game.state === 'draw') {
      this.displayResult("Its a draw!");
      return;
    }

    this.view.removeAllChildren();
    this.view.appendChild(newView);
  }

  blackjack.GameView.prototype.displayResult = function(label) {
    var resultLabel = new lime.Label()
        .setText(label)
        .setFontColor("#000")
        .setFontSize(50)
        .setPosition(this.width / 2 - 100, this.height / 2);
    this.view.appendChild(resultLabel);
  };

  blackjack.GameView.prototype.renderGame = function (game, node, controller) {
    var moneyLabel = new lime.Label()
        .setText("$" + game.playerMoney)
        .setFontSize(30)
        .setPosition(40, this.height - 40);
    node.appendChild(moneyLabel);

    switch (game.state) {
    case "taking-bets":
      this.renderBettingActions(game, node, controller);
      break;
    case "dealing":
    case "dealer-turn":
    case "player-turn":
      this.renderHands(game, node, controller);
      break;
    }
  };

  blackjack.GameView.prototype.renderBettingActions = function(game, node, controller) {
    var betCount = game.allowedBets.length;
    var btnWidth = (this.width / betCount) - (50 * betCount);
    var xPos = (this.width / 2) - (betCount / 2) * (btnWidth + 50);
    var yPos = this.height / 2 - 50;

    var label = new lime.Label()
        .setText("Bet Amount:")
        .setFontColor("#000")
        .setFontSize(30)
        .setPosition(xPos + 50, yPos - 75);
    node.appendChild(label);
    goog.array.forEach(game.allowedBets, function(bet) {
      var btn = createButton("$" + bet, { width: btnWidth }, controller.bet.bind(controller, bet));
      btn.setPosition(xPos, yPos);
      node.appendChild(btn);
      xPos += (btnWidth + 50);
    });
  };
  
  blackjack.GameView.prototype.renderHands = function(game, node, controller) {
    var parent = new lime.Node();

    var dealerHand = new lime.Node().setPosition(200, 100);
    this.renderHand(game.dealerHand, dealerHand, controller, true);

    var playerHands = new lime.Node().setPosition(200, 500);
    goog.array.forEach(game.playerHands, function(hand) {
      this.renderHand(hand, playerHands, controller, false);
    }, this);

    parent.appendChild(dealerHand);
    parent.appendChild(playerHands);

    node.appendChild(parent);
  };

  blackjack.GameView.prototype.renderHand = function(hand, node, controller, isDealer) {
    if (!isDealer) {
      var label = new lime.Label()
          .setText("Bet: $" + hand.bet)
          .setPosition(0, -50);
      node.appendChild(label);
    }

    var offset = 0;
    for (var i = 0; i < hand.cards.length; i++) {
      var card = hand.cards[i];
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
  };

  function createButton(label, opts, callback) {
    var displayOptions = {
      fill: "#c00",
      width: 250,
      height: 50,
      borderWidth: 1,
      borderColor: "#000",
      fontColor: "#fff"
    };
    goog.object.extend(displayOptions, opts);

    var rect = new lime.RoundedRect()
        .setFill(displayOptions.fill)
        .setSize(displayOptions.width, displayOptions.height)
        .setStroke(displayOptions.borderWidth,displayOptions.borderColor);
    var buttonLabel = new lime.Label()
        .setText(label)
        .setFontColor(displayOptions.fontColor);
    rect.appendChild(buttonLabel);

    goog.events.listen(rect, ['mousedown', 'touchstart'], callback);

    return rect;
  }
})();
