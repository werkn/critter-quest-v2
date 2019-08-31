/**
 * User: werkn-development
 * Date: Sat Aug 10 10:38:15 MST 2019
 *
 * EnemyManager is used to store and manage instances of Enemy(s) within our game. 
 */

export default class EnemyManager {

	constructor(scene) {
		this.scene = scene;

		//create our enemies collection
		this.enemies = [];

		//some enemies need to have their static count reset between scenes
		//do that here
		this.scene.sys.game.bossEnemy = undefined;
	}

	update() {

		//iterate backwards over our collection so we can do
		//removals during loop
		for (var i = this.enemies.length-1; i >= 0; i--) {

			this.enemies[i].update();

			if (this.enemies[i].dead) {

				this.enemies[i].destroy();

				//remove the enemy from the array, its been collected/destroyed
				this.enemies.splice(i,1);
			} else {
				//manually check for player and enemy collisions
				this.scene.physics.world.overlap(this.scene.player.sprite, this.enemies[i].sprite, function(player, enemy) {
					if (player.state == "normal") {
						if(enemy.body.touching.up && player.body.touching.down) {	
							enemy.state = "dying"; 
							//disable enemy body so we don't hit it again
							enemy.body.setEnable(false);
							//make player jump off enemy 
							player.setVelocityY(-350);
							player.owner.usedDoubleJump = false; //reset double jump
						} else  {
							player.state = "dying";
						}
					}
				}, null, this);

			}
		}
	}

	destroy() {
		//delete reference to enemies 
		this.enemies = null;
	}

	add(enemy) {
		this.enemies.push(enemy);
	}

}
