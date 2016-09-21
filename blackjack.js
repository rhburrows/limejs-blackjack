//set main namespace
goog.provide('blackjack');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Sprite');

// entrypoint
blackjack.start = function() {
  var WIDTH  = 1024;
  var HEIGHT = 768;

  var director = new lime.Director(document.body);
  var scene = new lime.Scene().setRenderer(lime.Renderer.DOM);
  var background = new lime.Sprite()
      .setFill('images/background.png')
      .setSize(WIDTH, HEIGHT)
      .setAnchorPoint(0, 0);

  scene.appendChild(background);
  director.replaceScene(scene);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('blackjack.start', blackjack.start);
