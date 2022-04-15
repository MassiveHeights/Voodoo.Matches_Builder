const SKY_CONFIG = {
  ['default']: 'bg/level_4_bg',
  ['darkBlue']: 'bg/level_4_bg_2',
  ['red']: 'bg/level_4_bg_3',
}

const GROUND_CONFIG = {
  ['TYPE_1']: {
    ground: 'bg/level_4_00',
    platform: 'bg/level_4_02',
    tileSide: 'bg/level_4_04',
    tileBottom: 'bg/level_4_01_tile',
  },
  ['TYPE_2']: {
    ground: 'bg/level_4_00_2',
    platform: 'bg/level_4_2_02',
    tileSide: 'bg/level_4_1_04',
    tileBottom: 'bg/level_4_01_2_tile',
  },
  ['TYPE_3']: {
    ground: 'bg/level_4_00_3',
    platform: 'bg/level_4_3_02',
    tileSide: 'bg/level_4_2_04',
    tileBottom: 'bg/level_4_01_3_tile',
  }
};

export { GROUND_CONFIG, SKY_CONFIG };