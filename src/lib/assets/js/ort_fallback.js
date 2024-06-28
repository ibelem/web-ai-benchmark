// import * as ort from 'onnxruntime-web';
import { models, ortDists } from '$lib/config';
import { updateTestQueueStatus, addResult, updateInfo, loadScript, removeElement, getHfUrlById, getAwsUrlById, getLocalUrlById } from '../js/utils';
import { ortWebVersionStore, fallbackQueueStore, testQueueStore, testQueueLengthStore, resultsStore, numberOfRunsStore, modelDownloadUrlStore } from '../../store/store';
import { sleep, updateFallbackLog, addFallback } from '$lib/assets/js/utils';
import { getModelOPFS } from '$lib/assets/js/nn_utils'
import { dataTypeToArrayConstructor } from '$lib/assets/js/data_type';
import to from 'await-to-js';

let rawConsole = 'Raw console log for WebNN EP developers';

export const getRawConsole = () => {
  return rawConsole;
}

/**
 * @type {string[]}
 */
let fallbackQueue;
fallbackQueueStore.subscribe((value) => {
  fallbackQueue = value;
});

if (console.everything === undefined) {
  console.everything = [];

  console.defaultLog = console.log.bind(console);
  console.log = function () {
    console.everything.push({ "type": "log", "datetime": Date().toLocaleString(), "value": Array.from(arguments) });
    console.defaultLog.apply(console, arguments);
  }
  console.defaultError = console.error.bind(console);
  console.error = function () {
    console.everything.push({ "type": "error", "datetime": Date().toLocaleString(), "value": Array.from(arguments) });
    console.defaultError.apply(console, arguments);
  }
  console.defaultWarn = console.warn.bind(console);
  console.warn = function () {
    console.everything.push({ "type": "warn", "datetime": Date().toLocaleString(), "value": Array.from(arguments) });
    console.defaultWarn.apply(console, arguments);
  }
  console.defaultDebug = console.debug.bind(console);
  console.debug = function () {
    console.everything.push({ "type": "debug", "datetime": Date().toLocaleString(), "value": Array.from(arguments) });
    console.defaultDebug.apply(console, arguments);
  }
}

/**
 * @type {{ selected?: any; stable?: any; dev?: any; }}
 */
export let ortWebVersion;

ortWebVersionStore.subscribe((value) => {
  ortWebVersion = value;
});

/**
 * @type {number}
 */
export let numOfRuns;

numberOfRunsStore.subscribe((value) => {
  numOfRuns = value;
});

/**
 * @type {number}
 */
export let modelDownloadUrl;

modelDownloadUrlStore.subscribe((value) => {
  modelDownloadUrl = value;
});

/**
 * @type {string[]}
 */
export let testQueue;
testQueueStore.subscribe((value) => {
  testQueue = value;
});

/**
 * @type {number}
 */
export let testQueueLength;

testQueueLengthStore.subscribe((value) => {
  testQueueLength = value;
});

/**
 * @type {string[]}
 */
export let results;
resultsStore.subscribe((value) => {
  results = value;
});

export const clone = (x) => {
  let feed = {};
  for (const [key, value] of Object.entries(x)) {
    let func = dataTypeToArrayConstructor[value.type];
    let arrayType = func.from(value.data);
    feed[key] = new ort.Tensor(
      value.type,
      arrayType.slice(0),
      value.dims
    );
  }
  return feed;
}

const l = (i) => {
  console.log(i);
}

const getFreeDimensionOverridesById = (id) => {
  for (let i = 0; i < models.length; i++) {
    if (models[i].id === id) {
      let fdo = {};
      for (let input of models[i].inputs) {
        for (let key in input) {
          let value = input[key];
          let ob = value[3];
          if (Object.keys(ob).length !== 0) {
            Object.keys(ob).forEach(key => {
              if (ob[key].toString().trim()) {
                fdo[key] = ob[key];
              }
            });
          }
        }
      }
      return fdo;
    }
  }
  return null;
}

