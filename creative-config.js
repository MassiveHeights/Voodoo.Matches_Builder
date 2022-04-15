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
    autoRetry: {
      value: true, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle auto retry after defeat.'
    },
    retryButton: {
      value: false, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle retry button visible.'
    },
    retryTimes: {value: 2, type: 'range', min: 1, max: 5, name: 'Retry times'},
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
    hintDelay: {value: 5, type: 'range', min: 1, max: 60, name: 'Delay before showing the tutorial (sec).'},
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
    autoRetry: {
      value: true, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle auto retry after defeat.'
    },
    retryButton: {
      value: true, type: 'select', options: [
        {"name": "Yes", "value": true},
        {"name": "No", "value": false}
      ], name: 'Toggle retry button visible.'
    },
    retryTimes: {value: 2, type: 'range', min: 1, max: 5, name: 'Retry times'},
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
    hintDelay: {value: 5, type: 'range', min: 1, max: 60, name: 'Delay before showing the tutorial (sec).'},
    tapsToWin: {value: 5, type: 'range', min: 1, max: 50, name: 'Taps to win'},
    levelText: { value: 'Level 2', type: 'string', name: 'Level text on progress bar' }
  }
};
