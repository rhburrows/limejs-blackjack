goog.provide("blackjack.Game");

goog.require("blackjack.Hand");

(function() {
  var SUIT_OFFSETS = [ "CLUBS", "DIAMONDS", "HEARTS", "SPADES" ];

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
    this.shuffle();
    this.dealerHand = new blackjack.Hand();
    this.playerHands = [ new blackjack.Hand() ];
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
    var currentHandIndex = this.playerHands.indexOf(this.currentHand);
    if (currentHandIndex === -1) {
      if (this.currentHand.cards.length == 2) {
        this.state = 'player-turn';
      }

      this.currentHand = this.playerHands[0];
    } else if (currentHandIndex === this.playerHands.length - 1) {
      this.currentHand = this.dealerHand;
    } else {
      this.currentHand = this.playerHands[currentHandIndex + 1];
    }
  };

  blackjack.Game.prototype.checkForBlackjacks = function() {
    if (this.dealerHand.isBlackjack() && this.playerHands[0].isBlackjack()) {
      this.state = 'draw';
    } else if (this.dealerHand.isBlackjack()) {
      this.state = 'dealer-wins';
    } else if (this.playerHands[0].isBlackjack()) {
      this.state = 'player-wins';
    }
  };

})();
