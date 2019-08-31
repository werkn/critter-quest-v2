/**
 * User: werkn-development
 * Date: Fri Aug 23 12:23:41 MST 2019
 * 
 * CrocBossEnemy is a base CrocEnemy adapted to spawn multiple other CrocEnemy
 * until it's health reaches zero.  
 *
 * Initiallly CrocBossEnemy will start as a largely upscaled CrocEnemy.  After it
 * has been initially jumped on and killed it will spawn 2 more enemies, reducing 
 * their scale, and health.
 *
 * The effect created is that 2^health instances of the initial CrocBossEnemy are created.
 */

export default class CrocBossEnemy {

	//health here refers to the amount of cycles to create scaled down clones,
	//and should be though of as 2^health = number of enemies to kill
	constructor(scene, x, y, name, scale=3, health=3, direction=1) {
		this.scene = scene;

		//add a field to track the number of CrocBossEnemy remaining
		//so we can spawn the exit once they are all killed (This happens in PlatformerScene).
		if (this.scene.sys.game.bossEnemy == undefined) {
			this.scene.sys.game.bossEnemy = {};
			this.scene.sys.game.bossEnemy.enemiesRemaining = 0;
		} 
		this.scene.sys.game.bossEnemy.enemiesRemaining++;

		//IDLE ANIMATION
		this.scene.anims.create({
			key: "croc-idle",
			frames: this.scene.anims.generateFrameNames("additional_enemies_atlas", {
				prefix: "gator-",
				suffix: '.png',
				start: 1,
				end: 4
			}),
			frameRate: 10,
			repeat: -1
		});

		//DEATH ANIMATION
		this.scene.anims.create({
			key: "enemy-die",
			frames: this.scene.anims.generateFrameNames("atlas", {
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
			.setDrag(0, 0)
			.setMaxVelocity(1000, 1000);  //max horiz. speed as well as max jump height!

		//listen for animation complete callback on enemy death animation,
		//as soon as the animation completes kill the enemy and allow it to be 
		//removed from EnemyManager
		this.sprite.on('animationcomplete', function (animation, frame) {
		    if (animation.key == "enemy-die") {
				this.dead = true;
			}
		}, this);

		this.health = health; //think of as 2^health = num enemies to kill 
		this.enemySpawned = false;
		this.sprite.name = name;
		this.sprite.state = "normal";
		this.sprite.setScale(scale);
		this.canCollideWithWidget = true; //enemy is bound by tilemap widgets

		this.direction = direction;
		if (direction == 1) {
			this.sprite.flipX = !this.sprite.flipX;
		}

		this.dead = false;
	}

	//enemy has been hit by the player or an environmental object likes spikes
	hit() {
		this.sprite.anims.play("enemy-die", true);

		//if the CrocBossEnemy is not dead, spawn 2x additional clones at
		//center screen
		if (this.health != 0) {
			if (!this.enemySpawned) {
				for (var i = 0; i < 2; i++) {
					var { width, height } = this.scene.sys.game.config;
					var xSpawn = width / 2;

					//spawn clones facing different directions
					var tempDirection = 1;
					if (i % 2 == 0) {
						tempDirection = 1; 
					} else {
						tempDirection = -1; 
					}

					var tempEnemy = new CrocBossEnemy(
						this.scene,
						xSpawn,
						height*0.1, 
						"clone",
						this.sprite.scaleX-0.5,
						this.health-1,
						tempDirection);

					this.scene.enemyManager.add(tempEnemy);
					this.scene.physics.world.addCollider(tempEnemy.sprite, this.scene.worldLayer);
				}
				this.enemySpawned = true;
			}
		}

	}

	update() {

		if (this.sprite.state == "normal") {

			this.sprite.body.setVelocityX((250*this.direction));
			this.sprite.anims.play("croc-idle", true);
		} else if (this.sprite.state == "dying") {
			this.hit();
		} else if (this.sprite.state == "flip_direction") {


			if (this.canCollideWithWidget) {
				this.sprite.flipX = !this.sprite.flipX;
				this.direction *= -1;
				this.canCollideWithWidget = false; //disable widget collision until no longer colliding
				this.scene.time.delayedCall(1500, function() { 
					this.sprite.state = "normal";
					this.canCollideWithWidget = true; 
				}, null, this);
			} else {
				this.sprite.body.setVelocityX((250*this.direction));
			}

		}
	}

	destroy() {
		this.scene.sys.game.bossEnemy.enemiesRemaining--;
		this.sprite.destroy();
	}
}