const getModelUrl = (_model) => {
  let modelPath = getHfUrlById(_model);
  if (modelDownloadUrl === 1) {
    modelPath = getHfUrlById(_model);
  } else if (modelDownloadUrl === 3) {
    modelPath = getAwsUrlById(_model);
  } else if (modelDownloadUrl === 0) {
    modelPath = getLocalUrlById(_model);
  }
  return modelPath;
}

const inputType = {
  0: 'UNDEFINED',
  1: 'FLOAT',
  2: 'UINT8',
  3: 'INT8',
  4: 'UINT16',
  5: 'INT16',
  6: 'INT32',
  7: 'INT64',
  8: 'STRING',
  9: 'BOOL',
  10: 'FLOAT16',
  11: 'DOUBLE',
  12: 'UINT32',
  13: 'UINT64',
  14: 'COMPLEX64',
  15: 'COMPLEX128',
  16: 'BFLOAT16',
  17: 'FLOAT8E4M3FN',
  18: 'FLOAT8E4M3FNUZ',
  19: 'FLOAT8E5M2',
  20: 'FLOAT8E5M2FNUZ'
};


let obj = {
  "name": '',
  "backend": '',
};

const main = async (_id, _model, _modelType, _dataType, _modelSize, _backend) => {

  let backend = 'wasm';
  let numThreads = 1;
  let deviceType = 'cpu';

  switch (_backend) {
    case 'wasm_1':
      backend = 'wasm';
      numThreads = 1;
      deviceType = 'cpu';
      break;
    case 'wasm_4':
      backend = 'wasm';
      numThreads = 4;
      deviceType = 'cpu';
      break;
    case 'webgl':
      backend = 'webgl';
      deviceType = 'gpu';
      break;
    case 'webgpu':
      backend = 'webgpu';
      numThreads = 4;
      deviceType = 'gpu';
      break;
    case 'webnn_cpu_1':
      backend = 'webnn';
      numThreads = 1;
      deviceType = 'cpu';
      break;
    case 'webnn_cpu_4':
      backend = 'webnn';
      numThreads = 4;
      deviceType = 'cpu';
      break;
    case 'webnn_gpu':
      backend = 'webnn';
      numThreads = 4;
      deviceType = 'gpu';
      break;
    case 'webnn_npu':
      backend = 'webnn';
      numThreads = 4;
      deviceType = 'npu';
      break;
    default:
      backend = 'wasm';
      numThreads = 1;
      deviceType = 'cpu';
      break;
  }

  if (_backend === 'cpu') {
    backend = 'webnn';
    numThreads = 4;
    deviceType = 'cpu';
  }

  if (_backend === 'gpu') {
    backend = 'webnn';
    numThreads = 4;
    deviceType = 'gpu';
  }

  const removeTag = () => {
    removeElement('default');
    removeElement('webgpu');
    removeElement('webnn');
  }

  if (ortWebVersion) {
    if (ortWebVersion.selected === 2) {
      if (backend === 'webgpu') {
        removeTag();
        await loadScript('webgpu', ortDists.webgpu.url);
      } else {
        removeTag();
        await loadScript('webnn', ortDists.webnn_webglfix_wasm.url);
      }
    } else if (ortWebVersion.selected === 1) {
      await loadScript('default', `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ortWebVersion.dev}/dist/ort.all.min.js`);
    } else {
      await loadScript('default', `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ortWebVersion.stable}/dist/ort.all.min.js`);
    }
  }
  else {
    if (backend === 'webgpu') {
      removeTag();
      await loadScript('webgpu', ortDists.webgpu.url);
    } else {
      removeTag();
      await loadScript('webnn', ortDists.webnn_webglfix_wasm.url);
    }
  }

  let options = {
    executionProviders: [
      {
        name: backend,
        deviceType: deviceType,
        powerPreference: "default",
        preferredLayout: 'NHWC',
        numThreads: numThreads
      },
    ],
    //executionProviders: [{name: "webnn", deviceType: 'gpu', powerPreference: 'high-performance' }],
  };

  let everything;

  options.logSeverityLevel = 0;
  // options.logVerbosityLevel = 0;

  ort.env.wasm.numThreads = 1;
  ort.env.wasm.simd = true;
  ort.env.wasm.proxy = false;
  let freeDimensionOverrides = getFreeDimensionOverridesById(_model);

  if (freeDimensionOverrides) {
    options.freeDimensionOverrides = freeDimensionOverrides;
  }

  l(`ort.env.wasm.numThreads: ${ort.env.wasm.numThreads}`)
  l(`ort.env.wasm.simd: ${ort.env.wasm.simd}`)
  l(`EP options numThreads: ${numThreads}`)
  l(`ort.env.wasm.proxy: ${ort.env.wasm.proxy}`)

  l(`EP options:`)
  l(options.executionProviders[0])

  l(`options.freeDimensionOverrides:`);
  l(freeDimensionOverrides);

  updateTestQueueStatus(_id, 2);

  let modelPath = getModelUrl(_model);
  updateFallbackLog(`[1] Downloading model from ${modelPath}`);

  updateFallbackLog(`[2] Downloaded ${_model} model`);

  let modelBuffer = await getModelOPFS(_model, modelPath, false);
  if (modelBuffer.byteLength < 1024) {
    modelBuffer = await getModelOPFS(_model, modelPath, true);
  }

  updateFallbackLog(`[3] options.freeDimensionOverrides: ` + JSON.stringify(freeDimensionOverrides));
  updateFallbackLog(`[4] Checking WebNN fallback status of ${_model} on ${_backend} backend, please wait...`);


  let session;
  let er = '';
  try {
    session = await ort.InferenceSession.create(modelBuffer, options);
  } catch (error) {
    obj.name = _model;
    obj.backend = _backend;
    er = error.message;
    // er.push(error.message);
  }

  try {
    await session.release();
  } catch (error2) {
    // er.push(error2.message);
  }

  obj.error = er;
  updateFallbackLog(`[5] Waiting 10 seconds for WebNN EP to generate the full console logs`);

  await sleep(10000);
  everything = console.everything.map(item => item.value[0] + '\r\n');
  rawConsole = everything;

  updateFallbackLog(`[6] Filtering WebNN fallback log messages`);
  let filteredEverything = everything.filter(item => {
    return (
      String(item).includes("Operator type") ||
      String(item).includes("GetCapability") ||
      String(item).includes("is not supported for now")
      // || String(item).includes("Node(s) placed on")
    );
  });

  filteredEverything = filteredEverything.filter(item => !item.includes("is supported by browser"));
  filteredEverything = filteredEverything.filter(item => !item.includes("current supported node group size"));

  // Remove strings before "Operator type: "
  let removeEverything = filteredEverything.map(item => {
    const match = String(item).match(/Operator type: .*/);
    return match ? match[0] : item;
  });

  // Remove strings before "WebNNExecutionProvider::GetCapability,"
  removeEverything = removeEverything.map(item => {
    const match = String(item).match(/WebNNExecutionProvider::GetCapability, .*/);
    return match ? match[0] : item;
  });

  removeEverything = removeEverything.map(item => {
    const match = String(item).match(/HasSupportedInputsImpl], .*/);
    return match ? match[0] : item;
  });

  removeEverything = removeEverything.map(item => {
    let indexOfReshape = item.indexOf("base_op_builder.cc:90");
    return indexOfReshape !== -1 ? item.substring(indexOfReshape) : item;
  });

  removeEverything = removeEverything.map(item => String(item).replace("base_op_builder.cc:90 ", ""));

  removeEverything = removeEverything.map(item => String(item).replace("Operator type: ", ""));

  // Remove "WebNNExecutionProvider::GetCapability, " from each item
  let removedWebNN = removeEverything.map(item => item.replace("WebNNExecutionProvider::GetCapability, ", ""));
  let removedCenter = removedWebNN.map(item => item.replace(/index: \[.*?\] supported: /, 'index: [] supported: '));
  let removeTail = removedCenter.map(item => item.replace('\u001b[m', ''));
  let removeNewTail = removeTail.map(item => item.replace('HasSupportedInputsImpl]', ''));

  // Find the index of the first "number of" item
  let indexOfNumber = removeNewTail.findIndex(item => item.startsWith("number of"));

  if (_backend === 'cpu') {
    // Remove the item starting with "number of" and its preceding items
    if (indexOfNumber !== -1) {
      console.log(indexOfNumber + ': Remove the item starting with "number of" and its preceding items for CPU backend');
      removeNewTail = removeNewTail.slice(indexOfNumber + 1);
    }
  }

  removeNewTail = removeNewTail.flatMap(item => {
    if (item.startsWith("number of")) {
      return item.split("number of").filter(Boolean).map(part => `number of ${part.trim()}`);
    } else {
      return item;
    }
  });

  let modifiedT = removeNewTail.map(item => item.replace(' index: [] supported: ', ''));
  modifiedT = [...new Set(modifiedT)];

  obj.name = _model;
  obj.backend = _backend;

  let supported = [];
  let not_supported = []
  let input_type_not_supported = []

  modifiedT.forEach(item => {
    if (item.startsWith("[") && item.endsWith("][1]")) {
      supported.push(item.substring(1, item.indexOf("][")));
    } else if (item.startsWith("[") && item.endsWith("][0]")) {
      not_supported.push(item.substring(1, item.indexOf("][")));
    } else if (item.startsWith("number of partitions supported by WebNN: ")) {
      obj.partitions_supported_by_webnn = parseInt(item.split(": ")[1]);
    } else if (item.startsWith("number of nodes in the graph: ")) {
      obj.nodes_in_the_graph = parseInt(item.split(": ")[1]);
    } else if (item.startsWith("number of nodes supported by WebNN: ")) {
      obj.nodes_supported_by_webnn = parseInt(item.split(": ")[1]);
    } else if (item.endsWith("is not supported for now")) {
      let op = item.split("Input type: ")[0].trim().replace('[', '').replace(']', '');
      let datatypeCode = item.split("Input type: ")[1].replace('is not supported for now', '').trim().replace('[', '').replace(']', '')
      let dataType = inputType[parseInt(datatypeCode)];
      input_type_not_supported.push(`${op}: ${dataType}`);
    }
  });

  if (supported.length > 0) {
    obj.supported = supported.sort();
  }

  if (not_supported.length > 0) {
    obj.not_supported = not_supported.sort();
  }

  if (input_type_not_supported.length > 0) {
    obj.input_type_not_supported = input_type_not_supported.sort();
  }

  if (typeof obj === 'object' && 'name' in obj && 'backend' in obj) {
    addFallback(obj);
    let filteredFallbackQueue = fallbackQueue.filter(
      (item) => item !== `${obj.name}__${obj.backend}`
    );
    fallbackQueueStore.update(() => filteredFallbackQueue);
    if (fallbackQueue.length > 0) {
      location.href = location.origin + `/fallback?${fallbackQueue[0]}`;
    }
  }
  else if (typeof obj === 'object') {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object') {
        rawConsole = rawConsole + `<div>${JSON.stringify(obj[i])}</div>`;
      } else {
        rawConsole = rawConsole + `<div>${obj[i]}</div>`;
      }
    }
  }
  else {
    rawConsole = rawConsole + obj;
  }

  updateFallbackLog(`[7] WebNN fallback status of ${_model} on ${_backend} backend - Completed`);
  updateFallbackLog('|--------------------------------');
}

export const runOnnx = async (_id, _model, _modelType, _dataType, _modelSize, _backend) => {
  // await main(_id, _model, _modelType, _dataType, _modelSize, _backend);

  // let modelInfo = JSON.stringify(getModelInfoById(_model), null, '');
  // modelInfo = modelInfo.replaceAll(':', ': ');
  // updateInfo(`Model Info: ${modelInfo}`)

  const [err, data] = await to(main(_id, _model, _modelType, _dataType, _modelSize, _backend));
  if (err) {
    addResult(_model, _modelType, _dataType, _modelSize, _backend, 4, null, null, null, [], null, null, null, null, err.message);
    updateInfo(`${testQueueLength - testQueue.length}/${testQueueLength} Error: ${_model} (${_modelType}/${_dataType}) with ${_backend} backend`);
    updateInfo(err.message);
  } else {
    // use data 
  }
}