/*
	Meteror Runaway (versión beta)
	Alberto Fortes | www.albertofortes.com | albertofortes@gmail.com
	hecho del 27 al 28 noviembre de 2014
	juego HTML5 Hecho con el framework de JavaScript Phaser.io
	Todos los sonidos e imágenes están tomados de Google. Son provisionales para la demo beta
*/

// carga objeto Phaser
var game = new Phaser.Game(768, 1024, Phaser.AUTO, 'pocoyo-game', 'game');
// iniciamos los estados al final de este archivo.

// Game es el objeto principal:
var Game = {};

/*
	Boot:
*/
Game.Boot = function(game){};

Game.Boot.prototype = {
	preload: function() {
		this.load.image('preloaderBar', 'assets/image/loading-bar.png');
	},
	create: function() {
		// maxPointers=1 define que no vamos a usar multi-touch
		this.input.maxPointers = 1;
		/*
		escalar el juego:
		*/
		// scale.scaleMode pone los controles para escalar, las opciones son: EXACT_FIT (100% escala alto y ancho), NO_SCALE (sin escalar) and SHOW_ALL (escala asegurándose q se muestra todo y se preserva el radio)
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		// alinea horizontal y vertical por lo que siempre se alinea el canvas en la pantalla (una especia de margin: 0 auto)
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.setScreenSize(true); // scale.setScreenSize(true) activa el escalado

		// activa el Preloader (que está en preloader.js) que son las constantes, y assets (sprites e imágenes, etc) que hay que precargar
		this.state.start('Preloader');
	}
};

/*
	Preloader
*/

Game.Preloader = function(game) {

	Game.GAME_WIDTH = 768;
	Game.GAME_HEIGHT = 1024;
	Game.PLAYER_WIDTH = 55;
	Game.PLAYER_HEIGHT = 173;

};

Game.Preloader.prototype = {
	preload: function() {

		this.stage.backgroundColor = '#000000';

		// barra de carga: loading...
		this.preloadBar = this.add.sprite( (Game.GAME_WIDTH-311)/2, (Game.GAME_HEIGHT-27)/2, 'preloaderBar' );
        this.load.setPreloadSprite(this.preloadBar);

		// precargamos las imágenes
		this.load.image('bg-start', 'assets/image/bg-start.png');
		this.load.image('bg-game', 'assets/image/starfield.jpg');
		this.load.image('bg-gameover', 'assets/image/bg-gameover.png');
		this.load.image('satellite', 'assets/image/satellite.png');
		this.load.image('bg-paused', 'assets/image/bg-paused.png');
		this.load.image('image-paused', 'assets/image/img-paused.png');
		this.load.image('bg-scoreboard', 'assets/image/bg-scoreboard.png');
		this.load.image('bg-buttonsboard', 'assets/image/bg-buttonsboard.png');
		this.load.image('star', 'assets/image/star.png');
		this.load.image('bt-twitter', 'assets/image/bt-twitter.png');
		this.load.image('bt-facebook', 'assets/image/bt-facebook.png');

		// precargamos los sprites (parámetros: nombre interno, url, ancho, alto, frames)
		this.load.spritesheet('asteroid', 'assets/image/sprite-asteroid.png', 50, 50); // sprite con el coche del jugador
		this.load.spritesheet('ufo', 'assets/image/sprite-ufo.png', 75, 38); // sprite con el coche del jugador
		this.load.spritesheet('player-rocket', 'assets/image/player-rocket.png', Game.PLAYER_WIDTH, Game.PLAYER_HEIGHT); // sprite con el coche del jugador
		this.load.spritesheet('button-start', 'assets/image/button-start.png', 306, 110);
		this.load.spritesheet('button-mute', 'assets/image/button-mute.png', 50, 50);
		this.load.spritesheet('button-pause', 'assets/image/button-pause.png', 50, 50);

		// precargamos los audios
		//  Firefox doesn't support mp3 files, usar ogg (conversor online http://audio.online-convert.com/es/convertir-a-ogg)
    	game.load.audio('bg-music', ['assets/audio/bg-music.mp3', 'assets/audio/bg-music.ogg']);
    	game.load.audio('audio-hit', ['assets/audio/eat.mp3', 'assets/audio/eat.ogg']);
    	game.load.audio('collision-asteroid', ['assets/audio/cartoon-silbato.mp3', 'assets/audio/cartoon-silbato.ogg']);
    	game.load.audio('collision-ufo', ['assets/audio/robot-explosion.mp3', 'assets/audio/robot-explosion.ogg']);
    	game.load.audio('audio-score', ['assets/audio/score.mp3', 'assets/audio/score.ogg']);

	},
	create: function() {
		this.preloadBar = this.add.sprite( (Game.GAME_WIDTH-311)/2, (Game.GAME_HEIGHT-27)/2, 'preloaderBar' );
		this.load.setPreloadSprite(this.preloadBar);
		this.state.start('MainMenu');
	}
};

