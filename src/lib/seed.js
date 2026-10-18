// Starting content, built from the DM's races document.
// Trait text is shortened for phones. Everything here is editable in DM mode.
// Ability lists: the abilities a race or background allows the +2/+1 to go on.

import { SUGGESTED_WEAPONS } from './rules.js';

const T = (name, text) => ({ name, text });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const RACES = [
  {
    name: 'Dragonborn', summary: 'Dragon-blooded and proud, with a breath weapon to match.',
    size: 'Medium', speed: '30 ft', senses: '', abilities: ['STR', 'CHA'],
    traits: [
      T('Draconic Ancestry', 'Pick a dragon color. It sets your breath weapon’s damage type and shape: black, copper (acid line), blue, bronze (lightning line), brass (fire line), gold, red (fire cone), green (poison cone), silver, white (cold cone).'),
      T('Breath Weapon', 'As an action, exhale energy. Everyone in the area makes a save and takes 2d6 damage, half on a success. Once per short or long rest.'),
      T('Damage Resistance', 'You take half damage from your ancestry’s damage type.'),
      T('Languages', 'Common and Draconic.'),
    ],
  },
  {
    name: 'Dwarf', summary: 'Tough, steady folk shaped by mountain halls and forges.',
    size: 'Medium', speed: '25 ft (heavy armor doesn’t slow you)', senses: 'Darkvision 60 ft', abilities: ['CON', 'STR', 'WIS'],
    weapons: ['Battleaxe', 'Handaxe', 'Light hammer', 'Warhammer'],
    traits: [
      T('Dwarven Resilience', 'Advantage on saves against poison, and you take half poison damage.'),
      T('Dwarven Combat Training', 'Proficient with battleaxe, handaxe, light hammer and warhammer.'),
      T('Tool Proficiency', 'Pick smith’s tools, brewer’s supplies or mason’s tools.'),
      T('Stonecunning', 'Extra good at History checks about stonework.'),
      T('Languages', 'Common and Dwarvish.'),
    ],
  },
  {
    name: 'Elf', summary: 'Graceful and long-lived. They trance instead of sleeping.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['DEX', 'INT', 'WIS'], skills: ['Perception'],
    weapons: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'],
    traits: [
      T('Fey Ancestry', 'Advantage on saves against being charmed, and magic can’t put you to sleep.'),
      T('Trance', 'Four hours of meditation gives you the rest of eight hours’ sleep.'),
      T('Keen Senses', 'You are proficient in Perception.'),
      T('High elf', 'Pick one: you know one wizard cantrip (uses Intelligence) and one extra language.'),
      T('Wood elf', 'Or pick this: your speed is 35 ft, and you can hide in light natural cover like rain, mist or leaves.'),
      T('Elf Weapon Training', 'Proficient with longsword, shortsword, shortbow and longbow.'),
    ],
  },
  {
    name: 'Gnome', summary: 'Curious tinkerers who find delight in everything.',
    size: 'Small', speed: '25 ft', senses: 'Darkvision 60 ft', abilities: ['INT', 'DEX', 'CON'],
    traits: [
      T('Gnome Cunning', 'Advantage on Intelligence, Wisdom and Charisma saves against magic.'),
      T('Forest gnome', 'Pick one: you know the Minor Illusion cantrip and can share simple ideas with small animals.'),
      T('Rock gnome', 'Or pick this: extra good at History checks about magic and gadgets, and you can build tiny clockwork toys.'),
      T('Languages', 'Common and Gnomish.'),
    ],
  },
  {
    name: 'Half-elf', summary: 'Walking in two worlds, with the best of elves and humans.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['CHA', 'DEX', 'CON'],
    traits: [
      T('Fey Ancestry', 'Advantage on saves against being charmed, and magic can’t put you to sleep.'),
      T('Half-Elf Versatility', 'Pick one: two extra skills, elf weapon training, a wizard cantrip, 35 ft speed, hiding in natural cover, drow magic, or a 30 ft swim speed.'),
      T('Languages', 'Common, Elvish and one more.'),
    ],
  },
  {
    name: 'Half-orc', summary: 'Strong, fierce and very hard to put down.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['STR', 'CON'], skills: ['Intimidation'],
    traits: [
      T('Menacing', 'You are proficient in Intimidation.'),
      T('Relentless Endurance', 'When you would drop to 0 hit points, drop to 1 instead. Once per long rest.'),
      T('Savage Attacks', 'On a melee critical hit, roll one of the weapon’s damage dice one more time.'),
      T('Languages', 'Common and Orc.'),
    ],
  },
  {
    name: 'Halfling', summary: 'Small, brave and famously lucky.',
    size: 'Small', speed: '25 ft', senses: '', abilities: ['DEX', 'CHA', 'CON'],
    traits: [
      T('Lucky', 'When you roll a 1 on an attack, check or save, reroll it once.'),
      T('Brave', 'Advantage on saves against being frightened.'),
      T('Nimble', 'You can move through the space of anyone bigger than you.'),
      T('Lightfoot', 'Pick one: you can hide behind a creature bigger than you.'),
      T('Stout', 'Or pick this: advantage on saves against poison, and half poison damage.'),
      T('Languages', 'Common and Halfling.'),
    ],
  },
  {
    name: 'Human', summary: 'Ambitious, adaptable and everywhere.',
    size: 'Medium', speed: '30 ft', senses: '', abilities: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
    traits: [
      T('Versatile', 'Your ability bonuses can go on any ability.'),
      T('Languages', 'Common and one more of your choice.'),
    ],
  },
  {
    name: 'Tiefling', summary: 'Touched by an infernal bargain they never made.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['CHA', 'INT', 'DEX'],
    traits: [
      T('Hellish Resistance', 'You take half fire damage.'),
      T('Languages', 'Common and Infernal.'),
    ],
  },
  {
    name: 'Aasimar', summary: 'Carries a spark of the heavens: light, healing and fury.',
    size: 'Medium or Small', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['WIS', 'CHA'],
    traits: [
      T('Celestial Resistance', 'You take half necrotic and radiant damage.'),
      T('Healing Hands', 'As an action, touch someone and heal them 2d4 hit points. Once per long rest.'),
      T('Light Bearer', 'You know the Light cantrip (uses Charisma).'),
    ],
  },
  {
    name: 'Aarakocra', summary: 'Bird-folk from the Plane of Air who take to the skies.',
    size: 'Medium', speed: '30 ft, fly 30 ft', senses: '', abilities: ['DEX', 'WIS'],
    traits: [
      T('Flight', 'You can fly at your walking speed, but not in medium or heavy armor.'),
      T('Talons', 'Your unarmed strikes deal 1d6 + Strength slashing damage.'),
    ],
  },
  {
    name: 'Deep gnome', summary: 'Underdark gnomes who blend into stone and shadow.',
    size: 'Small', speed: '30 ft', senses: 'Darkvision 120 ft', abilities: ['INT', 'DEX'],
    traits: [
      T('Gift of the Svirfneblin', 'From 3rd level you can cast Disguise Self, and from 5th Nondetection, each once per long rest.'),
      T('Gnomish Magic Resistance', 'Advantage on Intelligence, Wisdom and Charisma saves against spells.'),
      T('Svirfneblin Camouflage', 'Make a Stealth check with advantage, 2 times per long rest.'),
    ],
  },
  {
    name: 'Duergar', summary: 'Dwarves of the deep Underdark, changed by psionic magic.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 120 ft', abilities: ['CON', 'STR'],
    traits: [
      T('Dwarven Resilience', 'Advantage on saves against being poisoned, and half poison damage.'),
      T('Psionic Fortitude', 'Advantage on saves against being charmed or stunned.'),
    ],
  },
  {
    name: 'Eladrin', summary: 'Feywild elves whose moods shift with the seasons.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['DEX', 'INT', 'CHA'], skills: ['Perception'],
    traits: [
      T('Fey Step', 'As a bonus action, teleport up to 30 ft to a spot you can see. 2 times per long rest.'),
      T('Fey Ancestry', 'Advantage on saves against being charmed.'),
      T('Keen Senses', 'You are proficient in Perception.'),
      T('Trance', 'A 4-hour trance counts as a long rest. Afterward you can change your season (autumn, winter, spring or summer).'),
    ],
  },
  {
    name: 'Fairy', summary: 'A wee winged folk of the Feywild.',
    size: 'Small', speed: '30 ft, fly 30 ft', senses: '', abilities: ['DEX', 'CHA'],
    traits: [
      T('Fairy Magic', 'You know the Druidcraft cantrip.'),
      T('Flight', 'You can fly at your walking speed, but not in medium or heavy armor.'),
      T('Fey', 'Your creature type is Fey, not Humanoid.'),
    ],
  },
  {
    name: 'Firbolg', summary: 'Gentle forest giants who speak with beasts and trees.',
    size: 'Medium', speed: '30 ft', senses: '', abilities: ['WIS', 'STR'],
    traits: [
      T('Firbolg Magic', 'Cast Detect Magic and Disguise Self, each once per long rest.'),
      T('Hidden Step', 'As a bonus action, turn invisible until your next turn or until you attack. 2 times per long rest.'),
      T('Powerful Build', 'You count as one size bigger for carrying and lifting.'),
      T('Speech of Beast and Leaf', 'Animals and plants understand you, and you have advantage on Charisma checks to sway them.'),
    ],
  },
  {
    name: 'Githyanki', summary: 'Astral warriors with psionic power.',
    size: 'Medium', speed: '30 ft', senses: '', abilities: ['STR', 'INT'],
    traits: [
      T('Astral Knowledge', 'After each long rest, pick one skill and one weapon or tool to be proficient with until your next long rest.'),
      T('Githyanki Psionics', 'You know Mage Hand, and the hand is invisible.'),
      T('Psychic Resilience', 'You take half psychic damage.'),
    ],
  },
  {
    name: 'Goliath', summary: 'Mountain-born giants’ kin, built like stone.',
    size: 'Medium', speed: '30 ft', senses: '', abilities: ['STR', 'CON'], skills: ['Athletics'],
    traits: [
      T('Little Giant', 'Proficient in Athletics, and you count as one size bigger for carrying and lifting.'),
      T('Mountain Born', 'You take half cold damage and handle high altitude easily.'),
      T('Stone’s Endurance', 'When you take damage, use your reaction to reduce it by 1d12 + your Constitution modifier. 2 times per long rest.'),
    ],
  },
  {
    name: 'Harengon', summary: 'Rabbit-folk from the Feywild, quick and lucky.',
    size: 'Medium or Small', speed: '30 ft', senses: '', abilities: ['DEX', 'WIS'], skills: ['Perception'],
    traits: [
      T('Hare-Trigger', 'Add your proficiency bonus (+2) to initiative.'),
      T('Leporine Senses', 'You are proficient in Perception.'),
      T('Lucky Footwork', 'When you fail a Dexterity save, use your reaction to add 1d4 to it.'),
      T('Rabbit Hop', 'As a bonus action, jump 10 ft without provoking opportunity attacks. 2 times per long rest.'),
    ],
  },
  {
    name: 'Owlin', summary: 'Silent-winged owl-folk who see far in the dark.',
    size: 'Medium or Small', speed: '30 ft, fly 30 ft', senses: 'Darkvision 120 ft', abilities: ['DEX', 'WIS'], skills: ['Stealth'],
    traits: [
      T('Flight', 'You can fly at your walking speed, but not in medium or heavy armor.'),
      T('Silent Feathers', 'You are proficient in Stealth.'),
    ],
  },
  {
    name: 'Satyr', summary: 'Goat-legged revelers from the Feywild.',
    size: 'Medium', speed: '35 ft', senses: '', abilities: ['CHA', 'DEX'], skills: ['Performance', 'Persuasion'],
    traits: [
      T('Ram', 'Your headbutt deals 1d6 + Strength bludgeoning damage.'),
      T('Magic Resistance', 'Advantage on saves against spells.'),
      T('Mirthful Leaps', 'Add 1d8 feet to your jumps.'),
      T('Reveler', 'Proficient in Performance, Persuasion and one instrument.'),
      T('Fey', 'Your creature type is Fey, not Humanoid.'),
    ],
  },
  {
    name: 'Shadar-kai', summary: 'Elves of the Shadowfell, between life and death.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['DEX', 'CON'], skills: ['Perception'],
    traits: [
      T('Blessing of the Raven Queen', 'As a bonus action, teleport up to 30 ft to a spot you can see. 2 times per long rest.'),
      T('Necrotic Resistance', 'You take half necrotic damage.'),
      T('Fey Ancestry', 'Advantage on saves against being charmed.'),
      T('Keen Senses', 'You are proficient in Perception.'),
      T('Trance', 'A 4-hour trance counts as a long rest.'),
    ],
  },
  {
    name: 'Tabaxi', summary: 'Curious cat-folk with claws, climbing and bursts of speed.',
    size: 'Medium or Small', speed: '30 ft, climb 30 ft', senses: 'Darkvision 60 ft', abilities: ['DEX', 'CHA'], skills: ['Perception', 'Stealth'],
    traits: [
      T('Cat’s Claws', 'Your unarmed strikes deal 1d6 + Strength slashing damage.'),
      T('Cat’s Talent', 'You are proficient in Perception and Stealth.'),
      T('Feline Agility', 'On your turn, double your speed. To use it again, spend one turn not moving.'),
    ],
  },
  {
    name: 'Tortle', summary: 'Turtle-folk who carry their home on their backs.',
    size: 'Medium or Small', speed: '30 ft', senses: '', abilities: ['STR', 'WIS'],
    traits: [
      T('Natural Armor', 'Your AC is 17. You can’t wear armor, but shields still work.'),
      T('Claws', 'Your unarmed strikes deal 1d6 + Strength slashing damage.'),
      T('Hold Breath', 'You can hold your breath for an hour.'),
      T('Nature’s Intuition', 'Pick one skill: Animal Handling, Medicine, Nature, Perception, Stealth or Survival.'),
      T('Shell Defense', 'As an action, pull into your shell for +4 AC. You can’t move or act much until you come out.'),
    ],
  },
  {
    name: 'Orc', summary: 'Tireless children of Gruumsh, built to keep going.',
    size: 'Medium', speed: '30 ft', senses: 'Darkvision 60 ft', abilities: ['STR', 'CON'],
    traits: [
      T('Adrenaline Rush', 'Dash as a bonus action and gain 2 temporary hit points. 2 times per long rest.'),
      T('Powerful Build', 'You count as one size bigger for carrying and lifting.'),
      T('Relentless Endurance', 'When you would drop to 0 hit points, drop to 1 instead. Once per long rest.'),
    ],
  },
];

