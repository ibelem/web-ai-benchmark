import { sleepStore, fallbackLogStore, fallbackStore, fallbackQueueStore, conformanceLogStore, conformanceQueueStore, refererStore, modelDownloadUrlStore, autoStore, conformanceStore, infoStore, ortWebVersionStore, numberOfRunsStore, backendsStore, dataTypesStore, modelTypesStore, modelsStore, testQueueStore, testQueueLengthStore, resultsStore, modelDownloadProgressStore } from '../../store/store'
import { models, uniqueBackends, corsSites } from '../../config';
import { runOnnx } from '../js/ort_utils'
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { modelHosts, ortDists } from '$lib/config.js';
import { UAParser } from 'ua-parser-js';
import html2canvas from 'html2canvas';
import to from 'await-to-js';
import { cpuStore } from '$lib/store/store';

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
export let conformanceQueue;
conformanceQueueStore.subscribe((value) => {
  conformanceQueue = value;
});

export const updateConformanceQueue = (models) => {
  conformanceQueueStore.update(() => models);
}

export const clearConformanceQueue = () => {
  conformanceQueueStore.update(() => []);
}

export const addConformance = (value) => {
  conformanceStore.update((arr) => [...arr, value]);
}

export const updateConformance = (value) => {
  conformanceStore.update(() => value);
}

export const clearConformance = () => {
  conformanceStore.update(() => []);
}

/**
 * @type {string[]}
 */
export let conformanceLog;
conformanceLogStore.subscribe((value) => {
  conformanceLog = value;
});

export const updateConformanceLog = (value) => {
  conformanceLogStore.update((arr) => [...arr, value]);
}

export const clearConformanceLog = () => {
  conformanceLogStore.update(() => []);
}

/**
 * @type {string[]}
 */
export let fallback;
fallbackStore.subscribe((value) => {
  fallback = value;
});

/**
 * @type {string[]}
 */
export let fallbackQueue;
fallbackQueueStore.subscribe((value) => {
  fallbackQueue = value;
});

export const updateFallbackQueue = (models) => {
  fallbackQueueStore.update(() => models);
}

export const resetFallbackQueue = () => {
  fallbackQueueStore.update(() => []);
}

export const addFallback = (value) => {
  fallbackStore.update((arr) => [...arr, value]);
}

export const resetFallback = () => {
  fallbackStore.update(() => []);
}

/**
 * @type {string[]}
 */
export let fallbackLog;
fallbackLogStore.subscribe((value) => {
  fallbackLog = value;
});

export const updateFallbackLog = (value) => {
  fallbackLogStore.update((arr) => [...arr, value]);
}

export const resetFallbackLog = () => {
  fallbackLogStore.update(() => []);
}

/**
 * @type {string}
 */
let cpuInfo;
cpuStore.subscribe((value) => {
  cpuInfo = value;
});

export const initResult = (newItem) => {
  resultsStore.update(items => {
    const exists = items.some(item =>
      item.model === newItem.model &&
      item.modeltype === newItem.modeltype &&
      item.datatype === newItem.datatype &&
      item.modelsize === newItem.modelsize
    );
    if (!exists) {
      return [...items, newItem];
    }
    return items;
  });
}

export const maxDiff = async (obj1, obj2) => {
  let diff = [];

  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key) && obj1[key] !== obj2[key]) {
      diff.push(Math.abs(obj1[key] - obj2[key]));
    }
  }

  // Sort the diff array and get the top 3 diff
  diff.sort((a, b) => b - a); // Sort in descending order
  return diff.slice(0, 3);
}

export const compareObjects = async (obj1, obj2, tolerance) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    // console.log(obj1[key]);
    // console.log(obj2[key]);
    // console.log('------');
    // await sleep(10000);

    if (Math.abs(obj1[key] - obj2[key]) > tolerance) {
      return false;
    }
  }

  return true;
}

