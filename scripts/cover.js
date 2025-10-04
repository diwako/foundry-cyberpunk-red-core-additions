import { Constants } from "./constants.js";

let materials = [];

const presets = [
  { name: "Choose...", material: "custom" },
  { name: "Bank Vault Door", material: "steel_thick" },
  { name: "Bank Window Glass", material: "bulletproofglass_thick" },
  { name: "Bar", material: "wood_thick" },
  { name: "Boulder", material: "stone_thick" },
  { name: "Bulletproof Windshield", material: "bulletproofglass_thin" },
  { name: "Car Door", material: "steel_thin" },
  { name: "Data Term", material: "concrete_thick" },
  { name: "Engine Block", material: "steel_thick" },
  { name: "Hydrant", material: "steel_thick" },
  { name: "Log Cabin Wall", material: "wood_thick" },
  { name: "Metal Door", material: "steel_thin" },
  { name: "Office Cubicle", material: "plaster-foam-plastic_thin" },
  { name: "Office Wall", material: "plaster-foam-plastic_thick" },
  { name: "Overturned Table", material: "wood_thin" },
  { name: "Prison Visitation Glass", material: "bulletproofglass_thin" },
  { name: "Refrigerator", material: "steel_thin" },
  { name: "Shipping Container", material: "steel_thin" },
  { name: "Sofa", material: "plaster-foam-plastic_thin" },
  { name: "Statue", material: "stone_thin" },
  { name: "Tree", material: "wood_thick" },
  { name: "Utility Pole", material: "concrete_thick" },
  { name: "Wardrobe", material: "wood_thin" },
  { name: "Wardrobe", material: "wood_thin" },
  { name: "Windshield", material: "plaster-foam-plastic_thin" },
  { name: "Wooden Door", material: "wood_thin" },
];

export class Cover {
  static async CreateCover() {
    if (!game.user.isGM) {
      ui.notifications.error(
        game.i18n.localize("diwako-cpred-additions.cover.only-gm")
      );
      return;
    }
    if (materials.length === 0) {
      init();
    }
    const data = {
      presets: presets,
      materials: materials,
    };
    const template = await renderTemplate(
      "modules/diwako-cpred-additions/templates/createcover.html",
      data
    );
    new Dialog({
      title: game.i18n.localize("diwako-cpred-additions.cover.dialog.title"),
      content: template,
      buttons: {
        button1: {
          label: game.i18n.localize("CPR.dialog.common.confirm"),
          callback: async (html) => {
            extractData(html);
          },
          icon: `<i class="fas fa-check"></i>`,
        },
        button2: {
          label: game.i18n.localize("Cancel"),
          callback: async () => {},
          icon: `<i class="fas fa-times"></i>`,
        },
      },
    }).render(true);
  }
}

function createMaterial(id, hp, thin) {
  return {
    value: `${id}_${thin ? "thin" : "thick"}`,
    name: game.i18n.format("diwako-cpred-additions.cover.materials.display", {
      material: game.i18n.localize(
        `diwako-cpred-additions.cover.materials.${id}`
      ),
      thickness: game.i18n.localize(
        `diwako-cpred-additions.cover.materials.${thin ? "thin" : "thick"}`
      ),
    }),
    hp: hp,
  };
}

function init() {
  materials = [
    createMaterial("steel", 25, true),
    createMaterial("steel", 50, false),
    createMaterial("stone", 20, true),
    createMaterial("stone", 40, false),
    createMaterial("bulletproofglass", 15, true),
    createMaterial("bulletproofglass", 30, false),
    createMaterial("concrete", 10, true),
    createMaterial("concrete", 25, false),
    createMaterial("wood", 5, true),
    createMaterial("wood", 20, false),
    createMaterial("plaster-foam-plastic", 0, true),
    createMaterial("plaster-foam-plastic", 15, false),
    { value: "custom", name: game.i18n.localize("NOTE.Custom"), hp: -1 },
  ];
}

async function extractData(html) {
  const height = parseFloat(html.find("[id=height]")[0].value);
  const width = parseFloat(html.find("[id=width]")[0].value);
  const hp = parseInt(html.find("[id=hp]")[0].value);

  if (hp <= 0) {
    ui.notifications.error(
      game.i18n.localize("diwako-cpred-additions.cover.zero-hp-no-cover")
    );
    return;
  }

  let name = "";
  const preset = html.find("[id=preset]")[0];
  if (preset.value != "custom") {
    name = preset.options[preset.options.selectedIndex].text;
  } else {
    const material = html.find("[id=material]")[0];
    name = material.options[material.options.selectedIndex].text;
  }

  let position = await getPosition(height, width);
  createToken(name, height, width, position, hp);
}

