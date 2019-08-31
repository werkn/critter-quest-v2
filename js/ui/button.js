/**
 * User: werkn-development
 * Date: Fri Aug 23 13:15:24 MST 2019
 *
 * Provides a basic TextButton that has a few states for interaction and
 * not must else.  Can be locked/unlocked.
 * 
 * Note:  Phaser 3 has no UI support.  Class below implements a basic button.
 * Adapted from: https://snowbillr.github.io/blog//2018-07-03-buttons-in-phaser-3/
 */
export default class TextButton extends Phaser.GameObjects.Text {
	constructor(scene, x, y, text, unlockedStyle, lockedStyle, unlocked, callback, arg) {
		super(scene, x, y, text, (unlocked) ? unlockedStyle : lockedStyle);

		this.lockedStyle = lockedStyle; 
		this.unlockedStyle = unlockedStyle;
		this.unlocked = unlocked;
		this.setInteractive({ useHandCursor: true })
			.on('pointerover', () => this.enterButtonHoverState())
			.on('pointerout', () => this.enterButtonRestState())
			.on('pointerdown', () => this.enterButtonActiveState())
			.on('pointerup', () => {
				this.enterButtonHoverState();
				callback(scene, arg);
			});

		this.setOrigin(0.5);
	}

	enterButtonHoverState() {
		this.setStyle({ fill: "#0ff" });
	}

	enterButtonRestState() {
		this.setStyle((this.unlocked) ? this.unlockedStyle : this.lockedStyle);
	}

	enterButtonActiveState() {
		this.setStyle({ fill: "#fff" });
	}
}
