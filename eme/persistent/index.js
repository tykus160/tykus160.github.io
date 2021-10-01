'use strict';


const createPersistentSession = async () => {
  const resultArea = document.getElementById('result');
  const keySystem = document.getElementById('keysystem').value;
  try {
    const access = await navigator.requestMediaKeySystemAccess(keySystem, [{
      initDataTypes: ['cenc'],
      videoCapabilities: [{
        contentType: 'video/mp4; codecs="avc1.42E01E"',
        robustness: '',
      }],
      persistentState: 'required',
      sessionTypes: ['persistent-license'],
    }]);
    const keys = await access.createMediaKeys();
    keys.createSession('persistent-license');
    resultArea.value = `${keySystem}: shall support persistent licenses on current platform.`;
    resultArea.className = 'pass';
  } catch (e) {
    console.error(e.message);
    resultArea.value = `${keySystem}: ${e.message}`;
    resultArea.className = 'fail';
  }
};
