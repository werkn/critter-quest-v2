/**
* User: werkn-development
* Date: Sat Aug 31 12:44:55 MST 2019
* 
* CrocEnemy is similar to OpossumEnemy but is much larger and moves much faster across the screen.
*/

export default class CrocEnemy {

	constructor(scene, x, y, name) {
		this.scene = scene;

		// Create the enemy's idle animations from the texture atlas. These are stored in the global
		// animation manager so any sprite can access them.
		const anims = scene.anims;
		//IDLE ANIMATION
		anims.create({
			key: "croc-idle",
			frames: anims.generateFrameNames("additional_enemies_atlas", {
				prefix: "gator-",
				suffix: '.png',
				start: 1,
				end: 4
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
			.sprite(x, y, "additional_enemies_atlas", "gator-1.png")
			.setDrag(1000, 0)
			.setMaxVelocity(300, 1000);  //max horiz. speed as well as max jump height
			

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
		this.direction = -2; //move 2x faster then opossum
		this.dead = false;

		this.canCollideWithWidget = true; //enemy is bound by tilemap widgets
	}

	die() {
		this.sprite.anims.play("enemy-die", true);
	}

	update() {
		if (this.sprite.state != "dying") {
			const sprite = this.sprite;

			this.sprite.x += (1*this.direction);

			//we've collided with a collision layer widget, reverse direction
			if (this.canCollideWithWidget && this.sprite.state == "flip_direction") {
				sprite.flipX = !sprite.flipX;
				this.direction *= -1;
				this.canCollideWithWidget = false;
				
				//wait 1500 seconds before allow widget collisions/direction reverseal again
	    		this.scene.time.delayedCall(1000, function() { 
					this.sprite.state = "normal";
					this.canCollideWithWidget = true; 
				}, null, this);
			}
			sprite.anims.play("croc-idle", true);
			
		} else {
			this.die();
		}
	}

	destroy() {
		this.sprite.destroy();
	}
}