/*
	MainMenu
*/

// llamamos a this.state.start('mainMenu'); desde preloader.js
Game.MainMenu = function(game) {};

Game.MainMenu.prototype = {
	create: function() {

		// cargamso las imágenes creadas en preloader.js
		this.add.sprite( 0, 0, 'bg-start' );

		// botón star: 8 parámetros: left position, top position, name of the image (or sprite), the function to execute after the button is clicked, the context in which this function is executed, and indices of the images in the button's spritesheet: over (hover), out (normal), and down (touch/click).
		this.add.button( 10, Game.GAME_HEIGHT-150, 'button-start', this.startGame, this, 1, 0, 2 );

	},
	startGame: function() {
		this.state.start('Game');
	}

};

/*
	Game
*/
Game.Game = function(game) {

	this._bgRoad = null;
	this._player = null;
	this._asteroidGroup = null;
	this._ufosGroup = null;
	this.__satellitesGroup = null;
	this.__starsGroup = null;
	this._spinningAsteroid = false;
	this._spinningAsteroidRotationCont = 0;
	this._spawnUfoTimer = 0;
	this._spawnAsteroidTimer = 0;
	this._spawnSatelliteTimer = 0;
	this._spawnStarTimer = 0;
	this._fontStyle = null;
	Game._bgMusic = null;
	Game._audioHit = null;
	Game._audioCollisionAsteroid = null;
	Game._audioCollisionUfo = null;
	Game._audioScore = null;
	Game._scoreText = null;
	Game._healtText = null;
	Game._health = 0;
	Game._gameLevel = 0;

};

