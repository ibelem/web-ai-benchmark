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
        var d = moduleArg, k, l;
        d.ready = new Promise((a, b) => {
          k = a;
          l = b;
        });
        var r = Object.assign({}, d), v = "./this.program", aa = "object" == typeof window, x = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, y = "", A, B, C;
        if (ba) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));
          y = x ? D.dirname(y) + "/" : __dirname + "/";
          A = (a, b) => {
            a = a.startsWith("file://") ? new URL(a) : D.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          C = (a) => {
            a = A(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          B = (a, b, c, e = true) => {
            a = a.startsWith("file://") ? new URL(a) : D.normalize(a);
            fs.readFile(a, e ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(e ? h.buffer : h);
            });
          };
          !d.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          d.inspect = () => "[Emscripten Module object]";
        } else if (aa || x)
          x ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), _scriptDir && (y = _scriptDir), 0 !== y.indexOf("blob:") ? y = y.substr(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1) : y = "", A = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, x && (C = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), B = (a, b, c) => {
            var e = new XMLHttpRequest();
            e.open("GET", a, true);
            e.responseType = "arraybuffer";
            e.onload = () => {
              200 == e.status || 0 == e.status && e.response ? b(e.response) : c();
            };
            e.onerror = c;
            e.send(null);
          };
        var ca = d.print || console.log.bind(console), E = d.printErr || console.error.bind(console);
        Object.assign(d, r);
        r = null;
        d.thisProgram && (v = d.thisProgram);
        var F;
        d.wasmBinary && (F = d.wasmBinary);
        var noExitRuntime = d.noExitRuntime || true;
        "object" != typeof WebAssembly && G("no native wasm support detected");
        var H, I, da = false, J, K, L, M;
        function ea() {
          var a = H.buffer;
          d.HEAP8 = J = new Int8Array(a);
          d.HEAP16 = new Int16Array(a);
          d.HEAP32 = L = new Int32Array(a);
          d.HEAPU8 = K = new Uint8Array(a);
          d.HEAPU16 = new Uint16Array(a);
          d.HEAPU32 = M = new Uint32Array(a);
          d.HEAPF32 = new Float32Array(a);
          d.HEAPF64 = new Float64Array(a);
        }
        var fa = [], ha = [], ia = [];
        function ja() {
          var a = d.preRun.shift();
          fa.unshift(a);
        }
        var N = 0, O = null, P = null;
        function G(a) {
          if (d.onAbort)
            d.onAbort(a);
          a = "Aborted(" + a + ")";
          E(a);
          da = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        function ka(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var Q;
        Q = "ort-training-wasm-simd.wasm";
        if (!ka(Q)) {
          var la = Q;
          Q = d.locateFile ? d.locateFile(la, y) : y + la;
        }
        function ma(a) {
          if (a == Q && F)
            return new Uint8Array(F);
          if (C)
            return C(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function na(a) {
          if (!F && (aa || x)) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => ma(a));
            if (B)
              return new Promise((b, c) => {
                B(a, (e) => b(new Uint8Array(e)), c);
              });
          }
          return Promise.resolve().then(() => ma(a));
        }
        function oa(a, b, c) {
          return na(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {
            E("failed to asynchronously prepare wasm: " + e);
            G(e);
          });
        }
        function pa(a, b) {
          var c = Q;
          return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {
            E("wasm streaming compile failed: " + g);
            E("falling back to ArrayBuffer instantiation");
            return oa(c, a, b);
          }));
        }
        var R, S = (a) => {
          for (; 0 < a.length; )
            a.shift()(d);
        };
        function qa(a) {
          this.Ja = a - 24;
          this.Na = function(b) {
            M[this.Ja + 4 >> 2 >>> 0] = b;
          };
          this.Ma = function(b) {
            M[this.Ja + 8 >> 2 >>> 0] = b;
          };
          this.Ka = function(b, c) {
            this.La();
            this.Na(b);
            this.Ma(c);
          };
          this.La = function() {
            M[this.Ja + 16 >> 2 >>> 0] = 0;
          };
        }
        var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {
          b >>>= 0;
          var e = b + c;
          for (c = b; a[c] && !(c >= e); )
            ++c;
          if (16 < c - b && a.buffer && ta)
            return ta.decode(a.subarray(b, c));
          for (e = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                e += String.fromCharCode((g & 31) << 6 | h);
              else {
                var m = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;
                65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              e += String.fromCharCode(g);
          }
          return e;
        }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var e = a.charCodeAt(c);
            127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, V = (a, b, c, e) => {
          c >>>= 0;
          if (!(0 < e))
            return 0;
          var g = c;
          e = c + e - 1;
          for (var h = 0; h < a.length; ++h) {
            var m = a.charCodeAt(h);
            if (55296 <= m && 57343 >= m) {
              var q = a.charCodeAt(++h);
              m = 65536 + ((m & 1023) << 10) | q & 1023;
            }
            if (127 >= m) {
              if (c >= e)
                break;
              b[c++ >>> 0] = m;
            } else {
              if (2047 >= m) {
                if (c + 1 >= e)
                  break;
                b[c++ >>> 0] = 192 | m >> 6;
              } else {
                if (65535 >= m) {
                  if (c + 2 >= e)
                    break;
                  b[c++ >>> 0] = 224 | m >> 12;
                } else {
                  if (c + 3 >= e)
                    break;
                  b[c++ >>> 0] = 240 | m >> 18;
                  b[c++ >>> 0] = 128 | m >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | m >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | m & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, W = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), va = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ba = (a) => {
          var b = U(a) + 1, c = Aa(b);
          c && V(a, K, c, b);
          return c;
        }, X = {}, Ca = () => {
          if (!Y) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(
              "-",
              "_"
            ) + ".UTF-8", _: v || "./this.program" }, b;
            for (b in X)
              void 0 === X[b] ? delete a[b] : a[b] = X[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Y = c;
          }
          return Y;
        }, Y, Da = [null, [], []], Ea = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Fa = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ga(a) {
          var b = Array(U(a) + 1);
          V(a, b, 0, b.length);
          return b;
        }
        function Ha(a, b, c, e) {
          function g(f, n, p) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )
              f = p[0] + f;
            return f;
          }
          function h(f, n) {
            return g(f, n, "0");
          }
          function m(f, n) {
            function p(xa) {
              return 0 > xa ? -1 : 0 < xa ? 1 : 0;
            }
            var z;
            0 === (z = p(f.getFullYear() - n.getFullYear())) && 0 === (z = p(f.getMonth() - n.getMonth())) && (z = p(f.getDate() - n.getDate()));
            return z;
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
          function w(f) {
            var n = f.Ea;
            for (f = new Date(new Date(f.Fa + 1900, 0, 1).getTime()); 0 < n; ) {
              var p = f.getMonth(), z = (W(f.getFullYear()) ? Ea : Fa)[p];
              if (n > z - f.getDate())
                n -= z - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + n);
                break;
              }
            }
            p = new Date(f.getFullYear() + 1, 0, 4);
            n = q(new Date(
              f.getFullYear(),
              0,
              4
            ));
            p = q(p);
            return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          var t = L[e + 40 >> 2 >>> 0];
          e = { Qa: L[e >> 2 >>> 0], Pa: L[e + 4 >> 2 >>> 0], Ga: L[e + 8 >> 2 >>> 0], Ia: L[e + 12 >> 2 >>> 0], Ha: L[e + 16 >> 2 >>> 0], Fa: L[e + 20 >> 2 >>> 0], za: L[e + 24 >> 2 >>> 0], Ea: L[e + 28 >> 2 >>> 0], Sa: L[e + 32 >> 2 >>> 0], Oa: L[e + 36 >> 2 >>> 0], Ra: t ? T(t) : "" };
          c = T(c);
          t = {
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
          for (var u in t)
            c = c.replace(new RegExp(u, "g"), t[u]);
          var ya = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), za = "January February March April May June July August September October November December".split(" ");
          t = { "%a": (f) => ya[f.za].substring(0, 3), "%A": (f) => ya[f.za], "%b": (f) => za[f.Ha].substring(0, 3), "%B": (f) => za[f.Ha], "%C": (f) => h((f.Fa + 1900) / 100 | 0, 2), "%d": (f) => h(f.Ia, 2), "%e": (f) => g(f.Ia, 2, " "), "%g": (f) => w(f).toString().substring(2), "%G": (f) => w(f), "%H": (f) => h(f.Ga, 2), "%I": (f) => {
            f = f.Ga;
            0 == f ? f = 12 : 12 < f && (f -= 12);
            return h(f, 2);
          }, "%j": (f) => {
            for (var n = 0, p = 0; p <= f.Ha - 1; n += (W(f.Fa + 1900) ? Ea : Fa)[p++])
              ;
            return h(f.Ia + n, 3);
          }, "%m": (f) => h(f.Ha + 1, 2), "%M": (f) => h(f.Pa, 2), "%n": () => "\n", "%p": (f) => 0 <= f.Ga && 12 > f.Ga ? "AM" : "PM", "%S": (f) => h(f.Qa, 2), "%t": () => "	", "%u": (f) => f.za || 7, "%U": (f) => h(Math.floor((f.Ea + 7 - f.za) / 7), 2), "%V": (f) => {
            var n = Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7);
            2 >= (f.za + 371 - f.Ea - 2) % 7 && n++;
            if (n)
              53 == n && (p = (f.za + 371 - f.Ea) % 7, 4 == p || 3 == p && W(f.Fa) || (n = 1));
            else {
              n = 52;
              var p = (f.za + 7 - f.Ea - 1) % 7;
              (4 == p || 5 == p && W(f.Fa % 400 - 1)) && n++;
            }
            return h(n, 2);
          }, "%w": (f) => f.za, "%W": (f) => h(Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7), 2), "%y": (f) => (f.Fa + 1900).toString().substring(2), "%Y": (f) => f.Fa + 1900, "%z": (f) => {
            f = f.Oa;
            var n = 0 <= f;
            f = Math.abs(f) / 60;
            return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
          }, "%Z": (f) => f.Ra, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (u in t)
            c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](e)));
          c = c.replace(/\0\0/g, "%");
          u = Ga(c);
          if (u.length > b)
            return 0;
          J.set(u, a >>> 0);
          return u.length - 1;
        }
        var Ja = {
          a: function(a, b, c) {
            a >>>= 0;
            new qa(a).Ka(b >>> 0, c >>> 0);
            ra = a;
            sa++;
            throw ra;
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
          k: function() {
            return 0;
          },
          F: function() {
          },
          B: function() {
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
            L[c >> 2 >>> 0] = a.getUTCSeconds();
            L[c + 4 >> 2 >>> 0] = a.getUTCMinutes();
            L[c + 8 >> 2 >>> 0] = a.getUTCHours();
            L[c + 12 >> 2 >>> 0] = a.getUTCDate();
            L[c + 16 >> 2 >>> 0] = a.getUTCMonth();
            L[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;
            L[c + 24 >> 2 >>> 0] = a.getUTCDay();
            L[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
          },
          p: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            L[c >> 2 >>> 0] = a.getSeconds();
            L[c + 4 >> 2 >>> 0] = a.getMinutes();
            L[c + 8 >> 2 >>> 0] = a.getHours();
            L[c + 12 >> 2 >>> 0] = a.getDate();
            L[c + 16 >> 2 >>> 0] = a.getMonth();
            L[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;
            L[c + 24 >> 2 >>> 0] = a.getDay();
            L[c + 28 >> 2 >>> 0] = (W(a.getFullYear()) ? va : wa)[a.getMonth()] + a.getDate() - 1 | 0;
            L[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            L[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
          },
          q: function(a) {
            a >>>= 0;
            var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);
            0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == e) : 0 < c != (m == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - e)));
            L[a + 24 >> 2 >>> 0] = b.getDay();
            L[a + 28 >> 2 >>> 0] = (W(b.getFullYear()) ? va : wa)[b.getMonth()] + b.getDate() - 1 | 0;
            L[a >> 2 >>> 0] = b.getSeconds();
            L[a + 4 >> 2 >>> 0] = b.getMinutes();
            L[a + 8 >> 2 >>> 0] = b.getHours();
            L[a + 12 >> 2 >>> 0] = b.getDate();
            L[a + 16 >> 2 >>> 0] = b.getMonth();
            L[a + 20 >> 2 >>> 0] = b.getYear();
            a = b.getTime() / 1e3;
            return Ia((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          m: function() {
            return -52;
          },
          n: function() {
          },
          t: function(a, b, c) {
            function e(w) {
              return (w = w.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? w[1] : "GMT";
            }
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var q = m.getTimezoneOffset();
            M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);
            L[b >>> 0 >> 2 >>> 0] = Number(g != q);
            a = e(h);
            b = e(m);
            a = Ba(a);
            b = Ba(b);
            q < g ? (M[c >> 2 >>> 0] = a, M[c + 4 >> 2 >>> 0] = b) : (M[c >> 2 >>> 0] = b, M[c + 4 >> 2 >>> 0] = a);
          },
          d: () => {
            G("");
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
            return K.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
          },
          s: function(a) {
            a >>>= 0;
            var b = K.length;
            if (4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var e = b * (1 + 0.2 / c);
              e = Math.min(e, a + 100663296);
              var g = Math;
              e = Math.max(a, e);
              a: {
                g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;
                try {
                  H.grow(g);
                  ea();
                  var h = 1;
                  break a;
                } catch (m) {
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
            Ca().forEach(function(e, g) {
              var h = b + c;
              g = M[a + 4 * g >> 2 >>> 0] = h;
              for (h = 0; h < e.length; ++h)
                J[g++ >> 0 >>> 0] = e.charCodeAt(h);
              J[g >> 0 >>> 0] = 0;
              c += e.length + 1;
            });
            return 0;
          },
          D: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = Ca();
            M[a >> 2 >>> 0] = c.length;
            var e = 0;
            c.forEach(function(g) {
              e += g.length + 1;
            });
            M[b >> 2 >>> 0] = e;
            return 0;
          },
          f: () => 52,
          j: function() {
            return 52;
          },
          r: function() {
            return 70;
          },
          i: function(a, b, c, e) {
            b >>>= 0;
            c >>>= 0;
            e >>>= 0;
            for (var g = 0, h = 0; h < c; h++) {
              var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];
              b += 8;
              for (var w = 0; w < q; w++) {
                var t = K[m + w >>> 0], u = Da[a];
                0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);
              }
              g += q;
            }
            M[e >> 2 >>> 0] = g;
            return 0;
          },
          A: Ha,
          c: function(a, b, c, e) {
            return Ha(a >>> 0, b >>> 0, c >>> 0, e >>> 0);
          }
        };
        (function() {
          function a(c) {
            c = c.exports;
            I = c = Ka(c);
            H = I.J;
            ea();
            ha.unshift(I.K);
            N--;
            d.monitorRunDependencies && d.monitorRunDependencies(N);
            if (0 == N && (null !== O && (clearInterval(O), O = null), P)) {
              var e = P;
              P = null;
              e();
            }
            return c;
          }
          var b = { a: Ja };
          N++;
          d.monitorRunDependencies && d.monitorRunDependencies(N);
          if (d.instantiateWasm)
            try {
              return d.instantiateWasm(b, a);
            } catch (c) {
              E("Module.instantiateWasm callback failed with error: " + c), l(c);
            }
          pa(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        })();
        d._OrtInit = (a, b) => (d._OrtInit = I.L)(a, b);
        d._OrtGetLastError = (a, b) => (d._OrtGetLastError = I.M)(a, b);
        d._OrtCreateSessionOptions = (a, b, c, e, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, e, g, h, m, q, w, t);
        d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = I.O)(a, b);
        d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = I.P)(a, b, c);
        d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = I.Q)(a, b, c);
        d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = I.R)(a);
        d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = I.S)(a, b, c);
        d._OrtReleaseSession = (a) => (d._OrtReleaseSession = I.T)(a);
        d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = I.U)(a, b, c);
        d._OrtGetInputName = (a, b) => (d._OrtGetInputName = I.V)(a, b);
        d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = I.W)(a, b);
        d._OrtFree = (a) => (d._OrtFree = I.X)(a);
        d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, e, g, h);
        d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = I.Z)(a, b, c, e, g);
        d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);
        d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = I.$)(a, b, c, e);
        d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);
        d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);
        d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);
        d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);
        d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = I.ea)(a, b, c, e);
        d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);
        d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);
        d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, e, g);
        d._OrtRun = (a, b, c, e, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, e, g, h, m, q);
        d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);
        d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);
        d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);
        d._OrtTrainingCreateSession = (a, b, c, e, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, e, g, h, m, q);
        d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);
        d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, e, g, h);
        d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);
        d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, e, g, h);
        d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);
        d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, e);
        d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = I.ua)(a, b, c, e);
        d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = I.va)(a, b, c, e);
        d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.wa)(a);
        var Aa = d._malloc = (a) => (Aa = d._malloc = I.xa)(a);
        d._free = (a) => (d._free = I.ya)(a);
        var Ia = (a) => (Ia = I.Aa)(a), La = () => (La = I.Ba)(), Ma = (a) => (Ma = I.Ca)(a), Na = (a) => (Na = I.Da)(a);
        function Ka(a) {
          a = Object.assign({}, a);
          var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        d.stackAlloc = Na;
        d.stackSave = La;
        d.stackRestore = Ma;
        d.UTF8ToString = T;
        d.stringToUTF8 = (a, b, c) => V(a, K, b, c);
        d.lengthBytesUTF8 = U;
        var Z;
        P = function Oa() {
          Z || Pa();
          Z || (P = Oa);
        };
        function Pa() {
          function a() {
            if (!Z && (Z = true, d.calledRun = true, !da)) {
              S(ha);
              k(d);
              if (d.onRuntimeInitialized)
                d.onRuntimeInitialized();
              if (d.postRun)
                for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {
                  var b = d.postRun.shift();
                  ia.unshift(b);
                }
              S(ia);
            }
          }
          if (!(0 < N)) {
            if (d.preRun)
              for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )
                ja();
            S(fa);
            0 < N || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {
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
        Pa();
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
          d.buffer != l.buffer && m();
          return l;
        }
        function n() {
          d.buffer != l.buffer && m();
          return ba;
        }
        function p() {
          d.buffer != l.buffer && m();
          return ca;
        }
        function r() {
          d.buffer != l.buffer && m();
          return da;
        }
        function ea() {
          d.buffer != l.buffer && m();
          return fa;
        }
        var w = moduleArg, ha, x;
        w.ready = new Promise((a, b) => {
          ha = a;
          x = b;
        });
        var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {
          throw b;
        }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";
        function la(a) {
          return w.locateFile ? w.locateFile(a, E) : E + a;
        }
        var ma, F, H;
        if (B) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));
          E = A ? na.dirname(E) + "/" : __dirname + "/";
          ma = (b, c) => {
            b = b.startsWith("file://") ? new URL(b) : na.normalize(b);
            return fs.readFileSync(b, c ? void 0 : "utf8");
          };
          H = (b) => {
            b = ma(b, true);
            b.buffer || (b = new Uint8Array(b));
            return b;
          };
          F = (b, c, e, h = true) => {
            b = b.startsWith("file://") ? new URL(b) : na.normalize(b);
            fs.readFile(b, h ? void 0 : "utf8", (g, k) => {
              g ? e(g) : c(h ? k.buffer : k);
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
          A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ma = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, A && (H = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), F = (a, b, c) => {
            var e = new XMLHttpRequest();
            e.open("GET", a, true);
            e.responseType = "arraybuffer";
            e.onload = () => {
              200 == e.status || 0 == e.status && e.response ? b(e.response) : c();
            };
            e.onerror = c;
            e.send(null);
          });
        B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var oa = console.log.bind(console), pa = console.error.bind(console);
        B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var qa = w.print || oa, I = w.printErr || pa;
        Object.assign(w, ia);
        ia = null;
        w.thisProgram && (ja = w.thisProgram);
        w.quit && (z = w.quit);
        var J;
        w.wasmBinary && (J = w.wasmBinary);
        var noExitRuntime = w.noExitRuntime || true;
        "object" != typeof WebAssembly && K("no native wasm support detected");
        var d, L, ra, M = false, N, l, ba, ca, da, fa;
        function m() {
          var a = d.buffer;
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
          d = w.wasmMemory;
        else if (w.wasmMemory)
          d = w.wasmMemory;
        else if (d = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(d.buffer instanceof SharedArrayBuffer))
          throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        m();
        O = d.buffer.byteLength;
        var sa, ta = [], ua = [], va = [], wa = 0;
        function P() {
          return noExitRuntime || 0 < wa;
        }
        var Q = 0, xa = null, R = null;
        function ya() {
          Q++;
          w.monitorRunDependencies && w.monitorRunDependencies(Q);
        }
        function za() {
          Q--;
          w.monitorRunDependencies && w.monitorRunDependencies(Q);
          if (0 == Q && (null !== xa && (clearInterval(xa), xa = null), R)) {
            var a = R;
            R = null;
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
        function Aa(a) {
          return a.startsWith("data:application/octet-stream;base64,");
        }
        var S;
        S = "ort-wasm-threaded.wasm";
        Aa(S) || (S = la(S));
        function Ba(a) {
          if (a == S && J)
            return new Uint8Array(J);
          if (H)
            return H(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ca(a) {
          if (!J && (ka || A)) {
            if ("function" == typeof fetch && !a.startsWith("file://"))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => Ba(a));
            if (F)
              return new Promise((b, c) => {
                F(a, (e) => b(new Uint8Array(e)), c);
              });
          }
          return Promise.resolve().then(() => Ba(a));
        }
        function Da(a, b, c) {
          return Ca(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {
            I("failed to asynchronously prepare wasm: " + e);
            K(e);
          });
        }
        function Ea(a, b) {
          var c = S;
          return J || "function" != typeof WebAssembly.instantiateStreaming || Aa(c) || c.startsWith("file://") || B || "function" != typeof fetch ? Da(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(h) {
            I("wasm streaming compile failed: " + h);
            I("falling back to ArrayBuffer instantiation");
            return Da(c, a, b);
          }));
        }
        var T;
        function U(a) {
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
          (a = V.La[a]) || K();
          V.lb(a);
        }
        function Ha(a) {
          var b = V.fb();
          if (!b)
            return 6;
          V.Oa.push(b);
          V.La[a.Na] = b;
          b.Na = a.Na;
          var c = { cmd: "run", start_routine: a.mb, arg: a.eb, pthread_ptr: a.Na };
          B && b.unref();
          b.postMessage(c, a.sb);
          return 0;
        }
        var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {
          b >>>= 0;
          var e = b + c;
          for (c = b; a[c] && !(c >= e); )
            ++c;
          if (16 < c - b && a.buffer && Ia)
            return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (e = ""; b < c; ) {
            var h = a[b++];
            if (h & 128) {
              var g = a[b++] & 63;
              if (192 == (h & 224))
                e += String.fromCharCode((h & 31) << 6 | g);
              else {
                var k = a[b++] & 63;
                h = 224 == (h & 240) ? (h & 15) << 12 | g << 6 | k : (h & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;
                65536 > h ? e += String.fromCharCode(h) : (h -= 65536, e += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));
              }
            } else
              e += String.fromCharCode(h);
          }
          return e;
        }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";
        function La(a) {
          if (D)
            return W(1, 1, a);
          N = a;
          if (!P()) {
            V.nb();
            if (w.onExit)
              w.onExit(a);
            M = true;
          }
          z(a, new U(a));
        }
        var Na = (a) => {
          N = a;
          if (D)
            throw Ma(a), "unwind";
          La(a);
        }, V = {
          Ra: [],
          Oa: [],
          Za: [],
          La: {},
          Va: function() {
            D ? V.hb() : V.gb();
          },
          gb: function() {
            ta.unshift(() => {
              ya();
              V.ib(() => za());
            });
          },
          hb: function() {
            V.receiveObjectTransfer = V.kb;
            V.threadInitTLS = V.Ya;
            V.setExitStatus = V.Xa;
            noExitRuntime = false;
          },
          Xa: function(a) {
            N = a;
          },
          xb: ["$terminateWorker"],
          nb: function() {
            for (var a of V.Oa)
              Fa(a);
            for (a of V.Ra)
              Fa(a);
            V.Ra = [];
            V.Oa = [];
            V.La = [];
          },
          lb: function(a) {
            var b = a.Na;
            delete V.La[b];
            V.Ra.push(a);
            V.Oa.splice(V.Oa.indexOf(a), 1);
            a.Na = 0;
            Oa(b);
          },
          kb: function() {
          },
          Ya: function() {
            V.Za.forEach((a) => a());
          },
          jb: (a) => new Promise((b) => {
            a.onmessage = (g) => {
              g = g.data;
              var k = g.cmd;
              if (g.targetThread && g.targetThread != X()) {
                var t = V.La[g.wb];
                t ? t.postMessage(g, g.transferList) : I('Internal error! Worker sent a message "' + k + '" to target pthread ' + g.targetThread + ", but that thread no longer exists!");
              } else if ("checkMailbox" === k)
                Y();
              else if ("spawnThread" === k)
                Ha(g);
              else if ("cleanupThread" === k)
                Ga(g.thread);
              else if ("killThread" === k)
                g = g.thread, k = V.La[g], delete V.La[g], Fa(k), Oa(g), V.Oa.splice(
                  V.Oa.indexOf(k),
                  1
                ), k.Na = 0;
              else if ("cancelThread" === k)
                V.La[g.thread].postMessage({ cmd: "cancel" });
              else if ("loaded" === k)
                a.loaded = true, b(a);
              else if ("alert" === k)
                alert("Thread " + g.threadId + ": " + g.text);
              else if ("setimmediate" === g.target)
                a.postMessage(g);
              else if ("callHandler" === k)
                w[g.handler](...g.args);
              else
                k && I("worker sent an unknown command " + k);
            };
            a.onerror = (g) => {
              I("worker sent an error! " + g.filename + ":" + g.lineno + ": " + g.message);
              throw g;
            };
            B && (a.on("message", function(g) {
              a.onmessage({ data: g });
            }), a.on("error", function(g) {
              a.onerror(g);
            }));
            var c = [], e = ["onExit", "onAbort", "print", "printErr"], h;
            for (h of e)
              w.hasOwnProperty(h) && c.push(h);
            a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: d, wasmModule: ra });
          }),
          ib: function(a) {
            a();
          },
          cb: function() {
            var a = la("ort-wasm-threaded.worker.js");
            a = new Worker(a);
            V.Ra.push(a);
          },
          fb: function() {
            0 == V.Ra.length && (V.cb(), V.jb(V.Ra[0]));
            return V.Ra.pop();
          }
        };
        w.PThread = V;
        var Pa = (a) => {
          for (; 0 < a.length; )
            a.shift()(w);
        };
        w.establishStackSpace = function() {
          var a = X(), b = p()[a + 52 >> 2 >>> 0];
          a = p()[a + 56 >> 2 >>> 0];
          Qa(b, b - a);
          Ra(b);
        };
        function Ma(a) {
          if (D)
            return W(2, 0, a);
          Na(a);
        }
        var Sa = [];
        w.invokeEntryPoint = function(a, b) {
          var c = Sa[a];
          c || (a >= Sa.length && (Sa.length = a + 1), Sa[a] = c = sa.get(a));
          a = c(b);
          P() ? V.Xa(a) : Ta(a);
        };
        function Ua(a) {
          this.Ua = a - 24;
          this.bb = function(b) {
            r()[this.Ua + 4 >> 2 >>> 0] = b;
          };
          this.ab = function(b) {
            r()[this.Ua + 8 >> 2 >>> 0] = b;
          };
          this.Va = function(b, c) {
            this.$a();
            this.bb(b);
            this.ab(c);
          };
          this.$a = function() {
            r()[this.Ua + 16 >> 2 >>> 0] = 0;
          };
        }
        var Va = 0, Wa = 0;
        function Xa(a, b, c, e) {
          return D ? W(3, 1, a, b, c, e) : Ya(a, b, c, e);
        }
        function Ya(a, b, c, e) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var h = [];
          if (D && 0 === h.length)
            return Xa(a, b, c, e);
          a = { mb: c, Na: a, eb: e, sb: h };
          return D ? (a.ub = "spawnThread", postMessage(a, h), 0) : Ha(a);
        }
        function Za(a, b, c) {
          return D ? W(4, 1, a, b, c) : 0;
        }
        function $a(a, b) {
          if (D)
            return W(5, 1, a, b);
        }
        var ab = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var e = a.charCodeAt(c);
            127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, bb = (a, b, c, e) => {
          c >>>= 0;
          if (!(0 < e))
            return 0;
          var h = c;
          e = c + e - 1;
          for (var g = 0; g < a.length; ++g) {
            var k = a.charCodeAt(g);
            if (55296 <= k && 57343 >= k) {
              var t = a.charCodeAt(++g);
              k = 65536 + ((k & 1023) << 10) | t & 1023;
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
          return c - h;
        }, cb = (a, b, c) => bb(a, n(), b, c);
        function db(a, b) {
          if (D)
            return W(6, 1, a, b);
        }
        function eb(a, b, c) {
          if (D)
            return W(7, 1, a, b, c);
        }
        function fb(a, b, c) {
          return D ? W(8, 1, a, b, c) : 0;
        }
        function gb(a, b) {
          if (D)
            return W(9, 1, a, b);
        }
        function hb(a, b, c) {
          if (D)
            return W(10, 1, a, b, c);
        }
        function ib(a, b, c, e) {
          if (D)
            return W(11, 1, a, b, c, e);
        }
        function jb(a, b, c, e) {
          if (D)
            return W(12, 1, a, b, c, e);
        }
        function kb(a, b, c, e) {
          if (D)
            return W(13, 1, a, b, c, e);
        }
        function lb(a) {
          if (D)
            return W(14, 1, a);
        }
        function mb(a, b) {
          if (D)
            return W(15, 1, a, b);
        }
        function nb(a, b, c) {
          if (D)
            return W(16, 1, a, b, c);
        }
        var ob = (a) => {
          if (!M)
            try {
              if (a(), !P())
                try {
                  D ? Ta(N) : Na(N);
                } catch (b) {
                  b instanceof U || "unwind" == b || z(1, b);
                }
            } catch (b) {
              b instanceof U || "unwind" == b || z(1, b);
            }
        };
        function pb(a) {
          a >>>= 0;
          "function" === typeof Atomics.tb && (Atomics.tb(p(), a >> 2, a).value.then(Y), a += 128, Atomics.store(p(), a >> 2, 1));
        }
        w.__emscripten_thread_mailbox_await = pb;
        function Y() {
          var a = X();
          a && (pb(a), ob(() => qb()));
        }
        w.checkMailbox = Y;
        var Z = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), rb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], sb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function tb(a, b, c, e, h, g, k, t) {
          return D ? W(17, 1, a, b, c, e, h, g, k, t) : -52;
        }
        function ub(a, b, c, e, h, g, k) {
          if (D)
            return W(18, 1, a, b, c, e, h, g, k);
        }
        var wb = (a) => {
          var b = ab(a) + 1, c = vb(b);
          c && cb(a, c, b);
          return c;
        }, yb = (a) => {
          var b = xb();
          a = a();
          Ra(b);
          return a;
        };
        function W(a, b) {
          var c = arguments.length - 2, e = arguments;
          return yb(() => {
            for (var h = zb(8 * c), g = h >> 3, k = 0; k < c; k++) {
              var t = e[2 + k];
              ea()[g + k >>> 0] = t;
            }
            return Ab(a, c, h, b);
          });
        }
        var Bb = [], Cb = {}, Eb = () => {
          if (!Db) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;
            for (b in Cb)
              void 0 === Cb[b] ? delete a[b] : a[b] = Cb[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Db = c;
          }
          return Db;
        }, Db;
        function Fb(a, b) {
          if (D)
            return W(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Eb().forEach(function(e, h) {
            var g = b + c;
            h = r()[a + 4 * h >> 2 >>> 0] = g;
            for (g = 0; g < e.length; ++g)
              aa()[h++ >> 0 >>> 0] = e.charCodeAt(g);
            aa()[h >> 0 >>> 0] = 0;
            c += e.length + 1;
          });
          return 0;
        }
        function Gb(a, b) {
          if (D)
            return W(20, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = Eb();
          r()[a >> 2 >>> 0] = c.length;
          var e = 0;
          c.forEach(function(h) {
            e += h.length + 1;
          });
          r()[b >> 2 >>> 0] = e;
          return 0;
        }
        function Hb(a) {
          return D ? W(21, 1, a) : 52;
        }
        function Lb(a, b, c, e) {
          return D ? W(22, 1, a, b, c, e) : 52;
        }
        function Mb(a, b, c, e, h) {
          return D ? W(23, 1, a, b, c, e, h) : 70;
        }
        var Nb = [null, [], []];
        function Ob(a, b, c, e) {
          if (D)
            return W(24, 1, a, b, c, e);
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          for (var h = 0, g = 0; g < c; g++) {
            var k = r()[b >> 2 >>> 0], t = r()[b + 4 >> 2 >>> 0];
            b += 8;
            for (var C = 0; C < t; C++) {
              var v = n()[k + C >>> 0], y = Nb[a];
              0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);
            }
            h += t;
          }
          r()[e >> 2 >>> 0] = h;
          return 0;
        }
        var Pb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Qb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Rb(a) {
          var b = Array(ab(a) + 1);
          bb(a, b, 0, b.length);
          return b;
        }
        var Sb = (a, b) => {
          aa().set(a, b >>> 0);
        };
        function Tb(a, b, c, e) {
          function h(f, q, u) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )
              f = u[0] + f;
            return f;
          }
          function g(f, q) {
            return h(f, q, "0");
          }
          function k(f, q) {
            function u(Ib) {
              return 0 > Ib ? -1 : 0 < Ib ? 1 : 0;
            }
            var G;
            0 === (G = u(f.getFullYear() - q.getFullYear())) && 0 === (G = u(f.getMonth() - q.getMonth())) && (G = u(f.getDate() - q.getDate()));
            return G;
          }
          function t(f) {
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
          function C(f) {
            var q = f.Pa;
            for (f = new Date(new Date(f.Qa + 1900, 0, 1).getTime()); 0 < q; ) {
              var u = f.getMonth(), G = (Z(f.getFullYear()) ? Pb : Qb)[u];
              if (q > G - f.getDate())
                q -= G - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + q);
                break;
              }
            }
            u = new Date(f.getFullYear() + 1, 0, 4);
            q = t(new Date(
              f.getFullYear(),
              0,
              4
            ));
            u = t(u);
            return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          e >>>= 0;
          var v = p()[e + 40 >> 2 >>> 0];
          e = { qb: p()[e >> 2 >>> 0], pb: p()[e + 4 >> 2 >>> 0], Sa: p()[e + 8 >> 2 >>> 0], Wa: p()[e + 12 >> 2 >>> 0], Ta: p()[e + 16 >> 2 >>> 0], Qa: p()[e + 20 >> 2 >>> 0], Ma: p()[e + 24 >> 2 >>> 0], Pa: p()[e + 28 >> 2 >>> 0], yb: p()[e + 32 >> 2 >>> 0], ob: p()[e + 36 >> 2 >>> 0], rb: v ? Ka(v) : "" };
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
          var Jb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Kb = "January February March April May June July August September October November December".split(" ");
          v = {
            "%a": (f) => Jb[f.Ma].substring(0, 3),
            "%A": (f) => Jb[f.Ma],
            "%b": (f) => Kb[f.Ta].substring(0, 3),
            "%B": (f) => Kb[f.Ta],
            "%C": (f) => g((f.Qa + 1900) / 100 | 0, 2),
            "%d": (f) => g(f.Wa, 2),
            "%e": (f) => h(f.Wa, 2, " "),
            "%g": (f) => C(f).toString().substring(2),
            "%G": (f) => C(f),
            "%H": (f) => g(f.Sa, 2),
            "%I": (f) => {
              f = f.Sa;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return g(f, 2);
            },
            "%j": (f) => {
              for (var q = 0, u = 0; u <= f.Ta - 1; q += (Z(f.Qa + 1900) ? Pb : Qb)[u++])
                ;
              return g(f.Wa + q, 3);
            },
            "%m": (f) => g(f.Ta + 1, 2),
            "%M": (f) => g(f.pb, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Sa && 12 > f.Sa ? "AM" : "PM",
            "%S": (f) => g(f.qb, 2),
            "%t": () => "	",
            "%u": (f) => f.Ma || 7,
            "%U": (f) => g(Math.floor((f.Pa + 7 - f.Ma) / 7), 2),
            "%V": (f) => {
              var q = Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7);
              2 >= (f.Ma + 371 - f.Pa - 2) % 7 && q++;
              if (q)
                53 == q && (u = (f.Ma + 371 - f.Pa) % 7, 4 == u || 3 == u && Z(f.Qa) || (q = 1));
              else {
                q = 52;
                var u = (f.Ma + 7 - f.Pa - 1) % 7;
                (4 == u || 5 == u && Z(f.Qa % 400 - 1)) && q++;
              }
              return g(q, 2);
            },
            "%w": (f) => f.Ma,
            "%W": (f) => g(Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7), 2),
            "%y": (f) => (f.Qa + 1900).toString().substring(2),
            "%Y": (f) => f.Qa + 1900,
            "%z": (f) => {
              f = f.ob;
              var q = 0 <= f;
              f = Math.abs(f) / 60;
              return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.rb,
            "%%": () => "%"
          };
          c = c.replace(
            /%%/g,
            "\0\0"
          );
          for (y in v)
            c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](e)));
          c = c.replace(/\0\0/g, "%");
          y = Rb(c);
          if (y.length > b)
            return 0;
          Sb(y, a);
          return y.length - 1;
        }
        V.Va();
        var Ub = [null, La, Ma, Xa, Za, $a, db, eb, fb, gb, hb, ib, jb, kb, lb, mb, nb, tb, ub, Fb, Gb, Hb, Lb, Mb, Ob], Xb = {
          b: function(a, b, c) {
            a >>>= 0;
            new Ua(a).Va(b >>> 0, c >>> 0);
            Va = a;
            Wa++;
            throw Va;
          },
          N: function(a) {
            Vb(a >>> 0, !A, 1, !ka, 131072, false);
            V.Ya();
          },
          j: function(a) {
            a >>>= 0;
            D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);
          },
          I: Ya,
          h: Za,
          T: $a,
          D: db,
          F: eb,
          U: fb,
          R: gb,
          J: hb,
          Q: ib,
          n: jb,
          E: kb,
          B: lb,
          S: mb,
          C: nb,
          q: () => true,
          z: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(() => Y()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.La[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          L: function() {
            return -1;
          },
          M: pb,
          p: function(a) {
            B && V.La[a >>> 0].ref();
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
            b = (Z(a.getFullYear()) ? rb : sb)[a.getMonth()] + a.getDate() - 1 | 0;
            p()[c + 28 >> 2 >>> 0] = b;
            p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
            p()[c + 32 >> 2 >>> 0] = a;
          },
          v: function(a) {
            a >>>= 0;
            var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), h = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(g, h);
            0 > c ? p()[a + 32 >> 2 >>> 0] = Number(h != g && k == e) : 0 < c != (k == e) && (h = Math.max(g, h), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : h) - e)));
            p()[a + 24 >> 2 >>> 0] = b.getDay();
            c = (Z(b.getFullYear()) ? rb : sb)[b.getMonth()] + b.getDate() - 1 | 0;
            p()[a + 28 >> 2 >>> 0] = c;
            p()[a >> 2 >>> 0] = b.getSeconds();
            p()[a + 4 >> 2 >>> 0] = b.getMinutes();
            p()[a + 8 >> 2 >>> 0] = b.getHours();
            p()[a + 12 >> 2 >>> 0] = b.getDate();
            p()[a + 16 >> 2 >>> 0] = b.getMonth();
            p()[a + 20 >> 2 >>> 0] = b.getYear();
            a = b.getTime() / 1e3;
            return Wb((T = a, 1 <= +Math.abs(T) ? 0 < T ? +Math.floor(T / 4294967296) >>> 0 : ~~+Math.ceil((T - +(~~T >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;
          },
          r: tb,
          s: ub,
          y: function(a, b, c) {
            function e(v) {
              return (v = v.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? v[1] : "GMT";
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            var h = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(h, 0, 1), k = new Date(h, 6, 1);
            h = g.getTimezoneOffset();
            var t = k.getTimezoneOffset(), C = Math.max(h, t);
            r()[a >> 2 >>> 0] = 60 * C;
            p()[b >> 2 >>> 0] = Number(h != t);
            a = e(g);
            b = e(k);
            a = wb(a);
            b = wb(b);
            t < h ? (r()[c >> 2 >>> 0] = a, r()[c + 4 >> 2 >>> 0] = b) : (r()[c >> 2 >>> 0] = b, r()[c + 4 >> 2 >>> 0] = a);
          },
          c: () => {
            K("");
          },
          k: function() {
          },
          i: function() {
            return Date.now();
          },
          o: () => {
            wa += 1;
            throw "unwind";
          },
          A: function() {
            return 4294901760;
          },
          e: () => performance.timeOrigin + performance.now(),
          f: function() {
            return B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;
          },
          K: function(a, b, c, e) {
            V.vb = b >>> 0;
            Bb.length = c;
            b = e >>> 0 >> 3;
            for (e = 0; e < c; e++)
              Bb[e] = ea()[b + e >>> 0];
            return Ub[a].apply(null, Bb);
          },
          x: function(a) {
            a >>>= 0;
            var b = n().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var e = b * (1 + 0.2 / c);
              e = Math.min(e, a + 100663296);
              var h = Math;
              e = Math.max(a, e);
              a: {
                h = h.min.call(h, 4294901760, e + (65536 - e % 65536) % 65536) - d.buffer.byteLength + 65535 >>> 16;
                try {
                  d.grow(h);
                  m();
                  var g = 1;
                  break a;
                } catch (k) {
                }
                g = void 0;
              }
              if (g)
                return true;
            }
            return false;
          },
          O: Fb,
          P: Gb,
          H: Na,
          g: Hb,
          m: Lb,
          w: Mb,
          l: Ob,
          a: d || w.wasmMemory,
          G: Tb,
          d: function(a, b, c, e) {
            return Tb(a >>> 0, b >>> 0, c >>> 0, e >>> 0);
          }
        };
        (function() {
          function a(c, e) {
            c = c.exports;
            L = c = Yb(c);
            V.Za.push(L.ya);
            sa = L.za;
            ua.unshift(L.V);
            ra = e;
            za();
            return c;
          }
          var b = { a: Xb };
          ya();
          if (w.instantiateWasm)
            try {
              return w.instantiateWasm(b, a);
            } catch (c) {
              I("Module.instantiateWasm callback failed with error: " + c), x(c);
            }
          Ea(b, function(c) {
            a(c.instance, c.module);
          }).catch(x);
          return {};
        })();
        w._OrtInit = (a, b) => (w._OrtInit = L.W)(a, b);
        w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.X)(a, b);
        w._OrtCreateSessionOptions = (a, b, c, e, h, g, k, t, C, v) => (w._OrtCreateSessionOptions = L.Y)(a, b, c, e, h, g, k, t, C, v);
        w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L.Z)(a, b);
        w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L._)(a, b, c);
        w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.$)(a, b, c);
        w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.aa)(a);
        w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ba)(a, b, c);
        w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.ca)(a);
        w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.da)(a, b, c);
        w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.ea)(a, b);
        w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.fa)(a, b);
        w._OrtFree = (a) => (w._OrtFree = L.ga)(a);
        w._OrtCreateTensor = (a, b, c, e, h, g) => (w._OrtCreateTensor = L.ha)(a, b, c, e, h, g);
        w._OrtGetTensorData = (a, b, c, e, h) => (w._OrtGetTensorData = L.ia)(a, b, c, e, h);
        w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ja)(a);
        w._OrtCreateRunOptions = (a, b, c, e) => (w._OrtCreateRunOptions = L.ka)(a, b, c, e);
        w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.la)(a, b, c);
        w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.ma)(a);
        w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.na)(a);
        w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.oa)(a, b, c);
        w._OrtBindOutput = (a, b, c, e) => (w._OrtBindOutput = L.pa)(a, b, c, e);
        w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.qa)(a);
        w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.ra)(a);
        w._OrtRunWithBinding = (a, b, c, e, h) => (w._OrtRunWithBinding = L.sa)(a, b, c, e, h);
        w._OrtRun = (a, b, c, e, h, g, k, t) => (w._OrtRun = L.ta)(a, b, c, e, h, g, k, t);
        w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.ua)(a);
        var X = w._pthread_self = () => (X = w._pthread_self = L.va)(), vb = w._malloc = (a) => (vb = w._malloc = L.wa)(a);
        w._free = (a) => (w._free = L.xa)(a);
        w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.ya)();
        var Vb = w.__emscripten_thread_init = (a, b, c, e, h, g) => (Vb = w.__emscripten_thread_init = L.Aa)(a, b, c, e, h, g);
        w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ba)();
        var Ab = (a, b, c, e) => (Ab = L.Ca)(a, b, c, e), Oa = (a) => (Oa = L.Da)(a), Ta = w.__emscripten_thread_exit = (a) => (Ta = w.__emscripten_thread_exit = L.Ea)(a), qb = w.__emscripten_check_mailbox = () => (qb = w.__emscripten_check_mailbox = L.Fa)(), Wb = (a) => (Wb = L.Ga)(a), Qa = (a, b) => (Qa = L.Ha)(a, b), xb = () => (xb = L.Ia)(), Ra = (a) => (Ra = L.Ja)(a), zb = (a) => (zb = L.Ka)(a);
        function Yb(a) {
          a = Object.assign({}, a);
          var b = (e) => () => e() >>> 0, c = (e) => (h) => e(h) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.pthread_self = b(a.pthread_self);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        w.keepRuntimeAlive = P;
        w.wasmMemory = d;
        w.stackAlloc = zb;
        w.stackSave = xb;
        w.stackRestore = Ra;
        w.UTF8ToString = Ka;
        w.stringToUTF8 = cb;
        w.lengthBytesUTF8 = ab;
        w.ExitStatus = U;
        w.PThread = V;
        var Zb;
        R = function $b() {
          Zb || ac();
          Zb || (R = $b);
        };
        function ac() {
          function a() {
            if (!Zb && (Zb = true, w.calledRun = true, !M)) {
              D || Pa(ua);
              ha(w);
              if (w.onRuntimeInitialized)
                w.onRuntimeInitialized();
              if (!D) {
                if (w.postRun)
                  for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {
                    var b = w.postRun.shift();
                    va.unshift(b);
                  }
                Pa(va);
              }
            }
          }
          if (!(0 < Q))
            if (D)
              ha(w), D || Pa(ua), startWorker(w);
            else {
              if (w.preRun)
                for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )
                  ta.unshift(w.preRun.shift());
              Pa(ta);
              0 < Q || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {
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
        ac();
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
    module2.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    readFile: () => readFile\n  });\n  var readFile;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var d = moduleArg, k, l;\n          d.ready = new Promise((a, b) => {\n            k = a;\n            l = b;\n          });\n          var r = Object.assign({}, d), v = "./this.program", aa = "object" == typeof window, x = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, y = "", A, B, C;\n          if (ba) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));\n            y = x ? D.dirname(y) + "/" : __dirname + "/";\n            A = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            C = (a) => {\n              a = A(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            B = (a, b, c, e = true) => {\n              a = a.startsWith("file://") ? new URL(a) : D.normalize(a);\n              fs.readFile(a, e ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(e ? h.buffer : h);\n              });\n            };\n            !d.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            d.inspect = () => "[Emscripten Module object]";\n          } else if (aa || x)\n            x ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), _scriptDir && (y = _scriptDir), 0 !== y.indexOf("blob:") ? y = y.substr(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1) : y = "", A = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, x && (C = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), B = (a, b, c) => {\n              var e = new XMLHttpRequest();\n              e.open("GET", a, true);\n              e.responseType = "arraybuffer";\n              e.onload = () => {\n                200 == e.status || 0 == e.status && e.response ? b(e.response) : c();\n              };\n              e.onerror = c;\n              e.send(null);\n            };\n          var ca = d.print || console.log.bind(console), E = d.printErr || console.error.bind(console);\n          Object.assign(d, r);\n          r = null;\n          d.thisProgram && (v = d.thisProgram);\n          var F;\n          d.wasmBinary && (F = d.wasmBinary);\n          var noExitRuntime = d.noExitRuntime || true;\n          "object" != typeof WebAssembly && G("no native wasm support detected");\n          var H, I, da = false, J, K, L, M;\n          function ea() {\n            var a = H.buffer;\n            d.HEAP8 = J = new Int8Array(a);\n            d.HEAP16 = new Int16Array(a);\n            d.HEAP32 = L = new Int32Array(a);\n            d.HEAPU8 = K = new Uint8Array(a);\n            d.HEAPU16 = new Uint16Array(a);\n            d.HEAPU32 = M = new Uint32Array(a);\n            d.HEAPF32 = new Float32Array(a);\n            d.HEAPF64 = new Float64Array(a);\n          }\n          var fa = [], ha = [], ia = [];\n          function ja() {\n            var a = d.preRun.shift();\n            fa.unshift(a);\n          }\n          var N = 0, O = null, P = null;\n          function G(a) {\n            if (d.onAbort)\n              d.onAbort(a);\n            a = "Aborted(" + a + ")";\n            E(a);\n            da = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          function ka(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var Q;\n          Q = "ort-training-wasm-simd.wasm";\n          if (!ka(Q)) {\n            var la = Q;\n            Q = d.locateFile ? d.locateFile(la, y) : y + la;\n          }\n          function ma(a) {\n            if (a == Q && F)\n              return new Uint8Array(F);\n            if (C)\n              return C(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function na(a) {\n            if (!F && (aa || x)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => ma(a));\n              if (B)\n                return new Promise((b, c) => {\n                  B(a, (e) => b(new Uint8Array(e)), c);\n                });\n            }\n            return Promise.resolve().then(() => ma(a));\n          }\n          function oa(a, b, c) {\n            return na(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {\n              E("failed to asynchronously prepare wasm: " + e);\n              G(e);\n            });\n          }\n          function pa(a, b) {\n            var c = Q;\n            return F || "function" != typeof WebAssembly.instantiateStreaming || ka(c) || c.startsWith("file://") || ba || "function" != typeof fetch ? oa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(g) {\n              E("wasm streaming compile failed: " + g);\n              E("falling back to ArrayBuffer instantiation");\n              return oa(c, a, b);\n            }));\n          }\n          var R, S = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(d);\n          };\n          function qa(a) {\n            this.Ja = a - 24;\n            this.Na = function(b) {\n              M[this.Ja + 4 >> 2 >>> 0] = b;\n            };\n            this.Ma = function(b) {\n              M[this.Ja + 8 >> 2 >>> 0] = b;\n            };\n            this.Ka = function(b, c) {\n              this.La();\n              this.Na(b);\n              this.Ma(c);\n            };\n            this.La = function() {\n              M[this.Ja + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {\n            b >>>= 0;\n            var e = b + c;\n            for (c = b; a[c] && !(c >= e); )\n              ++c;\n            if (16 < c - b && a.buffer && ta)\n              return ta.decode(a.subarray(b, c));\n            for (e = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  e += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var m = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;\n                  65536 > g ? e += String.fromCharCode(g) : (g -= 65536, e += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                e += String.fromCharCode(g);\n            }\n            return e;\n          }, T = (a, b) => (a >>>= 0) ? ua(K, a, b) : "", U = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var e = a.charCodeAt(c);\n              127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, V = (a, b, c, e) => {\n            c >>>= 0;\n            if (!(0 < e))\n              return 0;\n            var g = c;\n            e = c + e - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var m = a.charCodeAt(h);\n              if (55296 <= m && 57343 >= m) {\n                var q = a.charCodeAt(++h);\n                m = 65536 + ((m & 1023) << 10) | q & 1023;\n              }\n              if (127 >= m) {\n                if (c >= e)\n                  break;\n                b[c++ >>> 0] = m;\n              } else {\n                if (2047 >= m) {\n                  if (c + 1 >= e)\n                    break;\n                  b[c++ >>> 0] = 192 | m >> 6;\n                } else {\n                  if (65535 >= m) {\n                    if (c + 2 >= e)\n                      break;\n                    b[c++ >>> 0] = 224 | m >> 12;\n                  } else {\n                    if (c + 3 >= e)\n                      break;\n                    b[c++ >>> 0] = 240 | m >> 18;\n                    b[c++ >>> 0] = 128 | m >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | m >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | m & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, W = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), va = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ba = (a) => {\n            var b = U(a) + 1, c = Aa(b);\n            c && V(a, K, c, b);\n            return c;\n          }, X = {}, Ca = () => {\n            if (!Y) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: v || "./this.program" }, b;\n              for (b in X)\n                void 0 === X[b] ? delete a[b] : a[b] = X[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Y = c;\n            }\n            return Y;\n          }, Y, Da = [null, [], []], Ea = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Fa = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ga(a) {\n            var b = Array(U(a) + 1);\n            V(a, b, 0, b.length);\n            return b;\n          }\n          function Ha(a, b, c, e) {\n            function g(f, n, p) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = p[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function m(f, n) {\n              function p(xa) {\n                return 0 > xa ? -1 : 0 < xa ? 1 : 0;\n              }\n              var z;\n              0 === (z = p(f.getFullYear() - n.getFullYear())) && 0 === (z = p(f.getMonth() - n.getMonth())) && (z = p(f.getDate() - n.getDate()));\n              return z;\n            }\n            function q(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function w(f) {\n              var n = f.Ea;\n              for (f = new Date(new Date(f.Fa + 1900, 0, 1).getTime()); 0 < n; ) {\n                var p = f.getMonth(), z = (W(f.getFullYear()) ? Ea : Fa)[p];\n                if (n > z - f.getDate())\n                  n -= z - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              p = new Date(f.getFullYear() + 1, 0, 4);\n              n = q(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              p = q(p);\n              return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            var t = L[e + 40 >> 2 >>> 0];\n            e = { Qa: L[e >> 2 >>> 0], Pa: L[e + 4 >> 2 >>> 0], Ga: L[e + 8 >> 2 >>> 0], Ia: L[e + 12 >> 2 >>> 0], Ha: L[e + 16 >> 2 >>> 0], Fa: L[e + 20 >> 2 >>> 0], za: L[e + 24 >> 2 >>> 0], Ea: L[e + 28 >> 2 >>> 0], Sa: L[e + 32 >> 2 >>> 0], Oa: L[e + 36 >> 2 >>> 0], Ra: t ? T(t) : "" };\n            c = T(c);\n            t = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var u in t)\n              c = c.replace(new RegExp(u, "g"), t[u]);\n            var ya = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), za = "January February March April May June July August September October November December".split(" ");\n            t = { "%a": (f) => ya[f.za].substring(0, 3), "%A": (f) => ya[f.za], "%b": (f) => za[f.Ha].substring(0, 3), "%B": (f) => za[f.Ha], "%C": (f) => h((f.Fa + 1900) / 100 | 0, 2), "%d": (f) => h(f.Ia, 2), "%e": (f) => g(f.Ia, 2, " "), "%g": (f) => w(f).toString().substring(2), "%G": (f) => w(f), "%H": (f) => h(f.Ga, 2), "%I": (f) => {\n              f = f.Ga;\n              0 == f ? f = 12 : 12 < f && (f -= 12);\n              return h(f, 2);\n            }, "%j": (f) => {\n              for (var n = 0, p = 0; p <= f.Ha - 1; n += (W(f.Fa + 1900) ? Ea : Fa)[p++])\n                ;\n              return h(f.Ia + n, 3);\n            }, "%m": (f) => h(f.Ha + 1, 2), "%M": (f) => h(f.Pa, 2), "%n": () => "\\n", "%p": (f) => 0 <= f.Ga && 12 > f.Ga ? "AM" : "PM", "%S": (f) => h(f.Qa, 2), "%t": () => "	", "%u": (f) => f.za || 7, "%U": (f) => h(Math.floor((f.Ea + 7 - f.za) / 7), 2), "%V": (f) => {\n              var n = Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7);\n              2 >= (f.za + 371 - f.Ea - 2) % 7 && n++;\n              if (n)\n                53 == n && (p = (f.za + 371 - f.Ea) % 7, 4 == p || 3 == p && W(f.Fa) || (n = 1));\n              else {\n                n = 52;\n                var p = (f.za + 7 - f.Ea - 1) % 7;\n                (4 == p || 5 == p && W(f.Fa % 400 - 1)) && n++;\n              }\n              return h(n, 2);\n            }, "%w": (f) => f.za, "%W": (f) => h(Math.floor((f.Ea + 7 - (f.za + 6) % 7) / 7), 2), "%y": (f) => (f.Fa + 1900).toString().substring(2), "%Y": (f) => f.Fa + 1900, "%z": (f) => {\n              f = f.Oa;\n              var n = 0 <= f;\n              f = Math.abs(f) / 60;\n              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n            }, "%Z": (f) => f.Ra, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (u in t)\n              c.includes(u) && (c = c.replace(new RegExp(u, "g"), t[u](e)));\n            c = c.replace(/\\0\\0/g, "%");\n            u = Ga(c);\n            if (u.length > b)\n              return 0;\n            J.set(u, a >>> 0);\n            return u.length - 1;\n          }\n          var Ja = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new qa(a).Ka(b >>> 0, c >>> 0);\n              ra = a;\n              sa++;\n              throw ra;\n            },\n            e: function() {\n              return 0;\n            },\n            H: function() {\n            },\n            x: function() {\n            },\n            z: function() {\n            },\n            k: function() {\n              return 0;\n            },\n            F: function() {\n            },\n            B: function() {\n            },\n            E: function() {\n            },\n            g: function() {\n            },\n            y: function() {\n            },\n            v: function() {\n            },\n            G: function() {\n            },\n            w: function() {\n            },\n            l: () => true,\n            o: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getUTCSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              L[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              L[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              L[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              L[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            p: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              L[c >> 2 >>> 0] = a.getSeconds();\n              L[c + 4 >> 2 >>> 0] = a.getMinutes();\n              L[c + 8 >> 2 >>> 0] = a.getHours();\n              L[c + 12 >> 2 >>> 0] = a.getDate();\n              L[c + 16 >> 2 >>> 0] = a.getMonth();\n              L[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              L[c + 24 >> 2 >>> 0] = a.getDay();\n              L[c + 28 >> 2 >>> 0] = (W(a.getFullYear()) ? va : wa)[a.getMonth()] + a.getDate() - 1 | 0;\n              L[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              L[c + 32 >> 2 >>> 0] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;\n            },\n            q: function(a) {\n              a >>>= 0;\n              var b = new Date(L[a + 20 >> 2 >>> 0] + 1900, L[a + 16 >> 2 >>> 0], L[a + 12 >> 2 >>> 0], L[a + 8 >> 2 >>> 0], L[a + 4 >> 2 >>> 0], L[a >> 2 >>> 0], 0), c = L[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);\n              0 > c ? L[a + 32 >> 2 >>> 0] = Number(g != h && m == e) : 0 < c != (m == e) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - e)));\n              L[a + 24 >> 2 >>> 0] = b.getDay();\n              L[a + 28 >> 2 >>> 0] = (W(b.getFullYear()) ? va : wa)[b.getMonth()] + b.getDate() - 1 | 0;\n              L[a >> 2 >>> 0] = b.getSeconds();\n              L[a + 4 >> 2 >>> 0] = b.getMinutes();\n              L[a + 8 >> 2 >>> 0] = b.getHours();\n              L[a + 12 >> 2 >>> 0] = b.getDate();\n              L[a + 16 >> 2 >>> 0] = b.getMonth();\n              L[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Ia((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            m: function() {\n              return -52;\n            },\n            n: function() {\n            },\n            t: function(a, b, c) {\n              function e(w) {\n                return (w = w.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? w[1] : "GMT";\n              }\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var q = m.getTimezoneOffset();\n              M[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, q);\n              L[b >>> 0 >> 2 >>> 0] = Number(g != q);\n              a = e(h);\n              b = e(m);\n              a = Ba(a);\n              b = Ba(b);\n              q < g ? (M[c >> 2 >>> 0] = a, M[c + 4 >> 2 >>> 0] = b) : (M[c >> 2 >>> 0] = b, M[c + 4 >> 2 >>> 0] = a);\n            },\n            d: () => {\n              G("");\n            },\n            h: function() {\n              return Date.now();\n            },\n            u: function() {\n              return 4294901760;\n            },\n            b: () => performance.now(),\n            I: function(a, b, c) {\n              b >>>= 0;\n              return K.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n            },\n            s: function(a) {\n              a >>>= 0;\n              var b = K.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var e = b * (1 + 0.2 / c);\n                e = Math.min(e, a + 100663296);\n                var g = Math;\n                e = Math.max(a, e);\n                a: {\n                  g = g.min.call(g, 4294901760, e + (65536 - e % 65536) % 65536) - H.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    H.grow(g);\n                    ea();\n                    var h = 1;\n                    break a;\n                  } catch (m) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            C: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              Ca().forEach(function(e, g) {\n                var h = b + c;\n                g = M[a + 4 * g >> 2 >>> 0] = h;\n                for (h = 0; h < e.length; ++h)\n                  J[g++ >> 0 >>> 0] = e.charCodeAt(h);\n                J[g >> 0 >>> 0] = 0;\n                c += e.length + 1;\n              });\n              return 0;\n            },\n            D: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = Ca();\n              M[a >> 2 >>> 0] = c.length;\n              var e = 0;\n              c.forEach(function(g) {\n                e += g.length + 1;\n              });\n              M[b >> 2 >>> 0] = e;\n              return 0;\n            },\n            f: () => 52,\n            j: function() {\n              return 52;\n            },\n            r: function() {\n              return 70;\n            },\n            i: function(a, b, c, e) {\n              b >>>= 0;\n              c >>>= 0;\n              e >>>= 0;\n              for (var g = 0, h = 0; h < c; h++) {\n                var m = M[b >> 2 >>> 0], q = M[b + 4 >> 2 >>> 0];\n                b += 8;\n                for (var w = 0; w < q; w++) {\n                  var t = K[m + w >>> 0], u = Da[a];\n                  0 === t || 10 === t ? ((1 === a ? ca : E)(ua(u, 0)), u.length = 0) : u.push(t);\n                }\n                g += q;\n              }\n              M[e >> 2 >>> 0] = g;\n              return 0;\n            },\n            A: Ha,\n            c: function(a, b, c, e) {\n              return Ha(a >>> 0, b >>> 0, c >>> 0, e >>> 0);\n            }\n          };\n          (function() {\n            function a(c) {\n              c = c.exports;\n              I = c = Ka(c);\n              H = I.J;\n              ea();\n              ha.unshift(I.K);\n              N--;\n              d.monitorRunDependencies && d.monitorRunDependencies(N);\n              if (0 == N && (null !== O && (clearInterval(O), O = null), P)) {\n                var e = P;\n                P = null;\n                e();\n              }\n              return c;\n            }\n            var b = { a: Ja };\n            N++;\n            d.monitorRunDependencies && d.monitorRunDependencies(N);\n            if (d.instantiateWasm)\n              try {\n                return d.instantiateWasm(b, a);\n              } catch (c) {\n                E("Module.instantiateWasm callback failed with error: " + c), l(c);\n              }\n            pa(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          })();\n          d._OrtInit = (a, b) => (d._OrtInit = I.L)(a, b);\n          d._OrtGetLastError = (a, b) => (d._OrtGetLastError = I.M)(a, b);\n          d._OrtCreateSessionOptions = (a, b, c, e, g, h, m, q, w, t) => (d._OrtCreateSessionOptions = I.N)(a, b, c, e, g, h, m, q, w, t);\n          d._OrtAppendExecutionProvider = (a, b) => (d._OrtAppendExecutionProvider = I.O)(a, b);\n          d._OrtAddFreeDimensionOverride = (a, b, c) => (d._OrtAddFreeDimensionOverride = I.P)(a, b, c);\n          d._OrtAddSessionConfigEntry = (a, b, c) => (d._OrtAddSessionConfigEntry = I.Q)(a, b, c);\n          d._OrtReleaseSessionOptions = (a) => (d._OrtReleaseSessionOptions = I.R)(a);\n          d._OrtCreateSession = (a, b, c) => (d._OrtCreateSession = I.S)(a, b, c);\n          d._OrtReleaseSession = (a) => (d._OrtReleaseSession = I.T)(a);\n          d._OrtGetInputOutputCount = (a, b, c) => (d._OrtGetInputOutputCount = I.U)(a, b, c);\n          d._OrtGetInputName = (a, b) => (d._OrtGetInputName = I.V)(a, b);\n          d._OrtGetOutputName = (a, b) => (d._OrtGetOutputName = I.W)(a, b);\n          d._OrtFree = (a) => (d._OrtFree = I.X)(a);\n          d._OrtCreateTensor = (a, b, c, e, g, h) => (d._OrtCreateTensor = I.Y)(a, b, c, e, g, h);\n          d._OrtGetTensorData = (a, b, c, e, g) => (d._OrtGetTensorData = I.Z)(a, b, c, e, g);\n          d._OrtReleaseTensor = (a) => (d._OrtReleaseTensor = I._)(a);\n          d._OrtCreateRunOptions = (a, b, c, e) => (d._OrtCreateRunOptions = I.$)(a, b, c, e);\n          d._OrtAddRunConfigEntry = (a, b, c) => (d._OrtAddRunConfigEntry = I.aa)(a, b, c);\n          d._OrtReleaseRunOptions = (a) => (d._OrtReleaseRunOptions = I.ba)(a);\n          d._OrtCreateBinding = (a) => (d._OrtCreateBinding = I.ca)(a);\n          d._OrtBindInput = (a, b, c) => (d._OrtBindInput = I.da)(a, b, c);\n          d._OrtBindOutput = (a, b, c, e) => (d._OrtBindOutput = I.ea)(a, b, c, e);\n          d._OrtClearBoundOutputs = (a) => (d._OrtClearBoundOutputs = I.fa)(a);\n          d._OrtReleaseBinding = (a) => (d._OrtReleaseBinding = I.ga)(a);\n          d._OrtRunWithBinding = (a, b, c, e, g) => (d._OrtRunWithBinding = I.ha)(a, b, c, e, g);\n          d._OrtRun = (a, b, c, e, g, h, m, q) => (d._OrtRun = I.ia)(a, b, c, e, g, h, m, q);\n          d._OrtEndProfiling = (a) => (d._OrtEndProfiling = I.ja)(a);\n          d._OrtTrainingLoadCheckpoint = (a, b) => (d._OrtTrainingLoadCheckpoint = I.ka)(a, b);\n          d._OrtTrainingReleaseCheckpoint = (a) => (d._OrtTrainingReleaseCheckpoint = I.la)(a);\n          d._OrtTrainingCreateSession = (a, b, c, e, g, h, m, q) => (d._OrtTrainingCreateSession = I.ma)(a, b, c, e, g, h, m, q);\n          d._OrtTrainingLazyResetGrad = (a) => (d._OrtTrainingLazyResetGrad = I.na)(a);\n          d._OrtTrainingRunTrainStep = (a, b, c, e, g, h) => (d._OrtTrainingRunTrainStep = I.oa)(a, b, c, e, g, h);\n          d._OrtTrainingOptimizerStep = (a, b) => (d._OrtTrainingOptimizerStep = I.pa)(a, b);\n          d._OrtTrainingEvalStep = (a, b, c, e, g, h) => (d._OrtTrainingEvalStep = I.qa)(a, b, c, e, g, h);\n          d._OrtTrainingGetParametersSize = (a, b, c) => (d._OrtTrainingGetParametersSize = I.ra)(a, b, c);\n          d._OrtTrainingCopyParametersToBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersToBuffer = I.sa)(a, b, c, e);\n          d._OrtTrainingCopyParametersFromBuffer = (a, b, c, e) => (d._OrtTrainingCopyParametersFromBuffer = I.ta)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputCount = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputCount = I.ua)(a, b, c, e);\n          d._OrtTrainingGetModelInputOutputName = (a, b, c, e) => (d._OrtTrainingGetModelInputOutputName = I.va)(a, b, c, e);\n          d._OrtTrainingReleaseSession = (a) => (d._OrtTrainingReleaseSession = I.wa)(a);\n          var Aa = d._malloc = (a) => (Aa = d._malloc = I.xa)(a);\n          d._free = (a) => (d._free = I.ya)(a);\n          var Ia = (a) => (Ia = I.Aa)(a), La = () => (La = I.Ba)(), Ma = (a) => (Ma = I.Ca)(a), Na = (a) => (Na = I.Da)(a);\n          function Ka(a) {\n            a = Object.assign({}, a);\n            var b = (e) => () => e() >>> 0, c = (e) => (g) => e(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          d.stackAlloc = Na;\n          d.stackSave = La;\n          d.stackRestore = Ma;\n          d.UTF8ToString = T;\n          d.stringToUTF8 = (a, b, c) => V(a, K, b, c);\n          d.lengthBytesUTF8 = U;\n          var Z;\n          P = function Oa() {\n            Z || Pa();\n            Z || (P = Oa);\n          };\n          function Pa() {\n            function a() {\n              if (!Z && (Z = true, d.calledRun = true, !da)) {\n                S(ha);\n                k(d);\n                if (d.onRuntimeInitialized)\n                  d.onRuntimeInitialized();\n                if (d.postRun)\n                  for ("function" == typeof d.postRun && (d.postRun = [d.postRun]); d.postRun.length; ) {\n                    var b = d.postRun.shift();\n                    ia.unshift(b);\n                  }\n                S(ia);\n              }\n            }\n            if (!(0 < N)) {\n              if (d.preRun)\n                for ("function" == typeof d.preRun && (d.preRun = [d.preRun]); d.preRun.length; )\n                  ja();\n              S(fa);\n              0 < N || (d.setStatus ? (d.setStatus("Running..."), setTimeout(function() {\n                setTimeout(function() {\n                  d.setStatus("");\n                }, 1);\n                a();\n              }, 1)) : a());\n            }\n          }\n          if (d.preInit)\n            for ("function" == typeof d.preInit && (d.preInit = [d.preInit]); 0 < d.preInit.length; )\n              d.preInit.pop()();\n          Pa();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function aa() {\n            d.buffer != l.buffer && m();\n            return l;\n          }\n          function n() {\n            d.buffer != l.buffer && m();\n            return ba;\n          }\n          function p() {\n            d.buffer != l.buffer && m();\n            return ca;\n          }\n          function r() {\n            d.buffer != l.buffer && m();\n            return da;\n          }\n          function ea() {\n            d.buffer != l.buffer && m();\n            return fa;\n          }\n          var w = moduleArg, ha, x;\n          w.ready = new Promise((a, b) => {\n            ha = a;\n            x = b;\n          });\n          var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {\n            throw b;\n          }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function la(a) {\n            return w.locateFile ? w.locateFile(a, E) : E + a;\n          }\n          var ma, F, H;\n          if (B) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));\n            E = A ? na.dirname(E) + "/" : __dirname + "/";\n            ma = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            H = (b) => {\n              b = ma(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            F = (b, c, e, h = true) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              fs.readFile(b, h ? void 0 : "utf8", (g, k) => {\n                g ? e(g) : c(h ? k.buffer : k);\n              });\n            };\n            !w.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            z = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            w.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (ka || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ma = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, A && (H = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), F = (a, b, c) => {\n              var e = new XMLHttpRequest();\n              e.open("GET", a, true);\n              e.responseType = "arraybuffer";\n              e.onload = () => {\n                200 == e.status || 0 == e.status && e.response ? b(e.response) : c();\n              };\n              e.onerror = c;\n              e.send(null);\n            });\n          B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var oa = console.log.bind(console), pa = console.error.bind(console);\n          B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var qa = w.print || oa, I = w.printErr || pa;\n          Object.assign(w, ia);\n          ia = null;\n          w.thisProgram && (ja = w.thisProgram);\n          w.quit && (z = w.quit);\n          var J;\n          w.wasmBinary && (J = w.wasmBinary);\n          var noExitRuntime = w.noExitRuntime || true;\n          "object" != typeof WebAssembly && K("no native wasm support detected");\n          var d, L, ra, M = false, N, l, ba, ca, da, fa;\n          function m() {\n            var a = d.buffer;\n            w.HEAP8 = l = new Int8Array(a);\n            w.HEAP16 = new Int16Array(a);\n            w.HEAP32 = ca = new Int32Array(a);\n            w.HEAPU8 = ba = new Uint8Array(a);\n            w.HEAPU16 = new Uint16Array(a);\n            w.HEAPU32 = da = new Uint32Array(a);\n            w.HEAPF32 = new Float32Array(a);\n            w.HEAPF64 = fa = new Float64Array(a);\n          }\n          var O = w.INITIAL_MEMORY || 16777216;\n          5242880 <= O || K("INITIAL_MEMORY should be larger than STACK_SIZE, was " + O + "! (STACK_SIZE=5242880)");\n          if (D)\n            d = w.wasmMemory;\n          else if (w.wasmMemory)\n            d = w.wasmMemory;\n          else if (d = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(d.buffer instanceof SharedArrayBuffer))\n            throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          m();\n          O = d.buffer.byteLength;\n          var sa, ta = [], ua = [], va = [], wa = 0;\n          function P() {\n            return noExitRuntime || 0 < wa;\n          }\n          var Q = 0, xa = null, R = null;\n          function ya() {\n            Q++;\n            w.monitorRunDependencies && w.monitorRunDependencies(Q);\n          }\n          function za() {\n            Q--;\n            w.monitorRunDependencies && w.monitorRunDependencies(Q);\n            if (0 == Q && (null !== xa && (clearInterval(xa), xa = null), R)) {\n              var a = R;\n              R = null;\n              a();\n            }\n          }\n          function K(a) {\n            if (w.onAbort)\n              w.onAbort(a);\n            a = "Aborted(" + a + ")";\n            I(a);\n            M = true;\n            N = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            x(a);\n            throw a;\n          }\n          function Aa(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var S;\n          S = "ort-wasm-threaded.wasm";\n          Aa(S) || (S = la(S));\n          function Ba(a) {\n            if (a == S && J)\n              return new Uint8Array(J);\n            if (H)\n              return H(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ca(a) {\n            if (!J && (ka || A)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Ba(a));\n              if (F)\n                return new Promise((b, c) => {\n                  F(a, (e) => b(new Uint8Array(e)), c);\n                });\n            }\n            return Promise.resolve().then(() => Ba(a));\n          }\n          function Da(a, b, c) {\n            return Ca(a).then((e) => WebAssembly.instantiate(e, b)).then((e) => e).then(c, (e) => {\n              I("failed to asynchronously prepare wasm: " + e);\n              K(e);\n            });\n          }\n          function Ea(a, b) {\n            var c = S;\n            return J || "function" != typeof WebAssembly.instantiateStreaming || Aa(c) || c.startsWith("file://") || B || "function" != typeof fetch ? Da(c, a, b) : fetch(c, { credentials: "same-origin" }).then((e) => WebAssembly.instantiateStreaming(e, a).then(b, function(h) {\n              I("wasm streaming compile failed: " + h);\n              I("falling back to ArrayBuffer instantiation");\n              return Da(c, a, b);\n            }));\n          }\n          var T;\n          function U(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          function Fa(a) {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }\n          function Ga(a) {\n            (a = V.La[a]) || K();\n            V.lb(a);\n          }\n          function Ha(a) {\n            var b = V.fb();\n            if (!b)\n              return 6;\n            V.Oa.push(b);\n            V.La[a.Na] = b;\n            b.Na = a.Na;\n            var c = { cmd: "run", start_routine: a.mb, arg: a.eb, pthread_ptr: a.Na };\n            B && b.unref();\n            b.postMessage(c, a.sb);\n            return 0;\n          }\n          var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {\n            b >>>= 0;\n            var e = b + c;\n            for (c = b; a[c] && !(c >= e); )\n              ++c;\n            if (16 < c - b && a.buffer && Ia)\n              return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (e = ""; b < c; ) {\n              var h = a[b++];\n              if (h & 128) {\n                var g = a[b++] & 63;\n                if (192 == (h & 224))\n                  e += String.fromCharCode((h & 31) << 6 | g);\n                else {\n                  var k = a[b++] & 63;\n                  h = 224 == (h & 240) ? (h & 15) << 12 | g << 6 | k : (h & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;\n                  65536 > h ? e += String.fromCharCode(h) : (h -= 65536, e += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));\n                }\n              } else\n                e += String.fromCharCode(h);\n            }\n            return e;\n          }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";\n          function La(a) {\n            if (D)\n              return W(1, 1, a);\n            N = a;\n            if (!P()) {\n              V.nb();\n              if (w.onExit)\n                w.onExit(a);\n              M = true;\n            }\n            z(a, new U(a));\n          }\n          var Na = (a) => {\n            N = a;\n            if (D)\n              throw Ma(a), "unwind";\n            La(a);\n          }, V = {\n            Ra: [],\n            Oa: [],\n            Za: [],\n            La: {},\n            Va: function() {\n              D ? V.hb() : V.gb();\n            },\n            gb: function() {\n              ta.unshift(() => {\n                ya();\n                V.ib(() => za());\n              });\n            },\n            hb: function() {\n              V.receiveObjectTransfer = V.kb;\n              V.threadInitTLS = V.Ya;\n              V.setExitStatus = V.Xa;\n              noExitRuntime = false;\n            },\n            Xa: function(a) {\n              N = a;\n            },\n            xb: ["$terminateWorker"],\n            nb: function() {\n              for (var a of V.Oa)\n                Fa(a);\n              for (a of V.Ra)\n                Fa(a);\n              V.Ra = [];\n              V.Oa = [];\n              V.La = [];\n            },\n            lb: function(a) {\n              var b = a.Na;\n              delete V.La[b];\n              V.Ra.push(a);\n              V.Oa.splice(V.Oa.indexOf(a), 1);\n              a.Na = 0;\n              Oa(b);\n            },\n            kb: function() {\n            },\n            Ya: function() {\n              V.Za.forEach((a) => a());\n            },\n            jb: (a) => new Promise((b) => {\n              a.onmessage = (g) => {\n                g = g.data;\n                var k = g.cmd;\n                if (g.targetThread && g.targetThread != X()) {\n                  var t = V.La[g.wb];\n                  t ? t.postMessage(g, g.transferList) : I(\'Internal error! Worker sent a message "\' + k + \'" to target pthread \' + g.targetThread + ", but that thread no longer exists!");\n                } else if ("checkMailbox" === k)\n                  Y();\n                else if ("spawnThread" === k)\n                  Ha(g);\n                else if ("cleanupThread" === k)\n                  Ga(g.thread);\n                else if ("killThread" === k)\n                  g = g.thread, k = V.La[g], delete V.La[g], Fa(k), Oa(g), V.Oa.splice(\n                    V.Oa.indexOf(k),\n                    1\n                  ), k.Na = 0;\n                else if ("cancelThread" === k)\n                  V.La[g.thread].postMessage({ cmd: "cancel" });\n                else if ("loaded" === k)\n                  a.loaded = true, b(a);\n                else if ("alert" === k)\n                  alert("Thread " + g.threadId + ": " + g.text);\n                else if ("setimmediate" === g.target)\n                  a.postMessage(g);\n                else if ("callHandler" === k)\n                  w[g.handler](...g.args);\n                else\n                  k && I("worker sent an unknown command " + k);\n              };\n              a.onerror = (g) => {\n                I("worker sent an error! " + g.filename + ":" + g.lineno + ": " + g.message);\n                throw g;\n              };\n              B && (a.on("message", function(g) {\n                a.onmessage({ data: g });\n              }), a.on("error", function(g) {\n                a.onerror(g);\n              }));\n              var c = [], e = ["onExit", "onAbort", "print", "printErr"], h;\n              for (h of e)\n                w.hasOwnProperty(h) && c.push(h);\n              a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: d, wasmModule: ra });\n            }),\n            ib: function(a) {\n              a();\n            },\n            cb: function() {\n              var a = la("ort-wasm-threaded.worker.js");\n              a = new Worker(a);\n              V.Ra.push(a);\n            },\n            fb: function() {\n              0 == V.Ra.length && (V.cb(), V.jb(V.Ra[0]));\n              return V.Ra.pop();\n            }\n          };\n          w.PThread = V;\n          var Pa = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(w);\n          };\n          w.establishStackSpace = function() {\n            var a = X(), b = p()[a + 52 >> 2 >>> 0];\n            a = p()[a + 56 >> 2 >>> 0];\n            Qa(b, b - a);\n            Ra(b);\n          };\n          function Ma(a) {\n            if (D)\n              return W(2, 0, a);\n            Na(a);\n          }\n          var Sa = [];\n          w.invokeEntryPoint = function(a, b) {\n            var c = Sa[a];\n            c || (a >= Sa.length && (Sa.length = a + 1), Sa[a] = c = sa.get(a));\n            a = c(b);\n            P() ? V.Xa(a) : Ta(a);\n          };\n          function Ua(a) {\n            this.Ua = a - 24;\n            this.bb = function(b) {\n              r()[this.Ua + 4 >> 2 >>> 0] = b;\n            };\n            this.ab = function(b) {\n              r()[this.Ua + 8 >> 2 >>> 0] = b;\n            };\n            this.Va = function(b, c) {\n              this.$a();\n              this.bb(b);\n              this.ab(c);\n            };\n            this.$a = function() {\n              r()[this.Ua + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var Va = 0, Wa = 0;\n          function Xa(a, b, c, e) {\n            return D ? W(3, 1, a, b, c, e) : Ya(a, b, c, e);\n          }\n          function Ya(a, b, c, e) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var h = [];\n            if (D && 0 === h.length)\n              return Xa(a, b, c, e);\n            a = { mb: c, Na: a, eb: e, sb: h };\n            return D ? (a.ub = "spawnThread", postMessage(a, h), 0) : Ha(a);\n          }\n          function Za(a, b, c) {\n            return D ? W(4, 1, a, b, c) : 0;\n          }\n          function $a(a, b) {\n            if (D)\n              return W(5, 1, a, b);\n          }\n          var ab = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var e = a.charCodeAt(c);\n              127 >= e ? b++ : 2047 >= e ? b += 2 : 55296 <= e && 57343 >= e ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, bb = (a, b, c, e) => {\n            c >>>= 0;\n            if (!(0 < e))\n              return 0;\n            var h = c;\n            e = c + e - 1;\n            for (var g = 0; g < a.length; ++g) {\n              var k = a.charCodeAt(g);\n              if (55296 <= k && 57343 >= k) {\n                var t = a.charCodeAt(++g);\n                k = 65536 + ((k & 1023) << 10) | t & 1023;\n              }\n              if (127 >= k) {\n                if (c >= e)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= e)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= e)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= e)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - h;\n          }, cb = (a, b, c) => bb(a, n(), b, c);\n          function db(a, b) {\n            if (D)\n              return W(6, 1, a, b);\n          }\n          function eb(a, b, c) {\n            if (D)\n              return W(7, 1, a, b, c);\n          }\n          function fb(a, b, c) {\n            return D ? W(8, 1, a, b, c) : 0;\n          }\n          function gb(a, b) {\n            if (D)\n              return W(9, 1, a, b);\n          }\n          function hb(a, b, c) {\n            if (D)\n              return W(10, 1, a, b, c);\n          }\n          function ib(a, b, c, e) {\n            if (D)\n              return W(11, 1, a, b, c, e);\n          }\n          function jb(a, b, c, e) {\n            if (D)\n              return W(12, 1, a, b, c, e);\n          }\n          function kb(a, b, c, e) {\n            if (D)\n              return W(13, 1, a, b, c, e);\n          }\n          function lb(a) {\n            if (D)\n              return W(14, 1, a);\n          }\n          function mb(a, b) {\n            if (D)\n              return W(15, 1, a, b);\n          }\n          function nb(a, b, c) {\n            if (D)\n              return W(16, 1, a, b, c);\n          }\n          var ob = (a) => {\n            if (!M)\n              try {\n                if (a(), !P())\n                  try {\n                    D ? Ta(N) : Na(N);\n                  } catch (b) {\n                    b instanceof U || "unwind" == b || z(1, b);\n                  }\n              } catch (b) {\n                b instanceof U || "unwind" == b || z(1, b);\n              }\n          };\n          function pb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.tb && (Atomics.tb(p(), a >> 2, a).value.then(Y), a += 128, Atomics.store(p(), a >> 2, 1));\n          }\n          w.__emscripten_thread_mailbox_await = pb;\n          function Y() {\n            var a = X();\n            a && (pb(a), ob(() => qb()));\n          }\n          w.checkMailbox = Y;\n          var Z = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), rb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], sb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function tb(a, b, c, e, h, g, k, t) {\n            return D ? W(17, 1, a, b, c, e, h, g, k, t) : -52;\n          }\n          function ub(a, b, c, e, h, g, k) {\n            if (D)\n              return W(18, 1, a, b, c, e, h, g, k);\n          }\n          var wb = (a) => {\n            var b = ab(a) + 1, c = vb(b);\n            c && cb(a, c, b);\n            return c;\n          }, yb = (a) => {\n            var b = xb();\n            a = a();\n            Ra(b);\n            return a;\n          };\n          function W(a, b) {\n            var c = arguments.length - 2, e = arguments;\n            return yb(() => {\n              for (var h = zb(8 * c), g = h >> 3, k = 0; k < c; k++) {\n                var t = e[2 + k];\n                ea()[g + k >>> 0] = t;\n              }\n              return Ab(a, c, h, b);\n            });\n          }\n          var Bb = [], Cb = {}, Eb = () => {\n            if (!Db) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;\n              for (b in Cb)\n                void 0 === Cb[b] ? delete a[b] : a[b] = Cb[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Db = c;\n            }\n            return Db;\n          }, Db;\n          function Fb(a, b) {\n            if (D)\n              return W(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Eb().forEach(function(e, h) {\n              var g = b + c;\n              h = r()[a + 4 * h >> 2 >>> 0] = g;\n              for (g = 0; g < e.length; ++g)\n                aa()[h++ >> 0 >>> 0] = e.charCodeAt(g);\n              aa()[h >> 0 >>> 0] = 0;\n              c += e.length + 1;\n            });\n            return 0;\n          }\n          function Gb(a, b) {\n            if (D)\n              return W(20, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Eb();\n            r()[a >> 2 >>> 0] = c.length;\n            var e = 0;\n            c.forEach(function(h) {\n              e += h.length + 1;\n            });\n            r()[b >> 2 >>> 0] = e;\n            return 0;\n          }\n          function Hb(a) {\n            return D ? W(21, 1, a) : 52;\n          }\n          function Lb(a, b, c, e) {\n            return D ? W(22, 1, a, b, c, e) : 52;\n          }\n          function Mb(a, b, c, e, h) {\n            return D ? W(23, 1, a, b, c, e, h) : 70;\n          }\n          var Nb = [null, [], []];\n          function Ob(a, b, c, e) {\n            if (D)\n              return W(24, 1, a, b, c, e);\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            for (var h = 0, g = 0; g < c; g++) {\n              var k = r()[b >> 2 >>> 0], t = r()[b + 4 >> 2 >>> 0];\n              b += 8;\n              for (var C = 0; C < t; C++) {\n                var v = n()[k + C >>> 0], y = Nb[a];\n                0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);\n              }\n              h += t;\n            }\n            r()[e >> 2 >>> 0] = h;\n            return 0;\n          }\n          var Pb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Qb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Rb(a) {\n            var b = Array(ab(a) + 1);\n            bb(a, b, 0, b.length);\n            return b;\n          }\n          var Sb = (a, b) => {\n            aa().set(a, b >>> 0);\n          };\n          function Tb(a, b, c, e) {\n            function h(f, q, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )\n                f = u[0] + f;\n              return f;\n            }\n            function g(f, q) {\n              return h(f, q, "0");\n            }\n            function k(f, q) {\n              function u(Ib) {\n                return 0 > Ib ? -1 : 0 < Ib ? 1 : 0;\n              }\n              var G;\n              0 === (G = u(f.getFullYear() - q.getFullYear())) && 0 === (G = u(f.getMonth() - q.getMonth())) && (G = u(f.getDate() - q.getDate()));\n              return G;\n            }\n            function t(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function C(f) {\n              var q = f.Pa;\n              for (f = new Date(new Date(f.Qa + 1900, 0, 1).getTime()); 0 < q; ) {\n                var u = f.getMonth(), G = (Z(f.getFullYear()) ? Pb : Qb)[u];\n                if (q > G - f.getDate())\n                  q -= G - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + q);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              q = t(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = t(u);\n              return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            e >>>= 0;\n            var v = p()[e + 40 >> 2 >>> 0];\n            e = { qb: p()[e >> 2 >>> 0], pb: p()[e + 4 >> 2 >>> 0], Sa: p()[e + 8 >> 2 >>> 0], Wa: p()[e + 12 >> 2 >>> 0], Ta: p()[e + 16 >> 2 >>> 0], Qa: p()[e + 20 >> 2 >>> 0], Ma: p()[e + 24 >> 2 >>> 0], Pa: p()[e + 28 >> 2 >>> 0], yb: p()[e + 32 >> 2 >>> 0], ob: p()[e + 36 >> 2 >>> 0], rb: v ? Ka(v) : "" };\n            c = Ka(c);\n            v = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var y in v)\n              c = c.replace(new RegExp(y, "g"), v[y]);\n            var Jb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Kb = "January February March April May June July August September October November December".split(" ");\n            v = {\n              "%a": (f) => Jb[f.Ma].substring(0, 3),\n              "%A": (f) => Jb[f.Ma],\n              "%b": (f) => Kb[f.Ta].substring(0, 3),\n              "%B": (f) => Kb[f.Ta],\n              "%C": (f) => g((f.Qa + 1900) / 100 | 0, 2),\n              "%d": (f) => g(f.Wa, 2),\n              "%e": (f) => h(f.Wa, 2, " "),\n              "%g": (f) => C(f).toString().substring(2),\n              "%G": (f) => C(f),\n              "%H": (f) => g(f.Sa, 2),\n              "%I": (f) => {\n                f = f.Sa;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return g(f, 2);\n              },\n              "%j": (f) => {\n                for (var q = 0, u = 0; u <= f.Ta - 1; q += (Z(f.Qa + 1900) ? Pb : Qb)[u++])\n                  ;\n                return g(f.Wa + q, 3);\n              },\n              "%m": (f) => g(f.Ta + 1, 2),\n              "%M": (f) => g(f.pb, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Sa && 12 > f.Sa ? "AM" : "PM",\n              "%S": (f) => g(f.qb, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Ma || 7,\n              "%U": (f) => g(Math.floor((f.Pa + 7 - f.Ma) / 7), 2),\n              "%V": (f) => {\n                var q = Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7);\n                2 >= (f.Ma + 371 - f.Pa - 2) % 7 && q++;\n                if (q)\n                  53 == q && (u = (f.Ma + 371 - f.Pa) % 7, 4 == u || 3 == u && Z(f.Qa) || (q = 1));\n                else {\n                  q = 52;\n                  var u = (f.Ma + 7 - f.Pa - 1) % 7;\n                  (4 == u || 5 == u && Z(f.Qa % 400 - 1)) && q++;\n                }\n                return g(q, 2);\n              },\n              "%w": (f) => f.Ma,\n              "%W": (f) => g(Math.floor((f.Pa + 7 - (f.Ma + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Qa + 1900).toString().substring(2),\n              "%Y": (f) => f.Qa + 1900,\n              "%z": (f) => {\n                f = f.ob;\n                var q = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.rb,\n              "%%": () => "%"\n            };\n            c = c.replace(\n              /%%/g,\n              "\\0\\0"\n            );\n            for (y in v)\n              c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](e)));\n            c = c.replace(/\\0\\0/g, "%");\n            y = Rb(c);\n            if (y.length > b)\n              return 0;\n            Sb(y, a);\n            return y.length - 1;\n          }\n          V.Va();\n          var Ub = [null, La, Ma, Xa, Za, $a, db, eb, fb, gb, hb, ib, jb, kb, lb, mb, nb, tb, ub, Fb, Gb, Hb, Lb, Mb, Ob], Xb = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new Ua(a).Va(b >>> 0, c >>> 0);\n              Va = a;\n              Wa++;\n              throw Va;\n            },\n            N: function(a) {\n              Vb(a >>> 0, !A, 1, !ka, 131072, false);\n              V.Ya();\n            },\n            j: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);\n            },\n            I: Ya,\n            h: Za,\n            T: $a,\n            D: db,\n            F: eb,\n            U: fb,\n            R: gb,\n            J: hb,\n            Q: ib,\n            n: jb,\n            E: kb,\n            B: lb,\n            S: mb,\n            C: nb,\n            q: () => true,\n            z: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => Y()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.La[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            L: function() {\n              return -1;\n            },\n            M: pb,\n            p: function(a) {\n              B && V.La[a >>> 0].ref();\n            },\n            t: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getUTCSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              p()[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              p()[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              p()[c + 28 >> 2 >>> 0] = a;\n            },\n            u: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getHours();\n              p()[c + 12 >> 2 >>> 0] = a.getDate();\n              p()[c + 16 >> 2 >>> 0] = a.getMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getDay();\n              b = (Z(a.getFullYear()) ? rb : sb)[a.getMonth()] + a.getDate() - 1 | 0;\n              p()[c + 28 >> 2 >>> 0] = b;\n              p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;\n              p()[c + 32 >> 2 >>> 0] = a;\n            },\n            v: function(a) {\n              a >>>= 0;\n              var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], e = b.getTimezoneOffset(), h = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(g, h);\n              0 > c ? p()[a + 32 >> 2 >>> 0] = Number(h != g && k == e) : 0 < c != (k == e) && (h = Math.max(g, h), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : h) - e)));\n              p()[a + 24 >> 2 >>> 0] = b.getDay();\n              c = (Z(b.getFullYear()) ? rb : sb)[b.getMonth()] + b.getDate() - 1 | 0;\n              p()[a + 28 >> 2 >>> 0] = c;\n              p()[a >> 2 >>> 0] = b.getSeconds();\n              p()[a + 4 >> 2 >>> 0] = b.getMinutes();\n              p()[a + 8 >> 2 >>> 0] = b.getHours();\n              p()[a + 12 >> 2 >>> 0] = b.getDate();\n              p()[a + 16 >> 2 >>> 0] = b.getMonth();\n              p()[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Wb((T = a, 1 <= +Math.abs(T) ? 0 < T ? +Math.floor(T / 4294967296) >>> 0 : ~~+Math.ceil((T - +(~~T >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            r: tb,\n            s: ub,\n            y: function(a, b, c) {\n              function e(v) {\n                return (v = v.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? v[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var h = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(h, 0, 1), k = new Date(h, 6, 1);\n              h = g.getTimezoneOffset();\n              var t = k.getTimezoneOffset(), C = Math.max(h, t);\n              r()[a >> 2 >>> 0] = 60 * C;\n              p()[b >> 2 >>> 0] = Number(h != t);\n              a = e(g);\n              b = e(k);\n              a = wb(a);\n              b = wb(b);\n              t < h ? (r()[c >> 2 >>> 0] = a, r()[c + 4 >> 2 >>> 0] = b) : (r()[c >> 2 >>> 0] = b, r()[c + 4 >> 2 >>> 0] = a);\n            },\n            c: () => {\n              K("");\n            },\n            k: function() {\n            },\n            i: function() {\n              return Date.now();\n            },\n            o: () => {\n              wa += 1;\n              throw "unwind";\n            },\n            A: function() {\n              return 4294901760;\n            },\n            e: () => performance.timeOrigin + performance.now(),\n            f: function() {\n              return B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;\n            },\n            K: function(a, b, c, e) {\n              V.vb = b >>> 0;\n              Bb.length = c;\n              b = e >>> 0 >> 3;\n              for (e = 0; e < c; e++)\n                Bb[e] = ea()[b + e >>> 0];\n              return Ub[a].apply(null, Bb);\n            },\n            x: function(a) {\n              a >>>= 0;\n              var b = n().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var e = b * (1 + 0.2 / c);\n                e = Math.min(e, a + 100663296);\n                var h = Math;\n                e = Math.max(a, e);\n                a: {\n                  h = h.min.call(h, 4294901760, e + (65536 - e % 65536) % 65536) - d.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    d.grow(h);\n                    m();\n                    var g = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  g = void 0;\n                }\n                if (g)\n                  return true;\n              }\n              return false;\n            },\n            O: Fb,\n            P: Gb,\n            H: Na,\n            g: Hb,\n            m: Lb,\n            w: Mb,\n            l: Ob,\n            a: d || w.wasmMemory,\n            G: Tb,\n            d: function(a, b, c, e) {\n              return Tb(a >>> 0, b >>> 0, c >>> 0, e >>> 0);\n            }\n          };\n          (function() {\n            function a(c, e) {\n              c = c.exports;\n              L = c = Yb(c);\n              V.Za.push(L.ya);\n              sa = L.za;\n              ua.unshift(L.V);\n              ra = e;\n              za();\n              return c;\n            }\n            var b = { a: Xb };\n            ya();\n            if (w.instantiateWasm)\n              try {\n                return w.instantiateWasm(b, a);\n              } catch (c) {\n                I("Module.instantiateWasm callback failed with error: " + c), x(c);\n              }\n            Ea(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(x);\n            return {};\n          })();\n          w._OrtInit = (a, b) => (w._OrtInit = L.W)(a, b);\n          w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.X)(a, b);\n          w._OrtCreateSessionOptions = (a, b, c, e, h, g, k, t, C, v) => (w._OrtCreateSessionOptions = L.Y)(a, b, c, e, h, g, k, t, C, v);\n          w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L.Z)(a, b);\n          w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L._)(a, b, c);\n          w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.$)(a, b, c);\n          w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.aa)(a);\n          w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ba)(a, b, c);\n          w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.ca)(a);\n          w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.da)(a, b, c);\n          w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.ea)(a, b);\n          w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.fa)(a, b);\n          w._OrtFree = (a) => (w._OrtFree = L.ga)(a);\n          w._OrtCreateTensor = (a, b, c, e, h, g) => (w._OrtCreateTensor = L.ha)(a, b, c, e, h, g);\n          w._OrtGetTensorData = (a, b, c, e, h) => (w._OrtGetTensorData = L.ia)(a, b, c, e, h);\n          w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ja)(a);\n          w._OrtCreateRunOptions = (a, b, c, e) => (w._OrtCreateRunOptions = L.ka)(a, b, c, e);\n          w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.la)(a, b, c);\n          w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.ma)(a);\n          w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.na)(a);\n          w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.oa)(a, b, c);\n          w._OrtBindOutput = (a, b, c, e) => (w._OrtBindOutput = L.pa)(a, b, c, e);\n          w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.qa)(a);\n          w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.ra)(a);\n          w._OrtRunWithBinding = (a, b, c, e, h) => (w._OrtRunWithBinding = L.sa)(a, b, c, e, h);\n          w._OrtRun = (a, b, c, e, h, g, k, t) => (w._OrtRun = L.ta)(a, b, c, e, h, g, k, t);\n          w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.ua)(a);\n          var X = w._pthread_self = () => (X = w._pthread_self = L.va)(), vb = w._malloc = (a) => (vb = w._malloc = L.wa)(a);\n          w._free = (a) => (w._free = L.xa)(a);\n          w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.ya)();\n          var Vb = w.__emscripten_thread_init = (a, b, c, e, h, g) => (Vb = w.__emscripten_thread_init = L.Aa)(a, b, c, e, h, g);\n          w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ba)();\n          var Ab = (a, b, c, e) => (Ab = L.Ca)(a, b, c, e), Oa = (a) => (Oa = L.Da)(a), Ta = w.__emscripten_thread_exit = (a) => (Ta = w.__emscripten_thread_exit = L.Ea)(a), qb = w.__emscripten_check_mailbox = () => (qb = w.__emscripten_check_mailbox = L.Fa)(), Wb = (a) => (Wb = L.Ga)(a), Qa = (a, b) => (Qa = L.Ha)(a, b), xb = () => (xb = L.Ia)(), Ra = (a) => (Ra = L.Ja)(a), zb = (a) => (zb = L.Ka)(a);\n          function Yb(a) {\n            a = Object.assign({}, a);\n            var b = (e) => () => e() >>> 0, c = (e) => (h) => e(h) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.pthread_self = b(a.pthread_self);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          w.keepRuntimeAlive = P;\n          w.wasmMemory = d;\n          w.stackAlloc = zb;\n          w.stackSave = xb;\n          w.stackRestore = Ra;\n          w.UTF8ToString = Ka;\n          w.stringToUTF8 = cb;\n          w.lengthBytesUTF8 = ab;\n          w.ExitStatus = U;\n          w.PThread = V;\n          var Zb;\n          R = function $b() {\n            Zb || ac();\n            Zb || (R = $b);\n          };\n          function ac() {\n            function a() {\n              if (!Zb && (Zb = true, w.calledRun = true, !M)) {\n                D || Pa(ua);\n                ha(w);\n                if (w.onRuntimeInitialized)\n                  w.onRuntimeInitialized();\n                if (!D) {\n                  if (w.postRun)\n                    for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {\n                      var b = w.postRun.shift();\n                      va.unshift(b);\n                    }\n                  Pa(va);\n                }\n              }\n            }\n            if (!(0 < Q))\n              if (D)\n                ha(w), D || Pa(ua), startWorker(w);\n              else {\n                if (w.preRun)\n                  for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )\n                    ta.unshift(w.preRun.shift());\n                Pa(ta);\n                0 < Q || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {\n                  setTimeout(\n                    function() {\n                      w.setStatus("");\n                    },\n                    1\n                  );\n                  a();\n                }, 1)) : a());\n              }\n          }\n          if (w.preInit)\n            for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )\n              w.preInit.pop()();\n          ac();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "xnnpack":\n          epName = "XNNPACK";\n          break;\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var ortEnvInitialized = false;\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n    if (false) {\n      const initJsep = null.init;\n      await initJsep(getInstance(), env);\n    }\n    ortEnvInitialized = true;\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var isOrtEnvInitialized = () => ortEnvInitialized;\n  var createSessionAllocate = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSessionFinalize = (modelData, options) => {\n    const wasm2 = getInstance();\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelData[0]);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n    }\n  };\n  var createSession = (model, options) => {\n    const modelData = createSessionAllocate(model);\n    return createSessionFinalize(modelData, options);\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    switch (ev.data.type) {\n      case "init-wasm":\n        try {\n          initializeWebAssembly(ev.data.in).then(\n            () => postMessage({ type: "init-wasm" }),\n            (err) => postMessage({ type: "init-wasm", err })\n          );\n        } catch (err) {\n          postMessage({ type: "init-wasm", err });\n        }\n        break;\n      case "init-ort":\n        try {\n          initRuntime(ev.data.in).then(() => postMessage({ type: "init-ort" }), (err) => postMessage({\n            type: "init-ort",\n            err\n          }));\n        } catch (err) {\n          postMessage({ type: "init-ort", err });\n        }\n        break;\n      case "create_allocate":\n        try {\n          const { model } = ev.data.in;\n          const modeldata = createSessionAllocate(model);\n          postMessage({ type: "create_allocate", out: modeldata });\n        } catch (err) {\n          postMessage({ type: "create_allocate", err });\n        }\n        break;\n      case "create_finalize":\n        try {\n          const { modeldata, options } = ev.data.in;\n          const sessionMetadata = createSessionFinalize(modeldata, options);\n          postMessage({ type: "create_finalize", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create_finalize", err });\n        }\n        break;\n      case "create":\n        try {\n          const { model, options } = ev.data.in;\n          const sessionMetadata = createSession(model, options);\n          postMessage({ type: "create", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create", err });\n        }\n        break;\n      case "release":\n        try {\n          releaseSession(ev.data.in);\n          postMessage({ type: "release" });\n        } catch (err) {\n          postMessage({ type: "release", err });\n        }\n        break;\n      case "run":\n        try {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = ev.data.in;\n          run(sessionId, inputIndices, inputs, outputIndices, new Array(outputIndices.length).fill(null), options).then(\n            (outputs) => {\n              if (outputs.some((o) => o[3] !== "cpu")) {\n                postMessage({ type: "run", err: "Proxy does not support non-cpu tensor location." });\n              } else {\n                postMessage(\n                  { type: "run", out: outputs },\n                  extractTransferableBuffers(outputs)\n                );\n              }\n            },\n            (err) => {\n              postMessage({ type: "run", err });\n            }\n          );\n        } catch (err) {\n          postMessage({ type: "run", err });\n        }\n        break;\n      case "end-profiling":\n        try {\n          const handler = ev.data.in;\n          endProfiling(handler);\n          postMessage({ type: "end-profiling" });\n        } catch (err) {\n          postMessage({ type: "end-profiling", err });\n        }\n        break;\n      case "is-ort-env-initialized":\n        try {\n          const ortEnvInitialized2 = isOrtEnvInitialized();\n          postMessage({ type: "is-ort-env-initialized", out: ortEnvInitialized2 });\n        } catch (err) {\n          postMessage({ type: "is-ort-env-initialized", err });\n        }\n        break;\n      default:\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb3JlLWltcGwudHMiLCAiLi4vLi4vbGliL3dhc20vcHJveHktd29ya2VyL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBjb25zdCByZWFkRmlsZSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGQ9bW9kdWxlQXJnLGssbDtkLnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57az1hO2w9Yn0pO3ZhciByPU9iamVjdC5hc3NpZ24oe30sZCksdj1cIi4vdGhpcy5wcm9ncmFtXCIsYWE9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyx4PVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsYmE9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLHk9XCJcIixBLEIsQztcbmlmKGJhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLEQ9cmVxdWlyZShcInBhdGhcIik7eT14P0QuZGlybmFtZSh5KStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7QT0oYSxiKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYSxiP3ZvaWQgMDpcInV0ZjhcIil9O0M9YT0+e2E9QShhLCEwKTthLmJ1ZmZlcnx8KGE9bmV3IFVpbnQ4QXJyYXkoYSkpO3JldHVybiBhfTtCPShhLGIsYyxlPSEwKT0+e2E9YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGEpOkQubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZT92b2lkIDA6XCJ1dGY4XCIsKGcsaCk9PntnP2MoZyk6YihlP2guYnVmZmVyOmgpfSl9OyFkLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJih2PXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ZC5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihhYXx8XG54KXg/eT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHk9X3NjcmlwdERpciksMCE9PXkuaW5kZXhPZihcImJsb2I6XCIpP3k9eS5zdWJzdHIoMCx5LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnk9XCJcIixBPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0seCYmKEM9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEI9KGEsYixjKT0+e3ZhciBlPW5ldyBYTUxIdHRwUmVxdWVzdDtlLm9wZW4oXCJHRVRcIixhLCEwKTtlLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtlLm9ubG9hZD0oKT0+ezIwMD09ZS5zdGF0dXN8fDA9PWUuc3RhdHVzJiZlLnJlc3BvbnNlP2IoZS5yZXNwb25zZSk6YygpfTtlLm9uZXJyb3I9YztlLnNlbmQobnVsbCl9O3ZhciBjYT1kLnByaW50fHxjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEU9ZC5wcmludEVycnx8Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZCxyKTtyPW51bGw7ZC50aGlzUHJvZ3JhbSYmKHY9ZC50aGlzUHJvZ3JhbSk7dmFyIEY7ZC53YXNtQmluYXJ5JiYoRj1kLndhc21CaW5hcnkpO3ZhciBub0V4aXRSdW50aW1lPWQubm9FeGl0UnVudGltZXx8ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZHKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgSCxJLGRhPSExLEosSyxMLE07XG5mdW5jdGlvbiBlYSgpe3ZhciBhPUguYnVmZmVyO2QuSEVBUDg9Sj1uZXcgSW50OEFycmF5KGEpO2QuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2QuSEVBUDMyPUw9bmV3IEludDMyQXJyYXkoYSk7ZC5IRUFQVTg9Sz1uZXcgVWludDhBcnJheShhKTtkLkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGEpO2QuSEVBUFUzMj1NPW5ldyBVaW50MzJBcnJheShhKTtkLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtkLkhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgZmE9W10saGE9W10saWE9W107ZnVuY3Rpb24gamEoKXt2YXIgYT1kLnByZVJ1bi5zaGlmdCgpO2ZhLnVuc2hpZnQoYSl9dmFyIE49MCxPPW51bGwsUD1udWxsO1xuZnVuY3Rpb24gRyhhKXtpZihkLm9uQWJvcnQpZC5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7RShhKTtkYT0hMDthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7bChhKTt0aHJvdyBhO31mdW5jdGlvbiBrYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgUTtRPVwib3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtXCI7aWYoIWthKFEpKXt2YXIgbGE9UTtRPWQubG9jYXRlRmlsZT9kLmxvY2F0ZUZpbGUobGEseSk6eStsYX1mdW5jdGlvbiBtYShhKXtpZihhPT1RJiZGKXJldHVybiBuZXcgVWludDhBcnJheShGKTtpZihDKXJldHVybiBDKGEpO3Rocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO31cbmZ1bmN0aW9uIG5hKGEpe2lmKCFGJiYoYWF8fHgpKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+bWEoYSkpO2lmKEIpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57QihhLGU9PmIobmV3IFVpbnQ4QXJyYXkoZSkpLGMpfSl9cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9Pm1hKGEpKX1mdW5jdGlvbiBvYShhLGIsYyl7cmV0dXJuIG5hKGEpLnRoZW4oZT0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZSxiKSkudGhlbihlPT5lKS50aGVuKGMsZT0+e0UoXCJmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiBcIitlKTtHKGUpfSl9XG5mdW5jdGlvbiBwYShhLGIpe3ZhciBjPVE7cmV0dXJuIEZ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxrYShjKXx8Yy5zdGFydHNXaXRoKFwiZmlsZTovL1wiKXx8YmF8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP29hKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGUsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0UoXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIrZyk7RShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBvYShjLGEsYil9KSl9dmFyIFIsUz1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkoZCl9O1xuZnVuY3Rpb24gcWEoYSl7dGhpcy5KYT1hLTI0O3RoaXMuTmE9ZnVuY3Rpb24oYil7TVt0aGlzLkphKzQ+PjI+Pj4wXT1ifTt0aGlzLk1hPWZ1bmN0aW9uKGIpe01bdGhpcy5KYSs4Pj4yPj4+MF09Yn07dGhpcy5LYT1mdW5jdGlvbihiLGMpe3RoaXMuTGEoKTt0aGlzLk5hKGIpO3RoaXMuTWEoYyl9O3RoaXMuTGE9ZnVuY3Rpb24oKXtNW3RoaXMuSmErMTY+PjI+Pj4wXT0wfX1cbnZhciByYT0wLHNhPTAsdGE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLHVhPShhLGIsYyk9PntiPj4+PTA7dmFyIGU9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1lKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJnRhKXJldHVybiB0YS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZT1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSllKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBtPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8bTooZyY3KTw8MTh8aDw8MTJ8bTw8NnxhW2IrK10mNjM7NjU1MzY+Zz9lKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGUrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGV9LFxuVD0oYSxiKT0+KGE+Pj49MCk/dWEoSyxhLGIpOlwiXCIsVT1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZT1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1lP2IrKzoyMDQ3Pj1lP2IrPTI6NTUyOTY8PWUmJjU3MzQzPj1lPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sVj0oYSxiLGMsZSk9PntjPj4+PTA7aWYoISgwPGUpKXJldHVybiAwO3ZhciBnPWM7ZT1jK2UtMTtmb3IodmFyIGg9MDtoPGEubGVuZ3RoOysraCl7dmFyIG09YS5jaGFyQ29kZUF0KGgpO2lmKDU1Mjk2PD1tJiY1NzM0Mz49bSl7dmFyIHE9YS5jaGFyQ29kZUF0KCsraCk7bT02NTUzNisoKG0mMTAyMyk8PDEwKXxxJjEwMjN9aWYoMTI3Pj1tKXtpZihjPj1lKWJyZWFrO2JbYysrPj4+MF09bX1lbHNle2lmKDIwNDc+PW0pe2lmKGMrMT49ZSlicmVhaztiW2MrKz4+PjBdPTE5MnxtPj42fWVsc2V7aWYoNjU1MzU+PW0pe2lmKGMrMj49ZSlicmVhaztiW2MrKz4+PjBdPTIyNHxtPj4xMn1lbHNle2lmKGMrMz49XG5lKWJyZWFrO2JbYysrPj4+MF09MjQwfG0+PjE4O2JbYysrPj4+MF09MTI4fG0+PjEyJjYzfWJbYysrPj4+MF09MTI4fG0+PjYmNjN9YltjKys+Pj4wXT0xMjh8bSY2M319YltjPj4+MF09MDtyZXR1cm4gYy1nfSxXPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksdmE9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sd2E9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sQmE9YT0+e3ZhciBiPVUoYSkrMSxjPUFhKGIpO2MmJlYoYSxLLGMsYik7cmV0dXJuIGN9LFg9e30sQ2E9KCk9PntpZighWSl7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFxuXCJfXCIpK1wiLlVURi04XCIsXzp2fHxcIi4vdGhpcy5wcm9ncmFtXCJ9LGI7Zm9yKGIgaW4gWCl2b2lkIDA9PT1YW2JdP2RlbGV0ZSBhW2JdOmFbYl09WFtiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7WT1jfXJldHVybiBZfSxZLERhPVtudWxsLFtdLFtdXSxFYT1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEZhPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gR2EoYSl7dmFyIGI9QXJyYXkoVShhKSsxKTtWKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIEhhKGEsYixjLGUpe2Z1bmN0aW9uIGcoZixuLHApe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPG47KWY9cFswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixuKXtyZXR1cm4gZyhmLG4sXCIwXCIpfWZ1bmN0aW9uIG0oZixuKXtmdW5jdGlvbiBwKHhhKXtyZXR1cm4gMD54YT8tMTowPHhhPzE6MH12YXIgejswPT09KHo9cChmLmdldEZ1bGxZZWFyKCktbi5nZXRGdWxsWWVhcigpKSkmJjA9PT0oej1wKGYuZ2V0TW9udGgoKS1uLmdldE1vbnRoKCkpKSYmKHo9cChmLmdldERhdGUoKS1uLmdldERhdGUoKSkpO3JldHVybiB6fWZ1bmN0aW9uIHEoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiB3KGYpe3ZhciBuPWYuRWE7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuRmErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8bjspe3ZhciBwPWYuZ2V0TW9udGgoKSx6PShXKGYuZ2V0RnVsbFllYXIoKSk/RWE6RmEpW3BdO2lmKG4+ei1mLmdldERhdGUoKSluLT16LWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnA/Zi5zZXRNb250aChwKzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStuKTticmVha319cD1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO249cShuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTtwPXEocCk7cmV0dXJuIDA+PW0obixmKT8wPj1tKHAsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2U+Pj49MDt2YXIgdD1MW2UrNDA+PjI+Pj4wXTtlPXtRYTpMW2U+PjI+Pj4wXSxQYTpMW2UrND4+Mj4+PjBdLEdhOkxbZSs4Pj4yPj4+MF0sSWE6TFtlKzEyPj4yPj4+MF0sSGE6TFtlKzE2Pj4yPj4+MF0sRmE6TFtlKzIwPj4yPj4+MF0semE6TFtlKzI0Pj4yPj4+MF0sRWE6TFtlKzI4Pj4yPj4+MF0sU2E6TFtlKzMyPj4yPj4+MF0sT2E6TFtlKzM2Pj4yPj4+MF0sUmE6dD9UKHQpOlwiXCJ9O2M9VChjKTt0PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXCIlWFwiOlwiJUg6JU06JVNcIixcIiVFY1wiOlwiJWNcIixcblwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHUgaW4gdCljPWMucmVwbGFjZShuZXcgUmVnRXhwKHUsXCJnXCIpLHRbdV0pO3ZhciB5YT1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLHphPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt0PXtcIiVhXCI6Zj0+eWFbZi56YV0uc3Vic3RyaW5nKDAsMyksXCIlQVwiOmY9PnlhW2YuemFdLFwiJWJcIjpmPT5cbnphW2YuSGFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT56YVtmLkhhXSxcIiVDXCI6Zj0+aCgoZi5GYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6Zj0+aChmLklhLDIpLFwiJWVcIjpmPT5nKGYuSWEsMixcIiBcIiksXCIlZ1wiOmY9PncoZikudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOmY9PncoZiksXCIlSFwiOmY9PmgoZi5HYSwyKSxcIiVJXCI6Zj0+e2Y9Zi5HYTswPT1mP2Y9MTI6MTI8ZiYmKGYtPTEyKTtyZXR1cm4gaChmLDIpfSxcIiVqXCI6Zj0+e2Zvcih2YXIgbj0wLHA9MDtwPD1mLkhhLTE7bis9KFcoZi5GYSsxOTAwKT9FYTpGYSlbcCsrXSk7cmV0dXJuIGgoZi5JYStuLDMpfSxcIiVtXCI6Zj0+aChmLkhhKzEsMiksXCIlTVwiOmY9PmgoZi5QYSwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmY9PjA8PWYuR2EmJjEyPmYuR2E/XCJBTVwiOlwiUE1cIixcIiVTXCI6Zj0+aChmLlFhLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6Zj0+Zi56YXx8NyxcIiVVXCI6Zj0+aChNYXRoLmZsb29yKChmLkVhKzctZi56YSkvNyksMiksXCIlVlwiOmY9Plxue3ZhciBuPU1hdGguZmxvb3IoKGYuRWErNy0oZi56YSs2KSU3KS83KTsyPj0oZi56YSszNzEtZi5FYS0yKSU3JiZuKys7aWYobik1Mz09biYmKHA9KGYuemErMzcxLWYuRWEpJTcsND09cHx8Mz09cCYmVyhmLkZhKXx8KG49MSkpO2Vsc2V7bj01Mjt2YXIgcD0oZi56YSs3LWYuRWEtMSklNzsoND09cHx8NT09cCYmVyhmLkZhJTQwMC0xKSkmJm4rK31yZXR1cm4gaChuLDIpfSxcIiV3XCI6Zj0+Zi56YSxcIiVXXCI6Zj0+aChNYXRoLmZsb29yKChmLkVhKzctKGYuemErNiklNykvNyksMiksXCIleVwiOmY9PihmLkZhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjpmPT5mLkZhKzE5MDAsXCIlelwiOmY9PntmPWYuT2E7dmFyIG49MDw9ZjtmPU1hdGguYWJzKGYpLzYwO3JldHVybihuP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGYvNjAqMTAwK2YlNjApKS5zbGljZSgtNCl9LFwiJVpcIjpmPT5mLlJhLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFwiXFx4MDBcXHgwMFwiKTtmb3IodSBpbiB0KWMuaW5jbHVkZXModSkmJlxuKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodSxcImdcIiksdFt1XShlKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7dT1HYShjKTtpZih1Lmxlbmd0aD5iKXJldHVybiAwO0ouc2V0KHUsYT4+PjApO3JldHVybiB1Lmxlbmd0aC0xfVxudmFyIEphPXthOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBxYShhKSkuS2EoYj4+PjAsYz4+PjApO3JhPWE7c2ErKzt0aHJvdyByYTt9LGU6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sSDpmdW5jdGlvbigpe30seDpmdW5jdGlvbigpe30sejpmdW5jdGlvbigpe30sazpmdW5jdGlvbigpe3JldHVybiAwfSxGOmZ1bmN0aW9uKCl7fSxCOmZ1bmN0aW9uKCl7fSxFOmZ1bmN0aW9uKCl7fSxnOmZ1bmN0aW9uKCl7fSx5OmZ1bmN0aW9uKCl7fSx2OmZ1bmN0aW9uKCl7fSxHOmZ1bmN0aW9uKCl7fSx3OmZ1bmN0aW9uKCl7fSxsOigpPT4hMCxvOmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtMW2M+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtMW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO0xbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO0xbYysxMj4+Mj4+PlxuMF09YS5nZXRVVENEYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7TFtjKzI4Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LHA6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0xbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0xbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7TFtjKzg+PjI+Pj4wXT1hLmdldEhvdXJzKCk7TFtjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7TFtjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO0xbYysyMD4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO0xbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7TFtjKzI4Pj4yPj4+XG4wXT0oVyhhLmdldEZ1bGxZZWFyKCkpP3ZhOndhKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtMW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGU9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0xbYyszMj4+Mj4+PjBdPShiIT1lJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGUsYikpfDB9LHE6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKExbYSsyMD4+Mj4+PjBdKzE5MDAsTFthKzE2Pj4yPj4+MF0sTFthKzEyPj4yPj4+MF0sTFthKzg+PjI+Pj4wXSxMW2ErND4+Mj4+PjBdLExbYT4+Mj4+PjBdLDApLGM9TFthKzMyPj4yPj4+MF0sZT1iLmdldFRpbWV6b25lT2Zmc2V0KCksZz0obmV3IERhdGUoYi5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksXG5oPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxtPU1hdGgubWluKGgsZyk7MD5jP0xbYSszMj4+Mj4+PjBdPU51bWJlcihnIT1oJiZtPT1lKTowPGMhPShtPT1lKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP206ZyktZSkpKTtMW2ErMjQ+PjI+Pj4wXT1iLmdldERheSgpO0xbYSsyOD4+Mj4+PjBdPShXKGIuZ2V0RnVsbFllYXIoKSk/dmE6d2EpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO0xbYT4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0xbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7TFthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7TFthKzEyPj4yPj4+MF09Yi5nZXREYXRlKCk7TFthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO0xbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiBJYSgoUj1hLDE8PStNYXRoLmFicyhSKT8wPFI/K01hdGguZmxvb3IoUi9cbjQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFItKyh+flI+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0sbTpmdW5jdGlvbigpe3JldHVybi01Mn0sbjpmdW5jdGlvbigpe30sdDpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZSh3KXtyZXR1cm4odz13LnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP3dbMV06XCJHTVRcIn1jPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLG09bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBxPW0uZ2V0VGltZXpvbmVPZmZzZXQoKTtNW2E+Pj4wPj4yPj4+MF09NjAqTWF0aC5tYXgoZyxxKTtMW2I+Pj4wPj4yPj4+MF09TnVtYmVyKGchPXEpO2E9ZShoKTtiPWUobSk7YT1CYShhKTtiPUJhKGIpO3E8Zz8oTVtjPj4yPj4+MF09YSxNW2MrND4+Mj4+PjBdPWIpOihNW2M+PjI+Pj4wXT1iLE1bYys0Pj4yPj4+MF09YSl9LGQ6KCk9PntHKFwiXCIpfSxcbmg6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sdTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxiOigpPT5wZXJmb3JtYW5jZS5ub3coKSxJOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7cmV0dXJuIEsuY29weVdpdGhpbihhPj4+MD4+PjAsYj4+PjAsYisoYz4+PjApPj4+MCl9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUsubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBlPWIqKDErLjIvYyk7ZT1NYXRoLm1pbihlLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2U9TWF0aC5tYXgoYSxlKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGUrKDY1NTM2LWUlNjU1MzYpJTY1NTM2KS1ILmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e0guZ3JvdyhnKTtlYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChtKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sQzpmdW5jdGlvbihhLGIpe2E+Pj49XG4wO2I+Pj49MDt2YXIgYz0wO0NhKCkuZm9yRWFjaChmdW5jdGlvbihlLGcpe3ZhciBoPWIrYztnPU1bYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxlLmxlbmd0aDsrK2gpSltnKys+PjA+Pj4wXT1lLmNoYXJDb2RlQXQoaCk7SltnPj4wPj4+MF09MDtjKz1lLmxlbmd0aCsxfSk7cmV0dXJuIDB9LEQ6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPUNhKCk7TVthPj4yPj4+MF09Yy5sZW5ndGg7dmFyIGU9MDtjLmZvckVhY2goZnVuY3Rpb24oZyl7ZSs9Zy5sZW5ndGgrMX0pO01bYj4+Mj4+PjBdPWU7cmV0dXJuIDB9LGY6KCk9PjUyLGo6ZnVuY3Rpb24oKXtyZXR1cm4gNTJ9LHI6ZnVuY3Rpb24oKXtyZXR1cm4gNzB9LGk6ZnVuY3Rpb24oYSxiLGMsZSl7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7Zm9yKHZhciBnPTAsaD0wO2g8YztoKyspe3ZhciBtPU1bYj4+Mj4+PjBdLHE9TVtiKzQ+PjI+Pj4wXTtiKz04O2Zvcih2YXIgdz0wO3c8cTt3Kyspe3ZhciB0PUtbbSt3Pj4+MF0sdT1cbkRhW2FdOzA9PT10fHwxMD09PXQ/KCgxPT09YT9jYTpFKSh1YSh1LDApKSx1Lmxlbmd0aD0wKTp1LnB1c2godCl9Zys9cX1NW2U+PjI+Pj4wXT1nO3JldHVybiAwfSxBOkhhLGM6ZnVuY3Rpb24oYSxiLGMsZSl7cmV0dXJuIEhhKGE+Pj4wLGI+Pj4wLGM+Pj4wLGU+Pj4wKX19O1xuKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShjKXtjPWMuZXhwb3J0cztJPWM9S2EoYyk7SD1JLko7ZWEoKTtoYS51bnNoaWZ0KEkuSyk7Ti0tO2QubW9uaXRvclJ1bkRlcGVuZGVuY2llcyYmZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzKE4pO2lmKDA9PU4mJihudWxsIT09TyYmKGNsZWFySW50ZXJ2YWwoTyksTz1udWxsKSxQKSl7dmFyIGU9UDtQPW51bGw7ZSgpfXJldHVybiBjfXZhciBiPXthOkphfTtOKys7ZC5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZkLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoTik7aWYoZC5pbnN0YW50aWF0ZVdhc20pdHJ5e3JldHVybiBkLmluc3RhbnRpYXRlV2FzbShiLGEpfWNhdGNoKGMpe0UoXCJNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiBcIitjKSxsKGMpfXBhKGIsZnVuY3Rpb24oYyl7YShjLmluc3RhbmNlKX0pLmNhdGNoKGwpO3JldHVybnt9fSkoKTtcbmQuX09ydEluaXQ9KGEsYik9PihkLl9PcnRJbml0PUkuTCkoYSxiKTtkLl9PcnRHZXRMYXN0RXJyb3I9KGEsYik9PihkLl9PcnRHZXRMYXN0RXJyb3I9SS5NKShhLGIpO2QuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxlLGcsaCxtLHEsdyx0KT0+KGQuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPUkuTikoYSxiLGMsZSxnLGgsbSxxLHcsdCk7ZC5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihkLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1JLk8pKGEsYik7ZC5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihkLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9SS5QKShhLGIsYyk7ZC5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9SS5RKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihkLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9SS5SKShhKTtcbmQuX09ydENyZWF0ZVNlc3Npb249KGEsYixjKT0+KGQuX09ydENyZWF0ZVNlc3Npb249SS5TKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVNlc3Npb249YT0+KGQuX09ydFJlbGVhc2VTZXNzaW9uPUkuVCkoYSk7ZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oZC5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1JLlUpKGEsYixjKTtkLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRJbnB1dE5hbWU9SS5WKShhLGIpO2QuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihkLl9PcnRHZXRPdXRwdXROYW1lPUkuVykoYSxiKTtkLl9PcnRGcmVlPWE9PihkLl9PcnRGcmVlPUkuWCkoYSk7ZC5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxlLGcsaCk9PihkLl9PcnRDcmVhdGVUZW5zb3I9SS5ZKShhLGIsYyxlLGcsaCk7ZC5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZSxnKT0+KGQuX09ydEdldFRlbnNvckRhdGE9SS5aKShhLGIsYyxlLGcpO1xuZC5fT3J0UmVsZWFzZVRlbnNvcj1hPT4oZC5fT3J0UmVsZWFzZVRlbnNvcj1JLl8pKGEpO2QuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGUpPT4oZC5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1JLiQpKGEsYixjLGUpO2QuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihkLl9PcnRBZGRSdW5Db25maWdFbnRyeT1JLmFhKShhLGIsYyk7ZC5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KGQuX09ydFJlbGVhc2VSdW5PcHRpb25zPUkuYmEpKGEpO2QuX09ydENyZWF0ZUJpbmRpbmc9YT0+KGQuX09ydENyZWF0ZUJpbmRpbmc9SS5jYSkoYSk7ZC5fT3J0QmluZElucHV0PShhLGIsYyk9PihkLl9PcnRCaW5kSW5wdXQ9SS5kYSkoYSxiLGMpO2QuX09ydEJpbmRPdXRwdXQ9KGEsYixjLGUpPT4oZC5fT3J0QmluZE91dHB1dD1JLmVhKShhLGIsYyxlKTtkLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oZC5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9SS5mYSkoYSk7XG5kLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZC5fT3J0UmVsZWFzZUJpbmRpbmc9SS5nYSkoYSk7ZC5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGUsZyk9PihkLl9PcnRSdW5XaXRoQmluZGluZz1JLmhhKShhLGIsYyxlLGcpO2QuX09ydFJ1bj0oYSxiLGMsZSxnLGgsbSxxKT0+KGQuX09ydFJ1bj1JLmlhKShhLGIsYyxlLGcsaCxtLHEpO2QuX09ydEVuZFByb2ZpbGluZz1hPT4oZC5fT3J0RW5kUHJvZmlsaW5nPUkuamEpKGEpO2QuX09ydFRyYWluaW5nTG9hZENoZWNrcG9pbnQ9KGEsYik9PihkLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PUkua2EpKGEsYik7ZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1hPT4oZC5fT3J0VHJhaW5pbmdSZWxlYXNlQ2hlY2twb2ludD1JLmxhKShhKTtkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249KGEsYixjLGUsZyxoLG0scSk9PihkLl9PcnRUcmFpbmluZ0NyZWF0ZVNlc3Npb249SS5tYSkoYSxiLGMsZSxnLGgsbSxxKTtcbmQuX09ydFRyYWluaW5nTGF6eVJlc2V0R3JhZD1hPT4oZC5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPUkubmEpKGEpO2QuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPShhLGIsYyxlLGcsaCk9PihkLl9PcnRUcmFpbmluZ1J1blRyYWluU3RlcD1JLm9hKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPShhLGIpPT4oZC5fT3J0VHJhaW5pbmdPcHRpbWl6ZXJTdGVwPUkucGEpKGEsYik7ZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD0oYSxiLGMsZSxnLGgpPT4oZC5fT3J0VHJhaW5pbmdFdmFsU3RlcD1JLnFhKShhLGIsYyxlLGcsaCk7ZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT0oYSxiLGMpPT4oZC5fT3J0VHJhaW5pbmdHZXRQYXJhbWV0ZXJzU2l6ZT1JLnJhKShhLGIsYyk7ZC5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc1RvQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj1JLnNhKShhLGIsYyxlKTtcbmQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNGcm9tQnVmZmVyPUkudGEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PShhLGIsYyxlKT0+KGQuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dENvdW50PUkudWEpKGEsYixjLGUpO2QuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dE5hbWU9KGEsYixjLGUpPT4oZC5fT3J0VHJhaW5pbmdHZXRNb2RlbElucHV0T3V0cHV0TmFtZT1JLnZhKShhLGIsYyxlKTtkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPWE9PihkLl9PcnRUcmFpbmluZ1JlbGVhc2VTZXNzaW9uPUkud2EpKGEpO3ZhciBBYT1kLl9tYWxsb2M9YT0+KEFhPWQuX21hbGxvYz1JLnhhKShhKTtkLl9mcmVlPWE9PihkLl9mcmVlPUkueWEpKGEpO1xudmFyIElhPWE9PihJYT1JLkFhKShhKSxMYT0oKT0+KExhPUkuQmEpKCksTWE9YT0+KE1hPUkuQ2EpKGEpLE5hPWE9PihOYT1JLkRhKShhKTtmdW5jdGlvbiBLYShhKXthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZT0+KCk9PmUoKT4+PjAsYz1lPT5nPT5lKGcpPj4+MDthLl9fZXJybm9fbG9jYXRpb249YihhLl9fZXJybm9fbG9jYXRpb24pO2EubWFsbG9jPWMoYS5tYWxsb2MpO2Euc3RhY2tTYXZlPWIoYS5zdGFja1NhdmUpO2Euc3RhY2tBbGxvYz1jKGEuc3RhY2tBbGxvYyk7cmV0dXJuIGF9ZC5zdGFja0FsbG9jPU5hO2Quc3RhY2tTYXZlPUxhO2Quc3RhY2tSZXN0b3JlPU1hO2QuVVRGOFRvU3RyaW5nPVQ7ZC5zdHJpbmdUb1VURjg9KGEsYixjKT0+VihhLEssYixjKTtkLmxlbmd0aEJ5dGVzVVRGOD1VO3ZhciBaO1A9ZnVuY3Rpb24gT2EoKXtafHxQYSgpO1p8fChQPU9hKX07XG5mdW5jdGlvbiBQYSgpe2Z1bmN0aW9uIGEoKXtpZighWiYmKFo9ITAsZC5jYWxsZWRSdW49ITAsIWRhKSl7UyhoYSk7ayhkKTtpZihkLm9uUnVudGltZUluaXRpYWxpemVkKWQub25SdW50aW1lSW5pdGlhbGl6ZWQoKTtpZihkLnBvc3RSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGQucG9zdFJ1biYmKGQucG9zdFJ1bj1bZC5wb3N0UnVuXSk7ZC5wb3N0UnVuLmxlbmd0aDspe3ZhciBiPWQucG9zdFJ1bi5zaGlmdCgpO2lhLnVuc2hpZnQoYil9UyhpYSl9fWlmKCEoMDxOKSl7aWYoZC5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGQucHJlUnVuJiYoZC5wcmVSdW49W2QucHJlUnVuXSk7ZC5wcmVSdW4ubGVuZ3RoOylqYSgpO1MoZmEpOzA8Tnx8KGQuc2V0U3RhdHVzPyhkLnNldFN0YXR1cyhcIlJ1bm5pbmcuLi5cIiksc2V0VGltZW91dChmdW5jdGlvbigpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkLnNldFN0YXR1cyhcIlwiKX0sMSk7YSgpfSwxKSk6YSgpKX19XG5pZihkLnByZUluaXQpZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIGQucHJlSW5pdCYmKGQucHJlSW5pdD1bZC5wcmVJbml0XSk7MDxkLnByZUluaXQubGVuZ3RoOylkLnByZUluaXQucG9wKCkoKTtQYSgpO1xuXG5cbiAgcmV0dXJuIG1vZHVsZUFyZy5yZWFkeVxufVxuXG4pO1xufSkoKTtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbTtcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSlcbiAgZGVmaW5lKFtdLCAoKSA9PiBvcnRXYXNtKTtcbiIsICIiLCAiIiwgImV4cG9ydCBjb25zdCBjcHVzID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtVGhyZWFkZWQgPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxuZnVuY3Rpb24gYWEoKXtkLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gbH1mdW5jdGlvbiBuKCl7ZC5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGJhfWZ1bmN0aW9uIHAoKXtkLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gY2F9ZnVuY3Rpb24gcigpe2QuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBkYX1mdW5jdGlvbiBlYSgpe2QuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBmYX12YXIgdz1tb2R1bGVBcmcsaGEseDt3LnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57aGE9YTt4PWJ9KTtcbnZhciBpYT1PYmplY3QuYXNzaWduKHt9LHcpLGphPVwiLi90aGlzLnByb2dyYW1cIix6PShhLGIpPT57dGhyb3cgYjt9LGthPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3csQT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpbXBvcnRTY3JpcHRzLEI9XCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MmJlwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zJiZcInN0cmluZ1wiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLEQ9dy5FTlZJUk9OTUVOVF9JU19QVEhSRUFEfHwhMSxFPVwiXCI7ZnVuY3Rpb24gbGEoYSl7cmV0dXJuIHcubG9jYXRlRmlsZT93LmxvY2F0ZUZpbGUoYSxFKTpFK2F9dmFyIG1hLEYsSDtcbmlmKEIpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksbmE9cmVxdWlyZShcInBhdGhcIik7RT1BP25hLmRpcm5hbWUoRSkrXCIvXCI6X19kaXJuYW1lK1wiL1wiO21hPShiLGMpPT57Yj1iLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpP25ldyBVUkwoYik6bmEubm9ybWFsaXplKGIpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYixjP3ZvaWQgMDpcInV0ZjhcIil9O0g9Yj0+e2I9bWEoYiwhMCk7Yi5idWZmZXJ8fChiPW5ldyBVaW50OEFycmF5KGIpKTtyZXR1cm4gYn07Rj0oYixjLGUsaD0hMCk9PntiPWIuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChiKTpuYS5ub3JtYWxpemUoYik7ZnMucmVhZEZpbGUoYixoP3ZvaWQgMDpcInV0ZjhcIiwoZyxrKT0+e2c/ZShnKTpjKGg/ay5idWZmZXI6ayl9KX07IXcudGhpc1Byb2dyYW0mJjE8cHJvY2Vzcy5hcmd2Lmxlbmd0aCYmKGphPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7ej0oYixjKT0+e3Byb2Nlc3MuZXhpdENvZGU9XG5iO3Rocm93IGM7fTt3Lmluc3BlY3Q9KCk9PlwiW0Vtc2NyaXB0ZW4gTW9kdWxlIG9iamVjdF1cIjtsZXQgYTt0cnl7YT1yZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIil9Y2F0Y2goYil7dGhyb3cgY29uc29sZS5lcnJvcignVGhlIFwid29ya2VyX3RocmVhZHNcIiBtb2R1bGUgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIG5vZGUuanMgYnVpbGQgLSBwZXJoYXBzIGEgbmV3ZXIgdmVyc2lvbiBpcyBuZWVkZWQ/JyksYjt9Z2xvYmFsLldvcmtlcj1hLldvcmtlcn1lbHNlIGlmKGthfHxBKUE/RT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoRT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksKHR5cGVvZiBfc2NyaXB0RGlyICE9PSBcInVuZGVmaW5lZFwiICYmIF9zY3JpcHREaXIpJiYoRT1fc2NyaXB0RGlyKSwwIT09RS5pbmRleE9mKFwiYmxvYjpcIik/RT1FLnN1YnN0cigwLEUucmVwbGFjZSgvWz8jXS4qLyxcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikrMSk6RT1cIlwiLEJ8fChtYT1hPT57dmFyIGI9XG5uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sQSYmKEg9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEY9KGEsYixjKT0+e3ZhciBlPW5ldyBYTUxIdHRwUmVxdWVzdDtlLm9wZW4oXCJHRVRcIixhLCEwKTtlLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7ZS5vbmxvYWQ9KCk9PnsyMDA9PWUuc3RhdHVzfHwwPT1lLnN0YXR1cyYmZS5yZXNwb25zZT9iKGUucmVzcG9uc2UpOmMoKX07ZS5vbmVycm9yPWM7ZS5zZW5kKG51bGwpfSk7QiYmXCJ1bmRlZmluZWRcIj09dHlwZW9mIHBlcmZvcm1hbmNlJiYoZ2xvYmFsLnBlcmZvcm1hbmNlPXJlcXVpcmUoXCJwZXJmX2hvb2tzXCIpLnBlcmZvcm1hbmNlKTtcbnZhciBvYT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHBhPWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtCJiYob2E9KC4uLmEpPT5mcy53cml0ZVN5bmMoMSxhLmpvaW4oXCIgXCIpK1wiXFxuXCIpLHBhPSguLi5hKT0+ZnMud3JpdGVTeW5jKDIsYS5qb2luKFwiIFwiKStcIlxcblwiKSk7dmFyIHFhPXcucHJpbnR8fG9hLEk9dy5wcmludEVycnx8cGE7T2JqZWN0LmFzc2lnbih3LGlhKTtpYT1udWxsO3cudGhpc1Byb2dyYW0mJihqYT13LnRoaXNQcm9ncmFtKTt3LnF1aXQmJih6PXcucXVpdCk7dmFyIEo7dy53YXNtQmluYXJ5JiYoSj13Lndhc21CaW5hcnkpO3ZhciBub0V4aXRSdW50aW1lPXcubm9FeGl0UnVudGltZXx8ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZLKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgZCxMLHJhLE09ITEsTixsLGJhLGNhLGRhLGZhO1xuZnVuY3Rpb24gbSgpe3ZhciBhPWQuYnVmZmVyO3cuSEVBUDg9bD1uZXcgSW50OEFycmF5KGEpO3cuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO3cuSEVBUDMyPWNhPW5ldyBJbnQzMkFycmF5KGEpO3cuSEVBUFU4PWJhPW5ldyBVaW50OEFycmF5KGEpO3cuSEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYSk7dy5IRUFQVTMyPWRhPW5ldyBVaW50MzJBcnJheShhKTt3LkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTt3LkhFQVBGNjQ9ZmE9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgTz13LklOSVRJQUxfTUVNT1JZfHwxNjc3NzIxNjs1MjQyODgwPD1PfHxLKFwiSU5JVElBTF9NRU1PUlkgc2hvdWxkIGJlIGxhcmdlciB0aGFuIFNUQUNLX1NJWkUsIHdhcyBcIitPK1wiISAoU1RBQ0tfU0laRT01MjQyODgwKVwiKTtcbmlmKEQpZD13Lndhc21NZW1vcnk7ZWxzZSBpZih3Lndhc21NZW1vcnkpZD13Lndhc21NZW1vcnk7ZWxzZSBpZihkPW5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6Ty82NTUzNixtYXhpbXVtOjY1NTM2LHNoYXJlZDohMH0pLCEoZC5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikpdGhyb3cgSShcInJlcXVlc3RlZCBhIHNoYXJlZCBXZWJBc3NlbWJseS5NZW1vcnkgYnV0IHRoZSByZXR1cm5lZCBidWZmZXIgaXMgbm90IGEgU2hhcmVkQXJyYXlCdWZmZXIsIGluZGljYXRpbmcgdGhhdCB3aGlsZSB0aGUgYnJvd3NlciBoYXMgU2hhcmVkQXJyYXlCdWZmZXIgaXQgZG9lcyBub3QgaGF2ZSBXZWJBc3NlbWJseSB0aHJlYWRzIHN1cHBvcnQgLSB5b3UgbWF5IG5lZWQgdG8gc2V0IGEgZmxhZ1wiKSxCJiZJKFwiKG9uIG5vZGUgeW91IG1heSBuZWVkOiAtLWV4cGVyaW1lbnRhbC13YXNtLXRocmVhZHMgLS1leHBlcmltZW50YWwtd2FzbS1idWxrLW1lbW9yeSBhbmQvb3IgcmVjZW50IHZlcnNpb24pXCIpLFxuRXJyb3IoXCJiYWQgbWVtb3J5XCIpO20oKTtPPWQuYnVmZmVyLmJ5dGVMZW5ndGg7dmFyIHNhLHRhPVtdLHVhPVtdLHZhPVtdLHdhPTA7ZnVuY3Rpb24gUCgpe3JldHVybiBub0V4aXRSdW50aW1lfHwwPHdhfXZhciBRPTAseGE9bnVsbCxSPW51bGw7ZnVuY3Rpb24geWEoKXtRKys7dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUSl9ZnVuY3Rpb24gemEoKXtRLS07dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUSk7aWYoMD09USYmKG51bGwhPT14YSYmKGNsZWFySW50ZXJ2YWwoeGEpLHhhPW51bGwpLFIpKXt2YXIgYT1SO1I9bnVsbDthKCl9fVxuZnVuY3Rpb24gSyhhKXtpZih3Lm9uQWJvcnQpdy5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7SShhKTtNPSEwO049MTthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7eChhKTt0aHJvdyBhO31mdW5jdGlvbiBBYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgUztTPVwib3J0LXdhc20tdGhyZWFkZWQud2FzbVwiO0FhKFMpfHwoUz1sYShTKSk7ZnVuY3Rpb24gQmEoYSl7aWYoYT09UyYmSilyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoSik7aWYoSClyZXR1cm4gSChhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBDYShhKXtpZighSiYmKGthfHxBKSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFhLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PkJhKGEpKTtpZihGKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e0YoYSxlPT5iKG5ldyBVaW50OEFycmF5KGUpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5CYShhKSl9ZnVuY3Rpb24gRGEoYSxiLGMpe3JldHVybiBDYShhKS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGUsYikpLnRoZW4oZT0+ZSkudGhlbihjLGU9PntJKFwiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogXCIrZSk7SyhlKX0pfVxuZnVuY3Rpb24gRWEoYSxiKXt2YXIgYz1TO3JldHVybiBKfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8QWEoYyl8fGMuc3RhcnRzV2l0aChcImZpbGU6Ly9cIil8fEJ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP0RhKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGU9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGUsYSkudGhlbihiLGZ1bmN0aW9uKGgpe0koXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIraCk7SShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBEYShjLGEsYil9KSl9dmFyIFQ7ZnVuY3Rpb24gVShhKXt0aGlzLm5hbWU9XCJFeGl0U3RhdHVzXCI7dGhpcy5tZXNzYWdlPWBQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCR7YX0pYDt0aGlzLnN0YXR1cz1hfVxuZnVuY3Rpb24gRmEoYSl7YS50ZXJtaW5hdGUoKTthLm9ubWVzc2FnZT0oKT0+e319ZnVuY3Rpb24gR2EoYSl7KGE9Vi5MYVthXSl8fEsoKTtWLmxiKGEpfWZ1bmN0aW9uIEhhKGEpe3ZhciBiPVYuZmIoKTtpZighYilyZXR1cm4gNjtWLk9hLnB1c2goYik7Vi5MYVthLk5hXT1iO2IuTmE9YS5OYTt2YXIgYz17Y21kOlwicnVuXCIsc3RhcnRfcm91dGluZTphLm1iLGFyZzphLmViLHB0aHJlYWRfcHRyOmEuTmF9O0ImJmIudW5yZWYoKTtiLnBvc3RNZXNzYWdlKGMsYS5zYik7cmV0dXJuIDB9XG52YXIgSWE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLEphPShhLGIsYyk9PntiPj4+PTA7dmFyIGU9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1lKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJklhKXJldHVybiBJYS5kZWNvZGUoYS5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcj9hLnNsaWNlKGIsYyk6YS5zdWJhcnJheShiLGMpKTtmb3IoZT1cIlwiO2I8Yzspe3ZhciBoPWFbYisrXTtpZihoJjEyOCl7dmFyIGc9YVtiKytdJjYzO2lmKDE5Mj09KGgmMjI0KSllKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChoJjMxKTw8NnxnKTtlbHNle3ZhciBrPWFbYisrXSY2MztoPTIyND09KGgmMjQwKT8oaCYxNSk8PDEyfGc8PDZ8azooaCY3KTw8MTh8Zzw8MTJ8azw8NnxhW2IrK10mNjM7NjU1MzY+aD9lKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGgpOihoLT02NTUzNixlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGg+PlxuMTAsNTYzMjB8aCYxMDIzKSl9fWVsc2UgZSs9U3RyaW5nLmZyb21DaGFyQ29kZShoKX1yZXR1cm4gZX0sS2E9KGEsYik9PihhPj4+PTApP0phKG4oKSxhLGIpOlwiXCI7ZnVuY3Rpb24gTGEoYSl7aWYoRClyZXR1cm4gVygxLDEsYSk7Tj1hO2lmKCFQKCkpe1YubmIoKTtpZih3Lm9uRXhpdCl3Lm9uRXhpdChhKTtNPSEwfXooYSxuZXcgVShhKSl9XG52YXIgTmE9YT0+e049YTtpZihEKXRocm93IE1hKGEpLFwidW53aW5kXCI7TGEoYSl9LFY9e1JhOltdLE9hOltdLFphOltdLExhOnt9LFZhOmZ1bmN0aW9uKCl7RD9WLmhiKCk6Vi5nYigpfSxnYjpmdW5jdGlvbigpe3RhLnVuc2hpZnQoKCk9Pnt5YSgpO1YuaWIoKCk9PnphKCkpfSl9LGhiOmZ1bmN0aW9uKCl7Vi5yZWNlaXZlT2JqZWN0VHJhbnNmZXI9Vi5rYjtWLnRocmVhZEluaXRUTFM9Vi5ZYTtWLnNldEV4aXRTdGF0dXM9Vi5YYTtub0V4aXRSdW50aW1lPSExfSxYYTpmdW5jdGlvbihhKXtOPWF9LHhiOltcIiR0ZXJtaW5hdGVXb3JrZXJcIl0sbmI6ZnVuY3Rpb24oKXtmb3IodmFyIGEgb2YgVi5PYSlGYShhKTtmb3IoYSBvZiBWLlJhKUZhKGEpO1YuUmE9W107Vi5PYT1bXTtWLkxhPVtdfSxsYjpmdW5jdGlvbihhKXt2YXIgYj1hLk5hO2RlbGV0ZSBWLkxhW2JdO1YuUmEucHVzaChhKTtWLk9hLnNwbGljZShWLk9hLmluZGV4T2YoYSksMSk7YS5OYT0wO09hKGIpfSxrYjpmdW5jdGlvbigpe30sXG5ZYTpmdW5jdGlvbigpe1YuWmEuZm9yRWFjaChhPT5hKCkpfSxqYjphPT5uZXcgUHJvbWlzZShiPT57YS5vbm1lc3NhZ2U9Zz0+e2c9Zy5kYXRhO3ZhciBrPWcuY21kO2lmKGcudGFyZ2V0VGhyZWFkJiZnLnRhcmdldFRocmVhZCE9WCgpKXt2YXIgdD1WLkxhW2cud2JdO3Q/dC5wb3N0TWVzc2FnZShnLGcudHJhbnNmZXJMaXN0KTpJKCdJbnRlcm5hbCBlcnJvciEgV29ya2VyIHNlbnQgYSBtZXNzYWdlIFwiJytrKydcIiB0byB0YXJnZXQgcHRocmVhZCAnK2cudGFyZ2V0VGhyZWFkK1wiLCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFcIil9ZWxzZSBpZihcImNoZWNrTWFpbGJveFwiPT09aylZKCk7ZWxzZSBpZihcInNwYXduVGhyZWFkXCI9PT1rKUhhKGcpO2Vsc2UgaWYoXCJjbGVhbnVwVGhyZWFkXCI9PT1rKUdhKGcudGhyZWFkKTtlbHNlIGlmKFwia2lsbFRocmVhZFwiPT09aylnPWcudGhyZWFkLGs9Vi5MYVtnXSxkZWxldGUgVi5MYVtnXSxGYShrKSxPYShnKSxWLk9hLnNwbGljZShWLk9hLmluZGV4T2YoayksXG4xKSxrLk5hPTA7ZWxzZSBpZihcImNhbmNlbFRocmVhZFwiPT09aylWLkxhW2cudGhyZWFkXS5wb3N0TWVzc2FnZSh7Y21kOlwiY2FuY2VsXCJ9KTtlbHNlIGlmKFwibG9hZGVkXCI9PT1rKWEubG9hZGVkPSEwLGIoYSk7ZWxzZSBpZihcImFsZXJ0XCI9PT1rKWFsZXJ0KFwiVGhyZWFkIFwiK2cudGhyZWFkSWQrXCI6IFwiK2cudGV4dCk7ZWxzZSBpZihcInNldGltbWVkaWF0ZVwiPT09Zy50YXJnZXQpYS5wb3N0TWVzc2FnZShnKTtlbHNlIGlmKFwiY2FsbEhhbmRsZXJcIj09PWspd1tnLmhhbmRsZXJdKC4uLmcuYXJncyk7ZWxzZSBrJiZJKFwid29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kIFwiK2spfTthLm9uZXJyb3I9Zz0+e0koXCJ3b3JrZXIgc2VudCBhbiBlcnJvciEgXCIrZy5maWxlbmFtZStcIjpcIitnLmxpbmVubytcIjogXCIrZy5tZXNzYWdlKTt0aHJvdyBnO307QiYmKGEub24oXCJtZXNzYWdlXCIsZnVuY3Rpb24oZyl7YS5vbm1lc3NhZ2Uoe2RhdGE6Z30pfSksYS5vbihcImVycm9yXCIsZnVuY3Rpb24oZyl7YS5vbmVycm9yKGcpfSkpO1xudmFyIGM9W10sZT1bXCJvbkV4aXRcIixcIm9uQWJvcnRcIixcInByaW50XCIsXCJwcmludEVyclwiXSxoO2ZvcihoIG9mIGUpdy5oYXNPd25Qcm9wZXJ0eShoKSYmYy5wdXNoKGgpO2EucG9zdE1lc3NhZ2Uoe2NtZDpcImxvYWRcIixoYW5kbGVyczpjLHVybE9yQmxvYjp3Lm1haW5TY3JpcHRVcmxPckJsb2J8fF9zY3JpcHREaXIsd2FzbU1lbW9yeTpkLHdhc21Nb2R1bGU6cmF9KX0pLGliOmZ1bmN0aW9uKGEpe2EoKX0sY2I6ZnVuY3Rpb24oKXt2YXIgYT1sYShcIm9ydC13YXNtLXRocmVhZGVkLndvcmtlci5qc1wiKTthPW5ldyBXb3JrZXIoYSk7Vi5SYS5wdXNoKGEpfSxmYjpmdW5jdGlvbigpezA9PVYuUmEubGVuZ3RoJiYoVi5jYigpLFYuamIoVi5SYVswXSkpO3JldHVybiBWLlJhLnBvcCgpfX07dy5QVGhyZWFkPVY7dmFyIFBhPWE9Pntmb3IoOzA8YS5sZW5ndGg7KWEuc2hpZnQoKSh3KX07XG53LmVzdGFibGlzaFN0YWNrU3BhY2U9ZnVuY3Rpb24oKXt2YXIgYT1YKCksYj1wKClbYSs1Mj4+Mj4+PjBdO2E9cCgpW2ErNTY+PjI+Pj4wXTtRYShiLGItYSk7UmEoYil9O2Z1bmN0aW9uIE1hKGEpe2lmKEQpcmV0dXJuIFcoMiwwLGEpO05hKGEpfXZhciBTYT1bXTt3Lmludm9rZUVudHJ5UG9pbnQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz1TYVthXTtjfHwoYT49U2EubGVuZ3RoJiYoU2EubGVuZ3RoPWErMSksU2FbYV09Yz1zYS5nZXQoYSkpO2E9YyhiKTtQKCk/Vi5YYShhKTpUYShhKX07ZnVuY3Rpb24gVWEoYSl7dGhpcy5VYT1hLTI0O3RoaXMuYmI9ZnVuY3Rpb24oYil7cigpW3RoaXMuVWErND4+Mj4+PjBdPWJ9O3RoaXMuYWI9ZnVuY3Rpb24oYil7cigpW3RoaXMuVWErOD4+Mj4+PjBdPWJ9O3RoaXMuVmE9ZnVuY3Rpb24oYixjKXt0aGlzLiRhKCk7dGhpcy5iYihiKTt0aGlzLmFiKGMpfTt0aGlzLiRhPWZ1bmN0aW9uKCl7cigpW3RoaXMuVWErMTY+PjI+Pj4wXT0wfX1cbnZhciBWYT0wLFdhPTA7ZnVuY3Rpb24gWGEoYSxiLGMsZSl7cmV0dXJuIEQ/VygzLDEsYSxiLGMsZSk6WWEoYSxiLGMsZSl9ZnVuY3Rpb24gWWEoYSxiLGMsZSl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZT4+Pj0wO2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlcilyZXR1cm4gSShcIkN1cnJlbnQgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCBTaGFyZWRBcnJheUJ1ZmZlciwgcHRocmVhZHMgYXJlIG5vdCBhdmFpbGFibGUhXCIpLDY7dmFyIGg9W107aWYoRCYmMD09PWgubGVuZ3RoKXJldHVybiBYYShhLGIsYyxlKTthPXttYjpjLE5hOmEsZWI6ZSxzYjpofTtyZXR1cm4gRD8oYS51Yj1cInNwYXduVGhyZWFkXCIscG9zdE1lc3NhZ2UoYSxoKSwwKTpIYShhKX1mdW5jdGlvbiBaYShhLGIsYyl7cmV0dXJuIEQ/Vyg0LDEsYSxiLGMpOjB9ZnVuY3Rpb24gJGEoYSxiKXtpZihEKXJldHVybiBXKDUsMSxhLGIpfVxudmFyIGFiPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBlPWEuY2hhckNvZGVBdChjKTsxMjc+PWU/YisrOjIwNDc+PWU/Yis9Mjo1NTI5Njw9ZSYmNTczNDM+PWU/KGIrPTQsKytjKTpiKz0zfXJldHVybiBifSxiYj0oYSxiLGMsZSk9PntjPj4+PTA7aWYoISgwPGUpKXJldHVybiAwO3ZhciBoPWM7ZT1jK2UtMTtmb3IodmFyIGc9MDtnPGEubGVuZ3RoOysrZyl7dmFyIGs9YS5jaGFyQ29kZUF0KGcpO2lmKDU1Mjk2PD1rJiY1NzM0Mz49ayl7dmFyIHQ9YS5jaGFyQ29kZUF0KCsrZyk7az02NTUzNisoKGsmMTAyMyk8PDEwKXx0JjEwMjN9aWYoMTI3Pj1rKXtpZihjPj1lKWJyZWFrO2JbYysrPj4+MF09a31lbHNle2lmKDIwNDc+PWspe2lmKGMrMT49ZSlicmVhaztiW2MrKz4+PjBdPTE5MnxrPj42fWVsc2V7aWYoNjU1MzU+PWspe2lmKGMrMj49ZSlicmVhaztiW2MrKz4+PjBdPTIyNHxrPj4xMn1lbHNle2lmKGMrMz49ZSlicmVhaztiW2MrKz4+PjBdPTI0MHxrPj5cbjE4O2JbYysrPj4+MF09MTI4fGs+PjEyJjYzfWJbYysrPj4+MF09MTI4fGs+PjYmNjN9YltjKys+Pj4wXT0xMjh8ayY2M319YltjPj4+MF09MDtyZXR1cm4gYy1ofSxjYj0oYSxiLGMpPT5iYihhLG4oKSxiLGMpO2Z1bmN0aW9uIGRiKGEsYil7aWYoRClyZXR1cm4gVyg2LDEsYSxiKX1mdW5jdGlvbiBlYihhLGIsYyl7aWYoRClyZXR1cm4gVyg3LDEsYSxiLGMpfWZ1bmN0aW9uIGZiKGEsYixjKXtyZXR1cm4gRD9XKDgsMSxhLGIsYyk6MH1mdW5jdGlvbiBnYihhLGIpe2lmKEQpcmV0dXJuIFcoOSwxLGEsYil9ZnVuY3Rpb24gaGIoYSxiLGMpe2lmKEQpcmV0dXJuIFcoMTAsMSxhLGIsYyl9ZnVuY3Rpb24gaWIoYSxiLGMsZSl7aWYoRClyZXR1cm4gVygxMSwxLGEsYixjLGUpfWZ1bmN0aW9uIGpiKGEsYixjLGUpe2lmKEQpcmV0dXJuIFcoMTIsMSxhLGIsYyxlKX1mdW5jdGlvbiBrYihhLGIsYyxlKXtpZihEKXJldHVybiBXKDEzLDEsYSxiLGMsZSl9XG5mdW5jdGlvbiBsYihhKXtpZihEKXJldHVybiBXKDE0LDEsYSl9ZnVuY3Rpb24gbWIoYSxiKXtpZihEKXJldHVybiBXKDE1LDEsYSxiKX1mdW5jdGlvbiBuYihhLGIsYyl7aWYoRClyZXR1cm4gVygxNiwxLGEsYixjKX12YXIgb2I9YT0+e2lmKCFNKXRyeXtpZihhKCksIVAoKSl0cnl7RD9UYShOKTpOYShOKX1jYXRjaChiKXtiIGluc3RhbmNlb2YgVXx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX1jYXRjaChiKXtiIGluc3RhbmNlb2YgVXx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX07ZnVuY3Rpb24gcGIoYSl7YT4+Pj0wO1wiZnVuY3Rpb25cIj09PXR5cGVvZiBBdG9taWNzLnRiJiYoQXRvbWljcy50YihwKCksYT4+MixhKS52YWx1ZS50aGVuKFkpLGErPTEyOCxBdG9taWNzLnN0b3JlKHAoKSxhPj4yLDEpKX13Ll9fZW1zY3JpcHRlbl90aHJlYWRfbWFpbGJveF9hd2FpdD1wYjtmdW5jdGlvbiBZKCl7dmFyIGE9WCgpO2EmJihwYihhKSxvYigoKT0+cWIoKSkpfXcuY2hlY2tNYWlsYm94PVk7XG52YXIgWj1hPT4wPT09YSU0JiYoMCE9PWElMTAwfHwwPT09YSU0MDApLHJiPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHNiPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdO2Z1bmN0aW9uIHRiKGEsYixjLGUsaCxnLGssdCl7cmV0dXJuIEQ/VygxNywxLGEsYixjLGUsaCxnLGssdCk6LTUyfWZ1bmN0aW9uIHViKGEsYixjLGUsaCxnLGspe2lmKEQpcmV0dXJuIFcoMTgsMSxhLGIsYyxlLGgsZyxrKX12YXIgd2I9YT0+e3ZhciBiPWFiKGEpKzEsYz12YihiKTtjJiZjYihhLGMsYik7cmV0dXJuIGN9LHliPWE9Pnt2YXIgYj14YigpO2E9YSgpO1JhKGIpO3JldHVybiBhfTtcbmZ1bmN0aW9uIFcoYSxiKXt2YXIgYz1hcmd1bWVudHMubGVuZ3RoLTIsZT1hcmd1bWVudHM7cmV0dXJuIHliKCgpPT57Zm9yKHZhciBoPXpiKDgqYyksZz1oPj4zLGs9MDtrPGM7aysrKXt2YXIgdD1lWzIra107ZWEoKVtnK2s+Pj4wXT10fXJldHVybiBBYihhLGMsaCxiKX0pfVxudmFyIEJiPVtdLENiPXt9LEViPSgpPT57aWYoIURiKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpqYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIENiKXZvaWQgMD09PUNiW2JdP2RlbGV0ZSBhW2JdOmFbYl09Q2JbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO0RiPWN9cmV0dXJuIERifSxEYjtcbmZ1bmN0aW9uIEZiKGEsYil7aWYoRClyZXR1cm4gVygxOSwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz0wO0ViKCkuZm9yRWFjaChmdW5jdGlvbihlLGgpe3ZhciBnPWIrYztoPXIoKVthKzQqaD4+Mj4+PjBdPWc7Zm9yKGc9MDtnPGUubGVuZ3RoOysrZylhYSgpW2grKz4+MD4+PjBdPWUuY2hhckNvZGVBdChnKTthYSgpW2g+PjA+Pj4wXT0wO2MrPWUubGVuZ3RoKzF9KTtyZXR1cm4gMH1mdW5jdGlvbiBHYihhLGIpe2lmKEQpcmV0dXJuIFcoMjAsMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9RWIoKTtyKClbYT4+Mj4+PjBdPWMubGVuZ3RoO3ZhciBlPTA7Yy5mb3JFYWNoKGZ1bmN0aW9uKGgpe2UrPWgubGVuZ3RoKzF9KTtyKClbYj4+Mj4+PjBdPWU7cmV0dXJuIDB9ZnVuY3Rpb24gSGIoYSl7cmV0dXJuIEQ/VygyMSwxLGEpOjUyfWZ1bmN0aW9uIExiKGEsYixjLGUpe3JldHVybiBEP1coMjIsMSxhLGIsYyxlKTo1Mn1cbmZ1bmN0aW9uIE1iKGEsYixjLGUsaCl7cmV0dXJuIEQ/VygyMywxLGEsYixjLGUsaCk6NzB9dmFyIE5iPVtudWxsLFtdLFtdXTtmdW5jdGlvbiBPYihhLGIsYyxlKXtpZihEKXJldHVybiBXKDI0LDEsYSxiLGMsZSk7Yj4+Pj0wO2M+Pj49MDtlPj4+PTA7Zm9yKHZhciBoPTAsZz0wO2c8YztnKyspe3ZhciBrPXIoKVtiPj4yPj4+MF0sdD1yKClbYis0Pj4yPj4+MF07Yis9ODtmb3IodmFyIEM9MDtDPHQ7QysrKXt2YXIgdj1uKClbaytDPj4+MF0seT1OYlthXTswPT09dnx8MTA9PT12PygoMT09PWE/cWE6SSkoSmEoeSwwKSkseS5sZW5ndGg9MCk6eS5wdXNoKHYpfWgrPXR9cigpW2U+PjI+Pj4wXT1oO3JldHVybiAwfXZhciBQYj1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLFFiPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gUmIoYSl7dmFyIGI9QXJyYXkoYWIoYSkrMSk7YmIoYSxiLDAsYi5sZW5ndGgpO3JldHVybiBifVxudmFyIFNiPShhLGIpPT57YWEoKS5zZXQoYSxiPj4+MCl9O1xuZnVuY3Rpb24gVGIoYSxiLGMsZSl7ZnVuY3Rpb24gaChmLHEsdSl7Zm9yKGY9XCJudW1iZXJcIj09dHlwZW9mIGY/Zi50b1N0cmluZygpOmZ8fFwiXCI7Zi5sZW5ndGg8cTspZj11WzBdK2Y7cmV0dXJuIGZ9ZnVuY3Rpb24gZyhmLHEpe3JldHVybiBoKGYscSxcIjBcIil9ZnVuY3Rpb24gayhmLHEpe2Z1bmN0aW9uIHUoSWIpe3JldHVybiAwPkliPy0xOjA8SWI/MTowfXZhciBHOzA9PT0oRz11KGYuZ2V0RnVsbFllYXIoKS1xLmdldEZ1bGxZZWFyKCkpKSYmMD09PShHPXUoZi5nZXRNb250aCgpLXEuZ2V0TW9udGgoKSkpJiYoRz11KGYuZ2V0RGF0ZSgpLXEuZ2V0RGF0ZSgpKSk7cmV0dXJuIEd9ZnVuY3Rpb24gdChmKXtzd2l0Y2goZi5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBmO2Nhc2UgMjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMSk7Y2FzZSA2OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIEMoZil7dmFyIHE9Zi5QYTtmb3IoZj1uZXcgRGF0ZSgobmV3IERhdGUoZi5RYSsxOTAwLDAsMSkpLmdldFRpbWUoKSk7MDxxOyl7dmFyIHU9Zi5nZXRNb250aCgpLEc9KFooZi5nZXRGdWxsWWVhcigpKT9QYjpRYilbdV07aWYocT5HLWYuZ2V0RGF0ZSgpKXEtPUctZi5nZXREYXRlKCkrMSxmLnNldERhdGUoMSksMTE+dT9mLnNldE1vbnRoKHUrMSk6KGYuc2V0TW9udGgoMCksZi5zZXRGdWxsWWVhcihmLmdldEZ1bGxZZWFyKCkrMSkpO2Vsc2V7Zi5zZXREYXRlKGYuZ2V0RGF0ZSgpK3EpO2JyZWFrfX11PW5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSsxLDAsNCk7cT10KG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSxcbjAsNCkpO3U9dCh1KTtyZXR1cm4gMD49ayhxLGYpPzA+PWsodSxmKT9mLmdldEZ1bGxZZWFyKCkrMTpmLmdldEZ1bGxZZWFyKCk6Zi5nZXRGdWxsWWVhcigpLTF9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZT4+Pj0wO3ZhciB2PXAoKVtlKzQwPj4yPj4+MF07ZT17cWI6cCgpW2U+PjI+Pj4wXSxwYjpwKClbZSs0Pj4yPj4+MF0sU2E6cCgpW2UrOD4+Mj4+PjBdLFdhOnAoKVtlKzEyPj4yPj4+MF0sVGE6cCgpW2UrMTY+PjI+Pj4wXSxRYTpwKClbZSsyMD4+Mj4+PjBdLE1hOnAoKVtlKzI0Pj4yPj4+MF0sUGE6cCgpW2UrMjg+PjI+Pj4wXSx5YjpwKClbZSszMj4+Mj4+PjBdLG9iOnAoKVtlKzM2Pj4yPj4+MF0scmI6dj9LYSh2KTpcIlwifTtjPUthKGMpO3Y9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcblwiJVhcIjpcIiVIOiVNOiVTXCIsXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgeSBpbiB2KWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeSxcImdcIiksdlt5XSk7dmFyIEpiPVwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdChcIiBcIiksS2I9XCJKYW51YXJ5IEZlYnJ1YXJ5IE1hcmNoIEFwcmlsIE1heSBKdW5lIEp1bHkgQXVndXN0IFNlcHRlbWJlciBPY3RvYmVyIE5vdmVtYmVyIERlY2VtYmVyXCIuc3BsaXQoXCIgXCIpO3Y9e1wiJWFcIjpmPT5KYltmLk1hXS5zdWJzdHJpbmcoMCwzKSxcblwiJUFcIjpmPT5KYltmLk1hXSxcIiViXCI6Zj0+S2JbZi5UYV0uc3Vic3RyaW5nKDAsMyksXCIlQlwiOmY9PktiW2YuVGFdLFwiJUNcIjpmPT5nKChmLlFhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5nKGYuV2EsMiksXCIlZVwiOmY9PmgoZi5XYSwyLFwiIFwiKSxcIiVnXCI6Zj0+QyhmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+QyhmKSxcIiVIXCI6Zj0+ZyhmLlNhLDIpLFwiJUlcIjpmPT57Zj1mLlNhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBnKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciBxPTAsdT0wO3U8PWYuVGEtMTtxKz0oWihmLlFhKzE5MDApP1BiOlFiKVt1KytdKTtyZXR1cm4gZyhmLldhK3EsMyl9LFwiJW1cIjpmPT5nKGYuVGErMSwyKSxcIiVNXCI6Zj0+ZyhmLnBiLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5TYSYmMTI+Zi5TYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5nKGYucWIsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLk1hfHw3LFwiJVVcIjpmPT5nKE1hdGguZmxvb3IoKGYuUGErXG43LWYuTWEpLzcpLDIpLFwiJVZcIjpmPT57dmFyIHE9TWF0aC5mbG9vcigoZi5QYSs3LShmLk1hKzYpJTcpLzcpOzI+PShmLk1hKzM3MS1mLlBhLTIpJTcmJnErKztpZihxKTUzPT1xJiYodT0oZi5NYSszNzEtZi5QYSklNyw0PT11fHwzPT11JiZaKGYuUWEpfHwocT0xKSk7ZWxzZXtxPTUyO3ZhciB1PShmLk1hKzctZi5QYS0xKSU3Oyg0PT11fHw1PT11JiZaKGYuUWElNDAwLTEpKSYmcSsrfXJldHVybiBnKHEsMil9LFwiJXdcIjpmPT5mLk1hLFwiJVdcIjpmPT5nKE1hdGguZmxvb3IoKGYuUGErNy0oZi5NYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuUWErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuUWErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5vYjt2YXIgcT0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKHE/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYucmIsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXG5cIlxceDAwXFx4MDBcIik7Zm9yKHkgaW4gdiljLmluY2x1ZGVzKHkpJiYoYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh5LFwiZ1wiKSx2W3ldKGUpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt5PVJiKGMpO2lmKHkubGVuZ3RoPmIpcmV0dXJuIDA7U2IoeSxhKTtyZXR1cm4geS5sZW5ndGgtMX1WLlZhKCk7XG52YXIgVWI9W251bGwsTGEsTWEsWGEsWmEsJGEsZGIsZWIsZmIsZ2IsaGIsaWIsamIsa2IsbGIsbWIsbmIsdGIsdWIsRmIsR2IsSGIsTGIsTWIsT2JdLFhiPXtiOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBVYShhKSkuVmEoYj4+PjAsYz4+PjApO1ZhPWE7V2ErKzt0aHJvdyBWYTt9LE46ZnVuY3Rpb24oYSl7VmIoYT4+PjAsIUEsMSwha2EsMTMxMDcyLCExKTtWLllhKCl9LGo6ZnVuY3Rpb24oYSl7YT4+Pj0wO0Q/cG9zdE1lc3NhZ2Uoe2NtZDpcImNsZWFudXBUaHJlYWRcIix0aHJlYWQ6YX0pOkdhKGEpfSxJOllhLGg6WmEsVDokYSxEOmRiLEY6ZWIsVTpmYixSOmdiLEo6aGIsUTppYixuOmpiLEU6a2IsQjpsYixTOm1iLEM6bmIscTooKT0+ITAsejpmdW5jdGlvbihhLGIpe2E+Pj49MDthPT1iPj4+MD9zZXRUaW1lb3V0KCgpPT5ZKCkpOkQ/cG9zdE1lc3NhZ2Uoe3RhcmdldFRocmVhZDphLGNtZDpcImNoZWNrTWFpbGJveFwifSk6KGE9Vi5MYVthXSkmJmEucG9zdE1lc3NhZ2Uoe2NtZDpcImNoZWNrTWFpbGJveFwifSl9LFxuTDpmdW5jdGlvbigpe3JldHVybi0xfSxNOnBiLHA6ZnVuY3Rpb24oYSl7QiYmVi5MYVthPj4+MF0ucmVmKCl9LHQ6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3AoKVtjPj4yPj4+MF09YS5nZXRVVENTZWNvbmRzKCk7cCgpW2MrND4+Mj4+PjBdPWEuZ2V0VVRDTWludXRlcygpO3AoKVtjKzg+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7cCgpW2MrMTI+PjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTtwKClbYysxNj4+Mj4+PjBdPWEuZ2V0VVRDTW9udGgoKTtwKClbYysyMD4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO3AoKVtjKzI0Pj4yPj4+MF09YS5nZXRVVENEYXkoKTthPShhLmdldFRpbWUoKS1EYXRlLlVUQyhhLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRFNXwwO3AoKVtjKzI4Pj4yPj4+MF09YX0sdTpmdW5jdGlvbihhLGIsYyl7YT1iK1xuMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtwKClbYz4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO3AoKVtjKzQ+PjI+Pj4wXT1hLmdldE1pbnV0ZXMoKTtwKClbYys4Pj4yPj4+MF09YS5nZXRIb3VycygpO3AoKVtjKzEyPj4yPj4+MF09YS5nZXREYXRlKCk7cCgpW2MrMTY+PjI+Pj4wXT1hLmdldE1vbnRoKCk7cCgpW2MrMjA+PjI+Pj4wXT1hLmdldEZ1bGxZZWFyKCktMTkwMDtwKClbYysyND4+Mj4+PjBdPWEuZ2V0RGF5KCk7Yj0oWihhLmdldEZ1bGxZZWFyKCkpP3JiOnNiKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtwKClbYysyOD4+Mj4+PjBdPWI7cCgpW2MrMzY+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGU9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO1xuYT0oYiE9ZSYmYS5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihlLGIpKXwwO3AoKVtjKzMyPj4yPj4+MF09YX0sdjpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9bmV3IERhdGUocCgpW2ErMjA+PjI+Pj4wXSsxOTAwLHAoKVthKzE2Pj4yPj4+MF0scCgpW2ErMTI+PjI+Pj4wXSxwKClbYSs4Pj4yPj4+MF0scCgpW2ErND4+Mj4+PjBdLHAoKVthPj4yPj4+MF0sMCksYz1wKClbYSszMj4+Mj4+PjBdLGU9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGc9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oZyxoKTswPmM/cCgpW2ErMzI+PjI+Pj4wXT1OdW1iZXIoaCE9ZyYmaz09ZSk6MDxjIT0oaz09ZSkmJihoPU1hdGgubWF4KGcsaCksYi5zZXRUaW1lKGIuZ2V0VGltZSgpKzZFNCooKDA8Yz9rOmgpLWUpKSk7cCgpW2ErMjQ+PjI+Pj5cbjBdPWIuZ2V0RGF5KCk7Yz0oWihiLmdldEZ1bGxZZWFyKCkpP3JiOnNiKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDtwKClbYSsyOD4+Mj4+PjBdPWM7cCgpW2E+PjI+Pj4wXT1iLmdldFNlY29uZHMoKTtwKClbYSs0Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7cCgpW2ErOD4+Mj4+PjBdPWIuZ2V0SG91cnMoKTtwKClbYSsxMj4+Mj4+PjBdPWIuZ2V0RGF0ZSgpO3AoKVthKzE2Pj4yPj4+MF09Yi5nZXRNb250aCgpO3AoKVthKzIwPj4yPj4+MF09Yi5nZXRZZWFyKCk7YT1iLmdldFRpbWUoKS8xRTM7cmV0dXJuIFdiKChUPWEsMTw9K01hdGguYWJzKFQpPzA8VD8rTWF0aC5mbG9vcihULzQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFQtKyh+flQ+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKSxhPj4+MH0scjp0YixzOnViLHk6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGUodil7cmV0dXJuKHY9di50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT9cbnZbMV06XCJHTVRcIn1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDt2YXIgaD0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksZz1uZXcgRGF0ZShoLDAsMSksaz1uZXcgRGF0ZShoLDYsMSk7aD1nLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIHQ9ay5nZXRUaW1lem9uZU9mZnNldCgpLEM9TWF0aC5tYXgoaCx0KTtyKClbYT4+Mj4+PjBdPTYwKkM7cCgpW2I+PjI+Pj4wXT1OdW1iZXIoaCE9dCk7YT1lKGcpO2I9ZShrKTthPXdiKGEpO2I9d2IoYik7dDxoPyhyKClbYz4+Mj4+PjBdPWEscigpW2MrND4+Mj4+PjBdPWIpOihyKClbYz4+Mj4+PjBdPWIscigpW2MrND4+Mj4+PjBdPWEpfSxjOigpPT57SyhcIlwiKX0sazpmdW5jdGlvbigpe30saTpmdW5jdGlvbigpe3JldHVybiBEYXRlLm5vdygpfSxvOigpPT57d2ErPTE7dGhyb3dcInVud2luZFwiO30sQTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxlOigpPT5wZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpLGY6ZnVuY3Rpb24oKXtyZXR1cm4gQj9cbnJlcXVpcmUoXCJvc1wiKS5jcHVzKCkubGVuZ3RoOm5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5fSxLOmZ1bmN0aW9uKGEsYixjLGUpe1YudmI9Yj4+PjA7QmIubGVuZ3RoPWM7Yj1lPj4+MD4+Mztmb3IoZT0wO2U8YztlKyspQmJbZV09ZWEoKVtiK2U+Pj4wXTtyZXR1cm4gVWJbYV0uYXBwbHkobnVsbCxCYil9LHg6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW4oKS5sZW5ndGg7aWYoYTw9Ynx8NDI5NDkwMTc2MDxhKXJldHVybiExO2Zvcih2YXIgYz0xOzQ+PWM7Yyo9Mil7dmFyIGU9YiooMSsuMi9jKTtlPU1hdGgubWluKGUsYSsxMDA2NjMyOTYpO3ZhciBoPU1hdGg7ZT1NYXRoLm1heChhLGUpO2E6e2g9aC5taW4uY2FsbChoLDQyOTQ5MDE3NjAsZSsoNjU1MzYtZSU2NTUzNiklNjU1MzYpLWQuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzU+Pj4xNjt0cnl7ZC5ncm93KGgpO20oKTt2YXIgZz0xO2JyZWFrIGF9Y2F0Y2goayl7fWc9dm9pZCAwfWlmKGcpcmV0dXJuITB9cmV0dXJuITF9LFxuTzpGYixQOkdiLEg6TmEsZzpIYixtOkxiLHc6TWIsbDpPYixhOmR8fHcud2FzbU1lbW9yeSxHOlRiLGQ6ZnVuY3Rpb24oYSxiLGMsZSl7cmV0dXJuIFRiKGE+Pj4wLGI+Pj4wLGM+Pj4wLGU+Pj4wKX19OyhmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyxlKXtjPWMuZXhwb3J0cztMPWM9WWIoYyk7Vi5aYS5wdXNoKEwueWEpO3NhPUwuemE7dWEudW5zaGlmdChMLlYpO3JhPWU7emEoKTtyZXR1cm4gY312YXIgYj17YTpYYn07eWEoKTtpZih3Lmluc3RhbnRpYXRlV2FzbSl0cnl7cmV0dXJuIHcuaW5zdGFudGlhdGVXYXNtKGIsYSl9Y2F0Y2goYyl7SShcIk1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6IFwiK2MpLHgoYyl9RWEoYixmdW5jdGlvbihjKXthKGMuaW5zdGFuY2UsYy5tb2R1bGUpfSkuY2F0Y2goeCk7cmV0dXJue319KSgpO3cuX09ydEluaXQ9KGEsYik9Pih3Ll9PcnRJbml0PUwuVykoYSxiKTtcbncuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KHcuX09ydEdldExhc3RFcnJvcj1MLlgpKGEsYik7dy5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGEsYixjLGUsaCxnLGssdCxDLHYpPT4ody5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9TC5ZKShhLGIsYyxlLGgsZyxrLHQsQyx2KTt3Ll9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj0oYSxiKT0+KHcuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPUwuWikoYSxiKTt3Ll9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGEsYixjKT0+KHcuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1MLl8pKGEsYixjKTt3Ll9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KHcuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1MLiQpKGEsYixjKTt3Ll9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9YT0+KHcuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1MLmFhKShhKTtcbncuX09ydENyZWF0ZVNlc3Npb249KGEsYixjKT0+KHcuX09ydENyZWF0ZVNlc3Npb249TC5iYSkoYSxiLGMpO3cuX09ydFJlbGVhc2VTZXNzaW9uPWE9Pih3Ll9PcnRSZWxlYXNlU2Vzc2lvbj1MLmNhKShhKTt3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PShhLGIsYyk9Pih3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PUwuZGEpKGEsYixjKTt3Ll9PcnRHZXRJbnB1dE5hbWU9KGEsYik9Pih3Ll9PcnRHZXRJbnB1dE5hbWU9TC5lYSkoYSxiKTt3Ll9PcnRHZXRPdXRwdXROYW1lPShhLGIpPT4ody5fT3J0R2V0T3V0cHV0TmFtZT1MLmZhKShhLGIpO3cuX09ydEZyZWU9YT0+KHcuX09ydEZyZWU9TC5nYSkoYSk7dy5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxlLGgsZyk9Pih3Ll9PcnRDcmVhdGVUZW5zb3I9TC5oYSkoYSxiLGMsZSxoLGcpO3cuX09ydEdldFRlbnNvckRhdGE9KGEsYixjLGUsaCk9Pih3Ll9PcnRHZXRUZW5zb3JEYXRhPUwuaWEpKGEsYixjLGUsaCk7XG53Ll9PcnRSZWxlYXNlVGVuc29yPWE9Pih3Ll9PcnRSZWxlYXNlVGVuc29yPUwuamEpKGEpO3cuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGUpPT4ody5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1MLmthKShhLGIsYyxlKTt3Ll9PcnRBZGRSdW5Db25maWdFbnRyeT0oYSxiLGMpPT4ody5fT3J0QWRkUnVuQ29uZmlnRW50cnk9TC5sYSkoYSxiLGMpO3cuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9Pih3Ll9PcnRSZWxlYXNlUnVuT3B0aW9ucz1MLm1hKShhKTt3Ll9PcnRDcmVhdGVCaW5kaW5nPWE9Pih3Ll9PcnRDcmVhdGVCaW5kaW5nPUwubmEpKGEpO3cuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4ody5fT3J0QmluZElucHV0PUwub2EpKGEsYixjKTt3Ll9PcnRCaW5kT3V0cHV0PShhLGIsYyxlKT0+KHcuX09ydEJpbmRPdXRwdXQ9TC5wYSkoYSxiLGMsZSk7dy5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KHcuX09ydENsZWFyQm91bmRPdXRwdXRzPUwucWEpKGEpO1xudy5fT3J0UmVsZWFzZUJpbmRpbmc9YT0+KHcuX09ydFJlbGVhc2VCaW5kaW5nPUwucmEpKGEpO3cuX09ydFJ1bldpdGhCaW5kaW5nPShhLGIsYyxlLGgpPT4ody5fT3J0UnVuV2l0aEJpbmRpbmc9TC5zYSkoYSxiLGMsZSxoKTt3Ll9PcnRSdW49KGEsYixjLGUsaCxnLGssdCk9Pih3Ll9PcnRSdW49TC50YSkoYSxiLGMsZSxoLGcsayx0KTt3Ll9PcnRFbmRQcm9maWxpbmc9YT0+KHcuX09ydEVuZFByb2ZpbGluZz1MLnVhKShhKTt2YXIgWD13Ll9wdGhyZWFkX3NlbGY9KCk9PihYPXcuX3B0aHJlYWRfc2VsZj1MLnZhKSgpLHZiPXcuX21hbGxvYz1hPT4odmI9dy5fbWFsbG9jPUwud2EpKGEpO3cuX2ZyZWU9YT0+KHcuX2ZyZWU9TC54YSkoYSk7dy5fX2Vtc2NyaXB0ZW5fdGxzX2luaXQ9KCk9Pih3Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD1MLnlhKSgpO1xudmFyIFZiPXcuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PShhLGIsYyxlLGgsZyk9PihWYj13Ll9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD1MLkFhKShhLGIsYyxlLGgsZyk7dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWQ9KCk9Pih3Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD1MLkJhKSgpO3ZhciBBYj0oYSxiLGMsZSk9PihBYj1MLkNhKShhLGIsYyxlKSxPYT1hPT4oT2E9TC5EYSkoYSksVGE9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9YT0+KFRhPXcuX19lbXNjcmlwdGVuX3RocmVhZF9leGl0PUwuRWEpKGEpLHFiPXcuX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9KCk9PihxYj13Ll9fZW1zY3JpcHRlbl9jaGVja19tYWlsYm94PUwuRmEpKCksV2I9YT0+KFdiPUwuR2EpKGEpLFFhPShhLGIpPT4oUWE9TC5IYSkoYSxiKSx4Yj0oKT0+KHhiPUwuSWEpKCksUmE9YT0+KFJhPUwuSmEpKGEpLHpiPWE9Pih6Yj1MLkthKShhKTtcbmZ1bmN0aW9uIFliKGEpe2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1lPT4oKT0+ZSgpPj4+MCxjPWU9Pmg9PmUoaCk+Pj4wO2EuX19lcnJub19sb2NhdGlvbj1iKGEuX19lcnJub19sb2NhdGlvbik7YS5wdGhyZWFkX3NlbGY9YihhLnB0aHJlYWRfc2VsZik7YS5tYWxsb2M9YyhhLm1hbGxvYyk7YS5zdGFja1NhdmU9YihhLnN0YWNrU2F2ZSk7YS5zdGFja0FsbG9jPWMoYS5zdGFja0FsbG9jKTtyZXR1cm4gYX13LmtlZXBSdW50aW1lQWxpdmU9UDt3Lndhc21NZW1vcnk9ZDt3LnN0YWNrQWxsb2M9emI7dy5zdGFja1NhdmU9eGI7dy5zdGFja1Jlc3RvcmU9UmE7dy5VVEY4VG9TdHJpbmc9S2E7dy5zdHJpbmdUb1VURjg9Y2I7dy5sZW5ndGhCeXRlc1VURjg9YWI7dy5FeGl0U3RhdHVzPVU7dy5QVGhyZWFkPVY7dmFyIFpiO1I9ZnVuY3Rpb24gJGIoKXtaYnx8YWMoKTtaYnx8KFI9JGIpfTtcbmZ1bmN0aW9uIGFjKCl7ZnVuY3Rpb24gYSgpe2lmKCFaYiYmKFpiPSEwLHcuY2FsbGVkUnVuPSEwLCFNKSl7RHx8UGEodWEpO2hhKHcpO2lmKHcub25SdW50aW1lSW5pdGlhbGl6ZWQpdy5vblJ1bnRpbWVJbml0aWFsaXplZCgpO2lmKCFEKXtpZih3LnBvc3RSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIHcucG9zdFJ1biYmKHcucG9zdFJ1bj1bdy5wb3N0UnVuXSk7dy5wb3N0UnVuLmxlbmd0aDspe3ZhciBiPXcucG9zdFJ1bi5zaGlmdCgpO3ZhLnVuc2hpZnQoYil9UGEodmEpfX19aWYoISgwPFEpKWlmKEQpaGEodyksRHx8UGEodWEpLHN0YXJ0V29ya2VyKHcpO2Vsc2V7aWYody5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIHcucHJlUnVuJiYody5wcmVSdW49W3cucHJlUnVuXSk7dy5wcmVSdW4ubGVuZ3RoOyl0YS51bnNoaWZ0KHcucHJlUnVuLnNoaWZ0KCkpO1BhKHRhKTswPFF8fCh3LnNldFN0YXR1cz8ody5zZXRTdGF0dXMoXCJSdW5uaW5nLi4uXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dy5zZXRTdGF0dXMoXCJcIil9LFxuMSk7YSgpfSwxKSk6YSgpKX19aWYody5wcmVJbml0KWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiB3LnByZUluaXQmJih3LnByZUluaXQ9W3cucHJlSW5pdF0pOzA8dy5wcmVJbml0Lmxlbmd0aDspdy5wcmVJbml0LnBvcCgpKCk7YWMoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cblxuKTtcbn0pKCk7XG5pZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuICBtb2R1bGUuZXhwb3J0cyA9IG9ydFdhc21UaHJlYWRlZDtcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSlcbiAgZGVmaW5lKFtdLCAoKSA9PiBvcnRXYXNtVGhyZWFkZWQpO1xuIiwgIlwidXNlIHN0cmljdFwiO3ZhciBNb2R1bGU9e307dmFyIEVOVklST05NRU5UX0lTX05PREU9dHlwZW9mIHByb2Nlc3M9PVwib2JqZWN0XCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlPT1cInN0cmluZ1wiO2lmKEVOVklST05NRU5UX0lTX05PREUpe3ZhciBub2RlV29ya2VyVGhyZWFkcz1yZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIik7dmFyIHBhcmVudFBvcnQ9bm9kZVdvcmtlclRocmVhZHMucGFyZW50UG9ydDtwYXJlbnRQb3J0Lm9uKFwibWVzc2FnZVwiLGRhdGE9Pm9ubWVzc2FnZSh7ZGF0YTpkYXRhfSkpO3ZhciBmcz1yZXF1aXJlKFwiZnNcIik7T2JqZWN0LmFzc2lnbihnbG9iYWwse3NlbGY6Z2xvYmFsLHJlcXVpcmU6cmVxdWlyZSxNb2R1bGU6TW9kdWxlLGxvY2F0aW9uOntocmVmOl9fZmlsZW5hbWV9LFdvcmtlcjpub2RlV29ya2VyVGhyZWFkcy5Xb3JrZXIsaW1wb3J0U2NyaXB0czpmPT4oMCxldmFsKShmcy5yZWFkRmlsZVN5bmMoZixcInV0ZjhcIikrXCIvLyMgc291cmNlVVJMPVwiK2YpLHBvc3RNZXNzYWdlOm1zZz0+cGFyZW50UG9ydC5wb3N0TWVzc2FnZShtc2cpLHBlcmZvcm1hbmNlOmdsb2JhbC5wZXJmb3JtYW5jZXx8e25vdzpEYXRlLm5vd319KX12YXIgaW5pdGlhbGl6ZWRKUz1mYWxzZTtmdW5jdGlvbiB0aHJlYWRQcmludEVycigpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7ZnMud3JpdGVTeW5jKDIsdGV4dCtcIlxcblwiKTtyZXR1cm59Y29uc29sZS5lcnJvcih0ZXh0KX1mdW5jdGlvbiB0aHJlYWRBbGVydCgpe3ZhciB0ZXh0PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbihcIiBcIik7cG9zdE1lc3NhZ2Uoe2NtZDpcImFsZXJ0XCIsdGV4dDp0ZXh0LHRocmVhZElkOk1vZHVsZVtcIl9wdGhyZWFkX3NlbGZcIl0oKX0pfXZhciBlcnI9dGhyZWFkUHJpbnRFcnI7c2VsZi5hbGVydD10aHJlYWRBbGVydDtNb2R1bGVbXCJpbnN0YW50aWF0ZVdhc21cIl09KGluZm8scmVjZWl2ZUluc3RhbmNlKT0+e3ZhciBtb2R1bGU9TW9kdWxlW1wid2FzbU1vZHVsZVwiXTtNb2R1bGVbXCJ3YXNtTW9kdWxlXCJdPW51bGw7dmFyIGluc3RhbmNlPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShtb2R1bGUsaW5mbyk7cmV0dXJuIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSl9O3NlbGYub251bmhhbmRsZWRyZWplY3Rpb249ZT0+e3Rocm93IGUucmVhc29uPz9lfTtmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGUpe3RyeXtpZihlLmRhdGEuY21kPT09XCJsb2FkXCIpe2xldCBtZXNzYWdlUXVldWU9W107c2VsZi5vbm1lc3NhZ2U9ZT0+bWVzc2FnZVF1ZXVlLnB1c2goZSk7c2VsZi5zdGFydFdvcmtlcj1pbnN0YW5jZT0+e01vZHVsZT1pbnN0YW5jZTtwb3N0TWVzc2FnZSh7XCJjbWRcIjpcImxvYWRlZFwifSk7Zm9yKGxldCBtc2cgb2YgbWVzc2FnZVF1ZXVlKXtoYW5kbGVNZXNzYWdlKG1zZyl9c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZX07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1lLmRhdGEud2FzbU1vZHVsZTtmb3IoY29uc3QgaGFuZGxlciBvZiBlLmRhdGEuaGFuZGxlcnMpe01vZHVsZVtoYW5kbGVyXT0oLi4uYXJncyk9Pntwb3N0TWVzc2FnZSh7Y21kOlwiY2FsbEhhbmRsZXJcIixoYW5kbGVyOmhhbmRsZXIsYXJnczphcmdzfSl9fU1vZHVsZVtcIndhc21NZW1vcnlcIl09ZS5kYXRhLndhc21NZW1vcnk7TW9kdWxlW1wiYnVmZmVyXCJdPU1vZHVsZVtcIndhc21NZW1vcnlcIl0uYnVmZmVyO01vZHVsZVtcIkVOVklST05NRU5UX0lTX1BUSFJFQURcIl09dHJ1ZTtpZih0eXBlb2YgZS5kYXRhLnVybE9yQmxvYj09XCJzdHJpbmdcIil7aW1wb3J0U2NyaXB0cyhlLmRhdGEudXJsT3JCbG9iKX1lbHNle3ZhciBvYmplY3RVcmw9VVJMLmNyZWF0ZU9iamVjdFVSTChlLmRhdGEudXJsT3JCbG9iKTtpbXBvcnRTY3JpcHRzKG9iamVjdFVybCk7VVJMLnJldm9rZU9iamVjdFVSTChvYmplY3RVcmwpfW9ydFdhc21UaHJlYWRlZChNb2R1bGUpfWVsc2UgaWYoZS5kYXRhLmNtZD09PVwicnVuXCIpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdFwiXShlLmRhdGEucHRocmVhZF9wdHIsLyppc01haW5Ccm93c2VyVGhyZWFkPSovMCwvKmlzTWFpblJ1bnRpbWVUaHJlYWQ9Ki8wLC8qY2FuQmxvY2s9Ki8xKTtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyKTtNb2R1bGVbXCJlc3RhYmxpc2hTdGFja1NwYWNlXCJdKCk7TW9kdWxlW1wiUFRocmVhZFwiXS5yZWNlaXZlT2JqZWN0VHJhbnNmZXIoZS5kYXRhKTtNb2R1bGVbXCJQVGhyZWFkXCJdLnRocmVhZEluaXRUTFMoKTtpZighaW5pdGlhbGl6ZWRKUyl7aW5pdGlhbGl6ZWRKUz10cnVlfXRyeXtNb2R1bGVbXCJpbnZva2VFbnRyeVBvaW50XCJdKGUuZGF0YS5zdGFydF9yb3V0aW5lLGUuZGF0YS5hcmcpfWNhdGNoKGV4KXtpZihleCE9XCJ1bndpbmRcIil7dGhyb3cgZXh9fX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNhbmNlbFwiKXtpZihNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCkpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdFwiXSgtMSl9fWVsc2UgaWYoZS5kYXRhLnRhcmdldD09PVwic2V0aW1tZWRpYXRlXCIpe31lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNoZWNrTWFpbGJveFwiKXtpZihpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJjaGVja01haWxib3hcIl0oKX19ZWxzZSBpZihlLmRhdGEuY21kKXtlcnIoXCJ3b3JrZXIuanMgcmVjZWl2ZWQgdW5rbm93biBjb21tYW5kIFwiK2UuZGF0YS5jbWQpO2VycihlLmRhdGEpfX1jYXRjaChleCl7aWYoTW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2NyYXNoZWRcIl0oKX10aHJvdyBleH19c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZTtcbiIsICJleHBvcnQgY29uc3Qgam9pbiA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7RW52fSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge09ydFdhc21Nb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbSc7XG5pbXBvcnQge09ydFdhc21UaHJlYWRlZE1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkJztcblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xubGV0IG9ydFdhc21GYWN0b3J5OiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPjtcblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgb3J0V2FzbUZhY3RvcnkgPSByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXRyYWluaW5nLXdhc20tc2ltZC5qcycpO1xufSBlbHNlIHtcbiAgb3J0V2FzbUZhY3RvcnkgPVxuICAgICAgQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS5qcycpIDogcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQuanNlcC5qcycpO1xufVxuXG5jb25zdCBvcnRXYXNtRmFjdG9yeVRocmVhZGVkOiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPiA9ICFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgP1xuICAgIChCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLmpzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5qcycpKSA6XG4gICAgb3J0V2FzbUZhY3Rvcnk7XG4vKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cblxubGV0IHdhc206IE9ydFdhc21Nb2R1bGV8dW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xuXG5jb25zdCBpc011bHRpVGhyZWFkU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIElmICdTaGFyZWRBcnJheUJ1ZmZlcicgaXMgbm90IGF2YWlsYWJsZSwgV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxuICAgIGlmICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgdHJhbnNmZXJhYmlsaXR5IG9mIFNBQnMgKGZvciBicm93c2Vycy4gbmVlZGVkIGZvciBGaXJlZm94KVxuICAgIC8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyFtc2cvbW96aWxsYS5kZXYucGxhdGZvcm0vSUhrQlpsSEVUcEEvZHdzTU5jaFdFUUFKXG4gICAgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLnBvc3RNZXNzYWdlKG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgdGhyZWFkcyBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIHRocmVhZGVkIGluc3RydWN0aW9ucy5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAgMCwgIDAsIDEsIDQsIDEsICA5NiwgMCwgICAwLCAgMywgMiwgMSwgIDAsIDUsXG4gICAgICA0LCAxLCAgMywgICAxLCAgIDEsIDEwLCAxMSwgMSwgOSwgMCwgNjUsIDAsICAyNTQsIDE2LCAyLCAwLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGlzU2ltZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSBTSU1EIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgU0lNRCBpbnN0cnVjdGlvbnMuXG5cbiAgICAvLyBUaGUgYmluYXJ5IGRhdGEgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIGZvbGxvd2luZyBjb2RlIGJ5IHdhdDJ3YXNtOlxuICAgIC8vXG4gICAgLy8gKG1vZHVsZVxuICAgIC8vICAgKHR5cGUgJHQwIChmdW5jKSlcbiAgICAvLyAgIChmdW5jICRmMCAodHlwZSAkdDApXG4gICAgLy8gICAgIChkcm9wXG4gICAgLy8gICAgICAgKGkzMng0LmRvdF9pMTZ4OF9zXG4gICAgLy8gICAgICAgICAoaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgICAgICAgKGkzMi5jb25zdCAwKSlcbiAgICAvLyAgICAgICAgICh2MTI4LmNvbnN0IGkzMng0IDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDApKSkpKVxuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsICAgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCA0LCAxLCA5NiwgMCwgMCwgMywgMiwgMSwgMCwgMTAsIDMwLCAxLCAgIDI4LCAgMCwgNjUsIDAsXG4gICAgICAyNTMsIDE1LCAyNTMsIDEyLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAgMjUzLCAxODYsIDEsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgZ2V0V2FzbUZpbGVOYW1lID0gKHVzZVNpbWQ6IGJvb2xlYW4sIHVzZVRocmVhZHM6IGJvb2xlYW4pID0+IHtcbiAgaWYgKHVzZVNpbWQpIHtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICAgICAgcmV0dXJuICdvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc20nO1xuICAgIH1cbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLXNpbWQud2FzbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20ud2FzbSc7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplV2ViQXNzZW1ibHkgPSBhc3luYyhmbGFnczogRW52LldlYkFzc2VtYmx5RmxhZ3MpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpcGxlIGNhbGxzIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGRldGVjdGVkLicpO1xuICB9XG4gIGlmIChhYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcmV2aW91cyBjYWxsIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGZhaWxlZC4nKTtcbiAgfVxuXG4gIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgLy8gd2FzbSBmbGFncyBhcmUgYWxyZWFkeSBpbml0aWFsaXplZFxuICBjb25zdCB0aW1lb3V0ID0gZmxhZ3MuaW5pdFRpbWVvdXQhO1xuICBjb25zdCBudW1UaHJlYWRzID0gZmxhZ3MubnVtVGhyZWFkcyE7XG4gIGNvbnN0IHNpbWQgPSBmbGFncy5zaW1kITtcblxuICBjb25zdCB1c2VUaHJlYWRzID0gbnVtVGhyZWFkcyA+IDEgJiYgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCgpO1xuICBjb25zdCB1c2VTaW1kID0gc2ltZCAmJiBpc1NpbWRTdXBwb3J0ZWQoKTtcblxuICBjb25zdCB3YXNtUGF0aHMgPSBmbGFncy53YXNtUGF0aHM7XG4gIGNvbnN0IHdhc21QcmVmaXhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdzdHJpbmcnID8gd2FzbVBhdGhzIDogdW5kZWZpbmVkO1xuICBjb25zdCB3YXNtRmlsZU5hbWUgPSBnZXRXYXNtRmlsZU5hbWUodXNlU2ltZCwgdXNlVGhyZWFkcyk7XG4gIGNvbnN0IHdhc21QYXRoT3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnb2JqZWN0JyA/IHdhc21QYXRoc1t3YXNtRmlsZU5hbWVdIDogdW5kZWZpbmVkO1xuXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcblxuICBjb25zdCB0YXNrczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICAvLyBwcm9taXNlIGZvciB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ID4gMCkge1xuICAgIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KSk7XG4gIH1cblxuICAvLyBwcm9taXNlIGZvciBtb2R1bGUgaW5pdGlhbGl6YXRpb25cbiAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHVzZVRocmVhZHMgPyBvcnRXYXNtRmFjdG9yeVRocmVhZGVkIDogb3J0V2FzbUZhY3Rvcnk7XG4gICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE9ydFdhc21Nb2R1bGU+ID0ge1xuICAgICAgbG9jYXRlRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIHNjcmlwdERpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy53b3JrZXIuanMnKSAmJlxuICAgICAgICAgICAgdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHJlcXVpcmUoKSBmdW5jdGlvbiBpcyBoYW5kbGVkIGJ5IGVzYnVpbGQgcGx1Z2luIHRvIGxvYWQgZmlsZSBjb250ZW50IGFzIHN0cmluZy5cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMnKVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy53YXNtJykpIHtcbiAgICAgICAgICBpZiAod2FzbVBhdGhPdmVycmlkZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhc21QYXRoT3ZlcnJpZGU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcHJlZml4ID0gd2FzbVByZWZpeE92ZXJyaWRlID8/IHNjcmlwdERpcmVjdG9yeTtcblxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICAgICAgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIHdhc21GaWxlTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JpcHREaXJlY3RvcnkgKyBmaWxlTmFtZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcykge1xuICAgICAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdvcnQtd2FzbS10aHJlYWRlZC5qcycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2NyaXB0U291cmNlQ29kZSA9IGB2YXIgb3J0V2FzbVRocmVhZGVkPSR7ZmFjdG9yeS50b1N0cmluZygpfTtgO1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IG5ldyBCbG9iKFtzY3JpcHRTb3VyY2VDb2RlXSwge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmFjdG9yeShjb25maWcpLnRoZW4oXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICBtb2R1bGUgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB3YXNtID0gbW9kdWxlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgZmFpbGVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgKHdoYXQpID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICByZWplY3Qod2hhdCk7XG4gICAgICAgIH0pO1xuICB9KSk7XG5cbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcblxuICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2UgPSAoKTogT3J0V2FzbU1vZHVsZSA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiB3YXNtKSB7XG4gICAgcmV0dXJuIHdhc207XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmICFpbml0aWFsaXppbmcgJiYgIWFib3J0ZWQpIHtcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgKHdhc20gYXMgT3J0V2FzbVRocmVhZGVkTW9kdWxlKS5QVGhyZWFkPy50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7XG4gICAgd2FzbSA9IHVuZGVmaW5lZDtcblxuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgYWJvcnRlZCA9IHRydWU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcblxuZXhwb3J0IGNvbnN0IGFsbG9jV2FzbVN0cmluZyA9IChkYXRhOiBzdHJpbmcsIGFsbG9jczogbnVtYmVyW10pOiBudW1iZXIgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBkYXRhTGVuZ3RoID0gd2FzbS5sZW5ndGhCeXRlc1VURjgoZGF0YSkgKyAxO1xuICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKGRhdGFMZW5ndGgpO1xuICB3YXNtLnN0cmluZ1RvVVRGOChkYXRhLCBkYXRhT2Zmc2V0LCBkYXRhTGVuZ3RoKTtcbiAgYWxsb2NzLnB1c2goZGF0YU9mZnNldCk7XG5cbiAgcmV0dXJuIGRhdGFPZmZzZXQ7XG59O1xuXG5pbnRlcmZhY2UgRXh0cmFPcHRpb25zSGFuZGxlciB7XG4gIChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgaXRlcmF0ZUV4dHJhT3B0aW9ucyA9XG4gICAgKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwcmVmaXg6IHN0cmluZywgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXG4gICAgIGhhbmRsZXI6IEV4dHJhT3B0aW9uc0hhbmRsZXIpOiB2b2lkID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzZWVuLmhhcyhvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2lyY3VsYXIgcmVmZXJlbmNlIGluIG9wdGlvbnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWVuLmFkZChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcmVmaXgpID8gcHJlZml4ICsga2V5IDoga2V5O1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG5hbWUgKyAnLicsIHNlZW4sIGhhbmRsZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsICh2YWx1ZSkgPyAnMScgOiAnMCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaGFuZGxlIGV4dHJhIGNvbmZpZyB0eXBlOiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuLyoqXG4gKiBjaGVjayB3ZWIgYXNzZW1ibHkgQVBJJ3MgbGFzdCBlcnJvciBhbmQgdGhyb3cgZXJyb3IgaWYgYW55IGVycm9yIG9jY3VycmVkLlxuICogQHBhcmFtIG1lc3NhZ2UgYSBtZXNzYWdlIHVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrTGFzdEVycm9yID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIHdhc20uX09ydEdldExhc3RFcnJvcihwYXJhbXNPZmZzZXQsIHBhcmFtc09mZnNldCArIDQpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uSEVBUDMyW3BhcmFtc09mZnNldCAvIDRdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLkhFQVBVMzJbcGFyYW1zT2Zmc2V0IC8gNCArIDFdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZVBvaW50ZXIgPyB3YXNtLlVURjhUb1N0cmluZyhlcnJvck1lc3NhZ2VQb2ludGVyKSA6ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHttZXNzYWdlfSBFUlJPUl9DT0RFOiAke2Vycm9yQ29kZX0sIEVSUk9SX01FU1NBR0U6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRSdW5PcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBydW5PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRyeSB7XG4gICAgaWYgKG9wdGlvbnM/LmxvZ1NldmVyaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID0gMjsgIC8vIERlZmF1bHQgdG8gd2FybmluZ1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCkgfHxcbiAgICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fCBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8ubG9nVmVyYm9zaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA9IDA7ICAvLyBEZWZhdWx0IHRvIDBcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy50ZXJtaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy50ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGFnRGF0YU9mZnNldCA9IDA7XG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG9wdGlvbnMudGFnLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIHJ1bk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVSdW5PcHRpb25zKFxuICAgICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwhLCBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsISwgISFydW5PcHRpb25zLnRlcm1pbmF0ZSEsIHRhZ0RhdGFPZmZzZXQpO1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgcnVuIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMob3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHJ1biBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuY29uc3QgZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsID0gKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw6IHN0cmluZ3x1bmtub3duKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XG4gICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnZXh0ZW5kZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiA5OTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBncmFwaCBvcHRpbWl6YXRpb24gbGV2ZWw6ICR7Z3JhcGhPcHRpbWl6YXRpb25MZXZlbH1gKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RXhlY3V0aW9uTW9kZSA9IChleGVjdXRpb25Nb2RlOiAnc2VxdWVudGlhbCd8J3BhcmFsbGVsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZXhlY3V0aW9uTW9kZSkge1xuICAgIGNhc2UgJ3NlcXVlbnRpYWwnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAncGFyYWxsZWwnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZXhlY3V0aW9uIG1vZGU6ICR7ZXhlY3V0aW9uTW9kZX1gKTtcbiAgfVxufTtcblxuY29uc3QgYXBwZW5kRGVmYXVsdE9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBpZiAoIW9wdGlvbnMuZXh0cmEpIHtcbiAgICBvcHRpb25zLmV4dHJhID0ge307XG4gIH1cbiAgaWYgKCFvcHRpb25zLmV4dHJhLnNlc3Npb24pIHtcbiAgICBvcHRpb25zLmV4dHJhLnNlc3Npb24gPSB7fTtcbiAgfVxuICBjb25zdCBzZXNzaW9uID0gb3B0aW9ucy5leHRyYS5zZXNzaW9uIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGlmICghc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSA9ICcxJztcbiAgfVxuXG4gIC8vIGlmIHVzaW5nIEpTRVAgd2l0aCBXZWJHUFUsIGFsd2F5cyBkaXNhYmxlIG1lbW9yeSBwYXR0ZXJuXG4gIGlmIChvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyAmJlxuICAgICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMuc29tZShlcCA9PiAodHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZSkgPT09ICd3ZWJncHUnKSkge1xuICAgIG9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPVxuICAgIChzZXNzaW9uT3B0aW9uc0hhbmRsZTogbnVtYmVyLCBleGVjdXRpb25Qcm92aWRlcnM6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uRXhlY3V0aW9uUHJvdmlkZXJDb25maWdbXSxcbiAgICAgYWxsb2NzOiBudW1iZXJbXSk6IHZvaWQgPT4ge1xuICAgICAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgICAgbGV0IGVwTmFtZSA9IHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWU7XG5cbiAgICAgICAgLy8gY2hlY2sgRVAgbmFtZVxuICAgICAgICBzd2l0Y2ggKGVwTmFtZSkge1xuICAgICAgICAgIGNhc2UgJ3hubnBhY2snOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1hOTlBBQ0snO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2Vibm4nOlxuICAgICAgICAgICAgZXBOYW1lID0gJ1dFQk5OJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYm5uT3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8uZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2RldmljZVR5cGUnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdkZXZpY2VUeXBlJyAtICR7d2Vibm5PcHRpb25zLmRldmljZVR5cGV9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAod2Vibm5PcHRpb25zPy5udW1UaHJlYWRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVRocmVhZHMgPSB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcztcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGlnbm9yZSBpbnZhbGlkIHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbnVtVGhyZWFkcyAhPSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihudW1UaHJlYWRzKSB8fCBudW1UaHJlYWRzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgbnVtVGhyZWFkcyA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ251bVRocmVhZHMnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhudW1UaHJlYWRzLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnbnVtVGhyZWFkcycgLSAke3dlYm5uT3B0aW9ucy5udW1UaHJlYWRzfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ucG93ZXJQcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwb3dlclByZWZlcmVuY2UnIC0gJHt3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgICAgICBlcE5hbWUgPSAnSlMnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zPy5wcmVmZXJyZWRMYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwcmVmZXJyZWRMYXlvdXQnIC0gJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3YXNtJzpcbiAgICAgICAgICBjYXNlICdjcHUnOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYXBwZW5kIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBzZXNzaW9uT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XG4gICAgY29uc3QgZXhlY3V0aW9uTW9kZSA9IGdldEV4ZWN1dGlvbk1vZGUoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uTW9kZSA/PyAnc2VxdWVudGlhbCcpO1xuICAgIGNvbnN0IGxvZ0lkRGF0YU9mZnNldCA9XG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgIC8vIERlZmF1bHQgdG8gMiAtIHdhcm5pbmdcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dWZXJib3NpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID8/IDA7ICAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xuICAgICAgICBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCwgYWxsb2NzKSA6XG4gICAgICAgIDA7XG5cbiAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb25PcHRpb25zKFxuICAgICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4sIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxuICAgICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gVGhpcyBmaWxlIGluY2x1ZGVzIGNvbW1vbiBkZWZpbml0aW9ucy4gVGhleSBkbyBOT1QgaGF2ZSBkZXBlbmRlbmN5IG9uIHRoZSBXZWJBc3NlbWJseSBpbnN0YW5jZS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBPTk5YIGRlZmluaXRpb24uIFVzZSB0aGlzIHRvIGRyb3AgZGVwZW5kZW5jeSAnb25ueF9wcm90bycgdG8gZGVjcmVhc2UgY29tcGlsZWQgLmpzIGZpbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xuICB1bmRlZmluZWQgPSAwLFxuICBmbG9hdCA9IDEsXG4gIHVpbnQ4ID0gMixcbiAgaW50OCA9IDMsXG4gIHVpbnQxNiA9IDQsXG4gIGludDE2ID0gNSxcbiAgaW50MzIgPSA2LFxuICBpbnQ2NCA9IDcsXG4gIHN0cmluZyA9IDgsXG4gIGJvb2wgPSA5LFxuICBmbG9hdDE2ID0gMTAsXG4gIGRvdWJsZSA9IDExLFxuICB1aW50MzIgPSAxMixcbiAgdWludDY0ID0gMTMsXG4gIGNvbXBsZXg2NCA9IDE0LFxuICBjb21wbGV4MTI4ID0gMTUsXG4gIGJmbG9hdDE2ID0gMTZcbn1cblxuLyoqXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtID0gKHR5cGU6IHN0cmluZyk6IERhdGFUeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50ODtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDg7XG4gICAgY2FzZSAnYm9vbCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MTY7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MTY7XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDMyO1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0MTY7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZG91YmxlO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuc3RyaW5nO1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcbiAgICBjYXNlICd1aW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ2NDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBlbnVtIHZhbHVlIHRvIHN0cmluZyB0ZW5zb3IgZGF0YVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlUHJvdG8pIHtcbiAgICBjYXNlIERhdGFUeXBlLmludDg6XG4gICAgICByZXR1cm4gJ2ludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDg6XG4gICAgICByZXR1cm4gJ3VpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XG4gICAgICByZXR1cm4gJ2Jvb2wnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MTY6XG4gICAgICByZXR1cm4gJ2ludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQxNjpcbiAgICAgIHJldHVybiAndWludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxuICAgICAgcmV0dXJuICdpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MzI6XG4gICAgICByZXR1cm4gJ3VpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDE2OlxuICAgICAgcmV0dXJuICdmbG9hdDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxuICAgICAgcmV0dXJuICdmbG9hdDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmRvdWJsZTpcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS5zdHJpbmc6XG4gICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcbiAgICAgIHJldHVybiAnaW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDY0OlxuICAgICAgcmV0dXJuICd1aW50NjQnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGVuc29yIGVsZW1lbnQgc2l6ZSBpbiBieXRlcyBieSB0aGUgZ2l2ZW4gZGF0YSB0eXBlXG4gKiBAcmV0dXJucyBzaXplIGluIGludGVnZXIgb3IgdW5kZWZpbmVkIGlmIHRoZSBkYXRhIHR5cGUgaXMgbm90IHN1cHBvcnRlZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VGVuc29yRWxlbWVudFNpemUgPSAoZGF0ZVR5cGU6IG51bWJlcik6IG51bWJlcnxcbiAgICB1bmRlZmluZWQgPT4gW3VuZGVmaW5lZCwgNCwgMSwgMSwgMiwgMiwgNCwgOCwgdW5kZWZpbmVkLCAxLCAyLCA4LCA0LCA4LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVtkYXRlVHlwZV07XG5cbi8qKlxuICogZ2V0IHR5cGVkIGFycmF5IGNvbnN0cnVjdG9yIGJ5IHRoZSBnaXZlbiB0ZW5zb3IgdHlwZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gKHR5cGU6IFRlbnNvci5UeXBlKTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3J8VWludDhBcnJheUNvbnN0cnVjdG9yfFxuICAgIEludDhBcnJheUNvbnN0cnVjdG9yfFVpbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MTZBcnJheUNvbnN0cnVjdG9yfEludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8XG4gICAgVWludDhBcnJheUNvbnN0cnVjdG9yfEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvciA9PiB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICAgICAgICBjYXNlICd1aW50OCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDgnOlxuICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgICAgICByZXR1cm4gSW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnYm9vbCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgICAgIHJldHVybiBGbG9hdDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ0ludDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ1VpbnQ2NEFycmF5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXBlfWApO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogTWFwIHN0cmluZyBsb2cgbGV2ZWwgdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZmF0YWwnOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgbG9nZ2luZyBsZXZlbDogJHtsb2dMZXZlbH1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlID0gKHR5cGU6IFRlbnNvci5UeXBlKTogdHlwZSBpcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0+IHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICAgIHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAnYm9vbCcgfHwgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICd1aW50MzInO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVNb2RlbGRhdGEsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7c2V0UnVuT3B0aW9uc30gZnJvbSAnLi9ydW4tb3B0aW9ucyc7XG5pbXBvcnQge3NldFNlc3Npb25PcHRpb25zfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XG5pbXBvcnQge2RhdGFMb2NhdGlvblN0cmluZ1RvRW51bSwgZ2V0VGVuc29yRWxlbWVudFNpemUsIGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSwgbG9nTGV2ZWxTdHJpbmdUb0VudW0sIHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nLCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSwgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yfSBmcm9tICcuL3dhc20tY29tbW9uJztcbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvcn0gZnJvbSAnLi93YXNtLXV0aWxzJztcblxubGV0IG9ydEVudkluaXRpYWxpemVkID0gZmFsc2U7XG5cbi8qKlxuICogZ2V0IHRoZSBpbnB1dC9vdXRwdXQgY291bnQgb2YgdGhlIHNlc3Npb24uXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxuICogQHJldHVybnMgYSB0dXBsZSBpbmNsdWRpbmcgMiBudW1iZXJzLCByZXByZXNlbnRpbmcgdGhlIGlucHV0IGNvdW50IGFuZCBvdXRwdXQgY291bnQuXG4gKi9cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlLCBkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgNCk7XG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IHNlc3Npb24gaW5wdXQvb3V0cHV0IGNvdW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gW3dhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0XSwgd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDQgKyAxXV07XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIGluaXRpYWxpemUgT1JUIGVudmlyb25tZW50LlxuICogQHBhcmFtIG51bVRocmVhZHMgU2V0R2xvYmFsSW50cmFPcE51bVRocmVhZHMobnVtVGhyZWFkcylcbiAqIEBwYXJhbSBsb2dnaW5nTGV2ZWwgQ3JlYXRlRW52KHN0YXRpY19jYXN0PE9ydExvZ2dpbmdMZXZlbD4obG9nZ2luZ19sZXZlbCkpXG4gKi9cbmNvbnN0IGluaXRPcnQgPSAobnVtVGhyZWFkczogbnVtYmVyLCBsb2dnaW5nTGV2ZWw6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCBlcnJvckNvZGUgPSBnZXRJbnN0YW5jZSgpLl9PcnRJbml0KG51bVRocmVhZHMsIGxvZ2dpbmdMZXZlbCk7XG4gIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBpbml0aWFsaXplIG9ubnhydW50aW1lLicpO1xuICB9XG59O1xuXG4vKipcbiAqIGludGlhbGl6ZSBydW50aW1lIGVudmlyb25tZW50LlxuICogQHBhcmFtIGVudiBwYXNzZWQgaW4gdGhlIGVudmlyb25tZW50IGNvbmZpZyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0UnVudGltZSA9IGFzeW5jKGVudjogRW52KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXQgT1JUXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xuXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgIC8vIGluaXQgSlNFUCBpZiBhdmFpbGFibGVcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gICAgY29uc3QgaW5pdEpzZXAgPSByZXF1aXJlKCcuL2pzZXAvaW5pdCcpLmluaXQ7XG4gICAgYXdhaXQgaW5pdEpzZXAoZ2V0SW5zdGFuY2UoKSwgZW52KTtcbiAgfVxuXG4gIG9ydEVudkluaXRpYWxpemVkID0gdHJ1ZTtcbn07XG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlciwgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbFxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG5leHBvcnQgY29uc3QgaXNPcnRFbnZJbml0aWFsaXplZCA9ICgpOiBib29sZWFuID0+IG9ydEVudkluaXRpYWxpemVkO1xuXG4vKipcbiAqIGFsbG9jYXRlIHRoZSBtZW1vcnkgYW5kIG1lbWNweSB0aGUgbW9kZWwgYnl0ZXMsIHByZXBhcmluZyBmb3IgY3JlYXRpbmcgYW4gaW5zdGFuY2Ugb2YgSW5mZXJlbmNlU2Vzc2lvbi5cbiAqIEByZXR1cm5zIGEgMi1lbGVtZW50cyB0dXBsZSAtIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBhbGxvY2F0ZWQgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uQWxsb2NhdGUgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIHVzaW5nIHRoZSBwcmVwYXJlZCBidWZmZXIgY29udGFpbmluZyB0aGUgbW9kZWwgZGF0YS5cbiAqIEBwYXJhbSBtb2RlbERhdGEgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGEgYnVmZmVyLlxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cbiAqIEByZXR1cm5zIGEgMy1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIFtzZXNzaW9uIGhhbmRsZSwgaW5wdXQgbmFtZXMsIG91dHB1dCBuYW1lc11cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb25GaW5hbGl6ZSA9XG4gICAgKG1vZGVsRGF0YTogU2VyaWFsaXphYmxlTW9kZWxkYXRhLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSA9PiB7XG4gICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICAgICAgbGV0IHNlc3Npb25PcHRpb25zSGFuZGxlID0gMDtcbiAgICAgIGxldCBpb0JpbmRpbmdIYW5kbGUgPSAwO1xuICAgICAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgICAgIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuICAgICAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuXG4gICAgICB0cnkge1xuICAgICAgICBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc10gPSBzZXRTZXNzaW9uT3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgICBzZXNzaW9uSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbihtb2RlbERhdGFbMF0sIG1vZGVsRGF0YVsxXSwgc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgICAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBhIHNlc3Npb24uJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICAgICAgY29uc3QgaW5wdXROYW1lcyA9IFtdO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lcyA9IFtdO1xuICAgICAgICBjb25zdCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0SW5wdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gaW5wdXQgbmFtZS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgaW5wdXROYW1lcy5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0T3V0cHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIG91dHB1dCBuYW1lLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgY29uc3QgbmFtZVN0cmluZyA9IHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpO1xuICAgICAgICAgIG91dHB1dE5hbWVzLnB1c2gobmFtZVN0cmluZyk7XG5cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA6XG4gICAgICAgICAgICAgICAgb3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24/LltuYW1lU3RyaW5nXSA/PyAnY3B1JztcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZmVyZWQgdG8gYmUgb24gR1BVLlxuICAgICAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsID0gbnVsbDtcbiAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5zb21lKGwgPT4gbCA9PT0gJ2dwdS1idWZmZXInKSkge1xuICAgICAgICAgIGlvQmluZGluZ0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZUJpbmRpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gICAgICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIElPIGJpbmRpbmcuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYmluZGluZ1N0YXRlID0ge1xuICAgICAgICAgICAgaGFuZGxlOiBpb0JpbmRpbmdIYW5kbGUsXG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsXG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMubWFwKGwgPT4gZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGwpKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb25IYW5kbGUsIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGJpbmRpbmdTdGF0ZV0pO1xuICAgICAgICByZXR1cm4gW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXMsIG91dHB1dE5hbWVzXTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gICAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcblxuICAgICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nSGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXNzaW9uSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uX2ZyZWUobW9kZWxEYXRhWzBdKTtcbiAgICAgICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICAgICAgfVxuICAgICAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgICB9XG4gICAgfTtcblxuXG4vKipcbiAqIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBJbmZlcmVuY2VTZXNzaW9uLlxuICogQHJldHVybnMgdGhlIG1ldGFkYXRhIG9mIEluZmVyZW5jZVNlc3Npb24uIDAtdmFsdWUgaGFuZGxlIGZvciBmYWlsdXJlLlxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbiA9XG4gICAgKG1vZGVsOiBVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSA9PiB7XG4gICAgICBjb25zdCBtb2RlbERhdGE6IFNlcmlhbGl6YWJsZU1vZGVsZGF0YSA9IGNyZWF0ZVNlc3Npb25BbGxvY2F0ZShtb2RlbCk7XG4gICAgICByZXR1cm4gY3JlYXRlU2Vzc2lvbkZpbmFsaXplKG1vZGVsRGF0YSwgb3B0aW9ucyk7XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHJlbGVhc2VTZXNzaW9uID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJlbGVhc2Ugc2Vzc2lvbi4gaW52YWxpZCBzZXNzaW9uIGlkOiAke3Nlc3Npb25JZH1gKTtcbiAgfVxuICBjb25zdCBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gIH1cblxuICB3YXNtLmpzZXBVbnJlZ2lzdGVyQnVmZmVycz8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTpcbiAgICAgICAgdm9pZCA9PiB7XG4gICAgICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCgwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XG5cbiAgICAgICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICAgICAgaWYgKGRhdGFUeXBlID09PSAnc3RyaW5nJyAmJiBsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHRlbnNvclsyXS5ncHVCdWZmZXIgYXMgR1BVQnVmZmVyO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG4gICAgICAgICAgICByYXdEYXRhID0gd2FzbS5qc2VwUmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSA0ICogZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICAgICAgbGV0IGRhdGFJbmRleCA9IHJhd0RhdGEgLyA0O1xuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZW5zb3IgZGF0YSBhdCBpbmRleCAke2l9IGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBkaW1zLmxlbmd0aCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICAgICAgZGltcy5mb3JFYWNoKGQgPT4gd2FzbS5IRUFQMzJbZGltSW5kZXgrK10gPSBkKTtcbiAgICAgICAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uX09ydENyZWF0ZVRlbnNvcihcbiAgICAgICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obG9jYXRpb24pKTtcbiAgICAgICAgICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBjb25zdCBpbnB1dENvdW50ID0gaW5wdXRJbmRpY2VzLmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0Q291bnQgPSBvdXRwdXRJbmRpY2VzLmxlbmd0aDtcblxuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBydW5PcHRpb25zQWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGlucHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3Qgb3V0cHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgYmVmb3JlUnVuU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IGlucHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcblxuICB0cnkge1xuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBjcmVhdGUgaW5wdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoaW5wdXRUZW5zb3JzW2ldLCBpbnB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0SW5kaWNlc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIGxldCBpbnB1dFZhbHVlc0luZGV4ID0gaW5wdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBpbnB1dE5hbWVzSW5kZXggPSBpbnB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0VmFsdWVzSW5kZXggPSBvdXRwdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXROYW1lc0luZGV4ID0gb3V0cHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXRWYWx1ZXNJbmRleCsrXSA9IGlucHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dE5hbWVzSW5kZXgrK10gPSBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzSW5kZXgrK10gPSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dE5hbWVzSW5kZXgrK10gPSBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dO1xuICAgIH1cblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgY29uc3Qge2hhbmRsZSwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkfSA9IGlvQmluZGluZ1N0YXRlO1xuXG4gICAgICBpZiAoaW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aCAhPT0gaW5wdXRDb3VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlucHV0IGNvdW50IGZyb20gZmVlZHMgKCR7XG4gICAgICAgICAgICBpbnB1dENvdW50fSkgaXMgZXhwZWN0ZWQgdG8gYmUgYWx3YXlzIGVxdWFsIHRvIG1vZGVsJ3MgaW5wdXQgY291bnQgKCR7aW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aH0pLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpbnB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBpbnB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cblxuICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgMCk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPVxuICAgICAgICAgICAgICB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIDAsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWRbaW5kZXhdKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBvdXRwdXRbJHtpfV0gdG8gJHtvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbaV19IGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZXJyb3JDb2RlOiBudW1iZXI7XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlcihncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJ3ZWJ3b3JrZXJcIiAvPlxuXG4vL1xuLy8gKiB0eXBlIGhhY2sgZm9yIFwiSFRNTEltYWdlRWxlbWVudFwiXG4vL1xuLy8gaW4gdHlwZXNjcmlwdCwgdGhlIHR5cGUgb2YgXCJIVE1MSW1hZ2VFbGVtZW50XCIgaXMgZGVmaW5lZCBpbiBsaWIuZG9tLmQudHMsIHdoaWNoIGlzIGNvbmZsaWN0IHdpdGggbGliLndlYndvcmtlci5kLnRzLlxuLy8gd2hlbiB3ZSB1c2Ugd2Vid29ya2VyLCB0aGUgbGliLndlYndvcmtlci5kLnRzIHdpbGwgYmUgdXNlZCwgd2hpY2ggZG9lcyBub3QgaGF2ZSBIVE1MSW1hZ2VFbGVtZW50IGRlZmluZWQuXG4vL1xuLy8gd2Ugd2lsbCBnZXQgdGhlIGZvbGxvd2luZyBlcnJvcnMgY29tcGxhaW5pbmcgdGhhdCBIVE1MSW1hZ2VFbGVtZW50IGlzIG5vdCBkZWZpbmVkOlxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gLi4vY29tbW9uL2Rpc3QvY2pzL3RlbnNvci1mYWN0b3J5LmQudHM6MTg3OjI5IC0gZXJyb3IgVFMyNTUyOiBDYW5ub3QgZmluZCBuYW1lICdIVE1MSW1hZ2VFbGVtZW50Jy4gRGlkIHlvdSBtZWFuXG4vLyAnSFRNTExJRWxlbWVudCc/XG4vL1xuLy8gMTg3ICAgICBmcm9tSW1hZ2UoaW1hZ2VFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50LCBvcHRpb25zPzogVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnMpOlxuLy8gUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gbm9kZV9tb2R1bGVzL0B3ZWJncHUvdHlwZXMvZGlzdC9pbmRleC5kLnRzOjgzOjcgLSBlcnJvciBUUzI1NTI6IENhbm5vdCBmaW5kIG5hbWUgJ0hUTUxJbWFnZUVsZW1lbnQnLiBEaWQgeW91IG1lYW5cbi8vICdIVE1MTElFbGVtZW50Jz9cbi8vXG4vLyA4MyAgICAgfCBIVE1MSW1hZ2VFbGVtZW50XG4vLyAgICAgICAgICB+fn5+fn5+fn5+fn5+fn5+XG4vL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vXG4vLyBgSFRNTEltYWdlRWxlbWVudGAgaXMgb25seSB1c2VkIGluIHR5cGUgZGVjbGFyYXRpb24gYW5kIG5vdCBpbiByZWFsIGNvZGUuIFNvIHdlIGRlZmluZSBpdCBhcyBgdW5rbm93bmAgaGVyZSB0b1xuLy8gYnlwYXNzIHRoZSB0eXBlIGNoZWNrLlxuLy9cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgdHlwZSBIVE1MSW1hZ2VFbGVtZW50ID0gdW5rbm93bjtcbn1cblxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGF9IGZyb20gJy4uL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7Y3JlYXRlU2Vzc2lvbiwgY3JlYXRlU2Vzc2lvbkFsbG9jYXRlLCBjcmVhdGVTZXNzaW9uRmluYWxpemUsIGVuZFByb2ZpbGluZywgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMsIGluaXRSdW50aW1lLCBpc09ydEVudkluaXRpYWxpemVkLCByZWxlYXNlU2Vzc2lvbiwgcnVufSBmcm9tICcuLi93YXNtLWNvcmUtaW1wbCc7XG5pbXBvcnQge2luaXRpYWxpemVXZWJBc3NlbWJseX0gZnJvbSAnLi4vd2FzbS1mYWN0b3J5Jztcblxuc2VsZi5vbm1lc3NhZ2UgPSAoZXY6IE1lc3NhZ2VFdmVudDxPcnRXYXNtTWVzc2FnZT4pOiB2b2lkID0+IHtcbiAgc3dpdGNoIChldi5kYXRhLnR5cGUpIHtcbiAgICBjYXNlICdpbml0LXdhc20nOlxuICAgICAgdHJ5IHtcbiAgICAgICAgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KGV2LmRhdGEuaW4hKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4gcG9zdE1lc3NhZ2Uoe3R5cGU6ICdpbml0LXdhc20nfSBhcyBPcnRXYXNtTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgZXJyID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbml0LW9ydCc6XG4gICAgICB0cnkge1xuICAgICAgICBpbml0UnVudGltZShldi5kYXRhLmluISkudGhlbigoKSA9PiBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtb3J0J30gYXMgT3J0V2FzbU1lc3NhZ2UpLCBlcnIgPT4gcG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbml0LW9ydCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gYXMgT3J0V2FzbU1lc3NhZ2UpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtb3J0JywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGVfYWxsb2NhdGUnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge21vZGVsfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBtb2RlbGRhdGEgPSBjcmVhdGVTZXNzaW9uQWxsb2NhdGUobW9kZWwpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9hbGxvY2F0ZScsIG91dDogbW9kZWxkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfYWxsb2NhdGUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZV9maW5hbGl6ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWxkYXRhLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBzZXNzaW9uTWV0YWRhdGEgPSBjcmVhdGVTZXNzaW9uRmluYWxpemUobW9kZWxkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfZmluYWxpemUnLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlX2ZpbmFsaXplJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge21vZGVsLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBzZXNzaW9uTWV0YWRhdGEgPSBjcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGUnLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZWxlYXNlJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlbGVhc2VTZXNzaW9uKGV2LmRhdGEuaW4hKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdyZWxlYXNlJ30gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncmVsZWFzZScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncnVuJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHtzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBydW4oc2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgbmV3IEFycmF5KG91dHB1dEluZGljZXMubGVuZ3RoKS5maWxsKG51bGwpLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgb3V0cHV0cyA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAob3V0cHV0cy5zb21lKG8gPT4gb1szXSAhPT0gJ2NwdScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncnVuJywgZXJyOiAnUHJveHkgZG9lcyBub3Qgc3VwcG9ydCBub24tY3B1IHRlbnNvciBsb2NhdGlvbi4nfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0eXBlOiAncnVuJywgb3V0OiBvdXRwdXRzfSBhcyBPcnRXYXNtTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzKG91dHB1dHMgYXMgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncnVuJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VuZC1wcm9maWxpbmcnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBlbmRQcm9maWxpbmcoaGFuZGxlcik7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnZW5kLXByb2ZpbGluZyd9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2VuZC1wcm9maWxpbmcnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2lzLW9ydC1lbnYtaW5pdGlhbGl6ZWQnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgb3J0RW52SW5pdGlhbGl6ZWQgPSBpc09ydEVudkluaXRpYWxpemVkKCk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaXMtb3J0LWVudi1pbml0aWFsaXplZCcsIG91dDogb3J0RW52SW5pdGlhbGl6ZWR9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2lzLW9ydC1lbnYtaW5pdGlhbGl6ZWQnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gIH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBYTtBQUFiO0FBQUE7QUFBTyxNQUFNLFdBQVc7QUFBQTtBQUFBOzs7QUNBeEI7QUFBQTtBQUFBLGdCQUFBQTtBQUFBO0FBQUEsTUFBYUE7QUFBYjtBQUFBO0FBQU8sTUFBTUEsUUFBTztBQUFBO0FBQUE7OztBQ0FwQjtBQUFBO0FBQUE7QUFDQSxVQUFJLFdBQVcsTUFBTTtBQUNuQixZQUFJLGFBQWEsT0FBTyxhQUFhLGVBQWUsU0FBUyxnQkFBZ0IsU0FBUyxjQUFjLE1BQU07QUFDMUcsWUFBSSxPQUFPLGVBQWU7QUFBYSx1QkFBYSxjQUFjO0FBQ2xFLGVBQ0YsU0FBUyxZQUFZLENBQUMsR0FBRztBQUV6QixjQUFJLElBQUUsV0FBVSxHQUFFO0FBQUUsWUFBRSxRQUFNLElBQUksUUFBUSxDQUFDLEdBQUUsTUFBSTtBQUFDLGdCQUFFO0FBQUUsZ0JBQUU7QUFBQSxVQUFDLENBQUM7QUFBRSxjQUFJLElBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxDQUFDLEdBQUUsSUFBRSxrQkFBaUIsS0FBRyxZQUFVLE9BQU8sUUFBTyxJQUFFLGNBQVksT0FBTyxlQUFjLEtBQUcsWUFBVSxPQUFPLFdBQVMsWUFBVSxPQUFPLFFBQVEsWUFBVSxZQUFVLE9BQU8sUUFBUSxTQUFTLE1BQUssSUFBRSxJQUFHLEdBQUUsR0FBRTtBQUNyUixjQUFHLElBQUc7QUFBQyxnQkFBSSxLQUFHLHVDQUFjLElBQUU7QUFBZ0IsZ0JBQUUsSUFB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LEdBQUUsSUFBRyxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsSUFBRSxFQUFFLENBQUMsSUFBRSxHQUFFO0FBQUUsZ0JBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQUU7QUFBQSxjQUFDLE1BQUs7QUFBQSxjQUF1QixNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBSyxNQUFLO0FBQUEsY0FBYyxNQUFLO0FBQUEsY0FBUSxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FDbmYsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLFlBQUk7QUFBRSxxQkFBUSxLQUFLO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsQ0FBQztBQUFFLGdCQUFJLEtBQUcsMkRBQTJELE1BQU0sR0FBRyxHQUFFLEtBQUcsd0ZBQXdGLE1BQU0sR0FBRztBQUFFLGdCQUFFLEVBQUMsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsR0FBRSxNQUFLLE9BQ2xmLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsR0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEtBQUcsUUFBTSxNQUFJLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsa0JBQUUsRUFBRTtBQUFHLG1CQUFHLElBQUUsSUFBRSxLQUFHLEtBQUcsTUFBSSxLQUFHO0FBQUkscUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyxxQkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxNQUFJLE1BQUssTUFBSyxPQUFHLEtBQUcsRUFBRSxNQUFJLEtBQUcsRUFBRSxLQUFHLE9BQUssTUFBSyxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssTUFBSSxLQUFLLE1BQUssT0FBRyxF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QUFTO0FBQUUsZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsWUFBWSxJQUFFO0FBQUssZ0JBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUNwZixDQUFDLEtBQUcsRUFBRSxFQUFFLFlBQVksQ0FBQyxJQUFFLEtBQUcsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFFLEVBQUUsUUFBUSxJQUFFLElBQUU7QUFBRSxnQkFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxLQUFHLEVBQUUsa0JBQWtCO0FBQUcsa0JBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGtCQUFJLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGdCQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsS0FBRyxLQUFHLEtBQUcsRUFBRSxrQkFBa0IsS0FBRyxLQUFLLElBQUksR0FBRSxDQUFDLEtBQUc7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLHFCQUFLO0FBQUUsa0JBQUksSUFBRSxJQUFJLEtBQUssRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsTUFBSyxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLGtCQUFrQixHQUFFLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQixHQUNwZixJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFB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RSxLQUFHLENBQUMsR0FBRSxHQUFFLE1BQUksR0FBRyxHQUFFLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFDOWQsbUJBQVMsR0FBRyxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsY0FBSSxLQUFHLE9BQUc7QUFBQyxnQkFBRyxDQUFDO0FBQUUsa0JBQUc7QUFBQyxvQkFBRyxFQUFFLEdBQUUsQ0FBQyxFQUFFO0FBQUUsc0JBQUc7QUFBQyx3QkFBRSxHQUFHLENBQUMsSUFBRSxHQUFHLENBQUM7QUFBQSxrQkFBQyxTQUFPLEdBQUU7QUFBQyxpQ0FBYSxLQUFHLFlBQVUsS0FBRyxFQUFFLEdBQUUsQ0FBQztBQUFBLGtCQUFDO0FBQUEsY0FBQyxTQUFPLEdBQUU7QUFBQyw2QkFBYSxLQUFHLFlBQVUsS0FBRyxFQUFFLEdBQUUsQ0FBQztBQUFBLGNBQUM7QUFBQSxVQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFO0FBQUMsbUJBQUs7QUFBRSwyQkFBYSxPQUFPLFFBQVEsT0FBSyxRQUFRLEdBQUcsRUFBRSxHQUFFLEtBQUcsR0FBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUMsR0FBRSxLQUFHLEtBQUksUUFBUSxNQUFNLEVBQUUsR0FBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLFVBQUU7QUFBQyxZQUFFLG9DQUFrQztBQUFHLG1CQUFTLElBQUc7QUFBQyxnQkFBSSxJQUFFLEVBQUU7QUFBRSxrQkFBSSxHQUFHLENBQUMsR0FBRSxHQUFHLE1BQUksR0FBRyxDQUFDO0FBQUEsVUFBRTtBQUFDLFlBQUUsZUFBYTtBQUM5ZSxjQUFJLElBQUUsT0FBRyxNQUFJLElBQUUsTUFBSSxNQUFJLElBQUUsT0FBSyxNQUFJLElBQUUsTUFBSyxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUcsR0FBRSxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUc7QUFBRSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFHO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLGNBQUksS0FBRyxPQUFHO0FBQUMsZ0JBQUksSUFBRSxHQUFHLENBQUMsSUFBRSxHQUFFLElBQUUsR0FBRyxDQUFDO0FBQUUsaUJBQUcsR0FBRyxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEtBQUcsT0FBRztBQUFDLGdCQUFJLElBQUUsR0FBRztBQUFFLGdCQUFFLEVBQUU7QUFBRSxlQUFHLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFDdFcsbUJBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLFVBQVUsU0FBTyxHQUFFLElBQUU7QUFBVSxtQkFBTyxHQUFHLE1BQUk7QUFBQyx1QkFBUSxJQUFFLEdBQUcsSUFBRSxDQUFDLEdBQUUsSUFBRSxLQUFHLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsb0JBQUksSUFBRSxFQUFFLElBQUUsQ0FBQztBQUFFLG1CQUFHLEVBQUUsSUFBRSxNQUFJLENBQUMsSUFBRTtBQUFBLGNBQUM7QUFBQyxxQkFBTyxHQUFHLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDLENBQUM7QUFBQSxVQUFDO0FBQzNKLGNBQUksS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxNQUFJO0FBQUMsZ0JBQUcsQ0FBQyxJQUFHO0FBQUMsa0JBQUksSUFBRSxFQUFDLE1BQUssWUFBVyxTQUFRLFlBQVcsTUFBSyxLQUFJLEtBQUksS0FBSSxNQUFLLGtCQUFpQixPQUFNLFlBQVUsT0FBTyxhQUFXLFVBQVUsYUFBVyxVQUFVLFVBQVUsQ0FBQyxLQUFHLEtBQUssUUFBUSxLQUFJLEdBQUcsSUFBRSxVQUFTLEdBQUUsTUFBSSxpQkFBZ0IsR0FBRTtBQUFFLG1CQUFJLEtBQUs7QUFBRywyQkFBUyxHQUFHLENBQUMsSUFBRSxPQUFPLEVBQUUsQ0FBQyxJQUFFLEVBQUUsQ0FBQyxJQUFFLEdBQUcsQ0FBQztBQUFFLGtCQUFJLElBQUUsQ0FBQztBQUFFLG1CQUFJLEtBQUs7QUFBRSxrQkFBRSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFBRSxtQkFBRztBQUFBLFlBQUM7QUFBQyxtQkFBTztBQUFBLFVBQUUsR0FBRTtBQUN0VyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUU7QUFBRSxlQUFHLEVBQUUsUUFBUSxTQUFTLEdBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsSUFBRTtBQUFFLGtCQUFFLEVBQUUsRUFBRSxJQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFJLElBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxFQUFFO0FBQUUsbUJBQUcsRUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVyxDQUFDO0FBQUUsaUJBQUcsRUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFO0FBQUUsbUJBQUcsRUFBRSxTQUFPO0FBQUEsWUFBQyxDQUFDO0FBQUUsbUJBQU87QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxnQkFBSSxJQUFFLEdBQUc7QUFBRSxjQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFO0FBQU8sZ0JBQUksSUFBRTtBQUFFLGNBQUUsUUFBUSxTQUFTLEdBQUU7QUFBQyxtQkFBRyxFQUFFLFNBQU87QUFBQSxZQUFDLENBQUM7QUFBRSxjQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUNqZCxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFFO0FBQUMsY0FBSSxLQUFHLENBQUMsTUFBSyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUscUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLGtCQUFJLElBQUUsRUFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQztBQUFFLG1CQUFHO0FBQUUsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsb0JBQUksSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLENBQUMsR0FBRSxJQUFFLEdBQUcsQ0FBQztBQUFFLHNCQUFJLEtB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RUFBRTtBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFFLEVBQUU7QUFBRyxxQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHVCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsY0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMseUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyx1QkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxNQUFJO0FBQUEsY0FBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSztBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssTUFBSTtBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsTUFBSTtBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FDeGYsSUFBRSxFQUFFLE1BQUksQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFJLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQztBQUFFLHNCQUFJLEVBQUUsS0FBRyxNQUFJLEVBQUUsS0FBRyxLQUFHLEtBQUc7QUFBSSxvQkFBRztBQUFFLHdCQUFJLE1BQUksS0FBRyxFQUFFLEtBQUcsTUFBSSxFQUFFLE1BQUksR0FBRSxLQUFHLEtBQUcsS0FBRyxLQUFHLEVBQUUsRUFBRSxFQUFFLE1BQUksSUFBRTtBQUFBLHFCQUFRO0FBQUMsc0JBQUU7QUFBRyxzQkFBSSxLQUFHLEVBQUUsS0FBRyxJQUFFLEVBQUUsS0FBRyxLQUFHO0FBQUUsbUJBQUMsS0FBRyxLQUFHLEtBQUcsS0FBRyxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsTUFBSTtBQUFBLGdCQUFHO0FBQUMsdUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssUUFBSSxFQUFFLEtBQUcsTUFBTSxTQUFTLEVBQUUsVUFBVSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFHO0FBQUEsY0FBSyxNQUFLLE9BQUc7QUFBQyxvQkFBRSxFQUFFO0FBQUcsb0JBQUksSUFBRSxLQUFHO0FBQUUsb0JBQUUsS0FBSyxJQUFJLENBQUMsSUFBRTtBQUFHLHdCQUFPLElBQUUsTUFBSSxPQUFLLE9BQU8sVUFBUSxJQUFFLEtBQUcsTUFBSSxJQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxNQUFJO0FBQUEsWUFBRztBQUFFLGdCQUFFLEVBQUU7QUFBQSxjQUFRO0FBQUEsY0FDbmY7QUFBQSxZQUFVO0FBQUUsaUJBQUksS0FBSztBQUFFLGdCQUFFLFNBQVMsQ0FBQyxNQUFJLElBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBRyxnQkFBRSxFQUFFLFFBQVEsU0FBUSxHQUFHO0FBQUUsZ0JBQUUsR0FBRyxDQUFDO0FBQUUsZ0JBQUcsRUFBRSxTQUFPO0FBQUUscUJBQU87QUFBRSxlQUFHLEdBQUUsQ0FBQztBQUFFLG1CQUFPLEVBQUUsU0FBTztBQUFBLFVBQUM7QUFBQyxZQUFFLEdBQUc7QUFDdEssY0FBSSxLQUFHLENBQUMsTUFBSyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsRUFBRSxHQUFFLEtBQUc7QUFBQSxZQUFDLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUsY0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFHLEdBQUcsTUFBSSxHQUFFLE1BQUksQ0FBQztBQUFFLG1CQUFHO0FBQUU7QUFBSyxvQkFBTTtBQUFBLFlBQUc7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMsaUJBQUcsTUFBSSxHQUFFLENBQUMsR0FBRSxHQUFFLENBQUMsSUFBRyxRQUFPLEtBQUU7QUFBRSxnQkFBRSxHQUFHO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFFLFlBQVksRUFBQyxLQUFJLGlCQUFnQixRQUFPLEVBQUMsQ0FBQyxJQUFFLEdBQUcsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUUsTUFBSTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUsbUJBQUcsTUFBSSxJQUFFLFdBQVcsTUFBSSxFQUFFLENBQUMsSUFBRSxJQUFFLFlBQVksRUFBQyxjQUFhLEdBQUUsS0FBSSxlQUFjLENBQUMsS0FBRyxJQUFFLEVBQUUsR0FBRyxDQUFDLE1BQUksRUFBRSxZQUFZLEVBQUMsS0FBSSxlQUFjLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFDdmdCLEdBQUUsV0FBVTtBQUFDLHFCQUFNO0FBQUEsWUFBRTtBQUFBLFlBQUUsR0FBRTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUU7QUFBQyxtQkFBRyxFQUFFLEdBQUcsTUFBSSxDQUFDLEVBQUUsSUFBSTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGtCQUFFLElBQUUsWUFBVSxJQUFFLFVBQVEsQ0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLHFCQUFLO0FBQUUsa0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGdCQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGVBQWUsSUFBRTtBQUFLLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsVUFBVTtBQUFFLG1CQUFH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RSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxnQkFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxRQUFRO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxRQUFRO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUU7QUFBSSxxQkFBTyxJQUFJLElBQUUsR0FBRSxLQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBRSxJQUFFLElBQUUsQ0FBQyxLQUFLLE1BQU0sSUFBRSxVQUFVLE1BQUksSUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sSUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFJLE1BQUksVUFBVSxNQUFJLElBQUUsRUFBRSxHQUFFLE1BQUk7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFO0FBQUEsWUFBRyxHQUFFO0FBQUEsWUFBRyxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyx1QkFBUyxFQUFFLEdBQUU7QUFBQyx3QkFBTyxJQUFFLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLEtBQ3BmLEVBQUUsQ0FBQyxJQUFFO0FBQUEsY0FBSztBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxxQkFBSztBQUFFLGtCQUFJLEtBQUcsb0JBQUksUUFBTSxZQUFZLEdBQUUsSUFBRSxJQUFJLEtBQUssR0FBRSxHQUFFLENBQUMsR0FBRSxJQUFF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Qyw0QkFBWSxFQUFDLE1BQU0sT0FBTyxLQUFLLGtEQUFpRCxDQUFDO0FBQUEsY0FDbkYsT0FBTztBQUNMO0FBQUEsa0JBQ0ksRUFBQyxNQUFNLE9BQU8sS0FBSyxRQUFPO0FBQUEsa0JBQzFCLDJCQUEyQixPQUF1QztBQUFBLGdCQUFDO0FBQUEsY0FDekU7QUFBQSxZQUNGO0FBQUEsWUFDQSxTQUFPO0FBQ0wsMEJBQVksRUFBQyxNQUFNLE9BQU8sSUFBRyxDQUFtQjtBQUFBLFlBQ2xEO0FBQUEsVUFBQztBQUFBLFFBQ1gsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLE9BQU8sSUFBRyxDQUFtQjtBQUFBLFFBQ2xEO0FBQ0E7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQ0YsZ0JBQU0sVUFBVSxHQUFHLEtBQUs7QUFDeEIsdUJBQWEsT0FBTztBQUNwQixzQkFBWSxFQUFDLE1BQU0sZ0JBQWUsQ0FBbUI7QUFBQSxRQUN2RCxTQUFTLEtBQUs7QUFDWixzQkFBWSxFQUFDLE1BQU0saUJBQWlCLElBQUcsQ0FBbUI7QUFBQSxRQUM1RDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNSSxxQkFBb0Isb0JBQW9CO0FBQzlDLHNCQUFZLEVBQUMsTUFBTSwwQkFBMEIsS0FBS0EsbUJBQWlCLENBQW1CO0FBQUEsUUFDeEYsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLDBCQUEwQixJQUFHLENBQW1CO0FBQUEsUUFDckU7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFsiam9pbiIsICJ3YXNtIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInRlbnNvciIsICJlcnJvckNvZGUiLCAiaSIsICJvcnRFbnZJbml0aWFsaXplZCJdCn0K\n';
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