export const addResult = (model, modeltype, datatype, modelsize, backend, status, compilation, warmup, timetofirstinference, inference, inferencemedian, inferencethroughput, inferenceninety, inferenceaverage, inferencebest, err) => {
  resultsStore.update(items => {
    return items.map(item => {
      if (
        item.model === model &&
        item.modeltype === modeltype &&
        item.datatype === datatype &&
        item.modelsize === modelsize
      ) {
        const updatedItem = { ...item };
        for (const key in updatedItem) {
          if (key !== "id" && key !== "model" && key !== "modeltype" && key !== "datatype" && key !== "modelsize") {
            updatedItem[backend].status = status;
            updatedItem[backend].compilation = compilation;
            updatedItem[backend].warmup = warmup;
            updatedItem[backend].timetofirstinference = timetofirstinference;
            updatedItem[backend].inference = inference;
            updatedItem[backend].inferencebest = inferencebest;
            updatedItem[backend].inferencemedian = inferencemedian;
            updatedItem[backend].inferencethroughput = inferencethroughput;
            updatedItem[backend].inferenceninety = inferenceninety;
            updatedItem[backend].inferenceaverage = inferenceaverage;
            updatedItem[backend].error = err;
          }
        }
        return updatedItem;
      }
      return item;
    });
  });
}

export const resetResult = () => {
  modelDownloadProgressStore.update(() => []);
  resultsStore.update(() => []);
}

export const updateStore = (numOfRuns, backends, dataTypes, modelTypes, models) => {
  numberOfRunsStore.update(() => numOfRuns);
  backendsStore.update(() => backends);
  dataTypesStore.update(() => dataTypes);
  modelTypesStore.update(() => modelTypes);
  modelsStore.update(() => models);
}

export const resetStore = () => {
  autoStore.update(() => false);
  numberOfRunsStore.update(() => 1);
  backendsStore.update(() => []);
  dataTypesStore.update(() => []);
  modelTypesStore.update(() => []);
  modelsStore.update(() => []);
  testQueueStore.update(() => []);
  testQueueLengthStore.update(() => 0);
  resultsStore.update(() => []);
  infoStore.update(() => []);
  modelDownloadProgressStore.update(() => []);
}

/**
 * @type {string[]}
 */
export let referer;
refererStore.subscribe((value) => {
  referer = value;
});

/**
 * @type {string[]}
 */
export let info;
infoStore.subscribe((value) => {
  info = value;
});

const padNumber = (num, fill) => {
  let len = ('' + num).length;
  return Array(fill > len ? fill - len + 1 || 0 : 0).join(0) + num;
};

export const getDateTime = () => {
  let date = new Date(),
    m = padNumber(date.getMonth() + 1, 2),
    d = padNumber(date.getDate(), 2),
    hour = padNumber(date.getHours(), 2),
    min = padNumber(date.getMinutes(), 2),
    sec = padNumber(date.getSeconds(), 2);
  return `${m}/${d} ${hour}:${min}:${sec}`;
};

export const updateInfo = (value) => {
  infoStore.update((arr) => [...arr, getDateTime() + ' ' + value]);
}

export const resetInfo = () => {
  infoStore.update(() => []);
}

/**
 * @type {boolean}
 */
