goog.provide("blackjack.Game");

goog.require("blackjack.Hand");

(function() {
  var SUIT_OFFSETS = [ "CLUBS", "DIAMONDS", "HEARTS", "SPADES" ];
  var ALLOWED_BETS = [ 10, 20, 50, 100 ];
  var NUM_DECKS = 4;

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
    this.deck = []
    for (var i = 0; i < NUM_DECKS; i++) {
      this.deck = this.deck.concat(goog.array.map(goog.array.range(1, 53), function(i) {
        return intToCard(i);
      }));
    }

    goog.array.shuffle(this.deck);
  };

  blackjack.Game.prototype.dealCard = function() {
    if (this.state !== 'dealing') return;

    this.currentHand.push(this.deck.pop());
    if (this.currentHand === this.dealerHand && this.dealerHand.cards.length == 2) {
      this.checkNaturals();
      return;
    }

    this.nextHand();
  };

  blackjack.Game.prototype.takeDealerAction = function() {
    if (this.dealerHand.state == 'live') {
      this.dealerHand.state = 'processing';
      // Flipping the face down card counts as an action
      return;
    }

    if (this.dealerHand.state != 'processing') return;

    if (this.dealerHand.score() < 17) {
      this.dealerHand.push(this.deck.pop());
    } else {
      this.checkHands();
    }
  };

  blackjack.Game.prototype.checkHands = function() {
    goog.array.forEach(this.playerHands, function(hand) {
      if (hand.state != 'waiting') return;

      if (hand.score() > this.dealerHand.score() || this.dealerHand.score() > 21) {
        this.playerMoney += (2 * hand.bet);
        hand.win();
      } else if (this.dealerHand.score() > hand.score()) {
        hand.lose();
      } else {
        this.playerMoney += hand.bet;
        hand.draw();
      }
    }, this);

    this.state = 'complete';
  };

  blackjack.Game.prototype.checkNaturals = function() {
    if (this.dealerHand.isBlackjack()) {
      this.dealerHand.win();
      goog.array.forEach(this.playerHands, function(hand) {
        if (!hand.isBlackjack()) {
          hand.lose();
        } else {
          this.playerMoney += hand.bet;
          hand.draw();
        }
      }, this);
    } else {
      goog.array.forEach(this.playerHands, function(hand) {
        if (hand.isBlackjack()) {
          this.playerMoney += (1.5 * hand.bet);
          hand.win();
        }
      }, this);
    }

    var firstLiveHand = goog.array.find(this.playerHands, function(hand) {
      return hand.state == 'live' || hand.state == 'waiting';
    }, this);

    if (firstLiveHand) {
      this.currentHand = firstLiveHand;
      this.state = 'player-turn';
    } else {
      this.state = 'complete';
    }
  }

  blackjack.Game.prototype.nextHand = function() {
    var currentHandIndex = this.playerHands.indexOf(this.currentHand);
    if (currentHandIndex === -1) {
      this.currentHand = this.playerHands[0];
    } else if (currentHandIndex === this.playerHands.length - 1) {
      this.currentHand = this.dealerHand;

      if (this.state !== 'dealing') {
        this.state = 'dealer-turn';
      }
    } else {
      this.currentHand = this.playerHands[currentHandIndex + 1];
    }

    if (this.currentHand !== this.dealerHand && this.currentHand.state !== 'live') {
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

    if (this.currentHand.score() > 21) {
      this.currentHand.lose();
      this.nextHand();
    } else if (this.currentHand.score() === 21) {
      this.currentHand.stand();
      this.nextHand();
    }
  }

  blackjack.Game.prototype.doubleDown = function() {
    this.playerMoney -= this.currentHand.bet;
    this.currentHand.bet *= 2;

    this.currentHand.push(this.deck.pop());
    if (this.currentHand.score() > 21) {
      this.currentHand.lose();
    } else {
      this.currentHand.stand();
    }
    this.nextHand();
  };

  blackjack.Game.prototype.split = function() {
    this.playerMoney -= this.currentHand.bet;

    var newHand = new blackjack.Hand(this.currentHand.bet);
    newHand.cards.push(this.currentHand.cards.shift());

    this.playerHands.push(newHand);
    window.playerHands = this.playerHands;
  };

  blackjack.Game.prototype.dealIfNeeded = function() {
    if (this.currentHand.cards.length < 2) {
      this.currentHand.cards.push(this.deck.pop());
    }
  };

  blackjack.Game.prototype.userActions = function() {
    var actions = {};

    if (this.state == 'player-turn') {
      if (this.currentHand.score() < 21) {
        actions["Hit"] = this.hit.bind(this);
        actions["Stand"] = this.stand.bind(this);
      }

      if (this.currentHand.cards.length === 2 &&
          this.playerMoney >= this.currentHand.bet) {
        actions["Double Down"] = this.doubleDown.bind(this);

        if (this.currentHand.isAPair()) {
          actions["Split"] = this.split.bind(this);
        }
      }
    }

    return actions;
  };

  blackjack.Game.prototype.allowedBets = function() {
    return goog.array.filter(ALLOWED_BETS, function(bet) {
      return bet <= this.playerMoney;
    }, this);
  };
})();
