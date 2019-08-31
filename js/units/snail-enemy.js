/**
* User: werkn-development
* Date: Sat Aug 31 12:46:12 MST 2019
* 
* SnailEnemy is an enemy that does not damage the player (unless they try to crouch near it).
* The purpose of SnailEnemy is to block entrances to areas.  The SnailEnemy can be killed by 
* dropping crates on them.
*/

export default class SnailEnemy {

	constructor(scene, x, y, name) {
		this.scene = scene;

		const anims = scene.anims;
		//IDLE ANIMATION
		anims.create({
			key: "snail-idle",
			frames: anims.generateFrameNames("additional_enemies_atlas", {
				prefix: "slug-",
				suffix: '.png',
				start: 1,
				end: 4
			}),
			frameRate: 1,
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
			.sprite(x, y, "additional_enemies_atlas", "slug-1.png")
			.setImmovable(true);

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

		this.sprite.name = name;
		this.sprite.state = "normal";
		this.dead = false;
		this.sprite.anims.play("snail-idle", true);
	}

	//plays enemy death animation
	die() {
		this.sprite.anims.play("enemy-die", true);
	}

	update() {
			if (this.sprite.state == "normal") {
				//manually check for crate and enemy collisions, as we check each crate against
				//each enemy we should keep the number of crates to 2 or 3
				for (var i = 0; i < this.scene.crates.length; i++) {
					this.scene.physics.world.overlap(this.scene.crates[i].sprite, this.sprite, function(crate, enemy) {
						if(enemy.body.touching.up && crate.body.touching.down) {	
							enemy.state = "dying"; 
							//disable enemy body so we don't hit it again
							enemy.body.setEnable(false);
							//make player jump off enemy 
						}
					}, null, this);
				}
			} else {
				this.die();
			}
	
	}

	destroy() {
		this.sprite.destroy();
	}
}
