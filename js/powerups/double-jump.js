/**
* User: werkn-development
* Date: Sat Aug 31 12:42:59 MST 2019
* 
* DoubleJumpPowerup is a collectable powerup that once collected allows the player
* to jump twice consecutively.
*/

export default class DoubleJumpPowerup {
	constructor(scene, x, y) {
		this.scene = scene;

		const anims = scene.anims;


		//ANIMATION
		anims.create({
			key: "cherry-idle",
			frames: anims.generateFrameNames("atlas", {
				prefix: "cherry-",
				suffix: '.png',
				start: 1,
				end: 7
			}),
			frameRate: 3,
			repeat: -1
		});
		
		this.nameText = this.scene.make.text({
			    x: x,
			    y: y - 20,
			    text: '+Double Jump',
			    style: {
					        font: '14px monospace',
					        fill: '#ffffff',
							stroke: '#000',
							strokeThickness: 4
					    }
		});
		this.nameText.setOrigin(0.5, 0.5);

		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "atlas", "cherry-1.png")
			.setDrag(1000, 0)
			.setMaxVelocity(0, 0);

		this.sprite.anims.play("cherry-idle", true);
		this.sprite.body.debugBodyColor = this.sprite.body.touching.none ? 0x0099ff : 0xff9900;
		this.sprite.name = "double-jump-powerup";
	}

	update() {}

	destroy() {
		this.nameText.destroy();
		this.sprite.destroy();
	}

}

