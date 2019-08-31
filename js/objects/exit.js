/**
 * User: werkn-development
 * Date: Fri Aug 23 13:07:10 MST 2019
 * 
 * A class that wraps up our exit/door logic.  When the
 * player comes into contact with the door PlatformerScene
 * will detect the door.state change and move to the next scene.
 */

export default class Exit {

	constructor(scene, x, y, name) {
		this.scene = scene;

		const anims = scene.anims;

		//EXIT/DOOR IDLE ANIMATION
		anims.create({
			key: "door-idle",
			frames: anims.generateFrameNames("atlas", {
				prefix: "item-feedback-",
				suffix: '.png',
				start: 1,
				end: 4
			}),
			frameRate: 10,
			repeat: -1
		});


		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "atlas", "item-feedback-1.png")
			.setDrag(1000, 0)
			.setMaxVelocity(300, 1000); 

		this.sprite.name = name;
		this.sprite.state = "normal";
	}

	update() {
		const sprite = this.sprite;

		if (sprite.state == "normal") {
			sprite.anims.play("door-idle", true);

			//check for an overlap between player and this exit
			this.scene.physics.world.overlap(this.scene.player.sprite, this.sprite, function(player, door) {
				//player is alive and well, call exit level
				if (player.state == "normal") {
					door.state = "exit_touched";
				}
			}, null, this);
		} 
	}

	destroy() {
		this.sprite.destroy();
	}
}
