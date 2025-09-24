const DV_CACHE = new Map();
export class Utils {
  static getDistance(token, target) {
    if (token.document) token = token.document;
    const a = canvas.grid.measurePath([token, target]).cost; // this could also be `distance`, but I don't know the difference yet.
    const b = token.elevation - target.document.elevation;
    return Math.round(Math.sqrt(a * a + b * b));
  }

  static async getDV(dvTable, dist) {
    let cachedData = DV_CACHE.get(dvTable);
    if (!cachedData) {
      // try to get imported table first
      let table = await game.tables.getName(dvTable);
      if (!table) {
        // after that try to get it from the default compendium packs
        const compendium = game.settings.get(
          game.system.id,
          "dvRollTableCompendium"
        );
        const pack =
          game.packs.get(compendium) || // what is configured in the system
          game.packs.get("cyberpunk-red-core.dv-tables") || // 0.87.X and up
          game.packs.get("cyberpunk-red-core.dvTables"); // 0.86.X and below

        const tableId = pack.index.getName(dvTable)?._id;
        if (!tableId) {
          console.log(
            `diwako-cpred-additions ===== No compendium (${pack.metadata.id} | ${pack.metadata.label}) table found => ${dvTable}`
          );
          return -1;
        }
        table = await pack.getDocument(tableId);
      }
      console.log(`diwako-cpred-additions ===== Caching table ${dvTable}`);
      cachedData = { table, dvs: new Map() };
      DV_CACHE.set(dvTable, cachedData);
    }
    let dv = cachedData.dvs.get(dist);
    if (!dv) {
      const draw = await cachedData.table.getResultsForRoll(dist);
      if (!draw || draw.length === 0) {
        console.log(
          `diwako-cpred-additions ===== Could not draw from compendium table => ${cachedData.table.name}`
        );
        return -1;
      }

      dv = parseInt(draw[0].text);
      cachedData.dvs.set(dist, dv);
    }
    return dv;
  }

  static isResponsibleGM() {
    if (!game.user.isGM) return false;
    let activeGMs = game.users.filter((u) => u.active && u.isGM);
    return activeGMs.length > 0 && activeGMs[0]._id === game.user._id;
  }
}
