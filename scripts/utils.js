const DV_CACHE = new Map();
export class Utils {
  static getDistance(token, target) {
    if (token.document) token = token.document;
    const a = canvas.grid.measureDistance(token, target, {
      gridSpaces: true,
    });
    const b = token.elevation - target.document.elevation;
    return Math.round(Math.sqrt(a * a + b * b));
  }

  static async getDV(dvTable, dist) {
    let cachedData = DV_CACHE.get(dvTable);
    if (!cachedData) {
      const pack = game.packs.get("cyberpunk-red-core.dvTables");
      const tableId = pack.index.getName(dvTable)?._id;
      if (!tableId) {
        console.log(
          `diwako-cpred-additions ===== No compendium table found => ${dvTable}`
        );
        return -1;
      }
      const table = await pack.getDocument(tableId);
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
}
