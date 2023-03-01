import { Utils } from "./utils.js";

const MODULE = "diwako-cpred-additions";

const weaponTypeList = {
  assaultRifle: "CPR.global.weaponType.assaultRifle",
  bow: "CPR.global.weaponType.bowsAndCrossbows",
  grenadeLauncher: "CPR.global.weaponType.grenadeLauncher",
  heavyMelee: "CPR.global.weaponType.heavyMeleeWeapon",
  heavyPistol: "CPR.global.weaponType.heavyPistol",
  heavySmg: "CPR.global.weaponType.heavySmg",
  lightMelee: "CPR.global.weaponType.lightMeleeWeapon",
  martialArts: "CPR.global.weaponType.martialArts",
  medMelee: "CPR.global.weaponType.mediumMeleeWeapon",
  medPistol: "CPR.global.weaponType.mediumPistol",
  rocketLauncher: "CPR.global.weaponType.rocketLauncher",
  shotgun: "CPR.global.weaponType.shotgun",
  smg: "CPR.global.weaponType.smg",
  sniperRifle: "CPR.global.weaponType.sniperRifle",
  thrownWeapon: "CPR.global.weaponType.thrownWeapon",
  unarmed: "CPR.global.weaponType.unarmed",
  vHeavyMelee: "CPR.global.weaponType.veryHeavyMeleeWeapon",
  vHeavyPistol: "CPR.global.weaponType.veryHeavyPistol",
};

const shownWeaponTypes = [];

export class DvDisplay {
  static async show() {
    if (
      !game.settings.get(MODULE, "showDVDisplay") ||
      (game.settings.get(MODULE, "dvDisplayOnlyInCombat") &&
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
      MODULE,
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
      }
    }

    if (num === 0) return;
    let position = game.settings.get(MODULE, "dvDisplayPosition");

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
    shownWeaponTypes.splice(0, shownWeaponTypes.length);
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

function generateDisplayText(item, showWeaponNames, dv) {
  let name = item.name;

  if (showWeaponNames === false) {
    if (shownWeaponTypes.includes(item.system.weaponType)) {
      return "";
    }
    shownWeaponTypes.push(item.system.weaponType);
    name = game.i18n.localize(weaponTypeList[item.system.weaponType]);
  } else {
    if (shownWeaponTypes.includes(item.name)) {
      return "";
    }
    shownWeaponTypes.push(item.name);
  }
  return game.i18n.format("diwako-cpred-additions.dv-display.dv-text", {
    "weapon-name": name,
    "dv-value": dv,
  });
}
