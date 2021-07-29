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
 * @type {!Object<string, !Array<string>>}
 */
const ROBUSTNESS = {
  'com.widevine.alpha': [
    'SW_SECURE_CRYPTO',
    'SW_SECURE_DECODE',
    'HW_SECURE_CRYPTO',
    'HW_SECURE_DECODE',
    'HW_SECURE_ALL',
  ],
  'com.microsoft.playready.recommendation': [
    '150',
    '2000',
    '3000',
  ],
};


/**
 * @returns {!Promise}
 */
const probeSupport = async () => {
  const requests = [];
  for (let i = 0; i < SYSTEMS.length; ++i) {
    const keySystem = document.getElementById(`keysystem${i}`).value;
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
 * @param {string|boolean|!Array<string>} value
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
  } else if (Array.isArray(value)) {
    input.type = 'text';
    const dataList = document.createElement('datalist');
    dataList.id = `${id}_datalist`;

    for (const option of value) {
      const dataOption = document.createElement('option');
      dataOption.value = option;
      dataList.appendChild(dataOption);
    }
    document.body.appendChild(dataList);
    input.setAttribute('list', dataList.id);
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
    addCol(row, `robustness${i}`, ROBUSTNESS[keySystem] || '');
    addCol(row, `persistent${i}`, false);
    addCol(row, `result${i}`, '', true);
    table.appendChild(row);
  });
}, { once: true });
