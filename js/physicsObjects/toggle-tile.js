/**
* User: werkn-development
* Date: Sat Aug 31 12:42:04 MST 2019
* 
* ToggleTile(s) are Game Objects that mimic tile behaviour but
* have the ability to be toggled on and off when the associated/owning switch
* is toggled.
*/

export default class ToggleTile {

	constructor(scene, x, y, name) {
		this.scene = scene;

		const anims = scene.anims;

		// Create the physics-based sprite that we will move around and animate
		this.sprite = scene.physics.add
			.sprite(x, y, "props_atlas", "block.png")
		this.sprite.setImmovable(true);	
		this.sprite.body.setAllowGravity(false); //sprite should be immobile

		this.sprite.name = name;
		//from Tiled our controlling switch has id Switch_0, and controlls
		//all ToggleTiles with ToggleTile_0 as their name.
		//get the id of 0 from the name 'ToggleTile_0'
		this.switchControlledById = (name+"").split("_")[1];
		this.sprite.state = "normal";
	}

	toggle() {
		if (this.sprite.body.enable) {
			this.disable();
		} else {
			this.enable();
		}
	}

	enable() {
		this.sprite.body.setEnable(true);
		this.sprite.setTint(0xffffff);
		this.sprite.setAlpha(1.0);
	}

	disable() {
		this.sprite.body.setEnable(false);
		this.sprite.setTint(0xefefef);
		this.sprite.setAlpha(0.5);
	}

	destroy() {
		this.sprite.destroy();
	}
}
