import { Utils } from "./utils.js";
import { Constants } from "./constants.js";

export class PoorWeaponCheck {}

Hooks.on("createChatMessage", async function (message) {
  if (
    game.userId != message._source.author ||
    !game.settings.get(Constants.MODULE_NAME, "poorWeaponCheck")
  )
    return;
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

  const isFail = DIV.querySelector(".d10")
    .getAttribute("src")
    .includes("d10_1_fail.svg");
  if (!isFail) return;

  let token =
    message.speaker?.token ||
    canvas.scene.tokens.get(data.tokenId) ||
    canvas.scene.tokens.getName(message.speaker?.alias);
  const actor = token?.actor ?? game.actors.get(data.actorId);
  const item = actor?.items?.get(data.itemId);

  if (!token || !actor || !item) {
    console.log(
      `diwako-cpred-additions ===== Token missing: ${!token} | Actor missing: ${!actor} | Item missing: ${!item}`
    );
    return;
  }

  const itemName = item.name.toLowerCase();
  const isPoorWeapon =
    item.system.quality == "poor" ||
    itemName.includes("(poor)") ||
    itemName.includes(
      game.i18n
        .localize("diwako-cpred-additions.poor-weapon-check.word-indicator")
        .toLowerCase()
    );
  if (!isPoorWeapon) return;

  let critFailEffect = item.system.critFailEffect;

  if (
    critFailEffect == "coinToss" &&
    game.settings.get(Constants.MODULE_NAME, "poorWeaponCheckAutoResolve")
  ) {
    if (Math.floor(Math.random() * 2) == 0) {
      // heads
      critFailEffect = "jammed";
    } else {
      // tails
      critFailEffect = "destroyed";
    }
  }

  let stringKey = "";
  switch (critFailEffect) {
    case "destroyed":
      stringKey = "diwako-cpred-additions.poor-weapon-check.break-weapon";
      break;
    case "destroyedBeyondRepair":
      stringKey =
        "diwako-cpred-additions.poor-weapon-check.break-beyond-weapon";
      break;
    case "jammed":
      stringKey = "diwako-cpred-additions.poor-weapon-check.jam-weapon";
      break;
    case "coinToss":
      stringKey = "diwako-cpred-additions.poor-weapon-check.cointoss";
      break;
    default:
      console.log(
        `diwako-cpred-additions ===== Unknown critFailEffect: ${item.system.critFailEffect} | Item: ${item.name} | Token: ${token.name}`
      );
      return;
  }

  const messageReplaceMap = {
    attacker: token.name,
    weapon: item.name,
  };
  ChatMessage.create(
    {
      speaker: message.speaker,
      content: `<div class="cpr-block" style="padding:10px;display:block">${game.i18n.format(
        stringKey,
        messageReplaceMap
      )}</div>`,
      type: message.type,
      whisper: message.whisper,
    },
    { chatBubble: false }
  );
});
