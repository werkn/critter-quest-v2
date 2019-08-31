/**
 * User: werkn-development
 * Date: Fri Aug 23 13:23:37 MST 2019
 * 
 * CreditsScene is part of our Menu system and displayed after
 * the player has completed the game.
 *
 * The player can return to the title screen by hitting ENTER.
 */

import ParallaxBackground from "../effects/parallax-background.js";
import TextButton from "../ui/button.js";

export default class CreditsScene extends Phaser.Scene {
	constructor(config) {
		if (config) {
			super(config);
		} else {
			super({key: 'credits'});
		}
	}

	preload() {
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

		const linkStyle = { 
			align: 'center', 
			fontSize: 18, 
			fontFamily: '"Press Start 2P"',
			fill: 'blue' 
		};
		const lockedStyle = { 
			fill: '#f00', 
			align: 'center', 
			fontSize: 10, 
			strokeThickness: 4,
			stroke: '#000000',
			fontFamily: '"Press Start 2P"'
		};

		this.add
			.text(width / 2, height * 0.2, "Credits", this.sys.game.headingStyle)
			.setOrigin(0.5, 0.5);

		this.add
			.text(width / 2, height * 0.3, "Developed by werkn", this.sys.game.headingStyle)
			.setOrigin(0.5, 0.5);

		this.werknSiteLink = new TextButton(this,
			this.sys.canvas.width * 0.5, this.sys.canvas.height * 0.35,
			'werkn.github.io', 
			this.sys.game.defaultStyle,
			lockedStyle,
			true,
			() => window.open('https://werkn.github.io','_blank'));

		this.add.existing(this.werknSiteLink);

		this.add
			.text(width / 2, height * 0.4, "Tileset by ansimuz", this.sys.game.headingStyle)
			.setOrigin(0.5, 0.5);
		
		this.ansimuzLink = new TextButton(this,
			this.sys.canvas.width * 0.5, this.sys.canvas.height * 0.45,
			'ansimuz.itch.io', 
			this.sys.game.defaultStyle,
			lockedStyle,
			true,
			() => window.open('https://ansimuz.itch.io/','_blank'));

		this.add.existing(this.ansimuzLink);

		this.add
			.text(width / 2, height * 0.5, "Music by Pascal Belisle", this.sys.game.headingStyle)
			.setOrigin(0.5, 0.5);
		
		this.pascalLink = new TextButton(this,
			this.sys.canvas.width * 0.5, this.sys.canvas.height * 0.55,
			'soundcloud.com/pascalbelisle', 
			this.sys.game.defaultStyle,
			lockedStyle,
			true,
			() => window.open('https://soundcloud.com/pascalbelisle','_blank'));

		this.add.existing(this.pascalLink);

		this.add
			.text(width / 2, height * 0.75, '<Press Enter>', this.sys.game.defaultStyle)
			.setOrigin(0.5, 0.5);

		this.input.keyboard.once("keydown_ENTER", event => {
			//restart the entire game by forcing a page reload
			window.location.reload(false); 
		});
	}

	update(time, delta) {
		this.parallaxBackground.update();
	}
}

