/**
* User: werkn-development
* Date: Sat Aug 31 12:45:28 MST 2019
* 
* BeeEnemy is similar to EagleEnemy but moves vertically up and down within the level instead
* of horizontally.
*/

export default class BeeEnemy {

	constructor(scene, x, y, name) {
		this.scene = scene;

		const anims = scene.anims;
		//IDLE ANIMATION
		anims.create({
			key: "bee-idle",
			frames: anims.generateFrameNames("additional_enemies_atlas", {
				prefix: "bee-",
				suffix: '.png',
				start: 1,
				end: 8
			}),
			frameRate: 10,
			repeat: -1
		});

		//DEATH ANIMATION
		anims.create({
			key: "enemy-die",
			frames: anims.generateFrameNames("atlas", {
				prefix: "enemy-death-",
				suffix: '.png',
				start: 1,
				end: 6
			}),
			frameRate: 10,
			repeat: 0 
		});

		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "additional_enemies_atlas", "bee-1.png")
			.setDrag(1000, 0)
			.setMaxVelocity(300, 1000);  //max horiz. speed as well as max jump height!
		this.sprite.body.setAllowGravity(false); //stop eagle from faling from sky	
			
		//listen for animation complete callback on enemy death animation,
		//as soon as the animation completes kill the enemy and allow it to be 
		//removed from EnemyManager
		this.sprite.on('animationcomplete', function (animation, frame) {
		    if (animation.key == "enemy-die") {
				this.dead = true;
			}
		}, this);

		this.sprite.name = name;
		this.sprite.state = "normal";
		this.direction = -1;
		this.dead = false;

		this.canCollideWithWidget = true; //enemy is bound by tilemap widgets
	}

	die() {
		this.sprite.anims.play("enemy-die", true);
	}

	update() {
		if (this.sprite.state != "dying") {
			const sprite = this.sprite;

			this.sprite.y += (1*this.direction);

			//we've collided with a collision layer widget, reverse direction
			if (this.canCollideWithWidget && this.sprite.state == "flip_direction") {
				this.direction *= -1;
				this.canCollideWithWidget = false;

				//wait 1500 seconds before allow widget collisions/direction reverseal again
	    		this.scene.time.delayedCall(1500, function() { 
					this.sprite.state = "normal";
					this.canCollideWithWidget = true; 
				}, null, this);
			}
			sprite.anims.play("bee-idle", true);
			
		} else {
			this.die();
		}
	}

	destroy() {
		this.sprite.destroy();
	}
}

