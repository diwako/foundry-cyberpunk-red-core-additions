import { Utils } from "./utils.js";
import { Constants } from "./constants.js";

const SHOWN_WEAPONS = [];

export class DvDisplay {
  static async show() {
    if (
      !game.settings.get(Constants.MODULE_NAME, "showDVDisplay") ||
      (game.settings.get(Constants.MODULE_NAME, "dvDisplayOnlyInCombat") &&
        !game.combat?.started)
    )
      return;

    if (!this.dvDisplay.parent) {
      this.addChild(this.dvDisplay);
    }
    const token = canvas.tokens.controlled[0];
    if (!token || token == this) return;
    const dist = Utils.getDistance(token, this);
    let displayText = "";
    let num = 0;
    const showWeaponNames = game.settings.get(
      Constants.MODULE_NAME,
      "showWeaponNamesInDvDisplay"
    );

    for (const obj of token.actor.items) {
      if (
        obj.system.isRanged &&
        (obj.system.equipped === "equipped" ||
          (obj.type === "cyberware" && obj.system.isInstalled)) &&
        obj.system.dvTable &&
        obj.system?.dvTable != ""
      ) {
        let dv = await Utils.getDV(obj.system.dvTable, dist);
        if (!dv || dv == -1) continue;

        const newText = generateDisplayText(obj, showWeaponNames, dv);
        if (newText === "") continue;
        num++;
        displayText += newText;

        // check upgrades/attachments
        if (obj.system?.upgrades?.length > 0) {
          for (const upgrade of obj.system.upgrades) {
            if (!upgrade.system.type === "weapon") continue;
            const upgradeDocument = token.actor.items.get(upgrade._id);
            if (
              upgradeDocument &&
              upgradeDocument.system.isRanged &&
              upgradeDocument.system.isInstalled &&
              upgradeDocument.system.dvTable &&
              upgradeDocument.system.dvTable != ""
            ) {
              let dv = await Utils.getDV(upgradeDocument.system.dvTable, dist);
              if (!dv || dv == -1) continue;
              const newText = generateDisplayText(
                upgradeDocument,
                showWeaponNames,
                dv
              );
              if (newText === "") continue;
              num++;
              displayText += newText;
            }
          }
        }

        // check if weapon is autofire capable
        if (obj.system.fireModes.suppressiveFire) {
          let dv = await Utils.getDV(obj.system.dvTable + " (Autofire)", dist);
          if (!dv || dv == -1) continue;

          const newText = generateDisplayText(obj, showWeaponNames, dv, true);
          if (newText === "") continue;
          num++;
          displayText += newText;
        }
      }
    }

    if (num === 0) return;
    let position = game.settings.get(
      Constants.MODULE_NAME,
      "dvDisplayPosition"
    );

    this.dvDisplay?.removeChildren()?.forEach((display) => display.destroy());
    const style = CONFIG.canvasTextStyle.clone();
    style.align = position === "right" ? "left" : "right";

    const text = new PreciseText(displayText, style);
    text.anchor.set(1, 0);

    this.dvDisplay.addChild(text);
    if (position === "right")
      this.dvDisplay.position.set(this.w + this.dvDisplay.width + 15, 0);
    else this.dvDisplay.position.set(-15, 0);

    // empty constant
    SHOWN_WEAPONS.splice(0, SHOWN_WEAPONS.length);
  }

  static clear() {
    this.dvDisplay?.removeChildren()?.forEach((display) => display.destroy());
  }

  static async registerWrapper(wrapped, ...args) {
    await wrapped(...args);
    this.dvDisplay = this.addChild(new PIXI.Container());
    return this;
  }
}

function generateDisplayText(item, showWeaponNames, dv, autofire = false) {
  let name = item.name;
  let duplicateCheckValue = item.name;
  if (showWeaponNames === false) {
    name = game.i18n.localize(
      Constants.WEAPON_TYPE_LIST[item.system.weaponType]
    );
    duplicateCheckValue = item.system.weaponType;
  }

  if (autofire) {
    name += " (Autofire)";
    duplicateCheckValue += " (Autofire)";
  }

  if (SHOWN_WEAPONS.includes(duplicateCheckValue)) {
    return "";
  }
  SHOWN_WEAPONS.push(duplicateCheckValue);

  return game.i18n.format("diwako-cpred-additions.dv-display.dv-text", {
    "weapon-name": name,
    "dv-value": dv,
  });
}
