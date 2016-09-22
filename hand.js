goog.provide("blackjack.Hand");

(function() {
  blackjack.Hand = function(bet) {
    this.cards = [];
    this.bet = bet;
    this.state = 'live';
  }

  blackjack.Hand.prototype.push = function(card) {
    this.cards.push(card);
  };

  blackjack.Hand.prototype.score = function() {
    var score = 0;
    var aceCount = 0;

    goog.array.forEach(this.cards, function(card) {
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
  };

  blackjack.Hand.prototype.isBlackjack = function() {
    return this.score() === 21 && this.cards.length === 2;
  };

  blackjack.Hand.prototype.possibleActions = function() {
    return ['hit', 'stand'];
  };

  blackjack.Hand.prototype.win = function() {
    this.state = 'won';
  };

  blackjack.Hand.prototype.lose = function() {
    this.state = 'lost';
  };

  blackjack.Hand.prototype.draw = function() {
    this.state = 'draw';
  };
})();
