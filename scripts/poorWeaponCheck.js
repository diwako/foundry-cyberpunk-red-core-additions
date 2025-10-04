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
    itemName.includes("(poor)") ||
    itemName.includes(
      game.i18n.localize(
        "diwako-cpred-additions.poor-weapon-check.word-indicator"
      ).toLowerCase()
    );
  if (!isPoorWeapon) return;

  const messageReplaceMap = {
    attacker: token.name,
    weapon: item.name,
  };
  const stringKey = item.system.isRanged
    ? "diwako-cpred-additions.poor-weapon-check.ranged-weapon"
    : "diwako-cpred-additions.poor-weapon-check.melee-weapon";
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
