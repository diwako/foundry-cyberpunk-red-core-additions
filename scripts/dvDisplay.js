import { Utils } from "./utils.js";

const MODULE = "diwako-cpred-additions";

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
    for (const obj of token.actor.items) {
      if (
        obj.type == "weapon" &&
        obj.system.equipped == "equipped" &&
        obj.system.dvTable !== ""
      ) {
        let dv = await Utils.getDV(obj.system.dvTable, dist);
        if (dv) {
          num++;
          displayText += game.i18n.format(
            "diwako-cpred-additions.dv-display.dv-text",
            {
              "weapon-name": obj.name,
              "dv-value": dv,
            }
          );
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