Game.Game.prototype = {
	create: function() {

		/*
		variables:
		*/
		Game._health = 3;
		Game._score = 0;

		// cargamos el audio para cuando coge un caramelo creados en el Game.Preloader
		Game._audioHit  = this.add.audio('audio-hit');
		Game._audioCollisionAsteroid  = this.add.audio('collision-asteroid');
		Game._audioCollisionUfo  = this.add.audio('collision-ufo');
		Game._audioScore  = this.add.audio('audio-score');

		// cargamos los audios creados en el Game.Preloader
		Game._bgMusic = this.add.audio('bg-music', 1, true);
		Game._bgMusic.play('', 0, 0.75, true);

		// ARCADE physics system
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 100; // gravedad general, peor luego en cada spawn vamso a darle una gravedad diferente a cada elemento

		// añadimos variable a un tileSprite para scrolling background de la carretera:
		this._bgRoad = game.add.tileSprite(0, 0, Game.GAME_WIDTH, Game.GAME_HEIGHT, 'bg-game');

		/*
		coche jugador
		*/
		this._player = this.add.sprite( (Game.GAME_WIDTH/2)-(Game.PLAYER_WIDTH/2), Game.GAME_HEIGHT-(Game.PLAYER_HEIGHT*2), 'player-rocket' );
		this._player.anchor.set(0.5); // esto centra el puntero del ratón al centro del coche del jugador
		// le otorgamso física para poder interactuar con el resto de objetos:
		this.physics.enable(this._player, Phaser.Physics.ARCADE);
		this._player.body.collideWorldBounds = true; // para que no se salga por los límites del juego (world)
		this._player.body.bounce.y = 0.2; // la elasticidad del muñeco cuando colisiona: bounce.x/y = 1 means full rebound, bounce.x/y = 0.5 means 50% rebound velocity.
		this._player.body.allowGravity = false; // para que no haya gravedad con lo que no se va abajo y se queda a la altura donde lo pongamos

		// estrellas premios score:
    	this._starsGroup = this.add.group();
    	this.spawnStar(this);

		// asteroids y lanzamos spawnAsteroid()
    	this._asteroidGroup = this.add.group();
    	this.spawnAsteroid(this);

    	// ufos (vehículos obstáculos) y lanzamos spawnUfos()
    	this._ufosGroup = this.add.group();
    	this.spawnUfo(this);

    	// satelites obstáculos:
    	this._satellitesGroup = this.add.group();
    	this.spawnSatellite(this);

    	/*
    	elementos menú y dashboard (que estén en la capa superior por encima del resto de elementos)
    	*/

    	// botones:
		//this.add.sprite( 10, 10, 'bg-scoreboard' );
		this.add.sprite( 0, 0, 'bg-buttonsboard' );
		this.pauseButton = this.add.button(Game.GAME_WIDTH - 120, 20, 'button-pause', this.managePause, this);
		this.muteButton = this.add.button(Game.GAME_WIDTH - 60, 20, 'button-mute', this.manageSound, this);

		// Score (puntuación):
    	// http://docs.phaser.io/Phaser.Text.html
    	this._fontStyle = { font: "37px Arial", fill: "#FFDA3B", stroke: "#EA8500", strokeThickness: 1, align: "left" };
    	Game._scoreText = this.add.text(160, 30, "0", this._fontStyle);

    	// Vidas
    	this._fontStyle = { font: "37px Arial", fill: "#FF3938", stroke: "#5B1213", strokeThickness: 1, align: "left" };
    	Game._healtText = this.add.text( 320, 30, Game._health, this._fontStyle );


	},
	update: function() {

		// scrolling background de la carretera:
		this._bgRoad.tilePosition.y +=5;

		/*
		mover el coche del jugador
		*/
		if (this.physics.arcade.distanceToPointer(this._player, this.input.activePointer) > 8) {
	       this.physics.arcade.moveToPointer(this._player, 400);

	    } else {
	        //  quitasmo la velocidad para que el coche no empiece a rebotar como loco
	        this._player.body.velocity.set(0);
	    };

	    /*
	    asteroids
	    */

	    // generar asteroids cada cierto tiempo
		this._spawnAsteroidTimer += this.time.elapsed;
		if( this._spawnAsteroidTimer > 1000 ){
			this._spawnAsteroidTimer = 0;
			this.spawnAsteroid(this);
		};

		// colisión entre player y asteroid
		this.physics.arcade.overlap(this._player, this._asteroidGroup, this.collisionAsteroid, null, this);

		if(this._spinningAsteroid) {
			this._player.angle += 10;
			if(this._spinningAsteroidRotationCont > 360) {
				this._spinningAsteroid = false;
				this._spinningAsteroidRotationCont = 0;
				this._player.angle = 0;
			}
			this._spinningAsteroidRotationCont +=10;
		};

		/*
	    ufos
	    */

	    // generar asteroids cada cierto tiempo
		this._spawnUfoTimer += this.time.elapsed;
		if( this._spawnUfoTimer > 1000 ){
			this._spawnUfoTimer = 0;
			this.spawnUfo(this);
		};

		// colisión entre player y ovnis
		this.physics.arcade.overlap(this._player, this._ufosGroup, this.collisionUfo, null, this);

		/*
	    satelites
	    */

	    // generar asteroids cada cierto tiempo
		this._spawnSatelliteTimer += this.time.elapsed;
		if( this._spawnSatelliteTimer > 6000 ){
			this._spawnSatelliteTimer = 0;
			this.spawnSatellite(this);
		};

		// colisión entre player y satelites
		this.physics.arcade.collide(this._player, this._satellitesGroup, this.collisionSatellite, null, this);

		/*
	    star
	    */

		// generar estrellas cada cierto tiempo
		this._spawnStarTimer += this.time.elapsed;
		if( this._spawnStarTimer > 2000 ){
			this._spawnStarTimer = 0;
			this.spawnStar(this);
		};

		// colisión entre player y estrella:
		this.physics.arcade.overlap(this._player, this._starsGroup, this.intersecStar, null, this);


		/*
		Game Over
		si nos quedamso sin vidas cargamos el método gameOver()
		*/
		if(!Game._health){
			this.gameOver();
		}


	},
	intersecStar: function(player, star) {

		star.kill();
		// aumentamos el score y actualizamos el label del score
		Game._score += 1;
		Game._scoreText.setText(Game._score);

		// sonido
		Game._audioScore.play('', 0);

	},
	spawnAsteroid: function() {

		// creamos la asteroid:
		var asteroid = game.add.sprite(Math.random()*Game.GAME_WIDTH, 0, 'asteroid');
		// añadimos física a la asteroid:
		this.physics.enable(asteroid, Phaser.Physics.ARCADE);
		asteroid.checkWorldBounds = true;
		asteroid.outOfBoundsKill = true; // If true Sprite.kill is called as soon as Sprite.inWorld returns false, as long as Sprite.checkWorldBounds is true.
		asteroid.anchor.setTo(0.5, 0.5); // la centra
		asteroid.body.gravity.y = 800;

		this._asteroidGroup.add(asteroid); // añadimos banan al grupo

	},
	collisionAsteroid: function (player, asteroid) {

		// animación
		asteroid.animations.add('explote', [1, 2, 3], 10, true);
		asteroid.animations.play('explote');

		// sonido choque con asteroid:
		Game._audioCollisionAsteroid.play('', 0, 0.5, false, false);

		// movemos el coche cuando patina a coord x,y:
		this.game.add.tween(this._player).to({ x: this.plusOrMinus(this._player.x), y: this.plusOrMinus(this._player.y) }, 100, Phaser.Easing.Quadratic.InOut, true);

		this._spinningAsteroid = true;


	},
	plusOrMinus: function(n) {
		var sign = Math.random() < 0.5 ? '-50' : '+50';
		return n + parseInt(sign);
	},
	spawnUfo: function() {

		// creamos ovni:
		var ufo = game.add.sprite(Math.random()*Game.GAME_WIDTH, 0, 'ufo');
		// añadimos física a la asteroid:
		this.physics.enable(ufo, Phaser.Physics.ARCADE);
		ufo.checkWorldBounds = true;
		ufo.outOfBoundsKill = true; // If true Sprite.kill is called as soon as Sprite.inWorld returns false, as long as Sprite.checkWorldBounds is true.
		ufo.anchor.setTo(0.5, 0.5);
		ufo.body.gravity.y = 300;

		this._ufosGroup.add(ufo); // añadimos ufo al grupo

	},
	collisionUfo: function(player, ufo) {

		/*
			creamos una propiedad .hasCollide para el objeto ufo y la ponemso a false
			si está a false o todavía no existe (ya que la creamso dentro), el grupo ovni no ha chocado con el player así que entramso en la función,
			de lo contrario no entramso en este grupo
		*/

		if( !ufo.hasOwnProperty('hasCollided') || !ufo.hasCollided ) {

			// animación explosión
			ufo.animations.add('explote', [1, 2, 3], 10, true);
			ufo.animations.play('explote');

			// sonido choque con asteroid:
			Game._audioCollisionUfo.play('', 0, 0.5, false, false);

			// quitamos vidas
			Game._health --;
			// update score text
			Game._healtText.setText(Game._health);

			ufo.hasCollided = true;

		}


	},
	spawnSatellite: function() {

		// creamos la asteroid:
		var dropPos = Math.random() * Game.GAME_WIDTH + 1;
		var satellite = game.add.sprite(dropPos, 0, 'satellite');
		// añadimos física a la asteroid:
		this.physics.enable(satellite, Phaser.Physics.ARCADE);
		satellite.checkWorldBounds = true;
		satellite.outOfBoundsKill = true; // If true Sprite.kill is called as soon as Sprite.inWorld returns false, as long as Sprite.checkWorldBounds is true.
		satellite.anchor.setTo(0.5, 0.5);
		satellite.body.gravity.y = 50;

		this._satellitesGroup.add(satellite); // añadimos al grupo

	},
	collisionSatellite : function() {

		// si chocas contra el satélite la palmas:
		this.gameOver();

	},
	spawnStar: function() {

		// creamos la estrella:
		var dropPos = Math.random() * Game.GAME_WIDTH + 1;
		var star = game.add.sprite(dropPos, 0, 'star');
		// añadimos física a la asteroid:
		this.physics.enable(star, Phaser.Physics.ARCADE);
		star.checkWorldBounds = true;
		star.outOfBoundsKill = true; // If true Sprite.kill is called as soon as Sprite.inWorld returns false, as long as Sprite.checkWorldBounds is true.
		star.anchor.setTo(0.5, 0.5);

		this._starsGroup.add(star); // añadimos estrella al grupo

	},
	managePause: function() {


		if(!this.game.paused){

			// pausamos solo si no estaba ya pausado
			this.game.paused = true;

			// creamos el sprite para pantalla pausada
			var bgPaused = this.add.tileSprite(0, 0, Game.GAME_WIDTH, Game.GAME_HEIGHT, 'bg-paused'); // tileSprite es un sprite que se repite
			var imgPaused = this.add.sprite(0, 0, 'image-paused');
			imgPaused.reset(Game.GAME_WIDTH/2 - imgPaused.width/2, Game.GAME_HEIGHT/2 - imgPaused.height/2);

			// cambiamso el frame del sprite del botón pause:
			this.pauseButton.setFrames(1);

			// si clicamos en la pantalla volvemos al juego (resume game)
			this.input.onDown.add(function(){

				bgPaused.destroy();
				imgPaused.destroy();
				this.game.paused = false;
				// cambiamso el frame del sprite del botón pause:
				this.pauseButton.setFrames(0);

			}, this);

		}

	},
	manageSound: function() {

		if (!Game._bgMusic || !Game._bgMusic.isPlaying) {
			// restauramso la música:
  			Game._bgMusic.resume();
  			// cambiamso el frame del sprite del botón mute:
			this.muteButton.setFrames(0);
		} else {
			// pausamso la musica
			Game._bgMusic.pause();
			// cambiamso el frame del sprite del botón mute:
			this.muteButton.setFrames(1);
		}

	},
	gameOver: function() {

		this.state.start('GameOver');

	}

};

