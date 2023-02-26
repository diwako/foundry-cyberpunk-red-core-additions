# Diwako's Cyberpunk Red - Core Additions

A small module to add some more features to the Cyberpunk Red - Core system until these features are either added to the system itself or other wise.

## Features

### "Does it hit?"

A small feature to check if a ranged attack hits its mark. It outputs a chat message, with color codes, and with extra information about the attack. Useful if you need to know how much your shot was off, or how much it is over the DV (useful for autofire).

It takes the REF value into account of the target. Meaning it will remind everyone the target can dodge bullets.

Make sure to tell your players and yourself to target the token you want to attack!

![Does it hit example](images/does-it-hit.png)

### Hit sounds

**REQUIRES THE [SEQUENCER MODULE](https://github.com/fantasycalendar/FoundryVTT-Sequencer)**

For some reason my players wanted funny sounds when a token manages to hit another in ranged combat. So that option was added.

### Hit and miss animations

**REQUIRES THE [SEQUENCER MODULE](https://github.com/fantasycalendar/FoundryVTT-Sequencer) AND [JB2A PATREON MODULE](https://www.patreon.com/JB2A/)**

Displays the "Miss" animation most people know from XCOM2 and onwards. On hit it plays the bludgeoning effect from JB2A.

Do note this feature is not for gun fire effects, this is covered by the Automated Animations module and custom configuration files!

### Item Piles Module features

[Items Piles](https://github.com/fantasycalendar/FoundryVTT-ItemPiles/) is great, I fully recommend that module, sadly it can break character sheets if you drop, store, or sell an upgraded item using an Item Piles functionality.

Thus if this module detects you dropping an upgraded item it will prevent the action.

If you do not run Item Piles, don't worry this module will do nothing then.

## Known Issues

The CPRED - Core system does not provide speaker data on chat messages for players. The module will try to get the attacker token through various ways, but if the token you are attacking with has a different name than your character AND prototype token, this will not work. For the GM it will work just fine, as required data is being sent.

Only DV tables from the system's compendium is used. Custom ones are currently not supported.
