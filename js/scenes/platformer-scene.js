/**
 * User: werkn-development
 * Date: Fri Aug 23 14:41:24 MST 2019
 * 
 * PlatformerScene is where to core functionality of Critter Quest is
 * setup.
 *
 * PlatformerScene does the following:
 *  - Loads all texture
 *  - Sets up player
 *  - Loads/renders tilemaps
 *  - From tilemaps gets enemy and object spawn locations
 *  - Spawns said enemy and objects at these locations
 *  - Sets up collision between all game objects
 *  - Show/hide in-game menu
 */

import Player from "../units/player.js";

//enemies
import FrogEnemy from "../units/frog-enemy.js";
import EagleEnemy from "../units/eagle-enemy.js";
import SnailEnemy from "../units/snail-enemy.js";
import OpossumEnemy from "../units/opossum-enemy.js";
import BeeEnemy from "../units/bee-enemy.js";
import CrocEnemy from "../units/croc-enemy.js";

//powerups
import SpeedBootsPowerup from "../powerups/speed-boots.js";
import DoubleJumpPowerup from "../powerups/double-jump.js";

//bosses
import FrogBossEnemy from "../units/bosses/frog-boss-enemy.js";
import CrocBossEnemy from "../units/bosses/croc-boss-enemy.js";
import OpossumBossEnemy from "../units/bosses/opossum-boss-enemy.js";

//objects
import Exit from "../objects/exit.js";
import Switch from "../objects/switch.js";

//physics objects
import FrogSpringboard from "../physicsObjects/frog-springboard.js";
import Crate from "../physicsObjects/crate.js";
import MovingPlatform from "../physicsObjects/moving-platform.js";
import ToggleTile from "../physicsObjects/toggle-tile.js";

//collectables
import Gem from "../collectables/gem.js";
import ExtraLife from "../collectables/extra-life.js";

//managers
import EnemyManager from "../managers/enemy-manager.js";
import SaveManager from "../managers/save-manager.js";

/**
 * A class that extends Phaser.Scene and wraps up the core logic for the platformer level.
 */
export default class PlatformerScene extends Phaser.Scene {

	constructor(level) {
		if (level) {
			super({ key: level.key });
			this.currentLevel = level.key;
		} else {
			//always load level 1 by default
			super({ key: 'level1' });
			this.currentLevel = 1;
		}
	}

	preload() {
		//"this" === Phaser.Scene
		//get game width and height	
		const { width, height } = this.sys.game.config;

		//loading resources tutorial
		//src: https://gamedevacademy.org/creating-a-preloading-screen-in-phaser-3/
		//create loading text
		this.loadingText = this.make.text({
			x: width / 2,
			y: height / 2 - 50,
			text: 'Loading...',
			fontFamily: '"Press Start 2P", Courier',
			fontSize: 18, 
			strokeThickness: 4,
			stroke: '#000000',
			fill: "white"
		});
		this.loadingText.setOrigin(0.5, 0.5);

		this.load.on('complete', function (context) {
			//remove loading text
			this.scene.loadingText.destroy();
		});

		this.load.on('progress', function (value) {
			this.scene.loadingText.setText("Loading: " + parseInt(value * 100) + "%" + "...");
		});

		//load repeating background image
		this.load.image("background-repeat", "./assets/tilesets/environment/back.png");
		this.load.image("middleground-repeat", "./assets/tilesets/environment/middle.png");
		//
		//load tileset image
		this.load.image("tiles", "./assets/tilesets/environment/tileset-extruded.png");
		this.load.image("props", "./assets/tilesets/environment/props.png");
		this.load.image("widgets", "./assets/tilesets/widgets/widgets.png");

		//load tilemap
		this.load.tilemapTiledJSON("map"+this.currentLevel, "./assets/tilemaps/level"+ this.currentLevel + ".json");

		//note if using a Multi-packed atlas we need to modify our load method to use Multipack
		this.load.atlas("atlas", "./assets/atlas/items_and_characters_atlas.png", "./assets/atlas/items_and_characters_atlas.json");
		this.load.atlas("props_atlas", "./assets/atlas/props.png", "./assets/atlas/props.json");
		this.load.atlas("additional_enemies_atlas", "./assets/atlas/additional_enemies.png", "./assets/atlas/additional_enemies.json");
	}

