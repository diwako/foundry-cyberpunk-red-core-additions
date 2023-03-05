import { Constants } from "./constants.js";

const materials = [
  { value: "steel_thin", name: "Steel (thin)", hp: 25 },
  { value: "steel_thick", name: "Steel (thick)", hp: 50 },

  { value: "stone_thin", name: "Stone (thin)", hp: 20 },
  { value: "stone_thick", name: "Stone (thick)", hp: 40 },

  { value: "bulletproofglass_thin", name: "Bulletproof Glass (thin)", hp: 15 },
  {
    value: "bulletproofglass_thick",
    name: "Bulletproof Glass (thick)",
    hp: 30,
  },

  { value: "concrete_thin", name: "Concrete (thin)", hp: 10 },
  { value: "concrete_thick", name: "Concrete (thick)", hp: 25 },

  { value: "wood_thin", name: "Wood (thin)", hp: 5 },
  { value: "wood_thick", name: "Wood (thick)", hp: 20 },

  {
    value: "plaster_foam_plastic_thin",
    name: "Plaster/Foam/Plastic (thin)",
    hp: 0,
  },
  {
    value: "plaster_foam_plastic_thick",
    name: "Plaster/Foam/Plastic (thick)",
    hp: 15,
  },

  { value: "custom", name: "Custom Value", hp: -1 },
];

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
  { name: "Office Cubicle", material: "plaster_foam_plastic_thin" },
  { name: "Office Wall", material: "plaster_foam_plastic_thick" },
  { name: "Overturned Table", material: "wood_thin" },
  { name: "Prison Visitation Glass", material: "bulletproofglass_thin" },
  { name: "Refrigerator", material: "steel_thin" },
  { name: "Shipping Container", material: "steel_thin" },
  { name: "Sofa", material: "plaster_foam_plastic_thin" },
  { name: "Statue", material: "stone_thin" },
  { name: "Tree", material: "wood_thick" },
  { name: "Utility Pole", material: "concrete_thick" },
  { name: "Wardrobe", material: "wood_thin" },
  { name: "Wardrobe", material: "wood_thin" },
  { name: "Windshield", material: "plaster_foam_plastic_thin" },
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
            createCoverToken(html);
          },
          icon: `<i class="fas fa-check"></i>`,
        },
        button2: {
          label: game.i18n.localize("CPR.dialog.common.cancel"),
          callback: async () => {},
          icon: `<i class="fas fa-times"></i>`,
        },
      },
    }).render(true);
  }
}

async function createCoverToken(html) {
  const height = parseInt(html.find("[id=height]")[0].value);
  const width = parseInt(html.find("[id=width]")[0].value);
  const hp = parseInt(html.find("[id=hp]")[0].value);

  let name = "";
  const preset = html.find("[id=preset]")[0];
  if (preset.value != "custom") {
    name = preset.options[preset.options.selectedIndex].text;
  } else {
    const material = html.find("[id=material]")[0];
    name = material.options[material.options.selectedIndex].text;
  }

  let position = [0, 0];
  if (window.warpgate) {
    let location = await warpgate.crosshairs.show({
      size: 1,
      icon: "icons/svg/hazard.svg",
      label: name,
      // labelOffset: {x:0, y:-canvas.grid.size*3},
      drawIcon: true,
      drawOutline: false,
      interval: -1,
    });

    if (location.cancelled) {
      return;
    }
    position = [location.x, location.y];
  } else {
    const { x, y } =
      canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(
        canvas.app.stage
      );
    position = [x, y];
  }

  console.log({ name, height, width, hp, position });

  let actorName = "Group";
  let actor = game.actors.getName(actorName);

  if (actor) {
    const data = await actor.getTokenDocument({
      x: position[0] - canvas.grid.size * (width / 2),
      y: position[1] - canvas.grid.size * (height / 2),
      name: name,
    });
    const flags = data.flags;
    if (!flags["cyberpunk-red-core"]) {
      flags["cyberpunk-red-core"] = {};
    }
    flags["cyberpunk-red-core"]["isCover"] = true;

    const newData = foundry.utils.mergeObject(data, {
      height: height,
      width: width,
      flags: flags,
      hidden: true,
    });

    let token = await canvas.scene.createEmbeddedDocuments("Token", [newData]);
    console.log({token: token[0], newData});
    ui.notifications.notify(`Created new token for actor ${actorName}.`);
  } else {
    ui.notifications.notify(`No actor found with name ${actorName}.`);
  }
}
