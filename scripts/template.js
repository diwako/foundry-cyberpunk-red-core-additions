export class Template {
  static async CreateTemplate(args) {
    let [chatMessage, handler, inputData] = args;
    // console.log('*** args', {chatMessage, handler, inputData});

    let position;
    if (window.Portal) {
      let location = await new Portal()
        .texture(
          "icons/svg/explosion.svg",
        )
        .size(inputData.size * 2)
        .pick();

      if (!location) {
        return;
      }

      position = location;
    } else {
      let config = {
        icon: "icons/svg/explosion.svg",
        rememberControlled: true,
        size: inputData.size,
        label: handler.item?.name || handler.animationData.label,
        drawIcon: true,
        drawOutline: true,
      };

      position = await warpgate.crosshairs.show(config);
    }

    let tempSize = inputData.size * 2;

    let hypDist = Math.sqrt(tempSize * tempSize * 2);
    let canvasDist = canvas.dimensions.distance;
    let trueWidth = tempSize / canvasDist;
    let gridSize = canvas.grid.size;
    let trueX = position.x - (trueWidth / 2) * gridSize;
    let trueY = position.y - (trueWidth / 2) * gridSize;

    let templateInfo = {
      angle: 0,
      direction: 45,
      distance: hypDist,
      fillColor: game.user.color,
      x: trueX,
      y: trueY,
      borderColor: "#000000",
      t: "rect",
    };

    canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateInfo]);
  }
}
