import { Utils } from "./utils.js";
import { Constants } from "./constants.js";

export class DFAmbientLightsAndAA {
  static initialize() {
    if (
      game.modules.get("df-active-lights")?.active &&
      game.modules.get("autoanimations")?.active
    ) {
      game.settings.register(Constants.MODULE_NAME, "dfAmbientLights-enable", {
        name: game.i18n.localize(
          "diwako-cpred-additions.settings.dfAmbientLights-enable.name"
        ),
        hint: game.i18n.localize(
          "diwako-cpred-additions.settings.dfAmbientLights-enable.hint"
        ),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
      });

      Hooks.on("AutomatedAnimations-WorkflowStart", onWorkflowStart);
    }
  }
}

async function onWorkflowStart(clonedData, animationData) {
  if (
    !Utils.isResponsibleGM() ||
    !game.settings.get(Constants.MODULE_NAME, "dfAmbientLights-enable")
  )
    return;
  const addedDelay = 100; // web delay
  // console.log({ clonedData, animationData });

  if (
    !clonedData?.item?.system?.isRanged ||
    !clonedData?.ammoItem ||
    !clonedData?.token
  )
    return;

  let targets = clonedData?.targets || [];
  let target;
  if (targets.length > 0) {
    target = targets[0].document;
  }

  let token = clonedData.token;
  if (!token) return;
  let delay = animationData?.primary?.options?.delay || 0;
  let soundDelay = animationData?.primary?.sound?.delay || 0;
  animationData["primary.options.delay"] = delay + addedDelay;
  animationData["primary.sound.delay"] = soundDelay + addedDelay;
  let secondaryDelay = animationData?.secondary?.options?.delay || 0;
  soundDelay = animationData?.secondary?.sound?.delay || 0;
  animationData["secondary.options.delay"] = secondaryDelay + addedDelay;
  animationData["secondary.sound.delay"] = soundDelay + addedDelay;
  // let color =
  //   animationData?.primary?.video?.enableCustom || false
  //     ? "uuuh i will do that later, maybe"
  //     : animationData?.primary?.video?.color || "orange";
  let repeat =
    clonedData?.overrideRepeat || animationData?.primary?.options?.repeat || 1;
  let repeatDelay = animationData?.primary?.options?.repeatDelay || 250;
  let rotation = token.rotation;

  if (target) {
    rotation =
      (360 -
        90 +
        Math.atan2(target.y - token.y, target.x - token.x) * (180 / Math.PI)) %
      360;
  }

  let _addKeyFrame = function (time, on) {
    return {
      time: game.time.serverTime + time + addedDelay,
      angle: {
        enabled: false,
        value: 0,
      },
      bright: {
        enabled: true,
        value: on ? 25 : 0,
      },
      dim: {
        enabled: true,
        value: on ? 25 : 0,
      },
      rotation: {
        enabled: false,
        value: 0,
      },
      tintAlpha: {
        enabled: false,
        value: 0.5,
      },
      tintColor: {
        enabled: false,
        value: "#000000",
        isColor: true,
      },
    };
  };

  let keyFrames = [];
  // add initial key, as time variable will never be 0
  // this is also to prevent warnings in console
  let initFrame = _addKeyFrame(0, false);
  initFrame.time = 0;
  keyFrames.push(initFrame);
  // make 100% sure one millisecond before the first flash is still dark
  keyFrames.push(_addKeyFrame(delay - 1, false));

  for (let index = 0; index < repeat; index++) {
    // turn light on
    keyFrames.push(_addKeyFrame(delay + repeatDelay * index, true));
    // keep it on
    keyFrames.push(_addKeyFrame(delay + repeatDelay * index + 49, true));
    // turn it off
    keyFrames.push(_addKeyFrame(delay + repeatDelay * index + 50, false));
    // keep it off until new flash
    keyFrames.push(_addKeyFrame(delay + repeatDelay * (index + 1) - 1, false));
  }
  keyFrames.push(_addKeyFrame(delay + repeatDelay * repeat + 10000, false));

  const [light] = await canvas.scene.createEmbeddedDocuments("AmbientLight", [
    {
      x: token.x + canvas.grid.size / 2,
      y: token.y + canvas.grid.size / 2,
      rotation: rotation,
      config: {
        color: "#943400", // todo dynamic color
        dim: 20,
        bright: 20,
        luminosity: 0.5,
        angle: 270,
        attenuation: 1,
      },
      flags: {
        ["df-active-lights"]: {
          anims: {
            bounce: false,
            offset: 0,
            keys: keyFrames,
          },
        },
      },
    },
  ]);

  setTimeout(
    function (id) {
      canvas.scene.deleteEmbeddedDocuments("AmbientLight", [id]);
    },
    delay + repeatDelay * repeat + 2000 + addedDelay,
    light._id
  );
}
