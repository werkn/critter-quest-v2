/**
* User: werkn-development
* Date: Fri Aug 23 12:56:35 MST 2019
* 
* Class representing our 1-Up/Extra Life.
*/

export default class ExtraLife {
	constructor(scene, x, y) {
		this.scene = scene;

		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "atlas", "idle/player-idle-1.png")
			.setDrag(1000, 0)
			.setMaxVelocity(0, 0);

		this.sprite.body.debugBodyColor = this.sprite.body.touching.none ? 0x0099ff : 0xff9900;
		this.sprite.name = "extra-life";
	}

	update() {
		//add sin/cos vertical movement
	}

	destroy() {
		this.sprite.destroy();
	}

}

