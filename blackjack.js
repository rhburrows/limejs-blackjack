goog.provide('blackjack');

goog.require('lime.Director');

goog.require('blackjack.Controller');

(function() {
  var WIDTH  = 1024;
  var HEIGHT = 768;

  blackjack.start = function() {
    var director = new lime.Director(document.body);
    var controller = new blackjack.Controller();
    director.replaceScene(controller.scene);
  };

  goog.exportSymbol('blackjack.start', blackjack.start);
})();
