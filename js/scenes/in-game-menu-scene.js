/**
 * User: werkn-development
 * Date: Fri Aug 23 14:04:22 MST 2019
 * 
 * InGameMenuScene is used to display a menu to the player while
 * in-game so they can mute audio or return to the level select screen.
 *
 * The scene that launched the InGameMenuScene will be paused while the
 * in-game menu is visible.
 */

import TextButton from "../ui/button.js";

export default class InGameMenuScene extends Phaser.Scene {
	constructor(config) {
		if (config) {
			super(config);
		} else {
			super({ key: 'in_game_menu' });
		}
	}

	//get scene init data
	init(data) {
		if (data) {
			this.currentScene = data.sceneName;
		} else {
			console.log("InGameMenuScene needs sceneName provided as init data.");
		}
	}

	preload() {}

	create() {
		//https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shape-rectangle/
		const background = this.add.rectangle(this.sys.canvas.width / 2,
			this.sys.canvas.height / 2, this.sys.canvas.width, this.sys.canvas.height, 0x000000, 0.8);

		const { width, height } = this.sys.game.config;

		const lockedStyle = { 
			fill: '#f00', 
			align: 'center', 
			fontSize: 10, 
			strokeThickness: 4,
			stroke: '#000000',
			fontFamily: '"Press Start 2P"'
		};

		const unlockedStyle = { 
			fill: '#0f0', 
			align: 'center', 
			fontSize: 10, 
			strokeThickness: 4,
			stroke: '#000000',
			fontFamily: '"Press Start 2P"' 
		};

		this.add
			.text(width / 2, height * 0.2, "In-Game Menu", this.sys.game.headingStyle)
			.setOrigin(0.5, 0.5);

		this.muteButton = new TextButton(this,
			this.sys.canvas.width * 0.5, this.sys.canvas.height * 0.45,
			(this.sound.mute) ? "(a) Audio: Disabled" : "(a) Audio: Enabled",
			unlockedStyle,
			lockedStyle,
			true,
			() => this.updateAudio());
		this.returnToGameButton = new TextButton(this,
			this.sys.canvas.width * 0.5, this.sys.canvas.height * 0.50,
			'(esc) Return to Game',
			unlockedStyle,
			lockedStyle,
			true,
			() => this.returnToGame());
		this.exitToLevelSelectButton = new TextButton(this,
			this.sys.canvas.width * 0.5, this.sys.canvas.height * 0.55,
			'(l) Exit to Level Select',
			unlockedStyle,
			lockedStyle,
			true,
			() => this.returnToLevelSelect());

		this.add.existing(this.muteButton);
		this.add.existing(this.returnToGameButton);
		this.add.existing(this.exitToLevelSelectButton);

		//pause the game scene, and move this scene above it in render order
		this.scene.pause(this.currentScene);
		this.scene.moveAbove(this.currentScene);

		// keybindings
		this.input.keyboard.on("keydown_ESC", event => {
			this.returnToGame();
		});
		this.input.keyboard.on("keydown_A", event => {
			this.updateAudio();
		});
		this.input.keyboard.on("keydown_L", event => {
			this.returnToLevelSelect();
		});
	}

	updateAudio() {
		this.sound.setMute(!this.sound.mute);
		this.muteButton.text = (this.sound.mute) ? "(a) Audio: Disabled" : "(a) Audio: Enabled";
	}

	returnToGame() {
		//stop the in-game menu scene
		this.scene.resume(this.currentScene);
		this.scene.stop();
	}

	returnToLevelSelect() {
		//end current game scene
		this.scene.stop('in_game_menu');
		//remove HUD overlay
		this.scene.stop('hud_overlay');
		this.scene.stop(this.currentScene);

		//launch level select
		this.scene.start("level_select")
	}

	update(time, delta) {}
}
