/*!
 * ONNX Runtime Web v1.17.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
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

// web/lib/wasm/binding/ort-wasm.js
var require_ort_wasm = __commonJS({
  "web/lib/wasm/binding/ort-wasm.js"(exports, module) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        var e = moduleArg, aa, l;
        e.ready = new Promise((a, b) => {
          aa = a;
          l = b;
        });
        var ba = Object.assign({}, e), m = "./this.program", ca = "object" == typeof window, r = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, w = "", x, y, z;
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
          y = (a, b, c, d = true) => {
            a = a.startsWith("file://") ? new URL(a) : B.normalize(a);
            fs.readFile(a, d ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(d ? h.buffer : h);
            });
          };
          !e.thisProgram && 1 < process.argv.length && (m = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          e.inspect = () => "[Emscripten Module object]";
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
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          };
        var ea = e.print || console.log.bind(console), C = e.printErr || console.error.bind(console);
        Object.assign(e, ba);
        ba = null;
        e.thisProgram && (m = e.thisProgram);
        var D;
        e.wasmBinary && (D = e.wasmBinary);
        var noExitRuntime = e.noExitRuntime || true;
        "object" != typeof WebAssembly && E("no native wasm support detected");
        var F, G, fa = false, H, I, J, K;
        function ha() {
          var a = F.buffer;
          e.HEAP8 = H = new Int8Array(a);
          e.HEAP16 = new Int16Array(a);
          e.HEAP32 = J = new Int32Array(a);
          e.HEAPU8 = I = new Uint8Array(a);
          e.HEAPU16 = new Uint16Array(a);
          e.HEAPU32 = K = new Uint32Array(a);
          e.HEAPF32 = new Float32Array(a);
          e.HEAPF64 = new Float64Array(a);
        }
        var L, ia = [], ja = [], ka = [];
        function la() {
          var a = e.preRun.shift();
          ia.unshift(a);
        }
        var M = 0, N = null, O = null;
        function E(a) {
          if (e.onAbort)
            e.onAbort(a);
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
        P = "ort-wasm.wasm";
        if (!ma(P)) {
          var na = P;
          P = e.locateFile ? e.locateFile(na, w) : w + na;
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
                y(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => oa(a));
        }
        function qa(a, b, c) {
          return pa(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            C("failed to asynchronously prepare wasm: " + d);
            E(d);
          });
        }
        function ra(a, b) {
          var c = P;
          return D || "function" != typeof WebAssembly.instantiateStreaming || ma(c) || c.startsWith("file://") || da || "function" != typeof fetch ? qa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {
            C("wasm streaming compile failed: " + g);
            C("falling back to ArrayBuffer instantiation");
            return qa(c, a, b);
          }));
        }
        var Q, R = (a) => {
          for (; 0 < a.length; )
            a.shift()(e);
        };
        function sa(a) {
          this.xa = a - 24;
          this.Ga = function(b) {
            K[this.xa + 4 >> 2 >>> 0] = b;
          };
          this.Fa = function(b) {
            K[this.xa + 8 >> 2 >>> 0] = b;
          };
          this.za = function(b, c) {
            this.Ea();
            this.Ga(b);
            this.Fa(c);
          };
          this.Ea = function() {
            K[this.xa + 16 >> 2 >>> 0] = 0;
          };
        }
        var ta = 0, ua = 0, va = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, wa = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && va)
            return va.decode(a.subarray(b, c));
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
        }, S = (a, b) => (a >>>= 0) ? wa(I, a, b) : "", T = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, U = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var g = c;
          d = c + d - 1;
          for (var h = 0; h < a.length; ++h) {
            var k = a.charCodeAt(h);
            if (55296 <= k && 57343 >= k) {
              var p = a.charCodeAt(++h);
              k = 65536 + ((k & 1023) << 10) | p & 1023;
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
        function Ka(a, b, c, d) {
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
            var n = f.ta;
            for (f = new Date(new Date(f.ua + 1900, 0, 1).getTime()); 0 < n; ) {
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
          d >>>= 0;
          var u = J[d + 40 >> 2 >>> 0];
          d = { Ca: J[d >> 2 >>> 0], Ba: J[d + 4 >> 2 >>> 0], va: J[d + 8 >> 2 >>> 0], ya: J[d + 12 >> 2 >>> 0], wa: J[d + 16 >> 2 >>> 0], ua: J[d + 20 >> 2 >>> 0], sa: J[d + 24 >> 2 >>> 0], ta: J[d + 28 >> 2 >>> 0], Ha: J[d + 32 >> 2 >>> 0], Aa: J[d + 36 >> 2 >>> 0], Da: u ? S(u) : "" };
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
          u = { "%a": (f) => Ba[f.sa].substring(0, 3), "%A": (f) => Ba[f.sa], "%b": (f) => Ca[f.wa].substring(0, 3), "%B": (f) => Ca[f.wa], "%C": (f) => h((f.ua + 1900) / 100 | 0, 2), "%d": (f) => h(f.ya, 2), "%e": (f) => g(f.ya, 2, " "), "%g": (f) => t(f).toString().substring(2), "%G": (f) => t(f), "%H": (f) => h(f.va, 2), "%I": (f) => {
            f = f.va;
            0 == f ? f = 12 : 12 < f && (f -= 12);
            return h(f, 2);
          }, "%j": (f) => {
            for (var n = 0, q = 0; q <= f.wa - 1; n += (V(f.ua + 1900) ? Ha : Ia)[q++])
              ;
            return h(f.ya + n, 3);
          }, "%m": (f) => h(f.wa + 1, 2), "%M": (f) => h(f.Ba, 2), "%n": () => "\n", "%p": (f) => 0 <= f.va && 12 > f.va ? "AM" : "PM", "%S": (f) => h(f.Ca, 2), "%t": () => "	", "%u": (f) => f.sa || 7, "%U": (f) => h(Math.floor((f.ta + 7 - f.sa) / 7), 2), "%V": (f) => {
            var n = Math.floor((f.ta + 7 - (f.sa + 6) % 7) / 7);
            2 >= (f.sa + 371 - f.ta - 2) % 7 && n++;
            if (n)
              53 == n && (q = (f.sa + 371 - f.ta) % 7, 4 == q || 3 == q && V(f.ua) || (n = 1));
            else {
              n = 52;
              var q = (f.sa + 7 - f.ta - 1) % 7;
              (4 == q || 5 == q && V(f.ua % 400 - 1)) && n++;
            }
            return h(n, 2);
          }, "%w": (f) => f.sa, "%W": (f) => h(Math.floor((f.ta + 7 - (f.sa + 6) % 7) / 7), 2), "%y": (f) => (f.ua + 1900).toString().substring(2), "%Y": (f) => f.ua + 1900, "%z": (f) => {
            f = f.Aa;
            var n = 0 <= f;
            f = Math.abs(f) / 60;
            return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
          }, "%Z": (f) => f.Da, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (v in u)
            c.includes(v) && (c = c.replace(new RegExp(v, "g"), u[v](d)));
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
              for (var d = 0; d < 0 + c; d++) {
                var g = d;
                var h = X[g];
                h || (g >= X.length && (X.length = g + 1), X[g] = h = L.get(g));
                (g = h) && Y.set(g, d);
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
            d = c, L.set(d, a), X[d] = L.get(d);
          } catch (p) {
            if (!(p instanceof TypeError))
              throw p;
            if ("function" == typeof WebAssembly.Function) {
              d = WebAssembly.Function;
              g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };
              h = { parameters: [], results: "v" == b[0] ? [] : [g[b[0]]] };
              for (var k = 1; k < b.length; ++k)
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
            d = c;
            L.set(d, b);
            X[d] = L.get(d);
          }
          Y.set(a, c);
          return c;
        }
        var Oa = {
          a: function(a, b, c) {
            a >>>= 0;
            new sa(a).za(b >>> 0, c >>> 0);
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
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            J[c + 32 >> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
          },
          q: function(a) {
            a >>>= 0;
            var b = new Date(J[a + 20 >> 2 >>> 0] + 1900, J[a + 16 >> 2 >>> 0], J[a + 12 >> 2 >>> 0], J[a + 8 >> 2 >>> 0], J[a + 4 >> 2 >>> 0], J[a >> 2 >>> 0], 0), c = J[a + 32 >> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);
            0 > c ? J[a + 32 >> 2 >>> 0] = Number(g != h && k == d) : 0 < c != (k == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - d)));
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
            function d(t) {
              return (t = t.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? t[1] : "GMT";
            }
            c >>>= 0;
            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);
            g = h.getTimezoneOffset();
            var p = k.getTimezoneOffset();
            K[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, p);
            J[b >>> 0 >> 2 >>> 0] = Number(g != p);
            a = d(h);
            b = d(k);
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
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var g = Math;
              d = Math.max(a, d);
              a: {
                g = g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - F.buffer.byteLength + 65535 >>> 16;
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
            Fa().forEach(function(d, g) {
              var h = b + c;
              g = K[a + 4 * g >> 2 >>> 0] = h;
              for (h = 0; h < d.length; ++h)
                H[g++ >> 0 >>> 0] = d.charCodeAt(h);
              H[g >> 0 >>> 0] = 0;
              c += d.length + 1;
            });
            return 0;
          },
          D: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = Fa();
            K[a >> 2 >>> 0] = c.length;
            var d = 0;
            c.forEach(function(g) {
              d += g.length + 1;
            });
            K[b >> 2 >>> 0] = d;
            return 0;
          },
          f: () => 52,
          k: function() {
            return 52;
          },
          r: function() {
            return 70;
          },
          j: function(a, b, c, d) {
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            for (var g = 0, h = 0; h < c; h++) {
              var k = K[b >> 2 >>> 0], p = K[b + 4 >> 2 >>> 0];
              b += 8;
              for (var t = 0; t < p; t++) {
                var u = I[k + t >>> 0], v = Ga[a];
                0 === u || 10 === u ? ((1 === a ? ea : C)(wa(v, 0)), v.length = 0) : v.push(u);
              }
              g += p;
            }
            K[d >> 2 >>> 0] = g;
            return 0;
          },
          B: Ka,
          c: function(a, b, c, d) {
            return Ka(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          },
          i: function(a, b, c, d) {
            const g = L.length;
            a = new Uint8Array(I.slice(a + b, a + c));
            try {
              var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: F } }), p;
              for (p in k.exports)
                Ma(k.exports[p]);
              return g < L.length ? g : d;
            } catch (t) {
              return console.log(t), d;
            }
          }
        };
        (function() {
          function a(c) {
            c = c.exports;
            G = c = Pa(c);
            F = G.K;
            ha();
            L = G.na;
            ja.unshift(G.L);
            M--;
            e.monitorRunDependencies && e.monitorRunDependencies(M);
            if (0 == M && (null !== N && (clearInterval(N), N = null), O)) {
              var d = O;
              O = null;
              d();
            }
            return c;
          }
          var b = { a: Oa };
          M++;
          e.monitorRunDependencies && e.monitorRunDependencies(M);
          if (e.instantiateWasm)
            try {
              return e.instantiateWasm(b, a);
            } catch (c) {
              C("Module.instantiateWasm callback failed with error: " + c), l(c);
            }
          ra(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        })();
        e._OrtInit = (a, b) => (e._OrtInit = G.M)(a, b);
        e._OrtGetLastError = (a, b) => (e._OrtGetLastError = G.N)(a, b);
        e._OrtCreateSessionOptions = (a, b, c, d, g, h, k, p, t, u) => (e._OrtCreateSessionOptions = G.O)(a, b, c, d, g, h, k, p, t, u);
        e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = G.P)(a, b);
        e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = G.Q)(a, b, c);
        e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = G.R)(a, b, c);
        e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = G.S)(a);
        e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = G.T)(a, b, c);
        e._OrtReleaseSession = (a) => (e._OrtReleaseSession = G.U)(a);
        e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = G.V)(a, b, c);
        e._OrtGetInputName = (a, b) => (e._OrtGetInputName = G.W)(a, b);
        e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = G.X)(a, b);
        e._OrtFree = (a) => (e._OrtFree = G.Y)(a);
        e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = G.Z)(a, b, c, d, g, h);
        e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = G._)(a, b, c, d, g);
        e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = G.$)(a);
        e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = G.aa)(a, b, c, d);
        e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = G.ba)(a, b, c);
        e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = G.ca)(a);
        e._OrtCreateBinding = (a) => (e._OrtCreateBinding = G.da)(a);
        e._OrtBindInput = (a, b, c) => (e._OrtBindInput = G.ea)(a, b, c);
        e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = G.fa)(a, b, c, d);
        e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = G.ga)(a);
        e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = G.ha)(a);
        e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = G.ia)(a, b, c, d, g);
        e._OrtRun = (a, b, c, d, g, h, k, p) => (e._OrtRun = G.ja)(a, b, c, d, g, h, k, p);
        e._OrtEndProfiling = (a) => (e._OrtEndProfiling = G.ka)(a);
        var za = e._malloc = (a) => (za = e._malloc = G.la)(a);
        e._free = (a) => (e._free = G.ma)(a);
        var Na = (a) => (Na = G.oa)(a), Qa = () => (Qa = G.pa)(), Ra = (a) => (Ra = G.qa)(a), Sa = (a) => (Sa = G.ra)(a);
        e.___start_em_js = 905088;
        e.___stop_em_js = 905700;
        function Pa(a) {
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;
          a.__errno_location = b(a.__errno_location);
          a.malloc = c(a.malloc);
          a.stackSave = b(a.stackSave);
          a.stackAlloc = c(a.stackAlloc);
          return a;
        }
        e.stackAlloc = Sa;
        e.stackSave = Qa;
        e.stackRestore = Ra;
        e.addFunction = Ma;
        e.UTF8ToString = S;
        e.stringToUTF8 = (a, b, c) => U(a, I, b, c);
        e.lengthBytesUTF8 = T;
        var Z;
        O = function Ta() {
          Z || Ua();
          Z || (O = Ta);
        };
        function Ua() {
          function a() {
            if (!Z && (Z = true, e.calledRun = true, !fa)) {
              R(ja);
              aa(e);
              if (e.onRuntimeInitialized)
                e.onRuntimeInitialized();
              if (e.postRun)
                for ("function" == typeof e.postRun && (e.postRun = [e.postRun]); e.postRun.length; ) {
                  var b = e.postRun.shift();
                  ka.unshift(b);
                }
              R(ka);
            }
          }
          if (!(0 < M)) {
            if (e.preRun)
              for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; )
                la();
            R(ia);
            0 < M || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                e.setStatus("");
              }, 1);
              a();
            }, 1)) : a());
          }
        }
        if (e.preInit)
          for ("function" == typeof e.preInit && (e.preInit = [e.preInit]); 0 < e.preInit.length; )
            e.preInit.pop()();
        Ua();
        return moduleArg.ready;
      };
    })();
    if (typeof exports === "object" && typeof module === "object")
      module.exports = ortWasm;
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
  "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {
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
        w.___start_em_js = 906316;
        w.___stop_em_js = 906928;
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
    if (typeof exports === "object" && typeof module === "object")
      module.exports = ortWasmThreaded;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasmThreaded);
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.worker.js
var require_ort_wasm_threaded_worker = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {
    module.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\n';
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_node_path();
    if (false) {
      ortWasmFactory = null;
    } else {
      ortWasmFactory = true ? require_ort_wasm() : null;
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
        if (false) {
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
          (module) => {
            initializing = false;
            initialized = true;
            wasm = module;
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
  "proxy-worker:./proxy-worker/main"(exports, module) {
    module.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    readFile: () => readFile\n  });\n  var readFile;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm.js\n  var require_ort_wasm = __commonJS({\n    "web/lib/wasm/binding/ort-wasm.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var e = moduleArg, aa, l;\n          e.ready = new Promise((a, b) => {\n            aa = a;\n            l = b;\n          });\n          var ba = Object.assign({}, e), m = "./this.program", ca = "object" == typeof window, r = "function" == typeof importScripts, da = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, w = "", x, y, z;\n          if (da) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), B = (init_path(), __toCommonJS(path_exports));\n            w = r ? B.dirname(w) + "/" : __dirname + "/";\n            x = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : B.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            z = (a) => {\n              a = x(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            y = (a, b, c, d = true) => {\n              a = a.startsWith("file://") ? new URL(a) : B.normalize(a);\n              fs.readFile(a, d ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(d ? h.buffer : h);\n              });\n            };\n            !e.thisProgram && 1 < process.argv.length && (m = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            e.inspect = () => "[Emscripten Module object]";\n          } else if (ca || r)\n            r ? w = self.location.href : "undefined" != typeof document && document.currentScript && (w = document.currentScript.src), _scriptDir && (w = _scriptDir), 0 !== w.indexOf("blob:") ? w = w.substr(0, w.replace(/[?#].*/, "").lastIndexOf("/") + 1) : w = "", x = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, r && (z = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), y = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            };\n          var ea = e.print || console.log.bind(console), C = e.printErr || console.error.bind(console);\n          Object.assign(e, ba);\n          ba = null;\n          e.thisProgram && (m = e.thisProgram);\n          var D;\n          e.wasmBinary && (D = e.wasmBinary);\n          var noExitRuntime = e.noExitRuntime || true;\n          "object" != typeof WebAssembly && E("no native wasm support detected");\n          var F, G, fa = false, H, I, J, K;\n          function ha() {\n            var a = F.buffer;\n            e.HEAP8 = H = new Int8Array(a);\n            e.HEAP16 = new Int16Array(a);\n            e.HEAP32 = J = new Int32Array(a);\n            e.HEAPU8 = I = new Uint8Array(a);\n            e.HEAPU16 = new Uint16Array(a);\n            e.HEAPU32 = K = new Uint32Array(a);\n            e.HEAPF32 = new Float32Array(a);\n            e.HEAPF64 = new Float64Array(a);\n          }\n          var L, ia = [], ja = [], ka = [];\n          function la() {\n            var a = e.preRun.shift();\n            ia.unshift(a);\n          }\n          var M = 0, N = null, O = null;\n          function E(a) {\n            if (e.onAbort)\n              e.onAbort(a);\n            a = "Aborted(" + a + ")";\n            C(a);\n            fa = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          function ma(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var P;\n          P = "ort-wasm.wasm";\n          if (!ma(P)) {\n            var na = P;\n            P = e.locateFile ? e.locateFile(na, w) : w + na;\n          }\n          function oa(a) {\n            if (a == P && D)\n              return new Uint8Array(D);\n            if (z)\n              return z(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function pa(a) {\n            if (!D && (ca || r)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => oa(a));\n              if (y)\n                return new Promise((b, c) => {\n                  y(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => oa(a));\n          }\n          function qa(a, b, c) {\n            return pa(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              C("failed to asynchronously prepare wasm: " + d);\n              E(d);\n            });\n          }\n          function ra(a, b) {\n            var c = P;\n            return D || "function" != typeof WebAssembly.instantiateStreaming || ma(c) || c.startsWith("file://") || da || "function" != typeof fetch ? qa(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {\n              C("wasm streaming compile failed: " + g);\n              C("falling back to ArrayBuffer instantiation");\n              return qa(c, a, b);\n            }));\n          }\n          var Q, R = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(e);\n          };\n          function sa(a) {\n            this.xa = a - 24;\n            this.Ga = function(b) {\n              K[this.xa + 4 >> 2 >>> 0] = b;\n            };\n            this.Fa = function(b) {\n              K[this.xa + 8 >> 2 >>> 0] = b;\n            };\n            this.za = function(b, c) {\n              this.Ea();\n              this.Ga(b);\n              this.Fa(c);\n            };\n            this.Ea = function() {\n              K[this.xa + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var ta = 0, ua = 0, va = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, wa = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && va)\n              return va.decode(a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  d += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var k = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;\n                  65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                d += String.fromCharCode(g);\n            }\n            return d;\n          }, S = (a, b) => (a >>>= 0) ? wa(I, a, b) : "", T = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, U = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var g = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var k = a.charCodeAt(h);\n              if (55296 <= k && 57343 >= k) {\n                var p = a.charCodeAt(++h);\n                k = 65536 + ((k & 1023) << 10) | p & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, V = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), xa = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ya = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Da = (a) => {\n            var b = T(a) + 1, c = za(b);\n            c && U(a, I, c, b);\n            return c;\n          }, W = {}, Fa = () => {\n            if (!Ea) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace(\n                "-",\n                "_"\n              ) + ".UTF-8", _: m || "./this.program" }, b;\n              for (b in W)\n                void 0 === W[b] ? delete a[b] : a[b] = W[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Ea = c;\n            }\n            return Ea;\n          }, Ea, Ga = [null, [], []], Ha = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ia = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ja(a) {\n            var b = Array(T(a) + 1);\n            U(a, b, 0, b.length);\n            return b;\n          }\n          function Ka(a, b, c, d) {\n            function g(f, n, q) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = q[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function k(f, n) {\n              function q(Aa) {\n                return 0 > Aa ? -1 : 0 < Aa ? 1 : 0;\n              }\n              var A;\n              0 === (A = q(f.getFullYear() - n.getFullYear())) && 0 === (A = q(f.getMonth() - n.getMonth())) && (A = q(f.getDate() - n.getDate()));\n              return A;\n            }\n            function p(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function t(f) {\n              var n = f.ta;\n              for (f = new Date(new Date(f.ua + 1900, 0, 1).getTime()); 0 < n; ) {\n                var q = f.getMonth(), A = (V(f.getFullYear()) ? Ha : Ia)[q];\n                if (n > A - f.getDate())\n                  n -= A - f.getDate() + 1, f.setDate(1), 11 > q ? f.setMonth(q + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              q = new Date(f.getFullYear() + 1, 0, 4);\n              n = p(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              q = p(q);\n              return 0 >= k(n, f) ? 0 >= k(q, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var u = J[d + 40 >> 2 >>> 0];\n            d = { Ca: J[d >> 2 >>> 0], Ba: J[d + 4 >> 2 >>> 0], va: J[d + 8 >> 2 >>> 0], ya: J[d + 12 >> 2 >>> 0], wa: J[d + 16 >> 2 >>> 0], ua: J[d + 20 >> 2 >>> 0], sa: J[d + 24 >> 2 >>> 0], ta: J[d + 28 >> 2 >>> 0], Ha: J[d + 32 >> 2 >>> 0], Aa: J[d + 36 >> 2 >>> 0], Da: u ? S(u) : "" };\n            c = S(c);\n            u = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var v in u)\n              c = c.replace(new RegExp(v, "g"), u[v]);\n            var Ba = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Ca = "January February March April May June July August September October November December".split(" ");\n            u = { "%a": (f) => Ba[f.sa].substring(0, 3), "%A": (f) => Ba[f.sa], "%b": (f) => Ca[f.wa].substring(0, 3), "%B": (f) => Ca[f.wa], "%C": (f) => h((f.ua + 1900) / 100 | 0, 2), "%d": (f) => h(f.ya, 2), "%e": (f) => g(f.ya, 2, " "), "%g": (f) => t(f).toString().substring(2), "%G": (f) => t(f), "%H": (f) => h(f.va, 2), "%I": (f) => {\n              f = f.va;\n              0 == f ? f = 12 : 12 < f && (f -= 12);\n              return h(f, 2);\n            }, "%j": (f) => {\n              for (var n = 0, q = 0; q <= f.wa - 1; n += (V(f.ua + 1900) ? Ha : Ia)[q++])\n                ;\n              return h(f.ya + n, 3);\n            }, "%m": (f) => h(f.wa + 1, 2), "%M": (f) => h(f.Ba, 2), "%n": () => "\\n", "%p": (f) => 0 <= f.va && 12 > f.va ? "AM" : "PM", "%S": (f) => h(f.Ca, 2), "%t": () => "	", "%u": (f) => f.sa || 7, "%U": (f) => h(Math.floor((f.ta + 7 - f.sa) / 7), 2), "%V": (f) => {\n              var n = Math.floor((f.ta + 7 - (f.sa + 6) % 7) / 7);\n              2 >= (f.sa + 371 - f.ta - 2) % 7 && n++;\n              if (n)\n                53 == n && (q = (f.sa + 371 - f.ta) % 7, 4 == q || 3 == q && V(f.ua) || (n = 1));\n              else {\n                n = 52;\n                var q = (f.sa + 7 - f.ta - 1) % 7;\n                (4 == q || 5 == q && V(f.ua % 400 - 1)) && n++;\n              }\n              return h(n, 2);\n            }, "%w": (f) => f.sa, "%W": (f) => h(Math.floor((f.ta + 7 - (f.sa + 6) % 7) / 7), 2), "%y": (f) => (f.ua + 1900).toString().substring(2), "%Y": (f) => f.ua + 1900, "%z": (f) => {\n              f = f.Aa;\n              var n = 0 <= f;\n              f = Math.abs(f) / 60;\n              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n            }, "%Z": (f) => f.Da, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (v in u)\n              c.includes(v) && (c = c.replace(new RegExp(v, "g"), u[v](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            v = Ja(c);\n            if (v.length > b)\n              return 0;\n            H.set(v, a >>> 0);\n            return v.length - 1;\n          }\n          var X = [], Y = void 0, La = [];\n          function Ma(a, b) {\n            if (!Y) {\n              Y = /* @__PURE__ */ new WeakMap();\n              var c = L.length;\n              if (Y)\n                for (var d = 0; d < 0 + c; d++) {\n                  var g = d;\n                  var h = X[g];\n                  h || (g >= X.length && (X.length = g + 1), X[g] = h = L.get(g));\n                  (g = h) && Y.set(g, d);\n                }\n            }\n            if (c = Y.get(a) || 0)\n              return c;\n            if (La.length)\n              c = La.pop();\n            else {\n              try {\n                L.grow(1);\n              } catch (p) {\n                if (!(p instanceof RangeError))\n                  throw p;\n                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";\n              }\n              c = L.length - 1;\n            }\n            try {\n              d = c, L.set(d, a), X[d] = L.get(d);\n            } catch (p) {\n              if (!(p instanceof TypeError))\n                throw p;\n              if ("function" == typeof WebAssembly.Function) {\n                d = WebAssembly.Function;\n                g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };\n                h = { parameters: [], results: "v" == b[0] ? [] : [g[b[0]]] };\n                for (var k = 1; k < b.length; ++k)\n                  h.parameters.push(g[b[k]]);\n                b = new d(h, a);\n              } else {\n                d = [1];\n                g = b.slice(0, 1);\n                b = b.slice(1);\n                h = { i: 127, p: 127, j: 126, f: 125, d: 124 };\n                d.push(96);\n                k = b.length;\n                128 > k ? d.push(k) : d.push(k % 128 | 128, k >> 7);\n                for (k = 0; k < b.length; ++k)\n                  d.push(h[b[k]]);\n                "v" == g ? d.push(0) : d.push(1, h[g]);\n                b = [0, 97, 115, 109, 1, 0, 0, 0, 1];\n                g = d.length;\n                128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);\n                b.push.apply(b, d);\n                b.push(\n                  2,\n                  7,\n                  1,\n                  1,\n                  101,\n                  1,\n                  102,\n                  0,\n                  0,\n                  7,\n                  5,\n                  1,\n                  1,\n                  102,\n                  0,\n                  0\n                );\n                b = new WebAssembly.Module(new Uint8Array(b));\n                b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;\n              }\n              d = c;\n              L.set(d, b);\n              X[d] = L.get(d);\n            }\n            Y.set(a, c);\n            return c;\n          }\n          var Oa = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new sa(a).za(b >>> 0, c >>> 0);\n              ta = a;\n              ua++;\n              throw ta;\n            },\n            e: function() {\n              return 0;\n            },\n            H: function() {\n            },\n            x: function() {\n            },\n            z: function() {\n            },\n            J: function() {\n              return 0;\n            },\n            F: function() {\n            },\n            A: function() {\n            },\n            E: function() {\n            },\n            g: function() {\n            },\n            y: function() {\n            },\n            v: function() {\n            },\n            G: function() {\n            },\n            w: function() {\n            },\n            l: () => true,\n            o: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              J[c >> 2 >>> 0] = a.getUTCSeconds();\n              J[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              J[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              J[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              J[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              J[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              J[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              J[c + 28 >> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            p: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              J[c >> 2 >>> 0] = a.getSeconds();\n              J[c + 4 >> 2 >>> 0] = a.getMinutes();\n              J[c + 8 >> 2 >>> 0] = a.getHours();\n              J[c + 12 >> 2 >>> 0] = a.getDate();\n              J[c + 16 >> 2 >>> 0] = a.getMonth();\n              J[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              J[c + 24 >> 2 >>> 0] = a.getDay();\n              J[c + 28 >> 2 >>> 0] = (V(a.getFullYear()) ? xa : ya)[a.getMonth()] + a.getDate() - 1 | 0;\n              J[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              J[c + 32 >> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n            },\n            q: function(a) {\n              a >>>= 0;\n              var b = new Date(J[a + 20 >> 2 >>> 0] + 1900, J[a + 16 >> 2 >>> 0], J[a + 12 >> 2 >>> 0], J[a + 8 >> 2 >>> 0], J[a + 4 >> 2 >>> 0], J[a >> 2 >>> 0], 0), c = J[a + 32 >> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);\n              0 > c ? J[a + 32 >> 2 >>> 0] = Number(g != h && k == d) : 0 < c != (k == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - d)));\n              J[a + 24 >> 2 >>> 0] = b.getDay();\n              J[a + 28 >> 2 >>> 0] = (V(b.getFullYear()) ? xa : ya)[b.getMonth()] + b.getDate() - 1 | 0;\n              J[a >> 2 >>> 0] = b.getSeconds();\n              J[a + 4 >> 2 >>> 0] = b.getMinutes();\n              J[a + 8 >> 2 >>> 0] = b.getHours();\n              J[a + 12 >> 2 >>> 0] = b.getDate();\n              J[a + 16 >> 2 >>> 0] = b.getMonth();\n              J[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return Na((Q = a, 1 <= +Math.abs(Q) ? 0 < Q ? +Math.floor(Q / 4294967296) >>> 0 : ~~+Math.ceil((Q - +(~~Q >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            m: function() {\n              return -52;\n            },\n            n: function() {\n            },\n            t: function(a, b, c) {\n              function d(t) {\n                return (t = t.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? t[1] : "GMT";\n              }\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var p = k.getTimezoneOffset();\n              K[a >>> 0 >> 2 >>> 0] = 60 * Math.max(g, p);\n              J[b >>> 0 >> 2 >>> 0] = Number(g != p);\n              a = d(h);\n              b = d(k);\n              a = Da(a);\n              b = Da(b);\n              p < g ? (K[c >> 2 >>> 0] = a, K[c + 4 >> 2 >>> 0] = b) : (K[c >> 2 >>> 0] = b, K[c + 4 >> 2 >>> 0] = a);\n            },\n            d: () => {\n              E("");\n            },\n            h: function() {\n              return Date.now();\n            },\n            u: function() {\n              return 4294901760;\n            },\n            b: () => performance.now(),\n            I: function(a, b, c) {\n              b >>>= 0;\n              return I.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n            },\n            s: function(a) {\n              a >>>= 0;\n              var b = I.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var g = Math;\n                d = Math.max(a, d);\n                a: {\n                  g = g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - F.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    F.grow(g);\n                    ha();\n                    var h = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            C: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              Fa().forEach(function(d, g) {\n                var h = b + c;\n                g = K[a + 4 * g >> 2 >>> 0] = h;\n                for (h = 0; h < d.length; ++h)\n                  H[g++ >> 0 >>> 0] = d.charCodeAt(h);\n                H[g >> 0 >>> 0] = 0;\n                c += d.length + 1;\n              });\n              return 0;\n            },\n            D: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = Fa();\n              K[a >> 2 >>> 0] = c.length;\n              var d = 0;\n              c.forEach(function(g) {\n                d += g.length + 1;\n              });\n              K[b >> 2 >>> 0] = d;\n              return 0;\n            },\n            f: () => 52,\n            k: function() {\n              return 52;\n            },\n            r: function() {\n              return 70;\n            },\n            j: function(a, b, c, d) {\n              b >>>= 0;\n              c >>>= 0;\n              d >>>= 0;\n              for (var g = 0, h = 0; h < c; h++) {\n                var k = K[b >> 2 >>> 0], p = K[b + 4 >> 2 >>> 0];\n                b += 8;\n                for (var t = 0; t < p; t++) {\n                  var u = I[k + t >>> 0], v = Ga[a];\n                  0 === u || 10 === u ? ((1 === a ? ea : C)(wa(v, 0)), v.length = 0) : v.push(u);\n                }\n                g += p;\n              }\n              K[d >> 2 >>> 0] = g;\n              return 0;\n            },\n            B: Ka,\n            c: function(a, b, c, d) {\n              return Ka(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            },\n            i: function(a, b, c, d) {\n              const g = L.length;\n              a = new Uint8Array(I.slice(a + b, a + c));\n              try {\n                var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: F } }), p;\n                for (p in k.exports)\n                  Ma(k.exports[p]);\n                return g < L.length ? g : d;\n              } catch (t) {\n                return console.log(t), d;\n              }\n            }\n          };\n          (function() {\n            function a(c) {\n              c = c.exports;\n              G = c = Pa(c);\n              F = G.K;\n              ha();\n              L = G.na;\n              ja.unshift(G.L);\n              M--;\n              e.monitorRunDependencies && e.monitorRunDependencies(M);\n              if (0 == M && (null !== N && (clearInterval(N), N = null), O)) {\n                var d = O;\n                O = null;\n                d();\n              }\n              return c;\n            }\n            var b = { a: Oa };\n            M++;\n            e.monitorRunDependencies && e.monitorRunDependencies(M);\n            if (e.instantiateWasm)\n              try {\n                return e.instantiateWasm(b, a);\n              } catch (c) {\n                C("Module.instantiateWasm callback failed with error: " + c), l(c);\n              }\n            ra(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          })();\n          e._OrtInit = (a, b) => (e._OrtInit = G.M)(a, b);\n          e._OrtGetLastError = (a, b) => (e._OrtGetLastError = G.N)(a, b);\n          e._OrtCreateSessionOptions = (a, b, c, d, g, h, k, p, t, u) => (e._OrtCreateSessionOptions = G.O)(a, b, c, d, g, h, k, p, t, u);\n          e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = G.P)(a, b);\n          e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = G.Q)(a, b, c);\n          e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = G.R)(a, b, c);\n          e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = G.S)(a);\n          e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = G.T)(a, b, c);\n          e._OrtReleaseSession = (a) => (e._OrtReleaseSession = G.U)(a);\n          e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = G.V)(a, b, c);\n          e._OrtGetInputName = (a, b) => (e._OrtGetInputName = G.W)(a, b);\n          e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = G.X)(a, b);\n          e._OrtFree = (a) => (e._OrtFree = G.Y)(a);\n          e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = G.Z)(a, b, c, d, g, h);\n          e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = G._)(a, b, c, d, g);\n          e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = G.$)(a);\n          e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = G.aa)(a, b, c, d);\n          e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = G.ba)(a, b, c);\n          e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = G.ca)(a);\n          e._OrtCreateBinding = (a) => (e._OrtCreateBinding = G.da)(a);\n          e._OrtBindInput = (a, b, c) => (e._OrtBindInput = G.ea)(a, b, c);\n          e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = G.fa)(a, b, c, d);\n          e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = G.ga)(a);\n          e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = G.ha)(a);\n          e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = G.ia)(a, b, c, d, g);\n          e._OrtRun = (a, b, c, d, g, h, k, p) => (e._OrtRun = G.ja)(a, b, c, d, g, h, k, p);\n          e._OrtEndProfiling = (a) => (e._OrtEndProfiling = G.ka)(a);\n          var za = e._malloc = (a) => (za = e._malloc = G.la)(a);\n          e._free = (a) => (e._free = G.ma)(a);\n          var Na = (a) => (Na = G.oa)(a), Qa = () => (Qa = G.pa)(), Ra = (a) => (Ra = G.qa)(a), Sa = (a) => (Sa = G.ra)(a);\n          e.___start_em_js = 905088;\n          e.___stop_em_js = 905700;\n          function Pa(a) {\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          e.stackAlloc = Sa;\n          e.stackSave = Qa;\n          e.stackRestore = Ra;\n          e.addFunction = Ma;\n          e.UTF8ToString = S;\n          e.stringToUTF8 = (a, b, c) => U(a, I, b, c);\n          e.lengthBytesUTF8 = T;\n          var Z;\n          O = function Ta() {\n            Z || Ua();\n            Z || (O = Ta);\n          };\n          function Ua() {\n            function a() {\n              if (!Z && (Z = true, e.calledRun = true, !fa)) {\n                R(ja);\n                aa(e);\n                if (e.onRuntimeInitialized)\n                  e.onRuntimeInitialized();\n                if (e.postRun)\n                  for ("function" == typeof e.postRun && (e.postRun = [e.postRun]); e.postRun.length; ) {\n                    var b = e.postRun.shift();\n                    ka.unshift(b);\n                  }\n                R(ka);\n              }\n            }\n            if (!(0 < M)) {\n              if (e.preRun)\n                for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; )\n                  la();\n              R(ia);\n              0 < M || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {\n                setTimeout(function() {\n                  e.setStatus("");\n                }, 1);\n                a();\n              }, 1)) : a());\n            }\n          }\n          if (e.preInit)\n            for ("function" == typeof e.preInit && (e.preInit = [e.preInit]); 0 < e.preInit.length; )\n              e.preInit.pop()();\n          Ua();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function aa() {\n            e.buffer != l.buffer && m();\n            return l;\n          }\n          function n() {\n            e.buffer != l.buffer && m();\n            return ba;\n          }\n          function p() {\n            e.buffer != l.buffer && m();\n            return ca;\n          }\n          function t() {\n            e.buffer != l.buffer && m();\n            return da;\n          }\n          function ea() {\n            e.buffer != l.buffer && m();\n            return fa;\n          }\n          var w = moduleArg, ha, x;\n          w.ready = new Promise((a, b) => {\n            ha = a;\n            x = b;\n          });\n          var ia = Object.assign({}, w), ja = "./this.program", z = (a, b) => {\n            throw b;\n          }, ka = "object" == typeof window, A = "function" == typeof importScripts, C = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = w.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function la(a) {\n            return w.locateFile ? w.locateFile(a, E) : E + a;\n          }\n          var ma, F, G;\n          if (C) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));\n            E = A ? na.dirname(E) + "/" : __dirname + "/";\n            ma = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            G = (b) => {\n              b = ma(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            F = (b, c, d, g = true) => {\n              b = b.startsWith("file://") ? new URL(b) : na.normalize(b);\n              fs.readFile(b, g ? void 0 : "utf8", (h, k) => {\n                h ? d(h) : c(g ? k.buffer : k);\n              });\n            };\n            !w.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            z = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            w.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (ka || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", C || (ma = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, A && (G = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), F = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          C && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var oa = console.log.bind(console), pa = console.error.bind(console);\n          C && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var qa = w.print || oa, I = w.printErr || pa;\n          Object.assign(w, ia);\n          ia = null;\n          w.thisProgram && (ja = w.thisProgram);\n          w.quit && (z = w.quit);\n          var J;\n          w.wasmBinary && (J = w.wasmBinary);\n          var noExitRuntime = w.noExitRuntime || true;\n          "object" != typeof WebAssembly && K("no native wasm support detected");\n          var e, L, ra, M = false, N, l, ba, ca, da, fa;\n          function m() {\n            var a = e.buffer;\n            w.HEAP8 = l = new Int8Array(a);\n            w.HEAP16 = new Int16Array(a);\n            w.HEAP32 = ca = new Int32Array(a);\n            w.HEAPU8 = ba = new Uint8Array(a);\n            w.HEAPU16 = new Uint16Array(a);\n            w.HEAPU32 = da = new Uint32Array(a);\n            w.HEAPF32 = new Float32Array(a);\n            w.HEAPF64 = fa = new Float64Array(a);\n          }\n          var O = w.INITIAL_MEMORY || 16777216;\n          5242880 <= O || K("INITIAL_MEMORY should be larger than STACK_SIZE, was " + O + "! (STACK_SIZE=5242880)");\n          if (D)\n            e = w.wasmMemory;\n          else if (w.wasmMemory)\n            e = w.wasmMemory;\n          else if (e = new WebAssembly.Memory({ initial: O / 65536, maximum: 65536, shared: true }), !(e.buffer instanceof SharedArrayBuffer))\n            throw I("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), C && I("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          m();\n          O = e.buffer.byteLength;\n          var P, sa = [], ta = [], ua = [], va = 0;\n          function Q() {\n            return noExitRuntime || 0 < va;\n          }\n          var R = 0, wa = null, S = null;\n          function xa() {\n            R++;\n            w.monitorRunDependencies && w.monitorRunDependencies(R);\n          }\n          function ya() {\n            R--;\n            w.monitorRunDependencies && w.monitorRunDependencies(R);\n            if (0 == R && (null !== wa && (clearInterval(wa), wa = null), S)) {\n              var a = S;\n              S = null;\n              a();\n            }\n          }\n          function K(a) {\n            if (w.onAbort)\n              w.onAbort(a);\n            a = "Aborted(" + a + ")";\n            I(a);\n            M = true;\n            N = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            x(a);\n            throw a;\n          }\n          function za(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var T;\n          T = "ort-wasm-threaded.wasm";\n          za(T) || (T = la(T));\n          function Aa(a) {\n            if (a == T && J)\n              return new Uint8Array(J);\n            if (G)\n              return G(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ba(a) {\n            if (!J && (ka || A)) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Aa(a));\n              if (F)\n                return new Promise((b, c) => {\n                  F(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => Aa(a));\n          }\n          function Ca(a, b, c) {\n            return Ba(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              I("failed to asynchronously prepare wasm: " + d);\n              K(d);\n            });\n          }\n          function Da(a, b) {\n            var c = T;\n            return J || "function" != typeof WebAssembly.instantiateStreaming || za(c) || c.startsWith("file://") || C || "function" != typeof fetch ? Ca(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {\n              I("wasm streaming compile failed: " + g);\n              I("falling back to ArrayBuffer instantiation");\n              return Ca(c, a, b);\n            }));\n          }\n          var U;\n          function Ea(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          function Fa(a) {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }\n          function Ga(a) {\n            (a = V.Ma[a]) || K();\n            V.mb(a);\n          }\n          function Ha(a) {\n            var b = V.gb();\n            if (!b)\n              return 6;\n            V.Pa.push(b);\n            V.Ma[a.Oa] = b;\n            b.Oa = a.Oa;\n            var c = { cmd: "run", start_routine: a.nb, arg: a.fb, pthread_ptr: a.Oa };\n            C && b.unref();\n            b.postMessage(c, a.tb);\n            return 0;\n          }\n          var Ia = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Ja = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ia)\n              return Ia.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  d += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var k = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | k : (g & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;\n                  65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                d += String.fromCharCode(g);\n            }\n            return d;\n          }, Ka = (a, b) => (a >>>= 0) ? Ja(n(), a, b) : "";\n          function La(a) {\n            if (D)\n              return W(1, 1, a);\n            N = a;\n            if (!Q()) {\n              V.ob();\n              if (w.onExit)\n                w.onExit(a);\n              M = true;\n            }\n            z(a, new Ea(a));\n          }\n          var Na = (a) => {\n            N = a;\n            if (D)\n              throw Ma(a), "unwind";\n            La(a);\n          }, V = {\n            Sa: [],\n            Pa: [],\n            $a: [],\n            Ma: {},\n            Wa: function() {\n              D ? V.ib() : V.hb();\n            },\n            hb: function() {\n              sa.unshift(() => {\n                xa();\n                V.jb(() => ya());\n              });\n            },\n            ib: function() {\n              V.receiveObjectTransfer = V.lb;\n              V.threadInitTLS = V.Za;\n              V.setExitStatus = V.Ya;\n              noExitRuntime = false;\n            },\n            Ya: function(a) {\n              N = a;\n            },\n            yb: ["$terminateWorker"],\n            ob: function() {\n              for (var a of V.Pa)\n                Fa(a);\n              for (a of V.Sa)\n                Fa(a);\n              V.Sa = [];\n              V.Pa = [];\n              V.Ma = [];\n            },\n            mb: function(a) {\n              var b = a.Oa;\n              delete V.Ma[b];\n              V.Sa.push(a);\n              V.Pa.splice(V.Pa.indexOf(a), 1);\n              a.Oa = 0;\n              Oa(b);\n            },\n            lb: function() {\n            },\n            Za: function() {\n              V.$a.forEach((a) => a());\n            },\n            kb: (a) => new Promise((b) => {\n              a.onmessage = (h) => {\n                h = h.data;\n                var k = h.cmd;\n                if (h.targetThread && h.targetThread != Pa()) {\n                  var q = V.Ma[h.xb];\n                  q ? q.postMessage(h, h.transferList) : I(\'Internal error! Worker sent a message "\' + k + \'" to target pthread \' + h.targetThread + ", but that thread no longer exists!");\n                } else if ("checkMailbox" === k)\n                  Qa();\n                else if ("spawnThread" === k)\n                  Ha(h);\n                else if ("cleanupThread" === k)\n                  Ga(h.thread);\n                else if ("killThread" === k)\n                  h = h.thread, k = V.Ma[h], delete V.Ma[h], Fa(k), Oa(h), V.Pa.splice(\n                    V.Pa.indexOf(k),\n                    1\n                  ), k.Oa = 0;\n                else if ("cancelThread" === k)\n                  V.Ma[h.thread].postMessage({ cmd: "cancel" });\n                else if ("loaded" === k)\n                  a.loaded = true, b(a);\n                else if ("alert" === k)\n                  alert("Thread " + h.threadId + ": " + h.text);\n                else if ("setimmediate" === h.target)\n                  a.postMessage(h);\n                else if ("callHandler" === k)\n                  w[h.handler](...h.args);\n                else\n                  k && I("worker sent an unknown command " + k);\n              };\n              a.onerror = (h) => {\n                I("worker sent an error! " + h.filename + ":" + h.lineno + ": " + h.message);\n                throw h;\n              };\n              C && (a.on("message", function(h) {\n                a.onmessage({ data: h });\n              }), a.on("error", function(h) {\n                a.onerror(h);\n              }));\n              var c = [], d = ["onExit", "onAbort", "print", "printErr"], g;\n              for (g of d)\n                w.hasOwnProperty(g) && c.push(g);\n              a.postMessage({ cmd: "load", handlers: c, urlOrBlob: w.mainScriptUrlOrBlob || _scriptDir, wasmMemory: e, wasmModule: ra });\n            }),\n            jb: function(a) {\n              a();\n            },\n            eb: function() {\n              var a = la("ort-wasm-threaded.worker.js");\n              a = new Worker(a);\n              V.Sa.push(a);\n            },\n            gb: function() {\n              0 == V.Sa.length && (V.eb(), V.kb(V.Sa[0]));\n              return V.Sa.pop();\n            }\n          };\n          w.PThread = V;\n          var Ra = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(w);\n          };\n          w.establishStackSpace = function() {\n            var a = Pa(), b = p()[a + 52 >> 2 >>> 0];\n            a = p()[a + 56 >> 2 >>> 0];\n            Sa(b, b - a);\n            Ta(b);\n          };\n          function Ma(a) {\n            if (D)\n              return W(2, 0, a);\n            Na(a);\n          }\n          var X = [], Ua = (a) => {\n            var b = X[a];\n            b || (a >= X.length && (X.length = a + 1), X[a] = b = P.get(a));\n            return b;\n          };\n          w.invokeEntryPoint = function(a, b) {\n            a = Ua(a)(b);\n            Q() ? V.Ya(a) : Va(a);\n          };\n          function Wa(a) {\n            this.Va = a - 24;\n            this.cb = function(b) {\n              t()[this.Va + 4 >> 2 >>> 0] = b;\n            };\n            this.bb = function(b) {\n              t()[this.Va + 8 >> 2 >>> 0] = b;\n            };\n            this.Wa = function(b, c) {\n              this.ab();\n              this.cb(b);\n              this.bb(c);\n            };\n            this.ab = function() {\n              t()[this.Va + 16 >> 2 >>> 0] = 0;\n            };\n          }\n          var Xa = 0, Ya = 0;\n          function Za(a, b, c, d) {\n            return D ? W(3, 1, a, b, c, d) : $a(a, b, c, d);\n          }\n          function $a(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return I("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var g = [];\n            if (D && 0 === g.length)\n              return Za(a, b, c, d);\n            a = { nb: c, Oa: a, fb: d, tb: g };\n            return D ? (a.vb = "spawnThread", postMessage(a, g), 0) : Ha(a);\n          }\n          function ab(a, b, c) {\n            return D ? W(4, 1, a, b, c) : 0;\n          }\n          function bb(a, b) {\n            if (D)\n              return W(5, 1, a, b);\n          }\n          var cb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, db = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var g = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var k = a.charCodeAt(h);\n              if (55296 <= k && 57343 >= k) {\n                var q = a.charCodeAt(++h);\n                k = 65536 + ((k & 1023) << 10) | q & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, eb = (a, b, c) => db(a, n(), b, c);\n          function fb(a, b) {\n            if (D)\n              return W(6, 1, a, b);\n          }\n          function gb(a, b, c) {\n            if (D)\n              return W(7, 1, a, b, c);\n          }\n          function hb(a, b, c) {\n            return D ? W(8, 1, a, b, c) : 0;\n          }\n          function ib(a, b) {\n            if (D)\n              return W(9, 1, a, b);\n          }\n          function jb(a, b, c) {\n            if (D)\n              return W(10, 1, a, b, c);\n          }\n          function kb(a, b, c, d) {\n            if (D)\n              return W(11, 1, a, b, c, d);\n          }\n          function lb(a, b, c, d) {\n            if (D)\n              return W(12, 1, a, b, c, d);\n          }\n          function mb(a, b, c, d) {\n            if (D)\n              return W(13, 1, a, b, c, d);\n          }\n          function nb(a) {\n            if (D)\n              return W(14, 1, a);\n          }\n          function ob(a, b) {\n            if (D)\n              return W(15, 1, a, b);\n          }\n          function pb(a, b, c) {\n            if (D)\n              return W(16, 1, a, b, c);\n          }\n          var qb = (a) => {\n            if (!M)\n              try {\n                if (a(), !Q())\n                  try {\n                    D ? Va(N) : Na(N);\n                  } catch (b) {\n                    b instanceof Ea || "unwind" == b || z(1, b);\n                  }\n              } catch (b) {\n                b instanceof Ea || "unwind" == b || z(1, b);\n              }\n          };\n          function rb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.ub && (Atomics.ub(p(), a >> 2, a).value.then(Qa), a += 128, Atomics.store(p(), a >> 2, 1));\n          }\n          w.__emscripten_thread_mailbox_await = rb;\n          function Qa() {\n            var a = Pa();\n            a && (rb(a), qb(() => sb()));\n          }\n          w.checkMailbox = Qa;\n          var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), tb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], ub = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function vb(a, b, c, d, g, h, k, q) {\n            return D ? W(17, 1, a, b, c, d, g, h, k, q) : -52;\n          }\n          function wb(a, b, c, d, g, h, k) {\n            if (D)\n              return W(18, 1, a, b, c, d, g, h, k);\n          }\n          var yb = (a) => {\n            var b = cb(a) + 1, c = xb(b);\n            c && eb(a, c, b);\n            return c;\n          }, Ab = (a) => {\n            var b = zb();\n            a = a();\n            Ta(b);\n            return a;\n          };\n          function W(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return Ab(() => {\n              for (var g = Bb(8 * c), h = g >> 3, k = 0; k < c; k++) {\n                var q = d[2 + k];\n                ea()[h + k >>> 0] = q;\n              }\n              return Cb(a, c, g, b);\n            });\n          }\n          var Db = [], Eb = {}, Gb = () => {\n            if (!Fb) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;\n              for (b in Eb)\n                void 0 === Eb[b] ? delete a[b] : a[b] = Eb[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Fb = c;\n            }\n            return Fb;\n          }, Fb;\n          function Hb(a, b) {\n            if (D)\n              return W(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Gb().forEach(function(d, g) {\n              var h = b + c;\n              g = t()[a + 4 * g >> 2 >>> 0] = h;\n              for (h = 0; h < d.length; ++h)\n                aa()[g++ >> 0 >>> 0] = d.charCodeAt(h);\n              aa()[g >> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Ib(a, b) {\n            if (D)\n              return W(20, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Gb();\n            t()[a >> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach(function(g) {\n              d += g.length + 1;\n            });\n            t()[b >> 2 >>> 0] = d;\n            return 0;\n          }\n          function Jb(a) {\n            return D ? W(21, 1, a) : 52;\n          }\n          function Nb(a, b, c, d) {\n            return D ? W(22, 1, a, b, c, d) : 52;\n          }\n          function Ob(a, b, c, d, g) {\n            return D ? W(23, 1, a, b, c, d, g) : 70;\n          }\n          var Pb = [null, [], []];\n          function Qb(a, b, c, d) {\n            if (D)\n              return W(24, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var g = 0, h = 0; h < c; h++) {\n              var k = t()[b >> 2 >>> 0], q = t()[b + 4 >> 2 >>> 0];\n              b += 8;\n              for (var B = 0; B < q; B++) {\n                var v = n()[k + B >>> 0], y = Pb[a];\n                0 === v || 10 === v ? ((1 === a ? qa : I)(Ja(y, 0)), y.length = 0) : y.push(v);\n              }\n              g += q;\n            }\n            t()[d >> 2 >>> 0] = g;\n            return 0;\n          }\n          var Rb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Sb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Tb(a) {\n            var b = Array(cb(a) + 1);\n            db(a, b, 0, b.length);\n            return b;\n          }\n          var Ub = (a, b) => {\n            aa().set(a, b >>> 0);\n          };\n          function Vb(a, b, c, d) {\n            function g(f, r, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )\n                f = u[0] + f;\n              return f;\n            }\n            function h(f, r) {\n              return g(f, r, "0");\n            }\n            function k(f, r) {\n              function u(Kb) {\n                return 0 > Kb ? -1 : 0 < Kb ? 1 : 0;\n              }\n              var H;\n              0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));\n              return H;\n            }\n            function q(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function B(f) {\n              var r = f.Qa;\n              for (f = new Date(new Date(f.Ra + 1900, 0, 1).getTime()); 0 < r; ) {\n                var u = f.getMonth(), H = (Y(f.getFullYear()) ? Rb : Sb)[u];\n                if (r > H - f.getDate())\n                  r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + r);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              r = q(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = q(u);\n              return 0 >= k(r, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var v = p()[d + 40 >> 2 >>> 0];\n            d = { rb: p()[d >> 2 >>> 0], qb: p()[d + 4 >> 2 >>> 0], Ta: p()[d + 8 >> 2 >>> 0], Xa: p()[d + 12 >> 2 >>> 0], Ua: p()[d + 16 >> 2 >>> 0], Ra: p()[d + 20 >> 2 >>> 0], Na: p()[d + 24 >> 2 >>> 0], Qa: p()[d + 28 >> 2 >>> 0], zb: p()[d + 32 >> 2 >>> 0], pb: p()[d + 36 >> 2 >>> 0], sb: v ? Ka(v) : "" };\n            c = Ka(c);\n            v = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var y in v)\n              c = c.replace(new RegExp(y, "g"), v[y]);\n            var Lb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Mb = "January February March April May June July August September October November December".split(" ");\n            v = {\n              "%a": (f) => Lb[f.Na].substring(0, 3),\n              "%A": (f) => Lb[f.Na],\n              "%b": (f) => Mb[f.Ua].substring(0, 3),\n              "%B": (f) => Mb[f.Ua],\n              "%C": (f) => h((f.Ra + 1900) / 100 | 0, 2),\n              "%d": (f) => h(f.Xa, 2),\n              "%e": (f) => g(f.Xa, 2, " "),\n              "%g": (f) => B(f).toString().substring(2),\n              "%G": (f) => B(f),\n              "%H": (f) => h(f.Ta, 2),\n              "%I": (f) => {\n                f = f.Ta;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return h(f, 2);\n              },\n              "%j": (f) => {\n                for (var r = 0, u = 0; u <= f.Ua - 1; r += (Y(f.Ra + 1900) ? Rb : Sb)[u++])\n                  ;\n                return h(f.Xa + r, 3);\n              },\n              "%m": (f) => h(f.Ua + 1, 2),\n              "%M": (f) => h(f.qb, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Ta && 12 > f.Ta ? "AM" : "PM",\n              "%S": (f) => h(f.rb, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Na || 7,\n              "%U": (f) => h(Math.floor((f.Qa + 7 - f.Na) / 7), 2),\n              "%V": (f) => {\n                var r = Math.floor((f.Qa + 7 - (f.Na + 6) % 7) / 7);\n                2 >= (f.Na + 371 - f.Qa - 2) % 7 && r++;\n                if (r)\n                  53 == r && (u = (f.Na + 371 - f.Qa) % 7, 4 == u || 3 == u && Y(f.Ra) || (r = 1));\n                else {\n                  r = 52;\n                  var u = (f.Na + 7 - f.Qa - 1) % 7;\n                  (4 == u || 5 == u && Y(f.Ra % 400 - 1)) && r++;\n                }\n                return h(r, 2);\n              },\n              "%w": (f) => f.Na,\n              "%W": (f) => h(Math.floor((f.Qa + 7 - (f.Na + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Ra + 1900).toString().substring(2),\n              "%Y": (f) => f.Ra + 1900,\n              "%z": (f) => {\n                f = f.pb;\n                var r = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.sb,\n              "%%": () => "%"\n            };\n            c = c.replace(\n              /%%/g,\n              "\\0\\0"\n            );\n            for (y in v)\n              c.includes(y) && (c = c.replace(new RegExp(y, "g"), v[y](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            y = Tb(c);\n            if (y.length > b)\n              return 0;\n            Ub(y, a);\n            return y.length - 1;\n          }\n          var Z = void 0, Wb = [];\n          function Xb(a, b) {\n            if (!Z) {\n              Z = /* @__PURE__ */ new WeakMap();\n              var c = P.length;\n              if (Z)\n                for (var d = 0; d < 0 + c; d++) {\n                  var g = Ua(d);\n                  g && Z.set(g, d);\n                }\n            }\n            if (c = Z.get(a) || 0)\n              return c;\n            if (Wb.length)\n              c = Wb.pop();\n            else {\n              try {\n                P.grow(1);\n              } catch (q) {\n                if (!(q instanceof RangeError))\n                  throw q;\n                throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";\n              }\n              c = P.length - 1;\n            }\n            try {\n              d = c, P.set(d, a), X[d] = P.get(d);\n            } catch (q) {\n              if (!(q instanceof TypeError))\n                throw q;\n              if ("function" == typeof WebAssembly.Function) {\n                d = WebAssembly.Function;\n                g = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" };\n                for (var h = {\n                  parameters: [],\n                  results: "v" == b[0] ? [] : [g[b[0]]]\n                }, k = 1; k < b.length; ++k)\n                  h.parameters.push(g[b[k]]);\n                b = new d(h, a);\n              } else {\n                d = [1];\n                g = b.slice(0, 1);\n                b = b.slice(1);\n                h = { i: 127, p: 127, j: 126, f: 125, d: 124 };\n                d.push(96);\n                k = b.length;\n                128 > k ? d.push(k) : d.push(k % 128 | 128, k >> 7);\n                for (k = 0; k < b.length; ++k)\n                  d.push(h[b[k]]);\n                "v" == g ? d.push(0) : d.push(1, h[g]);\n                b = [0, 97, 115, 109, 1, 0, 0, 0, 1];\n                g = d.length;\n                128 > g ? b.push(g) : b.push(g % 128 | 128, g >> 7);\n                b.push.apply(b, d);\n                b.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);\n                b = new WebAssembly.Module(new Uint8Array(b));\n                b = new WebAssembly.Instance(\n                  b,\n                  { e: { f: a } }\n                ).exports.f;\n              }\n              d = c;\n              P.set(d, b);\n              X[d] = P.get(d);\n            }\n            Z.set(a, c);\n            return c;\n          }\n          V.Wa();\n          var Yb = [null, La, Ma, Za, ab, bb, fb, gb, hb, ib, jb, kb, lb, mb, nb, ob, pb, vb, wb, Hb, Ib, Jb, Nb, Ob, Qb], ac = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new Wa(a).Wa(b >>> 0, c >>> 0);\n              Xa = a;\n              Ya++;\n              throw Xa;\n            },\n            N: function(a) {\n              Zb(a >>> 0, !A, 1, !ka, 131072, false);\n              V.Za();\n            },\n            k: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : Ga(a);\n            },\n            I: $a,\n            h: ab,\n            T: bb,\n            D: fb,\n            F: gb,\n            U: hb,\n            R: ib,\n            J: jb,\n            Q: kb,\n            o: lb,\n            E: mb,\n            B: nb,\n            S: ob,\n            C: pb,\n            q: () => true,\n            z: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => Qa()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = V.Ma[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            L: function() {\n              return -1;\n            },\n            M: rb,\n            p: function(a) {\n              C && V.Ma[a >>> 0].ref();\n            },\n            t: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getUTCSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getUTCMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getUTCHours();\n              p()[c + 12 >> 2 >>> 0] = a.getUTCDate();\n              p()[c + 16 >> 2 >>> 0] = a.getUTCMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              p()[c + 28 >> 2 >>> 0] = a;\n            },\n            u: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >> 2 >>> 0] = a.getSeconds();\n              p()[c + 4 >> 2 >>> 0] = a.getMinutes();\n              p()[c + 8 >> 2 >>> 0] = a.getHours();\n              p()[c + 12 >> 2 >>> 0] = a.getDate();\n              p()[c + 16 >> 2 >>> 0] = a.getMonth();\n              p()[c + 20 >> 2 >>> 0] = a.getFullYear() - 1900;\n              p()[c + 24 >> 2 >>> 0] = a.getDay();\n              b = (Y(a.getFullYear()) ? tb : ub)[a.getMonth()] + a.getDate() - 1 | 0;\n              p()[c + 28 >> 2 >>> 0] = b;\n              p()[c + 36 >> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n              p()[c + 32 >> 2 >>> 0] = a;\n            },\n            v: function(a) {\n              a >>>= 0;\n              var b = new Date(p()[a + 20 >> 2 >>> 0] + 1900, p()[a + 16 >> 2 >>> 0], p()[a + 12 >> 2 >>> 0], p()[a + 8 >> 2 >>> 0], p()[a + 4 >> 2 >>> 0], p()[a >> 2 >>> 0], 0), c = p()[a + 32 >> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, g);\n              0 > c ? p()[a + 32 >> 2 >>> 0] = Number(g != h && k == d) : 0 < c != (k == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : g) - d)));\n              p()[a + 24 >> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? tb : ub)[b.getMonth()] + b.getDate() - 1 | 0;\n              p()[a + 28 >> 2 >>> 0] = c;\n              p()[a >> 2 >>> 0] = b.getSeconds();\n              p()[a + 4 >> 2 >>> 0] = b.getMinutes();\n              p()[a + 8 >> 2 >>> 0] = b.getHours();\n              p()[a + 12 >> 2 >>> 0] = b.getDate();\n              p()[a + 16 >> 2 >>> 0] = b.getMonth();\n              p()[a + 20 >> 2 >>> 0] = b.getYear();\n              a = b.getTime() / 1e3;\n              return $b((U = a, 1 <= +Math.abs(U) ? 0 < U ? +Math.floor(U / 4294967296) >>> 0 : ~~+Math.ceil((U - +(~~U >>> 0)) / 4294967296) >>> 0 : 0)), a >>> 0;\n            },\n            r: vb,\n            s: wb,\n            y: function(a, b, c) {\n              function d(v) {\n                return (v = v.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? v[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), k = new Date(g, 6, 1);\n              g = h.getTimezoneOffset();\n              var q = k.getTimezoneOffset(), B = Math.max(g, q);\n              t()[a >> 2 >>> 0] = 60 * B;\n              p()[b >> 2 >>> 0] = Number(g != q);\n              a = d(h);\n              b = d(k);\n              a = yb(a);\n              b = yb(b);\n              q < g ? (t()[c >> 2 >>> 0] = a, t()[c + 4 >> 2 >>> 0] = b) : (t()[c >> 2 >>> 0] = b, t()[c + 4 >> 2 >>> 0] = a);\n            },\n            c: () => {\n              K("");\n            },\n            l: function() {\n            },\n            i: function() {\n              return Date.now();\n            },\n            V: () => {\n              va += 1;\n              throw "unwind";\n            },\n            A: function() {\n              return 4294901760;\n            },\n            e: () => performance.timeOrigin + performance.now(),\n            f: function() {\n              return C ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency;\n            },\n            K: function(a, b, c, d) {\n              V.wb = b >>> 0;\n              Db.length = c;\n              b = d >>> 0 >> 3;\n              for (d = 0; d < c; d++)\n                Db[d] = ea()[b + d >>> 0];\n              return Yb[a].apply(null, Db);\n            },\n            x: function(a) {\n              a >>>= 0;\n              var b = n().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var g = Math;\n                d = Math.max(a, d);\n                a: {\n                  g = g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - e.buffer.byteLength + 65535 >>> 16;\n                  try {\n                    e.grow(g);\n                    m();\n                    var h = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            O: Hb,\n            P: Ib,\n            H: Na,\n            g: Jb,\n            n: Nb,\n            w: Ob,\n            m: Qb,\n            a: e || w.wasmMemory,\n            G: Vb,\n            d: function(a, b, c, d) {\n              return Vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            },\n            j: function(a, b, c, d) {\n              const g = P.length;\n              a = new Uint8Array(n().slice(a + b, a + c));\n              try {\n                var h = new WebAssembly.Module(a), k = new WebAssembly.Instance(h, { env: { memory: e } }), q;\n                for (q in k.exports)\n                  Xb(k.exports[q]);\n                return g < P.length ? g : d;\n              } catch (B) {\n                return console.log(B), d;\n              }\n            }\n          };\n          (function() {\n            function a(c, d) {\n              c = c.exports;\n              L = c = bc(c);\n              V.$a.push(L.za);\n              P = L.Aa;\n              ta.unshift(L.W);\n              ra = d;\n              ya();\n              return c;\n            }\n            var b = { a: ac };\n            xa();\n            if (w.instantiateWasm)\n              try {\n                return w.instantiateWasm(b, a);\n              } catch (c) {\n                I("Module.instantiateWasm callback failed with error: " + c), x(c);\n              }\n            Da(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(x);\n            return {};\n          })();\n          w._OrtInit = (a, b) => (w._OrtInit = L.X)(a, b);\n          w._OrtGetLastError = (a, b) => (w._OrtGetLastError = L.Y)(a, b);\n          w._OrtCreateSessionOptions = (a, b, c, d, g, h, k, q, B, v) => (w._OrtCreateSessionOptions = L.Z)(a, b, c, d, g, h, k, q, B, v);\n          w._OrtAppendExecutionProvider = (a, b) => (w._OrtAppendExecutionProvider = L._)(a, b);\n          w._OrtAddFreeDimensionOverride = (a, b, c) => (w._OrtAddFreeDimensionOverride = L.$)(a, b, c);\n          w._OrtAddSessionConfigEntry = (a, b, c) => (w._OrtAddSessionConfigEntry = L.aa)(a, b, c);\n          w._OrtReleaseSessionOptions = (a) => (w._OrtReleaseSessionOptions = L.ba)(a);\n          w._OrtCreateSession = (a, b, c) => (w._OrtCreateSession = L.ca)(a, b, c);\n          w._OrtReleaseSession = (a) => (w._OrtReleaseSession = L.da)(a);\n          w._OrtGetInputOutputCount = (a, b, c) => (w._OrtGetInputOutputCount = L.ea)(a, b, c);\n          w._OrtGetInputName = (a, b) => (w._OrtGetInputName = L.fa)(a, b);\n          w._OrtGetOutputName = (a, b) => (w._OrtGetOutputName = L.ga)(a, b);\n          w._OrtFree = (a) => (w._OrtFree = L.ha)(a);\n          w._OrtCreateTensor = (a, b, c, d, g, h) => (w._OrtCreateTensor = L.ia)(a, b, c, d, g, h);\n          w._OrtGetTensorData = (a, b, c, d, g) => (w._OrtGetTensorData = L.ja)(a, b, c, d, g);\n          w._OrtReleaseTensor = (a) => (w._OrtReleaseTensor = L.ka)(a);\n          w._OrtCreateRunOptions = (a, b, c, d) => (w._OrtCreateRunOptions = L.la)(a, b, c, d);\n          w._OrtAddRunConfigEntry = (a, b, c) => (w._OrtAddRunConfigEntry = L.ma)(a, b, c);\n          w._OrtReleaseRunOptions = (a) => (w._OrtReleaseRunOptions = L.na)(a);\n          w._OrtCreateBinding = (a) => (w._OrtCreateBinding = L.oa)(a);\n          w._OrtBindInput = (a, b, c) => (w._OrtBindInput = L.pa)(a, b, c);\n          w._OrtBindOutput = (a, b, c, d) => (w._OrtBindOutput = L.qa)(a, b, c, d);\n          w._OrtClearBoundOutputs = (a) => (w._OrtClearBoundOutputs = L.ra)(a);\n          w._OrtReleaseBinding = (a) => (w._OrtReleaseBinding = L.sa)(a);\n          w._OrtRunWithBinding = (a, b, c, d, g) => (w._OrtRunWithBinding = L.ta)(a, b, c, d, g);\n          w._OrtRun = (a, b, c, d, g, h, k, q) => (w._OrtRun = L.ua)(a, b, c, d, g, h, k, q);\n          w._OrtEndProfiling = (a) => (w._OrtEndProfiling = L.va)(a);\n          var Pa = w._pthread_self = () => (Pa = w._pthread_self = L.wa)(), xb = w._malloc = (a) => (xb = w._malloc = L.xa)(a);\n          w._free = (a) => (w._free = L.ya)(a);\n          w.__emscripten_tls_init = () => (w.__emscripten_tls_init = L.za)();\n          var Zb = w.__emscripten_thread_init = (a, b, c, d, g, h) => (Zb = w.__emscripten_thread_init = L.Ba)(a, b, c, d, g, h);\n          w.__emscripten_thread_crashed = () => (w.__emscripten_thread_crashed = L.Ca)();\n          var Cb = (a, b, c, d) => (Cb = L.Da)(a, b, c, d), Oa = (a) => (Oa = L.Ea)(a), Va = w.__emscripten_thread_exit = (a) => (Va = w.__emscripten_thread_exit = L.Fa)(a), sb = w.__emscripten_check_mailbox = () => (sb = w.__emscripten_check_mailbox = L.Ga)(), $b = (a) => ($b = L.Ha)(a), Sa = (a, b) => (Sa = L.Ia)(a, b), zb = () => (zb = L.Ja)(), Ta = (a) => (Ta = L.Ka)(a), Bb = (a) => (Bb = L.La)(a);\n          w.___start_em_js = 906316;\n          w.___stop_em_js = 906928;\n          function bc(a) {\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (g) => d(g) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.pthread_self = b(a.pthread_self);\n            a.malloc = c(a.malloc);\n            a.stackSave = b(a.stackSave);\n            a.stackAlloc = c(a.stackAlloc);\n            return a;\n          }\n          w.keepRuntimeAlive = Q;\n          w.wasmMemory = e;\n          w.stackAlloc = Bb;\n          w.stackSave = zb;\n          w.stackRestore = Ta;\n          w.addFunction = Xb;\n          w.UTF8ToString = Ka;\n          w.stringToUTF8 = eb;\n          w.lengthBytesUTF8 = cb;\n          w.ExitStatus = Ea;\n          w.PThread = V;\n          var cc;\n          S = function dc() {\n            cc || ec();\n            cc || (S = dc);\n          };\n          function ec() {\n            function a() {\n              if (!cc && (cc = true, w.calledRun = true, !M)) {\n                D || Ra(ta);\n                ha(w);\n                if (w.onRuntimeInitialized)\n                  w.onRuntimeInitialized();\n                if (!D) {\n                  if (w.postRun)\n                    for ("function" == typeof w.postRun && (w.postRun = [w.postRun]); w.postRun.length; ) {\n                      var b = w.postRun.shift();\n                      ua.unshift(b);\n                    }\n                  Ra(ua);\n                }\n              }\n            }\n            if (!(0 < R))\n              if (D)\n                ha(w), D || Ra(ta), startWorker(w);\n              else {\n                if (w.preRun)\n                  for ("function" == typeof w.preRun && (w.preRun = [w.preRun]); w.preRun.length; )\n                    sa.unshift(w.preRun.shift());\n                Ra(sa);\n                0 < R || (w.setStatus ? (w.setStatus("Running..."), setTimeout(function() {\n                  setTimeout(\n                    function() {\n                      w.setStatus("");\n                    },\n                    1\n                  );\n                  a();\n                }, 1)) : a());\n              }\n          }\n          if (w.preInit)\n            for ("function" == typeof w.preInit && (w.preInit = [w.preInit]); 0 < w.preInit.length; )\n              w.preInit.pop()();\n          ec();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason??e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (false) {\n    ortWasmFactory = null;\n  } else {\n    ortWasmFactory = true ? require_ort_wasm() : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (false) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "xnnpack":\n          epName = "XNNPACK";\n          break;\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var ortEnvInitialized = false;\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n    if (false) {\n      const initJsep = null.init;\n      await initJsep(getInstance(), env);\n    }\n    ortEnvInitialized = true;\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var isOrtEnvInitialized = () => ortEnvInitialized;\n  var createSessionAllocate = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSessionFinalize = (modelData, options) => {\n    const wasm2 = getInstance();\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelData[0]);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n    }\n  };\n  var createSession = (model, options) => {\n    const modelData = createSessionAllocate(model);\n    return createSessionFinalize(modelData, options);\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    switch (ev.data.type) {\n      case "init-wasm":\n        try {\n          initializeWebAssembly(ev.data.in).then(\n            () => postMessage({ type: "init-wasm" }),\n            (err) => postMessage({ type: "init-wasm", err })\n          );\n        } catch (err) {\n          postMessage({ type: "init-wasm", err });\n        }\n        break;\n      case "init-ort":\n        try {\n          initRuntime(ev.data.in).then(() => postMessage({ type: "init-ort" }), (err) => postMessage({\n            type: "init-ort",\n            err\n          }));\n        } catch (err) {\n          postMessage({ type: "init-ort", err });\n        }\n        break;\n      case "create_allocate":\n        try {\n          const { model } = ev.data.in;\n          const modeldata = createSessionAllocate(model);\n          postMessage({ type: "create_allocate", out: modeldata });\n        } catch (err) {\n          postMessage({ type: "create_allocate", err });\n        }\n        break;\n      case "create_finalize":\n        try {\n          const { modeldata, options } = ev.data.in;\n          const sessionMetadata = createSessionFinalize(modeldata, options);\n          postMessage({ type: "create_finalize", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create_finalize", err });\n        }\n        break;\n      case "create":\n        try {\n          const { model, options } = ev.data.in;\n          const sessionMetadata = createSession(model, options);\n          postMessage({ type: "create", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create", err });\n        }\n        break;\n      case "release":\n        try {\n          const handler = ev.data.in;\n          releaseSession(handler);\n          postMessage({ type: "release" });\n        } catch (err) {\n          postMessage({ type: "release", err });\n        }\n        break;\n      case "run":\n        try {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = ev.data.in;\n          run(sessionId, inputIndices, inputs, outputIndices, options).then(\n            (outputs) => {\n              postMessage({ type: "run", out: outputs }, extractTransferableBuffers(outputs));\n            },\n            (err) => {\n              postMessage({ type: "run", err });\n            }\n          );\n        } catch (err) {\n          postMessage({ type: "run", err });\n        }\n        break;\n      case "end-profiling":\n        try {\n          const handler = ev.data.in;\n          endProfiling(handler);\n          postMessage({ type: "end-profiling" });\n        } catch (err) {\n          postMessage({ type: "end-profiling", err });\n        }\n        break;\n      case "is-ort-env-initialized":\n        try {\n          const ortEnvInitialized2 = isOrtEnvInitialized();\n          postMessage({ type: "is-ort-env-initialized", out: ortEnvInitialized2 });\n        } catch (err) {\n          postMessage({ type: "is-ort-env-initialized", err });\n        }\n        break;\n      default:\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS5qcyIsICJub2RlanMtaWdub3JlOndvcmtlcl90aHJlYWRzIiwgIm5vZGVqcy1pZ25vcmU6cGVyZl9ob29rcyIsICJub2RlanMtaWdub3JlOm9zIiwgIi4uLy4uL2xpYi93YXNtL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQuanMiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMiLCAibm9kZWpzLWlnbm9yZTpub2RlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1mYWN0b3J5LnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tdXRpbHMudHMiLCAiLi4vLi4vbGliL3dhc20vcnVuLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vc2Vzc2lvbi1vcHRpb25zLnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29tbW9uLnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29yZS1pbXBsLnRzIiwgIi4uLy4uL2xpYi93YXNtL3Byb3h5LXdvcmtlci9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7IiwgImV4cG9ydCBjb25zdCBqb2luID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9PSAndW5kZWZpbmVkJykgX3NjcmlwdERpciA9IF9zY3JpcHREaXIgfHwgX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbnZhciBlPW1vZHVsZUFyZyxhYSxsO2UucmVhZHk9bmV3IFByb21pc2UoKGEsYik9PnthYT1hO2w9Yn0pO3ZhciBiYT1PYmplY3QuYXNzaWduKHt9LGUpLG09XCIuL3RoaXMucHJvZ3JhbVwiLGNhPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3cscj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpbXBvcnRTY3JpcHRzLGRhPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSx3PVwiXCIseCx5LHo7XG5pZihkYSl7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKSxCPXJlcXVpcmUoXCJwYXRoXCIpO3c9cj9CLmRpcm5hbWUodykrXCIvXCI6X19kaXJuYW1lK1wiL1wiO3g9KGEsYik9PnthPWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChhKTpCLm5vcm1hbGl6ZShhKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGEsYj92b2lkIDA6XCJ1dGY4XCIpfTt6PWE9PnthPXgoYSwhMCk7YS5idWZmZXJ8fChhPW5ldyBVaW50OEFycmF5KGEpKTtyZXR1cm4gYX07eT0oYSxiLGMsZD0hMCk9PnthPWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChhKTpCLm5vcm1hbGl6ZShhKTtmcy5yZWFkRmlsZShhLGQ/dm9pZCAwOlwidXRmOFwiLChnLGgpPT57Zz9jKGcpOmIoZD9oLmJ1ZmZlcjpoKX0pfTshZS50aGlzUHJvZ3JhbSYmMTxwcm9jZXNzLmFyZ3YubGVuZ3RoJiYobT1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpO2UuaW5zcGVjdD0oKT0+XCJbRW1zY3JpcHRlbiBNb2R1bGUgb2JqZWN0XVwifWVsc2UgaWYoY2F8fFxucilyP3c9c2VsZi5sb2NhdGlvbi5ocmVmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkb2N1bWVudCYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKHc9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLF9zY3JpcHREaXImJih3PV9zY3JpcHREaXIpLDAhPT13LmluZGV4T2YoXCJibG9iOlwiKT93PXcuc3Vic3RyKDAsdy5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKTp3PVwiXCIseD1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2Iuc2VuZChudWxsKTtyZXR1cm4gYi5yZXNwb25zZVRleHR9LHImJih6PWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Iuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYi5yZXNwb25zZSl9KSx5PShhLGIsYyk9Pnt2YXIgZD1uZXcgWE1MSHR0cFJlcXVlc3Q7ZC5vcGVuKFwiR0VUXCIsYSwhMCk7ZC5yZXNwb25zZVR5cGU9XG5cImFycmF5YnVmZmVyXCI7ZC5vbmxvYWQ9KCk9PnsyMDA9PWQuc3RhdHVzfHwwPT1kLnN0YXR1cyYmZC5yZXNwb25zZT9iKGQucmVzcG9uc2UpOmMoKX07ZC5vbmVycm9yPWM7ZC5zZW5kKG51bGwpfTt2YXIgZWE9ZS5wcmludHx8Y29uc29sZS5sb2cuYmluZChjb25zb2xlKSxDPWUucHJpbnRFcnJ8fGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtPYmplY3QuYXNzaWduKGUsYmEpO2JhPW51bGw7ZS50aGlzUHJvZ3JhbSYmKG09ZS50aGlzUHJvZ3JhbSk7dmFyIEQ7ZS53YXNtQmluYXJ5JiYoRD1lLndhc21CaW5hcnkpO3ZhciBub0V4aXRSdW50aW1lPWUubm9FeGl0UnVudGltZXx8ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZFKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgRixHLGZhPSExLEgsSSxKLEs7XG5mdW5jdGlvbiBoYSgpe3ZhciBhPUYuYnVmZmVyO2UuSEVBUDg9SD1uZXcgSW50OEFycmF5KGEpO2UuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2UuSEVBUDMyPUo9bmV3IEludDMyQXJyYXkoYSk7ZS5IRUFQVTg9ST1uZXcgVWludDhBcnJheShhKTtlLkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGEpO2UuSEVBUFUzMj1LPW5ldyBVaW50MzJBcnJheShhKTtlLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtlLkhFQVBGNjQ9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgTCxpYT1bXSxqYT1bXSxrYT1bXTtmdW5jdGlvbiBsYSgpe3ZhciBhPWUucHJlUnVuLnNoaWZ0KCk7aWEudW5zaGlmdChhKX12YXIgTT0wLE49bnVsbCxPPW51bGw7XG5mdW5jdGlvbiBFKGEpe2lmKGUub25BYm9ydCllLm9uQWJvcnQoYSk7YT1cIkFib3J0ZWQoXCIrYStcIilcIjtDKGEpO2ZhPSEwO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTtsKGEpO3Rocm93IGE7fWZ1bmN0aW9uIG1hKGEpe3JldHVybiBhLnN0YXJ0c1dpdGgoXCJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsXCIpfXZhciBQO1A9XCJvcnQtd2FzbS53YXNtXCI7aWYoIW1hKFApKXt2YXIgbmE9UDtQPWUubG9jYXRlRmlsZT9lLmxvY2F0ZUZpbGUobmEsdyk6dytuYX1mdW5jdGlvbiBvYShhKXtpZihhPT1QJiZEKXJldHVybiBuZXcgVWludDhBcnJheShEKTtpZih6KXJldHVybiB6KGEpO3Rocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO31cbmZ1bmN0aW9uIHBhKGEpe2lmKCFEJiYoY2F8fHIpKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+b2EoYSkpO2lmKHkpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57eShhLGQ9PmIobmV3IFVpbnQ4QXJyYXkoZCkpLGMpfSl9cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9Pm9hKGEpKX1mdW5jdGlvbiBxYShhLGIsYyl7cmV0dXJuIHBhKGEpLnRoZW4oZD0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZCxiKSkudGhlbihkPT5kKS50aGVuKGMsZD0+e0MoXCJmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiBcIitkKTtFKGQpfSl9XG5mdW5jdGlvbiByYShhLGIpe3ZhciBjPVA7cmV0dXJuIER8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxtYShjKXx8Yy5zdGFydHNXaXRoKFwiZmlsZTovL1wiKXx8ZGF8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP3FhKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGQsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0MoXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIrZyk7QyhcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBxYShjLGEsYil9KSl9dmFyIFEsUj1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkoZSl9O1xuZnVuY3Rpb24gc2EoYSl7dGhpcy54YT1hLTI0O3RoaXMuR2E9ZnVuY3Rpb24oYil7S1t0aGlzLnhhKzQ+PjI+Pj4wXT1ifTt0aGlzLkZhPWZ1bmN0aW9uKGIpe0tbdGhpcy54YSs4Pj4yPj4+MF09Yn07dGhpcy56YT1mdW5jdGlvbihiLGMpe3RoaXMuRWEoKTt0aGlzLkdhKGIpO3RoaXMuRmEoYyl9O3RoaXMuRWE9ZnVuY3Rpb24oKXtLW3RoaXMueGErMTY+PjI+Pj4wXT0wfX1cbnZhciB0YT0wLHVhPTAsdmE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLHdhPShhLGIsYyk9PntiPj4+PTA7dmFyIGQ9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1kKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJnZhKXJldHVybiB2YS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZD1cIlwiO2I8Yzspe3ZhciBnPWFbYisrXTtpZihnJjEyOCl7dmFyIGg9YVtiKytdJjYzO2lmKDE5Mj09KGcmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChnJjMxKTw8NnxoKTtlbHNle3ZhciBrPWFbYisrXSY2MztnPTIyND09KGcmMjQwKT8oZyYxNSk8PDEyfGg8PDZ8azooZyY3KTw8MTh8aDw8MTJ8azw8NnxhW2IrK10mNjM7NjU1MzY+Zz9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpOihnLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGc+PjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGR9LFxuUz0oYSxiKT0+KGE+Pj49MCk/d2EoSSxhLGIpOlwiXCIsVD1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sVT0oYSxiLGMsZCk9PntjPj4+PTA7aWYoISgwPGQpKXJldHVybiAwO3ZhciBnPWM7ZD1jK2QtMTtmb3IodmFyIGg9MDtoPGEubGVuZ3RoOysraCl7dmFyIGs9YS5jaGFyQ29kZUF0KGgpO2lmKDU1Mjk2PD1rJiY1NzM0Mz49ayl7dmFyIHA9YS5jaGFyQ29kZUF0KCsraCk7az02NTUzNisoKGsmMTAyMyk8PDEwKXxwJjEwMjN9aWYoMTI3Pj1rKXtpZihjPj1kKWJyZWFrO2JbYysrPj4+MF09a31lbHNle2lmKDIwNDc+PWspe2lmKGMrMT49ZClicmVhaztiW2MrKz4+PjBdPTE5MnxrPj42fWVsc2V7aWYoNjU1MzU+PWspe2lmKGMrMj49ZClicmVhaztiW2MrKz4+PjBdPTIyNHxrPj4xMn1lbHNle2lmKGMrMz49XG5kKWJyZWFrO2JbYysrPj4+MF09MjQwfGs+PjE4O2JbYysrPj4+MF09MTI4fGs+PjEyJjYzfWJbYysrPj4+MF09MTI4fGs+PjYmNjN9YltjKys+Pj4wXT0xMjh8ayY2M319YltjPj4+MF09MDtyZXR1cm4gYy1nfSxWPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCkseGE9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0seWE9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sRGE9YT0+e3ZhciBiPVQoYSkrMSxjPXphKGIpO2MmJlUoYSxJLGMsYik7cmV0dXJuIGN9LFc9e30sRmE9KCk9PntpZighRWEpe3ZhciBhPXtVU0VSOlwid2ViX3VzZXJcIixMT0dOQU1FOlwid2ViX3VzZXJcIixQQVRIOlwiL1wiLFBXRDpcIi9cIixIT01FOlwiL2hvbWUvd2ViX3VzZXJcIixMQU5HOihcIm9iamVjdFwiPT10eXBlb2YgbmF2aWdhdG9yJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdfHxcIkNcIikucmVwbGFjZShcIi1cIixcblwiX1wiKStcIi5VVEYtOFwiLF86bXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIFcpdm9pZCAwPT09V1tiXT9kZWxldGUgYVtiXTphW2JdPVdbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO0VhPWN9cmV0dXJuIEVhfSxFYSxHYT1bbnVsbCxbXSxbXV0sSGE9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXSxJYT1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO2Z1bmN0aW9uIEphKGEpe3ZhciBiPUFycmF5KFQoYSkrMSk7VShhLGIsMCxiLmxlbmd0aCk7cmV0dXJuIGJ9XG5mdW5jdGlvbiBLYShhLGIsYyxkKXtmdW5jdGlvbiBnKGYsbixxKXtmb3IoZj1cIm51bWJlclwiPT10eXBlb2YgZj9mLnRvU3RyaW5nKCk6Znx8XCJcIjtmLmxlbmd0aDxuOylmPXFbMF0rZjtyZXR1cm4gZn1mdW5jdGlvbiBoKGYsbil7cmV0dXJuIGcoZixuLFwiMFwiKX1mdW5jdGlvbiBrKGYsbil7ZnVuY3Rpb24gcShBYSl7cmV0dXJuIDA+QWE/LTE6MDxBYT8xOjB9dmFyIEE7MD09PShBPXEoZi5nZXRGdWxsWWVhcigpLW4uZ2V0RnVsbFllYXIoKSkpJiYwPT09KEE9cShmLmdldE1vbnRoKCktbi5nZXRNb250aCgpKSkmJihBPXEoZi5nZXREYXRlKCktbi5nZXREYXRlKCkpKTtyZXR1cm4gQX1mdW5jdGlvbiBwKGYpe3N3aXRjaChmLmdldERheSgpKXtjYXNlIDA6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDI5KTtjYXNlIDE6cmV0dXJuIGY7Y2FzZSAyOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksMCwzKTtjYXNlIDM6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSxcbjAsMik7Y2FzZSA0OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksMCwxKTtjYXNlIDU6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDMxKTtjYXNlIDY6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDMwKX19ZnVuY3Rpb24gdChmKXt2YXIgbj1mLnRhO2ZvcihmPW5ldyBEYXRlKChuZXcgRGF0ZShmLnVhKzE5MDAsMCwxKSkuZ2V0VGltZSgpKTswPG47KXt2YXIgcT1mLmdldE1vbnRoKCksQT0oVihmLmdldEZ1bGxZZWFyKCkpP0hhOklhKVtxXTtpZihuPkEtZi5nZXREYXRlKCkpbi09QS1mLmdldERhdGUoKSsxLGYuc2V0RGF0ZSgxKSwxMT5xP2Yuc2V0TW9udGgocSsxKTooZi5zZXRNb250aCgwKSxmLnNldEZ1bGxZZWFyKGYuZ2V0RnVsbFllYXIoKSsxKSk7ZWxzZXtmLnNldERhdGUoZi5nZXREYXRlKCkrbik7YnJlYWt9fXE9bmV3IERhdGUoZi5nZXRGdWxsWWVhcigpKzEsMCw0KTtuPXAobmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCw0KSk7cT1wKHEpO3JldHVybiAwPj1rKG4sZik/MD49ayhxLGYpP2YuZ2V0RnVsbFllYXIoKSsxOmYuZ2V0RnVsbFllYXIoKTpmLmdldEZ1bGxZZWFyKCktMX1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7dmFyIHU9SltkKzQwPj4yPj4+MF07ZD17Q2E6SltkPj4yPj4+MF0sQmE6SltkKzQ+PjI+Pj4wXSx2YTpKW2QrOD4+Mj4+PjBdLHlhOkpbZCsxMj4+Mj4+PjBdLHdhOkpbZCsxNj4+Mj4+PjBdLHVhOkpbZCsyMD4+Mj4+PjBdLHNhOkpbZCsyND4+Mj4+PjBdLHRhOkpbZCsyOD4+Mj4+PjBdLEhhOkpbZCszMj4+Mj4+PjBdLEFhOkpbZCszNj4+Mj4+PjBdLERhOnU/Uyh1KTpcIlwifTtjPVMoYyk7dT17XCIlY1wiOlwiJWEgJWIgJWQgJUg6JU06JVMgJVlcIixcIiVEXCI6XCIlbS8lZC8leVwiLFwiJUZcIjpcIiVZLSVtLSVkXCIsXCIlaFwiOlwiJWJcIixcIiVyXCI6XCIlSTolTTolUyAlcFwiLFwiJVJcIjpcIiVIOiVNXCIsXCIlVFwiOlwiJUg6JU06JVNcIixcIiV4XCI6XCIlbS8lZC8leVwiLFwiJVhcIjpcIiVIOiVNOiVTXCIsXCIlRWNcIjpcIiVjXCIsXG5cIiVFQ1wiOlwiJUNcIixcIiVFeFwiOlwiJW0vJWQvJXlcIixcIiVFWFwiOlwiJUg6JU06JVNcIixcIiVFeVwiOlwiJXlcIixcIiVFWVwiOlwiJVlcIixcIiVPZFwiOlwiJWRcIixcIiVPZVwiOlwiJWVcIixcIiVPSFwiOlwiJUhcIixcIiVPSVwiOlwiJUlcIixcIiVPbVwiOlwiJW1cIixcIiVPTVwiOlwiJU1cIixcIiVPU1wiOlwiJVNcIixcIiVPdVwiOlwiJXVcIixcIiVPVVwiOlwiJVVcIixcIiVPVlwiOlwiJVZcIixcIiVPd1wiOlwiJXdcIixcIiVPV1wiOlwiJVdcIixcIiVPeVwiOlwiJXlcIn07Zm9yKHZhciB2IGluIHUpYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh2LFwiZ1wiKSx1W3ZdKTt2YXIgQmE9XCJTdW5kYXkgTW9uZGF5IFR1ZXNkYXkgV2VkbmVzZGF5IFRodXJzZGF5IEZyaWRheSBTYXR1cmRheVwiLnNwbGl0KFwiIFwiKSxDYT1cIkphbnVhcnkgRmVicnVhcnkgTWFyY2ggQXByaWwgTWF5IEp1bmUgSnVseSBBdWd1c3QgU2VwdGVtYmVyIE9jdG9iZXIgTm92ZW1iZXIgRGVjZW1iZXJcIi5zcGxpdChcIiBcIik7dT17XCIlYVwiOmY9PkJhW2Yuc2FdLnN1YnN0cmluZygwLDMpLFwiJUFcIjpmPT5CYVtmLnNhXSxcIiViXCI6Zj0+XG5DYVtmLndhXS5zdWJzdHJpbmcoMCwzKSxcIiVCXCI6Zj0+Q2FbZi53YV0sXCIlQ1wiOmY9PmgoKGYudWErMTkwMCkvMTAwfDAsMiksXCIlZFwiOmY9PmgoZi55YSwyKSxcIiVlXCI6Zj0+ZyhmLnlhLDIsXCIgXCIpLFwiJWdcIjpmPT50KGYpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJUdcIjpmPT50KGYpLFwiJUhcIjpmPT5oKGYudmEsMiksXCIlSVwiOmY9PntmPWYudmE7MD09Zj9mPTEyOjEyPGYmJihmLT0xMik7cmV0dXJuIGgoZiwyKX0sXCIlalwiOmY9Pntmb3IodmFyIG49MCxxPTA7cTw9Zi53YS0xO24rPShWKGYudWErMTkwMCk/SGE6SWEpW3ErK10pO3JldHVybiBoKGYueWErbiwzKX0sXCIlbVwiOmY9PmgoZi53YSsxLDIpLFwiJU1cIjpmPT5oKGYuQmEsMiksXCIlblwiOigpPT5cIlxcblwiLFwiJXBcIjpmPT4wPD1mLnZhJiYxMj5mLnZhP1wiQU1cIjpcIlBNXCIsXCIlU1wiOmY9PmgoZi5DYSwyKSxcIiV0XCI6KCk9PlwiXFx0XCIsXCIldVwiOmY9PmYuc2F8fDcsXCIlVVwiOmY9PmgoTWF0aC5mbG9vcigoZi50YSs3LWYuc2EpLzcpLDIpLFwiJVZcIjpmPT5cbnt2YXIgbj1NYXRoLmZsb29yKChmLnRhKzctKGYuc2ErNiklNykvNyk7Mj49KGYuc2ErMzcxLWYudGEtMiklNyYmbisrO2lmKG4pNTM9PW4mJihxPShmLnNhKzM3MS1mLnRhKSU3LDQ9PXF8fDM9PXEmJlYoZi51YSl8fChuPTEpKTtlbHNle249NTI7dmFyIHE9KGYuc2ErNy1mLnRhLTEpJTc7KDQ9PXF8fDU9PXEmJlYoZi51YSU0MDAtMSkpJiZuKyt9cmV0dXJuIGgobiwyKX0sXCIld1wiOmY9PmYuc2EsXCIlV1wiOmY9PmgoTWF0aC5mbG9vcigoZi50YSs3LShmLnNhKzYpJTcpLzcpLDIpLFwiJXlcIjpmPT4oZi51YSsxOTAwKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVZXCI6Zj0+Zi51YSsxOTAwLFwiJXpcIjpmPT57Zj1mLkFhO3ZhciBuPTA8PWY7Zj1NYXRoLmFicyhmKS82MDtyZXR1cm4obj9cIitcIjpcIi1cIikrU3RyaW5nKFwiMDAwMFwiKyhmLzYwKjEwMCtmJTYwKSkuc2xpY2UoLTQpfSxcIiVaXCI6Zj0+Zi5EYSxcIiUlXCI6KCk9PlwiJVwifTtjPWMucmVwbGFjZSgvJSUvZyxcIlxceDAwXFx4MDBcIik7Zm9yKHYgaW4gdSljLmluY2x1ZGVzKHYpJiZcbihjPWMucmVwbGFjZShuZXcgUmVnRXhwKHYsXCJnXCIpLHVbdl0oZCkpKTtjPWMucmVwbGFjZSgvXFwwXFwwL2csXCIlXCIpO3Y9SmEoYyk7aWYodi5sZW5ndGg+YilyZXR1cm4gMDtILnNldCh2LGE+Pj4wKTtyZXR1cm4gdi5sZW5ndGgtMX12YXIgWD1bXSxZPXZvaWQgMCxMYT1bXTtcbmZ1bmN0aW9uIE1hKGEsYil7aWYoIVkpe1k9bmV3IFdlYWtNYXA7dmFyIGM9TC5sZW5ndGg7aWYoWSlmb3IodmFyIGQ9MDtkPDArYztkKyspe3ZhciBnPWQ7dmFyIGg9WFtnXTtofHwoZz49WC5sZW5ndGgmJihYLmxlbmd0aD1nKzEpLFhbZ109aD1MLmdldChnKSk7KGc9aCkmJlkuc2V0KGcsZCl9fWlmKGM9WS5nZXQoYSl8fDApcmV0dXJuIGM7aWYoTGEubGVuZ3RoKWM9TGEucG9wKCk7ZWxzZXt0cnl7TC5ncm93KDEpfWNhdGNoKHApe2lmKCEocCBpbnN0YW5jZW9mIFJhbmdlRXJyb3IpKXRocm93IHA7dGhyb3dcIlVuYWJsZSB0byBncm93IHdhc20gdGFibGUuIFNldCBBTExPV19UQUJMRV9HUk9XVEguXCI7fWM9TC5sZW5ndGgtMX10cnl7ZD1jLEwuc2V0KGQsYSksWFtkXT1MLmdldChkKX1jYXRjaChwKXtpZighKHAgaW5zdGFuY2VvZiBUeXBlRXJyb3IpKXRocm93IHA7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgV2ViQXNzZW1ibHkuRnVuY3Rpb24pe2Q9V2ViQXNzZW1ibHkuRnVuY3Rpb247XG5nPXtpOlwiaTMyXCIsajpcImk2NFwiLGY6XCJmMzJcIixkOlwiZjY0XCIscDpcImkzMlwifTtoPXtwYXJhbWV0ZXJzOltdLHJlc3VsdHM6XCJ2XCI9PWJbMF0/W106W2dbYlswXV1dfTtmb3IodmFyIGs9MTtrPGIubGVuZ3RoOysrayloLnBhcmFtZXRlcnMucHVzaChnW2Jba11dKTtiPW5ldyBkKGgsYSl9ZWxzZXtkPVsxXTtnPWIuc2xpY2UoMCwxKTtiPWIuc2xpY2UoMSk7aD17aToxMjcscDoxMjcsajoxMjYsZjoxMjUsZDoxMjR9O2QucHVzaCg5Nik7az1iLmxlbmd0aDsxMjg+az9kLnB1c2goayk6ZC5wdXNoKGslMTI4fDEyOCxrPj43KTtmb3Ioaz0wO2s8Yi5sZW5ndGg7KytrKWQucHVzaChoW2Jba11dKTtcInZcIj09Zz9kLnB1c2goMCk6ZC5wdXNoKDEsaFtnXSk7Yj1bMCw5NywxMTUsMTA5LDEsMCwwLDAsMV07Zz1kLmxlbmd0aDsxMjg+Zz9iLnB1c2goZyk6Yi5wdXNoKGclMTI4fDEyOCxnPj43KTtiLnB1c2guYXBwbHkoYixkKTtiLnB1c2goMiw3LDEsMSwxMDEsMSwxMDIsMCwwLDcsNSwxLDEsMTAyLFxuMCwwKTtiPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUobmV3IFVpbnQ4QXJyYXkoYikpO2I9KG5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShiLHtlOntmOmF9fSkpLmV4cG9ydHMuZn1kPWM7TC5zZXQoZCxiKTtYW2RdPUwuZ2V0KGQpfVkuc2V0KGEsYyk7cmV0dXJuIGN9XG52YXIgT2E9e2E6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IHNhKGEpKS56YShiPj4+MCxjPj4+MCk7dGE9YTt1YSsrO3Rocm93IHRhO30sZTpmdW5jdGlvbigpe3JldHVybiAwfSxIOmZ1bmN0aW9uKCl7fSx4OmZ1bmN0aW9uKCl7fSx6OmZ1bmN0aW9uKCl7fSxKOmZ1bmN0aW9uKCl7cmV0dXJuIDB9LEY6ZnVuY3Rpb24oKXt9LEE6ZnVuY3Rpb24oKXt9LEU6ZnVuY3Rpb24oKXt9LGc6ZnVuY3Rpb24oKXt9LHk6ZnVuY3Rpb24oKXt9LHY6ZnVuY3Rpb24oKXt9LEc6ZnVuY3Rpb24oKXt9LHc6ZnVuY3Rpb24oKXt9LGw6KCk9PiEwLG86ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0pbYz4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO0pbYys0Pj4yPj4+MF09YS5nZXRVVENNaW51dGVzKCk7SltjKzg+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7SltjKzEyPj4yPj4+XG4wXT1hLmdldFVUQ0RhdGUoKTtKW2MrMTY+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7SltjKzIwPj4yPj4+MF09YS5nZXRVVENGdWxsWWVhcigpLTE5MDA7SltjKzI0Pj4yPj4+MF09YS5nZXRVVENEYXkoKTtKW2MrMjg+PjI+Pj4wXT0oYS5nZXRUaW1lKCktRGF0ZS5VVEMoYS5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0RTV8MH0scDpmdW5jdGlvbihhLGIsYyl7YT1iKzIwOTcxNTI+Pj4wPDQxOTQzMDUtISFhPyhhPj4+MCkrNDI5NDk2NzI5NipiOk5hTjtjPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7SltjPj4yPj4+MF09YS5nZXRTZWNvbmRzKCk7SltjKzQ+PjI+Pj4wXT1hLmdldE1pbnV0ZXMoKTtKW2MrOD4+Mj4+PjBdPWEuZ2V0SG91cnMoKTtKW2MrMTI+PjI+Pj4wXT1hLmdldERhdGUoKTtKW2MrMTY+PjI+Pj4wXT1hLmdldE1vbnRoKCk7SltjKzIwPj4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7SltjKzI0Pj4yPj4+MF09YS5nZXREYXkoKTtKW2MrMjg+PjI+Pj5cbjBdPShWKGEuZ2V0RnVsbFllYXIoKSk/eGE6eWEpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0pbYyszNj4+Mj4+PjBdPS0oNjAqYS5nZXRUaW1lem9uZU9mZnNldCgpKTtiPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgZD0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDAsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7SltjKzMyPj4yPj4+MF09KGIhPWQmJmEuZ2V0VGltZXpvbmVPZmZzZXQoKT09TWF0aC5taW4oZCxiKSl8MH0scTpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9bmV3IERhdGUoSlthKzIwPj4yPj4+MF0rMTkwMCxKW2ErMTY+PjI+Pj4wXSxKW2ErMTI+PjI+Pj4wXSxKW2ErOD4+Mj4+PjBdLEpbYSs0Pj4yPj4+MF0sSlthPj4yPj4+MF0sMCksYz1KW2ErMzI+PjI+Pj4wXSxkPWIuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbmg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oaCxnKTswPmM/SlthKzMyPj4yPj4+MF09TnVtYmVyKGchPWgmJms9PWQpOjA8YyE9KGs9PWQpJiYoZz1NYXRoLm1heChoLGcpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/azpnKS1kKSkpO0pbYSsyND4+Mj4+PjBdPWIuZ2V0RGF5KCk7SlthKzI4Pj4yPj4+MF09KFYoYi5nZXRGdWxsWWVhcigpKT94YTp5YSlbYi5nZXRNb250aCgpXStiLmdldERhdGUoKS0xfDA7SlthPj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7SlthKzQ+PjI+Pj4wXT1iLmdldE1pbnV0ZXMoKTtKW2ErOD4+Mj4+PjBdPWIuZ2V0SG91cnMoKTtKW2ErMTI+PjI+Pj4wXT1iLmdldERhdGUoKTtKW2ErMTY+PjI+Pj4wXT1iLmdldE1vbnRoKCk7SlthKzIwPj4yPj4+MF09Yi5nZXRZZWFyKCk7YT1iLmdldFRpbWUoKS8xRTM7cmV0dXJuIE5hKChRPWEsMTw9K01hdGguYWJzKFEpPzA8UT8rTWF0aC5mbG9vcihRL1xuNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgoUS0rKH5+UT4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCkpLGE+Pj4wfSxtOmZ1bmN0aW9uKCl7cmV0dXJuLTUyfSxuOmZ1bmN0aW9uKCl7fSx0OmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKHQpe3JldHVybih0PXQudG9UaW1lU3RyaW5nKCkubWF0Y2goL1xcKChbQS1aYS16IF0rKVxcKSQvKSk/dFsxXTpcIkdNVFwifWM+Pj49MDt2YXIgZz0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksaD1uZXcgRGF0ZShnLDAsMSksaz1uZXcgRGF0ZShnLDYsMSk7Zz1oLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIHA9ay5nZXRUaW1lem9uZU9mZnNldCgpO0tbYT4+PjA+PjI+Pj4wXT02MCpNYXRoLm1heChnLHApO0pbYj4+PjA+PjI+Pj4wXT1OdW1iZXIoZyE9cCk7YT1kKGgpO2I9ZChrKTthPURhKGEpO2I9RGEoYik7cDxnPyhLW2M+PjI+Pj4wXT1hLEtbYys0Pj4yPj4+MF09Yik6KEtbYz4+Mj4+PjBdPWIsS1tjKzQ+PjI+Pj4wXT1hKX0sZDooKT0+e0UoXCJcIil9LFxuaDpmdW5jdGlvbigpe3JldHVybiBEYXRlLm5vdygpfSx1OmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LGI6KCk9PnBlcmZvcm1hbmNlLm5vdygpLEk6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtyZXR1cm4gSS5jb3B5V2l0aGluKGE+Pj4wPj4+MCxiPj4+MCxiKyhjPj4+MCk+Pj4wKX0sczpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9SS5sZW5ndGg7aWYoNDI5NDkwMTc2MDxhKXJldHVybiExO2Zvcih2YXIgYz0xOzQ+PWM7Yyo9Mil7dmFyIGQ9YiooMSsuMi9jKTtkPU1hdGgubWluKGQsYSsxMDA2NjMyOTYpO3ZhciBnPU1hdGg7ZD1NYXRoLm1heChhLGQpO2E6e2c9Zy5taW4uY2FsbChnLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLUYuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzU+Pj4xNjt0cnl7Ri5ncm93KGcpO2hhKCk7dmFyIGg9MTticmVhayBhfWNhdGNoKGspe31oPXZvaWQgMH1pZihoKXJldHVybiEwfXJldHVybiExfSxDOmZ1bmN0aW9uKGEsYil7YT4+Pj1cbjA7Yj4+Pj0wO3ZhciBjPTA7RmEoKS5mb3JFYWNoKGZ1bmN0aW9uKGQsZyl7dmFyIGg9YitjO2c9S1thKzQqZz4+Mj4+PjBdPWg7Zm9yKGg9MDtoPGQubGVuZ3RoOysraClIW2crKz4+MD4+PjBdPWQuY2hhckNvZGVBdChoKTtIW2c+PjA+Pj4wXT0wO2MrPWQubGVuZ3RoKzF9KTtyZXR1cm4gMH0sRDpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9RmEoKTtLW2E+PjI+Pj4wXT1jLmxlbmd0aDt2YXIgZD0wO2MuZm9yRWFjaChmdW5jdGlvbihnKXtkKz1nLmxlbmd0aCsxfSk7S1tiPj4yPj4+MF09ZDtyZXR1cm4gMH0sZjooKT0+NTIsazpmdW5jdGlvbigpe3JldHVybiA1Mn0scjpmdW5jdGlvbigpe3JldHVybiA3MH0sajpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtmb3IodmFyIGc9MCxoPTA7aDxjO2grKyl7dmFyIGs9S1tiPj4yPj4+MF0scD1LW2IrND4+Mj4+PjBdO2IrPTg7Zm9yKHZhciB0PTA7dDxwO3QrKyl7dmFyIHU9SVtrK3Q+Pj4wXSx2PVxuR2FbYV07MD09PXV8fDEwPT09dT8oKDE9PT1hP2VhOkMpKHdhKHYsMCkpLHYubGVuZ3RoPTApOnYucHVzaCh1KX1nKz1wfUtbZD4+Mj4+PjBdPWc7cmV0dXJuIDB9LEI6S2EsYzpmdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4gS2EoYT4+PjAsYj4+PjAsYz4+PjAsZD4+PjApfSxpOmZ1bmN0aW9uKGEsYixjLGQpe2NvbnN0IGc9TC5sZW5ndGg7YT1uZXcgVWludDhBcnJheShJLnNsaWNlKGErYixhK2MpKTt0cnl7dmFyIGg9bmV3IFdlYkFzc2VtYmx5Lk1vZHVsZShhKSxrPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShoLHtlbnY6e21lbW9yeTpGfX0pLHA7Zm9yKHAgaW4gay5leHBvcnRzKU1hKGsuZXhwb3J0c1twXSk7cmV0dXJuIGc8TC5sZW5ndGg/ZzpkfWNhdGNoKHQpe3JldHVybiBjb25zb2xlLmxvZyh0KSxkfX19O1xuKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShjKXtjPWMuZXhwb3J0cztHPWM9UGEoYyk7Rj1HLks7aGEoKTtMPUcubmE7amEudW5zaGlmdChHLkwpO00tLTtlLm1vbml0b3JSdW5EZXBlbmRlbmNpZXMmJmUubW9uaXRvclJ1bkRlcGVuZGVuY2llcyhNKTtpZigwPT1NJiYobnVsbCE9PU4mJihjbGVhckludGVydmFsKE4pLE49bnVsbCksTykpe3ZhciBkPU87Tz1udWxsO2QoKX1yZXR1cm4gY312YXIgYj17YTpPYX07TSsrO2UubW9uaXRvclJ1bkRlcGVuZGVuY2llcyYmZS5tb25pdG9yUnVuRGVwZW5kZW5jaWVzKE0pO2lmKGUuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gZS5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtDKFwiTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogXCIrYyksbChjKX1yYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSl9KS5jYXRjaChsKTtyZXR1cm57fX0pKCk7XG5lLl9PcnRJbml0PShhLGIpPT4oZS5fT3J0SW5pdD1HLk0pKGEsYik7ZS5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4oZS5fT3J0R2V0TGFzdEVycm9yPUcuTikoYSxiKTtlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxnLGgsayxwLHQsdSk9PihlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1HLk8pKGEsYixjLGQsZyxoLGsscCx0LHUpO2UuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4oZS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9Ry5QKShhLGIpO2UuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4oZS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPUcuUSkoYSxiLGMpO2UuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT0oYSxiLGMpPT4oZS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PUcuUikoYSxiLGMpO2UuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1hPT4oZS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPUcuUykoYSk7XG5lLl9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9PihlLl9PcnRDcmVhdGVTZXNzaW9uPUcuVCkoYSxiLGMpO2UuX09ydFJlbGVhc2VTZXNzaW9uPWE9PihlLl9PcnRSZWxlYXNlU2Vzc2lvbj1HLlUpKGEpO2UuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KGUuX09ydEdldElucHV0T3V0cHV0Q291bnQ9Ry5WKShhLGIsYyk7ZS5fT3J0R2V0SW5wdXROYW1lPShhLGIpPT4oZS5fT3J0R2V0SW5wdXROYW1lPUcuVykoYSxiKTtlLl9PcnRHZXRPdXRwdXROYW1lPShhLGIpPT4oZS5fT3J0R2V0T3V0cHV0TmFtZT1HLlgpKGEsYik7ZS5fT3J0RnJlZT1hPT4oZS5fT3J0RnJlZT1HLlkpKGEpO2UuX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxnLGgpPT4oZS5fT3J0Q3JlYXRlVGVuc29yPUcuWikoYSxiLGMsZCxnLGgpO2UuX09ydEdldFRlbnNvckRhdGE9KGEsYixjLGQsZyk9PihlLl9PcnRHZXRUZW5zb3JEYXRhPUcuXykoYSxiLGMsZCxnKTtcbmUuX09ydFJlbGVhc2VUZW5zb3I9YT0+KGUuX09ydFJlbGVhc2VUZW5zb3I9Ry4kKShhKTtlLl9PcnRDcmVhdGVSdW5PcHRpb25zPShhLGIsYyxkKT0+KGUuX09ydENyZWF0ZVJ1bk9wdGlvbnM9Ry5hYSkoYSxiLGMsZCk7ZS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KGUuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PUcuYmEpKGEsYixjKTtlLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1hPT4oZS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9Ry5jYSkoYSk7ZS5fT3J0Q3JlYXRlQmluZGluZz1hPT4oZS5fT3J0Q3JlYXRlQmluZGluZz1HLmRhKShhKTtlLl9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KGUuX09ydEJpbmRJbnB1dD1HLmVhKShhLGIsYyk7ZS5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9PihlLl9PcnRCaW5kT3V0cHV0PUcuZmEpKGEsYixjLGQpO2UuX09ydENsZWFyQm91bmRPdXRwdXRzPWE9PihlLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1HLmdhKShhKTtcbmUuX09ydFJlbGVhc2VCaW5kaW5nPWE9PihlLl9PcnRSZWxlYXNlQmluZGluZz1HLmhhKShhKTtlLl9PcnRSdW5XaXRoQmluZGluZz0oYSxiLGMsZCxnKT0+KGUuX09ydFJ1bldpdGhCaW5kaW5nPUcuaWEpKGEsYixjLGQsZyk7ZS5fT3J0UnVuPShhLGIsYyxkLGcsaCxrLHApPT4oZS5fT3J0UnVuPUcuamEpKGEsYixjLGQsZyxoLGsscCk7ZS5fT3J0RW5kUHJvZmlsaW5nPWE9PihlLl9PcnRFbmRQcm9maWxpbmc9Ry5rYSkoYSk7dmFyIHphPWUuX21hbGxvYz1hPT4oemE9ZS5fbWFsbG9jPUcubGEpKGEpO2UuX2ZyZWU9YT0+KGUuX2ZyZWU9Ry5tYSkoYSk7dmFyIE5hPWE9PihOYT1HLm9hKShhKSxRYT0oKT0+KFFhPUcucGEpKCksUmE9YT0+KFJhPUcucWEpKGEpLFNhPWE9PihTYT1HLnJhKShhKTtlLl9fX3N0YXJ0X2VtX2pzPTkwNTA4ODtlLl9fX3N0b3BfZW1fanM9OTA1NzAwO1xuZnVuY3Rpb24gUGEoYSl7YT1PYmplY3QuYXNzaWduKHt9LGEpO3ZhciBiPWQ9PigpPT5kKCk+Pj4wLGM9ZD0+Zz0+ZChnKT4+PjA7YS5fX2Vycm5vX2xvY2F0aW9uPWIoYS5fX2Vycm5vX2xvY2F0aW9uKTthLm1hbGxvYz1jKGEubWFsbG9jKTthLnN0YWNrU2F2ZT1iKGEuc3RhY2tTYXZlKTthLnN0YWNrQWxsb2M9YyhhLnN0YWNrQWxsb2MpO3JldHVybiBhfWUuc3RhY2tBbGxvYz1TYTtlLnN0YWNrU2F2ZT1RYTtlLnN0YWNrUmVzdG9yZT1SYTtlLmFkZEZ1bmN0aW9uPU1hO2UuVVRGOFRvU3RyaW5nPVM7ZS5zdHJpbmdUb1VURjg9KGEsYixjKT0+VShhLEksYixjKTtlLmxlbmd0aEJ5dGVzVVRGOD1UO3ZhciBaO089ZnVuY3Rpb24gVGEoKXtafHxVYSgpO1p8fChPPVRhKX07XG5mdW5jdGlvbiBVYSgpe2Z1bmN0aW9uIGEoKXtpZighWiYmKFo9ITAsZS5jYWxsZWRSdW49ITAsIWZhKSl7UihqYSk7YWEoZSk7aWYoZS5vblJ1bnRpbWVJbml0aWFsaXplZCllLm9uUnVudGltZUluaXRpYWxpemVkKCk7aWYoZS5wb3N0UnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBlLnBvc3RSdW4mJihlLnBvc3RSdW49W2UucG9zdFJ1bl0pO2UucG9zdFJ1bi5sZW5ndGg7KXt2YXIgYj1lLnBvc3RSdW4uc2hpZnQoKTtrYS51bnNoaWZ0KGIpfVIoa2EpfX1pZighKDA8TSkpe2lmKGUucHJlUnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBlLnByZVJ1biYmKGUucHJlUnVuPVtlLnByZVJ1bl0pO2UucHJlUnVuLmxlbmd0aDspbGEoKTtSKGlhKTswPE18fChlLnNldFN0YXR1cz8oZS5zZXRTdGF0dXMoXCJSdW5uaW5nLi4uXCIpLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5zZXRTdGF0dXMoXCJcIil9LDEpO2EoKX0sMSkpOmEoKSl9fVxuaWYoZS5wcmVJbml0KWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiBlLnByZUluaXQmJihlLnByZUluaXQ9W2UucHJlSW5pdF0pOzA8ZS5wcmVJbml0Lmxlbmd0aDspZS5wcmVJbml0LnBvcCgpKCk7VWEoKTtcblxuXG4gIHJldHVybiBtb2R1bGVBcmcucmVhZHlcbn1cblxuKTtcbn0pKCk7XG5pZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuICBtb2R1bGUuZXhwb3J0cyA9IG9ydFdhc207XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbSk7XG4iLCAiIiwgIiIsICJleHBvcnQgY29uc3QgY3B1cyA9IHVuZGVmaW5lZDsiLCAiXG52YXIgb3J0V2FzbVRocmVhZGVkID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9PSAndW5kZWZpbmVkJykgX3NjcmlwdERpciA9IF9zY3JpcHREaXIgfHwgX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbmZ1bmN0aW9uIGFhKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGx9ZnVuY3Rpb24gbigpe2UuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBiYX1mdW5jdGlvbiBwKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGNhfWZ1bmN0aW9uIHQoKXtlLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gZGF9ZnVuY3Rpb24gZWEoKXtlLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gZmF9dmFyIHc9bW9kdWxlQXJnLGhhLHg7dy5yZWFkeT1uZXcgUHJvbWlzZSgoYSxiKT0+e2hhPWE7eD1ifSk7XG52YXIgaWE9T2JqZWN0LmFzc2lnbih7fSx3KSxqYT1cIi4vdGhpcy5wcm9ncmFtXCIsej0oYSxiKT0+e3Rocm93IGI7fSxrYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LEE9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxDPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSxEPXcuRU5WSVJPTk1FTlRfSVNfUFRIUkVBRHx8ITEsRT1cIlwiO2Z1bmN0aW9uIGxhKGEpe3JldHVybiB3LmxvY2F0ZUZpbGU/dy5sb2NhdGVGaWxlKGEsRSk6RSthfXZhciBtYSxGLEc7XG5pZihDKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLG5hPXJlcXVpcmUoXCJwYXRoXCIpO0U9QT9uYS5kaXJuYW1lKEUpK1wiL1wiOl9fZGlybmFtZStcIi9cIjttYT0oYixjKT0+e2I9Yi5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGIpOm5hLm5vcm1hbGl6ZShiKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGIsYz92b2lkIDA6XCJ1dGY4XCIpfTtHPWI9PntiPW1hKGIsITApO2IuYnVmZmVyfHwoYj1uZXcgVWludDhBcnJheShiKSk7cmV0dXJuIGJ9O0Y9KGIsYyxkLGc9ITApPT57Yj1iLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpP25ldyBVUkwoYik6bmEubm9ybWFsaXplKGIpO2ZzLnJlYWRGaWxlKGIsZz92b2lkIDA6XCJ1dGY4XCIsKGgsayk9PntoP2QoaCk6YyhnP2suYnVmZmVyOmspfSl9OyF3LnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihqYT1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpO3o9KGIsYyk9Pntwcm9jZXNzLmV4aXRDb2RlPVxuYjt0aHJvdyBjO307dy5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCI7bGV0IGE7dHJ5e2E9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpfWNhdGNoKGIpe3Rocm93IGNvbnNvbGUuZXJyb3IoJ1RoZSBcIndvcmtlcl90aHJlYWRzXCIgbW9kdWxlIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBub2RlLmpzIGJ1aWxkIC0gcGVyaGFwcyBhIG5ld2VyIHZlcnNpb24gaXMgbmVlZGVkPycpLGI7fWdsb2JhbC5Xb3JrZXI9YS5Xb3JrZXJ9ZWxzZSBpZihrYXx8QSlBP0U9c2VsZi5sb2NhdGlvbi5ocmVmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkb2N1bWVudCYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKEU9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLCh0eXBlb2YgX3NjcmlwdERpciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBfc2NyaXB0RGlyKSYmKEU9X3NjcmlwdERpciksMCE9PUUuaW5kZXhPZihcImJsb2I6XCIpP0U9RS5zdWJzdHIoMCxFLnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOkU9XCJcIixDfHwobWE9YT0+e3ZhciBiPVxubmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2Iuc2VuZChudWxsKTtyZXR1cm4gYi5yZXNwb25zZVRleHR9LEEmJihHPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Iuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYi5yZXNwb25zZSl9KSxGPShhLGIsYyk9Pnt2YXIgZD1uZXcgWE1MSHR0cFJlcXVlc3Q7ZC5vcGVuKFwiR0VUXCIsYSwhMCk7ZC5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Qub25sb2FkPSgpPT57MjAwPT1kLnN0YXR1c3x8MD09ZC5zdGF0dXMmJmQucmVzcG9uc2U/YihkLnJlc3BvbnNlKTpjKCl9O2Qub25lcnJvcj1jO2Quc2VuZChudWxsKX0pO0MmJlwidW5kZWZpbmVkXCI9PXR5cGVvZiBwZXJmb3JtYW5jZSYmKGdsb2JhbC5wZXJmb3JtYW5jZT1yZXF1aXJlKFwicGVyZl9ob29rc1wiKS5wZXJmb3JtYW5jZSk7XG52YXIgb2E9Y29uc29sZS5sb2cuYmluZChjb25zb2xlKSxwYT1jb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7QyYmKG9hPSguLi5hKT0+ZnMud3JpdGVTeW5jKDEsYS5qb2luKFwiIFwiKStcIlxcblwiKSxwYT0oLi4uYSk9PmZzLndyaXRlU3luYygyLGEuam9pbihcIiBcIikrXCJcXG5cIikpO3ZhciBxYT13LnByaW50fHxvYSxJPXcucHJpbnRFcnJ8fHBhO09iamVjdC5hc3NpZ24odyxpYSk7aWE9bnVsbDt3LnRoaXNQcm9ncmFtJiYoamE9dy50aGlzUHJvZ3JhbSk7dy5xdWl0JiYoej13LnF1aXQpO3ZhciBKO3cud2FzbUJpbmFyeSYmKEo9dy53YXNtQmluYXJ5KTt2YXIgbm9FeGl0UnVudGltZT13Lm5vRXhpdFJ1bnRpbWV8fCEwO1wib2JqZWN0XCIhPXR5cGVvZiBXZWJBc3NlbWJseSYmSyhcIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWRcIik7dmFyIGUsTCxyYSxNPSExLE4sbCxiYSxjYSxkYSxmYTtcbmZ1bmN0aW9uIG0oKXt2YXIgYT1lLmJ1ZmZlcjt3LkhFQVA4PWw9bmV3IEludDhBcnJheShhKTt3LkhFQVAxNj1uZXcgSW50MTZBcnJheShhKTt3LkhFQVAzMj1jYT1uZXcgSW50MzJBcnJheShhKTt3LkhFQVBVOD1iYT1uZXcgVWludDhBcnJheShhKTt3LkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGEpO3cuSEVBUFUzMj1kYT1uZXcgVWludDMyQXJyYXkoYSk7dy5IRUFQRjMyPW5ldyBGbG9hdDMyQXJyYXkoYSk7dy5IRUFQRjY0PWZhPW5ldyBGbG9hdDY0QXJyYXkoYSl9dmFyIE89dy5JTklUSUFMX01FTU9SWXx8MTY3NzcyMTY7NTI0Mjg4MDw9T3x8SyhcIklOSVRJQUxfTUVNT1JZIHNob3VsZCBiZSBsYXJnZXIgdGhhbiBTVEFDS19TSVpFLCB3YXMgXCIrTytcIiEgKFNUQUNLX1NJWkU9NTI0Mjg4MClcIik7XG5pZihEKWU9dy53YXNtTWVtb3J5O2Vsc2UgaWYody53YXNtTWVtb3J5KWU9dy53YXNtTWVtb3J5O2Vsc2UgaWYoZT1uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOk8vNjU1MzYsbWF4aW11bTo2NTUzNixzaGFyZWQ6ITB9KSwhKGUuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpKXRocm93IEkoXCJyZXF1ZXN0ZWQgYSBzaGFyZWQgV2ViQXNzZW1ibHkuTWVtb3J5IGJ1dCB0aGUgcmV0dXJuZWQgYnVmZmVyIGlzIG5vdCBhIFNoYXJlZEFycmF5QnVmZmVyLCBpbmRpY2F0aW5nIHRoYXQgd2hpbGUgdGhlIGJyb3dzZXIgaGFzIFNoYXJlZEFycmF5QnVmZmVyIGl0IGRvZXMgbm90IGhhdmUgV2ViQXNzZW1ibHkgdGhyZWFkcyBzdXBwb3J0IC0geW91IG1heSBuZWVkIHRvIHNldCBhIGZsYWdcIiksQyYmSShcIihvbiBub2RlIHlvdSBtYXkgbmVlZDogLS1leHBlcmltZW50YWwtd2FzbS10aHJlYWRzIC0tZXhwZXJpbWVudGFsLXdhc20tYnVsay1tZW1vcnkgYW5kL29yIHJlY2VudCB2ZXJzaW9uKVwiKSxcbkVycm9yKFwiYmFkIG1lbW9yeVwiKTttKCk7Tz1lLmJ1ZmZlci5ieXRlTGVuZ3RoO3ZhciBQLHNhPVtdLHRhPVtdLHVhPVtdLHZhPTA7ZnVuY3Rpb24gUSgpe3JldHVybiBub0V4aXRSdW50aW1lfHwwPHZhfXZhciBSPTAsd2E9bnVsbCxTPW51bGw7ZnVuY3Rpb24geGEoKXtSKys7dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUil9ZnVuY3Rpb24geWEoKXtSLS07dy5tb25pdG9yUnVuRGVwZW5kZW5jaWVzJiZ3Lm1vbml0b3JSdW5EZXBlbmRlbmNpZXMoUik7aWYoMD09UiYmKG51bGwhPT13YSYmKGNsZWFySW50ZXJ2YWwod2EpLHdhPW51bGwpLFMpKXt2YXIgYT1TO1M9bnVsbDthKCl9fVxuZnVuY3Rpb24gSyhhKXtpZih3Lm9uQWJvcnQpdy5vbkFib3J0KGEpO2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7SShhKTtNPSEwO049MTthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7eChhKTt0aHJvdyBhO31mdW5jdGlvbiB6YShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgVDtUPVwib3J0LXdhc20tdGhyZWFkZWQud2FzbVwiO3phKFQpfHwoVD1sYShUKSk7ZnVuY3Rpb24gQWEoYSl7aWYoYT09VCYmSilyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoSik7aWYoRylyZXR1cm4gRyhhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiBCYShhKXtpZighSiYmKGthfHxBKSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFhLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PkFhKGEpKTtpZihGKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e0YoYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5BYShhKSl9ZnVuY3Rpb24gQ2EoYSxiLGMpe3JldHVybiBCYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntJKFwiZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogXCIrZCk7SyhkKX0pfVxuZnVuY3Rpb24gRGEoYSxiKXt2YXIgYz1UO3JldHVybiBKfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8emEoYyl8fGMuc3RhcnRzV2l0aChcImZpbGU6Ly9cIil8fEN8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGZldGNoP0NhKGMsYSxiKTpmZXRjaChjLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGQsYSkudGhlbihiLGZ1bmN0aW9uKGcpe0koXCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogXCIrZyk7SShcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO3JldHVybiBDYShjLGEsYil9KSl9dmFyIFU7ZnVuY3Rpb24gRWEoYSl7dGhpcy5uYW1lPVwiRXhpdFN0YXR1c1wiO3RoaXMubWVzc2FnZT1gUHJvZ3JhbSB0ZXJtaW5hdGVkIHdpdGggZXhpdCgke2F9KWA7dGhpcy5zdGF0dXM9YX1cbmZ1bmN0aW9uIEZhKGEpe2EudGVybWluYXRlKCk7YS5vbm1lc3NhZ2U9KCk9Pnt9fWZ1bmN0aW9uIEdhKGEpeyhhPVYuTWFbYV0pfHxLKCk7Vi5tYihhKX1mdW5jdGlvbiBIYShhKXt2YXIgYj1WLmdiKCk7aWYoIWIpcmV0dXJuIDY7Vi5QYS5wdXNoKGIpO1YuTWFbYS5PYV09YjtiLk9hPWEuT2E7dmFyIGM9e2NtZDpcInJ1blwiLHN0YXJ0X3JvdXRpbmU6YS5uYixhcmc6YS5mYixwdGhyZWFkX3B0cjphLk9hfTtDJiZiLnVucmVmKCk7Yi5wb3N0TWVzc2FnZShjLGEudGIpO3JldHVybiAwfVxudmFyIElhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCxKYT0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBkPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZCk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZJYSlyZXR1cm4gSWEuZGVjb2RlKGEuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXI/YS5zbGljZShiLGMpOmEuc3ViYXJyYXkoYixjKSk7Zm9yKGQ9XCJcIjtiPGM7KXt2YXIgZz1hW2IrK107aWYoZyYxMjgpe3ZhciBoPWFbYisrXSY2MztpZigxOTI9PShnJjIyNCkpZCs9U3RyaW5nLmZyb21DaGFyQ29kZSgoZyYzMSk8PDZ8aCk7ZWxzZXt2YXIgaz1hW2IrK10mNjM7Zz0yMjQ9PShnJjI0MCk/KGcmMTUpPDwxMnxoPDw2fGs6KGcmNyk8PDE4fGg8PDEyfGs8PDZ8YVtiKytdJjYzOzY1NTM2Pmc/ZCs9U3RyaW5nLmZyb21DaGFyQ29kZShnKTooZy09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxnPj5cbjEwLDU2MzIwfGcmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZyl9cmV0dXJuIGR9LEthPShhLGIpPT4oYT4+Pj0wKT9KYShuKCksYSxiKTpcIlwiO2Z1bmN0aW9uIExhKGEpe2lmKEQpcmV0dXJuIFcoMSwxLGEpO049YTtpZighUSgpKXtWLm9iKCk7aWYody5vbkV4aXQpdy5vbkV4aXQoYSk7TT0hMH16KGEsbmV3IEVhKGEpKX1cbnZhciBOYT1hPT57Tj1hO2lmKEQpdGhyb3cgTWEoYSksXCJ1bndpbmRcIjtMYShhKX0sVj17U2E6W10sUGE6W10sJGE6W10sTWE6e30sV2E6ZnVuY3Rpb24oKXtEP1YuaWIoKTpWLmhiKCl9LGhiOmZ1bmN0aW9uKCl7c2EudW5zaGlmdCgoKT0+e3hhKCk7Vi5qYigoKT0+eWEoKSl9KX0saWI6ZnVuY3Rpb24oKXtWLnJlY2VpdmVPYmplY3RUcmFuc2Zlcj1WLmxiO1YudGhyZWFkSW5pdFRMUz1WLlphO1Yuc2V0RXhpdFN0YXR1cz1WLllhO25vRXhpdFJ1bnRpbWU9ITF9LFlhOmZ1bmN0aW9uKGEpe049YX0seWI6W1wiJHRlcm1pbmF0ZVdvcmtlclwiXSxvYjpmdW5jdGlvbigpe2Zvcih2YXIgYSBvZiBWLlBhKUZhKGEpO2ZvcihhIG9mIFYuU2EpRmEoYSk7Vi5TYT1bXTtWLlBhPVtdO1YuTWE9W119LG1iOmZ1bmN0aW9uKGEpe3ZhciBiPWEuT2E7ZGVsZXRlIFYuTWFbYl07Vi5TYS5wdXNoKGEpO1YuUGEuc3BsaWNlKFYuUGEuaW5kZXhPZihhKSwxKTthLk9hPTA7T2EoYil9LGxiOmZ1bmN0aW9uKCl7fSxcblphOmZ1bmN0aW9uKCl7Vi4kYS5mb3JFYWNoKGE9PmEoKSl9LGtiOmE9Pm5ldyBQcm9taXNlKGI9PnthLm9ubWVzc2FnZT1oPT57aD1oLmRhdGE7dmFyIGs9aC5jbWQ7aWYoaC50YXJnZXRUaHJlYWQmJmgudGFyZ2V0VGhyZWFkIT1QYSgpKXt2YXIgcT1WLk1hW2gueGJdO3E/cS5wb3N0TWVzc2FnZShoLGgudHJhbnNmZXJMaXN0KTpJKCdJbnRlcm5hbCBlcnJvciEgV29ya2VyIHNlbnQgYSBtZXNzYWdlIFwiJytrKydcIiB0byB0YXJnZXQgcHRocmVhZCAnK2gudGFyZ2V0VGhyZWFkK1wiLCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFcIil9ZWxzZSBpZihcImNoZWNrTWFpbGJveFwiPT09aylRYSgpO2Vsc2UgaWYoXCJzcGF3blRocmVhZFwiPT09aylIYShoKTtlbHNlIGlmKFwiY2xlYW51cFRocmVhZFwiPT09aylHYShoLnRocmVhZCk7ZWxzZSBpZihcImtpbGxUaHJlYWRcIj09PWspaD1oLnRocmVhZCxrPVYuTWFbaF0sZGVsZXRlIFYuTWFbaF0sRmEoayksT2EoaCksVi5QYS5zcGxpY2UoVi5QYS5pbmRleE9mKGspLFxuMSksay5PYT0wO2Vsc2UgaWYoXCJjYW5jZWxUaHJlYWRcIj09PWspVi5NYVtoLnRocmVhZF0ucG9zdE1lc3NhZ2Uoe2NtZDpcImNhbmNlbFwifSk7ZWxzZSBpZihcImxvYWRlZFwiPT09aylhLmxvYWRlZD0hMCxiKGEpO2Vsc2UgaWYoXCJhbGVydFwiPT09aylhbGVydChcIlRocmVhZCBcIitoLnRocmVhZElkK1wiOiBcIitoLnRleHQpO2Vsc2UgaWYoXCJzZXRpbW1lZGlhdGVcIj09PWgudGFyZ2V0KWEucG9zdE1lc3NhZ2UoaCk7ZWxzZSBpZihcImNhbGxIYW5kbGVyXCI9PT1rKXdbaC5oYW5kbGVyXSguLi5oLmFyZ3MpO2Vsc2UgayYmSShcIndvcmtlciBzZW50IGFuIHVua25vd24gY29tbWFuZCBcIitrKX07YS5vbmVycm9yPWg9PntJKFwid29ya2VyIHNlbnQgYW4gZXJyb3IhIFwiK2guZmlsZW5hbWUrXCI6XCIraC5saW5lbm8rXCI6IFwiK2gubWVzc2FnZSk7dGhyb3cgaDt9O0MmJihhLm9uKFwibWVzc2FnZVwiLGZ1bmN0aW9uKGgpe2Eub25tZXNzYWdlKHtkYXRhOmh9KX0pLGEub24oXCJlcnJvclwiLGZ1bmN0aW9uKGgpe2Eub25lcnJvcihoKX0pKTtcbnZhciBjPVtdLGQ9W1wib25FeGl0XCIsXCJvbkFib3J0XCIsXCJwcmludFwiLFwicHJpbnRFcnJcIl0sZztmb3IoZyBvZiBkKXcuaGFzT3duUHJvcGVydHkoZykmJmMucHVzaChnKTthLnBvc3RNZXNzYWdlKHtjbWQ6XCJsb2FkXCIsaGFuZGxlcnM6Yyx1cmxPckJsb2I6dy5tYWluU2NyaXB0VXJsT3JCbG9ifHxfc2NyaXB0RGlyLHdhc21NZW1vcnk6ZSx3YXNtTW9kdWxlOnJhfSl9KSxqYjpmdW5jdGlvbihhKXthKCl9LGViOmZ1bmN0aW9uKCl7dmFyIGE9bGEoXCJvcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanNcIik7YT1uZXcgV29ya2VyKGEpO1YuU2EucHVzaChhKX0sZ2I6ZnVuY3Rpb24oKXswPT1WLlNhLmxlbmd0aCYmKFYuZWIoKSxWLmtiKFYuU2FbMF0pKTtyZXR1cm4gVi5TYS5wb3AoKX19O3cuUFRocmVhZD1WO3ZhciBSYT1hPT57Zm9yKDswPGEubGVuZ3RoOylhLnNoaWZ0KCkodyl9O1xudy5lc3RhYmxpc2hTdGFja1NwYWNlPWZ1bmN0aW9uKCl7dmFyIGE9UGEoKSxiPXAoKVthKzUyPj4yPj4+MF07YT1wKClbYSs1Nj4+Mj4+PjBdO1NhKGIsYi1hKTtUYShiKX07ZnVuY3Rpb24gTWEoYSl7aWYoRClyZXR1cm4gVygyLDAsYSk7TmEoYSl9dmFyIFg9W10sVWE9YT0+e3ZhciBiPVhbYV07Ynx8KGE+PVgubGVuZ3RoJiYoWC5sZW5ndGg9YSsxKSxYW2FdPWI9UC5nZXQoYSkpO3JldHVybiBifTt3Lmludm9rZUVudHJ5UG9pbnQ9ZnVuY3Rpb24oYSxiKXthPVVhKGEpKGIpO1EoKT9WLllhKGEpOlZhKGEpfTtcbmZ1bmN0aW9uIFdhKGEpe3RoaXMuVmE9YS0yNDt0aGlzLmNiPWZ1bmN0aW9uKGIpe3QoKVt0aGlzLlZhKzQ+PjI+Pj4wXT1ifTt0aGlzLmJiPWZ1bmN0aW9uKGIpe3QoKVt0aGlzLlZhKzg+PjI+Pj4wXT1ifTt0aGlzLldhPWZ1bmN0aW9uKGIsYyl7dGhpcy5hYigpO3RoaXMuY2IoYik7dGhpcy5iYihjKX07dGhpcy5hYj1mdW5jdGlvbigpe3QoKVt0aGlzLlZhKzE2Pj4yPj4+MF09MH19dmFyIFhhPTAsWWE9MDtmdW5jdGlvbiBaYShhLGIsYyxkKXtyZXR1cm4gRD9XKDMsMSxhLGIsYyxkKTokYShhLGIsYyxkKX1cbmZ1bmN0aW9uICRhKGEsYixjLGQpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIpcmV0dXJuIEkoXCJDdXJyZW50IGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgU2hhcmVkQXJyYXlCdWZmZXIsIHB0aHJlYWRzIGFyZSBub3QgYXZhaWxhYmxlIVwiKSw2O3ZhciBnPVtdO2lmKEQmJjA9PT1nLmxlbmd0aClyZXR1cm4gWmEoYSxiLGMsZCk7YT17bmI6YyxPYTphLGZiOmQsdGI6Z307cmV0dXJuIEQ/KGEudmI9XCJzcGF3blRocmVhZFwiLHBvc3RNZXNzYWdlKGEsZyksMCk6SGEoYSl9ZnVuY3Rpb24gYWIoYSxiLGMpe3JldHVybiBEP1coNCwxLGEsYixjKTowfWZ1bmN0aW9uIGJiKGEsYil7aWYoRClyZXR1cm4gVyg1LDEsYSxiKX1cbnZhciBjYj1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sZGI9KGEsYixjLGQpPT57Yz4+Pj0wO2lmKCEoMDxkKSlyZXR1cm4gMDt2YXIgZz1jO2Q9YytkLTE7Zm9yKHZhciBoPTA7aDxhLmxlbmd0aDsrK2gpe3ZhciBrPWEuY2hhckNvZGVBdChoKTtpZig1NTI5Njw9ayYmNTczNDM+PWspe3ZhciBxPWEuY2hhckNvZGVBdCgrK2gpO2s9NjU1MzYrKChrJjEwMjMpPDwxMCl8cSYxMDIzfWlmKDEyNz49ayl7aWYoYz49ZClicmVhaztiW2MrKz4+PjBdPWt9ZWxzZXtpZigyMDQ3Pj1rKXtpZihjKzE+PWQpYnJlYWs7YltjKys+Pj4wXT0xOTJ8az4+Nn1lbHNle2lmKDY1NTM1Pj1rKXtpZihjKzI+PWQpYnJlYWs7YltjKys+Pj4wXT0yMjR8az4+MTJ9ZWxzZXtpZihjKzM+PWQpYnJlYWs7YltjKys+Pj4wXT0yNDB8az4+XG4xODtiW2MrKz4+PjBdPTEyOHxrPj4xMiY2M31iW2MrKz4+PjBdPTEyOHxrPj42JjYzfWJbYysrPj4+MF09MTI4fGsmNjN9fWJbYz4+PjBdPTA7cmV0dXJuIGMtZ30sZWI9KGEsYixjKT0+ZGIoYSxuKCksYixjKTtmdW5jdGlvbiBmYihhLGIpe2lmKEQpcmV0dXJuIFcoNiwxLGEsYil9ZnVuY3Rpb24gZ2IoYSxiLGMpe2lmKEQpcmV0dXJuIFcoNywxLGEsYixjKX1mdW5jdGlvbiBoYihhLGIsYyl7cmV0dXJuIEQ/Vyg4LDEsYSxiLGMpOjB9ZnVuY3Rpb24gaWIoYSxiKXtpZihEKXJldHVybiBXKDksMSxhLGIpfWZ1bmN0aW9uIGpiKGEsYixjKXtpZihEKXJldHVybiBXKDEwLDEsYSxiLGMpfWZ1bmN0aW9uIGtiKGEsYixjLGQpe2lmKEQpcmV0dXJuIFcoMTEsMSxhLGIsYyxkKX1mdW5jdGlvbiBsYihhLGIsYyxkKXtpZihEKXJldHVybiBXKDEyLDEsYSxiLGMsZCl9ZnVuY3Rpb24gbWIoYSxiLGMsZCl7aWYoRClyZXR1cm4gVygxMywxLGEsYixjLGQpfVxuZnVuY3Rpb24gbmIoYSl7aWYoRClyZXR1cm4gVygxNCwxLGEpfWZ1bmN0aW9uIG9iKGEsYil7aWYoRClyZXR1cm4gVygxNSwxLGEsYil9ZnVuY3Rpb24gcGIoYSxiLGMpe2lmKEQpcmV0dXJuIFcoMTYsMSxhLGIsYyl9dmFyIHFiPWE9PntpZighTSl0cnl7aWYoYSgpLCFRKCkpdHJ5e0Q/VmEoTik6TmEoTil9Y2F0Y2goYil7YiBpbnN0YW5jZW9mIEVhfHxcInVud2luZFwiPT1ifHx6KDEsYil9fWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBFYXx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX07ZnVuY3Rpb24gcmIoYSl7YT4+Pj0wO1wiZnVuY3Rpb25cIj09PXR5cGVvZiBBdG9taWNzLnViJiYoQXRvbWljcy51YihwKCksYT4+MixhKS52YWx1ZS50aGVuKFFhKSxhKz0xMjgsQXRvbWljcy5zdG9yZShwKCksYT4+MiwxKSl9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQ9cmI7ZnVuY3Rpb24gUWEoKXt2YXIgYT1QYSgpO2EmJihyYihhKSxxYigoKT0+c2IoKSkpfXcuY2hlY2tNYWlsYm94PVFhO1xudmFyIFk9YT0+MD09PWElNCYmKDAhPT1hJTEwMHx8MD09PWElNDAwKSx0Yj1bMCwzMSw2MCw5MSwxMjEsMTUyLDE4MiwyMTMsMjQ0LDI3NCwzMDUsMzM1XSx1Yj1bMCwzMSw1OSw5MCwxMjAsMTUxLDE4MSwyMTIsMjQzLDI3MywzMDQsMzM0XTtmdW5jdGlvbiB2YihhLGIsYyxkLGcsaCxrLHEpe3JldHVybiBEP1coMTcsMSxhLGIsYyxkLGcsaCxrLHEpOi01Mn1mdW5jdGlvbiB3YihhLGIsYyxkLGcsaCxrKXtpZihEKXJldHVybiBXKDE4LDEsYSxiLGMsZCxnLGgsayl9dmFyIHliPWE9Pnt2YXIgYj1jYihhKSsxLGM9eGIoYik7YyYmZWIoYSxjLGIpO3JldHVybiBjfSxBYj1hPT57dmFyIGI9emIoKTthPWEoKTtUYShiKTtyZXR1cm4gYX07XG5mdW5jdGlvbiBXKGEsYil7dmFyIGM9YXJndW1lbnRzLmxlbmd0aC0yLGQ9YXJndW1lbnRzO3JldHVybiBBYigoKT0+e2Zvcih2YXIgZz1CYig4KmMpLGg9Zz4+MyxrPTA7azxjO2srKyl7dmFyIHE9ZFsyK2tdO2VhKClbaCtrPj4+MF09cX1yZXR1cm4gQ2IoYSxjLGcsYil9KX1cbnZhciBEYj1bXSxFYj17fSxHYj0oKT0+e2lmKCFGYil7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86amF8fFwiLi90aGlzLnByb2dyYW1cIn0sYjtmb3IoYiBpbiBFYil2b2lkIDA9PT1FYltiXT9kZWxldGUgYVtiXTphW2JdPUViW2JdO3ZhciBjPVtdO2ZvcihiIGluIGEpYy5wdXNoKGAke2J9PSR7YVtiXX1gKTtGYj1jfXJldHVybiBGYn0sRmI7XG5mdW5jdGlvbiBIYihhLGIpe2lmKEQpcmV0dXJuIFcoMTksMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9MDtHYigpLmZvckVhY2goZnVuY3Rpb24oZCxnKXt2YXIgaD1iK2M7Zz10KClbYSs0Kmc+PjI+Pj4wXT1oO2ZvcihoPTA7aDxkLmxlbmd0aDsrK2gpYWEoKVtnKys+PjA+Pj4wXT1kLmNoYXJDb2RlQXQoaCk7YWEoKVtnPj4wPj4+MF09MDtjKz1kLmxlbmd0aCsxfSk7cmV0dXJuIDB9ZnVuY3Rpb24gSWIoYSxiKXtpZihEKXJldHVybiBXKDIwLDEsYSxiKTthPj4+PTA7Yj4+Pj0wO3ZhciBjPUdiKCk7dCgpW2E+PjI+Pj4wXT1jLmxlbmd0aDt2YXIgZD0wO2MuZm9yRWFjaChmdW5jdGlvbihnKXtkKz1nLmxlbmd0aCsxfSk7dCgpW2I+PjI+Pj4wXT1kO3JldHVybiAwfWZ1bmN0aW9uIEpiKGEpe3JldHVybiBEP1coMjEsMSxhKTo1Mn1mdW5jdGlvbiBOYihhLGIsYyxkKXtyZXR1cm4gRD9XKDIyLDEsYSxiLGMsZCk6NTJ9XG5mdW5jdGlvbiBPYihhLGIsYyxkLGcpe3JldHVybiBEP1coMjMsMSxhLGIsYyxkLGcpOjcwfXZhciBQYj1bbnVsbCxbXSxbXV07ZnVuY3Rpb24gUWIoYSxiLGMsZCl7aWYoRClyZXR1cm4gVygyNCwxLGEsYixjLGQpO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2Zvcih2YXIgZz0wLGg9MDtoPGM7aCsrKXt2YXIgaz10KClbYj4+Mj4+PjBdLHE9dCgpW2IrND4+Mj4+PjBdO2IrPTg7Zm9yKHZhciBCPTA7QjxxO0IrKyl7dmFyIHY9bigpW2srQj4+PjBdLHk9UGJbYV07MD09PXZ8fDEwPT09dj8oKDE9PT1hP3FhOkkpKEphKHksMCkpLHkubGVuZ3RoPTApOnkucHVzaCh2KX1nKz1xfXQoKVtkPj4yPj4+MF09ZztyZXR1cm4gMH12YXIgUmI9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXSxTYj1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO2Z1bmN0aW9uIFRiKGEpe3ZhciBiPUFycmF5KGNiKGEpKzEpO2RiKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbnZhciBVYj0oYSxiKT0+e2FhKCkuc2V0KGEsYj4+PjApfTtcbmZ1bmN0aW9uIFZiKGEsYixjLGQpe2Z1bmN0aW9uIGcoZixyLHUpe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPHI7KWY9dVswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixyKXtyZXR1cm4gZyhmLHIsXCIwXCIpfWZ1bmN0aW9uIGsoZixyKXtmdW5jdGlvbiB1KEtiKXtyZXR1cm4gMD5LYj8tMTowPEtiPzE6MH12YXIgSDswPT09KEg9dShmLmdldEZ1bGxZZWFyKCktci5nZXRGdWxsWWVhcigpKSkmJjA9PT0oSD11KGYuZ2V0TW9udGgoKS1yLmdldE1vbnRoKCkpKSYmKEg9dShmLmdldERhdGUoKS1yLmdldERhdGUoKSkpO3JldHVybiBIfWZ1bmN0aW9uIHEoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBCKGYpe3ZhciByPWYuUWE7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuUmErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8cjspe3ZhciB1PWYuZ2V0TW9udGgoKSxIPShZKGYuZ2V0RnVsbFllYXIoKSk/UmI6U2IpW3VdO2lmKHI+SC1mLmdldERhdGUoKSlyLT1ILWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnU/Zi5zZXRNb250aCh1KzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStyKTticmVha319dT1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3I9cShuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt1PXEodSk7cmV0dXJuIDA+PWsocixmKT8wPj1rKHUsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgdj1wKClbZCs0MD4+Mj4+PjBdO2Q9e3JiOnAoKVtkPj4yPj4+MF0scWI6cCgpW2QrND4+Mj4+PjBdLFRhOnAoKVtkKzg+PjI+Pj4wXSxYYTpwKClbZCsxMj4+Mj4+PjBdLFVhOnAoKVtkKzE2Pj4yPj4+MF0sUmE6cCgpW2QrMjA+PjI+Pj4wXSxOYTpwKClbZCsyND4+Mj4+PjBdLFFhOnAoKVtkKzI4Pj4yPj4+MF0semI6cCgpW2QrMzI+PjI+Pj4wXSxwYjpwKClbZCszNj4+Mj4+PjBdLHNiOnY/S2Eodik6XCJcIn07Yz1LYShjKTt2PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXG5cIiVYXCI6XCIlSDolTTolU1wiLFwiJUVjXCI6XCIlY1wiLFwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHkgaW4gdiljPWMucmVwbGFjZShuZXcgUmVnRXhwKHksXCJnXCIpLHZbeV0pO3ZhciBMYj1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLE1iPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt2PXtcIiVhXCI6Zj0+TGJbZi5OYV0uc3Vic3RyaW5nKDAsMyksXG5cIiVBXCI6Zj0+TGJbZi5OYV0sXCIlYlwiOmY9Pk1iW2YuVWFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT5NYltmLlVhXSxcIiVDXCI6Zj0+aCgoZi5SYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6Zj0+aChmLlhhLDIpLFwiJWVcIjpmPT5nKGYuWGEsMixcIiBcIiksXCIlZ1wiOmY9PkIoZikudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOmY9PkIoZiksXCIlSFwiOmY9PmgoZi5UYSwyKSxcIiVJXCI6Zj0+e2Y9Zi5UYTswPT1mP2Y9MTI6MTI8ZiYmKGYtPTEyKTtyZXR1cm4gaChmLDIpfSxcIiVqXCI6Zj0+e2Zvcih2YXIgcj0wLHU9MDt1PD1mLlVhLTE7cis9KFkoZi5SYSsxOTAwKT9SYjpTYilbdSsrXSk7cmV0dXJuIGgoZi5YYStyLDMpfSxcIiVtXCI6Zj0+aChmLlVhKzEsMiksXCIlTVwiOmY9PmgoZi5xYiwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmY9PjA8PWYuVGEmJjEyPmYuVGE/XCJBTVwiOlwiUE1cIixcIiVTXCI6Zj0+aChmLnJiLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6Zj0+Zi5OYXx8NyxcIiVVXCI6Zj0+aChNYXRoLmZsb29yKChmLlFhK1xuNy1mLk5hKS83KSwyKSxcIiVWXCI6Zj0+e3ZhciByPU1hdGguZmxvb3IoKGYuUWErNy0oZi5OYSs2KSU3KS83KTsyPj0oZi5OYSszNzEtZi5RYS0yKSU3JiZyKys7aWYocik1Mz09ciYmKHU9KGYuTmErMzcxLWYuUWEpJTcsND09dXx8Mz09dSYmWShmLlJhKXx8KHI9MSkpO2Vsc2V7cj01Mjt2YXIgdT0oZi5OYSs3LWYuUWEtMSklNzsoND09dXx8NT09dSYmWShmLlJhJTQwMC0xKSkmJnIrK31yZXR1cm4gaChyLDIpfSxcIiV3XCI6Zj0+Zi5OYSxcIiVXXCI6Zj0+aChNYXRoLmZsb29yKChmLlFhKzctKGYuTmErNiklNykvNyksMiksXCIleVwiOmY9PihmLlJhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjpmPT5mLlJhKzE5MDAsXCIlelwiOmY9PntmPWYucGI7dmFyIHI9MDw9ZjtmPU1hdGguYWJzKGYpLzYwO3JldHVybihyP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGYvNjAqMTAwK2YlNjApKS5zbGljZSgtNCl9LFwiJVpcIjpmPT5mLnNiLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFxuXCJcXHgwMFxceDAwXCIpO2Zvcih5IGluIHYpYy5pbmNsdWRlcyh5KSYmKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeSxcImdcIiksdlt5XShkKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7eT1UYihjKTtpZih5Lmxlbmd0aD5iKXJldHVybiAwO1ViKHksYSk7cmV0dXJuIHkubGVuZ3RoLTF9dmFyIFo9dm9pZCAwLFdiPVtdO1xuZnVuY3Rpb24gWGIoYSxiKXtpZighWil7Wj1uZXcgV2Vha01hcDt2YXIgYz1QLmxlbmd0aDtpZihaKWZvcih2YXIgZD0wO2Q8MCtjO2QrKyl7dmFyIGc9VWEoZCk7ZyYmWi5zZXQoZyxkKX19aWYoYz1aLmdldChhKXx8MClyZXR1cm4gYztpZihXYi5sZW5ndGgpYz1XYi5wb3AoKTtlbHNle3RyeXtQLmdyb3coMSl9Y2F0Y2gocSl7aWYoIShxIGluc3RhbmNlb2YgUmFuZ2VFcnJvcikpdGhyb3cgcTt0aHJvd1wiVW5hYmxlIHRvIGdyb3cgd2FzbSB0YWJsZS4gU2V0IEFMTE9XX1RBQkxFX0dST1dUSC5cIjt9Yz1QLmxlbmd0aC0xfXRyeXtkPWMsUC5zZXQoZCxhKSxYW2RdPVAuZ2V0KGQpfWNhdGNoKHEpe2lmKCEocSBpbnN0YW5jZW9mIFR5cGVFcnJvcikpdGhyb3cgcTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBXZWJBc3NlbWJseS5GdW5jdGlvbil7ZD1XZWJBc3NlbWJseS5GdW5jdGlvbjtnPXtpOlwiaTMyXCIsajpcImk2NFwiLGY6XCJmMzJcIixkOlwiZjY0XCIscDpcImkzMlwifTtmb3IodmFyIGg9e3BhcmFtZXRlcnM6W10sXG5yZXN1bHRzOlwidlwiPT1iWzBdP1tdOltnW2JbMF1dXX0saz0xO2s8Yi5sZW5ndGg7KytrKWgucGFyYW1ldGVycy5wdXNoKGdbYltrXV0pO2I9bmV3IGQoaCxhKX1lbHNle2Q9WzFdO2c9Yi5zbGljZSgwLDEpO2I9Yi5zbGljZSgxKTtoPXtpOjEyNyxwOjEyNyxqOjEyNixmOjEyNSxkOjEyNH07ZC5wdXNoKDk2KTtrPWIubGVuZ3RoOzEyOD5rP2QucHVzaChrKTpkLnB1c2goayUxMjh8MTI4LGs+PjcpO2ZvcihrPTA7azxiLmxlbmd0aDsrK2spZC5wdXNoKGhbYltrXV0pO1widlwiPT1nP2QucHVzaCgwKTpkLnB1c2goMSxoW2ddKTtiPVswLDk3LDExNSwxMDksMSwwLDAsMCwxXTtnPWQubGVuZ3RoOzEyOD5nP2IucHVzaChnKTpiLnB1c2goZyUxMjh8MTI4LGc+PjcpO2IucHVzaC5hcHBseShiLGQpO2IucHVzaCgyLDcsMSwxLDEwMSwxLDEwMiwwLDAsNyw1LDEsMSwxMDIsMCwwKTtiPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUobmV3IFVpbnQ4QXJyYXkoYikpO2I9KG5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShiLFxue2U6e2Y6YX19KSkuZXhwb3J0cy5mfWQ9YztQLnNldChkLGIpO1hbZF09UC5nZXQoZCl9Wi5zZXQoYSxjKTtyZXR1cm4gY31WLldhKCk7XG52YXIgWWI9W251bGwsTGEsTWEsWmEsYWIsYmIsZmIsZ2IsaGIsaWIsamIsa2IsbGIsbWIsbmIsb2IscGIsdmIsd2IsSGIsSWIsSmIsTmIsT2IsUWJdLGFjPXtiOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBXYShhKSkuV2EoYj4+PjAsYz4+PjApO1hhPWE7WWErKzt0aHJvdyBYYTt9LE46ZnVuY3Rpb24oYSl7WmIoYT4+PjAsIUEsMSwha2EsMTMxMDcyLCExKTtWLlphKCl9LGs6ZnVuY3Rpb24oYSl7YT4+Pj0wO0Q/cG9zdE1lc3NhZ2Uoe2NtZDpcImNsZWFudXBUaHJlYWRcIix0aHJlYWQ6YX0pOkdhKGEpfSxJOiRhLGg6YWIsVDpiYixEOmZiLEY6Z2IsVTpoYixSOmliLEo6amIsUTprYixvOmxiLEU6bWIsQjpuYixTOm9iLEM6cGIscTooKT0+ITAsejpmdW5jdGlvbihhLGIpe2E+Pj49MDthPT1iPj4+MD9zZXRUaW1lb3V0KCgpPT5RYSgpKTpEP3Bvc3RNZXNzYWdlKHt0YXJnZXRUaHJlYWQ6YSxjbWQ6XCJjaGVja01haWxib3hcIn0pOihhPVYuTWFbYV0pJiZhLnBvc3RNZXNzYWdlKHtjbWQ6XCJjaGVja01haWxib3hcIn0pfSxcbkw6ZnVuY3Rpb24oKXtyZXR1cm4tMX0sTTpyYixwOmZ1bmN0aW9uKGEpe0MmJlYuTWFbYT4+PjBdLnJlZigpfSx0OmZ1bmN0aW9uKGEsYixjKXthPWIrMjA5NzE1Mj4+PjA8NDE5NDMwNS0hIWE/KGE+Pj4wKSs0Mjk0OTY3Mjk2KmI6TmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtwKClbYz4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO3AoKVtjKzQ+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTtwKClbYys4Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO3AoKVtjKzEyPj4yPj4+MF09YS5nZXRVVENEYXRlKCk7cCgpW2MrMTY+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7cCgpW2MrMjA+PjI+Pj4wXT1hLmdldFVUQ0Z1bGxZZWFyKCktMTkwMDtwKClbYysyND4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7YT0oYS5nZXRUaW1lKCktRGF0ZS5VVEMoYS5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0RTV8MDtwKClbYysyOD4+Mj4+PjBdPWF9LHU6ZnVuY3Rpb24oYSxiLGMpe2E9YitcbjIwOTcxNTI+Pj4wPDQxOTQzMDUtISFhPyhhPj4+MCkrNDI5NDk2NzI5NipiOk5hTjtjPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7cCgpW2M+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTtwKClbYys0Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7cCgpW2MrOD4+Mj4+PjBdPWEuZ2V0SG91cnMoKTtwKClbYysxMj4+Mj4+PjBdPWEuZ2V0RGF0ZSgpO3AoKVtjKzE2Pj4yPj4+MF09YS5nZXRNb250aCgpO3AoKVtjKzIwPj4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7cCgpW2MrMjQ+PjI+Pj4wXT1hLmdldERheSgpO2I9KFkoYS5nZXRGdWxsWWVhcigpKT90Yjp1YilbYS5nZXRNb250aCgpXSthLmdldERhdGUoKS0xfDA7cCgpW2MrMjg+PjI+Pj4wXT1iO3AoKVtjKzM2Pj4yPj4+MF09LSg2MCphLmdldFRpbWV6b25lT2Zmc2V0KCkpO2I9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBkPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbmE9KGIhPWQmJmEuZ2V0VGltZXpvbmVPZmZzZXQoKT09TWF0aC5taW4oZCxiKSl8MDtwKClbYyszMj4+Mj4+PjBdPWF9LHY6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKHAoKVthKzIwPj4yPj4+MF0rMTkwMCxwKClbYSsxNj4+Mj4+PjBdLHAoKVthKzEyPj4yPj4+MF0scCgpW2ErOD4+Mj4+PjBdLHAoKVthKzQ+PjI+Pj4wXSxwKClbYT4+Mj4+PjBdLDApLGM9cCgpW2ErMzI+PjI+Pj4wXSxkPWIuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxoPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxrPU1hdGgubWluKGgsZyk7MD5jP3AoKVthKzMyPj4yPj4+MF09TnVtYmVyKGchPWgmJms9PWQpOjA8YyE9KGs9PWQpJiYoZz1NYXRoLm1heChoLGcpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/azpnKS1kKSkpO3AoKVthKzI0Pj4yPj4+XG4wXT1iLmdldERheSgpO2M9KFkoYi5nZXRGdWxsWWVhcigpKT90Yjp1YilbYi5nZXRNb250aCgpXStiLmdldERhdGUoKS0xfDA7cCgpW2ErMjg+PjI+Pj4wXT1jO3AoKVthPj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7cCgpW2ErND4+Mj4+PjBdPWIuZ2V0TWludXRlcygpO3AoKVthKzg+PjI+Pj4wXT1iLmdldEhvdXJzKCk7cCgpW2ErMTI+PjI+Pj4wXT1iLmdldERhdGUoKTtwKClbYSsxNj4+Mj4+PjBdPWIuZ2V0TW9udGgoKTtwKClbYSsyMD4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCkvMUUzO3JldHVybiAkYigoVT1hLDE8PStNYXRoLmFicyhVKT8wPFU/K01hdGguZmxvb3IoVS80Mjk0OTY3Mjk2KT4+PjA6fn4rTWF0aC5jZWlsKChVLSsofn5VPj4+MCkpLzQyOTQ5NjcyOTYpPj4+MDowKSksYT4+PjB9LHI6dmIsczp3Yix5OmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKHYpe3JldHVybih2PXYudG9UaW1lU3RyaW5nKCkubWF0Y2goL1xcKChbQS1aYS16IF0rKVxcKSQvKSk/XG52WzFdOlwiR01UXCJ9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7dmFyIGc9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGg9bmV3IERhdGUoZywwLDEpLGs9bmV3IERhdGUoZyw2LDEpO2c9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBxPWsuZ2V0VGltZXpvbmVPZmZzZXQoKSxCPU1hdGgubWF4KGcscSk7dCgpW2E+PjI+Pj4wXT02MCpCO3AoKVtiPj4yPj4+MF09TnVtYmVyKGchPXEpO2E9ZChoKTtiPWQoayk7YT15YihhKTtiPXliKGIpO3E8Zz8odCgpW2M+PjI+Pj4wXT1hLHQoKVtjKzQ+PjI+Pj4wXT1iKToodCgpW2M+PjI+Pj4wXT1iLHQoKVtjKzQ+PjI+Pj4wXT1hKX0sYzooKT0+e0soXCJcIil9LGw6ZnVuY3Rpb24oKXt9LGk6ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX0sVjooKT0+e3ZhKz0xO3Rocm93XCJ1bndpbmRcIjt9LEE6ZnVuY3Rpb24oKXtyZXR1cm4gNDI5NDkwMTc2MH0sZTooKT0+cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKSxmOmZ1bmN0aW9uKCl7cmV0dXJuIEM/XG5yZXF1aXJlKFwib3NcIikuY3B1cygpLmxlbmd0aDpuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeX0sSzpmdW5jdGlvbihhLGIsYyxkKXtWLndiPWI+Pj4wO0RiLmxlbmd0aD1jO2I9ZD4+PjA+PjM7Zm9yKGQ9MDtkPGM7ZCsrKURiW2RdPWVhKClbYitkPj4+MF07cmV0dXJuIFliW2FdLmFwcGx5KG51bGwsRGIpfSx4OmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uKCkubGVuZ3RoO2lmKGE8PWJ8fDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBkPWIqKDErLjIvYyk7ZD1NYXRoLm1pbihkLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2Q9TWF0aC5tYXgoYSxkKTthOntnPWcubWluLmNhbGwoZyw0Mjk0OTAxNzYwLGQrKDY1NTM2LWQlNjU1MzYpJTY1NTM2KS1lLmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1Pj4+MTY7dHJ5e2UuZ3JvdyhnKTttKCk7dmFyIGg9MTticmVhayBhfWNhdGNoKGspe31oPXZvaWQgMH1pZihoKXJldHVybiEwfXJldHVybiExfSxcbk86SGIsUDpJYixIOk5hLGc6SmIsbjpOYix3Ok9iLG06UWIsYTplfHx3Lndhc21NZW1vcnksRzpWYixkOmZ1bmN0aW9uKGEsYixjLGQpe3JldHVybiBWYihhPj4+MCxiPj4+MCxjPj4+MCxkPj4+MCl9LGo6ZnVuY3Rpb24oYSxiLGMsZCl7Y29uc3QgZz1QLmxlbmd0aDthPW5ldyBVaW50OEFycmF5KG4oKS5zbGljZShhK2IsYStjKSk7dHJ5e3ZhciBoPW5ldyBXZWJBc3NlbWJseS5Nb2R1bGUoYSksaz1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UoaCx7ZW52OnttZW1vcnk6ZX19KSxxO2ZvcihxIGluIGsuZXhwb3J0cylYYihrLmV4cG9ydHNbcV0pO3JldHVybiBnPFAubGVuZ3RoP2c6ZH1jYXRjaChCKXtyZXR1cm4gY29uc29sZS5sb2coQiksZH19fTtcbihmdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyxkKXtjPWMuZXhwb3J0cztMPWM9YmMoYyk7Vi4kYS5wdXNoKEwuemEpO1A9TC5BYTt0YS51bnNoaWZ0KEwuVyk7cmE9ZDt5YSgpO3JldHVybiBjfXZhciBiPXthOmFjfTt4YSgpO2lmKHcuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gdy5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtJKFwiTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogXCIrYykseChjKX1EYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSxjLm1vZHVsZSl9KS5jYXRjaCh4KTtyZXR1cm57fX0pKCk7dy5fT3J0SW5pdD0oYSxiKT0+KHcuX09ydEluaXQ9TC5YKShhLGIpO3cuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KHcuX09ydEdldExhc3RFcnJvcj1MLlkpKGEsYik7XG53Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxnLGgsayxxLEIsdik9Pih3Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1MLlopKGEsYixjLGQsZyxoLGsscSxCLHYpO3cuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4ody5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9TC5fKShhLGIpO3cuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4ody5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPUwuJCkoYSxiLGMpO3cuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT0oYSxiLGMpPT4ody5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PUwuYWEpKGEsYixjKTt3Ll9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9YT0+KHcuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1MLmJhKShhKTt3Ll9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9Pih3Ll9PcnRDcmVhdGVTZXNzaW9uPUwuY2EpKGEsYixjKTtcbncuX09ydFJlbGVhc2VTZXNzaW9uPWE9Pih3Ll9PcnRSZWxlYXNlU2Vzc2lvbj1MLmRhKShhKTt3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PShhLGIsYyk9Pih3Ll9PcnRHZXRJbnB1dE91dHB1dENvdW50PUwuZWEpKGEsYixjKTt3Ll9PcnRHZXRJbnB1dE5hbWU9KGEsYik9Pih3Ll9PcnRHZXRJbnB1dE5hbWU9TC5mYSkoYSxiKTt3Ll9PcnRHZXRPdXRwdXROYW1lPShhLGIpPT4ody5fT3J0R2V0T3V0cHV0TmFtZT1MLmdhKShhLGIpO3cuX09ydEZyZWU9YT0+KHcuX09ydEZyZWU9TC5oYSkoYSk7dy5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxkLGcsaCk9Pih3Ll9PcnRDcmVhdGVUZW5zb3I9TC5pYSkoYSxiLGMsZCxnLGgpO3cuX09ydEdldFRlbnNvckRhdGE9KGEsYixjLGQsZyk9Pih3Ll9PcnRHZXRUZW5zb3JEYXRhPUwuamEpKGEsYixjLGQsZyk7dy5fT3J0UmVsZWFzZVRlbnNvcj1hPT4ody5fT3J0UmVsZWFzZVRlbnNvcj1MLmthKShhKTtcbncuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGQpPT4ody5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1MLmxhKShhLGIsYyxkKTt3Ll9PcnRBZGRSdW5Db25maWdFbnRyeT0oYSxiLGMpPT4ody5fT3J0QWRkUnVuQ29uZmlnRW50cnk9TC5tYSkoYSxiLGMpO3cuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9Pih3Ll9PcnRSZWxlYXNlUnVuT3B0aW9ucz1MLm5hKShhKTt3Ll9PcnRDcmVhdGVCaW5kaW5nPWE9Pih3Ll9PcnRDcmVhdGVCaW5kaW5nPUwub2EpKGEpO3cuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4ody5fT3J0QmluZElucHV0PUwucGEpKGEsYixjKTt3Ll9PcnRCaW5kT3V0cHV0PShhLGIsYyxkKT0+KHcuX09ydEJpbmRPdXRwdXQ9TC5xYSkoYSxiLGMsZCk7dy5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KHcuX09ydENsZWFyQm91bmRPdXRwdXRzPUwucmEpKGEpO3cuX09ydFJlbGVhc2VCaW5kaW5nPWE9Pih3Ll9PcnRSZWxlYXNlQmluZGluZz1MLnNhKShhKTtcbncuX09ydFJ1bldpdGhCaW5kaW5nPShhLGIsYyxkLGcpPT4ody5fT3J0UnVuV2l0aEJpbmRpbmc9TC50YSkoYSxiLGMsZCxnKTt3Ll9PcnRSdW49KGEsYixjLGQsZyxoLGsscSk9Pih3Ll9PcnRSdW49TC51YSkoYSxiLGMsZCxnLGgsayxxKTt3Ll9PcnRFbmRQcm9maWxpbmc9YT0+KHcuX09ydEVuZFByb2ZpbGluZz1MLnZhKShhKTt2YXIgUGE9dy5fcHRocmVhZF9zZWxmPSgpPT4oUGE9dy5fcHRocmVhZF9zZWxmPUwud2EpKCkseGI9dy5fbWFsbG9jPWE9Pih4Yj13Ll9tYWxsb2M9TC54YSkoYSk7dy5fZnJlZT1hPT4ody5fZnJlZT1MLnlhKShhKTt3Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD0oKT0+KHcuX19lbXNjcmlwdGVuX3Rsc19pbml0PUwuemEpKCk7dmFyIFpiPXcuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PShhLGIsYyxkLGcsaCk9PihaYj13Ll9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdD1MLkJhKShhLGIsYyxkLGcsaCk7XG53Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD0oKT0+KHcuX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPUwuQ2EpKCk7dmFyIENiPShhLGIsYyxkKT0+KENiPUwuRGEpKGEsYixjLGQpLE9hPWE9PihPYT1MLkVhKShhKSxWYT13Ll9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1hPT4oVmE9dy5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9TC5GYSkoYSksc2I9dy5fX2Vtc2NyaXB0ZW5fY2hlY2tfbWFpbGJveD0oKT0+KHNiPXcuX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9TC5HYSkoKSwkYj1hPT4oJGI9TC5IYSkoYSksU2E9KGEsYik9PihTYT1MLklhKShhLGIpLHpiPSgpPT4oemI9TC5KYSkoKSxUYT1hPT4oVGE9TC5LYSkoYSksQmI9YT0+KEJiPUwuTGEpKGEpO3cuX19fc3RhcnRfZW1fanM9OTA2MzE2O3cuX19fc3RvcF9lbV9qcz05MDY5Mjg7XG5mdW5jdGlvbiBiYyhhKXthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5nPT5kKGcpPj4+MDthLl9fZXJybm9fbG9jYXRpb249YihhLl9fZXJybm9fbG9jYXRpb24pO2EucHRocmVhZF9zZWxmPWIoYS5wdGhyZWFkX3NlbGYpO2EubWFsbG9jPWMoYS5tYWxsb2MpO2Euc3RhY2tTYXZlPWIoYS5zdGFja1NhdmUpO2Euc3RhY2tBbGxvYz1jKGEuc3RhY2tBbGxvYyk7cmV0dXJuIGF9dy5rZWVwUnVudGltZUFsaXZlPVE7dy53YXNtTWVtb3J5PWU7dy5zdGFja0FsbG9jPUJiO3cuc3RhY2tTYXZlPXpiO3cuc3RhY2tSZXN0b3JlPVRhO3cuYWRkRnVuY3Rpb249WGI7dy5VVEY4VG9TdHJpbmc9S2E7dy5zdHJpbmdUb1VURjg9ZWI7dy5sZW5ndGhCeXRlc1VURjg9Y2I7dy5FeGl0U3RhdHVzPUVhO3cuUFRocmVhZD1WO3ZhciBjYztTPWZ1bmN0aW9uIGRjKCl7Y2N8fGVjKCk7Y2N8fChTPWRjKX07XG5mdW5jdGlvbiBlYygpe2Z1bmN0aW9uIGEoKXtpZighY2MmJihjYz0hMCx3LmNhbGxlZFJ1bj0hMCwhTSkpe0R8fFJhKHRhKTtoYSh3KTtpZih3Lm9uUnVudGltZUluaXRpYWxpemVkKXcub25SdW50aW1lSW5pdGlhbGl6ZWQoKTtpZighRCl7aWYody5wb3N0UnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiB3LnBvc3RSdW4mJih3LnBvc3RSdW49W3cucG9zdFJ1bl0pO3cucG9zdFJ1bi5sZW5ndGg7KXt2YXIgYj13LnBvc3RSdW4uc2hpZnQoKTt1YS51bnNoaWZ0KGIpfVJhKHVhKX19fWlmKCEoMDxSKSlpZihEKWhhKHcpLER8fFJhKHRhKSxzdGFydFdvcmtlcih3KTtlbHNle2lmKHcucHJlUnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiB3LnByZVJ1biYmKHcucHJlUnVuPVt3LnByZVJ1bl0pO3cucHJlUnVuLmxlbmd0aDspc2EudW5zaGlmdCh3LnByZVJ1bi5zaGlmdCgpKTtSYShzYSk7MDxSfHwody5zZXRTdGF0dXM/KHcuc2V0U3RhdHVzKFwiUnVubmluZy4uLlwiKSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe3cuc2V0U3RhdHVzKFwiXCIpfSxcbjEpO2EoKX0sMSkpOmEoKSl9fWlmKHcucHJlSW5pdClmb3IoXCJmdW5jdGlvblwiPT10eXBlb2Ygdy5wcmVJbml0JiYody5wcmVJbml0PVt3LnByZUluaXRdKTswPHcucHJlSW5pdC5sZW5ndGg7KXcucHJlSW5pdC5wb3AoKSgpO2VjKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG5cbik7XG59KSgpO1xuaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JylcbiAgbW9kdWxlLmV4cG9ydHMgPSBvcnRXYXNtVGhyZWFkZWQ7XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbVRocmVhZGVkKTtcbiIsICJcInVzZSBzdHJpY3RcIjt2YXIgTW9kdWxlPXt9O3ZhciBFTlZJUk9OTUVOVF9JU19OT0RFPXR5cGVvZiBwcm9jZXNzPT1cIm9iamVjdFwiJiZ0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZT09XCJzdHJpbmdcIjtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXt2YXIgbm9kZVdvcmtlclRocmVhZHM9cmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpO3ZhciBwYXJlbnRQb3J0PW5vZGVXb3JrZXJUaHJlYWRzLnBhcmVudFBvcnQ7cGFyZW50UG9ydC5vbihcIm1lc3NhZ2VcIixkYXRhPT5vbm1lc3NhZ2Uoe2RhdGE6ZGF0YX0pKTt2YXIgZnM9cmVxdWlyZShcImZzXCIpO09iamVjdC5hc3NpZ24oZ2xvYmFsLHtzZWxmOmdsb2JhbCxyZXF1aXJlOnJlcXVpcmUsTW9kdWxlOk1vZHVsZSxsb2NhdGlvbjp7aHJlZjpfX2ZpbGVuYW1lfSxXb3JrZXI6bm9kZVdvcmtlclRocmVhZHMuV29ya2VyLGltcG9ydFNjcmlwdHM6Zj0+KDAsZXZhbCkoZnMucmVhZEZpbGVTeW5jKGYsXCJ1dGY4XCIpK1wiLy8jIHNvdXJjZVVSTD1cIitmKSxwb3N0TWVzc2FnZTptc2c9PnBhcmVudFBvcnQucG9zdE1lc3NhZ2UobXNnKSxwZXJmb3JtYW5jZTpnbG9iYWwucGVyZm9ybWFuY2V8fHtub3c6RGF0ZS5ub3d9fSl9dmFyIGluaXRpYWxpemVkSlM9ZmFsc2U7ZnVuY3Rpb24gdGhyZWFkUHJpbnRFcnIoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO2lmKEVOVklST05NRU5UX0lTX05PREUpe2ZzLndyaXRlU3luYygyLHRleHQrXCJcXG5cIik7cmV0dXJufWNvbnNvbGUuZXJyb3IodGV4dCl9ZnVuY3Rpb24gdGhyZWFkQWxlcnQoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO3Bvc3RNZXNzYWdlKHtjbWQ6XCJhbGVydFwiLHRleHQ6dGV4dCx0aHJlYWRJZDpNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCl9KX12YXIgZXJyPXRocmVhZFByaW50RXJyO3NlbGYuYWxlcnQ9dGhyZWFkQWxlcnQ7TW9kdWxlW1wiaW5zdGFudGlhdGVXYXNtXCJdPShpbmZvLHJlY2VpdmVJbnN0YW5jZSk9Pnt2YXIgbW9kdWxlPU1vZHVsZVtcIndhc21Nb2R1bGVcIl07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1udWxsO3ZhciBpbnN0YW5jZT1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobW9kdWxlLGluZm8pO3JldHVybiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UpfTtzZWxmLm9udW5oYW5kbGVkcmVqZWN0aW9uPWU9Pnt0aHJvdyBlLnJlYXNvbj8/ZX07ZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShlKXt0cnl7aWYoZS5kYXRhLmNtZD09PVwibG9hZFwiKXtsZXQgbWVzc2FnZVF1ZXVlPVtdO3NlbGYub25tZXNzYWdlPWU9Pm1lc3NhZ2VRdWV1ZS5wdXNoKGUpO3NlbGYuc3RhcnRXb3JrZXI9aW5zdGFuY2U9PntNb2R1bGU9aW5zdGFuY2U7cG9zdE1lc3NhZ2Uoe1wiY21kXCI6XCJsb2FkZWRcIn0pO2ZvcihsZXQgbXNnIG9mIG1lc3NhZ2VRdWV1ZSl7aGFuZGxlTWVzc2FnZShtc2cpfXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2V9O01vZHVsZVtcIndhc21Nb2R1bGVcIl09ZS5kYXRhLndhc21Nb2R1bGU7Zm9yKGNvbnN0IGhhbmRsZXIgb2YgZS5kYXRhLmhhbmRsZXJzKXtNb2R1bGVbaGFuZGxlcl09KC4uLmFyZ3MpPT57cG9zdE1lc3NhZ2Uoe2NtZDpcImNhbGxIYW5kbGVyXCIsaGFuZGxlcjpoYW5kbGVyLGFyZ3M6YXJnc30pfX1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdPWUuZGF0YS53YXNtTWVtb3J5O01vZHVsZVtcImJ1ZmZlclwiXT1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdLmJ1ZmZlcjtNb2R1bGVbXCJFTlZJUk9OTUVOVF9JU19QVEhSRUFEXCJdPXRydWU7aWYodHlwZW9mIGUuZGF0YS51cmxPckJsb2I9PVwic3RyaW5nXCIpe2ltcG9ydFNjcmlwdHMoZS5kYXRhLnVybE9yQmxvYil9ZWxzZXt2YXIgb2JqZWN0VXJsPVVSTC5jcmVhdGVPYmplY3RVUkwoZS5kYXRhLnVybE9yQmxvYik7aW1wb3J0U2NyaXB0cyhvYmplY3RVcmwpO1VSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKX1vcnRXYXNtVGhyZWFkZWQoTW9kdWxlKX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cInJ1blwiKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyLC8qaXNNYWluQnJvd3NlclRocmVhZD0qLzAsLyppc01haW5SdW50aW1lVGhyZWFkPSovMCwvKmNhbkJsb2NrPSovMSk7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0XCJdKGUuZGF0YS5wdGhyZWFkX3B0cik7TW9kdWxlW1wiZXN0YWJsaXNoU3RhY2tTcGFjZVwiXSgpO01vZHVsZVtcIlBUaHJlYWRcIl0ucmVjZWl2ZU9iamVjdFRyYW5zZmVyKGUuZGF0YSk7TW9kdWxlW1wiUFRocmVhZFwiXS50aHJlYWRJbml0VExTKCk7aWYoIWluaXRpYWxpemVkSlMpe2luaXRpYWxpemVkSlM9dHJ1ZX10cnl7TW9kdWxlW1wiaW52b2tlRW50cnlQb2ludFwiXShlLmRhdGEuc3RhcnRfcm91dGluZSxlLmRhdGEuYXJnKX1jYXRjaChleCl7aWYoZXghPVwidW53aW5kXCIpe3Rocm93IGV4fX19ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjYW5jZWxcIil7aWYoTW9kdWxlW1wiX3B0aHJlYWRfc2VsZlwiXSgpKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXRcIl0oLTEpfX1lbHNlIGlmKGUuZGF0YS50YXJnZXQ9PT1cInNldGltbWVkaWF0ZVwiKXt9ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjaGVja01haWxib3hcIil7aWYoaW5pdGlhbGl6ZWRKUyl7TW9kdWxlW1wiY2hlY2tNYWlsYm94XCJdKCl9fWVsc2UgaWYoZS5kYXRhLmNtZCl7ZXJyKFwid29ya2VyLmpzIHJlY2VpdmVkIHVua25vd24gY29tbWFuZCBcIitlLmRhdGEuY21kKTtlcnIoZS5kYXRhKX19Y2F0Y2goZXgpe2lmKE1vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZFwiXSl7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdKCl9dGhyb3cgZXh9fXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2U7XG4iLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQge0Vudn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtPcnRXYXNtTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20nO1xuaW1wb3J0IHtPcnRXYXNtVGhyZWFkZWRNb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cbmxldCBvcnRXYXNtRmFjdG9yeTogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT47XG5cbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gIG9ydFdhc21GYWN0b3J5ID0gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC10cmFpbmluZy13YXNtLXNpbWQuanMnKTtcbn0gZWxzZSB7XG4gIG9ydFdhc21GYWN0b3J5ID1cbiAgICAgIEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20uanMnKSA6IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLmpzZXAuanMnKTtcbn1cblxuY29uc3Qgb3J0V2FzbUZhY3RvcnlUaHJlYWRlZDogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT4gPSAhQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEID9cbiAgICAoQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcycpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAuanMnKSkgOlxuICAgIG9ydFdhc21GYWN0b3J5O1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5cbmxldCB3YXNtOiBPcnRXYXNtTW9kdWxlfHVuZGVmaW5lZDtcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xubGV0IGFib3J0ZWQgPSBmYWxzZTtcblxuY29uc3QgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBJZiAnU2hhcmVkQXJyYXlCdWZmZXInIGlzIG5vdCBhdmFpbGFibGUsIFdlYkFzc2VtYmx5IHRocmVhZHMgd2lsbCBub3Qgd29yay5cbiAgICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIHRyYW5zZmVyYWJpbGl0eSBvZiBTQUJzIChmb3IgYnJvd3NlcnMuIG5lZWRlZCBmb3IgRmlyZWZveClcbiAgICAvLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhbXNnL21vemlsbGEuZGV2LnBsYXRmb3JtL0lIa0JabEhFVHBBL2R3c01OY2hXRVFBSlxuICAgIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBuZXcgTWVzc2FnZUNoYW5uZWwoKS5wb3J0MS5wb3N0TWVzc2FnZShuZXcgU2hhcmVkQXJyYXlCdWZmZXIoMSkpO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IHRocmVhZHMgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyB0aHJlYWRlZCBpbnN0cnVjdGlvbnMuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgIDAsICAwLCAxLCA0LCAxLCAgOTYsIDAsICAgMCwgIDMsIDIsIDEsICAwLCA1LFxuICAgICAgNCwgMSwgIDMsICAgMSwgICAxLCAxMCwgMTEsIDEsIDksIDAsIDY1LCAwLCAgMjU0LCAxNiwgMiwgMCwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBpc1NpbWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgU0lNRCBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIFNJTUQgaW5zdHJ1Y3Rpb25zLlxuXG4gICAgLy8gVGhlIGJpbmFyeSBkYXRhIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBmb2xsb3dpbmcgY29kZSBieSB3YXQyd2FzbTpcbiAgICAvL1xuICAgIC8vIChtb2R1bGVcbiAgICAvLyAgICh0eXBlICR0MCAoZnVuYykpXG4gICAgLy8gICAoZnVuYyAkZjAgKHR5cGUgJHQwKVxuICAgIC8vICAgICAoZHJvcFxuICAgIC8vICAgICAgIChpMzJ4NC5kb3RfaTE2eDhfc1xuICAgIC8vICAgICAgICAgKGk4eDE2LnNwbGF0XG4gICAgLy8gICAgICAgICAgIChpMzIuY29uc3QgMCkpXG4gICAgLy8gICAgICAgICAodjEyOC5jb25zdCBpMzJ4NCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwKSkpKSlcblxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCAgIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgNCwgMSwgOTYsIDAsIDAsIDMsIDIsIDEsIDAsIDEwLCAzMCwgMSwgICAyOCwgIDAsIDY1LCAwLFxuICAgICAgMjUzLCAxNSwgMjUzLCAxMiwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgIDI1MywgMTg2LCAxLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGdldFdhc21GaWxlTmFtZSA9ICh1c2VTaW1kOiBib29sZWFuLCB1c2VUaHJlYWRzOiBib29sZWFuKSA9PiB7XG4gIGlmICh1c2VTaW1kKSB7XG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgICAgIHJldHVybiAnb3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtJztcbiAgICB9XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS1zaW1kLndhc20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLndhc20nO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5ID0gYXN5bmMoZmxhZ3M6IEVudi5XZWJBc3NlbWJseUZsYWdzKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmIChpbml0aWFsaXplZCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICBpZiAoaW5pdGlhbGl6aW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtdWx0aXBsZSBjYWxscyB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBkZXRlY3RlZC4nKTtcbiAgfVxuICBpZiAoYWJvcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJldmlvdXMgY2FsbCB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBmYWlsZWQuJyk7XG4gIH1cblxuICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gIC8vIHdhc20gZmxhZ3MgYXJlIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgY29uc3QgdGltZW91dCA9IGZsYWdzLmluaXRUaW1lb3V0ITtcbiAgY29uc3QgbnVtVGhyZWFkcyA9IGZsYWdzLm51bVRocmVhZHMhO1xuICBjb25zdCBzaW1kID0gZmxhZ3Muc2ltZCE7XG5cbiAgY29uc3QgdXNlVGhyZWFkcyA9IG51bVRocmVhZHMgPiAxICYmIGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQoKTtcbiAgY29uc3QgdXNlU2ltZCA9IHNpbWQgJiYgaXNTaW1kU3VwcG9ydGVkKCk7XG5cbiAgY29uc3Qgd2FzbVBhdGhzID0gZmxhZ3Mud2FzbVBhdGhzO1xuICBjb25zdCB3YXNtUHJlZml4T3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnc3RyaW5nJyA/IHdhc21QYXRocyA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgd2FzbUZpbGVOYW1lID0gZ2V0V2FzbUZpbGVOYW1lKHVzZVNpbWQsIHVzZVRocmVhZHMpO1xuICBjb25zdCB3YXNtUGF0aE92ZXJyaWRlID0gdHlwZW9mIHdhc21QYXRocyA9PT0gJ29iamVjdCcgPyB3YXNtUGF0aHNbd2FzbUZpbGVOYW1lXSA6IHVuZGVmaW5lZDtcblxuICBsZXQgaXNUaW1lb3V0ID0gZmFsc2U7XG5cbiAgY29uc3QgdGFza3M6IEFycmF5PFByb21pc2U8dm9pZD4+ID0gW107XG5cbiAgLy8gcHJvbWlzZSBmb3IgdGltZW91dFxuICBpZiAodGltZW91dCA+IDApIHtcbiAgICB0YXNrcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaXNUaW1lb3V0ID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgdGltZW91dCk7XG4gICAgfSkpO1xuICB9XG5cbiAgLy8gcHJvbWlzZSBmb3IgbW9kdWxlIGluaXRpYWxpemF0aW9uXG4gIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZhY3RvcnkgPSB1c2VUaHJlYWRzID8gb3J0V2FzbUZhY3RvcnlUaHJlYWRlZCA6IG9ydFdhc21GYWN0b3J5O1xuICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPcnRXYXNtTW9kdWxlPiA9IHtcbiAgICAgIGxvY2F0ZUZpbGU6IChmaWxlTmFtZTogc3RyaW5nLCBzY3JpcHREaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcud29ya2VyLmpzJykgJiZcbiAgICAgICAgICAgIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgLy8gVGhpcyByZXF1aXJlKCkgZnVuY3Rpb24gaXMgaGFuZGxlZCBieSBlc2J1aWxkIHBsdWdpbiB0byBsb2FkIGZpbGUgY29udGVudCBhcyBzdHJpbmcuXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzJylcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcud2FzbScpKSB7XG4gICAgICAgICAgaWYgKHdhc21QYXRoT3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIHJldHVybiB3YXNtUGF0aE92ZXJyaWRlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHdhc21QcmVmaXhPdmVycmlkZSA/PyBzY3JpcHREaXJlY3Rvcnk7XG5cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgICAgIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwcmVmaXggKyB3YXNtRmlsZU5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyaXB0RGlyZWN0b3J5ICsgZmlsZU5hbWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgQmxvYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnb3J0LXdhc20tdGhyZWFkZWQuanMnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNjcmlwdFNvdXJjZUNvZGUgPSBgdmFyIG9ydFdhc21UaHJlYWRlZD0ke2ZhY3RvcnkudG9TdHJpbmcoKX07YDtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBuZXcgQmxvYihbc2NyaXB0U291cmNlQ29kZV0sIHt0eXBlOiAndGV4dC9qYXZhc2NyaXB0J30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZhY3RvcnkoY29uZmlnKS50aGVuKFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgbW9kdWxlID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgd2FzbSA9IG1vZHVsZTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGZhaWxlZCB0byBpbml0aWFsaXplXG4gICAgICAgICh3aGF0KSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgcmVqZWN0KHdoYXQpO1xuICAgICAgICB9KTtcbiAgfSkpO1xuXG4gIGF3YWl0IFByb21pc2UucmFjZSh0YXNrcyk7XG5cbiAgaWYgKGlzVGltZW91dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgV2ViQXNzZW1ibHkgYmFja2VuZCBpbml0aWFsaXppbmcgZmFpbGVkIGR1ZSB0byB0aW1lb3V0OiAke3RpbWVvdXR9bXNgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEluc3RhbmNlID0gKCk6IE9ydFdhc21Nb2R1bGUgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgd2FzbSkge1xuICAgIHJldHVybiB3YXNtO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdXZWJBc3NlbWJseSBpcyBub3QgaW5pdGlhbGl6ZWQgeWV0LicpO1xufTtcblxuZXhwb3J0IGNvbnN0IGRpc3Bvc2UgPSAoKTogdm9pZCA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiAhaW5pdGlhbGl6aW5nICYmICFhYm9ydGVkKSB7XG4gICAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAgICh3YXNtIGFzIE9ydFdhc21UaHJlYWRlZE1vZHVsZSkuUFRocmVhZD8udGVybWluYXRlQWxsVGhyZWFkcygpO1xuICAgIHdhc20gPSB1bmRlZmluZWQ7XG5cbiAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICBpbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIGFib3J0ZWQgPSB0cnVlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5cbmV4cG9ydCBjb25zdCBhbGxvY1dhc21TdHJpbmcgPSAoZGF0YTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogbnVtYmVyID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3QgZGF0YUxlbmd0aCA9IHdhc20ubGVuZ3RoQnl0ZXNVVEY4KGRhdGEpICsgMTtcbiAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhkYXRhTGVuZ3RoKTtcbiAgd2FzbS5zdHJpbmdUb1VURjgoZGF0YSwgZGF0YU9mZnNldCwgZGF0YUxlbmd0aCk7XG4gIGFsbG9jcy5wdXNoKGRhdGFPZmZzZXQpO1xuXG4gIHJldHVybiBkYXRhT2Zmc2V0O1xufTtcblxuaW50ZXJmYWNlIEV4dHJhT3B0aW9uc0hhbmRsZXIge1xuICAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IGl0ZXJhdGVFeHRyYU9wdGlvbnMgPVxuICAgIChvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcHJlZml4OiBzdHJpbmcsIHNlZW46IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICAgICBoYW5kbGVyOiBFeHRyYU9wdGlvbnNIYW5kbGVyKTogdm9pZCA9PiB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoc2Vlbi5oYXMob3B0aW9ucykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NpcmN1bGFyIHJlZmVyZW5jZSBpbiBvcHRpb25zJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2Vlbi5hZGQob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSAocHJlZml4KSA/IHByZWZpeCArIGtleSA6IGtleTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBuYW1lICsgJy4nLCBzZWVuLCBoYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgaGFuZGxlcihuYW1lLCAodmFsdWUpID8gJzEnIDogJzAnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGhhbmRsZSBleHRyYSBjb25maWcgdHlwZTogJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbi8qKlxuICogY2hlY2sgd2ViIGFzc2VtYmx5IEFQSSdzIGxhc3QgZXJyb3IgYW5kIHRocm93IGVycm9yIGlmIGFueSBlcnJvciBvY2N1cnJlZC5cbiAqIEBwYXJhbSBtZXNzYWdlIGEgbWVzc2FnZSB1c2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJyZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBjaGVja0xhc3RFcnJvciA9IChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IHBhcmFtc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg4KTtcbiAgICB3YXNtLl9PcnRHZXRMYXN0RXJyb3IocGFyYW1zT2Zmc2V0LCBwYXJhbXNPZmZzZXQgKyA0KTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLkhFQVAzMltwYXJhbXNPZmZzZXQgLyA0XTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2VQb2ludGVyID0gd2FzbS5IRUFQVTMyW3BhcmFtc09mZnNldCAvIDQgKyAxXTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2VQb2ludGVyID8gd2FzbS5VVEY4VG9TdHJpbmcoZXJyb3JNZXNzYWdlUG9pbnRlcikgOiAnJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gRVJST1JfQ09ERTogJHtlcnJvckNvZGV9LCBFUlJPUl9NRVNTQUdFOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5leHBvcnQgY29uc3Qgc2V0UnVuT3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBbbnVtYmVyLCBudW1iZXJbXV0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgcnVuT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0cnkge1xuICAgIGlmIChvcHRpb25zPy5sb2dTZXZlcml0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA9IDI7ICAvLyBEZWZhdWx0IHRvIHdhcm5pbmdcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwpIHx8XG4gICAgICAgIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmxvZ1ZlcmJvc2l0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPSAwOyAgLy8gRGVmYXVsdCB0byAwXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHZlcmJvc2l0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8udGVybWluYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMudGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHRhZ0RhdGFPZmZzZXQgPSAwO1xuICAgIGlmIChvcHRpb25zPy50YWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFnRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhvcHRpb25zLnRhZywgYWxsb2NzKTtcbiAgICB9XG5cbiAgICBydW5PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlUnVuT3B0aW9ucyhcbiAgICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsISwgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCEsICEhcnVuT3B0aW9ucy50ZXJtaW5hdGUhLCB0YWdEYXRhT2Zmc2V0KTtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIHJ1biBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKG9wdGlvbnMuZXh0cmEsICcnLCBuZXcgV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oKSwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhrZXksIGFsbG9jcyk7XG4gICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh2YWx1ZSwgYWxsb2NzKTtcblxuICAgICAgICBpZiAod2FzbS5fT3J0QWRkUnVuQ29uZmlnRW50cnkocnVuT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBydW4gY29uZmlnIGVudHJ5OiAke2tleX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtydW5PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VSdW5PcHRpb25zKHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmNvbnN0IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbCA9IChncmFwaE9wdGltaXphdGlvbkxldmVsOiBzdHJpbmd8dW5rbm93bik6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCkge1xuICAgIGNhc2UgJ2Rpc2FibGVkJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2Jhc2ljJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2V4dGVuZGVkJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2FsbCc6XG4gICAgICByZXR1cm4gOTk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZ3JhcGggb3B0aW1pemF0aW9uIGxldmVsOiAke2dyYXBoT3B0aW1pemF0aW9uTGV2ZWx9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGdldEV4ZWN1dGlvbk1vZGUgPSAoZXhlY3V0aW9uTW9kZTogJ3NlcXVlbnRpYWwnfCdwYXJhbGxlbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGV4ZWN1dGlvbk1vZGUpIHtcbiAgICBjYXNlICdzZXF1ZW50aWFsJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ3BhcmFsbGVsJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGV4ZWN1dGlvbiBtb2RlOiAke2V4ZWN1dGlvbk1vZGV9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGFwcGVuZERlZmF1bHRPcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiB2b2lkID0+IHtcbiAgaWYgKCFvcHRpb25zLmV4dHJhKSB7XG4gICAgb3B0aW9ucy5leHRyYSA9IHt9O1xuICB9XG4gIGlmICghb3B0aW9ucy5leHRyYS5zZXNzaW9uKSB7XG4gICAgb3B0aW9ucy5leHRyYS5zZXNzaW9uID0ge307XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbiA9IG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBpZiAoIXNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkgPSAnMSc7XG4gIH1cblxuICAvLyBpZiB1c2luZyBKU0VQIHdpdGggV2ViR1BVLCBhbHdheXMgZGlzYWJsZSBtZW1vcnkgcGF0dGVyblxuICBpZiAob3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgJiZcbiAgICAgIG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLnNvbWUoZXAgPT4gKHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWUpID09PSAnd2ViZ3B1JykpIHtcbiAgICBvcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4gPSBmYWxzZTtcbiAgfVxufTtcblxuY29uc3Qgc2V0RXhlY3V0aW9uUHJvdmlkZXJzID1cbiAgICAoc2Vzc2lvbk9wdGlvbnNIYW5kbGU6IG51bWJlciwgZXhlY3V0aW9uUHJvdmlkZXJzOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLkV4ZWN1dGlvblByb3ZpZGVyQ29uZmlnW10sXG4gICAgIGFsbG9jczogbnVtYmVyW10pOiB2b2lkID0+IHtcbiAgICAgIGZvciAoY29uc3QgZXAgb2YgZXhlY3V0aW9uUHJvdmlkZXJzKSB7XG4gICAgICAgIGxldCBlcE5hbWUgPSB0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lO1xuXG4gICAgICAgIC8vIGNoZWNrIEVQIG5hbWVcbiAgICAgICAgc3dpdGNoIChlcE5hbWUpIHtcbiAgICAgICAgICBjYXNlICd4bm5wYWNrJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdYTk5QQUNLJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYm5uJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCB3ZWJubk9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LmRldmljZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdkZXZpY2VUeXBlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLmRldmljZVR5cGUsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZGV2aWNlVHlwZScgLSAke3dlYm5uT3B0aW9ucy5kZXZpY2VUeXBlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ucG93ZXJQcmVmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZSwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwb3dlclByZWZlcmVuY2UnIC0gJHt3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgICAgICBlcE5hbWUgPSAnSlMnO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zPy5wcmVmZXJyZWRMYXlvdXQpIHtcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PVxuICAgICAgICAgICAgICAgICAgICAwKSB7XG4gICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICBgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICdwcmVmZXJyZWRMYXlvdXQnIC0gJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3YXNtJzpcbiAgICAgICAgICBjYXNlICdjcHUnOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYXBwZW5kIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9LmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBzZXNzaW9uT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XG4gICAgY29uc3QgZXhlY3V0aW9uTW9kZSA9IGdldEV4ZWN1dGlvbk1vZGUoc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uTW9kZSA/PyAnc2VxdWVudGlhbCcpO1xuICAgIGNvbnN0IGxvZ0lkRGF0YU9mZnNldCA9XG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgIC8vIERlZmF1bHQgdG8gMiAtIHdhcm5pbmdcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7bG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2dWZXJib3NpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID8/IDA7ICAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xuICAgICAgICBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCwgYWxsb2NzKSA6XG4gICAgICAgIDA7XG5cbiAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVNlc3Npb25PcHRpb25zKFxuICAgICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLCAhIXNlc3Npb25PcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4sIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxuICAgICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gVGhpcyBmaWxlIGluY2x1ZGVzIGNvbW1vbiBkZWZpbml0aW9ucy4gVGhleSBkbyBOT1QgaGF2ZSBkZXBlbmRlbmN5IG9uIHRoZSBXZWJBc3NlbWJseSBpbnN0YW5jZS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBPTk5YIGRlZmluaXRpb24uIFVzZSB0aGlzIHRvIGRyb3AgZGVwZW5kZW5jeSAnb25ueF9wcm90bycgdG8gZGVjcmVhc2UgY29tcGlsZWQgLmpzIGZpbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xuICB1bmRlZmluZWQgPSAwLFxuICBmbG9hdCA9IDEsXG4gIHVpbnQ4ID0gMixcbiAgaW50OCA9IDMsXG4gIHVpbnQxNiA9IDQsXG4gIGludDE2ID0gNSxcbiAgaW50MzIgPSA2LFxuICBpbnQ2NCA9IDcsXG4gIHN0cmluZyA9IDgsXG4gIGJvb2wgPSA5LFxuICBmbG9hdDE2ID0gMTAsXG4gIGRvdWJsZSA9IDExLFxuICB1aW50MzIgPSAxMixcbiAgdWludDY0ID0gMTMsXG4gIGNvbXBsZXg2NCA9IDE0LFxuICBjb21wbGV4MTI4ID0gMTUsXG4gIGJmbG9hdDE2ID0gMTZcbn1cblxuLyoqXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtID0gKHR5cGU6IHN0cmluZyk6IERhdGFUeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50ODtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDg7XG4gICAgY2FzZSAnYm9vbCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MTY7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MTY7XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDMyO1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0MTY7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZG91YmxlO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuc3RyaW5nO1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcbiAgICBjYXNlICd1aW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ2NDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBlbnVtIHZhbHVlIHRvIHN0cmluZyB0ZW5zb3IgZGF0YVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlUHJvdG8pIHtcbiAgICBjYXNlIERhdGFUeXBlLmludDg6XG4gICAgICByZXR1cm4gJ2ludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDg6XG4gICAgICByZXR1cm4gJ3VpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XG4gICAgICByZXR1cm4gJ2Jvb2wnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MTY6XG4gICAgICByZXR1cm4gJ2ludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQxNjpcbiAgICAgIHJldHVybiAndWludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxuICAgICAgcmV0dXJuICdpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MzI6XG4gICAgICByZXR1cm4gJ3VpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDE2OlxuICAgICAgcmV0dXJuICdmbG9hdDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxuICAgICAgcmV0dXJuICdmbG9hdDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmRvdWJsZTpcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS5zdHJpbmc6XG4gICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcbiAgICAgIHJldHVybiAnaW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDY0OlxuICAgICAgcmV0dXJuICd1aW50NjQnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGVuc29yIGVsZW1lbnQgc2l6ZSBpbiBieXRlcyBieSB0aGUgZ2l2ZW4gZGF0YSB0eXBlXG4gKiBAcmV0dXJucyBzaXplIGluIGludGVnZXIgb3IgdW5kZWZpbmVkIGlmIHRoZSBkYXRhIHR5cGUgaXMgbm90IHN1cHBvcnRlZFxuICovXG5leHBvcnQgY29uc3QgZ2V0VGVuc29yRWxlbWVudFNpemUgPSAoZGF0ZVR5cGU6IG51bWJlcik6IG51bWJlcnxcbiAgICB1bmRlZmluZWQgPT4gW3VuZGVmaW5lZCwgNCwgMSwgMSwgMiwgMiwgNCwgOCwgdW5kZWZpbmVkLCAxLCAyLCA4LCA0LCA4LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVtkYXRlVHlwZV07XG5cbi8qKlxuICogZ2V0IHR5cGVkIGFycmF5IGNvbnN0cnVjdG9yIGJ5IHRoZSBnaXZlbiB0ZW5zb3IgdHlwZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gKHR5cGU6IFRlbnNvci5UeXBlKTogRmxvYXQzMkFycmF5Q29uc3RydWN0b3J8VWludDhBcnJheUNvbnN0cnVjdG9yfFxuICAgIEludDhBcnJheUNvbnN0cnVjdG9yfFVpbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MTZBcnJheUNvbnN0cnVjdG9yfEludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8XG4gICAgVWludDhBcnJheUNvbnN0cnVjdG9yfEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvciA9PiB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICAgICAgICBjYXNlICd1aW50OCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDgnOlxuICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQxNic6XG4gICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgICAgICByZXR1cm4gSW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnYm9vbCc6XG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgICAgIHJldHVybiBGbG9hdDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIFVpbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ0ludDY0QXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEJpZ1VpbnQ2NEFycmF5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXBlfWApO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogTWFwIHN0cmluZyBsb2cgbGV2ZWwgdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZmF0YWwnOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgbG9nZ2luZyBsZXZlbDogJHtsb2dMZXZlbH1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlID0gKHR5cGU6IFRlbnNvci5UeXBlKTogdHlwZSBpcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0+IHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICAgIHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAnYm9vbCcgfHwgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICd1aW50MzInO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtTZXJpYWxpemFibGVNb2RlbGRhdGEsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7c2V0UnVuT3B0aW9uc30gZnJvbSAnLi9ydW4tb3B0aW9ucyc7XG5pbXBvcnQge3NldFNlc3Npb25PcHRpb25zfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XG5pbXBvcnQge2RhdGFMb2NhdGlvblN0cmluZ1RvRW51bSwgZ2V0VGVuc29yRWxlbWVudFNpemUsIGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSwgbG9nTGV2ZWxTdHJpbmdUb0VudW0sIHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nLCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSwgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yfSBmcm9tICcuL3dhc20tY29tbW9uJztcbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvcn0gZnJvbSAnLi93YXNtLXV0aWxzJztcblxubGV0IG9ydEVudkluaXRpYWxpemVkID0gZmFsc2U7XG5cbi8qKlxuICogZ2V0IHRoZSBpbnB1dC9vdXRwdXQgY291bnQgb2YgdGhlIHNlc3Npb24uXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxuICogQHJldHVybnMgYSB0dXBsZSBpbmNsdWRpbmcgMiBudW1iZXJzLCByZXByZXNlbnRpbmcgdGhlIGlucHV0IGNvdW50IGFuZCBvdXRwdXQgY291bnQuXG4gKi9cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlLCBkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgNCk7XG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IHNlc3Npb24gaW5wdXQvb3V0cHV0IGNvdW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gW3dhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0XSwgd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDQgKyAxXV07XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIGluaXRpYWxpemUgT1JUIGVudmlyb25tZW50LlxuICogQHBhcmFtIG51bVRocmVhZHMgU2V0R2xvYmFsSW50cmFPcE51bVRocmVhZHMobnVtVGhyZWFkcylcbiAqIEBwYXJhbSBsb2dnaW5nTGV2ZWwgQ3JlYXRlRW52KHN0YXRpY19jYXN0PE9ydExvZ2dpbmdMZXZlbD4obG9nZ2luZ19sZXZlbCkpXG4gKi9cbmNvbnN0IGluaXRPcnQgPSAobnVtVGhyZWFkczogbnVtYmVyLCBsb2dnaW5nTGV2ZWw6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCBlcnJvckNvZGUgPSBnZXRJbnN0YW5jZSgpLl9PcnRJbml0KG51bVRocmVhZHMsIGxvZ2dpbmdMZXZlbCk7XG4gIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBpbml0aWFsaXplIG9ubnhydW50aW1lLicpO1xuICB9XG59O1xuXG4vKipcbiAqIGludGlhbGl6ZSBydW50aW1lIGVudmlyb25tZW50LlxuICogQHBhcmFtIGVudiBwYXNzZWQgaW4gdGhlIGVudmlyb25tZW50IGNvbmZpZyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0UnVudGltZSA9IGFzeW5jKGVudjogRW52KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXQgT1JUXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xuXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgIC8vIGluaXQgSlNFUCBpZiBhdmFpbGFibGVcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gICAgY29uc3QgaW5pdEpzZXAgPSByZXF1aXJlKCcuL2pzZXAvaW5pdCcpLmluaXQ7XG4gICAgYXdhaXQgaW5pdEpzZXAoZ2V0SW5zdGFuY2UoKSwgZW52KTtcbiAgfVxuXG4gIG9ydEVudkluaXRpYWxpemVkID0gdHJ1ZTtcbn07XG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlciwgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGV8bnVsbFxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG5leHBvcnQgY29uc3QgaXNPcnRFbnZJbml0aWFsaXplZCA9ICgpOiBib29sZWFuID0+IG9ydEVudkluaXRpYWxpemVkO1xuXG4vKipcbiAqIGFsbG9jYXRlIHRoZSBtZW1vcnkgYW5kIG1lbWNweSB0aGUgbW9kZWwgYnl0ZXMsIHByZXBhcmluZyBmb3IgY3JlYXRpbmcgYW4gaW5zdGFuY2Ugb2YgSW5mZXJlbmNlU2Vzc2lvbi5cbiAqIEByZXR1cm5zIGEgMi1lbGVtZW50cyB0dXBsZSAtIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBhbGxvY2F0ZWQgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uQWxsb2NhdGUgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIHVzaW5nIHRoZSBwcmVwYXJlZCBidWZmZXIgY29udGFpbmluZyB0aGUgbW9kZWwgZGF0YS5cbiAqIEBwYXJhbSBtb2RlbERhdGEgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGEgYnVmZmVyLlxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cbiAqIEByZXR1cm5zIGEgMy1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIFtzZXNzaW9uIGhhbmRsZSwgaW5wdXQgbmFtZXMsIG91dHB1dCBuYW1lc11cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb25GaW5hbGl6ZSA9XG4gICAgKG1vZGVsRGF0YTogU2VyaWFsaXphYmxlTW9kZWxkYXRhLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSA9PiB7XG4gICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICAgICAgbGV0IHNlc3Npb25PcHRpb25zSGFuZGxlID0gMDtcbiAgICAgIGxldCBpb0JpbmRpbmdIYW5kbGUgPSAwO1xuICAgICAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgICAgIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuICAgICAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuXG4gICAgICB0cnkge1xuICAgICAgICBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc10gPSBzZXRTZXNzaW9uT3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgICBzZXNzaW9uSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbihtb2RlbERhdGFbMF0sIG1vZGVsRGF0YVsxXSwgc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgICAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBhIHNlc3Npb24uJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICAgICAgY29uc3QgaW5wdXROYW1lcyA9IFtdO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lcyA9IFtdO1xuICAgICAgICBjb25zdCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0SW5wdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gaW5wdXQgbmFtZS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgaW5wdXROYW1lcy5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0T3V0cHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIG91dHB1dCBuYW1lLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgY29uc3QgbmFtZVN0cmluZyA9IHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpO1xuICAgICAgICAgIG91dHB1dE5hbWVzLnB1c2gobmFtZVN0cmluZyk7XG5cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA6XG4gICAgICAgICAgICAgICAgb3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24/LltuYW1lU3RyaW5nXSA/PyAnY3B1JztcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZmVyZWQgdG8gYmUgb24gR1BVLlxuICAgICAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsID0gbnVsbDtcbiAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5zb21lKGwgPT4gbCA9PT0gJ2dwdS1idWZmZXInKSkge1xuICAgICAgICAgIGlvQmluZGluZ0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZUJpbmRpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gICAgICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIElPIGJpbmRpbmcuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYmluZGluZ1N0YXRlID0ge1xuICAgICAgICAgICAgaGFuZGxlOiBpb0JpbmRpbmdIYW5kbGUsXG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsXG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMubWFwKGwgPT4gZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGwpKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb25IYW5kbGUsIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGJpbmRpbmdTdGF0ZV0pO1xuICAgICAgICByZXR1cm4gW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXMsIG91dHB1dE5hbWVzXTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gICAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcblxuICAgICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nSGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXNzaW9uSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uX2ZyZWUobW9kZWxEYXRhWzBdKTtcbiAgICAgICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICAgICAgfVxuICAgICAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgICB9XG4gICAgfTtcblxuXG4vKipcbiAqIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBJbmZlcmVuY2VTZXNzaW9uLlxuICogQHJldHVybnMgdGhlIG1ldGFkYXRhIG9mIEluZmVyZW5jZVNlc3Npb24uIDAtdmFsdWUgaGFuZGxlIGZvciBmYWlsdXJlLlxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbiA9XG4gICAgKG1vZGVsOiBVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSA9PiB7XG4gICAgICBjb25zdCBtb2RlbERhdGE6IFNlcmlhbGl6YWJsZU1vZGVsZGF0YSA9IGNyZWF0ZVNlc3Npb25BbGxvY2F0ZShtb2RlbCk7XG4gICAgICByZXR1cm4gY3JlYXRlU2Vzc2lvbkZpbmFsaXplKG1vZGVsRGF0YSwgb3B0aW9ucyk7XG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHJlbGVhc2VTZXNzaW9uID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJlbGVhc2Ugc2Vzc2lvbi4gaW52YWxpZCBzZXNzaW9uIGlkOiAke3Nlc3Npb25JZH1gKTtcbiAgfVxuICBjb25zdCBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gIH1cblxuICB3YXNtLmpzZXBVbnJlZ2lzdGVyQnVmZmVycz8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyKTpcbiAgICAgICAgdm9pZCA9PiB7XG4gICAgICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCgwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XG5cbiAgICAgICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICAgICAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICAgICAgaWYgKGRhdGFUeXBlID09PSAnc3RyaW5nJyAmJiBsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHRlbnNvclsyXS5ncHVCdWZmZXIgYXMgR1BVQnVmZmVyO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemVJbkJ5dGVzID0gZ2V0VGVuc29yRWxlbWVudFNpemUodGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpKSE7XG4gICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG4gICAgICAgICAgICByYXdEYXRhID0gd2FzbS5qc2VwUmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG5cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSA0ICogZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICAgICAgbGV0IGRhdGFJbmRleCA9IHJhd0RhdGEgLyA0O1xuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZW5zb3IgZGF0YSBhdCBpbmRleCAke2l9IGlzIG5vdCBhIHN0cmluZ2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBkaW1zLmxlbmd0aCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICAgICAgZGltcy5mb3JFYWNoKGQgPT4gd2FzbS5IRUFQMzJbZGltSW5kZXgrK10gPSBkKTtcbiAgICAgICAgICAgIGNvbnN0IHRlbnNvciA9IHdhc20uX09ydENyZWF0ZVRlbnNvcihcbiAgICAgICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obG9jYXRpb24pKTtcbiAgICAgICAgICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBjb25zdCBpbnB1dENvdW50ID0gaW5wdXRJbmRpY2VzLmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0Q291bnQgPSBvdXRwdXRJbmRpY2VzLmxlbmd0aDtcblxuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBydW5PcHRpb25zQWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGlucHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3Qgb3V0cHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgYmVmb3JlUnVuU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IGlucHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcblxuICB0cnkge1xuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBjcmVhdGUgaW5wdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoaW5wdXRUZW5zb3JzW2ldLCBpbnB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0SW5kaWNlc1tpXSk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIGxldCBpbnB1dFZhbHVlc0luZGV4ID0gaW5wdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBpbnB1dE5hbWVzSW5kZXggPSBpbnB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0VmFsdWVzSW5kZXggPSBvdXRwdXRWYWx1ZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXROYW1lc0luZGV4ID0gb3V0cHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXRWYWx1ZXNJbmRleCsrXSA9IGlucHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dE5hbWVzSW5kZXgrK10gPSBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzSW5kZXgrK10gPSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dE5hbWVzSW5kZXgrK10gPSBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dO1xuICAgIH1cblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgY29uc3Qge2hhbmRsZSwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkfSA9IGlvQmluZGluZ1N0YXRlO1xuXG4gICAgICBpZiAoaW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aCAhPT0gaW5wdXRDb3VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlucHV0IGNvdW50IGZyb20gZmVlZHMgKCR7XG4gICAgICAgICAgICBpbnB1dENvdW50fSkgaXMgZXhwZWN0ZWQgdG8gYmUgYWx3YXlzIGVxdWFsIHRvIG1vZGVsJ3MgaW5wdXQgY291bnQgKCR7aW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aH0pLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpbnB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBpbnB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cblxuICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgMCk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPVxuICAgICAgICAgICAgICB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIDAsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWRbaW5kZXhdKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBvdXRwdXRbJHtpfV0gdG8gJHtvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbaV19IGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZXJyb3JDb2RlOiBudW1iZXI7XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlcihncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ2dwdS1idWZmZXInXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgICAgICAgICAgICAgLnNldCh3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIGlucHV0T3V0cHV0QWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIHByb2ZpbGUgZmlsZSBuYW1lLicpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJ3ZWJ3b3JrZXJcIiAvPlxuXG5pbXBvcnQge09ydFdhc21NZXNzYWdlfSBmcm9tICcuLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge2NyZWF0ZVNlc3Npb24sIGNyZWF0ZVNlc3Npb25BbGxvY2F0ZSwgY3JlYXRlU2Vzc2lvbkZpbmFsaXplLCBlbmRQcm9maWxpbmcsIGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzLCBpbml0UnVudGltZSwgaXNPcnRFbnZJbml0aWFsaXplZCwgcmVsZWFzZVNlc3Npb24sIHJ1bn0gZnJvbSAnLi4vd2FzbS1jb3JlLWltcGwnO1xuaW1wb3J0IHtpbml0aWFsaXplV2ViQXNzZW1ibHl9IGZyb20gJy4uL3dhc20tZmFjdG9yeSc7XG5cbnNlbGYub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIHN3aXRjaCAoZXYuZGF0YS50eXBlKSB7XG4gICAgY2FzZSAnaW5pdC13YXNtJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGluaXRpYWxpemVXZWJBc3NlbWJseShldi5kYXRhLmluKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKCkgPT4gcG9zdE1lc3NhZ2Uoe3R5cGU6ICdpbml0LXdhc20nfSBhcyBPcnRXYXNtTWVzc2FnZSksXG4gICAgICAgICAgICAgICAgZXJyID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpbml0LW9ydCc6XG4gICAgICB0cnkge1xuICAgICAgICBpbml0UnVudGltZShldi5kYXRhLmluKS50aGVuKCgpID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC1vcnQnfSBhcyBPcnRXYXNtTWVzc2FnZSksIGVyciA9PiBwb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5pdC1vcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBhcyBPcnRXYXNtTWVzc2FnZSkpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC1vcnQnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZV9hbGxvY2F0ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IG1vZGVsZGF0YSA9IGNyZWF0ZVNlc3Npb25BbGxvY2F0ZShtb2RlbCk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlX2FsbG9jYXRlJywgb3V0OiBtb2RlbGRhdGF9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9hbGxvY2F0ZScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3JlYXRlX2ZpbmFsaXplJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHttb2RlbGRhdGEsIG9wdGlvbnN9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IHNlc3Npb25NZXRhZGF0YSA9IGNyZWF0ZVNlc3Npb25GaW5hbGl6ZShtb2RlbGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9maW5hbGl6ZScsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfZmluYWxpemUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWwsIG9wdGlvbnN9ID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGNvbnN0IHNlc3Npb25NZXRhZGF0YSA9IGNyZWF0ZVNlc3Npb24obW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZScsIG91dDogc2Vzc2lvbk1ldGFkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlbGVhc2UnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGV2LmRhdGEuaW4hO1xuICAgICAgICByZWxlYXNlU2Vzc2lvbihoYW5kbGVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdyZWxlYXNlJ30gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncmVsZWFzZScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncnVuJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHtzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBydW4oc2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIG91dHB1dHMgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBvdXQ6IG91dHB1dHN9IGFzIE9ydFdhc21NZXNzYWdlLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyhvdXRwdXRzKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ3J1bicsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZW5kLXByb2ZpbGluZyc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gZXYuZGF0YS5pbiE7XG4gICAgICAgIGVuZFByb2ZpbGluZyhoYW5kbGVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdlbmQtcHJvZmlsaW5nJ30gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnZW5kLXByb2ZpbGluZycsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaXMtb3J0LWVudi1pbml0aWFsaXplZCc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBvcnRFbnZJbml0aWFsaXplZCA9IGlzT3J0RW52SW5pdGlhbGl6ZWQoKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdpcy1vcnQtZW52LWluaXRpYWxpemVkJywgb3V0OiBvcnRFbnZJbml0aWFsaXplZH0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnaXMtb3J0LWVudi1pbml0aWFsaXplZCcsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgfVxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFhO0FBQWI7QUFBQTtBQUFPLE1BQU0sV0FBVztBQUFBO0FBQUE7OztBQ0F4QjtBQUFBO0FBQUEsZ0JBQUFBO0FBQUE7QUFBQSxNQUFhQTtBQUFiO0FBQUE7QUFBTyxNQUFNQSxRQUFPO0FBQUE7QUFBQTs7O0FDQXBCO0FBQUE7QUFBQTtBQUNBLFVBQUksV0FBVyxNQUFNO0FBQ25CLFlBQUksYUFBYSxPQUFPLGFBQWEsZUFBZSxTQUFTLGdCQUFnQixTQUFTLGNBQWMsTUFBTTtBQUMxRyxZQUFJLE9BQU8sZUFBZTtBQUFhLHVCQUFhLGNBQWM7QUFDbEUsZUFDRixTQUFTLFlBQVksQ0FBQyxHQUFHO0FBRXpCLGNBQUksSUFBRSxXQUFVLElBQUc7QUFBRSxZQUFFLFFBQU0sSUFBSSxRQUFRLENBQUMsR0FBRSxNQUFJO0FBQUMsaUJBQUc7QUFBRSxnQkFBRTtBQUFBLFVBQUMsQ0FBQztBQUFFLGNBQUksS0FBRyxPQUFP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LE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxjQUFLLE9BQU07QUFBQSxZQUFJO0FBQUUscUJBQVEsS0FBSztBQUFFLGtCQUFFLEVBQUUsUUFBUSxJQUFJLE9BQU8sR0FBRSxHQUFHLEdBQUUsRUFBRSxDQUFDLENBQUM7QUFBRSxnQkFBSSxLQUFHLDJEQUEyRCxNQUFNLEdBQUcsR0FBRSxLQUFHLHdGQUF3RixNQUFNLEdBQUc7QUFBRSxnQkFBRSxFQUFDLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUNsZixHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUcsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRztBQUFDLGtCQUFFLEVBQUU7QUFBRyxtQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHFCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRztBQUFDLHVCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBRyxFQUFFLEtBQUcsR0FBRSxNQUFJLEVBQUUsRUFBRSxLQUFHLElBQUksSUFBRSxLQUFHLElBQUksR0FBRztBQUFFO0FBQUMscUJBQU8sRUFBRSxFQUFFLEtBQUcs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RSxtQkFBTyxJQUFFO0FBQUEsVUFBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLEdBQUUsTUFBSSxHQUFHLEdBQUUsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUM5ZCxtQkFBUyxHQUFHLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLENBQUM7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SUFBRSxJQUFFLEVBQUUsUUFBUTtBQUFFLHVCQUFHLElBQUUsRUFBRSxRQUFRLElBQUUsR0FBRSxFQUFFLFFBQVEsQ0FBQyxHQUFFLEtBQUcsSUFBRSxFQUFFLFNBQVMsSUFBRSxDQUFDLEtBQUcsRUFBRSxTQUFTLENBQUMsR0FBRSxFQUFFLFlBQVksRUFBRSxZQUFZLElBQUUsQ0FBQztBQUFBLHFCQUFPO0FBQUMsb0JBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxDQUFDO0FBQUU7QUFBQSxnQkFBSztBQUFBLGNBQUM7QUFBQyxrQkFBRSxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxrQkFBRSxFQUFFLElBQUk7QUFBQSxnQkFBSyxFQUFFLFlBQVk7QUFBQSxnQkFDbmY7QUFBQSxnQkFBRTtBQUFBLGNBQUMsQ0FBQztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxLQUFHLEVBQUUsR0FBRSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUUsSUFBRSxFQUFFLFlBQVksSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFBLFlBQUM7QUFBQyxtQkFBSztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFDLElBQUcsRUFBRSxFQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVB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RTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRSxNQUFJO0FBQUEsWUFBRyxHQUFFLFNBQVMsR0FBRSxHQUFFO0FBQUMscUJBQUs7QUFBRSxtQkFBRyxNQUFJLElBQUUsV0FBVyxNQUFJLEdBQUcsQ0FBQyxJQUFFLElBQUUsWUFBWSxFQUFDLGNBQWEsR0FBRSxLQUFJLGVBQWMsQ0FBQyxLQUFHLElBQUUsRUFBRSxHQUFHLENBQUMsTUFBSSxFQUFFLFlBQVksRUFBQyxLQUFJLGVBQWMsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUN4Z0IsR0FBRSxXQUFVO0FBQUMscUJBQU07QUFBQSxZQUFFO0FBQUEsWUFBRSxHQUFFO0FBQUEsWUFBRyxHQUFFLFNBQVMsR0FBRTtBQUFDLG1CQUFHLEVBQUUsR0FBRyxNQUFJLENBQUMsRUFBRSxJQUFJO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsa0JBQUUsSUFBRSxZQUFVLElBQUUsVUFBUSxDQUFDLENBQUMsS0FBRyxNQUFJLEtBQUcsYUFBVyxJQUFFO0FBQUkscUJBQUs7QUFBRSxrQkFBRSxJQUFJLEtBQUssTUFBSSxDQUFDO0FBQUUsZ0JBQUUsRUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFLEVBQUUsY0FBYztBQUFFLGdCQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFLEVBQUUsY0FBYztBQUFFLGdCQUFFLEVBQUUsSUFBRSxLQUFHLE1BQUksQ0FBQyxJQUFFLEVBQUUsWUFBWTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsWUFBWTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsZUFBZSxJQUFFO0FBQUssZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxVQUFVO0FBQUUsbUJBQUcsRUFBRSxRQUFRLElBQUUsS0FBSyxJQUFJLEVBQUUsZUFBZSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLEtBQUcsUUFBTTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsa0JBQUUsSUFDcGYsWUFBVSxJQUFFLFVBQVEsQ0FBQyxDQUFDLEtBQUcsTUFBSSxLQUFHLGFBQVcsSUFBRTtBQUFJLHFCQUFLO0FBQUUsa0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGdCQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFLLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLG1CQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLEtBQUcsRUFBRSxrQkFBa0I7QUFBRyxrQkFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCO0FBQUUsa0JBQUksSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCO0FBQ3pnQixtQkFBRyxLQUFHLEtBQUcsRUFBRSxrQkFBa0IsS0FBRyxLQUFLLElBQUksR0FBRSxDQUFDLEtBQUc7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBSSxJQUFFLElBQUksS0FBSyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLE1BQUssRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRSxJQUFFLEtBQUcsTUFBSSxDQUFDLEdBQUUsRUFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsR0FBRSxDQUFDLEdBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxrQkFBa0IsR0FBRSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0IsR0FBRSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0IsR0FBRSxJQUFFLEtBQUssSUFBSSxHQUFFLENBQUM7QUFBRSxrQkFBRSxJQUFFLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsT0FBTyxLQUFHLEtBQUcsS0FBRyxDQUFDLElBQUUsSUFBRSxNQUFJLEtBQUcsT0FBSyxJQUFFLEtBQUssSUFBSSxHQUFFLENBQUMsR0FBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLElBQUUsUUFBTSxJQUFFLElBQUUsSUFBRSxLQUFHLEVBQUU7QUFBRyxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUNuZixDQUFDLElBQUUsRUFBRSxPQUFPO0FBQUUsbUJBQUcsRUFBRSxFQUFFLFlBQVksQ0FBQyxJQUFFLEtBQUcsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFFLEVBQUUsUUFBUSxJQUFFLElBQUU7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLGdCQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxnQkFBRSxFQUFFLElBQUUsS0FBRyxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxnQkFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxrQkFBRSxFQUFFLFFBQVEsSUFBRTtBQUFJLHFCQUFPLElBQUksSUFBRSxHQUFFLEtBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFFLElBQUUsSUFBRSxDQUFDLEtBQUssTUFBTSxJQUFFLFVBQVUsTUFBSSxJQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQUksTUFBSSxVQUFVLE1BQUksSUFBRSxFQUFFLEdBQUUsTUFBSTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUU7QUFBQSxZQUFHLEdBQUU7QUFBQSxZQUFHLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLHVCQUFTLEVBQUUsR0FBRTtBQUFDLHdCQUFPLElBQUUsRUFBRSxhQUFh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RCxTQUFTLEtBQUs7QUFDWixzQkFBWSxFQUFDLE1BQU0sV0FBVyxJQUFHLENBQW1CO0FBQUEsUUFDdEQ7QUFDQTtBQUFBLE1BQ0YsS0FBSztBQUNILFlBQUk7QUFDRixnQkFBTSxFQUFDLFdBQVcsY0FBYyxRQUFRLGVBQWUsUUFBTyxJQUFJLEdBQUcsS0FBSztBQUMxRSxjQUFJLFdBQVcsY0FBYyxRQUFRLGVBQWUsT0FBTyxFQUN0RDtBQUFBLFlBQ0csYUFBVztBQUNULDBCQUFZLEVBQUMsTUFBTSxPQUFPLEtBQUssUUFBTyxHQUFxQiwyQkFBMkIsT0FBTyxDQUFDO0FBQUEsWUFDaEc7QUFBQSxZQUNBLFNBQU87QUFDTCwwQkFBWSxFQUFDLE1BQU0sT0FBTyxJQUFHLENBQW1CO0FBQUEsWUFDbEQ7QUFBQSxVQUFDO0FBQUEsUUFDWCxTQUFTLEtBQUs7QUFDWixzQkFBWSxFQUFDLE1BQU0sT0FBTyxJQUFHLENBQW1CO0FBQUEsUUFDbEQ7QUFDQTtBQUFBLE1BQ0YsS0FBSztBQUNILFlBQUk7QUFDRixnQkFBTSxVQUFVLEdBQUcsS0FBSztBQUN4Qix1QkFBYSxPQUFPO0FBQ3BCLHNCQUFZLEVBQUMsTUFBTSxnQkFBZSxDQUFtQjtBQUFBLFFBQ3ZELFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSxpQkFBaUIsSUFBRyxDQUFtQjtBQUFBLFFBQzVEO0FBQ0E7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQ0YsZ0JBQU1JLHFCQUFvQixvQkFBb0I7QUFDOUMsc0JBQVksRUFBQyxNQUFNLDBCQUEwQixLQUFLQSxtQkFBaUIsQ0FBbUI7QUFBQSxRQUN4RixTQUFTLEtBQUs7QUFDWixzQkFBWSxFQUFDLE1BQU0sMEJBQTBCLElBQUcsQ0FBbUI7QUFBQSxRQUNyRTtBQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJqb2luIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgIndhc20iLCAidGVuc29yIiwgImVycm9yQ29kZSIsICJpIiwgIm9ydEVudkluaXRpYWxpemVkIl0KfQo=\n';
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

// web/lib/backend-wasm-inference.ts
var backend_wasm_inference_exports = {};
__export(backend_wasm_inference_exports, {
  wasmBackend: () => wasmBackend
});
var wasmBackend;
var init_backend_wasm_inference = __esm({
  "web/lib/backend-wasm-inference.ts"() {
    "use strict";
    init_backend_wasm();
    wasmBackend = new OnnxruntimeWebAssemblyBackend();
  }
});

// web/lib/index.ts
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
  const wasmBackend2 = true ? (init_backend_wasm_inference(), __toCommonJS(backend_wasm_inference_exports)).wasmBackend : null.wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
  if (true) {
    registerBackend("xnnpack", wasmBackend2, 9);
    registerBackend("webnn", wasmBackend2, 9);
  }
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });
export {
  InferenceSession2 as InferenceSession,
  Tensor2 as Tensor,
  TrainingSession2 as TrainingSession,
  lib_default as default,
  env2 as env,
  registerBackend
};