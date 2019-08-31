/**
 * User: werkn-development
 * Date: Fri Aug 23 13:12:40 MST 2019
 * 
 * A class that wraps up our frog-springboard logic.  
 *
 * FrogSpringboard is essentially the FrogEnemy sprite,
 * tinted blue with all of the enemy logic removed.  When the player jumps
 * on the FrogSpringboard they will be launched into the air similar to 
 * the springboard in Mario.
 */
export default class FrogSpringboard {

	constructor(scene, x, y, name) {
		this.scene = scene;

		const anims = scene.anims;

		//BASE ANIMATION
		anims.create({
			key: "frog-idle",
			frames: anims.generateFrameNames("atlas", {
				prefix: "idle/frog-idle-",
				suffix: '.png',
				start: 1,
				end: 4
			}),
			frameRate: 3,
			repeat: -1
		});

		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "atlas", "idle/frog-idle-1.png")
			.setDrag(1000, 0)
			.setMaxVelocity(300, 1000);

		this.sprite.name = name;
		this.sprite.state = "normal";
		this.sprite.setTint(0x00e5ff); //tint blue/green
	}

	update() {
		this.sprite.anims.play("frog-idle", true);

		//check for player and frogSpringboard collision
		this.scene.physics.world.overlap(this.scene.player.sprite, this.sprite, function(player, frogSpringboard) {
			if (player.state == "normal") {
				if(frogSpringboard.body.touching.up && player.body.touching.down) {	
					//launch player in the air
					player.setVelocityY(-850);
					player.owner.usedDoubleJump = false; //reset double jump
				} 
			}
		}, null, this);
	}

	destroy() {
		this.sprite.destroy();
	}
}
