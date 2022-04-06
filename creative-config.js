module.exports.config = {
  projectName: 'Tape Thrower',
  appStoreUrl: 'https://apps.apple.com/app/tape-thrower/id1574082485',
  googlePlayStoreUrl: 'https://play.google.com/store/apps/details?id=com.borna.tapethrower',
  creative: {
    sounds: {
      value: true, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle sounds enabled.'
    },
    tutorial: {
      value: true, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle tutorial visible.'
    },
    hintDelay: {value: 5, type: 'range', min: 1, max: 60, name: 'Delay before showing the tutorial (sec).'},
    skyColor: {value: "#00A3FF", type: 'color', name: 'Top sky color'},
    tapsToWin: {value: 5, type: 'range', min: 1, max: 50, name: 'Taps to win'},
    levelText: { value: 'Level 1', type: 'string', name: 'Level text on progress bar' }
  },
  endLevel: {
    sounds: {
      value: true, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle sounds enabled.'
    },
    tutorial: {
      value: false, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle tutorial visible.'
    },
    hintDelay: {value: 5, type: 'range', min: 1, max: 60, name: 'Delay before showing the tutorial (sec).'},
    skyColor: {value: "#FF0000", type: 'color', name: 'Top sky color'},
    tapsToWin: {value: 5, type: 'range', min: 1, max: 50, name: 'Taps to win'},
  }
};
