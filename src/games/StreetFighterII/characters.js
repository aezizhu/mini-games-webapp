// Character roster for Street Fighter II mini-game
// Each character has: name, color, sprite, specialMoves (array)
// SpecialMove: { name, input (array of keys), effect (function), sound, visual, sprite }

const CHARACTERS = [
  {
    name: 'Ryu',
    color: '#3f51b5',
    sprite: 'ryu', // Use sprite key for pixel art
    specialMoves: [
      {
        name: 'Hadouken',
        input: ['Down', 'Right', 'Attack'],
        sound: 'hadouken.wav',
        visual: 'fireball',
        sprite: 'fireball',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 24) })
      },
      {
        name: 'Shoryuken',
        input: ['Right', 'Down', 'Right', 'Attack'],
        sound: 'shoryuken.wav',
        visual: 'uppercut',
        sprite: 'shoryuken',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 30) })
      },
      {
        name: 'Tatsumaki', // Hurricane Kick
        input: ['Down', 'Left', 'Attack'],
        sound: 'tatsumaki.wav',
        visual: 'spin',
        sprite: 'tatsumaki',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 18) })
      }
    ]
  },
  {
    name: 'Ken',
    color: '#e65100',
    sprite: 'ken',
    specialMoves: [
      {
        name: 'Hadouken',
        input: ['Down', 'Right', 'Attack'],
        sound: 'hadouken.wav',
        visual: 'fireball',
        sprite: 'fireball',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 22) })
      },
      {
        name: 'Shoryuken',
        input: ['Right', 'Down', 'Right', 'Attack'],
        sound: 'shoryuken.wav',
        visual: 'uppercut',
        sprite: 'shoryuken',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 28) })
      },
      {
        name: 'Tatsumaki',
        input: ['Down', 'Left', 'Attack'],
        sound: 'tatsumaki.wav',
        visual: 'spin',
        sprite: 'tatsumaki',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 19) })
      }
    ]
  },
  {
    name: 'Chun-Li',
    color: '#1976d2',
    sprite: 'chunli',
    specialMoves: [
      {
        name: 'Spinning Bird Kick',
        input: ['Down', 'Left', 'Attack'],
        sound: 'spinningbird.wav',
        visual: 'spin',
        sprite: 'spinningbird',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 20) })
      },
      {
        name: 'Hyakuretsukyaku', // Lightning Kick
        input: ['Attack', 'Attack', 'Attack'],
        sound: 'lightningkick.wav',
        visual: 'kick',
        sprite: 'lightningkick',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 17) })
      }
    ]
  },
  {
    name: 'Guile',
    color: '#aeea00',
    sprite: 'guile',
    specialMoves: [
      {
        name: 'Sonic Boom',
        input: ['Left', 'Right', 'Attack'],
        sound: 'sonicboom.wav',
        visual: 'wave',
        sprite: 'sonicboom',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 22) })
      },
      {
        name: 'Flash Kick',
        input: ['Down', 'Up', 'Attack'],
        sound: 'flashkick.wav',
        visual: 'kick',
        sprite: 'flashkick',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 20) })
      }
    ]
  },
  {
    name: 'Blanka',
    color: '#388e3c',
    sprite: 'blanka',
    specialMoves: [
      {
        name: 'Electric Thunder',
        input: ['Attack', 'Attack', 'Attack'],
        sound: 'electric.wav',
        visual: 'zap',
        sprite: 'electric',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 18) })
      },
      {
        name: 'Rolling Attack',
        input: ['Down', 'Right', 'Attack'],
        sound: 'rolling.wav',
        visual: 'roll',
        sprite: 'rolling',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 21) })
      }
    ]
  },
  {
    name: 'Dhalsim',
    color: '#ff7043',
    sprite: 'dhalsim',
    specialMoves: [
      {
        name: 'Yoga Fire',
        input: ['Down', 'Forward', 'Attack'],
        sound: 'yogafire.wav',
        visual: 'fire',
        sprite: 'yogafire',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 21) })
      },
      {
        name: 'Yoga Flame',
        input: ['Down', 'Back', 'Attack'],
        sound: 'flame.wav',
        visual: 'flame',
        sprite: 'yogaflame',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 23) })
      }
    ]
  }
];

export default CHARACTERS;
