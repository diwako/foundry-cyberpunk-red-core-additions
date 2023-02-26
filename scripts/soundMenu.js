export class SoundMenu extends FormApplication {
  constructor(object, options) {
    super(object, options);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "diwako-cpred-additions-sounds-menu",
      title: game.i18n.localize(
        "diwako-cpred-additions.settings.sound-select.name"
      ),
      template: `modules/diwako-cpred-additions/templates/soundmenu.html`,
      classes: ["sheet"],
      width: 500,
    //   height: 500,
      closeOnSubmit: true,
      submitOnClose: false,
      resizable: true,
    });
  }

  async getData() {
    const data = super.getData().object;
    const moduleData = game.settings.get(
      "diwako-cpred-additions",
      "configure-sounds"
    );
    data.userSounds = moduleData;
    return data;
  }
}
