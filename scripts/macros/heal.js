if (!game.clt?.supported) {
  console.error(
    'To use the Heal macro, you should install Condition Lab & Triggler'
  );
}

const selectedTokens = canvas.tokens.controlled;

selectedTokens.forEach(async (token) => {
  const tokenActor = token.actor;
  if (!['character', 'mook'].includes(tokenActor.type)) {
    return;
  }

  const name = tokenActor.type === 'character' ? tokenActor.name : token.name;
  const body = tokenActor.system.stats.body.value;
  let baseHeal = tokenActor.system.stats.body.value;
  let healedAmtString = `<ul><li>${baseHeal} [BODY]</li>`;

  // Enhanced Antibodies Cyberware (x2) natural healing rate
  if (tokenActor.itemTypes.cyberware.find((c) => c.name.match(/antibodies/i))) {
    baseHeal = baseHeal * 2;
    healedAmtString += '<li>* 2 [Enhanced Antibodies Cyberware]</li>';
  }

  // Cryotank (x2) natural healing rate
  if (tokenActor.appliedEffects.find((effect) => effect.name.match(/cryo/i))) {
    baseHeal = baseHeal * 2;
    healedAmtString += '<li>* 2 [Cryotank]</li>';
  }

  // Medtech Antibiotics +2
  if (
    tokenActor.appliedEffects.find((effect) =>
      effect.name.match(/antibiotics/i)
    )
  ) {
    baseHeal = baseHeal + 2;
    healedAmtString += '<li>+ 2 [Antibiotics]</li>';
  }

  const message = `
    <p><strong>${name}</strong> rested and healed <strong>${baseHeal}hp</strong>.</p>
    ${healedAmtString}</ul>`;

  await ChatMessage.create({
    content: message,
  });

  const hp = tokenActor.system.derivedStats.hp;

  await tokenActor.update({
    'system.derivedStats.hp.value': Number(hp.value + body),
  });
  console.debug('***', tokenActor.name, { body, hp: hp.value });
});
