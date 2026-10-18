// Starting content, built from the DM's races document.
// Trait text is shortened for phones. Everything here is editable in DM mode.
// Ability lists: the abilities a race or background allows the +2/+1 to go on.

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

const BG = (name, summary, skills, abilities, traits = []) => ({ name, summary, skills, abilities, traits });
const BACKGROUNDS = [
  BG('Acolyte', 'You served a temple and know its rites.', ['Insight', 'Religion'], ['INT', 'WIS', 'CHA'],
    [T('Shelter of the Faithful', 'Temples of your faith give you and your party free healing and care, and fellow believers will support you.')]),
  BG('Anthropologist', 'You study cultures, customs and peoples.', ['Insight', 'Religion'], ['INT', 'WIS', 'CHA']),
  BG('Archaeologist', 'You dig up lost places and old secrets.', ['History', 'Survival'], ['CON', 'INT', 'WIS']),
  BG('Athlete', 'You trained your body to compete.', ['Acrobatics', 'Athletics'], ['STR', 'DEX', 'CON']),
  BG('Charlatan', 'You get by on lies and tricks.', ['Deception', 'Sleight of Hand'], ['DEX', 'CON', 'CHA']),
  BG('City Watch', 'You kept the peace on city streets.', ['Athletics', 'Insight'], ['STR', 'INT', 'WIS']),
  BG('Criminal', 'You lived on the wrong side of the law.', ['Deception', 'Stealth'], ['DEX', 'CON', 'INT']),
  BG('Entertainer', 'You live for the crowd and the stage.', ['Acrobatics', 'Performance'], ['STR', 'DEX', 'CHA']),
  BG('Far Traveler', 'You come from somewhere very far away.', ['Insight', 'Perception'], ['DEX', 'WIS', 'CHA']),
  BG('Feylost', 'You grew up lost in the Feywild.', ['Deception', 'Survival'], ['DEX', 'WIS', 'CHA']),
  BG('Fisher', 'You worked the water and know its stories.', ['History', 'Survival'], ['STR', 'DEX', 'WIS']),
  BG('Folk Hero', 'Ordinary folk see you as their champion.', ['Animal Handling', 'Survival'], ['STR', 'CON', 'WIS']),
  BG('Giant Foundling', 'You were raised by giants.', ['Intimidation', 'Survival'], ['STR', 'CON', 'WIS']),
  BG('Guild Artisan', 'You learned a trade in a guild, or traded goods as a merchant.', ['Insight', 'Persuasion'], ['DEX', 'INT', 'CHA']),
  BG('Haunted One', 'Something dark follows you.', ['Investigation', 'Religion'], ['CON', 'WIS', 'CHA']),
  BG('Hermit', 'You lived alone, far from others.', ['Medicine', 'Religion'], ['CON', 'WIS', 'CHA']),
  BG('Knight', 'You hold a title and an oath.', ['History', 'Persuasion'], ['STR', 'INT', 'CHA']),
  BG('Mercenary', 'You fought for coin.', ['Athletics', 'Persuasion'], ['STR', 'DEX', 'CON']),
  BG('Noble', 'You were born to wealth and status.', ['History', 'Persuasion'], ['STR', 'INT', 'CHA']),
  BG('Outlander', 'You grew up in the wilds.', ['Athletics', 'Survival'], ['STR', 'CON', 'WIS']),
  BG('Sailor', 'You crewed a ship, or sailed as a pirate.', ['Athletics', 'Perception'], ['STR', 'DEX', 'WIS']),
  BG('Sage', 'You spent years learning from books.', ['Arcana', 'History'], ['CON', 'INT', 'WIS']),
  BG('Smuggler', 'You moved goods past the law.', ['Athletics', 'Deception'], ['STR', 'DEX', 'CHA']),
  BG('Soldier', 'You served in an army.', ['Athletics', 'Intimidation'], ['STR', 'DEX', 'CON']),
  BG('Urchin', 'You grew up poor on the streets.', ['Sleight of Hand', 'Stealth'], ['DEX', 'WIS', 'CHA']),
];

const ALL_SKILLS = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
const FINESSE_KIT = ['simple', 'Hand crossbow', 'Longsword', 'Rapier', 'Shortsword'];
const CASTER_KIT = ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light crossbow'];

const CL = (name, summary, hitDie, saves, skillCount, skillList, weapons, casting, traits) =>
  ({ name, summary, hitDie, saves, skillCount, skillList, weapons, casting, traits });