async function getPosition(height, width) {
  let position;
  if (window.Portal) {
    let location = await new Portal()
      .texture(
        `systems/${game.system.id}/icons/compendium/armor/bullet_proof_shield.svg`
      )
      .size(Math.max(height, width) * 2)
      .pick();

    if (!location) {
      return;
    }

    position = location;
  } else {
    if (window.warpgate) {
      let location = await warpgate.crosshairs.show({
        size: 1,
        icon: `systems/${game.system.id}/icons/compendium/armor/bullet_proof_shield.svg`,
        label: name,
        drawIcon: true,
        drawOutline: false,
        interval: 2,
      });

      if (location.cancelled) {
        return;
      }
      position = {
        x: location.x,
        y: location.y,
        elevation: location.elevation || 0,
      };
    } else {
      const { x, y } =
        canvas.app.renderer.plugins.interaction?.mouse?.getLocalPosition(
          canvas.app.stage
        ) ||
        canvas.app?.renderer.plugins.interaction?.pointer?.getLocalPosition(
          canvas.app.stage
        );
      position = { x: x, y: y, elevation: 0 };
    }
  }
  return position;
}

async function getActor() {
  let actor = game.actors.get(
    game.settings.get(Constants.MODULE_NAME, "coverActorId")
  );

  if (!actor) {
    actor = await createActor();
  }

  return actor;
}

async function createActor() {
  const name = game.i18n.localize(
    "diwako-cpred-additions.cover.default-actor-name"
  );
  const actorData = {
    name: name,
    type: "mook",
    img: `systems/${game.system.id}/icons/compendium/armor/bullet_proof_shield.svg`,
  };

  const actor = await Actor.create(actorData);

  /**
   * These flags belong on the actor
   */
  await actor.setFlag('core', 'sheetClass', `${game.system.id}.CPRMookActorSheet`);
  await actor.setFlag(game.system.id, 'isCover', true);

  /**
   * These flags live on the Prototype Token
   */
  const flags = {};
  // Source: https://foundryvtt.com/packages/healthEstimate/
  flags.healthEstimate = {
    dontMarkDead: true,
    hideHealthEstimate: true,
    hideName: false,
  };
  // Source: https://foundryvtt.com/packages/splatter
  flags.splatter = {
    bloodColor: "#000000",
  };

  await actor.update({
    prototypeToken: {
      actorLink: false,
      displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
      displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
      disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      flags: flags,
      img: `systems/${game.system.id}/icons/compendium/armor/bullet_proof_shield.svg`,
      name: name,
      vision: false,
    },
    system: {
      derivedStats: {
        hp: {
          max: 0,
          value: 0,
        }
      },
      stats: {
          body: { value: 0 },
          cool: { value: 0 },
          dex: { value: 0 },
          emp: { value: 0, max: 0 },
          int: { value: 0 },
          luck: { value: 0, max: 0 },
          move: { value: 0 },
          ref: { value: 0 },
          tech: { value: 0 },
          will: { value: 0 },
        }
    }
  });

  await game.settings.set(Constants.MODULE_NAME, "coverActorId", actor.id);
  ui.notifications.notify(
    game.i18n.format("diwako-cpred-additions.cover.created-actor", {
      "actor-name": name,
    })
  );

  return actor;
}

async function createToken(name, height, width, position, hp) {
  height = Math.max(height, 0.5);
  width = Math.max(width, 0.5);

  const actor = await getActor();
  await actor.update({
    ['system.derivedStats.hp']: {
      max: hp,
      value: hp,
    }
  });

  const data = await actor.getTokenDocument({
    x: 0,
    y: 0,
    name: name,
  });

  let token = (await canvas.scene.createEmbeddedDocuments("Token", [data]))[0];

  const update = {
    _id: token._id,
    ["texture.scaleX"]: 1,
    ["texture.scaleY"]: height / width,
    elevation: position.elevation,
    height: height,
    hidden: game.settings.get(Constants.MODULE_NAME, "hideCoverTokenOnPlace"),
    name: name,
    width: width,
    x: position.x - canvas.grid.size * (width / 2),
    y: position.y - canvas.grid.size * (height / 2),
  };

  await canvas.scene.updateEmbeddedDocuments("Token", [update], {
    animate: false,
  });
}
