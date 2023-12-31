// import * as ort from 'onnxruntime-web';
import { models, ortDists } from '$lib/config';
import { compareObjects, maxDiff, addConformance, updateConformanceLog, loadScript, removeElement, getHfUrlById, getAwsUrlById, getLocalUrlById, getHfMirrorUrlById, clearConformance } from './utils';
import { sleepStore, modelDownloadUrlStore, conformanceStore } from '../../store/store';
import { getGpu, getModelHFUrlById, getModelCategoryById, getModelDescriptionById, getModelInputsRawById, getModelNameById, getModelSizeById } from '$lib/assets/js/utils';
import { getModelOPFS } from '$lib/assets/js/nn_utils'
import { dataTypeToArrayConstructor, uint16ArrayToFloat32Array, isDict, bigInt64ArrayToFloat32Array, bigInt64ArrayToString } from '$lib/assets/js/data_type';
import to from 'await-to-js';
// import localforage from 'localforage';

/**
 * @type {string[]}
 */
export let conformance;
conformanceStore.subscribe((value) => {
  conformance = value;
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
  for (let input of inputs) {
    if (isDict(input)) {
      for (let key in input) {
        let value = input[key];
        feeds[key] = getTensor(value[0], value[1], value[2]);
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
  } else if (modelDownloadUrl === 2) {
    modelPath = getHfMirrorUrlById(_model);
  } else if (modelDownloadUrl === 3) {
    modelPath = getAwsUrlById(_model);
  } else if (modelDownloadUrl === 0) {
    modelPath = getLocalUrlById(_model);
  }
  return modelPath;
}

let res = {
  "name": "",
  "gpu": "",
  "wasm_4": {
    "e3": "",
    "e4": "",
    "e5": "",
    "e6": "",
    "e7": "",
    "e8": "",
    "error": ""
  },
  "webnn_cpu_4": {
    "e3": "",
    "e4": "",
    "e5": "",
    "e6": "",
    "e7": "",
    "e8": "",
    "error": "",
    "max_diff": []
  },
  "webgl": {
    "e3": "",
    "e4": "",
    "e5": "",
    "e6": "",
    "e7": "",
    "e8": "",
    "error": "",
    "max_diff": []
  },
  "webgpu": {
    "e3": "",
    "e4": "",
    "e5": "",
    "e6": "",
    "e7": "",
    "e8": "",
    "error": "",
    "max_diff": []
  },
  "webnn_gpu": {
    "e3": "",
    "e4": "",
    "e5": "",
    "e6": "",
    "e7": "",
    "e8": "",
    "error": "",
    "max_diff": []
  }
};

export let wasmResult = '';
export let compareResult = '';
export let webglResult = '';
export let webgpuResult = '';
export let webnncpu4Result = '';
export let webnngpuResult = '';
export let webnnnpuResult = '';
export let currentBackend = '';



const mainConformance = async (_model, _modelType, _dataType, _backend) => {

  let backend = 'wasm';
  let wasmSimd = false;
  let numThreads = 1;
  let deviceType = 'cpu';

  switch (_backend) {
    case 'wasm_1':
      backend = 'wasm';
      wasmSimd = true;
      numThreads = 1;
      deviceType = 'cpu';
      break;
    case 'wasm_4':
      backend = 'wasm';
      wasmSimd = true;
      numThreads = 4;
      deviceType = 'cpu';
      break;
    case 'webgl':
      backend = 'webgl';
      deviceType = 'gpu';
      break;
    case 'webgpu':
      backend = 'webgpu';
      wasmSimd = true;
      numThreads = 4;
      deviceType = 'gpu';
      break;
    case 'webnn_cpu_1':
      backend = 'webnn';
      wasmSimd = true;
      numThreads = 1;
      deviceType = 'cpu';
      break;
    case 'webnn_cpu_4':
      backend = 'webnn';
      wasmSimd = true;
      numThreads = 4;
      deviceType = 'cpu';
      break;
    case 'webnn_gpu':
      backend = 'webnn';
      wasmSimd = true;
      numThreads = 4;
      deviceType = 'gpu';
      break;
    case 'webnn_npu':
      backend = 'webnn';
      wasmSimd = true;
      numThreads = 1;
      deviceType = 'npu';
      break;
    default:
      backend = 'wasm';
      wasmSimd = true;
      numThreads = 1;
      deviceType = 'cpu';
      break;
  }

  if (backend === 'webgpu') {
    removeElement('default');
    removeElement('webnn');
    await loadScript('webgpu', ortDists.webgpu.url);
  } else if (backend === 'webnn' || backend === 'webgl') {
    removeElement('webgpu');
    removeElement('default');
    await loadScript('webnn', ortDists.webnn_webglfix.url);
  } else {
    removeElement('webnn');
    removeElement('webgpu');
    await loadScript('default', ortDists.public.url);
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

  if (backend === 'wasm' || backend === 'webgpu') {
    ort.env.wasm.numThreads = numThreads;
    ort.env.wasm.simd = wasmSimd;
  } else {
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = wasmSimd;
  }

  (backend === 'webnn' || _backend === 'wasm_4') ? ort.env.wasm.proxy = true : ort.env.wasm.proxy = false;

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
    results = await sess.run(input);
  } else {
    results = await sess.run(feeds);
  }

  console.log(`---- ${_backend} ----`);

  let result = results[sess.outputNames[0]]["data"];

  if (_backend === 'wasm_4') {
    wasmResult = result;
  } else {
    compareResult = result;
  }

  if (_backend === 'wasm_4') {
    wasmResult = result;
    console.log(wasmResult);
  } else if (_backend === 'webgl') {
    webglResult = result;
    console.log(webglResult);
  } else if (_backend === 'webgpu') {
    webgpuResult = result;
    console.log(webgpuResult);
  } else if (_backend === 'webnn_cpu_4') {
    webnncpu4Result = result;
    console.log(webnncpu4Result);
  } else if (_backend === 'webnn_gpu') {
    webnngpuResult = result;
    console.log(webnngpuResult);
  } else if (_backend === 'webnn_npu') {
    webnnnpuResult = result;
    console.log(webnnnpuResult);
  }

  currentBackend = _backend;

  // result = result.subarray(0, 100);

  // wasmResult = bigInt64ArrayToString(wasmResult);
  // compareResult = bigInt64ArrayToString(compareResult);
  // webglResult = bigInt64ArrayToString(webglResult);
  // webgpuResult = bigInt64ArrayToString(webgpuResult);
  // webnncpu4Result = bigInt64ArrayToString(webnncpu4Result);
  // webnngpuResult = bigInt64ArrayToString(webnngpuResult);
  // webnnnpuResult = bigInt64ArrayToString(webnnnpuResult);

  if (wasmResult && (wasmResult instanceof BigInt64Array)) {
    wasmResult = bigInt64ArrayToFloat32Array(wasmResult);
  }

  if (compareResult && (compareResult instanceof BigInt64Array)) {
    compareResult = bigInt64ArrayToFloat32Array(compareResult);
  }

  if (webglResult && (webglResult instanceof BigInt64Array)) {
    webglResult = bigInt64ArrayToFloat32Array(webglResult);
  }

  if (webgpuResult && (webgpuResult instanceof BigInt64Array)) {
    webgpuResult = bigInt64ArrayToFloat32Array(webgpuResult);
  }

  if (webnncpu4Result && (webnncpu4Result instanceof BigInt64Array)) {
    webnncpu4Result = bigInt64ArrayToFloat32Array(webnncpu4Result);
  }

  if (webnngpuResult && (webnngpuResult instanceof BigInt64Array)) {
    webnngpuResult = bigInt64ArrayToFloat32Array(webnngpuResult);
  }

  if (webnnnpuResult && (webnnnpuResult instanceof BigInt64Array)) {
    webnnnpuResult = bigInt64ArrayToFloat32Array(webnnnpuResult);
  }

  if (wasmResult && (wasmResult instanceof Uint16Array)) {
    wasmResult = uint16ArrayToFloat32Array(wasmResult);
  }

  if (compareResult && (compareResult instanceof Uint16Array)) {
    compareResult = uint16ArrayToFloat32Array(compareResult);
  }

  if (webglResult && (webglResult instanceof Uint16Array)) {
    webglResult = uint16ArrayToFloat32Array(webglResult);
  }

  if (webgpuResult && (webgpuResult instanceof Uint16Array)) {
    webgpuResult = uint16ArrayToFloat32Array(webgpuResult);
  }

  if (webnncpu4Result && (webnncpu4Result instanceof Uint16Array)) {
    webnncpu4Result = uint16ArrayToFloat32Array(webnncpu4Result);
  }

  if (webnngpuResult && (webnngpuResult instanceof Uint16Array)) {
    webnngpuResult = uint16ArrayToFloat32Array(webnngpuResult);
  }

  if (webnnnpuResult && (webnnnpuResult instanceof Uint16Array)) {
    webnnnpuResult = uint16ArrayToFloat32Array(webnnnpuResult);
  }


  // updateConformanceLog(compareResult);
  updateConformanceLog(`[6] You can copy raw inference results in Console of Developer Tool`);
  await sess.release();

  if (_backend === "wasm_4") {
    res['wasm_4'].e3 = '1e-3';
    res['wasm_4'].e4 = '1e-4';
    res['wasm_4'].e5 = '1e-5';
    res['wasm_4'].e6 = '1e-6';
    res['wasm_4'].e7 = '1e-7';
    res['wasm_4'].e8 = '1e-8';
    updateConformanceLog(`[7] Using ${_backend} results as the baseline`);
  } else {
    let r = '';
    await compareObjects(compareResult, wasmResult, 1e-3) ? r = 'pass' : r = 'fail';
    res[_backend].e3 = r;
    updateConformanceLog(`[7.1] Conformance [1e-3] on ${_backend}: ${r}`);

    await compareObjects(compareResult, wasmResult, 1e-4) ? r = 'pass' : r = 'fail';
    res[_backend].e4 = r;
    updateConformanceLog(`[7.2] Conformance [1e-4] on ${_backend}: ${r}`);

    await compareObjects(compareResult, wasmResult, 1e-5) ? r = 'pass' : r = 'fail';
    res[_backend].e5 = r;
    updateConformanceLog(`[7.3] Conformance [1e-5] on ${_backend}: ${r}`);

    await compareObjects(compareResult, wasmResult, 1e-6) ? r = 'pass' : r = 'fail';
    res[_backend].e6 = r;
    updateConformanceLog(`[7.4] Conformance [1e-6] on ${_backend}: ${r}`);

    await compareObjects(compareResult, wasmResult, 1e-7) ? r = 'pass' : r = 'fail';
    res[_backend].e7 = r;
    updateConformanceLog(`[7.5] Conformance [1e-7] on ${_backend}: ${r}`);

    await compareObjects(compareResult, wasmResult, 1e-8) ? r = 'pass' : r = 'fail';
    res[_backend].e8 = r;
    updateConformanceLog(`[7.6] Conformance [1e-8] on ${_backend}: ${r}`);

    res[_backend].max_diff = await maxDiff(compareResult, wasmResult);
    updateConformanceLog(`[7.7] Conformance maximum difference (3) on ${_backend}: ${res[_backend].max_diff}`);

  }

  // if (sleeping) {
  //   await sleep(10000);
  // }

  updateConformanceLog(`[8] Conformance test of ${_model} (${_modelType} /${_dataType}) with ${_backend} backend on ${getGpu()} completed`);
  updateConformanceLog('|-------------------------------------------------------------------------------------|');

  // updateConformance(res);
}

export const runOnnxConformance = async (_model, _modelType, _dataType) => {
  let backends = ['wasm_4', 'webnn_cpu_4', 'webgl', 'webgpu', 'webnn_gpu'];

  wasmResult = '';
  webglResult = '';
  webgpuResult = '';
  webnncpu4Result = '';
  webnngpuResult = '';
  webnnnpuResult = '';
  compareResult = '';
  currentBackend = '';

  res.name = _model;
  res.gpu = getGpu();
  // updateConformance(res);

  updateConformanceLog(`[0] Model ID: ${_model} / Name: ${getModelNameById(_model)} / Size: ${getModelSizeById(_model)} / Category: ${getModelCategoryById(_model)}`);
  updateConformanceLog(`[0] Description: ${getModelDescriptionById(_model)}`);
  let inputs = JSON.stringify(bigInt64ArrayToString(getModelInputsRawById(_model)), null, '');
  updateConformanceLog(`[0] Inputs: ${inputs}`);
  updateConformanceLog(`[0] Netron: https://ibelem.github.io/netron/?url=${getModelHFUrlById(_model)}`);

  for (let _backend of backends) {
    // mainConformance(_model, _modelType, _dataType, _backend);
    const [err, data] = await to(mainConformance(_model, _modelType, _dataType, _backend));
    if (err) {
      updateConformanceLog(`[Error] ${_model} (${_modelType}/${_dataType}) with ${_backend} backend`);
      updateConformanceLog(`[Error] ${err.message}`);
      if (_backend !== "wasm_4") {
        res[_backend].e3 = 'n/a';
        res[_backend].e4 = 'n/a';
        res[_backend].e5 = 'n/a';
        res[_backend].e6 = 'n/a';
        res[_backend].e7 = 'n/a';
        res[_backend].e8 = 'n/a';
        res[_backend].error = err.message;
      } else {
        res['wasm_4'].e3 = '1e-3';
        res['wasm_4'].e4 = '1e-4';
        res['wasm_4'].e5 = '1e-5';
        res['wasm_4'].e6 = '1e-6';
        res['wasm_4'].e7 = '1e-7';
        res['wasm_4'].e8 = '1e-8';
        res['wasm_4'].error = err.message;
      }

      // updateConformance(res);
    } else {
      // use data 
    }
  }

  addConformance(res);
}