import { SoundMenu } from "./soundMenu.js";

export class Config {
  static registerSettings() {
    console.log("diwako-cpred-additions settings start");
    game.settings.register("diwako-cpred-additions", "hit-animations", {
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

    game.settings.register("diwako-cpred-additions", "hit-sounds", {
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

    game.settings.registerMenu(
      "diwako-cpred-additions",
      "configure-sounds-menu",
      {
        name: "diwako-cpred-additions.settings.sound-select.name",
        label: "",
        hint: "diwako-cpred-additions.settings.sound-select.hint",
        icon: "fas fa-cog",
        type: SoundMenu,
        restricted: false,
      }
    );

    game.settings.register("diwako-cpred-additions", "configured-sounds", {
      scope: "world",
      config: false,
      type: Array,
      default: [],
    });

    console.log("diwako-cpred-additions settings end");
  }
}