// Backgrounds and classes from the DM's document (version 1.1). Text shortened for phones.
const BG = (name, summary, skills, abilities, more = {}) => ({ name, summary, skills, abilities, traits: [], ...more });
const BACKGROUNDS = [
  BG('Acolyte', 'You served a temple and know its rites.', ['Insight', 'Religion'], ['INT', 'WIS', 'CHA'], {
    tools: 'None', languages: 'Two of your choice',
    equipment: 'A holy symbol, a prayer book or prayer wheel, 5 sticks of incense, vestments, common clothes, 15 gp',
    traits: [T('Shelter of the Faithful', 'Temples of your faith give you and your party free healing and care. Believers will support you at a modest lifestyle, and you may have a home temple whose priests will help you.')] }),
  BG('Anthropologist', 'You study cultures, customs and peoples, from books and firsthand.', ['Insight', 'Religion'], ['INT', 'WIS', 'CHA'], {
    tools: 'None', languages: 'Two of your choice',
    equipment: 'A leather-bound diary, ink and pen, traveler’s clothes, a meaningful trinket, 10 gp',
    traits: [
      T('Cultural Chameleon', 'You lived among another people until they treated you as one of their own. Pick the race whose culture you adopted.'),
      T('Adept Linguist', 'After watching people talk for a day, you can communicate with them at a basic level, even without a shared language.'),
    ] }),
  BG('Archaeologist', 'You dig up lost places to learn the stories of the past.', ['History', 'Survival'], ['CON', 'INT', 'WIS'], {
    tools: 'Cartographer’s tools or navigator’s tools', languages: 'One of your choice',
    equipment: 'A map to a ruin or dungeon, a bullseye lantern, a miner’s pick, traveler’s clothes, a shovel, a two-person tent, a trinket from a dig site, 25 gp',
    traits: [T('Historical Knowledge', 'In a ruin or dungeon, you can tell what it was for and who built it. You can also value art objects over a century old.')] }),
  BG('Athlete', 'You live for competition and the roar of the crowd.', ['Acrobatics', 'Athletics'], ['STR', 'DEX', 'CON'], {
    tools: 'Vehicles (land)', languages: 'One of your choice',
    equipment: 'A bronze discus or leather ball, a lucky charm or trophy, traveler’s clothes, 10 gp',
    traits: [T('Echoes of Victory', 'Within 100 miles of where you grew up, there’s a 50% chance a town has a fan who will give you information and a place to stay.')] }),
  BG('Charlatan', 'You read people easily and use it to your advantage.', ['Deception', 'Sleight of Hand'], ['DEX', 'CON', 'CHA'], {
    tools: 'Disguise kit, forgery kit', languages: 'None',
    equipment: 'Fine clothes, a disguise kit, 15 gp',
    traits: [T('False Identity', 'You have a second identity with papers, contacts and disguises. You can forge documents and handwriting you’ve seen.')] }),
  BG('City Watch', 'You kept your hometown safe from lawbreakers.', ['Athletics', 'Insight'], ['STR', 'INT', 'WIS'], {
    tools: 'None', languages: 'Two of your choice',
    equipment: 'A uniform showing your rank, a horn to call for help, manacles, 10 gp',
    traits: [T('Watcher’s Eye', 'You easily find the local watch, and just as easily spot where criminals gather.')] }),
  BG('Criminal', 'You have a history of breaking the law and still know the underworld.', ['Deception', 'Stealth'], ['DEX', 'CON', 'INT'], {
    tools: 'One gaming set, thieves’ tools', languages: 'None',
    equipment: 'A crowbar, dark common clothes with a hood, 15 gp',
    traits: [T('Criminal Contact', 'You have a trusted contact in a network of criminals and know how to get messages to them, even over long distances.')] }),
  BG('Entertainer', 'You thrive in front of an audience.', ['Acrobatics', 'Performance'], ['STR', 'DEX', 'CHA'], {
    tools: 'Disguise kit, one musical instrument', languages: 'None',
    equipment: 'A musical instrument, a token from an admirer, a costume, 15 gp',
    traits: [T('By Popular Demand', 'You can always find a place to perform. While you perform each night, you get free food and lodging, and locals tend to like you.')] }),
  BG('Far Traveler', 'You come from a land so distant most folk have barely heard of it.', ['Insight', 'Perception'], ['DEX', 'WIS', 'CHA'], {
    tools: 'One musical instrument or gaming set from your homeland', languages: 'One of your choice',
    equipment: 'Traveler’s clothes, a musical instrument, rough maps of your homeland, 5 gp' }),
  BG('Feylost', 'You grew up in the Feywild and came back changed.', ['Deception', 'Survival'], ['DEX', 'WIS', 'CHA'], {
    tools: 'One musical instrument', languages: 'Elvish, Gnomish, Goblin or Sylvan',
    equipment: 'A musical instrument, traveler’s clothes, 8 gp',
    traits: [
      T('Fey Mark', 'The Feywild left a small mark on you. Roll a d8: swirling eyes, a honey scent, cat whiskers, furry ears, skin that sparkles in moonlight, flowers that bloom or wilt near you, vine hair, or a tail.'),
      T('Feywild Connection', 'Fey recognize you as one of their own, and friendly ones will help you if you’re lost in the Feywild.'),
    ] }),
  BG('Fisher', 'You’ve spent your life on fishing boats and in the shallows.', ['History', 'Survival'], ['STR', 'DEX', 'WIS'], {
    tools: 'None', languages: 'One of your choice',
    equipment: 'Fishing tackle, a net, a favorite lure or wading boots, traveler’s clothes, 10 gp',
    traits: [T('Harvest the Water', 'Advantage on checks with fishing tackle. Near water with sea life, you can catch enough food for yourself and up to ten others each day.')] }),
  BG('Folk Hero', 'Common folk already see you as their champion.', ['Animal Handling', 'Survival'], ['STR', 'CON', 'WIS'], {
    tools: 'One artisan’s tools, vehicles (land)', languages: 'None',
    equipment: 'Artisan’s tools, a shovel, an iron pot, common clothes, 10 gp',
    traits: [T('Rustic Hospitality', 'Common folk will hide you, rest you and shield you from the law, as long as you aren’t a danger to them.')] }),
  BG('Giant Foundling', 'You grew up among giants and grew unusually large.', ['Intimidation', 'Survival'], ['STR', 'CON', 'WIS'], {
    tools: 'None', languages: 'Giant and one other',
    equipment: 'A backpack, traveler’s clothes, a small stone from home, 10 gp' }),
  BG('Guild Artisan/Merchant', 'A master of a craft, or a trader, backed by your guild.', ['Insight', 'Persuasion'], ['DEX', 'INT', 'CHA'], {
    tools: 'One artisan’s tools (merchants: navigator’s tools or a language instead)', languages: 'One of your choice',
    equipment: 'Artisan’s tools (or a mule and cart), a letter of introduction from your guild, traveler’s clothes, 15 gp',
    traits: [T('Guild Membership', 'Your guild gives you food and lodging if needed, supports you if you’re accused of a crime, and can open doors to powerful people.')] }),
  BG('Hermit', 'You lived in seclusion and found something there.', ['Medicine', 'Religion'], ['CON', 'WIS', 'CHA'], {
    tools: 'Herbalism kit', languages: 'One of your choice',
    equipment: 'A scroll case of notes, a winter blanket, common clothes, an herbalism kit, 5 gp',
    traits: [T('Discovery', 'In your seclusion you made a unique discovery: a great truth, a hidden place, or a lost fact. Work out what it is with your DM.')] }),
  BG('Mercenary', 'You fought for coin and now fight for something more.', ['Athletics', 'Persuasion'], ['STR', 'DEX', 'CON'], {
    tools: 'One gaming set, vehicles (land)', languages: 'None',
    equipment: 'Your company’s uniform, a rank insignia, about 30 gp of last wages',
    traits: [T('Mercenary Life', 'You recognize mercenary companies by their emblems, know who leads and hires them, and can always find mercenary work between adventures.')] }),
  BG('Noble', 'You carry a title, and your family wields wealth and influence.', ['History', 'Persuasion'], ['STR', 'INT', 'CHA'], {
    tools: 'One gaming set', languages: 'One of your choice',
    equipment: 'Fine clothes, a signet ring, a scroll of pedigree, 25 gp',
    traits: [T('Knight (option)', 'You can be a knight instead: you get retainers, one of them a noble squire, rather than the usual noble privileges.')] }),
  BG('Outlander', 'You grew up in the wilds, far from towns.', ['Athletics', 'Survival'], ['STR', 'CON', 'WIS'], {
    tools: 'One musical instrument', languages: 'One of your choice',
    equipment: 'A staff, a hunting trap, an animal trophy, traveler’s clothes, 10 gp',
    traits: [T('Wanderer', 'You remember maps and terrain well, and can find food and water for yourself and five others each day if the land has any.')] }),
  BG('Sailor/Pirate', 'Years at sea, on a merchant ship, a navy vessel or a pirate ship.', ['Athletics', 'Perception'], ['STR', 'DEX', 'WIS'], {
    tools: 'Navigator’s tools, vehicles (water)', languages: 'None',
    equipment: 'A club, 50 ft of silk rope, a lucky charm, common clothes, 10 gp',
    traits: [T('Pirate (option)', 'You learned to survive under a dread pirate captain, and many port towns know your unsavory reputation.')] }),
  BG('Sage', 'You spent years mastering lore from books and experts.', ['Arcana', 'History'], ['CON', 'INT', 'WIS'], {
    tools: 'None', languages: 'Two of your choice',
    equipment: 'Ink, a quill, a small knife, a letter from a dead colleague with an unanswered question, common clothes, 10 gp',
    traits: [T('Researcher', 'If you don’t know something, you usually know where or from whom to find it out.')] }),
  BG('Smuggler', 'You moved goods, and sometimes people, past the law.', ['Athletics', 'Deception'], ['STR', 'DEX', 'CHA'], {
    tools: 'Vehicles (water)', languages: 'None',
    equipment: 'A fancy leather vest or boots, common clothes, 15 gp',
    traits: [
      T('Down Low', 'In many towns, you and your friends can stay free in smugglers’ safe houses and keep your presence secret.'),
      T('Claim to Fame', 'You have one great smuggling story that sets you apart, and you tell it often.'),
    ] }),
  BG('Soldier', 'War has been your life for as long as you remember.', ['Athletics', 'Intimidation'], ['STR', 'DEX', 'CON'], {
    tools: 'One gaming set, vehicles (land)', languages: 'None',
    equipment: 'A rank insignia, a trophy from a fallen enemy, common clothes, 10 gp' }),
  BG('Urchin', 'You grew up alone and poor on the streets, and survived.', ['Sleight of Hand', 'Stealth'], ['DEX', 'WIS', 'CHA'], {
    tools: 'Disguise kit, thieves’ tools', languages: 'None',
    equipment: 'A small knife, a map of your home city, a pet mouse, a token of your parents, common clothes, 10 gp',
    traits: [T('City Secrets', 'Out of combat, you and anyone you lead travel between any two places in a city twice as fast.')] }),
];

