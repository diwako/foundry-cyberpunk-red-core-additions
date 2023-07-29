import { Config } from "./config.js";
import { DvDisplay } from "./dvDisplay.js";
import { Utils } from "./utils.js";
import { Constants } from "./constants.js";
import { Cover } from "./cover.js";
import { PoorWeaponCheck } from "./poorWeaponCheck.js";
import { DFAmbientLightsAndAA } from "./dfAmbientLights.js";
import { ItemPiles } from "./itemPiles.js";

console.log("diwako-cpred-additions start");
Hooks.once("init", function () {
  libWrapper.register(
    Constants.MODULE_NAME,
    "Token.prototype.draw",
    DvDisplay.registerWrapper,
    "WRAPPER"
  );
  Token.prototype.showDVDisplay = DvDisplay.show;
  Token.prototype.clearDVDisplay = DvDisplay.clear;

  Config.registerSettings();
  DFAmbientLightsAndAA.initialize();
  ItemPiles.initialize();
});

Hooks.on("hoverToken", (token, hovered) => {
  if (hovered) {
    canvas.tokens.get(token.id)?.showDVDisplay();
  } else {
    canvas.tokens.get(token.id)?.clearDVDisplay();
  }
});

Hooks.on("controlToken", (token, _) => {
  // prevent display of DV info when selecting current hovered token
  canvas.tokens.get(token.id)?.clearDVDisplay();
});

// Check if an attack hits or not
// Huge thanks to Zhell from the foundry discord for all the help
Hooks.on("createChatMessage", async function (message) {
  if (game.userId != message._source.user) return;
  const DIV = document.createElement("DIV");
  DIV.innerHTML = message.content;
  const isAttack = DIV.querySelector(
    `[data-tooltip='${game.i18n.localize(
      "CPR.actorSheets.commonActions.rollDamage"
    )}']`
  );
  const data = DIV.querySelector("[data-action=rollDamage]")?.dataset;
  if (!isAttack || !data) {
    return;
  }
  // console.log(message);
  const attackType = DIV.querySelector(
    "div.rollcard-subtitle-center.text-small"
  ).innerHTML.trim();
  if (attackType == `${game.i18n.localize("CPR.rolls.suppressiveFire")}`)
    return;

  const target = message.user.targets.first();
  if (!target) {
    console.log(`diwako-cpred-additions ===== No target was selected!`);
    return;
  }
  let token =
    message.speaker?.token ||
    canvas.scene.tokens.get(data.tokenId) ||
    canvas.scene.tokens.getName(message.speaker?.alias);
  const actor = token?.actor ?? game.actors.get(data.actorId);
  // fourth pass trying to get the token
  if (actor && !token) {
    console.log(
      `diwako-cpred-additions ===== Fourth token look up fallback! Alias: ${message.speaker?.alias} | Actor ${actor.name}`
    );
    token = canvas.scene.tokens.getName(actor.prototypeToken.name);
  }
  const item = actor.items.get(data.itemId);

  if (!token || !actor || !item) {
    console.log(
      `diwako-cpred-additions ===== Token missing: ${!token} | Actor missing: ${!actor} | Item missing: ${!item}`
    );
    return;
  }

  const attackRoll = parseInt(
    DIV.querySelector("span.clickable[data-action='toggleVisibility']")
      .innerHTML
  );
  let dvTable = item.system?.dvTable;
  if (!dvTable || dvTable === "") {
    console.log(
      `diwako-cpred-additions ===== Weapon has no DV table assigned!`
    );
    return;
  }

  if (
    attackType == `${game.i18n.localize("CPR.global.itemType.skill.autofire")}`
  ) {
    dvTable = dvTable + " (Autofire)";
  }

  const dist = Utils.getDistance(token, target);
  const dv = await Utils.getDV(dvTable, dist);
  if (dv < 0) return;

  const messageReplaceMap = {
    attacker: token.name,
    target: target.document.name,
    dv: dv,
    "dv-diff": attackRoll - dv,
    "dv-diff+1": dv - attackRoll + 1,
    "dv-diff-1": attackRoll - 1 - dv,
  };

  let chatMessage = "";
  let backgroundColor = "var(--cpr-text-chat-failure, #b90202ff)";
  let targetActor = target.document?._actor || target.document?.actor;
  if (dv >= attackRoll) {
    if (targetActor.system.stats.ref.value >= 8) {
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.missed.evade",
        messageReplaceMap
      );
    } else {
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.missed.normal",
        messageReplaceMap
      );
    }
    if (
      window.Sequence &&
      game.settings.get(Constants.MODULE_NAME, "hit-animations")
    ) {
      new Sequence()
        .effect()
        .delay(1000)
        .file(
          "modules/jb2a_patreon/Library/Generic/UI/Miss_01_Red_200x200.webm"
        )
        .snapToGrid()
        .atLocation(token, {
          gridUnits: true,
          offset: { x: 0, y: -0.55 },
        })
        .scaleToObject(1.35)
        .locally(message.whisper.length != 0)
        .play();
    }
  } else {
    backgroundColor = "var(--cpr-text-chat-success, #2d9f36)";
    if (targetActor.system.stats.ref.value >= 8) {
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.hit.evade",
        messageReplaceMap
      );
    } else {
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.hit.normal",
        messageReplaceMap
      );
    }

    if (window.Sequence) {
      const sequence = new Sequence();
      // sound effect
      if (game.settings.get(Constants.MODULE_NAME, "hit-sounds")) {
        const sounds = game.settings.get(
          Constants.MODULE_NAME,
          "configured-sounds"
        );
        if (sounds.length > 0) {
          const soundFile = sounds[Math.floor(Math.random() * sounds.length)];
          sequence
            .sound()
            .delay(1000)
            .file(soundFile)
            .volume(0.35)
            .locally(message.whisper.length != 0);
        }
      }
      // blood effect
      if (game.settings.get(Constants.MODULE_NAME, "hit-animations")) {
        let angle =
          (360 +
            Math.atan2(target.y - token.y, target.x - token.x) *
              (180 / Math.PI)) %
          360;
        sequence
          .effect()
          .delay(250)
          .file(
            "modules/jb2a_patreon/Library/Generic/Weapon_Attacks/Melee/DmgBludgeoning_01_Regular_Yellow_2Handed_800x600.webm"
          )
          .atLocation(target, {
            offset: {
              x: -Math.cos((angle * Math.PI) / 180),
              y: -Math.sin((angle * Math.PI) / 180),
            },
            gridUnits: true,
          })
          .rotate(angle * -1)
          .locally(message.whisper.length != 0);
      }
      sequence.play();
    }
  }

  ChatMessage.create(
    {
      speaker: message.speaker,
      content: `<div class="cpr-block" style="padding:10px;background-color:${backgroundColor}">${chatMessage}</div>`,
      type: message.type,
      whisper: message.whisper,
    },
    { chatBubble: false }
  );
});

const api = {};
api.funcs = {};
api.funcs.createCover = Cover.CreateCover;

self.cpr_additions = api;

console.log("diwako-cpred-additions end");
