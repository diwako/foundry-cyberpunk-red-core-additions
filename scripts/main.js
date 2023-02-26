import { Config } from "./config.js";

console.log("diwako-cpred-additions start");
Hooks.once("init", function () {
  Config.registerSettings();
});

// Check if an attack hits or not
// Huge thanks to Zhell from the foundry discord for all the help
Hooks.on("createChatMessage", async function (message) {
  // if (!game.user.isGM) return;
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
  ).innerHTML;
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

  const a = canvas.grid.measureDistance(token, target, { gridSpaces: true });
  const b = token.elevation - target.document.elevation;
  const dist = Math.round(Math.sqrt(a * a + b * b));

  const pack = game.packs.get("cyberpunk-red-core.dvTables");
  const tableId = pack.index.getName(dvTable)?._id;
  if (!tableId) {
    console.log(
      `diwako-cpred-additions ===== No compendium table found => ${dvTable}`
    );
    return;
  }
  const table = await pack.getDocument(tableId);
  const draw = await table.getResultsForRoll(dist);
  if (!draw || draw.length === 0) {
    console.log(
      `diwako-cpred-additions ===== Could not draw from compendium table => ${table.name}`
    );
    return;
  }
  const dv = parseInt(draw[0].text);

  const messageReplaceMap = {
    attacker: token.name,
    target: target.document.name,
    dv: dv,
    "dv-diff": attackRoll - dv,
    "dv-diff+1": dv - attackRoll + 1,
    "dv-diff-1": attackRoll - 1 - dv,
  };

  let chatMessage = "";
  let backgroundColor = "#b90202ff";
  if (dv >= attackRoll) {
    if (target.document._actor.system.stats.ref.value >= 8) {
      chatMessage = `<b>${token.name} <span class="fg-red">missed</span> ${
        target.document.name
      }</b> by ${
        dv - attackRoll + 1
      } according to the ranged DV (${dv})! Roll damage IF they have declared that they are dodging AND your roll has beat their evasion roll!`;

      //   chatMessage = game.i18n.localize("diwako-cpred-additions.message.missed.evade");
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.missed.evade",
        messageReplaceMap
      );
    } else {
      chatMessage = `<b>${token.name} <span class="fg-red">missed</span> ${
        target.document.name
      }</b> by ${dv - attackRoll + 1} (DV: ${dv})!`;
      //   chatMessage = game.i18n.localize("diwako-cpred-additions.message.missed.normal");
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.missed.normal",
        messageReplaceMap
      );
    }
    if (
      window.Sequence &&
      game.settings.get("diwako-cpred-additions", "hit-animations")
    ) {
      new Sequence()
        .effect()
        .delay(1000)
        .file(
          "modules/jb2a_patreon/Library/Generic/UI/Miss_01_Red_200x200.webm"
        )
        .snapToGrid()
        .atLocation(token, { gridUnits: true, offset: { x: 0, y: -0.55 } })
        .scaleToObject(1.35)
        .locally(message.whisper.length != 0)
        .play();
    }
  } else {
    backgroundColor = "#2d9f36";
    if (target.document._actor.system.stats.ref.value >= 8) {
      chatMessage = `<b>${
        token.name
      } <span class="fg-green">beats the ranged DV</span> </b>(${dv}, ${
        attackRoll - dv
      } over)<b> to hit ${target.document.name}</b> by ${
        attackRoll - 1 - dv
      }! Roll damage IF they have NOT declared that they are dodging OR your roll has beat their evasion roll!`;
      //   chatMessage = game.i18n.localize("diwako-cpred-additions.message.hit.evade");
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.hit.evade",
        messageReplaceMap
      );
    } else {
      chatMessage = `<b>${token.name} <span class="fg-green">hits</span> ${
        target.document.name
      }</b> (DV: ${dv}, ${attackRoll - dv} over)! Roll damage!`;
      chatMessage = game.i18n.format(
        "diwako-cpred-additions.message.hit.normal",
        messageReplaceMap
      );
    }

    if (
      window.Sequence &&
      game.settings.get("diwako-cpred-additions", "hit-animations")
    ) {
      let angle =
        (360 +
          Math.atan2(target.y - token.y, target.x - token.x) *
            (180 / Math.PI)) %
        360;
      // hit marker sound effect
      const sequence = new Sequence();
      if (game.settings.get("diwako-cpred-additions", "hit-sounds")) {
        let sounds = [
          "bf1.ogg",
          "cod.ogg",
          "quake.ogg",
          "hl1.ogg",
          "windows.ogg",
          "crash.ogg",
          "roblox.ogg",
          "boardgameonline.ogg",
          "disco.ogg",
          "titanfall2.mp3",
        ];
        sequence
          .sound()
          .delay(1000)
          .file(
            `worlds/diw_cpred/sounds/hitsounds/${
              sounds[Math.floor(Math.random() * sounds.length)]
            }`
          )
          .volume(0.35)
          .locally(message.whisper.length != 0);
      }
      // blood effect
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
        .locally(message.whisper.length != 0)
        .play();
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

[
  "preDropItemDetermined",
  "preTradeItems",
  "preDropItem",
  "preTransferItems",
  "preGiveItem",
  "preRemoveItems",
  "preTransferAllItems",
].forEach((hookname) => {
  Hooks.on(
    `item-piles-${hookname}`,
    function (actor, someBoolean1, itemObject, someBoolean2) {
      if (itemObject.item.system.upgrades.length) {
        ui.notifications.error(
          "Dropping/trading/giving upgraded items will break parts of the character sheet. If you want to trade an upgraded item or drop it, tell the GM."
        );
        return false;
      }
      return true;
    }
  );
});

console.log("diwako-cpred-additions end");
