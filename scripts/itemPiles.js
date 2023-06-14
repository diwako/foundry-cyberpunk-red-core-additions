import { Utils } from "./utils.js";
import { Constants } from "./constants.js";

export class ItemPiles {
  static initialize() {
    if (game.modules.get("item-piles")?.active) {
      game.settings.register(Constants.MODULE_NAME, "itemPilesHandling", {
        name: game.i18n.localize(
          "diwako-cpred-additions.settings.itemPilesHandling.name"
        ),
        hint: game.i18n.localize(
          "diwako-cpred-additions.settings.itemPilesHandling.hint"
        ),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
      });

      Hooks.on("item-piles-removeItems", function (target, itemDeltas) {
        handleItemPilesInteraction(target, itemDeltas);
      });

      ["dropItem", "transferItems", "giveItem"].forEach((hookname) => {
        Hooks.on(
          `item-piles-${hookname}`,
          async function (source, _, itemData) {
            handleItemPilesInteraction(source, itemData);
          }
        );
      });
    }
  }
}

async function handleItemPilesInteraction(source, itemData) {
  if (
    !Utils.isResponsibleGM() ||
    !game.settings.get(Constants.MODULE_NAME, "itemPilesHandling")
  )
    return;

  console.log({ source, itemData });

  if (!Array.isArray(itemData)) {
    itemData = [itemData];
  }
  if (source._actor) {
    source = source._actor;
  }

  // if (!(await source.testUserPermission(game.user, "OWNER"))) return;
  const itemsToDelete = [];
  for (const itemInfo of itemData) {
    // only process weapon item types with upgrades
    if (
      !itemInfo ||
      itemInfo?.quantity > 1 ||
      !itemInfo.item ||
      !itemInfo.item.type ||
      itemInfo.item.type != "weapon" ||
      !itemInfo.item.system.upgrades ||
      !itemInfo.item.system.upgrades.length
    )
      continue;

    for (const upgrade of itemInfo.item.system.upgrades) {
      itemsToDelete.push(upgrade._id);
    }
  }

  if (itemsToDelete.length) {
    setTimeout(
      async function (source, itemsToDelete) {
        // if (!(await source.testUserPermission(game.user, "OWNER"))) return;
        const actualDelete = [];
        for (const id of itemsToDelete) {
          const item = await source.items.get(id);
          if (item) actualDelete.push(id);
        }

        if (actualDelete.length) {
          await source.deleteEmbeddedDocuments("Item", actualDelete);
          if (
            source.items.size == 0 &&
            source?.flags["item-piles"]?.data?.deleteWhenEmpty &&
            source.parent
          )
            await source.parent.delete();
        }
      },
      5 * 1000,
      source,
      itemsToDelete
    );
  }
}