export let auto;
autoStore.subscribe((value) => {
  auto = value;
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
export let ortWebVersion;

ortWebVersionStore.subscribe((value) => {
  ortWebVersion = value;
});

/**
 * @type {string[]}
 */
export let selectedBackends;
backendsStore.subscribe((value) => {
  selectedBackends = value;
});

/**
 * @type {string[]}
 */
export let selectedModelTypes;
modelTypesStore.subscribe((value) => {
  selectedModelTypes = value;
});

/**
 * @type {string[]}
 */
export let selectedDataTypes;
dataTypesStore.subscribe((value) => {
  selectedDataTypes = value;
});

/**
 * @type {string[]}
 */
export let selectedModels;
modelsStore.subscribe((value) => {
  selectedModels = value;
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

export const getHfUrlById = (id) => {
  for (let i = 0; i < models.length; i++) {
    if (models[i].id === id) {
      if(models[i].hf && models[i].hf.model){
        const url = `https://huggingface.co/${models[i].hf.model}/resolve/main/onnx/model${models[i].hf.datatype}.onnx`;
        return url;
      } else {
        return modelHosts.hf + models[i].model;
      }
    }
  }
  return null;
};

export const getAwsUrlById = (id) => {
  for (let i = 0; i < models.length; i++) {
    if (models[i].id === id) {
      return modelHosts.cf + models[i].model;
    }
  }
  return null;
};

export const getLocalUrlById = (id) => {
  for (let i = 0; i < models.length; i++) {
    if (models[i].id === id) {
      if(models[i].hf && models[i].hf.model){
        const url = `${location.origin}/${modelHosts.local}${models[i].hf.model}/onnx/model${models[i].hf.datatype}.onnx`;
        return url;
      } else {
        return location.origin + '/' + modelHosts.local + models[i].model;
      }
    }
  }
  return null;
};

export const getLocalUrlByIdandLocaltion = (id, locationOrigin) => {
  for (let i = 0; i < models.length; i++) {
    if (models[i].id === id) {
      return locationOrigin + '/' + modelHosts.local + models[i].model;
    }
  }
  return null;
};

export const setModelDownloadUrl = async () => {
  let hf = getHfUrlById('model_access_check');
  let cf = getAwsUrlById('model_access_check');
  // let local = getLocalUrlById('model_access_check');

  let isCors = corsSites.some((site) => location.hostname.toLowerCase().indexOf(site) > -1);
  if (isCors) {
    let [err, response] = await to(fetch(hf));
    if (err) {
      modelDownloadUrlStore.update(() => 3);
      updateInfo(`Failed to fetch AI models from huggingface.co`);
      let [err2, response2] = await to(fetch(cf));
      if (err2) {
        updateInfo(`Failed to fetch AI models from Amazon Web Services (AWS)`);
      } else {
        updateInfo(`AI models will be fetched from Amazon Web Services (AWS)`);
      }

      // modelDownloadUrlStore.update(() => 2);
      // updateInfo(`Failed to fetch AI models from huggingface.co`);
      // let [err2, response2] = await to(fetch(hfmirror));
      // if (err2) {
      //   modelDownloadUrlStore.update(() => 3);
      //   updateInfo(`Failed to fetch AI models from mirror of huggingface.co`);
      //   let [err3, response3] = await to(fetch(cf));
      //   if (err3) {
      //     updateInfo(`Failed to fetch AI models from Amazon Web Services (AWS)`);
      //   } else {
      //     updateInfo(`AI models will be fetched from Amazon Web Services (AWS)`);
      //   }
      // } else {
      //   updateInfo(`AI models will be fetched from mirror of huggingface.co`);
      // }
    } else {
      modelDownloadUrlStore.update(() => 1);
      updateInfo(`AI models will be fetched from huggingface.co`);
    }
  } else {
    modelDownloadUrlStore.update(() => 0);
    updateInfo(`AI models will be fetched from localhost`);
  }
};

export const removeStringFromArray = (array, string) => {
  const indexToRemove = array.indexOf(string);
  if (indexToRemove !== -1) {
    array.splice(indexToRemove, 1);
  }
  return array;
}

export const getURLParameterValue = (parameter) => {
  let url = new URL(location.href);
  return url.searchParams.get(parameter);
}

export const trimComma = (string) => {
  if (string && string.startsWith(',')) {
    string = string.slice(1);
  }

  if (string && string.endsWith(',')) {
    string = string.slice(0, -1);
  }

  return string;
}

export const sortFallbackById = (models) => {
  models.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  return models;
}

export const sortModelById = (models) => {
  models.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  return models;
}

export const getModelInputsRawById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.inputs;
}

export const getModelNameById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.name;
}

export const getModelDescriptionById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.description;
}

export const getModelNoteById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.note;
}

export const getModelSizeById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.size;
}

export const getModelTypeById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.format;
}

export const getModelCategoryById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.category;
}

export const getModelDataTypeById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.datatype;
}

export const getModelInputsById = (id) => {
  const model = models.find(item => item.id === id);
  return model?.inputstip;
}

export const getModelHFUrlById = (id) => {
  const model = models.find(item => item.id === id);
  return modelHosts.hf + model?.model;
}

export const getModelInt8Count = (arr) => {
  return arr.filter(item => item.datatype === 'int8').length;
}

