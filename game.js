goog.provide("blackjack.Game");

goog.require("blackjack.Hand");

(function() {
  var SUIT_OFFSETS = [ "CLUBS", "DIAMONDS", "HEARTS", "SPADES" ];
  var ALLOWED_BETS = [ 10, 20, 50, 100 ];

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

  blackjack.Game = function() {
    this.playerMoney = 100;
    this.state = 'taking-bets';
  };

  blackjack.Game.prototype.bet = function(amount) {
    if (amount > this.playerMoney) return;

    this.playerMoney -= amount;
    this.shuffle();
    this.dealerHand = new blackjack.Hand();
    this.playerHands = [ new blackjack.Hand(amount) ];
    this.currentHand = this.playerHands[0];
    this.state = 'dealing';
  };

  blackjack.Game.prototype.shuffle = function() {
    this.deck = goog.array.map(goog.array.range(1, 53), function(i) {
      return intToCard(i);
    });
    goog.array.shuffle(this.deck);
  };

  blackjack.Game.prototype.dealCard = function() {
    if (this.state !== 'dealing') return;

    this.currentHand.push(this.deck.pop());
    if (this.currentHand === this.dealerHand && this.dealerHand.cards.length == 2) {
      this.state = 'player-turn';
    }

    this.nextHand();
  };

  blackjack.Game.prototype.takeDealerAction = function() {
    if (this.dealerHand.state === 'live') {
      this.dealerHand.state = 'processing';
      // Flipping the face down card counts as an action
      return;
    }

    if (this.dealerHand.state !== 'processing') return;
    if (this.dealerHand.score() < 17) {
      this.hit();
    } else {
      this.checkHands();
    }
  };

  blackjack.Game.prototype.checkHands = function() {
    goog.array.forEach(this.playerHands, function(hand) {
      if (hand.state != 'waiting') return;

      if (hand.score() > this.dealerHand.score()) {
        this.playerScore += (2 * hand.bet);
        hand.win();
      } else if (this.dealerHand.score() > hand.score()) {
        hand.lose();
      } else {
        this.playerScore += hand.bet;
        hand.draw();
      }
    }, this);

    this.state = 'complete';
  };

  blackjack.Game.prototype.checkCurrentHand = function() {
    if (this.currentHand === this.dealerHand && this.dealerHand.isBlackjack()) {
      this.dealerHand.win();
    }

    if (this.currentHand === this.dealerHand ||
        this.currentHand.state !== 'live') {
      return;
    }

    if (this.dealerHand.isBlackjack() && this.currentHand.isBlackjack()) {
      this.playerMoney += this.currentHand.bet;
      this.currentHand.draw();
    } else if (this.dealerHand.isBlackjack()) {
      this.currentHand.lose();
    } else if (this.currentHand.isBlackjack()) {
      this.playerMoney += (2 * this.currentHand.bet);
      this.currentHand.win();
      this.nextHand();
    }
  };

  blackjack.Game.prototype.nextHand = function() {
    var originalHand = this.currentHand;
    var currentHandIndex = this.playerHands.indexOf(this.currentHand);
    if (currentHandIndex === -1) {
      this.currentHand = this.playerHands[0];
    } else if (currentHandIndex === this.playerHands.length - 1) {
      this.currentHand = this.dealerHand;
    } else {
      this.currentHand = this.playerHands[currentHandIndex + 1];
    }

    if (this.currentHand === originalHand) {
      this.state = 'complete';
      return;
    }

    if (this.currentHand.state !== 'live') {
      this.nextHand();
    }
  };

  blackjack.Game.prototype.stand = function() {
    this.currentHand.stand();
    this.nextHand();

    if (this.currentHand === this.dealerHand) {
      this.state = 'dealer-turn';
    }
  };

  blackjack.Game.prototype.hit = function() {
    this.currentHand.push(this.deck.pop());
  }

  blackjack.Game.prototype.userActions = function() {
    switch (this.state) {
    case 'player-turn':
      return this.currentHand.possibleActions();
    default:
      return [];
    }
  };

  blackjack.Game.prototype.allowedBets = function() {
    return goog.array.filter(ALLOWED_BETS, function(bet) {
      return bet <= this.playerMoney;
    }, this);
  };
})();
