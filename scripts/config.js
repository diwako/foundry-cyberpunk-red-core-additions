import { SoundMenu } from "./soundMenu.js";
import { Constants } from "./constants.js";

export class Config {
  static registerSettings() {
    console.log("diwako-cpred-additions settings start");
    game.settings.register(Constants.MODULE_NAME, "hit-animations", {
      name: game.i18n.localize(
        "diwako-cpred-additions.settings.hit-animations.name"
      ),
      hint: game.i18n.localize(
        "diwako-cpred-additions.settings.hit-animations.hint"
      ),
      scope: "world",
      config: true,
      type: Boolean,
      default: window.Sequence != null,
    });

    game.settings.register(Constants.MODULE_NAME, "hit-sounds", {
      name: game.i18n.localize(
        "diwako-cpred-additions.settings.hit-sounds.name"
      ),
      hint: game.i18n.localize(
        "diwako-cpred-additions.settings.hit-sounds.hint"
      ),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    });

    game.settings.registerMenu(Constants.MODULE_NAME, "configure-sounds-menu", {
      name: "diwako-cpred-additions.settings.sound-select.name",
      label: "",
      hint: "diwako-cpred-additions.settings.sound-select.hint",
      icon: "fas fa-cog",
      type: SoundMenu,
      restricted: true,
    });

    game.settings.register(Constants.MODULE_NAME, "configured-sounds", {
      scope: "world",
      config: false,
      type: Array,
      default: [],
    });

    game.settings.register(Constants.MODULE_NAME, "showDVDisplay", {
      name: game.i18n.localize(
        "diwako-cpred-additions.settings.dv-display-show.name"
      ),
      hint: game.i18n.localize(
        "diwako-cpred-additions.settings.dv-display-show.hint"
      ),
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register(Constants.MODULE_NAME, "dvDisplayOnlyInCombat", {
      name: game.i18n.localize(
        "diwako-cpred-additions.settings.dv-display-combat-only.name"
      ),
      hint: game.i18n.localize(
        "diwako-cpred-additions.settings.dv-display-combat-only.hint"
      ),
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register(Constants.MODULE_NAME, "dvDisplayPosition", {
      name: game.i18n.localize(
        "diwako-cpred-additions.settings.dv-display-position.name"
      ),
      hint: game.i18n.localize(
        "diwako-cpred-additions.settings.dv-display-position.hint"
      ),
      scope: "client",
      config: true,
      type: String,
      choices: {
        right: game.i18n.localize(
          "diwako-cpred-additions.settings.dv-display-position.right"
        ),
        left: game.i18n.localize(
          "diwako-cpred-additions.settings.dv-display-position.left"
        ),
      },
      default: "right",
    });

    game.settings.register(
      Constants.MODULE_NAME,
      "showWeaponNamesInDvDisplay",
      {
        name: game.i18n.localize(
          "diwako-cpred-additions.settings.dv-display-show-weapon-name.name"
        ),
        hint: game.i18n.localize(
          "diwako-cpred-additions.settings.dv-display-show-weapon-name.hint"
        ),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
      }
    );

    console.log("diwako-cpred-additions settings end");
  }
}