export const getUniqueDataTypes = () => {
  let uniqueDataTypes = [];
  for (let model of models) {
    let datatype = model.datatype;
    if (datatype && !uniqueDataTypes.includes(datatype)) {
      uniqueDataTypes.push(datatype);
    }
  }
  return uniqueDataTypes;
}

export const getUniqueDataTypesByModelId = (modelid) => {
  const matchingModels = models.filter(model => model.id === modelid);
  return [...new Set(matchingModels.map(model => model.datatype))];
}

export const getUniqueModelTypesByModelId = (modelid) => {
  const matchingModels = models.filter(model => model.id === modelid);
  return [...new Set(matchingModels.map(model => model.format))];
}

export const getUniqueModels = () => {
  let uniqueModels = [];
  for (let model of models) {
    let id = model.id;
    if (id && !uniqueModels.includes(id)) {
      uniqueModels.push(id);
    }
  }
  return uniqueModels;
}

export const getUniqueModelTypes = () => {
  let uniqueModelTypes = [];
  for (let model of models) {
    let format = model.format;
    if (format && !uniqueModelTypes.includes(format)) {
      uniqueModelTypes.push(format);
    }
  }
  return uniqueModelTypes;
}

let newUrl = '';

export const goTo = (key, value) => {
  let url = new URL(location.href);
  if (key !== undefined) {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.set(key, 'none');
    }
    newUrl = url.toString();
    refererStore.update(() => location.href);
    goto(newUrl);
    // location.href = newUrl;
  }
}

export const filterTestQueue = (id) => {
  let filteredTestQueue = testQueue.filter((testQueue) => testQueue.id !== id);
  testQueueStore.update(() => filteredTestQueue);
}

export const updateTestQueueStatus = (id, status) => {
  testQueueStore.update(items => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, status: status };
      }
      return item;
    });
  });
}

export const updateTestQueue = () => {

  /**
   * @type {string[]}
  */
  let testQueue = [];
  if (selectedModels) {
    let id = 1;
    for (const m of selectedModels) {
      for (const dt of selectedDataTypes) {
        for (const b of selectedBackends) {
          for (const mt of selectedModelTypes) {
            const matchedModels = models.filter(
              (model) => model.id === m && model.format === mt && model.datatype === dt
            );
            if (matchedModels.length > 0) {
              // t = `${mt} ${m} ${dt} ${b}`;
              // testQueue.push(t);
              // Status: 0 Not selected, 1 Not started, 2 In testing, 3 Completed, 4 Fail or Error
              let t = {
                id: id,
                status: 1,
                model: m,
                modeltype: mt,
                datatype: dt,
                backend: b
              }
              testQueue.push(t);
              id++;
            }
          }
        }
      }
    }
    testQueueStore.update(() => testQueue);
    testQueueLengthStore.update(() => testQueue.length)
  }
};

export const stringToArray = (value) => {
  if (value.indexOf(',') > -1) {
    value = value.split(',');
  } else {
    value = [value];
  }
  return value;
};

export const arrayToStringWithComma = (array) => {
  return array.join(',');
}

export const containsAllElementsInArray = (string, array) => {
  return array.every(element => string.includes(element));
}

