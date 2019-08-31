/**
 * User: werkn-development
 * Date: Fri Aug 23 13:26:04 MST 2019
 * 
 * GameOverScene is part of our Menu system and displayed after
 * the player has used all their lives.
 *
 * The player can return to the title screen by hitting ENTER.
 */

import ParallaxBackground from "../effects/parallax-background.js";
import SaveManager from "../managers/save-manager.js";

/**
 * A class that extends Phaser.Scene and wraps up the core logic for the platformer level.
 */
export default class GameOverScene extends Phaser.Scene {
	constructor(config) {
		if (config) {
			super(config);
		} else {
			super({key: 'game_over'});
		}
	}

	preload() {
		//parallax background images
		this.load.image("background-far", "./assets/background/back.png");
		this.load.image("background-middle", "./assets/background/middle.png");
	}

	create() {
		const { width, height } = this.sys.game.config;

		//add parallax background
		this.parallaxBackground = new ParallaxBackground(
			this,
			"background-far",
			"background-middle",
			0.6,
			0.3
		);

		//https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shape-rectangle/
		const background = this.add.rectangle(this.sys.canvas.width / 2,
			this.sys.canvas.height / 2, this.sys.canvas.width, this.sys.canvas.height, 0x000000, 0.8);

		this.add
			.text(width / 2, height * 0.2, "Game Over", this.sys.game.headingStyle)
			.setOrigin(0.5, 0.5);

		this.add
			.text(width / 2, height * 0.5, '<Press Enter>', this.sys.game.defaultStyle)
			.setOrigin(0.5, 0.5);

		this.input.keyboard.once("keydown_ENTER", event => {

			//player has died, return to title screen and reset their game
			this.resetGame();
			window.location.reload(false); 
		});
	}

	resetGame() {
		//doc here on scene management:
		//https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scenemanager/#start-scene
		//scene.scene.start will launch new scene and shutdown
		//current scene

		this.sys.game.lives = undefined;
		this.sys.game.gems = undefined;

		//true = unlocked, false = locked
		this.sys.game.levelState = undefined; 

		//erase game progress
		SaveManager.eraseSaveGame();
	}

	update(time, delta) {
		this.parallaxBackground.update();
	}
}
