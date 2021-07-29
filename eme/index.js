'use strict';

/**
 * @type {!Array<string>}
 */
const SYSTEMS = [
  'org.w3.clearkey',
  'com.widevine.alpha',
  'com.microsoft.playready.recommendation',
  'com.microsoft.playready',
  'com.microsoft.playready.hardware',
  'com.apple.fps.3_0',
  'com.apple.fps.2_0',
  'com.apple.fps.1_0',
  'com.apple.fps',
];


/**
 * @param {string} systemName
 * @param {boolean=} hwProtection
 * @returns {string}
 */
const getRobustness = (systemName, hwProtection = false) => {
  let robustness = '';

  if (systemName == 'com.microsoft.playready.recommendation') {
    robustness = hwProtection ? '3000' : '2000';
  } else if (systemName == 'com.widevine.alpha') {
    robustness = hwProtection ? 'HW_SECURE_DECODE' : 'SW_SECURE_DECODE';
  }

  return robustness;
};


/**
 * @returns {!Promise}
 */
const probeSupport = async () => {
  const requests = [];
  for (let i = 0; i < SYSTEMS.length; ++i) {
    const keySystem = document.getElementById(`keysystem${i}`).value;
    console.log(keySystem);
    const audioCaps = document.getElementById(`audiocaps${i}`).value;
    const videoCaps = document.getElementById(`videocaps${i}`).value;
    const robustness = document.getElementById(`robustness${i}`).value;
    const persistent = document.getElementById(`persistent${i}`).checked;
    const request = navigator.requestMediaKeySystemAccess(keySystem, [{
      initDataTypes: ['cenc'],
      persistentState: persistent ? 'required' : 'optional',
      sessionTypes: [persistent ? 'persistent-license' : 'temporary'],
      videoCapabilities: [{
        contentType: videoCaps,
        robustness,
      }],
      audioCapabilities: [{
        contentType: audioCaps,
        robustness: '',
      }],
    }]);
    requests.push(request);
  }

  const results = await Promise.allSettled(requests);
  results.forEach((result, i) => {
    const resUi = document.getElementById(`result${i}`);
    if (result.status == 'fulfilled') {
      resUi.value = 'PASSED';
      resUi.className = 'pass';
    } else {
      resUi.value = 'FAILED';
      resUi.className = 'fail';
    }
  });
};

/**
 * @returns {void}
 */
const clearResults = () => {
  for (let i = 0; i < SYSTEMS.length; ++i) {
    const result = document.getElementById(`result${i}`);
    result.value = '';
    result.className = '';
  }
};


/**
 * @param {!Element} row
 * @param {string} id
 * @param {string|boolean} value
 * @param {boolean=} disabled
 * @returns {void}
 */
 const addCol = (row, id, value, disabled = false) => {
  const input = document.createElement('input');
  input.id = id;
  if (typeof value == 'string') {
    input.type = 'text';
    input.value = value;
  } else if (typeof value == 'boolean') {
    input.type = 'checkbox';
    input.checked = value;
  }
  input.disabled = disabled;

  const col = document.createElement('td');
  col.appendChild(input);
  row.appendChild(col);
};


window.addEventListener('load', () => {
  const table = document.getElementById('keyTable');
  SYSTEMS.forEach((keySystem, i) => {
    const row = document.createElement('tr');
    addCol(row, `keysystem${i}`, keySystem);
    addCol(row, `audiocaps${i}`, 'audio/mp4; codecs="mp4a.40.2"');
    addCol(row, `videocaps${i}`, 'video/mp4; codecs="avc1.42E01E"');
    addCol(row, `robustness${i}`, getRobustness(keySystem));
    addCol(row, `persistent${i}`, false);
    addCol(row, `result${i}`, '', true);
    table.appendChild(row);
  });
});
