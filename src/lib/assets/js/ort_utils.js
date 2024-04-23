// import * as ort from 'onnxruntime-web';
import { models, ortDists } from '$lib/config';
import { updateTestQueueStatus, addResult, updateInfo, median, loadScript, removeElement, getHfUrlById, getAwsUrlById, getLocalUrlById, getHfMirrorUrlById, average, minimum } from '../js/utils';
import { ortWebVersionStore, testQueueStore, testQueueLengthStore, resultsStore, numberOfRunsStore, modelDownloadUrlStore } from '../../store/store';
import { sleep, } from '$lib/assets/js/utils';
import { getModelOPFS } from '$lib/assets/js/nn_utils'
import { dataTypeToArrayConstructor, isDict } from '$lib/assets/js/data_type';
import to from 'await-to-js';
import percentile from 'percentile';

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
        } else if (modelName.toLowerCase() === 'whisper_base_decoder_static_gelu_fp16_merged') {
          if (v.includes('decoder')) {
            feeds[v] = getTensor('float16', 1, [1, 8, 127, 64]);
          } else if (v.includes('encoder')) {
            feeds[v] = getTensor('float16', 1, [1, 8, 1500, 64]);
          }
        } else if (modelName.toLowerCase() === 'whisper_base_decoder_static_fp16_merged') {
          if (v.includes('decoder')) {
            feeds[v] = getTensor('float16', 1, [1, 8, 127, 64]);
          } else if (v.includes('encoder')) {
            feeds[v] = getTensor('float16', 1, [1, 8, 1500, 64]);
          }
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
      _data = typedArray.from({ length: size }, () => Math.random());
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

  options.logSeverityLevel = 0;
  // options.logVerbosityLevel = 0;

  if (_backend === 'wasm_4') {
    ort.env.wasm.numThreads = numThreads;
  } else {
    ort.env.wasm.numThreads = 1
  }
  ort.env.wasm.simd = true;
  ort.env.wasm.proxy = false;

  // (backend === 'webnn' || _backend === 'wasm_4') ? ort.env.wasm.proxy = true : ort.env.wasm.proxy = false;
  // (_backend === 'wasm_4') ? ort.env.wasm.proxy = true : ort.env.wasm.proxy = false;

  let freeDimensionOverrides = getFreeDimensionOverridesById(_model);

  if (freeDimensionOverrides) {
    options.freeDimensionOverrides = freeDimensionOverrides;
  }

  l(`ort.env.wasm.numThreads: ${ort.env.wasm.numThreads}`)
  l(`ort.env.wasm.simd: ${ort.env.wasm.simd}`)
  l(`ort.env.wasm.proxy: ${ort.env.wasm.proxy}`)

  l(`EP options numThreads: ${numThreads}`)

  l(`EP options:`)
  l(options.executionProviders[0])

  l(`options.freeDimensionOverrides:`);
  l(freeDimensionOverrides);

  updateTestQueueStatus(_id, 2);
  addResult(_model, _modelType, _dataType, _modelSize, _backend, 1, null, null, null, [], null, null, null, null, null);
  addResult(_model, _modelType, _dataType, _modelSize, _backend, 2, null, null, null, [], null, null, null, null, null);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Testing ${_model} (${_modelType}/${_dataType}/${_modelSize}) with ${_backend} backend`);

  let modelPath = getModelUrl(_model);

  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Downloading model from ${modelPath}`);

  let modelBuffer = await getModelOPFS(_model, modelPath, false);
  if (modelBuffer.byteLength < 1024) {
    modelBuffer = await getModelOPFS(_model, modelPath, true);
  }

  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Creating onnx runtime web inference session`);

  const compilationStart = performance.now();
  const sess = await ort.InferenceSession.create(modelBuffer, options);

  let compilationTime = performance.now() - compilationStart;
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Compilation Time: ${compilationTime} ms`);

  let feeds = getFeeds(sess, _model);
  console.log(feeds);

  let numOfWarmups = 1;

  if (backend === 'webgl' || backend === 'webgpu' || (backend === 'webnn' && deviceType === 'gpu')) {
    numOfWarmups = 1;
  }

  let firstInferenceTime = 0, warmupTimes = [], inferenceTimes = [], timeToFirstInference = null, inferenceTimesAverage = null, inferenceTimesMedian = null, inferenceTimesThroughput = null, inferenceTimesNinety = null, inferenceTimesBest = null;

  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inferencing, please wait... `);

  let throughputStart = performance.now();
  for (let i = 0; i < numOfWarmups + numOfRuns; i++) {
    let start;
    start = performance.now();
    await sess.run(feeds);
    let inferenceTime = performance.now() - start;

    if (i === 0) {
      firstInferenceTime = parseFloat(inferenceTime).toFixed(2);
      timeToFirstInference = (parseFloat(compilationTime) + parseFloat(firstInferenceTime)).toFixed(2);
    }

    (i < numOfWarmups) ? warmupTimes.push(inferenceTime) : inferenceTimes.push(inferenceTime);

    // updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inference Time [${i + 1}/${numOfRuns}]: ${inferenceTime} ms`);
  }

  inferenceTimesThroughput = parseFloat(1000.00 / ((performance.now() - throughputStart) / (numOfWarmups + numOfRuns))).toFixed(2) + ' FPS';

  inferenceTimesAverage = average(inferenceTimes);
  inferenceTimesMedian = parseFloat(median(inferenceTimes).toFixed(2));

  inferenceTimesNinety = percentile(90, inferenceTimes);
  inferenceTimesNinety = inferenceTimesNinety.toFixed(2);
  inferenceTimesBest = minimum(inferenceTimes);

  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inference Time on Warmup / ${numOfWarmups} time(s): [${warmupTimes}] ms`);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] First Inference Time: ${firstInferenceTime} ms`);
  await sleep(100);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Time to First Inference: ${timeToFirstInference} ms`);
  await sleep(100);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inference Time (Average): ${inferenceTimesAverage} ms`);
  await sleep(100);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inference Time (Median): ${inferenceTimesMedian} ms`);
  await sleep(100);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inference Time (90th Percentile): ${inferenceTimesNinety} ms`);
  await sleep(100);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inference Time (Best): ${inferenceTimesBest} ms`);
  await sleep(100);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Inference Time (${numOfRuns} times): [${inferenceTimes}] ms`);
  await sleep(100);
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Throughput (${numOfRuns} times): ${inferenceTimesThroughput}`);
  addResult(_model, _modelType, _dataType, _modelSize, _backend, 3, compilationTime, firstInferenceTime, timeToFirstInference, inferenceTimes, inferenceTimesMedian, inferenceTimesThroughput, inferenceTimesNinety, inferenceTimesAverage, inferenceTimesBest, null);

  await sess.release();
  updateInfo(`[${testQueueLength - testQueue.length + 1}/${testQueueLength}] Test ${_model} (${_modelType}/${_dataType}) with ${_backend} backend completed`);
  await sleep(500);
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