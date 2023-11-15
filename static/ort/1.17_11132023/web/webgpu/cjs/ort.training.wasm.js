/*!
 * ONNX Runtime Web v1.17.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// web/node_modules/onnxruntime-common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, resolveBackend;
var init_backend_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/backend-impl.js"() {
    backends = /* @__PURE__ */ new Map();
    backendsSortedByPriority = [];
    registerBackend = (name, backend, priority) => {
      if (backend && typeof backend.init === "function" && typeof backend.createInferenceSessionHandler === "function") {
        const currentBackend = backends.get(name);
        if (currentBackend === void 0) {
          backends.set(name, { backend, priority });
        } else if (currentBackend.priority > priority) {
          return;
        } else if (currentBackend.priority === priority) {
          if (currentBackend.backend !== backend) {
            throw new Error(`cannot register backend "${name}" using priority ${priority}`);
          }
        }
        if (priority >= 0) {
          const i = backendsSortedByPriority.indexOf(name);
          if (i !== -1) {
            backendsSortedByPriority.splice(i, 1);
          }
          for (let i2 = 0; i2 < backendsSortedByPriority.length; i2++) {
            if (backends.get(backendsSortedByPriority[i2]).priority <= priority) {
              backendsSortedByPriority.splice(i2, 0, name);
              return;
            }
          }
          backendsSortedByPriority.push(name);
        }
        return;
      }
      throw new TypeError("not a valid backend");
    };
    resolveBackend = async (backendHints) => {
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      const errors = [];
      for (const backendName of backendNames) {
        const backendInfo = backends.get(backendName);
        if (backendInfo) {
          if (backendInfo.initialized) {
            return backendInfo.backend;
          } else if (backendInfo.aborted) {
            continue;
          }
          const isInitializing = !!backendInfo.initPromise;
          try {
            if (!isInitializing) {
              backendInfo.initPromise = backendInfo.backend.init();
            }
            await backendInfo.initPromise;
            backendInfo.initialized = true;
            return backendInfo.backend;
          } catch (e) {
            if (!isInitializing) {
              errors.push({ name: backendName, err: e });
            }
            backendInfo.aborted = true;
          } finally {
            delete backendInfo.initPromise;
          }
        }
      }
      throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/backend.js
var init_backend = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/backend.js"() {
    init_backend_impl();
  }
});

// web/node_modules/onnxruntime-common/dist/esm/version.js
var version;
var init_version = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/version.js"() {
    version = "1.17.0";
  }
});

// web/node_modules/onnxruntime-common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/env-impl.js"() {
    init_version();
    logLevelValue = "warning";
    env = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: version },
      set logLevel(value) {
        if (value === void 0) {
          return;
        }
        if (typeof value !== "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(value) === -1) {
          throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
      },
      get logLevel() {
        return logLevelValue;
      }
    };
    Object.defineProperty(env, "logLevel", { enumerable: true });
  }
});

// web/node_modules/onnxruntime-common/dist/esm/env.js
var env2;
var init_env = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/env.js"() {
    init_env_impl();
    env2 = env;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-conversion-impl.js"() {
    tensorToDataURL = (tensor, options) => {
      const canvas = document.createElement("canvas");
      canvas.width = tensor.dims[3];
      canvas.height = tensor.dims[2];
      const pixels2DContext = canvas.getContext("2d");
      if (pixels2DContext != null) {
        let width;
        let height;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
        }
        const inputformat = options?.format !== void 0 ? options.format : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 0];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            const R = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
            const G = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
            const B = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
            const A = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
            pixels2DContext.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
            pixels2DContext.fillRect(j, i, 1, 1);
          }
        }
        return canvas.toDataURL();
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = document.createElement("canvas").getContext("2d");
      let image;
      if (pixels2DContext != null) {
        let width;
        let height;
        let channels;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[1];
          channels = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
          channels = tensor.dims[1];
        }
        const inputformat = options !== void 0 ? options.format !== void 0 ? options.format : "RGB" : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 255];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        if (options !== void 0) {
          if (options.format !== void 0 && (channels === 4 && options.format !== "RGBA") || channels === 3 && (options.format !== "RGB" && options.format !== "BGR")) {
            throw new Error("Tensor format doesn't match input tensor dims");
          }
        }
        const step = 4;
        let rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        image = pixels2DContext.createImageData(width, height);
        for (let i = 0; i < height * width; rImagePointer += step, gImagePointer += step, bImagePointer += step, aImagePointer += step, i++) {
          image.data[rImagePointer] = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
          image.data[gImagePointer] = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
          image.data[bImagePointer] = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
          image.data[aImagePointer] = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
        }
      } else {
        throw new Error("Can not access image data");
      }
      return image;
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-factory-impl.js"() {
    init_tensor_impl();
    bufferToTensor = (buffer, options) => {
      if (buffer === void 0) {
        throw new Error("Image buffer must be defined");
      }
      if (options.height === void 0 || options.width === void 0) {
        throw new Error("Image height and width must be defined");
      }
      if (options.tensorLayout === "NHWC") {
        throw new Error("NHWC Tensor layout is not supported yet");
      }
      const { height, width } = options;
      const norm = options.norm ?? { mean: 255, bias: 0 };
      let normMean;
      let normBias;
      if (typeof norm.mean === "number") {
        normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
      } else {
        normMean = [norm.mean[0], norm.mean[1], norm.mean[2], norm.mean[3] ?? 255];
      }
      if (typeof norm.bias === "number") {
        normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
      } else {
        normBias = [norm.bias[0], norm.bias[1], norm.bias[2], norm.bias[3] ?? 0];
      }
      const inputformat = options.format !== void 0 ? options.format : "RGBA";
      const outputformat = options.tensorFormat !== void 0 ? options.tensorFormat !== void 0 ? options.tensorFormat : "RGB" : "RGB";
      const stride = height * width;
      const float32Data = outputformat === "RGBA" ? new Float32Array(stride * 4) : new Float32Array(stride * 3);
      let step = 4, rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
      let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
      if (inputformat === "RGB") {
        step = 3;
        rImagePointer = 0;
        gImagePointer = 1;
        bImagePointer = 2;
        aImagePointer = -1;
      }
      if (outputformat === "RGBA") {
        aTensorPointer = stride * 3;
      } else if (outputformat === "RBG") {
        rTensorPointer = 0;
        bTensorPointer = stride;
        gTensorPointer = stride * 2;
      } else if (outputformat === "BGR") {
        bTensorPointer = 0;
        gTensorPointer = stride;
        rTensorPointer = stride * 2;
      }
      for (let i = 0; i < stride; i++, rImagePointer += step, bImagePointer += step, gImagePointer += step, aImagePointer += step) {
        float32Data[rTensorPointer++] = (buffer[rImagePointer] + normBias[0]) / normMean[0];
        float32Data[gTensorPointer++] = (buffer[gImagePointer] + normBias[1]) / normMean[1];
        float32Data[bTensorPointer++] = (buffer[bImagePointer] + normBias[2]) / normMean[2];
        if (aTensorPointer !== -1 && aImagePointer !== -1) {
          float32Data[aTensorPointer++] = (buffer[aImagePointer] + normBias[3]) / normMean[3];
        }
      }
      const outputTensor = outputformat === "RGBA" ? new Tensor("float32", float32Data, [1, 4, height, width]) : new Tensor("float32", float32Data, [1, 3, height, width]);
      return outputTensor;
    };
    tensorFromImage = async (image, options) => {
      const isHTMLImageEle = typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement;
      const isImageDataEle = typeof ImageData !== "undefined" && image instanceof ImageData;
      const isImageBitmap = typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
      const isString = typeof image === "string";
      let data;
      let bufferToTensorOptions = options ?? {};
      if (isHTMLImageEle) {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = canvas.getContext("2d");
        if (pixels2DContext != null) {
          let height = image.height;
          let width = image.width;
          if (options !== void 0 && options.resizedHeight !== void 0 && options.resizedWidth !== void 0) {
            height = options.resizedHeight;
            width = options.resizedWidth;
          }
          if (options !== void 0) {
            bufferToTensorOptions = options;
            if (options.tensorFormat !== void 0) {
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            } else {
              bufferToTensorOptions.tensorFormat = "RGBA";
            }
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          } else {
            bufferToTensorOptions.tensorFormat = "RGBA";
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          }
          pixels2DContext.drawImage(image, 0, 0);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isImageDataEle) {
        let height;
        let width;
        if (options !== void 0 && options.resizedWidth !== void 0 && options.resizedHeight !== void 0) {
          height = options.resizedHeight;
          width = options.resizedWidth;
        } else {
          height = image.height;
          width = image.width;
        }
        if (options !== void 0) {
          bufferToTensorOptions = options;
        }
        bufferToTensorOptions.format = "RGBA";
        bufferToTensorOptions.height = height;
        bufferToTensorOptions.width = width;
        if (options !== void 0) {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = tempCanvas.getContext("2d");
          if (pixels2DContext != null) {
            pixels2DContext.putImageData(image, 0, 0);
            data = pixels2DContext.getImageData(0, 0, width, height).data;
          } else {
            throw new Error("Can not access image data");
          }
        } else {
          data = image.data;
        }
      } else if (isImageBitmap) {
        if (options === void 0) {
          throw new Error("Please provide image config with format for Imagebitmap");
        }
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = canvas.getContext("2d");
        if (pixels2DContext != null) {
          const height = image.height;
          const width = image.width;
          pixels2DContext.drawImage(image, 0, 0, width, height);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
          bufferToTensorOptions.height = height;
          bufferToTensorOptions.width = width;
          return bufferToTensor(data, bufferToTensorOptions);
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isString) {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!image || !context) {
            return reject();
          }
          const newImage = new Image();
          newImage.crossOrigin = "Anonymous";
          newImage.src = image;
          newImage.onload = () => {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            bufferToTensorOptions.height = canvas.height;
            bufferToTensorOptions.width = canvas.width;
            resolve(bufferToTensor(img.data, bufferToTensorOptions));
          };
        });
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (data !== void 0) {
        return bufferToTensor(data, bufferToTensorOptions);
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
    };
    tensorFromTexture = (texture, options) => {
      const { width, height, download, dispose } = options;
      const dims = [1, height, width, 4];
      return new Tensor({ location: "texture", type: "float32", texture, dims, download, dispose });
    };
    tensorFromGpuBuffer = (gpuBuffer, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "gpu-buffer", type: dataType ?? "float32", gpuBuffer, dims, download, dispose });
    };
    tensorFromPinnedBuffer = (type, buffer, dims) => new Tensor({ location: "cpu-pinned", type, data: buffer, dims: dims ?? [buffer.length] });
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isBigIntChecked, checkBigInt;
var init_tensor_impl_type_mapping = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-impl-type-mapping.js"() {
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["float16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array]
    ]);
    NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]);
    isBigIntChecked = false;
    checkBigInt = () => {
      if (!isBigIntChecked) {
        isBigIntChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && typeof BigInt64Array.from === "function";
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && typeof BigUint64Array.from === "function";
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-utils-impl.js"() {
    init_tensor_impl();
    calculateSize = (dims) => {
      let size = 1;
      for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== "number" || !Number.isSafeInteger(dim)) {
          throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
          throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
      }
      return size;
    };
    tensorReshape = (tensor, dims) => {
      switch (tensor.location) {
        case "cpu":
          return new Tensor(tensor.type, tensor.data, dims);
        case "cpu-pinned":
          return new Tensor({
            location: "cpu-pinned",
            data: tensor.data,
            type: tensor.type,
            dims
          });
        case "texture":
          return new Tensor({
            location: "texture",
            texture: tensor.texture,
            type: tensor.type,
            dims
          });
        case "gpu-buffer":
          return new Tensor({
            location: "gpu-buffer",
            gpuBuffer: tensor.gpuBuffer,
            type: tensor.type,
            dims
          });
        default:
          throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-impl.js"() {
    init_tensor_conversion_impl();
    init_tensor_factory_impl();
    init_tensor_impl_type_mapping();
    init_tensor_utils_impl();
    Tensor = class {
      /**
       * implementation.
       */
      constructor(arg0, arg1, arg2) {
        checkBigInt();
        let type;
        let dims;
        if (typeof arg0 === "object" && "location" in arg0) {
          this.dataLocation = arg0.location;
          type = arg0.type;
          dims = arg0.dims;
          switch (arg0.location) {
            case "cpu-pinned": {
              const expectedTypedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
              if (!expectedTypedArrayConstructor) {
                throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
              }
              if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
              }
              this.cpuData = arg0.data;
              break;
            }
            case "texture": {
              if (type !== "float32") {
                throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
              }
              this.gpuTextureData = arg0.texture;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "gpu-buffer": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "bool") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        } else {
          let data;
          let maybeDims;
          if (typeof arg0 === "string") {
            type = arg0;
            maybeDims = arg2;
            if (arg0 === "string") {
              if (!Array.isArray(arg1)) {
                throw new TypeError("A string tensor's data must be a string array.");
              }
              data = arg1;
            } else {
              const typedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
              if (typedArrayConstructor === void 0) {
                throw new TypeError(`Unsupported tensor type: ${arg0}.`);
              }
              if (Array.isArray(arg1)) {
                if (arg0 === "float16") {
                  throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
              } else {
                throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
              }
            }
          } else {
            maybeDims = arg1;
            if (Array.isArray(arg0)) {
              if (arg0.length === 0) {
                throw new TypeError("Tensor type cannot be inferred from an empty array.");
              }
              const firstElementType = typeof arg0[0];
              if (firstElementType === "string") {
                type = "string";
                data = arg0;
              } else if (firstElementType === "boolean") {
                type = "bool";
                data = Uint8Array.from(arg0);
              } else {
                throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
              }
            } else {
              const mappedType = NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
              if (mappedType === void 0) {
                throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
              }
              type = mappedType;
              data = arg0;
            }
          }
          if (maybeDims === void 0) {
            maybeDims = [data.length];
          } else if (!Array.isArray(maybeDims)) {
            throw new TypeError("A tensor's dims must be a number array");
          }
          dims = maybeDims;
          this.cpuData = data;
          this.dataLocation = "cpu";
        }
        const size = calculateSize(dims);
        if (this.cpuData && size !== this.cpuData.length) {
          throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
      }
      // #endregion
      // #region factory
      static async fromImage(image, options) {
        return tensorFromImage(image, options);
      }
      static fromTexture(texture, options) {
        return tensorFromTexture(texture, options);
      }
      static fromGpuBuffer(gpuBuffer, options) {
        return tensorFromGpuBuffer(gpuBuffer, options);
      }
      static fromPinnedBuffer(type, buffer, dims) {
        return tensorFromPinnedBuffer(type, buffer, dims);
      }
      // #endregion
      // #region conversions
      toDataURL(options) {
        return tensorToDataURL(this, options);
      }
      toImageData(options) {
        return tensorToImageData(this, options);
      }
      // #endregion
      // #region properties
      get data() {
        this.ensureValid();
        if (!this.cpuData) {
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        }
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
          throw new Error("The data is not stored as a WebGL texture.");
        }
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
          throw new Error("The data is not stored as a WebGPU buffer.");
        }
        return this.gpuBufferData;
      }
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer": {
            if (!this.downloader) {
              throw new Error("The current tensor is not created with a specified data downloader.");
            }
            if (this.isDownloading) {
              throw new Error("The current tensor is being downloaded.");
            }
            try {
              this.isDownloading = true;
              const data = await this.downloader();
              this.downloader = void 0;
              this.dataLocation = "cpu";
              this.cpuData = data;
              if (releaseData && this.disposer) {
                this.disposer();
                this.disposer = void 0;
              }
              return data;
            } finally {
              this.isDownloading = false;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading) {
          throw new Error("The current tensor is being downloaded.");
        }
        if (this.disposer) {
          this.disposer();
          this.disposer = void 0;
        }
        this.cpuData = void 0;
        this.gpuTextureData = void 0;
        this.gpuBufferData = void 0;
        this.downloader = void 0;
        this.isDownloading = void 0;
        this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none") {
          throw new Error("The tensor is disposed.");
        }
      }
      reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        }
        return tensorReshape(this, dims);
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor.js"() {
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/inference-session-impl.js"() {
    init_backend_impl();
    init_tensor();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === "string") {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof Uint8Array) {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && arg0 instanceof SharedArrayBuffer) {
          const buffer = arg0;
          let byteOffset = 0;
          let byteLength = arg0.byteLength;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 === "number") {
            byteOffset = arg1;
            if (!Number.isSafeInteger(byteOffset)) {
              throw new RangeError("'byteOffset' must be an integer.");
            }
            if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
              throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
            }
            byteLength = arg0.byteLength - byteOffset;
            if (typeof arg2 === "number") {
              byteLength = arg2;
              if (!Number.isSafeInteger(byteLength)) {
                throw new RangeError("'byteLength' must be an integer.");
              }
              if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
              }
              if (typeof arg3 === "object" && arg3 !== null) {
                options = arg3;
              } else if (typeof arg3 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'byteLength' must be a number.");
            }
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
          filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        } else {
          throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
        }
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, options);
        return new _InferenceSession(handler);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/inference-session.js"() {
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/onnx-value.js"() {
  }
});

// web/node_modules/onnxruntime-common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/training-session-impl.js"() {
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler) {
        this.handler = handler;
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
      static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || "";
        const optimizerModel = trainingOptions.optimizerModel || "";
        const options = sessionOptions || {};
        const eps = options.executionProviders || [];
        const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
        const backend = await resolveBackend(backendHints);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, options);
          return new _TrainingSession(handler);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        return [fetches, options];
      }
      /**
       * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
       * and changes it into a map of Tensors.
       *
       * @param results
       * @returns
       */
      convertHandlerReturnTypeToMapOfTensors(results) {
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async loadParametersBuffer(_array, _trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async getContiguousParameters(_trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/training-session.js"() {
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/index.js"() {
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_onnx_value();
    init_training_session();
  }
});

// nodejs-ignore:node:os
var cpus;
var init_node_os = __esm({
  "nodejs-ignore:node:os"() {
    cpus = void 0;
  }
});

// nodejs-ignore:node:path
var join;
var init_node_path = __esm({
  "nodejs-ignore:node:path"() {
    join = void 0;
  }
});

// nodejs-ignore:fs
var fs_exports = {};
__export(fs_exports, {
  readFile: () => readFile
});
var readFile;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
  }
});

// nodejs-ignore:path
var path_exports = {};
__export(path_exports, {
  join: () => join2
});
var join2;
var init_path = __esm({
  "nodejs-ignore:path"() {
    join2 = void 0;
  }
});

// web/lib/wasm/binding/ort-training-wasm-simd.js
var require_ort_training_wasm_simd = __commonJS({
  "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module2) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        var d = moduleArg, aa, l;
        d.ready = new Promise((a, b) => {
          aa = a;
          l = b;
        });
        var ba = Object.assign({}, d), m = "./this.program", ca = "object" == typeof window, r = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, w = "", x, y, z;
        if (da) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));
          w = r ? B.dirname(w) + "/" : __dirname + "/";
          x = (a, b) => {
            a = a.startsWith("file://") ? new URL(a) : B.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          z = (a) => {
            a = x(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          y = (a, b, c, e = true) => {
            a = a.startsWith("file://") ? new URL(a) : B.normalize(a);
            fs.readFile(a, e ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(e ? h.buffer : h);
            });
          };
          !d.thisProgram && 1 < process.argv.length && (m = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          d.inspect = () => "[Emscripten Module object]";
        } else if (ca || r)
          r ? w = self.location.href : "undefined" != typeof document && document.currentScript && (w = document.currentScript.src), _scriptDir && (w = _scriptDir), 0 !== w.indexOf("blob:") ? w = w.substr(0, w.replace(/[?#].*/, "").lastIndexOf("/") + 1) : w = "", x = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, r && (z = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), y = (a, b, c) => {
            var e = new XMLHttpRequest();
            e.open("GET", a, true);
            e.responseType = "arraybuffer";
            e.onload = () => {
              200 == e.status || 0 == e.status && e.response ? b(e.response) : c();
            };
            e.onerror = c;
            e.send(null);
          };
        var ea = d.print || console.log.bind(console), C = d.printErr || console.error.bind(console);
        Object.assign(d, ba);
        ba = null;
        d.thisProgram && (m = d.thisProgram);
        var D;
        d.wasmBinary && (D = d.wasmBinary);
        var noExitRuntime = d.noExitRuntime || true;
        "object" != typeof WebAssembly && E("no native wasm support detected");
        var F, G, fa = false, H, I, J, K;
        function ha() {
          var a = F.buffer;
          d.HEAP8 = H = new Int8Array(a);
          d.HEAP16 = new Int16Array(a);
          d.HEAP32 = J = new Int32Array(a);
          d.HEAPU8 = I = new Uint8Array(a);
          d.HEAPU16 = new Uint16Array(a);
          d.HEAPU32 = K = new Uint32Array(a);
          d.HEAPF32 = new Float32Array(a);
          d.HEAPF64 = new Float64Array(a);
        }
        var L, ia = [], ja = [], ka = [];
        function la() {
          var a = d.preRun.shift();
          ia.unshift(a);
        }
        var M = 0, N = null, O = null;
        function E(a) {
          if (d.onAbort)
            d.onAbort(a);
          a = "Aborted(" + a + ")";
          C(a);
          fa = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        function ma(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var P;
        P = "ort-training-wasm-simd.wasm";
        if (!ma(P)) {
          var na = P;
          P = d.locateFile ? d.locateFile(na, w) : w + na;
        }
        function oa(a) {
          if (a == P && D)
            return new Uint8Array(D);
          if (z)
            return z(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function pa(a) {
          if (!D && (ca || r)) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => oa(a));
            if (y)
              return new Promise((b, c) => {
                y(a, (e) => b(new Uint8Array(e)), c);
              });
          }
          return Promise.resolve().then(() => oa(a));
        }
        function qa(a, b, c) {
          return pa(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {
            C("failed to asynchronously prepare wasm: " + e);
            E(e);
          });
        }
        function ra(a, b) {
          var c = P;
          return D || "function" != typeof WebAssembly.instantiateStreaming || ma(c) || c.startsWith("file://") || da || "function" != typeof fetch ? qa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {
            C("wasm streaming compile failed: " + g);
            C("falling back to ArrayBuffer instantiation");
            return qa(c, a, b);
          }));
        }
        var Q, R = (a) => {
          for (; 0 < a.length; )
            a.shift()(d);
        };
        function sa(a) {
          this.Ka = a - 24;
          this.Pa = function(b) {
            K[this.Ka + 4 >> 2 >>> 0] = b;
          };
          this.Oa = function(b) {
            K[this.Ka + 8 >> 2 >>> 0] = b;
          };
          this.Ma = function(b, c) {
            this.Na();
            this.Pa(b);
            this.Oa(c);
          };
          this.Na = function() {
            K[this.Ka + 16 >> 2 >>> 0] = 0;
          };
        }
        var ta = 0, ua = 0, va = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, wa = (a, b, c) => {
          b >>>= 0;
          var e = b + c;
          for (c = b; a[c] && !(c >= e); )
            ++c;
          if (16 < c - b && a.buffer && va)
            return va.decode(a.subarray(b, c));
          for (e = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                e += String.fromCharCode((g & 31) << 6 | h);
              else {
                var k = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              e += String.fromCharCode(g);
          }
          return e;
        }, S = (a, b) => (a >>>= 0) ? wa(I, a, b) : "", T = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var e = a.charCodeAt(c);
            127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, U = (a, b, c, e) => {
          c >>>= 0;
          if (!(0 < e))
            return 0;
          var g = c;
          e = c + e - 1;
          for (var h = 0; h < a.length; ++h) {
            var k = a.charCodeAt(h);
            if (55296 <= k && 57343 >= k) {
              var p = a.charCodeAt(++h);
              k = 65536 + ((k & 1023) << 10) | p & 1023;
            }
            if (127 >= k) {
              if (c >= e)
                break;
              b[c++ >>> 0] = k;
            } else {
              if (2047 >= k) {
                if (c + 1 >= e)
                  break;
                b[c++ >>> 0] = 192 | k >> 6;
              } else {
                if (65535 >= k) {
                  if (c + 2 >= e)
                    break;
                  b[c++ >>> 0] = 224 | k >> 12;
                } else {
                  if (c + 3 >= e)
                    break;
                  b[c++ >>> 0] = 240 | k >> 18;
                  b[c++ >>> 0] = 128 | k >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | k >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | k & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, V = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), xa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ya = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Da = (a) => {
          var b = T(a) + 1, c = za(b);
          c && U(a, I, c, b);
          return c;
        }, W = {}, Fa = () => {
          if (!Ea) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(
              "-",
              "_"
            ) + ".UTF-8", _: m || "./this.program" }, b;
            for (b in W)
              void 0 === W[b] ? delete a[b] : a[b] = W[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Ea = c;
          }
          return Ea;
        }, Ea, Ga = [null, [], []], Ha = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ia = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ja(a) {
          var b = Array(T(a) + 1);
          U(a, b, 0, b.length);
          return b;
        }
        function Ka(a, b, c, e) {
          function g(f, n, q) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )
              f = q[0] + f;
            return f;
          }
          function h(f, n) {
            return g(f, n, "0");
          }
          function k(f, n) {
            function q(Aa) {
              return 0 > Aa ? -1 : 0 < Aa ? 1 : 0;
            }
            var A;
            0 === (A = q(f.getFullYear() - n.getFullYear())) && 0 === (A = q(f.getMonth() - n.getMonth())) && (A = q(f.getDate() - n.getDate()));
            return A;
          }
          function p(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function t(f) {
            var n = f.Ga;
            for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {
              var q = f.getMonth(), A = (V(f.getFullYear()) ? Ha : Ia)[q];
              if (n > A - f.getDate())
                n -= A - f.getDate() + 1, f.setDate(1), 11 > q ? f.setMonth(q + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + n);
                break;
              }
            }
            q = new Date(f.getFullYear() + 1, 0, 4);
            n = p(new Date(
              f.getFullYear(),
              0,
              4
            ));
            q = p(q);
            return 0 >= k(n, f) ? 0 >= k(q, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          var u = J[e + 40 >> 2 >>> 0];
          e = { Sa: J[e >> 2 >>> 0], Ra: J[e + 4 >> 2 >>> 0], Ia: J[e + 8 >> 2 >>> 0], La: J[e + 12 >> 2 >>> 0], Ja: J[e + 16 >> 2 >>> 0], Ha: J[e + 20 >> 2 >>> 0], Fa: J[e + 24 >> 2 >>> 0], Ga: J[e + 28 >> 2 >>> 0], Ua: J[e + 32 >> 2 >>> 0], Qa: J[e + 36 >> 2 >>> 0], Ta: u ? S(u) : "" };
          c = S(c);
          u = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var v in u)
            c = c.replace(new RegExp(v, "g"), u[v]);
          var Ba = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Ca = "January February March April May June July August September October November December".split(" ");
          u = { "%a": (f) => Ba[f.Fa].substring(0, 3), "%A": (f) => Ba[f.Fa], "%b": (f) => Ca[f.Ja].substring(0, 3), "%B": (f) => Ca[f.Ja], "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2), "%d": (f) => h(f.La, 2), "%e": (f) => g(f.La, 2, " "), "%g": (f) => t(f).toString().substring(2), "%G": (f) => t(f), "%H": (f) => h(f.Ia, 2), "%I": (f) => {
            f = f.Ia;
            0 == f ? f = 12 : 12 < f && (f -= 12);
            return h(f, 2);
          }, "%j": (f) => {
            for (var n = 0, q = 0; q <= f.Ja - 1; n += (V(f.Ha + 1900) ? Ha : Ia)[q++])
              ;
            return h(f.La + n, 3);
          }, "%m": (f) => h(f.Ja + 1, 2), "%M": (f) => h(f.Ra, 2), "%n": () => "\n", "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM", "%S": (f) => h(f.Sa, 2), "%t": () => "	", "%u": (f) => f.Fa || 7, "%U": (f) => h(Math.floor((f.Ga + 7 - f.Fa) / 7), 2), "%V": (f) => {
            var n = Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7);
            2 >= (f.Fa + 371 - f.Ga - 2) % 7 && n++;
            if (n)
              53 == n && (q = (f.Fa + 371 - f.Ga) % 7, 4 == q || 3 == q && V(f.Ha) || (n = 1));
            else {
              n = 52;
              var q = (f.Fa + 7 - f.Ga - 1) % 7;
              (4 == q || 5 == q && V(f.Ha % 400 - 1)) && n++;
            }
            return h(n, 2);
          }, "%w": (f) => f.Fa, "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7), 2), "%y": (f) => (f.Ha + 1900).toString().substring(2), "%Y": (f) => f.Ha + 1900, "%z": (f) => {
            f = f.Qa;
            var n = 0 <= f;
            f = Math.abs(f) / 60;
            return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
          }, "%Z": (f) => f.Ta, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (v in u)
            c.includes(v) && (c = c.replace(new RegExp(v, "g"), u[v](e)));
          c = c.replace(/\0\0/g, "%");
          v = Ja(c);
          if (v.length > b)
            return 0;
          H.set(v, a >>> 0);
          return v.length - 1;
        }
        var X = [], Y = void 0, La = [];
        function Ma(a, b) {
          if (!Y) {
            Y = /* @__PURE__ */ new WeakMap();
            var c = L.length;
            if (Y)
              for (var e = 0; e < 0 + c; e++) {
                var g = e;
                var h = X[g];
                h || (g >= X.length && (X.length = g + 1), X[g] = h = L.get(g));
                (g = h) && Y.set(g, e);
              }
          }
          if (c = Y.get(a) || 0)
            return c;
          if (La.length)
            c = La.pop();
          else {
            try {
              L.grow(1);
            } catch (p) {
              if (!(p instanceof RangeError))
                throw p;
              throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
            }
            c = L.length - 1;
          }
          try {
            e = c, L.set(e, a), X[e] = L.get(e);
          } catch (p) {
            if (!(p instanceof TypeError))
              throw p;
            if ("function" == typeof WebAssembly.Function) {
              e = WebAssembly.Function;
              g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };
              h = { parameters: [], results: "v" == b[0] ? [] : [g[b[0]]] };
              for (var k = 1; k < b.length; ++k)
                h.parameters.push(g[b[k]]);
              b = new e(h, a);
            } else {
              e = [1];
              g = b.slice(0, 1);
              b = b.slice(1);
              h = { i: 127, p: 127, j: 126, f: 125, d: 124 };
              e.push(96);
              k = b.length;
              128 > k ? e.push(k) : e.push(k % 128 | 128, k >> 7);
              for (k = 0; k < b.length; ++k)
                e.push(h[b[k]]);
              "v" == g ? e.push(0) : e.push(1, h[g]);
              b = [0, 97, 115, 109, 1, 0, 0, 0, 1];
              g = e.length;
              128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);
              b.push.apply(b, e);
              b.push(
                2,
                7,
                1,
                1,
                101,
                1,
                102,
                0,
                0,
                7,
                5,
                1,
                1,
                102,
                0,
                0
              );
              b = new WebAssembly.Module(new Uint8Array(b));
              b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
            }
            e = c;
            L.set(e, b);
            X[e] = L.get(e);
          }
          Y.set(a, c);
          return c;
        }
        var Oa = {
          a: function(a, b, c) {
            a >>>= 0;
            new sa(a).Ma(b >>> 0, c >>> 0);
            ta = a;
            ua++;
            throw ta;
          },
          e: function() {
            return 0;
          },
          H: function() {
          },
          x: function() {
          },
          z: function() {
          },
          J: function() {
            return 0;
          },
          F: function() {
          },
          A: function() {
          },
          E: function() {
          },
          g: function() {
          },
          y: function() {
          },
          v: function() {
          },
          G: function() {
          },
          w: function() {
          },
          l: () => true,
          o: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            J[c >> 2 >>> 0] = a.getUTCSeconds();
            J[c + 4 >> 2 >>> 0] = a.getUTCMinutes();
            J[c + 8 >> 2 >>> 0] = a.getUTCHours();
            J[c + 12 >> 2 >>> 0] = a.getUTCDate();
            J[c + 16 >> 2 >>> 0] = a.getUTCMonth();
            J[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;
            J[c + 24 >> 2 >>> 0] = a.getUTCDay();
            J[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
          },
          p: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            J[c >> 2 >>> 0] = a.getSeconds();
            J[c + 4 >> 2 >>> 0] = a.getMinutes();
            J[c + 8 >> 2 >>> 0] = a.getHours();
            J[c + 12 >> 2 >>> 0] = a.getDate();
            J[c + 16 >> 2 >>> 0] = a.getMonth();
            J[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;
            J[c + 24 >> 2 >>> 0] = a.getDay();
            J[c + 28 >> 2 >>> 0] = (V(a.getFullYear()) ? xa : ya)[a.getMonth()] + a.getDate() - 1 | 0;
            J[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            J[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
          },
          q: function(a) {
            a >>>= 0;
            var b = new Date(J[a + 20 >> 2 >>> 0] + 1900, J[a + 16 >> 2 >>> 0], J[a + 12 >> 2 >>> 0], J[a + 8 >> 2 >>> 0], J[a + 4 >> 2 >>> 0], J[a >> 2 >>> 0], 0), c = J[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);
            0 > c ? J[a + 32 >> 2 >>> 0] = Number(g != h && k == e) : 0 < c != (k == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - e)));
            J[a + 24 >> 2 >>> 0] = b.getDay();
            J[a + 28 >> 2 >>> 0] = (V(b.getFullYear()) ? xa : ya)[b.getMonth()] + b.getDate() - 1 | 0;
            J[a >> 2 >>> 0] = b.getSeconds();
            J[a + 4 >> 2 >>> 0] = b.getMinutes();
            J[a + 8 >> 2 >>> 0] = b.getHours();
            J[a + 12 >> 2 >>> 0] = b.getDate();
            J[a + 16 >> 2 >>> 0] = b.getMonth();
            J[a + 20 >> 2 >>> 0] = b.getYear();
            a = b.getTime() / 1e3;
            return Na((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          m: function() {
            return -52;
          },
          n: function() {
          },
          t: function(a, b, c) {
            function e(t) {
              return (t = t.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? t[1] : "GMT";
            }
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var p = k.getTimezoneOffset();
            K[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, p);
            J[b >>> 0 >> 2 >>> 0] = Number(g != p);
            a = e(h);
            b = e(k);
            a = Da(a);
            b = Da(b);
            p < g ? (K[c >> 2 >>> 0] = a, K[c + 4 >> 2 >>> 0] = b) : (K[c >> 2 >>> 0] = b, K[c + 4 >> 2 >>> 0] = a);
          },
          d: () => {
            E("");
          },
          h: function() {
            return Date.now();
          },
          u: function() {
            return 4294901760;
          },
          b: () => performance.now(),
          I: function(a, b, c) {
            b >>>= 0;
            return I.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
          },
          s: function(a) {
            a >>>= 0;
            var b = I.length;
            if (4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var e = b * (1 + 0.2 / c);
              e = Math.min(e, a + 100663296);
              var g = Math;
              e = Math.max(a, e);
              a: {
                g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - F.buffer.byteLength + 65535 >>> 16;
                try {
                  F.grow(g);
                  ha();
                  var h = 1;
                  break a;
                } catch (k) {
                }
                h = void 0;
              }
              if (h)
                return true;
            }
            return false;
          },
          C: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = 0;
            Fa().forEach(function(e, g) {
              var h = b + c;
              g = K[a + 4 * g >> 2 >>> 0] = h;
              for (h = 0; h < e.length; ++h)
                H[g++ >> 0 >>> 0] = e.charCodeAt(h);
              H[g >> 0 >>> 0] = 0;
              c += e.length + 1;
            });
            return 0;
          },
          D: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = Fa();
            K[a >> 2 >>> 0] = c.length;
            var e = 0;
            c.forEach(function(g) {
              e += g.length + 1;
            });
            K[b >> 2 >>> 0] = e;
            return 0;
          },
          f: () => 52,
          k: function() {
            return 52;
          },
          r: function() {
            return 70;
          },
          j: function(a, b, c, e) {
            b >>>= 0;
            c >>>= 0;
            e >>>= 0;
            for (var g = 0, h = 0; h < c; h++) {
              var k = K[b >> 2 >>> 0], p = K[b + 4 >> 2 >>> 0];
              b += 8;
              for (var t = 0; t < p; t++) {
                var u = I[k + t >>> 0], v = Ga[a];
                0 === u || 10 === u ? ((1 === a ? ea : C)(wa(v, 0)), v.length = 0) : v.push(u);
              }
              g += p;
            }
            K[e >> 2 >>> 0] = g;
            return 0;
          },
          B: Ka,
          c: function(a, b, c, e) {
            return Ka(a >>> 0, b >>> 0, c >>> 0, e >>> 0);
          },
          i: function(a, b, c, e) {
            const g = L.length;
            a = new Uint8Array(I.slice(a + b, a + c));
            try {
              var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: F } }), p;
              for (p in k.exports)
                Ma(k.exports[p]);
              return g < L.length ? g : e;
            } catch (t) {
              return console.log(t), e;
            }
          }
        };
        (function() {
          function a(c) {
            c = c.exports;
            G = c = Pa(c);
            F = G.K;
            ha();
            L = G.Aa;
            ja.unshift(G.L);
            M--;
            d.monitorRunDependencies && d.monitorRunDependencies(M);
            if (0 == M && (null !== N && (clearInterval(N), N = null), O)) {
              var e = O;
              O = null;
              e();
            }
            return c;
          }
          var b = { a: Oa };
          M++;
          d.monitorRunDependencies && d.monitorRunDependencies(M);
          if (d.instantiateWasm)
            try {
              return d.instantiateWasm(b, a);
            } catch (c) {
              C("Module.instantiateWasm callback failed with error: " + c), l(c);
            }
          ra(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        })();
        d._OrtInit = (a, b) => (d._OrtInit = G.M)(a, b);
        d._OrtGetLastError = (a, b) => (d._OrtGetLastError = G.N)(a, b);
        d._OrtCreateSessionOptions = (a, b, c, e, g, h, k, p, t, u) => (d._OrtCreateSessionOptions = G.O)(a, b, c, e, g, h, k, p, t, u);
        d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = G.P)(a, b);
        d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = G.Q)(a, b, c);
        d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = G.R)(a, b, c);
        d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = G.S)(a);
        d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = G.T)(a, b, c);
        d._OrtReleaseSession = (a) => (d._OrtReleaseSession = G.U)(a);
        d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = G.V)(a, b, c);
        d._OrtGetInputName = (a, b) => (d._OrtGetInputName = G.W)(a, b);
        d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = G.X)(a, b);
        d._OrtFree = (a) => (d._OrtFree = G.Y)(a);
        d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = G.Z)(a, b, c, e, g, h);
        d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = G._)(a, b, c, e, g);
        d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = G.$)(a);
        d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = G.aa)(a, b, c, e);
        d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = G.ba)(a, b, c);
        d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = G.ca)(a);
        d._OrtCreateBinding = (a) => (d._OrtCreateBinding = G.da)(a);
        d._OrtBindInput = (a, b, c) => (d._OrtBindInput = G.ea)(a, b, c);
        d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = G.fa)(a, b, c, e);
        d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = G.ga)(a);
        d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = G.ha)(a);
        d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = G.ia)(a, b, c, e, g);
        d._OrtRun = (a, b, c, e, g, h, k, p) => (d._OrtRun = G.ja)(a, b, c, e, g, h, k, p);
        d._OrtEndProfiling = (a) => (d._OrtEndProfiling = G.ka)(a);
        d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = G.la)(a, b);
        d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = G.ma)(a);
        d._OrtTrainingCreateSession = (a, b, c, e, g, h, k, p) => (d._OrtTrainingCreateSession = G.na)(a, b, c, e, g, h, k, p);
        d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = G.oa)(a);
        d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = G.pa)(a, b, c, e, g, h);
        d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = G.qa)(a, b);
        d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = G.ra)(a, b, c, e, g, h);
        d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = G.sa)(a, b, c);
        d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = G.ta)(a, b, c, e);
        d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = G.ua)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = G.va)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = G.wa)(a, b, c, e);
        d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = G.xa)(a);
        var za = d._malloc = (a) => (za = d._malloc = G.ya)(a);
        d._free = (a) => (d._free = G.za)(a);
        var Na = (a) => (Na = G.Ba)(a), Qa = () => (Qa = G.Ca)(), Ra = (a) => (Ra = G.Da)(a), Sa = (a) => (Sa = G.Ea)(a);
        d.___start_em_js = 975904;
        d.___stop_em_js = 976516;
        function Pa(a) {
          a = Object.assign({}, a);
          var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        d.stackAlloc = Sa;
        d.stackSave = Qa;
        d.stackRestore = Ra;
        d.addFunction = Ma;
        d.UTF8ToString = S;
        d.stringToUTF8 = (a, b, c) => U(a, I, b, c);
        d.lengthBytesUTF8 = T;
        var Z;
        O = function Ta() {
          Z || Ua();
          Z || (O = Ta);
        };
        function Ua() {
          function a() {
            if (!Z && (Z = true, d.calledRun = true, !fa)) {
              R(ja);
              aa(d);
              if (d.onRuntimeInitialized)
                d.onRuntimeInitialized();
              if (d.postRun)
                for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {
                  var b = d.postRun.shift();
                  ka.unshift(b);
                }
              R(ka);
            }
          }
          if (!(0 < M)) {
            if (d.preRun)
              for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )
                la();
            R(ia);
            0 < M || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                d.setStatus("");
              }, 1);
              a();
            }, 1)) : a());
          }
        }
        if (d.preInit)
          for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )
            d.preInit.pop()();
        Ua();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasm;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasm);
  }
});

// nodejs-ignore:worker_threads
var require_worker_threads = __commonJS({
  "nodejs-ignore:worker_threads"() {
  }
});

// nodejs-ignore:perf_hooks
var require_perf_hooks = __commonJS({
  "nodejs-ignore:perf_hooks"() {
  }
});

// nodejs-ignore:os
var os_exports = {};
__export(os_exports, {
  cpus: () => cpus2
});
var cpus2;
var init_os = __esm({
  "nodejs-ignore:os"() {
    cpus2 = void 0;
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.js
var require_ort_wasm_threaded = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module2) {
    "use strict";
    var ortWasmThreaded = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        function aa() {
          e.buffer != l.buffer && m();
          return l;
        }
        function n() {
          e.buffer != l.buffer && m();
          return ba;
        }
        function p() {
          e.buffer != l.buffer && m();
          return ca;
        }
        function t() {
          e.buffer != l.buffer && m();
          return da;
        }
        function ea() {
          e.buffer != l.buffer && m();
          return fa;
        }
        var w = moduleArg, ha, x;
        w.ready = new Promise((a, b) => {
          ha = a;
          x = b;
        });
        var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {
          throw b;
        }, ka = "object" == typeof window, A = "function" == typeof importScripts, C = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";
        function la(a) {
          return w.locateFile ? w.locateFile(a, E) : E + a;
        }
        var ma, F, G;
        if (C) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));
          E = A ? na.dirname(E) + "/" : __dirname + "/";
          ma = (b, c) => {
            b = b.startsWith("file://") ? new URL(b) : na.normalize(b);
            return fs.readFileSync(b, c ? void 0 : "utf8");
          };
          G = (b) => {
            b = ma(b, true);
            b.buffer || (b = new Uint8Array(b));
            return b;
          };
          F = (b, c, d, g = true) => {
            b = b.startsWith("file://") ? new URL(b) : na.normalize(b);
            fs.readFile(b, g ? void 0 : "utf8", (h, k) => {
              h ? d(h) : c(g ? k.buffer : k);
            });
          };
          !w.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          z = (b, c) => {
            process.exitCode = b;
            throw c;
          };
          w.inspect = () => "[Emscripten Module object]";
          let a;
          try {
            a = require_worker_threads();
          } catch (b) {
            throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
          }
          global.Worker = a.Worker;
        } else if (ka || A)
          A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", C || (ma = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, A && (G = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), F = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          });
        C && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var oa = console.log.bind(console), pa = console.error.bind(console);
        C && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var qa = w.print || oa, I = w.printErr || pa;
        Object.assign(w, ia);
        ia = null;
        w.thisProgram && (ja = w.thisProgram);
        w.quit && (z = w.quit);
        var J;
        w.wasmBinary && (J = w.wasmBinary);
        var noExitRuntime = w.noExitRuntime || true;
        "object" != typeof WebAssembly && K("no native wasm support detected");
        var e, L, ra, M = false, N, l, ba, ca, da, fa;
        function m() {
          var a = e.buffer;
          w.HEAP8 = l = new Int8Array(a);
          w.HEAP16 = new Int16Array(a);
          w.HEAP32 = ca = new Int32Array(a);
          w.HEAPU8 = ba = new Uint8Array(a);
          w.HEAPU16 = new Uint16Array(a);
          w.HEAPU32 = da = new Uint32Array(a);
          w.HEAPF32 = new Float32Array(a);
          w.HEAPF64 = fa = new Float64Array(a);
        }
        var O = w.INITIAL_MEMORY || 16777216;
        5242880 <= O || K("INITIAL_MEMORY should be larger than STACK_SIZE, was " + O + "! (STACK_SIZE=5242880)");
        if (D)
          e = w.wasmMemory;
        else if (w.wasmMemory)
          e = w.wasmMemory;
        else if (e = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(e.buffer instanceof SharedArrayBuffer))
          throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), C && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        m();
        O = e.buffer.byteLength;
        var P, sa = [], ta = [], ua = [], va = 0;
        function Q() {
          return noExitRuntime || 0 < va;
        }
        var R = 0, wa = null, S = null;
        function xa() {
          R++;
          w.monitorRunDependencies && w.monitorRunDependencies(R);
        }
        function ya() {
          R--;
          w.monitorRunDependencies && w.monitorRunDependencies(R);
          if (0 == R && (null !== wa && (clearInterval(wa), wa = null), S)) {
            var a = S;
            S = null;
            a();
          }
        }
        function K(a) {
          if (w.onAbort)
            w.onAbort(a);
          a = "Aborted(" + a + ")";
          I(a);
          M = true;
          N = 1;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          x(a);
          throw a;
        }
        function za(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var T;
        T = "ort-wasm-threaded.wasm";
        za(T) || (T = la(T));
        function Aa(a) {
          if (a == T && J)
            return new Uint8Array(J);
          if (G)
            return G(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ba(a) {
          if (!J && (ka || A)) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => Aa(a));
            if (F)
              return new Promise((b, c) => {
                F(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => Aa(a));
        }
        function Ca(a, b, c) {
          return Ba(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            I("failed to asynchronously prepare wasm: " + d);
            K(d);
          });
        }
        function Da(a, b) {
          var c = T;
          return J || "function" != typeof WebAssembly.instantiateStreaming || za(c) || c.startsWith("file://") || C || "function" != typeof fetch ? Ca(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {
            I("wasm streaming compile failed: " + g);
            I("falling back to ArrayBuffer instantiation");
            return Ca(c, a, b);
          }));
        }
        var U;
        function Ea(a) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
        function Fa(a) {
          a.terminate();
          a.onmessage = () => {
          };
        }
        function Ga(a) {
          (a = V.Ma[a]) || K();
          V.mb(a);
        }
        function Ha(a) {
          var b = V.gb();
          if (!b)
            return 6;
          V.Pa.push(b);
          V.Ma[a.Oa] = b;
          b.Oa = a.Oa;
          var c = { cmd: "run", start_routine: a.nb, arg: a.fb, pthread_ptr: a.Oa };
          C && b.unref();
          b.postMessage(c, a.tb);
          return 0;
        }
        var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && Ia)
            return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (d = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                d += String.fromCharCode((g & 31) << 6 | h);
              else {
                var k = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              d += String.fromCharCode(g);
          }
          return d;
        }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";
        function La(a) {
          if (D)
            return W(1, 1, a);
          N = a;
          if (!Q()) {
            V.ob();
            if (w.onExit)
              w.onExit(a);
            M = true;
          }
          z(a, new Ea(a));
        }
        var Na = (a) => {
          N = a;
          if (D)
            throw Ma(a), "unwind";
          La(a);
        }, V = {
          Sa: [],
          Pa: [],
          $a: [],
          Ma: {},
          Wa: function() {
            D ? V.ib() : V.hb();
          },
          hb: function() {
            sa.unshift(() => {
              xa();
              V.jb(() => ya());
            });
          },
          ib: function() {
            V.receiveObjectTransfer = V.lb;
            V.threadInitTLS = V.Za;
            V.setExitStatus = V.Ya;
            noExitRuntime = false;
          },
          Ya: function(a) {
            N = a;
          },
          yb: ["$terminateWorker"],
          ob: function() {
            for (var a of V.Pa)
              Fa(a);
            for (a of V.Sa)
              Fa(a);
            V.Sa = [];
            V.Pa = [];
            V.Ma = [];
          },
          mb: function(a) {
            var b = a.Oa;
            delete V.Ma[b];
            V.Sa.push(a);
            V.Pa.splice(V.Pa.indexOf(a), 1);
            a.Oa = 0;
            Oa(b);
          },
          lb: function() {
          },
          Za: function() {
            V.$a.forEach((a) => a());
          },
          kb: (a) => new Promise((b) => {
            a.onmessage = (h) => {
              h = h.data;
              var k = h.cmd;
              if (h.targetThread && h.targetThread != Pa()) {
                var q = V.Ma[h.xb];
                q ? q.postMessage(h, h.transferList) : I('Internal error! Worker sent a message "' + k + '" to target pthread ' + h.targetThread + ", but that thread no longer exists!");
              } else if ("checkMailbox" === k)
                Qa();
              else if ("spawnThread" === k)
                Ha(h);
              else if ("cleanupThread" === k)
                Ga(h.thread);
              else if ("killThread" === k)
                h = h.thread, k = V.Ma[h], delete V.Ma[h], Fa(k), Oa(h), V.Pa.splice(
                  V.Pa.indexOf(k),
                  1
                ), k.Oa = 0;
              else if ("cancelThread" === k)
                V.Ma[h.thread].postMessage({ cmd: "cancel" });
              else if ("loaded" === k)
                a.loaded = true, b(a);
              else if ("alert" === k)
                alert("Thread " + h.threadId + ": " + h.text);
              else if ("setimmediate" === h.target)
                a.postMessage(h);
              else if ("callHandler" === k)
                w[h.handler](...h.args);
              else
                k && I("worker sent an unknown command " + k);
            };
            a.onerror = (h) => {
              I("worker sent an error! " + h.filename + ":" + h.lineno + ": " + h.message);
              throw h;
            };
            C && (a.on("message", function(h) {
              a.onmessage({ data: h });
            }), a.on("error", function(h) {
              a.onerror(h);
            }));
            var c = [], d = ["onExit", "onAbort", "print", "printErr"], g;
            for (g of d)
              w.hasOwnProperty(g) && c.push(g);
            a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: e, wasmModule: ra });
          }),
          jb: function(a) {
            a();
          },
          eb: function() {
            var a = la("ort-wasm-threaded.worker.js");
            a = new Worker(a);
            V.Sa.push(a);
          },
          gb: function() {
            0 == V.Sa.length && (V.eb(), V.kb(V.Sa[0]));
            return V.Sa.pop();
          }
        };
        w.PThread = V;
        var Ra = (a) => {
          for (; 0 < a.length; )
            a.shift()(w);
        };
        w.establishStackSpace = function() {
          var a = Pa(), b = p()[a + 52 >> 2 >>> 0];
          a = p()[a + 56 >> 2 >>> 0];
          Sa(b, b - a);
          Ta(b);
        };
        function Ma(a) {
          if (D)
            return W(2, 0, a);
          Na(a);
        }
        var X = [], Ua = (a) => {
          var b = X[a];
          b || (a >= X.length && (X.length = a + 1), X[a] = b = P.get(a));
          return b;
        };
        w.invokeEntryPoint = function(a, b) {
          a = Ua(a)(b);
          Q() ? V.Ya(a) : Va(a);
        };
        function Wa(a) {
          this.Va = a - 24;
          this.cb = function(b) {
            t()[this.Va + 4 >> 2 >>> 0] = b;
          };
          this.bb = function(b) {
            t()[this.Va + 8 >> 2 >>> 0] = b;
          };
          this.Wa = function(b, c) {
            this.ab();
            this.cb(b);
            this.bb(c);
          };
          this.ab = function() {
            t()[this.Va + 16 >> 2 >>> 0] = 0;
          };
        }
        var Xa = 0, Ya = 0;
        function Za(a, b, c, d) {
          return D ? W(3, 1, a, b, c, d) : $a(a, b, c, d);
        }
        function $a(a, b, c, d) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var g = [];
          if (D && 0 === g.length)
            return Za(a, b, c, d);
          a = { nb: c, Oa: a, fb: d, tb: g };
          return D ? (a.vb = "spawnThread", postMessage(a, g), 0) : Ha(a);
        }
        function ab(a, b, c) {
          return D ? W(4, 1, a, b, c) : 0;
        }
        function bb(a, b) {
          if (D)
            return W(5, 1, a, b);
        }
        var cb = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, db = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var g = c;
          d = c + d - 1;
          for (var h = 0; h < a.length; ++h) {
            var k = a.charCodeAt(h);
            if (55296 <= k && 57343 >= k) {
              var q = a.charCodeAt(++h);
              k = 65536 + ((k & 1023) << 10) | q & 1023;
            }
            if (127 >= k) {
              if (c >= d)
                break;
              b[c++ >>> 0] = k;
            } else {
              if (2047 >= k) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | k >> 6;
              } else {
                if (65535 >= k) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | k >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | k >> 18;
                  b[c++ >>> 0] = 128 | k >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | k >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | k & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, eb = (a, b, c) => db(a, n(), b, c);
        function fb(a, b) {
          if (D)
            return W(6, 1, a, b);
        }
        function gb(a, b, c) {
          if (D)
            return W(7, 1, a, b, c);
        }
        function hb(a, b, c) {
          return D ? W(8, 1, a, b, c) : 0;
        }
        function ib(a, b) {
          if (D)
            return W(9, 1, a, b);
        }
        function jb(a, b, c) {
          if (D)
            return W(10, 1, a, b, c);
        }
        function kb(a, b, c, d) {
          if (D)
            return W(11, 1, a, b, c, d);
        }
        function lb(a, b, c, d) {
          if (D)
            return W(12, 1, a, b, c, d);
        }
        function mb(a, b, c, d) {
          if (D)
            return W(13, 1, a, b, c, d);
        }
        function nb(a) {
          if (D)
            return W(14, 1, a);
        }
        function ob(a, b) {
          if (D)
            return W(15, 1, a, b);
        }
        function pb(a, b, c) {
          if (D)
            return W(16, 1, a, b, c);
        }
        var qb = (a) => {
          if (!M)
            try {
              if (a(), !Q())
                try {
                  D ? Va(N) : Na(N);
                } catch (b) {
                  b instanceof Ea || "unwind" == b || z(1, b);
                }
            } catch (b) {
              b instanceof Ea || "unwind" == b || z(1, b);
            }
        };
        function rb(a) {
          a >>>= 0;
          "function" === typeof Atomics.ub && (Atomics.ub(p(), a >> 2, a).value.then(Qa), a += 128, Atomics.store(p(), a >> 2, 1));
        }
        w.__emscripten_thread_mailbox_await = rb;
        function Qa() {
          var a = Pa();
          a && (rb(a), qb(() => sb()));
        }
        w.checkMailbox = Qa;
        var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), tb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ub = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function vb(a, b, c, d, g, h, k, q) {
          return D ? W(17, 1, a, b, c, d, g, h, k, q) : -52;
        }
        function wb(a, b, c, d, g, h, k) {
          if (D)
            return W(18, 1, a, b, c, d, g, h, k);
        }
        var yb = (a) => {
          var b = cb(a) + 1, c = xb(b);
          c && eb(a, c, b);
          return c;
        }, Ab = (a) => {
          var b = zb();
          a = a();
          Ta(b);
          return a;
        };
        function W(a, b) {
          var c = arguments.length - 2, d = arguments;
          return Ab(() => {
            for (var g = Bb(8 * c), h = g >> 3, k = 0; k < c; k++) {
              var q = d[2 + k];
              ea()[h + k >>> 0] = q;
            }
            return Cb(a, c, g, b);
          });
        }
        var Db = [], Eb = {}, Gb = () => {
          if (!Fb) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;
            for (b in Eb)
              void 0 === Eb[b] ? delete a[b] : a[b] = Eb[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Fb = c;
          }
          return Fb;
        }, Fb;
        function Hb(a, b) {
          if (D)
            return W(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Gb().forEach(function(d, g) {
            var h = b + c;
            g = t()[a + 4 * g >> 2 >>> 0] = h;
            for (h = 0; h < d.length; ++h)
              aa()[g++ >> 0 >>> 0] = d.charCodeAt(h);
            aa()[g >> 0 >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }
        function Ib(a, b) {
          if (D)
            return W(20, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = Gb();
          t()[a >> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach(function(g) {
            d += g.length + 1;
          });
          t()[b >> 2 >>> 0] = d;
          return 0;
        }
        function Jb(a) {
          return D ? W(21, 1, a) : 52;
        }
        function Nb(a, b, c, d) {
          return D ? W(22, 1, a, b, c, d) : 52;
        }
        function Ob(a, b, c, d, g) {
          return D ? W(23, 1, a, b, c, d, g) : 70;
        }
        var Pb = [null, [], []];
        function Qb(a, b, c, d) {
          if (D)
            return W(24, 1, a, b, c, d);
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var g = 0, h = 0; h < c; h++) {
            var k = t()[b >> 2 >>> 0], q = t()[b + 4 >> 2 >>> 0];
            b += 8;
            for (var B = 0; B < q; B++) {
              var v = n()[k + B >>> 0], y = Pb[a];
              0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);
            }
            g += q;
          }
          t()[d >> 2 >>> 0] = g;
          return 0;
        }
        var Rb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Sb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Tb(a) {
          var b = Array(cb(a) + 1);
          db(a, b, 0, b.length);
          return b;
        }
        var Ub = (a, b) => {
          aa().set(a, b >>> 0);
        };
        function Vb(a, b, c, d) {
          function g(f, r, u) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )
              f = u[0] + f;
            return f;
          }
          function h(f, r) {
            return g(f, r, "0");
          }
          function k(f, r) {
            function u(Kb) {
              return 0 > Kb ? -1 : 0 < Kb ? 1 : 0;
            }
            var H;
            0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));
            return H;
          }
          function q(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function B(f) {
            var r = f.Qa;
            for (f = new Date(new Date(f.Ra + 1900, 0, 1).getTime()); 0 < r; ) {
              var u = f.getMonth(), H = (Y(f.getFullYear()) ? Rb : Sb)[u];
              if (r > H - f.getDate())
                r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + r);
                break;
              }
            }
            u = new Date(f.getFullYear() + 1, 0, 4);
            r = q(new Date(
              f.getFullYear(),
              0,
              4
            ));
            u = q(u);
            return 0 >= k(r, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var v = p()[d + 40 >> 2 >>> 0];
          d = { rb: p()[d >> 2 >>> 0], qb: p()[d + 4 >> 2 >>> 0], Ta: p()[d + 8 >> 2 >>> 0], Xa: p()[d + 12 >> 2 >>> 0], Ua: p()[d + 16 >> 2 >>> 0], Ra: p()[d + 20 >> 2 >>> 0], Na: p()[d + 24 >> 2 >>> 0], Qa: p()[d + 28 >> 2 >>> 0], zb: p()[d + 32 >> 2 >>> 0], pb: p()[d + 36 >> 2 >>> 0], sb: v ? Ka(v) : "" };
          c = Ka(c);
          v = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var y in v)
            c = c.replace(new RegExp(y, "g"), v[y]);
          var Lb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Mb = "January February March April May June July August September October November December".split(" ");
          v = {
            "%a": (f) => Lb[f.Na].substring(0, 3),
            "%A": (f) => Lb[f.Na],
            "%b": (f) => Mb[f.Ua].substring(0, 3),
            "%B": (f) => Mb[f.Ua],
            "%C": (f) => h((f.Ra + 1900) / 100 | 0, 2),
            "%d": (f) => h(f.Xa, 2),
            "%e": (f) => g(f.Xa, 2, " "),
            "%g": (f) => B(f).toString().substring(2),
            "%G": (f) => B(f),
            "%H": (f) => h(f.Ta, 2),
            "%I": (f) => {
              f = f.Ta;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return h(f, 2);
            },
            "%j": (f) => {
              for (var r = 0, u = 0; u <= f.Ua - 1; r += (Y(f.Ra + 1900) ? Rb : Sb)[u++])
                ;
              return h(f.Xa + r, 3);
            },
            "%m": (f) => h(f.Ua + 1, 2),
            "%M": (f) => h(f.qb, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Ta && 12 > f.Ta ? "AM" : "PM",
            "%S": (f) => h(f.rb, 2),
            "%t": () => "	",
            "%u": (f) => f.Na || 7,
            "%U": (f) => h(Math.floor((f.Qa + 7 - f.Na) / 7), 2),
            "%V": (f) => {
              var r = Math.floor((f.Qa + 7 - (f.Na + 6) % 7) / 7);
              2 >= (f.Na + 371 - f.Qa - 2) % 7 && r++;
              if (r)
                53 == r && (u = (f.Na + 371 - f.Qa) % 7, 4 == u || 3 == u && Y(f.Ra) || (r = 1));
              else {
                r = 52;
                var u = (f.Na + 7 - f.Qa - 1) % 7;
                (4 == u || 5 == u && Y(f.Ra % 400 - 1)) && r++;
              }
              return h(r, 2);
            },
            "%w": (f) => f.Na,
            "%W": (f) => h(Math.floor((f.Qa + 7 - (f.Na + 6) % 7) / 7), 2),
            "%y": (f) => (f.Ra + 1900).toString().substring(2),
            "%Y": (f) => f.Ra + 1900,
            "%z": (f) => {
              f = f.pb;
              var r = 0 <= f;
              f = Math.abs(f) / 60;
              return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.sb,
            "%%": () => "%"
          };
          c = c.replace(
            /%%/g,
            "\0\0"
          );
          for (y in v)
            c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](d)));
          c = c.replace(/\0\0/g, "%");
          y = Tb(c);
          if (y.length > b)
            return 0;
          Ub(y, a);
          return y.length - 1;
        }
        var Z = void 0, Wb = [];
        function Xb(a, b) {
          if (!Z) {
            Z = /* @__PURE__ */ new WeakMap();
            var c = P.length;
            if (Z)
              for (var d = 0; d < 0 + c; d++) {
                var g = Ua(d);
                g && Z.set(g, d);
              }
          }
          if (c = Z.get(a) || 0)
            return c;
          if (Wb.length)
            c = Wb.pop();
          else {
            try {
              P.grow(1);
            } catch (q) {
              if (!(q instanceof RangeError))
                throw q;
              throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
            }
            c = P.length - 1;
          }
          try {
            d = c, P.set(d, a), X[d] = P.get(d);
          } catch (q) {
            if (!(q instanceof TypeError))
              throw q;
            if ("function" == typeof WebAssembly.Function) {
              d = WebAssembly.Function;
              g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };
              for (var h = {
                parameters: [],
                results: "v" == b[0] ? [] : [g[b[0]]]
              }, k = 1; k < b.length; ++k)
                h.parameters.push(g[b[k]]);
              b = new d(h, a);
            } else {
              d = [1];
              g = b.slice(0, 1);
              b = b.slice(1);
              h = { i: 127, p: 127, j: 126, f: 125, d: 124 };
              d.push(96);
              k = b.length;
              128 > k ? d.push(k) : d.push(k % 128 | 128, k >> 7);
              for (k = 0; k < b.length; ++k)
                d.push(h[b[k]]);
              "v" == g ? d.push(0) : d.push(1, h[g]);
              b = [0, 97, 115, 109, 1, 0, 0, 0, 1];
              g = d.length;
              128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);
              b.push.apply(b, d);
              b.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
              b = new WebAssembly.Module(new Uint8Array(b));
              b = new WebAssembly.Instance(
                b,
                { e: { f: a } }
              ).exports.f;
            }
            d = c;
            P.set(d, b);
            X[d] = P.get(d);
          }
          Z.set(a, c);
          return c;
        }
        V.Wa();
        var Yb = [null, La, Ma, Za, ab, bb, fb, gb, hb, ib, jb, kb, lb, mb, nb, ob, pb, vb, wb, Hb, Ib, Jb, Nb, Ob, Qb], ac = {
          b: function(a, b, c) {
            a >>>= 0;
            new Wa(a).Wa(b >>> 0, c >>> 0);
            Xa = a;
            Ya++;
            throw Xa;
          },
          N: function(a) {
            Zb(a >>> 0, !A, 1, !ka, 131072, false);
            V.Za();
          },
          k: function(a) {
            a >>>= 0;
            D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);
          },
          I: $a,
          h: ab,
          T: bb,
          D: fb,
          F: gb,
          U: hb,
          R: ib,
          J: jb,
          Q: kb,
          o: lb,
          E: mb,
          B: nb,
          S: ob,
          C: pb,
          q: () => true,
          z: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(() => Qa()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.Ma[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          L: function() {
            return -1;
          },
          M: rb,
          p: function(a) {
            C && V.Ma[a >>> 0].ref();
          },
          t: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >> 2 >>> 0] = a.getUTCSeconds();
            p()[c + 4 >> 2 >>> 0] = a.getUTCMinutes();
            p()[c + 8 >> 2 >>> 0] = a.getUTCHours();
            p()[c + 12 >> 2 >>> 0] = a.getUTCDate();
            p()[c + 16 >> 2 >>> 0] = a.getUTCMonth();
            p()[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;
            p()[c + 24 >> 2 >>> 0] = a.getUTCDay();
            a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            p()[c + 28 >> 2 >>> 0] = a;
          },
          u: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >> 2 >>> 0] = a.getSeconds();
            p()[c + 4 >> 2 >>> 0] = a.getMinutes();
            p()[c + 8 >> 2 >>> 0] = a.getHours();
            p()[c + 12 >> 2 >>> 0] = a.getDate();
            p()[c + 16 >> 2 >>> 0] = a.getMonth();
            p()[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;
            p()[c + 24 >> 2 >>> 0] = a.getDay();
            b = (Y(a.getFullYear()) ? tb : ub)[a.getMonth()] + a.getDate() - 1 | 0;
            p()[c + 28 >> 2 >>> 0] = b;
            p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
            p()[c + 32 >> 2 >>> 0] = a;
          },
          v: function(a) {
            a >>>= 0;
            var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);
            0 > c ? p()[a + 32 >> 2 >>> 0] = Number(g != h && k == d) : 0 < c != (k == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - d)));
            p()[a + 24 >> 2 >>> 0] = b.getDay();
            c = (Y(b.getFullYear()) ? tb : ub)[b.getMonth()] + b.getDate() - 1 | 0;
            p()[a + 28 >> 2 >>> 0] = c;
            p()[a >> 2 >>> 0] = b.getSeconds();
            p()[a + 4 >> 2 >>> 0] = b.getMinutes();
            p()[a + 8 >> 2 >>> 0] = b.getHours();
            p()[a + 12 >> 2 >>> 0] = b.getDate();
            p()[a + 16 >> 2 >>> 0] = b.getMonth();
            p()[a + 20 >> 2 >>> 0] = b.getYear();
            a = b.getTime() / 1e3;
            return $b((U = a, 1 <= +Math.abs(U) ? 0 < U ? +Math.floor(U / 4294967296) >>> 0 : ~~+Math.ceil((U - +(~~U >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          r: vb,
          s: wb,
          y: function(a, b, c) {
            function d(v) {
              return (v = v.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? v[1] : "GMT";
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var q = k.getTimezoneOffset(), B = Math.max(g, q);
            t()[a >> 2 >>> 0] = 60 * B;
            p()[b >> 2 >>> 0] = Number(g != q);
            a = d(h);
            b = d(k);
            a = yb(a);
            b = yb(b);
            q < g ? (t()[c >> 2 >>> 0] = a, t()[c + 4 >> 2 >>> 0] = b) : (t()[c >> 2 >>> 0] = b, t()[c + 4 >> 2 >>> 0] = a);
          },
          c: () => {
            K("");
          },
          l: function() {
          },
          i: function() {
            return Date.now();
          },
          V: () => {
            va += 1;
            throw "unwind";
          },
          A: function() {
            return 4294901760;
          },
          e: () => performance.timeOrigin + performance.now(),
          f: function() {
            return C ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;
          },
          K: function(a, b, c, d) {
            V.wb = b >>> 0;
            Db.length = c;
            b = d >>> 0 >> 3;
            for (d = 0; d < c; d++)
              Db[d] = ea()[b + d >>> 0];
            return Yb[a].apply(null, Db);
          },
          x: function(a) {
            a >>>= 0;
            var b = n().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var g = Math;
              d = Math.max(a, d);
              a: {
                g = g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - e.buffer.byteLength + 65535 >>> 16;
                try {
                  e.grow(g);
                  m();
                  var h = 1;
                  break a;
                } catch (k) {
                }
                h = void 0;
              }
              if (h)
                return true;
            }
            return false;
          },
          O: Hb,
          P: Ib,
          H: Na,
          g: Jb,
          n: Nb,
          w: Ob,
          m: Qb,
          a: e || w.wasmMemory,
          G: Vb,
          d: function(a, b, c, d) {
            return Vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          },
          j: function(a, b, c, d) {
            const g = P.length;
            a = new Uint8Array(n().slice(a + b, a + c));
            try {
              var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: e } }), q;
              for (q in k.exports)
                Xb(k.exports[q]);
              return g < P.length ? g : d;
            } catch (B) {
              return console.log(B), d;
            }
          }
        };
        (function() {
          function a(c, d) {
            c = c.exports;
            L = c = bc(c);
            V.$a.push(L.za);
            P = L.Aa;
            ta.unshift(L.W);
            ra = d;
            ya();
            return c;
          }
          var b = { a: ac };
          xa();
          if (w.instantiateWasm)
            try {
              return w.instantiateWasm(b, a);
            } catch (c) {
              I("Module.instantiateWasm callback failed with error: " + c), x(c);
            }
          Da(b, function(c) {
            a(c.instance, c.module);
          }).catch(x);
          return {};
        })();
        w._OrtInit = (a, b) => (w._OrtInit = L.X)(a, b);
        w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.Y)(a, b);
        w._OrtCreateSessionOptions = (a, b, c, d, g, h, k, q, B, v) => (w._OrtCreateSessionOptions = L.Z)(a, b, c, d, g, h, k, q, B, v);
        w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L._)(a, b);
        w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L.$)(a, b, c);
        w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.aa)(a, b, c);
        w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.ba)(a);
        w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ca)(a, b, c);
        w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.da)(a);
        w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.ea)(a, b, c);
        w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.fa)(a, b);
        w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.ga)(a, b);
        w._OrtFree = (a) => (w._OrtFree = L.ha)(a);
        w._OrtCreateTensor = (a, b, c, d, g, h) => (w._OrtCreateTensor = L.ia)(a, b, c, d, g, h);
        w._OrtGetTensorData = (a, b, c, d, g) => (w._OrtGetTensorData = L.ja)(a, b, c, d, g);
        w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ka)(a);
        w._OrtCreateRunOptions = (a, b, c, d) => (w._OrtCreateRunOptions = L.la)(a, b, c, d);
        w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.ma)(a, b, c);
        w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.na)(a);
        w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.oa)(a);
        w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.pa)(a, b, c);
        w._OrtBindOutput = (a, b, c, d) => (w._OrtBindOutput = L.qa)(a, b, c, d);
        w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.ra)(a);
        w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.sa)(a);
        w._OrtRunWithBinding = (a, b, c, d, g) => (w._OrtRunWithBinding = L.ta)(a, b, c, d, g);
        w._OrtRun = (a, b, c, d, g, h, k, q) => (w._OrtRun = L.ua)(a, b, c, d, g, h, k, q);
        w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.va)(a);
        var Pa = w._pthread_self = () => (Pa = w._pthread_self = L.wa)(), xb = w._malloc = (a) => (xb = w._malloc = L.xa)(a);
        w._free = (a) => (w._free = L.ya)(a);
        w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.za)();
        var Zb = w.__emscripten_thread_init = (a, b, c, d, g, h) => (Zb = w.__emscripten_thread_init = L.Ba)(a, b, c, d, g, h);
        w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ca)();
        var Cb = (a, b, c, d) => (Cb = L.Da)(a, b, c, d), Oa = (a) => (Oa = L.Ea)(a), Va = w.__emscripten_thread_exit = (a) => (Va = w.__emscripten_thread_exit = L.Fa)(a), sb = w.__emscripten_check_mailbox = () => (sb = w.__emscripten_check_mailbox = L.Ga)(), $b = (a) => ($b = L.Ha)(a), Sa = (a, b) => (Sa = L.Ia)(a, b), zb = () => (zb = L.Ja)(), Ta = (a) => (Ta = L.Ka)(a), Bb = (a) => (Bb = L.La)(a);
        w.___start_em_js = 906844;
        w.___stop_em_js = 907456;
        function bc(a) {
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.pthread_self = b(a.pthread_self);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        w.keepRuntimeAlive = Q;
        w.wasmMemory = e;
        w.stackAlloc = Bb;
        w.stackSave = zb;
        w.stackRestore = Ta;
        w.addFunction = Xb;
        w.UTF8ToString = Ka;
        w.stringToUTF8 = eb;
        w.lengthBytesUTF8 = cb;
        w.ExitStatus = Ea;
        w.PThread = V;
        var cc;
        S = function dc() {
          cc || ec();
          cc || (S = dc);
        };
        function ec() {
          function a() {
            if (!cc && (cc = true, w.calledRun = true, !M)) {
              D || Ra(ta);
              ha(w);
              if (w.onRuntimeInitialized)
                w.onRuntimeInitialized();
              if (!D) {
                if (w.postRun)
                  for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {
                    var b = w.postRun.shift();
                    ua.unshift(b);
                  }
                Ra(ua);
              }
            }
          }
          if (!(0 < R))
            if (D)
              ha(w), D || Ra(ta), startWorker(w);
            else {
              if (w.preRun)
                for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )
                  sa.unshift(w.preRun.shift());
              Ra(sa);
              0 < R || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {
                setTimeout(
                  function() {
                    w.setStatus("");
                  },
                  1
                );
                a();
              }, 1)) : a());
            }
        }
        if (w.preInit)
          for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )
            w.preInit.pop()();
        ec();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasmThreaded;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasmThreaded);
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.worker.js
var require_ort_wasm_threaded_worker = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module2) {
    module2.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\n';
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_node_path();
    if (true) {
      ortWasmFactory = require_ort_training_wasm_simd();
    } else {
      ortWasmFactory = true ? null : null;
    }
    ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = () => {
      try {
        if (typeof SharedArrayBuffer === "undefined") {
          return false;
        }
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          5,
          4,
          1,
          3,
          1,
          1,
          10,
          11,
          1,
          9,
          0,
          65,
          0,
          254,
          16,
          2,
          0,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          10,
          30,
          1,
          28,
          0,
          65,
          0,
          253,
          15,
          253,
          12,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          253,
          186,
          1,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    getWasmFileName = (useSimd, useThreads) => {
      if (useSimd) {
        if (true) {
          return "ort-training-wasm-simd.wasm";
        }
        return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";
      } else {
        return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";
      }
    };
    initializeWebAssembly = async (flags) => {
      if (initialized) {
        return Promise.resolve();
      }
      if (initializing) {
        throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
      }
      if (aborted) {
        throw new Error("previous call to 'initializeWebAssembly()' failed.");
      }
      initializing = true;
      const timeout = flags.initTimeout;
      const numThreads = flags.numThreads;
      const simd = flags.simd;
      const useThreads = numThreads > 1 && isMultiThreadSupported();
      const useSimd = simd && isSimdSupported();
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const wasmFileName = getWasmFileName(useSimd, useThreads);
      const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
          setTimeout(() => {
            isTimeout = true;
            resolve();
          }, timeout);
        }));
      }
      tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;
        const config = {
          locateFile: (fileName, scriptDirectory) => {
            if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {
              return URL.createObjectURL(new Blob(
                [
                  // This require() function is handled by esbuild plugin to load file content as string.
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  require_ort_wasm_threaded_worker()
                ],
                { type: "text/javascript" }
              ));
            }
            if (fileName.endsWith(".wasm")) {
              if (wasmPathOverride) {
                return wasmPathOverride;
              }
              const prefix = wasmPrefixOverride ?? scriptDirectory;
              if (false) {
                if (wasmFileName === "ort-wasm-simd.wasm") {
                  return prefix + "ort-wasm-simd.jsep.wasm";
                } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {
                  return prefix + "ort-wasm-simd-threaded.jsep.wasm";
                }
              }
              return prefix + wasmFileName;
            }
            return scriptDirectory + fileName;
          }
        };
        if (useThreads) {
          if (typeof Blob === "undefined") {
            config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
          } else {
            const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
            config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
          }
        }
        factory(config).then(
          // wasm module initialized successfully
          (module2) => {
            initializing = false;
            initialized = true;
            wasm = module2;
            resolve();
          },
          // wasm module failed to initialize
          (what) => {
            initializing = false;
            aborted = true;
            reject(what);
          }
        );
      }));
      await Promise.race(tasks);
      if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
      }
    };
    getInstance = () => {
      if (initialized && wasm) {
        return wasm;
      }
      throw new Error("WebAssembly is not initialized yet.");
    };
  }
});

// web/lib/wasm/wasm-utils.ts
var allocWasmString, iterateExtraOptions, checkLastError;
var init_wasm_utils = __esm({
  "web/lib/wasm/wasm-utils.ts"() {
    "use strict";
    init_wasm_factory();
    allocWasmString = (data, allocs) => {
      const wasm2 = getInstance();
      const dataLength = wasm2.lengthBytesUTF8(data) + 1;
      const dataOffset = wasm2._malloc(dataLength);
      wasm2.stringToUTF8(data, dataOffset, dataLength);
      allocs.push(dataOffset);
      return dataOffset;
    };
    iterateExtraOptions = (options, prefix, seen, handler) => {
      if (typeof options == "object" && options !== null) {
        if (seen.has(options)) {
          throw new Error("Circular reference in options");
        } else {
          seen.add(options);
        }
      }
      Object.entries(options).forEach(([key, value]) => {
        const name = prefix ? prefix + key : key;
        if (typeof value === "object") {
          iterateExtraOptions(value, name + ".", seen, handler);
        } else if (typeof value === "string" || typeof value === "number") {
          handler(name, value.toString());
        } else if (typeof value === "boolean") {
          handler(name, value ? "1" : "0");
        } else {
          throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
      });
    };
    checkLastError = (message) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const paramsOffset = wasm2.stackAlloc(8);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);
        const errorCode = wasm2.HEAP32[paramsOffset / 4];
        const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];
        const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";
        throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
  }
});

// web/lib/wasm/run-options.ts
var setRunOptions;
var init_run_options = __esm({
  "web/lib/wasm/run-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    setRunOptions = (options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      const allocs = [];
      const runOptions = options || {};
      try {
        if (options?.logSeverityLevel === void 0) {
          runOptions.logSeverityLevel = 2;
        } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if (options?.logVerbosityLevel === void 0) {
          runOptions.logVerbosityLevel = 0;
        } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {
          throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if (options?.terminate === void 0) {
          runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if (options?.tag !== void 0) {
          tagDataOffset = allocWasmString(options.tag, allocs);
        }
        runOptionsHandle = wasm2._OrtCreateRunOptions(
          runOptions.logSeverityLevel,
          runOptions.logVerbosityLevel,
          !!runOptions.terminate,
          tagDataOffset
        );
        if (runOptionsHandle === 0) {
          checkLastError("Can't create run options.");
        }
        if (options?.extra !== void 0) {
          iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a run config entry: ${key} - ${value}.`);
            }
          });
        }
        return [runOptionsHandle, allocs];
      } catch (e) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, setExecutionProviders, setSessionOptions;
var init_session_options = __esm({
  "web/lib/wasm/session-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    getGraphOptimzationLevel = (graphOptimizationLevel) => {
      switch (graphOptimizationLevel) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);
      }
    };
    getExecutionMode = (executionMode) => {
      switch (executionMode) {
        case "sequential":
          return 0;
        case "parallel":
          return 1;
        default:
          throw new Error(`unsupported execution mode: ${executionMode}`);
      }
    };
    appendDefaultOptions = (options) => {
      if (!options.extra) {
        options.extra = {};
      }
      if (!options.extra.session) {
        options.extra.session = {};
      }
      const session = options.extra.session;
      if (!session.use_ort_model_bytes_directly) {
        session.use_ort_model_bytes_directly = "1";
      }
      if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {
        options.enableMemPattern = false;
      }
    };
    setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        switch (epName) {
          case "xnnpack":
            epName = "XNNPACK";
            break;
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              if (webnnOptions?.deviceType) {
                const keyDataOffset = allocWasmString("deviceType", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'deviceType' - ${webnnOptions.deviceType}.`);
                }
              }
              if (webnnOptions?.numThreads) {
                let numThreads = webnnOptions.numThreads;
                if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {
                  numThreads = 0;
                }
                const keyDataOffset = allocWasmString("numThreads", allocs);
                const valueDataOffset = allocWasmString(numThreads.toString(), allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'numThreads' - ${webnnOptions.numThreads}.`);
                }
              }
              if (webnnOptions?.powerPreference) {
                const keyDataOffset = allocWasmString("powerPreference", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'powerPreference' - ${webnnOptions.powerPreference}.`
                  );
                }
              }
            }
            break;
          case "webgpu":
            epName = "JS";
            if (typeof ep !== "string") {
              const webgpuOptions = ep;
              if (webgpuOptions?.preferredLayout) {
                if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                  throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                }
                const keyDataOffset = allocWasmString("preferredLayout", allocs);
                const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'preferredLayout' - ${webgpuOptions.preferredLayout}.`
                  );
                }
              }
            }
            break;
          case "wasm":
          case "cpu":
            continue;
          default:
            throw new Error(`not supported execution provider: ${epName}`);
        }
        const epNameDataOffset = allocWasmString(epName, allocs);
        if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = (options) => {
      const wasm2 = getInstance();
      let sessionOptionsHandle = 0;
      const allocs = [];
      const sessionOptions = options || {};
      appendDefaultOptions(sessionOptions);
      try {
        const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");
        const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");
        const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;
        const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;
        if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);
        }
        const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;
        if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {
          throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);
        }
        const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;
        sessionOptionsHandle = wasm2._OrtCreateSessionOptions(
          graphOptimizationLevel,
          !!sessionOptions.enableCpuMemArena,
          !!sessionOptions.enableMemPattern,
          executionMode,
          !!sessionOptions.enableProfiling,
          0,
          logIdDataOffset,
          logSeverityLevel,
          logVerbosityLevel,
          optimizedModelFilePathOffset
        );
        if (sessionOptionsHandle === 0) {
          checkLastError("Can't create session options.");
        }
        if (sessionOptions.executionProviders) {
          setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.freeDimensionOverrides) {
          for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {
            if (typeof name !== "string") {
              throw new Error(`free dimension override name must be a string: ${name}`);
            }
            if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
              throw new Error(`free dimension override value must be a non-negative integer: ${value}`);
            }
            const nameOffset = allocWasmString(name, allocs);
            if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {
              checkLastError(`Can't set a free dimension override: ${name} - ${value}.`);
            }
          }
        }
        if (sessionOptions.extra !== void 0) {
          iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
            }
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e) {
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, getTensorElementSize, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, dataLocationStringToEnum;
var init_wasm_common = __esm({
  "web/lib/wasm/wasm-common.ts"() {
    "use strict";
    tensorDataTypeStringToEnum = (type) => {
      switch (type) {
        case "int8":
          return 3 /* int8 */;
        case "uint8":
          return 2 /* uint8 */;
        case "bool":
          return 9 /* bool */;
        case "int16":
          return 5 /* int16 */;
        case "uint16":
          return 4 /* uint16 */;
        case "int32":
          return 6 /* int32 */;
        case "uint32":
          return 12 /* uint32 */;
        case "float16":
          return 10 /* float16 */;
        case "float32":
          return 1 /* float */;
        case "float64":
          return 11 /* double */;
        case "string":
          return 8 /* string */;
        case "int64":
          return 7 /* int64 */;
        case "uint64":
          return 13 /* uint64 */;
        default:
          throw new Error(`unsupported data type: ${type}`);
      }
    };
    tensorDataTypeEnumToString = (typeProto) => {
      switch (typeProto) {
        case 3 /* int8 */:
          return "int8";
        case 2 /* uint8 */:
          return "uint8";
        case 9 /* bool */:
          return "bool";
        case 5 /* int16 */:
          return "int16";
        case 4 /* uint16 */:
          return "uint16";
        case 6 /* int32 */:
          return "int32";
        case 12 /* uint32 */:
          return "uint32";
        case 10 /* float16 */:
          return "float16";
        case 1 /* float */:
          return "float32";
        case 11 /* double */:
          return "float64";
        case 8 /* string */:
          return "string";
        case 7 /* int64 */:
          return "int64";
        case 13 /* uint64 */:
          return "uint64";
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];
    tensorTypeToTypedArrayConstructor = (type) => {
      switch (type) {
        case "float16":
          return Uint16Array;
        case "float32":
          return Float32Array;
        case "uint8":
          return Uint8Array;
        case "int8":
          return Int8Array;
        case "uint16":
          return Uint16Array;
        case "int16":
          return Int16Array;
        case "int32":
          return Int32Array;
        case "bool":
          return Uint8Array;
        case "float64":
          return Float64Array;
        case "uint32":
          return Uint32Array;
        case "int64":
          return BigInt64Array;
        case "uint64":
          return BigUint64Array;
        default:
          throw new Error(`unsupported type: ${type}`);
      }
    };
    logLevelStringToEnum = (logLevel) => {
      switch (logLevel) {
        case "verbose":
          return 0;
        case "info":
          return 1;
        case "warning":
          return 2;
        case "error":
          return 3;
        case "fatal":
          return 4;
        default:
          throw new Error(`unsupported logging level: ${logLevel}`);
      }
    };
    isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";
    dataLocationStringToEnum = (location) => {
      switch (location) {
        case "none":
          return 0;
        case "cpu":
          return 1;
        case "cpu-pinned":
          return 2;
        case "texture":
          return 3;
        case "gpu-buffer":
          return 4;
        default:
          throw new Error(`unsupported data location: ${location}`);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var ortEnvInitialized, getSessionInputOutputCount, initOrt, initRuntime, activeSessions, isOrtEnvInitialized, createSessionAllocate, createSessionFinalize, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    ortEnvInitialized = false;
    getSessionInputOutputCount = (sessionHandle) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
      if (false) {
        const initJsep = null.init;
        await initJsep(getInstance(), env3);
      }
      ortEnvInitialized = true;
    };
    activeSessions = /* @__PURE__ */ new Map();
    isOrtEnvInitialized = () => ortEnvInitialized;
    createSessionAllocate = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSessionFinalize = (modelData, options) => {
      const wasm2 = getInstance();
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const inputNames = [];
        const outputNames = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const name = wasm2._OrtGetInputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(name);
          inputNames.push(wasm2.UTF8ToString(name));
        }
        for (let i = 0; i < outputCount; i++) {
          const name = wasm2._OrtGetOutputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(name);
          const nameString = wasm2.UTF8ToString(name);
          outputNames.push(nameString);
          if (false) {
            const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}.`);
            }
            outputPreferredLocations.push(location);
          }
        }
        let bindingState = null;
        if (false) {
          ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);
          if (ioBindingHandle === 0) {
            checkLastError("Can't create IO binding.");
          }
          bindingState = {
            handle: ioBindingHandle,
            outputPreferredLocations,
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);
        return [sessionHandle, inputNames, outputNames];
      } catch (e) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          wasm2._OrtReleaseBinding(ioBindingHandle);
        }
        if (sessionHandle !== 0) {
          wasm2._OrtReleaseSession(sessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(modelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
      }
    };
    createSession = (model, options) => {
      const modelData = createSessionAllocate(model);
      return createSessionFinalize(modelData, options);
    };
    releaseSession = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot release session. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;
      if (ioBindingState) {
        wasm2._OrtReleaseBinding(ioBindingState.handle);
      }
      wasm2.jsepUnregisterBuffers?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      wasm2._OrtReleaseSession(sessionHandle);
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const dataType = tensor[0];
      const dims = tensor[1];
      const location = tensor[3];
      let rawData;
      let dataByteLength;
      if (dataType === "string" && location === "gpu-buffer") {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (location === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));
        dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;
        rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = 4 * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          let dataIndex = rawData / 4;
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);
          }
        } else {
          dataByteLength = data.byteLength;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        let dimIndex = dimsOffset / 4;
        dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(location)
        );
        if (tensor2 === 0) {
          checkLastError(`Can't create tensor for input/output. session=${sessionId}, index=${index}.`);
        }
        tensorHandles.push(tensor2);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot run inference. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);
        }
        for (let i = 0; i < outputCount; i++) {
          prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputCount + outputIndices[i]
          );
        }
        let inputValuesIndex = inputValuesOffset / 4;
        let inputNamesIndex = inputNamesOffset / 4;
        let outputValuesIndex = outputValuesOffset / 4;
        let outputNamesIndex = outputNamesOffset / 4;
        for (let i = 0; i < inputCount; i++) {
          wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];
          wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];
          wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`);
          }
          for (let i = 0; i < inputCount; i++) {
            const index = inputIndices[i];
            const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);
            if (errorCode2 !== 0) {
              checkLastError(`Can't bind input[${i}] for session=${sessionId}.`);
            }
          }
          for (let i = 0; i < outputCount; i++) {
            const index = outputIndices[i];
            const location = outputTensors[i]?.[3];
            if (location) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
        }
        let errorCode;
        if (false) {
          errorCode = await wasm2._OrtRunWithBinding(
            sessionHandle,
            ioBindingState.handle,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        } else {
          errorCode = await wasm2._OrtRun(
            sessionHandle,
            inputNamesOffset,
            inputValuesOffset,
            inputCount,
            outputNamesOffset,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        }
        if (errorCode !== 0) {
          checkLastError("failed to call OrtRun().");
        }
        const output = [];
        for (let i = 0; i < outputCount; i++) {
          const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * 4);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + 4,
              tensorDataOffset + 8,
              tensorDataOffset + 12
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            let tensorDataIndex = tensorDataOffset / 4;
            const dataType = wasm2.HEAPU32[tensorDataIndex++];
            dataOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
            }
            wasm2._OrtFree(dimsOffset);
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              let dataIndex = dataOffset / 4;
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.HEAPU32[dataIndex++];
                const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);
                const elementSize = getTensorElementSize(dataType);
                if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    gpuBuffer,
                    download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),
                    dispose: () => {
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "gpu-buffer"
                ]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
                output.push([type, dims, data, "cpu"]);
              }
            }
          } finally {
            wasm2.stackRestore(beforeGetTensorDataStack);
            if (type === "string" && dataOffset) {
              wasm2._free(dataOffset);
            }
            if (!keepOutputTensor) {
              wasm2._OrtReleaseTensor(tensor);
            }
          }
        }
        if (ioBindingState) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
        }
        return output;
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    endProfiling = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error("invalid session id");
      }
      const sessionHandle = session[0];
      const profileFileName = wasm2._OrtEndProfiling(sessionHandle);
      if (profileFileName === 0) {
        checkLastError("Can't get an profile file name.");
      }
      wasm2._OrtFree(profileFileName);
    };
    extractTransferableBuffers = (tensors) => {
      const buffers = [];
      for (const tensor of tensors) {
        const data = tensor[2];
        if (!Array.isArray(data) && "buffer" in data) {
          buffers.push(data.buffer);
        }
      }
      return buffers;
    };
  }
});

// proxy-worker:./proxy-worker/main
var require_main = __commonJS({
  "proxy-worker:./proxy-worker/main"(exports, module2) {
    module2.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    readFile: () => readFile\n  });\n  var readFile;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var d = moduleArg, aa, l;\n          d.ready = new Promise((a, b) => {\n            aa = a;\n            l = b;\n          });\n          var ba = Object.assign({}, d), m = "./this.program", ca = "object" == typeof window, r = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, w = "", x, y, z;\n          if (da) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));\n            w = r ? B.dirname(w) + "/" : __dirname + "/";\n            x = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : B.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            z = (a) => {\n              a = x(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            y = (a, b, c, e = true) => {\n              a = a.startsWith("file://") ? new URL(a) : B.normalize(a);\n              fs.readFile(a, e ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(e ? h.buffer : h);\n              });\n            };\n            !d.thisProgram && 1 < process.argv.length && (m = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            d.inspect = () => "[Emscripten Module object]";\n          } else if (ca || r)\n            r ? w = self.location.href : "undefined" != typeof document && document.currentScript && (w = document.currentScript.src), _scriptDir && (w = _scriptDir), 0 !== w.indexOf("blob:") ? w = w.substr(0, w.replace(/[?#].*/, "").lastIndexOf("/") + 1) : w = "", x = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, r && (z = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), y = (a, b, c) => {\n              var e = new XMLHttpRequest();\n              e.open("GET", a, true);\n              e.responseType = "arraybuffer";\n              e.onload = () => {\n                200 == e.status || 0 == e.status && e.response ? b(e.response) : c();\n              };\n              e.onerror = c;\n              e.send(null);\n            };\n          var ea = d.print || console.log.bind(console), C = d.printErr || console.error.bind(console);\n          Object.assign(d, ba);\n          ba = null;\n          d.thisProgram && (m = d.thisProgram);\n          var D;\n          d.wasmBinary && (D = d.wasmBinary);\n          var noExitRuntime = d.noExitRuntime || true;\n          "object" != typeof WebAssembly && E("no native wasm support detected");\n          var F, G, fa = false, H, I, J, K;\n          function ha() {\n            var a = F.buffer;\n            d.HEAP8 = H = new Int8Array(a);\n            d.HEAP16 = new Int16Array(a);\n            d.HEAP32 = J = new Int32Array(a);\n            d.HEAPU8 = I = new Uint8Array(a);\n            d.HEAPU16 = new Uint16Array(a);\n            d.HEAPU32 = K = new Uint32Array(a);\n            d.HEAPF32 = new Float32Array(a);\n            d.HEAPF64 = new Float64Array(a);\n          }\n          var L, ia = [], ja = [], ka = [];\n          function la() {\n            var a = d.preRun.shift();\n            ia.unshift(a);\n          }\n          var M = 0, N = null, O = null;\n          function E(a) {\n            if (d.onAbort)\n              d.onAbort(a);\n            a = "Aborted(" + a + ")";\n            C(a);\n            fa = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          function ma(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var P;\n          P = "ort-training-wasm-simd.wasm";\n          if (!ma(P)) {\n            var na = P;\n            P = d.locateFile ? d.locateFile(na, w) : w + na;\n          }\n          function oa(a) {\n            if (a == P && D)\n              return new Uint8Array(D);\n            if (z)\n              return z(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function pa(a) {\n            if (!D && (ca || r)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => oa(a));\n              if (y)\n                return new Promise((b, c) => {\n                  y(a, (e) => b(new Uint8Array(e)), c);\n                });\n            }\n            return Promise.resolve().then(() => oa(a));\n          }\n          function qa(a, b, c) {\n            return pa(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {\n              C("failed to asynchronously prepare wasm: " + e);\n              E(e);\n            });\n          }\n          function ra(a, b) {\n            var c = P;\n            return D || "function" != typeof WebAssembly.instantiateStreaming || ma(c) || c.startsWith("file://") || da || "function" != typeof fetch ? qa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {\n              C("wasm streaming compile failed: " + g);\n              C("falling back to ArrayBuffer instantiation");\n              return qa(c, a, b);\n            }));\n          }\n          var Q, R = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(d);\n          };\n          function sa(a) {\n            this.Ka = a - 24;\n            this.Pa = function(b) {\n              K[this.Ka + 4 >> 2 >>> 0] = b;\n            };\n            this.Oa = function(b) {\n              K[this.Ka + 8 >> 2 >>> 0] = b;\n            };\n            this.Ma = function(b, c) {\n              this.Na();\n              this.Pa(b);\n              this.Oa(c);\n            };\n            this.Na = function() {\n              K[this.Ka + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var ta = 0, ua = 0, va = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, wa = (a, b, c) => {\n            b >>>= 0;\n            var e = b + c;\n            for (c = b; a[c] && !(c >= e); )\n              ++c;\n            if (16 < c - b && a.buffer && va)\n              return va.decode(a.subarray(b, c));\n            for (e = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  e += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var k = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;\n                  65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                e += String.fromCharCode(g);\n            }\n            return e;\n          }, S = (a, b) => (a >>>= 0) ? wa(I, a, b) : "", T = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var e = a.charCodeAt(c);\n              127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, U = (a, b, c, e) => {\n            c >>>= 0;\n            if (!(0 < e))\n              return 0;\n            var g = c;\n            e = c + e - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var k = a.charCodeAt(h);\n              if (55296 <= k && 57343 >= k) {\n                var p = a.charCodeAt(++h);\n                k = 65536 + ((k & 1023) << 10) | p & 1023;\n              }\n              if (127 >= k) {\n                if (c >= e)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= e)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= e)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= e)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, V = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), xa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ya = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Da = (a) => {\n            var b = T(a) + 1, c = za(b);\n            c && U(a, I, c, b);\n            return c;\n          }, W = {}, Fa = () => {\n            if (!Ea) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: m || "./this.program" }, b;\n              for (b in W)\n                void 0 === W[b] ? delete a[b] : a[b] = W[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Ea = c;\n            }\n            return Ea;\n          }, Ea, Ga = [null, [], []], Ha = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ia = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ja(a) {\n            var b = Array(T(a) + 1);\n            U(a, b, 0, b.length);\n            return b;\n          }\n          function Ka(a, b, c, e) {\n            function g(f, n, q) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = q[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function k(f, n) {\n              function q(Aa) {\n                return 0 > Aa ? -1 : 0 < Aa ? 1 : 0;\n              }\n              var A;\n              0 === (A = q(f.getFullYear() - n.getFullYear())) && 0 === (A = q(f.getMonth() - n.getMonth())) && (A = q(f.getDate() - n.getDate()));\n              return A;\n            }\n            function p(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function t(f) {\n              var n = f.Ga;\n              for (f = new Date(new Date(f.Ha + 1900, 0, 1).getTime()); 0 < n; ) {\n                var q = f.getMonth(), A = (V(f.getFullYear()) ? Ha : Ia)[q];\n                if (n > A - f.getDate())\n                  n -= A - f.getDate() + 1, f.setDate(1), 11 > q ? f.setMonth(q + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              q = new Date(f.getFullYear() + 1, 0, 4);\n              n = p(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              q = p(q);\n              return 0 >= k(n, f) ? 0 >= k(q, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            var u = J[e + 40 >> 2 >>> 0];\n            e = { Sa: J[e >> 2 >>> 0], Ra: J[e + 4 >> 2 >>> 0], Ia: J[e + 8 >> 2 >>> 0], La: J[e + 12 >> 2 >>> 0], Ja: J[e + 16 >> 2 >>> 0], Ha: J[e + 20 >> 2 >>> 0], Fa: J[e + 24 >> 2 >>> 0], Ga: J[e + 28 >> 2 >>> 0], Ua: J[e + 32 >> 2 >>> 0], Qa: J[e + 36 >> 2 >>> 0], Ta: u ? S(u) : "" };\n            c = S(c);\n            u = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var v in u)\n              c = c.replace(new RegExp(v, "g"), u[v]);\n            var Ba = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Ca = "January February March April May June July August September October November December".split(" ");\n            u = { "%a": (f) => Ba[f.Fa].substring(0, 3), "%A": (f) => Ba[f.Fa], "%b": (f) => Ca[f.Ja].substring(0, 3), "%B": (f) => Ca[f.Ja], "%C": (f) => h((f.Ha + 1900) / 100 | 0, 2), "%d": (f) => h(f.La, 2), "%e": (f) => g(f.La, 2, " "), "%g": (f) => t(f).toString().substring(2), "%G": (f) => t(f), "%H": (f) => h(f.Ia, 2), "%I": (f) => {\n              f = f.Ia;\n              0 == f ? f = 12 : 12 < f && (f -= 12);\n              return h(f, 2);\n            }, "%j": (f) => {\n              for (var n = 0, q = 0; q <= f.Ja - 1; n += (V(f.Ha + 1900) ? Ha : Ia)[q++])\n                ;\n              return h(f.La + n, 3);\n            }, "%m": (f) => h(f.Ja + 1, 2), "%M": (f) => h(f.Ra, 2), "%n": () => "\\n", "%p": (f) => 0 <= f.Ia && 12 > f.Ia ? "AM" : "PM", "%S": (f) => h(f.Sa, 2), "%t": () => "	", "%u": (f) => f.Fa || 7, "%U": (f) => h(Math.floor((f.Ga + 7 - f.Fa) / 7), 2), "%V": (f) => {\n              var n = Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7);\n              2 >= (f.Fa + 371 - f.Ga - 2) % 7 && n++;\n              if (n)\n                53 == n && (q = (f.Fa + 371 - f.Ga) % 7, 4 == q || 3 == q && V(f.Ha) || (n = 1));\n              else {\n                n = 52;\n                var q = (f.Fa + 7 - f.Ga - 1) % 7;\n                (4 == q || 5 == q && V(f.Ha % 400 - 1)) && n++;\n              }\n              return h(n, 2);\n            }, "%w": (f) => f.Fa, "%W": (f) => h(Math.floor((f.Ga + 7 - (f.Fa + 6) % 7) / 7), 2), "%y": (f) => (f.Ha + 1900).toString().substring(2), "%Y": (f) => f.Ha + 1900, "%z": (f) => {\n              f = f.Qa;\n              var n = 0 <= f;\n              f = Math.abs(f) / 60;\n              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n            }, "%Z": (f) => f.Ta, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (v in u)\n              c.includes(v) && (c = c.replace(new RegExp(v, "g"), u[v](e)));\n            c = c.replace(/\\0\\0/g, "%");\n            v = Ja(c);\n            if (v.length > b)\n              return 0;\n            H.set(v, a >>> 0);\n            return v.length - 1;\n          }\n          var X = [], Y = void 0, La = [];\n          function Ma(a, b) {\n            if (!Y) {\n              Y = /* @__PURE__ */ new WeakMap();\n              var c = L.length;\n              if (Y)\n                for (var e = 0; e < 0 + c; e++) {\n                  var g = e;\n                  var h = X[g];\n                  h || (g >= X.length && (X.length = g + 1), X[g] = h = L.get(g));\n                  (g = h) && Y.set(g, e);\n                }\n            }\n            if (c = Y.get(a) || 0)\n              return c;\n            if (La.length)\n              c = La.pop();\n            else {\n              try {\n                L.grow(1);\n              } catch (p) {\n                if (!(p instanceof RangeError))\n                  throw p;\n                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";\n              }\n              c = L.length - 1;\n            }\n            try {\n              e = c, L.set(e, a), X[e] = L.get(e);\n            } catch (p) {\n              if (!(p instanceof TypeError))\n                throw p;\n              if ("function" == typeof WebAssembly.Function) {\n                e = WebAssembly.Function;\n                g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };\n                h = { parameters: [], results: "v" == b[0] ? [] : [g[b[0]]] };\n                for (var k = 1; k < b.length; ++k)\n                  h.parameters.push(g[b[k]]);\n                b = new e(h, a);\n              } else {\n                e = [1];\n                g = b.slice(0, 1);\n                b = b.slice(1);\n                h = { i: 127, p: 127, j: 126, f: 125, d: 124 };\n                e.push(96);\n                k = b.length;\n                128 > k ? e.push(k) : e.push(k % 128 | 128, k >> 7);\n                for (k = 0; k < b.length; ++k)\n                  e.push(h[b[k]]);\n                "v" == g ? e.push(0) : e.push(1, h[g]);\n                b = [0, 97, 115, 109, 1, 0, 0, 0, 1];\n                g = e.length;\n                128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);\n                b.push.apply(b, e);\n                b.push(\n                  2,\n                  7,\n                  1,\n                  1,\n                  101,\n                  1,\n                  102,\n                  0,\n                  0,\n                  7,\n                  5,\n                  1,\n                  1,\n                  102,\n                  0,\n                  0\n                );\n                b = new WebAssembly.Module(new Uint8Array(b));\n                b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;\n              }\n              e = c;\n              L.set(e, b);\n              X[e] = L.get(e);\n            }\n            Y.set(a, c);\n            return c;\n          }\n          var Oa = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new sa(a).Ma(b >>> 0, c >>> 0);\n              ta = a;\n              ua++;\n              throw ta;\n            },\n            e: function() {\n              return 0;\n            },\n            H: function() {\n            },\n            x: function() {\n            },\n            z: function() {\n            },\n            J: function() {\n              return 0;\n            },\n            F: function() {\n            },\n            A: function() {\n            },\n            E: function() {\n            },\n            g: function() {\n            },\n            y: function() {\n            },\n            v: function() {\n            },\n            G: function() {\n            },\n            w: function() {\n            },\n            l: () => true,\n            o: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              J[c >> 2 >>> 0] = a.getUTCSeconds();\n              J[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              J[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              J[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              J[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              J[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              J[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              J[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            p: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              J[c >> 2 >>> 0] = a.getSeconds();\n              J[c + 4 >> 2 >>> 0] = a.getMinutes();\n              J[c + 8 >> 2 >>> 0] = a.getHours();\n              J[c + 12 >> 2 >>> 0] = a.getDate();\n              J[c + 16 >> 2 >>> 0] = a.getMonth();\n              J[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              J[c + 24 >> 2 >>> 0] = a.getDay();\n              J[c + 28 >> 2 >>> 0] = (V(a.getFullYear()) ? xa : ya)[a.getMonth()] + a.getDate() - 1 | 0;\n              J[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              J[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;\n            },\n            q: function(a) {\n              a >>>= 0;\n              var b = new Date(J[a + 20 >> 2 >>> 0] + 1900, J[a + 16 >> 2 >>> 0], J[a + 12 >> 2 >>> 0], J[a + 8 >> 2 >>> 0], J[a + 4 >> 2 >>> 0], J[a >> 2 >>> 0], 0), c = J[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);\n              0 > c ? J[a + 32 >> 2 >>> 0] = Number(g != h && k == e) : 0 < c != (k == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - e)));\n              J[a + 24 >> 2 >>> 0] = b.getDay();\n              J[a + 28 >> 2 >>> 0] = (V(b.getFullYear()) ? xa : ya)[b.getMonth()] + b.getDate() - 1 | 0;\n              J[a >> 2 >>> 0] = b.getSeconds();\n              J[a + 4 >> 2 >>> 0] = b.getMinutes();\n              J[a + 8 >> 2 >>> 0] = b.getHours();\n              J[a + 12 >> 2 >>> 0] = b.getDate();\n              J[a + 16 >> 2 >>> 0] = b.getMonth();\n              J[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Na((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            m: function() {\n              return -52;\n            },\n            n: function() {\n            },\n            t: function(a, b, c) {\n              function e(t) {\n                return (t = t.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? t[1] : "GMT";\n              }\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var p = k.getTimezoneOffset();\n              K[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, p);\n              J[b >>> 0 >> 2 >>> 0] = Number(g != p);\n              a = e(h);\n              b = e(k);\n              a = Da(a);\n              b = Da(b);\n              p < g ? (K[c >> 2 >>> 0] = a, K[c + 4 >> 2 >>> 0] = b) : (K[c >> 2 >>> 0] = b, K[c + 4 >> 2 >>> 0] = a);\n            },\n            d: () => {\n              E("");\n            },\n            h: function() {\n              return Date.now();\n            },\n            u: function() {\n              return 4294901760;\n            },\n            b: () => performance.now(),\n            I: function(a, b, c) {\n              b >>>= 0;\n              return I.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n            },\n            s: function(a) {\n              a >>>= 0;\n              var b = I.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var e = b * (1 + 0.2 / c);\n                e = Math.min(e, a + 100663296);\n                var g = Math;\n                e = Math.max(a, e);\n                a: {\n                  g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - F.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    F.grow(g);\n                    ha();\n                    var h = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            C: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              Fa().forEach(function(e, g) {\n                var h = b + c;\n                g = K[a + 4 * g >> 2 >>> 0] = h;\n                for (h = 0; h < e.length; ++h)\n                  H[g++ >> 0 >>> 0] = e.charCodeAt(h);\n                H[g >> 0 >>> 0] = 0;\n                c += e.length + 1;\n              });\n              return 0;\n            },\n            D: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = Fa();\n              K[a >> 2 >>> 0] = c.length;\n              var e = 0;\n              c.forEach(function(g) {\n                e += g.length + 1;\n              });\n              K[b >> 2 >>> 0] = e;\n              return 0;\n            },\n            f: () => 52,\n            k: function() {\n              return 52;\n            },\n            r: function() {\n              return 70;\n            },\n            j: function(a, b, c, e) {\n              b >>>= 0;\n              c >>>= 0;\n              e >>>= 0;\n              for (var g = 0, h = 0; h < c; h++) {\n                var k = K[b >> 2 >>> 0], p = K[b + 4 >> 2 >>> 0];\n                b += 8;\n                for (var t = 0; t < p; t++) {\n                  var u = I[k + t >>> 0], v = Ga[a];\n                  0 === u || 10 === u ? ((1 === a ? ea : C)(wa(v, 0)), v.length = 0) : v.push(u);\n                }\n                g += p;\n              }\n              K[e >> 2 >>> 0] = g;\n              return 0;\n            },\n            B: Ka,\n            c: function(a, b, c, e) {\n              return Ka(a >>> 0, b >>> 0, c >>> 0, e >>> 0);\n            },\n            i: function(a, b, c, e) {\n              const g = L.length;\n              a = new Uint8Array(I.slice(a + b, a + c));\n              try {\n                var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: F } }), p;\n                for (p in k.exports)\n                  Ma(k.exports[p]);\n                return g < L.length ? g : e;\n              } catch (t) {\n                return console.log(t), e;\n              }\n            }\n          };\n          (function() {\n            function a(c) {\n              c = c.exports;\n              G = c = Pa(c);\n              F = G.K;\n              ha();\n              L = G.Aa;\n              ja.unshift(G.L);\n              M--;\n              d.monitorRunDependencies && d.monitorRunDependencies(M);\n              if (0 == M && (null !== N && (clearInterval(N), N = null), O)) {\n                var e = O;\n                O = null;\n                e();\n              }\n              return c;\n            }\n            var b = { a: Oa };\n            M++;\n            d.monitorRunDependencies && d.monitorRunDependencies(M);\n            if (d.instantiateWasm)\n              try {\n                return d.instantiateWasm(b, a);\n              } catch (c) {\n                C("Module.instantiateWasm callback failed with error: " + c), l(c);\n              }\n            ra(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          })();\n          d._OrtInit = (a, b) => (d._OrtInit = G.M)(a, b);\n          d._OrtGetLastError = (a, b) => (d._OrtGetLastError = G.N)(a, b);\n          d._OrtCreateSessionOptions = (a, b, c, e, g, h, k, p, t, u) => (d._OrtCreateSessionOptions = G.O)(a, b, c, e, g, h, k, p, t, u);\n          d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = G.P)(a, b);\n          d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = G.Q)(a, b, c);\n          d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = G.R)(a, b, c);\n          d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = G.S)(a);\n          d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = G.T)(a, b, c);\n          d._OrtReleaseSession = (a) => (d._OrtReleaseSession = G.U)(a);\n          d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = G.V)(a, b, c);\n          d._OrtGetInputName = (a, b) => (d._OrtGetInputName = G.W)(a, b);\n          d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = G.X)(a, b);\n          d._OrtFree = (a) => (d._OrtFree = G.Y)(a);\n          d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = G.Z)(a, b, c, e, g, h);\n          d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = G._)(a, b, c, e, g);\n          d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = G.$)(a);\n          d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = G.aa)(a, b, c, e);\n          d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = G.ba)(a, b, c);\n          d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = G.ca)(a);\n          d._OrtCreateBinding = (a) => (d._OrtCreateBinding = G.da)(a);\n          d._OrtBindInput = (a, b, c) => (d._OrtBindInput = G.ea)(a, b, c);\n          d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = G.fa)(a, b, c, e);\n          d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = G.ga)(a);\n          d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = G.ha)(a);\n          d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = G.ia)(a, b, c, e, g);\n          d._OrtRun = (a, b, c, e, g, h, k, p) => (d._OrtRun = G.ja)(a, b, c, e, g, h, k, p);\n          d._OrtEndProfiling = (a) => (d._OrtEndProfiling = G.ka)(a);\n          d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = G.la)(a, b);\n          d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = G.ma)(a);\n          d._OrtTrainingCreateSession = (a, b, c, e, g, h, k, p) => (d._OrtTrainingCreateSession = G.na)(a, b, c, e, g, h, k, p);\n          d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = G.oa)(a);\n          d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = G.pa)(a, b, c, e, g, h);\n          d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = G.qa)(a, b);\n          d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = G.ra)(a, b, c, e, g, h);\n          d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = G.sa)(a, b, c);\n          d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = G.ta)(a, b, c, e);\n          d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = G.ua)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = G.va)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = G.wa)(a, b, c, e);\n          d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = G.xa)(a);\n          var za = d._malloc = (a) => (za = d._malloc = G.ya)(a);\n          d._free = (a) => (d._free = G.za)(a);\n          var Na = (a) => (Na = G.Ba)(a), Qa = () => (Qa = G.Ca)(), Ra = (a) => (Ra = G.Da)(a), Sa = (a) => (Sa = G.Ea)(a);\n          d.___start_em_js = 975904;\n          d.___stop_em_js = 976516;\n          function Pa(a) {\n            a = Object.assign({}, a);\n            var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          d.stackAlloc = Sa;\n          d.stackSave = Qa;\n          d.stackRestore = Ra;\n          d.addFunction = Ma;\n          d.UTF8ToString = S;\n          d.stringToUTF8 = (a, b, c) => U(a, I, b, c);\n          d.lengthBytesUTF8 = T;\n          var Z;\n          O = function Ta() {\n            Z || Ua();\n            Z || (O = Ta);\n          };\n          function Ua() {\n            function a() {\n              if (!Z && (Z = true, d.calledRun = true, !fa)) {\n                R(ja);\n                aa(d);\n                if (d.onRuntimeInitialized)\n                  d.onRuntimeInitialized();\n                if (d.postRun)\n                  for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {\n                    var b = d.postRun.shift();\n                    ka.unshift(b);\n                  }\n                R(ka);\n              }\n            }\n            if (!(0 < M)) {\n              if (d.preRun)\n                for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )\n                  la();\n              R(ia);\n              0 < M || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {\n                setTimeout(function() {\n                  d.setStatus("");\n                }, 1);\n                a();\n              }, 1)) : a());\n            }\n          }\n          if (d.preInit)\n            for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )\n              d.preInit.pop()();\n          Ua();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function aa() {\n            e.buffer != l.buffer && m();\n            return l;\n          }\n          function n() {\n            e.buffer != l.buffer && m();\n            return ba;\n          }\n          function p() {\n            e.buffer != l.buffer && m();\n            return ca;\n          }\n          function t() {\n            e.buffer != l.buffer && m();\n            return da;\n          }\n          function ea() {\n            e.buffer != l.buffer && m();\n            return fa;\n          }\n          var w = moduleArg, ha, x;\n          w.ready = new Promise((a, b) => {\n            ha = a;\n            x = b;\n          });\n          var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {\n            throw b;\n          }, ka = "object" == typeof window, A = "function" == typeof importScripts, C = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function la(a) {\n            return w.locateFile ? w.locateFile(a, E) : E + a;\n          }\n          var ma, F, G;\n          if (C) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));\n            E = A ? na.dirname(E) + "/" : __dirname + "/";\n            ma = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            G = (b) => {\n              b = ma(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            F = (b, c, d, g = true) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              fs.readFile(b, g ? void 0 : "utf8", (h, k) => {\n                h ? d(h) : c(g ? k.buffer : k);\n              });\n            };\n            !w.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            z = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            w.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (ka || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", C || (ma = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, A && (G = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), F = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          C && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var oa = console.log.bind(console), pa = console.error.bind(console);\n          C && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var qa = w.print || oa, I = w.printErr || pa;\n          Object.assign(w, ia);\n          ia = null;\n          w.thisProgram && (ja = w.thisProgram);\n          w.quit && (z = w.quit);\n          var J;\n          w.wasmBinary && (J = w.wasmBinary);\n          var noExitRuntime = w.noExitRuntime || true;\n          "object" != typeof WebAssembly && K("no native wasm support detected");\n          var e, L, ra, M = false, N, l, ba, ca, da, fa;\n          function m() {\n            var a = e.buffer;\n            w.HEAP8 = l = new Int8Array(a);\n            w.HEAP16 = new Int16Array(a);\n            w.HEAP32 = ca = new Int32Array(a);\n            w.HEAPU8 = ba = new Uint8Array(a);\n            w.HEAPU16 = new Uint16Array(a);\n            w.HEAPU32 = da = new Uint32Array(a);\n            w.HEAPF32 = new Float32Array(a);\n            w.HEAPF64 = fa = new Float64Array(a);\n          }\n          var O = w.INITIAL_MEMORY || 16777216;\n          5242880 <= O || K("INITIAL_MEMORY should be larger than STACK_SIZE, was " + O + "! (STACK_SIZE=5242880)");\n          if (D)\n            e = w.wasmMemory;\n          else if (w.wasmMemory)\n            e = w.wasmMemory;\n          else if (e = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(e.buffer instanceof SharedArrayBuffer))\n            throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), C && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          m();\n          O = e.buffer.byteLength;\n          var P, sa = [], ta = [], ua = [], va = 0;\n          function Q() {\n            return noExitRuntime || 0 < va;\n          }\n          var R = 0, wa = null, S = null;\n          function xa() {\n            R++;\n            w.monitorRunDependencies && w.monitorRunDependencies(R);\n          }\n          function ya() {\n            R--;\n            w.monitorRunDependencies && w.monitorRunDependencies(R);\n            if (0 == R && (null !== wa && (clearInterval(wa), wa = null), S)) {\n              var a = S;\n              S = null;\n              a();\n            }\n          }\n          function K(a) {\n            if (w.onAbort)\n              w.onAbort(a);\n            a = "Aborted(" + a + ")";\n            I(a);\n            M = true;\n            N = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            x(a);\n            throw a;\n          }\n          function za(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var T;\n          T = "ort-wasm-threaded.wasm";\n          za(T) || (T = la(T));\n          function Aa(a) {\n            if (a == T && J)\n              return new Uint8Array(J);\n            if (G)\n              return G(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ba(a) {\n            if (!J && (ka || A)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Aa(a));\n              if (F)\n                return new Promise((b, c) => {\n                  F(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => Aa(a));\n          }\n          function Ca(a, b, c) {\n            return Ba(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              I("failed to asynchronously prepare wasm: " + d);\n              K(d);\n            });\n          }\n          function Da(a, b) {\n            var c = T;\n            return J || "function" != typeof WebAssembly.instantiateStreaming || za(c) || c.startsWith("file://") || C || "function" != typeof fetch ? Ca(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {\n              I("wasm streaming compile failed: " + g);\n              I("falling back to ArrayBuffer instantiation");\n              return Ca(c, a, b);\n            }));\n          }\n          var U;\n          function Ea(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          function Fa(a) {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }\n          function Ga(a) {\n            (a = V.Ma[a]) || K();\n            V.mb(a);\n          }\n          function Ha(a) {\n            var b = V.gb();\n            if (!b)\n              return 6;\n            V.Pa.push(b);\n            V.Ma[a.Oa] = b;\n            b.Oa = a.Oa;\n            var c = { cmd: "run", start_routine: a.nb, arg: a.fb, pthread_ptr: a.Oa };\n            C && b.unref();\n            b.postMessage(c, a.tb);\n            return 0;\n          }\n          var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ia)\n              return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  d += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var k = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;\n                  65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                d += String.fromCharCode(g);\n            }\n            return d;\n          }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";\n          function La(a) {\n            if (D)\n              return W(1, 1, a);\n            N = a;\n            if (!Q()) {\n              V.ob();\n              if (w.onExit)\n                w.onExit(a);\n              M = true;\n            }\n            z(a, new Ea(a));\n          }\n          var Na = (a) => {\n            N = a;\n            if (D)\n              throw Ma(a), "unwind";\n            La(a);\n          }, V = {\n            Sa: [],\n            Pa: [],\n            $a: [],\n            Ma: {},\n            Wa: function() {\n              D ? V.ib() : V.hb();\n            },\n            hb: function() {\n              sa.unshift(() => {\n                xa();\n                V.jb(() => ya());\n              });\n            },\n            ib: function() {\n              V.receiveObjectTransfer = V.lb;\n              V.threadInitTLS = V.Za;\n              V.setExitStatus = V.Ya;\n              noExitRuntime = false;\n            },\n            Ya: function(a) {\n              N = a;\n            },\n            yb: ["$terminateWorker"],\n            ob: function() {\n              for (var a of V.Pa)\n                Fa(a);\n              for (a of V.Sa)\n                Fa(a);\n              V.Sa = [];\n              V.Pa = [];\n              V.Ma = [];\n            },\n            mb: function(a) {\n              var b = a.Oa;\n              delete V.Ma[b];\n              V.Sa.push(a);\n              V.Pa.splice(V.Pa.indexOf(a), 1);\n              a.Oa = 0;\n              Oa(b);\n            },\n            lb: function() {\n            },\n            Za: function() {\n              V.$a.forEach((a) => a());\n            },\n            kb: (a) => new Promise((b) => {\n              a.onmessage = (h) => {\n                h = h.data;\n                var k = h.cmd;\n                if (h.targetThread && h.targetThread != Pa()) {\n                  var q = V.Ma[h.xb];\n                  q ? q.postMessage(h, h.transferList) : I(\'Internal error! Worker sent a message "\' + k + \'" to target pthread \' + h.targetThread + ", but that thread no longer exists!");\n                } else if ("checkMailbox" === k)\n                  Qa();\n                else if ("spawnThread" === k)\n                  Ha(h);\n                else if ("cleanupThread" === k)\n                  Ga(h.thread);\n                else if ("killThread" === k)\n                  h = h.thread, k = V.Ma[h], delete V.Ma[h], Fa(k), Oa(h), V.Pa.splice(\n                    V.Pa.indexOf(k),\n                    1\n                  ), k.Oa = 0;\n                else if ("cancelThread" === k)\n                  V.Ma[h.thread].postMessage({ cmd: "cancel" });\n                else if ("loaded" === k)\n                  a.loaded = true, b(a);\n                else if ("alert" === k)\n                  alert("Thread " + h.threadId + ": " + h.text);\n                else if ("setimmediate" === h.target)\n                  a.postMessage(h);\n                else if ("callHandler" === k)\n                  w[h.handler](...h.args);\n                else\n                  k && I("worker sent an unknown command " + k);\n              };\n              a.onerror = (h) => {\n                I("worker sent an error! " + h.filename + ":" + h.lineno + ": " + h.message);\n                throw h;\n              };\n              C && (a.on("message", function(h) {\n                a.onmessage({ data: h });\n              }), a.on("error", function(h) {\n                a.onerror(h);\n              }));\n              var c = [], d = ["onExit", "onAbort", "print", "printErr"], g;\n              for (g of d)\n                w.hasOwnProperty(g) && c.push(g);\n              a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: e, wasmModule: ra });\n            }),\n            jb: function(a) {\n              a();\n            },\n            eb: function() {\n              var a = la("ort-wasm-threaded.worker.js");\n              a = new Worker(a);\n              V.Sa.push(a);\n            },\n            gb: function() {\n              0 == V.Sa.length && (V.eb(), V.kb(V.Sa[0]));\n              return V.Sa.pop();\n            }\n          };\n          w.PThread = V;\n          var Ra = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(w);\n          };\n          w.establishStackSpace = function() {\n            var a = Pa(), b = p()[a + 52 >> 2 >>> 0];\n            a = p()[a + 56 >> 2 >>> 0];\n            Sa(b, b - a);\n            Ta(b);\n          };\n          function Ma(a) {\n            if (D)\n              return W(2, 0, a);\n            Na(a);\n          }\n          var X = [], Ua = (a) => {\n            var b = X[a];\n            b || (a >= X.length && (X.length = a + 1), X[a] = b = P.get(a));\n            return b;\n          };\n          w.invokeEntryPoint = function(a, b) {\n            a = Ua(a)(b);\n            Q() ? V.Ya(a) : Va(a);\n          };\n          function Wa(a) {\n            this.Va = a - 24;\n            this.cb = function(b) {\n              t()[this.Va + 4 >> 2 >>> 0] = b;\n            };\n            this.bb = function(b) {\n              t()[this.Va + 8 >> 2 >>> 0] = b;\n            };\n            this.Wa = function(b, c) {\n              this.ab();\n              this.cb(b);\n              this.bb(c);\n            };\n            this.ab = function() {\n              t()[this.Va + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var Xa = 0, Ya = 0;\n          function Za(a, b, c, d) {\n            return D ? W(3, 1, a, b, c, d) : $a(a, b, c, d);\n          }\n          function $a(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var g = [];\n            if (D && 0 === g.length)\n              return Za(a, b, c, d);\n            a = { nb: c, Oa: a, fb: d, tb: g };\n            return D ? (a.vb = "spawnThread", postMessage(a, g), 0) : Ha(a);\n          }\n          function ab(a, b, c) {\n            return D ? W(4, 1, a, b, c) : 0;\n          }\n          function bb(a, b) {\n            if (D)\n              return W(5, 1, a, b);\n          }\n          var cb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, db = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var g = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var k = a.charCodeAt(h);\n              if (55296 <= k && 57343 >= k) {\n                var q = a.charCodeAt(++h);\n                k = 65536 + ((k & 1023) << 10) | q & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, eb = (a, b, c) => db(a, n(), b, c);\n          function fb(a, b) {\n            if (D)\n              return W(6, 1, a, b);\n          }\n          function gb(a, b, c) {\n            if (D)\n              return W(7, 1, a, b, c);\n          }\n          function hb(a, b, c) {\n            return D ? W(8, 1, a, b, c) : 0;\n          }\n          function ib(a, b) {\n            if (D)\n              return W(9, 1, a, b);\n          }\n          function jb(a, b, c) {\n            if (D)\n              return W(10, 1, a, b, c);\n          }\n          function kb(a, b, c, d) {\n            if (D)\n              return W(11, 1, a, b, c, d);\n          }\n          function lb(a, b, c, d) {\n            if (D)\n              return W(12, 1, a, b, c, d);\n          }\n          function mb(a, b, c, d) {\n            if (D)\n              return W(13, 1, a, b, c, d);\n          }\n          function nb(a) {\n            if (D)\n              return W(14, 1, a);\n          }\n          function ob(a, b) {\n            if (D)\n              return W(15, 1, a, b);\n          }\n          function pb(a, b, c) {\n            if (D)\n              return W(16, 1, a, b, c);\n          }\n          var qb = (a) => {\n            if (!M)\n              try {\n                if (a(), !Q())\n                  try {\n                    D ? Va(N) : Na(N);\n                  } catch (b) {\n                    b instanceof Ea || "unwind" == b || z(1, b);\n                  }\n              } catch (b) {\n                b instanceof Ea || "unwind" == b || z(1, b);\n              }\n          };\n          function rb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.ub && (Atomics.ub(p(), a >> 2, a).value.then(Qa), a += 128, Atomics.store(p(), a >> 2, 1));\n          }\n          w.__emscripten_thread_mailbox_await = rb;\n          function Qa() {\n            var a = Pa();\n            a && (rb(a), qb(() => sb()));\n          }\n          w.checkMailbox = Qa;\n          var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), tb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ub = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function vb(a, b, c, d, g, h, k, q) {\n            return D ? W(17, 1, a, b, c, d, g, h, k, q) : -52;\n          }\n          function wb(a, b, c, d, g, h, k) {\n            if (D)\n              return W(18, 1, a, b, c, d, g, h, k);\n          }\n          var yb = (a) => {\n            var b = cb(a) + 1, c = xb(b);\n            c && eb(a, c, b);\n            return c;\n          }, Ab = (a) => {\n            var b = zb();\n            a = a();\n            Ta(b);\n            return a;\n          };\n          function W(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return Ab(() => {\n              for (var g = Bb(8 * c), h = g >> 3, k = 0; k < c; k++) {\n                var q = d[2 + k];\n                ea()[h + k >>> 0] = q;\n              }\n              return Cb(a, c, g, b);\n            });\n          }\n          var Db = [], Eb = {}, Gb = () => {\n            if (!Fb) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;\n              for (b in Eb)\n                void 0 === Eb[b] ? delete a[b] : a[b] = Eb[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Fb = c;\n            }\n            return Fb;\n          }, Fb;\n          function Hb(a, b) {\n            if (D)\n              return W(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Gb().forEach(function(d, g) {\n              var h = b + c;\n              g = t()[a + 4 * g >> 2 >>> 0] = h;\n              for (h = 0; h < d.length; ++h)\n                aa()[g++ >> 0 >>> 0] = d.charCodeAt(h);\n              aa()[g >> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Ib(a, b) {\n            if (D)\n              return W(20, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Gb();\n            t()[a >> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach(function(g) {\n              d += g.length + 1;\n            });\n            t()[b >> 2 >>> 0] = d;\n            return 0;\n          }\n          function Jb(a) {\n            return D ? W(21, 1, a) : 52;\n          }\n          function Nb(a, b, c, d) {\n            return D ? W(22, 1, a, b, c, d) : 52;\n          }\n          function Ob(a, b, c, d, g) {\n            return D ? W(23, 1, a, b, c, d, g) : 70;\n          }\n          var Pb = [null, [], []];\n          function Qb(a, b, c, d) {\n            if (D)\n              return W(24, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var g = 0, h = 0; h < c; h++) {\n              var k = t()[b >> 2 >>> 0], q = t()[b + 4 >> 2 >>> 0];\n              b += 8;\n              for (var B = 0; B < q; B++) {\n                var v = n()[k + B >>> 0], y = Pb[a];\n                0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);\n              }\n              g += q;\n            }\n            t()[d >> 2 >>> 0] = g;\n            return 0;\n          }\n          var Rb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Sb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Tb(a) {\n            var b = Array(cb(a) + 1);\n            db(a, b, 0, b.length);\n            return b;\n          }\n          var Ub = (a, b) => {\n            aa().set(a, b >>> 0);\n          };\n          function Vb(a, b, c, d) {\n            function g(f, r, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )\n                f = u[0] + f;\n              return f;\n            }\n            function h(f, r) {\n              return g(f, r, "0");\n            }\n            function k(f, r) {\n              function u(Kb) {\n                return 0 > Kb ? -1 : 0 < Kb ? 1 : 0;\n              }\n              var H;\n              0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));\n              return H;\n            }\n            function q(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function B(f) {\n              var r = f.Qa;\n              for (f = new Date(new Date(f.Ra + 1900, 0, 1).getTime()); 0 < r; ) {\n                var u = f.getMonth(), H = (Y(f.getFullYear()) ? Rb : Sb)[u];\n                if (r > H - f.getDate())\n                  r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + r);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              r = q(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = q(u);\n              return 0 >= k(r, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var v = p()[d + 40 >> 2 >>> 0];\n            d = { rb: p()[d >> 2 >>> 0], qb: p()[d + 4 >> 2 >>> 0], Ta: p()[d + 8 >> 2 >>> 0], Xa: p()[d + 12 >> 2 >>> 0], Ua: p()[d + 16 >> 2 >>> 0], Ra: p()[d + 20 >> 2 >>> 0], Na: p()[d + 24 >> 2 >>> 0], Qa: p()[d + 28 >> 2 >>> 0], zb: p()[d + 32 >> 2 >>> 0], pb: p()[d + 36 >> 2 >>> 0], sb: v ? Ka(v) : "" };\n            c = Ka(c);\n            v = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var y in v)\n              c = c.replace(new RegExp(y, "g"), v[y]);\n            var Lb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Mb = "January February March April May June July August September October November December".split(" ");\n            v = {\n              "%a": (f) => Lb[f.Na].substring(0, 3),\n              "%A": (f) => Lb[f.Na],\n              "%b": (f) => Mb[f.Ua].substring(0, 3),\n              "%B": (f) => Mb[f.Ua],\n              "%C": (f) => h((f.Ra + 1900) / 100 | 0, 2),\n              "%d": (f) => h(f.Xa, 2),\n              "%e": (f) => g(f.Xa, 2, " "),\n              "%g": (f) => B(f).toString().substring(2),\n              "%G": (f) => B(f),\n              "%H": (f) => h(f.Ta, 2),\n              "%I": (f) => {\n                f = f.Ta;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return h(f, 2);\n              },\n              "%j": (f) => {\n                for (var r = 0, u = 0; u <= f.Ua - 1; r += (Y(f.Ra + 1900) ? Rb : Sb)[u++])\n                  ;\n                return h(f.Xa + r, 3);\n              },\n              "%m": (f) => h(f.Ua + 1, 2),\n              "%M": (f) => h(f.qb, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Ta && 12 > f.Ta ? "AM" : "PM",\n              "%S": (f) => h(f.rb, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Na || 7,\n              "%U": (f) => h(Math.floor((f.Qa + 7 - f.Na) / 7), 2),\n              "%V": (f) => {\n                var r = Math.floor((f.Qa + 7 - (f.Na + 6) % 7) / 7);\n                2 >= (f.Na + 371 - f.Qa - 2) % 7 && r++;\n                if (r)\n                  53 == r && (u = (f.Na + 371 - f.Qa) % 7, 4 == u || 3 == u && Y(f.Ra) || (r = 1));\n                else {\n                  r = 52;\n                  var u = (f.Na + 7 - f.Qa - 1) % 7;\n                  (4 == u || 5 == u && Y(f.Ra % 400 - 1)) && r++;\n                }\n                return h(r, 2);\n              },\n              "%w": (f) => f.Na,\n              "%W": (f) => h(Math.floor((f.Qa + 7 - (f.Na + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Ra + 1900).toString().substring(2),\n              "%Y": (f) => f.Ra + 1900,\n              "%z": (f) => {\n                f = f.pb;\n                var r = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.sb,\n              "%%": () => "%"\n            };\n            c = c.replace(\n              /%%/g,\n              "\\0\\0"\n            );\n            for (y in v)\n              c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            y = Tb(c);\n            if (y.length > b)\n              return 0;\n            Ub(y, a);\n            return y.length - 1;\n          }\n          var Z = void 0, Wb = [];\n          function Xb(a, b) {\n            if (!Z) {\n              Z = /* @__PURE__ */ new WeakMap();\n              var c = P.length;\n              if (Z)\n                for (var d = 0; d < 0 + c; d++) {\n                  var g = Ua(d);\n                  g && Z.set(g, d);\n                }\n            }\n            if (c = Z.get(a) || 0)\n              return c;\n            if (Wb.length)\n              c = Wb.pop();\n            else {\n              try {\n                P.grow(1);\n              } catch (q) {\n                if (!(q instanceof RangeError))\n                  throw q;\n                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";\n              }\n              c = P.length - 1;\n            }\n            try {\n              d = c, P.set(d, a), X[d] = P.get(d);\n            } catch (q) {\n              if (!(q instanceof TypeError))\n                throw q;\n              if ("function" == typeof WebAssembly.Function) {\n                d = WebAssembly.Function;\n                g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };\n                for (var h = {\n                  parameters: [],\n                  results: "v" == b[0] ? [] : [g[b[0]]]\n                }, k = 1; k < b.length; ++k)\n                  h.parameters.push(g[b[k]]);\n                b = new d(h, a);\n              } else {\n                d = [1];\n                g = b.slice(0, 1);\n                b = b.slice(1);\n                h = { i: 127, p: 127, j: 126, f: 125, d: 124 };\n                d.push(96);\n                k = b.length;\n                128 > k ? d.push(k) : d.push(k % 128 | 128, k >> 7);\n                for (k = 0; k < b.length; ++k)\n                  d.push(h[b[k]]);\n                "v" == g ? d.push(0) : d.push(1, h[g]);\n                b = [0, 97, 115, 109, 1, 0, 0, 0, 1];\n                g = d.length;\n                128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);\n                b.push.apply(b, d);\n                b.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);\n                b = new WebAssembly.Module(new Uint8Array(b));\n                b = new WebAssembly.Instance(\n                  b,\n                  { e: { f: a } }\n                ).exports.f;\n              }\n              d = c;\n              P.set(d, b);\n              X[d] = P.get(d);\n            }\n            Z.set(a, c);\n            return c;\n          }\n          V.Wa();\n          var Yb = [null, La, Ma, Za, ab, bb, fb, gb, hb, ib, jb, kb, lb, mb, nb, ob, pb, vb, wb, Hb, Ib, Jb, Nb, Ob, Qb], ac = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new Wa(a).Wa(b >>> 0, c >>> 0);\n              Xa = a;\n              Ya++;\n              throw Xa;\n            },\n            N: function(a) {\n              Zb(a >>> 0, !A, 1, !ka, 131072, false);\n              V.Za();\n            },\n            k: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);\n            },\n            I: $a,\n            h: ab,\n            T: bb,\n            D: fb,\n            F: gb,\n            U: hb,\n            R: ib,\n            J: jb,\n            Q: kb,\n            o: lb,\n            E: mb,\n            B: nb,\n            S: ob,\n            C: pb,\n            q: () => true,\n            z: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => Qa()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.Ma[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            L: function() {\n              return -1;\n            },\n            M: rb,\n            p: function(a) {\n              C && V.Ma[a >>> 0].ref();\n            },\n            t: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getUTCSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              p()[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              p()[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              p()[c + 28 >> 2 >>> 0] = a;\n            },\n            u: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getHours();\n              p()[c + 12 >> 2 >>> 0] = a.getDate();\n              p()[c + 16 >> 2 >>> 0] = a.getMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getDay();\n              b = (Y(a.getFullYear()) ? tb : ub)[a.getMonth()] + a.getDate() - 1 | 0;\n              p()[c + 28 >> 2 >>> 0] = b;\n              p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n              p()[c + 32 >> 2 >>> 0] = a;\n            },\n            v: function(a) {\n              a >>>= 0;\n              var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);\n              0 > c ? p()[a + 32 >> 2 >>> 0] = Number(g != h && k == d) : 0 < c != (k == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - d)));\n              p()[a + 24 >> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? tb : ub)[b.getMonth()] + b.getDate() - 1 | 0;\n              p()[a + 28 >> 2 >>> 0] = c;\n              p()[a >> 2 >>> 0] = b.getSeconds();\n              p()[a + 4 >> 2 >>> 0] = b.getMinutes();\n              p()[a + 8 >> 2 >>> 0] = b.getHours();\n              p()[a + 12 >> 2 >>> 0] = b.getDate();\n              p()[a + 16 >> 2 >>> 0] = b.getMonth();\n              p()[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return $b((U = a, 1 <= +Math.abs(U) ? 0 < U ? +Math.floor(U / 4294967296) >>> 0 : ~~+Math.ceil((U - +(~~U >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            r: vb,\n            s: wb,\n            y: function(a, b, c) {\n              function d(v) {\n                return (v = v.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? v[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var q = k.getTimezoneOffset(), B = Math.max(g, q);\n              t()[a >> 2 >>> 0] = 60 * B;\n              p()[b >> 2 >>> 0] = Number(g != q);\n              a = d(h);\n              b = d(k);\n              a = yb(a);\n              b = yb(b);\n              q < g ? (t()[c >> 2 >>> 0] = a, t()[c + 4 >> 2 >>> 0] = b) : (t()[c >> 2 >>> 0] = b, t()[c + 4 >> 2 >>> 0] = a);\n            },\n            c: () => {\n              K("");\n            },\n            l: function() {\n            },\n            i: function() {\n              return Date.now();\n            },\n            V: () => {\n              va += 1;\n              throw "unwind";\n            },\n            A: function() {\n              return 4294901760;\n            },\n            e: () => performance.timeOrigin + performance.now(),\n            f: function() {\n              return C ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;\n            },\n            K: function(a, b, c, d) {\n              V.wb = b >>> 0;\n              Db.length = c;\n              b = d >>> 0 >> 3;\n              for (d = 0; d < c; d++)\n                Db[d] = ea()[b + d >>> 0];\n              return Yb[a].apply(null, Db);\n            },\n            x: function(a) {\n              a >>>= 0;\n              var b = n().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var g = Math;\n                d = Math.max(a, d);\n                a: {\n                  g = g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - e.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    e.grow(g);\n                    m();\n                    var h = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            O: Hb,\n            P: Ib,\n            H: Na,\n            g: Jb,\n            n: Nb,\n            w: Ob,\n            m: Qb,\n            a: e || w.wasmMemory,\n            G: Vb,\n            d: function(a, b, c, d) {\n              return Vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            },\n            j: function(a, b, c, d) {\n              const g = P.length;\n              a = new Uint8Array(n().slice(a + b, a + c));\n              try {\n                var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: e } }), q;\n                for (q in k.exports)\n                  Xb(k.exports[q]);\n                return g < P.length ? g : d;\n              } catch (B) {\n                return console.log(B), d;\n              }\n            }\n          };\n          (function() {\n            function a(c, d) {\n              c = c.exports;\n              L = c = bc(c);\n              V.$a.push(L.za);\n              P = L.Aa;\n              ta.unshift(L.W);\n              ra = d;\n              ya();\n              return c;\n            }\n            var b = { a: ac };\n            xa();\n            if (w.instantiateWasm)\n              try {\n                return w.instantiateWasm(b, a);\n              } catch (c) {\n                I("Module.instantiateWasm callback failed with error: " + c), x(c);\n              }\n            Da(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(x);\n            return {};\n          })();\n          w._OrtInit = (a, b) => (w._OrtInit = L.X)(a, b);\n          w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.Y)(a, b);\n          w._OrtCreateSessionOptions = (a, b, c, d, g, h, k, q, B, v) => (w._OrtCreateSessionOptions = L.Z)(a, b, c, d, g, h, k, q, B, v);\n          w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L._)(a, b);\n          w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L.$)(a, b, c);\n          w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.aa)(a, b, c);\n          w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.ba)(a);\n          w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ca)(a, b, c);\n          w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.da)(a);\n          w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.ea)(a, b, c);\n          w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.fa)(a, b);\n          w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.ga)(a, b);\n          w._OrtFree = (a) => (w._OrtFree = L.ha)(a);\n          w._OrtCreateTensor = (a, b, c, d, g, h) => (w._OrtCreateTensor = L.ia)(a, b, c, d, g, h);\n          w._OrtGetTensorData = (a, b, c, d, g) => (w._OrtGetTensorData = L.ja)(a, b, c, d, g);\n          w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ka)(a);\n          w._OrtCreateRunOptions = (a, b, c, d) => (w._OrtCreateRunOptions = L.la)(a, b, c, d);\n          w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.ma)(a, b, c);\n          w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.na)(a);\n          w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.oa)(a);\n          w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.pa)(a, b, c);\n          w._OrtBindOutput = (a, b, c, d) => (w._OrtBindOutput = L.qa)(a, b, c, d);\n          w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.ra)(a);\n          w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.sa)(a);\n          w._OrtRunWithBinding = (a, b, c, d, g) => (w._OrtRunWithBinding = L.ta)(a, b, c, d, g);\n          w._OrtRun = (a, b, c, d, g, h, k, q) => (w._OrtRun = L.ua)(a, b, c, d, g, h, k, q);\n          w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.va)(a);\n          var Pa = w._pthread_self = () => (Pa = w._pthread_self = L.wa)(), xb = w._malloc = (a) => (xb = w._malloc = L.xa)(a);\n          w._free = (a) => (w._free = L.ya)(a);\n          w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.za)();\n          var Zb = w.__emscripten_thread_init = (a, b, c, d, g, h) => (Zb = w.__emscripten_thread_init = L.Ba)(a, b, c, d, g, h);\n          w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ca)();\n          var Cb = (a, b, c, d) => (Cb = L.Da)(a, b, c, d), Oa = (a) => (Oa = L.Ea)(a), Va = w.__emscripten_thread_exit = (a) => (Va = w.__emscripten_thread_exit = L.Fa)(a), sb = w.__emscripten_check_mailbox = () => (sb = w.__emscripten_check_mailbox = L.Ga)(), $b = (a) => ($b = L.Ha)(a), Sa = (a, b) => (Sa = L.Ia)(a, b), zb = () => (zb = L.Ja)(), Ta = (a) => (Ta = L.Ka)(a), Bb = (a) => (Bb = L.La)(a);\n          w.___start_em_js = 906844;\n          w.___stop_em_js = 907456;\n          function bc(a) {\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.pthread_self = b(a.pthread_self);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          w.keepRuntimeAlive = Q;\n          w.wasmMemory = e;\n          w.stackAlloc = Bb;\n          w.stackSave = zb;\n          w.stackRestore = Ta;\n          w.addFunction = Xb;\n          w.UTF8ToString = Ka;\n          w.stringToUTF8 = eb;\n          w.lengthBytesUTF8 = cb;\n          w.ExitStatus = Ea;\n          w.PThread = V;\n          var cc;\n          S = function dc() {\n            cc || ec();\n            cc || (S = dc);\n          };\n          function ec() {\n            function a() {\n              if (!cc && (cc = true, w.calledRun = true, !M)) {\n                D || Ra(ta);\n                ha(w);\n                if (w.onRuntimeInitialized)\n                  w.onRuntimeInitialized();\n                if (!D) {\n                  if (w.postRun)\n                    for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {\n                      var b = w.postRun.shift();\n                      ua.unshift(b);\n                    }\n                  Ra(ua);\n                }\n              }\n            }\n            if (!(0 < R))\n              if (D)\n                ha(w), D || Ra(ta), startWorker(w);\n              else {\n                if (w.preRun)\n                  for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )\n                    sa.unshift(w.preRun.shift());\n                Ra(sa);\n                0 < R || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {\n                  setTimeout(\n                    function() {\n                      w.setStatus("");\n                    },\n                    1\n                  );\n                  a();\n                }, 1)) : a());\n              }\n          }\n          if (w.preInit)\n            for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )\n              w.preInit.pop()();\n          ec();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "xnnpack":\n          epName = "XNNPACK";\n          break;\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var ortEnvInitialized = false;\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n    if (false) {\n      const initJsep = null.init;\n      await initJsep(getInstance(), env);\n    }\n    ortEnvInitialized = true;\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var isOrtEnvInitialized = () => ortEnvInitialized;\n  var createSessionAllocate = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSessionFinalize = (modelData, options) => {\n    const wasm2 = getInstance();\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelData[0]);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n    }\n  };\n  var createSession = (model, options) => {\n    const modelData = createSessionAllocate(model);\n    return createSessionFinalize(modelData, options);\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    switch (ev.data.type) {\n      case "init-wasm":\n        try {\n          initializeWebAssembly(ev.data.in).then(\n            () => postMessage({ type: "init-wasm" }),\n            (err) => postMessage({ type: "init-wasm", err })\n          );\n        } catch (err) {\n          postMessage({ type: "init-wasm", err });\n        }\n        break;\n      case "init-ort":\n        try {\n          initRuntime(ev.data.in).then(() => postMessage({ type: "init-ort" }), (err) => postMessage({\n            type: "init-ort",\n            err\n          }));\n        } catch (err) {\n          postMessage({ type: "init-ort", err });\n        }\n        break;\n      case "create_allocate":\n        try {\n          const { model } = ev.data.in;\n          const modeldata = createSessionAllocate(model);\n          postMessage({ type: "create_allocate", out: modeldata });\n        } catch (err) {\n          postMessage({ type: "create_allocate", err });\n        }\n        break;\n      case "create_finalize":\n        try {\n          const { modeldata, options } = ev.data.in;\n          const sessionMetadata = createSessionFinalize(modeldata, options);\n          postMessage({ type: "create_finalize", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create_finalize", err });\n        }\n        break;\n      case "create":\n        try {\n          const { model, options } = ev.data.in;\n          const sessionMetadata = createSession(model, options);\n          postMessage({ type: "create", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create", err });\n        }\n        break;\n      case "release":\n        try {\n          const handler = ev.data.in;\n          releaseSession(handler);\n          postMessage({ type: "release" });\n        } catch (err) {\n          postMessage({ type: "release", err });\n        }\n        break;\n      case "run":\n        try {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = ev.data.in;\n          run(sessionId, inputIndices, inputs, outputIndices, options).then(\n            (outputs) => {\n              postMessage({ type: "run", out: outputs }, extractTransferableBuffers(outputs));\n            },\n            (err) => {\n              postMessage({ type: "run", err });\n            }\n          );\n        } catch (err) {\n          postMessage({ type: "run", err });\n        }\n        break;\n      case "end-profiling":\n        try {\n          const handler = ev.data.in;\n          endProfiling(handler);\n          postMessage({ type: "end-profiling" });\n        } catch (err) {\n          postMessage({ type: "end-profiling", err });\n        }\n        break;\n      case "is-ort-env-initialized":\n        try {\n          const ortEnvInitialized2 = isOrtEnvInitialized();\n          postMessage({ type: "is-ort-env-initialized", out: ortEnvInitialized2 });\n        } catch (err) {\n          postMessage({ type: "is-ort-env-initialized", err });\n        }\n        break;\n      default:\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb3JlLWltcGwudHMiLCAiLi4vLi4vbGliL3dhc20vcHJveHktd29ya2VyL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGQ9bW9kdWxlQXJnLGFhLGw7ZC5yZWFkeT1uZXcgUHJvbWlzZSgoYSxiKT0+e2FhPWE7bD1ifSk7dmFyIGJhPU9iamVjdC5hc3NpZ24oe30sZCksbT1cIi4vdGhpcy5wcm9ncmFtXCIsY2E9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyxyPVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsZGE9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLHc9XCJcIix4LHksejtcbmlmKGRhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLEI9cmVxdWlyZShcInBhdGhcIik7dz1yP0IuZGlybmFtZSh3KStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7eD0oYSxiKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkIubm9ybWFsaXplKGEpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYSxiP3ZvaWQgMDpcInV0ZjhcIil9O3o9YT0+e2E9eChhLCEwKTthLmJ1ZmZlcnx8KGE9bmV3IFVpbnQ4QXJyYXkoYSkpO3JldHVybiBhfTt5PShhLGIsYyxlPSEwKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkIubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZT92b2lkIDA6XCJ1dGY4XCIsKGcsaCk9PntnP2MoZyk6YihlP2guYnVmZmVyOmgpfSl9OyFkLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihtPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZC5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihjYXx8XG5yKXI/dz1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYodz1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHc9X3NjcmlwdERpciksMCE9PXcuaW5kZXhPZihcImJsb2I6XCIpP3c9dy5zdWJzdHIoMCx3LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnc9XCJcIix4PWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sciYmKHo9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLHk9KGEsYixjKT0+e3ZhciBlPW5ldyBYTUxIdHRwUmVxdWVzdDtlLm9wZW4oXCJHRVRcIixhLCEwKTtlLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtlLm9ubG9hZD0oKT0+ezIwMD09ZS5zdGF0dXN8fDA9PWUuc3RhdHVzJiZlLnJlc3BvbnNlP2IoZS5yZXNwb25zZSk6YygpfTtlLm9uZXJyb3I9YztlLnNlbmQobnVsbCl9O3ZhciBlYT1kLnByaW50fHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEM9ZC5wcmludEVycnx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZCxiYSk7YmE9bnVsbDtkLnRoaXNQcm9ncmFtJiYobT1kLnRoaXNQcm9ncmFtKTt2YXIgRDtkLndhc21CaW5hcnkmJihEPWQud2FzbUJpbmFyeSk7dmFyIG5vRXhpdFJ1bnRpbWU9ZC5ub0V4aXRSdW50aW1lfHwhMDtcIm9iamVjdFwiIT10eXBlb2YgV2ViQXNzZW1ibHkmJkUoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBGLEcsZmE9ITEsSCxJLEosSztcbmZ1bmN0aW9uIGhhKCl7dmFyIGE9Ri5idWZmZXI7ZC5IRUFQOD1IPW5ldyBJbnQ4QXJyYXkoYSk7ZC5IRUFQMTY9bmV3IEludDE2QXJyYXkoYSk7ZC5IRUFQMzI9Sj1uZXcgSW50MzJBcnJheShhKTtkLkhFQVBVOD1JPW5ldyBVaW50OEFycmF5KGEpO2QuSEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYSk7ZC5IRUFQVTMyPUs9bmV3IFVpbnQzMkFycmF5KGEpO2QuSEVBUEYzMj1uZXcgRmxvYXQzMkFycmF5KGEpO2QuSEVBUEY2ND1uZXcgRmxvYXQ2NEFycmF5KGEpfXZhciBMLGlhPVtdLGphPVtdLGthPVtdO2Z1bmN0aW9uIGxhKCl7dmFyIGE9ZC5wcmVSdW4uc2hpZnQoKTtpYS51bnNoaWZ0KGEpfXZhciBNPTAsTj1udWxsLE89bnVsbDtcbmZ1bmN0aW9uIEUoYSl7aWYoZC5vbkFib3J0KWQub25BYm9ydChhKTthPVwiQWJvcnRlZChcIithK1wiKVwiO0MoYSk7ZmE9ITA7YT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKGErXCIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uXCIpO2woYSk7dGhyb3cgYTt9ZnVuY3Rpb24gbWEoYSl7cmV0dXJuIGEuc3RhcnRzV2l0aChcImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxcIil9dmFyIFA7UD1cIm9ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbVwiO2lmKCFtYShQKSl7dmFyIG5hPVA7UD1kLmxvY2F0ZUZpbGU/ZC5sb2NhdGVGaWxlKG5hLHcpOncrbmF9ZnVuY3Rpb24gb2EoYSl7aWYoYT09UCYmRClyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoRCk7aWYoeilyZXR1cm4geihhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBwYShhKXtpZighRCYmKGNhfHxyKSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFhLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9Pm9hKGEpKTtpZih5KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3koYSxlPT5iKG5ldyBVaW50OEFycmF5KGUpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5vYShhKSl9ZnVuY3Rpb24gcWEoYSxiLGMpe3JldHVybiBwYShhKS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGUsYikpLnRoZW4oZT0+ZSkudGhlbihjLGU9PntDKFwiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogXCIrZSk7RShlKX0pfVxuZnVuY3Rpb24gcmEoYSxiKXt2YXIgYz1QO3JldHVybiBEfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8bWEoYyl8fGMuc3RhcnRzV2l0aChcImZpbGU6Ly9cIil8fGRhfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9xYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihlPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhlLGEpLnRoZW4oYixmdW5jdGlvbihnKXtDKFwid2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6IFwiK2cpO0MoXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gcWEoYyxhLGIpfSkpfXZhciBRLFI9YT0+e2Zvcig7MDxhLmxlbmd0aDspYS5zaGlmdCgpKGQpfTtcbmZ1bmN0aW9uIHNhKGEpe3RoaXMuS2E9YS0yNDt0aGlzLlBhPWZ1bmN0aW9uKGIpe0tbdGhpcy5LYSs0Pj4yPj4+MF09Yn07dGhpcy5PYT1mdW5jdGlvbihiKXtLW3RoaXMuS2ErOD4+Mj4+PjBdPWJ9O3RoaXMuTWE9ZnVuY3Rpb24oYixjKXt0aGlzLk5hKCk7dGhpcy5QYShiKTt0aGlzLk9hKGMpfTt0aGlzLk5hPWZ1bmN0aW9uKCl7S1t0aGlzLkthKzE2Pj4yPj4+MF09MH19XG52YXIgdGE9MCx1YT0wLHZhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCx3YT0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBlPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZSk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZ2YSlyZXR1cm4gdmEuZGVjb2RlKGEuc3ViYXJyYXkoYixjKSk7Zm9yKGU9XCJcIjtiPGM7KXt2YXIgZz1hW2IrK107aWYoZyYxMjgpe3ZhciBoPWFbYisrXSY2MztpZigxOTI9PShnJjIyNCkpZSs9U3RyaW5nLmZyb21DaGFyQ29kZSgoZyYzMSk8PDZ8aCk7ZWxzZXt2YXIgaz1hW2IrK10mNjM7Zz0yMjQ9PShnJjI0MCk/KGcmMTUpPDwxMnxoPDw2fGs6KGcmNyk8PDE4fGg8PDEyfGs8PDZ8YVtiKytdJjYzOzY1NTM2Pmc/ZSs9U3RyaW5nLmZyb21DaGFyQ29kZShnKTooZy09NjU1MzYsZSs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxnPj4xMCw1NjMyMHxnJjEwMjMpKX19ZWxzZSBlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpfXJldHVybiBlfSxcblM9KGEsYik9PihhPj4+PTApP3dhKEksYSxiKTpcIlwiLFQ9YT0+e2Zvcih2YXIgYj0wLGM9MDtjPGEubGVuZ3RoOysrYyl7dmFyIGU9YS5jaGFyQ29kZUF0KGMpOzEyNz49ZT9iKys6MjA0Nz49ZT9iKz0yOjU1Mjk2PD1lJiY1NzM0Mz49ZT8oYis9NCwrK2MpOmIrPTN9cmV0dXJuIGJ9LFU9KGEsYixjLGUpPT57Yz4+Pj0wO2lmKCEoMDxlKSlyZXR1cm4gMDt2YXIgZz1jO2U9YytlLTE7Zm9yKHZhciBoPTA7aDxhLmxlbmd0aDsrK2gpe3ZhciBrPWEuY2hhckNvZGVBdChoKTtpZig1NTI5Njw9ayYmNTczNDM+PWspe3ZhciBwPWEuY2hhckNvZGVBdCgrK2gpO2s9NjU1MzYrKChrJjEwMjMpPDwxMCl8cCYxMDIzfWlmKDEyNz49ayl7aWYoYz49ZSlicmVhaztiW2MrKz4+PjBdPWt9ZWxzZXtpZigyMDQ3Pj1rKXtpZihjKzE+PWUpYnJlYWs7YltjKys+Pj4wXT0xOTJ8az4+Nn1lbHNle2lmKDY1NTM1Pj1rKXtpZihjKzI+PWUpYnJlYWs7YltjKys+Pj4wXT0yMjR8az4+MTJ9ZWxzZXtpZihjKzM+PVxuZSlicmVhaztiW2MrKz4+PjBdPTI0MHxrPj4xODtiW2MrKz4+PjBdPTEyOHxrPj4xMiY2M31iW2MrKz4+PjBdPTEyOHxrPj42JjYzfWJbYysrPj4+MF09MTI4fGsmNjN9fWJbYz4+PjBdPTA7cmV0dXJuIGMtZ30sVj1hPT4wPT09YSU0JiYoMCE9PWElMTAwfHwwPT09YSU0MDApLHhhPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHlhPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdLERhPWE9Pnt2YXIgYj1UKGEpKzEsYz16YShiKTtjJiZVKGEsSSxjLGIpO3JldHVybiBjfSxXPXt9LEZhPSgpPT57aWYoIUVhKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXG5cIl9cIikrXCIuVVRGLThcIixfOm18fFwiLi90aGlzLnByb2dyYW1cIn0sYjtmb3IoYiBpbiBXKXZvaWQgMD09PVdbYl0/ZGVsZXRlIGFbYl06YVtiXT1XW2JdO3ZhciBjPVtdO2ZvcihiIGluIGEpYy5wdXNoKGAke2J9PSR7YVtiXX1gKTtFYT1jfXJldHVybiBFYX0sRWEsR2E9W251bGwsW10sW11dLEhhPVszMSwyOSwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV0sSWE9WzMxLDI4LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTtmdW5jdGlvbiBKYShhKXt2YXIgYj1BcnJheShUKGEpKzEpO1UoYSxiLDAsYi5sZW5ndGgpO3JldHVybiBifVxuZnVuY3Rpb24gS2EoYSxiLGMsZSl7ZnVuY3Rpb24gZyhmLG4scSl7Zm9yKGY9XCJudW1iZXJcIj09dHlwZW9mIGY/Zi50b1N0cmluZygpOmZ8fFwiXCI7Zi5sZW5ndGg8bjspZj1xWzBdK2Y7cmV0dXJuIGZ9ZnVuY3Rpb24gaChmLG4pe3JldHVybiBnKGYsbixcIjBcIil9ZnVuY3Rpb24gayhmLG4pe2Z1bmN0aW9uIHEoQWEpe3JldHVybiAwPkFhPy0xOjA8QWE/MTowfXZhciBBOzA9PT0oQT1xKGYuZ2V0RnVsbFllYXIoKS1uLmdldEZ1bGxZZWFyKCkpKSYmMD09PShBPXEoZi5nZXRNb250aCgpLW4uZ2V0TW9udGgoKSkpJiYoQT1xKGYuZ2V0RGF0ZSgpLW4uZ2V0RGF0ZSgpKSk7cmV0dXJuIEF9ZnVuY3Rpb24gcChmKXtzd2l0Y2goZi5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBmO2Nhc2UgMjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMSk7Y2FzZSA2OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIHQoZil7dmFyIG49Zi5HYTtmb3IoZj1uZXcgRGF0ZSgobmV3IERhdGUoZi5IYSsxOTAwLDAsMSkpLmdldFRpbWUoKSk7MDxuOyl7dmFyIHE9Zi5nZXRNb250aCgpLEE9KFYoZi5nZXRGdWxsWWVhcigpKT9IYTpJYSlbcV07aWYobj5BLWYuZ2V0RGF0ZSgpKW4tPUEtZi5nZXREYXRlKCkrMSxmLnNldERhdGUoMSksMTE+cT9mLnNldE1vbnRoKHErMSk6KGYuc2V0TW9udGgoMCksZi5zZXRGdWxsWWVhcihmLmdldEZ1bGxZZWFyKCkrMSkpO2Vsc2V7Zi5zZXREYXRlKGYuZ2V0RGF0ZSgpK24pO2JyZWFrfX1xPW5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSsxLDAsNCk7bj1wKG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSxcbjAsNCkpO3E9cChxKTtyZXR1cm4gMD49ayhuLGYpPzA+PWsocSxmKT9mLmdldEZ1bGxZZWFyKCkrMTpmLmdldEZ1bGxZZWFyKCk6Zi5nZXRGdWxsWWVhcigpLTF9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZT4+Pj0wO3ZhciB1PUpbZSs0MD4+Mj4+PjBdO2U9e1NhOkpbZT4+Mj4+PjBdLFJhOkpbZSs0Pj4yPj4+MF0sSWE6SltlKzg+PjI+Pj4wXSxMYTpKW2UrMTI+PjI+Pj4wXSxKYTpKW2UrMTY+PjI+Pj4wXSxIYTpKW2UrMjA+PjI+Pj4wXSxGYTpKW2UrMjQ+PjI+Pj4wXSxHYTpKW2UrMjg+PjI+Pj4wXSxVYTpKW2UrMzI+PjI+Pj4wXSxRYTpKW2UrMzY+PjI+Pj4wXSxUYTp1P1ModSk6XCJcIn07Yz1TKGMpO3U9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcIiVYXCI6XCIlSDolTTolU1wiLFwiJUVjXCI6XCIlY1wiLFxuXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgdiBpbiB1KWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodixcImdcIiksdVt2XSk7dmFyIEJhPVwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdChcIiBcIiksQ2E9XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO3U9e1wiJWFcIjpmPT5CYVtmLkZhXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zj0+QmFbZi5GYV0sXCIlYlwiOmY9PlxuQ2FbZi5KYV0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmY9PkNhW2YuSmFdLFwiJUNcIjpmPT5oKChmLkhhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5oKGYuTGEsMiksXCIlZVwiOmY9PmcoZi5MYSwyLFwiIFwiKSxcIiVnXCI6Zj0+dChmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+dChmKSxcIiVIXCI6Zj0+aChmLklhLDIpLFwiJUlcIjpmPT57Zj1mLklhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBoKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciBuPTAscT0wO3E8PWYuSmEtMTtuKz0oVihmLkhhKzE5MDApP0hhOklhKVtxKytdKTtyZXR1cm4gaChmLkxhK24sMyl9LFwiJW1cIjpmPT5oKGYuSmErMSwyKSxcIiVNXCI6Zj0+aChmLlJhLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5JYSYmMTI+Zi5JYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5oKGYuU2EsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLkZhfHw3LFwiJVVcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy1mLkZhKS83KSwyKSxcIiVWXCI6Zj0+XG57dmFyIG49TWF0aC5mbG9vcigoZi5HYSs3LShmLkZhKzYpJTcpLzcpOzI+PShmLkZhKzM3MS1mLkdhLTIpJTcmJm4rKztpZihuKTUzPT1uJiYocT0oZi5GYSszNzEtZi5HYSklNyw0PT1xfHwzPT1xJiZWKGYuSGEpfHwobj0xKSk7ZWxzZXtuPTUyO3ZhciBxPShmLkZhKzctZi5HYS0xKSU3Oyg0PT1xfHw1PT1xJiZWKGYuSGElNDAwLTEpKSYmbisrfXJldHVybiBoKG4sMil9LFwiJXdcIjpmPT5mLkZhLFwiJVdcIjpmPT5oKE1hdGguZmxvb3IoKGYuR2ErNy0oZi5GYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuSGErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuSGErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5RYTt2YXIgbj0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKG4/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYuVGEsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO2Zvcih2IGluIHUpYy5pbmNsdWRlcyh2KSYmXG4oYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh2LFwiZ1wiKSx1W3ZdKGUpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt2PUphKGMpO2lmKHYubGVuZ3RoPmIpcmV0dXJuIDA7SC5zZXQodixhPj4+MCk7cmV0dXJuIHYubGVuZ3RoLTF9dmFyIFg9W10sWT12b2lkIDAsTGE9W107XG5mdW5jdGlvbiBNYShhLGIpe2lmKCFZKXtZPW5ldyBXZWFrTWFwO3ZhciBjPUwubGVuZ3RoO2lmKFkpZm9yKHZhciBlPTA7ZTwwK2M7ZSsrKXt2YXIgZz1lO3ZhciBoPVhbZ107aHx8KGc+PVgubGVuZ3RoJiYoWC5sZW5ndGg9ZysxKSxYW2ddPWg9TC5nZXQoZykpOyhnPWgpJiZZLnNldChnLGUpfX1pZihjPVkuZ2V0KGEpfHwwKXJldHVybiBjO2lmKExhLmxlbmd0aCljPUxhLnBvcCgpO2Vsc2V7dHJ5e0wuZ3JvdygxKX1jYXRjaChwKXtpZighKHAgaW5zdGFuY2VvZiBSYW5nZUVycm9yKSl0aHJvdyBwO3Rocm93XCJVbmFibGUgdG8gZ3JvdyB3YXNtIHRhYmxlLiBTZXQgQUxMT1dfVEFCTEVfR1JPV1RILlwiO31jPUwubGVuZ3RoLTF9dHJ5e2U9YyxMLnNldChlLGEpLFhbZV09TC5nZXQoZSl9Y2F0Y2gocCl7aWYoIShwIGluc3RhbmNlb2YgVHlwZUVycm9yKSl0aHJvdyBwO2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFdlYkFzc2VtYmx5LkZ1bmN0aW9uKXtlPVdlYkFzc2VtYmx5LkZ1bmN0aW9uO1xuZz17aTpcImkzMlwiLGo6XCJpNjRcIixmOlwiZjMyXCIsZDpcImY2NFwiLHA6XCJpMzJcIn07aD17cGFyYW1ldGVyczpbXSxyZXN1bHRzOlwidlwiPT1iWzBdP1tdOltnW2JbMF1dXX07Zm9yKHZhciBrPTE7azxiLmxlbmd0aDsrK2spaC5wYXJhbWV0ZXJzLnB1c2goZ1tiW2tdXSk7Yj1uZXcgZShoLGEpfWVsc2V7ZT1bMV07Zz1iLnNsaWNlKDAsMSk7Yj1iLnNsaWNlKDEpO2g9e2k6MTI3LHA6MTI3LGo6MTI2LGY6MTI1LGQ6MTI0fTtlLnB1c2goOTYpO2s9Yi5sZW5ndGg7MTI4Pms/ZS5wdXNoKGspOmUucHVzaChrJTEyOHwxMjgsaz4+Nyk7Zm9yKGs9MDtrPGIubGVuZ3RoOysrayllLnB1c2goaFtiW2tdXSk7XCJ2XCI9PWc/ZS5wdXNoKDApOmUucHVzaCgxLGhbZ10pO2I9WzAsOTcsMTE1LDEwOSwxLDAsMCwwLDFdO2c9ZS5sZW5ndGg7MTI4Pmc/Yi5wdXNoKGcpOmIucHVzaChnJTEyOHwxMjgsZz4+Nyk7Yi5wdXNoLmFwcGx5KGIsZSk7Yi5wdXNoKDIsNywxLDEsMTAxLDEsMTAyLDAsMCw3LDUsMSwxLDEwMixcbjAsMCk7Yj1uZXcgV2ViQXNzZW1ibHkuTW9kdWxlKG5ldyBVaW50OEFycmF5KGIpKTtiPShuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UoYix7ZTp7ZjphfX0pKS5leHBvcnRzLmZ9ZT1jO0wuc2V0KGUsYik7WFtlXT1MLmdldChlKX1ZLnNldChhLGMpO3JldHVybiBjfVxudmFyIE9hPXthOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBzYShhKSkuTWEoYj4+PjAsYz4+PjApO3RhPWE7dWErKzt0aHJvdyB0YTt9LGU6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sSDpmdW5jdGlvbigpe30seDpmdW5jdGlvbigpe30sejpmdW5jdGlvbigpe30sSjpmdW5jdGlvbigpe3JldHVybiAwfSxGOmZ1bmN0aW9uKCl7fSxBOmZ1bmN0aW9uKCl7fSxFOmZ1bmN0aW9uKCl7fSxnOmZ1bmN0aW9uKCl7fSx5OmZ1bmN0aW9uKCl7fSx2OmZ1bmN0aW9uKCl7fSxHOmZ1bmN0aW9uKCl7fSx3OmZ1bmN0aW9uKCl7fSxsOigpPT4hMCxvOmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtKW2M+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtKW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0pbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO0pbYysxMj4+Mj4+PlxuMF09YS5nZXRVVENEYXRlKCk7SltjKzE2Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0pbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0pbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7SltjKzI4Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LHA6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0pbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0pbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7SltjKzg+PjI+Pj4wXT1hLmdldEhvdXJzKCk7SltjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7SltjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO0pbYysyMD4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0pbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7SltjKzI4Pj4yPj4+XG4wXT0oVihhLmdldEZ1bGxZZWFyKCkpP3hhOnlhKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtKW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGU9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0pbYyszMj4+Mj4+PjBdPShiIT1lJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGUsYikpfDB9LHE6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKEpbYSsyMD4+Mj4+PjBdKzE5MDAsSlthKzE2Pj4yPj4+MF0sSlthKzEyPj4yPj4+MF0sSlthKzg+PjI+Pj4wXSxKW2ErND4+Mj4+PjBdLEpbYT4+Mj4+PjBdLDApLGM9SlthKzMyPj4yPj4+MF0sZT1iLmdldFRpbWV6b25lT2Zmc2V0KCksZz0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksXG5oPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxrPU1hdGgubWluKGgsZyk7MD5jP0pbYSszMj4+Mj4+PjBdPU51bWJlcihnIT1oJiZrPT1lKTowPGMhPShrPT1lKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP2s6ZyktZSkpKTtKW2ErMjQ+PjI+Pj4wXT1iLmdldERheSgpO0pbYSsyOD4+Mj4+PjBdPShWKGIuZ2V0RnVsbFllYXIoKSk/eGE6eWEpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO0pbYT4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0pbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7SlthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7SlthKzEyPj4yPj4+MF09Yi5nZXREYXRlKCk7SlthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO0pbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiBOYSgoUT1hLDE8PStNYXRoLmFicyhRKT8wPFE/K01hdGguZmxvb3IoUS9cbjQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFEtKyh+flE+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0sbTpmdW5jdGlvbigpe3JldHVybi01Mn0sbjpmdW5jdGlvbigpe30sdDpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZSh0KXtyZXR1cm4odD10LnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP3RbMV06XCJHTVRcIn1jPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLGs9bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBwPWsuZ2V0VGltZXpvbmVPZmZzZXQoKTtLW2E+Pj4wPj4yPj4+MF09NjAqTWF0aC5tYXgoZyxwKTtKW2I+Pj4wPj4yPj4+MF09TnVtYmVyKGchPXApO2E9ZShoKTtiPWUoayk7YT1EYShhKTtiPURhKGIpO3A8Zz8oS1tjPj4yPj4+MF09YSxLW2MrND4+Mj4+PjBdPWIpOihLW2M+PjI+Pj4wXT1iLEtbYys0Pj4yPj4+MF09YSl9LGQ6KCk9PntFKFwiXCIpfSxcbmg6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sdTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxiOigpPT5wZXJmb3JtYW5jZS5ub3coKSxJOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7cmV0dXJuIEkuY29weVdpdGhpbihhPj4+MD4+PjAsYj4+PjAsYisoYz4+PjApPj4+MCl9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUkubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBlPWIqKDErLjIvYyk7ZT1NYXRoLm1pbihlLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2U9TWF0aC5tYXgoYSxlKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGUrKDY1NTM2LWUlNjU1MzYpJTY1NTM2KS1GLmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e0YuZ3JvdyhnKTtoYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChrKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sQzpmdW5jdGlvbihhLGIpe2E+Pj49XG4wO2I+Pj49MDt2YXIgYz0wO0ZhKCkuZm9yRWFjaChmdW5jdGlvbihlLGcpe3ZhciBoPWIrYztnPUtbYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxlLmxlbmd0aDsrK2gpSFtnKys+PjA+Pj4wXT1lLmNoYXJDb2RlQXQoaCk7SFtnPj4wPj4+MF09MDtjKz1lLmxlbmd0aCsxfSk7cmV0dXJuIDB9LEQ6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPUZhKCk7S1thPj4yPj4+MF09Yy5sZW5ndGg7dmFyIGU9MDtjLmZvckVhY2goZnVuY3Rpb24oZyl7ZSs9Zy5sZW5ndGgrMX0pO0tbYj4+Mj4+PjBdPWU7cmV0dXJuIDB9LGY6KCk9PjUyLGs6ZnVuY3Rpb24oKXtyZXR1cm4gNTJ9LHI6ZnVuY3Rpb24oKXtyZXR1cm4gNzB9LGo6ZnVuY3Rpb24oYSxiLGMsZSl7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7Zm9yKHZhciBnPTAsaD0wO2g8YztoKyspe3ZhciBrPUtbYj4+Mj4+PjBdLHA9S1tiKzQ+PjI+Pj4wXTtiKz04O2Zvcih2YXIgdD0wO3Q8cDt0Kyspe3ZhciB1PUlbayt0Pj4+MF0sdj1cbkdhW2FdOzA9PT11fHwxMD09PXU/KCgxPT09YT9lYTpDKSh3YSh2LDApKSx2Lmxlbmd0aD0wKTp2LnB1c2godSl9Zys9cH1LW2U+PjI+Pj4wXT1nO3JldHVybiAwfSxCOkthLGM6ZnVuY3Rpb24oYSxiLGMsZSl7cmV0dXJuIEthKGE+Pj4wLGI+Pj4wLGM+Pj4wLGU+Pj4wKX0saTpmdW5jdGlvbihhLGIsYyxlKXtjb25zdCBnPUwubGVuZ3RoO2E9bmV3IFVpbnQ4QXJyYXkoSS5zbGljZShhK2IsYStjKSk7dHJ5e3ZhciBoPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUoYSksaz1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UoaCx7ZW52OnttZW1vcnk6Rn19KSxwO2ZvcihwIGluIGsuZXhwb3J0cylNYShrLmV4cG9ydHNbcF0pO3JldHVybiBnPEwubGVuZ3RoP2c6ZX1jYXRjaCh0KXtyZXR1cm4gY29uc29sZS5sb2codCksZX19fTtcbihmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyl7Yz1jLmV4cG9ydHM7Rz1jPVBhKGMpO0Y9Ry5LO2hhKCk7TD1HLkFhO2phLnVuc2hpZnQoRy5MKTtNLS07ZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoTSk7aWYoMD09TSYmKG51bGwhPT1OJiYoY2xlYXJJbnRlcnZhbChOKSxOPW51bGwpLE8pKXt2YXIgZT1PO089bnVsbDtlKCl9cmV0dXJuIGN9dmFyIGI9e2E6T2F9O00rKztkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMmJmQubW9uaXRvclJ1bkRlcGVuZGVuY2llcyhNKTtpZihkLmluc3RhbnRpYXRlV2FzbSl0cnl7cmV0dXJuIGQuaW5zdGFudGlhdGVXYXNtKGIsYSl9Y2F0Y2goYyl7QyhcIk1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6IFwiK2MpLGwoYyl9cmEoYixmdW5jdGlvbihjKXthKGMuaW5zdGFuY2UpfSkuY2F0Y2gobCk7cmV0dXJue319KSgpO1xuZC5fT3J0SW5pdD0oYSxiKT0+KGQuX09ydEluaXQ9Ry5NKShhLGIpO2QuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KGQuX09ydEdldExhc3RFcnJvcj1HLk4pKGEsYik7ZC5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGEsYixjLGUsZyxoLGsscCx0LHUpPT4oZC5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9Ry5PKShhLGIsYyxlLGcsaCxrLHAsdCx1KTtkLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj0oYSxiKT0+KGQuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPUcuUCkoYSxiKTtkLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGEsYixjKT0+KGQuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1HLlEpKGEsYixjKTtkLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KGQuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1HLlIpKGEsYixjKTtkLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1HLlMpKGEpO1xuZC5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4oZC5fT3J0Q3JlYXRlU2Vzc2lvbj1HLlQpKGEsYixjKTtkLl9PcnRSZWxlYXNlU2Vzc2lvbj1hPT4oZC5fT3J0UmVsZWFzZVNlc3Npb249Ry5VKShhKTtkLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PShhLGIsYyk9PihkLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PUcuVikoYSxiLGMpO2QuX09ydEdldElucHV0TmFtZT0oYSxiKT0+KGQuX09ydEdldElucHV0TmFtZT1HLlcpKGEsYik7ZC5fT3J0R2V0T3V0cHV0TmFtZT0oYSxiKT0+KGQuX09ydEdldE91dHB1dE5hbWU9Ry5YKShhLGIpO2QuX09ydEZyZWU9YT0+KGQuX09ydEZyZWU9Ry5ZKShhKTtkLl9PcnRDcmVhdGVUZW5zb3I9KGEsYixjLGUsZyxoKT0+KGQuX09ydENyZWF0ZVRlbnNvcj1HLlopKGEsYixjLGUsZyxoKTtkLl9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxlLGcpPT4oZC5fT3J0R2V0VGVuc29yRGF0YT1HLl8pKGEsYixjLGUsZyk7XG5kLl9PcnRSZWxlYXNlVGVuc29yPWE9PihkLl9PcnRSZWxlYXNlVGVuc29yPUcuJCkoYSk7ZC5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZSk9PihkLl9PcnRDcmVhdGVSdW5PcHRpb25zPUcuYWEpKGEsYixjLGUpO2QuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRSdW5Db25maWdFbnRyeT1HLmJhKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VSdW5PcHRpb25zPUcuY2EpKGEpO2QuX09ydENyZWF0ZUJpbmRpbmc9YT0+KGQuX09ydENyZWF0ZUJpbmRpbmc9Ry5kYSkoYSk7ZC5fT3J0QmluZElucHV0PShhLGIsYyk9PihkLl9PcnRCaW5kSW5wdXQ9Ry5lYSkoYSxiLGMpO2QuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGUpPT4oZC5fT3J0QmluZE91dHB1dD1HLmZhKShhLGIsYyxlKTtkLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oZC5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9Ry5nYSkoYSk7XG5kLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZC5fT3J0UmVsZWFzZUJpbmRpbmc9Ry5oYSkoYSk7ZC5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGUsZyk9PihkLl9PcnRSdW5XaXRoQmluZGluZz1HLmlhKShhLGIsYyxlLGcpO2QuX09ydFJ1bj0oYSxiLGMsZSxnLGgsayxwKT0+KGQuX09ydFJ1bj1HLmphKShhLGIsYyxlLGcsaCxrLHApO2QuX09ydEVuZFByb2ZpbGluZz1hPT4oZC5fT3J0RW5kUHJvZmlsaW5nPUcua2EpKGEpO2QuX09ydFRyYWluaW5nTG9hZENoZWNrcG9pbnQ9KGEsYik9PihkLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PUcubGEpKGEsYik7ZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1hPT4oZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1HLm1hKShhKTtkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249KGEsYixjLGUsZyxoLGsscCk9PihkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249Ry5uYSkoYSxiLGMsZSxnLGgsayxwKTtcbmQuX09ydFRyYWluaW5nTGF6eVJlc2V0R3JhZD1hPT4oZC5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPUcub2EpKGEpO2QuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPShhLGIsYyxlLGcsaCk9PihkLl9PcnRUcmFpbmluZ1J1blRyYWluU3RlcD1HLnBhKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPShhLGIpPT4oZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPUcucWEpKGEsYik7ZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD0oYSxiLGMsZSxnLGgpPT4oZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD1HLnJhKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT0oYSxiLGMpPT4oZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT1HLnNhKShhLGIsYyk7ZC5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc1RvQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj1HLnRhKShhLGIsYyxlKTtcbmQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPUcudWEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PUcudmEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dE5hbWU9KGEsYixjLGUpPT4oZC5fT3J0VHJhaW5pbmdHZXRNb2RlbElucHV0T3V0cHV0TmFtZT1HLndhKShhLGIsYyxlKTtkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPWE9PihkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPUcueGEpKGEpO3ZhciB6YT1kLl9tYWxsb2M9YT0+KHphPWQuX21hbGxvYz1HLnlhKShhKTtkLl9mcmVlPWE9PihkLl9mcmVlPUcuemEpKGEpO1xudmFyIE5hPWE9PihOYT1HLkJhKShhKSxRYT0oKT0+KFFhPUcuQ2EpKCksUmE9YT0+KFJhPUcuRGEpKGEpLFNhPWE9PihTYT1HLkVhKShhKTtkLl9fX3N0YXJ0X2VtX2pzPTk3NTkwNDtkLl9fX3N0b3BfZW1fanM9OTc2NTE2O2Z1bmN0aW9uIFBhKGEpe2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1lPT4oKT0+ZSgpPj4+MCxjPWU9Pmc9PmUoZyk+Pj4wO2EuX19lcnJub19sb2NhdGlvbj1iKGEuX19lcnJub19sb2NhdGlvbik7YS5tYWxsb2M9YyhhLm1hbGxvYyk7YS5zdGFja1NhdmU9YihhLnN0YWNrU2F2ZSk7YS5zdGFja0FsbG9jPWMoYS5zdGFja0FsbG9jKTtyZXR1cm4gYX1kLnN0YWNrQWxsb2M9U2E7ZC5zdGFja1NhdmU9UWE7ZC5zdGFja1Jlc3RvcmU9UmE7ZC5hZGRGdW5jdGlvbj1NYTtkLlVURjhUb1N0cmluZz1TO2Quc3RyaW5nVG9VVEY4PShhLGIsYyk9PlUoYSxJLGIsYyk7ZC5sZW5ndGhCeXRlc1VURjg9VDt2YXIgWjtcbk89ZnVuY3Rpb24gVGEoKXtafHxVYSgpO1p8fChPPVRhKX07XG5mdW5jdGlvbiBVYSgpe2Z1bmN0aW9uIGEoKXtpZighWiYmKFo9ITAsZC5jYWxsZWRSdW49ITAsIWZhKSl7UihqYSk7YWEoZCk7aWYoZC5vblJ1bnRpbWVJbml0aWFsaXplZClkLm9uUnVudGltZUluaXRpYWxpemVkKCk7aWYoZC5wb3N0UnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkLnBvc3RSdW4mJihkLnBvc3RSdW49W2QucG9zdFJ1bl0pO2QucG9zdFJ1bi5sZW5ndGg7KXt2YXIgYj1kLnBvc3RSdW4uc2hpZnQoKTtrYS51bnNoaWZ0KGIpfVIoa2EpfX1pZighKDA8TSkpe2lmKGQucHJlUnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkLnByZVJ1biYmKGQucHJlUnVuPVtkLnByZVJ1bl0pO2QucHJlUnVuLmxlbmd0aDspbGEoKTtSKGlhKTswPE18fChkLnNldFN0YXR1cz8oZC5zZXRTdGF0dXMoXCJSdW5uaW5nLi4uXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZC5zZXRTdGF0dXMoXCJcIil9LDEpO2EoKX0sMSkpOmEoKSl9fVxuaWYoZC5wcmVJbml0KWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkLnByZUluaXQmJihkLnByZUluaXQ9W2QucHJlSW5pdF0pOzA8ZC5wcmVJbml0Lmxlbmd0aDspZC5wcmVJbml0LnBvcCgpKCk7VWEoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cblxuKTtcbn0pKCk7XG5pZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuICBtb2R1bGUuZXhwb3J0cyA9IG9ydFdhc207XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbSk7XG4iLCAiIiwgIiIsICJleHBvcnQgY29uc3QgY3B1cyA9IHVuZGVmaW5lZDsiLCAiXG52YXIgb3J0V2FzbVRocmVhZGVkID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9PSAndW5kZWZpbmVkJykgX3NjcmlwdERpciA9IF9zY3JpcHREaXIgfHwgX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbmZ1bmN0aW9uIGFhKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGx9ZnVuY3Rpb24gbigpe2UuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBiYX1mdW5jdGlvbiBwKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGNhfWZ1bmN0aW9uIHQoKXtlLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gZGF9ZnVuY3Rpb24gZWEoKXtlLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gZmF9dmFyIHc9bW9kdWxlQXJnLGhhLHg7dy5yZWFkeT1uZXcgUHJvbWlzZSgoYSxiKT0+e2hhPWE7eD1ifSk7XG52YXIgaWE9T2JqZWN0LmFzc2lnbih7fSx3KSxqYT1cIi4vdGhpcy5wcm9ncmFtXCIsej0oYSxiKT0+e3Rocm93IGI7fSxrYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LEE9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxDPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSxEPXcuRU5WSVJPTk1FTlRfSVNfUFRIUkVBRHx8ITEsRT1cIlwiO2Z1bmN0aW9uIGxhKGEpe3JldHVybiB3LmxvY2F0ZUZpbGU/dy5sb2NhdGVGaWxlKGEsRSk6RSthfXZhciBtYSxGLEc7XG5pZihDKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLG5hPXJlcXVpcmUoXCJwYXRoXCIpO0U9QT9uYS5kaXJuYW1lKEUpK1wiL1wiOl9fZGlybmFtZStcIi9cIjttYT0oYixjKT0+e2I9Yi5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGIpOm5hLm5vcm1hbGl6ZShiKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGIsYz92b2lkIDA6XCJ1dGY4XCIpfTtHPWI9PntiPW1hKGIsITApO2IuYnVmZmVyfHwoYj1uZXcgVWludDhBcnJheShiKSk7cmV0dXJuIGJ9O0Y9KGIsYyxkLGc9ITApPT57Yj1iLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpP25ldyBVUkwoYik6bmEubm9ybWFsaXplKGIpO2ZzLnJlYWRGaWxlKGIsZz92b2lkIDA6XCJ1dGY4XCIsKGgsayk9PntoP2QoaCk6YyhnP2suYnVmZmVyOmspfSl9OyF3LnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihqYT1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpO3o9KGIsYyk9Pntwcm9jZXNzLmV4aXRDb2RlPVxuYjt0aHJvdyBjO307dy5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCI7bGV0IGE7dHJ5e2E9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpfWNhdGNoKGIpe3Rocm93IGNvbnNvbGUuZXJyb3IoJ1RoZSBcIndvcmtlcl90aHJlYWRzXCIgbW9kdWxlIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBub2RlLmpzIGJ1aWxkIC0gcGVyaGFwcyBhIG5ld2VyIHZlcnNpb24gaXMgbmVlZGVkPycpLGI7fWdsb2JhbC5Xb3JrZXI9YS5Xb3JrZXJ9ZWxzZSBpZihrYXx8QSlBP0U9c2VsZi5sb2NhdGlvbi5ocmVmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkb2N1bWVudCYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKEU9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLCh0eXBlb2YgX3NjcmlwdERpciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBfc2NyaXB0RGlyKSYmKEU9X3NjcmlwdERpciksMCE9PUUuaW5kZXhPZihcImJsb2I6XCIpP0U9RS5zdWJzdHIoMCxFLnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOkU9XCJcIixDfHwobWE9YT0+e3ZhciBiPVxubmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2Iuc2VuZChudWxsKTtyZXR1cm4gYi5yZXNwb25zZVRleHR9LEEmJihHPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Iuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYi5yZXNwb25zZSl9KSxGPShhLGIsYyk9Pnt2YXIgZD1uZXcgWE1MSHR0cFJlcXVlc3Q7ZC5vcGVuKFwiR0VUXCIsYSwhMCk7ZC5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Qub25sb2FkPSgpPT57MjAwPT1kLnN0YXR1c3x8MD09ZC5zdGF0dXMmJmQucmVzcG9uc2U/YihkLnJlc3BvbnNlKTpjKCl9O2Qub25lcnJvcj1jO2Quc2VuZChudWxsKX0pO0MmJlwidW5kZWZpbmVkXCI9PXR5cGVvZiBwZXJmb3JtYW5jZSYmKGdsb2JhbC5wZXJmb3JtYW5jZT1yZXF1aXJlKFwicGVyZl9ob29rc1wiKS5wZXJmb3JtYW5jZSk7XG52YXIgb2E9Y29uc29sZS5sb2cuYmluZChjb25zb2xlKSxwYT1jb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7QyYmKG9hPSguLi5hKT0+ZnMud3JpdGVTeW5jKDEsYS5qb2luKFwiIFwiKStcIlxcblwiKSxwYT0oLi4uYSk9PmZzLndyaXRlU3luYygyLGEuam9pbihcIiBcIikrXCJcXG5cIikpO3ZhciBxYT13LnByaW50fHxvYSxJPXcucHJpbnRFcnJ8fHBhO09iamVjdC5hc3NpZ24odyxpYSk7aWE9bnVsbDt3LnRoaXNQcm9ncmFtJiYoamE9dy50aGlzUHJvZ3JhbSk7dy5xdWl0JiYoej13LnF1aXQpO3ZhciBKO3cud2FzbUJpbmFyeSYmKEo9dy53YXNtQmluYXJ5KTt2YXIgbm9FeGl0UnVudGltZT13Lm5vRXhpdFJ1bnRpbWV8fCEwO1wib2JqZWN0XCIhPXR5cGVvZiBXZWJBc3NlbWJseSYmSyhcIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWRcIik7dmFyIGUsTCxyYSxNPSExLE4sbCxiYSxjYSxkYSxmYTtcbmZ1bmN0aW9uIG0oKXt2YXIgYT1lLmJ1ZmZlcjt3LkhFQVA4PWw9bmV3IEludDhBcnJheShhKTt3LkhFQVAxNj1uZXcgSW50MTZBcnJheShhKTt3LkhFQVAzMj1jYT1uZXcgSW50MzJBcnJheShhKTt3LkhFQVBVOD1iYT1uZXcgVWludDhBcnJheShhKTt3LkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGEpO3cuSEVBUFUzMj1kYT1uZXcgVWludDMyQXJyYXkoYSk7dy5IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYSk7dy5IRUFQRjY0PWZhPW5ldyBGbG9hdDY0QXJyYXkoYSl9dmFyIE89dy5JTklUSUFMX01FTU9SWXx8MTY3NzcyMTY7NTI0Mjg4MDw9T3x8SyhcIklOSVRJQUxfTUVNT1JZIHNob3VsZCBiZSBsYXJnZXIgdGhhbiBTVEFDS19TSVpFLCB3YXMgXCIrTytcIiEgKFNUQUNLX1NJWkU9NTI0Mjg4MClcIik7XG5pZihEKWU9dy53YXNtTWVtb3J5O2Vsc2UgaWYody53YXNtTWVtb3J5KWU9dy53YXNtTWVtb3J5O2Vsc2UgaWYoZT1uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOk8vNjU1MzYsbWF4aW11bTo2NTUzNixzaGFyZWQ6ITB9KSwhKGUuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpKXRocm93IEkoXCJyZXF1ZXN0ZWQgYSBzaGFyZWQgV2ViQXNzZW1ibHkuTWVtb3J5IGJ1dCB0aGUgcmV0dXJuZWQgYnVmZmVyIGlzIG5vdCBhIFNoYXJlZEFycmF5QnVmZmVyLCBpbmRpY2F0aW5nIHRoYXQgd2hpbGUgdGhlIGJyb3dzZXIgaGFzIFNoYXJlZEFycmF5QnVmZmVyIGl0IGRvZXMgbm90IGhhdmUgV2ViQXNzZW1ibHkgdGhyZWFkcyBzdXBwb3J0IC0geW91IG1heSBuZWVkIHRvIHNldCBhIGZsYWdcIiksQyYmSShcIihvbiBub2RlIHlvdSBtYXkgbmVlZDogLS1leHBlcmltZW50YWwtd2FzbS10aHJlYWRzIC0tZXhwZXJpbWVudGFsLXdhc20tYnVsay1tZW1vcnkgYW5kL29yIHJlY2VudCB2ZXJzaW9uKVwiKSxcbkVycm9yKFwiYmFkIG1lbW9yeVwiKTttKCk7Tz1lLmJ1ZmZlci5ieXRlTGVuZ3RoO3ZhciBQLHNhPVtdLHRhPVtdLHVhPVtdLHZhPTA7ZnVuY3Rpb24gUSgpe3JldHVybiBub0V4aXRSdW50aW1lfHwwPHZhfXZhciBSPTAsd2E9bnVsbCxTPW51bGw7ZnVuY3Rpb24geGEoKXtSKys7dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUil9ZnVuY3Rpb24geWEoKXtSLS07dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUik7aWYoMD09UiYmKG51bGwhPT13YSYmKGNsZWFySW50ZXJ2YWwod2EpLHdhPW51bGwpLFMpKXt2YXIgYT1TO1M9bnVsbDthKCl9fVxuZnVuY3Rpb24gSyhhKXtpZih3Lm9uQWJvcnQpdy5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7SShhKTtNPSEwO049MTthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7eChhKTt0aHJvdyBhO31mdW5jdGlvbiB6YShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgVDtUPVwib3J0LXdhc20tdGhyZWFkZWQud2FzbVwiO3phKFQpfHwoVD1sYShUKSk7ZnVuY3Rpb24gQWEoYSl7aWYoYT09VCYmSilyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoSik7aWYoRylyZXR1cm4gRyhhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBCYShhKXtpZighSiYmKGthfHxBKSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFhLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PkFhKGEpKTtpZihGKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e0YoYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5BYShhKSl9ZnVuY3Rpb24gQ2EoYSxiLGMpe3JldHVybiBCYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntJKFwiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogXCIrZCk7SyhkKX0pfVxuZnVuY3Rpb24gRGEoYSxiKXt2YXIgYz1UO3JldHVybiBKfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8emEoYyl8fGMuc3RhcnRzV2l0aChcImZpbGU6Ly9cIil8fEN8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP0NhKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGQsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0koXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIrZyk7SShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBDYShjLGEsYil9KSl9dmFyIFU7ZnVuY3Rpb24gRWEoYSl7dGhpcy5uYW1lPVwiRXhpdFN0YXR1c1wiO3RoaXMubWVzc2FnZT1gUHJvZ3JhbSB0ZXJtaW5hdGVkIHdpdGggZXhpdCgke2F9KWA7dGhpcy5zdGF0dXM9YX1cbmZ1bmN0aW9uIEZhKGEpe2EudGVybWluYXRlKCk7YS5vbm1lc3NhZ2U9KCk9Pnt9fWZ1bmN0aW9uIEdhKGEpeyhhPVYuTWFbYV0pfHxLKCk7Vi5tYihhKX1mdW5jdGlvbiBIYShhKXt2YXIgYj1WLmdiKCk7aWYoIWIpcmV0dXJuIDY7Vi5QYS5wdXNoKGIpO1YuTWFbYS5PYV09YjtiLk9hPWEuT2E7dmFyIGM9e2NtZDpcInJ1blwiLHN0YXJ0X3JvdXRpbmU6YS5uYixhcmc6YS5mYixwdGhyZWFkX3B0cjphLk9hfTtDJiZiLnVucmVmKCk7Yi5wb3N0TWVzc2FnZShjLGEudGIpO3JldHVybiAwfVxudmFyIElhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCxKYT0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBkPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZCk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZJYSlyZXR1cm4gSWEuZGVjb2RlKGEuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXI/YS5zbGljZShiLGMpOmEuc3ViYXJyYXkoYixjKSk7Zm9yKGQ9XCJcIjtiPGM7KXt2YXIgZz1hW2IrK107aWYoZyYxMjgpe3ZhciBoPWFbYisrXSY2MztpZigxOTI9PShnJjIyNCkpZCs9U3RyaW5nLmZyb21DaGFyQ29kZSgoZyYzMSk8PDZ8aCk7ZWxzZXt2YXIgaz1hW2IrK10mNjM7Zz0yMjQ9PShnJjI0MCk/KGcmMTUpPDwxMnxoPDw2fGs6KGcmNyk8PDE4fGg8PDEyfGs8PDZ8YVtiKytdJjYzOzY1NTM2Pmc/ZCs9U3RyaW5nLmZyb21DaGFyQ29kZShnKTooZy09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxnPj5cbjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGR9LEthPShhLGIpPT4oYT4+Pj0wKT9KYShuKCksYSxiKTpcIlwiO2Z1bmN0aW9uIExhKGEpe2lmKEQpcmV0dXJuIFcoMSwxLGEpO049YTtpZighUSgpKXtWLm9iKCk7aWYody5vbkV4aXQpdy5vbkV4aXQoYSk7TT0hMH16KGEsbmV3IEVhKGEpKX1cbnZhciBOYT1hPT57Tj1hO2lmKEQpdGhyb3cgTWEoYSksXCJ1bndpbmRcIjtMYShhKX0sVj17U2E6W10sUGE6W10sJGE6W10sTWE6e30sV2E6ZnVuY3Rpb24oKXtEP1YuaWIoKTpWLmhiKCl9LGhiOmZ1bmN0aW9uKCl7c2EudW5zaGlmdCgoKT0+e3hhKCk7Vi5qYigoKT0+eWEoKSl9KX0saWI6ZnVuY3Rpb24oKXtWLnJlY2VpdmVPYmplY3RUcmFuc2Zlcj1WLmxiO1YudGhyZWFkSW5pdFRMUz1WLlphO1Yuc2V0RXhpdFN0YXR1cz1WLllhO25vRXhpdFJ1bnRpbWU9ITF9LFlhOmZ1bmN0aW9uKGEpe049YX0seWI6W1wiJHRlcm1pbmF0ZVdvcmtlclwiXSxvYjpmdW5jdGlvbigpe2Zvcih2YXIgYSBvZiBWLlBhKUZhKGEpO2ZvcihhIG9mIFYuU2EpRmEoYSk7Vi5TYT1bXTtWLlBhPVtdO1YuTWE9W119LG1iOmZ1bmN0aW9uKGEpe3ZhciBiPWEuT2E7ZGVsZXRlIFYuTWFbYl07Vi5TYS5wdXNoKGEpO1YuUGEuc3BsaWNlKFYuUGEuaW5kZXhPZihhKSwxKTthLk9hPTA7T2EoYil9LGxiOmZ1bmN0aW9uKCl7fSxcblphOmZ1bmN0aW9uKCl7Vi4kYS5mb3JFYWNoKGE9PmEoKSl9LGtiOmE9Pm5ldyBQcm9taXNlKGI9PnthLm9ubWVzc2FnZT1oPT57aD1oLmRhdGE7dmFyIGs9aC5jbWQ7aWYoaC50YXJnZXRUaHJlYWQmJmgudGFyZ2V0VGhyZWFkIT1QYSgpKXt2YXIgcT1WLk1hW2gueGJdO3E/cS5wb3N0TWVzc2FnZShoLGgudHJhbnNmZXJMaXN0KTpJKCdJbnRlcm5hbCBlcnJvciEgV29ya2VyIHNlbnQgYSBtZXNzYWdlIFwiJytrKydcIiB0byB0YXJnZXQgcHRocmVhZCAnK2gudGFyZ2V0VGhyZWFkK1wiLCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFcIil9ZWxzZSBpZihcImNoZWNrTWFpbGJveFwiPT09aylRYSgpO2Vsc2UgaWYoXCJzcGF3blRocmVhZFwiPT09aylIYShoKTtlbHNlIGlmKFwiY2xlYW51cFRocmVhZFwiPT09aylHYShoLnRocmVhZCk7ZWxzZSBpZihcImtpbGxUaHJlYWRcIj09PWspaD1oLnRocmVhZCxrPVYuTWFbaF0sZGVsZXRlIFYuTWFbaF0sRmEoayksT2EoaCksVi5QYS5zcGxpY2UoVi5QYS5pbmRleE9mKGspLFxuMSksay5PYT0wO2Vsc2UgaWYoXCJjYW5jZWxUaHJlYWRcIj09PWspVi5NYVtoLnRocmVhZF0ucG9zdE1lc3NhZ2Uoe2NtZDpcImNhbmNlbFwifSk7ZWxzZSBpZihcImxvYWRlZFwiPT09aylhLmxvYWRlZD0hMCxiKGEpO2Vsc2UgaWYoXCJhbGVydFwiPT09aylhbGVydChcIlRocmVhZCBcIitoLnRocmVhZElkK1wiOiBcIitoLnRleHQpO2Vsc2UgaWYoXCJzZXRpbW1lZGlhdGVcIj09PWgudGFyZ2V0KWEucG9zdE1lc3NhZ2UoaCk7ZWxzZSBpZihcImNhbGxIYW5kbGVyXCI9PT1rKXdbaC5oYW5kbGVyXSguLi5oLmFyZ3MpO2Vsc2UgayYmSShcIndvcmtlciBzZW50IGFuIHVua25vd24gY29tbWFuZCBcIitrKX07YS5vbmVycm9yPWg9PntJKFwid29ya2VyIHNlbnQgYW4gZXJyb3IhIFwiK2guZmlsZW5hbWUrXCI6XCIraC5saW5lbm8rXCI6IFwiK2gubWVzc2FnZSk7dGhyb3cgaDt9O0MmJihhLm9uKFwibWVzc2FnZVwiLGZ1bmN0aW9uKGgpe2Eub25tZXNzYWdlKHtkYXRhOmh9KX0pLGEub24oXCJlcnJvclwiLGZ1bmN0aW9uKGgpe2Eub25lcnJvcihoKX0pKTtcbnZhciBjPVtdLGQ9W1wib25FeGl0XCIsXCJvbkFib3J0XCIsXCJwcmludFwiLFwicHJpbnRFcnJcIl0sZztmb3IoZyBvZiBkKXcuaGFzT3duUHJvcGVydHkoZykmJmMucHVzaChnKTthLnBvc3RNZXNzYWdlKHtjbWQ6XCJsb2FkXCIsaGFuZGxlcnM6Yyx1cmxPckJsb2I6dy5tYWluU2NyaXB0VXJsT3JCbG9ifHxfc2NyaXB0RGlyLHdhc21NZW1vcnk6ZSx3YXNtTW9kdWxlOnJhfSl9KSxqYjpmdW5jdGlvbihhKXthKCl9LGViOmZ1bmN0aW9uKCl7dmFyIGE9bGEoXCJvcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanNcIik7YT1uZXcgV29ya2VyKGEpO1YuU2EucHVzaChhKX0sZ2I6ZnVuY3Rpb24oKXswPT1WLlNhLmxlbmd0aCYmKFYuZWIoKSxWLmtiKFYuU2FbMF0pKTtyZXR1cm4gVi5TYS5wb3AoKX19O3cuUFRocmVhZD1WO3ZhciBSYT1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkodyl9O1xudy5lc3RhYmxpc2hTdGFja1NwYWNlPWZ1bmN0aW9uKCl7dmFyIGE9UGEoKSxiPXAoKVthKzUyPj4yPj4+MF07YT1wKClbYSs1Nj4+Mj4+PjBdO1NhKGIsYi1hKTtUYShiKX07ZnVuY3Rpb24gTWEoYSl7aWYoRClyZXR1cm4gVygyLDAsYSk7TmEoYSl9dmFyIFg9W10sVWE9YT0+e3ZhciBiPVhbYV07Ynx8KGE+PVgubGVuZ3RoJiYoWC5sZW5ndGg9YSsxKSxYW2FdPWI9UC5nZXQoYSkpO3JldHVybiBifTt3Lmludm9rZUVudHJ5UG9pbnQ9ZnVuY3Rpb24oYSxiKXthPVVhKGEpKGIpO1EoKT9WLllhKGEpOlZhKGEpfTtcbmZ1bmN0aW9uIFdhKGEpe3RoaXMuVmE9YS0yNDt0aGlzLmNiPWZ1bmN0aW9uKGIpe3QoKVt0aGlzLlZhKzQ+PjI+Pj4wXT1ifTt0aGlzLmJiPWZ1bmN0aW9uKGIpe3QoKVt0aGlzLlZhKzg+PjI+Pj4wXT1ifTt0aGlzLldhPWZ1bmN0aW9uKGIsYyl7dGhpcy5hYigpO3RoaXMuY2IoYik7dGhpcy5iYihjKX07dGhpcy5hYj1mdW5jdGlvbigpe3QoKVt0aGlzLlZhKzE2Pj4yPj4+MF09MH19dmFyIFhhPTAsWWE9MDtmdW5jdGlvbiBaYShhLGIsYyxkKXtyZXR1cm4gRD9XKDMsMSxhLGIsYyxkKTokYShhLGIsYyxkKX1cbmZ1bmN0aW9uICRhKGEsYixjLGQpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIpcmV0dXJuIEkoXCJDdXJyZW50IGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgU2hhcmVkQXJyYXlCdWZmZXIsIHB0aHJlYWRzIGFyZSBub3QgYXZhaWxhYmxlIVwiKSw2O3ZhciBnPVtdO2lmKEQmJjA9PT1nLmxlbmd0aClyZXR1cm4gWmEoYSxiLGMsZCk7YT17bmI6YyxPYTphLGZiOmQsdGI6Z307cmV0dXJuIEQ/KGEudmI9XCJzcGF3blRocmVhZFwiLHBvc3RNZXNzYWdlKGEsZyksMCk6SGEoYSl9ZnVuY3Rpb24gYWIoYSxiLGMpe3JldHVybiBEP1coNCwxLGEsYixjKTowfWZ1bmN0aW9uIGJiKGEsYil7aWYoRClyZXR1cm4gVyg1LDEsYSxiKX1cbnZhciBjYj1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sZGI9KGEsYixjLGQpPT57Yz4+Pj0wO2lmKCEoMDxkKSlyZXR1cm4gMDt2YXIgZz1jO2Q9YytkLTE7Zm9yKHZhciBoPTA7aDxhLmxlbmd0aDsrK2gpe3ZhciBrPWEuY2hhckNvZGVBdChoKTtpZig1NTI5Njw9ayYmNTczNDM+PWspe3ZhciBxPWEuY2hhckNvZGVBdCgrK2gpO2s9NjU1MzYrKChrJjEwMjMpPDwxMCl8cSYxMDIzfWlmKDEyNz49ayl7aWYoYz49ZClicmVhaztiW2MrKz4+PjBdPWt9ZWxzZXtpZigyMDQ3Pj1rKXtpZihjKzE+PWQpYnJlYWs7YltjKys+Pj4wXT0xOTJ8az4+Nn1lbHNle2lmKDY1NTM1Pj1rKXtpZihjKzI+PWQpYnJlYWs7YltjKys+Pj4wXT0yMjR8az4+MTJ9ZWxzZXtpZihjKzM+PWQpYnJlYWs7YltjKys+Pj4wXT0yNDB8az4+XG4xODtiW2MrKz4+PjBdPTEyOHxrPj4xMiY2M31iW2MrKz4+PjBdPTEyOHxrPj42JjYzfWJbYysrPj4+MF09MTI4fGsmNjN9fWJbYz4+PjBdPTA7cmV0dXJuIGMtZ30sZWI9KGEsYixjKT0+ZGIoYSxuKCksYixjKTtmdW5jdGlvbiBmYihhLGIpe2lmKEQpcmV0dXJuIFcoNiwxLGEsYil9ZnVuY3Rpb24gZ2IoYSxiLGMpe2lmKEQpcmV0dXJuIFcoNywxLGEsYixjKX1mdW5jdGlvbiBoYihhLGIsYyl7cmV0dXJuIEQ/Vyg4LDEsYSxiLGMpOjB9ZnVuY3Rpb24gaWIoYSxiKXtpZihEKXJldHVybiBXKDksMSxhLGIpfWZ1bmN0aW9uIGpiKGEsYixjKXtpZihEKXJldHVybiBXKDEwLDEsYSxiLGMpfWZ1bmN0aW9uIGtiKGEsYixjLGQpe2lmKEQpcmV0dXJuIFcoMTEsMSxhLGIsYyxkKX1mdW5jdGlvbiBsYihhLGIsYyxkKXtpZihEKXJldHVybiBXKDEyLDEsYSxiLGMsZCl9ZnVuY3Rpb24gbWIoYSxiLGMsZCl7aWYoRClyZXR1cm4gVygxMywxLGEsYixjLGQpfVxuZnVuY3Rpb24gbmIoYSl7aWYoRClyZXR1cm4gVygxNCwxLGEpfWZ1bmN0aW9uIG9iKGEsYil7aWYoRClyZXR1cm4gVygxNSwxLGEsYil9ZnVuY3Rpb24gcGIoYSxiLGMpe2lmKEQpcmV0dXJuIFcoMTYsMSxhLGIsYyl9dmFyIHFiPWE9PntpZighTSl0cnl7aWYoYSgpLCFRKCkpdHJ5e0Q/VmEoTik6TmEoTil9Y2F0Y2goYil7YiBpbnN0YW5jZW9mIEVhfHxcInVud2luZFwiPT1ifHx6KDEsYil9fWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBFYXx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX07ZnVuY3Rpb24gcmIoYSl7YT4+Pj0wO1wiZnVuY3Rpb25cIj09PXR5cGVvZiBBdG9taWNzLnViJiYoQXRvbWljcy51YihwKCksYT4+MixhKS52YWx1ZS50aGVuKFFhKSxhKz0xMjgsQXRvbWljcy5zdG9yZShwKCksYT4+MiwxKSl9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQ9cmI7ZnVuY3Rpb24gUWEoKXt2YXIgYT1QYSgpO2EmJihyYihhKSxxYigoKT0+c2IoKSkpfXcuY2hlY2tNYWlsYm94PVFhO1xudmFyIFk9YT0+MD09PWElNCYmKDAhPT1hJTEwMHx8MD09PWElNDAwKSx0Yj1bMCwzMSw2MCw5MSwxMjEsMTUyLDE4MiwyMTMsMjQ0LDI3NCwzMDUsMzM1XSx1Yj1bMCwzMSw1OSw5MCwxMjAsMTUxLDE4MSwyMTIsMjQzLDI3MywzMDQsMzM0XTtmdW5jdGlvbiB2YihhLGIsYyxkLGcsaCxrLHEpe3JldHVybiBEP1coMTcsMSxhLGIsYyxkLGcsaCxrLHEpOi01Mn1mdW5jdGlvbiB3YihhLGIsYyxkLGcsaCxrKXtpZihEKXJldHVybiBXKDE4LDEsYSxiLGMsZCxnLGgsayl9dmFyIHliPWE9Pnt2YXIgYj1jYihhKSsxLGM9eGIoYik7YyYmZWIoYSxjLGIpO3JldHVybiBjfSxBYj1hPT57dmFyIGI9emIoKTthPWEoKTtUYShiKTtyZXR1cm4gYX07XG5mdW5jdGlvbiBXKGEsYil7dmFyIGM9YXJndW1lbnRzLmxlbmd0aC0yLGQ9YXJndW1lbnRzO3JldHVybiBBYigoKT0+e2Zvcih2YXIgZz1CYig4KmMpLGg9Zz4+MyxrPTA7azxjO2srKyl7dmFyIHE9ZFsyK2tdO2VhKClbaCtrPj4+MF09cX1yZXR1cm4gQ2IoYSxjLGcsYil9KX1cbnZhciBEYj1bXSxFYj17fSxHYj0oKT0+e2lmKCFGYil7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86amF8fFwiLi90aGlzLnByb2dyYW1cIn0sYjtmb3IoYiBpbiBFYil2b2lkIDA9PT1FYltiXT9kZWxldGUgYVtiXTphW2JdPUViW2JdO3ZhciBjPVtdO2ZvcihiIGluIGEpYy5wdXNoKGAke2J9PSR7YVtiXX1gKTtGYj1jfXJldHVybiBGYn0sRmI7XG5mdW5jdGlvbiBIYihhLGIpe2lmKEQpcmV0dXJuIFcoMTksMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9MDtHYigpLmZvckVhY2goZnVuY3Rpb24oZCxnKXt2YXIgaD1iK2M7Zz10KClbYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxkLmxlbmd0aDsrK2gpYWEoKVtnKys+PjA+Pj4wXT1kLmNoYXJDb2RlQXQoaCk7YWEoKVtnPj4wPj4+MF09MDtjKz1kLmxlbmd0aCsxfSk7cmV0dXJuIDB9ZnVuY3Rpb24gSWIoYSxiKXtpZihEKXJldHVybiBXKDIwLDEsYSxiKTthPj4+PTA7Yj4+Pj0wO3ZhciBjPUdiKCk7dCgpW2E+PjI+Pj4wXT1jLmxlbmd0aDt2YXIgZD0wO2MuZm9yRWFjaChmdW5jdGlvbihnKXtkKz1nLmxlbmd0aCsxfSk7dCgpW2I+PjI+Pj4wXT1kO3JldHVybiAwfWZ1bmN0aW9uIEpiKGEpe3JldHVybiBEP1coMjEsMSxhKTo1Mn1mdW5jdGlvbiBOYihhLGIsYyxkKXtyZXR1cm4gRD9XKDIyLDEsYSxiLGMsZCk6NTJ9XG5mdW5jdGlvbiBPYihhLGIsYyxkLGcpe3JldHVybiBEP1coMjMsMSxhLGIsYyxkLGcpOjcwfXZhciBQYj1bbnVsbCxbXSxbXV07ZnVuY3Rpb24gUWIoYSxiLGMsZCl7aWYoRClyZXR1cm4gVygyNCwxLGEsYixjLGQpO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2Zvcih2YXIgZz0wLGg9MDtoPGM7aCsrKXt2YXIgaz10KClbYj4+Mj4+PjBdLHE9dCgpW2IrND4+Mj4+PjBdO2IrPTg7Zm9yKHZhciBCPTA7QjxxO0IrKyl7dmFyIHY9bigpW2srQj4+PjBdLHk9UGJbYV07MD09PXZ8fDEwPT09dj8oKDE9PT1hP3FhOkkpKEphKHksMCkpLHkubGVuZ3RoPTApOnkucHVzaCh2KX1nKz1xfXQoKVtkPj4yPj4+MF09ZztyZXR1cm4gMH12YXIgUmI9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXSxTYj1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO2Z1bmN0aW9uIFRiKGEpe3ZhciBiPUFycmF5KGNiKGEpKzEpO2RiKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbnZhciBVYj0oYSxiKT0+e2FhKCkuc2V0KGEsYj4+PjApfTtcbmZ1bmN0aW9uIFZiKGEsYixjLGQpe2Z1bmN0aW9uIGcoZixyLHUpe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPHI7KWY9dVswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixyKXtyZXR1cm4gZyhmLHIsXCIwXCIpfWZ1bmN0aW9uIGsoZixyKXtmdW5jdGlvbiB1KEtiKXtyZXR1cm4gMD5LYj8tMTowPEtiPzE6MH12YXIgSDswPT09KEg9dShmLmdldEZ1bGxZZWFyKCktci5nZXRGdWxsWWVhcigpKSkmJjA9PT0oSD11KGYuZ2V0TW9udGgoKS1yLmdldE1vbnRoKCkpKSYmKEg9dShmLmdldERhdGUoKS1yLmdldERhdGUoKSkpO3JldHVybiBIfWZ1bmN0aW9uIHEoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBCKGYpe3ZhciByPWYuUWE7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuUmErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8cjspe3ZhciB1PWYuZ2V0TW9udGgoKSxIPShZKGYuZ2V0RnVsbFllYXIoKSk/UmI6U2IpW3VdO2lmKHI+SC1mLmdldERhdGUoKSlyLT1ILWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnU/Zi5zZXRNb250aCh1KzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStyKTticmVha319dT1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3I9cShuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt1PXEodSk7cmV0dXJuIDA+PWsocixmKT8wPj1rKHUsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgdj1wKClbZCs0MD4+Mj4+PjBdO2Q9e3JiOnAoKVtkPj4yPj4+MF0scWI6cCgpW2QrND4+Mj4+PjBdLFRhOnAoKVtkKzg+PjI+Pj4wXSxYYTpwKClbZCsxMj4+Mj4+PjBdLFVhOnAoKVtkKzE2Pj4yPj4+MF0sUmE6cCgpW2QrMjA+PjI+Pj4wXSxOYTpwKClbZCsyND4+Mj4+PjBdLFFhOnAoKVtkKzI4Pj4yPj4+MF0semI6cCgpW2QrMzI+PjI+Pj4wXSxwYjpwKClbZCszNj4+Mj4+PjBdLHNiOnY/S2Eodik6XCJcIn07Yz1LYShjKTt2PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXG5cIiVYXCI6XCIlSDolTTolU1wiLFwiJUVjXCI6XCIlY1wiLFwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHkgaW4gdiljPWMucmVwbGFjZShuZXcgUmVnRXhwKHksXCJnXCIpLHZbeV0pO3ZhciBMYj1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLE1iPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt2PXtcIiVhXCI6Zj0+TGJbZi5OYV0uc3Vic3RyaW5nKDAsMyksXG5cIiVBXCI6Zj0+TGJbZi5OYV0sXCIlYlwiOmY9Pk1iW2YuVWFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT5NYltmLlVhXSxcIiVDXCI6Zj0+aCgoZi5SYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6Zj0+aChmLlhhLDIpLFwiJWVcIjpmPT5nKGYuWGEsMixcIiBcIiksXCIlZ1wiOmY9PkIoZikudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOmY9PkIoZiksXCIlSFwiOmY9PmgoZi5UYSwyKSxcIiVJXCI6Zj0+e2Y9Zi5UYTswPT1mP2Y9MTI6MTI8ZiYmKGYtPTEyKTtyZXR1cm4gaChmLDIpfSxcIiVqXCI6Zj0+e2Zvcih2YXIgcj0wLHU9MDt1PD1mLlVhLTE7cis9KFkoZi5SYSsxOTAwKT9SYjpTYilbdSsrXSk7cmV0dXJuIGgoZi5YYStyLDMpfSxcIiVtXCI6Zj0+aChmLlVhKzEsMiksXCIlTVwiOmY9PmgoZi5xYiwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmY9PjA8PWYuVGEmJjEyPmYuVGE/XCJBTVwiOlwiUE1cIixcIiVTXCI6Zj0+aChmLnJiLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6Zj0+Zi5OYXx8NyxcIiVVXCI6Zj0+aChNYXRoLmZsb29yKChmLlFhK1xuNy1mLk5hKS83KSwyKSxcIiVWXCI6Zj0+e3ZhciByPU1hdGguZmxvb3IoKGYuUWErNy0oZi5OYSs2KSU3KS83KTsyPj0oZi5OYSszNzEtZi5RYS0yKSU3JiZyKys7aWYocik1Mz09ciYmKHU9KGYuTmErMzcxLWYuUWEpJTcsND09dXx8Mz09dSYmWShmLlJhKXx8KHI9MSkpO2Vsc2V7cj01Mjt2YXIgdT0oZi5OYSs3LWYuUWEtMSklNzsoND09dXx8NT09dSYmWShmLlJhJTQwMC0xKSkmJnIrK31yZXR1cm4gaChyLDIpfSxcIiV3XCI6Zj0+Zi5OYSxcIiVXXCI6Zj0+aChNYXRoLmZsb29yKChmLlFhKzctKGYuTmErNiklNykvNyksMiksXCIleVwiOmY9PihmLlJhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjpmPT5mLlJhKzE5MDAsXCIlelwiOmY9PntmPWYucGI7dmFyIHI9MDw9ZjtmPU1hdGguYWJzKGYpLzYwO3JldHVybihyP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGYvNjAqMTAwK2YlNjApKS5zbGljZSgtNCl9LFwiJVpcIjpmPT5mLnNiLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFxuXCJcXHgwMFxceDAwXCIpO2Zvcih5IGluIHYpYy5pbmNsdWRlcyh5KSYmKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeSxcImdcIiksdlt5XShkKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7eT1UYihjKTtpZih5Lmxlbmd0aD5iKXJldHVybiAwO1ViKHksYSk7cmV0dXJuIHkubGVuZ3RoLTF9dmFyIFo9dm9pZCAwLFdiPVtdO1xuZnVuY3Rpb24gWGIoYSxiKXtpZighWil7Wj1uZXcgV2Vha01hcDt2YXIgYz1QLmxlbmd0aDtpZihaKWZvcih2YXIgZD0wO2Q8MCtjO2QrKyl7dmFyIGc9VWEoZCk7ZyYmWi5zZXQoZyxkKX19aWYoYz1aLmdldChhKXx8MClyZXR1cm4gYztpZihXYi5sZW5ndGgpYz1XYi5wb3AoKTtlbHNle3RyeXtQLmdyb3coMSl9Y2F0Y2gocSl7aWYoIShxIGluc3RhbmNlb2YgUmFuZ2VFcnJvcikpdGhyb3cgcTt0aHJvd1wiVW5hYmxlIHRvIGdyb3cgd2FzbSB0YWJsZS4gU2V0IEFMTE9XX1RBQkxFX0dST1dUSC5cIjt9Yz1QLmxlbmd0aC0xfXRyeXtkPWMsUC5zZXQoZCxhKSxYW2RdPVAuZ2V0KGQpfWNhdGNoKHEpe2lmKCEocSBpbnN0YW5jZW9mIFR5cGVFcnJvcikpdGhyb3cgcTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBXZWJBc3NlbWJseS5GdW5jdGlvbil7ZD1XZWJBc3NlbWJseS5GdW5jdGlvbjtnPXtpOlwiaTMyXCIsajpcImk2NFwiLGY6XCJmMzJcIixkOlwiZjY0XCIscDpcImkzMlwifTtmb3IodmFyIGg9e3BhcmFtZXRlcnM6W10sXG5yZXN1bHRzOlwidlwiPT1iWzBdP1tdOltnW2JbMF1dXX0saz0xO2s8Yi5sZW5ndGg7KytrKWgucGFyYW1ldGVycy5wdXNoKGdbYltrXV0pO2I9bmV3IGQoaCxhKX1lbHNle2Q9WzFdO2c9Yi5zbGljZSgwLDEpO2I9Yi5zbGljZSgxKTtoPXtpOjEyNyxwOjEyNyxqOjEyNixmOjEyNSxkOjEyNH07ZC5wdXNoKDk2KTtrPWIubGVuZ3RoOzEyOD5rP2QucHVzaChrKTpkLnB1c2goayUxMjh8MTI4LGs+PjcpO2ZvcihrPTA7azxiLmxlbmd0aDsrK2spZC5wdXNoKGhbYltrXV0pO1widlwiPT1nP2QucHVzaCgwKTpkLnB1c2goMSxoW2ddKTtiPVswLDk3LDExNSwxMDksMSwwLDAsMCwxXTtnPWQubGVuZ3RoOzEyOD5nP2IucHVzaChnKTpiLnB1c2goZyUxMjh8MTI4LGc+PjcpO2IucHVzaC5hcHBseShiLGQpO2IucHVzaCgyLDcsMSwxLDEwMSwxLDEwMiwwLDAsNyw1LDEsMSwxMDIsMCwwKTtiPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUobmV3IFVpbnQ4QXJyYXkoYikpO2I9KG5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShiLFxue2U6e2Y6YX19KSkuZXhwb3J0cy5mfWQ9YztQLnNldChkLGIpO1hbZF09UC5nZXQoZCl9Wi5zZXQoYSxjKTtyZXR1cm4gY31WLldhKCk7XG52YXIgWWI9W251bGwsTGEsTWEsWmEsYWIsYmIsZmIsZ2IsaGIsaWIsamIsa2IsbGIsbWIsbmIsb2IscGIsdmIsd2IsSGIsSWIsSmIsTmIsT2IsUWJdLGFjPXtiOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBXYShhKSkuV2EoYj4+PjAsYz4+PjApO1hhPWE7WWErKzt0aHJvdyBYYTt9LE46ZnVuY3Rpb24oYSl7WmIoYT4+PjAsIUEsMSwha2EsMTMxMDcyLCExKTtWLlphKCl9LGs6ZnVuY3Rpb24oYSl7YT4+Pj0wO0Q/cG9zdE1lc3NhZ2Uoe2NtZDpcImNsZWFudXBUaHJlYWRcIix0aHJlYWQ6YX0pOkdhKGEpfSxJOiRhLGg6YWIsVDpiYixEOmZiLEY6Z2IsVTpoYixSOmliLEo6amIsUTprYixvOmxiLEU6bWIsQjpuYixTOm9iLEM6cGIscTooKT0+ITAsejpmdW5jdGlvbihhLGIpe2E+Pj49MDthPT1iPj4+MD9zZXRUaW1lb3V0KCgpPT5RYSgpKTpEP3Bvc3RNZXNzYWdlKHt0YXJnZXRUaHJlYWQ6YSxjbWQ6XCJjaGVja01haWxib3hcIn0pOihhPVYuTWFbYV0pJiZhLnBvc3RNZXNzYWdlKHtjbWQ6XCJjaGVja01haWxib3hcIn0pfSxcbkw6ZnVuY3Rpb24oKXtyZXR1cm4tMX0sTTpyYixwOmZ1bmN0aW9uKGEpe0MmJlYuTWFbYT4+PjBdLnJlZigpfSx0OmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtwKClbYz4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO3AoKVtjKzQ+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTtwKClbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO3AoKVtjKzEyPj4yPj4+MF09YS5nZXRVVENEYXRlKCk7cCgpW2MrMTY+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7cCgpW2MrMjA+PjI+Pj4wXT1hLmdldFVUQ0Z1bGxZZWFyKCktMTkwMDtwKClbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7YT0oYS5nZXRUaW1lKCktRGF0ZS5VVEMoYS5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0RTV8MDtwKClbYysyOD4+Mj4+PjBdPWF9LHU6ZnVuY3Rpb24oYSxiLGMpe2E9YitcbjIwOTcxNTI+Pj4wPDQxOTQzMDUtISFhPyhhPj4+MCkrNDI5NDk2NzI5NipiOk5hTjtjPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7cCgpW2M+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTtwKClbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7cCgpW2MrOD4+Mj4+PjBdPWEuZ2V0SG91cnMoKTtwKClbYysxMj4+Mj4+PjBdPWEuZ2V0RGF0ZSgpO3AoKVtjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO3AoKVtjKzIwPj4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7cCgpW2MrMjQ+PjI+Pj4wXT1hLmdldERheSgpO2I9KFkoYS5nZXRGdWxsWWVhcigpKT90Yjp1YilbYS5nZXRNb250aCgpXSthLmdldERhdGUoKS0xfDA7cCgpW2MrMjg+PjI+Pj4wXT1iO3AoKVtjKzM2Pj4yPj4+MF09LSg2MCphLmdldFRpbWV6b25lT2Zmc2V0KCkpO2I9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBkPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbmE9KGIhPWQmJmEuZ2V0VGltZXpvbmVPZmZzZXQoKT09TWF0aC5taW4oZCxiKSl8MDtwKClbYyszMj4+Mj4+PjBdPWF9LHY6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKHAoKVthKzIwPj4yPj4+MF0rMTkwMCxwKClbYSsxNj4+Mj4+PjBdLHAoKVthKzEyPj4yPj4+MF0scCgpW2ErOD4+Mj4+PjBdLHAoKVthKzQ+PjI+Pj4wXSxwKClbYT4+Mj4+PjBdLDApLGM9cCgpW2ErMzI+PjI+Pj4wXSxkPWIuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxoPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxrPU1hdGgubWluKGgsZyk7MD5jP3AoKVthKzMyPj4yPj4+MF09TnVtYmVyKGchPWgmJms9PWQpOjA8YyE9KGs9PWQpJiYoZz1NYXRoLm1heChoLGcpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/azpnKS1kKSkpO3AoKVthKzI0Pj4yPj4+XG4wXT1iLmdldERheSgpO2M9KFkoYi5nZXRGdWxsWWVhcigpKT90Yjp1YilbYi5nZXRNb250aCgpXStiLmdldERhdGUoKS0xfDA7cCgpW2ErMjg+PjI+Pj4wXT1jO3AoKVthPj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7cCgpW2ErND4+Mj4+PjBdPWIuZ2V0TWludXRlcygpO3AoKVthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7cCgpW2ErMTI+PjI+Pj4wXT1iLmdldERhdGUoKTtwKClbYSsxNj4+Mj4+PjBdPWIuZ2V0TW9udGgoKTtwKClbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiAkYigoVT1hLDE8PStNYXRoLmFicyhVKT8wPFU/K01hdGguZmxvb3IoVS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKChVLSsofn5VPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKSksYT4+PjB9LHI6dmIsczp3Yix5OmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKHYpe3JldHVybih2PXYudG9UaW1lU3RyaW5nKCkubWF0Y2goL1xcKChbQS1aYS16IF0rKVxcKSQvKSk/XG52WzFdOlwiR01UXCJ9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLGs9bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBxPWsuZ2V0VGltZXpvbmVPZmZzZXQoKSxCPU1hdGgubWF4KGcscSk7dCgpW2E+PjI+Pj4wXT02MCpCO3AoKVtiPj4yPj4+MF09TnVtYmVyKGchPXEpO2E9ZChoKTtiPWQoayk7YT15YihhKTtiPXliKGIpO3E8Zz8odCgpW2M+PjI+Pj4wXT1hLHQoKVtjKzQ+PjI+Pj4wXT1iKToodCgpW2M+PjI+Pj4wXT1iLHQoKVtjKzQ+PjI+Pj4wXT1hKX0sYzooKT0+e0soXCJcIil9LGw6ZnVuY3Rpb24oKXt9LGk6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sVjooKT0+e3ZhKz0xO3Rocm93XCJ1bndpbmRcIjt9LEE6ZnVuY3Rpb24oKXtyZXR1cm4gNDI5NDkwMTc2MH0sZTooKT0+cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKSxmOmZ1bmN0aW9uKCl7cmV0dXJuIEM/XG5yZXF1aXJlKFwib3NcIikuY3B1cygpLmxlbmd0aDpuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeX0sSzpmdW5jdGlvbihhLGIsYyxkKXtWLndiPWI+Pj4wO0RiLmxlbmd0aD1jO2I9ZD4+PjA+PjM7Zm9yKGQ9MDtkPGM7ZCsrKURiW2RdPWVhKClbYitkPj4+MF07cmV0dXJuIFliW2FdLmFwcGx5KG51bGwsRGIpfSx4OmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uKCkubGVuZ3RoO2lmKGE8PWJ8fDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBkPWIqKDErLjIvYyk7ZD1NYXRoLm1pbihkLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2Q9TWF0aC5tYXgoYSxkKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGQrKDY1NTM2LWQlNjU1MzYpJTY1NTM2KS1lLmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e2UuZ3JvdyhnKTttKCk7dmFyIGg9MTticmVhayBhfWNhdGNoKGspe31oPXZvaWQgMH1pZihoKXJldHVybiEwfXJldHVybiExfSxcbk86SGIsUDpJYixIOk5hLGc6SmIsbjpOYix3Ok9iLG06UWIsYTplfHx3Lndhc21NZW1vcnksRzpWYixkOmZ1bmN0aW9uKGEsYixjLGQpe3JldHVybiBWYihhPj4+MCxiPj4+MCxjPj4+MCxkPj4+MCl9LGo6ZnVuY3Rpb24oYSxiLGMsZCl7Y29uc3QgZz1QLmxlbmd0aDthPW5ldyBVaW50OEFycmF5KG4oKS5zbGljZShhK2IsYStjKSk7dHJ5e3ZhciBoPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUoYSksaz1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UoaCx7ZW52OnttZW1vcnk6ZX19KSxxO2ZvcihxIGluIGsuZXhwb3J0cylYYihrLmV4cG9ydHNbcV0pO3JldHVybiBnPFAubGVuZ3RoP2c6ZH1jYXRjaChCKXtyZXR1cm4gY29uc29sZS5sb2coQiksZH19fTtcbihmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyxkKXtjPWMuZXhwb3J0cztMPWM9YmMoYyk7Vi4kYS5wdXNoKEwuemEpO1A9TC5BYTt0YS51bnNoaWZ0KEwuVyk7cmE9ZDt5YSgpO3JldHVybiBjfXZhciBiPXthOmFjfTt4YSgpO2lmKHcuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gdy5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtJKFwiTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogXCIrYykseChjKX1EYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSxjLm1vZHVsZSl9KS5jYXRjaCh4KTtyZXR1cm57fX0pKCk7dy5fT3J0SW5pdD0oYSxiKT0+KHcuX09ydEluaXQ9TC5YKShhLGIpO3cuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KHcuX09ydEdldExhc3RFcnJvcj1MLlkpKGEsYik7XG53Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxnLGgsayxxLEIsdik9Pih3Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1MLlopKGEsYixjLGQsZyxoLGsscSxCLHYpO3cuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4ody5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9TC5fKShhLGIpO3cuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4ody5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPUwuJCkoYSxiLGMpO3cuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT0oYSxiLGMpPT4ody5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PUwuYWEpKGEsYixjKTt3Ll9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9YT0+KHcuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1MLmJhKShhKTt3Ll9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9Pih3Ll9PcnRDcmVhdGVTZXNzaW9uPUwuY2EpKGEsYixjKTtcbncuX09ydFJlbGVhc2VTZXNzaW9uPWE9Pih3Ll9PcnRSZWxlYXNlU2Vzc2lvbj1MLmRhKShhKTt3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PShhLGIsYyk9Pih3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PUwuZWEpKGEsYixjKTt3Ll9PcnRHZXRJbnB1dE5hbWU9KGEsYik9Pih3Ll9PcnRHZXRJbnB1dE5hbWU9TC5mYSkoYSxiKTt3Ll9PcnRHZXRPdXRwdXROYW1lPShhLGIpPT4ody5fT3J0R2V0T3V0cHV0TmFtZT1MLmdhKShhLGIpO3cuX09ydEZyZWU9YT0+KHcuX09ydEZyZWU9TC5oYSkoYSk7dy5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxkLGcsaCk9Pih3Ll9PcnRDcmVhdGVUZW5zb3I9TC5pYSkoYSxiLGMsZCxnLGgpO3cuX09ydEdldFRlbnNvckRhdGE9KGEsYixjLGQsZyk9Pih3Ll9PcnRHZXRUZW5zb3JEYXRhPUwuamEpKGEsYixjLGQsZyk7dy5fT3J0UmVsZWFzZVRlbnNvcj1hPT4ody5fT3J0UmVsZWFzZVRlbnNvcj1MLmthKShhKTtcbncuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGQpPT4ody5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1MLmxhKShhLGIsYyxkKTt3Ll9PcnRBZGRSdW5Db25maWdFbnRyeT0oYSxiLGMpPT4ody5fT3J0QWRkUnVuQ29uZmlnRW50cnk9TC5tYSkoYSxiLGMpO3cuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9Pih3Ll9PcnRSZWxlYXNlUnVuT3B0aW9ucz1MLm5hKShhKTt3Ll9PcnRDcmVhdGVCaW5kaW5nPWE9Pih3Ll9PcnRDcmVhdGVCaW5kaW5nPUwub2EpKGEpO3cuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4ody5fT3J0QmluZElucHV0PUwucGEpKGEsYixjKTt3Ll9PcnRCaW5kT3V0cHV0PShhLGIsYyxkKT0+KHcuX09ydEJpbmRPdXRwdXQ9TC5xYSkoYSxiLGMsZCk7dy5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KHcuX09ydENsZWFyQm91bmRPdXRwdXRzPUwucmEpKGEpO3cuX09ydFJlbGVhc2VCaW5kaW5nPWE9Pih3Ll9PcnRSZWxlYXNlQmluZGluZz1MLnNhKShhKTtcbncuX09ydFJ1bldpdGhCaW5kaW5nPShhLGIsYyxkLGcpPT4ody5fT3J0UnVuV2l0aEJpbmRpbmc9TC50YSkoYSxiLGMsZCxnKTt3Ll9PcnRSdW49KGEsYixjLGQsZyxoLGsscSk9Pih3Ll9PcnRSdW49TC51YSkoYSxiLGMsZCxnLGgsayxxKTt3Ll9PcnRFbmRQcm9maWxpbmc9YT0+KHcuX09ydEVuZFByb2ZpbGluZz1MLnZhKShhKTt2YXIgUGE9dy5fcHRocmVhZF9zZWxmPSgpPT4oUGE9dy5fcHRocmVhZF9zZWxmPUwud2EpKCkseGI9dy5fbWFsbG9jPWE9Pih4Yj13Ll9tYWxsb2M9TC54YSkoYSk7dy5fZnJlZT1hPT4ody5fZnJlZT1MLnlhKShhKTt3Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD0oKT0+KHcuX19lbXNjcmlwdGVuX3Rsc19pbml0PUwuemEpKCk7dmFyIFpiPXcuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PShhLGIsYyxkLGcsaCk9PihaYj13Ll9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD1MLkJhKShhLGIsYyxkLGcsaCk7XG53Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD0oKT0+KHcuX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPUwuQ2EpKCk7dmFyIENiPShhLGIsYyxkKT0+KENiPUwuRGEpKGEsYixjLGQpLE9hPWE9PihPYT1MLkVhKShhKSxWYT13Ll9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1hPT4oVmE9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9TC5GYSkoYSksc2I9dy5fX2Vtc2NyaXB0ZW5fY2hlY2tfbWFpbGJveD0oKT0+KHNiPXcuX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9TC5HYSkoKSwkYj1hPT4oJGI9TC5IYSkoYSksU2E9KGEsYik9PihTYT1MLklhKShhLGIpLHpiPSgpPT4oemI9TC5KYSkoKSxUYT1hPT4oVGE9TC5LYSkoYSksQmI9YT0+KEJiPUwuTGEpKGEpO3cuX19fc3RhcnRfZW1fanM9OTA2ODQ0O3cuX19fc3RvcF9lbV9qcz05MDc0NTY7XG5mdW5jdGlvbiBiYyhhKXthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5nPT5kKGcpPj4+MDthLl9fZXJybm9fbG9jYXRpb249YihhLl9fZXJybm9fbG9jYXRpb24pO2EucHRocmVhZF9zZWxmPWIoYS5wdGhyZWFkX3NlbGYpO2EubWFsbG9jPWMoYS5tYWxsb2MpO2Euc3RhY2tTYXZlPWIoYS5zdGFja1NhdmUpO2Euc3RhY2tBbGxvYz1jKGEuc3RhY2tBbGxvYyk7cmV0dXJuIGF9dy5rZWVwUnVudGltZUFsaXZlPVE7dy53YXNtTWVtb3J5PWU7dy5zdGFja0FsbG9jPUJiO3cuc3RhY2tTYXZlPXpiO3cuc3RhY2tSZXN0b3JlPVRhO3cuYWRkRnVuY3Rpb249WGI7dy5VVEY4VG9TdHJpbmc9S2E7dy5zdHJpbmdUb1VURjg9ZWI7dy5sZW5ndGhCeXRlc1VURjg9Y2I7dy5FeGl0U3RhdHVzPUVhO3cuUFRocmVhZD1WO3ZhciBjYztTPWZ1bmN0aW9uIGRjKCl7Y2N8fGVjKCk7Y2N8fChTPWRjKX07XG5mdW5jdGlvbiBlYygpe2Z1bmN0aW9uIGEoKXtpZighY2MmJihjYz0hMCx3LmNhbGxlZFJ1bj0hMCwhTSkpe0R8fFJhKHRhKTtoYSh3KTtpZih3Lm9uUnVudGltZUluaXRpYWxpemVkKXcub25SdW50aW1lSW5pdGlhbGl6ZWQoKTtpZighRCl7aWYody5wb3N0UnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiB3LnBvc3RSdW4mJih3LnBvc3RSdW49W3cucG9zdFJ1bl0pO3cucG9zdFJ1bi5sZW5ndGg7KXt2YXIgYj13LnBvc3RSdW4uc2hpZnQoKTt1YS51bnNoaWZ0KGIpfVJhKHVhKX19fWlmKCEoMDxSKSlpZihEKWhhKHcpLER8fFJhKHRhKSxzdGFydFdvcmtlcih3KTtlbHNle2lmKHcucHJlUnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiB3LnByZVJ1biYmKHcucHJlUnVuPVt3LnByZVJ1bl0pO3cucHJlUnVuLmxlbmd0aDspc2EudW5zaGlmdCh3LnByZVJ1bi5zaGlmdCgpKTtSYShzYSk7MDxSfHwody5zZXRTdGF0dXM/KHcuc2V0U3RhdHVzKFwiUnVubmluZy4uLlwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe3cuc2V0U3RhdHVzKFwiXCIpfSxcbjEpO2EoKX0sMSkpOmEoKSl9fWlmKHcucHJlSW5pdClmb3IoXCJmdW5jdGlvblwiPT10eXBlb2Ygdy5wcmVJbml0JiYody5wcmVJbml0PVt3LnByZUluaXRdKTswPHcucHJlSW5pdC5sZW5ndGg7KXcucHJlSW5pdC5wb3AoKSgpO2VjKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG5cbik7XG59KSgpO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtVGhyZWFkZWQ7XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbVRocmVhZGVkKTtcbiIsICJcInVzZSBzdHJpY3RcIjt2YXIgTW9kdWxlPXt9O3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09XCJzdHJpbmdcIjtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXt2YXIgbm9kZVdvcmtlclRocmVhZHM9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO3ZhciBwYXJlbnRQb3J0PW5vZGVXb3JrZXJUaHJlYWRzLnBhcmVudFBvcnQ7cGFyZW50UG9ydC5vbihcIm1lc3NhZ2VcIixkYXRhPT5vbm1lc3NhZ2Uoe2RhdGE6ZGF0YX0pKTt2YXIgZnM9cmVxdWlyZShcImZzXCIpO09iamVjdC5hc3NpZ24oZ2xvYmFsLHtzZWxmOmdsb2JhbCxyZXF1aXJlOnJlcXVpcmUsTW9kdWxlOk1vZHVsZSxsb2NhdGlvbjp7aHJlZjpfX2ZpbGVuYW1lfSxXb3JrZXI6bm9kZVdvcmtlclRocmVhZHMuV29ya2VyLGltcG9ydFNjcmlwdHM6Zj0+KDAsZXZhbCkoZnMucmVhZEZpbGVTeW5jKGYsXCJ1dGY4XCIpK1wiLy8jIHNvdXJjZVVSTD1cIitmKSxwb3N0TWVzc2FnZTptc2c9PnBhcmVudFBvcnQucG9zdE1lc3NhZ2UobXNnKSxwZXJmb3JtYW5jZTpnbG9iYWwucGVyZm9ybWFuY2V8fHtub3c6RGF0ZS5ub3d9fSl9dmFyIGluaXRpYWxpemVkSlM9ZmFsc2U7ZnVuY3Rpb24gdGhyZWFkUHJpbnRFcnIoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO2lmKEVOVklST05NRU5UX0lTX05PREUpe2ZzLndyaXRlU3luYygyLHRleHQrXCJcXG5cIik7cmV0dXJufWNvbnNvbGUuZXJyb3IodGV4dCl9ZnVuY3Rpb24gdGhyZWFkQWxlcnQoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO3Bvc3RNZXNzYWdlKHtjbWQ6XCJhbGVydFwiLHRleHQ6dGV4dCx0aHJlYWRJZDpNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCl9KX12YXIgZXJyPXRocmVhZFByaW50RXJyO3NlbGYuYWxlcnQ9dGhyZWFkQWxlcnQ7TW9kdWxlW1wiaW5zdGFudGlhdGVXYXNtXCJdPShpbmZvLHJlY2VpdmVJbnN0YW5jZSk9Pnt2YXIgbW9kdWxlPU1vZHVsZVtcIndhc21Nb2R1bGVcIl07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1udWxsO3ZhciBpbnN0YW5jZT1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobW9kdWxlLGluZm8pO3JldHVybiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UpfTtzZWxmLm9udW5oYW5kbGVkcmVqZWN0aW9uPWU9Pnt0aHJvdyBlLnJlYXNvbj8/ZX07ZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShlKXt0cnl7aWYoZS5kYXRhLmNtZD09PVwibG9hZFwiKXtsZXQgbWVzc2FnZVF1ZXVlPVtdO3NlbGYub25tZXNzYWdlPWU9Pm1lc3NhZ2VRdWV1ZS5wdXNoKGUpO3NlbGYuc3RhcnRXb3JrZXI9aW5zdGFuY2U9PntNb2R1bGU9aW5zdGFuY2U7cG9zdE1lc3NhZ2Uoe1wiY21kXCI6XCJsb2FkZWRcIn0pO2ZvcihsZXQgbXNnIG9mIG1lc3NhZ2VRdWV1ZSl7aGFuZGxlTWVzc2FnZShtc2cpfXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2V9O01vZHVsZVtcIndhc21Nb2R1bGVcIl09ZS5kYXRhLndhc21Nb2R1bGU7Zm9yKGNvbnN0IGhhbmRsZXIgb2YgZS5kYXRhLmhhbmRsZXJzKXtNb2R1bGVbaGFuZGxlcl09KC4uLmFyZ3MpPT57cG9zdE1lc3NhZ2Uoe2NtZDpcImNhbGxIYW5kbGVyXCIsaGFuZGxlcjpoYW5kbGVyLGFyZ3M6YXJnc30pfX1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdPWUuZGF0YS53YXNtTWVtb3J5O01vZHVsZVtcImJ1ZmZlclwiXT1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdLmJ1ZmZlcjtNb2R1bGVbXCJFTlZJUk9OTUVOVF9JU19QVEhSRUFEXCJdPXRydWU7aWYodHlwZW9mIGUuZGF0YS51cmxPckJsb2I9PVwic3RyaW5nXCIpe2ltcG9ydFNjcmlwdHMoZS5kYXRhLnVybE9yQmxvYil9ZWxzZXt2YXIgb2JqZWN0VXJsPVVSTC5jcmVhdGVPYmplY3RVUkwoZS5kYXRhLnVybE9yQmxvYik7aW1wb3J0U2NyaXB0cyhvYmplY3RVcmwpO1VSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKX1vcnRXYXNtVGhyZWFkZWQoTW9kdWxlKX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cInJ1blwiKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyLC8qaXNNYWluQnJvd3NlclRocmVhZD0qLzAsLyppc01haW5SdW50aW1lVGhyZWFkPSovMCwvKmNhbkJsb2NrPSovMSk7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0XCJdKGUuZGF0YS5wdGhyZWFkX3B0cik7TW9kdWxlW1wiZXN0YWJsaXNoU3RhY2tTcGFjZVwiXSgpO01vZHVsZVtcIlBUaHJlYWRcIl0ucmVjZWl2ZU9iamVjdFRyYW5zZmVyKGUuZGF0YSk7TW9kdWxlW1wiUFRocmVhZFwiXS50aHJlYWRJbml0VExTKCk7aWYoIWluaXRpYWxpemVkSlMpe2luaXRpYWxpemVkSlM9dHJ1ZX10cnl7TW9kdWxlW1wiaW52b2tlRW50cnlQb2ludFwiXShlLmRhdGEuc3RhcnRfcm91dGluZSxlLmRhdGEuYXJnKX1jYXRjaChleCl7aWYoZXghPVwidW53aW5kXCIpe3Rocm93IGV4fX19ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjYW5jZWxcIil7aWYoTW9kdWxlW1wiX3B0aHJlYWRfc2VsZlwiXSgpKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXRcIl0oLTEpfX1lbHNlIGlmKGUuZGF0YS50YXJnZXQ9PT1cInNldGltbWVkaWF0ZVwiKXt9ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjaGVja01haWxib3hcIil7aWYoaW5pdGlhbGl6ZWRKUyl7TW9kdWxlW1wiY2hlY2tNYWlsYm94XCJdKCl9fWVsc2UgaWYoZS5kYXRhLmNtZCl7ZXJyKFwid29ya2VyLmpzIHJlY2VpdmVkIHVua25vd24gY29tbWFuZCBcIitlLmRhdGEuY21kKTtlcnIoZS5kYXRhKX19Y2F0Y2goZXgpe2lmKE1vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZFwiXSl7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdKCl9dGhyb3cgZXh9fXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2U7XG4iLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQge0Vudn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtPcnRXYXNtTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20nO1xuaW1wb3J0IHtPcnRXYXNtVGhyZWFkZWRNb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cbmxldCBvcnRXYXNtRmFjdG9yeTogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT47XG5cbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gIG9ydFdhc21GYWN0b3J5ID0gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC10cmFpbmluZy13YXNtLXNpbWQuanMnKTtcbn0gZWxzZSB7XG4gIG9ydFdhc21GYWN0b3J5ID1cbiAgICAgIEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20uanMnKSA6IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLmpzZXAuanMnKTtcbn1cblxuY29uc3Qgb3J0V2FzbUZhY3RvcnlUaHJlYWRlZDogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT4gPSAhQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEID9cbiAgICAoQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcycpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAuanMnKSkgOlxuICAgIG9ydFdhc21GYWN0b3J5O1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5cbmxldCB3YXNtOiBPcnRXYXNtTW9kdWxlfHVuZGVmaW5lZDtcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xubGV0IGFib3J0ZWQgPSBmYWxzZTtcblxuY29uc3QgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBJZiAnU2hhcmVkQXJyYXlCdWZmZXInIGlzIG5vdCBhdmFpbGFibGUsIFdlYkFzc2VtYmx5IHRocmVhZHMgd2lsbCBub3Qgd29yay5cbiAgICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIHRyYW5zZmVyYWJpbGl0eSBvZiBTQUJzIChmb3IgYnJvd3NlcnMuIG5lZWRlZCBmb3IgRmlyZWZveClcbiAgICAvLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhbXNnL21vemlsbGEuZGV2LnBsYXRmb3JtL0lIa0JabEhFVHBBL2R3c01OY2hXRVFBSlxuICAgIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBuZXcgTWVzc2FnZUNoYW5uZWwoKS5wb3J0MS5wb3N0TWVzc2FnZShuZXcgU2hhcmVkQXJyYXlCdWZmZXIoMSkpO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IHRocmVhZHMgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyB0aHJlYWRlZCBpbnN0cnVjdGlvbnMuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgIDAsICAwLCAxLCA0LCAxLCAgOTYsIDAsICAgMCwgIDMsIDIsIDEsICAwLCA1LFxuICAgICAgNCwgMSwgIDMsICAgMSwgICAxLCAxMCwgMTEsIDEsIDksIDAsIDY1LCAwLCAgMjU0LCAxNiwgMiwgMCwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBpc1NpbWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgU0lNRCBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIFNJTUQgaW5zdHJ1Y3Rpb25zLlxuXG4gICAgLy8gVGhlIGJpbmFyeSBkYXRhIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBmb2xsb3dpbmcgY29kZSBieSB3YXQyd2FzbTpcbiAgICAvL1xuICAgIC8vIChtb2R1bGVcbiAgICAvLyAgICh0eXBlICR0MCAoZnVuYykpXG4gICAgLy8gICAoZnVuYyAkZjAgKHR5cGUgJHQwKVxuICAgIC8vICAgICAoZHJvcFxuICAgIC8vICAgICAgIChpMzJ4NC5kb3RfaTE2eDhfc1xuICAgIC8vICAgICAgICAgKGk4eDE2LnNwbGF0XG4gICAgLy8gICAgICAgICAgIChpMzIuY29uc3QgMCkpXG4gICAgLy8gICAgICAgICAodjEyOC5jb25zdCBpMzJ4NCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwKSkpKSlcblxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCAgIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgNCwgMSwgOTYsIDAsIDAsIDMsIDIsIDEsIDAsIDEwLCAzMCwgMSwgICAyOCwgIDAsIDY1LCAwLFxuICAgICAgMjUzLCAxNSwgMjUzLCAxMiwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgIDI1MywgMTg2LCAxLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGdldFdhc21GaWxlTmFtZSA9ICh1c2VTaW1kOiBib29sZWFuLCB1c2VUaHJlYWRzOiBib29sZWFuKSA9PiB7XG4gIGlmICh1c2VTaW1kKSB7XG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgICAgIHJldHVybiAnb3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtJztcbiAgICB9XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS1zaW1kLndhc20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLndhc20nO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5ID0gYXN5bmMoZmxhZ3M6IEVudi5XZWJBc3NlbWJseUZsYWdzKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmIChpbml0aWFsaXplZCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICBpZiAoaW5pdGlhbGl6aW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtdWx0aXBsZSBjYWxscyB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBkZXRlY3RlZC4nKTtcbiAgfVxuICBpZiAoYWJvcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJldmlvdXMgY2FsbCB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBmYWlsZWQuJyk7XG4gIH1cblxuICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gIC8vIHdhc20gZmxhZ3MgYXJlIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgY29uc3QgdGltZW91dCA9IGZsYWdzLmluaXRUaW1lb3V0ITtcbiAgY29uc3QgbnVtVGhyZWFkcyA9IGZsYWdzLm51bVRocmVhZHMhO1xuICBjb25zdCBzaW1kID0gZmxhZ3Muc2ltZCE7XG5cbiAgY29uc3QgdXNlVGhyZWFkcyA9IG51bVRocmVhZHMgPiAxICYmIGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQoKTtcbiAgY29uc3QgdXNlU2ltZCA9IHNpbWQgJiYgaXNTaW1kU3VwcG9ydGVkKCk7XG5cbiAgY29uc3Qgd2FzbVBhdGhzID0gZmxhZ3Mud2FzbVBhdGhzO1xuICBjb25zdCB3YXNtUHJlZml4T3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnc3RyaW5nJyA/IHdhc21QYXRocyA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgd2FzbUZpbGVOYW1lID0gZ2V0V2FzbUZpbGVOYW1lKHVzZVNpbWQsIHVzZVRocmVhZHMpO1xuICBjb25zdCB3YXNtUGF0aE92ZXJyaWRlID0gdHlwZW9mIHdhc21QYXRocyA9PT0gJ29iamVjdCcgPyB3YXNtUGF0aHNbd2FzbUZpbGVOYW1lXSA6IHVuZGVmaW5lZDtcblxuICBsZXQgaXNUaW1lb3V0ID0gZmFsc2U7XG5cbiAgY29uc3QgdGFza3M6IEFycmF5PFByb21pc2U8dm9pZD4+ID0gW107XG5cbiAgLy8gcHJvbWlzZSBmb3IgdGltZW91dFxuICBpZiAodGltZW91dCA+IDApIHtcbiAgICB0YXNrcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaXNUaW1lb3V0ID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgdGltZW91dCk7XG4gICAgfSkpO1xuICB9XG5cbiAgLy8gcHJvbWlzZSBmb3IgbW9kdWxlIGluaXRpYWxpemF0aW9uXG4gIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZhY3RvcnkgPSB1c2VUaHJlYWRzID8gb3J0V2FzbUZhY3RvcnlUaHJlYWRlZCA6IG9ydFdhc21GYWN0b3J5O1xuICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPcnRXYXNtTW9kdWxlPiA9IHtcbiAgICAgIGxvY2F0ZUZpbGU6IChmaWxlTmFtZTogc3RyaW5nLCBzY3JpcHREaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcud29ya2VyLmpzJykgJiZcbiAgICAgICAgICAgIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgLy8gVGhpcyByZXF1aXJlKCkgZnVuY3Rpb24gaXMgaGFuZGxlZCBieSBlc2J1aWxkIHBsdWdpbiB0byBsb2FkIGZpbGUgY29udGVudCBhcyBzdHJpbmcuXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzJylcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcud2FzbScpKSB7XG4gICAgICAgICAgaWYgKHdhc21QYXRoT3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIHJldHVybiB3YXNtUGF0aE92ZXJyaWRlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHdhc21QcmVmaXhPdmVycmlkZSA/PyBzY3JpcHREaXJlY3Rvcnk7XG5cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgICAgIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwcmVmaXggKyB3YXNtRmlsZU5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyaXB0RGlyZWN0b3J5ICsgZmlsZU5hbWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgQmxvYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnb3J0LXdhc20tdGhyZWFkZWQuanMnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNjcmlwdFNvdXJjZUNvZGUgPSBgdmFyIG9ydFdhc21UaHJlYWRlZD0ke2ZhY3RvcnkudG9TdHJpbmcoKX07YDtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBuZXcgQmxvYihbc2NyaXB0U291cmNlQ29kZV0sIHt0eXBlOiAndGV4dC9qYXZhc2NyaXB0J30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZhY3RvcnkoY29uZmlnKS50aGVuKFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgbW9kdWxlID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgd2FzbSA9IG1vZHVsZTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGZhaWxlZCB0byBpbml0aWFsaXplXG4gICAgICAgICh3aGF0KSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgcmVqZWN0KHdoYXQpO1xuICAgICAgICB9KTtcbiAgfSkpO1xuXG4gIGF3YWl0IFByb21pc2UucmFjZSh0YXNrcyk7XG5cbiAgaWYgKGlzVGltZW91dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgV2ViQXNzZW1ibHkgYmFja2VuZCBpbml0aWFsaXppbmcgZmFpbGVkIGR1ZSB0byB0aW1lb3V0OiAke3RpbWVvdXR9bXNgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEluc3RhbmNlID0gKCk6IE9ydFdhc21Nb2R1bGUgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgd2FzbSkge1xuICAgIHJldHVybiB3YXNtO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdXZWJBc3NlbWJseSBpcyBub3QgaW5pdGlhbGl6ZWQgeWV0LicpO1xufTtcblxuZXhwb3J0IGNvbnN0IGRpc3Bvc2UgPSAoKTogdm9pZCA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiAhaW5pdGlhbGl6aW5nICYmICFhYm9ydGVkKSB7XG4gICAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAgICh3YXNtIGFzIE9ydFdhc21UaHJlYWRlZE1vZHVsZSkuUFRocmVhZD8udGVybWluYXRlQWxsVGhyZWFkcygpO1xuICAgIHdhc20gPSB1bmRlZmluZWQ7XG5cbiAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICBpbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIGFib3J0ZWQgPSB0cnVlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5cbmV4cG9ydCBjb25zdCBhbGxvY1dhc21TdHJpbmcgPSAoZGF0YTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogbnVtYmVyID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3QgZGF0YUxlbmd0aCA9IHdhc20ubGVuZ3RoQnl0ZXNVVEY4KGRhdGEpICsgMTtcbiAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhkYXRhTGVuZ3RoKTtcbiAgd2FzbS5zdHJpbmdUb1VURjgoZGF0YSwgZGF0YU9mZnNldCwgZGF0YUxlbmd0aCk7XG4gIGFsbG9jcy5wdXNoKGRhdGFPZmZzZXQpO1xuXG4gIHJldHVybiBkYXRhT2Zmc2V0O1xufTtcblxuaW50ZXJmYWNlIEV4dHJhT3B0aW9uc0hhbmRsZXIge1xuICAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IGl0ZXJhdGVFeHRyYU9wdGlvbnMgPVxuICAgIChvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcHJlZml4OiBzdHJpbmcsIHNlZW46IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICAgICBoYW5kbGVyOiBFeHRyYU9wdGlvbnNIYW5kbGVyKTogdm9pZCA9PiB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoc2Vlbi5oYXMob3B0aW9ucykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NpcmN1bGFyIHJlZmVyZW5jZSBpbiBvcHRpb25zJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2Vlbi5hZGQob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSAocHJlZml4KSA/IHByZWZpeCArIGtleSA6IGtleTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBuYW1lICsgJy4nLCBzZWVuLCBoYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgaGFuZGxlcihuYW1lLCAodmFsdWUpID8gJzEnIDogJzAnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGhhbmRsZSBleHRyYSBjb25maWcgdHlwZTogJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbi8qKlxuICogY2hlY2sgd2ViIGFzc2VtYmx5IEFQSSdzIGxhc3QgZXJyb3IgYW5kIHRocm93IGVycm9yIGlmIGFueSBlcnJvciBvY2N1cnJlZC5cbiAqIEBwYXJhbSBtZXNzYWdlIGEgbWVzc2FnZSB1c2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJyZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBjaGVja0xhc3RFcnJvciA9IChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IHBhcmFtc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg4KTtcbiAgICB3YXNtLl9PcnRHZXRMYXN0RXJyb3IocGFyYW1zT2Zmc2V0LCBwYXJhbXNPZmZzZXQgKyA0KTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLkhFQVAzMltwYXJhbXNPZmZzZXQgLyA0XTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2VQb2ludGVyID0gd2FzbS5IRUFQVTMyW3BhcmFtc09mZnNldCAvIDQgKyAxXTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2VQb2ludGVyID8gd2FzbS5VVEY4VG9TdHJpbmcoZXJyb3JNZXNzYWdlUG9pbnRlcikgOiAnJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gRVJST1JfQ09ERTogJHtlcnJvckNvZGV9LCBFUlJPUl9NRVNTQUdFOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5leHBvcnQgY29uc3Qgc2V0UnVuT3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBbbnVtYmVyLCBudW1iZXJbXV0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgcnVuT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0cnkge1xuICAgIGlmIChvcHRpb25zPy5sb2dTZXZlcml0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA9IDI7ICAvLyBEZWZhdWx0IHRvIHdhcm5pbmdcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwpIHx8XG4gICAgICAgIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmxvZ1ZlcmJvc2l0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPSAwOyAgLy8gRGVmYXVsdCB0byAwXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHZlcmJvc2l0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8udGVybWluYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMudGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHRhZ0RhdGFPZmZzZXQgPSAwO1xuICAgIGlmIChvcHRpb25zPy50YWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFnRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhvcHRpb25zLnRhZywgYWxsb2NzKTtcbiAgICB9XG5cbiAgICBydW5PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlUnVuT3B0aW9ucyhcbiAgICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsISwgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCEsICEhcnVuT3B0aW9ucy50ZXJtaW5hdGUhLCB0YWdEYXRhT2Zmc2V0KTtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIHJ1biBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKG9wdGlvbnMuZXh0cmEsICcnLCBuZXcgV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oKSwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhrZXksIGFsbG9jcyk7XG4gICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh2YWx1ZSwgYWxsb2NzKTtcblxuICAgICAgICBpZiAod2FzbS5fT3J0QWRkUnVuQ29uZmlnRW50cnkocnVuT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBydW4gY29uZmlnIGVudHJ5OiAke2tleX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtydW5PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VSdW5PcHRpb25zKHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmNvbnN0IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbCA9IChncmFwaE9wdGltaXphdGlvbkxldmVsOiBzdHJpbmd8dW5rbm93bik6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCkge1xuICAgIGNhc2UgJ2Rpc2FibGVkJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2Jhc2ljJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2V4dGVuZGVkJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2FsbCc6XG4gICAgICByZXR1cm4gOTk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZ3JhcGggb3B0aW1pemF0aW9uIGxldmVsOiAke2dyYXBoT3B0aW1pemF0aW9uTGV2ZWx9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGdldEV4ZWN1dGlvbk1vZGUgPSAoZXhlY3V0aW9uTW9kZTogJ3NlcXVlbnRpYWwnfCdwYXJhbGxlbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGV4ZWN1dGlvbk1vZGUpIHtcbiAgICBjYXNlICdzZXF1ZW50aWFsJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ3BhcmFsbGVsJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGV4ZWN1dGlvbiBtb2RlOiAke2V4ZWN1dGlvbk1vZGV9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGFwcGVuZERlZmF1bHRPcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiB2b2lkID0+IHtcbiAgaWYgKCFvcHRpb25zLmV4dHJhKSB7XG4gICAgb3B0aW9ucy5leHRyYSA9IHt9O1xuICB9XG4gIGlmICghb3B0aW9ucy5leHRyYS5zZXNzaW9uKSB7XG4gICAgb3B0aW9ucy5leHRyYS5zZXNzaW9uID0ge307XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbiA9IG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBpZiAoIXNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkgPSAnMSc7XG4gIH1cblxuICAvLyBpZiB1c2luZyBKU0VQIHdpdGggV2ViR1BVLCBhbHdheXMgZGlzYWJsZSBtZW1vcnkgcGF0dGVyblxuICBpZiAob3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgJiZcbiAgICAgIG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLnNvbWUoZXAgPT4gKHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWUpID09PSAnd2ViZ3B1JykpIHtcbiAgICBvcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4gPSBmYWxzZTtcbiAgfVxufTtcblxuY29uc3Qgc2V0RXhlY3V0aW9uUHJvdmlkZXJzID1cbiAgICAoc2Vzc2lvbk9wdGlvbnNIYW5kbGU6IG51bWJlciwgZXhlY3V0aW9uUHJvdmlkZXJzOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLkV4ZWN1dGlvblByb3ZpZGVyQ29uZmlnW10sXG4gICAgIGFsbG9jczogbnVtYmVyW10pOiB2b2lkID0+IHtcbiAgICAgIGZvciAoY29uc3QgZXAgb2YgZXhlY3V0aW9uUHJvdmlkZXJzKSB7XG4gICAgICAgIGxldCBlcE5hbWUgPSB0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lO1xuXG4gICAgICAgIC8vIGNoZWNrIEVQIG5hbWVcbiAgICAgICAgc3dpdGNoIChlcE5hbWUpIHtcbiAgICAgICAgICBjYXNlICd4bm5wYWNrJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdYTk5QQUNLJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYm5uJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCB3ZWJubk9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LmRldmljZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdkZXZpY2VUeXBlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLmRldmljZVR5cGUsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZGV2aWNlVHlwZScgLSAke3dlYm5uT3B0aW9ucy5kZXZpY2VUeXBlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ubnVtVGhyZWFkcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1UaHJlYWRzID0gd2Vibm5PcHRpb25zLm51bVRocmVhZHM7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCBpZ25vcmUgaW52YWxpZCB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcy5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bVRocmVhZHMgIT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIobnVtVGhyZWFkcykgfHwgbnVtVGhyZWFkcyA8IDApIHtcbiAgICAgICAgICAgICAgICAgIG51bVRocmVhZHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdudW1UaHJlYWRzJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobnVtVGhyZWFkcy50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ251bVRocmVhZHMnIC0gJHt3ZWJubk9wdGlvbnMubnVtVGhyZWFkc30uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LnBvd2VyUHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ3Bvd2VyUHJlZmVyZW5jZScsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYm5uT3B0aW9ucy5wb3dlclByZWZlcmVuY2UsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncG93ZXJQcmVmZXJlbmNlJyAtICR7d2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZX0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3ZWJncHUnOlxuICAgICAgICAgICAgZXBOYW1lID0gJ0pTJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYmdwdU9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucz8ucHJlZmVycmVkTGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0ICE9PSAnTkNIVycgJiYgd2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOSFdDJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcmVmZXJyZWRMYXlvdXQgbXVzdCBiZSBlaXRoZXIgJ05DSFcnIG9yICdOSFdDJzogJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncHJlZmVycmVkTGF5b3V0JywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncHJlZmVycmVkTGF5b3V0JyAtICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2FzbSc6XG4gICAgICAgICAgY2FzZSAnY3B1JzpcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vdCBzdXBwb3J0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVwTmFtZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoZXBOYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXIoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGVwTmFtZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFwcGVuZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbmV4cG9ydCBjb25zdCBzZXRTZXNzaW9uT3B0aW9ucyA9IChvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBhcHBlbmREZWZhdWx0T3B0aW9ucyhzZXNzaW9uT3B0aW9ucyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBncmFwaE9wdGltaXphdGlvbkxldmVsID0gZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsKHNlc3Npb25PcHRpb25zLmdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPz8gJ2FsbCcpO1xuICAgIGNvbnN0IGV4ZWN1dGlvbk1vZGUgPSBnZXRFeGVjdXRpb25Nb2RlKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvbk1vZGUgPz8gJ3NlcXVlbnRpYWwnKTtcbiAgICBjb25zdCBsb2dJZERhdGFPZmZzZXQgPVxuICAgICAgICB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMubG9nSWQgPT09ICdzdHJpbmcnID8gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLmxvZ0lkLCBhbGxvY3MpIDogMDtcblxuICAgIGNvbnN0IGxvZ1NldmVyaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID8/IDI7ICAvLyBEZWZhdWx0IHRvIDIgLSB3YXJuaW5nXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1NldmVyaXR5TGV2ZWwpIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nVmVyYm9zaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA/PyAwOyAgLy8gRGVmYXVsdCB0byAwIC0gdmVyYm9zZVxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dWZXJib3NpdHlMZXZlbCkgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPCAwIHx8IGxvZ1ZlcmJvc2l0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0ID0gdHlwZW9mIHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGggPT09ICdzdHJpbmcnID9cbiAgICAgICAgYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGgsIGFsbG9jcykgOlxuICAgICAgICAwO1xuXG4gICAgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucyhcbiAgICAgICAgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVDcHVNZW1BcmVuYSwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuLCBleGVjdXRpb25Nb2RlLFxuICAgICAgICAhIXNlc3Npb25PcHRpb25zLmVuYWJsZVByb2ZpbGluZywgMCwgbG9nSWREYXRhT2Zmc2V0LCBsb2dTZXZlcml0eUxldmVsLCBsb2dWZXJib3NpdHlMZXZlbCxcbiAgICAgICAgb3B0aW1pemVkTW9kZWxGaWxlUGF0aE9mZnNldCk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgc2Vzc2lvbiBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgIHNldEV4ZWN1dGlvblByb3ZpZGVycyhzZXNzaW9uT3B0aW9uc0hhbmRsZSwgc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc2Vzc2lvbk9wdGlvbnMuZnJlZURpbWVuc2lvbk92ZXJyaWRlcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nOiAke25hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsdWUpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgdmFsdWUgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWVPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobmFtZSwgYWxsb2NzKTtcbiAgICAgICAgaWYgKHdhc20uX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZShzZXNzaW9uT3B0aW9uc0hhbmRsZSwgbmFtZU9mZnNldCwgdmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIGZyZWUgZGltZW5zaW9uIG92ZXJyaWRlOiAke25hbWV9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhzZXNzaW9uT3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbi8vIFRoaXMgZmlsZSBpbmNsdWRlcyBjb21tb24gZGVmaW5pdGlvbnMuIFRoZXkgZG8gTk9UIGhhdmUgZGVwZW5kZW5jeSBvbiB0aGUgV2ViQXNzZW1ibHkgaW5zdGFuY2UuXG5cbi8qKlxuICogQ29waWVkIGZyb20gT05OWCBkZWZpbml0aW9uLiBVc2UgdGhpcyB0byBkcm9wIGRlcGVuZGVuY3kgJ29ubnhfcHJvdG8nIHRvIGRlY3JlYXNlIGNvbXBpbGVkIC5qcyBmaWxlIHNpemUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIERhdGFUeXBlIHtcbiAgdW5kZWZpbmVkID0gMCxcbiAgZmxvYXQgPSAxLFxuICB1aW50OCA9IDIsXG4gIGludDggPSAzLFxuICB1aW50MTYgPSA0LFxuICBpbnQxNiA9IDUsXG4gIGludDMyID0gNixcbiAgaW50NjQgPSA3LFxuICBzdHJpbmcgPSA4LFxuICBib29sID0gOSxcbiAgZmxvYXQxNiA9IDEwLFxuICBkb3VibGUgPSAxMSxcbiAgdWludDMyID0gMTIsXG4gIHVpbnQ2NCA9IDEzLFxuICBjb21wbGV4NjQgPSAxNCxcbiAgY29tcGxleDEyOCA9IDE1LFxuICBiZmxvYXQxNiA9IDE2XG59XG5cbi8qKlxuICogTWFwIHN0cmluZyB0ZW5zb3IgZGF0YSB0byBlbnVtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSA9ICh0eXBlOiBzdHJpbmcpOiBEYXRhVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDg7XG4gICAgY2FzZSAndWludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ4O1xuICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmJvb2w7XG4gICAgY2FzZSAnaW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDE2O1xuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDE2O1xuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQzMjtcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQzMjtcbiAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDE2O1xuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0O1xuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmRvdWJsZTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnN0cmluZztcbiAgICBjYXNlICdpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50NjQ7XG4gICAgY2FzZSAndWludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NjQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgZW51bSB2YWx1ZSB0byBzdHJpbmcgdGVuc29yIGRhdGFcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nID0gKHR5cGVQcm90bzogRGF0YVR5cGUpOiBUZW5zb3IuVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZVByb3RvKSB7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ4OlxuICAgICAgcmV0dXJuICdpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ4OlxuICAgICAgcmV0dXJuICd1aW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS5ib29sOlxuICAgICAgcmV0dXJuICdib29sJztcbiAgICBjYXNlIERhdGFUeXBlLmludDE2OlxuICAgICAgcmV0dXJuICdpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MTY6XG4gICAgICByZXR1cm4gJ3VpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQzMjpcbiAgICAgIHJldHVybiAnaW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDMyOlxuICAgICAgcmV0dXJuICd1aW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQxNjpcbiAgICAgIHJldHVybiAnZmxvYXQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDpcbiAgICAgIHJldHVybiAnZmxvYXQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5kb3VibGU6XG4gICAgICByZXR1cm4gJ2Zsb2F0NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUuc3RyaW5nOlxuICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50NjQ6XG4gICAgICByZXR1cm4gJ2ludDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ2NDpcbiAgICAgIHJldHVybiAndWludDY0JztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlUHJvdG99YCk7XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IHRlbnNvciBlbGVtZW50IHNpemUgaW4gYnl0ZXMgYnkgdGhlIGdpdmVuIGRhdGEgdHlwZVxuICogQHJldHVybnMgc2l6ZSBpbiBpbnRlZ2VyIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGF0YSB0eXBlIGlzIG5vdCBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFRlbnNvckVsZW1lbnRTaXplID0gKGRhdGVUeXBlOiBudW1iZXIpOiBudW1iZXJ8XG4gICAgdW5kZWZpbmVkID0+IFt1bmRlZmluZWQsIDQsIDEsIDEsIDIsIDIsIDQsIDgsIHVuZGVmaW5lZCwgMSwgMiwgOCwgNCwgOCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1bZGF0ZVR5cGVdO1xuXG4vKipcbiAqIGdldCB0eXBlZCBhcnJheSBjb25zdHJ1Y3RvciBieSB0aGUgZ2l2ZW4gdGVuc29yIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3RvciA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yfFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxcbiAgICBJbnQ4QXJyYXlDb25zdHJ1Y3RvcnxVaW50MTZBcnJheUNvbnN0cnVjdG9yfEludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnSW50NjRBcnJheUNvbnN0cnVjdG9yfFxuICAgIFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxGbG9hdDY0QXJyYXlDb25zdHJ1Y3RvcnxVaW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ1VpbnQ2NEFycmF5Q29uc3RydWN0b3IgPT4ge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY2FzZSAndWludDgnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdpbnQ4JzpcbiAgICAgICAgICByZXR1cm4gSW50OEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnaW50MTYnOlxuICAgICAgICAgIHJldHVybiBJbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIEludDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MzInOlxuICAgICAgICAgIHJldHVybiBVaW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnaW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdJbnQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdVaW50NjRBcnJheTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgIH1cbiAgICB9O1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgbG9nIGxldmVsIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ0xldmVsU3RyaW5nVG9FbnVtID0gKGxvZ0xldmVsPzogJ3ZlcmJvc2UnfCdpbmZvJ3wnd2FybmluZyd8J2Vycm9yJ3wnZmF0YWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2dMZXZlbCkge1xuICAgIGNhc2UgJ3ZlcmJvc2UnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2ZhdGFsJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGxvZ2dpbmcgbGV2ZWw6ICR7bG9nTGV2ZWx9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGVuc29yIHR5cGUgaXMgc3VwcG9ydGVkIGJ5IEdQVSBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IHR5cGUgaXMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9PiB0eXBlID09PSAnZmxvYXQzMicgfHxcbiAgICB0eXBlID09PSAnaW50MzInIHx8IHR5cGUgPT09ICdpbnQ2NCcgfHwgdHlwZSA9PT0gJ2Jvb2wnIHx8IHR5cGUgPT09ICdmbG9hdDE2JyB8fCB0eXBlID09PSAndWludDMyJztcblxuLyoqXG4gKiBNYXAgc3RyaW5nIGRhdGEgbG9jYXRpb24gdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtID0gKGxvY2F0aW9uOiBUZW5zb3IuRGF0YUxvY2F0aW9uKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2NhdGlvbikge1xuICAgIGNhc2UgJ25vbmUnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAndGV4dHVyZSc6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgbG9jYXRpb246ICR7bG9jYXRpb259YCk7XG4gIH1cbn07XG5cbi8qKlxuICogTWFwIGludGVnZXIgZGF0YSBsb2NhdGlvbiB0byBzdHJpbmcgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGRhdGFMb2NhdGlvbkVudW1Ub1N0cmluZyA9IChsb2NhdGlvbjogbnVtYmVyKTogVGVuc29yLkRhdGFMb2NhdGlvbnx1bmRlZmluZWQgPT5cbiAgICAoWydub25lJywgJ2NwdScsICdjcHUtcGlubmVkJywgJ3RleHR1cmUnLCAnZ3B1LWJ1ZmZlciddIGFzIGNvbnN0KVtsb2NhdGlvbl07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7RW52LCBJbmZlcmVuY2VTZXNzaW9uLCBUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7U2VyaWFsaXphYmxlTW9kZWxkYXRhLCBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEsIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhLCBUZW5zb3JNZXRhZGF0YX0gZnJvbSAnLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge3NldFJ1bk9wdGlvbnN9IGZyb20gJy4vcnVuLW9wdGlvbnMnO1xuaW1wb3J0IHtzZXRTZXNzaW9uT3B0aW9uc30gZnJvbSAnLi9zZXNzaW9uLW9wdGlvbnMnO1xuaW1wb3J0IHtkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0sIGdldFRlbnNvckVsZW1lbnRTaXplLCBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUsIGxvZ0xldmVsU3RyaW5nVG9FbnVtLCB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZywgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0sIHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcn0gZnJvbSAnLi93YXNtLWNvbW1vbic7XG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3J9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmxldCBvcnRFbnZJbml0aWFsaXplZCA9IGZhbHNlO1xuXG4vKipcbiAqIGdldCB0aGUgaW5wdXQvb3V0cHV0IGNvdW50IG9mIHRoZSBzZXNzaW9uLlxuICogQHBhcmFtIHNlc3Npb25IYW5kbGUgdGhlIGhhbmRsZSByZXByZXNlbnRpbmcgdGhlIHNlc3Npb24uIHNob3VsZCBiZSBub24temVyby5cbiAqIEByZXR1cm5zIGEgdHVwbGUgaW5jbHVkaW5nIDIgbnVtYmVycywgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCBjb3VudCBhbmQgb3V0cHV0IGNvdW50LlxuICovXG5jb25zdCBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudCA9IChzZXNzaW9uSGFuZGxlOiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSwgZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIDQpO1xuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBzZXNzaW9uIGlucHV0L291dHB1dCBjb3VudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIFt3YXNtLkhFQVAzMltkYXRhT2Zmc2V0IC8gNF0sIHdhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0ICsgMV1dO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbml0aWFsaXplIE9SVCBlbnZpcm9ubWVudC5cbiAqIEBwYXJhbSBudW1UaHJlYWRzIFNldEdsb2JhbEludHJhT3BOdW1UaHJlYWRzKG51bVRocmVhZHMpXG4gKiBAcGFyYW0gbG9nZ2luZ0xldmVsIENyZWF0ZUVudihzdGF0aWNfY2FzdDxPcnRMb2dnaW5nTGV2ZWw+KGxvZ2dpbmdfbGV2ZWwpKVxuICovXG5jb25zdCBpbml0T3J0ID0gKG51bVRocmVhZHM6IG51bWJlciwgbG9nZ2luZ0xldmVsOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3QgZXJyb3JDb2RlID0gZ2V0SW5zdGFuY2UoKS5fT3J0SW5pdChudW1UaHJlYWRzLCBsb2dnaW5nTGV2ZWwpO1xuICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgaW5pdGlhbGl6ZSBvbm54cnVudGltZS4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbnRpYWxpemUgcnVudGltZSBlbnZpcm9ubWVudC5cbiAqIEBwYXJhbSBlbnYgcGFzc2VkIGluIHRoZSBlbnZpcm9ubWVudCBjb25maWcgb2JqZWN0LlxuICovXG5leHBvcnQgY29uc3QgaW5pdFJ1bnRpbWUgPSBhc3luYyhlbnY6IEVudik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAvLyBpbml0IE9SVFxuICBpbml0T3J0KGVudi53YXNtLm51bVRocmVhZHMhLCBsb2dMZXZlbFN0cmluZ1RvRW51bShlbnYubG9nTGV2ZWwpKTtcblxuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAvLyBpbml0IEpTRVAgaWYgYXZhaWxhYmxlXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgIGNvbnN0IGluaXRKc2VwID0gcmVxdWlyZSgnLi9qc2VwL2luaXQnKS5pbml0O1xuICAgIGF3YWl0IGluaXRKc2VwKGdldEluc3RhbmNlKCksIGVudik7XG4gIH1cblxuICBvcnRFbnZJbml0aWFsaXplZCA9IHRydWU7XG59O1xuXG4vKipcbiAqIHZhbGlkIGRhdGEgbG9jYXRpb25zIGZvciBpbnB1dC9vdXRwdXQgdGVuc29ycy5cbiAqL1xudHlwZSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dCA9ICdjcHUnfCdjcHUtcGlubmVkJ3wnZ3B1LWJ1ZmZlcic7XG5cbnR5cGUgSU9CaW5kaW5nU3RhdGUgPSB7XG4gIC8qKlxuICAgKiB0aGUgaGFuZGxlIG9mIElPIGJpbmRpbmcuXG4gICAqL1xuICByZWFkb25seSBoYW5kbGU6IG51bWJlcjtcblxuICAvKipcbiAgICogdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKlxuICAgKiB2YWx1ZSBpcyBvbmUgb2YgJ2NwdScsICdjcHUtcGlubmVkJywgJ2dwdS1idWZmZXInLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiByZWFkb25seSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdO1xuXG4gIC8qKlxuICAgKiBlbnVtIHZhbHVlIG9mIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuLyoqXG4gKiAgdHVwbGUgZWxlbWVudHMgYXJlOiBJbmZlcmVuY2VTZXNzaW9uIElEOyBpbnB1dE5hbWVzVVRGOEVuY29kZWQ7IG91dHB1dE5hbWVzVVRGOEVuY29kZWQ7IGJpbmRpbmdTdGF0ZVxuICovXG50eXBlIFNlc3Npb25NZXRhZGF0YSA9IFtcbiAgaW5mZXJlbmNlU2Vzc2lvbklkOiBudW1iZXIsIGlucHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sIG91dHB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLFxuICBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGxcbl07XG5cbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcDxudW1iZXIsIFNlc3Npb25NZXRhZGF0YT4oKTtcblxuZXhwb3J0IGNvbnN0IGlzT3J0RW52SW5pdGlhbGl6ZWQgPSAoKTogYm9vbGVhbiA9PiBvcnRFbnZJbml0aWFsaXplZDtcblxuLyoqXG4gKiBhbGxvY2F0ZSB0aGUgbWVtb3J5IGFuZCBtZW1jcHkgdGhlIG1vZGVsIGJ5dGVzLCBwcmVwYXJpbmcgZm9yIGNyZWF0aW5nIGFuIGluc3RhbmNlIG9mIEluZmVyZW5jZVNlc3Npb24uXG4gKiBAcmV0dXJucyBhIDItZWxlbWVudHMgdHVwbGUgLSB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgYWxsb2NhdGVkIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbkFsbG9jYXRlID0gKG1vZGVsOiBVaW50OEFycmF5KTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBtb2RlbERhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MobW9kZWwuYnl0ZUxlbmd0aCk7XG4gIGlmIChtb2RlbERhdGFPZmZzZXQgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNyZWF0ZSBhIHNlc3Npb24uIGZhaWxlZCB0byBhbGxvY2F0ZSBhIGJ1ZmZlciBvZiBzaXplICR7bW9kZWwuYnl0ZUxlbmd0aH0uYCk7XG4gIH1cbiAgd2FzbS5IRUFQVTguc2V0KG1vZGVsLCBtb2RlbERhdGFPZmZzZXQpO1xuICByZXR1cm4gW21vZGVsRGF0YU9mZnNldCwgbW9kZWwuYnl0ZUxlbmd0aF07XG59O1xuXG4vKipcbiAqIGNyZWF0ZSBhbiBpbmZlcmVuY2Ugc2Vzc2lvbiB1c2luZyB0aGUgcHJlcGFyZWQgYnVmZmVyIGNvbnRhaW5pbmcgdGhlIG1vZGVsIGRhdGEuXG4gKiBAcGFyYW0gbW9kZWxEYXRhIGEgMi1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIHNlc3Npb24gb3B0aW9ucyBvYmplY3QuXG4gKiBAcmV0dXJucyBhIDMtZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyBbc2Vzc2lvbiBoYW5kbGUsIGlucHV0IG5hbWVzLCBvdXRwdXQgbmFtZXNdXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uRmluYWxpemUgPVxuICAgIChtb2RlbERhdGE6IFNlcmlhbGl6YWJsZU1vZGVsZGF0YSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEgPT4ge1xuICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgICAgIGxldCBzZXNzaW9uSGFuZGxlID0gMDtcbiAgICAgIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gICAgICBsZXQgaW9CaW5kaW5nSGFuZGxlID0gMDtcbiAgICAgIGxldCBhbGxvY3M6IG51bWJlcltdID0gW107XG4gICAgICBjb25zdCBpbnB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcbiAgICAgIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdID0gc2V0U2Vzc2lvbk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgICAgc2Vzc2lvbkhhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb24obW9kZWxEYXRhWzBdLCBtb2RlbERhdGFbMV0sIHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICAgICAgaWYgKHNlc3Npb25IYW5kbGUgPT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgYSBzZXNzaW9uLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgW2lucHV0Q291bnQsIG91dHB1dENvdW50XSA9IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50KHNlc3Npb25IYW5kbGUpO1xuXG4gICAgICAgIGNvbnN0IGlucHV0TmFtZXMgPSBbXTtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZXMgPSBbXTtcbiAgICAgICAgY29uc3Qgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldElucHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIGlucHV0IG5hbWUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgICAgIGlucHV0TmFtZXMucHVzaCh3YXNtLlVURjhUb1N0cmluZyhuYW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldE91dHB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICAgICAgaWYgKG5hbWUgPT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBvdXRwdXQgbmFtZS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgICAgIGNvbnN0IG5hbWVTdHJpbmcgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lKTtcbiAgICAgICAgICBvdXRwdXROYW1lcy5wdXNoKG5hbWVTdHJpbmcpO1xuXG4gICAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHR5cGVvZiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgICAgIG9wdGlvbnMucHJlZmVycmVkT3V0cHV0TG9jYXRpb24gOlxuICAgICAgICAgICAgICAgIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uPy5bbmFtZVN0cmluZ10gPz8gJ2NwdSc7XG4gICAgICAgICAgICBpZiAobG9jYXRpb24gIT09ICdjcHUnICYmIGxvY2F0aW9uICE9PSAnY3B1LXBpbm5lZCcgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBzdXBwb3J0ZWQgcHJlZmVycmVkIG91dHB1dCBsb2NhdGlvbjogJHtsb2NhdGlvbn0uYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaChsb2NhdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXNlIElPIGJpbmRpbmcgb25seSB3aGVuIGF0IGxlYXN0IG9uZSBvdXRwdXQgaXMgcHJlZmZlcmVkIHRvIGJlIG9uIEdQVS5cbiAgICAgICAgbGV0IGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbCA9IG51bGw7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZShsID0+IGwgPT09ICdncHUtYnVmZmVyJykpIHtcbiAgICAgICAgICBpb0JpbmRpbmdIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVCaW5kaW5nKHNlc3Npb25IYW5kbGUpO1xuICAgICAgICAgIGlmIChpb0JpbmRpbmdIYW5kbGUgPT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBJTyBiaW5kaW5nLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJpbmRpbmdTdGF0ZSA9IHtcbiAgICAgICAgICAgIGhhbmRsZTogaW9CaW5kaW5nSGFuZGxlLFxuICAgICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLFxuICAgICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLm1hcChsID0+IGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bShsKSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uSGFuZGxlLCBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBiaW5kaW5nU3RhdGVdKTtcbiAgICAgICAgcmV0dXJuIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzLCBvdXRwdXROYW1lc107XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG5cbiAgICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSAhPT0gMCkge1xuICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ0hhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2Vzc2lvbkhhbmRsZSAhPT0gMCkge1xuICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLl9mcmVlKG1vZGVsRGF0YVswXSk7XG4gICAgICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgICAgfVxuICAgIH07XG5cblxuLyoqXG4gKiBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgSW5mZXJlbmNlU2Vzc2lvbi5cbiAqIEByZXR1cm5zIHRoZSBtZXRhZGF0YSBvZiBJbmZlcmVuY2VTZXNzaW9uLiAwLXZhbHVlIGhhbmRsZSBmb3IgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb24gPVxuICAgIChtb2RlbDogVWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEgPT4ge1xuICAgICAgY29uc3QgbW9kZWxEYXRhOiBTZXJpYWxpemFibGVNb2RlbGRhdGEgPSBjcmVhdGVTZXNzaW9uQWxsb2NhdGUobW9kZWwpO1xuICAgICAgcmV0dXJuIGNyZWF0ZVNlc3Npb25GaW5hbGl6ZShtb2RlbERhdGEsIG9wdGlvbnMpO1xuICAgIH07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWxlYXNlIHNlc3Npb24uIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICB9XG5cbiAgd2FzbS5qc2VwVW5yZWdpc3RlckJ1ZmZlcnM/LihzZXNzaW9uSWQpO1xuXG4gIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xuICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IgPVxuICAgICh0ZW5zb3I6IFRlbnNvck1ldGFkYXRhfG51bGwsIHRlbnNvckhhbmRsZXM6IG51bWJlcltdLCBhbGxvY3M6IG51bWJlcltdLCBzZXNzaW9uSWQ6IG51bWJlciwgaW5kZXg6IG51bWJlcik6XG4gICAgICAgIHZvaWQgPT4ge1xuICAgICAgICAgIGlmICghdGVuc29yKSB7XG4gICAgICAgICAgICB0ZW5zb3JIYW5kbGVzLnB1c2goMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcbiAgICAgICAgICBjb25zdCBkaW1zID0gdGVuc29yWzFdO1xuICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGVuc29yWzNdO1xuXG4gICAgICAgICAgbGV0IHJhd0RhdGE6IG51bWJlcjtcbiAgICAgICAgICBsZXQgZGF0YUJ5dGVMZW5ndGg6IG51bWJlcjtcblxuICAgICAgICAgIGlmIChkYXRhVHlwZSA9PT0gJ3N0cmluZycgJiYgbG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgb24gR1BVLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICBjb25zdCBncHVCdWZmZXIgPSB0ZW5zb3JbMl0uZ3B1QnVmZmVyIGFzIEdQVUJ1ZmZlcjtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTaXplSW5CeXRlcyA9IGdldFRlbnNvckVsZW1lbnRTaXplKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSkhO1xuICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSBkaW1zLnJlZHVjZSgoYSwgYikgPT4gYSAqIGIsIDEpICogZWxlbWVudFNpemVJbkJ5dGVzO1xuICAgICAgICAgICAgcmF3RGF0YSA9IHdhc20uanNlcFJlZ2lzdGVyQnVmZmVyKHNlc3Npb25JZCwgaW5kZXgsIGdwdUJ1ZmZlciwgZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gdGVuc29yWzJdO1xuXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAvLyBzdHJpbmcgdGVuc29yXG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gNCAqIGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIGxldCBkYXRhSW5kZXggPSByYXdEYXRhIC8gNDtcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdGVuc29yIGRhdGEgYXQgaW5kZXggJHtpfSBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2FzbS5IRUFQVTMyW2RhdGFJbmRleCsrXSA9IGFsbG9jV2FzbVN0cmluZyhkYXRhW2ldLCBhbGxvY3MpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRhdGEuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgICAgICB3YXNtLkhFQVBVOC5zZXQobmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YUJ5dGVMZW5ndGgpLCByYXdEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gICAgICAgICAgY29uc3QgZGltc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogZGltcy5sZW5ndGgpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgZGltSW5kZXggPSBkaW1zT2Zmc2V0IC8gNDtcbiAgICAgICAgICAgIGRpbXMuZm9yRWFjaChkID0+IHdhc20uSEVBUDMyW2RpbUluZGV4KytdID0gZCk7XG4gICAgICAgICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXG4gICAgICAgICAgICAgICAgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpLCByYXdEYXRhLCBkYXRhQnl0ZUxlbmd0aCwgZGltc09mZnNldCwgZGltcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGxvY2F0aW9uKSk7XG4gICAgICAgICAgICBpZiAodGVuc29yID09PSAwKSB7XG4gICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBjcmVhdGUgdGVuc29yIGZvciBpbnB1dC9vdXRwdXQuIHNlc3Npb249JHtzZXNzaW9uSWR9LCBpbmRleD0ke2luZGV4fS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCh0ZW5zb3IpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4vKipcbiAqIHBlcmZvcm0gaW5mZXJlbmNlIHJ1blxuICovXG5leHBvcnQgY29uc3QgcnVuID0gYXN5bmMoXG4gICAgc2Vzc2lvbklkOiBudW1iZXIsIGlucHV0SW5kaWNlczogbnVtYmVyW10sIGlucHV0VGVuc29yczogVGVuc29yTWV0YWRhdGFbXSwgb3V0cHV0SW5kaWNlczogbnVtYmVyW10sXG4gICAgb3V0cHV0VGVuc29yczogQXJyYXk8VGVuc29yTWV0YWRhdGF8bnVsbD4sIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8VGVuc29yTWV0YWRhdGFbXT4gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCBydW4gaW5mZXJlbmNlLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlXSA9IHNlc3Npb247XG5cbiAgY29uc3QgaW5wdXRDb3VudCA9IGlucHV0SW5kaWNlcy5sZW5ndGg7XG4gIGNvbnN0IG91dHB1dENvdW50ID0gb3V0cHV0SW5kaWNlcy5sZW5ndGg7XG5cbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgcnVuT3B0aW9uc0FsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBpbnB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IG91dHB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGlucHV0T3V0cHV0QWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGJlZm9yZVJ1blN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgY29uc3QgaW5wdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBpbnB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG4gIGNvbnN0IG91dHB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG5cbiAgdHJ5IHtcbiAgICBbcnVuT3B0aW9uc0hhbmRsZSwgcnVuT3B0aW9uc0FsbG9jc10gPSBzZXRSdW5PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgLy8gY3JlYXRlIGlucHV0IHRlbnNvcnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKGlucHV0VGVuc29yc1tpXSwgaW5wdXRUZW5zb3JIYW5kbGVzLCBpbnB1dE91dHB1dEFsbG9jcywgc2Vzc2lvbklkLCBpbnB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBvdXRwdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICAgIG91dHB1dFRlbnNvcnNbaV0sIG91dHB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0Q291bnQgKyBvdXRwdXRJbmRpY2VzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgaW5wdXRWYWx1ZXNJbmRleCA9IGlucHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgaW5wdXROYW1lc0luZGV4ID0gaW5wdXROYW1lc09mZnNldCAvIDQ7XG4gICAgbGV0IG91dHB1dFZhbHVlc0luZGV4ID0gb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0TmFtZXNJbmRleCA9IG91dHB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0VmFsdWVzSW5kZXgrK10gPSBpbnB1dFRlbnNvckhhbmRsZXNbaV07XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXROYW1lc0luZGV4KytdID0gaW5wdXROYW1lc1VURjhFbmNvZGVkW2lucHV0SW5kaWNlc1tpXV07XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dFZhbHVlc0luZGV4KytdID0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltvdXRwdXROYW1lc0luZGV4KytdID0gb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtvdXRwdXRJbmRpY2VzW2ldXTtcbiAgICB9XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGNvbnN0IHtoYW5kbGUsIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucywgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZH0gPSBpb0JpbmRpbmdTdGF0ZTtcblxuICAgICAgaWYgKGlucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGggIT09IGlucHV0Q291bnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnB1dCBjb3VudCBmcm9tIGZlZWRzICgke1xuICAgICAgICAgICAgaW5wdXRDb3VudH0pIGlzIGV4cGVjdGVkIHRvIGJlIGFsd2F5cyBlcXVhbCB0byBtb2RlbCdzIGlucHV0IGNvdW50ICgke2lucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGh9KS5gKTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBpbnB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaW5wdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRCaW5kSW5wdXQoaGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBpbnB1dFRlbnNvckhhbmRsZXNbaV0pO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgaW5wdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgcHJlLWFsbG9jYXRlZCBvdXRwdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBvdXRwdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IG91dHB1dFRlbnNvcnNbaV0/LlszXTsgIC8vIHVuZGVmaW5lZCBtZWFucyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuXG5cbiAgICAgICAgaWYgKGxvY2F0aW9uKSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIHByZS1hbGxvY2F0ZWQuIGJpbmQgdGhlIHRlbnNvci5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIG91dHB1dFRlbnNvckhhbmRsZXNbaV0sIDApO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIHByZS1hbGxvY2F0ZWQgb3V0cHV0WyR7aX1dIGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLiByZXNldCBwcmVmZXJyZWQgbG9jYXRpb24uXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID1cbiAgICAgICAgICAgICAgd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCAwLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkW2luZGV4XSk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgb3V0cHV0WyR7aX1dIHRvICR7b3V0cHV0UHJlZmVycmVkTG9jYXRpb25zW2ldfSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGVycm9yQ29kZTogbnVtYmVyO1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlKSB7XG4gICAgICBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRSdW5XaXRoQmluZGluZyhcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpb0JpbmRpbmdTdGF0ZS5oYW5kbGUsIG91dHB1dENvdW50LCBvdXRwdXRWYWx1ZXNPZmZzZXQsIHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRSdW4oXG4gICAgICAgICAgc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc09mZnNldCwgaW5wdXRWYWx1ZXNPZmZzZXQsIGlucHV0Q291bnQsIG91dHB1dE5hbWVzT2Zmc2V0LCBvdXRwdXRDb3VudCxcbiAgICAgICAgICBvdXRwdXRWYWx1ZXNPZmZzZXQsIHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cblxuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdmYWlsZWQgdG8gY2FsbCBPcnRSdW4oKS4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRwdXQ6IFRlbnNvck1ldGFkYXRhW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgdGVuc29yID0gd2FzbS5IRUFQVTMyW291dHB1dFZhbHVlc09mZnNldCAvIDQgKyBpXTtcbiAgICAgIGlmICh0ZW5zb3IgPT09IG91dHB1dFRlbnNvckhhbmRsZXNbaV0pIHtcbiAgICAgICAgLy8gb3V0cHV0IHRlbnNvciBpcyBwcmUtYWxsb2NhdGVkLiBubyBuZWVkIHRvIGNvcHkgZGF0YS5cbiAgICAgICAgb3V0cHV0LnB1c2gob3V0cHV0VGVuc29yc1tpXSEpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYmVmb3JlR2V0VGVuc29yRGF0YVN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgIC8vIHN0YWNrIGFsbG9jYXRlIDQgcG9pbnRlciB2YWx1ZVxuICAgICAgY29uc3QgdGVuc29yRGF0YU9mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogNCk7XG5cbiAgICAgIGxldCBrZWVwT3V0cHV0VGVuc29yID0gZmFsc2U7XG4gICAgICBsZXQgdHlwZTogVGVuc29yLlR5cGV8dW5kZWZpbmVkLCBkYXRhT2Zmc2V0ID0gMDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldFRlbnNvckRhdGEoXG4gICAgICAgICAgICB0ZW5zb3IsIHRlbnNvckRhdGFPZmZzZXQsIHRlbnNvckRhdGFPZmZzZXQgKyA0LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgOCwgdGVuc29yRGF0YU9mZnNldCArIDEyKTtcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhY2Nlc3Mgb3V0cHV0IHRlbnNvciBkYXRhIG9uIGluZGV4ICR7aX0uYCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlbnNvckRhdGFJbmRleCA9IHRlbnNvckRhdGFPZmZzZXQgLyA0O1xuICAgICAgICBjb25zdCBkYXRhVHlwZSA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGRhdGFPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltc0xlbmd0aCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1zTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBkaW1zLnB1c2god2FzbS5IRUFQVTMyW2RpbXNPZmZzZXQgLyA0ICsgaV0pO1xuICAgICAgICB9XG4gICAgICAgIHdhc20uX09ydEZyZWUoZGltc09mZnNldCk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSk7XG4gICAgICAgIHR5cGUgPSB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZyhkYXRhVHlwZSk7XG5cbiAgICAgICAgY29uc3QgcHJlZmVycmVkTG9jYXRpb24gPSBpb0JpbmRpbmdTdGF0ZT8ub3V0cHV0UHJlZmVycmVkTG9jYXRpb25zW291dHB1dEluZGljZXNbaV1dO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmIChwcmVmZXJyZWRMb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHN0cmluZ0RhdGE6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgbGV0IGRhdGFJbmRleCA9IGRhdGFPZmZzZXQgLyA0O1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdO1xuICAgICAgICAgICAgY29uc3QgbWF4Qnl0ZXNUb1JlYWQgPSBpID09PSBzaXplIC0gMSA/IHVuZGVmaW5lZCA6IHdhc20uSEVBUFUzMltkYXRhSW5kZXhdIC0gb2Zmc2V0O1xuICAgICAgICAgICAgc3RyaW5nRGF0YS5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG9mZnNldCwgbWF4Qnl0ZXNUb1JlYWQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIHN0cmluZ0RhdGEsICdjcHUnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgYSBjZXJ0YWluIG91dHB1dCdzIHByZWZlcnJlZCBsb2NhdGlvbiBpcyBHUFUgYnV0IHRoZSB0ZW5zb3IgaXMgZW1wdHksIHdlIHN0aWxsIG5lZWQgdG8gY3JlYXRlIGEgQ1BVXG4gICAgICAgICAgLy8gdGVuc29yIGZvciBpdC4gVGhlcmUgaXMgbm8gbWFwcGluZyBHUFUgYnVmZmVyIGZvciBhbiBlbXB0eSB0ZW5zb3IuXG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicgJiYgc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHdhc20uanNlcEdldEJ1ZmZlcihkYXRhT2Zmc2V0KTtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTaXplID0gZ2V0VGVuc29yRWxlbWVudFNpemUoZGF0YVR5cGUpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRTaXplID09PSB1bmRlZmluZWQgfHwgIWlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkbyBub3QgcmVsZWFzZSB0aGUgdGVuc29yIHJpZ2h0IG5vdy4gaXQgd2lsbCBiZSByZWxlYXNlZCB3aGVuIHVzZXIgY2FsbHMgdGVuc29yLmRpc3Bvc2UoKS5cbiAgICAgICAgICAgIGtlZXBPdXRwdXRUZW5zb3IgPSB0cnVlO1xuXG4gICAgICAgICAgICBvdXRwdXQucHVzaChbXG4gICAgICAgICAgICAgIHR5cGUsIGRpbXMsIHtcbiAgICAgICAgICAgICAgICBncHVCdWZmZXIsXG4gICAgICAgICAgICAgICAgZG93bmxvYWQ6IHdhc20uanNlcENyZWF0ZURvd25sb2FkZXIoZ3B1QnVmZmVyLCBzaXplICogZWxlbWVudFNpemUsIHR5cGUpLFxuICAgICAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdncHUtYnVmZmVyJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcih0eXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgdHlwZWRBcnJheUNvbnN0cnVjdG9yKHNpemUpO1xuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKVxuICAgICAgICAgICAgICAgIC5zZXQod2FzbS5IRUFQVTguc3ViYXJyYXkoZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIGRhdGEuYnl0ZUxlbmd0aCkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIGRhdGEsICdjcHUnXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2spO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgZGF0YU9mZnNldCkge1xuICAgICAgICAgIHdhc20uX2ZyZWUoZGF0YU9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZWVwT3V0cHV0VGVuc29yKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlvQmluZGluZ1N0YXRlKSB7XG4gICAgICB3YXNtLl9PcnRDbGVhckJvdW5kT3V0cHV0cyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoYmVmb3JlUnVuU3RhY2spO1xuXG4gICAgaW5wdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBvdXRwdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBpbnB1dE91dHB1dEFsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG5cbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIHJ1bk9wdGlvbnNBbGxvY3MuZm9yRWFjaChwID0+IHdhc20uX2ZyZWUocCkpO1xuICB9XG59O1xuXG4vKipcbiAqIGVuZCBwcm9maWxpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGVuZFByb2ZpbGluZyA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2Vzc2lvbiBpZCcpO1xuICB9XG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xuXG4gIC8vIHByb2ZpbGUgZmlsZSBuYW1lIGlzIG5vdCB1c2VkIHlldCwgYnV0IGl0IG11c3QgYmUgZnJlZWQuXG4gIGNvbnN0IHByb2ZpbGVGaWxlTmFtZSA9IHdhc20uX09ydEVuZFByb2ZpbGluZyhzZXNzaW9uSGFuZGxlKTtcbiAgaWYgKHByb2ZpbGVGaWxlTmFtZSA9PT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBwcm9maWxlIGZpbGUgbmFtZS4nKTtcbiAgfVxuICB3YXNtLl9PcnRGcmVlKHByb2ZpbGVGaWxlTmFtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMgPSAodGVuc29yczogcmVhZG9ubHkgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSk6IEFycmF5QnVmZmVyTGlrZVtdID0+IHtcbiAgY29uc3QgYnVmZmVyczogQXJyYXlCdWZmZXJMaWtlW10gPSBbXTtcbiAgZm9yIChjb25zdCB0ZW5zb3Igb2YgdGVuc29ycykge1xuICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpICYmICdidWZmZXInIGluIGRhdGEpIHtcbiAgICAgIGJ1ZmZlcnMucHVzaChkYXRhLmJ1ZmZlcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBidWZmZXJzO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgbGliPVwid2Vid29ya2VyXCIgLz5cblxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZX0gZnJvbSAnLi4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHtjcmVhdGVTZXNzaW9uLCBjcmVhdGVTZXNzaW9uQWxsb2NhdGUsIGNyZWF0ZVNlc3Npb25GaW5hbGl6ZSwgZW5kUHJvZmlsaW5nLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycywgaW5pdFJ1bnRpbWUsIGlzT3J0RW52SW5pdGlhbGl6ZWQsIHJlbGVhc2VTZXNzaW9uLCBydW59IGZyb20gJy4uL3dhc20tY29yZS1pbXBsJztcbmltcG9ydCB7aW5pdGlhbGl6ZVdlYkFzc2VtYmx5fSBmcm9tICcuLi93YXNtLWZhY3RvcnknO1xuXG5zZWxmLm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50PE9ydFdhc21NZXNzYWdlPik6IHZvaWQgPT4ge1xuICBzd2l0Y2ggKGV2LmRhdGEudHlwZSkge1xuICAgIGNhc2UgJ2luaXQtd2FzbSc6XG4gICAgICB0cnkge1xuICAgICAgICBpbml0aWFsaXplV2ViQXNzZW1ibHkoZXYuZGF0YS5pbilcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJ30gYXMgT3J0V2FzbU1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgIGVyciA9PiBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtd2FzbScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtd2FzbScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW5pdC1vcnQnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgaW5pdFJ1bnRpbWUoZXYuZGF0YS5pbikudGhlbigoKSA9PiBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtb3J0J30gYXMgT3J0V2FzbU1lc3NhZ2UpLCBlcnIgPT4gcG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2luaXQtb3J0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gYXMgT3J0V2FzbU1lc3NhZ2UpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtb3J0JywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGVfYWxsb2NhdGUnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge21vZGVsfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBtb2RlbGRhdGEgPSBjcmVhdGVTZXNzaW9uQWxsb2NhdGUobW9kZWwpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9hbGxvY2F0ZScsIG91dDogbW9kZWxkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfYWxsb2NhdGUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZV9maW5hbGl6ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWxkYXRhLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBzZXNzaW9uTWV0YWRhdGEgPSBjcmVhdGVTZXNzaW9uRmluYWxpemUobW9kZWxkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfZmluYWxpemUnLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlX2ZpbmFsaXplJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge21vZGVsLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBzZXNzaW9uTWV0YWRhdGEgPSBjcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGUnLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZWxlYXNlJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBldi5kYXRhLmluITtcbiAgICAgICAgcmVsZWFzZVNlc3Npb24oaGFuZGxlcik7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncmVsZWFzZSd9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ3JlbGVhc2UnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3J1bic6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7c2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9uc30gPSBldi5kYXRhLmluITtcbiAgICAgICAgcnVuKHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBvdXRwdXRzID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncnVuJywgb3V0OiBvdXRwdXRzfSBhcyBPcnRXYXNtTWVzc2FnZSwgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMob3V0cHV0cykpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncnVuJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VuZC1wcm9maWxpbmcnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBlbmRQcm9maWxpbmcoaGFuZGxlcik7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnZW5kLXByb2ZpbGluZyd9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2VuZC1wcm9maWxpbmcnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2lzLW9ydC1lbnYtaW5pdGlhbGl6ZWQnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgb3J0RW52SW5pdGlhbGl6ZWQgPSBpc09ydEVudkluaXRpYWxpemVkKCk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaXMtb3J0LWVudi1pbml0aWFsaXplZCcsIG91dDogb3J0RW52SW5pdGlhbGl6ZWR9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2lzLW9ydC1lbnYtaW5pdGlhbGl6ZWQnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gIH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBYTtBQUFiO0FBQUE7QUFBTyxNQUFNLFdBQVc7QUFBQTtBQUFBOzs7QUNBeEI7QUFBQTtBQUFBLGdCQUFBQTtBQUFBO0FBQUEsTUFBYUE7QUFBYjtBQUFBO0FBQU8sTUFBTUEsUUFBTztBQUFBO0FBQUE7OztBQ0FwQjtBQUFBO0FBQUE7QUFDQSxVQUFJLFdBQVcsTUFBTTtBQUNuQixZQUFJLGFBQWEsT0FBTyxhQUFhLGVBQWUsU0FBUyxnQkFBZ0IsU0FBUyxjQUFjLE1BQU07QUFDMUcsWUFBSSxPQUFPLGVBQWU7QUFB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ZixPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsWUFBSTtBQUFFLHFCQUFRLEtBQUs7QUFBRSxrQkFBRSxFQUFFLFFBQVEsSUFBSSxPQUFPLEdBQUUsR0FBRyxHQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUUsZ0JBQUksS0FBRywyREFBMkQsTUFBTSxHQUFHLEdBQUUsS0FBRyx3RkFBd0YsTUFBTSxHQUFHO0FBQUUsZ0JBQUUsRUFBQyxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FDbGYsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsS0FBRyxRQUFNLE1BQUksR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBRSxFQUFFO0FBQUcsbUJBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLEtBQUc7QUFBSSxxQkFBTyxF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LElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLEtBQUcsRUFBRSxrQkFBa0I7QUFBRyxrQkFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCO0FBQUUsa0JBQUksSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxLQUFHLEtBQUcsS0FBRyxFQUFFLGtCQUFrQixLQUFHLEtBQUssSUFBSSxHQUFFLENBQUMsS0FBRztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBSSxJQUFFLElBQUksS0FBSyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxNQUFLLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxDQUFDLEdBQUUsSUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFFLEVBQUUsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQ3BmLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQixHQUFFLElBQUUsS0FBSyxJQUFJLEdBQUUsQ0FBQztBQUFFLGtCQUFFLElBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsT0FBTyxLQUFHLEtBQUcsS0FBRyxDQUFDLElBQUUsSUFBRSxNQUFJLEtBQUcsT0FBSyxJQUFFLEtBQUssSUFBSSxHQUFFLENBQUMsR0FBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLElBQUUsUUFBTSxJQUFFLElBQUUsSUFBRSxLQUFHLEVBQUU7QUFBRyxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxPQUFPO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxLQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsZ0JBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsUUFBUTtBQUFFLGtCQUFFLEVBQUUsUUFBUSxJQUFFO0FBQUkscUJBQU8sSUFBSSxJQUFFLEdBQUUsS0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUUsSUFBRSxJQUFFLENBQUMsS0FBSyxNQUFNLElBQzVmLFVBQVUsTUFBSSxJQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQUksTUFBSSxVQUFVLE1BQUksSUFBRSxFQUFFLEdBQUUsTUFBSTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsV0FBVTtBQUFDLHFCQUFNO0FBQUEsWUFBRztBQUFBLFlBQUUsR0FBRSxXQUFVO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsdUJBQVMsRUFBRSxHQUFFO0FBQUMsd0JBQU8sSUFBRSxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixLQUFHLEVBQUUsQ0FBQyxJQUFFO0FBQUEsY0FBSztBQUFDLHFCQUFLO0FBQUUs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LEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQzVZLGNBQUksS0FBRyxPQUFHO0FBQUMscUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxFQUFFLEdBQUU7QUFBQyxrQkFBSSxJQUFFLEVBQUUsV0FBVyxDQUFDO0FBQUUscUJBQUssSUFBRSxNQUFJLFFBQU0sSUFBRSxLQUFHLElBQUUsU0FBTyxLQUFHLFNBQU8sS0FBRyxLQUFHLEdBQUUsRUFBRSxLQUFHLEtBQUc7QUFBQSxZQUFDO0FBQUMsbUJBQU87QUFBQSxVQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsR0FBRSxHQUFFLE1BQUk7QUFBQyxtQkFBSztBQUFFLGdCQUFHLEVBQUUsSUFBRTtBQUFHLHFCQUFPO0FBQUUsZ0JBQUksSUFBRTtBQUFFLGdCQUFFLElBQUUsSUFBRTtBQUFFLHFCQUFRLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxFQUFFLEdBQUU7QUFBQyxrQkFBSSxJQUFFLEVBQUUsV0FBVyxDQUFDO0FBQUUsa0JBQUcsU0FBTyxLQUFHLFNBQU8sR0FBRTtBQUFDLG9CQUFJLElBQUUsRUFBRSxXQUFXLEVBQUUsQ0FBQztBQUFFLG9CQUFFLFVBQVEsSUFBRSxTQUFPLE1BQUksSUFBRTtBQUFBLGNBQUk7QUFBQyxrQkFBRyxPQUFLLEdBQUU7QUFBQyxvQkFBRyxLQUFHO0FBQUU7QUFBTSxrQkFBRSxRQUFNLENBQUMsSUFBRTtBQUFBLGNBQUMsT0FBSztBQUFDLG9CQUFHLFFBQU0sR0FBRTtBQUFDLHNCQUFHLElBQUUsS0FBRztBQUFFO0FBQU0sb0JBQUUsUUFBTSxDQUFDLElBQUUsTUFBSSxLQUFHO0FBQUEsZ0JBQUMsT0FBSztBQUFDLHNCQUFHLFNBQU8sR0FBRTtBQUFDLHdCQUFHLElBQUUsS0FBRztBQUFFO0FBQU0sc0JBQUUsUUFBTSxD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LElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUscUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLGtCQUFJLElBQUUsRUFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQztBQUFFLG1CQUFHO0FBQUUsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsb0JBQUksSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLENBQUMsR0FBRSxJQUFFLEdBQUcsQ0FBQztBQUFFLHNCQUFJLEtBQUcsT0FBSyxNQUFJLE1BQUksSUFBRSxLQUFHLEdBQUcsR0FBRyxHQUFFLENBQUMsQ0FBQyxHQUFFLEVBQUUsU0FBTyxLQUFHLEVBQUUsS0FBSyxDQUFDO0FBQUEsY0FBQztBQUFDLG1CQUFHO0FBQUEsWUFBQztBQUFDLGNBQUUsRUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFO0FBQUUsbUJBQU87QUFBQSxVQUFDO0FBQUMsY0FBSSxLQUFHLENBQUMsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLEVBQUUsR0FBRSxLQUFHLENBQUMsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLEVBQUU7QUFBRSxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBSSxJQUFFLE1BQU0sR0FBRyxDQUFDLElBQUUsQ0FBQztBQUFFLGVBQUcsR0FBRSxHQUFFLEdBQUUsRUFBRSxNQUFNO0FBQUUsbUJBQU87QUFBQSxVQUFDO0FBQ2pmLGNBQUksS0FBRyxDQUFDLEdBQUUsTUFBSTtBQUFDLGVBQUcsRUFBRSxJQUFJLEdBQUUsTUFBSSxDQUFDO0FBQUEsVUFBQztBQUNoQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBUyxFQUFFLEdBQUUsR0FBRSxH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QUFHLEVBQUUsRUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsSUFBRSxHQUFHLENBQUMsSUFBRSxHQUFFO0FBQUUsZ0JBQUUsR0FBRyxDQUFDO0FBQUUsZ0JBQUU7QUFBQSxjQUFDLE1BQUs7QUFBQSxjQUF1QixNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBSyxNQUFLO0FBQUEsY0FBYyxNQUFLO0FBQUEsY0FBUSxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FDMWUsTUFBSztBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLFlBQUk7QUFBRSxxQkFBUSxLQUFLO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsQ0FBQztBQUFFLGdCQUFJLEtBQUcsMkRBQTJELE1BQU0sR0FBRyxHQUFFLEtBQUcsd0ZBQXdGLE1BQU0sR0FBRztBQUFFLGdCQUFFO0FBQUEsY0FBQyxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQztBQUFBLGNBQ3JmLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRTtBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRTtBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFFLEVBQUU7QUFBRyxxQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHVCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsY0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMseUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyx1QkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxNQUFJO0FBQUEsY0FBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSztBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssTUFBSTtBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsTUFBSTtBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FDeGYsSUFBRSxFQUFFLE1BQUksQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFJLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQztBQUFFLHNCQUFJLEVBQUUsS0FBRyxNQUFJLEVBQUUsS0FBRyxLQUFHLEtBQUc7QUFBSSxvQkFBRztBQUFFLHdCQUFJLE1BQUksS0FBRyxFQUFFLEtBQUcsTUFBSSxFQUFFLE1BQUksR0FBRSxLQUFHLEtBQUcsS0FBRyxLQUFHLEVBQUUsRUFBRSxFQUFFLE1BQUksSUFBRTtBQUFBLHFCQUFRO0FBQUMsc0JBQUU7QUFBRyxzQkFBSSxLQUFHLEVBQUUsS0FBRyxJQUFFLEVBQUUsS0FBRyxLQUFHO0FBQUUsbUJBQUMsS0FBRyxLQUFHLEtBQUcsS0FBRyxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsTUFBSTtBQUFBLGdCQUFHO0FBQUMsdUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssUUFBSSxFQUFFLEtBQUcsTUFBTSxTQUFTLEVBQUUsVUFBVSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFHO0FB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Q0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLHFCQUFLO0FBQUUsa0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGdCQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGVBQWUsSUFBRTtBQUFLLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsVUFBVTtBQUFFLG1CQUFHLEVBQUUsUUFBUSxJQUFFLEtBQUssSUFBSSxFQUFFLGVBQWUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxLQUFHLFFBQU07QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGtCQUFFLElBQ3BmLFlBQVUsSUFBRSxVQUFRLENBQUMsQ0FBQyxLQUFHLE1BQUksS0FBRyxhQUFXLElBQUU7QUFBSSxxQkFBSztBQUFFLGtCQUFFLElBQUksS0FBSyxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxD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QVksRUFBQyxNQUFNLE9BQU8sSUFBRyxDQUFtQjtBQUFBLFlBQ2xEO0FBQUEsVUFBQztBQUFBLFFBQ1gsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLE9BQU8sSUFBRyxDQUFtQjtBQUFBLFFBQ2xEO0FBQ0E7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQ0YsZ0JBQU0sVUFBVSxHQUFHLEtBQUs7QUFDeEIsdUJBQWEsT0FBTztBQUNwQixzQkFBWSxFQUFDLE1BQU0sZ0JBQWUsQ0FBbUI7QUFBQSxRQUN2RCxTQUFTLEtBQUs7QUFDWixzQkFBWSxFQUFDLE1BQU0saUJBQWlCLElBQUcsQ0FBbUI7QUFBQSxRQUM1RDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNSSxxQkFBb0Isb0JBQW9CO0FBQzlDLHNCQUFZLEVBQUMsTUFBTSwwQkFBMEIsS0FBS0EsbUJBQWlCLENBQW1CO0FBQUEsUUFDeEYsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLDBCQUEwQixJQUFHLENBQW1CO0FBQUEsUUFDckU7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFsiam9pbiIsICJ3YXNtIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInRlbnNvciIsICJlcnJvckNvZGUiLCAiaSIsICJvcnRFbnZJbml0aWFsaXplZCJdCn0K\n';
  }
});

// web/lib/wasm/proxy-wrapper.ts
var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, initOrtCallbacks, createSessionAllocateCallbacks, createSessionFinalizeCallbacks, createSessionCallbacks, releaseSessionCallbacks, runCallbacks, endProfilingCallbacks, isOrtEnvInitializedCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyInstance, initializeRuntime, createSessionAllocate2, createSessionFinalize2, createSession2, releaseSession2, run2, endProfiling2, isOrtEnvInitialized2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    isProxy = () => !!env2.wasm.proxy && typeof document !== "undefined";
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    createSessionAllocateCallbacks = [];
    createSessionFinalizeCallbacks = [];
    createSessionCallbacks = [];
    releaseSessionCallbacks = [];
    runCallbacks = [];
    endProfilingCallbacks = [];
    isOrtEnvInitializedCallbacks = [];
    ensureWorker = () => {
      if (initializing2 || !initialized2 || aborted2 || !proxyWorker) {
        throw new Error("worker not ready");
      }
    };
    onProxyWorkerMessage = (ev) => {
      switch (ev.data.type) {
        case "init-wasm":
          initializing2 = false;
          if (ev.data.err) {
            aborted2 = true;
            initWasmCallbacks[1](ev.data.err);
          } else {
            initialized2 = true;
            initWasmCallbacks[0]();
          }
          break;
        case "init-ort":
          if (ev.data.err) {
            initOrtCallbacks[1](ev.data.err);
          } else {
            initOrtCallbacks[0]();
          }
          break;
        case "create_allocate":
          if (ev.data.err) {
            createSessionAllocateCallbacks.shift()[1](ev.data.err);
          } else {
            createSessionAllocateCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "create_finalize":
          if (ev.data.err) {
            createSessionFinalizeCallbacks.shift()[1](ev.data.err);
          } else {
            createSessionFinalizeCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "create":
          if (ev.data.err) {
            createSessionCallbacks.shift()[1](ev.data.err);
          } else {
            createSessionCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "release":
          if (ev.data.err) {
            releaseSessionCallbacks.shift()[1](ev.data.err);
          } else {
            releaseSessionCallbacks.shift()[0]();
          }
          break;
        case "run":
          if (ev.data.err) {
            runCallbacks.shift()[1](ev.data.err);
          } else {
            runCallbacks.shift()[0](ev.data.out);
          }
          break;
        case "end-profiling":
          if (ev.data.err) {
            endProfilingCallbacks.shift()[1](ev.data.err);
          } else {
            endProfilingCallbacks.shift()[0]();
          }
          break;
        case "is-ort-env-initialized":
          if (ev.data.err) {
            isOrtEnvInitializedCallbacks.shift()[1](ev.data.err);
          } else {
            isOrtEnvInitializedCallbacks.shift()[0](ev.data.out);
          }
          break;
        default:
      }
    };
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
    initializeWebAssemblyInstance = async () => {
      if (isProxy()) {
        if (initialized2) {
          return;
        }
        if (initializing2) {
          throw new Error("multiple calls to 'initWasm()' detected.");
        }
        if (aborted2) {
          throw new Error("previous call to 'initWasm()' failed.");
        }
        initializing2 = true;
        if (env2.wasm.wasmPaths === void 0) {
          if (scriptSrc && scriptSrc.indexOf("blob:") !== 0) {
            env2.wasm.wasmPaths = scriptSrc.substr(0, +scriptSrc.lastIndexOf("/") + 1);
          }
        }
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          const workerUrl = URL.createObjectURL(new Blob(
            [
              // This require() function is handled by esbuild plugin to load file content as string.
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require_main()
            ],
            { type: "text/javascript" }
          ));
          proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
          proxyWorker.onerror = (ev) => reject(ev);
          proxyWorker.onmessage = onProxyWorkerMessage;
          URL.revokeObjectURL(workerUrl);
          initWasmCallbacks = [resolve, reject];
          const message = { type: "init-wasm", in: env2.wasm };
          proxyWorker.postMessage(message);
        });
      } else {
        return initializeWebAssembly(env2.wasm);
      }
    };
    initializeRuntime = async (env3) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          initOrtCallbacks = [resolve, reject];
          const message = { type: "init-ort", in: env3 };
          proxyWorker.postMessage(message);
        });
      } else {
        await initRuntime(env3);
      }
    };
    createSessionAllocate2 = async (model) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          createSessionAllocateCallbacks.push([resolve, reject]);
          const message = { type: "create_allocate", in: { model } };
          proxyWorker.postMessage(message, [model.buffer]);
        });
      } else {
        return createSessionAllocate(model);
      }
    };
    createSessionFinalize2 = async (modeldata, options) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          createSessionFinalizeCallbacks.push([resolve, reject]);
          const message = { type: "create_finalize", in: { modeldata, options } };
          proxyWorker.postMessage(message);
        });
      } else {
        return createSessionFinalize(modeldata, options);
      }
    };
    createSession2 = async (model, options) => {
      if (isProxy()) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          createSessionCallbacks.push([resolve, reject]);
          const message = { type: "create", in: { model, options } };
          proxyWorker.postMessage(message, [model.buffer]);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          releaseSessionCallbacks.push([resolve, reject]);
          const message = { type: "release", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        releaseSession(sessionId);
      }
    };
    run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
      if (isProxy()) {
        if (inputs.some((t) => t[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t) => t)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          runCallbacks.push([resolve, reject]);
          const serializableInputs = inputs;
          const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
          proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
        });
      } else {
        return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
      }
    };
    endProfiling2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          endProfilingCallbacks.push([resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
    isOrtEnvInitialized2 = async () => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          isOrtEnvInitializedCallbacks.push([resolve, reject]);
          const message = { type: "is-ort-env-initialized" };
          proxyWorker.postMessage(message);
        });
      } else {
        return isOrtEnvInitialized();
      }
    };
  }
});

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/session-handler-inference.ts
var runtimeInitializationPromise, encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_promises();
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
        default:
          throw new Error(`invalid data location: ${tensor.location} for ${getName()}`);
      }
    };
    decodeTensorMetadata = (tensor) => {
      switch (tensor[3]) {
        case "cpu":
          return new Tensor2(tensor[0], tensor[2], tensor[1]);
        case "gpu-buffer": {
          const dataType = tensor[0];
          if (!isGpuBufferSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing GPU tensor`);
          }
          const { gpuBuffer, download, dispose } = tensor[2];
          return Tensor2.fromGpuBuffer(gpuBuffer, { dataType, dims: tensor[1], download, dispose });
        }
        default:
          throw new Error(`invalid data location: ${tensor[3]}`);
      }
    };
    OnnxruntimeWebAssemblySessionHandler = class {
      async createSessionAllocate(path) {
        const response = await fetch(path);
        if (response.status !== 200) {
          throw new Error(`failed to load model: ${path}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return createSessionAllocate2(new Uint8Array(arrayBuffer));
      }
      async loadModel(pathOrBuffer, options) {
        if (!await isOrtEnvInitialized2()) {
          if (!runtimeInitializationPromise) {
            runtimeInitializationPromise = initializeRuntime(env2);
          }
          await runtimeInitializationPromise;
          runtimeInitializationPromise = void 0;
        }
        if (typeof pathOrBuffer === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            const model = await readFile2(pathOrBuffer);
            [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
          } else {
            const modelData = await this.createSessionAllocate(pathOrBuffer);
            [this.sessionId, this.inputNames, this.outputNames] = await createSessionFinalize2(modelData, options);
          }
        } else {
          [this.sessionId, this.inputNames, this.outputNames] = await createSession2(pathOrBuffer, options);
        }
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.inputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}'`);
          }
          inputArray.push(tensor);
          inputIndices.push(index);
        });
        const outputArray = [];
        const outputIndices = [];
        Object.entries(fetches).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.outputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid output '${name}'`);
          }
          outputArray.push(tensor);
          outputIndices.push(index);
        });
        const inputs = inputArray.map((t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`));
        const outputs = outputArray.map(
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await run2(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      startProfiling() {
      }
      endProfiling() {
        void endProfiling2(this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm.ts
var initializeFlags, OnnxruntimeWebAssemblyBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_node_os();
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      if (typeof env2.wasm.simd !== "boolean") {
        env2.wasm.simd = true;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      async init() {
        initializeFlags();
        await initializeWebAssemblyInstance();
      }
      async createInferenceSessionHandler(pathOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return Promise.resolve(handler);
      }
    };
  }
});

// web/lib/wasm/wasm-training-core-impl.ts
var NO_TRAIN_FUNCS_MSG, createCheckpointHandle, getModelInputOutputCount, getModelInputOutputNamesLoop, getTrainingModelInputOutputNames, createTrainingSessionHandle, createAndAllocateTensors, moveOutputToTensorMetadataArr, runTrainStep, releaseTrainingSessionAndCheckpoint;
var init_wasm_training_core_impl = __esm({
  "web/lib/wasm/wasm-training-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_core_impl();
    init_wasm_factory();
    init_wasm_utils();
    NO_TRAIN_FUNCS_MSG = "Built without training API's enabled. Use the onnxruntime-web/training import for training functionality, and make sure that all the correct artifacts are built & moved to the correct folder if using a custom build. Check https://onnxruntime.ai/docs/build/web.html for more information.";
    createCheckpointHandle = (checkpointData) => {
      const wasm2 = getInstance();
      const [checkpointDataOffset, checkpointDataLength] = checkpointData;
      let checkpointHandle = 0;
      try {
        if (wasm2._OrtTrainingLoadCheckpoint) {
          checkpointHandle = wasm2._OrtTrainingLoadCheckpoint(checkpointDataOffset, checkpointDataLength);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        if (checkpointHandle === 0) {
          checkLastError("Error occurred when trying to create a CheckpointState.");
        }
        return checkpointHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseCheckpoint && checkpointHandle !== 0) {
          wasm2._OrtTrainingReleaseCheckpoint(checkpointHandle);
        }
        throw e;
      } finally {
        wasm2._OrtFree(checkpointData[0]);
      }
    };
    getModelInputOutputCount = (trainingSessionId, isEvalModel) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        if (wasm2._OrtTrainingGetModelInputOutputCount) {
          const errorCode = wasm2._OrtTrainingGetModelInputOutputCount(trainingSessionId, dataOffset, dataOffset + 4, isEvalModel);
          if (errorCode !== 0) {
            checkLastError("Can't get session input/output count.");
          }
          return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getModelInputOutputNamesLoop = (trainingSessionId, count, isInput, isEvalModel) => {
      const names = [];
      const wasm2 = getInstance();
      const namesUTF8Encoded = [];
      for (let i = 0; i < count; i++) {
        if (wasm2._OrtTrainingGetModelInputOutputName) {
          const name = wasm2._OrtTrainingGetModelInputOutputName(trainingSessionId, i, isInput, isEvalModel);
          if (name === 0) {
            checkLastError("Can't get input or output name");
          }
          namesUTF8Encoded.push(name);
          names.push(wasm2.UTF8ToString(name));
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      }
      return [names, namesUTF8Encoded];
    };
    getTrainingModelInputOutputNames = (trainingSessionId) => {
      const [inputCount, outputCount] = getModelInputOutputCount(trainingSessionId, false);
      const [inputNames, inputNamesUTF8Encoded] = getModelInputOutputNamesLoop(trainingSessionId, inputCount, true, false);
      const [outputNames, outputNamesUTF8Encoded] = getModelInputOutputNamesLoop(trainingSessionId, outputCount, false, false);
      return [inputNames, inputNamesUTF8Encoded, outputNames, outputNamesUTF8Encoded];
    };
    createTrainingSessionHandle = (checkpointHandle, trainModelData, evalModelData, optimizerModelData, options) => {
      const wasm2 = getInstance();
      let trainingSessionHandle = 0;
      let sessionOptionsHandle = 0;
      let allocs = [];
      let inputNamesUTF8Encoded = [];
      let outputNamesUTF8Encoded = [];
      let inputNames = [];
      let outputNames = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (wasm2._OrtTrainingCreateSession) {
          trainingSessionHandle = wasm2._OrtTrainingCreateSession(
            sessionOptionsHandle,
            checkpointHandle,
            trainModelData[0],
            trainModelData[1],
            evalModelData[0],
            evalModelData[1],
            optimizerModelData[0],
            optimizerModelData[1]
          );
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        if (trainingSessionHandle === 0) {
          checkLastError("Error occurred when trying to create a TrainingSession.");
        }
        [inputNames, inputNamesUTF8Encoded, outputNames, outputNamesUTF8Encoded] = getTrainingModelInputOutputNames(trainingSessionHandle);
        return [[trainingSessionHandle, inputNames, outputNames], inputNamesUTF8Encoded, outputNamesUTF8Encoded];
      } catch (e) {
        if (wasm2._OrtTrainingReleaseSession && trainingSessionHandle !== 0) {
          wasm2._OrtTrainingReleaseSession(trainingSessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(trainModelData[0]);
        wasm2._free(evalModelData[0]);
        wasm2._free(optimizerModelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      }
    };
    createAndAllocateTensors = (trainingSessionId, indices, tensors, tensorHandles, inputOutputAllocs, indexAdd) => {
      const count = indices.length;
      for (let i = 0; i < count; i++) {
        prepareInputOutputTensor(
          tensors[i],
          tensorHandles,
          inputOutputAllocs,
          trainingSessionId,
          indexAdd + indices[i]
        );
      }
      const wasm2 = getInstance();
      const valuesOffset = wasm2.stackAlloc(count * 4);
      let valuesIndex = valuesOffset / 4;
      for (let i = 0; i < count; i++) {
        wasm2.HEAPU32[valuesIndex++] = tensorHandles[i];
      }
      return valuesOffset;
    };
    moveOutputToTensorMetadataArr = (outputValuesOffset, outputCount, outputTensorHandles, outputTensors) => {
      const wasm2 = getInstance();
      const output = [];
      for (let i = 0; i < outputCount; i++) {
        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
        if (tensor === outputTensorHandles[i]) {
          output.push(outputTensors[i]);
          continue;
        }
        const beforeGetTensorDataStack = wasm2.stackSave();
        const tensorDataOffset = wasm2.stackAlloc(4 * 4);
        let type, dataOffset = 0;
        try {
          const errorCode = wasm2._OrtGetTensorData(
            tensor,
            tensorDataOffset,
            tensorDataOffset + 4,
            tensorDataOffset + 8,
            tensorDataOffset + 12
          );
          if (errorCode !== 0) {
            checkLastError(`Can't access output tensor data on index ${i}.`);
          }
          let tensorDataIndex = tensorDataOffset / 4;
          const dataType = wasm2.HEAPU32[tensorDataIndex++];
          dataOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
          const dims = [];
          for (let i2 = 0; i2 < dimsLength; i2++) {
            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
          }
          wasm2._OrtFree(dimsOffset);
          const size = dims.reduce((a, b) => a * b, 1);
          type = tensorDataTypeEnumToString(dataType);
          if (type === "string") {
            const stringData = [];
            let dataIndex = dataOffset / 4;
            for (let i2 = 0; i2 < size; i2++) {
              const offset = wasm2.HEAPU32[dataIndex++];
              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
            }
            output.push([type, dims, stringData, "cpu"]);
          } else {
            const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
            const data = new typedArrayConstructor(size);
            new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
            output.push([type, dims, data, "cpu"]);
          }
        } finally {
          wasm2.stackRestore(beforeGetTensorDataStack);
          if (type === "string" && dataOffset) {
            wasm2._free(dataOffset);
          }
          wasm2._OrtReleaseTensor(tensor);
        }
      }
      return output;
    };
    runTrainStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingRunTrainStep) {
          const errorCode = wasm2._OrtTrainingRunTrainStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          if (errorCode !== 0) {
            checkLastError("failed to call OrtTrainingRunTrainStep in the WebAssembly layer");
          }
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    releaseTrainingSessionAndCheckpoint = (checkpointId, sessionId, inputNamesUTF8Encoded, outputNamesUTF8Encoded) => {
      const wasm2 = getInstance();
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      if (wasm2._OrtTrainingReleaseSession) {
        wasm2._OrtTrainingReleaseSession(sessionId);
      }
      if (wasm2._OrtTrainingReleaseCheckpoint) {
        wasm2._OrtTrainingReleaseCheckpoint(checkpointId);
      }
    };
  }
});

// web/lib/wasm/session-handler-training.ts
var OnnxruntimeWebAssemblyTrainingSessionHandler;
var init_session_handler_training = __esm({
  "web/lib/wasm/session-handler-training.ts"() {
    "use strict";
    init_esm();
    init_session_handler_inference();
    init_wasm_core_impl();
    init_wasm_training_core_impl();
    OnnxruntimeWebAssemblyTrainingSessionHandler = class {
      async loadParametersBuffer(_array, _trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async getContiguousParameters(_trainableOnly) {
        throw new Error("Method not implemented.");
      }
      async uriOrBufferToHeap(uriOrBuffer) {
        let buffer;
        if (typeof uriOrBuffer === "string") {
          const response = await fetch(uriOrBuffer);
          const arrayBuffer = await response.arrayBuffer();
          buffer = new Uint8Array(arrayBuffer);
        } else {
          buffer = uriOrBuffer;
        }
        return createSessionAllocate(buffer);
      }
      async createTrainingSession(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        if (!isOrtEnvInitialized()) {
          await initRuntime(env2);
        }
        const checkpointData = await this.uriOrBufferToHeap(checkpointStateUriOrBuffer);
        const trainModelData = await this.uriOrBufferToHeap(trainModelUriOrBuffer);
        let evalModelData = [0, 0];
        let optimizerModelData = [0, 0];
        if (evalModelUriOrBuffer !== "") {
          evalModelData = await this.uriOrBufferToHeap(evalModelUriOrBuffer);
        }
        if (optimizerModelUriOrBuffer !== "") {
          optimizerModelData = await this.uriOrBufferToHeap(optimizerModelUriOrBuffer);
        }
        this.checkpointId = createCheckpointHandle(checkpointData);
        [[this.sessionId, this.inputNames, this.outputNames], this.inputEncodedNames, this.outputEncodedNames] = createTrainingSessionHandle(this.checkpointId, trainModelData, evalModelData, optimizerModelData, options);
      }
      /**
       * Helper method that converts a feeds or fetches datatype to two arrays, one of values and one that stores the
       * corresponding name as a number referring to the index in the list of names provided.
       *
       * @param feeds meant to match either SessionHandler.FeedsType or SessionHandler.FetchesType
       * @param names either inputNames or outputNames
       * @returns a tuple of a list of values and a list of indices.
       */
      convertMapIntoValuesArrayAndIndicesArray(feeds, names, mapFunc) {
        const values = [];
        const indices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = names.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}`);
          }
          values.push(tensor);
          indices.push(index);
        });
        const uList = values.map(mapFunc);
        return [values, indices, uList];
      }
      /**
       * Helper method that converts the TensorMetadata that the wasm-core functions return to the
       * SessionHandler.ReturnType. Any outputs in the provided outputArray that are falsy will be populated with the
       * corresponding result.
       *
       * @param results used to populate the resultMap if there is no value for that outputName already
       * @param outputArray used to populate the resultMap. If null or undefined, use the corresponding result from results
       * @param outputIndices specifies which outputName the corresponding value for outputArray refers to.
       * @returns a map of output names and OnnxValues.
       */
      convertTensorMetadataToReturnType(results, outputArray, outputIndices) {
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      async runTrainStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.inputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.outputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await runTrainStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async dispose() {
        return releaseTrainingSessionAndCheckpoint(
          this.checkpointId,
          this.sessionId,
          this.inputEncodedNames,
          this.outputEncodedNames
        );
      }
    };
  }
});

// web/lib/backend-wasm-training.ts
var backend_wasm_training_exports = {};
__export(backend_wasm_training_exports, {
  wasmBackend: () => wasmBackend
});
var OnnxruntimeTrainingWebAssemblyBackend, wasmBackend;
var init_backend_wasm_training = __esm({
  "web/lib/backend-wasm-training.ts"() {
    "use strict";
    init_backend_wasm();
    init_session_handler_training();
    OnnxruntimeTrainingWebAssemblyBackend = class extends OnnxruntimeWebAssemblyBackend {
      async createTrainingSessionHandler(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblyTrainingSessionHandler();
        await handler.createTrainingSession(
          checkpointStateUriOrBuffer,
          trainModelUriOrBuffer,
          evalModelUriOrBuffer,
          optimizerModelUriOrBuffer,
          options
        );
        return Promise.resolve(handler);
      }
    };
    wasmBackend = new OnnxruntimeTrainingWebAssemblyBackend();
  }
});

// web/lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  InferenceSession: () => InferenceSession2,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  default: () => lib_default,
  env: () => env2,
  registerBackend: () => registerBackend
});
module.exports = __toCommonJS(lib_exports);
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.17.0";

// web/lib/index.ts
var lib_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = false ? null.wasmBackend : (init_backend_wasm_training(), __toCommonJS(backend_wasm_training_exports)).wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
  if (false) {
    registerBackend("xnnpack", wasmBackend2, 9);
    registerBackend("webnn", wasmBackend2, 9);
  }
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });