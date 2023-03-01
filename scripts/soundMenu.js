import { Constants } from "./constants.js";

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
      height: 500,
      closeOnSubmit: true,
      submitOnClose: false,
      resizable: true,
    });
  }

  async getData() {
    const data = super.getData().object;
    const moduleData = game.settings.get(
      Constants.MODULE_NAME,
      "configured-sounds"
    );
    data.userSounds = moduleData;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html
      .find("th a .fa-trash")
      .click((ev) =>
        ev.target.parentElement.parentElement.parentElement.remove()
      );

    html.find(".add-row").click((ev) => {
      let target = ev.currentTarget;
      new FilePicker({
        type: "audio",
        current: target.getAttribute("src"),
        callback: (path) => {
          target.src = path;
          this.newRow(target, path);
        },
        top: this.position.top + 40,
        left: this.position.left + 10,
      }).browse(target.getAttribute("src"));
    });

    html.find("#save-hit-sounds").click((ev) => {
      const pathsObjects = $(".diw-audiopath");
      let paths = [];
      for (let index = 0; index < pathsObjects.length; index++) {
        const element = pathsObjects[index];
        paths.push(element.value);
      }
      game.settings.set(Constants.MODULE_NAME, "configured-sounds", paths);
    });
  }

  async newRow(target, path) {
    const time = Date.now();
    let new_row = $(
      `<tr>
        <th><input type="text" class="diw-audiopath" value="${path}" readonly/></th>
        <th><a><i class="fa-solid fa-trash"></i></a></th>
      </tr>`
    );
    new_row.insertBefore(target);
    new_row
      .find("a .fa-trash")
      .click((ev) =>
        ev.target.parentElement.parentElement.parentElement.remove()
      );
  }
}