export const urlToStore = (urlSearchParams, modelIdFromUrl) => {
  if (urlSearchParams.size > 0 && urlSearchParams.size != 1) {
    let modelType = urlSearchParams.get('modeltype');
    let dataType = urlSearchParams.get('datatype');
    let backend = urlSearchParams.get('backend');
    let numOfRuns = urlSearchParams.get('run');
    let model = urlSearchParams.get('model');

    if (modelType.indexOf(',') > -1) {
      modelType = stringToArray(modelType);
    } else if (modelType.toLowerCase() === 'none') {
      modelType = [];
    } else if (modelType.toLowerCase() === 'all') {
      modelType = getUniqueModelTypes();
    } else {
      modelType = [modelType];
    }

    if (dataType.indexOf(',') > -1) {
      dataType = stringToArray(dataType);
    } else if (dataType.toLowerCase() === 'none') {
      dataType = [];
    } else if (dataType.toLowerCase() === 'all') {
      dataType = getUniqueDataTypes();
    } else {
      dataType = [dataType];
    }

    if (backend.indexOf(',') > -1) {
      backend = stringToArray(backend);
    } else if (backend.toLowerCase() === 'none') {
      backend = [];
    } else if (backend.toLowerCase() === 'all') {
      backend = uniqueBackends;
    } else {
      backend = [backend];
    }

    if (model && model.indexOf(',') > -1) {
      model = stringToArray(model);
    } else if (model?.toLowerCase() === 'none') {
      model = [];
    } else if (model?.toLowerCase() === 'all') {
      model = getUniqueModels();
    } else {
      model = [model];
    }

    numOfRuns = parseInt(numOfRuns);

    if (!auto && numOfRuns > 500000 && location.pathname?.indexOf('run') > -1) {
      numOfRuns = 500000;
    } if (!auto && numOfRuns > 0 && numOfRuns <= 500000 && location.pathname?.indexOf('run') > -1) {
      numOfRuns = numOfRuns;
    } else if (numOfRuns < 1) {
      numOfRuns = 1;
    } else if (numOfRuns > 200) {
      numOfRuns = 200;
    }

    if (modelIdFromUrl) {
      updateStore(numOfRuns, backend, dataType, modelType, [modelIdFromUrl]);
    } else {
      updateStore(numOfRuns, backend, dataType, modelType, model);
    }

    // if (!auto) {
    //   updateTestQueue();
    // }

    if (modelType.length === 0 && dataType.length === 0 && backend.length === 0) {
      resetResult();
    }
  }
};

export const sleep = (time) => new Promise(resolve => setTimeout(resolve, time));

export const random = () => {
  return (Math.random() * (1000 - 1) + 1).toFixed(2);
};

export const median = (arr) => {
  const sorted = arr.slice().sort((a, b) => a - b);

  // Check if the array length is even or odd
  const middle = Math.floor(sorted.length / 2.0);

  if (sorted.length % 2 === 0) {
    // If the array length is even, return the average of the two middle values
    return (parseFloat(sorted[middle - 1]) + parseFloat(sorted[middle])) / 2.0;
  } else {
    // If the array length is odd, return the middle value
    return parseFloat(sorted[middle].toFixed(2));
  }
};

export const average = (arr) => {
  const avg = arr.reduce((a, b) => a + b) / arr.length;
  return parseFloat(avg).toFixed(2);
}

export const minimum = (arr) => {
  const minimum = Math.min(...arr);
  return parseFloat(minimum).toFixed(2);
}

export const run = async () => {
  if (
    testQueue[0] && getModelIdfromPath() === testQueue[0].model
  ) {
    let t0 = testQueue[0];
    let r = {
      id: t0.id,
      model: t0.model,
      modeltype: t0.modeltype,
      datatype: t0.datatype,
      modelsize: getModelSizeById(t0.model)
    };
    for (const prop of selectedBackends) {
      r[prop] = {
        status: 1,
        inference: [],
        compilation: null,
        warmup: null,
        timetofirstinference: null,
        inferencebest: null,
        inferencemedian: null,
        inferencethroughput: null,
        inferenceninety: null,
        inferenceaverage: null,
        error: null
      };
    }
    initResult(r);

    if (t0.modeltype === 'onnx') {
      await runOnnx(t0.id, t0.model, t0.modeltype, t0.datatype, getModelSizeById(t0.model), t0.backend);
    }

    filterTestQueue(t0.id);
    run();
  } else if (testQueue[0] && auto) {
    let path = `${base}/run/${testQueue[0].model}`;
    updateInfo(`Go to next page to test ${testQueue[0].model}`);
    await sleep(500);
    // goto(path);
    location.href = path;
  } else if (auto) {
    updateInfo(`[${testQueueLength - testQueue.length}/${testQueueLength}] All tests completed`);
    // goto(referer);
    location.href = referer;
  } else {
    updateInfo(`[${testQueueLength - testQueue.length}/${testQueueLength}] All tests completed`);
  }
};

const saveAs = (uri, filename) => {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}

export const downloadScreenshot = () => {
  html2canvas(document.querySelector('#result')).then((canvas) => {
    saveAs(canvas.toDataURL(), 'inference_time_median.png');
    updateInfo(`Inference time median data screenshot downloaded`);
  });
}