const CLASSES = [
  CL('Artificer', 'A magical inventor who infuses gear with power.', 8, ['CON', 'INT'], 2,
    ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'], ['simple'], 'INT',
    [T('Magical Tinkering', 'Give a tiny object a small magical effect, like light or a recorded message.'), T('Spellcasting', 'You cast artificer spells using Intelligence.')]),
  CL('Barbarian', 'A fierce warrior fueled by rage.', 12, ['STR', 'CON'], 2,
    ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'], ['simple', 'martial'], '',
    [T('Rage', 'As a bonus action, rage for a minute: +2 melee damage and half damage from weapons. 2 times per long rest.'), T('Unarmored Defense', 'Without armor, your AC is 10 + Dexterity + Constitution.')]),
  CL('Bard', 'A magical performer who inspires friends.', 8, ['DEX', 'CHA'], 3, ALL_SKILLS, FINESSE_KIT, 'CHA',
    [T('Spellcasting', 'You cast bard spells using Charisma.'), T('Bardic Inspiration', 'As a bonus action, give an ally a d6 to add to a roll. Uses equal to your Charisma modifier per long rest.')]),
  CL('Blood Hunter', 'A monster hunter who fights with their own blood.', 10, ['DEX', 'INT'], 3,
    ['Acrobatics', 'Arcana', 'Athletics', 'History', 'Insight', 'Investigation', 'Religion', 'Survival'], ['simple', 'martial'], '',
    [T('Hunter’s Bane', 'Advantage on Survival checks to track fey, fiends and undead, and on Intelligence checks to recall facts about them.'), T('Blood Maledict', 'Spend your own hit points to curse a foe with a blood curse.')]),
  CL('Cleric', 'A priest who channels divine magic.', 8, ['WIS', 'CHA'], 2,
    ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'], ['simple'], 'WIS',
    [T('Spellcasting', 'You cast cleric spells using Wisdom.'), T('Divine Domain', 'Pick a domain from your god. It grants extra spells and powers.')]),
  CL('Druid', 'A keeper of nature who can later take animal shapes.', 8, ['INT', 'WIS'], 2,
    ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
    ['Club', 'Dagger', 'Dart', 'Javelin', 'Mace', 'Quarterstaff', 'Scimitar', 'Sickle', 'Sling', 'Spear'], 'WIS',
    [T('Druidic', 'You know the secret language of druids.'), T('Spellcasting', 'You cast druid spells using Wisdom.')]),
  CL('Fighter', 'A master of weapons and armor.', 10, ['STR', 'CON'], 2,
    ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'], ['simple', 'martial'], '',
    [T('Fighting Style', 'Pick a style, like archery (+2 to hit with ranged weapons) or defense (+1 AC in armor).'), T('Second Wind', 'As a bonus action, heal 1d10 + 1 hit points. Once per short or long rest.')]),
  CL('Monk', 'A martial artist who channels inner energy.', 8, ['STR', 'DEX'], 2,
    ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'], ['simple', 'Shortsword'], '',
    [T('Unarmored Defense', 'Without armor or a shield, your AC is 10 + Dexterity + Wisdom.'), T('Martial Arts', 'Your unarmed strikes deal 1d4 and can use Dexterity. After attacking, punch again as a bonus action.')]),
  CL('Paladin', 'A holy knight bound by an oath.', 10, ['WIS', 'CHA'], 2,
    ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'], ['simple', 'martial'], '',
    [T('Divine Sense', 'Sense celestials, fiends and undead nearby.'), T('Lay on Hands', 'You have a pool of 5 hit points of healing to hand out by touch. Refills on a long rest.')]),
  CL('Ranger', 'A wilderness scout and hunter.', 10, ['STR', 'DEX'], 3,
    ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'], ['simple', 'martial'], '',
    [T('Favored Enemy', 'Pick a type of creature. You are better at tracking and remembering facts about them.'), T('Natural Explorer', 'Pick a type of land. You travel and survive there with ease.')]),
  CL('Rogue', 'A sneaky expert who strikes where it hurts.', 8, ['DEX', 'INT'], 4,
    ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'], FINESSE_KIT, '',
    [T('Expertise', 'Pick two of your skills. You add double your proficiency bonus to them.'), T('Sneak Attack', 'Once per turn, deal an extra 1d6 damage when you hit with advantage, or when an ally is next to your target.'), T('Thieves’ Cant', 'You know the secret slang of thieves.')]),
  CL('Sorcerer', 'A spellcaster with magic in their blood.', 6, ['CON', 'CHA'], 2,
    ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'], CASTER_KIT, 'CHA',
    [T('Spellcasting', 'You cast sorcerer spells using Charisma.'), T('Sorcerous Origin', 'Pick where your magic comes from, like a dragon ancestor or wild magic.')]),
  CL('Warlock', 'A spellcaster who made a pact with a powerful being.', 8, ['WIS', 'CHA'], 2,
    ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'], ['simple'], 'CHA',
    [T('Otherworldly Patron', 'Pick your patron, like an archfey or a fiend.'), T('Pact Magic', 'You cast warlock spells using Charisma. Your spell slots come back on a short rest.')]),
  CL('Wizard', 'A scholar of magic with a spellbook.', 6, ['INT', 'WIS'], 2,
    ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'], CASTER_KIT, 'INT',
    [T('Spellcasting', 'You cast wizard spells from your spellbook using Intelligence.'), T('Arcane Recovery', 'Once a day after a short rest, get back some spent spell slots.')]),
];

const base = (kind, e) => ({
  id: `${kind}-${slug(e.name)}`, kind, image: '', source: 'Official', visible: false,
  skills: [], weapons: [], traits: [], summary: '', ...e,
});

export function seedEntries() {
  return [
    ...RACES.map((e) => base('race', e)),
    ...BACKGROUNDS.map((e) => base('background', e)),
    ...CLASSES.map((e) => base('class', e)),
  ];
}

export function demoSeed() {
  // In demo mode everything starts visible so players can try it.
  return seedEntries().map((e) => ({ ...e, visible: true }));
}

export const newId = (kind) => `${kind}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
