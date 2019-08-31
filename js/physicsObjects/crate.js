/**
* User: werkn-development
* Date: Sat Aug 31 12:40:17 MST 2019
* 
* Crate is used to kill enemy snails obstructing paths within the game.
*/

export default class Crate {

	constructor(scene, x, y, name) {
		this.scene = scene;

		const anims = scene.anims;

		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "props_atlas", "crate.png")
			.setDrag(500, 0)
			.setImmovable(true);

		this.sprite.body.setAllowGravity(true);

		this.sprite.name = name;
		this.sprite.state = "normal";
		this.sprite.owner = this;
	}

	move() {
		//which direction is the crate being hit from?
		if (this.sprite.body.touching.left) {
			this.sprite.setVelocityX(50); //move crate right
		} else if (this.sprite.body.touching.right) {
			this.sprite.setVelocityX(-50); //move crate left
		}

	}

	destroy() {
		this.sprite.destroy();
	}
}
