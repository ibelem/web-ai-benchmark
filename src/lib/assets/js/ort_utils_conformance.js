// import * as ort from 'onnxruntime-web';
import { models, ortDists } from '$lib/config';
import { compareObjects, addConformance, updateConformance, updateConformanceLog, loadScript, removeElement, getHfUrlById, getAwsUrlById, getLocalUrlById, clearConformance } from './utils';
import { ortWebVersionStore, sleepStore, modelDownloadUrlStore, conformanceQueueStore, conformanceStore } from '../../store/store';
import { getGpu, sleep, getModelHFUrlById, getModelCategoryById, getModelDescriptionById, getModelInputsRawById, getModelNameById, getModelSizeById } from '$lib/assets/js/utils';
import { getModelOPFS } from '$lib/assets/js/nn_utils'
import { dataTypeToArrayConstructor, isDict, bigInt64ArrayToString } from '$lib/assets/js/data_type';
import to from 'await-to-js';
// import localforage from 'localforage';

/**
 * @type {{ selected?: any; stable?: any; dev?: any; }}
 */
export let ortWebVersion;

ortWebVersionStore.subscribe((value) => {
  ortWebVersion = value;
});

/**
 * @type {string[]}
 */
export let conformance;
conformanceStore.subscribe((value) => {
  conformance = value;
});

/**
 * @type {string[]}
 */
let conformanceQueue;
conformanceQueueStore.subscribe((value) => {
  conformanceQueue = value;
});

/**
 * @type {number}
 */
export let modelDownloadUrl;

modelDownloadUrlStore.subscribe((value) => {
  modelDownloadUrl = value;
});

/**
 * @type {boolean}
 */
export let sleeping;
sleepStore.subscribe((value) => {
  sleeping = value;
});

export const updateSleep = (value) => {
  sleepStore.update(() => value);
}

const getInputsById = (id) => {
  for (const model of models) {
    if (model.id === id) {
      return model.inputs;
    }
  }
  return null;
}

const getFeeds = (session, modelName) => {
  let feeds = {};
  let inputs = getInputsById(modelName);
  let inputNames = session.inputNames;

  for (let input of inputs) {
    if (isDict(input)) {
      for (let key in input) {
        let value = input[key];
        feeds[key] = getTensor(value[0], value[1], value[2]);
      }
    }
  }

  if (modelName.endsWith('_merged') || modelName.endsWith('_with_past')) {
    for (var k in inputNames) {
      const v = inputNames[k];
      if (v.startsWith('past_key_values.')) {
        if (modelName.indexOf('distilbart_cnn_6_6_decoder_') > -1) {
          feeds[v] = getTensor('float32', 1, [1, 16, 168, 64]);
        } else if (modelName.indexOf('distilgpt2_decoder_') > -1) {
          feeds[v] = getTensor('float32', 1, [1, 12, 16, 64]);
        } else if (modelName.indexOf('flan_t5_small_decoder_') > -1) {
          feeds[v] = getTensor('float32', 1, [1, 6, 128, 64]);
        } else if (modelName.indexOf('gpt2_decoder_') > -1) {
          feeds[v] = getTensor('float32', 1, [1, 12, 8, 64]);
        } else if (modelName.indexOf('mt5_small_decoder_') > -1) {
          feeds[v] = getTensor('float32', 1, [1, 6, 128, 64]);
        } else if (modelName.indexOf('t5_small_decoder_') > -1) {
          feeds[v] = getTensor('float32', 1, [1, 8, 128, 64]);
        } else if (modelName.indexOf('vit_gpt2_image_captioning_decoder_') > -1) {
          feeds[v] = getTensor('float32', 1, [1, 12, 168, 64]);
        } else if (modelName.toLowerCase() === 'whisper_base_decoder_static_merged') {
          if (v.includes('decoder')) {
            feeds[v] = getTensor('float32', 1, [1, 8, 127, 64]);
          } else if (v.includes('encoder')) {
            feeds[v] = getTensor('float32', 1, [1, 8, 1500, 64]);
          }
        } else if (modelName.indexOf('whisper_tiny_decoder_') > -1) {
          if (v.includes('decoder')) {
            feeds[v] = getTensor('float32', 1, [1, 6, 128, 64]);
          } else if (v.includes('encoder')) {
            feeds[v] = getTensor('float32', 1, [1, 6, 1500, 64]);
          }
        }
      }
    }
  }

  return feeds;
}