export const copyRawInference = async (value) => {
  value = value.toString().replaceAll(',', ' ');
  updateInfo(`Inference time data copied`);
  await navigator.clipboard.writeText(value);
}

export const copyResults = async () => {
  let json = '';
  for (let r of results) {
    delete r.id;
    for (let key in r) {
      if (r[key].hasOwnProperty("status")) {
        delete r[key].status;
      }
    }
    json = JSON.stringify(r) + '\r\n\r\n' + json;
  }
  json = getEnvironment() + json;
  await navigator.clipboard.writeText(json);
  updateInfo(`Full test data copied`);
}

export const copyInfo = async () => {
  let log = info.toString().replaceAll(',', '\r\n');
  await navigator.clipboard.writeText(log);
  updateInfo(`Log history copied`);
}

export const getGpu = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    let renderer = gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    // .replace('0x00003EA0', '').replace('0x000056A0', '').replace('0x00004680', '')

    if (renderer) {
      renderer = renderer.split(',')[1].replace('vs_5_0', '').replace('ps_5_0', '')
        .replace('(R)', '').replace('(TM)', '')
        .replace(/0x[a-fA-F0-9]+/g, '')
        .replace('()', '').replace(' )', ')')
        .replace('  ', ' ').trim();
      // renderer = renderer
      //   .replace('ANGLE', '')
      //   .replace('SwiftShader driver', '')
      //   .replace('Subzero', '')
      //   .replace('Device', '')
      //   .replace('Mesa DRI', '')
      //   .replace('OpenGL ES', '').replace('OpenGL 4.6', '')
      //   .replace('3.2', '').replace('Open Source Technology Center', '')
      //   .replace('Direct3D11', '').replace('D3D11', '')
      //   .replace('(Intel', '').replace('Microsoft', '')
      //   .replace('(Google', 'Google')
      //   .replace('(TM', '').replaceAll('(', '').replaceAll(')', '')
      //   .trim();
      renderer = renderer
        .replace('DCH', '')
        .replace('-401783', '')
        .replace('gfx-driver-verify-comp_', ' ')
        .replace(' i ', '')
        .replace('  ', ' ')
        .trim();
      if (renderer.toLowerCase().indexOf('adreno') > -1) {
        renderer = 'Qualcomm ' + renderer;
      }
      return renderer
    }
  }
}

const getEnvironment = () => {
  let parser = UAParser(navigator.userAgent);

  let cpu = '';
  if (cpuInfo) {
    cpu = 'CPU: ' + cpuInfo + ' ' + navigator.hardwareConcurrency + ' Logical Cores\r\n';
  } else if (parser.cpu.architecture) {
    cpu = 'CPU: ' + parser.cpu.architecture.replace('amd64', 'x86-64') + ' ' + navigator.hardwareConcurrency + ' Logical Cores\r\n';
  } else {
    cpu = 'CPU: ' + navigator.hardwareConcurrency + ' Logical Cores\r\n';
  }
  let gpu = 'GPU: ' + getGpu() + '\r\n';
  let os = 'OS: ' + parser.os.name + ' ' + parser.os.version + '\r\n';
  let webbrowser = 'Browser: ' + parser.browser.name + ' ' + parser.browser.version + '\r\n';
  let onnxruntimeweb = `ONNX Runtime Web: [Wasm] ${ortDists.public.version}, [WebGPU] ${ortDists.webgpu.version}, [WebNN] ${ortDists.webnn_webglfix_wasm.version}\r\n\r\n`;
  return cpu + gpu + os + webbrowser + onnxruntimeweb;
}

export const getModelIdfromPath = () => {
  let path = location.pathname;
  path = path.replace('/web-ai-benchmark/run/', '').replaceAll('/run/', '').replaceAll('/', '').trim().toLowerCase();
  return path;
}

export const loadScript = async (id, url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = resolve;
    script.onerror = reject;
    script.id = id;
    script.src = url;
    if (url.startsWith('http')) {
      script.crossOrigin = 'anonymous';
    }
    document.body.append(script);
  })
}

export const removeElement = async (id) => {
  let el = document.querySelector(`#${id}`);
  if (el) {
    el.parentNode.removeChild(el);
  }
}