const ALL_SKILLS = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
const FINESSE_KIT = ['simple', 'Hand crossbow', 'Longsword', 'Rapier', 'Shortsword'];
const CASTER_KIT = ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light crossbow'];

const CL = (name, summary, hitDie, saves, skillCount, skillList, weapons, casting, more) =>
  ({ name, summary, hitDie, saves, skillCount, skillList, weapons, casting, ...more });
const CLASSES = [
  CL('Artificer', 'A magical inventor who channels power through tools.', 8, ['CON', 'INT'], 2,
    ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'], ['simple'], 'INT', {
      armor: 'Light, medium, shields', tools: 'Thieves’ tools, tinker’s tools, one artisan’s tools',
      equipment: 'Any two simple weapons; a light crossbow and 20 bolts; studded leather or scale mail; thieves’ tools and a dungeoneer’s pack (or 55 gp instead)',
      suggestedWeapons: ['Light crossbow', 'Dagger', 'Light hammer'],
      traits: [
        T('Magical Tinkering', 'With tools in hand, touch a tiny object to give it a small effect: light, a recorded 6-second message, a smell or sound, or a picture or short text.'),
        T('Spellcasting', 'You know two artificer cantrips and cast using Intelligence.'),
      ] }),
  CL('Barbarian', 'A fierce warrior fueled by rage.', 12, ['STR', 'CON'], 2,
    ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'], ['simple', 'martial'], '', {
      armor: 'Light, medium, shields', tools: 'None',
      equipment: 'A greataxe or any martial melee weapon; two handaxes or any simple weapon; an explorer’s pack and four javelins',
      suggestedWeapons: ['Greataxe', 'Handaxe', 'Javelin'],
      traits: [
        T('Rage', 'As a bonus action, rage for a minute: advantage on Strength checks and saves, +2 melee damage with Strength, and half damage from weapons. 2 times per long rest. No spells while raging.'),
        T('Unarmored Defense', 'Without armor, your AC is 10 + Dexterity + Constitution. A shield still works.'),
      ] }),
  CL('Bard', 'A magical performer who inspires friends.', 8, ['DEX', 'CHA'], 3, ALL_SKILLS, FINESSE_KIT, 'CHA', {
    armor: 'Light', tools: 'Three musical instruments',
    equipment: 'A rapier, longsword or any simple weapon; a diplomat’s or entertainer’s pack; a lute or other instrument; leather armor and a dagger',
    suggestedWeapons: ['Rapier', 'Longsword', 'Dagger'],
    traits: [
      T('Spellcasting', 'You know two bard cantrips and cast using Charisma. You can cast ritual spells and use an instrument as your focus.'),
      T('Bardic Inspiration', 'As a bonus action, give an ally within 60 ft a d6 to add to one roll in the next 10 minutes. Uses equal to your Charisma modifier (at least 1) per long rest.'),
    ] }),
  CL('Blood Hunter', 'A monster hunter who fights with their own blood.', 10, ['DEX', 'INT'], 3,
    ['Acrobatics', 'Arcana', 'Athletics', 'History', 'Insight', 'Investigation', 'Religion', 'Survival'], ['simple', 'martial'], '', {
      armor: 'Light, medium, shields', tools: 'Alchemist’s supplies',
      equipment: 'A martial weapon or two simple weapons; a light or hand crossbow and 20 bolts; studded leather or scale mail; an explorer’s pack and alchemist’s supplies',
      suggestedWeapons: ['Longsword', 'Greatsword', 'Light crossbow', 'Hand crossbow'],
      traits: [
        T('Hunter’s Bane', 'Advantage on Survival checks to track fey, fiends and undead, and on Intelligence checks about them. Your hemocraft save DC is 8 + proficiency + Intelligence or Wisdom.'),
        T('Blood Maledict', 'You know one blood curse. Use it once per short or long rest, and you can hurt yourself to make it stronger.'),
      ] }),
  CL('Cleric', 'A priest who channels divine magic.', 8, ['WIS', 'CHA'], 2,
    ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'], ['simple'], 'WIS', {
      armor: 'Light, medium, shields', tools: 'None',
      equipment: 'A mace (or warhammer if trained); scale mail, leather or chain mail (if trained); a light crossbow and 20 bolts or any simple weapon; a priest’s or explorer’s pack; a shield and a holy symbol',
      suggestedWeapons: ['Mace', 'Light crossbow', 'Quarterstaff'],
      traits: [
        T('Spellcasting', 'You know three cleric cantrips and cast using Wisdom. Each day you prepare spells equal to your Wisdom modifier + 1.'),
        T('Divine Domain', 'Pick a domain from your god: Arcana, Death, Forge, Grave, Knowledge, Life, Light, Nature, Order, Peace, Tempest, Trickery, Twilight or War.'),
      ] }),
  CL('Druid', 'A keeper of nature who can later take animal shapes.', 8, ['INT', 'WIS'], 2,
    ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
    ['Club', 'Dagger', 'Dart', 'Javelin', 'Mace', 'Quarterstaff', 'Scimitar', 'Sickle', 'Sling', 'Spear'], 'WIS', {
      armor: 'Light, medium, shields (never metal)', tools: 'Herbalism kit',
      equipment: 'A wooden shield or any simple weapon; a scimitar or any simple melee weapon; leather armor, an explorer’s pack and a druidic focus',
      suggestedWeapons: ['Scimitar', 'Quarterstaff', 'Club', 'Sling'],
      traits: [
        T('Druidic', 'You know the secret language of druids and can leave hidden messages in it.'),
        T('Spellcasting', 'You know two druid cantrips and cast using Wisdom. You can cast ritual spells and use a druidic focus.'),
      ] }),
  CL('Fighter', 'A master of weapons and armor.', 10, ['STR', 'CON'], 2,
    ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'], ['simple', 'martial'], '', {
      armor: 'All armor, shields', tools: 'None',
      equipment: 'Chain mail, or leather with a longbow and 20 arrows; a martial weapon and shield, or two martial weapons; a light crossbow and 20 bolts, or two handaxes; a dungeoneer’s or explorer’s pack',
      suggestedWeapons: ['Longsword', 'Greatsword', 'Longbow', 'Light crossbow', 'Handaxe'],
      traits: [
        T('Fighting Style', 'Pick one: Archery (+2 to hit with ranged), Defense (+1 AC in armor), Dueling (+2 damage one-handed), Great Weapon Fighting, Protection, Two-Weapon Fighting, Blind Fighting, Interception, Superior Technique, Thrown Weapon Fighting, Unarmed Fighting, Close Quarters Shooter, Mariner or Tunnel Fighter.'),
        T('Second Wind', 'As a bonus action, heal 1d10 + your fighter level. Once per short or long rest.'),
      ] }),
  CL('Monk', 'A martial artist who channels inner energy.', 8, ['STR', 'DEX'], 2,
    ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'], ['simple', 'Shortsword'], '', {
      armor: 'None', tools: 'One artisan’s tools or musical instrument',
      equipment: 'A shortsword or any simple weapon; a dungeoneer’s or explorer’s pack; 10 darts',
      suggestedWeapons: ['Shortsword', 'Dart', 'Quarterstaff'],
      traits: [
        T('Unarmored Defense', 'Without armor or a shield, your AC is 10 + Dexterity + Wisdom.'),
        T('Martial Arts', 'Unarmed and with monk weapons, you can use Dexterity and roll a d4 for damage. After attacking, make an unarmed strike as a bonus action.'),
      ] }),
  CL('Paladin', 'A holy knight bound by an oath.', 10, ['WIS', 'CHA'], 2,
    ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'], ['simple', 'martial'], '', {
      armor: 'All armor, shields', tools: 'None',
      equipment: 'A martial weapon and shield, or two martial weapons; five javelins or any simple melee weapon; a priest’s or explorer’s pack; chain mail and a holy symbol',
      suggestedWeapons: ['Longsword', 'Warhammer', 'Javelin'],
      traits: [
        T('Divine Sense', 'As an action, sense any celestial, fiend or undead within 60 ft until the end of your next turn.'),
        T('Lay on Hands', 'You have a pool of 5 hit points of healing to give by touch. Spend 5 to cure a disease or poison. Refills on a long rest.'),
        T('Spellcasting', 'Paladins cast using Charisma, starting at 2nd level.'),
      ] }),
  CL('Ranger', 'A wilderness scout and hunter.', 10, ['STR', 'DEX'], 3,
    ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'], ['simple', 'martial'], '', {
      armor: 'Light, medium, shields', tools: 'None',
      equipment: 'Scale mail or leather armor; two shortswords or two simple melee weapons; a dungeoneer’s or explorer’s pack; a longbow and 20 arrows',
      suggestedWeapons: ['Longbow', 'Shortsword'],
      traits: [
        T('Favored Enemy', 'Pick a type of creature (or two humanoid races). Advantage on tracking them and recalling facts about them, and you learn one of their languages.'),
        T('Natural Explorer', 'Pick a favored terrain. There, your group can’t get lost, isn’t slowed by rough ground, and finds double food.'),
      ] }),
  CL('Rogue', 'A sneaky expert who strikes where it hurts.', 8, ['DEX', 'INT'], 4,
    ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'], FINESSE_KIT, '', {
      armor: 'Light', tools: 'Thieves’ tools',
      equipment: 'A rapier or shortsword; a shortbow and 20 arrows, or a shortsword; a burglar’s, dungeoneer’s or explorer’s pack; leather armor, two daggers and thieves’ tools',
      suggestedWeapons: ['Rapier', 'Shortsword', 'Shortbow', 'Dagger'],
      traits: [
        T('Expertise', 'Pick two of your skills (or one skill and thieves’ tools). You add double your proficiency bonus to them.'),
        T('Sneak Attack', 'Once per turn, deal an extra 1d6 when you hit with a finesse or ranged weapon and have advantage, or when an ally is next to your target.'),
        T('Thieves’ Cant', 'You know the secret slang and signs of thieves.'),
      ] }),
  CL('Sorcerer', 'A spellcaster with magic in their blood.', 6, ['CON', 'CHA'], 2,
    ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'], CASTER_KIT, 'CHA', {
      armor: 'None', tools: 'None',
      equipment: 'A light crossbow and 20 bolts, or any simple weapon; a component pouch or arcane focus; a dungeoneer’s or explorer’s pack; two daggers',
      suggestedWeapons: ['Light crossbow', 'Dagger', 'Quarterstaff'],
      traits: [
        T('Spellcasting', 'You know four sorcerer cantrips and two 1st-level spells, and cast using Charisma.'),
        T('Sorcerous Origin', 'Pick where your magic comes from: Aberrant Mind, Clockwork Soul, Draconic Bloodline, Divine Soul, Lunar Sorcery, Shadow Magic, Storm Sorcery or Wild Magic.'),
      ] }),
  CL('Warlock', 'A spellcaster who made a pact with a powerful being.', 8, ['WIS', 'CHA'], 2,
    ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'], ['simple'], 'CHA', {
      armor: 'Light', tools: 'None',
      equipment: 'A light crossbow and 20 bolts, or any simple weapon; a component pouch or arcane focus; a scholar’s or dungeoneer’s pack; leather armor, any simple weapon and two daggers',
      suggestedWeapons: ['Light crossbow', 'Dagger', 'Quarterstaff'],
      traits: [
        T('Otherworldly Patron', 'Pick your patron: Archfey, Celestial, Fathomless, Fiend, Genie, Great Old One, Hexblade, Undead or Undying.'),
        T('Pact Magic', 'You know two warlock cantrips and cast using Charisma.'),
      ] }),
  CL('Wizard', 'A scholar of magic with a spellbook.', 6, ['INT', 'WIS'], 2,
    ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'], CASTER_KIT, 'INT', {
      armor: 'None', tools: 'None',
      equipment: 'A quarterstaff or dagger; a component pouch or arcane focus; a scholar’s or explorer’s pack; a spellbook',
      suggestedWeapons: ['Quarterstaff', 'Dagger'],
      traits: [
        T('Spellcasting', 'You know three wizard cantrips and have six 1st-level spells in your spellbook. You cast using Intelligence and can cast rituals from your book.'),
        T('Spellbook', 'You can copy new wizard spells you find into your book: 2 hours and 50 gp per spell level.'),
      ] }),
];

const base = (kind, e) => ({
  id: `${kind}-${slug(e.name)}`, kind, image: '', source: 'Official', visible: false,
  skills: [], weapons: [], traits: [], summary: '', ...e,
});

// Bump when the starting content changes so demo devices pick it up.
export const SEED_VERSION = 2;

export function seedEntries() {
  return [
    ...RACES.map((e) => base('race', e)),
    ...BACKGROUNDS.map((e) => base('background', e)),
    ...CLASSES.map((e) => base('class', { suggestedWeapons: SUGGESTED_WEAPONS[e.name] || [], ...e })),
  ];
}

export function demoSeed() {
  // In demo mode everything starts visible so players can try it.
  return seedEntries().map((e) => ({ ...e, visible: true }));
}

export const newId = (kind) => `${kind}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