const getTensor = (type, data, dims) => {
  let typedArray;
  if (type === 'bool') {
    return new ort.Tensor(type, [data], [1]);
  } else if (type === 'int8') {
    typedArray = Int8Array;
  } else if (type === 'uint8') {
    typedArray = Uint8Array;
  } else if (type === 'uint16') {
    typedArray = Uint16Array;
  } else if (type === 'float16') {
    typedArray = Uint16Array;
  } else if (type === 'float32') {
    typedArray = Float32Array;
  } else if (type === 'int32') {
    typedArray = Int32Array;
  } else if (type === 'int64') {
    typedArray = BigInt64Array;
  }

  let _data;
  if (Array.isArray(data) || ArrayBuffer.isView(data)) {
    _data = data;
  } else {
    let size = 1;
    dims.forEach((dim) => {
      size *= dim;
    });
    if (data === 'random') {
      // _data = typedArray.from({ length: size }, () => Math.random());
      _data = typedArray.from({ length: size }, () => 0.5446213812076073);
    } else if (data === 'ramp') {
      _data = typedArray.from({ length: size }, (_, i) => i);
    } else {
      _data = typedArray.from({ length: size }, () => data);
    }
  }
  return new ort.Tensor(type, _data, dims);
}

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

export let rawResult = '';

const mainConformance = async (_model, _modelType, _dataType, _backend) => {

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

  // options.logSeverityLevel = 0;
  // options.logVerbosityLevel = 0;

  ort.env.wasm.numThreads = numThreads;
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

  // if (backend === 'webgpu') {
  //   options = { executionProviders: ["webgpu"] };
  // }

  l(`EP options:`)
  l(options.executionProviders[0])

  l(`options.freeDimensionOverrides:`);
  l(freeDimensionOverrides);

  updateConformanceLog(`[1] Testing ${_model} (${_modelType}/${_dataType}) conformance with ${_backend} backend on ${getGpu()}`);

  let modelPath = getModelUrl(_model);

  updateConformanceLog(`[2] Downloading model from ${modelPath}`);

  let modelBuffer = await getModelOPFS(_model, modelPath, false);
  if (modelBuffer.byteLength < 1024) {
    modelBuffer = await getModelOPFS(_model, modelPath, true);
  }

  updateConformanceLog(`[3] Creating onnx runtime web inference session`);
  const sess = await ort.InferenceSession.create(modelBuffer, options);
  updateConformanceLog(`[4] ${_model} compiled`);
  let feeds = getFeeds(sess, _model);

  updateConformanceLog(`[5] Inferencing ... `);

  let results;
  if (backend === 'webnn' || _backend === 'wasm_4') {
    const input = clone(feeds);
    console.log('---- input ----');
    console.log(input);
    results = await sess.run(input);
  } else {
    console.log('---- input ----');
    console.log(feeds);
    results = await sess.run(feeds);
  }

  let result = results[sess.outputNames[0]]["data"];
  let obj = {
    "name": _model,
    "backend": _backend,
    "gpu": getGpu()
  };

  console.log(`---- ${_backend} ----`);
  console.log(result);

  rawResult = result;

  // result = result.subarray(0, 100);

  if (result instanceof BigInt64Array) {
    console.log(`The variable array is a BigInt64Array`)
  }

  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  // updateConformanceLog(JSON.stringify(result));
  updateConformanceLog(`[6] You can copy raw inference results in Console of Developer Tool`);
  if (_backend === "wasm_4") {
    // // await localforage.setItem(_model + "__wasm_4", result);
    obj.result = result;
  }

  await sess.release();

  if (_backend === "wasm_4") {
    obj.e3 = '1e-3';
    obj.e4 = '1e-4';
    obj.e5 = '1e-5';
    obj.e6 = '1e-6';
    obj.e7 = '1e-7';
    obj.e8 = '1e-8';
    updateConformanceLog(`[7] Using ${_backend} results as the baseline`);
  } else {
    if (result instanceof BigInt64Array) {
      for (let c of conformance) {
        if (c.name === _model && c.backend === "wasm_4") {
          let r = '';
          await compareObjects(JSON.stringify(result), c.result, 1e-3) ? r = 'pass' : r = 'fail';
          obj.e3 = r;
          updateConformanceLog(`[7.1] Conformance [1e-3] on ${_backend}: ${r}`);

          await compareObjects(JSON.stringify(result), c.result, 1e-4) ? r = 'pass' : r = 'fail';
          obj.e4 = r;
          updateConformanceLog(`[7.2] Conformance [1e-4] on ${_backend}: ${r}`);

          await compareObjects(JSON.stringify(result), c.result, 1e-5) ? r = 'pass' : r = 'fail';
          obj.e5 = r;
          updateConformanceLog(`[7.3] Conformance [1e-5] on ${_backend}: ${r}`);

          await compareObjects(JSON.stringify(result), c.result, 1e-6) ? r = 'pass' : r = 'fail';
          obj.e6 = r;
          updateConformanceLog(`[7.4] Conformance [1e-6] on ${_backend}: ${r}`);

          await compareObjects(JSON.stringify(result), c.result, 1e-7) ? r = 'pass' : r = 'fail';
          obj.e7 = r;
          updateConformanceLog(`[7.5] Conformance [1e-7] on ${_backend}: ${r}`);

          await compareObjects(JSON.stringify(result), c.result, 1e-8) ? r = 'pass' : r = 'fail';
          obj.e8 = r;
          updateConformanceLog(`[7.6] Conformance [1e-8] on ${_backend}: ${r}`);
        }
      }
    } else {
      for (let c of conformance) {
        if (c.name === _model && c.backend === "wasm_4") {
          let r = '';
          await compareObjects(result, c.result, 1e-3) ? r = 'pass' : r = 'fail';
          obj.e3 = r;
          updateConformanceLog(`[7.1] Conformance [1e-3] on ${_backend}: ${r}`);

          await compareObjects(result, c.result, 1e-4) ? r = 'pass' : r = 'fail';
          obj.e4 = r;
          updateConformanceLog(`[7.2] Conformance [1e-4] on ${_backend}: ${r}`);

          await compareObjects(result, c.result, 1e-5) ? r = 'pass' : r = 'fail';
          obj.e5 = r;
          updateConformanceLog(`[7.3] Conformance [1e-5] on ${_backend}: ${r}`);

          await compareObjects(result, c.result, 1e-6) ? r = 'pass' : r = 'fail';
          obj.e6 = r;
          updateConformanceLog(`[7.4] Conformance [1e-6] on ${_backend}: ${r}`);

          await compareObjects(result, c.result, 1e-7) ? r = 'pass' : r = 'fail';
          obj.e7 = r;
          updateConformanceLog(`[7.5] Conformance [1e-7] on ${_backend}: ${r}`);

          await compareObjects(result, c.result, 1e-8) ? r = 'pass' : r = 'fail';
          obj.e8 = r;
          updateConformanceLog(`[7.6] Conformance [1e-8] on ${_backend}: ${r}`);
        }
      }
    }
  }

  addConformance(obj);

  if (_backend === "webnn_gpu") {
    // clearConformance();
    let obj = conformance.map(obj => {
      const { result, ...rest } = obj;
      return rest;
    });
    updateConformance(obj);
  }

  if (sleeping) {
    await sleep(10000);
  }

  updateConformanceLog(`[8] Conformance test of ${_model} (${_modelType}/${_dataType}) with ${_backend} backend on ${getGpu()} completed`);
  updateConformanceLog('|-------------------------------------------------------------------------------------|');
  next(_model, _backend);
}