	//player has hit a collectable object
	hitCollectable(sprite) {
		this.sound.play("coinCollected", 
			{
				volume: this.sys.game.soundManager.sfx.coinCollected.volume
			}
		);

		if (sprite.name == "gem") {
			
			//update player gem count and add a new life every 100 gems
			if (++this.sys.game.gems == 100) {
				this.sys.game.lives += 1;
				this.sys.game.gems = 0;
			}

		} else if (sprite.name == "double-jump-powerup") {

			this.game.hasJumpPowerup =  true;

		} else if (sprite.name == "speed-boots-powerup") {

			this.game.hasSpeedPowerup =  true;

		} else if (sprite.name == "extra-life") {

			this.game.lives += 1;

		}

		//change the sprite name to collected, this flag allows us to
		//delete collected gems on the next pass through of scene.update()
		sprite.name = "collected";

		// Return true to exit processing collision of this tile vs the sprite - in this case, it
		// doesn't matter since the coin tiles are not set to collide.
		return false;
	}

	create() {
		//get game display width and height 
		const { width, height } = this.sys.game.config;

		//set background color to match our scrolling background 
		//color (so when texture ends we can't tell in game
		this.cameras.main.setBackgroundColor("#325762");

		//max time before player is killed (in seconds)
		this.sys.game.maxLevelTime = 180;

		//setup tilemap
		const map = this.make.tilemap({ key: "map"+this.currentLevel });

		//create a repeating background sprite
		const bg = this.add.tileSprite(0, 0, map.widthInPixels, height/2, "background-repeat");
		bg.setOrigin(0, 0);
		const mg = this.add.tileSprite(0, height/4, map.widthInPixels, height/2, "middleground-repeat");
		mg.setOrigin(0, 0);

		// Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
		// Phaser's cache (i.e. the name you used in preload)
		var tileset = [];
		tileset.push(map.addTilesetImage("tileset", "tiles"));
		tileset.push(map.addTilesetImage("props", "props"));
		tileset.push(map.addTilesetImage("widgets", "widgets"));

		// Parameters: layer name (or index) from Tiled, tileset, x, y
		this.belowLayer = map.createStaticLayer("BackgroundDecorator", tileset, 0, 0);
		this.worldLayer = map.createStaticLayer("Collision", tileset, 0, 0);
		this.hiddenWorldLayer = map.createStaticLayer("HiddenCollision", tileset, 0, 0);
		this.aboveLayer = map.createStaticLayer("ForegroundDecorator", tileset, 0, 0);

		//property is set internal to the Tiled tilemap (In Tiled, Edit Tileset, Set Custom Properties).
		this.worldLayer.setCollisionByProperty({ collides: true });

		//used for non-visible collision,
		//ie: things like hidden walls
		this.hiddenWorldLayer.setCollisionByProperty({ collides: true }); 

		// By default, everything gets depth sorted on the screen in the order we created things. Here, we
		// want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
		// Higher depths will sit on top of lower depth objects.
		this.belowLayer.setDepth(0);
		this.worldLayer.setDepth(2);
		this.hiddenWorldLayer.setDepth(2);
		this.aboveLayer.setDepth(3);

		// Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map.
		// Note: instead of storing the player in a global variable, it's stored as a property of the
		// scene
		const spawnPoint = map.findObject(
			"Objects",
			obj => obj.name === "Spawn Point"
		);

		//create our player instance
		this.player = new Player(this, spawnPoint.x, spawnPoint.y);
		//we adjust depth to 1 so the player is rendered on top of the text instances, 
		//this is a quickfix until I figure out how to change the text instances depth
		this.player.sprite.setDepth(1); 

		//get a list of all Objects from the Objects Layer of our Tiled map(s) 
		var tileMapObjects = map.objects[0].objects;
		this.gems = [];
		this.extraLives = [];
		this.physicsObjects = [];
		this.exitCoords = {};
		this.toggleTiles = [];
		this.switches = [];
		this.crates = [];
		this.powerups = [];
		this.platforms = [];
		this.enemyManager = new EnemyManager(this);

		// Setup all objects from our tilemap for the current level
		var tempEnemy;
		for (var i = 0; i < tileMapObjects.length; i++) {

			if (tileMapObjects[i].name == "ExtraLife") {
				this.extraLives.push(new ExtraLife(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2));
				this.physics.world.addOverlap(this.extraLives[this.extraLives.length-1].sprite,
					this.player.sprite, this.hitCollectable, null, this);

				//pull text objects from tiled map
			} else if (tileMapObjects[i].name == "TutorialText") {

				this.tipText = this.add.text(
					tileMapObjects[i].x, 
					tileMapObjects[i].y,
					tileMapObjects[i].text.text, 
					{ //style config for our Tiled text objects
						align: tileMapObjects[i].text.halign,
						fixedWidth: tileMapObjects[i].width,
						fixedHeight: tileMapObjects[i].height,
						font: "18px monospace",
						fill: tileMapObjects[i].text.color,
						padding: { x: 20, y: 20 },
						wordWrap: { width: tileMapObjects[i].width },
						backgroundColor: "#000"
					})
					.setOrigin(0.5)
					.setScrollFactor(1) //don't move text with player
					.setDepth(0);

			} else if (tileMapObjects[i].name == ("Crate")) {

				this.crates.push(new Crate(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					tileMapObjects[i].name));

				//make this crate collide with the player
				this.physics.world.addCollider(this.crates[this.crates.length-1].sprite,
					this.player.sprite, function(crate, player) {
						//only allow jumping when on the top of a ToggleTile
						if (crate.body.touching.up) {
							player.owner.onStandableObject = true;
						} else {
							crate.owner.move();
						}
					}, null, this);

				//make this crate collide with the world layer
				this.physics.world.addCollider(this.crates[this.crates.length-1].sprite, this.worldLayer);

			} else if (tileMapObjects[i].name == "MovingPlatform") {

				this.platforms.push(new MovingPlatform(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					tileMapObjects[i].name));
				this.physics.world.addCollider(this.platforms[this.platforms.length-1].sprite,
					this.player.sprite, function(platform, player) {
						//only allow jumping when on the top of a ToggleTile
						if (platform.body.touching.up && player.body.touching.down) {
							player.owner.onStandableObject = true;

							//lock player motion to platform motion (we no longer using
							//the built in physics to move the player/platform)
							//src:  https://phaser.io/tutorials/coding-tips-004
							player.owner.sprite.x += (1*platform.direction);
						}
					}, null, this);

				//add a widget collider
				this.physics.world.addCollider(this.platforms[this.platforms.length-1].sprite,
					this.worldLayer);

			} else if (tileMapObjects[i].name.includes("Switch")) {

				this.switches.push(new Switch(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					tileMapObjects[i].name));
				this.physics.world.addOverlap(this.switches[this.switches.length-1].sprite,
					this.player.sprite, function(activeSwitch, player) {
						if (activeSwitch.owner.switchToggleKey.isDown) {
							activeSwitch.owner.toggleAllTiles();
						}
					}, null, this);

			} else if (tileMapObjects[i].name.includes("ToggleTile")) {

				this.toggleTiles.push(new ToggleTile(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					tileMapObjects[i].name));
				this.physics.world.addCollider(this.toggleTiles[this.toggleTiles.length-1].sprite,
					this.player.sprite, function(toggleTile, player) { 
						//only allow jumping when on the top of a ToggleTile
						if (toggleTile.body.touching.up) {
							player.owner.onStandableObject = true;
						}
					}, null, this);

			} else if (tileMapObjects[i].name == "DoubleJumpPowerup") {

				this.powerups.push(new DoubleJumpPowerup(this,
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2));
				this.physics.world.addOverlap(this.powerups[this.powerups.length-1].sprite,
					this.player.sprite, this.hitCollectable, null, this);

			} else if (tileMapObjects[i].name == "SpeedBootsPowerup") {

				this.powerups.push(new SpeedBootsPowerup(this,
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2));
				this.physics.world.addOverlap(this.powerups[this.powerups.length-1].sprite,
					this.player.sprite, this.hitCollectable, null, this);

			} else if (tileMapObjects[i].name == "Gem") {

				this.gems.push(new Gem(this,
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2));
				this.physics.world.addOverlap(this.gems[this.gems.length-1].sprite,
					this.player.sprite, this.hitCollectable, null, this);

			} else if (tileMapObjects[i].name == "FrogSpringboard") {

				this.physicsObjects.push(new FrogSpringboard(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"frog_springboard_"+i));
				this.physics.world.addCollider(this.physicsObjects[this.physicsObjects.length-1].sprite, 
					this.worldLayer);

			} else if (tileMapObjects[i].name == "OpossumBossEnemy") {

				tempEnemy = new OpossumBossEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"opossum_boss"+i,
					2, 
					2);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "CrocBossEnemy") {

				tempEnemy = new CrocBossEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"croc_boss"+i,
					2, 
					1); //TODO: change this back to 3 before release
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "FrogBossEnemy") {

				tempEnemy = new FrogBossEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"frog_boss_"+i,
					2, 
					3);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "CrocEnemy") {

				tempEnemy = new CrocEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"croc_"+i);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "BeeEnemy") {

				tempEnemy = new BeeEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"bee_"+i);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "OpossumEnemy") {

				tempEnemy = new OpossumEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"opossum_"+i);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);
			} else if (tileMapObjects[i].name == "EagleEnemy") {

				tempEnemy = new EagleEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"eagle_"+i);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "SnailEnemy") {

				tempEnemy = new SnailEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"snail_"+i);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.physics.world.addCollider(tempEnemy.sprite,
					this.player.sprite, function(snailBody, player) { 
						if (snailBody.body.touching.up) {
							player.owner.onStandableObject = true;
						}
					}, null, this);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "FrogEnemy") {

				tempEnemy = new FrogEnemy(this, 
					tileMapObjects[i].x + tileMapObjects[i].width/2, 
					tileMapObjects[i].y + tileMapObjects[i].height/2,
					"frog_"+i);
				this.physics.world.addCollider(tempEnemy.sprite, this.worldLayer);
				this.enemyManager.add(tempEnemy);

			} else if (tileMapObjects[i].name == "Exit") {

				if (!this.sys.game.levelState[this.currentLevel+""].hasEndBoss) {
					this.levelExit = new Exit(this,
						tileMapObjects[i].x + tileMapObjects[i].width/2, 
						tileMapObjects[i].y + tileMapObjects[i].height/2,
						"exit"+i);
					this.physics.world.addCollider(this.levelExit.sprite, this.worldLayer);
				} else {
					this.exitCoords.x = tileMapObjects[i].x;
					this.exitCoords.y = tileMapObjects[i].y;
				}
			}
		}

		//assign toggleTiles to associated switch
		for (var i = 0; i < this.switches.length; i++) {
			for (var j = 0; j < this.toggleTiles.length; j++) {
				if (this.switches[i].switchId == 
					this.toggleTiles[j].switchControlledById) {
					this.switches[i].toggleTiles.push(this.toggleTiles[j]);
				}
			}
		}

		//iterate over every tile in the tilemap and find tiles with
		//custom properties
		this.tileIdsWithCollideDmg = [];
		this.worldLayer.layer.data.forEach((row) => {
			row.forEach((Tile) => {

				//turn all tiles with custom property collide_top_only 
				//(Set in Tiled editor for Tileset) into collision top only
				//allowing the player to jump through these tiles 
				if (Tile.properties.collide_top_only) { 
					Tile.collideDown = false;
					Tile.collideLeft = false;
					Tile.collideRight = false;
				} 

				//get all tiles with collide_dmg (ie: spikes)
				if (Tile.properties.collide_dmg) {
					// This will add Tile ID XX to list tileIdsWithCollideDmg
					// where we will then call:
					//     this.collectableLayer.setTileIndexCallback(tileIdsWithCollideDmg[i], 
					//         this.methodToCall(), this);
					if (this.tileIdsWithCollideDmg.indexOf(Tile.index) == -1) {
						this.tileIdsWithCollideDmg.push(Tile.index);
					}
				} 

				//get all widget tiles used for scene control of enemy movement
				if (Tile.properties.widget) {

					//hide the tile from the scene, as it should be invisible to player
					Tile.setVisible(false);

					//make a callback to detect when enemy hit the widget tile
					Tile.setCollisionCallback(function(collidingSprite, tile) { 
						if (collidingSprite.name != "player" &&
							collidingSprite.state == "normal") {
							collidingSprite.state = "flip_direction";
						}
					}, this);
				}
			})
		});

		//add callbacks for each tile.id in tileIdsWithCollideDmg
		this.worldLayer.setTileIndexCallback(this.tileIdsWithCollideDmg, function(collidingSprite, tile) { 
			//for now try to kill whatever touches a tile with 'collide_dmg'
			//this is hacky, but should only kill enemies and the player,
			//ie: GameObjects that watch for state 'dying'
			collidingSprite.state = "dying";
		}, this); 

		//setup game and level stats
		//check that we haven't already set these stats
		this.sys.game.hasSpeedPowerup = (this.sys.game.hasSpeedPowerup == undefined) ? false : this.sys.game.hasSpeedPowerup;
		this.sys.game.hasJumpPowerup = (this.sys.game.hasJumpPowerup == undefined) ? false : this.sys.game.hasJumpPowerup;
		this.sys.game.hp = (this.sys.game.hp == undefined) ? 1 : this.sys.game.hp;
		this.sys.game.gems = (this.sys.game.gems == undefined) ? 0 : this.sys.game.gems;
		this.sys.game.lives = (this.sys.game.lives == undefined) ? 5 : this.sys.game.lives;

		// Watch the player and worldLayer for collisions, for the duration of the scene:
		this.physics.world.addCollider(this.player.sprite, this.worldLayer);
		// Watch the player and hiddenWorldLayer for collisions, for the duration of the scene:
		this.physics.world.addCollider(this.player.sprite, this.hiddenWorldLayer);

		//get the default camera
		this.cameras.main.startFollow(this.player.sprite);

		//constrain the camera so that it isn't allowed to move outside the width/height of tilemap
		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

		//show in-game menu when ESC is pressed
		this.input.keyboard.on("keydown_ESC", event => {
			this.scene.launch("in_game_menu", { sceneName: "level"+this.currentLevel});
		});

		//enable debug graphics when the player hits 'p'
		this.input.keyboard.once("keydown_P", event => {

			//turn on physics debugging to show player's hitbox
			this.physics.world.createDebugGraphic();

			const graphics = this.add
				.graphics()
				.setAlpha(0.75)
				.setDepth(20);
			this.worldLayer.renderDebug(graphics, {
				tileColor: null, // Color of non-colliding tiles
				collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
				faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
			});
		});

		//start the level timer
		this.sys.game.gameTimer = this.time.addEvent({
			delay: this.sys.game.maxLevelTime * 1000,                // 3 min 
			callback: function() { this.player.sprite.state = "dying"; },
			callbackScope: this,
			loop: false,
			repeat: 0,
			startAt: 0,
			timeScale: 1,
			paused: false
		});

		this.inGame = true;

		//start hud-overlay
		//we control our hud as a standalone scene and simply draw it overtop of the platformer scene,
		//this seems to be the easiest way to abstract out the hud and not clutter up
		//the platformer scene	  
		this.scene.launch("hud_overlay", { sceneName: "level"+this.currentLevel});
	}

	update(time, delta) {
		//allow the player to respond to key presses and move itself
		if (this.inGame === true) {

			this.player.update();
			this.enemyManager.update();

			//check if the level has an exit...
			//for instance levels with end bosses don't have exits spawned until
			//the boss has been defeated
			if (this.levelExit != undefined) {
				this.levelExit.update();

				//check if player has made it to the exit yet
				if (this.levelExit.sprite.state == "exit_touched") {
					const timeTaken = Math.floor(this.sys.game.gameTimer.getElapsedSeconds()); 
					this.scene.stop("hud_overlay");

					//check if there is another level after this one and unlock it
					if (this.sys.game.levelState[this.currentLevel+1+""] != undefined) {

						this.sys.game.levelState[this.currentLevel+1+""].unlocked = true;

						//record the time taken for this level
						this.sys.game.levelState[this.currentLevel+""].time = timeTaken; 

						//save progress
						SaveManager.saveGame(this.sys.game.levelState)

						this.scene.start("level" + (this.currentLevel + 1))

					} else { //there is no next level, show credits
						//remove hud overlay
						this.scene.stop('hud_overlay');

						//record the time taken for this level
						this.sys.game.levelState[this.currentLevel+""].time = timeTaken; 

						//save progress
						SaveManager.saveGame(this.sys.game.levelState)

						//show credits
						this.scene.start('credits');
					}
				}

				//level doesn't have an exit which means its a boss level, check if boss is dead and then spawn exit
			} else if (this.levelExit == undefined && this.sys.game.bossEnemy.enemiesRemaining == 0) {

				this.levelExit = new Exit(this,
					this.exitCoords.x, 
					this.exitCoords.y, 
					"exit"+i);
				this.physics.world.addCollider(this.levelExit.sprite, this.worldLayer);

			}
		}

		//update all physicsObjects in scene
		for (var i = this.physicsObjects.length-1; i >= 0; i--) {
			this.physicsObjects[i].update();
		}

		//update all platforms in scene
		for (var i = this.platforms.length-1; i >= 0; i--) {
			this.platforms[i].update();
		}

		//update all switches in scene
		for (var i = this.switches.length-1; i >= 0; i--) {
			this.switches[i].update();
		}


		//update all powerups in scene, we iterate backwards so we can do
		//live removal from array (this.gems)
		for (var i = this.powerups.length-1; i >= 0; i--) {
			if (this.powerups[i].sprite.name === "collected") {
				this.powerups[i].destroy();

				//remove the gem from the array, its been collected/destroyed
				this.powerups.splice(i,1);
			}
		}

		//update all gems in scene, we iterate backwards so we can do
		//live removal from array (this.gems)
		for (var i = this.gems.length-1; i >= 0; i--) {
			if (this.gems[i].sprite.name === "collected") {
				this.gems[i].destroy();

				//remove the gem from the array, its been collected/destroyed
				this.gems.splice(i,1);
			}
		}

		//update all extra lives in scene, we iterate backwards so we can do
		//live removal from array (this.gems)
		for (var i = this.extraLives.length-1; i >= 0; i--) {
			if (this.extraLives[i].sprite.name === "collected") {
				this.extraLives[i].destroy();
				this.extraLives.splice(i,1);
			}
		}

		//check if the player has left the game bounds or is dead 
		if (this.player.sprite.y > this.worldLayer.height || this.player.sprite.state == "dead") {

			//remove hud overlay
			this.scene.stop('hud_overlay');

			if (--this.sys.game.lives > 0) {
				this.scene.start("level"+this.currentLevel);
			} else {
				this.scene.start('game_over');
			}
		}
	}
}
