/**
 * User: werkn-development
 * Date: Fri Aug 23 14:36:04 MST 2019
 * 
 * LevelSelectScene is used to list the available levels for play.
 * 
 * Level save states can also be reset from the scene by pressing 'r'.
 */

import TextButton from "../ui/button.js";
import SaveManager from "../managers/save-manager.js";
import ParallaxBackground from "../effects/parallax-background.js";

/**
 * A class that extends Phaser.Scene and provides our level selection screen.
 */
export default class LevelSelectScene extends Phaser.Scene {
	constructor(config) {
		if (config) {
			super(config);
		} else {
			super({ key: 'level_select' });
		}

		this.levelButtons = [];
		this.numOfLevels = 15;
		this.keyBindings = {
			1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX", 7: "SEVEN",
			8: "EIGHT", 9: "NINE", 10: "A", 11: "B", 12: "C", 13: "D", 14: "E", 15: "F"
		};
	}

	preload() {
		//parallax background images
		this.load.image("background-far", "./assets/background/back.png");
		this.load.image("background-middle", "./assets/background/middle.png");

		//if there is local storage saved game load it
		//if level(s) state isn't set, initialize it
		if (this.sys.game.levelState == undefined) {

			if (!SaveManager.hasSavedGame()) {
				//true = unlocked, false = locked
				this.sys.game.levelState = {
					"1": { unlocked: true, time: -1, hasEndBoss: false },
					"2": { unlocked: false, time: -1, hasEndBoss: false },
					"3": { unlocked: false, time: -1, hasEndBoss: false },
					"4": { unlocked: false, time: -1, hasEndBoss: false },
					//end boss levels do not have a prespawned exit, 
					//the exit is spawned after boss is defeated
					"5": { unlocked: false, time: -1, hasEndBoss: true },
					"6": { unlocked: false, time: -1, hasEndBoss: false },
					"7": { unlocked: false, time: -1, hasEndBoss: false },
					"8": { unlocked: false, time: -1, hasEndBoss: false },
					"9": { unlocked: false, time: -1, hasEndBoss: false },
					"10": { unlocked: false, time: -1, hasEndBoss: true },
					"11": { unlocked: false, time: -1, hasEndBoss: false },
					"12": { unlocked: false, time: -1, hasEndBoss: false },
					"13": { unlocked: false, time: -1, hasEndBoss: false },
					"14": { unlocked: false, time: -1, hasEndBoss: false },
					"15": { unlocked: false, time: -1, hasEndBoss: true }
				};

				//perform initial save
				SaveManager.saveGame(this.sys.game.levelState);
			} else {
				SaveManager.loadGame(this);
			}

		}
		
		//add parallax background
		this.parallaxBackground = new ParallaxBackground(
			this,
			"background-far",
			"background-middle",
			0.6,
			0.3
		);
	}

	create() {
		const { width, height } = this.sys.game.config;

		//https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shape-rectangle/
		const background = this.add.rectangle(this.sys.canvas.width / 2,
			this.sys.canvas.height / 2, this.sys.canvas.width, this.sys.canvas.height, 0x000000, 0.8);

		var add = this.add;
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

		//create our levelButtons
		for (var i = 1; i <= this.numOfLevels; i++) {
			console.log(i);

			var shortcutText;
			if (i > 9) {
				shortcutText = this.keyBindings[i];
			} else {
				shortcutText = i;
			}

			this.levelButtons.push(new TextButton(this,
				this.sys.canvas.width * 0.5, 
				this.sys.canvas.height * (0.15 + (i*0.05)),
				this.levelStateText(this, i+"", shortcutText),
				unlockedStyle, 
				lockedStyle, 
				this.sys.game.levelState[i+""].unlocked,
				this.startLevel, i+""));

			//add button to scene
			this.add.existing(this.levelButtons[this.levelButtons.length - 1]);
		}

		this.add
			.text(width / 2, height * 0.1, "Level Select", {
				fontFamily: '"Press Start 2P", Courier',
				fontSize: 18, 
				strokeThickness: 4,
				stroke: '#000000',
				fill: "yellow"
			})
			.setOrigin(0.5, 0.5);

		this.resetButton = new TextButton(this,
			this.sys.canvas.width * 0.75, this.sys.canvas.height * 0.95,
			"(r) Reset progress...",
			unlockedStyle, 
			lockedStyle, 
			true,
			() => { SaveManager.eraseSaveGame; window.location.reload(false); } );

		//add buttons to scene
		this.add.existing(this.resetButton);

		// keybindings
		this.input.keyboard.on("keydown_ESC", event => { this.scene.start("title_screen"); });
		this.input.keyboard.on("keydown_ONE", event => { this.startLevel(this, "1"); });
		this.input.keyboard.on("keydown_TWO", event => { this.startLevel(this, "2"); });
		this.input.keyboard.on("keydown_THREE", event => { this.startLevel(this, "3"); });
		this.input.keyboard.on("keydown_FOUR", event => { this.startLevel(this, "4"); });
		this.input.keyboard.on("keydown_FIVE", event => { this.startLevel(this, "5"); });
		this.input.keyboard.on("keydown_SIX", event => { this.startLevel(this, "6"); });
		this.input.keyboard.on("keydown_SEVEN", event => { this.startLevel(this, "7"); });
		this.input.keyboard.on("keydown_EIGHT", event => { this.startLevel(this, "8"); });
		this.input.keyboard.on("keydown_NINE", event => { this.startLevel(this, "9"); });
		this.input.keyboard.on("keydown_A", event => { this.startLevel(this, "10"); });
		this.input.keyboard.on("keydown_B", event => { this.startLevel(this, "11"); });
		this.input.keyboard.on("keydown_C", event => { this.startLevel(this, "12"); });
		this.input.keyboard.on("keydown_D", event => { this.startLevel(this, "13"); });
		this.input.keyboard.on("keydown_E", event => { this.startLevel(this, "14"); });
		this.input.keyboard.on("keydown_F", event => { this.startLevel(this, "15"); });
		this.input.keyboard.on("keydown_R", event => {
			SaveManager.eraseSaveGame(); 
			window.location.reload(false);
		});
		
	}

	//setup our levelStateText (what the text button should say)
	//ex:  '(1) Level 1: Unlocked / Time: NOT ATTEMPTED'
	levelStateText(scene, level, keyBinding) {
		const levelState = scene.sys.game.levelState[level];
		const unlocked = ((typeof levelState !== undefined) && levelState.unlocked) ? "UNLOCKED" : "LOCKED";
		//levelState.time is initially set to -1, so if its this value
		//we know the level hasn't been attempted
		const time = (levelState.time != -1) ? "Time: " + levelState.time + " seconds" : "Time: NOT COMPLETED";
		const levelText = "(" + keyBinding + ")" 
			+ " Level " + level 
			+ ": " 
			+ unlocked 
			+ " / " 
			+ time ;

		return levelText;
	}

	//try to start the provided level
	startLevel(scene, level) {
		//only load the levle if it's not locked
		if (scene.sys.game.levelState[level].unlocked) {
			scene.scene.start("level"+level);
		}
	}

	update(time, delta) { 
		this.parallaxBackground.update();
	}
}
