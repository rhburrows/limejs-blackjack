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
    case "player-turn":
      this.renderPlayerActions(game, node, controller);
      this.renderHands(game, node, controller);
      break;
    case "dealing":
      this.renderHands(game, node, controller);
      break;
    case "dealer-turn":
      this.renderHands(game, node, controller);
      break;
    case "complete":
      this.renderHands(game, node, controller);
      this.renderBettingActions(game, node, controller);
      break;
    }
  };

  blackjack.GameView.prototype.renderBettingActions = function(game, node, controller) {
    var betCount = game.allowedBets().length;
    var xPos = (this.width / 2) - (betCount / 2) * (125);
    var yPos = this.height / 2 - 50;

    if (betCount === 0) {
      var label = new lime.Label()
          .setText("You lose! (refresh to start over)")
          .setFontColor("#000")
          .setFontSize(20)
          .setPosition(xPos - 100, yPos);
      node.appendChild(label);
    } else {
      var label = new lime.Label()
          .setText("Bet Amount:")
          .setFontColor("#000")
          .setFontSize(20)
          .setPosition(xPos + 15, yPos - 50);
      node.appendChild(label);
      goog.array.forEach(game.allowedBets(), function(bet) {
        var btn = createButton("$" + bet, { width: 75 }, controller.bet.bind(controller, bet));
        btn.setPosition(xPos, yPos);
        node.appendChild(btn);
        xPos += 125;
      });
    }
  };
  
  blackjack.GameView.prototype.renderPlayerActions = function(game, node, controller) {
    var actions = game.userActions();
    var offset = (this.width / 2) -
        (150 * (goog.object.getKeys(actions).length / 2));

    goog.object.forEach(actions, function(action, name) {
      var btn = createButton(name, { width: 100 }, action)
          .setPosition(offset, this.height - 50);
      node.appendChild(btn);
      offset += 150;
    }, this);
  };

  blackjack.GameView.prototype.renderHands = function(game, node, controller) {
    var parent = new lime.Node();
    var offset = 0;

    var dealerHand = new lime.Node().setPosition(200, 100);
    this.renderHand(game.dealerHand, dealerHand, controller, true);

    var playerHands = new lime.Node().setPosition(200, 500);
    goog.array.forEach(game.playerHands, function(hand) {
      this.renderHand(hand, playerHands, controller, false, offset);
      if (hand === game.currentHand && game.state === 'player-turn') {
        var highlight = new lime.Sprite()
            .setSize(75, 5)
            .setFill('#fff')
            .setPosition(offset, -35);
        playerHands.appendChild(highlight);
      }

      offset += 200;
    }, this);

    parent.appendChild(dealerHand);
    parent.appendChild(playerHands);

    node.appendChild(parent);
  };

  blackjack.GameView.prototype.renderHand = function(hand, node, controller, isDealer, start) {
    var offset = start || 0;

    if (!isDealer) {
      if (hand.state === 'live') {
        var label = new lime.Label()
            .setText("Bet: $" + hand.bet)
            .setPosition(offset, -50);
      } else {
        var label = new lime.Label()
            .setText(goog.string.toTitleCase(hand.state) + ": $" + hand.bet)
            .setPosition(offset, -50);
      }
      node.appendChild(label);
    }

    for (var i = 0; i < hand.cards.length; i++) {
      var card = hand.cards[i];
      var cardView = new lime.Sprite()
          .setSize(CARD_WIDTH, CARD_HEIGHT)
          .setPosition(offset, 50);
      if (isDealer && i == 0 && hand.state === 'live') {
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
