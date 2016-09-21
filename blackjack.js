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
  var DEALER_DELAY = 500;

  // playing cards are 2.5" x 3.5"
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

  // Calculate the highest possible score for the hand
  function handScore(hand) {
    var score = 0;
    var aceCount = 0;

    goog.array.forEach(hand, function(card) {
      if (card.value >= 10) {
        score += 10;
      } else if (card.value === 1) {
        score += 11;
        aceCount++;
      } else {
        score += card.value;
      }
    });

    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }

    return score;
  }

  function isBlackjack(hand) {
    return handScore(hand) === 21 && hand.length === 2;
  }

  function Game() {
    this.deck = goog.array.map(goog.array.range(1, 53), function(i) {
      return intToCard(i);
    });
    goog.array.shuffle(this.deck);

    this.dealerHand = [];
    this.playerHands = [[]];
    this.currentHand = this.playerHands[0];
    this.state = 'dealing';
  }

  Game.prototype.dealCard = function() {
    if (this.state !== 'dealing') return;

    this.currentHand.unshift(this.deck.pop());
    var currentHandIndex = this.playerHands.indexOf(this.currentHand);
    if (currentHandIndex === -1) {
      if (this.currentHand.length == 2) {
        this.state = 'player-turn';
      }

      this.currentHand = this.playerHands[0];
    } else if (currentHandIndex === this.playerHands.length - 1) {
      this.currentHand = this.dealerHand;
    } else {
      this.currentHand = this.playerHands[currentHandIndex + 1];
    }
  };

  Game.prototype.checkForBlackjacks = function() {
    if (isBlackjack(this.dealerHand) && isBlackjack(this.playerHands[0])) {
      this.state = 'draw';
    } else if (isBlackjack(this.dealerHand)) {
      this.state = 'dealer-wins';
    } else if (isBlackjack(this.playerHands[0])) {
      this.state = 'player-wins';
    }
  };

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
    lime.scheduleManager.scheduleWithDelay(this.dealerAction, this, DEALER_DELAY);
  };

  GameController.prototype.dealerAction = function() {
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
  }

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

    if (this.game && this.game.state === 'player-wins') {
      var playerWinLabel = new lime.Label()
          .setText("You win!")
          .setFontColor("#000")
          .setFontSize(50)
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
    if (!isDealer) {
      var scoreLabel = new lime.Label()
          .setText("Score: " + handScore(hand))
          .setFontColor('#000')
          .setPosition(0, -30);
      node.appendChild(scoreLabel);
    }

    for (var i = 0; i < hand.length; i++) {
      var card = hand[i];
      var cardView = new lime.Sprite()
          .setSize(CARD_WIDTH, CARD_HEIGHT)
          .setPosition(offset, 50);
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