const next = (_model, _backend) => {
  let filteredConformanceQueue = conformanceQueue.filter(
    (item) => item !== `${_model}__${_backend}`
  );
  conformanceQueueStore.update(() => filteredConformanceQueue);
  if (conformanceQueue.length > 0) {
    location.href = location.origin + `/conformance?${conformanceQueue[0]}`;
  }
}

export const runOnnxConformance = async (_model, _modelType, _dataType, _backend) => {
  // mainConformance(_model, _modelType, _dataType, _backend);

  updateConformanceLog(`[0] Model ID: ${_model} / Name: ${getModelNameById(_model)} / Size: ${getModelSizeById(_model)} / Category: ${getModelCategoryById(_model)}`);
  updateConformanceLog(`[0] Description: ${getModelDescriptionById(_model)}`);
  let inputs = JSON.stringify(bigInt64ArrayToString(getModelInputsRawById(_model)), null, '');
  updateConformanceLog(`[0] Inputs: ${inputs}`);
  updateConformanceLog(`[0] Netron: https://ibelem.github.io/netron/?url=${getModelHFUrlById(_model)}`);

  const [err, data] = await to(mainConformance(_model, _modelType, _dataType, _backend));
  if (err) {
    updateConformanceLog(`[Error] ${_model} (${_modelType}/${_dataType}) with ${_backend} backend`);
    updateConformanceLog(`[Error] ${err.message}`);
    let obj = {
      "name": _model,
      "backend": _backend,
      "gpu": getGpu(),
      "e3": "n/a",
      "e4": "n/a",
      "e5": "n/a",
      "e6": "n/a",
      "e7": "n/a"
    };
    obj.error = err.message;
    addConformance(obj);

    if (_backend === "webnn_gpu") {
      // clearConformance();
      let obj = conformance.map(obj => {
        const { result, ...rest } = obj;
        return rest;
      });
      updateConformance(obj);
    }

    next(_model, _backend);
  } else {
    // use data 
  }
}