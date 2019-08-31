/**
 * User: werkn-development
 * Date: Fri Aug 23 13:28:33 MST 2019
 * 
 * TitleScreen is part of our Menu system and is the first scene 
 * presented to the player.  It configures the SoundManager, and loads
 * all audio resources.
 */

import ParallaxBackground from "../effects/parallax-background.js";
import SaveManager from "../managers/save-manager.js";

/**
 * A class that extends Phaser.Scene and wraps up the core logic for the Title Screen.
 */
export default class TitleScreenScene extends Phaser.Scene {
	constructor(config) {
		if (config) {
			super(config);
		} else {
			super({key: 'title_screen'});
		}

	}

	preload() {
		//get game width and height	
		const { width, height } = this.sys.game.config;

		this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

		//loading resources tutorial
		//src: https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/
		//create loading text
		this.loadingText = this.make.text({
			x: width / 2,
			y: height / 2 - 50,
			text: 'Loading...',
			style: {
				font: '20px monospace',
				fill: '#ffffff'
			}
		});
		this.loadingText.setOrigin(0.5, 0.5);

		//we use a second fontLoadingText here because we 
		//have a loading delay when loading our google fonts
		//which exists outside of the callbacks for phaser3 project loading
		//so we need to display a custom font loading indicator
		this.fontLoadingText = this.make.text({
			x: width / 2,
			y: height / 2 - 50,
			text: '',
			style: {
				font: '20px monospace',
				fill: '#ffffff'
			}
		});
		this.fontLoadingText.setOrigin(0.5, 0.5);
		this.fontLoadingText.setDepth(10);

		this.load.on('complete', function (context) {
			//remove loading text for phaser3 data
			this.scene.loadingText.destroy();

			//show the font loading text for Google fonts now
			this.scene.fontLoadingText.setText("Loading fonts...");
		});

		this.load.on('progress', function (value) {
			this.scene.loadingText.setText("Loading: " + parseInt(value * 100) + "%" + "...");
		});

		//parallax background images
		this.load.image("background-far", "./assets/background/back.png");
		this.load.image("background-middle", "./assets/background/middle.png");

		//load audio
		this.load.audio("music", "./assets/audio/music.ogg");
		this.load.audio("jump", "./assets/audio/jump.wav");
		this.load.audio("coinCollected", "./assets/audio/coin_collected.wav", {
			instances: 4
		});
	}

	create() {
		//get game width and height	
		const { width, height } = this.sys.game.config;

		this.titleTextAdded = { added: false, loadFailed: false };

		//setup default text style(s)
		this.sys.game.defaultStyle = {
			fontFamily: '"Press Start 2P", Courier',
			fontSize: 12, 
			strokeThickness: 4,
			stroke: '#000000',
			fill: "white"
		}

		this.sys.game.headingStyle = {
			fontFamily: '"Press Start 2P", Courier',
			fontSize: 18, 
			strokeThickness: 4,
			stroke: '#000000',
			fill: "yellow"
		}

		var add = this.add;
		var titleTextAdded = this.titleTextAdded;
		var defaultStyle = this.sys.game.defaultStyle;
		var headingStyle = this.sys.game.headingStyle;
		var fontLoadingText = this.fontLoadingText;

		//attempt to load our google fonts
		//src:  https://github.com/typekit/webfontloader#events
		if (typeof WebFont !== 'undefined') {
			WebFont.load({
				google: {
					families: [ 'Press Start 2P' ]
				},
				active: function () //active fires if 1 or more fonts load
				{ 
					//setup title text @ center screen
					add
						.text(width / 2, height / 2, "Critter Quest", headingStyle)
						.setOrigin(0.5, 0.5);

					add
						.text(width / 2, height * 0.8, '<Press Enter>', defaultStyle)
						.setOrigin(0.5, 0.5);

					//fonts loaded
					titleTextAdded.added = true;

					//destory our fontLoadingText, as our fonts loaded succesfully
					fontLoadingText.destroy();

					console.log("Fonts loaded.");
				},
				//default timeout: 3000ms
				inactive: function() {  //inactive fires if font could not load/not supported
					//setup title text @ center screen
					
					titleTextAdded.added = false;
					titleTextAdded.loadFailed = true;

					console.log("API call with WebFont succeeded but font was not loaded.  Check font name.");
				}
			});
		} else {
			titleTextAdded.added = false;
			titleTextAdded.loadFailed = true;

		}

		//add parallax background
		this.parallaxBackground = new ParallaxBackground(
			this,
			"background-far",
			"background-middle",
			0.6,
			0.3
		);

		//setup audio on the game object, this allows me to access it in any scene
		this.sys.game.soundManager = {};

		this.sys.game.soundManager.music = {};
		this.sys.game.soundManager.music.inGameMusic = this.sound.add(
			"music", 
			{ 
				loop: true,
				volume: 0.35 
			}
		);
		this.sys.game.soundManager.music.inGameMusic.play();

		this.sys.game.soundManager.sfx = {};
		this.sys.game.soundManager.sfx.jump = this.sound.add("jump", { volume: 0.35 });
		this.sys.game.soundManager.sfx.coinCollected = this.sound.add("coinCollected", { volume: 0.2 });

		//start LevelSelectScene when ENTER is pressed
		this.input.keyboard.once("keydown_ENTER", event => {
			this.scene.start('level_select');
		});

		//TODO: remove in final version this is used to wipe save files
		this.input.keyboard.once("keydown_R", event => {
			SaveManager.eraseSaveGame();
		});

		//https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shape-rectangle/
		const background = this.add.rectangle(this.sys.canvas.width / 2,
			this.sys.canvas.height / 2, this.sys.canvas.width, this.sys.canvas.height, 0x000000, 0.8);
	}

	addTitleText() {
		//get game width and height	
		const { width, height } = this.sys.game.config;

		console.log("WebFont not loaded.  Use default font.");
		//setup title text @ center screen
		this.add
			.text(width / 2, height / 2, "Critter Quest", this.sys.game.headingStyle)
			.setOrigin(0.5, 0.5);

		this.add
			.text(width / 2, height * 0.8, '<Press Enter>', this.sys.game.defaultStyle)
			.setOrigin(0.5, 0.5);
	}

	update(time, delta) {
		this.parallaxBackground.update();

		//add title text if it was not added using WebFont (ie: likely
		//no internet)
		if (!this.titleTextAdded.added) {
			if (this.titleTextAdded.loadFailed) {
				this.addTitleText();
				this.titleTextAdded.added = true;
				//destroy out fontLoadingText
				this.fontLoadingText.destroy();
			}
		}
	}
}
