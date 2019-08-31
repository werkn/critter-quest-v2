/**
* User: werkn-development
* Date: Sat Aug 31 12:41:13 MST 2019
* 
* MovingPlatform(s) are used to create standable platforms that move left 
* to right on the screen.
*/

export default class MovingPlatform {

	constructor(scene, x, y, name) {
		this.scene = scene;

		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "props_atlas", "platform-long.png")
			.setImmovable(true);
		this.sprite.body.setAllowGravity(false); //stop eagle from faling from sky	
			
		this.sprite.name = name;
		this.sprite.state = "normal";
		this.sprite.direction = -1;
		this.canCollideWithWidget = true; //enemy is bound by tilemap widgets
	}

	update() {
			const sprite = this.sprite;

			this.sprite.x += (1*this.sprite.direction);

			//we've collided with a collision layer widget, reverse direction
			if (this.canCollideWithWidget && this.sprite.state == "flip_direction") {
				sprite.flipX = !sprite.flipX;
				this.sprite.direction *= -1;
				this.canCollideWithWidget = false;

				//wait 1500 seconds before allow widget collisions/direction reverseal again
	    		this.scene.time.delayedCall(1500, function() { 
					this.sprite.state = "normal";
					this.canCollideWithWidget = true; 
				}, null, this);
			}
	}

	destroy() {
		this.sprite.destroy();
	}
}

