/**
 * User: werkn-development
 * Date: Fri Aug 23 13:01:33 MST 2019
 * 
 * SaveManager uses localStorage to save level progress.
 *
 * Currently it does not save any settings from the in-game menu such
 * as audio enabled/disabled.
 */

export default class SaveManager {

	static supportsLocalStorage() {
			try {
				localStorage.setItem('test', 'test');
				localStorage.removeItem('test');
				return true;
			} catch(e) {
				return false;
			}
	}

	static saveGame(levelState) {
		if (SaveManager.supportsLocalStorage()) {
			localStorage.setItem('save', JSON.stringify(levelState));
		} else {
			console.log("No localStorage support.");
		}
	}

	static loadGame(scene) {
		if (SaveManager.supportsLocalStorage()) {
			const levelState = JSON.parse(localStorage.getItem('save'));
			scene.sys.game.levelState = levelState;
		} else {
			console.log("No localStorage support.");
		}
	}

	static hasSavedGame(scene) {
		if (SaveManager.supportsLocalStorage()) {
			const levelState = JSON.parse(localStorage.getItem('save'));
			if (levelState != undefined) {
				return true;
			}
		} else {
			console.log("No localStorage support.");
		}

		return false;
	}

	static eraseSaveGame() {
		if (SaveManager.supportsLocalStorage()) {
			localStorage.removeItem("save");
		} else {
			console.log("No localStorage support.");
		}
	}

}

