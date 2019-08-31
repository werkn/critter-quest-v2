/**
 * User: werkn-development
 * Date: Fri Aug 23 12:59:13 MST 2019
 *
 * Simple scrolling Parallax background.  Scrolling occurs automatically.
 *
 * We make the following assumptions.
 * 1.  backgroundFarImageKey is associated with an image, previously loaded, that is meant
 *     to fill the entire background.
 * 2.  backgroundMiddleImageKey is associated with an image, previously loaded, that is meant
 *     to fill 50% of the screen, and be tiled, effectively twice.
 */
export default class ParallaxBackground {

	constructor(scene, backgroundFarImageKey, backgroundMiddleImageKey, farParallaxSpeed, middleParallaxSpeed) {
		this.scene = scene;

		//note, setTileScale must be set 2+ here due to the small image size
		//and the fact I don't quite understand how to set the image and scale in the
		//assignment
		this.scene.tileSpriteBackgroundFar = this.scene.add.tileSprite(this.scene.sys.canvas.width / 2, this.scene.sys.canvas.height / 2, 0, 0, backgroundFarImageKey);
		this.scene.tileSpriteBackgroundFar.setDisplaySize(this.scene.sys.canvas.width, this.scene.sys.canvas.height);

		this.scene.tileSpriteBackgroundMiddleLeft = this.scene.add.tileSprite(0, 0, 0, 0, backgroundMiddleImageKey);
		this.scene.tileSpriteBackgroundMiddleLeft.setDisplaySize(
			this.scene.sys.canvas.width / 2, this.scene.tileSpriteBackgroundMiddleLeft.height);
		this.scene.tileSpriteBackgroundMiddleLeft.setOrigin(0, 0);
		this.scene.tileSpriteBackgroundMiddleLeft.setPosition(
			0,
			this.scene.sys.canvas.height * 0.4
		);

		this.scene.tileSpriteBackgroundMiddleRight = this.scene.add.tileSprite(0, 0, 0, 0, backgroundMiddleImageKey);
		this.scene.tileSpriteBackgroundMiddleRight.setDisplaySize(
			this.scene.sys.canvas.width / 2, this.scene.tileSpriteBackgroundMiddleLeft.height);
		this.scene.tileSpriteBackgroundMiddleRight.setOrigin(0, 0);
		this.scene.tileSpriteBackgroundMiddleRight.setPosition(
			this.scene.sys.canvas.width / 2,
			this.scene.sys.canvas.height * 0.4
		);

		//set parallax speeds, use defaults if none specified
		this.farParallaxSpeed = (farParallaxSpeed) ? farParallaxSpeed : 0.6;
		this.middleParallaxSpeed = (middleParallaxSpeed) ? middleParallaxSpeed : 0.3;
	}

	update() {
		//update tileSprite positions and create parallax effect
		this.scene.tileSpriteBackgroundFar.tilePositionX += this.farParallaxSpeed;
		this.scene.tileSpriteBackgroundMiddleLeft.tilePositionX += this.middleParallaxSpeed;
		this.scene.tileSpriteBackgroundMiddleRight.tilePositionX += this.middleParallaxSpeed;
	}
}
