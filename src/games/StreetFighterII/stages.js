// Stage backgrounds for Street Fighter II mini-game
// Each stage has: name, image (relative path in /public/sf2-backgrounds), music (relative path in /public/sf2-sounds)

const STAGES = [
  {
    name: 'Japan',
    image: '/sf2-backgrounds/japan.png',
    music: '/sf2-sounds/bgm_japan.mp3'
  },
  {
    name: 'USA',
    image: '/sf2-backgrounds/usa.png',
    music: '/sf2-sounds/bgm_usa.mp3'
  },
  {
    name: 'China',
    image: '/sf2-backgrounds/china.png',
    music: '/sf2-sounds/bgm_china.mp3'
  },
  {
    name: 'Brazil',
    image: '/sf2-backgrounds/brazil.png',
    music: '/sf2-sounds/bgm_brazil.mp3'
  }
];

export default STAGES;
