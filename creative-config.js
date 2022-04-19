module.exports.config = {
  projectName: 'Match builder',
  appStoreUrl: 'https://apps.apple.com/app/id1607678114',
  googlePlayStoreUrl: 'https://play.google.com/store',
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
    ground: {
      value: 'TYPE_1', type: 'select', options: [
        {"name": "Type 1", "value": 'TYPE_1'},
        {"name": "Type 2", "value": 'TYPE_2'},
        {"name": "Type 3", "value": 'TYPE_3'}
      ], name: 'Define ground type.'
    },
    skyColor: {
      value: 'default', type: 'select', options: [
        {"name": "Default", "value": 'default'},
        {"name": "Dark blue", "value": 'darkBlue'},
        {"name": "Red", "value": 'red'}
      ], name: 'Define sky type.'
    },
    customSkyImage: {value: "", type: "media", name: "Sky image"},
    customBgMusic: {value: "", type: "media", name: "Background music"},
    hintDelay: {value: 5, type: 'range', min: 1, max: 60, name: 'Delay before showing the tutorial (sec).'},
    tapsToWin: {value: 5, type: 'range', min: 1, max: 50, name: 'Taps to win'},
    levelText: {value: 'Level 1', type: 'text', name: 'Level text on progress bar'}
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
    ground: {
      value: 'TYPE_2', type: 'select', options: [
        {"name": "Type 1", "value": 'TYPE_1'},
        {"name": "Type 2", "value": 'TYPE_2'},
        {"name": "Type 3", "value": 'TYPE_3'}
      ], name: 'Define ground type.'
    },
    skyColor: {
      value: 'red', type: 'select', options: [
        {"name": "Default", "value": 'default'},
        {"name": "Dark blue", "value": 'darkBlue'},
        {"name": "Red", "value": 'red'}
      ], name: 'Define sky type.'
    },
    customSkyImage: {value: "", type: "media", name: "Sky image"},
    customBgMusic: {value: "", type: "media", name: "Background music"},
    hintDelay: {value: 5, type: 'range', min: 1, max: 60, name: 'Delay before showing the tutorial (sec).'},
    tapsToWin: {value: 5, type: 'range', min: 1, max: 50, name: 'Taps to win'},
    levelText: {value: 'Level 2', type: 'text', name: 'Level text on progress bar'}
  }
};
