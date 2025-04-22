// Character roster for Street Fighter II mini-game
// Each character has: name, color, sprite, specialMoves (array)
// SpecialMove: { name, input (array of keys), effect (function), sound, visual }

const CHARACTERS = [
  {
    name: 'Ryu',
    color: '#3f51b5',
    sprite: '👊',
    specialMoves: [
      {
        name: 'Hadouken',
        input: ['Down', 'Right', 'Attack'],
        sound: 'hadouken.wav',
        visual: 'fireball',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 24) })
      },
      {
        name: 'Shoryuken',
        input: ['Right', 'Down', 'Right', 'Attack'],
        sound: 'shoryuken.wav',
        visual: 'uppercut',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 30) })
      }
    ]
  },
  {
    name: 'Ken',
    color: '#e65100',
    sprite: '✊',
    specialMoves: [
      {
        name: 'Hadouken',
        input: ['Down', 'Right', 'Attack'],
        sound: 'hadouken.wav',
        visual: 'fireball',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 22) })
      },
      {
        name: 'Shoryuken',
        input: ['Right', 'Down', 'Right', 'Attack'],
        sound: 'shoryuken.wav',
        visual: 'uppercut',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 28) })
      }
    ]
  },
  {
    name: 'Chun-Li',
    color: '#1976d2',
    sprite: '🦵',
    specialMoves: [
      {
        name: 'Spinning Bird Kick',
        input: ['Down', 'Left', 'Attack'],
        sound: 'spinningbird.wav',
        visual: 'spin',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 20) })
      }
    ]
  },
  {
    name: 'Guile',
    color: '#aeea00',
    sprite: '💪',
    specialMoves: [
      {
        name: 'Sonic Boom',
        input: ['Left', 'Right', 'Attack'],
        sound: 'sonicboom.wav',
        visual: 'wave',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 22) })
      }
    ]
  },
  {
    name: 'Blanka',
    color: '#388e3c',
    sprite: '🦍',
    specialMoves: [
      {
        name: 'Electric Thunder',
        input: ['Attack', 'Attack', 'Attack'],
        sound: 'electric.wav',
        visual: 'zap',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 18) })
      }
    ]
  },
  {
    name: 'Dhalsim',
    color: '#ff7043',
    sprite: '🧘',
    specialMoves: [
      {
        name: 'Yoga Fire',
        input: ['Down', 'Forward', 'Attack'],
        sound: 'yogafire.wav',
        visual: 'fire',
        effect: (self, opp) => ({ oppHp: Math.max(0, opp.hp - 21) })
      }
    ]
  }
];

export default CHARACTERS;
