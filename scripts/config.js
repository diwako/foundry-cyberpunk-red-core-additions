Hooks.once("init", function () {
    console.log("diwako-cpred-additions settings start");
    game.settings.register("diwako-cpred-additions", "hit-animations", {
      name: game.i18n.localize("diwako-cpred-additions.settings.hit-animations.name"),
      hint: game.i18n.localize("diwako-cpred-additions.settings.hit-animations.hint"),
      scope: "world",
      config: true,
      type: Boolean,
      default: window.Sequence != null,
    });
    game.settings.register("diwako-cpred-additions", "hit-sounds", {
        name: game.i18n.localize("diwako-cpred-additions.settings.hit-sounds.name"),
        hint: game.i18n.localize("diwako-cpred-additions.settings.hit-sounds.hint"),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    });
    console.log("diwako-cpred-additions settings end");
  });