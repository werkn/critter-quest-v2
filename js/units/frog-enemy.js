/**
 * User: werkn-development
 * Date: Fri Aug 23 12:44:30 MST 2019
 * 
 * FrogEnemy does nothing more then periodically jump within the scene.  If the player
 * collides with them (other then jumping on their head) they will be killed.
 */

export default class FrogEnemy {

	constructor(scene, x, y, name) {
		this.scene = scene;

		// Create the enemy's idle animations from the texture atlas. These are stored in the global
		// animation manager so any sprite can access them.
		const anims = scene.anims;
		//FROG IDLE ANIMATION
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
			.sprite(x, y, "atlas", "idle/frog-idle-1.png")
			.setDrag(1000, 0)
			.setMaxVelocity(300, 1000);  //this controls our maximum horizontal speed as well as maximum jump height!

		//listen for animation complete callback on enemy death animation,
		//as soon as the animation completes kill the enemy and allow it to be 
		//removed from EnemyManager
		this.sprite.on('animationcomplete', function (animation, frame) {
			if (animation.key == "enemy-die") {
				//kill enemy after animation has played
				//this.dead state is checked in EnemyManager
				this.dead = true;
			}
		}, this);

		//frog jump timer
		this.jumpTimer = scene.time.addEvent({
			delay:2750,                // ms
			callback: this.jump,
			//args: [],
			callbackScope: this,
			loop: true
		});

		//NOTE:
		//we use this.sprite.name to check if the class FrogEnemy has been killed
		//when it changes to 'dead' we know the enemy has been killed
		//and can be removed from the scene
		//
		//~~~Why not just set a field on the FrogEnemy class? ~~~ 
		//Phaser3 as far as I can tell attaches our physics collider to the 
		//sprite object and offers no nice built-in way to go from
		//the sprite collider (provided in collision callbacks) to the
		//class it is associated with... this essentially means when we use ANY
		//of the physics callbacks that we cannot get a reference to the class of the
		//sprite involved in the collision and subsequently have no nice way to call methods
		//in response.  By change this.sprite.name we can loop through a collection of FrogEnemy
		//class instances, and check this.sprite.name to call methods.  This is how we handle 
		//it in PlatformerScene.  Hacky, less then ideal technique but Phaser3 documentation and
		//examples don't really show a nicer way to do this.
		this.sprite.name = name;
		this.sprite.state = "normal";
		this.dead = false;
	}

	//plays enemy death animation
	die() {
		this.sprite.anims.play("enemy-die", true);
	}

	//jump callback is used in this.jumpTimer to 
	//periodicaly make the sprite body jump up and in
	//the current direction it is moving
	jump() {
		const onGround = this.sprite.body.blocked.down;
		if (onGround) {
			this.sprite.setVelocityY(-500);
		}
	}

	update() {
		if (this.sprite.state != "dying") {
			const sprite = this.sprite;
			const onGround = sprite.body.blocked.down;
			const acceleration = onGround ? 600 : 300;

			if (onGround) {
				sprite.anims.play("frog-idle", true);
			} else {
				//start of jump is one sprite, once @ apex of jump switch to falling sprite.
				if (sprite.body.velocity.y < 0) {
					sprite.setTexture("atlas", "jump/frog-jump-1.png");
				} else {
					sprite.setTexture("atlas", "jump/frog-jump-2.png");
				}
			}
		} else {
			this.die();
		}
	}

	destroy() {
		this.sprite.destroy();
		this.jumpTimer.remove();
	}
}
