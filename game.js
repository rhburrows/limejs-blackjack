goog.provide("blackjack.game");

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

  blackjack.Game = function() {
    this.deck = goog.array.map(goog.array.range(1, 53), function(i) {
      return intToCard(i);
    });
    goog.array.shuffle(this.deck);

    this.dealerHand = [];
    this.playerHands = [[]];
    this.currentHand = this.playerHands[0];
    this.state = 'dealing';
  };

  blackjack.Game.prototype.dealCard = function() {
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

  blackjack.Game.prototype.checkForBlackjacks = function() {
    if (isBlackjack(this.dealerHand) && isBlackjack(this.playerHands[0])) {
      this.state = 'draw';
    } else if (isBlackjack(this.dealerHand)) {
      this.state = 'dealer-wins';
    } else if (isBlackjack(this.playerHands[0])) {
      this.state = 'player-wins';
    }
  };

})();
