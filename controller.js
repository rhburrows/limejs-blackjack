goog.provide("blackjack.Controller");

goog.require("lime.Scene");
goog.require("lime.Sprite");

goog.require("blackjack.Game");
goog.require("blackjack.GameView");

(function() {
  var WIDTH  = 1024;
  var HEIGHT = 768;
  var DEALER_DELAY = 500;

  blackjack.Controller = function() {
    this.scene = new lime.Scene().setRenderer(lime.Renderer.CANVAS);
    var background = new lime.Sprite()
        .setFill("images/background.png")
        .setSize(WIDTH, HEIGHT)
        .setAnchorPoint(0, 0);
    this.scene.appendChild(background);

    this.view = new blackjack.GameView(WIDTH, HEIGHT);
    this.scene.appendChild(this.view.view);
  };

  blackjack.Controller.prototype.start = function() {
    this.game = new blackjack.Game();
    this.redraw();
    lime.scheduleManager.scheduleWithDelay(this.dealerAction, this, DEALER_DELAY);
  };

  blackjack.Controller.prototype.bet = function(amount) {
    this.game.bet(amount);
  };

  blackjack.Controller.prototype.dealerAction = function() {
    switch(this.game.state) {
    case "dealing":
      this.game.dealCard();
      break;
    case "player-turn":
      this.game.checkCurrentHand();
      break;
    case "dealer-turn":
      this.game.takeDealerAction();
      break;
    } 

    this.redraw();
  };

  blackjack.Controller.prototype.redraw = function() {
    this.view.render(this, this.game);
  }
})();