/*
	Game Over
*/
Game.GameOver = function(game) {

	this._gameOverScore = null;

};

Game.GameOver.prototype = {
	create: function() {

		// paramos la música de fondo
		Game._bgMusic.stop();

		// creamos el sprite para pantalla game over
		this.add.sprite(0, 0, 'bg-gameover' );

		// http://docs.phaser.io/Phaser.Button.html
		// button: 8 parámetros: left position, top position, name of the image (or sprite), the function to execute after the button is clicked, the context in which this function is executed, and indices of the images in the button's spritesheet: over (hover), out (normal), and down (touch/click).
		this.add.button( 10, Game.GAME_HEIGHT-60-100, 'button-start', this.startGame, this, 1, 0, 2 );

		// botones compartir score:
		this.shareTwitterButton =  this.add.button( 0, 0, 'bt-twitter', this.shareOnTwitter, this );
		this.shareTwitterButton.reset( (Game.GAME_WIDTH/2) - this.shareTwitterButton.width, 700 );
		this.shareFacebookButton =  this.add.button( (Game.GAME_WIDTH/2) + 10, 700, 'bt-facebook', this.shareFacebook, this );


		// texto de la puntuación:
    	this._gameOverScore = game.add.text(Game.GAME_WIDTH/2, (Game.GAME_HEIGHT/2) -35, String(Game._score), { font: "55px Arial", fill: "#ff0000", stroke: "#06477E", strokeThickness: 5, align: "center" });
    	this._gameOverScore.anchor.set(0.5);

	},
	shareOnTwitter: function() {
		var shareTwitterUrl = "http://twitter.com/share?text=He conseguido "+Game._score+" puntos en el juego Meteor Runaway (beta)&url=http://www.albertofortes.com/HTML5-GAMES/meteor-runawaym&hashtags=HTML5,game";
		window.open(shareTwitterUrl);
	},
	shareFacebook: function() {
	    var shareFbUrl = "http://www.facebook.com/sharer.php?u=url_http://www.albertofortes.com/HTML5-GAMES/meteor-runaway&p[title]=Meteor Runaway&p[summary]=He conseguido "+Game._score+" puntos en el juego Meteor Runaway (beta)";
	    window.open(shareFbUrl);
	},
	startGame: function() {
		this.state.start('Game');
	}
}


/*
	iniciamos los estados:
*/
game.state.add('Boot', Game.Boot);
game.state.add('Preloader', Game.Preloader);
game.state.add('MainMenu', Game.MainMenu);
game.state.add('Game', Game.Game);
game.state.add('GameOver', Game.GameOver);

game.state.start('Boot');
