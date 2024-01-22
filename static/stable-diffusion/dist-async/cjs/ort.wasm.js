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

// common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, resolveBackend;
var init_backend_impl = __esm({
  "common/dist/esm/backend-impl.js"() {
    "use strict";
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
              backendInfo.initPromise = backendInfo.backend.init(backendName);
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

// common/dist/esm/backend.js
var init_backend = __esm({
  "common/dist/esm/backend.js"() {
    "use strict";
    init_backend_impl();
  }
});

// common/dist/esm/version.js
var version;
var init_version = __esm({
  "common/dist/esm/version.js"() {
    "use strict";
    version = "1.17.0";
  }
});

// common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "common/dist/esm/env-impl.js"() {
    "use strict";
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

// common/dist/esm/env.js
var env2;
var init_env = __esm({
  "common/dist/esm/env.js"() {
    "use strict";
    init_env_impl();
    env2 = env;
  }
});

// common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "common/dist/esm/tensor-conversion-impl.js"() {
    "use strict";
    tensorToDataURL = (tensor, options) => {
      const canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
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
        if ("toDataURL" in canvas) {
          return canvas.toDataURL();
        } else {
          throw new Error("toDataURL is not supported");
        }
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d");
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

// common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "common/dist/esm/tensor-factory-impl.js"() {
    "use strict";
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
      const createCanvas = () => {
        if (typeof document !== "undefined") {
          return document.createElement("canvas");
        } else if (typeof OffscreenCanvas !== "undefined") {
          return new OffscreenCanvas(1, 1);
        } else {
          throw new Error("Canvas is not supported");
        }
      };
      const createCanvasContext = (canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
          return canvas.getContext("2d");
        } else if (canvas instanceof OffscreenCanvas) {
          return canvas.getContext("2d");
        } else {
          return null;
        }
      };
      if (isHTMLImageEle) {
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
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
          const tempCanvas = createCanvas();
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = createCanvasContext(tempCanvas);
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
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
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
          const canvas = createCanvas();
          const context = createCanvasContext(canvas);
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

// common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isBigIntChecked, checkBigInt;
var init_tensor_impl_type_mapping = __esm({
  "common/dist/esm/tensor-impl-type-mapping.js"() {
    "use strict";
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

// common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "common/dist/esm/tensor-utils-impl.js"() {
    "use strict";
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

// common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "common/dist/esm/tensor-impl.js"() {
    "use strict";
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

// common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "common/dist/esm/tensor.js"() {
    "use strict";
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// common/dist/esm/trace.js
var TRACE, TRACE_FUNC, TRACE_FUNC_BEGIN, TRACE_FUNC_END;
var init_trace = __esm({
  "common/dist/esm/trace.js"() {
    "use strict";
    init_env_impl();
    TRACE = (deviceType, label) => {
      if (!env.wasm.trace) {
        return;
      }
      console.timeStamp(`${deviceType}::ORT::${label}`);
    };
    TRACE_FUNC = (msg, extraMsg) => {
      const stack = new Error().stack?.split(/\r\n|\r|\n/g) || [];
      let hasTraceFunc = false;
      for (let i = 0; i < stack.length; i++) {
        if (hasTraceFunc && !stack[i].includes("TRACE_FUNC")) {
          let label = `FUNC_${msg}::${stack[i].trim().split(" ")[1]}`;
          if (extraMsg) {
            label += `::${extraMsg}`;
          }
          TRACE("CPU", label);
          return;
        }
        if (stack[i].includes("TRACE_FUNC")) {
          hasTraceFunc = true;
        }
      }
    };
    TRACE_FUNC_BEGIN = (extraMsg) => {
      if (!env.wasm.trace) {
        return;
      }
      TRACE_FUNC("BEGIN", extraMsg);
    };
    TRACE_FUNC_END = (extraMsg) => {
      if (!env.wasm.trace) {
        return;
      }
      TRACE_FUNC("END", extraMsg);
    };
  }
});

// common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "common/dist/esm/inference-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    init_trace();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        TRACE_FUNC_BEGIN();
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
        TRACE_FUNC_END();
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        TRACE_FUNC_BEGIN();
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
        TRACE_FUNC_END();
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

// common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "common/dist/esm/inference-session.js"() {
    "use strict";
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "common/dist/esm/onnx-value.js"() {
    "use strict";
  }
});

// common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "common/dist/esm/training-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler, hasOptimizerModel, hasEvalModel) {
        this.handler = handler;
        this.hasOptimizerModel = hasOptimizerModel;
        this.hasEvalModel = hasEvalModel;
      }
      get trainingInputNames() {
        return this.handler.inputNames;
      }
      get trainingOutputNames() {
        return this.handler.outputNames;
      }
      get evalInputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalInputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      get evalOutputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalOutputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
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
          return new _TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
       * names.
       * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
       * names.
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
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
              if (outputNames.indexOf(name) === -1) {
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
            for (const name of outputNames) {
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
        for (const name of inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of outputNames) {
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
      async lazyResetGrad() {
        await this.handler.lazyResetGrad();
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async runOptimizerStep(options) {
        if (this.hasOptimizerModel) {
          await this.handler.runOptimizerStep(options || {});
        } else {
          throw new Error("This TrainingSession has no OptimizerModel loaded.");
        }
      }
      async runEvalStep(feeds, arg1, arg2) {
        if (this.hasEvalModel) {
          const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
          const results = await this.handler.runEvalStep(feeds, fetches, options);
          return this.convertHandlerReturnTypeToMapOfTensors(results);
        } else {
          throw new Error("This TrainingSession has no EvalModel loaded.");
        }
      }
      async getParametersSize(trainableOnly = true) {
        return this.handler.getParametersSize(trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly = true) {
        const paramsSize = await this.getParametersSize(trainableOnly);
        if (array.length !== 4 * paramsSize) {
          throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
        }
        return this.handler.loadParametersBuffer(array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly = true) {
        return this.handler.getContiguousParameters(trainableOnly);
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "common/dist/esm/training-session.js"() {
    "use strict";
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
  }
});

// common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "common/dist/esm/index.js"() {
    "use strict";
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_trace();
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
  createReadStream: () => createReadStream,
  readFile: () => readFile,
  readFileSync: () => readFileSync
});
var readFile, readFileSync, createReadStream;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
    readFileSync = void 0;
    createReadStream = void 0;
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
  "web/lib/wasm/binding/ort-wasm.js"(exports, module2) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;
      if (typeof __filename !== "undefined")
        _scriptDir = _scriptDir || __filename;
      return function(moduleArg = {}) {
        var g = moduleArg, aa, l;
        g.ready = new Promise((a, b) => {
          aa = a;
          l = b;
        });
        var ba = Object.assign({}, g), ca = "./this.program", da = "object" == typeof window, p = "function" == typeof importScripts, ea = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, t = "", fa, w, x;
        if (ea) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), ha = (init_path(), __toCommonJS(path_exports));
          t = p ? ha.dirname(t) + "/" : __dirname + "/";
          fa = (a, b) => {
            a = z(a) ? new URL(a) : ha.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          x = (a) => {
            a = fa(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          w = (a, b, c, d = true) => {
            a = z(a) ? new URL(a) : ha.normalize(a);
            fs.readFile(a, d ? void 0 : "utf8", (e, h) => {
              e ? c(e) : b(d ? h.buffer : h);
            });
          };
          !g.thisProgram && 1 < process.argv.length && (ca = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          g.inspect = () => "[Emscripten Module object]";
        } else if (da || p)
          p ? t = self.location.href : "undefined" != typeof document && document.currentScript && (t = document.currentScript.src), _scriptDir && (t = _scriptDir), 0 !== t.indexOf("blob:") ? t = t.substr(0, t.replace(/[?#].*/, "").lastIndexOf("/") + 1) : t = "", fa = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, p && (x = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), w = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          };
        var ia = console.log.bind(console), A = console.error.bind(console);
        Object.assign(g, ba);
        ba = null;
        "object" != typeof WebAssembly && ja("no native wasm support detected");
        var B, ka = false, C, D, E, G, I, J, la, ma, na, oa;
        function pa() {
          var a = B.buffer;
          g.HEAP8 = C = new Int8Array(a);
          g.HEAP16 = E = new Int16Array(a);
          g.HEAPU8 = D = new Uint8Array(a);
          g.HEAPU16 = G = new Uint16Array(a);
          g.HEAP32 = I = new Int32Array(a);
          g.HEAPU32 = J = new Uint32Array(a);
          g.HEAPF32 = la = new Float32Array(a);
          g.HEAPF64 = oa = new Float64Array(a);
          g.HEAP64 = ma = new BigInt64Array(a);
          g.HEAPU64 = na = new BigUint64Array(a);
        }
        var qa = [], ra = [], sa = [], K = 0, ta = null, L = null;
        function ja(a) {
          a = "Aborted(" + a + ")";
          A(a);
          ka = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        var ua = (a) => a.startsWith("data:application/octet-stream;base64,"), z = (a) => a.startsWith("file://"), M;
        M = "ort-wasm.wasm";
        if (!ua(M)) {
          var va = M;
          M = g.locateFile ? g.locateFile(va, t) : t + va;
        }
        function wa(a) {
          if (x)
            return x(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function xa(a) {
          if (da || p) {
            if ("function" == typeof fetch && !z(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => wa(a));
            if (w)
              return new Promise((b, c) => {
                w(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => wa(a));
        }
        function ya(a, b, c) {
          return xa(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            A(`failed to asynchronously prepare wasm: ${d}`);
            ja(d);
          });
        }
        function za(a, b) {
          var c = M;
          return "function" != typeof WebAssembly.instantiateStreaming || ua(c) || z(c) || ea || "function" != typeof fetch ? ya(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
            A(`wasm streaming compile failed: ${e}`);
            A("falling back to ArrayBuffer instantiation");
            return ya(c, a, b);
          }));
        }
        var Aa = { 890824: (a, b, c, d) => {
          if ("undefined" == typeof g || !g.cb)
            return 1;
          a = N(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = g.cb.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return D.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        function Ba(a) {
          this.Ua = a - 24;
          this.fb = function(b) {
            J[this.Ua + 4 >>> 2 >>> 0] = b;
          };
          this.eb = function(b) {
            J[this.Ua + 8 >>> 2 >>> 0] = b;
          };
          this.Ya = function(b, c) {
            this.Za();
            this.fb(b);
            this.eb(c);
          };
          this.Za = function() {
            J[this.Ua + 16 >>> 2 >>> 0] = 0;
          };
        }
        var Ca = 0, Da = 0, Ea = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Fa = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && Ea)
            return Ea.decode(a.subarray(b, c));
          for (d = ""; b < c; ) {
            var e = a[b++];
            if (e & 128) {
              var h = a[b++] & 63;
              if (192 == (e & 224))
                d += String.fromCharCode((e & 31) << 6 | h);
              else {
                var k = a[b++] & 63;
                e = 224 == (e & 240) ? (e & 15) << 12 | h << 6 | k : (e & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;
                65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
              }
            } else
              d += String.fromCharCode(e);
          }
          return d;
        }, N = (a, b) => (a >>>= 0) ? Fa(D, a, b) : "", O = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, P = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var e = c;
          d = c + d - 1;
          for (var h = 0; h < a.length; ++h) {
            var k = a.charCodeAt(h);
            if (55296 <= k && 57343 >= k) {
              var m = a.charCodeAt(++h);
              k = 65536 + ((k & 1023) << 10) | m & 1023;
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
          return c - e;
        }, Ga = (a) => {
          if (null === a)
            return "null";
          var b = typeof a;
          return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
        }, Ha, Q = (a) => {
          for (var b = ""; D[a >>> 0]; )
            b += Ha[D[a++ >>> 0]];
          return b;
        }, Ia = {}, Ja = {}, Ka = {}, R;
        function La(a, b, c = {}) {
          var d = b.name;
          if (!a)
            throw new R(`type "${d}" must have a positive integer typeid pointer`);
          if (Ja.hasOwnProperty(a)) {
            if (c.gb)
              return;
            throw new R(`Cannot register type '${d}' twice`);
          }
          Ja[a] = b;
          delete Ka[a];
          Ia.hasOwnProperty(a) && (b = Ia[a], delete Ia[a], b.forEach((e) => e()));
        }
        function S(a, b, c = {}) {
          if (!("argPackAdvance" in b))
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          La(a, b, c);
        }
        var Ma = (a, b, c) => {
          switch (b) {
            case 1:
              return c ? (d) => C[d >>> 0 >>> 0] : (d) => D[d >>> 0 >>> 0];
            case 2:
              return c ? (d) => E[d >>> 1 >>> 0] : (d) => G[d >>> 1 >>> 0];
            case 4:
              return c ? (d) => I[d >>> 2 >>> 0] : (d) => J[d >>> 2 >>> 0];
            case 8:
              return c ? (d) => ma[d >>> 3] : (d) => na[d >>> 3];
            default:
              throw new TypeError(`invalid integer width (${b}): ${a}`);
          }
        };
        function Na() {
          this.Ra = [void 0];
          this.ab = [];
        }
        var T = new Na();
        function Oa(a) {
          a >>>= 0;
          a >= T.Ua && 0 === --T.get(a).bb && T.Za(a);
        }
        var U = (a) => {
          if (!a)
            throw new R("Cannot use deleted val. handle = " + a);
          return T.get(a).value;
        }, V = (a) => {
          switch (a) {
            case void 0:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default:
              return T.Ya({ bb: 1, value: a });
          }
        };
        function Pa(a) {
          return this.fromWireType(I[a >>> 2 >>> 0]);
        }
        var Qa = (a, b) => {
          switch (b) {
            case 4:
              return function(c) {
                return this.fromWireType(la[c >>> 2 >>> 0]);
              };
            case 8:
              return function(c) {
                return this.fromWireType(oa[c >>> 3 >>> 0]);
              };
            default:
              throw new TypeError(`invalid float width (${b}): ${a}`);
          }
        };
        function Ra(a) {
          return this.fromWireType(J[a >>> 2 >>> 0]);
        }
        var Sa = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ta = (a, b) => {
          var c = a >> 1;
          for (var d = c + b / 2; !(c >= d) && G[c >>> 0]; )
            ++c;
          c <<= 1;
          if (32 < c - a && Sa)
            return Sa.decode(D.subarray(a >>> 0, c >>> 0));
          c = "";
          for (d = 0; !(d >= b / 2); ++d) {
            var e = E[a + 2 * d >>> 1 >>> 0];
            if (0 == e)
              break;
            c += String.fromCharCode(e);
          }
          return c;
        }, Ua = (a, b, c) => {
          c ??= 2147483647;
          if (2 > c)
            return 0;
          c -= 2;
          var d = b;
          c = c < 2 * a.length ? c / 2 : a.length;
          for (var e = 0; e < c; ++e)
            E[b >>> 1 >>> 0] = a.charCodeAt(e), b += 2;
          E[b >>> 1 >>> 0] = 0;
          return b - d;
        }, Va = (a) => 2 * a.length, Wa = (a, b) => {
          for (var c = 0, d = ""; !(c >= b / 4); ) {
            var e = I[a + 4 * c >>> 2 >>> 0];
            if (0 == e)
              break;
            ++c;
            65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
          }
          return d;
        }, Xa = (a, b, c) => {
          b >>>= 0;
          c ??= 2147483647;
          if (4 > c)
            return 0;
          var d = b;
          c = d + c - 4;
          for (var e = 0; e < a.length; ++e) {
            var h = a.charCodeAt(e);
            if (55296 <= h && 57343 >= h) {
              var k = a.charCodeAt(++e);
              h = 65536 + ((h & 1023) << 10) | k & 1023;
            }
            I[b >>> 2 >>> 0] = h;
            b += 4;
            if (b + 4 > c)
              break;
          }
          I[b >>> 2 >>> 0] = 0;
          return b - d;
        }, Ya = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            55296 <= d && 57343 >= d && ++c;
            b += 4;
          }
          return b;
        }, $a = (a, b) => {
          var c = Ja[a];
          if (void 0 === c)
            throw a = Za(a), c = Q(a), W(a), new R(b + " has unknown type " + c);
          return c;
        }, ab = (a, b, c) => {
          var d = [];
          a = a.toWireType(d, c);
          d.length && (J[b >>> 2 >>> 0] = V(d));
          return a;
        }, X = [], cb = {}, db = (a) => {
          var b = cb[a];
          return void 0 === b ? Q(a) : b;
        }, eb = () => "object" == typeof globalThis ? globalThis : Function("return this")(), fb = (a) => {
          var b = X.length;
          X.push(a);
          return b;
        }, gb = (a, b) => {
          for (var c = Array(a), d = 0; d < a; ++d)
            c[d] = $a(J[b + 4 * d >>> 2 >>> 0], "parameter " + d);
          return c;
        }, hb = (a, b) => Object.defineProperty(
          b,
          "name",
          { value: a }
        );
        function ib(a) {
          var b = Function;
          if (!(b instanceof Function))
            throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
          var c = hb(b.name || "unknownFunctionName", function() {
          });
          c.prototype = b.prototype;
          c = new c();
          a = b.apply(c, a);
          return a instanceof Object ? a : c;
        }
        var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), jb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], kb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], mb = (a) => {
          var b = O(a) + 1, c = lb(b);
          c && P(a, D, c, b);
          return c;
        }, nb = [], ob = {}, qb = () => {
          if (!pb) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ca || "./this.program" }, b;
            for (b in ob)
              void 0 === ob[b] ? delete a[b] : a[b] = ob[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            pb = c;
          }
          return pb;
        }, pb, rb = [null, [], []], sb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], tb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function ub(a) {
          var b = Array(O(a) + 1);
          P(a, b, 0, b.length);
          return b;
        }
        function vb(a, b, c, d) {
          function e(f, r, u) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )
              f = u[0] + f;
            return f;
          }
          function h(f, r) {
            return e(f, r, "0");
          }
          function k(f, r) {
            function u(bb) {
              return 0 > bb ? -1 : 0 < bb ? 1 : 0;
            }
            var H;
            0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));
            return H;
          }
          function m(f) {
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
          function q(f) {
            var r = f.Sa;
            for (f = new Date(new Date(f.Ta + 1900, 0, 1).getTime()); 0 < r; ) {
              var u = f.getMonth(), H = (Y(f.getFullYear()) ? sb : tb)[u];
              if (r > H - f.getDate())
                r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + r);
                break;
              }
            }
            u = new Date(f.getFullYear() + 1, 0, 4);
            r = m(new Date(
              f.getFullYear(),
              0,
              4
            ));
            u = m(u);
            return 0 >= k(r, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var n = J[d + 40 >>> 2 >>> 0];
          d = { kb: I[d >>> 2 >>> 0], jb: I[d + 4 >>> 2 >>> 0], Wa: I[d + 8 >>> 2 >>> 0], $a: I[d + 12 >>> 2 >>> 0], Xa: I[d + 16 >>> 2 >>> 0], Ta: I[d + 20 >>> 2 >>> 0], Na: I[d + 24 >>> 2 >>> 0], Sa: I[d + 28 >>> 2 >>> 0], mb: I[d + 32 >>> 2 >>> 0], ib: I[d + 36 >>> 2 >>> 0], lb: n ? N(n) : "" };
          c = N(c);
          n = {
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
          for (var v in n)
            c = c.replace(new RegExp(v, "g"), n[v]);
          var y = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), F = "January February March April May June July August September October November December".split(" ");
          n = { "%a": (f) => y[f.Na].substring(0, 3), "%A": (f) => y[f.Na], "%b": (f) => F[f.Xa].substring(0, 3), "%B": (f) => F[f.Xa], "%C": (f) => h((f.Ta + 1900) / 100 | 0, 2), "%d": (f) => h(f.$a, 2), "%e": (f) => e(f.$a, 2, " "), "%g": (f) => q(f).toString().substring(2), "%G": (f) => q(f), "%H": (f) => h(f.Wa, 2), "%I": (f) => {
            f = f.Wa;
            0 == f ? f = 12 : 12 < f && (f -= 12);
            return h(f, 2);
          }, "%j": (f) => {
            for (var r = 0, u = 0; u <= f.Xa - 1; r += (Y(f.Ta + 1900) ? sb : tb)[u++])
              ;
            return h(f.$a + r, 3);
          }, "%m": (f) => h(f.Xa + 1, 2), "%M": (f) => h(f.jb, 2), "%n": () => "\n", "%p": (f) => 0 <= f.Wa && 12 > f.Wa ? "AM" : "PM", "%S": (f) => h(f.kb, 2), "%t": () => "	", "%u": (f) => f.Na || 7, "%U": (f) => h(Math.floor((f.Sa + 7 - f.Na) / 7), 2), "%V": (f) => {
            var r = Math.floor((f.Sa + 7 - (f.Na + 6) % 7) / 7);
            2 >= (f.Na + 371 - f.Sa - 2) % 7 && r++;
            if (r)
              53 == r && (u = (f.Na + 371 - f.Sa) % 7, 4 == u || 3 == u && Y(f.Ta) || (r = 1));
            else {
              r = 52;
              var u = (f.Na + 7 - f.Sa - 1) % 7;
              (4 == u || 5 == u && Y(f.Ta % 400 - 1)) && r++;
            }
            return h(r, 2);
          }, "%w": (f) => f.Na, "%W": (f) => h(Math.floor((f.Sa + 7 - (f.Na + 6) % 7) / 7), 2), "%y": (f) => (f.Ta + 1900).toString().substring(2), "%Y": (f) => f.Ta + 1900, "%z": (f) => {
            f = f.ib;
            var r = 0 <= f;
            f = Math.abs(f) / 60;
            return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
          }, "%Z": (f) => f.lb, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (v in n)
            c.includes(v) && (c = c.replace(new RegExp(v, "g"), n[v](d)));
          c = c.replace(/\0\0/g, "%");
          v = ub(c);
          if (v.length > b)
            return 0;
          C.set(v, a >>> 0);
          return v.length - 1;
        }
        for (var wb = Array(256), xb = 0; 256 > xb; ++xb)
          wb[xb] = String.fromCharCode(xb);
        Ha = wb;
        R = g.BindingError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "BindingError";
          }
        };
        g.InternalError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "InternalError";
          }
        };
        Object.assign(Na.prototype, { get(a) {
          return this.Ra[a];
        }, has(a) {
          return void 0 !== this.Ra[a];
        }, Ya(a) {
          var b = this.ab.pop() || this.Ra.length;
          this.Ra[b] = a;
          return b;
        }, Za(a) {
          this.Ra[a] = void 0;
          this.ab.push(a);
        } });
        T.Ra.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
        T.Ua = T.Ra.length;
        g.count_emval_handles = () => {
          for (var a = 0, b = T.Ua; b < T.Ra.length; ++b)
            void 0 !== T.Ra[b] && ++a;
          return a;
        };
        var zb = {
          a: function(a, b, c) {
            a >>>= 0;
            new Ba(a).Ya(b >>> 0, c >>> 0);
            Ca = a;
            Da++;
            throw Ca;
          },
          t: function() {
            return 0;
          },
          $: function() {
          },
          M: function() {
          },
          O: function() {
          },
          G: function() {
            return 0;
          },
          Z: function() {
          },
          U: function() {
          },
          Y: function() {
          },
          B: function() {
          },
          N: function() {
          },
          K: function() {
          },
          _: function() {
          },
          L: function() {
          },
          E: function(a, b, c, d, e) {
            b >>>= 0;
            b = Q(b);
            var h = -1 != b.indexOf("u");
            h && (e = (1n << 64n) - 1n);
            S(a >>> 0, { name: b, fromWireType: (k) => k, toWireType: function(k, m) {
              if ("bigint" != typeof m && "number" != typeof m)
                throw new TypeError(`Cannot convert "${Ga(m)}" to ${this.name}`);
              if (m < d || m > e)
                throw new TypeError(`Passing a number "${Ga(m)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
              return m;
            }, argPackAdvance: 8, readValueFromPointer: Ma(b, c >>> 0, !h), Va: null });
          },
          da: function(a, b, c, d) {
            b = Q(b >>> 0);
            S(a >>> 0, { name: b, fromWireType: function(e) {
              return !!e;
            }, toWireType: function(e, h) {
              return h ? c : d;
            }, argPackAdvance: 8, readValueFromPointer: function(e) {
              return this.fromWireType(D[e >>> 0]);
            }, Va: null });
          },
          ca: function(a, b) {
            b = Q(b >>> 0);
            S(a >>> 0, {
              name: b,
              fromWireType: (c) => {
                var d = U(c);
                Oa(c);
                return d;
              },
              toWireType: (c, d) => V(d),
              argPackAdvance: 8,
              readValueFromPointer: Pa,
              Va: null
            });
          },
          D: function(a, b, c) {
            b = Q(b >>> 0);
            S(a >>> 0, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Qa(b, c >>> 0), Va: null });
          },
          q: function(a, b, c, d, e) {
            a >>>= 0;
            c >>>= 0;
            b = Q(b >>> 0);
            -1 === e && (e = 4294967295);
            e = (m) => m;
            if (0 === d) {
              var h = 32 - 8 * c;
              e = (m) => m << h >>> h;
            }
            var k = b.includes("unsigned") ? function(m, q) {
              return q >>> 0;
            } : function(m, q) {
              return q;
            };
            S(a, {
              name: b,
              fromWireType: e,
              toWireType: k,
              argPackAdvance: 8,
              readValueFromPointer: Ma(b, c, 0 !== d),
              Va: null
            });
          },
          l: function(a, b, c) {
            function d(h) {
              return new e(C.buffer, J[h + 4 >>> 2 >>> 0], J[h >>> 2 >>> 0]);
            }
            var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
            c = Q(c >>> 0);
            S(a >>> 0, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { gb: true });
          },
          F: function(a, b) {
            b = Q(b >>> 0);
            var c = "std::string" === b;
            S(a >>> 0, { name: b, fromWireType: function(d) {
              var e = J[d >>> 2 >>> 0], h = d + 4;
              if (c)
                for (var k = h, m = 0; m <= e; ++m) {
                  var q = h + m;
                  if (m == e || 0 == D[q >>> 0]) {
                    k = N(k, q - k);
                    if (void 0 === n)
                      var n = k;
                    else
                      n += String.fromCharCode(0), n += k;
                    k = q + 1;
                  }
                }
              else {
                n = Array(e);
                for (m = 0; m < e; ++m)
                  n[m] = String.fromCharCode(D[h + m >>> 0]);
                n = n.join("");
              }
              W(d);
              return n;
            }, toWireType: function(d, e) {
              e instanceof ArrayBuffer && (e = new Uint8Array(e));
              var h = "string" == typeof e;
              if (!(h || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                throw new R("Cannot pass non-string to std::string");
              var k = c && h ? O(e) : e.length;
              var m = lb(4 + k + 1), q = m + 4;
              J[m >>> 2 >>> 0] = k;
              if (c && h)
                P(e, D, q, k + 1);
              else if (h)
                for (h = 0; h < k; ++h) {
                  var n = e.charCodeAt(h);
                  if (255 < n)
                    throw W(q), new R("String has UTF-16 code units that do not fit in 8 bits");
                  D[q + h >>> 0] = n;
                }
              else
                for (h = 0; h < k; ++h)
                  D[q + h >>> 0] = e[h];
              null !== d && d.push(W, m);
              return m;
            }, argPackAdvance: 8, readValueFromPointer: Ra, Va(d) {
              W(d);
            } });
          },
          v: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            c = Q(c);
            if (2 === b) {
              var d = Ta;
              var e = Ua;
              var h = Va;
              var k = () => G;
              var m = 1;
            } else
              4 === b && (d = Wa, e = Xa, h = Ya, k = () => J, m = 2);
            S(a >>> 0, { name: c, fromWireType: (q) => {
              for (var n = J[q >>> 2 >>> 0], v = k(), y, F = q + 4, f = 0; f <= n; ++f) {
                var r = q + 4 + f * b;
                if (f == n || 0 == v[r >>> m])
                  F = d(F, r - F), void 0 === y ? y = F : (y += String.fromCharCode(0), y += F), F = r + b;
              }
              W(q);
              return y;
            }, toWireType: (q, n) => {
              if ("string" != typeof n)
                throw new R(`Cannot pass non-string to C++ string type ${c}`);
              var v = h(n), y = lb(4 + v + b);
              J[y >>> 2] = v >> m;
              e(n, y + 4, v + b);
              null !== q && q.push(W, y);
              return y;
            }, argPackAdvance: 8, readValueFromPointer: Pa, Va(q) {
              W(q);
            } });
          },
          ea: function(a, b) {
            b = Q(b >>> 0);
            S(a >>> 0, { hb: true, name: b, argPackAdvance: 0, fromWireType: () => {
            }, toWireType: () => {
            } });
          },
          aa: () => 1,
          o: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = U(a >>> 0);
            b = $a(b, "emval::as");
            return ab(b, c, a);
          },
          x: function(a, b, c, d) {
            c >>>= 0;
            d >>>= 0;
            a = X[a >>> 0];
            b = U(b >>> 0);
            return a(null, b, c, d);
          },
          j: function(a, b, c, d, e) {
            c >>>= 0;
            d >>>= 0;
            e >>>= 0;
            a = X[a >>> 0];
            b = U(b >>> 0);
            c = db(c);
            return a(b, b[c], d, e);
          },
          b: Oa,
          w: function(a, b) {
            b >>>= 0;
            a = U(a >>> 0);
            b = U(b);
            return a == b;
          },
          s: function(a) {
            a >>>= 0;
            if (0 === a)
              return V(eb());
            a = db(a);
            return V(eb()[a]);
          },
          i: function(a, b, c) {
            b = gb(a, b >>> 0);
            var d = b.shift();
            a--;
            var e = "return function (obj, func, destructorsRef, args) {\n", h = 0, k = [];
            0 === c && k.push("obj");
            for (var m = ["retType"], q = [d], n = 0; n < a; ++n)
              k.push("arg" + n), m.push("argType" + n), q.push(b[n]), e += `  var arg${n} = argType${n}.readValueFromPointer(args${h ? "+" + h : ""});
`, h += b[n].argPackAdvance;
            e += `  var rv = ${1 === c ? "new func" : "func.call"}(${k.join(", ")});
`;
            for (n = 0; n < a; ++n)
              b[n].deleteObject && (e += `  argType${n}.deleteObject(arg${n});
`);
            d.hb || (m.push("emval_returnValue"), q.push(ab), e += "  return emval_returnValue(retType, destructorsRef, rv);\n");
            m.push(e + "};\n");
            a = ib(m).apply(null, q);
            c = `methodCaller<(${b.map((v) => v.name).join(", ")}) => ${d.name}>`;
            return fb(hb(c, a));
          },
          p: function(a, b) {
            b >>>= 0;
            a = U(a >>> 0);
            b = U(b);
            return V(a[b]);
          },
          c: function(a) {
            a >>>= 0;
            4 < a && (T.get(a).bb += 1);
          },
          r: function() {
            return V([]);
          },
          k: function(a) {
            a = U(a >>> 0);
            for (var b = Array(a.length), c = 0; c < a.length; c++)
              b[c] = a[c];
            return V(b);
          },
          d: function(a) {
            return V(db(a >>> 0));
          },
          h: function() {
            return V({});
          },
          g: function(a) {
            a >>>= 0;
            for (var b = U(a); b.length; ) {
              var c = b.pop();
              b.pop()(c);
            }
            Oa(a);
          },
          f: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = U(a >>> 0);
            b = U(b);
            c = U(c);
            a[b] = c;
          },
          e: function(a, b) {
            b >>>= 0;
            a = $a(a >>> 0, "_emval_take_value");
            a = a.readValueFromPointer(b);
            return V(a);
          },
          R: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            I[b >>> 2 >>> 0] = a.getUTCSeconds();
            I[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
            I[b + 8 >>> 2 >>> 0] = a.getUTCHours();
            I[b + 12 >>> 2 >>> 0] = a.getUTCDate();
            I[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
            I[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
            I[b + 24 >>> 2 >>> 0] = a.getUTCDay();
            I[b + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
          },
          S: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            I[b >>> 2 >>> 0] = a.getSeconds();
            I[b + 4 >>> 2 >>> 0] = a.getMinutes();
            I[b + 8 >>> 2 >>> 0] = a.getHours();
            I[b + 12 >>> 2 >>> 0] = a.getDate();
            I[b + 16 >>> 2 >>> 0] = a.getMonth();
            I[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
            I[b + 24 >>> 2 >>> 0] = a.getDay();
            I[b + 28 >>> 2 >>> 0] = (Y(a.getFullYear()) ? jb : kb)[a.getMonth()] + a.getDate() - 1 | 0;
            I[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            var c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(), d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            I[b + 32 >>> 2 >>> 0] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
          },
          T: function(a) {
            a >>>= 0;
            var b = new Date(I[a + 20 >>> 2 >>> 0] + 1900, I[a + 16 >>> 2 >>> 0], I[a + 12 >>> 2 >>> 0], I[a + 8 >>> 2 >>> 0], I[a + 4 >>> 2 >>> 0], I[a >>> 2 >>> 0], 0), c = I[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, e);
            0 > c ? I[a + 32 >>> 2 >>> 0] = Number(e != h && k == d) : 0 < c != (k == d) && (e = Math.max(h, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));
            I[a + 24 >>> 2 >>> 0] = b.getDay();
            I[a + 28 >>> 2 >>> 0] = (Y(b.getFullYear()) ? jb : kb)[b.getMonth()] + b.getDate() - 1 | 0;
            I[a >>> 2 >>> 0] = b.getSeconds();
            I[a + 4 >>> 2 >>> 0] = b.getMinutes();
            I[a + 8 >>> 2 >>> 0] = b.getHours();
            I[a + 12 >>> 2 >>> 0] = b.getDate();
            I[a + 16 >>> 2 >>> 0] = b.getMonth();
            I[a + 20 >>> 2 >>> 0] = b.getYear();
            a = b.getTime();
            isNaN(a) ? (I[yb() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;
            return BigInt(a);
          },
          P: function() {
            return -52;
          },
          Q: function() {
          },
          I: function(a, b, c) {
            function d(q) {
              return (q = q.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? q[1] : "GMT";
            }
            c >>>= 0;
            var e = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(
              e,
              0,
              1
            ), k = new Date(e, 6, 1);
            e = h.getTimezoneOffset();
            var m = k.getTimezoneOffset();
            J[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(e, m);
            I[b >>> 0 >>> 2 >>> 0] = Number(e != m);
            a = d(h);
            b = d(k);
            a = mb(a);
            b = mb(b);
            m < e ? (J[c >>> 2 >>> 0] = a, J[c + 4 >>> 2 >>> 0] = b) : (J[c >>> 2 >>> 0] = b, J[c + 4 >>> 2 >>> 0] = a);
          },
          y: () => {
            ja("");
          },
          fa: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            nb.length = 0;
            for (var d; d = D[b++ >>> 0]; ) {
              var e = 105 != d;
              e &= 112 != d;
              c += e && c % 8 ? 4 : 0;
              nb.push(112 == d ? J[c >>> 2 >>> 0] : 106 == d ? ma[c >>> 3] : 105 == d ? I[c >>> 2 >>> 0] : oa[c >>> 3 >>> 0]);
              c += e ? 8 : 4;
            }
            return Aa[a].apply(null, nb);
          },
          C: () => Date.now(),
          J: function() {
            return 4294901760;
          },
          n: () => performance.now(),
          H: function(a) {
            a >>>= 0;
            var b = D.length;
            if (4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var e = Math;
              d = Math.max(a, d);
              a: {
                e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - B.buffer.byteLength + 65535) / 65536;
                try {
                  B.grow(e);
                  pa();
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
          W: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = 0;
            qb().forEach((d, e) => {
              var h = b + c;
              e = J[a + 4 * e >>> 2 >>> 0] = h;
              for (h = 0; h < d.length; ++h)
                C[e++ >>> 0 >>> 0] = d.charCodeAt(h);
              C[e >>> 0 >>> 0] = 0;
              c += d.length + 1;
            });
            return 0;
          },
          X: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = qb();
            J[a >>> 2 >>> 0] = c.length;
            var d = 0;
            c.forEach((e) => d += e.length + 1);
            J[b >>> 2 >>> 0] = d;
            return 0;
          },
          u: () => 52,
          A: function() {
            return 52;
          },
          V: function() {
            return 70;
          },
          z: function(a, b, c, d) {
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            for (var e = 0, h = 0; h < c; h++) {
              var k = J[b >>> 2 >>> 0], m = J[b + 4 >>> 2 >>> 0];
              b += 8;
              for (var q = 0; q < m; q++) {
                var n = D[k + q >>> 0], v = rb[a];
                0 === n || 10 === n ? ((1 === a ? ia : A)(Fa(v, 0)), v.length = 0) : v.push(n);
              }
              e += m;
            }
            J[d >>> 2 >>> 0] = e;
            return 0;
          },
          ba: vb,
          m: function(a, b, c, d) {
            return vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          }
        }, Z = function() {
          function a(c) {
            Z = c.exports;
            Z = Ab();
            B = Z.ga;
            pa();
            ra.unshift(Z.ha);
            K--;
            0 == K && (null !== ta && (clearInterval(ta), ta = null), L && (c = L, L = null, c()));
            return Z;
          }
          var b = { a: zb };
          K++;
          if (g.instantiateWasm)
            try {
              return g.instantiateWasm(b, a);
            } catch (c) {
              A(`Module.instantiateWasm callback failed with error: ${c}`), l(c);
            }
          za(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        }();
        g._OrtInit = (a, b) => (g._OrtInit = Z.ia)(a, b);
        g._OrtGetLastError = (a, b) => (g._OrtGetLastError = Z.ja)(a, b);
        g._OrtCreateSessionOptions = (a, b, c, d, e, h, k, m, q, n) => (g._OrtCreateSessionOptions = Z.ka)(a, b, c, d, e, h, k, m, q, n);
        g._OrtAppendExecutionProvider = (a, b) => (g._OrtAppendExecutionProvider = Z.la)(a, b);
        g._OrtAddFreeDimensionOverride = (a, b, c) => (g._OrtAddFreeDimensionOverride = Z.ma)(a, b, c);
        g._OrtAddSessionConfigEntry = (a, b, c) => (g._OrtAddSessionConfigEntry = Z.na)(a, b, c);
        g._OrtReleaseSessionOptions = (a) => (g._OrtReleaseSessionOptions = Z.oa)(a);
        g._OrtCreateSession = (a, b, c) => (g._OrtCreateSession = Z.pa)(a, b, c);
        g._OrtReleaseSession = (a) => (g._OrtReleaseSession = Z.qa)(a);
        g._OrtGetInputOutputCount = (a, b, c) => (g._OrtGetInputOutputCount = Z.ra)(a, b, c);
        g._OrtGetInputName = (a, b) => (g._OrtGetInputName = Z.sa)(a, b);
        g._OrtGetOutputName = (a, b) => (g._OrtGetOutputName = Z.ta)(a, b);
        g._OrtFree = (a) => (g._OrtFree = Z.ua)(a);
        g._OrtCreateTensor = (a, b, c, d, e, h) => (g._OrtCreateTensor = Z.va)(a, b, c, d, e, h);
        g._OrtGetTensorData = (a, b, c, d, e) => (g._OrtGetTensorData = Z.wa)(a, b, c, d, e);
        g._OrtReleaseTensor = (a) => (g._OrtReleaseTensor = Z.xa)(a);
        g._OrtCreateRunOptions = (a, b, c, d) => (g._OrtCreateRunOptions = Z.ya)(a, b, c, d);
        g._OrtAddRunConfigEntry = (a, b, c) => (g._OrtAddRunConfigEntry = Z.za)(a, b, c);
        g._OrtReleaseRunOptions = (a) => (g._OrtReleaseRunOptions = Z.Aa)(a);
        g._OrtCreateBinding = (a) => (g._OrtCreateBinding = Z.Ba)(a);
        g._OrtBindInput = (a, b, c) => (g._OrtBindInput = Z.Ca)(a, b, c);
        g._OrtBindOutput = (a, b, c, d) => (g._OrtBindOutput = Z.Da)(a, b, c, d);
        g._OrtClearBoundOutputs = (a) => (g._OrtClearBoundOutputs = Z.Ea)(a);
        g._OrtReleaseBinding = (a) => (g._OrtReleaseBinding = Z.Fa)(a);
        g._OrtRunWithBinding = (a, b, c, d, e) => (g._OrtRunWithBinding = Z.Ga)(a, b, c, d, e);
        g._OrtRun = (a, b, c, d, e, h, k, m) => (g._OrtRun = Z.Ha)(a, b, c, d, e, h, k, m);
        g._OrtEndProfiling = (a) => (g._OrtEndProfiling = Z.Ia)(a);
        var yb = () => (yb = Z.Ja)(), lb = g._malloc = (a) => (lb = g._malloc = Z.Ka)(a), W = g._free = (a) => (W = g._free = Z.La)(a), Za = (a) => (Za = Z.Ma)(a), Bb = () => (Bb = Z.Oa)(), Cb = (a) => (Cb = Z.Pa)(a), Db = (a) => (Db = Z.Qa)(a);
        function Ab() {
          var a = Z;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
          a.Ja = b(a.Ja);
          a.Ka = c(a.Ka);
          a.Ma = c(a.Ma);
          a.Oa = b(a.Oa);
          a.Qa = c(a.Qa);
          return a;
        }
        g.stackAlloc = Db;
        g.stackSave = Bb;
        g.stackRestore = Cb;
        g.UTF8ToString = N;
        g.stringToUTF8 = (a, b, c) => P(a, D, b, c);
        g.lengthBytesUTF8 = O;
        var Eb;
        L = function Fb() {
          Eb || Gb();
          Eb || (L = Fb);
        };
        function Gb() {
          if (!(0 < K)) {
            if (g.preRun)
              for ("function" == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length; ) {
                var a = g.preRun.shift();
                qa.unshift(a);
              }
            for (; 0 < qa.length; )
              qa.shift()(g);
            if (!(0 < K || Eb || (Eb = true, g.calledRun = true, ka))) {
              for (; 0 < ra.length; )
                ra.shift()(g);
              for (aa(g); 0 < sa.length; )
                sa.shift()(g);
            }
          }
        }
        Gb();
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
        function g() {
          m.buffer != p.buffer && q();
          return p;
        }
        function t() {
          m.buffer != p.buffer && q();
          return aa;
        }
        function ba() {
          m.buffer != p.buffer && q();
          return ca;
        }
        function da() {
          m.buffer != p.buffer && q();
          return ea;
        }
        function v() {
          m.buffer != p.buffer && q();
          return fa;
        }
        function w() {
          m.buffer != p.buffer && q();
          return ha;
        }
        function ia() {
          m.buffer != p.buffer && q();
          return ja;
        }
        var z = moduleArg, ka, la;
        z.ready = new Promise((a, b) => {
          ka = a;
          la = b;
        });
        var ma = Object.assign({}, z), na = "./this.program", oa = (a, b) => {
          throw b;
        }, pa = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = z.ENVIRONMENT_IS_PTHREAD || false, E = "";
        function qa(a) {
          return z.locateFile ? z.locateFile(a, E) : E + a;
        }
        var ra, sa, ta;
        if (B) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), ua = (init_path(), __toCommonJS(path_exports));
          E = A ? ua.dirname(E) + "/" : __dirname + "/";
          ra = (b, c) => {
            b = va(b) ? new URL(b) : ua.normalize(b);
            return fs.readFileSync(b, c ? void 0 : "utf8");
          };
          ta = (b) => {
            b = ra(b, true);
            b.buffer || (b = new Uint8Array(b));
            return b;
          };
          sa = (b, c, d, e = true) => {
            b = va(b) ? new URL(b) : ua.normalize(b);
            fs.readFile(b, e ? void 0 : "utf8", (f, k) => {
              f ? d(f) : c(e ? k.buffer : k);
            });
          };
          !z.thisProgram && 1 < process.argv.length && (na = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          oa = (b, c) => {
            process.exitCode = b;
            throw c;
          };
          z.inspect = () => "[Emscripten Module object]";
          let a;
          try {
            a = require_worker_threads();
          } catch (b) {
            throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
          }
          global.Worker = a.Worker;
        } else if (pa || A)
          A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ra = (a) => {
            var b = new XMLHttpRequest();
            b.open(
              "GET",
              a,
              false
            );
            b.send(null);
            return b.responseText;
          }, A && (ta = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), sa = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          });
        B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var wa = console.log.bind(console), xa = console.error.bind(console);
        B && (wa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), xa = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var ya = wa, F = xa;
        Object.assign(z, ma);
        ma = null;
        "object" != typeof WebAssembly && za("no native wasm support detected");
        var m, Aa, Ba = false, G, p, aa, ca, ea, fa, ha, Ca, H, Da, ja;
        function q() {
          var a = m.buffer;
          z.HEAP8 = p = new Int8Array(a);
          z.HEAP16 = ca = new Int16Array(a);
          z.HEAPU8 = aa = new Uint8Array(a);
          z.HEAPU16 = ea = new Uint16Array(a);
          z.HEAP32 = fa = new Int32Array(a);
          z.HEAPU32 = ha = new Uint32Array(a);
          z.HEAPF32 = Ca = new Float32Array(a);
          z.HEAPF64 = ja = new Float64Array(a);
          z.HEAP64 = H = new BigInt64Array(a);
          z.HEAPU64 = Da = new BigUint64Array(a);
        }
        var Ea = 16777216;
        if (D)
          m = z.wasmMemory;
        else if (z.wasmMemory)
          m = z.wasmMemory;
        else if (m = new WebAssembly.Memory({ initial: Ea / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))
          throw F("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && F("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        q();
        Ea = m.buffer.byteLength;
        var Fa = [], Ga = [], Ha = [], I = 0, Ia = null, J = null;
        function Ja() {
          I--;
          if (0 == I && (null !== Ia && (clearInterval(Ia), Ia = null), J)) {
            var a = J;
            J = null;
            a();
          }
        }
        function za(a) {
          a = "Aborted(" + a + ")";
          F(a);
          Ba = true;
          G = 1;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          la(a);
          throw a;
        }
        var Ka = (a) => a.startsWith("data:application/octet-stream;base64,"), va = (a) => a.startsWith("file://"), K;
        K = "ort-wasm-threaded.wasm";
        Ka(K) || (K = qa(K));
        function La(a) {
          if (ta)
            return ta(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ma(a) {
          if (pa || A) {
            if ("function" == typeof fetch && !va(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw "failed to load wasm binary file at '" + a + "'";
                return b.arrayBuffer();
              }).catch(() => La(a));
            if (sa)
              return new Promise((b, c) => {
                sa(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => La(a));
        }
        function Na(a, b, c) {
          return Ma(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
            F(`failed to asynchronously prepare wasm: ${d}`);
            za(d);
          });
        }
        function Oa(a, b) {
          var c = K;
          return "function" != typeof WebAssembly.instantiateStreaming || Ka(c) || va(c) || B || "function" != typeof fetch ? Na(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
            F(`wasm streaming compile failed: ${e}`);
            F("falling back to ArrayBuffer instantiation");
            return Na(c, a, b);
          }));
        }
        var Pa = { 891868: (a, b, c, d) => {
          if ("undefined" == typeof z || !z.Hb)
            return 1;
          a = L(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = z.Hb.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return t().set(a.subarray(b, b + c), d >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        function Qa(a) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
        var Ra = (a) => {
          a.terminate();
          a.onmessage = () => {
          };
        }, Ta = (a) => {
          0 == M.ob.length && (Sa(), M.Bb(M.ob[0]));
          var b = M.ob.pop();
          if (!b)
            return 6;
          M.pb.push(b);
          M.kb[a.nb] = b;
          b.nb = a.nb;
          var c = { cmd: "run", start_routine: a.Ob, arg: a.Ib, pthread_ptr: a.nb };
          B && b.unref();
          b.postMessage(c, a.Ub);
          return 0;
        }, O = 0, Ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Va = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && Ua)
            return Ua.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (d = ""; b < c; ) {
            var e = a[b++];
            if (e & 128) {
              var f = a[b++] & 63;
              if (192 == (e & 224))
                d += String.fromCharCode((e & 31) << 6 | f);
              else {
                var k = a[b++] & 63;
                e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;
                65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
              }
            } else
              d += String.fromCharCode(e);
          }
          return d;
        }, L = (a, b) => (a >>>= 0) ? Va(t(), a, b) : "", Ya = (a) => {
          var b = Wa();
          a = a();
          Xa(b);
          return a;
        };
        function P(a, b) {
          var c = arguments.length - 2, d = arguments;
          return Ya(() => {
            for (var e = 2 * c, f = Za(8 * e), k = f >>> 3, l = 0; l < c; l++) {
              var r = d[2 + l];
              "bigint" == typeof r ? (H[k + 2 * l] = 1n, H[k + 2 * l + 1] = r) : (H[k + 2 * l] = 0n, ia()[k + 2 * l + 1 >>> 0] = r);
            }
            return $a(a, e, f, b);
          });
        }
        function ab(a) {
          if (D)
            return P(0, 1, a);
          G = a;
          0 < O || (M.Pb(), z.onExit?.(a), Ba = true);
          oa(a, new Qa(a));
        }
        var cb = (a) => {
          G = a;
          if (D)
            throw bb(a), "unwind";
          ab(a);
        };
        function db() {
          for (var a = z.numThreads; a--; )
            Sa();
          Fa.unshift(() => {
            I++;
            eb(() => Ja());
          });
        }
        function Sa() {
          var a = qa("ort-wasm-threaded.worker.js");
          a = new Worker(a);
          M.ob.push(a);
        }
        function eb(a) {
          D ? a() : Promise.all(M.ob.map(M.Bb)).then(a);
        }
        var M = { ob: [], pb: [], Gb: [], kb: {}, wb() {
          D ? (M.receiveObjectTransfer = M.Nb, M.threadInitTLS = M.Fb, M.setExitStatus = M.Eb) : db();
        }, Eb: (a) => G = a, Xb: ["$terminateWorker"], Pb: () => {
          for (var a of M.pb)
            Ra(a);
          for (a of M.ob)
            Ra(a);
          M.ob = [];
          M.pb = [];
          M.kb = [];
        }, Db: (a) => {
          var b = a.nb;
          delete M.kb[b];
          M.ob.push(a);
          M.pb.splice(M.pb.indexOf(a), 1);
          a.nb = 0;
          fb(b);
        }, Nb() {
        }, Fb() {
          M.Gb.forEach((a) => a());
        }, Bb: (a) => new Promise((b) => {
          a.onmessage = (f) => {
            f = f.data;
            var k = f.cmd;
            if (f.targetThread && f.targetThread != gb()) {
              var l = M.kb[f.targetThread];
              l ? l.postMessage(f, f.transferList) : F(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);
            } else if ("checkMailbox" === k)
              hb();
            else if ("spawnThread" === k)
              Ta(f);
            else if ("cleanupThread" === k)
              M.Db(M.kb[f.thread]);
            else if ("killThread" === k)
              f = f.thread, k = M.kb[f], delete M.kb[f], Ra(k), fb(f), M.pb.splice(M.pb.indexOf(k), 1), k.nb = 0;
            else if ("cancelThread" === k)
              M.kb[f.thread].postMessage({ cmd: "cancel" });
            else if ("loaded" === k)
              a.loaded = true, B && !a.nb && a.unref(), b(a);
            else if ("alert" === k)
              alert(`Thread ${f.threadId}: ${f.text}`);
            else if ("setimmediate" === f.target)
              a.postMessage(f);
            else if ("callHandler" === k)
              z[f.handler](...f.args);
            else
              k && F(`worker sent an unknown command ${k}`);
          };
          a.onerror = (f) => {
            F(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);
            throw f;
          };
          B && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));
          var c = [], d = ["onExit"], e;
          for (e of d)
            z.hasOwnProperty(e) && c.push(e);
          a.postMessage({ cmd: "load", handlers: c, urlOrBlob: z.mainScriptUrlOrBlob || _scriptDir, wasmMemory: m, wasmModule: Aa });
        }) };
        z.PThread = M;
        var ib = (a) => {
          for (; 0 < a.length; )
            a.shift()(z);
        };
        z.establishStackSpace = () => {
          var a = gb(), b = w()[a + 52 >>> 2 >>> 0];
          a = w()[a + 56 >>> 2 >>> 0];
          jb(b, b - a);
          Xa(b);
        };
        function bb(a) {
          if (D)
            return P(1, 0, a);
          cb(a);
        }
        var kb = [], lb;
        z.invokeEntryPoint = (a, b) => {
          var c = kb[a];
          c || (a >= kb.length && (kb.length = a + 1), kb[a] = c = lb.get(a));
          a = c(b);
          0 < O ? M.Eb(a) : mb(a);
        };
        function nb(a) {
          this.tb = a - 24;
          this.Mb = function(b) {
            w()[this.tb + 4 >>> 2 >>> 0] = b;
          };
          this.yb = function(b) {
            w()[this.tb + 8 >>> 2 >>> 0] = b;
          };
          this.wb = function(b, c) {
            this.xb();
            this.Mb(b);
            this.yb(c);
          };
          this.xb = function() {
            w()[this.tb + 16 >>> 2 >>> 0] = 0;
          };
        }
        var ob = 0, pb = 0;
        function qb(a, b, c, d) {
          return D ? P(2, 1, a, b, c, d) : rb(a, b, c, d);
        }
        function rb(a, b, c, d) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return F("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var e = [];
          if (D && 0 === e.length)
            return qb(a, b, c, d);
          a = { Ob: c, nb: a, Ib: d, Ub: e };
          return D ? (a.Wb = "spawnThread", postMessage(a, e), 0) : Ta(a);
        }
        function sb(a, b, c) {
          return D ? P(3, 1, a, b, c) : 0;
        }
        function tb(a, b) {
          if (D)
            return P(4, 1, a, b);
        }
        var ub = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, vb = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var e = c;
          d = c + d - 1;
          for (var f = 0; f < a.length; ++f) {
            var k = a.charCodeAt(f);
            if (55296 <= k && 57343 >= k) {
              var l = a.charCodeAt(++f);
              k = 65536 + ((k & 1023) << 10) | l & 1023;
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
          return c - e;
        }, wb = (a, b, c) => vb(a, t(), b, c);
        function xb(a, b) {
          if (D)
            return P(5, 1, a, b);
        }
        function yb(a, b, c) {
          if (D)
            return P(6, 1, a, b, c);
        }
        function zb(a, b, c) {
          return D ? P(7, 1, a, b, c) : 0;
        }
        function Ab(a, b) {
          if (D)
            return P(8, 1, a, b);
        }
        function Bb(a, b, c) {
          if (D)
            return P(9, 1, a, b, c);
        }
        function Cb(a, b, c, d) {
          if (D)
            return P(10, 1, a, b, c, d);
        }
        function Db(a, b, c, d) {
          if (D)
            return P(11, 1, a, b, c, d);
        }
        function Eb(a, b, c, d) {
          if (D)
            return P(12, 1, a, b, c, d);
        }
        function Fb(a) {
          if (D)
            return P(13, 1, a);
        }
        function Gb(a, b) {
          if (D)
            return P(14, 1, a, b);
        }
        function Hb(a, b, c) {
          if (D)
            return P(15, 1, a, b, c);
        }
        var Ib = (a) => {
          if (null === a)
            return "null";
          var b = typeof a;
          return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
        }, Jb, R = (a) => {
          for (var b = ""; t()[a >>> 0]; )
            b += Jb[t()[a++ >>> 0]];
          return b;
        }, Kb = {}, Lb = {}, Mb = {}, S;
        function Nb(a, b, c = {}) {
          var d = b.name;
          if (!a)
            throw new S(`type "${d}" must have a positive integer typeid pointer`);
          if (Lb.hasOwnProperty(a)) {
            if (c.Kb)
              return;
            throw new S(`Cannot register type '${d}' twice`);
          }
          Lb[a] = b;
          delete Mb[a];
          Kb.hasOwnProperty(a) && (b = Kb[a], delete Kb[a], b.forEach((e) => e()));
        }
        function T(a, b, c = {}) {
          if (!("argPackAdvance" in b))
            throw new TypeError("registerType registeredInstance requires argPackAdvance");
          Nb(a, b, c);
        }
        var Ob = (a, b, c) => {
          switch (b) {
            case 1:
              return c ? (d) => g()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];
            case 2:
              return c ? (d) => ba()[d >>> 1 >>> 0] : (d) => da()[d >>> 1 >>> 0];
            case 4:
              return c ? (d) => v()[d >>> 2 >>> 0] : (d) => w()[d >>> 2 >>> 0];
            case 8:
              return c ? (d) => H[d >>> 3] : (d) => Da[d >>> 3];
            default:
              throw new TypeError(`invalid integer width (${b}): ${a}`);
          }
        };
        function Pb() {
          this.mb = [void 0];
          this.Ab = [];
        }
        var U = new Pb();
        function Qb(a) {
          a >>>= 0;
          a >= U.tb && 0 === --U.get(a).Cb && U.yb(a);
        }
        var V = (a) => {
          if (!a)
            throw new S("Cannot use deleted val. handle = " + a);
          return U.get(a).value;
        }, W = (a) => {
          switch (a) {
            case void 0:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default:
              return U.xb({ Cb: 1, value: a });
          }
        };
        function Rb(a) {
          return this.fromWireType(v()[a >>> 2 >>> 0]);
        }
        var Sb = (a, b) => {
          switch (b) {
            case 4:
              return function(c) {
                var d = this.fromWireType;
                m.buffer != p.buffer && q();
                return d.call(this, Ca[c >>> 2 >>> 0]);
              };
            case 8:
              return function(c) {
                return this.fromWireType(ia()[c >>> 3 >>> 0]);
              };
            default:
              throw new TypeError(`invalid float width (${b}): ${a}`);
          }
        };
        function Tb(a) {
          return this.fromWireType(w()[a >>> 2 >>> 0]);
        }
        var Ub = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Vb = (a, b) => {
          var c = a >> 1;
          for (var d = c + b / 2; !(c >= d) && da()[c >>> 0]; )
            ++c;
          c <<= 1;
          if (32 < c - a && Ub)
            return Ub.decode(t().slice(a, c));
          c = "";
          for (d = 0; !(d >= b / 2); ++d) {
            var e = ba()[a + 2 * d >>> 1 >>> 0];
            if (0 == e)
              break;
            c += String.fromCharCode(e);
          }
          return c;
        }, Wb = (a, b, c) => {
          c ??= 2147483647;
          if (2 > c)
            return 0;
          c -= 2;
          var d = b;
          c = c < 2 * a.length ? c / 2 : a.length;
          for (var e = 0; e < c; ++e) {
            var f = a.charCodeAt(e);
            ba()[b >>> 1 >>> 0] = f;
            b += 2;
          }
          ba()[b >>> 1 >>> 0] = 0;
          return b - d;
        }, Xb = (a) => 2 * a.length, Yb = (a, b) => {
          for (var c = 0, d = ""; !(c >= b / 4); ) {
            var e = v()[a + 4 * c >>> 2 >>> 0];
            if (0 == e)
              break;
            ++c;
            65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
          }
          return d;
        }, Zb = (a, b, c) => {
          b >>>= 0;
          c ??= 2147483647;
          if (4 > c)
            return 0;
          var d = b;
          c = d + c - 4;
          for (var e = 0; e < a.length; ++e) {
            var f = a.charCodeAt(e);
            if (55296 <= f && 57343 >= f) {
              var k = a.charCodeAt(++e);
              f = 65536 + ((f & 1023) << 10) | k & 1023;
            }
            v()[b >>> 2 >>> 0] = f;
            b += 4;
            if (b + 4 > c)
              break;
          }
          v()[b >>> 2 >>> 0] = 0;
          return b - d;
        }, $b = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            55296 <= d && 57343 >= d && ++c;
            b += 4;
          }
          return b;
        };
        function ac(a) {
          a >>>= 0;
          "function" === typeof Atomics.Vb && (Atomics.Vb(v(), a >>> 2, a).value.then(hb), a += 128, Atomics.store(v(), a >>> 2, 1));
        }
        z.__emscripten_thread_mailbox_await = ac;
        var hb = () => {
          var a = gb();
          if (a && (ac(a), a = bc, !Ba))
            try {
              if (a(), !(0 < O))
                try {
                  D ? mb(G) : cb(G);
                } catch (b) {
                  b instanceof Qa || "unwind" == b || oa(1, b);
                }
            } catch (b) {
              b instanceof Qa || "unwind" == b || oa(1, b);
            }
        };
        z.checkMailbox = hb;
        var cc = [], ec = (a, b) => {
          var c = Lb[a];
          if (void 0 === c)
            throw a = dc(a), c = R(a), X(a), new S(b + " has unknown type " + c);
          return c;
        }, fc = (a, b, c) => {
          var d = [];
          a = a.toWireType(d, c);
          d.length && (w()[b >>> 2 >>> 0] = W(d));
          return a;
        }, gc = [], hc = {}, ic = (a) => {
          var b = hc[a];
          return void 0 === b ? R(a) : b;
        }, jc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), kc = (a) => {
          var b = gc.length;
          gc.push(a);
          return b;
        }, lc = (a, b) => {
          for (var c = Array(a), d = 0; d < a; ++d)
            c[d] = ec(w()[b + 4 * d >>> 2 >>> 0], "parameter " + d);
          return c;
        }, nc = (a, b) => Object.defineProperty(
          b,
          "name",
          { value: a }
        );
        function oc(a) {
          var b = Function;
          if (!(b instanceof Function))
            throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
          var c = nc(b.name || "unknownFunctionName", function() {
          });
          c.prototype = b.prototype;
          c = new c();
          a = b.apply(c, a);
          return a instanceof Object ? a : c;
        }
        var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), pc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], qc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function rc(a, b, c, d, e, f, k) {
          return D ? P(16, 1, a, b, c, d, e, f, k) : -52;
        }
        function sc(a, b, c, d, e, f) {
          if (D)
            return P(17, 1, a, b, c, d, e, f);
        }
        var uc = (a) => {
          var b = ub(a) + 1, c = tc(b);
          c && wb(a, c, b);
          return c;
        }, vc = [], wc = {}, yc = () => {
          if (!xc) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: na || "./this.program" }, b;
            for (b in wc)
              void 0 === wc[b] ? delete a[b] : a[b] = wc[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            xc = c;
          }
          return xc;
        }, xc;
        function zc(a, b) {
          if (D)
            return P(18, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          yc().forEach((d, e) => {
            var f = b + c;
            e = w()[a + 4 * e >>> 2 >>> 0] = f;
            for (f = 0; f < d.length; ++f)
              g()[e++ >>> 0 >>> 0] = d.charCodeAt(f);
            g()[e >>> 0 >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }
        function Ac(a, b) {
          if (D)
            return P(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = yc();
          w()[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((e) => d += e.length + 1);
          w()[b >>> 2 >>> 0] = d;
          return 0;
        }
        function Bc(a) {
          return D ? P(20, 1, a) : 52;
        }
        function Cc(a, b, c, d) {
          return D ? P(21, 1, a, b, c, d) : 52;
        }
        function Dc(a, b, c, d) {
          return D ? P(22, 1, a, b, c, d) : 70;
        }
        var Ec = [null, [], []];
        function Fc(a, b, c, d) {
          if (D)
            return P(23, 1, a, b, c, d);
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var e = 0, f = 0; f < c; f++) {
            var k = w()[b >>> 2 >>> 0], l = w()[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var r = 0; r < l; r++) {
              var n = t()[k + r >>> 0], x = Ec[a];
              0 === n || 10 === n ? ((1 === a ? ya : F)(Va(x, 0)), x.length = 0) : x.push(n);
            }
            e += l;
          }
          w()[d >>> 2 >>> 0] = e;
          return 0;
        }
        var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Ic(a) {
          var b = Array(ub(a) + 1);
          vb(a, b, 0, b.length);
          return b;
        }
        var Jc = (a, b) => {
          g().set(a, b >>> 0);
        };
        function Kc(a, b, c, d) {
          function e(h, u, y) {
            for (h = "number" == typeof h ? h.toString() : h || ""; h.length < u; )
              h = y[0] + h;
            return h;
          }
          function f(h, u) {
            return e(h, u, "0");
          }
          function k(h, u) {
            function y(mc) {
              return 0 > mc ? -1 : 0 < mc ? 1 : 0;
            }
            var Q;
            0 === (Q = y(h.getFullYear() - u.getFullYear())) && 0 === (Q = y(h.getMonth() - u.getMonth())) && (Q = y(h.getDate() - u.getDate()));
            return Q;
          }
          function l(h) {
            switch (h.getDay()) {
              case 0:
                return new Date(h.getFullYear() - 1, 11, 29);
              case 1:
                return h;
              case 2:
                return new Date(h.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  h.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(h.getFullYear(), 0, 1);
              case 5:
                return new Date(h.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(h.getFullYear() - 1, 11, 30);
            }
          }
          function r(h) {
            var u = h.qb;
            for (h = new Date(new Date(h.rb + 1900, 0, 1).getTime()); 0 < u; ) {
              var y = h.getMonth(), Q = (Y(h.getFullYear()) ? Gc : Hc)[y];
              if (u > Q - h.getDate())
                u -= Q - h.getDate() + 1, h.setDate(1), 11 > y ? h.setMonth(y + 1) : (h.setMonth(0), h.setFullYear(h.getFullYear() + 1));
              else {
                h.setDate(h.getDate() + u);
                break;
              }
            }
            y = new Date(h.getFullYear() + 1, 0, 4);
            u = l(new Date(
              h.getFullYear(),
              0,
              4
            ));
            y = l(y);
            return 0 >= k(u, h) ? 0 >= k(y, h) ? h.getFullYear() + 1 : h.getFullYear() : h.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var n = w()[d + 40 >>> 2 >>> 0];
          d = { Sb: v()[d >>> 2 >>> 0], Rb: v()[d + 4 >>> 2 >>> 0], ub: v()[d + 8 >>> 2 >>> 0], zb: v()[d + 12 >>> 2 >>> 0], vb: v()[d + 16 >>> 2 >>> 0], rb: v()[d + 20 >>> 2 >>> 0], lb: v()[d + 24 >>> 2 >>> 0], qb: v()[d + 28 >>> 2 >>> 0], Yb: v()[d + 32 >>> 2 >>> 0], Qb: v()[d + 36 >>> 2 >>> 0], Tb: n ? L(n) : "" };
          c = L(c);
          n = {
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
          for (var x in n)
            c = c.replace(new RegExp(x, "g"), n[x]);
          var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");
          n = { "%a": (h) => C[h.lb].substring(0, 3), "%A": (h) => C[h.lb], "%b": (h) => N[h.vb].substring(0, 3), "%B": (h) => N[h.vb], "%C": (h) => f((h.rb + 1900) / 100 | 0, 2), "%d": (h) => f(h.zb, 2), "%e": (h) => e(h.zb, 2, " "), "%g": (h) => r(h).toString().substring(2), "%G": (h) => r(h), "%H": (h) => f(h.ub, 2), "%I": (h) => {
            h = h.ub;
            0 == h ? h = 12 : 12 < h && (h -= 12);
            return f(h, 2);
          }, "%j": (h) => {
            for (var u = 0, y = 0; y <= h.vb - 1; u += (Y(h.rb + 1900) ? Gc : Hc)[y++])
              ;
            return f(h.zb + u, 3);
          }, "%m": (h) => f(h.vb + 1, 2), "%M": (h) => f(h.Rb, 2), "%n": () => "\n", "%p": (h) => 0 <= h.ub && 12 > h.ub ? "AM" : "PM", "%S": (h) => f(h.Sb, 2), "%t": () => "	", "%u": (h) => h.lb || 7, "%U": (h) => f(Math.floor((h.qb + 7 - h.lb) / 7), 2), "%V": (h) => {
            var u = Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7);
            2 >= (h.lb + 371 - h.qb - 2) % 7 && u++;
            if (u)
              53 == u && (y = (h.lb + 371 - h.qb) % 7, 4 == y || 3 == y && Y(h.rb) || (u = 1));
            else {
              u = 52;
              var y = (h.lb + 7 - h.qb - 1) % 7;
              (4 == y || 5 == y && Y(h.rb % 400 - 1)) && u++;
            }
            return f(u, 2);
          }, "%w": (h) => h.lb, "%W": (h) => f(Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7), 2), "%y": (h) => (h.rb + 1900).toString().substring(2), "%Y": (h) => h.rb + 1900, "%z": (h) => {
            h = h.Qb;
            var u = 0 <= h;
            h = Math.abs(h) / 60;
            return (u ? "+" : "-") + String("0000" + (h / 60 * 100 + h % 60)).slice(-4);
          }, "%Z": (h) => h.Tb, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (x in n)
            c.includes(x) && (c = c.replace(new RegExp(x, "g"), n[x](d)));
          c = c.replace(/\0\0/g, "%");
          x = Ic(c);
          if (x.length > b)
            return 0;
          Jc(x, a);
          return x.length - 1;
        }
        M.wb();
        for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)
          Lc[Mc] = String.fromCharCode(Mc);
        Jb = Lc;
        S = z.BindingError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "BindingError";
          }
        };
        z.InternalError = class extends Error {
          constructor(a) {
            super(a);
            this.name = "InternalError";
          }
        };
        Object.assign(Pb.prototype, { get(a) {
          return this.mb[a];
        }, has(a) {
          return void 0 !== this.mb[a];
        }, xb(a) {
          var b = this.Ab.pop() || this.mb.length;
          this.mb[b] = a;
          return b;
        }, yb(a) {
          this.mb[a] = void 0;
          this.Ab.push(a);
        } });
        U.mb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
        U.tb = U.mb.length;
        z.count_emval_handles = () => {
          for (var a = 0, b = U.tb; b < U.mb.length; ++b)
            void 0 !== U.mb[b] && ++a;
          return a;
        };
        var Nc = [ab, bb, qb, sb, tb, xb, yb, zb, Ab, Bb, Cb, Db, Eb, Fb, Gb, Hb, rc, sc, zc, Ac, Bc, Cc, Dc, Fc], Qc = {
          b: function(a, b, c) {
            a >>>= 0;
            new nb(a).wb(b >>> 0, c >>> 0);
            ob = a;
            pb++;
            throw ob;
          },
          da: function(a) {
            Oc(a >>> 0, !A, 1, !pa, 131072, false);
            M.Fb();
          },
          D: function(a) {
            a >>>= 0;
            D ? postMessage({ cmd: "cleanupThread", thread: a }) : M.Db(M.kb[a]);
          },
          V: rb,
          x: sb,
          ka: tb,
          R: xb,
          T: yb,
          K: zb,
          ia: Ab,
          aa: Bb,
          ga: Cb,
          F: Db,
          S: Eb,
          P: Fb,
          ja: Gb,
          Q: Hb,
          I: function(a, b, c, d, e) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            b = R(b);
            var f = -1 != b.indexOf("u");
            f && (e = (1n << 64n) - 1n);
            T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {
              if ("bigint" != typeof l && "number" != typeof l)
                throw new TypeError(`Cannot convert "${Ib(l)}" to ${this.name}`);
              if (l < d || l > e)
                throw new TypeError(`Passing a number "${Ib(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
              return l;
            }, argPackAdvance: 8, readValueFromPointer: Ob(b, c, !f), sb: null });
          },
          pa: function(a, b, c, d) {
            a >>>= 0;
            b = R(b >>> 0);
            T(a, { name: b, fromWireType: function(e) {
              return !!e;
            }, toWireType: function(e, f) {
              return f ? c : d;
            }, argPackAdvance: 8, readValueFromPointer: function(e) {
              return this.fromWireType(t()[e >>> 0]);
            }, sb: null });
          },
          oa: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            T(a, { name: b, fromWireType: (c) => {
              var d = V(c);
              Qb(c);
              return d;
            }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Rb, sb: null });
          },
          H: function(a, b, c) {
            a >>>= 0;
            c >>>= 0;
            b = R(b >>> 0);
            T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Sb(b, c), sb: null });
          },
          u: function(a, b, c, d, e) {
            a >>>= 0;
            c >>>= 0;
            b = R(b >>> 0);
            -1 === e && (e = 4294967295);
            e = (l) => l;
            if (0 === d) {
              var f = 32 - 8 * c;
              e = (l) => l << f >>> f;
            }
            var k = b.includes("unsigned") ? function(l, r) {
              return r >>> 0;
            } : function(l, r) {
              return r;
            };
            T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Ob(b, c, 0 !== d), sb: null });
          },
          n: function(a, b, c) {
            function d(f) {
              var k = w()[f >>> 2 >>> 0];
              f = w()[f + 4 >>> 2 >>> 0];
              return new e(g().buffer, f, k);
            }
            a >>>= 0;
            var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
            c = R(c >>> 0);
            T(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { Kb: true });
          },
          J: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            var c = "std::string" === b;
            T(a, { name: b, fromWireType: function(d) {
              var e = w()[d >>> 2 >>> 0], f = d + 4;
              if (c)
                for (var k = f, l = 0; l <= e; ++l) {
                  var r = f + l;
                  if (l == e || 0 == t()[r >>> 0]) {
                    k = L(k, r - k);
                    if (void 0 === n)
                      var n = k;
                    else
                      n += String.fromCharCode(0), n += k;
                    k = r + 1;
                  }
                }
              else {
                n = Array(e);
                for (l = 0; l < e; ++l)
                  n[l] = String.fromCharCode(t()[f + l >>> 0]);
                n = n.join("");
              }
              X(d);
              return n;
            }, toWireType: function(d, e) {
              e instanceof ArrayBuffer && (e = new Uint8Array(e));
              var f = "string" == typeof e;
              if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                throw new S("Cannot pass non-string to std::string");
              var k = c && f ? ub(e) : e.length;
              var l = tc(4 + k + 1), r = l + 4;
              w()[l >>> 2 >>> 0] = k;
              if (c && f)
                wb(e, r, k + 1);
              else if (f)
                for (f = 0; f < k; ++f) {
                  var n = e.charCodeAt(f);
                  if (255 < n)
                    throw X(r), new S("String has UTF-16 code units that do not fit in 8 bits");
                  t()[r + f >>> 0] = n;
                }
              else
                for (f = 0; f < k; ++f)
                  t()[r + f >>> 0] = e[f];
              null !== d && d.push(X, l);
              return l;
            }, argPackAdvance: 8, readValueFromPointer: Tb, sb(d) {
              X(d);
            } });
          },
          z: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            c = R(c);
            if (2 === b) {
              var d = Vb;
              var e = Wb;
              var f = Xb;
              var k = () => da();
              var l = 1;
            } else
              4 === b && (d = Yb, e = Zb, f = $b, k = () => w(), l = 2);
            T(a, { name: c, fromWireType: (r) => {
              for (var n = w()[r >>> 2 >>> 0], x = k(), C, N = r + 4, h = 0; h <= n; ++h) {
                var u = r + 4 + h * b;
                if (h == n || 0 == x[u >>> l])
                  N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;
              }
              X(r);
              return C;
            }, toWireType: (r, n) => {
              if ("string" != typeof n)
                throw new S(`Cannot pass non-string to C++ string type ${c}`);
              var x = f(n), C = tc(4 + x + b);
              w()[C >>> 2] = x >> l;
              e(n, C + 4, x + b);
              null !== r && r.push(X, C);
              return C;
            }, argPackAdvance: 8, readValueFromPointer: Rb, sb(r) {
              X(r);
            } });
          },
          qa: function(a, b) {
            a >>>= 0;
            b = R(b >>> 0);
            T(a, {
              Lb: true,
              name: b,
              argPackAdvance: 0,
              fromWireType: () => {
              },
              toWireType: () => {
              }
            });
          },
          na: () => 1,
          N: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(() => hb()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = M.kb[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          W: function(a, b, c, d) {
            b >>>= 0;
            c /= 2;
            cc.length = c;
            d = d >>> 0 >>> 3;
            for (var e = 0; e < c; e++)
              cc[e] = H[d + 2 * e] ? H[d + 2 * e + 1] : ia()[d + 2 * e + 1 >>> 0];
            a = 0 > a ? Pa[-a - 1] : Nc[a];
            M.Jb = b;
            b = a.apply(null, cc);
            M.Jb = 0;
            return b;
          },
          ca: ac,
          ma: function(a) {
            B && M.kb[a >>> 0].ref();
          },
          s: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = V(a >>> 0);
            b = ec(b, "emval::as");
            return fc(
              b,
              c,
              a
            );
          },
          o: function(a, b, c, d) {
            c >>>= 0;
            d >>>= 0;
            a = gc[a >>> 0];
            b = V(b >>> 0);
            return a(null, b, c, d);
          },
          j: function(a, b, c, d, e) {
            c >>>= 0;
            d >>>= 0;
            e >>>= 0;
            a = gc[a >>> 0];
            b = V(b >>> 0);
            c = ic(c);
            return a(b, b[c], d, e);
          },
          c: Qb,
          A: function(a, b) {
            b >>>= 0;
            a = V(a >>> 0);
            b = V(b);
            return a == b;
          },
          m: function(a) {
            a >>>= 0;
            if (0 === a)
              return W(jc());
            a = ic(a);
            return W(jc()[a]);
          },
          i: function(a, b, c) {
            b = lc(a, b >>> 0);
            var d = b.shift();
            a--;
            var e = "return function (obj, func, destructorsRef, args) {\n", f = 0, k = [];
            0 === c && k.push("obj");
            for (var l = ["retType"], r = [d], n = 0; n < a; ++n)
              k.push("arg" + n), l.push("argType" + n), r.push(b[n]), e += `  var arg${n} = argType${n}.readValueFromPointer(args${f ? "+" + f : ""});
`, f += b[n].argPackAdvance;
            e += `  var rv = ${1 === c ? "new func" : "func.call"}(${k.join(", ")});
`;
            for (n = 0; n < a; ++n)
              b[n].deleteObject && (e += `  argType${n}.deleteObject(arg${n});
`);
            d.Lb || (l.push("emval_returnValue"), r.push(fc), e += "  return emval_returnValue(retType, destructorsRef, rv);\n");
            l.push(e + "};\n");
            a = oc(l).apply(null, r);
            c = `methodCaller<(${b.map((x) => x.name).join(", ")}) => ${d.name}>`;
            return kc(nc(
              c,
              a
            ));
          },
          r: function(a, b) {
            b >>>= 0;
            a = V(a >>> 0);
            b = V(b);
            return W(a[b]);
          },
          d: function(a) {
            a >>>= 0;
            4 < a && (U.get(a).Cb += 1);
          },
          v: function() {
            return W([]);
          },
          l: function(a) {
            a = V(a >>> 0);
            for (var b = Array(a.length), c = 0; c < a.length; c++)
              b[c] = a[c];
            return W(b);
          },
          f: function(a) {
            return W(ic(a >>> 0));
          },
          k: function() {
            return W({});
          },
          h: function(a) {
            a >>>= 0;
            for (var b = V(a); b.length; ) {
              var c = b.pop();
              b.pop()(c);
            }
            Qb(a);
          },
          g: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = V(a >>> 0);
            b = V(b);
            c = V(c);
            a[b] = c;
          },
          e: function(a, b) {
            b >>>= 0;
            a = ec(a >>> 0, "_emval_take_value");
            a = a.readValueFromPointer(b);
            return W(a);
          },
          Z: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            v()[b >>> 2 >>> 0] = a.getUTCSeconds();
            v()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
            v()[b + 8 >>> 2 >>> 0] = a.getUTCHours();
            v()[b + 12 >>> 2 >>> 0] = a.getUTCDate();
            v()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
            v()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
            v()[b + 24 >>> 2 >>> 0] = a.getUTCDay();
            a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            v()[b + 28 >>> 2 >>> 0] = a;
          },
          _: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            v()[b >>> 2 >>> 0] = a.getSeconds();
            v()[b + 4 >>> 2 >>> 0] = a.getMinutes();
            v()[b + 8 >>> 2 >>> 0] = a.getHours();
            v()[b + 12 >>> 2 >>> 0] = a.getDate();
            v()[b + 16 >>> 2 >>> 0] = a.getMonth();
            v()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
            v()[b + 24 >>> 2 >>> 0] = a.getDay();
            var c = (Y(a.getFullYear()) ? pc : qc)[a.getMonth()] + a.getDate() - 1 | 0;
            v()[b + 28 >>> 2 >>> 0] = c;
            v()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
            v()[b + 32 >>> 2 >>> 0] = a;
          },
          $: function(a) {
            a >>>= 0;
            var b = new Date(v()[a + 20 >>> 2 >>> 0] + 1900, v()[a + 16 >>> 2 >>> 0], v()[a + 12 >>> 2 >>> 0], v()[a + 8 >>> 2 >>> 0], v()[a + 4 >>> 2 >>> 0], v()[a >>> 2 >>> 0], 0), c = v()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);
            0 > c ? v()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));
            v()[a + 24 >>> 2 >>> 0] = b.getDay();
            c = (Y(b.getFullYear()) ? pc : qc)[b.getMonth()] + b.getDate() - 1 | 0;
            v()[a + 28 >>> 2 >>> 0] = c;
            v()[a >>> 2 >>> 0] = b.getSeconds();
            v()[a + 4 >>> 2 >>> 0] = b.getMinutes();
            v()[a + 8 >>> 2 >>> 0] = b.getHours();
            v()[a + 12 >>> 2 >>> 0] = b.getDate();
            v()[a + 16 >>> 2 >>> 0] = b.getMonth();
            v()[a + 20 >>> 2 >>> 0] = b.getYear();
            a = b.getTime();
            isNaN(a) ? (v()[Pc() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;
            return BigInt(a);
          },
          X: rc,
          Y: sc,
          M: function(a, b, c) {
            function d(n) {
              return (n = n.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? n[1] : "GMT";
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(
              e,
              6,
              1
            );
            e = f.getTimezoneOffset();
            var l = k.getTimezoneOffset(), r = Math.max(e, l);
            w()[a >>> 2 >>> 0] = 60 * r;
            v()[b >>> 2 >>> 0] = Number(e != l);
            a = d(f);
            b = d(k);
            a = uc(a);
            b = uc(b);
            l < e ? (w()[c >>> 2 >>> 0] = a, w()[c + 4 >>> 2 >>> 0] = b) : (w()[c >>> 2 >>> 0] = b, w()[c + 4 >>> 2 >>> 0] = a);
          },
          p: () => {
            za("");
          },
          ra: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            vc.length = 0;
            for (var d; d = t()[b++ >>> 0]; ) {
              var e = 105 != d;
              e &= 112 != d;
              c += e && c % 8 ? 4 : 0;
              vc.push(112 == d ? w()[c >>> 2 >>> 0] : 106 == d ? H[c >>> 3] : 105 == d ? v()[c >>> 2 >>> 0] : ia()[c >>> 3 >>> 0]);
              c += e ? 8 : 4;
            }
            return Pa[a].apply(null, vc);
          },
          E: () => {
          },
          G: () => Date.now(),
          la: () => {
            O += 1;
            throw "unwind";
          },
          O: function() {
            return 4294901760;
          },
          t: () => performance.timeOrigin + performance.now(),
          w: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,
          L: function(a) {
            a >>>= 0;
            var b = t().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var e = Math;
              d = Math.max(a, d);
              a: {
                e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - m.buffer.byteLength + 65535) / 65536;
                try {
                  m.grow(e);
                  q();
                  var f = 1;
                  break a;
                } catch (k) {
                }
                f = void 0;
              }
              if (f)
                return true;
            }
            return false;
          },
          ea: zc,
          fa: Ac,
          U: cb,
          y: Bc,
          C: Cc,
          ba: Dc,
          B: Fc,
          a: m || z.wasmMemory,
          ha: Kc,
          q: function(a, b, c, d) {
            return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          }
        }, Z = function() {
          function a(c, d) {
            Z = c.exports;
            Z = Rc();
            M.Gb.push(Z.Ya);
            lb = Z.$a;
            Ga.unshift(Z.sa);
            Aa = d;
            Ja();
            return Z;
          }
          var b = { a: Qc };
          I++;
          if (z.instantiateWasm)
            try {
              return z.instantiateWasm(b, a);
            } catch (c) {
              F(`Module.instantiateWasm callback failed with error: ${c}`), la(c);
            }
          Oa(b, function(c) {
            a(c.instance, c.module);
          }).catch(la);
          return {};
        }();
        z._OrtInit = (a, b) => (z._OrtInit = Z.ta)(a, b);
        z._OrtGetLastError = (a, b) => (z._OrtGetLastError = Z.ua)(a, b);
        z._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, r, n) => (z._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, r, n);
        z._OrtAppendExecutionProvider = (a, b) => (z._OrtAppendExecutionProvider = Z.wa)(a, b);
        z._OrtAddFreeDimensionOverride = (a, b, c) => (z._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);
        z._OrtAddSessionConfigEntry = (a, b, c) => (z._OrtAddSessionConfigEntry = Z.ya)(a, b, c);
        z._OrtReleaseSessionOptions = (a) => (z._OrtReleaseSessionOptions = Z.za)(a);
        z._OrtCreateSession = (a, b, c) => (z._OrtCreateSession = Z.Aa)(a, b, c);
        z._OrtReleaseSession = (a) => (z._OrtReleaseSession = Z.Ba)(a);
        z._OrtGetInputOutputCount = (a, b, c) => (z._OrtGetInputOutputCount = Z.Ca)(a, b, c);
        z._OrtGetInputName = (a, b) => (z._OrtGetInputName = Z.Da)(a, b);
        z._OrtGetOutputName = (a, b) => (z._OrtGetOutputName = Z.Ea)(a, b);
        z._OrtFree = (a) => (z._OrtFree = Z.Fa)(a);
        z._OrtCreateTensor = (a, b, c, d, e, f) => (z._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);
        z._OrtGetTensorData = (a, b, c, d, e) => (z._OrtGetTensorData = Z.Ha)(a, b, c, d, e);
        z._OrtReleaseTensor = (a) => (z._OrtReleaseTensor = Z.Ia)(a);
        z._OrtCreateRunOptions = (a, b, c, d) => (z._OrtCreateRunOptions = Z.Ja)(a, b, c, d);
        z._OrtAddRunConfigEntry = (a, b, c) => (z._OrtAddRunConfigEntry = Z.Ka)(a, b, c);
        z._OrtReleaseRunOptions = (a) => (z._OrtReleaseRunOptions = Z.La)(a);
        z._OrtCreateBinding = (a) => (z._OrtCreateBinding = Z.Ma)(a);
        z._OrtBindInput = (a, b, c) => (z._OrtBindInput = Z.Na)(a, b, c);
        z._OrtBindOutput = (a, b, c, d) => (z._OrtBindOutput = Z.Oa)(a, b, c, d);
        z._OrtClearBoundOutputs = (a) => (z._OrtClearBoundOutputs = Z.Pa)(a);
        z._OrtReleaseBinding = (a) => (z._OrtReleaseBinding = Z.Qa)(a);
        z._OrtRunWithBinding = (a, b, c, d, e) => (z._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);
        z._OrtRun = (a, b, c, d, e, f, k, l) => (z._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);
        z._OrtEndProfiling = (a) => (z._OrtEndProfiling = Z.Ta)(a);
        var Pc = () => (Pc = Z.Ua)(), gb = z._pthread_self = () => (gb = z._pthread_self = Z.Va)(), tc = z._malloc = (a) => (tc = z._malloc = Z.Wa)(a), X = z._free = (a) => (X = z._free = Z.Xa)(a);
        z.__emscripten_tls_init = () => (z.__emscripten_tls_init = Z.Ya)();
        var dc = (a) => (dc = Z.Za)(a);
        z.__embind_initialize_bindings = () => (z.__embind_initialize_bindings = Z._a)();
        var Oc = z.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = z.__emscripten_thread_init = Z.ab)(a, b, c, d, e, f);
        z.__emscripten_thread_crashed = () => (z.__emscripten_thread_crashed = Z.bb)();
        var $a = (a, b, c, d) => ($a = Z.cb)(a, b, c, d), fb = (a) => (fb = Z.db)(a), mb = z.__emscripten_thread_exit = (a) => (mb = z.__emscripten_thread_exit = Z.eb)(a), bc = () => (bc = Z.fb)(), jb = (a, b) => (jb = Z.gb)(a, b), Wa = () => (Wa = Z.hb)(), Xa = (a) => (Xa = Z.ib)(a), Za = (a) => (Za = Z.jb)(a);
        function Rc() {
          var a = Z;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
          a.Ua = b(a.Ua);
          a.Va = b(a.Va);
          a.Wa = c(a.Wa);
          a.Za = c(a.Za);
          a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);
          a.hb = b(a.hb);
          a.jb = c(a.jb);
          return a;
        }
        z.wasmMemory = m;
        z.stackAlloc = Za;
        z.stackSave = Wa;
        z.stackRestore = Xa;
        z.keepRuntimeAlive = () => 0 < O;
        z.UTF8ToString = L;
        z.stringToUTF8 = wb;
        z.lengthBytesUTF8 = ub;
        z.ExitStatus = Qa;
        z.PThread = M;
        var Sc;
        J = function Tc() {
          Sc || Uc();
          Sc || (J = Tc);
        };
        function Uc() {
          if (!(0 < I))
            if (D)
              ka(z), D || ib(Ga), startWorker(z);
            else {
              if (z.preRun)
                for ("function" == typeof z.preRun && (z.preRun = [z.preRun]); z.preRun.length; )
                  Fa.unshift(z.preRun.shift());
              ib(Fa);
              0 < I || Sc || (Sc = true, z.calledRun = true, Ba || (D || ib(Ga), ka(z), D || ib(Ha)));
            }
        }
        Uc();
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
    module2.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\n';
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
          config.numThreads = numThreads;
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

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/wasm-utils-load-file.ts
var loadFile;
var init_wasm_utils_load_file = __esm({
  "web/lib/wasm/wasm-utils-load-file.ts"() {
    "use strict";
    init_fs();
    init_promises();
    loadFile = async (file) => {
      if (typeof file === "string") {
        if (typeof process !== "undefined" && process.versions && process.versions.node) {
          try {
            return new Uint8Array(await readFile2(file));
          } catch (e) {
            if (e.code === "ERR_FS_FILE_TOO_LARGE") {
              const stream = createReadStream(file);
              const chunks = [];
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
              return new Uint8Array(Buffer.concat(chunks));
            }
            throw e;
          }
        } else {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`failed to load external data file: ${file}`);
          }
          const contentLengthHeader = response.headers.get("Content-Length");
          const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
          if (fileSize < 1073741824) {
            return new Uint8Array(await response.arrayBuffer());
          } else {
            if (!response.body) {
              throw new Error(`failed to load external data file: ${file}, no response body.`);
            }
            const reader = response.body.getReader();
            const pages = Math.ceil(fileSize / 65536);
            const buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
            let offset = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              const chunkSize = value.byteLength;
              const chunk = new Uint8Array(buffer, offset, chunkSize);
              chunk.set(value);
              offset += chunkSize;
            }
            return new Uint8Array(buffer, 0, fileSize);
          }
        }
      } else if (file instanceof Blob) {
        return new Uint8Array(await file.arrayBuffer());
      } else if (file instanceof Uint8Array) {
        return file;
      } else {
        return new Uint8Array(file);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    init_wasm_utils_load_file();
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
    };
    initEp = async (env3, epName) => {
      if (false) {
        if (typeof navigator === "undefined" || !navigator.gpu) {
          throw new Error("WebGPU is not supported in current environment");
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          throw new Error(
            'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
          );
        }
        if (!env3.wasm.simd) {
          throw new Error(
            "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
          );
        }
        const initJsep = null.init;
        await initJsep(getInstance(), env3, adapter);
      }
    };
    activeSessions = /* @__PURE__ */ new Map();
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
    copyFromExternalBuffer = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSession = async (modelData, options) => {
      let modelDataOffset, modelDataLength;
      const wasm2 = getInstance();
      if (Array.isArray(modelData)) {
        [modelDataOffset, modelDataLength] = modelData;
      } else if (modelData.buffer === wasm2.HEAPU8.buffer) {
        [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];
      } else {
        [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);
      }
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (options?.externalData && wasm2.mountExternalData) {
          const loadingPromises = [];
          for (const file of options.externalData) {
            const path = typeof file === "string" ? file : file.path;
            loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {
              wasm2.mountExternalData(path, data);
            }));
          }
          await Promise.all(loadingPromises);
        }
        sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
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
        wasm2._free(modelDataOffset);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        wasm2.unmountExternalData?.();
      }
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
    module2.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    createReadStream: () => createReadStream,\n    readFile: () => readFile,\n    readFileSync: () => readFileSync\n  });\n  var readFile, readFileSync, createReadStream;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n      readFileSync = void 0;\n      createReadStream = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm.js\n  var require_ort_wasm = __commonJS({\n    "web/lib/wasm/binding/ort-wasm.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var g = moduleArg, aa, l;\n          g.ready = new Promise((a, b) => {\n            aa = a;\n            l = b;\n          });\n          var ba = Object.assign({}, g), ca = "./this.program", da = "object" == typeof window, p = "function" == typeof importScripts, ea = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, t = "", fa, w, x;\n          if (ea) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), ha = (init_path(), __toCommonJS(path_exports));\n            t = p ? ha.dirname(t) + "/" : __dirname + "/";\n            fa = (a, b) => {\n              a = z(a) ? new URL(a) : ha.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            x = (a) => {\n              a = fa(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            w = (a, b, c, d = true) => {\n              a = z(a) ? new URL(a) : ha.normalize(a);\n              fs.readFile(a, d ? void 0 : "utf8", (e, h) => {\n                e ? c(e) : b(d ? h.buffer : h);\n              });\n            };\n            !g.thisProgram && 1 < process.argv.length && (ca = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            g.inspect = () => "[Emscripten Module object]";\n          } else if (da || p)\n            p ? t = self.location.href : "undefined" != typeof document && document.currentScript && (t = document.currentScript.src), _scriptDir && (t = _scriptDir), 0 !== t.indexOf("blob:") ? t = t.substr(0, t.replace(/[?#].*/, "").lastIndexOf("/") + 1) : t = "", fa = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, p && (x = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), w = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            };\n          var ia = console.log.bind(console), A = console.error.bind(console);\n          Object.assign(g, ba);\n          ba = null;\n          "object" != typeof WebAssembly && ja("no native wasm support detected");\n          var B, ka = false, C, D, E, G, I, J, la, ma, na, oa;\n          function pa() {\n            var a = B.buffer;\n            g.HEAP8 = C = new Int8Array(a);\n            g.HEAP16 = E = new Int16Array(a);\n            g.HEAPU8 = D = new Uint8Array(a);\n            g.HEAPU16 = G = new Uint16Array(a);\n            g.HEAP32 = I = new Int32Array(a);\n            g.HEAPU32 = J = new Uint32Array(a);\n            g.HEAPF32 = la = new Float32Array(a);\n            g.HEAPF64 = oa = new Float64Array(a);\n            g.HEAP64 = ma = new BigInt64Array(a);\n            g.HEAPU64 = na = new BigUint64Array(a);\n          }\n          var qa = [], ra = [], sa = [], K = 0, ta = null, L = null;\n          function ja(a) {\n            a = "Aborted(" + a + ")";\n            A(a);\n            ka = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          var ua = (a) => a.startsWith("data:application/octet-stream;base64,"), z = (a) => a.startsWith("file://"), M;\n          M = "ort-wasm.wasm";\n          if (!ua(M)) {\n            var va = M;\n            M = g.locateFile ? g.locateFile(va, t) : t + va;\n          }\n          function wa(a) {\n            if (x)\n              return x(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function xa(a) {\n            if (da || p) {\n              if ("function" == typeof fetch && !z(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => wa(a));\n              if (w)\n                return new Promise((b, c) => {\n                  w(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => wa(a));\n          }\n          function ya(a, b, c) {\n            return xa(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              A(`failed to asynchronously prepare wasm: ${d}`);\n              ja(d);\n            });\n          }\n          function za(a, b) {\n            var c = M;\n            return "function" != typeof WebAssembly.instantiateStreaming || ua(c) || z(c) || ea || "function" != typeof fetch ? ya(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {\n              A(`wasm streaming compile failed: ${e}`);\n              A("falling back to ArrayBuffer instantiation");\n              return ya(c, a, b);\n            }));\n          }\n          var Aa = { 890824: (a, b, c, d) => {\n            if ("undefined" == typeof g || !g.cb)\n              return 1;\n            a = N(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = g.cb.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return D.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          function Ba(a) {\n            this.Ua = a - 24;\n            this.fb = function(b) {\n              J[this.Ua + 4 >>> 2 >>> 0] = b;\n            };\n            this.eb = function(b) {\n              J[this.Ua + 8 >>> 2 >>> 0] = b;\n            };\n            this.Ya = function(b, c) {\n              this.Za();\n              this.fb(b);\n              this.eb(c);\n            };\n            this.Za = function() {\n              J[this.Ua + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var Ca = 0, Da = 0, Ea = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Fa = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ea)\n              return Ea.decode(a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var e = a[b++];\n              if (e & 128) {\n                var h = a[b++] & 63;\n                if (192 == (e & 224))\n                  d += String.fromCharCode((e & 31) << 6 | h);\n                else {\n                  var k = a[b++] & 63;\n                  e = 224 == (e & 240) ? (e & 15) << 12 | h << 6 | k : (e & 7) << 18 | h << 12 | k << 6 | a[b++] & 63;\n                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));\n                }\n              } else\n                d += String.fromCharCode(e);\n            }\n            return d;\n          }, N = (a, b) => (a >>>= 0) ? Fa(D, a, b) : "", O = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, P = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var e = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var k = a.charCodeAt(h);\n              if (55296 <= k && 57343 >= k) {\n                var m = a.charCodeAt(++h);\n                k = 65536 + ((k & 1023) << 10) | m & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - e;\n          }, Ga = (a) => {\n            if (null === a)\n              return "null";\n            var b = typeof a;\n            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;\n          }, Ha, Q = (a) => {\n            for (var b = ""; D[a >>> 0]; )\n              b += Ha[D[a++ >>> 0]];\n            return b;\n          }, Ia = {}, Ja = {}, Ka = {}, R;\n          function La(a, b, c = {}) {\n            var d = b.name;\n            if (!a)\n              throw new R(`type "${d}" must have a positive integer typeid pointer`);\n            if (Ja.hasOwnProperty(a)) {\n              if (c.gb)\n                return;\n              throw new R(`Cannot register type \'${d}\' twice`);\n            }\n            Ja[a] = b;\n            delete Ka[a];\n            Ia.hasOwnProperty(a) && (b = Ia[a], delete Ia[a], b.forEach((e) => e()));\n          }\n          function S(a, b, c = {}) {\n            if (!("argPackAdvance" in b))\n              throw new TypeError("registerType registeredInstance requires argPackAdvance");\n            La(a, b, c);\n          }\n          var Ma = (a, b, c) => {\n            switch (b) {\n              case 1:\n                return c ? (d) => C[d >>> 0 >>> 0] : (d) => D[d >>> 0 >>> 0];\n              case 2:\n                return c ? (d) => E[d >>> 1 >>> 0] : (d) => G[d >>> 1 >>> 0];\n              case 4:\n                return c ? (d) => I[d >>> 2 >>> 0] : (d) => J[d >>> 2 >>> 0];\n              case 8:\n                return c ? (d) => ma[d >>> 3] : (d) => na[d >>> 3];\n              default:\n                throw new TypeError(`invalid integer width (${b}): ${a}`);\n            }\n          };\n          function Na() {\n            this.Ra = [void 0];\n            this.ab = [];\n          }\n          var T = new Na();\n          function Oa(a) {\n            a >>>= 0;\n            a >= T.Ua && 0 === --T.get(a).bb && T.Za(a);\n          }\n          var U = (a) => {\n            if (!a)\n              throw new R("Cannot use deleted val. handle = " + a);\n            return T.get(a).value;\n          }, V = (a) => {\n            switch (a) {\n              case void 0:\n                return 1;\n              case null:\n                return 2;\n              case true:\n                return 3;\n              case false:\n                return 4;\n              default:\n                return T.Ya({ bb: 1, value: a });\n            }\n          };\n          function Pa(a) {\n            return this.fromWireType(I[a >>> 2 >>> 0]);\n          }\n          var Qa = (a, b) => {\n            switch (b) {\n              case 4:\n                return function(c) {\n                  return this.fromWireType(la[c >>> 2 >>> 0]);\n                };\n              case 8:\n                return function(c) {\n                  return this.fromWireType(oa[c >>> 3 >>> 0]);\n                };\n              default:\n                throw new TypeError(`invalid float width (${b}): ${a}`);\n            }\n          };\n          function Ra(a) {\n            return this.fromWireType(J[a >>> 2 >>> 0]);\n          }\n          var Sa = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ta = (a, b) => {\n            var c = a >> 1;\n            for (var d = c + b / 2; !(c >= d) && G[c >>> 0]; )\n              ++c;\n            c <<= 1;\n            if (32 < c - a && Sa)\n              return Sa.decode(D.subarray(a >>> 0, c >>> 0));\n            c = "";\n            for (d = 0; !(d >= b / 2); ++d) {\n              var e = E[a + 2 * d >>> 1 >>> 0];\n              if (0 == e)\n                break;\n              c += String.fromCharCode(e);\n            }\n            return c;\n          }, Ua = (a, b, c) => {\n            c ??= 2147483647;\n            if (2 > c)\n              return 0;\n            c -= 2;\n            var d = b;\n            c = c < 2 * a.length ? c / 2 : a.length;\n            for (var e = 0; e < c; ++e)\n              E[b >>> 1 >>> 0] = a.charCodeAt(e), b += 2;\n            E[b >>> 1 >>> 0] = 0;\n            return b - d;\n          }, Va = (a) => 2 * a.length, Wa = (a, b) => {\n            for (var c = 0, d = ""; !(c >= b / 4); ) {\n              var e = I[a + 4 * c >>> 2 >>> 0];\n              if (0 == e)\n                break;\n              ++c;\n              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);\n            }\n            return d;\n          }, Xa = (a, b, c) => {\n            b >>>= 0;\n            c ??= 2147483647;\n            if (4 > c)\n              return 0;\n            var d = b;\n            c = d + c - 4;\n            for (var e = 0; e < a.length; ++e) {\n              var h = a.charCodeAt(e);\n              if (55296 <= h && 57343 >= h) {\n                var k = a.charCodeAt(++e);\n                h = 65536 + ((h & 1023) << 10) | k & 1023;\n              }\n              I[b >>> 2 >>> 0] = h;\n              b += 4;\n              if (b + 4 > c)\n                break;\n            }\n            I[b >>> 2 >>> 0] = 0;\n            return b - d;\n          }, Ya = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              55296 <= d && 57343 >= d && ++c;\n              b += 4;\n            }\n            return b;\n          }, $a = (a, b) => {\n            var c = Ja[a];\n            if (void 0 === c)\n              throw a = Za(a), c = Q(a), W(a), new R(b + " has unknown type " + c);\n            return c;\n          }, ab = (a, b, c) => {\n            var d = [];\n            a = a.toWireType(d, c);\n            d.length && (J[b >>> 2 >>> 0] = V(d));\n            return a;\n          }, X = [], cb = {}, db = (a) => {\n            var b = cb[a];\n            return void 0 === b ? Q(a) : b;\n          }, eb = () => "object" == typeof globalThis ? globalThis : Function("return this")(), fb = (a) => {\n            var b = X.length;\n            X.push(a);\n            return b;\n          }, gb = (a, b) => {\n            for (var c = Array(a), d = 0; d < a; ++d)\n              c[d] = $a(J[b + 4 * d >>> 2 >>> 0], "parameter " + d);\n            return c;\n          }, hb = (a, b) => Object.defineProperty(\n            b,\n            "name",\n            { value: a }\n          );\n          function ib(a) {\n            var b = Function;\n            if (!(b instanceof Function))\n              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);\n            var c = hb(b.name || "unknownFunctionName", function() {\n            });\n            c.prototype = b.prototype;\n            c = new c();\n            a = b.apply(c, a);\n            return a instanceof Object ? a : c;\n          }\n          var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), jb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], kb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], mb = (a) => {\n            var b = O(a) + 1, c = lb(b);\n            c && P(a, D, c, b);\n            return c;\n          }, nb = [], ob = {}, qb = () => {\n            if (!pb) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ca || "./this.program" }, b;\n              for (b in ob)\n                void 0 === ob[b] ? delete a[b] : a[b] = ob[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              pb = c;\n            }\n            return pb;\n          }, pb, rb = [null, [], []], sb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], tb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function ub(a) {\n            var b = Array(O(a) + 1);\n            P(a, b, 0, b.length);\n            return b;\n          }\n          function vb(a, b, c, d) {\n            function e(f, r, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )\n                f = u[0] + f;\n              return f;\n            }\n            function h(f, r) {\n              return e(f, r, "0");\n            }\n            function k(f, r) {\n              function u(bb) {\n                return 0 > bb ? -1 : 0 < bb ? 1 : 0;\n              }\n              var H;\n              0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));\n              return H;\n            }\n            function m(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function q(f) {\n              var r = f.Sa;\n              for (f = new Date(new Date(f.Ta + 1900, 0, 1).getTime()); 0 < r; ) {\n                var u = f.getMonth(), H = (Y(f.getFullYear()) ? sb : tb)[u];\n                if (r > H - f.getDate())\n                  r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + r);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              r = m(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = m(u);\n              return 0 >= k(r, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var n = J[d + 40 >>> 2 >>> 0];\n            d = { kb: I[d >>> 2 >>> 0], jb: I[d + 4 >>> 2 >>> 0], Wa: I[d + 8 >>> 2 >>> 0], $a: I[d + 12 >>> 2 >>> 0], Xa: I[d + 16 >>> 2 >>> 0], Ta: I[d + 20 >>> 2 >>> 0], Na: I[d + 24 >>> 2 >>> 0], Sa: I[d + 28 >>> 2 >>> 0], mb: I[d + 32 >>> 2 >>> 0], ib: I[d + 36 >>> 2 >>> 0], lb: n ? N(n) : "" };\n            c = N(c);\n            n = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var v in n)\n              c = c.replace(new RegExp(v, "g"), n[v]);\n            var y = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), F = "January February March April May June July August September October November December".split(" ");\n            n = { "%a": (f) => y[f.Na].substring(0, 3), "%A": (f) => y[f.Na], "%b": (f) => F[f.Xa].substring(0, 3), "%B": (f) => F[f.Xa], "%C": (f) => h((f.Ta + 1900) / 100 | 0, 2), "%d": (f) => h(f.$a, 2), "%e": (f) => e(f.$a, 2, " "), "%g": (f) => q(f).toString().substring(2), "%G": (f) => q(f), "%H": (f) => h(f.Wa, 2), "%I": (f) => {\n              f = f.Wa;\n              0 == f ? f = 12 : 12 < f && (f -= 12);\n              return h(f, 2);\n            }, "%j": (f) => {\n              for (var r = 0, u = 0; u <= f.Xa - 1; r += (Y(f.Ta + 1900) ? sb : tb)[u++])\n                ;\n              return h(f.$a + r, 3);\n            }, "%m": (f) => h(f.Xa + 1, 2), "%M": (f) => h(f.jb, 2), "%n": () => "\\n", "%p": (f) => 0 <= f.Wa && 12 > f.Wa ? "AM" : "PM", "%S": (f) => h(f.kb, 2), "%t": () => "	", "%u": (f) => f.Na || 7, "%U": (f) => h(Math.floor((f.Sa + 7 - f.Na) / 7), 2), "%V": (f) => {\n              var r = Math.floor((f.Sa + 7 - (f.Na + 6) % 7) / 7);\n              2 >= (f.Na + 371 - f.Sa - 2) % 7 && r++;\n              if (r)\n                53 == r && (u = (f.Na + 371 - f.Sa) % 7, 4 == u || 3 == u && Y(f.Ta) || (r = 1));\n              else {\n                r = 52;\n                var u = (f.Na + 7 - f.Sa - 1) % 7;\n                (4 == u || 5 == u && Y(f.Ta % 400 - 1)) && r++;\n              }\n              return h(r, 2);\n            }, "%w": (f) => f.Na, "%W": (f) => h(Math.floor((f.Sa + 7 - (f.Na + 6) % 7) / 7), 2), "%y": (f) => (f.Ta + 1900).toString().substring(2), "%Y": (f) => f.Ta + 1900, "%z": (f) => {\n              f = f.ib;\n              var r = 0 <= f;\n              f = Math.abs(f) / 60;\n              return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n            }, "%Z": (f) => f.lb, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (v in n)\n              c.includes(v) && (c = c.replace(new RegExp(v, "g"), n[v](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            v = ub(c);\n            if (v.length > b)\n              return 0;\n            C.set(v, a >>> 0);\n            return v.length - 1;\n          }\n          for (var wb = Array(256), xb = 0; 256 > xb; ++xb)\n            wb[xb] = String.fromCharCode(xb);\n          Ha = wb;\n          R = g.BindingError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "BindingError";\n            }\n          };\n          g.InternalError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "InternalError";\n            }\n          };\n          Object.assign(Na.prototype, { get(a) {\n            return this.Ra[a];\n          }, has(a) {\n            return void 0 !== this.Ra[a];\n          }, Ya(a) {\n            var b = this.ab.pop() || this.Ra.length;\n            this.Ra[b] = a;\n            return b;\n          }, Za(a) {\n            this.Ra[a] = void 0;\n            this.ab.push(a);\n          } });\n          T.Ra.push({ value: void 0 }, { value: null }, { value: true }, { value: false });\n          T.Ua = T.Ra.length;\n          g.count_emval_handles = () => {\n            for (var a = 0, b = T.Ua; b < T.Ra.length; ++b)\n              void 0 !== T.Ra[b] && ++a;\n            return a;\n          };\n          var zb = {\n            a: function(a, b, c) {\n              a >>>= 0;\n              new Ba(a).Ya(b >>> 0, c >>> 0);\n              Ca = a;\n              Da++;\n              throw Ca;\n            },\n            t: function() {\n              return 0;\n            },\n            $: function() {\n            },\n            M: function() {\n            },\n            O: function() {\n            },\n            G: function() {\n              return 0;\n            },\n            Z: function() {\n            },\n            U: function() {\n            },\n            Y: function() {\n            },\n            B: function() {\n            },\n            N: function() {\n            },\n            K: function() {\n            },\n            _: function() {\n            },\n            L: function() {\n            },\n            E: function(a, b, c, d, e) {\n              b >>>= 0;\n              b = Q(b);\n              var h = -1 != b.indexOf("u");\n              h && (e = (1n << 64n) - 1n);\n              S(a >>> 0, { name: b, fromWireType: (k) => k, toWireType: function(k, m) {\n                if ("bigint" != typeof m && "number" != typeof m)\n                  throw new TypeError(`Cannot convert "${Ga(m)}" to ${this.name}`);\n                if (m < d || m > e)\n                  throw new TypeError(`Passing a number "${Ga(m)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);\n                return m;\n              }, argPackAdvance: 8, readValueFromPointer: Ma(b, c >>> 0, !h), Va: null });\n            },\n            da: function(a, b, c, d) {\n              b = Q(b >>> 0);\n              S(a >>> 0, { name: b, fromWireType: function(e) {\n                return !!e;\n              }, toWireType: function(e, h) {\n                return h ? c : d;\n              }, argPackAdvance: 8, readValueFromPointer: function(e) {\n                return this.fromWireType(D[e >>> 0]);\n              }, Va: null });\n            },\n            ca: function(a, b) {\n              b = Q(b >>> 0);\n              S(a >>> 0, {\n                name: b,\n                fromWireType: (c) => {\n                  var d = U(c);\n                  Oa(c);\n                  return d;\n                },\n                toWireType: (c, d) => V(d),\n                argPackAdvance: 8,\n                readValueFromPointer: Pa,\n                Va: null\n              });\n            },\n            D: function(a, b, c) {\n              b = Q(b >>> 0);\n              S(a >>> 0, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Qa(b, c >>> 0), Va: null });\n            },\n            q: function(a, b, c, d, e) {\n              a >>>= 0;\n              c >>>= 0;\n              b = Q(b >>> 0);\n              -1 === e && (e = 4294967295);\n              e = (m) => m;\n              if (0 === d) {\n                var h = 32 - 8 * c;\n                e = (m) => m << h >>> h;\n              }\n              var k = b.includes("unsigned") ? function(m, q) {\n                return q >>> 0;\n              } : function(m, q) {\n                return q;\n              };\n              S(a, {\n                name: b,\n                fromWireType: e,\n                toWireType: k,\n                argPackAdvance: 8,\n                readValueFromPointer: Ma(b, c, 0 !== d),\n                Va: null\n              });\n            },\n            l: function(a, b, c) {\n              function d(h) {\n                return new e(C.buffer, J[h + 4 >>> 2 >>> 0], J[h >>> 2 >>> 0]);\n              }\n              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];\n              c = Q(c >>> 0);\n              S(a >>> 0, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { gb: true });\n            },\n            F: function(a, b) {\n              b = Q(b >>> 0);\n              var c = "std::string" === b;\n              S(a >>> 0, { name: b, fromWireType: function(d) {\n                var e = J[d >>> 2 >>> 0], h = d + 4;\n                if (c)\n                  for (var k = h, m = 0; m <= e; ++m) {\n                    var q = h + m;\n                    if (m == e || 0 == D[q >>> 0]) {\n                      k = N(k, q - k);\n                      if (void 0 === n)\n                        var n = k;\n                      else\n                        n += String.fromCharCode(0), n += k;\n                      k = q + 1;\n                    }\n                  }\n                else {\n                  n = Array(e);\n                  for (m = 0; m < e; ++m)\n                    n[m] = String.fromCharCode(D[h + m >>> 0]);\n                  n = n.join("");\n                }\n                W(d);\n                return n;\n              }, toWireType: function(d, e) {\n                e instanceof ArrayBuffer && (e = new Uint8Array(e));\n                var h = "string" == typeof e;\n                if (!(h || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))\n                  throw new R("Cannot pass non-string to std::string");\n                var k = c && h ? O(e) : e.length;\n                var m = lb(4 + k + 1), q = m + 4;\n                J[m >>> 2 >>> 0] = k;\n                if (c && h)\n                  P(e, D, q, k + 1);\n                else if (h)\n                  for (h = 0; h < k; ++h) {\n                    var n = e.charCodeAt(h);\n                    if (255 < n)\n                      throw W(q), new R("String has UTF-16 code units that do not fit in 8 bits");\n                    D[q + h >>> 0] = n;\n                  }\n                else\n                  for (h = 0; h < k; ++h)\n                    D[q + h >>> 0] = e[h];\n                null !== d && d.push(W, m);\n                return m;\n              }, argPackAdvance: 8, readValueFromPointer: Ra, Va(d) {\n                W(d);\n              } });\n            },\n            v: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              c = Q(c);\n              if (2 === b) {\n                var d = Ta;\n                var e = Ua;\n                var h = Va;\n                var k = () => G;\n                var m = 1;\n              } else\n                4 === b && (d = Wa, e = Xa, h = Ya, k = () => J, m = 2);\n              S(a >>> 0, { name: c, fromWireType: (q) => {\n                for (var n = J[q >>> 2 >>> 0], v = k(), y, F = q + 4, f = 0; f <= n; ++f) {\n                  var r = q + 4 + f * b;\n                  if (f == n || 0 == v[r >>> m])\n                    F = d(F, r - F), void 0 === y ? y = F : (y += String.fromCharCode(0), y += F), F = r + b;\n                }\n                W(q);\n                return y;\n              }, toWireType: (q, n) => {\n                if ("string" != typeof n)\n                  throw new R(`Cannot pass non-string to C++ string type ${c}`);\n                var v = h(n), y = lb(4 + v + b);\n                J[y >>> 2] = v >> m;\n                e(n, y + 4, v + b);\n                null !== q && q.push(W, y);\n                return y;\n              }, argPackAdvance: 8, readValueFromPointer: Pa, Va(q) {\n                W(q);\n              } });\n            },\n            ea: function(a, b) {\n              b = Q(b >>> 0);\n              S(a >>> 0, { hb: true, name: b, argPackAdvance: 0, fromWireType: () => {\n              }, toWireType: () => {\n              } });\n            },\n            aa: () => 1,\n            o: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = U(a >>> 0);\n              b = $a(b, "emval::as");\n              return ab(b, c, a);\n            },\n            x: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = X[a >>> 0];\n              b = U(b >>> 0);\n              return a(null, b, c, d);\n            },\n            j: function(a, b, c, d, e) {\n              c >>>= 0;\n              d >>>= 0;\n              e >>>= 0;\n              a = X[a >>> 0];\n              b = U(b >>> 0);\n              c = db(c);\n              return a(b, b[c], d, e);\n            },\n            b: Oa,\n            w: function(a, b) {\n              b >>>= 0;\n              a = U(a >>> 0);\n              b = U(b);\n              return a == b;\n            },\n            s: function(a) {\n              a >>>= 0;\n              if (0 === a)\n                return V(eb());\n              a = db(a);\n              return V(eb()[a]);\n            },\n            i: function(a, b, c) {\n              b = gb(a, b >>> 0);\n              var d = b.shift();\n              a--;\n              var e = "return function (obj, func, destructorsRef, args) {\\n", h = 0, k = [];\n              0 === c && k.push("obj");\n              for (var m = ["retType"], q = [d], n = 0; n < a; ++n)\n                k.push("arg" + n), m.push("argType" + n), q.push(b[n]), e += `  var arg${n} = argType${n}.readValueFromPointer(args${h ? "+" + h : ""});\n`, h += b[n].argPackAdvance;\n              e += `  var rv = ${1 === c ? "new func" : "func.call"}(${k.join(", ")});\n`;\n              for (n = 0; n < a; ++n)\n                b[n].deleteObject && (e += `  argType${n}.deleteObject(arg${n});\n`);\n              d.hb || (m.push("emval_returnValue"), q.push(ab), e += "  return emval_returnValue(retType, destructorsRef, rv);\\n");\n              m.push(e + "};\\n");\n              a = ib(m).apply(null, q);\n              c = `methodCaller<(${b.map((v) => v.name).join(", ")}) => ${d.name}>`;\n              return fb(hb(c, a));\n            },\n            p: function(a, b) {\n              b >>>= 0;\n              a = U(a >>> 0);\n              b = U(b);\n              return V(a[b]);\n            },\n            c: function(a) {\n              a >>>= 0;\n              4 < a && (T.get(a).bb += 1);\n            },\n            r: function() {\n              return V([]);\n            },\n            k: function(a) {\n              a = U(a >>> 0);\n              for (var b = Array(a.length), c = 0; c < a.length; c++)\n                b[c] = a[c];\n              return V(b);\n            },\n            d: function(a) {\n              return V(db(a >>> 0));\n            },\n            h: function() {\n              return V({});\n            },\n            g: function(a) {\n              a >>>= 0;\n              for (var b = U(a); b.length; ) {\n                var c = b.pop();\n                b.pop()(c);\n              }\n              Oa(a);\n            },\n            f: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = U(a >>> 0);\n              b = U(b);\n              c = U(c);\n              a[b] = c;\n            },\n            e: function(a, b) {\n              b >>>= 0;\n              a = $a(a >>> 0, "_emval_take_value");\n              a = a.readValueFromPointer(b);\n              return V(a);\n            },\n            R: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              I[b >>> 2 >>> 0] = a.getUTCSeconds();\n              I[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              I[b + 8 >>> 2 >>> 0] = a.getUTCHours();\n              I[b + 12 >>> 2 >>> 0] = a.getUTCDate();\n              I[b + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              I[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              I[b + 24 >>> 2 >>> 0] = a.getUTCDay();\n              I[b + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n            },\n            S: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              I[b >>> 2 >>> 0] = a.getSeconds();\n              I[b + 4 >>> 2 >>> 0] = a.getMinutes();\n              I[b + 8 >>> 2 >>> 0] = a.getHours();\n              I[b + 12 >>> 2 >>> 0] = a.getDate();\n              I[b + 16 >>> 2 >>> 0] = a.getMonth();\n              I[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              I[b + 24 >>> 2 >>> 0] = a.getDay();\n              I[b + 28 >>> 2 >>> 0] = (Y(a.getFullYear()) ? jb : kb)[a.getMonth()] + a.getDate() - 1 | 0;\n              I[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              var c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(), d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              I[b + 32 >>> 2 >>> 0] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;\n            },\n            T: function(a) {\n              a >>>= 0;\n              var b = new Date(I[a + 20 >>> 2 >>> 0] + 1900, I[a + 16 >>> 2 >>> 0], I[a + 12 >>> 2 >>> 0], I[a + 8 >>> 2 >>> 0], I[a + 4 >>> 2 >>> 0], I[a >>> 2 >>> 0], 0), c = I[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(h, e);\n              0 > c ? I[a + 32 >>> 2 >>> 0] = Number(e != h && k == d) : 0 < c != (k == d) && (e = Math.max(h, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));\n              I[a + 24 >>> 2 >>> 0] = b.getDay();\n              I[a + 28 >>> 2 >>> 0] = (Y(b.getFullYear()) ? jb : kb)[b.getMonth()] + b.getDate() - 1 | 0;\n              I[a >>> 2 >>> 0] = b.getSeconds();\n              I[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              I[a + 8 >>> 2 >>> 0] = b.getHours();\n              I[a + 12 >>> 2 >>> 0] = b.getDate();\n              I[a + 16 >>> 2 >>> 0] = b.getMonth();\n              I[a + 20 >>> 2 >>> 0] = b.getYear();\n              a = b.getTime();\n              isNaN(a) ? (I[yb() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;\n              return BigInt(a);\n            },\n            P: function() {\n              return -52;\n            },\n            Q: function() {\n            },\n            I: function(a, b, c) {\n              function d(q) {\n                return (q = q.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? q[1] : "GMT";\n              }\n              c >>>= 0;\n              var e = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(\n                e,\n                0,\n                1\n              ), k = new Date(e, 6, 1);\n              e = h.getTimezoneOffset();\n              var m = k.getTimezoneOffset();\n              J[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(e, m);\n              I[b >>> 0 >>> 2 >>> 0] = Number(e != m);\n              a = d(h);\n              b = d(k);\n              a = mb(a);\n              b = mb(b);\n              m < e ? (J[c >>> 2 >>> 0] = a, J[c + 4 >>> 2 >>> 0] = b) : (J[c >>> 2 >>> 0] = b, J[c + 4 >>> 2 >>> 0] = a);\n            },\n            y: () => {\n              ja("");\n            },\n            fa: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              nb.length = 0;\n              for (var d; d = D[b++ >>> 0]; ) {\n                var e = 105 != d;\n                e &= 112 != d;\n                c += e && c % 8 ? 4 : 0;\n                nb.push(112 == d ? J[c >>> 2 >>> 0] : 106 == d ? ma[c >>> 3] : 105 == d ? I[c >>> 2 >>> 0] : oa[c >>> 3 >>> 0]);\n                c += e ? 8 : 4;\n              }\n              return Aa[a].apply(null, nb);\n            },\n            C: () => Date.now(),\n            J: function() {\n              return 4294901760;\n            },\n            n: () => performance.now(),\n            H: function(a) {\n              a >>>= 0;\n              var b = D.length;\n              if (4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var e = Math;\n                d = Math.max(a, d);\n                a: {\n                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - B.buffer.byteLength + 65535) / 65536;\n                  try {\n                    B.grow(e);\n                    pa();\n                    var h = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  h = void 0;\n                }\n                if (h)\n                  return true;\n              }\n              return false;\n            },\n            W: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = 0;\n              qb().forEach((d, e) => {\n                var h = b + c;\n                e = J[a + 4 * e >>> 2 >>> 0] = h;\n                for (h = 0; h < d.length; ++h)\n                  C[e++ >>> 0 >>> 0] = d.charCodeAt(h);\n                C[e >>> 0 >>> 0] = 0;\n                c += d.length + 1;\n              });\n              return 0;\n            },\n            X: function(a, b) {\n              a >>>= 0;\n              b >>>= 0;\n              var c = qb();\n              J[a >>> 2 >>> 0] = c.length;\n              var d = 0;\n              c.forEach((e) => d += e.length + 1);\n              J[b >>> 2 >>> 0] = d;\n              return 0;\n            },\n            u: () => 52,\n            A: function() {\n              return 52;\n            },\n            V: function() {\n              return 70;\n            },\n            z: function(a, b, c, d) {\n              b >>>= 0;\n              c >>>= 0;\n              d >>>= 0;\n              for (var e = 0, h = 0; h < c; h++) {\n                var k = J[b >>> 2 >>> 0], m = J[b + 4 >>> 2 >>> 0];\n                b += 8;\n                for (var q = 0; q < m; q++) {\n                  var n = D[k + q >>> 0], v = rb[a];\n                  0 === n || 10 === n ? ((1 === a ? ia : A)(Fa(v, 0)), v.length = 0) : v.push(n);\n                }\n                e += m;\n              }\n              J[d >>> 2 >>> 0] = e;\n              return 0;\n            },\n            ba: vb,\n            m: function(a, b, c, d) {\n              return vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            function a(c) {\n              Z = c.exports;\n              Z = Ab();\n              B = Z.ga;\n              pa();\n              ra.unshift(Z.ha);\n              K--;\n              0 == K && (null !== ta && (clearInterval(ta), ta = null), L && (c = L, L = null, c()));\n              return Z;\n            }\n            var b = { a: zb };\n            K++;\n            if (g.instantiateWasm)\n              try {\n                return g.instantiateWasm(b, a);\n              } catch (c) {\n                A(`Module.instantiateWasm callback failed with error: ${c}`), l(c);\n              }\n            za(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          }();\n          g._OrtInit = (a, b) => (g._OrtInit = Z.ia)(a, b);\n          g._OrtGetLastError = (a, b) => (g._OrtGetLastError = Z.ja)(a, b);\n          g._OrtCreateSessionOptions = (a, b, c, d, e, h, k, m, q, n) => (g._OrtCreateSessionOptions = Z.ka)(a, b, c, d, e, h, k, m, q, n);\n          g._OrtAppendExecutionProvider = (a, b) => (g._OrtAppendExecutionProvider = Z.la)(a, b);\n          g._OrtAddFreeDimensionOverride = (a, b, c) => (g._OrtAddFreeDimensionOverride = Z.ma)(a, b, c);\n          g._OrtAddSessionConfigEntry = (a, b, c) => (g._OrtAddSessionConfigEntry = Z.na)(a, b, c);\n          g._OrtReleaseSessionOptions = (a) => (g._OrtReleaseSessionOptions = Z.oa)(a);\n          g._OrtCreateSession = (a, b, c) => (g._OrtCreateSession = Z.pa)(a, b, c);\n          g._OrtReleaseSession = (a) => (g._OrtReleaseSession = Z.qa)(a);\n          g._OrtGetInputOutputCount = (a, b, c) => (g._OrtGetInputOutputCount = Z.ra)(a, b, c);\n          g._OrtGetInputName = (a, b) => (g._OrtGetInputName = Z.sa)(a, b);\n          g._OrtGetOutputName = (a, b) => (g._OrtGetOutputName = Z.ta)(a, b);\n          g._OrtFree = (a) => (g._OrtFree = Z.ua)(a);\n          g._OrtCreateTensor = (a, b, c, d, e, h) => (g._OrtCreateTensor = Z.va)(a, b, c, d, e, h);\n          g._OrtGetTensorData = (a, b, c, d, e) => (g._OrtGetTensorData = Z.wa)(a, b, c, d, e);\n          g._OrtReleaseTensor = (a) => (g._OrtReleaseTensor = Z.xa)(a);\n          g._OrtCreateRunOptions = (a, b, c, d) => (g._OrtCreateRunOptions = Z.ya)(a, b, c, d);\n          g._OrtAddRunConfigEntry = (a, b, c) => (g._OrtAddRunConfigEntry = Z.za)(a, b, c);\n          g._OrtReleaseRunOptions = (a) => (g._OrtReleaseRunOptions = Z.Aa)(a);\n          g._OrtCreateBinding = (a) => (g._OrtCreateBinding = Z.Ba)(a);\n          g._OrtBindInput = (a, b, c) => (g._OrtBindInput = Z.Ca)(a, b, c);\n          g._OrtBindOutput = (a, b, c, d) => (g._OrtBindOutput = Z.Da)(a, b, c, d);\n          g._OrtClearBoundOutputs = (a) => (g._OrtClearBoundOutputs = Z.Ea)(a);\n          g._OrtReleaseBinding = (a) => (g._OrtReleaseBinding = Z.Fa)(a);\n          g._OrtRunWithBinding = (a, b, c, d, e) => (g._OrtRunWithBinding = Z.Ga)(a, b, c, d, e);\n          g._OrtRun = (a, b, c, d, e, h, k, m) => (g._OrtRun = Z.Ha)(a, b, c, d, e, h, k, m);\n          g._OrtEndProfiling = (a) => (g._OrtEndProfiling = Z.Ia)(a);\n          var yb = () => (yb = Z.Ja)(), lb = g._malloc = (a) => (lb = g._malloc = Z.Ka)(a), W = g._free = (a) => (W = g._free = Z.La)(a), Za = (a) => (Za = Z.Ma)(a), Bb = () => (Bb = Z.Oa)(), Cb = (a) => (Cb = Z.Pa)(a), Db = (a) => (Db = Z.Qa)(a);\n          function Ab() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;\n            a.Ja = b(a.Ja);\n            a.Ka = c(a.Ka);\n            a.Ma = c(a.Ma);\n            a.Oa = b(a.Oa);\n            a.Qa = c(a.Qa);\n            return a;\n          }\n          g.stackAlloc = Db;\n          g.stackSave = Bb;\n          g.stackRestore = Cb;\n          g.UTF8ToString = N;\n          g.stringToUTF8 = (a, b, c) => P(a, D, b, c);\n          g.lengthBytesUTF8 = O;\n          var Eb;\n          L = function Fb() {\n            Eb || Gb();\n            Eb || (L = Fb);\n          };\n          function Gb() {\n            if (!(0 < K)) {\n              if (g.preRun)\n                for ("function" == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length; ) {\n                  var a = g.preRun.shift();\n                  qa.unshift(a);\n                }\n              for (; 0 < qa.length; )\n                qa.shift()(g);\n              if (!(0 < K || Eb || (Eb = true, g.calledRun = true, ka))) {\n                for (; 0 < ra.length; )\n                  ra.shift()(g);\n                for (aa(g); 0 < sa.length; )\n                  sa.shift()(g);\n              }\n            }\n          }\n          Gb();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function g() {\n            m.buffer != p.buffer && q();\n            return p;\n          }\n          function t() {\n            m.buffer != p.buffer && q();\n            return aa;\n          }\n          function ba() {\n            m.buffer != p.buffer && q();\n            return ca;\n          }\n          function da() {\n            m.buffer != p.buffer && q();\n            return ea;\n          }\n          function v() {\n            m.buffer != p.buffer && q();\n            return fa;\n          }\n          function w() {\n            m.buffer != p.buffer && q();\n            return ha;\n          }\n          function ia() {\n            m.buffer != p.buffer && q();\n            return ja;\n          }\n          var z = moduleArg, ka, la;\n          z.ready = new Promise((a, b) => {\n            ka = a;\n            la = b;\n          });\n          var ma = Object.assign({}, z), na = "./this.program", oa = (a, b) => {\n            throw b;\n          }, pa = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = z.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function qa(a) {\n            return z.locateFile ? z.locateFile(a, E) : E + a;\n          }\n          var ra, sa, ta;\n          if (B) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), ua = (init_path(), __toCommonJS(path_exports));\n            E = A ? ua.dirname(E) + "/" : __dirname + "/";\n            ra = (b, c) => {\n              b = va(b) ? new URL(b) : ua.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            ta = (b) => {\n              b = ra(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            sa = (b, c, d, e = true) => {\n              b = va(b) ? new URL(b) : ua.normalize(b);\n              fs.readFile(b, e ? void 0 : "utf8", (f, k) => {\n                f ? d(f) : c(e ? k.buffer : k);\n              });\n            };\n            !z.thisProgram && 1 < process.argv.length && (na = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            oa = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            z.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (pa || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), 0 !== E.indexOf("blob:") ? E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1) : E = "", B || (ra = (a) => {\n              var b = new XMLHttpRequest();\n              b.open(\n                "GET",\n                a,\n                false\n              );\n              b.send(null);\n              return b.responseText;\n            }, A && (ta = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), sa = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var wa = console.log.bind(console), xa = console.error.bind(console);\n          B && (wa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), xa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var ya = wa, F = xa;\n          Object.assign(z, ma);\n          ma = null;\n          "object" != typeof WebAssembly && za("no native wasm support detected");\n          var m, Aa, Ba = false, G, p, aa, ca, ea, fa, ha, Ca, H, Da, ja;\n          function q() {\n            var a = m.buffer;\n            z.HEAP8 = p = new Int8Array(a);\n            z.HEAP16 = ca = new Int16Array(a);\n            z.HEAPU8 = aa = new Uint8Array(a);\n            z.HEAPU16 = ea = new Uint16Array(a);\n            z.HEAP32 = fa = new Int32Array(a);\n            z.HEAPU32 = ha = new Uint32Array(a);\n            z.HEAPF32 = Ca = new Float32Array(a);\n            z.HEAPF64 = ja = new Float64Array(a);\n            z.HEAP64 = H = new BigInt64Array(a);\n            z.HEAPU64 = Da = new BigUint64Array(a);\n          }\n          var Ea = 16777216;\n          if (D)\n            m = z.wasmMemory;\n          else if (z.wasmMemory)\n            m = z.wasmMemory;\n          else if (m = new WebAssembly.Memory({ initial: Ea / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))\n            throw F("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && F("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          q();\n          Ea = m.buffer.byteLength;\n          var Fa = [], Ga = [], Ha = [], I = 0, Ia = null, J = null;\n          function Ja() {\n            I--;\n            if (0 == I && (null !== Ia && (clearInterval(Ia), Ia = null), J)) {\n              var a = J;\n              J = null;\n              a();\n            }\n          }\n          function za(a) {\n            a = "Aborted(" + a + ")";\n            F(a);\n            Ba = true;\n            G = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            la(a);\n            throw a;\n          }\n          var Ka = (a) => a.startsWith("data:application/octet-stream;base64,"), va = (a) => a.startsWith("file://"), K;\n          K = "ort-wasm-threaded.wasm";\n          Ka(K) || (K = qa(K));\n          function La(a) {\n            if (ta)\n              return ta(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ma(a) {\n            if (pa || A) {\n              if ("function" == typeof fetch && !va(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => La(a));\n              if (sa)\n                return new Promise((b, c) => {\n                  sa(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => La(a));\n          }\n          function Na(a, b, c) {\n            return Ma(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              F(`failed to asynchronously prepare wasm: ${d}`);\n              za(d);\n            });\n          }\n          function Oa(a, b) {\n            var c = K;\n            return "function" != typeof WebAssembly.instantiateStreaming || Ka(c) || va(c) || B || "function" != typeof fetch ? Na(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {\n              F(`wasm streaming compile failed: ${e}`);\n              F("falling back to ArrayBuffer instantiation");\n              return Na(c, a, b);\n            }));\n          }\n          var Pa = { 891868: (a, b, c, d) => {\n            if ("undefined" == typeof z || !z.Hb)\n              return 1;\n            a = L(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = z.Hb.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return t().set(a.subarray(b, b + c), d >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          function Qa(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          var Ra = (a) => {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }, Ta = (a) => {\n            0 == M.ob.length && (Sa(), M.Bb(M.ob[0]));\n            var b = M.ob.pop();\n            if (!b)\n              return 6;\n            M.pb.push(b);\n            M.kb[a.nb] = b;\n            b.nb = a.nb;\n            var c = { cmd: "run", start_routine: a.Ob, arg: a.Ib, pthread_ptr: a.nb };\n            B && b.unref();\n            b.postMessage(c, a.Ub);\n            return 0;\n          }, O = 0, Ua = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Va = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ua)\n              return Ua.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var e = a[b++];\n              if (e & 128) {\n                var f = a[b++] & 63;\n                if (192 == (e & 224))\n                  d += String.fromCharCode((e & 31) << 6 | f);\n                else {\n                  var k = a[b++] & 63;\n                  e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;\n                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));\n                }\n              } else\n                d += String.fromCharCode(e);\n            }\n            return d;\n          }, L = (a, b) => (a >>>= 0) ? Va(t(), a, b) : "", Ya = (a) => {\n            var b = Wa();\n            a = a();\n            Xa(b);\n            return a;\n          };\n          function P(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return Ya(() => {\n              for (var e = 2 * c, f = Za(8 * e), k = f >>> 3, l = 0; l < c; l++) {\n                var r = d[2 + l];\n                "bigint" == typeof r ? (H[k + 2 * l] = 1n, H[k + 2 * l + 1] = r) : (H[k + 2 * l] = 0n, ia()[k + 2 * l + 1 >>> 0] = r);\n              }\n              return $a(a, e, f, b);\n            });\n          }\n          function ab(a) {\n            if (D)\n              return P(0, 1, a);\n            G = a;\n            0 < O || (M.Pb(), z.onExit?.(a), Ba = true);\n            oa(a, new Qa(a));\n          }\n          var cb = (a) => {\n            G = a;\n            if (D)\n              throw bb(a), "unwind";\n            ab(a);\n          };\n          function db() {\n            for (var a = z.numThreads; a--; )\n              Sa();\n            Fa.unshift(() => {\n              I++;\n              eb(() => Ja());\n            });\n          }\n          function Sa() {\n            var a = qa("ort-wasm-threaded.worker.js");\n            a = new Worker(a);\n            M.ob.push(a);\n          }\n          function eb(a) {\n            D ? a() : Promise.all(M.ob.map(M.Bb)).then(a);\n          }\n          var M = { ob: [], pb: [], Gb: [], kb: {}, wb() {\n            D ? (M.receiveObjectTransfer = M.Nb, M.threadInitTLS = M.Fb, M.setExitStatus = M.Eb) : db();\n          }, Eb: (a) => G = a, Xb: ["$terminateWorker"], Pb: () => {\n            for (var a of M.pb)\n              Ra(a);\n            for (a of M.ob)\n              Ra(a);\n            M.ob = [];\n            M.pb = [];\n            M.kb = [];\n          }, Db: (a) => {\n            var b = a.nb;\n            delete M.kb[b];\n            M.ob.push(a);\n            M.pb.splice(M.pb.indexOf(a), 1);\n            a.nb = 0;\n            fb(b);\n          }, Nb() {\n          }, Fb() {\n            M.Gb.forEach((a) => a());\n          }, Bb: (a) => new Promise((b) => {\n            a.onmessage = (f) => {\n              f = f.data;\n              var k = f.cmd;\n              if (f.targetThread && f.targetThread != gb()) {\n                var l = M.kb[f.targetThread];\n                l ? l.postMessage(f, f.transferList) : F(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);\n              } else if ("checkMailbox" === k)\n                hb();\n              else if ("spawnThread" === k)\n                Ta(f);\n              else if ("cleanupThread" === k)\n                M.Db(M.kb[f.thread]);\n              else if ("killThread" === k)\n                f = f.thread, k = M.kb[f], delete M.kb[f], Ra(k), fb(f), M.pb.splice(M.pb.indexOf(k), 1), k.nb = 0;\n              else if ("cancelThread" === k)\n                M.kb[f.thread].postMessage({ cmd: "cancel" });\n              else if ("loaded" === k)\n                a.loaded = true, B && !a.nb && a.unref(), b(a);\n              else if ("alert" === k)\n                alert(`Thread ${f.threadId}: ${f.text}`);\n              else if ("setimmediate" === f.target)\n                a.postMessage(f);\n              else if ("callHandler" === k)\n                z[f.handler](...f.args);\n              else\n                k && F(`worker sent an unknown command ${k}`);\n            };\n            a.onerror = (f) => {\n              F(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);\n              throw f;\n            };\n            B && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));\n            var c = [], d = ["onExit"], e;\n            for (e of d)\n              z.hasOwnProperty(e) && c.push(e);\n            a.postMessage({ cmd: "load", handlers: c, urlOrBlob: z.mainScriptUrlOrBlob || _scriptDir, wasmMemory: m, wasmModule: Aa });\n          }) };\n          z.PThread = M;\n          var ib = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(z);\n          };\n          z.establishStackSpace = () => {\n            var a = gb(), b = w()[a + 52 >>> 2 >>> 0];\n            a = w()[a + 56 >>> 2 >>> 0];\n            jb(b, b - a);\n            Xa(b);\n          };\n          function bb(a) {\n            if (D)\n              return P(1, 0, a);\n            cb(a);\n          }\n          var kb = [], lb;\n          z.invokeEntryPoint = (a, b) => {\n            var c = kb[a];\n            c || (a >= kb.length && (kb.length = a + 1), kb[a] = c = lb.get(a));\n            a = c(b);\n            0 < O ? M.Eb(a) : mb(a);\n          };\n          function nb(a) {\n            this.tb = a - 24;\n            this.Mb = function(b) {\n              w()[this.tb + 4 >>> 2 >>> 0] = b;\n            };\n            this.yb = function(b) {\n              w()[this.tb + 8 >>> 2 >>> 0] = b;\n            };\n            this.wb = function(b, c) {\n              this.xb();\n              this.Mb(b);\n              this.yb(c);\n            };\n            this.xb = function() {\n              w()[this.tb + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var ob = 0, pb = 0;\n          function qb(a, b, c, d) {\n            return D ? P(2, 1, a, b, c, d) : rb(a, b, c, d);\n          }\n          function rb(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return F("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var e = [];\n            if (D && 0 === e.length)\n              return qb(a, b, c, d);\n            a = { Ob: c, nb: a, Ib: d, Ub: e };\n            return D ? (a.Wb = "spawnThread", postMessage(a, e), 0) : Ta(a);\n          }\n          function sb(a, b, c) {\n            return D ? P(3, 1, a, b, c) : 0;\n          }\n          function tb(a, b) {\n            if (D)\n              return P(4, 1, a, b);\n          }\n          var ub = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, vb = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var e = c;\n            d = c + d - 1;\n            for (var f = 0; f < a.length; ++f) {\n              var k = a.charCodeAt(f);\n              if (55296 <= k && 57343 >= k) {\n                var l = a.charCodeAt(++f);\n                k = 65536 + ((k & 1023) << 10) | l & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - e;\n          }, wb = (a, b, c) => vb(a, t(), b, c);\n          function xb(a, b) {\n            if (D)\n              return P(5, 1, a, b);\n          }\n          function yb(a, b, c) {\n            if (D)\n              return P(6, 1, a, b, c);\n          }\n          function zb(a, b, c) {\n            return D ? P(7, 1, a, b, c) : 0;\n          }\n          function Ab(a, b) {\n            if (D)\n              return P(8, 1, a, b);\n          }\n          function Bb(a, b, c) {\n            if (D)\n              return P(9, 1, a, b, c);\n          }\n          function Cb(a, b, c, d) {\n            if (D)\n              return P(10, 1, a, b, c, d);\n          }\n          function Db(a, b, c, d) {\n            if (D)\n              return P(11, 1, a, b, c, d);\n          }\n          function Eb(a, b, c, d) {\n            if (D)\n              return P(12, 1, a, b, c, d);\n          }\n          function Fb(a) {\n            if (D)\n              return P(13, 1, a);\n          }\n          function Gb(a, b) {\n            if (D)\n              return P(14, 1, a, b);\n          }\n          function Hb(a, b, c) {\n            if (D)\n              return P(15, 1, a, b, c);\n          }\n          var Ib = (a) => {\n            if (null === a)\n              return "null";\n            var b = typeof a;\n            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;\n          }, Jb, R = (a) => {\n            for (var b = ""; t()[a >>> 0]; )\n              b += Jb[t()[a++ >>> 0]];\n            return b;\n          }, Kb = {}, Lb = {}, Mb = {}, S;\n          function Nb(a, b, c = {}) {\n            var d = b.name;\n            if (!a)\n              throw new S(`type "${d}" must have a positive integer typeid pointer`);\n            if (Lb.hasOwnProperty(a)) {\n              if (c.Kb)\n                return;\n              throw new S(`Cannot register type \'${d}\' twice`);\n            }\n            Lb[a] = b;\n            delete Mb[a];\n            Kb.hasOwnProperty(a) && (b = Kb[a], delete Kb[a], b.forEach((e) => e()));\n          }\n          function T(a, b, c = {}) {\n            if (!("argPackAdvance" in b))\n              throw new TypeError("registerType registeredInstance requires argPackAdvance");\n            Nb(a, b, c);\n          }\n          var Ob = (a, b, c) => {\n            switch (b) {\n              case 1:\n                return c ? (d) => g()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];\n              case 2:\n                return c ? (d) => ba()[d >>> 1 >>> 0] : (d) => da()[d >>> 1 >>> 0];\n              case 4:\n                return c ? (d) => v()[d >>> 2 >>> 0] : (d) => w()[d >>> 2 >>> 0];\n              case 8:\n                return c ? (d) => H[d >>> 3] : (d) => Da[d >>> 3];\n              default:\n                throw new TypeError(`invalid integer width (${b}): ${a}`);\n            }\n          };\n          function Pb() {\n            this.mb = [void 0];\n            this.Ab = [];\n          }\n          var U = new Pb();\n          function Qb(a) {\n            a >>>= 0;\n            a >= U.tb && 0 === --U.get(a).Cb && U.yb(a);\n          }\n          var V = (a) => {\n            if (!a)\n              throw new S("Cannot use deleted val. handle = " + a);\n            return U.get(a).value;\n          }, W = (a) => {\n            switch (a) {\n              case void 0:\n                return 1;\n              case null:\n                return 2;\n              case true:\n                return 3;\n              case false:\n                return 4;\n              default:\n                return U.xb({ Cb: 1, value: a });\n            }\n          };\n          function Rb(a) {\n            return this.fromWireType(v()[a >>> 2 >>> 0]);\n          }\n          var Sb = (a, b) => {\n            switch (b) {\n              case 4:\n                return function(c) {\n                  var d = this.fromWireType;\n                  m.buffer != p.buffer && q();\n                  return d.call(this, Ca[c >>> 2 >>> 0]);\n                };\n              case 8:\n                return function(c) {\n                  return this.fromWireType(ia()[c >>> 3 >>> 0]);\n                };\n              default:\n                throw new TypeError(`invalid float width (${b}): ${a}`);\n            }\n          };\n          function Tb(a) {\n            return this.fromWireType(w()[a >>> 2 >>> 0]);\n          }\n          var Ub = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Vb = (a, b) => {\n            var c = a >> 1;\n            for (var d = c + b / 2; !(c >= d) && da()[c >>> 0]; )\n              ++c;\n            c <<= 1;\n            if (32 < c - a && Ub)\n              return Ub.decode(t().slice(a, c));\n            c = "";\n            for (d = 0; !(d >= b / 2); ++d) {\n              var e = ba()[a + 2 * d >>> 1 >>> 0];\n              if (0 == e)\n                break;\n              c += String.fromCharCode(e);\n            }\n            return c;\n          }, Wb = (a, b, c) => {\n            c ??= 2147483647;\n            if (2 > c)\n              return 0;\n            c -= 2;\n            var d = b;\n            c = c < 2 * a.length ? c / 2 : a.length;\n            for (var e = 0; e < c; ++e) {\n              var f = a.charCodeAt(e);\n              ba()[b >>> 1 >>> 0] = f;\n              b += 2;\n            }\n            ba()[b >>> 1 >>> 0] = 0;\n            return b - d;\n          }, Xb = (a) => 2 * a.length, Yb = (a, b) => {\n            for (var c = 0, d = ""; !(c >= b / 4); ) {\n              var e = v()[a + 4 * c >>> 2 >>> 0];\n              if (0 == e)\n                break;\n              ++c;\n              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);\n            }\n            return d;\n          }, Zb = (a, b, c) => {\n            b >>>= 0;\n            c ??= 2147483647;\n            if (4 > c)\n              return 0;\n            var d = b;\n            c = d + c - 4;\n            for (var e = 0; e < a.length; ++e) {\n              var f = a.charCodeAt(e);\n              if (55296 <= f && 57343 >= f) {\n                var k = a.charCodeAt(++e);\n                f = 65536 + ((f & 1023) << 10) | k & 1023;\n              }\n              v()[b >>> 2 >>> 0] = f;\n              b += 4;\n              if (b + 4 > c)\n                break;\n            }\n            v()[b >>> 2 >>> 0] = 0;\n            return b - d;\n          }, $b = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              55296 <= d && 57343 >= d && ++c;\n              b += 4;\n            }\n            return b;\n          };\n          function ac(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.Vb && (Atomics.Vb(v(), a >>> 2, a).value.then(hb), a += 128, Atomics.store(v(), a >>> 2, 1));\n          }\n          z.__emscripten_thread_mailbox_await = ac;\n          var hb = () => {\n            var a = gb();\n            if (a && (ac(a), a = bc, !Ba))\n              try {\n                if (a(), !(0 < O))\n                  try {\n                    D ? mb(G) : cb(G);\n                  } catch (b) {\n                    b instanceof Qa || "unwind" == b || oa(1, b);\n                  }\n              } catch (b) {\n                b instanceof Qa || "unwind" == b || oa(1, b);\n              }\n          };\n          z.checkMailbox = hb;\n          var cc = [], ec = (a, b) => {\n            var c = Lb[a];\n            if (void 0 === c)\n              throw a = dc(a), c = R(a), X(a), new S(b + " has unknown type " + c);\n            return c;\n          }, fc = (a, b, c) => {\n            var d = [];\n            a = a.toWireType(d, c);\n            d.length && (w()[b >>> 2 >>> 0] = W(d));\n            return a;\n          }, gc = [], hc = {}, ic = (a) => {\n            var b = hc[a];\n            return void 0 === b ? R(a) : b;\n          }, jc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), kc = (a) => {\n            var b = gc.length;\n            gc.push(a);\n            return b;\n          }, lc = (a, b) => {\n            for (var c = Array(a), d = 0; d < a; ++d)\n              c[d] = ec(w()[b + 4 * d >>> 2 >>> 0], "parameter " + d);\n            return c;\n          }, nc = (a, b) => Object.defineProperty(\n            b,\n            "name",\n            { value: a }\n          );\n          function oc(a) {\n            var b = Function;\n            if (!(b instanceof Function))\n              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);\n            var c = nc(b.name || "unknownFunctionName", function() {\n            });\n            c.prototype = b.prototype;\n            c = new c();\n            a = b.apply(c, a);\n            return a instanceof Object ? a : c;\n          }\n          var Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), pc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], qc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function rc(a, b, c, d, e, f, k) {\n            return D ? P(16, 1, a, b, c, d, e, f, k) : -52;\n          }\n          function sc(a, b, c, d, e, f) {\n            if (D)\n              return P(17, 1, a, b, c, d, e, f);\n          }\n          var uc = (a) => {\n            var b = ub(a) + 1, c = tc(b);\n            c && wb(a, c, b);\n            return c;\n          }, vc = [], wc = {}, yc = () => {\n            if (!xc) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: na || "./this.program" }, b;\n              for (b in wc)\n                void 0 === wc[b] ? delete a[b] : a[b] = wc[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              xc = c;\n            }\n            return xc;\n          }, xc;\n          function zc(a, b) {\n            if (D)\n              return P(18, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            yc().forEach((d, e) => {\n              var f = b + c;\n              e = w()[a + 4 * e >>> 2 >>> 0] = f;\n              for (f = 0; f < d.length; ++f)\n                g()[e++ >>> 0 >>> 0] = d.charCodeAt(f);\n              g()[e >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Ac(a, b) {\n            if (D)\n              return P(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = yc();\n            w()[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((e) => d += e.length + 1);\n            w()[b >>> 2 >>> 0] = d;\n            return 0;\n          }\n          function Bc(a) {\n            return D ? P(20, 1, a) : 52;\n          }\n          function Cc(a, b, c, d) {\n            return D ? P(21, 1, a, b, c, d) : 52;\n          }\n          function Dc(a, b, c, d) {\n            return D ? P(22, 1, a, b, c, d) : 70;\n          }\n          var Ec = [null, [], []];\n          function Fc(a, b, c, d) {\n            if (D)\n              return P(23, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var e = 0, f = 0; f < c; f++) {\n              var k = w()[b >>> 2 >>> 0], l = w()[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var r = 0; r < l; r++) {\n                var n = t()[k + r >>> 0], x = Ec[a];\n                0 === n || 10 === n ? ((1 === a ? ya : F)(Va(x, 0)), x.length = 0) : x.push(n);\n              }\n              e += l;\n            }\n            w()[d >>> 2 >>> 0] = e;\n            return 0;\n          }\n          var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ic(a) {\n            var b = Array(ub(a) + 1);\n            vb(a, b, 0, b.length);\n            return b;\n          }\n          var Jc = (a, b) => {\n            g().set(a, b >>> 0);\n          };\n          function Kc(a, b, c, d) {\n            function e(h, u, y) {\n              for (h = "number" == typeof h ? h.toString() : h || ""; h.length < u; )\n                h = y[0] + h;\n              return h;\n            }\n            function f(h, u) {\n              return e(h, u, "0");\n            }\n            function k(h, u) {\n              function y(mc) {\n                return 0 > mc ? -1 : 0 < mc ? 1 : 0;\n              }\n              var Q;\n              0 === (Q = y(h.getFullYear() - u.getFullYear())) && 0 === (Q = y(h.getMonth() - u.getMonth())) && (Q = y(h.getDate() - u.getDate()));\n              return Q;\n            }\n            function l(h) {\n              switch (h.getDay()) {\n                case 0:\n                  return new Date(h.getFullYear() - 1, 11, 29);\n                case 1:\n                  return h;\n                case 2:\n                  return new Date(h.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    h.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(h.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(h.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(h.getFullYear() - 1, 11, 30);\n              }\n            }\n            function r(h) {\n              var u = h.qb;\n              for (h = new Date(new Date(h.rb + 1900, 0, 1).getTime()); 0 < u; ) {\n                var y = h.getMonth(), Q = (Y(h.getFullYear()) ? Gc : Hc)[y];\n                if (u > Q - h.getDate())\n                  u -= Q - h.getDate() + 1, h.setDate(1), 11 > y ? h.setMonth(y + 1) : (h.setMonth(0), h.setFullYear(h.getFullYear() + 1));\n                else {\n                  h.setDate(h.getDate() + u);\n                  break;\n                }\n              }\n              y = new Date(h.getFullYear() + 1, 0, 4);\n              u = l(new Date(\n                h.getFullYear(),\n                0,\n                4\n              ));\n              y = l(y);\n              return 0 >= k(u, h) ? 0 >= k(y, h) ? h.getFullYear() + 1 : h.getFullYear() : h.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var n = w()[d + 40 >>> 2 >>> 0];\n            d = { Sb: v()[d >>> 2 >>> 0], Rb: v()[d + 4 >>> 2 >>> 0], ub: v()[d + 8 >>> 2 >>> 0], zb: v()[d + 12 >>> 2 >>> 0], vb: v()[d + 16 >>> 2 >>> 0], rb: v()[d + 20 >>> 2 >>> 0], lb: v()[d + 24 >>> 2 >>> 0], qb: v()[d + 28 >>> 2 >>> 0], Yb: v()[d + 32 >>> 2 >>> 0], Qb: v()[d + 36 >>> 2 >>> 0], Tb: n ? L(n) : "" };\n            c = L(c);\n            n = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var x in n)\n              c = c.replace(new RegExp(x, "g"), n[x]);\n            var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");\n            n = { "%a": (h) => C[h.lb].substring(0, 3), "%A": (h) => C[h.lb], "%b": (h) => N[h.vb].substring(0, 3), "%B": (h) => N[h.vb], "%C": (h) => f((h.rb + 1900) / 100 | 0, 2), "%d": (h) => f(h.zb, 2), "%e": (h) => e(h.zb, 2, " "), "%g": (h) => r(h).toString().substring(2), "%G": (h) => r(h), "%H": (h) => f(h.ub, 2), "%I": (h) => {\n              h = h.ub;\n              0 == h ? h = 12 : 12 < h && (h -= 12);\n              return f(h, 2);\n            }, "%j": (h) => {\n              for (var u = 0, y = 0; y <= h.vb - 1; u += (Y(h.rb + 1900) ? Gc : Hc)[y++])\n                ;\n              return f(h.zb + u, 3);\n            }, "%m": (h) => f(h.vb + 1, 2), "%M": (h) => f(h.Rb, 2), "%n": () => "\\n", "%p": (h) => 0 <= h.ub && 12 > h.ub ? "AM" : "PM", "%S": (h) => f(h.Sb, 2), "%t": () => "	", "%u": (h) => h.lb || 7, "%U": (h) => f(Math.floor((h.qb + 7 - h.lb) / 7), 2), "%V": (h) => {\n              var u = Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7);\n              2 >= (h.lb + 371 - h.qb - 2) % 7 && u++;\n              if (u)\n                53 == u && (y = (h.lb + 371 - h.qb) % 7, 4 == y || 3 == y && Y(h.rb) || (u = 1));\n              else {\n                u = 52;\n                var y = (h.lb + 7 - h.qb - 1) % 7;\n                (4 == y || 5 == y && Y(h.rb % 400 - 1)) && u++;\n              }\n              return f(u, 2);\n            }, "%w": (h) => h.lb, "%W": (h) => f(Math.floor((h.qb + 7 - (h.lb + 6) % 7) / 7), 2), "%y": (h) => (h.rb + 1900).toString().substring(2), "%Y": (h) => h.rb + 1900, "%z": (h) => {\n              h = h.Qb;\n              var u = 0 <= h;\n              h = Math.abs(h) / 60;\n              return (u ? "+" : "-") + String("0000" + (h / 60 * 100 + h % 60)).slice(-4);\n            }, "%Z": (h) => h.Tb, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (x in n)\n              c.includes(x) && (c = c.replace(new RegExp(x, "g"), n[x](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            x = Ic(c);\n            if (x.length > b)\n              return 0;\n            Jc(x, a);\n            return x.length - 1;\n          }\n          M.wb();\n          for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)\n            Lc[Mc] = String.fromCharCode(Mc);\n          Jb = Lc;\n          S = z.BindingError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "BindingError";\n            }\n          };\n          z.InternalError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "InternalError";\n            }\n          };\n          Object.assign(Pb.prototype, { get(a) {\n            return this.mb[a];\n          }, has(a) {\n            return void 0 !== this.mb[a];\n          }, xb(a) {\n            var b = this.Ab.pop() || this.mb.length;\n            this.mb[b] = a;\n            return b;\n          }, yb(a) {\n            this.mb[a] = void 0;\n            this.Ab.push(a);\n          } });\n          U.mb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });\n          U.tb = U.mb.length;\n          z.count_emval_handles = () => {\n            for (var a = 0, b = U.tb; b < U.mb.length; ++b)\n              void 0 !== U.mb[b] && ++a;\n            return a;\n          };\n          var Nc = [ab, bb, qb, sb, tb, xb, yb, zb, Ab, Bb, Cb, Db, Eb, Fb, Gb, Hb, rc, sc, zc, Ac, Bc, Cc, Dc, Fc], Qc = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new nb(a).wb(b >>> 0, c >>> 0);\n              ob = a;\n              pb++;\n              throw ob;\n            },\n            da: function(a) {\n              Oc(a >>> 0, !A, 1, !pa, 131072, false);\n              M.Fb();\n            },\n            D: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : M.Db(M.kb[a]);\n            },\n            V: rb,\n            x: sb,\n            ka: tb,\n            R: xb,\n            T: yb,\n            K: zb,\n            ia: Ab,\n            aa: Bb,\n            ga: Cb,\n            F: Db,\n            S: Eb,\n            P: Fb,\n            ja: Gb,\n            Q: Hb,\n            I: function(a, b, c, d, e) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              b = R(b);\n              var f = -1 != b.indexOf("u");\n              f && (e = (1n << 64n) - 1n);\n              T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {\n                if ("bigint" != typeof l && "number" != typeof l)\n                  throw new TypeError(`Cannot convert "${Ib(l)}" to ${this.name}`);\n                if (l < d || l > e)\n                  throw new TypeError(`Passing a number "${Ib(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Ob(b, c, !f), sb: null });\n            },\n            pa: function(a, b, c, d) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: function(e) {\n                return !!e;\n              }, toWireType: function(e, f) {\n                return f ? c : d;\n              }, argPackAdvance: 8, readValueFromPointer: function(e) {\n                return this.fromWireType(t()[e >>> 0]);\n              }, sb: null });\n            },\n            oa: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (c) => {\n                var d = V(c);\n                Qb(c);\n                return d;\n              }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Rb, sb: null });\n            },\n            H: function(a, b, c) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Sb(b, c), sb: null });\n            },\n            u: function(a, b, c, d, e) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              -1 === e && (e = 4294967295);\n              e = (l) => l;\n              if (0 === d) {\n                var f = 32 - 8 * c;\n                e = (l) => l << f >>> f;\n              }\n              var k = b.includes("unsigned") ? function(l, r) {\n                return r >>> 0;\n              } : function(l, r) {\n                return r;\n              };\n              T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Ob(b, c, 0 !== d), sb: null });\n            },\n            n: function(a, b, c) {\n              function d(f) {\n                var k = w()[f >>> 2 >>> 0];\n                f = w()[f + 4 >>> 2 >>> 0];\n                return new e(g().buffer, f, k);\n              }\n              a >>>= 0;\n              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];\n              c = R(c >>> 0);\n              T(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { Kb: true });\n            },\n            J: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              var c = "std::string" === b;\n              T(a, { name: b, fromWireType: function(d) {\n                var e = w()[d >>> 2 >>> 0], f = d + 4;\n                if (c)\n                  for (var k = f, l = 0; l <= e; ++l) {\n                    var r = f + l;\n                    if (l == e || 0 == t()[r >>> 0]) {\n                      k = L(k, r - k);\n                      if (void 0 === n)\n                        var n = k;\n                      else\n                        n += String.fromCharCode(0), n += k;\n                      k = r + 1;\n                    }\n                  }\n                else {\n                  n = Array(e);\n                  for (l = 0; l < e; ++l)\n                    n[l] = String.fromCharCode(t()[f + l >>> 0]);\n                  n = n.join("");\n                }\n                X(d);\n                return n;\n              }, toWireType: function(d, e) {\n                e instanceof ArrayBuffer && (e = new Uint8Array(e));\n                var f = "string" == typeof e;\n                if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))\n                  throw new S("Cannot pass non-string to std::string");\n                var k = c && f ? ub(e) : e.length;\n                var l = tc(4 + k + 1), r = l + 4;\n                w()[l >>> 2 >>> 0] = k;\n                if (c && f)\n                  wb(e, r, k + 1);\n                else if (f)\n                  for (f = 0; f < k; ++f) {\n                    var n = e.charCodeAt(f);\n                    if (255 < n)\n                      throw X(r), new S("String has UTF-16 code units that do not fit in 8 bits");\n                    t()[r + f >>> 0] = n;\n                  }\n                else\n                  for (f = 0; f < k; ++f)\n                    t()[r + f >>> 0] = e[f];\n                null !== d && d.push(X, l);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Tb, sb(d) {\n                X(d);\n              } });\n            },\n            z: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              c = R(c);\n              if (2 === b) {\n                var d = Vb;\n                var e = Wb;\n                var f = Xb;\n                var k = () => da();\n                var l = 1;\n              } else\n                4 === b && (d = Yb, e = Zb, f = $b, k = () => w(), l = 2);\n              T(a, { name: c, fromWireType: (r) => {\n                for (var n = w()[r >>> 2 >>> 0], x = k(), C, N = r + 4, h = 0; h <= n; ++h) {\n                  var u = r + 4 + h * b;\n                  if (h == n || 0 == x[u >>> l])\n                    N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;\n                }\n                X(r);\n                return C;\n              }, toWireType: (r, n) => {\n                if ("string" != typeof n)\n                  throw new S(`Cannot pass non-string to C++ string type ${c}`);\n                var x = f(n), C = tc(4 + x + b);\n                w()[C >>> 2] = x >> l;\n                e(n, C + 4, x + b);\n                null !== r && r.push(X, C);\n                return C;\n              }, argPackAdvance: 8, readValueFromPointer: Rb, sb(r) {\n                X(r);\n              } });\n            },\n            qa: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, {\n                Lb: true,\n                name: b,\n                argPackAdvance: 0,\n                fromWireType: () => {\n                },\n                toWireType: () => {\n                }\n              });\n            },\n            na: () => 1,\n            N: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => hb()) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = M.kb[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            W: function(a, b, c, d) {\n              b >>>= 0;\n              c /= 2;\n              cc.length = c;\n              d = d >>> 0 >>> 3;\n              for (var e = 0; e < c; e++)\n                cc[e] = H[d + 2 * e] ? H[d + 2 * e + 1] : ia()[d + 2 * e + 1 >>> 0];\n              a = 0 > a ? Pa[-a - 1] : Nc[a];\n              M.Jb = b;\n              b = a.apply(null, cc);\n              M.Jb = 0;\n              return b;\n            },\n            ca: ac,\n            ma: function(a) {\n              B && M.kb[a >>> 0].ref();\n            },\n            s: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = ec(b, "emval::as");\n              return fc(\n                b,\n                c,\n                a\n              );\n            },\n            o: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = gc[a >>> 0];\n              b = V(b >>> 0);\n              return a(null, b, c, d);\n            },\n            j: function(a, b, c, d, e) {\n              c >>>= 0;\n              d >>>= 0;\n              e >>>= 0;\n              a = gc[a >>> 0];\n              b = V(b >>> 0);\n              c = ic(c);\n              return a(b, b[c], d, e);\n            },\n            c: Qb,\n            A: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return a == b;\n            },\n            m: function(a) {\n              a >>>= 0;\n              if (0 === a)\n                return W(jc());\n              a = ic(a);\n              return W(jc()[a]);\n            },\n            i: function(a, b, c) {\n              b = lc(a, b >>> 0);\n              var d = b.shift();\n              a--;\n              var e = "return function (obj, func, destructorsRef, args) {\\n", f = 0, k = [];\n              0 === c && k.push("obj");\n              for (var l = ["retType"], r = [d], n = 0; n < a; ++n)\n                k.push("arg" + n), l.push("argType" + n), r.push(b[n]), e += `  var arg${n} = argType${n}.readValueFromPointer(args${f ? "+" + f : ""});\n`, f += b[n].argPackAdvance;\n              e += `  var rv = ${1 === c ? "new func" : "func.call"}(${k.join(", ")});\n`;\n              for (n = 0; n < a; ++n)\n                b[n].deleteObject && (e += `  argType${n}.deleteObject(arg${n});\n`);\n              d.Lb || (l.push("emval_returnValue"), r.push(fc), e += "  return emval_returnValue(retType, destructorsRef, rv);\\n");\n              l.push(e + "};\\n");\n              a = oc(l).apply(null, r);\n              c = `methodCaller<(${b.map((x) => x.name).join(", ")}) => ${d.name}>`;\n              return kc(nc(\n                c,\n                a\n              ));\n            },\n            r: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return W(a[b]);\n            },\n            d: function(a) {\n              a >>>= 0;\n              4 < a && (U.get(a).Cb += 1);\n            },\n            v: function() {\n              return W([]);\n            },\n            l: function(a) {\n              a = V(a >>> 0);\n              for (var b = Array(a.length), c = 0; c < a.length; c++)\n                b[c] = a[c];\n              return W(b);\n            },\n            f: function(a) {\n              return W(ic(a >>> 0));\n            },\n            k: function() {\n              return W({});\n            },\n            h: function(a) {\n              a >>>= 0;\n              for (var b = V(a); b.length; ) {\n                var c = b.pop();\n                b.pop()(c);\n              }\n              Qb(a);\n            },\n            g: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              c = V(c);\n              a[b] = c;\n            },\n            e: function(a, b) {\n              b >>>= 0;\n              a = ec(a >>> 0, "_emval_take_value");\n              a = a.readValueFromPointer(b);\n              return W(a);\n            },\n            Z: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              v()[b >>> 2 >>> 0] = a.getUTCSeconds();\n              v()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              v()[b + 8 >>> 2 >>> 0] = a.getUTCHours();\n              v()[b + 12 >>> 2 >>> 0] = a.getUTCDate();\n              v()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              v()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              v()[b + 24 >>> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              v()[b + 28 >>> 2 >>> 0] = a;\n            },\n            _: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              v()[b >>> 2 >>> 0] = a.getSeconds();\n              v()[b + 4 >>> 2 >>> 0] = a.getMinutes();\n              v()[b + 8 >>> 2 >>> 0] = a.getHours();\n              v()[b + 12 >>> 2 >>> 0] = a.getDate();\n              v()[b + 16 >>> 2 >>> 0] = a.getMonth();\n              v()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              v()[b + 24 >>> 2 >>> 0] = a.getDay();\n              var c = (Y(a.getFullYear()) ? pc : qc)[a.getMonth()] + a.getDate() - 1 | 0;\n              v()[b + 28 >>> 2 >>> 0] = c;\n              v()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;\n              v()[b + 32 >>> 2 >>> 0] = a;\n            },\n            $: function(a) {\n              a >>>= 0;\n              var b = new Date(v()[a + 20 >>> 2 >>> 0] + 1900, v()[a + 16 >>> 2 >>> 0], v()[a + 12 >>> 2 >>> 0], v()[a + 8 >>> 2 >>> 0], v()[a + 4 >>> 2 >>> 0], v()[a >>> 2 >>> 0], 0), c = v()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);\n              0 > c ? v()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));\n              v()[a + 24 >>> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? pc : qc)[b.getMonth()] + b.getDate() - 1 | 0;\n              v()[a + 28 >>> 2 >>> 0] = c;\n              v()[a >>> 2 >>> 0] = b.getSeconds();\n              v()[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              v()[a + 8 >>> 2 >>> 0] = b.getHours();\n              v()[a + 12 >>> 2 >>> 0] = b.getDate();\n              v()[a + 16 >>> 2 >>> 0] = b.getMonth();\n              v()[a + 20 >>> 2 >>> 0] = b.getYear();\n              a = b.getTime();\n              isNaN(a) ? (v()[Pc() >>> 2 >>> 0] = 61, a = -1) : a /= 1e3;\n              return BigInt(a);\n            },\n            X: rc,\n            Y: sc,\n            M: function(a, b, c) {\n              function d(n) {\n                return (n = n.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? n[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(\n                e,\n                6,\n                1\n              );\n              e = f.getTimezoneOffset();\n              var l = k.getTimezoneOffset(), r = Math.max(e, l);\n              w()[a >>> 2 >>> 0] = 60 * r;\n              v()[b >>> 2 >>> 0] = Number(e != l);\n              a = d(f);\n              b = d(k);\n              a = uc(a);\n              b = uc(b);\n              l < e ? (w()[c >>> 2 >>> 0] = a, w()[c + 4 >>> 2 >>> 0] = b) : (w()[c >>> 2 >>> 0] = b, w()[c + 4 >>> 2 >>> 0] = a);\n            },\n            p: () => {\n              za("");\n            },\n            ra: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              vc.length = 0;\n              for (var d; d = t()[b++ >>> 0]; ) {\n                var e = 105 != d;\n                e &= 112 != d;\n                c += e && c % 8 ? 4 : 0;\n                vc.push(112 == d ? w()[c >>> 2 >>> 0] : 106 == d ? H[c >>> 3] : 105 == d ? v()[c >>> 2 >>> 0] : ia()[c >>> 3 >>> 0]);\n                c += e ? 8 : 4;\n              }\n              return Pa[a].apply(null, vc);\n            },\n            E: () => {\n            },\n            G: () => Date.now(),\n            la: () => {\n              O += 1;\n              throw "unwind";\n            },\n            O: function() {\n              return 4294901760;\n            },\n            t: () => performance.timeOrigin + performance.now(),\n            w: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,\n            L: function(a) {\n              a >>>= 0;\n              var b = t().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var e = Math;\n                d = Math.max(a, d);\n                a: {\n                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - m.buffer.byteLength + 65535) / 65536;\n                  try {\n                    m.grow(e);\n                    q();\n                    var f = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  f = void 0;\n                }\n                if (f)\n                  return true;\n              }\n              return false;\n            },\n            ea: zc,\n            fa: Ac,\n            U: cb,\n            y: Bc,\n            C: Cc,\n            ba: Dc,\n            B: Fc,\n            a: m || z.wasmMemory,\n            ha: Kc,\n            q: function(a, b, c, d) {\n              return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            function a(c, d) {\n              Z = c.exports;\n              Z = Rc();\n              M.Gb.push(Z.Ya);\n              lb = Z.$a;\n              Ga.unshift(Z.sa);\n              Aa = d;\n              Ja();\n              return Z;\n            }\n            var b = { a: Qc };\n            I++;\n            if (z.instantiateWasm)\n              try {\n                return z.instantiateWasm(b, a);\n              } catch (c) {\n                F(`Module.instantiateWasm callback failed with error: ${c}`), la(c);\n              }\n            Oa(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(la);\n            return {};\n          }();\n          z._OrtInit = (a, b) => (z._OrtInit = Z.ta)(a, b);\n          z._OrtGetLastError = (a, b) => (z._OrtGetLastError = Z.ua)(a, b);\n          z._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, r, n) => (z._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, r, n);\n          z._OrtAppendExecutionProvider = (a, b) => (z._OrtAppendExecutionProvider = Z.wa)(a, b);\n          z._OrtAddFreeDimensionOverride = (a, b, c) => (z._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);\n          z._OrtAddSessionConfigEntry = (a, b, c) => (z._OrtAddSessionConfigEntry = Z.ya)(a, b, c);\n          z._OrtReleaseSessionOptions = (a) => (z._OrtReleaseSessionOptions = Z.za)(a);\n          z._OrtCreateSession = (a, b, c) => (z._OrtCreateSession = Z.Aa)(a, b, c);\n          z._OrtReleaseSession = (a) => (z._OrtReleaseSession = Z.Ba)(a);\n          z._OrtGetInputOutputCount = (a, b, c) => (z._OrtGetInputOutputCount = Z.Ca)(a, b, c);\n          z._OrtGetInputName = (a, b) => (z._OrtGetInputName = Z.Da)(a, b);\n          z._OrtGetOutputName = (a, b) => (z._OrtGetOutputName = Z.Ea)(a, b);\n          z._OrtFree = (a) => (z._OrtFree = Z.Fa)(a);\n          z._OrtCreateTensor = (a, b, c, d, e, f) => (z._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);\n          z._OrtGetTensorData = (a, b, c, d, e) => (z._OrtGetTensorData = Z.Ha)(a, b, c, d, e);\n          z._OrtReleaseTensor = (a) => (z._OrtReleaseTensor = Z.Ia)(a);\n          z._OrtCreateRunOptions = (a, b, c, d) => (z._OrtCreateRunOptions = Z.Ja)(a, b, c, d);\n          z._OrtAddRunConfigEntry = (a, b, c) => (z._OrtAddRunConfigEntry = Z.Ka)(a, b, c);\n          z._OrtReleaseRunOptions = (a) => (z._OrtReleaseRunOptions = Z.La)(a);\n          z._OrtCreateBinding = (a) => (z._OrtCreateBinding = Z.Ma)(a);\n          z._OrtBindInput = (a, b, c) => (z._OrtBindInput = Z.Na)(a, b, c);\n          z._OrtBindOutput = (a, b, c, d) => (z._OrtBindOutput = Z.Oa)(a, b, c, d);\n          z._OrtClearBoundOutputs = (a) => (z._OrtClearBoundOutputs = Z.Pa)(a);\n          z._OrtReleaseBinding = (a) => (z._OrtReleaseBinding = Z.Qa)(a);\n          z._OrtRunWithBinding = (a, b, c, d, e) => (z._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);\n          z._OrtRun = (a, b, c, d, e, f, k, l) => (z._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);\n          z._OrtEndProfiling = (a) => (z._OrtEndProfiling = Z.Ta)(a);\n          var Pc = () => (Pc = Z.Ua)(), gb = z._pthread_self = () => (gb = z._pthread_self = Z.Va)(), tc = z._malloc = (a) => (tc = z._malloc = Z.Wa)(a), X = z._free = (a) => (X = z._free = Z.Xa)(a);\n          z.__emscripten_tls_init = () => (z.__emscripten_tls_init = Z.Ya)();\n          var dc = (a) => (dc = Z.Za)(a);\n          z.__embind_initialize_bindings = () => (z.__embind_initialize_bindings = Z._a)();\n          var Oc = z.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = z.__emscripten_thread_init = Z.ab)(a, b, c, d, e, f);\n          z.__emscripten_thread_crashed = () => (z.__emscripten_thread_crashed = Z.bb)();\n          var $a = (a, b, c, d) => ($a = Z.cb)(a, b, c, d), fb = (a) => (fb = Z.db)(a), mb = z.__emscripten_thread_exit = (a) => (mb = z.__emscripten_thread_exit = Z.eb)(a), bc = () => (bc = Z.fb)(), jb = (a, b) => (jb = Z.gb)(a, b), Wa = () => (Wa = Z.hb)(), Xa = (a) => (Xa = Z.ib)(a), Za = (a) => (Za = Z.jb)(a);\n          function Rc() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;\n            a.Ua = b(a.Ua);\n            a.Va = b(a.Va);\n            a.Wa = c(a.Wa);\n            a.Za = c(a.Za);\n            a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);\n            a.hb = b(a.hb);\n            a.jb = c(a.jb);\n            return a;\n          }\n          z.wasmMemory = m;\n          z.stackAlloc = Za;\n          z.stackSave = Wa;\n          z.stackRestore = Xa;\n          z.keepRuntimeAlive = () => 0 < O;\n          z.UTF8ToString = L;\n          z.stringToUTF8 = wb;\n          z.lengthBytesUTF8 = ub;\n          z.ExitStatus = Qa;\n          z.PThread = M;\n          var Sc;\n          J = function Tc() {\n            Sc || Uc();\n            Sc || (J = Tc);\n          };\n          function Uc() {\n            if (!(0 < I))\n              if (D)\n                ka(z), D || ib(Ga), startWorker(z);\n              else {\n                if (z.preRun)\n                  for ("function" == typeof z.preRun && (z.preRun = [z.preRun]); z.preRun.length; )\n                    Fa.unshift(z.preRun.shift());\n                ib(Fa);\n                0 < I || Sc || (Sc = true, z.calledRun = true, Ba || (D || ib(Ga), ka(z), D || ib(Ha)));\n              }\n          }\n          Uc();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (false) {\n    ortWasmFactory = null;\n  } else {\n    ortWasmFactory = true ? require_ort_wasm() : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (false) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        config.numThreads = numThreads;\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  init_fs();\n\n  // nodejs-ignore:node:fs/promises\n  var readFile2 = void 0;\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  var loadFile = async (file) => {\n    if (typeof file === "string") {\n      if (typeof process !== "undefined" && process.versions && process.versions.node) {\n        try {\n          return new Uint8Array(await readFile2(file));\n        } catch (e) {\n          if (e.code === "ERR_FS_FILE_TOO_LARGE") {\n            const stream = createReadStream(file);\n            const chunks = [];\n            for await (const chunk of stream) {\n              chunks.push(chunk);\n            }\n            return new Uint8Array(Buffer.concat(chunks));\n          }\n          throw e;\n        }\n      } else {\n        const response = await fetch(file);\n        if (!response.ok) {\n          throw new Error(`failed to load external data file: ${file}`);\n        }\n        const contentLengthHeader = response.headers.get("Content-Length");\n        const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;\n        if (fileSize < 1073741824) {\n          return new Uint8Array(await response.arrayBuffer());\n        } else {\n          if (!response.body) {\n            throw new Error(`failed to load external data file: ${file}, no response body.`);\n          }\n          const reader = response.body.getReader();\n          const pages = Math.ceil(fileSize / 65536);\n          const buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;\n          let offset = 0;\n          while (true) {\n            const { done, value } = await reader.read();\n            if (done) {\n              break;\n            }\n            const chunkSize = value.byteLength;\n            const chunk = new Uint8Array(buffer, offset, chunkSize);\n            chunk.set(value);\n            offset += chunkSize;\n          }\n          return new Uint8Array(buffer, 0, fileSize);\n        }\n      }\n    } else if (file instanceof Blob) {\n      return new Uint8Array(await file.arrayBuffer());\n    } else if (file instanceof Uint8Array) {\n      return file;\n    } else {\n      return new Uint8Array(file);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n  };\n  var initEp = async (env, epName) => {\n    if (false) {\n      if (typeof navigator === "undefined" || !navigator.gpu) {\n        throw new Error("WebGPU is not supported in current environment");\n      }\n      const adapter = await navigator.gpu.requestAdapter();\n      if (!adapter) {\n        throw new Error(\n          \'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.\'\n        );\n      }\n      if (!env.wasm.simd) {\n        throw new Error(\n          "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"\n        );\n      }\n      const initJsep = null.init;\n      await initJsep(getInstance(), env, adapter);\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var copyFromExternalBuffer = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSession = async (modelData, options) => {\n    let modelDataOffset, modelDataLength;\n    const wasm2 = getInstance();\n    if (Array.isArray(modelData)) {\n      [modelDataOffset, modelDataLength] = modelData;\n    } else if (modelData.buffer === wasm2.HEAPU8.buffer) {\n      [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];\n    } else {\n      [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);\n    }\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      if (options?.externalData && wasm2.mountExternalData) {\n        const loadingPromises = [];\n        for (const file of options.externalData) {\n          const path = typeof file === "string" ? file : file.path;\n          loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {\n            wasm2.mountExternalData(path, data);\n          }));\n        }\n        await Promise.all(loadingPromises);\n      }\n      sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelDataOffset);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      wasm2.unmountExternalData?.();\n    }\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    const { type, in: message } = ev.data;\n    try {\n      switch (type) {\n        case "init-wasm":\n          initializeWebAssembly(message.wasm).then(\n            () => {\n              initRuntime(message).then(\n                () => {\n                  postMessage({ type });\n                },\n                (err) => {\n                  postMessage({ type, err });\n                }\n              );\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        case "init-ep": {\n          const { epName, env } = message;\n          initEp(env, epName).then(\n            () => {\n              postMessage({ type });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "copy-from": {\n          const { buffer } = message;\n          const bufferData = copyFromExternalBuffer(buffer);\n          postMessage({ type, out: bufferData });\n          break;\n        }\n        case "create": {\n          const { model, options } = message;\n          createSession(model, options).then(\n            (sessionMetadata) => {\n              postMessage({ type, out: sessionMetadata });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "release":\n          releaseSession(message);\n          postMessage({ type });\n          break;\n        case "run": {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = message;\n          run(sessionId, inputIndices, inputs, outputIndices, new Array(outputIndices.length).fill(null), options).then(\n            (outputs) => {\n              if (outputs.some((o) => o[3] !== "cpu")) {\n                postMessage({ type, err: "Proxy does not support non-cpu tensor location." });\n              } else {\n                postMessage(\n                  { type, out: outputs },\n                  extractTransferableBuffers(outputs)\n                );\n              }\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "end-profiling":\n          endProfiling(message);\n          postMessage({ type });\n          break;\n        default:\n      }\n    } catch (err) {\n      postMessage({ type, err });\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS5qcyIsICJub2RlanMtaWdub3JlOndvcmtlcl90aHJlYWRzIiwgIm5vZGVqcy1pZ25vcmU6cGVyZl9ob29rcyIsICJub2RlanMtaWdub3JlOm9zIiwgIi4uLy4uL2xpYi93YXNtL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQuanMiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMiLCAibm9kZWpzLWlnbm9yZTpub2RlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1mYWN0b3J5LnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tdXRpbHMudHMiLCAiLi4vLi4vbGliL3dhc20vcnVuLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vc2Vzc2lvbi1vcHRpb25zLnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29tbW9uLnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tdXRpbHMtbG9hZC1maWxlLnRzIiwgIm5vZGVqcy1pZ25vcmU6bm9kZTpmcy9wcm9taXNlcyIsICIuLi8uLi9saWIvd2FzbS93YXNtLWNvcmUtaW1wbC50cyIsICIuLi8uLi9saWIvd2FzbS9wcm94eS13b3JrZXIvbWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGNvbnN0IHJlYWRGaWxlID0gdW5kZWZpbmVkO2V4cG9ydCBjb25zdCByZWFkRmlsZVN5bmMgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IGNyZWF0ZVJlYWRTdHJlYW0gPSB1bmRlZmluZWQ7IiwgImV4cG9ydCBjb25zdCBqb2luID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9PSAndW5kZWZpbmVkJykgX3NjcmlwdERpciA9IF9zY3JpcHREaXIgfHwgX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbnZhciBnPW1vZHVsZUFyZyxhYSxsO2cucmVhZHk9bmV3IFByb21pc2UoKGEsYik9PnthYT1hO2w9Yn0pO3ZhciBiYT1PYmplY3QuYXNzaWduKHt9LGcpLGNhPVwiLi90aGlzLnByb2dyYW1cIixkYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LHA9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxlYT1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsdD1cIlwiLGZhLHcseDtcbmlmKGVhKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLGhhPXJlcXVpcmUoXCJwYXRoXCIpO3Q9cD9oYS5kaXJuYW1lKHQpK1wiL1wiOl9fZGlybmFtZStcIi9cIjtmYT0oYSxiKT0+e2E9eihhKT9uZXcgVVJMKGEpOmhhLm5vcm1hbGl6ZShhKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGEsYj92b2lkIDA6XCJ1dGY4XCIpfTt4PWE9PnthPWZhKGEsITApO2EuYnVmZmVyfHwoYT1uZXcgVWludDhBcnJheShhKSk7cmV0dXJuIGF9O3c9KGEsYixjLGQ9ITApPT57YT16KGEpP25ldyBVUkwoYSk6aGEubm9ybWFsaXplKGEpO2ZzLnJlYWRGaWxlKGEsZD92b2lkIDA6XCJ1dGY4XCIsKGUsaCk9PntlP2MoZSk6YihkP2guYnVmZmVyOmgpfSl9OyFnLnRoaXNQcm9ncmFtJiYxPHByb2Nlc3MuYXJndi5sZW5ndGgmJihjYT1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpO2cuaW5zcGVjdD0oKT0+XCJbRW1zY3JpcHRlbiBNb2R1bGUgb2JqZWN0XVwifWVsc2UgaWYoZGF8fFxucClwP3Q9c2VsZi5sb2NhdGlvbi5ocmVmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkb2N1bWVudCYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKHQ9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLF9zY3JpcHREaXImJih0PV9zY3JpcHREaXIpLDAhPT10LmluZGV4T2YoXCJibG9iOlwiKT90PXQuc3Vic3RyKDAsdC5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKTp0PVwiXCIsZmE9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnNlbmQobnVsbCk7cmV0dXJuIGIucmVzcG9uc2VUZXh0fSxwJiYoeD1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2IucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtiLnNlbmQobnVsbCk7cmV0dXJuIG5ldyBVaW50OEFycmF5KGIucmVzcG9uc2UpfSksdz0oYSxiLGMpPT57dmFyIGQ9bmV3IFhNTEh0dHBSZXF1ZXN0O2Qub3BlbihcIkdFVFwiLGEsITApO2QucmVzcG9uc2VUeXBlPVxuXCJhcnJheWJ1ZmZlclwiO2Qub25sb2FkPSgpPT57MjAwPT1kLnN0YXR1c3x8MD09ZC5zdGF0dXMmJmQucmVzcG9uc2U/YihkLnJlc3BvbnNlKTpjKCl9O2Qub25lcnJvcj1jO2Quc2VuZChudWxsKX07dmFyIGlhPWNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksQT1jb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSk7T2JqZWN0LmFzc2lnbihnLGJhKTtiYT1udWxsO1wib2JqZWN0XCIhPXR5cGVvZiBXZWJBc3NlbWJseSYmamEoXCJubyBuYXRpdmUgd2FzbSBzdXBwb3J0IGRldGVjdGVkXCIpO3ZhciBCLGthPSExLEMsRCxFLEcsSSxKLGxhLG1hLG5hLG9hO1xuZnVuY3Rpb24gcGEoKXt2YXIgYT1CLmJ1ZmZlcjtnLkhFQVA4PUM9bmV3IEludDhBcnJheShhKTtnLkhFQVAxNj1FPW5ldyBJbnQxNkFycmF5KGEpO2cuSEVBUFU4PUQ9bmV3IFVpbnQ4QXJyYXkoYSk7Zy5IRUFQVTE2PUc9bmV3IFVpbnQxNkFycmF5KGEpO2cuSEVBUDMyPUk9bmV3IEludDMyQXJyYXkoYSk7Zy5IRUFQVTMyPUo9bmV3IFVpbnQzMkFycmF5KGEpO2cuSEVBUEYzMj1sYT1uZXcgRmxvYXQzMkFycmF5KGEpO2cuSEVBUEY2ND1vYT1uZXcgRmxvYXQ2NEFycmF5KGEpO2cuSEVBUDY0PW1hPW5ldyBCaWdJbnQ2NEFycmF5KGEpO2cuSEVBUFU2ND1uYT1uZXcgQmlnVWludDY0QXJyYXkoYSl9dmFyIHFhPVtdLHJhPVtdLHNhPVtdLEs9MCx0YT1udWxsLEw9bnVsbDtcbmZ1bmN0aW9uIGphKGEpe2E9XCJBYm9ydGVkKFwiK2ErXCIpXCI7QShhKTtrYT0hMDthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7bChhKTt0aHJvdyBhO312YXIgdWE9YT0+YS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKSx6PWE9PmEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIiksTTtNPVwib3J0LXdhc20ud2FzbVwiO2lmKCF1YShNKSl7dmFyIHZhPU07TT1nLmxvY2F0ZUZpbGU/Zy5sb2NhdGVGaWxlKHZhLHQpOnQrdmF9ZnVuY3Rpb24gd2EoYSl7aWYoeClyZXR1cm4geChhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiB4YShhKXtpZihkYXx8cCl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiF6KGEpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PndhKGEpKTtpZih3KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3coYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT53YShhKSl9ZnVuY3Rpb24geWEoYSxiLGMpe3JldHVybiB4YShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntBKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7amEoZCl9KX1cbmZ1bmN0aW9uIHphKGEsYil7dmFyIGM9TTtyZXR1cm5cImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8dWEoYyl8fHooYyl8fGVhfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD95YShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihlKXtBKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtlfWApO0EoXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4geWEoYyxhLGIpfSkpfVxudmFyIEFhPXs4OTA4MjQ6KGEsYixjLGQpPT57aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIGd8fCFnLmNiKXJldHVybiAxO2E9TihhPj4+MCk7YS5zdGFydHNXaXRoKFwiLi9cIikmJihhPWEuc3Vic3RyaW5nKDIpKTthPWcuY2IuZ2V0KGEpO2lmKCFhKXJldHVybiAyO2I+Pj49MDtjPj4+PTA7aWYoYitjPmEuYnl0ZUxlbmd0aClyZXR1cm4gMzt0cnl7cmV0dXJuIEQuc2V0KGEuc3ViYXJyYXkoYixiK2MpLGQ+Pj4wPj4+MCksMH1jYXRjaHtyZXR1cm4gNH19fTtmdW5jdGlvbiBCYShhKXt0aGlzLlVhPWEtMjQ7dGhpcy5mYj1mdW5jdGlvbihiKXtKW3RoaXMuVWErND4+PjI+Pj4wXT1ifTt0aGlzLmViPWZ1bmN0aW9uKGIpe0pbdGhpcy5VYSs4Pj4+Mj4+PjBdPWJ9O3RoaXMuWWE9ZnVuY3Rpb24oYixjKXt0aGlzLlphKCk7dGhpcy5mYihiKTt0aGlzLmViKGMpfTt0aGlzLlphPWZ1bmN0aW9uKCl7Slt0aGlzLlVhKzE2Pj4+Mj4+PjBdPTB9fVxudmFyIENhPTAsRGE9MCxFYT1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmOFwiKTp2b2lkIDAsRmE9KGEsYixjKT0+e2I+Pj49MDt2YXIgZD1iK2M7Zm9yKGM9YjthW2NdJiYhKGM+PWQpOykrK2M7aWYoMTY8Yy1iJiZhLmJ1ZmZlciYmRWEpcmV0dXJuIEVhLmRlY29kZShhLnN1YmFycmF5KGIsYykpO2ZvcihkPVwiXCI7YjxjOyl7dmFyIGU9YVtiKytdO2lmKGUmMTI4KXt2YXIgaD1hW2IrK10mNjM7aWYoMTkyPT0oZSYyMjQpKWQrPVN0cmluZy5mcm9tQ2hhckNvZGUoKGUmMzEpPDw2fGgpO2Vsc2V7dmFyIGs9YVtiKytdJjYzO2U9MjI0PT0oZSYyNDApPyhlJjE1KTw8MTJ8aDw8NnxrOihlJjcpPDwxOHxoPDwxMnxrPDw2fGFbYisrXSY2Mzs2NTUzNj5lP2QrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSk6KGUtPTY1NTM2LGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8ZT4+MTAsNTYzMjB8ZSYxMDIzKSl9fWVsc2UgZCs9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gZH0sXG5OPShhLGIpPT4oYT4+Pj0wKT9GYShELGEsYik6XCJcIixPPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPWEuY2hhckNvZGVBdChjKTsxMjc+PWQ/YisrOjIwNDc+PWQ/Yis9Mjo1NTI5Njw9ZCYmNTczNDM+PWQ/KGIrPTQsKytjKTpiKz0zfXJldHVybiBifSxQPShhLGIsYyxkKT0+e2M+Pj49MDtpZighKDA8ZCkpcmV0dXJuIDA7dmFyIGU9YztkPWMrZC0xO2Zvcih2YXIgaD0wO2g8YS5sZW5ndGg7KytoKXt2YXIgaz1hLmNoYXJDb2RlQXQoaCk7aWYoNTUyOTY8PWsmJjU3MzQzPj1rKXt2YXIgbT1hLmNoYXJDb2RlQXQoKytoKTtrPTY1NTM2KygoayYxMDIzKTw8MTApfG0mMTAyM31pZigxMjc+PWspe2lmKGM+PWQpYnJlYWs7YltjKys+Pj4wXT1rfWVsc2V7aWYoMjA0Nz49ayl7aWYoYysxPj1kKWJyZWFrO2JbYysrPj4+MF09MTkyfGs+PjZ9ZWxzZXtpZig2NTUzNT49ayl7aWYoYysyPj1kKWJyZWFrO2JbYysrPj4+MF09MjI0fGs+PjEyfWVsc2V7aWYoYyszPj1cbmQpYnJlYWs7YltjKys+Pj4wXT0yNDB8az4+MTg7YltjKys+Pj4wXT0xMjh8az4+MTImNjN9YltjKys+Pj4wXT0xMjh8az4+NiY2M31iW2MrKz4+PjBdPTEyOHxrJjYzfX1iW2M+Pj4wXT0wO3JldHVybiBjLWV9LEdhPWE9PntpZihudWxsPT09YSlyZXR1cm5cIm51bGxcIjt2YXIgYj10eXBlb2YgYTtyZXR1cm5cIm9iamVjdFwiPT09Ynx8XCJhcnJheVwiPT09Ynx8XCJmdW5jdGlvblwiPT09Yj9hLnRvU3RyaW5nKCk6XCJcIithfSxIYSxRPWE9Pntmb3IodmFyIGI9XCJcIjtEW2E+Pj4wXTspYis9SGFbRFthKys+Pj4wXV07cmV0dXJuIGJ9LElhPXt9LEphPXt9LEthPXt9LFI7XG5mdW5jdGlvbiBMYShhLGIsYz17fSl7dmFyIGQ9Yi5uYW1lO2lmKCFhKXRocm93IG5ldyBSKGB0eXBlIFwiJHtkfVwiIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXJgKTtpZihKYS5oYXNPd25Qcm9wZXJ0eShhKSl7aWYoYy5nYilyZXR1cm47dGhyb3cgbmV3IFIoYENhbm5vdCByZWdpc3RlciB0eXBlICcke2R9JyB0d2ljZWApO31KYVthXT1iO2RlbGV0ZSBLYVthXTtJYS5oYXNPd25Qcm9wZXJ0eShhKSYmKGI9SWFbYV0sZGVsZXRlIElhW2FdLGIuZm9yRWFjaChlPT5lKCkpKX1mdW5jdGlvbiBTKGEsYixjPXt9KXtpZighKFwiYXJnUGFja0FkdmFuY2VcImluIGIpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJyZWdpc3RlclR5cGUgcmVnaXN0ZXJlZEluc3RhbmNlIHJlcXVpcmVzIGFyZ1BhY2tBZHZhbmNlXCIpO0xhKGEsYixjKX1cbnZhciBNYT0oYSxiLGMpPT57c3dpdGNoKGIpe2Nhc2UgMTpyZXR1cm4gYz9kPT5DW2Q+Pj4wPj4+MF06ZD0+RFtkPj4+MD4+PjBdO2Nhc2UgMjpyZXR1cm4gYz9kPT5FW2Q+Pj4xPj4+MF06ZD0+R1tkPj4+MT4+PjBdO2Nhc2UgNDpyZXR1cm4gYz9kPT5JW2Q+Pj4yPj4+MF06ZD0+SltkPj4+Mj4+PjBdO2Nhc2UgODpyZXR1cm4gYz9kPT5tYVtkPj4+M106ZD0+bmFbZD4+PjNdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke2J9KTogJHthfWApO319O2Z1bmN0aW9uIE5hKCl7dGhpcy5SYT1bdm9pZCAwXTt0aGlzLmFiPVtdfXZhciBUPW5ldyBOYTtmdW5jdGlvbiBPYShhKXthPj4+PTA7YT49VC5VYSYmMD09PS0tVC5nZXQoYSkuYmImJlQuWmEoYSl9XG52YXIgVT1hPT57aWYoIWEpdGhyb3cgbmV3IFIoXCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSBcIithKTtyZXR1cm4gVC5nZXQoYSkudmFsdWV9LFY9YT0+e3N3aXRjaChhKXtjYXNlIHZvaWQgMDpyZXR1cm4gMTtjYXNlIG51bGw6cmV0dXJuIDI7Y2FzZSAhMDpyZXR1cm4gMztjYXNlICExOnJldHVybiA0O2RlZmF1bHQ6cmV0dXJuIFQuWWEoe2JiOjEsdmFsdWU6YX0pfX07ZnVuY3Rpb24gUGEoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKElbYT4+PjI+Pj4wXSl9dmFyIFFhPShhLGIpPT57c3dpdGNoKGIpe2Nhc2UgNDpyZXR1cm4gZnVuY3Rpb24oYyl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKGxhW2M+Pj4yPj4+MF0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShvYVtjPj4+Mz4+PjBdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke2J9KTogJHthfWApO319O1xuZnVuY3Rpb24gUmEoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKEpbYT4+PjI+Pj4wXSl9XG52YXIgU2E9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0Zi0xNmxlXCIpOnZvaWQgMCxUYT0oYSxiKT0+e3ZhciBjPWE+PjE7Zm9yKHZhciBkPWMrYi8yOyEoYz49ZCkmJkdbYz4+PjBdOykrK2M7Yzw8PTE7aWYoMzI8Yy1hJiZTYSlyZXR1cm4gU2EuZGVjb2RlKEQuc3ViYXJyYXkoYT4+PjAsYz4+PjApKTtjPVwiXCI7Zm9yKGQ9MDshKGQ+PWIvMik7KytkKXt2YXIgZT1FW2ErMipkPj4+MT4+PjBdO2lmKDA9PWUpYnJlYWs7Yys9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gY30sVWE9KGEsYixjKT0+e2M/Pz0yMTQ3NDgzNjQ3O2lmKDI+YylyZXR1cm4gMDtjLT0yO3ZhciBkPWI7Yz1jPDIqYS5sZW5ndGg/Yy8yOmEubGVuZ3RoO2Zvcih2YXIgZT0wO2U8YzsrK2UpRVtiPj4+MT4+PjBdPWEuY2hhckNvZGVBdChlKSxiKz0yO0VbYj4+PjE+Pj4wXT0wO3JldHVybiBiLWR9LFZhPWE9PjIqYS5sZW5ndGgsV2E9KGEsYik9Pntmb3IodmFyIGM9XG4wLGQ9XCJcIjshKGM+PWIvNCk7KXt2YXIgZT1JW2ErNCpjPj4+Mj4+PjBdO2lmKDA9PWUpYnJlYWs7KytjOzY1NTM2PD1lPyhlLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGU+PjEwLDU2MzIwfGUmMTAyMykpOmQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGR9LFhhPShhLGIsYyk9PntiPj4+PTA7Yz8/PTIxNDc0ODM2NDc7aWYoND5jKXJldHVybiAwO3ZhciBkPWI7Yz1kK2MtNDtmb3IodmFyIGU9MDtlPGEubGVuZ3RoOysrZSl7dmFyIGg9YS5jaGFyQ29kZUF0KGUpO2lmKDU1Mjk2PD1oJiY1NzM0Mz49aCl7dmFyIGs9YS5jaGFyQ29kZUF0KCsrZSk7aD02NTUzNisoKGgmMTAyMyk8PDEwKXxrJjEwMjN9SVtiPj4+Mj4+PjBdPWg7Yis9NDtpZihiKzQ+YylicmVha31JW2I+Pj4yPj4+MF09MDtyZXR1cm4gYi1kfSxZYT1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7NTUyOTY8PWQmJjU3MzQzPj1kJiZcbisrYztiKz00fXJldHVybiBifSwkYT0oYSxiKT0+e3ZhciBjPUphW2FdO2lmKHZvaWQgMD09PWMpdGhyb3cgYT1aYShhKSxjPVEoYSksVyhhKSxuZXcgUihiK1wiIGhhcyB1bmtub3duIHR5cGUgXCIrYyk7cmV0dXJuIGN9LGFiPShhLGIsYyk9Pnt2YXIgZD1bXTthPWEudG9XaXJlVHlwZShkLGMpO2QubGVuZ3RoJiYoSltiPj4+Mj4+PjBdPVYoZCkpO3JldHVybiBhfSxYPVtdLGNiPXt9LGRiPWE9Pnt2YXIgYj1jYlthXTtyZXR1cm4gdm9pZCAwPT09Yj9RKGEpOmJ9LGViPSgpPT5cIm9iamVjdFwiPT10eXBlb2YgZ2xvYmFsVGhpcz9nbG9iYWxUaGlzOkZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSxmYj1hPT57dmFyIGI9WC5sZW5ndGg7WC5wdXNoKGEpO3JldHVybiBifSxnYj0oYSxiKT0+e2Zvcih2YXIgYz1BcnJheShhKSxkPTA7ZDxhOysrZCljW2RdPSRhKEpbYis0KmQ+Pj4yPj4+MF0sXCJwYXJhbWV0ZXIgXCIrZCk7cmV0dXJuIGN9LGhiPShhLGIpPT5PYmplY3QuZGVmaW5lUHJvcGVydHkoYixcblwibmFtZVwiLHt2YWx1ZTphfSk7ZnVuY3Rpb24gaWIoYSl7dmFyIGI9RnVuY3Rpb247aWYoIShiIGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBifSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApO3ZhciBjPWhiKGIubmFtZXx8XCJ1bmtub3duRnVuY3Rpb25OYW1lXCIsZnVuY3Rpb24oKXt9KTtjLnByb3RvdHlwZT1iLnByb3RvdHlwZTtjPW5ldyBjO2E9Yi5hcHBseShjLGEpO3JldHVybiBhIGluc3RhbmNlb2YgT2JqZWN0P2E6Y31cbnZhciBZPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksamI9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sa2I9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sbWI9YT0+e3ZhciBiPU8oYSkrMSxjPWxiKGIpO2MmJlAoYSxELGMsYik7cmV0dXJuIGN9LG5iPVtdLG9iPXt9LHFiPSgpPT57aWYoIXBiKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpjYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIG9iKXZvaWQgMD09PW9iW2JdP2RlbGV0ZSBhW2JdOmFbYl09b2JbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO1xucGI9Y31yZXR1cm4gcGJ9LHBiLHJiPVtudWxsLFtdLFtdXSxzYj1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLHRiPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gdWIoYSl7dmFyIGI9QXJyYXkoTyhhKSsxKTtQKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIHZiKGEsYixjLGQpe2Z1bmN0aW9uIGUoZixyLHUpe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPHI7KWY9dVswXStmO3JldHVybiBmfWZ1bmN0aW9uIGgoZixyKXtyZXR1cm4gZShmLHIsXCIwXCIpfWZ1bmN0aW9uIGsoZixyKXtmdW5jdGlvbiB1KGJiKXtyZXR1cm4gMD5iYj8tMTowPGJiPzE6MH12YXIgSDswPT09KEg9dShmLmdldEZ1bGxZZWFyKCktci5nZXRGdWxsWWVhcigpKSkmJjA9PT0oSD11KGYuZ2V0TW9udGgoKS1yLmdldE1vbnRoKCkpKSYmKEg9dShmLmdldERhdGUoKS1yLmdldERhdGUoKSkpO3JldHVybiBIfWZ1bmN0aW9uIG0oZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBxKGYpe3ZhciByPWYuU2E7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuVGErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8cjspe3ZhciB1PWYuZ2V0TW9udGgoKSxIPShZKGYuZ2V0RnVsbFllYXIoKSk/c2I6dGIpW3VdO2lmKHI+SC1mLmdldERhdGUoKSlyLT1ILWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnU/Zi5zZXRNb250aCh1KzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStyKTticmVha319dT1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3I9bShuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt1PW0odSk7cmV0dXJuIDA+PWsocixmKT8wPj1rKHUsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgbj1KW2QrNDA+Pj4yPj4+MF07ZD17a2I6SVtkPj4+Mj4+PjBdLGpiOklbZCs0Pj4+Mj4+PjBdLFdhOklbZCs4Pj4+Mj4+PjBdLCRhOklbZCsxMj4+PjI+Pj4wXSxYYTpJW2QrMTY+Pj4yPj4+MF0sVGE6SVtkKzIwPj4+Mj4+PjBdLE5hOklbZCsyND4+PjI+Pj4wXSxTYTpJW2QrMjg+Pj4yPj4+MF0sbWI6SVtkKzMyPj4+Mj4+PjBdLGliOklbZCszNj4+PjI+Pj4wXSxsYjpuP04obik6XCJcIn07Yz1OKGMpO249e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcIiVYXCI6XCIlSDolTTolU1wiLFxuXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgdiBpbiBuKWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodixcImdcIiksblt2XSk7dmFyIHk9XCJTdW5kYXkgTW9uZGF5IFR1ZXNkYXkgV2VkbmVzZGF5IFRodXJzZGF5IEZyaWRheSBTYXR1cmRheVwiLnNwbGl0KFwiIFwiKSxGPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTtuPXtcIiVhXCI6Zj0+eVtmLk5hXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zj0+eVtmLk5hXSxcIiViXCI6Zj0+XG5GW2YuWGFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT5GW2YuWGFdLFwiJUNcIjpmPT5oKChmLlRhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5oKGYuJGEsMiksXCIlZVwiOmY9PmUoZi4kYSwyLFwiIFwiKSxcIiVnXCI6Zj0+cShmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+cShmKSxcIiVIXCI6Zj0+aChmLldhLDIpLFwiJUlcIjpmPT57Zj1mLldhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBoKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciByPTAsdT0wO3U8PWYuWGEtMTtyKz0oWShmLlRhKzE5MDApP3NiOnRiKVt1KytdKTtyZXR1cm4gaChmLiRhK3IsMyl9LFwiJW1cIjpmPT5oKGYuWGErMSwyKSxcIiVNXCI6Zj0+aChmLmpiLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5XYSYmMTI+Zi5XYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5oKGYua2IsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLk5hfHw3LFwiJVVcIjpmPT5oKE1hdGguZmxvb3IoKGYuU2ErNy1mLk5hKS83KSwyKSxcIiVWXCI6Zj0+XG57dmFyIHI9TWF0aC5mbG9vcigoZi5TYSs3LShmLk5hKzYpJTcpLzcpOzI+PShmLk5hKzM3MS1mLlNhLTIpJTcmJnIrKztpZihyKTUzPT1yJiYodT0oZi5OYSszNzEtZi5TYSklNyw0PT11fHwzPT11JiZZKGYuVGEpfHwocj0xKSk7ZWxzZXtyPTUyO3ZhciB1PShmLk5hKzctZi5TYS0xKSU3Oyg0PT11fHw1PT11JiZZKGYuVGElNDAwLTEpKSYmcisrfXJldHVybiBoKHIsMil9LFwiJXdcIjpmPT5mLk5hLFwiJVdcIjpmPT5oKE1hdGguZmxvb3IoKGYuU2ErNy0oZi5OYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuVGErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuVGErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5pYjt2YXIgcj0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKHI/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYubGIsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO2Zvcih2IGluIG4pYy5pbmNsdWRlcyh2KSYmXG4oYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh2LFwiZ1wiKSxuW3ZdKGQpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt2PXViKGMpO2lmKHYubGVuZ3RoPmIpcmV0dXJuIDA7Qy5zZXQodixhPj4+MCk7cmV0dXJuIHYubGVuZ3RoLTF9Zm9yKHZhciB3Yj1BcnJheSgyNTYpLHhiPTA7MjU2PnhiOysreGIpd2JbeGJdPVN0cmluZy5mcm9tQ2hhckNvZGUoeGIpO0hhPXdiO1I9Zy5CaW5kaW5nRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihhKXtzdXBlcihhKTt0aGlzLm5hbWU9XCJCaW5kaW5nRXJyb3JcIn19O2cuSW50ZXJuYWxFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkludGVybmFsRXJyb3JcIn19O1xuT2JqZWN0LmFzc2lnbihOYS5wcm90b3R5cGUse2dldChhKXtyZXR1cm4gdGhpcy5SYVthXX0saGFzKGEpe3JldHVybiB2b2lkIDAhPT10aGlzLlJhW2FdfSxZYShhKXt2YXIgYj10aGlzLmFiLnBvcCgpfHx0aGlzLlJhLmxlbmd0aDt0aGlzLlJhW2JdPWE7cmV0dXJuIGJ9LFphKGEpe3RoaXMuUmFbYV09dm9pZCAwO3RoaXMuYWIucHVzaChhKX19KTtULlJhLnB1c2goe3ZhbHVlOnZvaWQgMH0se3ZhbHVlOm51bGx9LHt2YWx1ZTohMH0se3ZhbHVlOiExfSk7VC5VYT1ULlJhLmxlbmd0aDtnLmNvdW50X2VtdmFsX2hhbmRsZXM9KCk9Pntmb3IodmFyIGE9MCxiPVQuVWE7YjxULlJhLmxlbmd0aDsrK2Ipdm9pZCAwIT09VC5SYVtiXSYmKythO3JldHVybiBhfTtcbnZhciB6Yj17YTpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wOyhuZXcgQmEoYSkpLllhKGI+Pj4wLGM+Pj4wKTtDYT1hO0RhKys7dGhyb3cgQ2E7fSx0OmZ1bmN0aW9uKCl7cmV0dXJuIDB9LCQ6ZnVuY3Rpb24oKXt9LE06ZnVuY3Rpb24oKXt9LE86ZnVuY3Rpb24oKXt9LEc6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sWjpmdW5jdGlvbigpe30sVTpmdW5jdGlvbigpe30sWTpmdW5jdGlvbigpe30sQjpmdW5jdGlvbigpe30sTjpmdW5jdGlvbigpe30sSzpmdW5jdGlvbigpe30sXzpmdW5jdGlvbigpe30sTDpmdW5jdGlvbigpe30sRTpmdW5jdGlvbihhLGIsYyxkLGUpe2I+Pj49MDtiPVEoYik7dmFyIGg9LTEhPWIuaW5kZXhPZihcInVcIik7aCYmKGU9KDFuPDw2NG4pLTFuKTtTKGE+Pj4wLHtuYW1lOmIsZnJvbVdpcmVUeXBlOms9PmssdG9XaXJlVHlwZTpmdW5jdGlvbihrLG0pe2lmKFwiYmlnaW50XCIhPXR5cGVvZiBtJiZcIm51bWJlclwiIT10eXBlb2YgbSl0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3QgY29udmVydCBcIiR7R2EobSl9XCIgdG8gJHt0aGlzLm5hbWV9YCk7XG5pZihtPGR8fG0+ZSl0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXNzaW5nIGEgbnVtYmVyIFwiJHtHYShtKX1cIiBmcm9tIEpTIHNpZGUgdG8gQy9DKysgc2lkZSB0byBhbiBhcmd1bWVudCBvZiB0eXBlIFwiJHtifVwiLCB3aGljaCBpcyBvdXRzaWRlIHRoZSB2YWxpZCByYW5nZSBbJHtkfSwgJHtlfV0hYCk7cmV0dXJuIG19LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6TWEoYixjPj4+MCwhaCksVmE6bnVsbH0pfSxkYTpmdW5jdGlvbihhLGIsYyxkKXtiPVEoYj4+PjApO1MoYT4+PjAse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZSl7cmV0dXJuISFlfSx0b1dpcmVUeXBlOmZ1bmN0aW9uKGUsaCl7cmV0dXJuIGg/YzpkfSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOmZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShEW2U+Pj4wXSl9LFZhOm51bGx9KX0sY2E6ZnVuY3Rpb24oYSxiKXtiPVEoYj4+PjApO1MoYT4+PjAse25hbWU6YixcbmZyb21XaXJlVHlwZTpjPT57dmFyIGQ9VShjKTtPYShjKTtyZXR1cm4gZH0sdG9XaXJlVHlwZTooYyxkKT0+VihkKSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlBhLFZhOm51bGx9KX0sRDpmdW5jdGlvbihhLGIsYyl7Yj1RKGI+Pj4wKTtTKGE+Pj4wLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmQ9PmQsdG9XaXJlVHlwZTooZCxlKT0+ZSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlFhKGIsYz4+PjApLFZhOm51bGx9KX0scTpmdW5jdGlvbihhLGIsYyxkLGUpe2E+Pj49MDtjPj4+PTA7Yj1RKGI+Pj4wKTstMT09PWUmJihlPTQyOTQ5NjcyOTUpO2U9bT0+bTtpZigwPT09ZCl7dmFyIGg9MzItOCpjO2U9bT0+bTw8aD4+Pmh9dmFyIGs9Yi5pbmNsdWRlcyhcInVuc2lnbmVkXCIpP2Z1bmN0aW9uKG0scSl7cmV0dXJuIHE+Pj4wfTpmdW5jdGlvbihtLHEpe3JldHVybiBxfTtTKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZSx0b1dpcmVUeXBlOmssYXJnUGFja0FkdmFuY2U6OCxcbnJlYWRWYWx1ZUZyb21Qb2ludGVyOk1hKGIsYywwIT09ZCksVmE6bnVsbH0pfSxsOmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGgpe3JldHVybiBuZXcgZShDLmJ1ZmZlcixKW2grND4+PjI+Pj4wXSxKW2g+Pj4yPj4+MF0pfXZhciBlPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheSxCaWdJbnQ2NEFycmF5LEJpZ1VpbnQ2NEFycmF5XVtiXTtjPVEoYz4+PjApO1MoYT4+PjAse25hbWU6Yyxmcm9tV2lyZVR5cGU6ZCxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOmR9LHtnYjohMH0pfSxGOmZ1bmN0aW9uKGEsYil7Yj1RKGI+Pj4wKTt2YXIgYz1cInN0ZDo6c3RyaW5nXCI9PT1iO1MoYT4+PjAse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZCl7dmFyIGU9SltkPj4+Mj4+PjBdLGg9ZCs0O2lmKGMpZm9yKHZhciBrPWgsbT0wO208PWU7KyttKXt2YXIgcT1cbmgrbTtpZihtPT1lfHwwPT1EW3E+Pj4wXSl7az1OKGsscS1rKTtpZih2b2lkIDA9PT1uKXZhciBuPWs7ZWxzZSBuKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLG4rPWs7az1xKzF9fWVsc2V7bj1BcnJheShlKTtmb3IobT0wO208ZTsrK20pblttXT1TdHJpbmcuZnJvbUNoYXJDb2RlKERbaCttPj4+MF0pO249bi5qb2luKFwiXCIpfVcoZCk7cmV0dXJuIG59LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZCxlKXtlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXImJihlPW5ldyBVaW50OEFycmF5KGUpKTt2YXIgaD1cInN0cmluZ1wiPT10eXBlb2YgZTtpZighKGh8fGUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHxlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fGUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXRocm93IG5ldyBSKFwiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZ1wiKTt2YXIgaz1jJiZoP08oZSk6ZS5sZW5ndGg7dmFyIG09bGIoNCtrKzEpLHE9bSs0O0pbbT4+PjI+Pj4wXT1rO1xuaWYoYyYmaClQKGUsRCxxLGsrMSk7ZWxzZSBpZihoKWZvcihoPTA7aDxrOysraCl7dmFyIG49ZS5jaGFyQ29kZUF0KGgpO2lmKDI1NTxuKXRocm93IFcocSksbmV3IFIoXCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHNcIik7RFtxK2g+Pj4wXT1ufWVsc2UgZm9yKGg9MDtoPGs7KytoKURbcStoPj4+MF09ZVtoXTtudWxsIT09ZCYmZC5wdXNoKFcsbSk7cmV0dXJuIG19LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6UmEsVmEoZCl7VyhkKX19KX0sdjpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDtjPVEoYyk7aWYoMj09PWIpe3ZhciBkPVRhO3ZhciBlPVVhO3ZhciBoPVZhO3ZhciBrPSgpPT5HO3ZhciBtPTF9ZWxzZSA0PT09YiYmKGQ9V2EsZT1YYSxoPVlhLGs9KCk9PkosbT0yKTtTKGE+Pj4wLHtuYW1lOmMsZnJvbVdpcmVUeXBlOnE9Pntmb3IodmFyIG49SltxPj4+Mj4+PjBdLHY9aygpLHksRj1xKzQsZj1cbjA7Zjw9bjsrK2Ype3ZhciByPXErNCtmKmI7aWYoZj09bnx8MD09dltyPj4+bV0pRj1kKEYsci1GKSx2b2lkIDA9PT15P3k9RjooeSs9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSx5Kz1GKSxGPXIrYn1XKHEpO3JldHVybiB5fSx0b1dpcmVUeXBlOihxLG4pPT57aWYoXCJzdHJpbmdcIiE9dHlwZW9mIG4pdGhyb3cgbmV3IFIoYENhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICR7Y31gKTt2YXIgdj1oKG4pLHk9bGIoNCt2K2IpO0pbeT4+PjJdPXY+Pm07ZShuLHkrNCx2K2IpO251bGwhPT1xJiZxLnB1c2goVyx5KTtyZXR1cm4geX0sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpQYSxWYShxKXtXKHEpfX0pfSxlYTpmdW5jdGlvbihhLGIpe2I9UShiPj4+MCk7UyhhPj4+MCx7aGI6ITAsbmFtZTpiLGFyZ1BhY2tBZHZhbmNlOjAsZnJvbVdpcmVUeXBlOigpPT57fSx0b1dpcmVUeXBlOigpPT57fX0pfSxhYTooKT0+MSxvOmZ1bmN0aW9uKGEsYixjKXtiPj4+PVxuMDtjPj4+PTA7YT1VKGE+Pj4wKTtiPSRhKGIsXCJlbXZhbDo6YXNcIik7cmV0dXJuIGFiKGIsYyxhKX0seDpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO2E9WFthPj4+MF07Yj1VKGI+Pj4wKTtyZXR1cm4gYShudWxsLGIsYyxkKX0sajpmdW5jdGlvbihhLGIsYyxkLGUpe2M+Pj49MDtkPj4+PTA7ZT4+Pj0wO2E9WFthPj4+MF07Yj1VKGI+Pj4wKTtjPWRiKGMpO3JldHVybiBhKGIsYltjXSxkLGUpfSxiOk9hLHc6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1VKGE+Pj4wKTtiPVUoYik7cmV0dXJuIGE9PWJ9LHM6ZnVuY3Rpb24oYSl7YT4+Pj0wO2lmKDA9PT1hKXJldHVybiBWKGViKCkpO2E9ZGIoYSk7cmV0dXJuIFYoZWIoKVthXSl9LGk6ZnVuY3Rpb24oYSxiLGMpe2I9Z2IoYSxiPj4+MCk7dmFyIGQ9Yi5zaGlmdCgpO2EtLTt2YXIgZT1cInJldHVybiBmdW5jdGlvbiAob2JqLCBmdW5jLCBkZXN0cnVjdG9yc1JlZiwgYXJncykge1xcblwiLGg9MCxrPVtdOzA9PT1jJiZrLnB1c2goXCJvYmpcIik7XG5mb3IodmFyIG09W1wicmV0VHlwZVwiXSxxPVtkXSxuPTA7bjxhOysrbilrLnB1c2goXCJhcmdcIituKSxtLnB1c2goXCJhcmdUeXBlXCIrbikscS5wdXNoKGJbbl0pLGUrPWAgIHZhciBhcmcke259ID0gYXJnVHlwZSR7bn0ucmVhZFZhbHVlRnJvbVBvaW50ZXIoYXJncyR7aD9cIitcIitoOlwiXCJ9KTtcXG5gLGgrPWJbbl0uYXJnUGFja0FkdmFuY2U7ZSs9YCAgdmFyIHJ2ID0gJHsxPT09Yz9cIm5ldyBmdW5jXCI6XCJmdW5jLmNhbGxcIn0oJHtrLmpvaW4oXCIsIFwiKX0pO1xcbmA7Zm9yKG49MDtuPGE7KytuKWJbbl0uZGVsZXRlT2JqZWN0JiYoZSs9YCAgYXJnVHlwZSR7bn0uZGVsZXRlT2JqZWN0KGFyZyR7bn0pO1xcbmApO2QuaGJ8fChtLnB1c2goXCJlbXZhbF9yZXR1cm5WYWx1ZVwiKSxxLnB1c2goYWIpLGUrPVwiICByZXR1cm4gZW12YWxfcmV0dXJuVmFsdWUocmV0VHlwZSwgZGVzdHJ1Y3RvcnNSZWYsIHJ2KTtcXG5cIik7bS5wdXNoKGUrXCJ9O1xcblwiKTthPWliKG0pLmFwcGx5KG51bGwscSk7Yz1gbWV0aG9kQ2FsbGVyPCgke2IubWFwKHY9Plxudi5uYW1lKS5qb2luKFwiLCBcIil9KSA9PiAke2QubmFtZX0+YDtyZXR1cm4gZmIoaGIoYyxhKSl9LHA6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1VKGE+Pj4wKTtiPVUoYik7cmV0dXJuIFYoYVtiXSl9LGM6ZnVuY3Rpb24oYSl7YT4+Pj0wOzQ8YSYmKFQuZ2V0KGEpLmJiKz0xKX0scjpmdW5jdGlvbigpe3JldHVybiBWKFtdKX0sazpmdW5jdGlvbihhKXthPVUoYT4+PjApO2Zvcih2YXIgYj1BcnJheShhLmxlbmd0aCksYz0wO2M8YS5sZW5ndGg7YysrKWJbY109YVtjXTtyZXR1cm4gVihiKX0sZDpmdW5jdGlvbihhKXtyZXR1cm4gVihkYihhPj4+MCkpfSxoOmZ1bmN0aW9uKCl7cmV0dXJuIFYoe30pfSxnOmZ1bmN0aW9uKGEpe2E+Pj49MDtmb3IodmFyIGI9VShhKTtiLmxlbmd0aDspe3ZhciBjPWIucG9wKCk7Yi5wb3AoKShjKX1PYShhKX0sZjpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDthPVUoYT4+PjApO2I9VShiKTtjPVUoYyk7YVtiXT1jfSxlOmZ1bmN0aW9uKGEsYil7Yj4+Pj1cbjA7YT0kYShhPj4+MCxcIl9lbXZhbF90YWtlX3ZhbHVlXCIpO2E9YS5yZWFkVmFsdWVGcm9tUG9pbnRlcihiKTtyZXR1cm4gVihhKX0sUjpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+YXx8OTAwNzE5OTI1NDc0MDk5MjxhP05hTjpOdW1iZXIoYSk7Yj4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0lbYj4+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtJW2IrND4+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTtJW2IrOD4+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7SVtiKzEyPj4+Mj4+PjBdPWEuZ2V0VVRDRGF0ZSgpO0lbYisxNj4+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7SVtiKzIwPj4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO0lbYisyND4+PjI+Pj4wXT1hLmdldFVUQ0RheSgpO0lbYisyOD4+PjI+Pj4wXT0oYS5nZXRUaW1lKCktRGF0ZS5VVEMoYS5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0RTV8MH0sUzpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+XG5hfHw5MDA3MTk5MjU0NzQwOTkyPGE/TmFOOk51bWJlcihhKTtiPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7SVtiPj4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0lbYis0Pj4+Mj4+PjBdPWEuZ2V0TWludXRlcygpO0lbYis4Pj4+Mj4+PjBdPWEuZ2V0SG91cnMoKTtJW2IrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7SVtiKzE2Pj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTtJW2IrMjA+Pj4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7SVtiKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7SVtiKzI4Pj4+Mj4+PjBdPShZKGEuZ2V0RnVsbFllYXIoKSk/amI6a2IpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0lbYiszNj4+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7dmFyIGM9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGQ9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0lbYitcbjMyPj4+Mj4+PjBdPShjIT1kJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGQsYykpfDB9LFQ6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKElbYSsyMD4+PjI+Pj4wXSsxOTAwLElbYSsxNj4+PjI+Pj4wXSxJW2ErMTI+Pj4yPj4+MF0sSVthKzg+Pj4yPj4+MF0sSVthKzQ+Pj4yPj4+MF0sSVthPj4+Mj4+PjBdLDApLGM9SVthKzMyPj4+Mj4+PjBdLGQ9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGU9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oaCxlKTswPmM/SVthKzMyPj4+Mj4+PjBdPU51bWJlcihlIT1oJiZrPT1kKTowPGMhPShrPT1kKSYmKGU9TWF0aC5tYXgoaCxlKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP2s6ZSktZCkpKTtJW2ErMjQ+Pj4yPj4+MF09Yi5nZXREYXkoKTtJW2ErXG4yOD4+PjI+Pj4wXT0oWShiLmdldEZ1bGxZZWFyKCkpP2piOmtiKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDtJW2E+Pj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7SVthKzQ+Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7SVthKzg+Pj4yPj4+MF09Yi5nZXRIb3VycygpO0lbYSsxMj4+PjI+Pj4wXT1iLmdldERhdGUoKTtJW2ErMTY+Pj4yPj4+MF09Yi5nZXRNb250aCgpO0lbYSsyMD4+PjI+Pj4wXT1iLmdldFllYXIoKTthPWIuZ2V0VGltZSgpO2lzTmFOKGEpPyhJW3liKCk+Pj4yPj4+MF09NjEsYT0tMSk6YS89MUUzO3JldHVybiBCaWdJbnQoYSl9LFA6ZnVuY3Rpb24oKXtyZXR1cm4tNTJ9LFE6ZnVuY3Rpb24oKXt9LEk6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQocSl7cmV0dXJuKHE9cS50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT9xWzFdOlwiR01UXCJ9Yz4+Pj0wO3ZhciBlPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxoPW5ldyBEYXRlKGUsXG4wLDEpLGs9bmV3IERhdGUoZSw2LDEpO2U9aC5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBtPWsuZ2V0VGltZXpvbmVPZmZzZXQoKTtKW2E+Pj4wPj4+Mj4+PjBdPTYwKk1hdGgubWF4KGUsbSk7SVtiPj4+MD4+PjI+Pj4wXT1OdW1iZXIoZSE9bSk7YT1kKGgpO2I9ZChrKTthPW1iKGEpO2I9bWIoYik7bTxlPyhKW2M+Pj4yPj4+MF09YSxKW2MrND4+PjI+Pj4wXT1iKTooSltjPj4+Mj4+PjBdPWIsSltjKzQ+Pj4yPj4+MF09YSl9LHk6KCk9PntqYShcIlwiKX0sZmE6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO25iLmxlbmd0aD0wO2Zvcih2YXIgZDtkPURbYisrPj4+MF07KXt2YXIgZT0xMDUhPWQ7ZSY9MTEyIT1kO2MrPWUmJmMlOD80OjA7bmIucHVzaCgxMTI9PWQ/SltjPj4+Mj4+PjBdOjEwNj09ZD9tYVtjPj4+M106MTA1PT1kP0lbYz4+PjI+Pj4wXTpvYVtjPj4+Mz4+PjBdKTtjKz1lPzg6NH1yZXR1cm4gQWFbYV0uYXBwbHkobnVsbCxuYil9LEM6KCk9PkRhdGUubm93KCksXG5KOmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LG46KCk9PnBlcmZvcm1hbmNlLm5vdygpLEg6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPUQubGVuZ3RoO2lmKDQyOTQ5MDE3NjA8YSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBkPWIqKDErLjIvYyk7ZD1NYXRoLm1pbihkLGErMTAwNjYzMjk2KTt2YXIgZT1NYXRoO2Q9TWF0aC5tYXgoYSxkKTthOntlPShlLm1pbi5jYWxsKGUsNDI5NDkwMTc2MCxkKyg2NTUzNi1kJTY1NTM2KSU2NTUzNiktQi5idWZmZXIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e0IuZ3JvdyhlKTtwYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChrKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sVzpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9MDtxYigpLmZvckVhY2goKGQsZSk9Pnt2YXIgaD1iK2M7ZT1KW2ErNCplPj4+Mj4+PjBdPWg7Zm9yKGg9MDtoPGQubGVuZ3RoOysraClDW2UrKz4+PjA+Pj5cbjBdPWQuY2hhckNvZGVBdChoKTtDW2U+Pj4wPj4+MF09MDtjKz1kLmxlbmd0aCsxfSk7cmV0dXJuIDB9LFg6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPXFiKCk7SlthPj4+Mj4+PjBdPWMubGVuZ3RoO3ZhciBkPTA7Yy5mb3JFYWNoKGU9PmQrPWUubGVuZ3RoKzEpO0pbYj4+PjI+Pj4wXT1kO3JldHVybiAwfSx1OigpPT41MixBOmZ1bmN0aW9uKCl7cmV0dXJuIDUyfSxWOmZ1bmN0aW9uKCl7cmV0dXJuIDcwfSx6OmZ1bmN0aW9uKGEsYixjLGQpe2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2Zvcih2YXIgZT0wLGg9MDtoPGM7aCsrKXt2YXIgaz1KW2I+Pj4yPj4+MF0sbT1KW2IrND4+PjI+Pj4wXTtiKz04O2Zvcih2YXIgcT0wO3E8bTtxKyspe3ZhciBuPURbaytxPj4+MF0sdj1yYlthXTswPT09bnx8MTA9PT1uPygoMT09PWE/aWE6QSkoRmEodiwwKSksdi5sZW5ndGg9MCk6di5wdXNoKG4pfWUrPW19SltkPj4+Mj4+PjBdPWU7cmV0dXJuIDB9LGJhOnZiLG06ZnVuY3Rpb24oYSxcbmIsYyxkKXtyZXR1cm4gdmIoYT4+PjAsYj4+PjAsYz4+PjAsZD4+PjApfX0sWj1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYyl7Wj1jLmV4cG9ydHM7Wj1BYigpO0I9Wi5nYTtwYSgpO3JhLnVuc2hpZnQoWi5oYSk7Sy0tOzA9PUsmJihudWxsIT09dGEmJihjbGVhckludGVydmFsKHRhKSx0YT1udWxsKSxMJiYoYz1MLEw9bnVsbCxjKCkpKTtyZXR1cm4gWn12YXIgYj17YTp6Yn07SysrO2lmKGcuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gZy5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtBKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCksbChjKX16YShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSl9KS5jYXRjaChsKTtyZXR1cm57fX0oKTtnLl9PcnRJbml0PShhLGIpPT4oZy5fT3J0SW5pdD1aLmlhKShhLGIpO2cuX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KGcuX09ydEdldExhc3RFcnJvcj1aLmphKShhLGIpO1xuZy5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGEsYixjLGQsZSxoLGssbSxxLG4pPT4oZy5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9Wi5rYSkoYSxiLGMsZCxlLGgsayxtLHEsbik7Zy5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihnLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1aLmxhKShhLGIpO2cuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4oZy5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPVoubWEpKGEsYixjKTtnLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KGcuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1aLm5hKShhLGIsYyk7Zy5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihnLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Wi5vYSkoYSk7Zy5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4oZy5fT3J0Q3JlYXRlU2Vzc2lvbj1aLnBhKShhLGIsYyk7XG5nLl9PcnRSZWxlYXNlU2Vzc2lvbj1hPT4oZy5fT3J0UmVsZWFzZVNlc3Npb249Wi5xYSkoYSk7Zy5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oYSxiLGMpPT4oZy5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1aLnJhKShhLGIsYyk7Zy5fT3J0R2V0SW5wdXROYW1lPShhLGIpPT4oZy5fT3J0R2V0SW5wdXROYW1lPVouc2EpKGEsYik7Zy5fT3J0R2V0T3V0cHV0TmFtZT0oYSxiKT0+KGcuX09ydEdldE91dHB1dE5hbWU9Wi50YSkoYSxiKTtnLl9PcnRGcmVlPWE9PihnLl9PcnRGcmVlPVoudWEpKGEpO2cuX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxlLGgpPT4oZy5fT3J0Q3JlYXRlVGVuc29yPVoudmEpKGEsYixjLGQsZSxoKTtnLl9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxkLGUpPT4oZy5fT3J0R2V0VGVuc29yRGF0YT1aLndhKShhLGIsYyxkLGUpO2cuX09ydFJlbGVhc2VUZW5zb3I9YT0+KGcuX09ydFJlbGVhc2VUZW5zb3I9Wi54YSkoYSk7XG5nLl9PcnRDcmVhdGVSdW5PcHRpb25zPShhLGIsYyxkKT0+KGcuX09ydENyZWF0ZVJ1bk9wdGlvbnM9Wi55YSkoYSxiLGMsZCk7Zy5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KGcuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVouemEpKGEsYixjKTtnLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1hPT4oZy5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9Wi5BYSkoYSk7Zy5fT3J0Q3JlYXRlQmluZGluZz1hPT4oZy5fT3J0Q3JlYXRlQmluZGluZz1aLkJhKShhKTtnLl9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KGcuX09ydEJpbmRJbnB1dD1aLkNhKShhLGIsYyk7Zy5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9PihnLl9PcnRCaW5kT3V0cHV0PVouRGEpKGEsYixjLGQpO2cuX09ydENsZWFyQm91bmRPdXRwdXRzPWE9PihnLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1aLkVhKShhKTtnLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oZy5fT3J0UmVsZWFzZUJpbmRpbmc9Wi5GYSkoYSk7XG5nLl9PcnRSdW5XaXRoQmluZGluZz0oYSxiLGMsZCxlKT0+KGcuX09ydFJ1bldpdGhCaW5kaW5nPVouR2EpKGEsYixjLGQsZSk7Zy5fT3J0UnVuPShhLGIsYyxkLGUsaCxrLG0pPT4oZy5fT3J0UnVuPVouSGEpKGEsYixjLGQsZSxoLGssbSk7Zy5fT3J0RW5kUHJvZmlsaW5nPWE9PihnLl9PcnRFbmRQcm9maWxpbmc9Wi5JYSkoYSk7dmFyIHliPSgpPT4oeWI9Wi5KYSkoKSxsYj1nLl9tYWxsb2M9YT0+KGxiPWcuX21hbGxvYz1aLkthKShhKSxXPWcuX2ZyZWU9YT0+KFc9Zy5fZnJlZT1aLkxhKShhKSxaYT1hPT4oWmE9Wi5NYSkoYSksQmI9KCk9PihCYj1aLk9hKSgpLENiPWE9PihDYj1aLlBhKShhKSxEYj1hPT4oRGI9Wi5RYSkoYSk7XG5mdW5jdGlvbiBBYigpe3ZhciBhPVo7YT1PYmplY3QuYXNzaWduKHt9LGEpO3ZhciBiPWQ9PigpPT5kKCk+Pj4wLGM9ZD0+ZT0+ZChlKT4+PjA7YS5KYT1iKGEuSmEpO2EuS2E9YyhhLkthKTthLk1hPWMoYS5NYSk7YS5PYT1iKGEuT2EpO2EuUWE9YyhhLlFhKTtyZXR1cm4gYX1nLnN0YWNrQWxsb2M9RGI7Zy5zdGFja1NhdmU9QmI7Zy5zdGFja1Jlc3RvcmU9Q2I7Zy5VVEY4VG9TdHJpbmc9TjtnLnN0cmluZ1RvVVRGOD0oYSxiLGMpPT5QKGEsRCxiLGMpO2cubGVuZ3RoQnl0ZXNVVEY4PU87dmFyIEViO0w9ZnVuY3Rpb24gRmIoKXtFYnx8R2IoKTtFYnx8KEw9RmIpfTtcbmZ1bmN0aW9uIEdiKCl7aWYoISgwPEspKXtpZihnLnByZVJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZy5wcmVSdW4mJihnLnByZVJ1bj1bZy5wcmVSdW5dKTtnLnByZVJ1bi5sZW5ndGg7KXt2YXIgYT1nLnByZVJ1bi5zaGlmdCgpO3FhLnVuc2hpZnQoYSl9Zm9yKDswPHFhLmxlbmd0aDspcWEuc2hpZnQoKShnKTtpZighKDA8S3x8RWJ8fChFYj0hMCxnLmNhbGxlZFJ1bj0hMCxrYSkpKXtmb3IoOzA8cmEubGVuZ3RoOylyYS5zaGlmdCgpKGcpO2ZvcihhYShnKTswPHNhLmxlbmd0aDspc2Euc2hpZnQoKShnKX19fUdiKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG4pO1xufSkoKTtcbjtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbTtcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSlcbiAgZGVmaW5lKFtdLCAoKSA9PiBvcnRXYXNtKTtcbiIsICIiLCAiIiwgImV4cG9ydCBjb25zdCBjcHVzID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtVGhyZWFkZWQgPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxuZnVuY3Rpb24gZygpe20uYnVmZmVyIT1wLmJ1ZmZlciYmcSgpO3JldHVybiBwfWZ1bmN0aW9uIHQoKXttLmJ1ZmZlciE9cC5idWZmZXImJnEoKTtyZXR1cm4gYWF9ZnVuY3Rpb24gYmEoKXttLmJ1ZmZlciE9cC5idWZmZXImJnEoKTtyZXR1cm4gY2F9ZnVuY3Rpb24gZGEoKXttLmJ1ZmZlciE9cC5idWZmZXImJnEoKTtyZXR1cm4gZWF9ZnVuY3Rpb24gdigpe20uYnVmZmVyIT1wLmJ1ZmZlciYmcSgpO3JldHVybiBmYX1mdW5jdGlvbiB3KCl7bS5idWZmZXIhPXAuYnVmZmVyJiZxKCk7cmV0dXJuIGhhfWZ1bmN0aW9uIGlhKCl7bS5idWZmZXIhPXAuYnVmZmVyJiZxKCk7cmV0dXJuIGphfXZhciB6PW1vZHVsZUFyZyxrYSxsYTt6LnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57a2E9YTtsYT1ifSk7XG52YXIgbWE9T2JqZWN0LmFzc2lnbih7fSx6KSxuYT1cIi4vdGhpcy5wcm9ncmFtXCIsb2E9KGEsYik9Pnt0aHJvdyBiO30scGE9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyxBPVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsQj1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsRD16LkVOVklST05NRU5UX0lTX1BUSFJFQUR8fCExLEU9XCJcIjtmdW5jdGlvbiBxYShhKXtyZXR1cm4gei5sb2NhdGVGaWxlP3oubG9jYXRlRmlsZShhLEUpOkUrYX12YXIgcmEsc2EsdGE7XG5pZihCKXt2YXIgZnM9cmVxdWlyZShcImZzXCIpLHVhPXJlcXVpcmUoXCJwYXRoXCIpO0U9QT91YS5kaXJuYW1lKEUpK1wiL1wiOl9fZGlybmFtZStcIi9cIjtyYT0oYixjKT0+e2I9dmEoYik/bmV3IFVSTChiKTp1YS5ub3JtYWxpemUoYik7cmV0dXJuIGZzLnJlYWRGaWxlU3luYyhiLGM/dm9pZCAwOlwidXRmOFwiKX07dGE9Yj0+e2I9cmEoYiwhMCk7Yi5idWZmZXJ8fChiPW5ldyBVaW50OEFycmF5KGIpKTtyZXR1cm4gYn07c2E9KGIsYyxkLGU9ITApPT57Yj12YShiKT9uZXcgVVJMKGIpOnVhLm5vcm1hbGl6ZShiKTtmcy5yZWFkRmlsZShiLGU/dm9pZCAwOlwidXRmOFwiLChmLGspPT57Zj9kKGYpOmMoZT9rLmJ1ZmZlcjprKX0pfTshei50aGlzUHJvZ3JhbSYmMTxwcm9jZXNzLmFyZ3YubGVuZ3RoJiYobmE9cHJvY2Vzcy5hcmd2WzFdLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikpO3Byb2Nlc3MuYXJndi5zbGljZSgyKTtvYT0oYixjKT0+e3Byb2Nlc3MuZXhpdENvZGU9Yjt0aHJvdyBjO307ei5pbnNwZWN0PSgpPT5cblwiW0Vtc2NyaXB0ZW4gTW9kdWxlIG9iamVjdF1cIjtsZXQgYTt0cnl7YT1yZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIil9Y2F0Y2goYil7dGhyb3cgY29uc29sZS5lcnJvcignVGhlIFwid29ya2VyX3RocmVhZHNcIiBtb2R1bGUgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIG5vZGUuanMgYnVpbGQgLSBwZXJoYXBzIGEgbmV3ZXIgdmVyc2lvbiBpcyBuZWVkZWQ/JyksYjt9Z2xvYmFsLldvcmtlcj1hLldvcmtlcn1lbHNlIGlmKHBhfHxBKUE/RT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoRT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksKHR5cGVvZiBfc2NyaXB0RGlyICE9PSBcInVuZGVmaW5lZFwiICYmIF9zY3JpcHREaXIpJiYoRT1fc2NyaXB0RGlyKSwwIT09RS5pbmRleE9mKFwiYmxvYjpcIik/RT1FLnN1YnN0cigwLEUucmVwbGFjZSgvWz8jXS4qLyxcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikrMSk6RT1cIlwiLEJ8fChyYT1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLFxuYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sQSYmKHRhPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Iuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYi5yZXNwb25zZSl9KSxzYT0oYSxiLGMpPT57dmFyIGQ9bmV3IFhNTEh0dHBSZXF1ZXN0O2Qub3BlbihcIkdFVFwiLGEsITApO2QucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtkLm9ubG9hZD0oKT0+ezIwMD09ZC5zdGF0dXN8fDA9PWQuc3RhdHVzJiZkLnJlc3BvbnNlP2IoZC5yZXNwb25zZSk6YygpfTtkLm9uZXJyb3I9YztkLnNlbmQobnVsbCl9KTtCJiZcInVuZGVmaW5lZFwiPT10eXBlb2YgcGVyZm9ybWFuY2UmJihnbG9iYWwucGVyZm9ybWFuY2U9cmVxdWlyZShcInBlcmZfaG9va3NcIikucGVyZm9ybWFuY2UpO3ZhciB3YT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHhhPWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtcbkImJih3YT0oLi4uYSk9PmZzLndyaXRlU3luYygxLGEuam9pbihcIiBcIikrXCJcXG5cIikseGE9KC4uLmEpPT5mcy53cml0ZVN5bmMoMixhLmpvaW4oXCIgXCIpK1wiXFxuXCIpKTt2YXIgeWE9d2EsRj14YTtPYmplY3QuYXNzaWduKHosbWEpO21hPW51bGw7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZ6YShcIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWRcIik7dmFyIG0sQWEsQmE9ITEsRyxwLGFhLGNhLGVhLGZhLGhhLENhLEgsRGEsamE7XG5mdW5jdGlvbiBxKCl7dmFyIGE9bS5idWZmZXI7ei5IRUFQOD1wPW5ldyBJbnQ4QXJyYXkoYSk7ei5IRUFQMTY9Y2E9bmV3IEludDE2QXJyYXkoYSk7ei5IRUFQVTg9YWE9bmV3IFVpbnQ4QXJyYXkoYSk7ei5IRUFQVTE2PWVhPW5ldyBVaW50MTZBcnJheShhKTt6LkhFQVAzMj1mYT1uZXcgSW50MzJBcnJheShhKTt6LkhFQVBVMzI9aGE9bmV3IFVpbnQzMkFycmF5KGEpO3ouSEVBUEYzMj1DYT1uZXcgRmxvYXQzMkFycmF5KGEpO3ouSEVBUEY2ND1qYT1uZXcgRmxvYXQ2NEFycmF5KGEpO3ouSEVBUDY0PUg9bmV3IEJpZ0ludDY0QXJyYXkoYSk7ei5IRUFQVTY0PURhPW5ldyBCaWdVaW50NjRBcnJheShhKX12YXIgRWE9MTY3NzcyMTY7XG5pZihEKW09ei53YXNtTWVtb3J5O2Vsc2UgaWYoei53YXNtTWVtb3J5KW09ei53YXNtTWVtb3J5O2Vsc2UgaWYobT1uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOkVhLzY1NTM2LG1heGltdW06NjU1MzYsc2hhcmVkOiEwfSksIShtLmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSl0aHJvdyBGKFwicmVxdWVzdGVkIGEgc2hhcmVkIFdlYkFzc2VtYmx5Lk1lbW9yeSBidXQgdGhlIHJldHVybmVkIGJ1ZmZlciBpcyBub3QgYSBTaGFyZWRBcnJheUJ1ZmZlciwgaW5kaWNhdGluZyB0aGF0IHdoaWxlIHRoZSBicm93c2VyIGhhcyBTaGFyZWRBcnJheUJ1ZmZlciBpdCBkb2VzIG5vdCBoYXZlIFdlYkFzc2VtYmx5IHRocmVhZHMgc3VwcG9ydCAtIHlvdSBtYXkgbmVlZCB0byBzZXQgYSBmbGFnXCIpLEImJkYoXCIob24gbm9kZSB5b3UgbWF5IG5lZWQ6IC0tZXhwZXJpbWVudGFsLXdhc20tdGhyZWFkcyAtLWV4cGVyaW1lbnRhbC13YXNtLWJ1bGstbWVtb3J5IGFuZC9vciByZWNlbnQgdmVyc2lvbilcIiksXG5FcnJvcihcImJhZCBtZW1vcnlcIik7cSgpO0VhPW0uYnVmZmVyLmJ5dGVMZW5ndGg7dmFyIEZhPVtdLEdhPVtdLEhhPVtdLEk9MCxJYT1udWxsLEo9bnVsbDtmdW5jdGlvbiBKYSgpe0ktLTtpZigwPT1JJiYobnVsbCE9PUlhJiYoY2xlYXJJbnRlcnZhbChJYSksSWE9bnVsbCksSikpe3ZhciBhPUo7Sj1udWxsO2EoKX19ZnVuY3Rpb24gemEoYSl7YT1cIkFib3J0ZWQoXCIrYStcIilcIjtGKGEpO0JhPSEwO0c9MTthPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoYStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIik7bGEoYSk7dGhyb3cgYTt9dmFyIEthPWE9PmEuc3RhcnRzV2l0aChcImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxcIiksdmE9YT0+YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKSxLO0s9XCJvcnQtd2FzbS10aHJlYWRlZC53YXNtXCI7S2EoSyl8fChLPXFhKEspKTtcbmZ1bmN0aW9uIExhKGEpe2lmKHRhKXJldHVybiB0YShhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9ZnVuY3Rpb24gTWEoYSl7aWYocGF8fEEpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGZldGNoJiYhdmEoYSkpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+TGEoYSkpO2lmKHNhKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3NhKGEsZD0+YihuZXcgVWludDhBcnJheShkKSksYyl9KX1yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKT0+TGEoYSkpfVxuZnVuY3Rpb24gTmEoYSxiLGMpe3JldHVybiBNYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntGKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7emEoZCl9KX1mdW5jdGlvbiBPYShhLGIpe3ZhciBjPUs7cmV0dXJuXCJmdW5jdGlvblwiIT10eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmd8fEthKGMpfHx2YShjKXx8Qnx8XCJmdW5jdGlvblwiIT10eXBlb2YgZmV0Y2g/TmEoYyxhLGIpOmZldGNoKGMse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oZD0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcoZCxhKS50aGVuKGIsZnVuY3Rpb24oZSl7Rihgd2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICR7ZX1gKTtGKFwiZmFsbGluZyBiYWNrIHRvIEFycmF5QnVmZmVyIGluc3RhbnRpYXRpb25cIik7cmV0dXJuIE5hKGMsYSxiKX0pKX1cbnZhciBQYT17ODkxODY4OihhLGIsYyxkKT0+e2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiB6fHwhei5IYilyZXR1cm4gMTthPUwoYT4+PjApO2Euc3RhcnRzV2l0aChcIi4vXCIpJiYoYT1hLnN1YnN0cmluZygyKSk7YT16LkhiLmdldChhKTtpZighYSlyZXR1cm4gMjtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtpZihiK2M+YS5ieXRlTGVuZ3RoKXJldHVybiAzO3RyeXtyZXR1cm4gdCgpLnNldChhLnN1YmFycmF5KGIsYitjKSxkPj4+MCksMH1jYXRjaHtyZXR1cm4gNH19fTtmdW5jdGlvbiBRYShhKXt0aGlzLm5hbWU9XCJFeGl0U3RhdHVzXCI7dGhpcy5tZXNzYWdlPWBQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCR7YX0pYDt0aGlzLnN0YXR1cz1hfVxudmFyIFJhPWE9PnthLnRlcm1pbmF0ZSgpO2Eub25tZXNzYWdlPSgpPT57fX0sVGE9YT0+ezA9PU0ub2IubGVuZ3RoJiYoU2EoKSxNLkJiKE0ub2JbMF0pKTt2YXIgYj1NLm9iLnBvcCgpO2lmKCFiKXJldHVybiA2O00ucGIucHVzaChiKTtNLmtiW2EubmJdPWI7Yi5uYj1hLm5iO3ZhciBjPXtjbWQ6XCJydW5cIixzdGFydF9yb3V0aW5lOmEuT2IsYXJnOmEuSWIscHRocmVhZF9wdHI6YS5uYn07QiYmYi51bnJlZigpO2IucG9zdE1lc3NhZ2UoYyxhLlViKTtyZXR1cm4gMH0sTz0wLFVhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCxWYT0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBkPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZCk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZVYSlyZXR1cm4gVWEuZGVjb2RlKGEuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXI/YS5zbGljZShiLGMpOmEuc3ViYXJyYXkoYixjKSk7XG5mb3IoZD1cIlwiO2I8Yzspe3ZhciBlPWFbYisrXTtpZihlJjEyOCl7dmFyIGY9YVtiKytdJjYzO2lmKDE5Mj09KGUmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChlJjMxKTw8NnxmKTtlbHNle3ZhciBrPWFbYisrXSY2MztlPTIyND09KGUmMjQwKT8oZSYxNSk8PDEyfGY8PDZ8azooZSY3KTw8MTh8Zjw8MTJ8azw8NnxhW2IrK10mNjM7NjU1MzY+ZT9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpOihlLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGU+PjEwLDU2MzIwfGUmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGR9LEw9KGEsYik9PihhPj4+PTApP1ZhKHQoKSxhLGIpOlwiXCIsWWE9YT0+e3ZhciBiPVdhKCk7YT1hKCk7WGEoYik7cmV0dXJuIGF9O1xuZnVuY3Rpb24gUChhLGIpe3ZhciBjPWFyZ3VtZW50cy5sZW5ndGgtMixkPWFyZ3VtZW50cztyZXR1cm4gWWEoKCk9Pntmb3IodmFyIGU9MipjLGY9WmEoOCplKSxrPWY+Pj4zLGw9MDtsPGM7bCsrKXt2YXIgcj1kWzIrbF07XCJiaWdpbnRcIj09dHlwZW9mIHI/KEhbaysyKmxdPTFuLEhbaysyKmwrMV09cik6KEhbaysyKmxdPTBuLGlhKClbaysyKmwrMT4+PjBdPXIpfXJldHVybiAkYShhLGUsZixiKX0pfWZ1bmN0aW9uIGFiKGEpe2lmKEQpcmV0dXJuIFAoMCwxLGEpO0c9YTswPE98fChNLlBiKCksei5vbkV4aXQ/LihhKSxCYT0hMCk7b2EoYSxuZXcgUWEoYSkpfXZhciBjYj1hPT57Rz1hO2lmKEQpdGhyb3cgYmIoYSksXCJ1bndpbmRcIjthYihhKX07ZnVuY3Rpb24gZGIoKXtmb3IodmFyIGE9ei5udW1UaHJlYWRzO2EtLTspU2EoKTtGYS51bnNoaWZ0KCgpPT57SSsrO2ViKCgpPT5KYSgpKX0pfVxuZnVuY3Rpb24gU2EoKXt2YXIgYT1xYShcIm9ydC13YXNtLXRocmVhZGVkLndvcmtlci5qc1wiKTthPW5ldyBXb3JrZXIoYSk7TS5vYi5wdXNoKGEpfWZ1bmN0aW9uIGViKGEpe0Q/YSgpOlByb21pc2UuYWxsKE0ub2IubWFwKE0uQmIpKS50aGVuKGEpfVxudmFyIE09e29iOltdLHBiOltdLEdiOltdLGtiOnt9LHdiKCl7RD8oTS5yZWNlaXZlT2JqZWN0VHJhbnNmZXI9TS5OYixNLnRocmVhZEluaXRUTFM9TS5GYixNLnNldEV4aXRTdGF0dXM9TS5FYik6ZGIoKX0sRWI6YT0+Rz1hLFhiOltcIiR0ZXJtaW5hdGVXb3JrZXJcIl0sUGI6KCk9Pntmb3IodmFyIGEgb2YgTS5wYilSYShhKTtmb3IoYSBvZiBNLm9iKVJhKGEpO00ub2I9W107TS5wYj1bXTtNLmtiPVtdfSxEYjphPT57dmFyIGI9YS5uYjtkZWxldGUgTS5rYltiXTtNLm9iLnB1c2goYSk7TS5wYi5zcGxpY2UoTS5wYi5pbmRleE9mKGEpLDEpO2EubmI9MDtmYihiKX0sTmIoKXt9LEZiKCl7TS5HYi5mb3JFYWNoKGE9PmEoKSl9LEJiOmE9Pm5ldyBQcm9taXNlKGI9PnthLm9ubWVzc2FnZT1mPT57Zj1mLmRhdGE7dmFyIGs9Zi5jbWQ7aWYoZi50YXJnZXRUaHJlYWQmJmYudGFyZ2V0VGhyZWFkIT1nYigpKXt2YXIgbD1NLmtiW2YudGFyZ2V0VGhyZWFkXTtsP2wucG9zdE1lc3NhZ2UoZixmLnRyYW5zZmVyTGlzdCk6XG5GKGBJbnRlcm5hbCBlcnJvciEgV29ya2VyIHNlbnQgYSBtZXNzYWdlIFwiJHtrfVwiIHRvIHRhcmdldCBwdGhyZWFkICR7Zi50YXJnZXRUaHJlYWR9LCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFgKX1lbHNlIGlmKFwiY2hlY2tNYWlsYm94XCI9PT1rKWhiKCk7ZWxzZSBpZihcInNwYXduVGhyZWFkXCI9PT1rKVRhKGYpO2Vsc2UgaWYoXCJjbGVhbnVwVGhyZWFkXCI9PT1rKU0uRGIoTS5rYltmLnRocmVhZF0pO2Vsc2UgaWYoXCJraWxsVGhyZWFkXCI9PT1rKWY9Zi50aHJlYWQsaz1NLmtiW2ZdLGRlbGV0ZSBNLmtiW2ZdLFJhKGspLGZiKGYpLE0ucGIuc3BsaWNlKE0ucGIuaW5kZXhPZihrKSwxKSxrLm5iPTA7ZWxzZSBpZihcImNhbmNlbFRocmVhZFwiPT09aylNLmtiW2YudGhyZWFkXS5wb3N0TWVzc2FnZSh7Y21kOlwiY2FuY2VsXCJ9KTtlbHNlIGlmKFwibG9hZGVkXCI9PT1rKWEubG9hZGVkPSEwLEImJiFhLm5iJiZhLnVucmVmKCksYihhKTtlbHNlIGlmKFwiYWxlcnRcIj09PWspYWxlcnQoYFRocmVhZCAke2YudGhyZWFkSWR9OiAke2YudGV4dH1gKTtcbmVsc2UgaWYoXCJzZXRpbW1lZGlhdGVcIj09PWYudGFyZ2V0KWEucG9zdE1lc3NhZ2UoZik7ZWxzZSBpZihcImNhbGxIYW5kbGVyXCI9PT1rKXpbZi5oYW5kbGVyXSguLi5mLmFyZ3MpO2Vsc2UgayYmRihgd29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kICR7a31gKX07YS5vbmVycm9yPWY9PntGKGAke1wid29ya2VyIHNlbnQgYW4gZXJyb3IhXCJ9ICR7Zi5maWxlbmFtZX06JHtmLmxpbmVub306ICR7Zi5tZXNzYWdlfWApO3Rocm93IGY7fTtCJiYoYS5vbihcIm1lc3NhZ2VcIixmPT5hLm9ubWVzc2FnZSh7ZGF0YTpmfSkpLGEub24oXCJlcnJvclwiLGY9PmEub25lcnJvcihmKSkpO3ZhciBjPVtdLGQ9W1wib25FeGl0XCJdLGU7Zm9yKGUgb2YgZCl6Lmhhc093blByb3BlcnR5KGUpJiZjLnB1c2goZSk7YS5wb3N0TWVzc2FnZSh7Y21kOlwibG9hZFwiLGhhbmRsZXJzOmMsdXJsT3JCbG9iOnoubWFpblNjcmlwdFVybE9yQmxvYnx8X3NjcmlwdERpcix3YXNtTWVtb3J5Om0sd2FzbU1vZHVsZTpBYX0pfSl9O1xuei5QVGhyZWFkPU07dmFyIGliPWE9Pntmb3IoOzA8YS5sZW5ndGg7KWEuc2hpZnQoKSh6KX07ei5lc3RhYmxpc2hTdGFja1NwYWNlPSgpPT57dmFyIGE9Z2IoKSxiPXcoKVthKzUyPj4+Mj4+PjBdO2E9dygpW2ErNTY+Pj4yPj4+MF07amIoYixiLWEpO1hhKGIpfTtmdW5jdGlvbiBiYihhKXtpZihEKXJldHVybiBQKDEsMCxhKTtjYihhKX12YXIga2I9W10sbGI7ei5pbnZva2VFbnRyeVBvaW50PShhLGIpPT57dmFyIGM9a2JbYV07Y3x8KGE+PWtiLmxlbmd0aCYmKGtiLmxlbmd0aD1hKzEpLGtiW2FdPWM9bGIuZ2V0KGEpKTthPWMoYik7MDxPP00uRWIoYSk6bWIoYSl9O1xuZnVuY3Rpb24gbmIoYSl7dGhpcy50Yj1hLTI0O3RoaXMuTWI9ZnVuY3Rpb24oYil7dygpW3RoaXMudGIrND4+PjI+Pj4wXT1ifTt0aGlzLnliPWZ1bmN0aW9uKGIpe3coKVt0aGlzLnRiKzg+Pj4yPj4+MF09Yn07dGhpcy53Yj1mdW5jdGlvbihiLGMpe3RoaXMueGIoKTt0aGlzLk1iKGIpO3RoaXMueWIoYyl9O3RoaXMueGI9ZnVuY3Rpb24oKXt3KClbdGhpcy50YisxNj4+PjI+Pj4wXT0wfX12YXIgb2I9MCxwYj0wO2Z1bmN0aW9uIHFiKGEsYixjLGQpe3JldHVybiBEP1AoMiwxLGEsYixjLGQpOnJiKGEsYixjLGQpfVxuZnVuY3Rpb24gcmIoYSxiLGMsZCl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlcilyZXR1cm4gRihcIkN1cnJlbnQgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCBTaGFyZWRBcnJheUJ1ZmZlciwgcHRocmVhZHMgYXJlIG5vdCBhdmFpbGFibGUhXCIpLDY7dmFyIGU9W107aWYoRCYmMD09PWUubGVuZ3RoKXJldHVybiBxYihhLGIsYyxkKTthPXtPYjpjLG5iOmEsSWI6ZCxVYjplfTtyZXR1cm4gRD8oYS5XYj1cInNwYXduVGhyZWFkXCIscG9zdE1lc3NhZ2UoYSxlKSwwKTpUYShhKX1mdW5jdGlvbiBzYihhLGIsYyl7cmV0dXJuIEQ/UCgzLDEsYSxiLGMpOjB9ZnVuY3Rpb24gdGIoYSxiKXtpZihEKXJldHVybiBQKDQsMSxhLGIpfVxudmFyIHViPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPWEuY2hhckNvZGVBdChjKTsxMjc+PWQ/YisrOjIwNDc+PWQ/Yis9Mjo1NTI5Njw9ZCYmNTczNDM+PWQ/KGIrPTQsKytjKTpiKz0zfXJldHVybiBifSx2Yj0oYSxiLGMsZCk9PntjPj4+PTA7aWYoISgwPGQpKXJldHVybiAwO3ZhciBlPWM7ZD1jK2QtMTtmb3IodmFyIGY9MDtmPGEubGVuZ3RoOysrZil7dmFyIGs9YS5jaGFyQ29kZUF0KGYpO2lmKDU1Mjk2PD1rJiY1NzM0Mz49ayl7dmFyIGw9YS5jaGFyQ29kZUF0KCsrZik7az02NTUzNisoKGsmMTAyMyk8PDEwKXxsJjEwMjN9aWYoMTI3Pj1rKXtpZihjPj1kKWJyZWFrO2JbYysrPj4+MF09a31lbHNle2lmKDIwNDc+PWspe2lmKGMrMT49ZClicmVhaztiW2MrKz4+PjBdPTE5MnxrPj42fWVsc2V7aWYoNjU1MzU+PWspe2lmKGMrMj49ZClicmVhaztiW2MrKz4+PjBdPTIyNHxrPj4xMn1lbHNle2lmKGMrMz49ZClicmVhaztiW2MrKz4+PjBdPTI0MHxrPj5cbjE4O2JbYysrPj4+MF09MTI4fGs+PjEyJjYzfWJbYysrPj4+MF09MTI4fGs+PjYmNjN9YltjKys+Pj4wXT0xMjh8ayY2M319YltjPj4+MF09MDtyZXR1cm4gYy1lfSx3Yj0oYSxiLGMpPT52YihhLHQoKSxiLGMpO2Z1bmN0aW9uIHhiKGEsYil7aWYoRClyZXR1cm4gUCg1LDEsYSxiKX1mdW5jdGlvbiB5YihhLGIsYyl7aWYoRClyZXR1cm4gUCg2LDEsYSxiLGMpfWZ1bmN0aW9uIHpiKGEsYixjKXtyZXR1cm4gRD9QKDcsMSxhLGIsYyk6MH1mdW5jdGlvbiBBYihhLGIpe2lmKEQpcmV0dXJuIFAoOCwxLGEsYil9ZnVuY3Rpb24gQmIoYSxiLGMpe2lmKEQpcmV0dXJuIFAoOSwxLGEsYixjKX1mdW5jdGlvbiBDYihhLGIsYyxkKXtpZihEKXJldHVybiBQKDEwLDEsYSxiLGMsZCl9ZnVuY3Rpb24gRGIoYSxiLGMsZCl7aWYoRClyZXR1cm4gUCgxMSwxLGEsYixjLGQpfWZ1bmN0aW9uIEViKGEsYixjLGQpe2lmKEQpcmV0dXJuIFAoMTIsMSxhLGIsYyxkKX1cbmZ1bmN0aW9uIEZiKGEpe2lmKEQpcmV0dXJuIFAoMTMsMSxhKX1mdW5jdGlvbiBHYihhLGIpe2lmKEQpcmV0dXJuIFAoMTQsMSxhLGIpfWZ1bmN0aW9uIEhiKGEsYixjKXtpZihEKXJldHVybiBQKDE1LDEsYSxiLGMpfXZhciBJYj1hPT57aWYobnVsbD09PWEpcmV0dXJuXCJudWxsXCI7dmFyIGI9dHlwZW9mIGE7cmV0dXJuXCJvYmplY3RcIj09PWJ8fFwiYXJyYXlcIj09PWJ8fFwiZnVuY3Rpb25cIj09PWI/YS50b1N0cmluZygpOlwiXCIrYX0sSmIsUj1hPT57Zm9yKHZhciBiPVwiXCI7dCgpW2E+Pj4wXTspYis9SmJbdCgpW2ErKz4+PjBdXTtyZXR1cm4gYn0sS2I9e30sTGI9e30sTWI9e30sUztcbmZ1bmN0aW9uIE5iKGEsYixjPXt9KXt2YXIgZD1iLm5hbWU7aWYoIWEpdGhyb3cgbmV3IFMoYHR5cGUgXCIke2R9XCIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcmApO2lmKExiLmhhc093blByb3BlcnR5KGEpKXtpZihjLktiKXJldHVybjt0aHJvdyBuZXcgUyhgQ2Fubm90IHJlZ2lzdGVyIHR5cGUgJyR7ZH0nIHR3aWNlYCk7fUxiW2FdPWI7ZGVsZXRlIE1iW2FdO0tiLmhhc093blByb3BlcnR5KGEpJiYoYj1LYlthXSxkZWxldGUgS2JbYV0sYi5mb3JFYWNoKGU9PmUoKSkpfWZ1bmN0aW9uIFQoYSxiLGM9e30pe2lmKCEoXCJhcmdQYWNrQWR2YW5jZVwiaW4gYikpdGhyb3cgbmV3IFR5cGVFcnJvcihcInJlZ2lzdGVyVHlwZSByZWdpc3RlcmVkSW5zdGFuY2UgcmVxdWlyZXMgYXJnUGFja0FkdmFuY2VcIik7TmIoYSxiLGMpfVxudmFyIE9iPShhLGIsYyk9Pntzd2l0Y2goYil7Y2FzZSAxOnJldHVybiBjP2Q9PmcoKVtkPj4+MD4+PjBdOmQ9PnQoKVtkPj4+MD4+PjBdO2Nhc2UgMjpyZXR1cm4gYz9kPT5iYSgpW2Q+Pj4xPj4+MF06ZD0+ZGEoKVtkPj4+MT4+PjBdO2Nhc2UgNDpyZXR1cm4gYz9kPT52KClbZD4+PjI+Pj4wXTpkPT53KClbZD4+PjI+Pj4wXTtjYXNlIDg6cmV0dXJuIGM/ZD0+SFtkPj4+M106ZD0+RGFbZD4+PjNdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke2J9KTogJHthfWApO319O2Z1bmN0aW9uIFBiKCl7dGhpcy5tYj1bdm9pZCAwXTt0aGlzLkFiPVtdfXZhciBVPW5ldyBQYjtmdW5jdGlvbiBRYihhKXthPj4+PTA7YT49VS50YiYmMD09PS0tVS5nZXQoYSkuQ2ImJlUueWIoYSl9XG52YXIgVj1hPT57aWYoIWEpdGhyb3cgbmV3IFMoXCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSBcIithKTtyZXR1cm4gVS5nZXQoYSkudmFsdWV9LFc9YT0+e3N3aXRjaChhKXtjYXNlIHZvaWQgMDpyZXR1cm4gMTtjYXNlIG51bGw6cmV0dXJuIDI7Y2FzZSAhMDpyZXR1cm4gMztjYXNlICExOnJldHVybiA0O2RlZmF1bHQ6cmV0dXJuIFUueGIoe0NiOjEsdmFsdWU6YX0pfX07ZnVuY3Rpb24gUmIoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKHYoKVthPj4+Mj4+PjBdKX1cbnZhciBTYj0oYSxiKT0+e3N3aXRjaChiKXtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKGMpe3ZhciBkPXRoaXMuZnJvbVdpcmVUeXBlO20uYnVmZmVyIT1wLmJ1ZmZlciYmcSgpO3JldHVybiBkLmNhbGwodGhpcyxDYVtjPj4+Mj4+PjBdKX07Y2FzZSA4OnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUoaWEoKVtjPj4+Mz4+PjBdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke2J9KTogJHthfWApO319O2Z1bmN0aW9uIFRiKGEpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZSh3KClbYT4+PjI+Pj4wXSl9XG52YXIgVWI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0Zi0xNmxlXCIpOnZvaWQgMCxWYj0oYSxiKT0+e3ZhciBjPWE+PjE7Zm9yKHZhciBkPWMrYi8yOyEoYz49ZCkmJmRhKClbYz4+PjBdOykrK2M7Yzw8PTE7aWYoMzI8Yy1hJiZVYilyZXR1cm4gVWIuZGVjb2RlKHQoKS5zbGljZShhLGMpKTtjPVwiXCI7Zm9yKGQ9MDshKGQ+PWIvMik7KytkKXt2YXIgZT1iYSgpW2ErMipkPj4+MT4+PjBdO2lmKDA9PWUpYnJlYWs7Yys9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gY30sV2I9KGEsYixjKT0+e2M/Pz0yMTQ3NDgzNjQ3O2lmKDI+YylyZXR1cm4gMDtjLT0yO3ZhciBkPWI7Yz1jPDIqYS5sZW5ndGg/Yy8yOmEubGVuZ3RoO2Zvcih2YXIgZT0wO2U8YzsrK2Upe3ZhciBmPWEuY2hhckNvZGVBdChlKTtiYSgpW2I+Pj4xPj4+MF09ZjtiKz0yfWJhKClbYj4+PjE+Pj4wXT0wO3JldHVybiBiLWR9LFhiPWE9PjIqYS5sZW5ndGgsWWI9KGEsYik9Plxue2Zvcih2YXIgYz0wLGQ9XCJcIjshKGM+PWIvNCk7KXt2YXIgZT12KClbYSs0KmM+Pj4yPj4+MF07aWYoMD09ZSlicmVhazsrK2M7NjU1MzY8PWU/KGUtPTY1NTM2LGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8ZT4+MTAsNTYzMjB8ZSYxMDIzKSk6ZCs9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gZH0sWmI9KGEsYixjKT0+e2I+Pj49MDtjPz89MjE0NzQ4MzY0NztpZig0PmMpcmV0dXJuIDA7dmFyIGQ9YjtjPWQrYy00O2Zvcih2YXIgZT0wO2U8YS5sZW5ndGg7KytlKXt2YXIgZj1hLmNoYXJDb2RlQXQoZSk7aWYoNTUyOTY8PWYmJjU3MzQzPj1mKXt2YXIgaz1hLmNoYXJDb2RlQXQoKytlKTtmPTY1NTM2KygoZiYxMDIzKTw8MTApfGsmMTAyM312KClbYj4+PjI+Pj4wXT1mO2IrPTQ7aWYoYis0PmMpYnJlYWt9digpW2I+Pj4yPj4+MF09MDtyZXR1cm4gYi1kfSwkYj1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7NTUyOTY8PVxuZCYmNTczNDM+PWQmJisrYztiKz00fXJldHVybiBifTtmdW5jdGlvbiBhYyhhKXthPj4+PTA7XCJmdW5jdGlvblwiPT09dHlwZW9mIEF0b21pY3MuVmImJihBdG9taWNzLlZiKHYoKSxhPj4+MixhKS52YWx1ZS50aGVuKGhiKSxhKz0xMjgsQXRvbWljcy5zdG9yZSh2KCksYT4+PjIsMSkpfXouX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0PWFjO3ZhciBoYj0oKT0+e3ZhciBhPWdiKCk7aWYoYSYmKGFjKGEpLGE9YmMsIUJhKSl0cnl7aWYoYSgpLCEoMDxPKSl0cnl7RD9tYihHKTpjYihHKX1jYXRjaChiKXtiIGluc3RhbmNlb2YgUWF8fFwidW53aW5kXCI9PWJ8fG9hKDEsYil9fWNhdGNoKGIpe2IgaW5zdGFuY2VvZiBRYXx8XCJ1bndpbmRcIj09Ynx8b2EoMSxiKX19O3ouY2hlY2tNYWlsYm94PWhiO1xudmFyIGNjPVtdLGVjPShhLGIpPT57dmFyIGM9TGJbYV07aWYodm9pZCAwPT09Yyl0aHJvdyBhPWRjKGEpLGM9UihhKSxYKGEpLG5ldyBTKGIrXCIgaGFzIHVua25vd24gdHlwZSBcIitjKTtyZXR1cm4gY30sZmM9KGEsYixjKT0+e3ZhciBkPVtdO2E9YS50b1dpcmVUeXBlKGQsYyk7ZC5sZW5ndGgmJih3KClbYj4+PjI+Pj4wXT1XKGQpKTtyZXR1cm4gYX0sZ2M9W10saGM9e30saWM9YT0+e3ZhciBiPWhjW2FdO3JldHVybiB2b2lkIDA9PT1iP1IoYSk6Yn0samM9KCk9Plwib2JqZWN0XCI9PXR5cGVvZiBnbG9iYWxUaGlzP2dsb2JhbFRoaXM6RnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpLGtjPWE9Pnt2YXIgYj1nYy5sZW5ndGg7Z2MucHVzaChhKTtyZXR1cm4gYn0sbGM9KGEsYik9Pntmb3IodmFyIGM9QXJyYXkoYSksZD0wO2Q8YTsrK2QpY1tkXT1lYyh3KClbYis0KmQ+Pj4yPj4+MF0sXCJwYXJhbWV0ZXIgXCIrZCk7cmV0dXJuIGN9LG5jPShhLGIpPT5PYmplY3QuZGVmaW5lUHJvcGVydHkoYixcblwibmFtZVwiLHt2YWx1ZTphfSk7ZnVuY3Rpb24gb2MoYSl7dmFyIGI9RnVuY3Rpb247aWYoIShiIGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBifSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApO3ZhciBjPW5jKGIubmFtZXx8XCJ1bmtub3duRnVuY3Rpb25OYW1lXCIsZnVuY3Rpb24oKXt9KTtjLnByb3RvdHlwZT1iLnByb3RvdHlwZTtjPW5ldyBjO2E9Yi5hcHBseShjLGEpO3JldHVybiBhIGluc3RhbmNlb2YgT2JqZWN0P2E6Y312YXIgWT1hPT4wPT09YSU0JiYoMCE9PWElMTAwfHwwPT09YSU0MDApLHBjPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHFjPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdO2Z1bmN0aW9uIHJjKGEsYixjLGQsZSxmLGspe3JldHVybiBEP1AoMTYsMSxhLGIsYyxkLGUsZixrKTotNTJ9XG5mdW5jdGlvbiBzYyhhLGIsYyxkLGUsZil7aWYoRClyZXR1cm4gUCgxNywxLGEsYixjLGQsZSxmKX12YXIgdWM9YT0+e3ZhciBiPXViKGEpKzEsYz10YyhiKTtjJiZ3YihhLGMsYik7cmV0dXJuIGN9LHZjPVtdLHdjPXt9LHljPSgpPT57aWYoIXhjKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpuYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIHdjKXZvaWQgMD09PXdjW2JdP2RlbGV0ZSBhW2JdOmFbYl09d2NbYl07dmFyIGM9W107Zm9yKGIgaW4gYSljLnB1c2goYCR7Yn09JHthW2JdfWApO3hjPWN9cmV0dXJuIHhjfSx4YztcbmZ1bmN0aW9uIHpjKGEsYil7aWYoRClyZXR1cm4gUCgxOCwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz0wO3ljKCkuZm9yRWFjaCgoZCxlKT0+e3ZhciBmPWIrYztlPXcoKVthKzQqZT4+PjI+Pj4wXT1mO2ZvcihmPTA7ZjxkLmxlbmd0aDsrK2YpZygpW2UrKz4+PjA+Pj4wXT1kLmNoYXJDb2RlQXQoZik7ZygpW2U+Pj4wPj4+MF09MDtjKz1kLmxlbmd0aCsxfSk7cmV0dXJuIDB9ZnVuY3Rpb24gQWMoYSxiKXtpZihEKXJldHVybiBQKDE5LDEsYSxiKTthPj4+PTA7Yj4+Pj0wO3ZhciBjPXljKCk7dygpW2E+Pj4yPj4+MF09Yy5sZW5ndGg7dmFyIGQ9MDtjLmZvckVhY2goZT0+ZCs9ZS5sZW5ndGgrMSk7dygpW2I+Pj4yPj4+MF09ZDtyZXR1cm4gMH1mdW5jdGlvbiBCYyhhKXtyZXR1cm4gRD9QKDIwLDEsYSk6NTJ9ZnVuY3Rpb24gQ2MoYSxiLGMsZCl7cmV0dXJuIEQ/UCgyMSwxLGEsYixjLGQpOjUyfVxuZnVuY3Rpb24gRGMoYSxiLGMsZCl7cmV0dXJuIEQ/UCgyMiwxLGEsYixjLGQpOjcwfXZhciBFYz1bbnVsbCxbXSxbXV07ZnVuY3Rpb24gRmMoYSxiLGMsZCl7aWYoRClyZXR1cm4gUCgyMywxLGEsYixjLGQpO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO2Zvcih2YXIgZT0wLGY9MDtmPGM7ZisrKXt2YXIgaz13KClbYj4+PjI+Pj4wXSxsPXcoKVtiKzQ+Pj4yPj4+MF07Yis9ODtmb3IodmFyIHI9MDtyPGw7cisrKXt2YXIgbj10KClbaytyPj4+MF0seD1FY1thXTswPT09bnx8MTA9PT1uPygoMT09PWE/eWE6RikoVmEoeCwwKSkseC5sZW5ndGg9MCk6eC5wdXNoKG4pfWUrPWx9dygpW2Q+Pj4yPj4+MF09ZTtyZXR1cm4gMH12YXIgR2M9WzMxLDI5LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXSxIYz1bMzEsMjgsMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdO2Z1bmN0aW9uIEljKGEpe3ZhciBiPUFycmF5KHViKGEpKzEpO3ZiKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbnZhciBKYz0oYSxiKT0+e2coKS5zZXQoYSxiPj4+MCl9O1xuZnVuY3Rpb24gS2MoYSxiLGMsZCl7ZnVuY3Rpb24gZShoLHUseSl7Zm9yKGg9XCJudW1iZXJcIj09dHlwZW9mIGg/aC50b1N0cmluZygpOmh8fFwiXCI7aC5sZW5ndGg8dTspaD15WzBdK2g7cmV0dXJuIGh9ZnVuY3Rpb24gZihoLHUpe3JldHVybiBlKGgsdSxcIjBcIil9ZnVuY3Rpb24gayhoLHUpe2Z1bmN0aW9uIHkobWMpe3JldHVybiAwPm1jPy0xOjA8bWM/MTowfXZhciBROzA9PT0oUT15KGguZ2V0RnVsbFllYXIoKS11LmdldEZ1bGxZZWFyKCkpKSYmMD09PShRPXkoaC5nZXRNb250aCgpLXUuZ2V0TW9udGgoKSkpJiYoUT15KGguZ2V0RGF0ZSgpLXUuZ2V0RGF0ZSgpKSk7cmV0dXJuIFF9ZnVuY3Rpb24gbChoKXtzd2l0Y2goaC5nZXREYXkoKSl7Y2FzZSAwOnJldHVybiBuZXcgRGF0ZShoLmdldEZ1bGxZZWFyKCktMSwxMSwyOSk7Y2FzZSAxOnJldHVybiBoO2Nhc2UgMjpyZXR1cm4gbmV3IERhdGUoaC5nZXRGdWxsWWVhcigpLDAsMyk7Y2FzZSAzOnJldHVybiBuZXcgRGF0ZShoLmdldEZ1bGxZZWFyKCksXG4wLDIpO2Nhc2UgNDpyZXR1cm4gbmV3IERhdGUoaC5nZXRGdWxsWWVhcigpLDAsMSk7Y2FzZSA1OnJldHVybiBuZXcgRGF0ZShoLmdldEZ1bGxZZWFyKCktMSwxMSwzMSk7Y2FzZSA2OnJldHVybiBuZXcgRGF0ZShoLmdldEZ1bGxZZWFyKCktMSwxMSwzMCl9fWZ1bmN0aW9uIHIoaCl7dmFyIHU9aC5xYjtmb3IoaD1uZXcgRGF0ZSgobmV3IERhdGUoaC5yYisxOTAwLDAsMSkpLmdldFRpbWUoKSk7MDx1Oyl7dmFyIHk9aC5nZXRNb250aCgpLFE9KFkoaC5nZXRGdWxsWWVhcigpKT9HYzpIYylbeV07aWYodT5RLWguZ2V0RGF0ZSgpKXUtPVEtaC5nZXREYXRlKCkrMSxoLnNldERhdGUoMSksMTE+eT9oLnNldE1vbnRoKHkrMSk6KGguc2V0TW9udGgoMCksaC5zZXRGdWxsWWVhcihoLmdldEZ1bGxZZWFyKCkrMSkpO2Vsc2V7aC5zZXREYXRlKGguZ2V0RGF0ZSgpK3UpO2JyZWFrfX15PW5ldyBEYXRlKGguZ2V0RnVsbFllYXIoKSsxLDAsNCk7dT1sKG5ldyBEYXRlKGguZ2V0RnVsbFllYXIoKSxcbjAsNCkpO3k9bCh5KTtyZXR1cm4gMD49ayh1LGgpPzA+PWsoeSxoKT9oLmdldEZ1bGxZZWFyKCkrMTpoLmdldEZ1bGxZZWFyKCk6aC5nZXRGdWxsWWVhcigpLTF9YT4+Pj0wO2I+Pj49MDtjPj4+PTA7ZD4+Pj0wO3ZhciBuPXcoKVtkKzQwPj4+Mj4+PjBdO2Q9e1NiOnYoKVtkPj4+Mj4+PjBdLFJiOnYoKVtkKzQ+Pj4yPj4+MF0sdWI6digpW2QrOD4+PjI+Pj4wXSx6Yjp2KClbZCsxMj4+PjI+Pj4wXSx2Yjp2KClbZCsxNj4+PjI+Pj4wXSxyYjp2KClbZCsyMD4+PjI+Pj4wXSxsYjp2KClbZCsyND4+PjI+Pj4wXSxxYjp2KClbZCsyOD4+PjI+Pj4wXSxZYjp2KClbZCszMj4+PjI+Pj4wXSxRYjp2KClbZCszNj4+PjI+Pj4wXSxUYjpuP0wobik6XCJcIn07Yz1MKGMpO249e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcblwiJVhcIjpcIiVIOiVNOiVTXCIsXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgeCBpbiBuKWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeCxcImdcIiksblt4XSk7dmFyIEM9XCJTdW5kYXkgTW9uZGF5IFR1ZXNkYXkgV2VkbmVzZGF5IFRodXJzZGF5IEZyaWRheSBTYXR1cmRheVwiLnNwbGl0KFwiIFwiKSxOPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTtuPXtcIiVhXCI6aD0+Q1toLmxiXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6aD0+XG5DW2gubGJdLFwiJWJcIjpoPT5OW2gudmJdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpoPT5OW2gudmJdLFwiJUNcIjpoPT5mKChoLnJiKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpoPT5mKGguemIsMiksXCIlZVwiOmg9PmUoaC56YiwyLFwiIFwiKSxcIiVnXCI6aD0+cihoKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6aD0+cihoKSxcIiVIXCI6aD0+ZihoLnViLDIpLFwiJUlcIjpoPT57aD1oLnViOzA9PWg/aD0xMjoxMjxoJiYoaC09MTIpO3JldHVybiBmKGgsMil9LFwiJWpcIjpoPT57Zm9yKHZhciB1PTAseT0wO3k8PWgudmItMTt1Kz0oWShoLnJiKzE5MDApP0djOkhjKVt5KytdKTtyZXR1cm4gZihoLnpiK3UsMyl9LFwiJW1cIjpoPT5mKGgudmIrMSwyKSxcIiVNXCI6aD0+ZihoLlJiLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6aD0+MDw9aC51YiYmMTI+aC51Yj9cIkFNXCI6XCJQTVwiLFwiJVNcIjpoPT5mKGguU2IsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpoPT5oLmxifHw3LFwiJVVcIjpoPT5mKE1hdGguZmxvb3IoKGgucWIrNy1oLmxiKS9cbjcpLDIpLFwiJVZcIjpoPT57dmFyIHU9TWF0aC5mbG9vcigoaC5xYis3LShoLmxiKzYpJTcpLzcpOzI+PShoLmxiKzM3MS1oLnFiLTIpJTcmJnUrKztpZih1KTUzPT11JiYoeT0oaC5sYiszNzEtaC5xYiklNyw0PT15fHwzPT15JiZZKGgucmIpfHwodT0xKSk7ZWxzZXt1PTUyO3ZhciB5PShoLmxiKzctaC5xYi0xKSU3Oyg0PT15fHw1PT15JiZZKGgucmIlNDAwLTEpKSYmdSsrfXJldHVybiBmKHUsMil9LFwiJXdcIjpoPT5oLmxiLFwiJVdcIjpoPT5mKE1hdGguZmxvb3IoKGgucWIrNy0oaC5sYis2KSU3KS83KSwyKSxcIiV5XCI6aD0+KGgucmIrMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmg9PmgucmIrMTkwMCxcIiV6XCI6aD0+e2g9aC5RYjt2YXIgdT0wPD1oO2g9TWF0aC5hYnMoaCkvNjA7cmV0dXJuKHU/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoaC82MCoxMDAraCU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmg9PmguVGIsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO1xuZm9yKHggaW4gbiljLmluY2x1ZGVzKHgpJiYoYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh4LFwiZ1wiKSxuW3hdKGQpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt4PUljKGMpO2lmKHgubGVuZ3RoPmIpcmV0dXJuIDA7SmMoeCxhKTtyZXR1cm4geC5sZW5ndGgtMX1NLndiKCk7Zm9yKHZhciBMYz1BcnJheSgyNTYpLE1jPTA7MjU2Pk1jOysrTWMpTGNbTWNdPVN0cmluZy5mcm9tQ2hhckNvZGUoTWMpO0piPUxjO1M9ei5CaW5kaW5nRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihhKXtzdXBlcihhKTt0aGlzLm5hbWU9XCJCaW5kaW5nRXJyb3JcIn19O3ouSW50ZXJuYWxFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkludGVybmFsRXJyb3JcIn19O1xuT2JqZWN0LmFzc2lnbihQYi5wcm90b3R5cGUse2dldChhKXtyZXR1cm4gdGhpcy5tYlthXX0saGFzKGEpe3JldHVybiB2b2lkIDAhPT10aGlzLm1iW2FdfSx4YihhKXt2YXIgYj10aGlzLkFiLnBvcCgpfHx0aGlzLm1iLmxlbmd0aDt0aGlzLm1iW2JdPWE7cmV0dXJuIGJ9LHliKGEpe3RoaXMubWJbYV09dm9pZCAwO3RoaXMuQWIucHVzaChhKX19KTtVLm1iLnB1c2goe3ZhbHVlOnZvaWQgMH0se3ZhbHVlOm51bGx9LHt2YWx1ZTohMH0se3ZhbHVlOiExfSk7VS50Yj1VLm1iLmxlbmd0aDt6LmNvdW50X2VtdmFsX2hhbmRsZXM9KCk9Pntmb3IodmFyIGE9MCxiPVUudGI7YjxVLm1iLmxlbmd0aDsrK2Ipdm9pZCAwIT09VS5tYltiXSYmKythO3JldHVybiBhfTtcbnZhciBOYz1bYWIsYmIscWIsc2IsdGIseGIseWIsemIsQWIsQmIsQ2IsRGIsRWIsRmIsR2IsSGIscmMsc2MsemMsQWMsQmMsQ2MsRGMsRmNdLFFjPXtiOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBuYihhKSkud2IoYj4+PjAsYz4+PjApO29iPWE7cGIrKzt0aHJvdyBvYjt9LGRhOmZ1bmN0aW9uKGEpe09jKGE+Pj4wLCFBLDEsIXBhLDEzMTA3MiwhMSk7TS5GYigpfSxEOmZ1bmN0aW9uKGEpe2E+Pj49MDtEP3Bvc3RNZXNzYWdlKHtjbWQ6XCJjbGVhbnVwVGhyZWFkXCIsdGhyZWFkOmF9KTpNLkRiKE0ua2JbYV0pfSxWOnJiLHg6c2Isa2E6dGIsUjp4YixUOnliLEs6emIsaWE6QWIsYWE6QmIsZ2E6Q2IsRjpEYixTOkViLFA6RmIsamE6R2IsUTpIYixJOmZ1bmN0aW9uKGEsYixjLGQsZSl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7Yj1SKGIpO3ZhciBmPS0xIT1iLmluZGV4T2YoXCJ1XCIpO2YmJihlPSgxbjw8NjRuKS0xbik7VChhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOms9PmssdG9XaXJlVHlwZTpmdW5jdGlvbihrLFxubCl7aWYoXCJiaWdpbnRcIiE9dHlwZW9mIGwmJlwibnVtYmVyXCIhPXR5cGVvZiBsKXRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBjb252ZXJ0IFwiJHtJYihsKX1cIiB0byAke3RoaXMubmFtZX1gKTtpZihsPGR8fGw+ZSl0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXNzaW5nIGEgbnVtYmVyIFwiJHtJYihsKX1cIiBmcm9tIEpTIHNpZGUgdG8gQy9DKysgc2lkZSB0byBhbiBhcmd1bWVudCBvZiB0eXBlIFwiJHtifVwiLCB3aGljaCBpcyBvdXRzaWRlIHRoZSB2YWxpZCByYW5nZSBbJHtkfSwgJHtlfV0hYCk7cmV0dXJuIGx9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6T2IoYixjLCFmKSxzYjpudWxsfSl9LHBhOmZ1bmN0aW9uKGEsYixjLGQpe2E+Pj49MDtiPVIoYj4+PjApO1QoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTpmdW5jdGlvbihlKXtyZXR1cm4hIWV9LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZSxmKXtyZXR1cm4gZj9jOmR9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKHQoKVtlPj4+XG4wXSl9LHNiOm51bGx9KX0sb2E6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj1SKGI+Pj4wKTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6Yz0+e3ZhciBkPVYoYyk7UWIoYyk7cmV0dXJuIGR9LHRvV2lyZVR5cGU6KGMsZCk9PlcoZCksYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpSYixzYjpudWxsfSl9LEg6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDtjPj4+PTA7Yj1SKGI+Pj4wKTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZD0+ZCx0b1dpcmVUeXBlOihkLGUpPT5lLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6U2IoYixjKSxzYjpudWxsfSl9LHU6ZnVuY3Rpb24oYSxiLGMsZCxlKXthPj4+PTA7Yz4+Pj0wO2I9UihiPj4+MCk7LTE9PT1lJiYoZT00Mjk0OTY3Mjk1KTtlPWw9Pmw7aWYoMD09PWQpe3ZhciBmPTMyLTgqYztlPWw9Pmw8PGY+Pj5mfXZhciBrPWIuaW5jbHVkZXMoXCJ1bnNpZ25lZFwiKT9mdW5jdGlvbihsLHIpe3JldHVybiByPj4+MH06XG5mdW5jdGlvbihsLHIpe3JldHVybiByfTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZSx0b1dpcmVUeXBlOmssYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpPYihiLGMsMCE9PWQpLHNiOm51bGx9KX0sbjpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChmKXt2YXIgaz13KClbZj4+PjI+Pj4wXTtmPXcoKVtmKzQ+Pj4yPj4+MF07cmV0dXJuIG5ldyBlKGcoKS5idWZmZXIsZixrKX1hPj4+PTA7dmFyIGU9W0ludDhBcnJheSxVaW50OEFycmF5LEludDE2QXJyYXksVWludDE2QXJyYXksSW50MzJBcnJheSxVaW50MzJBcnJheSxGbG9hdDMyQXJyYXksRmxvYXQ2NEFycmF5LEJpZ0ludDY0QXJyYXksQmlnVWludDY0QXJyYXldW2JdO2M9UihjPj4+MCk7VChhLHtuYW1lOmMsZnJvbVdpcmVUeXBlOmQsYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpkfSx7S2I6ITB9KX0sSjpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPVIoYj4+PjApO3ZhciBjPVwic3RkOjpzdHJpbmdcIj09PVxuYjtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZCl7dmFyIGU9dygpW2Q+Pj4yPj4+MF0sZj1kKzQ7aWYoYylmb3IodmFyIGs9ZixsPTA7bDw9ZTsrK2wpe3ZhciByPWYrbDtpZihsPT1lfHwwPT10KClbcj4+PjBdKXtrPUwoayxyLWspO2lmKHZvaWQgMD09PW4pdmFyIG49aztlbHNlIG4rPVN0cmluZy5mcm9tQ2hhckNvZGUoMCksbis9aztrPXIrMX19ZWxzZXtuPUFycmF5KGUpO2ZvcihsPTA7bDxlOysrbCluW2xdPVN0cmluZy5mcm9tQ2hhckNvZGUodCgpW2YrbD4+PjBdKTtuPW4uam9pbihcIlwiKX1YKGQpO3JldHVybiBufSx0b1dpcmVUeXBlOmZ1bmN0aW9uKGQsZSl7ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyJiYoZT1uZXcgVWludDhBcnJheShlKSk7dmFyIGY9XCJzdHJpbmdcIj09dHlwZW9mIGU7aWYoIShmfHxlIGluc3RhbmNlb2YgVWludDhBcnJheXx8ZSBpbnN0YW5jZW9mIFVpbnQ4Q2xhbXBlZEFycmF5fHxlIGluc3RhbmNlb2YgSW50OEFycmF5KSl0aHJvdyBuZXcgUyhcIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmdcIik7XG52YXIgaz1jJiZmP3ViKGUpOmUubGVuZ3RoO3ZhciBsPXRjKDQraysxKSxyPWwrNDt3KClbbD4+PjI+Pj4wXT1rO2lmKGMmJmYpd2IoZSxyLGsrMSk7ZWxzZSBpZihmKWZvcihmPTA7ZjxrOysrZil7dmFyIG49ZS5jaGFyQ29kZUF0KGYpO2lmKDI1NTxuKXRocm93IFgociksbmV3IFMoXCJTdHJpbmcgaGFzIFVURi0xNiBjb2RlIHVuaXRzIHRoYXQgZG8gbm90IGZpdCBpbiA4IGJpdHNcIik7dCgpW3IrZj4+PjBdPW59ZWxzZSBmb3IoZj0wO2Y8azsrK2YpdCgpW3IrZj4+PjBdPWVbZl07bnVsbCE9PWQmJmQucHVzaChYLGwpO3JldHVybiBsfSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlRiLHNiKGQpe1goZCl9fSl9LHo6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO2M9UihjKTtpZigyPT09Yil7dmFyIGQ9VmI7dmFyIGU9V2I7dmFyIGY9WGI7dmFyIGs9KCk9PmRhKCk7dmFyIGw9MX1lbHNlIDQ9PT1iJiYoZD1ZYixlPVpiLGY9JGIsaz0oKT0+dygpLFxubD0yKTtUKGEse25hbWU6Yyxmcm9tV2lyZVR5cGU6cj0+e2Zvcih2YXIgbj13KClbcj4+PjI+Pj4wXSx4PWsoKSxDLE49cis0LGg9MDtoPD1uOysraCl7dmFyIHU9cis0K2gqYjtpZihoPT1ufHwwPT14W3U+Pj5sXSlOPWQoTix1LU4pLHZvaWQgMD09PUM/Qz1OOihDKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLEMrPU4pLE49dStifVgocik7cmV0dXJuIEN9LHRvV2lyZVR5cGU6KHIsbik9PntpZihcInN0cmluZ1wiIT10eXBlb2Ygbil0aHJvdyBuZXcgUyhgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHtjfWApO3ZhciB4PWYobiksQz10Yyg0K3grYik7dygpW0M+Pj4yXT14Pj5sO2UobixDKzQseCtiKTtudWxsIT09ciYmci5wdXNoKFgsQyk7cmV0dXJuIEN9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6UmIsc2Iocil7WChyKX19KX0scWE6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj1SKGI+Pj4wKTtUKGEse0xiOiEwLG5hbWU6YixhcmdQYWNrQWR2YW5jZTowLFxuZnJvbVdpcmVUeXBlOigpPT57fSx0b1dpcmVUeXBlOigpPT57fX0pfSxuYTooKT0+MSxOOmZ1bmN0aW9uKGEsYil7YT4+Pj0wO2E9PWI+Pj4wP3NldFRpbWVvdXQoKCk9PmhiKCkpOkQ/cG9zdE1lc3NhZ2Uoe3RhcmdldFRocmVhZDphLGNtZDpcImNoZWNrTWFpbGJveFwifSk6KGE9TS5rYlthXSkmJmEucG9zdE1lc3NhZ2Uoe2NtZDpcImNoZWNrTWFpbGJveFwifSl9LFc6ZnVuY3Rpb24oYSxiLGMsZCl7Yj4+Pj0wO2MvPTI7Y2MubGVuZ3RoPWM7ZD1kPj4+MD4+PjM7Zm9yKHZhciBlPTA7ZTxjO2UrKyljY1tlXT1IW2QrMiplXT9IW2QrMiplKzFdOmlhKClbZCsyKmUrMT4+PjBdO2E9MD5hP1BhWy1hLTFdOk5jW2FdO00uSmI9YjtiPWEuYXBwbHkobnVsbCxjYyk7TS5KYj0wO3JldHVybiBifSxjYTphYyxtYTpmdW5jdGlvbihhKXtCJiZNLmtiW2E+Pj4wXS5yZWYoKX0sczpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDthPVYoYT4+PjApO2I9ZWMoYixcImVtdmFsOjphc1wiKTtyZXR1cm4gZmMoYixcbmMsYSl9LG86ZnVuY3Rpb24oYSxiLGMsZCl7Yz4+Pj0wO2Q+Pj49MDthPWdjW2E+Pj4wXTtiPVYoYj4+PjApO3JldHVybiBhKG51bGwsYixjLGQpfSxqOmZ1bmN0aW9uKGEsYixjLGQsZSl7Yz4+Pj0wO2Q+Pj49MDtlPj4+PTA7YT1nY1thPj4+MF07Yj1WKGI+Pj4wKTtjPWljKGMpO3JldHVybiBhKGIsYltjXSxkLGUpfSxjOlFiLEE6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1WKGE+Pj4wKTtiPVYoYik7cmV0dXJuIGE9PWJ9LG06ZnVuY3Rpb24oYSl7YT4+Pj0wO2lmKDA9PT1hKXJldHVybiBXKGpjKCkpO2E9aWMoYSk7cmV0dXJuIFcoamMoKVthXSl9LGk6ZnVuY3Rpb24oYSxiLGMpe2I9bGMoYSxiPj4+MCk7dmFyIGQ9Yi5zaGlmdCgpO2EtLTt2YXIgZT1cInJldHVybiBmdW5jdGlvbiAob2JqLCBmdW5jLCBkZXN0cnVjdG9yc1JlZiwgYXJncykge1xcblwiLGY9MCxrPVtdOzA9PT1jJiZrLnB1c2goXCJvYmpcIik7Zm9yKHZhciBsPVtcInJldFR5cGVcIl0scj1bZF0sbj0wO248YTsrK24pay5wdXNoKFwiYXJnXCIrXG5uKSxsLnB1c2goXCJhcmdUeXBlXCIrbiksci5wdXNoKGJbbl0pLGUrPWAgIHZhciBhcmcke259ID0gYXJnVHlwZSR7bn0ucmVhZFZhbHVlRnJvbVBvaW50ZXIoYXJncyR7Zj9cIitcIitmOlwiXCJ9KTtcXG5gLGYrPWJbbl0uYXJnUGFja0FkdmFuY2U7ZSs9YCAgdmFyIHJ2ID0gJHsxPT09Yz9cIm5ldyBmdW5jXCI6XCJmdW5jLmNhbGxcIn0oJHtrLmpvaW4oXCIsIFwiKX0pO1xcbmA7Zm9yKG49MDtuPGE7KytuKWJbbl0uZGVsZXRlT2JqZWN0JiYoZSs9YCAgYXJnVHlwZSR7bn0uZGVsZXRlT2JqZWN0KGFyZyR7bn0pO1xcbmApO2QuTGJ8fChsLnB1c2goXCJlbXZhbF9yZXR1cm5WYWx1ZVwiKSxyLnB1c2goZmMpLGUrPVwiICByZXR1cm4gZW12YWxfcmV0dXJuVmFsdWUocmV0VHlwZSwgZGVzdHJ1Y3RvcnNSZWYsIHJ2KTtcXG5cIik7bC5wdXNoKGUrXCJ9O1xcblwiKTthPW9jKGwpLmFwcGx5KG51bGwscik7Yz1gbWV0aG9kQ2FsbGVyPCgke2IubWFwKHg9PngubmFtZSkuam9pbihcIiwgXCIpfSkgPT4gJHtkLm5hbWV9PmA7cmV0dXJuIGtjKG5jKGMsXG5hKSl9LHI6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1WKGE+Pj4wKTtiPVYoYik7cmV0dXJuIFcoYVtiXSl9LGQ6ZnVuY3Rpb24oYSl7YT4+Pj0wOzQ8YSYmKFUuZ2V0KGEpLkNiKz0xKX0sdjpmdW5jdGlvbigpe3JldHVybiBXKFtdKX0sbDpmdW5jdGlvbihhKXthPVYoYT4+PjApO2Zvcih2YXIgYj1BcnJheShhLmxlbmd0aCksYz0wO2M8YS5sZW5ndGg7YysrKWJbY109YVtjXTtyZXR1cm4gVyhiKX0sZjpmdW5jdGlvbihhKXtyZXR1cm4gVyhpYyhhPj4+MCkpfSxrOmZ1bmN0aW9uKCl7cmV0dXJuIFcoe30pfSxoOmZ1bmN0aW9uKGEpe2E+Pj49MDtmb3IodmFyIGI9VihhKTtiLmxlbmd0aDspe3ZhciBjPWIucG9wKCk7Yi5wb3AoKShjKX1RYihhKX0sZzpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDthPVYoYT4+PjApO2I9VihiKTtjPVYoYyk7YVtiXT1jfSxlOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9ZWMoYT4+PjAsXCJfZW12YWxfdGFrZV92YWx1ZVwiKTthPWEucmVhZFZhbHVlRnJvbVBvaW50ZXIoYik7XG5yZXR1cm4gVyhhKX0sWjpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+YXx8OTAwNzE5OTI1NDc0MDk5MjxhP05hTjpOdW1iZXIoYSk7Yj4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3YoKVtiPj4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO3YoKVtiKzQ+Pj4yPj4+MF09YS5nZXRVVENNaW51dGVzKCk7digpW2IrOD4+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7digpW2IrMTI+Pj4yPj4+MF09YS5nZXRVVENEYXRlKCk7digpW2IrMTY+Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO3YoKVtiKzIwPj4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO3YoKVtiKzI0Pj4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7YT0oYS5nZXRUaW1lKCktRGF0ZS5VVEMoYS5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0RTV8MDt2KClbYisyOD4+PjI+Pj4wXT1hfSxfOmZ1bmN0aW9uKGEsYil7YT0tOTAwNzE5OTI1NDc0MDk5Mj5hfHw5MDA3MTk5MjU0NzQwOTkyPGE/TmFOOk51bWJlcihhKTtcbmI+Pj49MDthPW5ldyBEYXRlKDFFMyphKTt2KClbYj4+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTt2KClbYis0Pj4+Mj4+PjBdPWEuZ2V0TWludXRlcygpO3YoKVtiKzg+Pj4yPj4+MF09YS5nZXRIb3VycygpO3YoKVtiKzEyPj4+Mj4+PjBdPWEuZ2V0RGF0ZSgpO3YoKVtiKzE2Pj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTt2KClbYisyMD4+PjI+Pj4wXT1hLmdldEZ1bGxZZWFyKCktMTkwMDt2KClbYisyND4+PjI+Pj4wXT1hLmdldERheSgpO3ZhciBjPShZKGEuZ2V0RnVsbFllYXIoKSk/cGM6cWMpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO3YoKVtiKzI4Pj4+Mj4+PjBdPWM7digpW2IrMzY+Pj4yPj4+MF09LSg2MCphLmdldFRpbWV6b25lT2Zmc2V0KCkpO2M9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBkPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTthPShjIT1kJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PVxuTWF0aC5taW4oZCxjKSl8MDt2KClbYiszMj4+PjI+Pj4wXT1hfSwkOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uZXcgRGF0ZSh2KClbYSsyMD4+PjI+Pj4wXSsxOTAwLHYoKVthKzE2Pj4+Mj4+PjBdLHYoKVthKzEyPj4+Mj4+PjBdLHYoKVthKzg+Pj4yPj4+MF0sdigpW2ErND4+PjI+Pj4wXSx2KClbYT4+PjI+Pj4wXSwwKSxjPXYoKVthKzMyPj4+Mj4+PjBdLGQ9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGU9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGY9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oZixlKTswPmM/digpW2ErMzI+Pj4yPj4+MF09TnVtYmVyKGUhPWYmJms9PWQpOjA8YyE9KGs9PWQpJiYoZT1NYXRoLm1heChmLGUpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/azplKS1kKSkpO3YoKVthKzI0Pj4+Mj4+PjBdPWIuZ2V0RGF5KCk7Yz0oWShiLmdldEZ1bGxZZWFyKCkpP1xucGM6cWMpW2IuZ2V0TW9udGgoKV0rYi5nZXREYXRlKCktMXwwO3YoKVthKzI4Pj4+Mj4+PjBdPWM7digpW2E+Pj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7digpW2ErND4+PjI+Pj4wXT1iLmdldE1pbnV0ZXMoKTt2KClbYSs4Pj4+Mj4+PjBdPWIuZ2V0SG91cnMoKTt2KClbYSsxMj4+PjI+Pj4wXT1iLmdldERhdGUoKTt2KClbYSsxNj4+PjI+Pj4wXT1iLmdldE1vbnRoKCk7digpW2ErMjA+Pj4yPj4+MF09Yi5nZXRZZWFyKCk7YT1iLmdldFRpbWUoKTtpc05hTihhKT8odigpW1BjKCk+Pj4yPj4+MF09NjEsYT0tMSk6YS89MUUzO3JldHVybiBCaWdJbnQoYSl9LFg6cmMsWTpzYyxNOmZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKG4pe3JldHVybihuPW4udG9UaW1lU3RyaW5nKCkubWF0Y2goL1xcKChbQS1aYS16IF0rKVxcKSQvKSk/blsxXTpcIkdNVFwifWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO3ZhciBlPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxmPW5ldyBEYXRlKGUsMCwxKSxrPW5ldyBEYXRlKGUsXG42LDEpO2U9Zi5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBsPWsuZ2V0VGltZXpvbmVPZmZzZXQoKSxyPU1hdGgubWF4KGUsbCk7dygpW2E+Pj4yPj4+MF09NjAqcjt2KClbYj4+PjI+Pj4wXT1OdW1iZXIoZSE9bCk7YT1kKGYpO2I9ZChrKTthPXVjKGEpO2I9dWMoYik7bDxlPyh3KClbYz4+PjI+Pj4wXT1hLHcoKVtjKzQ+Pj4yPj4+MF09Yik6KHcoKVtjPj4+Mj4+PjBdPWIsdygpW2MrND4+PjI+Pj4wXT1hKX0scDooKT0+e3phKFwiXCIpfSxyYTpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wO2I+Pj49MDtjPj4+PTA7dmMubGVuZ3RoPTA7Zm9yKHZhciBkO2Q9dCgpW2IrKz4+PjBdOyl7dmFyIGU9MTA1IT1kO2UmPTExMiE9ZDtjKz1lJiZjJTg/NDowO3ZjLnB1c2goMTEyPT1kP3coKVtjPj4+Mj4+PjBdOjEwNj09ZD9IW2M+Pj4zXToxMDU9PWQ/digpW2M+Pj4yPj4+MF06aWEoKVtjPj4+Mz4+PjBdKTtjKz1lPzg6NH1yZXR1cm4gUGFbYV0uYXBwbHkobnVsbCx2Yyl9LEU6KCk9Pnt9LEc6KCk9PlxuRGF0ZS5ub3coKSxsYTooKT0+e08rPTE7dGhyb3dcInVud2luZFwiO30sTzpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSx0OigpPT5wZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpLHc6KCk9PkI/cmVxdWlyZShcIm9zXCIpLmNwdXMoKS5sZW5ndGg6bmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3ksTDpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9dCgpLmxlbmd0aDtpZihhPD1ifHw0Mjk0OTAxNzYwPGEpcmV0dXJuITE7Zm9yKHZhciBjPTE7ND49YztjKj0yKXt2YXIgZD1iKigxKy4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGU9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7ZT0oZS5taW4uY2FsbChlLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLW0uYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXttLmdyb3coZSk7cSgpO3ZhciBmPTE7YnJlYWsgYX1jYXRjaChrKXt9Zj12b2lkIDB9aWYoZilyZXR1cm4hMH1yZXR1cm4hMX0sXG5lYTp6YyxmYTpBYyxVOmNiLHk6QmMsQzpDYyxiYTpEYyxCOkZjLGE6bXx8ei53YXNtTWVtb3J5LGhhOktjLHE6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIEtjKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFo9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGMsZCl7Wj1jLmV4cG9ydHM7Wj1SYygpO00uR2IucHVzaChaLllhKTtsYj1aLiRhO0dhLnVuc2hpZnQoWi5zYSk7QWE9ZDtKYSgpO3JldHVybiBafXZhciBiPXthOlFjfTtJKys7aWYoei5pbnN0YW50aWF0ZVdhc20pdHJ5e3JldHVybiB6Lmluc3RhbnRpYXRlV2FzbShiLGEpfWNhdGNoKGMpe0YoYE1vZHVsZS5pbnN0YW50aWF0ZVdhc20gY2FsbGJhY2sgZmFpbGVkIHdpdGggZXJyb3I6ICR7Y31gKSxsYShjKX1PYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSxjLm1vZHVsZSl9KS5jYXRjaChsYSk7cmV0dXJue319KCk7ei5fT3J0SW5pdD0oYSxiKT0+KHouX09ydEluaXQ9Wi50YSkoYSxiKTtcbnouX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KHouX09ydEdldExhc3RFcnJvcj1aLnVhKShhLGIpO3ouX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxkLGUsZixrLGwscixuKT0+KHouX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPVoudmEpKGEsYixjLGQsZSxmLGssbCxyLG4pO3ouX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4oei5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9Wi53YSkoYSxiKTt6Ll9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGEsYixjKT0+KHouX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1aLnhhKShhLGIsYyk7ei5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9Pih6Ll9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9Wi55YSkoYSxiLGMpO3ouX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1hPT4oei5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPVouemEpKGEpO1xuei5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4oei5fT3J0Q3JlYXRlU2Vzc2lvbj1aLkFhKShhLGIsYyk7ei5fT3J0UmVsZWFzZVNlc3Npb249YT0+KHouX09ydFJlbGVhc2VTZXNzaW9uPVouQmEpKGEpO3ouX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KHouX09ydEdldElucHV0T3V0cHV0Q291bnQ9Wi5DYSkoYSxiLGMpO3ouX09ydEdldElucHV0TmFtZT0oYSxiKT0+KHouX09ydEdldElucHV0TmFtZT1aLkRhKShhLGIpO3ouX09ydEdldE91dHB1dE5hbWU9KGEsYik9Pih6Ll9PcnRHZXRPdXRwdXROYW1lPVouRWEpKGEsYik7ei5fT3J0RnJlZT1hPT4oei5fT3J0RnJlZT1aLkZhKShhKTt6Ll9PcnRDcmVhdGVUZW5zb3I9KGEsYixjLGQsZSxmKT0+KHouX09ydENyZWF0ZVRlbnNvcj1aLkdhKShhLGIsYyxkLGUsZik7ei5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZCxlKT0+KHouX09ydEdldFRlbnNvckRhdGE9Wi5IYSkoYSxiLGMsZCxlKTtcbnouX09ydFJlbGVhc2VUZW5zb3I9YT0+KHouX09ydFJlbGVhc2VUZW5zb3I9Wi5JYSkoYSk7ei5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZCk9Pih6Ll9PcnRDcmVhdGVSdW5PcHRpb25zPVouSmEpKGEsYixjLGQpO3ouX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9Pih6Ll9PcnRBZGRSdW5Db25maWdFbnRyeT1aLkthKShhLGIsYyk7ei5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KHouX09ydFJlbGVhc2VSdW5PcHRpb25zPVouTGEpKGEpO3ouX09ydENyZWF0ZUJpbmRpbmc9YT0+KHouX09ydENyZWF0ZUJpbmRpbmc9Wi5NYSkoYSk7ei5fT3J0QmluZElucHV0PShhLGIsYyk9Pih6Ll9PcnRCaW5kSW5wdXQ9Wi5OYSkoYSxiLGMpO3ouX09ydEJpbmRPdXRwdXQ9KGEsYixjLGQpPT4oei5fT3J0QmluZE91dHB1dD1aLk9hKShhLGIsYyxkKTt6Ll9PcnRDbGVhckJvdW5kT3V0cHV0cz1hPT4oei5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9Wi5QYSkoYSk7XG56Ll9PcnRSZWxlYXNlQmluZGluZz1hPT4oei5fT3J0UmVsZWFzZUJpbmRpbmc9Wi5RYSkoYSk7ei5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGQsZSk9Pih6Ll9PcnRSdW5XaXRoQmluZGluZz1aLlJhKShhLGIsYyxkLGUpO3ouX09ydFJ1bj0oYSxiLGMsZCxlLGYsayxsKT0+KHouX09ydFJ1bj1aLlNhKShhLGIsYyxkLGUsZixrLGwpO3ouX09ydEVuZFByb2ZpbGluZz1hPT4oei5fT3J0RW5kUHJvZmlsaW5nPVouVGEpKGEpO3ZhciBQYz0oKT0+KFBjPVouVWEpKCksZ2I9ei5fcHRocmVhZF9zZWxmPSgpPT4oZ2I9ei5fcHRocmVhZF9zZWxmPVouVmEpKCksdGM9ei5fbWFsbG9jPWE9Pih0Yz16Ll9tYWxsb2M9Wi5XYSkoYSksWD16Ll9mcmVlPWE9PihYPXouX2ZyZWU9Wi5YYSkoYSk7ei5fX2Vtc2NyaXB0ZW5fdGxzX2luaXQ9KCk9Pih6Ll9fZW1zY3JpcHRlbl90bHNfaW5pdD1aLllhKSgpO3ZhciBkYz1hPT4oZGM9Wi5aYSkoYSk7XG56Ll9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3M9KCk9Pih6Ll9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3M9Wi5fYSkoKTt2YXIgT2M9ei5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9KGEsYixjLGQsZSxmKT0+KE9jPXouX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PVouYWIpKGEsYixjLGQsZSxmKTt6Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD0oKT0+KHouX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPVouYmIpKCk7dmFyICRhPShhLGIsYyxkKT0+KCRhPVouY2IpKGEsYixjLGQpLGZiPWE9PihmYj1aLmRiKShhKSxtYj16Ll9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1hPT4obWI9ei5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9Wi5lYikoYSksYmM9KCk9PihiYz1aLmZiKSgpLGpiPShhLGIpPT4oamI9Wi5nYikoYSxiKSxXYT0oKT0+KFdhPVouaGIpKCksWGE9YT0+KFhhPVouaWIpKGEpLFphPWE9PihaYT1aLmpiKShhKTtcbmZ1bmN0aW9uIFJjKCl7dmFyIGE9WjthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5lPT5kKGUpPj4+MDthLlVhPWIoYS5VYSk7YS5WYT1iKGEuVmEpO2EuV2E9YyhhLldhKTthLlphPWMoYS5aYSk7YS5lbXNjcmlwdGVuX21haW5fcnVudGltZV90aHJlYWRfaWQ9YihhLmVtc2NyaXB0ZW5fbWFpbl9ydW50aW1lX3RocmVhZF9pZCk7YS5oYj1iKGEuaGIpO2EuamI9YyhhLmpiKTtyZXR1cm4gYX16Lndhc21NZW1vcnk9bTt6LnN0YWNrQWxsb2M9WmE7ei5zdGFja1NhdmU9V2E7ei5zdGFja1Jlc3RvcmU9WGE7ei5rZWVwUnVudGltZUFsaXZlPSgpPT4wPE87ei5VVEY4VG9TdHJpbmc9TDt6LnN0cmluZ1RvVVRGOD13Yjt6Lmxlbmd0aEJ5dGVzVVRGOD11Yjt6LkV4aXRTdGF0dXM9UWE7ei5QVGhyZWFkPU07dmFyIFNjO0o9ZnVuY3Rpb24gVGMoKXtTY3x8VWMoKTtTY3x8KEo9VGMpfTtcbmZ1bmN0aW9uIFVjKCl7aWYoISgwPEkpKWlmKEQpa2EoeiksRHx8aWIoR2EpLHN0YXJ0V29ya2VyKHopO2Vsc2V7aWYoei5wcmVSdW4pZm9yKFwiZnVuY3Rpb25cIj09dHlwZW9mIHoucHJlUnVuJiYoei5wcmVSdW49W3oucHJlUnVuXSk7ei5wcmVSdW4ubGVuZ3RoOylGYS51bnNoaWZ0KHoucHJlUnVuLnNoaWZ0KCkpO2liKEZhKTswPEl8fFNjfHwoU2M9ITAsei5jYWxsZWRSdW49ITAsQmF8fChEfHxpYihHYSksa2EoeiksRHx8aWIoSGEpKSl9fVVjKCk7XG5cblxuICByZXR1cm4gbW9kdWxlQXJnLnJlYWR5XG59XG4pO1xufSkoKTtcbjtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbVRocmVhZGVkO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc21UaHJlYWRlZCk7XG4iLCAiXCJ1c2Ugc3RyaWN0XCI7dmFyIE1vZHVsZT17fTt2YXIgRU5WSVJPTk1FTlRfSVNfTk9ERT10eXBlb2YgcHJvY2Vzcz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnM9PVwib2JqZWN0XCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGU9PVwic3RyaW5nXCI7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7dmFyIG5vZGVXb3JrZXJUaHJlYWRzPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTt2YXIgcGFyZW50UG9ydD1ub2RlV29ya2VyVGhyZWFkcy5wYXJlbnRQb3J0O3BhcmVudFBvcnQub24oXCJtZXNzYWdlXCIsZGF0YT0+b25tZXNzYWdlKHtkYXRhOmRhdGF9KSk7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKTt2YXIgdm09cmVxdWlyZShcInZtXCIpO09iamVjdC5hc3NpZ24oZ2xvYmFsLHtzZWxmOmdsb2JhbCxyZXF1aXJlOnJlcXVpcmUsTW9kdWxlOk1vZHVsZSxsb2NhdGlvbjp7aHJlZjpfX2ZpbGVuYW1lfSxXb3JrZXI6bm9kZVdvcmtlclRocmVhZHMuV29ya2VyLGltcG9ydFNjcmlwdHM6Zj0+dm0ucnVuSW5UaGlzQ29udGV4dChmcy5yZWFkRmlsZVN5bmMoZixcInV0ZjhcIikse2ZpbGVuYW1lOmZ9KSxwb3N0TWVzc2FnZTptc2c9PnBhcmVudFBvcnQucG9zdE1lc3NhZ2UobXNnKSxwZXJmb3JtYW5jZTpnbG9iYWwucGVyZm9ybWFuY2V8fHtub3c6RGF0ZS5ub3d9fSl9dmFyIGluaXRpYWxpemVkSlM9ZmFsc2U7ZnVuY3Rpb24gdGhyZWFkUHJpbnRFcnIoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO2lmKEVOVklST05NRU5UX0lTX05PREUpe2ZzLndyaXRlU3luYygyLHRleHQrXCJcXG5cIik7cmV0dXJufWNvbnNvbGUuZXJyb3IodGV4dCl9ZnVuY3Rpb24gdGhyZWFkQWxlcnQoKXt2YXIgdGV4dD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oXCIgXCIpO3Bvc3RNZXNzYWdlKHtjbWQ6XCJhbGVydFwiLHRleHQ6dGV4dCx0aHJlYWRJZDpNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCl9KX12YXIgZXJyPXRocmVhZFByaW50RXJyO3NlbGYuYWxlcnQ9dGhyZWFkQWxlcnQ7TW9kdWxlW1wiaW5zdGFudGlhdGVXYXNtXCJdPShpbmZvLHJlY2VpdmVJbnN0YW5jZSk9Pnt2YXIgbW9kdWxlPU1vZHVsZVtcIndhc21Nb2R1bGVcIl07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1udWxsO3ZhciBpbnN0YW5jZT1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobW9kdWxlLGluZm8pO3JldHVybiByZWNlaXZlSW5zdGFuY2UoaW5zdGFuY2UpfTtzZWxmLm9udW5oYW5kbGVkcmVqZWN0aW9uPWU9Pnt0aHJvdyBlLnJlYXNvbnx8ZX07ZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShlKXt0cnl7aWYoZS5kYXRhLmNtZD09PVwibG9hZFwiKXtsZXQgbWVzc2FnZVF1ZXVlPVtdO3NlbGYub25tZXNzYWdlPWU9Pm1lc3NhZ2VRdWV1ZS5wdXNoKGUpO3NlbGYuc3RhcnRXb3JrZXI9aW5zdGFuY2U9PntNb2R1bGU9aW5zdGFuY2U7cG9zdE1lc3NhZ2Uoe1wiY21kXCI6XCJsb2FkZWRcIn0pO2ZvcihsZXQgbXNnIG9mIG1lc3NhZ2VRdWV1ZSl7aGFuZGxlTWVzc2FnZShtc2cpfXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2V9O01vZHVsZVtcIndhc21Nb2R1bGVcIl09ZS5kYXRhLndhc21Nb2R1bGU7Zm9yKGNvbnN0IGhhbmRsZXIgb2YgZS5kYXRhLmhhbmRsZXJzKXtNb2R1bGVbaGFuZGxlcl09KC4uLmFyZ3MpPT57cG9zdE1lc3NhZ2Uoe2NtZDpcImNhbGxIYW5kbGVyXCIsaGFuZGxlcjpoYW5kbGVyLGFyZ3M6YXJnc30pfX1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdPWUuZGF0YS53YXNtTWVtb3J5O01vZHVsZVtcImJ1ZmZlclwiXT1Nb2R1bGVbXCJ3YXNtTWVtb3J5XCJdLmJ1ZmZlcjtNb2R1bGVbXCJFTlZJUk9OTUVOVF9JU19QVEhSRUFEXCJdPXRydWU7aWYodHlwZW9mIGUuZGF0YS51cmxPckJsb2I9PVwic3RyaW5nXCIpe2ltcG9ydFNjcmlwdHMoZS5kYXRhLnVybE9yQmxvYil9ZWxzZXt2YXIgb2JqZWN0VXJsPVVSTC5jcmVhdGVPYmplY3RVUkwoZS5kYXRhLnVybE9yQmxvYik7aW1wb3J0U2NyaXB0cyhvYmplY3RVcmwpO1VSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKX1vcnRXYXNtVGhyZWFkZWQoTW9kdWxlKX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cInJ1blwiKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyLC8qaXNfbWFpbj0qLzAsLyppc19ydW50aW1lPSovMCwvKmNhbl9ibG9jaz0qLzEpO01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfbWFpbGJveF9hd2FpdFwiXShlLmRhdGEucHRocmVhZF9wdHIpO01vZHVsZVtcImVzdGFibGlzaFN0YWNrU3BhY2VcIl0oKTtNb2R1bGVbXCJQVGhyZWFkXCJdLnJlY2VpdmVPYmplY3RUcmFuc2ZlcihlLmRhdGEpO01vZHVsZVtcIlBUaHJlYWRcIl0udGhyZWFkSW5pdFRMUygpO2lmKCFpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJfX2VtYmluZF9pbml0aWFsaXplX2JpbmRpbmdzXCJdKCk7aW5pdGlhbGl6ZWRKUz10cnVlfXRyeXtNb2R1bGVbXCJpbnZva2VFbnRyeVBvaW50XCJdKGUuZGF0YS5zdGFydF9yb3V0aW5lLGUuZGF0YS5hcmcpfWNhdGNoKGV4KXtpZihleCE9XCJ1bndpbmRcIil7dGhyb3cgZXh9fX1lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNhbmNlbFwiKXtpZihNb2R1bGVbXCJfcHRocmVhZF9zZWxmXCJdKCkpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdFwiXSgtMSl9fWVsc2UgaWYoZS5kYXRhLnRhcmdldD09PVwic2V0aW1tZWRpYXRlXCIpe31lbHNlIGlmKGUuZGF0YS5jbWQ9PT1cImNoZWNrTWFpbGJveFwiKXtpZihpbml0aWFsaXplZEpTKXtNb2R1bGVbXCJjaGVja01haWxib3hcIl0oKX19ZWxzZSBpZihlLmRhdGEuY21kKXtlcnIoYHdvcmtlci5qcyByZWNlaXZlZCB1bmtub3duIGNvbW1hbmQgJHtlLmRhdGEuY21kfWApO2VycihlLmRhdGEpfX1jYXRjaChleCl7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdPy4oKTt0aHJvdyBleH19c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZTtcbiIsICJleHBvcnQgY29uc3Qgam9pbiA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7RW52fSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge09ydFdhc21Nb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbSc7XG5pbXBvcnQge09ydFdhc21UaHJlYWRlZE1vZHVsZX0gZnJvbSAnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkJztcblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xubGV0IG9ydFdhc21GYWN0b3J5OiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPjtcblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgb3J0V2FzbUZhY3RvcnkgPSByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXRyYWluaW5nLXdhc20tc2ltZC5qcycpO1xufSBlbHNlIHtcbiAgb3J0V2FzbUZhY3RvcnkgPVxuICAgICAgQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS5qcycpIDogcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQuanNlcC5qcycpO1xufVxuXG5jb25zdCBvcnRXYXNtRmFjdG9yeVRocmVhZGVkOiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPiA9ICFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgP1xuICAgIChCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLmpzJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5qcycpKSA6XG4gICAgb3J0V2FzbUZhY3Rvcnk7XG4vKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cblxubGV0IHdhc206IE9ydFdhc21Nb2R1bGV8dW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xuXG5jb25zdCBpc011bHRpVGhyZWFkU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIElmICdTaGFyZWRBcnJheUJ1ZmZlcicgaXMgbm90IGF2YWlsYWJsZSwgV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxuICAgIGlmICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgdHJhbnNmZXJhYmlsaXR5IG9mIFNBQnMgKGZvciBicm93c2Vycy4gbmVlZGVkIGZvciBGaXJlZm94KVxuICAgIC8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyFtc2cvbW96aWxsYS5kZXYucGxhdGZvcm0vSUhrQlpsSEVUcEEvZHdzTU5jaFdFUUFKXG4gICAgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLnBvc3RNZXNzYWdlKG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgdGhyZWFkcyBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIHRocmVhZGVkIGluc3RydWN0aW9ucy5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAgMCwgIDAsIDEsIDQsIDEsICA5NiwgMCwgICAwLCAgMywgMiwgMSwgIDAsIDUsXG4gICAgICA0LCAxLCAgMywgICAxLCAgIDEsIDEwLCAxMSwgMSwgOSwgMCwgNjUsIDAsICAyNTQsIDE2LCAyLCAwLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGlzU2ltZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSBTSU1EIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgU0lNRCBpbnN0cnVjdGlvbnMuXG5cbiAgICAvLyBUaGUgYmluYXJ5IGRhdGEgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIGZvbGxvd2luZyBjb2RlIGJ5IHdhdDJ3YXNtOlxuICAgIC8vXG4gICAgLy8gKG1vZHVsZVxuICAgIC8vICAgKHR5cGUgJHQwIChmdW5jKSlcbiAgICAvLyAgIChmdW5jICRmMCAodHlwZSAkdDApXG4gICAgLy8gICAgIChkcm9wXG4gICAgLy8gICAgICAgKGkzMng0LmRvdF9pMTZ4OF9zXG4gICAgLy8gICAgICAgICAoaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgICAgICAgKGkzMi5jb25zdCAwKSlcbiAgICAvLyAgICAgICAgICh2MTI4LmNvbnN0IGkzMng0IDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDApKSkpKVxuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsICAgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCA0LCAxLCA5NiwgMCwgMCwgMywgMiwgMSwgMCwgMTAsIDMwLCAxLCAgIDI4LCAgMCwgNjUsIDAsXG4gICAgICAyNTMsIDE1LCAyNTMsIDEyLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAgMjUzLCAxODYsIDEsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgZ2V0V2FzbUZpbGVOYW1lID0gKHVzZVNpbWQ6IGJvb2xlYW4sIHVzZVRocmVhZHM6IGJvb2xlYW4pID0+IHtcbiAgaWYgKHVzZVNpbWQpIHtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9UUkFJTklORykge1xuICAgICAgcmV0dXJuICdvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc20nO1xuICAgIH1cbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLXNpbWQud2FzbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20ud2FzbSc7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplV2ViQXNzZW1ibHkgPSBhc3luYyhmbGFnczogRW52LldlYkFzc2VtYmx5RmxhZ3MpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpcGxlIGNhbGxzIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGRldGVjdGVkLicpO1xuICB9XG4gIGlmIChhYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcmV2aW91cyBjYWxsIHRvIFxcJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpXFwnIGZhaWxlZC4nKTtcbiAgfVxuXG4gIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgLy8gd2FzbSBmbGFncyBhcmUgYWxyZWFkeSBpbml0aWFsaXplZFxuICBjb25zdCB0aW1lb3V0ID0gZmxhZ3MuaW5pdFRpbWVvdXQhO1xuICBjb25zdCBudW1UaHJlYWRzID0gZmxhZ3MubnVtVGhyZWFkcyE7XG4gIGNvbnN0IHNpbWQgPSBmbGFncy5zaW1kITtcblxuICBjb25zdCB1c2VUaHJlYWRzID0gbnVtVGhyZWFkcyA+IDEgJiYgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCgpO1xuICBjb25zdCB1c2VTaW1kID0gc2ltZCAmJiBpc1NpbWRTdXBwb3J0ZWQoKTtcblxuICBjb25zdCB3YXNtUGF0aHMgPSBmbGFncy53YXNtUGF0aHM7XG4gIGNvbnN0IHdhc21QcmVmaXhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdzdHJpbmcnID8gd2FzbVBhdGhzIDogdW5kZWZpbmVkO1xuICBjb25zdCB3YXNtRmlsZU5hbWUgPSBnZXRXYXNtRmlsZU5hbWUodXNlU2ltZCwgdXNlVGhyZWFkcyk7XG4gIGNvbnN0IHdhc21QYXRoT3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnb2JqZWN0JyA/IHdhc21QYXRoc1t3YXNtRmlsZU5hbWVdIDogdW5kZWZpbmVkO1xuXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcblxuICBjb25zdCB0YXNrczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICAvLyBwcm9taXNlIGZvciB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ID4gMCkge1xuICAgIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KSk7XG4gIH1cblxuICAvLyBwcm9taXNlIGZvciBtb2R1bGUgaW5pdGlhbGl6YXRpb25cbiAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHVzZVRocmVhZHMgPyBvcnRXYXNtRmFjdG9yeVRocmVhZGVkIDogb3J0V2FzbUZhY3Rvcnk7XG4gICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE9ydFdhc21Nb2R1bGU+ID0ge1xuICAgICAgbG9jYXRlRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIHNjcmlwdERpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy53b3JrZXIuanMnKSAmJlxuICAgICAgICAgICAgdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHJlcXVpcmUoKSBmdW5jdGlvbiBpcyBoYW5kbGVkIGJ5IGVzYnVpbGQgcGx1Z2luIHRvIGxvYWQgZmlsZSBjb250ZW50IGFzIHN0cmluZy5cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMnKVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy53YXNtJykpIHtcbiAgICAgICAgICBpZiAod2FzbVBhdGhPdmVycmlkZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhc21QYXRoT3ZlcnJpZGU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcHJlZml4ID0gd2FzbVByZWZpeE92ZXJyaWRlID8/IHNjcmlwdERpcmVjdG9yeTtcblxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICAgICAgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIHdhc21GaWxlTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JpcHREaXJlY3RvcnkgKyBmaWxlTmFtZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcykge1xuICAgICAgY29uZmlnLm51bVRocmVhZHMgPSBudW1UaHJlYWRzO1xuICAgICAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdvcnQtd2FzbS10aHJlYWRlZC5qcycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2NyaXB0U291cmNlQ29kZSA9IGB2YXIgb3J0V2FzbVRocmVhZGVkPSR7ZmFjdG9yeS50b1N0cmluZygpfTtgO1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IG5ldyBCbG9iKFtzY3JpcHRTb3VyY2VDb2RlXSwge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmFjdG9yeShjb25maWcpLnRoZW4oXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICBtb2R1bGUgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB3YXNtID0gbW9kdWxlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgZmFpbGVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgKHdoYXQpID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICByZWplY3Qod2hhdCk7XG4gICAgICAgIH0pO1xuICB9KSk7XG5cbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcblxuICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2UgPSAoKTogT3J0V2FzbU1vZHVsZSA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiB3YXNtKSB7XG4gICAgcmV0dXJuIHdhc207XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmICFpbml0aWFsaXppbmcgJiYgIWFib3J0ZWQpIHtcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgKHdhc20gYXMgT3J0V2FzbVRocmVhZGVkTW9kdWxlKS5QVGhyZWFkPy50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7XG4gICAgd2FzbSA9IHVuZGVmaW5lZDtcblxuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgYWJvcnRlZCA9IHRydWU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcblxuZXhwb3J0IGNvbnN0IGFsbG9jV2FzbVN0cmluZyA9IChkYXRhOiBzdHJpbmcsIGFsbG9jczogbnVtYmVyW10pOiBudW1iZXIgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBkYXRhTGVuZ3RoID0gd2FzbS5sZW5ndGhCeXRlc1VURjgoZGF0YSkgKyAxO1xuICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKGRhdGFMZW5ndGgpO1xuICB3YXNtLnN0cmluZ1RvVVRGOChkYXRhLCBkYXRhT2Zmc2V0LCBkYXRhTGVuZ3RoKTtcbiAgYWxsb2NzLnB1c2goZGF0YU9mZnNldCk7XG5cbiAgcmV0dXJuIGRhdGFPZmZzZXQ7XG59O1xuXG5pbnRlcmZhY2UgRXh0cmFPcHRpb25zSGFuZGxlciB7XG4gIChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgaXRlcmF0ZUV4dHJhT3B0aW9ucyA9XG4gICAgKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwcmVmaXg6IHN0cmluZywgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXG4gICAgIGhhbmRsZXI6IEV4dHJhT3B0aW9uc0hhbmRsZXIpOiB2b2lkID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzZWVuLmhhcyhvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2lyY3VsYXIgcmVmZXJlbmNlIGluIG9wdGlvbnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWVuLmFkZChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcmVmaXgpID8gcHJlZml4ICsga2V5IDoga2V5O1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG5hbWUgKyAnLicsIHNlZW4sIGhhbmRsZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsICh2YWx1ZSkgPyAnMScgOiAnMCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaGFuZGxlIGV4dHJhIGNvbmZpZyB0eXBlOiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuLyoqXG4gKiBjaGVjayB3ZWIgYXNzZW1ibHkgQVBJJ3MgbGFzdCBlcnJvciBhbmQgdGhyb3cgZXJyb3IgaWYgYW55IGVycm9yIG9jY3VycmVkLlxuICogQHBhcmFtIG1lc3NhZ2UgYSBtZXNzYWdlIHVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrTGFzdEVycm9yID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIHdhc20uX09ydEdldExhc3RFcnJvcihwYXJhbXNPZmZzZXQsIHBhcmFtc09mZnNldCArIDQpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uSEVBUDMyW3BhcmFtc09mZnNldCAvIDRdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLkhFQVBVMzJbcGFyYW1zT2Zmc2V0IC8gNCArIDFdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZVBvaW50ZXIgPyB3YXNtLlVURjhUb1N0cmluZyhlcnJvck1lc3NhZ2VQb2ludGVyKSA6ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHttZXNzYWdlfSBFUlJPUl9DT0RFOiAke2Vycm9yQ29kZX0sIEVSUk9SX01FU1NBR0U6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRSdW5PcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBydW5PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRyeSB7XG4gICAgaWYgKG9wdGlvbnM/LmxvZ1NldmVyaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID0gMjsgIC8vIERlZmF1bHQgdG8gd2FybmluZ1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCkgfHxcbiAgICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fCBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8ubG9nVmVyYm9zaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA9IDA7ICAvLyBEZWZhdWx0IHRvIDBcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy50ZXJtaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy50ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGFnRGF0YU9mZnNldCA9IDA7XG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG9wdGlvbnMudGFnLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIHJ1bk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVSdW5PcHRpb25zKFxuICAgICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwhLCBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsISwgISFydW5PcHRpb25zLnRlcm1pbmF0ZSEsIHRhZ0RhdGFPZmZzZXQpO1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgcnVuIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMob3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHJ1biBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuY29uc3QgZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsID0gKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw6IHN0cmluZ3x1bmtub3duKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XG4gICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnZXh0ZW5kZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiA5OTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBncmFwaCBvcHRpbWl6YXRpb24gbGV2ZWw6ICR7Z3JhcGhPcHRpbWl6YXRpb25MZXZlbH1gKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RXhlY3V0aW9uTW9kZSA9IChleGVjdXRpb25Nb2RlOiAnc2VxdWVudGlhbCd8J3BhcmFsbGVsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZXhlY3V0aW9uTW9kZSkge1xuICAgIGNhc2UgJ3NlcXVlbnRpYWwnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAncGFyYWxsZWwnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZXhlY3V0aW9uIG1vZGU6ICR7ZXhlY3V0aW9uTW9kZX1gKTtcbiAgfVxufTtcblxuY29uc3QgYXBwZW5kRGVmYXVsdE9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBpZiAoIW9wdGlvbnMuZXh0cmEpIHtcbiAgICBvcHRpb25zLmV4dHJhID0ge307XG4gIH1cbiAgaWYgKCFvcHRpb25zLmV4dHJhLnNlc3Npb24pIHtcbiAgICBvcHRpb25zLmV4dHJhLnNlc3Npb24gPSB7fTtcbiAgfVxuICBjb25zdCBzZXNzaW9uID0gb3B0aW9ucy5leHRyYS5zZXNzaW9uIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGlmICghc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSA9ICcxJztcbiAgfVxuXG4gIC8vIGlmIHVzaW5nIEpTRVAgd2l0aCBXZWJHUFUsIGFsd2F5cyBkaXNhYmxlIG1lbW9yeSBwYXR0ZXJuXG4gIGlmIChvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyAmJlxuICAgICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMuc29tZShlcCA9PiAodHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZSkgPT09ICd3ZWJncHUnKSkge1xuICAgIG9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPVxuICAgIChzZXNzaW9uT3B0aW9uc0hhbmRsZTogbnVtYmVyLCBleGVjdXRpb25Qcm92aWRlcnM6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uRXhlY3V0aW9uUHJvdmlkZXJDb25maWdbXSxcbiAgICAgYWxsb2NzOiBudW1iZXJbXSk6IHZvaWQgPT4ge1xuICAgICAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgICAgbGV0IGVwTmFtZSA9IHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWU7XG5cbiAgICAgICAgLy8gY2hlY2sgRVAgbmFtZVxuICAgICAgICBzd2l0Y2ggKGVwTmFtZSkge1xuICAgICAgICAgIGNhc2UgJ3dlYm5uJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCB3ZWJubk9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LmRldmljZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdkZXZpY2VUeXBlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLmRldmljZVR5cGUsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZGV2aWNlVHlwZScgLSAke3dlYm5uT3B0aW9ucy5kZXZpY2VUeXBlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ubnVtVGhyZWFkcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1UaHJlYWRzID0gd2Vibm5PcHRpb25zLm51bVRocmVhZHM7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCBpZ25vcmUgaW52YWxpZCB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcy5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bVRocmVhZHMgIT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIobnVtVGhyZWFkcykgfHwgbnVtVGhyZWFkcyA8IDApIHtcbiAgICAgICAgICAgICAgICAgIG51bVRocmVhZHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdudW1UaHJlYWRzJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobnVtVGhyZWFkcy50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ251bVRocmVhZHMnIC0gJHt3ZWJubk9wdGlvbnMubnVtVGhyZWFkc30uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LnBvd2VyUHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ3Bvd2VyUHJlZmVyZW5jZScsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYm5uT3B0aW9ucy5wb3dlclByZWZlcmVuY2UsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncG93ZXJQcmVmZXJlbmNlJyAtICR7d2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZX0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3ZWJncHUnOlxuICAgICAgICAgICAgZXBOYW1lID0gJ0pTJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYmdwdU9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucz8ucHJlZmVycmVkTGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0ICE9PSAnTkNIVycgJiYgd2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOSFdDJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcmVmZXJyZWRMYXlvdXQgbXVzdCBiZSBlaXRoZXIgJ05DSFcnIG9yICdOSFdDJzogJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncHJlZmVycmVkTGF5b3V0JywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncHJlZmVycmVkTGF5b3V0JyAtICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2FzbSc6XG4gICAgICAgICAgY2FzZSAnY3B1JzpcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vdCBzdXBwb3J0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVwTmFtZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoZXBOYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXIoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGVwTmFtZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFwcGVuZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbmV4cG9ydCBjb25zdCBzZXRTZXNzaW9uT3B0aW9ucyA9IChvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBhcHBlbmREZWZhdWx0T3B0aW9ucyhzZXNzaW9uT3B0aW9ucyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBncmFwaE9wdGltaXphdGlvbkxldmVsID0gZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsKHNlc3Npb25PcHRpb25zLmdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPz8gJ2FsbCcpO1xuICAgIGNvbnN0IGV4ZWN1dGlvbk1vZGUgPSBnZXRFeGVjdXRpb25Nb2RlKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvbk1vZGUgPz8gJ3NlcXVlbnRpYWwnKTtcbiAgICBjb25zdCBsb2dJZERhdGFPZmZzZXQgPVxuICAgICAgICB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMubG9nSWQgPT09ICdzdHJpbmcnID8gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLmxvZ0lkLCBhbGxvY3MpIDogMDtcblxuICAgIGNvbnN0IGxvZ1NldmVyaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID8/IDI7ICAvLyBEZWZhdWx0IHRvIDIgLSB3YXJuaW5nXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1NldmVyaXR5TGV2ZWwpIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nVmVyYm9zaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA/PyAwOyAgLy8gRGVmYXVsdCB0byAwIC0gdmVyYm9zZVxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dWZXJib3NpdHlMZXZlbCkgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPCAwIHx8IGxvZ1ZlcmJvc2l0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0ID0gdHlwZW9mIHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGggPT09ICdzdHJpbmcnID9cbiAgICAgICAgYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGgsIGFsbG9jcykgOlxuICAgICAgICAwO1xuXG4gICAgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucyhcbiAgICAgICAgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVDcHVNZW1BcmVuYSwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuLCBleGVjdXRpb25Nb2RlLFxuICAgICAgICAhIXNlc3Npb25PcHRpb25zLmVuYWJsZVByb2ZpbGluZywgMCwgbG9nSWREYXRhT2Zmc2V0LCBsb2dTZXZlcml0eUxldmVsLCBsb2dWZXJib3NpdHlMZXZlbCxcbiAgICAgICAgb3B0aW1pemVkTW9kZWxGaWxlUGF0aE9mZnNldCk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgc2Vzc2lvbiBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgIHNldEV4ZWN1dGlvblByb3ZpZGVycyhzZXNzaW9uT3B0aW9uc0hhbmRsZSwgc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc2Vzc2lvbk9wdGlvbnMuZnJlZURpbWVuc2lvbk92ZXJyaWRlcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nOiAke25hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsdWUpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgdmFsdWUgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWVPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobmFtZSwgYWxsb2NzKTtcbiAgICAgICAgaWYgKHdhc20uX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZShzZXNzaW9uT3B0aW9uc0hhbmRsZSwgbmFtZU9mZnNldCwgdmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIGZyZWUgZGltZW5zaW9uIG92ZXJyaWRlOiAke25hbWV9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhzZXNzaW9uT3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbi8vIFRoaXMgZmlsZSBpbmNsdWRlcyBjb21tb24gZGVmaW5pdGlvbnMuIFRoZXkgZG8gTk9UIGhhdmUgZGVwZW5kZW5jeSBvbiB0aGUgV2ViQXNzZW1ibHkgaW5zdGFuY2UuXG5cbi8qKlxuICogQ29waWVkIGZyb20gT05OWCBkZWZpbml0aW9uLiBVc2UgdGhpcyB0byBkcm9wIGRlcGVuZGVuY3kgJ29ubnhfcHJvdG8nIHRvIGRlY3JlYXNlIGNvbXBpbGVkIC5qcyBmaWxlIHNpemUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIERhdGFUeXBlIHtcbiAgdW5kZWZpbmVkID0gMCxcbiAgZmxvYXQgPSAxLFxuICB1aW50OCA9IDIsXG4gIGludDggPSAzLFxuICB1aW50MTYgPSA0LFxuICBpbnQxNiA9IDUsXG4gIGludDMyID0gNixcbiAgaW50NjQgPSA3LFxuICBzdHJpbmcgPSA4LFxuICBib29sID0gOSxcbiAgZmxvYXQxNiA9IDEwLFxuICBkb3VibGUgPSAxMSxcbiAgdWludDMyID0gMTIsXG4gIHVpbnQ2NCA9IDEzLFxuICBjb21wbGV4NjQgPSAxNCxcbiAgY29tcGxleDEyOCA9IDE1LFxuICBiZmxvYXQxNiA9IDE2XG59XG5cbi8qKlxuICogTWFwIHN0cmluZyB0ZW5zb3IgZGF0YSB0byBlbnVtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSA9ICh0eXBlOiBzdHJpbmcpOiBEYXRhVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDg7XG4gICAgY2FzZSAndWludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ4O1xuICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmJvb2w7XG4gICAgY2FzZSAnaW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDE2O1xuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDE2O1xuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQzMjtcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQzMjtcbiAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDE2O1xuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0O1xuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmRvdWJsZTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnN0cmluZztcbiAgICBjYXNlICdpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50NjQ7XG4gICAgY2FzZSAndWludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NjQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgZW51bSB2YWx1ZSB0byBzdHJpbmcgdGVuc29yIGRhdGFcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nID0gKHR5cGVQcm90bzogRGF0YVR5cGUpOiBUZW5zb3IuVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZVByb3RvKSB7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ4OlxuICAgICAgcmV0dXJuICdpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ4OlxuICAgICAgcmV0dXJuICd1aW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS5ib29sOlxuICAgICAgcmV0dXJuICdib29sJztcbiAgICBjYXNlIERhdGFUeXBlLmludDE2OlxuICAgICAgcmV0dXJuICdpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MTY6XG4gICAgICByZXR1cm4gJ3VpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQzMjpcbiAgICAgIHJldHVybiAnaW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDMyOlxuICAgICAgcmV0dXJuICd1aW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQxNjpcbiAgICAgIHJldHVybiAnZmxvYXQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDpcbiAgICAgIHJldHVybiAnZmxvYXQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5kb3VibGU6XG4gICAgICByZXR1cm4gJ2Zsb2F0NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUuc3RyaW5nOlxuICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50NjQ6XG4gICAgICByZXR1cm4gJ2ludDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ2NDpcbiAgICAgIHJldHVybiAndWludDY0JztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlUHJvdG99YCk7XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IHRlbnNvciBlbGVtZW50IHNpemUgaW4gYnl0ZXMgYnkgdGhlIGdpdmVuIGRhdGEgdHlwZVxuICogQHJldHVybnMgc2l6ZSBpbiBpbnRlZ2VyIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGF0YSB0eXBlIGlzIG5vdCBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFRlbnNvckVsZW1lbnRTaXplID0gKGRhdGVUeXBlOiBudW1iZXIpOiBudW1iZXJ8XG4gICAgdW5kZWZpbmVkID0+IFt1bmRlZmluZWQsIDQsIDEsIDEsIDIsIDIsIDQsIDgsIHVuZGVmaW5lZCwgMSwgMiwgOCwgNCwgOCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1bZGF0ZVR5cGVdO1xuXG4vKipcbiAqIGdldCB0eXBlZCBhcnJheSBjb25zdHJ1Y3RvciBieSB0aGUgZ2l2ZW4gdGVuc29yIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3RvciA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yfFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxcbiAgICBJbnQ4QXJyYXlDb25zdHJ1Y3RvcnxVaW50MTZBcnJheUNvbnN0cnVjdG9yfEludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnSW50NjRBcnJheUNvbnN0cnVjdG9yfFxuICAgIFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxGbG9hdDY0QXJyYXlDb25zdHJ1Y3RvcnxVaW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ1VpbnQ2NEFycmF5Q29uc3RydWN0b3IgPT4ge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY2FzZSAndWludDgnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdpbnQ4JzpcbiAgICAgICAgICByZXR1cm4gSW50OEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnaW50MTYnOlxuICAgICAgICAgIHJldHVybiBJbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIEludDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MzInOlxuICAgICAgICAgIHJldHVybiBVaW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnaW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdJbnQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdVaW50NjRBcnJheTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgIH1cbiAgICB9O1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgbG9nIGxldmVsIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ0xldmVsU3RyaW5nVG9FbnVtID0gKGxvZ0xldmVsPzogJ3ZlcmJvc2UnfCdpbmZvJ3wnd2FybmluZyd8J2Vycm9yJ3wnZmF0YWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2dMZXZlbCkge1xuICAgIGNhc2UgJ3ZlcmJvc2UnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2ZhdGFsJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGxvZ2dpbmcgbGV2ZWw6ICR7bG9nTGV2ZWx9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGVuc29yIHR5cGUgaXMgc3VwcG9ydGVkIGJ5IEdQVSBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IHR5cGUgaXMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9PiB0eXBlID09PSAnZmxvYXQzMicgfHxcbiAgICB0eXBlID09PSAnaW50MzInIHx8IHR5cGUgPT09ICdpbnQ2NCcgfHwgdHlwZSA9PT0gJ2Jvb2wnIHx8IHR5cGUgPT09ICdmbG9hdDE2JyB8fCB0eXBlID09PSAndWludDMyJztcblxuLyoqXG4gKiBNYXAgc3RyaW5nIGRhdGEgbG9jYXRpb24gdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtID0gKGxvY2F0aW9uOiBUZW5zb3IuRGF0YUxvY2F0aW9uKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2NhdGlvbikge1xuICAgIGNhc2UgJ25vbmUnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAndGV4dHVyZSc6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgbG9jYXRpb246ICR7bG9jYXRpb259YCk7XG4gIH1cbn07XG5cbi8qKlxuICogTWFwIGludGVnZXIgZGF0YSBsb2NhdGlvbiB0byBzdHJpbmcgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGRhdGFMb2NhdGlvbkVudW1Ub1N0cmluZyA9IChsb2NhdGlvbjogbnVtYmVyKTogVGVuc29yLkRhdGFMb2NhdGlvbnx1bmRlZmluZWQgPT5cbiAgICAoWydub25lJywgJ2NwdScsICdjcHUtcGlubmVkJywgJ3RleHR1cmUnLCAnZ3B1LWJ1ZmZlciddIGFzIGNvbnN0KVtsb2NhdGlvbl07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7cmVhZEZpbGV9IGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnO1xuXG4vKipcbiAqIExvYWQgYSBmaWxlIGludG8gYSBVaW50OEFycmF5LlxuICpcbiAqIEBwYXJhbSBmaWxlIC0gdGhlIGZpbGUgdG8gbG9hZC4gQ2FuIGJlIGEgVVJML3BhdGgsIGEgQmxvYiwgYW4gQXJyYXlCdWZmZXIsIG9yIGEgVWludDhBcnJheS5cbiAqIEByZXR1cm5zIGEgVWludDhBcnJheSBjb250YWluaW5nIHRoZSBmaWxlIGRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkRmlsZSA9IGFzeW5jKGZpbGU6IHN0cmluZ3xCbG9ifEFycmF5QnVmZmVyTGlrZXxVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiA9PiB7XG4gIGlmICh0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKSB7XG4gICAgICAvLyBsb2FkIGZpbGUgaW50byBBcnJheUJ1ZmZlciBpbiBOb2RlLmpzXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVhZEZpbGUoZmlsZSkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5jb2RlID09PSAnRVJSX0ZTX0ZJTEVfVE9PX0xBUkdFJykge1xuICAgICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2UgZnMuY3JlYXRlUmVhZFN0cmVhbSBpbnN0ZWFkXG4gICAgICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKTtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3RyZWFtKSB7XG4gICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShCdWZmZXIuY29uY2F0KGNodW5rcykpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGxvYWQgZmlsZSBpbnRvIEFycmF5QnVmZmVyIGluIGJyb3dzZXJzXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbGUpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZhaWxlZCB0byBsb2FkIGV4dGVybmFsIGRhdGEgZmlsZTogJHtmaWxlfWApO1xuICAgICAgfVxuICAgICAgY29uc3QgY29udGVudExlbmd0aEhlYWRlciA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LUxlbmd0aCcpO1xuICAgICAgY29uc3QgZmlsZVNpemUgPSBjb250ZW50TGVuZ3RoSGVhZGVyID8gcGFyc2VJbnQoY29udGVudExlbmd0aEhlYWRlciwgMTApIDogMDtcbiAgICAgIGlmIChmaWxlU2l6ZSA8IDEwNzM3NDE4MjQgLyogMUdCICovKSB7XG4gICAgICAgIC8vIHdoZW4gQ29udGVudC1MZW5ndGggaGVhZGVyIGlzIG5vdCBzZXQsIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGZpbGUgc2l6ZS4gV2UgYXNzdW1lIGl0IGlzIHNtYWxsIGVub3VnaCB0b1xuICAgICAgICAvLyBsb2FkIGludG8gbWVtb3J5LlxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaWxlIGlzIHRvbyBsYXJnZSwgdXNlIHN0cmVhbSBpbnN0ZWFkXG4gICAgICAgIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9LCBubyByZXNwb25zZSBib2R5LmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG5cbiAgICAgICAgLy8gdXNlIFdlYkFzc2VtYmx5IE1lbW9yeSB0byBhbGxvY2F0ZSBsYXJnZXIgQXJyYXlCdWZmZXJcbiAgICAgICAgY29uc3QgcGFnZXMgPSBNYXRoLmNlaWwoZmlsZVNpemUgLyA2NTUzNik7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6IHBhZ2VzLCBtYXhpbXVtOiBwYWdlc30pLmJ1ZmZlcjtcblxuICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHtkb25lLCB2YWx1ZX0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2h1bmtTaXplID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgICBjb25zdCBjaHVuayA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgb2Zmc2V0LCBjaHVua1NpemUpO1xuICAgICAgICAgIGNodW5rLnNldCh2YWx1ZSk7XG4gICAgICAgICAgb2Zmc2V0ICs9IGNodW5rU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwLCBmaWxlU2l6ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gZWxzZSBpZiAoZmlsZSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpKTtcbiAgfSBlbHNlIGlmIChmaWxlIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBmaWxlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShmaWxlKTtcbiAgfVxufTtcbiIsICJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7RW52LCBJbmZlcmVuY2VTZXNzaW9uLCBUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7c2V0UnVuT3B0aW9uc30gZnJvbSAnLi9ydW4tb3B0aW9ucyc7XG5pbXBvcnQge3NldFNlc3Npb25PcHRpb25zfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XG5pbXBvcnQge2RhdGFMb2NhdGlvblN0cmluZ1RvRW51bSwgZ2V0VGVuc29yRWxlbWVudFNpemUsIGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSwgbG9nTGV2ZWxTdHJpbmdUb0VudW0sIHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nLCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSwgdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yfSBmcm9tICcuL3dhc20tY29tbW9uJztcbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvcn0gZnJvbSAnLi93YXNtLXV0aWxzJztcbmltcG9ydCB7bG9hZEZpbGV9IGZyb20gJy4vd2FzbS11dGlscy1sb2FkLWZpbGUnO1xuXG4vLyAjcmVnaW9uIEluaXRpYWxpemF0aW9uc1xuXG4vKipcbiAqIFRoZXJlIGFyZSA0IGRpZmZlcmVudCBcImluaXRpYWxpemF0aW9uXCIgc3RlcHMgZm9yIE9SVC4gVGhleSBoYXBwZW4gaW4gZGlmZmVyZW50IHBsYWNlcyBhbmQgZGlmZmVyZW50IHRpbWUuXG4gKlxuICogMS4gSmF2YVNjcmlwdCBpbml0aWFsaXphdGlvbiBmb3Igb25ueHJ1bnRpbWUtY29tbW9uIGFuZCBvbm54cnVudGltZS13ZWIuXG4gKiAgICBUaGlzIGlzIHRoZSBmaXJzdCBpbml0aWFsaXphdGlvbiBzdGVwLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBjYWxscyBvbm54cnVudGltZS1jb21tb24ncyByZWdpc3RlckJhY2tlbmQoKVxuICogZnVuY3Rpb24gbXVsdGlwbGUgdGltZXMgdG8gcmVnaXN0ZXIgYWxsIHRoZSBhdmFpbGFibGUgYmFja2VuZHMuIFRoZSBiYWNrZW5kIHJlZ2lzdHJhdGlvbiBpcyB2ZXJ5IGZhc3QuIEl0IG9ubHlcbiAqIHJlZ2lzdGVycyB0aGUgYmFja2VuZCBuYW1lIHdpdGggdGhlIHVuaW5pdGlhbGl6ZWQgYmFja2VuZCBvYmplY3QuIE5vIGhlYXZ5IGluaXRpYWxpemF0aW9uIGlzIGRvbmUgaW4gdGhpcyBzdGVwLlxuICogICAgUmVmZXIgdG8gd2ViL2xpYi9pbmRleC50cyBmb3IgdGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uLlxuICpcbiAqIDIuIFdlYkFzc2VtYmx5IGFydGlmYWN0IGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIHdoZW4gYW55IHJlZ2lzdGVyZWQgd2FzbSBiYWNrZW5kIGlzIHVzZWQgZm9yIHRoZSBmaXJzdCB0aW1lIChpZS4gYG9ydC5JbmZlcmVuY2VTZXNzaW9uLmNyZWF0ZSgpYCBvclxuICogYG9ydC5UcmFpbmluZ1Nlc3Npb24uY3JlYXRlKClgIGlzIGNhbGxlZCkuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGRvZXMgdGhlIGZvbGxvd2luZ3M6XG4gKiAgICAgLSBjcmVhdGUgYSBwcm94eSB3b3JrZXIgYW5kIG1ha2Ugc3VyZSB0aGUgcHJveHkgd29ya2VyIGlzIHJlYWR5IHRvIHJlY2VpdmUgbWVzc2FnZXMsIGlmIHByb3h5IGlzIGVuYWJsZWQuXG4gKiAgICAgLSBwZXJmb3JtIGZlYXR1cmUgZGV0ZWN0aW9uLCBsb2NhdGUgY29ycmVjdCBXZWJBc3NlbWJseSBhcnRpZmFjdCBwYXRoIGFuZCBjYWxsIHRoZSBFbXNjcmlwdGVuIGdlbmVyYXRlZFxuICogSmF2YVNjcmlwdCBjb2RlIHRvIGluaXRpYWxpemUgdGhlIFdlYkFzc2VtYmx5IHJ1bnRpbWUuXG4gKiAgICAgICAgIC0gaWYgcHJveHkgaXMgZW5hYmxlZCwgdGhpcyBzdGVwIGhhcHBlbnMgaW4gdGhlIHByb3h5IHdvcmtlciB1c2luZyBtZXNzYWdlICdpbml0LXdhc20nLlxuICogICAgICAgICAtIGRvd25sb2FkaW5nIHRoZSAnb3J0LXdhc217Li4ufS53YXNtJyBmaWxlIGlzIGRvbmUgaW4gdGhpcyBzdGVwLlxuICogICAgICAgICAtIGlmIG11bHRpLXRocmVhZCBpcyBlbmFibGVkLCBvbmUgb3IgbW9yZSB3ZWJ3b3JrZXIgd2lsbCBiZSBjcmVhdGVkIHRvIGluaXRpYWxpemUgdGhlIFBUaHJlYWQgdGhyZWFkcG9vbC5cbiAqXG4gKiAzLiBPUlQgZW52aXJvbm1lbnQgaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgYWZ0ZXIgc3RlcCAyLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBwZXJmb3JtcyBPTk5YIFJ1bnRpbWUgZW52aXJvbm1lbnQgaW5pdGlhbGl6YXRpb24uXG4gKiBGdW5jdGlvbiBgX09ydEluaXQoKWAgaXMgY2FsbGVkIGluIHRoaXMgc3RlcC5cbiAqICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC1vcnQnLlxuICogICAgIC0gbG9nZ2luZyBsZXZlbCAob3J0LmVudi5sb2dMZXZlbCkgYW5kIHRocmVhZCBudW1iZXIgKG9ydC5lbnYud2FzbS5udW1UaHJlYWRzKSBhcmUgc2V0IGluIHRoaXMgc3RlcC5cbiAqXG4gKiA0LiBTZXNzaW9uIGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIHdoZW4gYG9ydC5JbmZlcmVuY2VTZXNzaW9uLmNyZWF0ZSgpYCBvciBgb3J0LlRyYWluaW5nU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkLiBVbmxpa2UgdGhlIGZpcnN0IDNcbiAqIHN0ZXBzICh0aGV5IG9ubHkgY2FsbGVkIG9uY2UpLCB0aGlzIHN0ZXAgd2lsbCBiZSBkb25lIGZvciBlYWNoIHNlc3Npb24uIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGRvZXMgdGhlXG4gKiBmb2xsb3dpbmdzOlxuICogICAgSWYgdGhlIHBhcmFtZXRlciBpcyBhIFVSTDpcbiAqICAgIC0gZG93bmxvYWQgdGhlIG1vZGVsIGRhdGEgZnJvbSB0aGUgVVJMLlxuICogICAgLSBjb3B5IHRoZSBtb2RlbCBkYXRhIHRvIHRoZSBXQVNNIGhlYXAuIChwcm94eTogJ2NvcHktZnJvbScpXG4gKiAgICAtIGRlcmVmZXJlbmNlIHRoZSBtb2RlbCBidWZmZXIuIFRoaXMgc3RlcCBhbGxvd3MgdGhlIG9yaWdpbmFsIEFycmF5QnVmZmVyIHRvIGJlIGdhcmJhZ2UgY29sbGVjdGVkLlxuICogICAgLSBjYWxsIGBfT3J0Q3JlYXRlU2Vzc2lvbigpYCB0byBjcmVhdGUgdGhlIHNlc3Npb24uIChwcm94eTogJ2NyZWF0ZScpXG4gKlxuICogICAgSWYgdGhlIHBhcmFtZXRlciBpcyBhIFVpbnQ4QXJyYXkgb2JqZWN0OlxuICogICAgLSBjb3B5IHRoZSBtb2RlbCBkYXRhIHRvIHRoZSBXQVNNIGhlYXAuIChwcm94eTogJ2NvcHktZnJvbScpXG4gKiAgICAtIGNhbGwgYF9PcnRDcmVhdGVTZXNzaW9uKClgIHRvIGNyZWF0ZSB0aGUgc2Vzc2lvbi4gKHByb3h5OiAnY3JlYXRlJylcbiAqXG4gKlxuICovXG5cbi8qKlxuICogaW5pdGlhbGl6ZSBPUlQgZW52aXJvbm1lbnQuXG4gKlxuICogQHBhcmFtIG51bVRocmVhZHMgU2V0R2xvYmFsSW50cmFPcE51bVRocmVhZHMobnVtVGhyZWFkcylcbiAqIEBwYXJhbSBsb2dnaW5nTGV2ZWwgQ3JlYXRlRW52KHN0YXRpY19jYXN0PE9ydExvZ2dpbmdMZXZlbD4obG9nZ2luZ19sZXZlbCkpXG4gKi9cbmNvbnN0IGluaXRPcnQgPSAobnVtVGhyZWFkczogbnVtYmVyLCBsb2dnaW5nTGV2ZWw6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCBlcnJvckNvZGUgPSBnZXRJbnN0YW5jZSgpLl9PcnRJbml0KG51bVRocmVhZHMsIGxvZ2dpbmdMZXZlbCk7XG4gIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBpbml0aWFsaXplIG9ubnhydW50aW1lLicpO1xuICB9XG59O1xuXG4vKipcbiAqIGludGlhbGl6ZSBydW50aW1lIGVudmlyb25tZW50LlxuICogQHBhcmFtIGVudiBwYXNzZWQgaW4gdGhlIGVudmlyb25tZW50IGNvbmZpZyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0UnVudGltZSA9IGFzeW5jKGVudjogRW52KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXQgT1JUXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xufTtcblxuLyoqXG4gKiBwZXJmb3JtIEVQIHNwZWNpZmljIGluaXRpYWxpemF0aW9uLlxuICpcbiAqIEBwYXJhbSBlbnZcbiAqIEBwYXJhbSBlcE5hbWVcbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRFcCA9IGFzeW5jKGVudjogRW52LCBlcE5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgKGVwTmFtZSA9PT0gJ3dlYmdwdScgfHwgZXBOYW1lID09PSAnd2Vibm4nKSkge1xuICAgIC8vIHBlcmZvcm0gV2ViR1BVIGF2YWlsYWJpbGl0eSBjaGVja1xuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyB8fCAhbmF2aWdhdG9yLmdwdSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJHUFUgaXMgbm90IHN1cHBvcnRlZCBpbiBjdXJyZW50IGVudmlyb25tZW50Jyk7XG4gICAgfVxuICAgIGNvbnN0IGFkYXB0ZXIgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKCk7XG4gICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ0ZhaWxlZCB0byBnZXQgR1BVIGFkYXB0ZXIuIFlvdSBtYXkgbmVlZCB0byBlbmFibGUgZmxhZyBcIi0tZW5hYmxlLXVuc2FmZS13ZWJncHVcIiBpZiB5b3UgYXJlIHVzaW5nIENocm9tZS4nKTtcbiAgICB9XG5cbiAgICBpZiAoIWVudi53YXNtLnNpbWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnTm90IHN1cHBvcnRlZCBmb3IgV2ViR1BVPU9OIGFuZCBTSU1EPU9GRi4gUGxlYXNlIHNldCBgZW52Lndhc20uc2ltZGAgdG8gdHJ1ZSB3aGVuIHVzaW5nIGB3ZWJncHVgIEVQJyk7XG4gICAgfVxuXG4gICAgLy8gaW5pdCBKU0VQIGlmIGF2YWlsYWJsZVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMsIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgICBjb25zdCBpbml0SnNlcCA9IHJlcXVpcmUoJy4vanNlcC9pbml0JykuaW5pdDtcbiAgICBhd2FpdCBpbml0SnNlcChnZXRJbnN0YW5jZSgpLCBlbnYsIGFkYXB0ZXIpO1xuICB9XG59O1xuXG4vLyAjZW5kcmVnaW9uIEluaXRpYWxpemF0aW9uc1xuXG4vKipcbiAqIHZhbGlkIGRhdGEgbG9jYXRpb25zIGZvciBpbnB1dC9vdXRwdXQgdGVuc29ycy5cbiAqL1xudHlwZSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dCA9ICdjcHUnfCdjcHUtcGlubmVkJ3wnZ3B1LWJ1ZmZlcic7XG5cbnR5cGUgSU9CaW5kaW5nU3RhdGUgPSB7XG4gIC8qKlxuICAgKiB0aGUgaGFuZGxlIG9mIElPIGJpbmRpbmcuXG4gICAqL1xuICByZWFkb25seSBoYW5kbGU6IG51bWJlcjtcblxuICAvKipcbiAgICogdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKlxuICAgKiB2YWx1ZSBpcyBvbmUgb2YgJ2NwdScsICdjcHUtcGlubmVkJywgJ2dwdS1idWZmZXInLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiByZWFkb25seSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdO1xuXG4gIC8qKlxuICAgKiBlbnVtIHZhbHVlIG9mIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuLyoqXG4gKiAgdHVwbGUgZWxlbWVudHMgYXJlOiBJbmZlcmVuY2VTZXNzaW9uIElEOyBpbnB1dE5hbWVzVVRGOEVuY29kZWQ7IG91dHB1dE5hbWVzVVRGOEVuY29kZWQ7IGJpbmRpbmdTdGF0ZVxuICovXG50eXBlIFNlc3Npb25NZXRhZGF0YSA9IFtcbiAgaW5mZXJlbmNlU2Vzc2lvbklkOiBudW1iZXIsIGlucHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sIG91dHB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLFxuICBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGxcbl07XG5cbmNvbnN0IGFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcDxudW1iZXIsIFNlc3Npb25NZXRhZGF0YT4oKTtcblxuLyoqXG4gKiBnZXQgdGhlIGlucHV0L291dHB1dCBjb3VudCBvZiB0aGUgc2Vzc2lvbi5cbiAqIEBwYXJhbSBzZXNzaW9uSGFuZGxlIHRoZSBoYW5kbGUgcmVwcmVzZW50aW5nIHRoZSBzZXNzaW9uLiBzaG91bGQgYmUgbm9uLXplcm8uXG4gKiBAcmV0dXJucyBhIHR1cGxlIGluY2x1ZGluZyAyIG51bWJlcnMsIHJlcHJlc2VudGluZyB0aGUgaW5wdXQgY291bnQgYW5kIG91dHB1dCBjb3VudC5cbiAqL1xuY29uc3QgZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQgPSAoc2Vzc2lvbkhhbmRsZTogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg4KTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRHZXRJbnB1dE91dHB1dENvdW50KHNlc3Npb25IYW5kbGUsIGRhdGFPZmZzZXQsIGRhdGFPZmZzZXQgKyA0KTtcbiAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgc2Vzc2lvbiBpbnB1dC9vdXRwdXQgY291bnQuJyk7XG4gICAgfVxuICAgIHJldHVybiBbd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDRdLCB3YXNtLkhFQVAzMltkYXRhT2Zmc2V0IC8gNCArIDFdXTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG5cbi8qKlxuICogYWxsb2NhdGUgdGhlIG1lbW9yeSBhbmQgbWVtY3B5IHRoZSBleHRlcm5hbCBidWZmZXIuXG4gKlxuICogQHBhcmFtIG1vZGVsIC0gdGhlIGV4dGVybmFsIGJ1ZmZlciBjb250YWluaW5nIHRoZSBtb2RlbCBkYXRhLiBNdXN0IG5vdCBiZSB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIFdBU00gaGVhcC5cbiAqIEByZXR1cm5zIGEgMi1lbGVtZW50cyB0dXBsZSAtIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBhbGxvY2F0ZWQgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBjb3B5RnJvbUV4dGVybmFsQnVmZmVyID0gKG1vZGVsOiBVaW50OEFycmF5KTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBtb2RlbERhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MobW9kZWwuYnl0ZUxlbmd0aCk7XG4gIGlmIChtb2RlbERhdGFPZmZzZXQgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNyZWF0ZSBhIHNlc3Npb24uIGZhaWxlZCB0byBhbGxvY2F0ZSBhIGJ1ZmZlciBvZiBzaXplICR7bW9kZWwuYnl0ZUxlbmd0aH0uYCk7XG4gIH1cbiAgd2FzbS5IRUFQVTguc2V0KG1vZGVsLCBtb2RlbERhdGFPZmZzZXQpO1xuICByZXR1cm4gW21vZGVsRGF0YU9mZnNldCwgbW9kZWwuYnl0ZUxlbmd0aF07XG59O1xuXG4vKipcbiAqIGNyZWF0ZSBhbiBpbmZlcmVuY2Ugc2Vzc2lvbiBmcm9tIGEgbW9kZWwgZGF0YSBidWZmZXIuXG4gKlxuICogQHBhcmFtIG1vZGVsRGF0YSAtIGVpdGhlciBhIFVpbnQ4QXJyYXkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbW9kZWwgZGF0YSwgb3IgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlXG4gKiAgICAgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgbW9kZWwgZGF0YSBidWZmZXIuXG4gKiBAcGFyYW0gb3B0aW9ucyBhbiBvcHRpb25hbCBzZXNzaW9uIG9wdGlvbnMgb2JqZWN0LlxuICogQHJldHVybnMgYSAzLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgW3Nlc3Npb24gaGFuZGxlLCBpbnB1dCBuYW1lcywgb3V0cHV0IG5hbWVzXVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbiA9IGFzeW5jKFxuICAgIG1vZGVsRGF0YTogVWludDhBcnJheXxTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcixcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8U2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhPiA9PiB7XG4gIGxldCBtb2RlbERhdGFPZmZzZXQ6IG51bWJlciwgbW9kZWxEYXRhTGVuZ3RoOiBudW1iZXI7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KG1vZGVsRGF0YSkpIHtcbiAgICAvLyBpZiBtb2RlbCBkYXRhIGlzIGFuIGFycmF5LCBpdCBtdXN0IGJlIGEgMi1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhXG4gICAgW21vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoXSA9IG1vZGVsRGF0YTtcbiAgfSBlbHNlIGlmIChtb2RlbERhdGEuYnVmZmVyID09PSB3YXNtLkhFQVBVOC5idWZmZXIpIHtcbiAgICAvLyBpZiBtb2RlbCBkYXRhIHVzZXMgdGhlIHNhbWUgYnVmZmVyIGFzIHRoZSBXQVNNIGhlYXAsIHdlIGRvbid0IG5lZWQgdG8gY29weSBpdC5cbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gW21vZGVsRGF0YS5ieXRlT2Zmc2V0LCBtb2RlbERhdGEuYnl0ZUxlbmd0aF07XG4gIH0gZWxzZSB7XG4gICAgLy8gb3RoZXJ3aXNlLCBjb3B5IHRoZSBtb2RlbCBkYXRhIHRvIHRoZSBXQVNNIGhlYXAuXG4gICAgW21vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoXSA9IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIobW9kZWxEYXRhKTtcbiAgfVxuXG4gIGxldCBzZXNzaW9uSGFuZGxlID0gMDtcbiAgbGV0IHNlc3Npb25PcHRpb25zSGFuZGxlID0gMDtcbiAgbGV0IGlvQmluZGluZ0hhbmRsZSA9IDA7XG4gIGxldCBhbGxvY3M6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuICBjb25zdCBvdXRwdXROYW1lc1VURjhFbmNvZGVkID0gW107XG5cbiAgdHJ5IHtcbiAgICBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc10gPSBzZXRTZXNzaW9uT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIGlmIChvcHRpb25zPy5leHRlcm5hbERhdGEgJiYgd2FzbS5tb3VudEV4dGVybmFsRGF0YSkge1xuICAgICAgY29uc3QgbG9hZGluZ1Byb21pc2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2Ygb3B0aW9ucy5leHRlcm5hbERhdGEpIHtcbiAgICAgICAgY29uc3QgcGF0aCA9IHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJyA/IGZpbGUgOiBmaWxlLnBhdGg7XG4gICAgICAgIGxvYWRpbmdQcm9taXNlcy5wdXNoKGxvYWRGaWxlKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJyA/IGZpbGUgOiBmaWxlLmRhdGEpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgd2FzbS5tb3VudEV4dGVybmFsRGF0YSEocGF0aCwgZGF0YSk7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgLy8gd2FpdCBmb3IgYWxsIGV4dGVybmFsIGRhdGEgZmlsZXMgdG8gYmUgbG9hZGVkXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChsb2FkaW5nUHJvbWlzZXMpO1xuICAgIH1cblxuICAgIHNlc3Npb25IYW5kbGUgPSBhd2FpdCB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uKG1vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoLCBzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgaWYgKHNlc3Npb25IYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBhIHNlc3Npb24uJyk7XG4gICAgfVxuXG4gICAgY29uc3QgW2lucHV0Q291bnQsIG91dHB1dENvdW50XSA9IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50KHNlc3Npb25IYW5kbGUpO1xuXG4gICAgY29uc3QgaW5wdXROYW1lcyA9IFtdO1xuICAgIGNvbnN0IG91dHB1dE5hbWVzID0gW107XG4gICAgY29uc3Qgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRJbnB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gaW5wdXQgbmFtZS4nKTtcbiAgICAgIH1cbiAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xuICAgICAgaW5wdXROYW1lcy5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG5hbWUpKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0T3V0cHV0TmFtZShzZXNzaW9uSGFuZGxlLCBpKTtcbiAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBvdXRwdXQgbmFtZS4nKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lKTtcbiAgICAgIGNvbnN0IG5hbWVTdHJpbmcgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lKTtcbiAgICAgIG91dHB1dE5hbWVzLnB1c2gobmFtZVN0cmluZyk7XG5cbiAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHR5cGVvZiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgb3B0aW9ucy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA6XG4gICAgICAgICAgICBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbj8uW25hbWVTdHJpbmddID8/ICdjcHUnO1xuICAgICAgICBpZiAobG9jYXRpb24gIT09ICdjcHUnICYmIGxvY2F0aW9uICE9PSAnY3B1LXBpbm5lZCcgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS5gKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaChsb2NhdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdXNlIElPIGJpbmRpbmcgb25seSB3aGVuIGF0IGxlYXN0IG9uZSBvdXRwdXQgaXMgcHJlZmZlcmVkIHRvIGJlIG9uIEdQVS5cbiAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsID0gbnVsbDtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnNvbWUobCA9PiBsID09PSAnZ3B1LWJ1ZmZlcicpKSB7XG4gICAgICBpb0JpbmRpbmdIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVCaW5kaW5nKHNlc3Npb25IYW5kbGUpO1xuICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgSU8gYmluZGluZy4nKTtcbiAgICAgIH1cblxuICAgICAgYmluZGluZ1N0YXRlID0ge1xuICAgICAgICBoYW5kbGU6IGlvQmluZGluZ0hhbmRsZSxcbiAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMubWFwKGwgPT4gZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGwpKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb25IYW5kbGUsIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGJpbmRpbmdTdGF0ZV0pO1xuICAgIHJldHVybiBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lcywgb3V0cHV0TmFtZXNdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuXG4gICAgaWYgKGlvQmluZGluZ0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nSGFuZGxlKTtcbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5fZnJlZShtb2RlbERhdGFPZmZzZXQpO1xuICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goYWxsb2MgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuXG4gICAgLy8gdW5tb3VudCBleHRlcm5hbCBkYXRhIGlmIG5lY2Vzc2FyeVxuICAgIHdhc20udW5tb3VudEV4dGVybmFsRGF0YT8uKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWxlYXNlIHNlc3Npb24uIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGVdID0gc2Vzc2lvbjtcblxuICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICB9XG5cbiAgd2FzbS5qc2VwVW5yZWdpc3RlckJ1ZmZlcnM/LihzZXNzaW9uSWQpO1xuXG4gIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xuICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IgPVxuICAgICh0ZW5zb3I6IFRlbnNvck1ldGFkYXRhfG51bGwsIHRlbnNvckhhbmRsZXM6IG51bWJlcltdLCBhbGxvY3M6IG51bWJlcltdLCBzZXNzaW9uSWQ6IG51bWJlciwgaW5kZXg6IG51bWJlcik6XG4gICAgICAgIHZvaWQgPT4ge1xuICAgICAgICAgIGlmICghdGVuc29yKSB7XG4gICAgICAgICAgICB0ZW5zb3JIYW5kbGVzLnB1c2goMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcbiAgICAgICAgICBjb25zdCBkaW1zID0gdGVuc29yWzFdO1xuICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGVuc29yWzNdO1xuXG4gICAgICAgICAgbGV0IHJhd0RhdGE6IG51bWJlcjtcbiAgICAgICAgICBsZXQgZGF0YUJ5dGVMZW5ndGg6IG51bWJlcjtcblxuICAgICAgICAgIGlmIChkYXRhVHlwZSA9PT0gJ3N0cmluZycgJiYgbG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgb24gR1BVLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICBjb25zdCBncHVCdWZmZXIgPSB0ZW5zb3JbMl0uZ3B1QnVmZmVyIGFzIEdQVUJ1ZmZlcjtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTaXplSW5CeXRlcyA9IGdldFRlbnNvckVsZW1lbnRTaXplKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSkhO1xuICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSBkaW1zLnJlZHVjZSgoYSwgYikgPT4gYSAqIGIsIDEpICogZWxlbWVudFNpemVJbkJ5dGVzO1xuICAgICAgICAgICAgcmF3RGF0YSA9IHdhc20uanNlcFJlZ2lzdGVyQnVmZmVyKHNlc3Npb25JZCwgaW5kZXgsIGdwdUJ1ZmZlciwgZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gdGVuc29yWzJdO1xuXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAvLyBzdHJpbmcgdGVuc29yXG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gNCAqIGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIGxldCBkYXRhSW5kZXggPSByYXdEYXRhIC8gNDtcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdGVuc29yIGRhdGEgYXQgaW5kZXggJHtpfSBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2FzbS5IRUFQVTMyW2RhdGFJbmRleCsrXSA9IGFsbG9jV2FzbVN0cmluZyhkYXRhW2ldLCBhbGxvY3MpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRhdGEuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgICAgICB3YXNtLkhFQVBVOC5zZXQobmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YUJ5dGVMZW5ndGgpLCByYXdEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gICAgICAgICAgY29uc3QgZGltc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogZGltcy5sZW5ndGgpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgZGltSW5kZXggPSBkaW1zT2Zmc2V0IC8gNDtcbiAgICAgICAgICAgIGRpbXMuZm9yRWFjaChkID0+IHdhc20uSEVBUDMyW2RpbUluZGV4KytdID0gZCk7XG4gICAgICAgICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXG4gICAgICAgICAgICAgICAgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpLCByYXdEYXRhLCBkYXRhQnl0ZUxlbmd0aCwgZGltc09mZnNldCwgZGltcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGxvY2F0aW9uKSk7XG4gICAgICAgICAgICBpZiAodGVuc29yID09PSAwKSB7XG4gICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBjcmVhdGUgdGVuc29yIGZvciBpbnB1dC9vdXRwdXQuIHNlc3Npb249JHtzZXNzaW9uSWR9LCBpbmRleD0ke2luZGV4fS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCh0ZW5zb3IpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4vKipcbiAqIHBlcmZvcm0gaW5mZXJlbmNlIHJ1blxuICovXG5leHBvcnQgY29uc3QgcnVuID0gYXN5bmMoXG4gICAgc2Vzc2lvbklkOiBudW1iZXIsIGlucHV0SW5kaWNlczogbnVtYmVyW10sIGlucHV0VGVuc29yczogVGVuc29yTWV0YWRhdGFbXSwgb3V0cHV0SW5kaWNlczogbnVtYmVyW10sXG4gICAgb3V0cHV0VGVuc29yczogQXJyYXk8VGVuc29yTWV0YWRhdGF8bnVsbD4sIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8VGVuc29yTWV0YWRhdGFbXT4gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCBydW4gaW5mZXJlbmNlLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlXSA9IHNlc3Npb247XG5cbiAgY29uc3QgaW5wdXRDb3VudCA9IGlucHV0SW5kaWNlcy5sZW5ndGg7XG4gIGNvbnN0IG91dHB1dENvdW50ID0gb3V0cHV0SW5kaWNlcy5sZW5ndGg7XG5cbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgcnVuT3B0aW9uc0FsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBpbnB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IG91dHB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGlucHV0T3V0cHV0QWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGJlZm9yZVJ1blN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgY29uc3QgaW5wdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBpbnB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG4gIGNvbnN0IG91dHB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG5cbiAgdHJ5IHtcbiAgICBbcnVuT3B0aW9uc0hhbmRsZSwgcnVuT3B0aW9uc0FsbG9jc10gPSBzZXRSdW5PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgLy8gY3JlYXRlIGlucHV0IHRlbnNvcnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKGlucHV0VGVuc29yc1tpXSwgaW5wdXRUZW5zb3JIYW5kbGVzLCBpbnB1dE91dHB1dEFsbG9jcywgc2Vzc2lvbklkLCBpbnB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBvdXRwdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICAgIG91dHB1dFRlbnNvcnNbaV0sIG91dHB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0Q291bnQgKyBvdXRwdXRJbmRpY2VzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgaW5wdXRWYWx1ZXNJbmRleCA9IGlucHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgaW5wdXROYW1lc0luZGV4ID0gaW5wdXROYW1lc09mZnNldCAvIDQ7XG4gICAgbGV0IG91dHB1dFZhbHVlc0luZGV4ID0gb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0TmFtZXNJbmRleCA9IG91dHB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0VmFsdWVzSW5kZXgrK10gPSBpbnB1dFRlbnNvckhhbmRsZXNbaV07XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXROYW1lc0luZGV4KytdID0gaW5wdXROYW1lc1VURjhFbmNvZGVkW2lucHV0SW5kaWNlc1tpXV07XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dFZhbHVlc0luZGV4KytdID0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltvdXRwdXROYW1lc0luZGV4KytdID0gb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtvdXRwdXRJbmRpY2VzW2ldXTtcbiAgICB9XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGNvbnN0IHtoYW5kbGUsIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucywgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZH0gPSBpb0JpbmRpbmdTdGF0ZTtcblxuICAgICAgaWYgKGlucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGggIT09IGlucHV0Q291bnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnB1dCBjb3VudCBmcm9tIGZlZWRzICgke1xuICAgICAgICAgICAgaW5wdXRDb3VudH0pIGlzIGV4cGVjdGVkIHRvIGJlIGFsd2F5cyBlcXVhbCB0byBtb2RlbCdzIGlucHV0IGNvdW50ICgke2lucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGh9KS5gKTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBpbnB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaW5wdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRCaW5kSW5wdXQoaGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBpbnB1dFRlbnNvckhhbmRsZXNbaV0pO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgaW5wdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgcHJlLWFsbG9jYXRlZCBvdXRwdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBvdXRwdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IG91dHB1dFRlbnNvcnNbaV0/LlszXTsgIC8vIHVuZGVmaW5lZCBtZWFucyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuXG5cbiAgICAgICAgaWYgKGxvY2F0aW9uKSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIHByZS1hbGxvY2F0ZWQuIGJpbmQgdGhlIHRlbnNvci5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIG91dHB1dFRlbnNvckhhbmRsZXNbaV0sIDApO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIHByZS1hbGxvY2F0ZWQgb3V0cHV0WyR7aX1dIGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLiByZXNldCBwcmVmZXJyZWQgbG9jYXRpb24uXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID1cbiAgICAgICAgICAgICAgd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCAwLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkW2luZGV4XSk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgb3V0cHV0WyR7aX1dIHRvICR7b3V0cHV0UHJlZmVycmVkTG9jYXRpb25zW2ldfSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGVycm9yQ29kZTogbnVtYmVyO1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlKSB7XG4gICAgICBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRSdW5XaXRoQmluZGluZyhcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpb0JpbmRpbmdTdGF0ZS5oYW5kbGUsIG91dHB1dENvdW50LCBvdXRwdXRWYWx1ZXNPZmZzZXQsIHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRSdW4oXG4gICAgICAgICAgc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc09mZnNldCwgaW5wdXRWYWx1ZXNPZmZzZXQsIGlucHV0Q291bnQsIG91dHB1dE5hbWVzT2Zmc2V0LCBvdXRwdXRDb3VudCxcbiAgICAgICAgICBvdXRwdXRWYWx1ZXNPZmZzZXQsIHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cblxuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdmYWlsZWQgdG8gY2FsbCBPcnRSdW4oKS4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRwdXQ6IFRlbnNvck1ldGFkYXRhW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgdGVuc29yID0gd2FzbS5IRUFQVTMyW291dHB1dFZhbHVlc09mZnNldCAvIDQgKyBpXTtcbiAgICAgIGlmICh0ZW5zb3IgPT09IG91dHB1dFRlbnNvckhhbmRsZXNbaV0pIHtcbiAgICAgICAgLy8gb3V0cHV0IHRlbnNvciBpcyBwcmUtYWxsb2NhdGVkLiBubyBuZWVkIHRvIGNvcHkgZGF0YS5cbiAgICAgICAgb3V0cHV0LnB1c2gob3V0cHV0VGVuc29yc1tpXSEpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYmVmb3JlR2V0VGVuc29yRGF0YVN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgIC8vIHN0YWNrIGFsbG9jYXRlIDQgcG9pbnRlciB2YWx1ZVxuICAgICAgY29uc3QgdGVuc29yRGF0YU9mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogNCk7XG5cbiAgICAgIGxldCBrZWVwT3V0cHV0VGVuc29yID0gZmFsc2U7XG4gICAgICBsZXQgdHlwZTogVGVuc29yLlR5cGV8dW5kZWZpbmVkLCBkYXRhT2Zmc2V0ID0gMDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldFRlbnNvckRhdGEoXG4gICAgICAgICAgICB0ZW5zb3IsIHRlbnNvckRhdGFPZmZzZXQsIHRlbnNvckRhdGFPZmZzZXQgKyA0LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgOCwgdGVuc29yRGF0YU9mZnNldCArIDEyKTtcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhY2Nlc3Mgb3V0cHV0IHRlbnNvciBkYXRhIG9uIGluZGV4ICR7aX0uYCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlbnNvckRhdGFJbmRleCA9IHRlbnNvckRhdGFPZmZzZXQgLyA0O1xuICAgICAgICBjb25zdCBkYXRhVHlwZSA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGRhdGFPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltc0xlbmd0aCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1zTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBkaW1zLnB1c2god2FzbS5IRUFQVTMyW2RpbXNPZmZzZXQgLyA0ICsgaV0pO1xuICAgICAgICB9XG4gICAgICAgIHdhc20uX09ydEZyZWUoZGltc09mZnNldCk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSk7XG4gICAgICAgIHR5cGUgPSB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZyhkYXRhVHlwZSk7XG5cbiAgICAgICAgY29uc3QgcHJlZmVycmVkTG9jYXRpb24gPSBpb0JpbmRpbmdTdGF0ZT8ub3V0cHV0UHJlZmVycmVkTG9jYXRpb25zW291dHB1dEluZGljZXNbaV1dO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmIChwcmVmZXJyZWRMb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHN0cmluZ0RhdGE6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgbGV0IGRhdGFJbmRleCA9IGRhdGFPZmZzZXQgLyA0O1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdO1xuICAgICAgICAgICAgY29uc3QgbWF4Qnl0ZXNUb1JlYWQgPSBpID09PSBzaXplIC0gMSA/IHVuZGVmaW5lZCA6IHdhc20uSEVBUFUzMltkYXRhSW5kZXhdIC0gb2Zmc2V0O1xuICAgICAgICAgICAgc3RyaW5nRGF0YS5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG9mZnNldCwgbWF4Qnl0ZXNUb1JlYWQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIHN0cmluZ0RhdGEsICdjcHUnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgYSBjZXJ0YWluIG91dHB1dCdzIHByZWZlcnJlZCBsb2NhdGlvbiBpcyBHUFUgYnV0IHRoZSB0ZW5zb3IgaXMgZW1wdHksIHdlIHN0aWxsIG5lZWQgdG8gY3JlYXRlIGEgQ1BVXG4gICAgICAgICAgLy8gdGVuc29yIGZvciBpdC4gVGhlcmUgaXMgbm8gbWFwcGluZyBHUFUgYnVmZmVyIGZvciBhbiBlbXB0eSB0ZW5zb3IuXG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicgJiYgc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHdhc20uanNlcEdldEJ1ZmZlcihkYXRhT2Zmc2V0KTtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTaXplID0gZ2V0VGVuc29yRWxlbWVudFNpemUoZGF0YVR5cGUpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRTaXplID09PSB1bmRlZmluZWQgfHwgIWlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkbyBub3QgcmVsZWFzZSB0aGUgdGVuc29yIHJpZ2h0IG5vdy4gaXQgd2lsbCBiZSByZWxlYXNlZCB3aGVuIHVzZXIgY2FsbHMgdGVuc29yLmRpc3Bvc2UoKS5cbiAgICAgICAgICAgIGtlZXBPdXRwdXRUZW5zb3IgPSB0cnVlO1xuXG4gICAgICAgICAgICBvdXRwdXQucHVzaChbXG4gICAgICAgICAgICAgIHR5cGUsIGRpbXMsIHtcbiAgICAgICAgICAgICAgICBncHVCdWZmZXIsXG4gICAgICAgICAgICAgICAgZG93bmxvYWQ6IHdhc20uanNlcENyZWF0ZURvd25sb2FkZXIoZ3B1QnVmZmVyLCBzaXplICogZWxlbWVudFNpemUsIHR5cGUpLFxuICAgICAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdncHUtYnVmZmVyJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcih0eXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgdHlwZWRBcnJheUNvbnN0cnVjdG9yKHNpemUpO1xuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKVxuICAgICAgICAgICAgICAgIC5zZXQod2FzbS5IRUFQVTguc3ViYXJyYXkoZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIGRhdGEuYnl0ZUxlbmd0aCkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIGRhdGEsICdjcHUnXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2spO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgZGF0YU9mZnNldCkge1xuICAgICAgICAgIHdhc20uX2ZyZWUoZGF0YU9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZWVwT3V0cHV0VGVuc29yKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlvQmluZGluZ1N0YXRlKSB7XG4gICAgICB3YXNtLl9PcnRDbGVhckJvdW5kT3V0cHV0cyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoYmVmb3JlUnVuU3RhY2spO1xuXG4gICAgaW5wdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBvdXRwdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBpbnB1dE91dHB1dEFsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG5cbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIHJ1bk9wdGlvbnNBbGxvY3MuZm9yRWFjaChwID0+IHdhc20uX2ZyZWUocCkpO1xuICB9XG59O1xuXG4vKipcbiAqIGVuZCBwcm9maWxpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGVuZFByb2ZpbGluZyA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2Vzc2lvbiBpZCcpO1xuICB9XG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xuXG4gIC8vIHByb2ZpbGUgZmlsZSBuYW1lIGlzIG5vdCB1c2VkIHlldCwgYnV0IGl0IG11c3QgYmUgZnJlZWQuXG4gIGNvbnN0IHByb2ZpbGVGaWxlTmFtZSA9IHdhc20uX09ydEVuZFByb2ZpbGluZyhzZXNzaW9uSGFuZGxlKTtcbiAgaWYgKHByb2ZpbGVGaWxlTmFtZSA9PT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBwcm9maWxlIGZpbGUgbmFtZS4nKTtcbiAgfVxuICB3YXNtLl9PcnRGcmVlKHByb2ZpbGVGaWxlTmFtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMgPSAodGVuc29yczogcmVhZG9ubHkgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSk6IEFycmF5QnVmZmVyTGlrZVtdID0+IHtcbiAgY29uc3QgYnVmZmVyczogQXJyYXlCdWZmZXJMaWtlW10gPSBbXTtcbiAgZm9yIChjb25zdCB0ZW5zb3Igb2YgdGVuc29ycykge1xuICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpICYmICdidWZmZXInIGluIGRhdGEpIHtcbiAgICAgIGJ1ZmZlcnMucHVzaChkYXRhLmJ1ZmZlcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBidWZmZXJzO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgbGliPVwid2Vid29ya2VyXCIgLz5cblxuLy9cbi8vICogdHlwZSBoYWNrIGZvciBcIkhUTUxJbWFnZUVsZW1lbnRcIlxuLy9cbi8vIGluIHR5cGVzY3JpcHQsIHRoZSB0eXBlIG9mIFwiSFRNTEltYWdlRWxlbWVudFwiIGlzIGRlZmluZWQgaW4gbGliLmRvbS5kLnRzLCB3aGljaCBpcyBjb25mbGljdCB3aXRoIGxpYi53ZWJ3b3JrZXIuZC50cy5cbi8vIHdoZW4gd2UgdXNlIHdlYndvcmtlciwgdGhlIGxpYi53ZWJ3b3JrZXIuZC50cyB3aWxsIGJlIHVzZWQsIHdoaWNoIGRvZXMgbm90IGhhdmUgSFRNTEltYWdlRWxlbWVudCBkZWZpbmVkLlxuLy9cbi8vIHdlIHdpbGwgZ2V0IHRoZSBmb2xsb3dpbmcgZXJyb3JzIGNvbXBsYWluaW5nIHRoYXQgSFRNTEltYWdlRWxlbWVudCBpcyBub3QgZGVmaW5lZDpcbi8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy9cbi8vIC4uL2NvbW1vbi9kaXN0L2Nqcy90ZW5zb3ItZmFjdG9yeS5kLnRzOjE4NzoyOSAtIGVycm9yIFRTMjU1MjogQ2Fubm90IGZpbmQgbmFtZSAnSFRNTEltYWdlRWxlbWVudCcuIERpZCB5b3UgbWVhblxuLy8gJ0hUTUxMSUVsZW1lbnQnP1xuLy9cbi8vIDE4NyAgICAgZnJvbUltYWdlKGltYWdlRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCwgb3B0aW9ucz86IFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zKTpcbi8vIFByb21pc2U8VHlwZWRUZW5zb3I8J2Zsb2F0MzInPiB8IFR5cGVkVGVuc29yPCd1aW50OCc+Pjtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfn5+fn5+fn5+fn5+fn5+flxuLy9cbi8vIG5vZGVfbW9kdWxlcy9Ad2ViZ3B1L3R5cGVzL2Rpc3QvaW5kZXguZC50czo4Mzo3IC0gZXJyb3IgVFMyNTUyOiBDYW5ub3QgZmluZCBuYW1lICdIVE1MSW1hZ2VFbGVtZW50Jy4gRGlkIHlvdSBtZWFuXG4vLyAnSFRNTExJRWxlbWVudCc/XG4vL1xuLy8gODMgICAgIHwgSFRNTEltYWdlRWxlbWVudFxuLy8gICAgICAgICAgfn5+fn5+fn5+fn5+fn5+flxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gYEhUTUxJbWFnZUVsZW1lbnRgIGlzIG9ubHkgdXNlZCBpbiB0eXBlIGRlY2xhcmF0aW9uIGFuZCBub3QgaW4gcmVhbCBjb2RlLiBTbyB3ZSBkZWZpbmUgaXQgYXMgYHVua25vd25gIGhlcmUgdG9cbi8vIGJ5cGFzcyB0aGUgdHlwZSBjaGVjay5cbi8vXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHR5cGUgSFRNTEltYWdlRWxlbWVudCA9IHVua25vd247XG59XG5cbmltcG9ydCB7T3J0V2FzbU1lc3NhZ2UsIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhfSBmcm9tICcuLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge2NyZWF0ZVNlc3Npb24sIGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIsIGVuZFByb2ZpbGluZywgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMsIGluaXRFcCwgaW5pdFJ1bnRpbWUsIHJlbGVhc2VTZXNzaW9uLCBydW59IGZyb20gJy4uL3dhc20tY29yZS1pbXBsJztcbmltcG9ydCB7aW5pdGlhbGl6ZVdlYkFzc2VtYmx5fSBmcm9tICcuLi93YXNtLWZhY3RvcnknO1xuXG5zZWxmLm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50PE9ydFdhc21NZXNzYWdlPik6IHZvaWQgPT4ge1xuICBjb25zdCB7dHlwZSwgaW4gOiBtZXNzYWdlfSA9IGV2LmRhdGE7XG4gIHRyeSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdpbml0LXdhc20nOlxuICAgICAgICBpbml0aWFsaXplV2ViQXNzZW1ibHkobWVzc2FnZSEud2FzbSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGluaXRSdW50aW1lKG1lc3NhZ2UhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbml0LWVwJzoge1xuICAgICAgICBjb25zdCB7ZXBOYW1lLCBlbnZ9ID0gbWVzc2FnZSE7XG4gICAgICAgIGluaXRFcChlbnYsIGVwTmFtZSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2NvcHktZnJvbSc6IHtcbiAgICAgICAgY29uc3Qge2J1ZmZlcn0gPSBtZXNzYWdlITtcbiAgICAgICAgY29uc3QgYnVmZmVyRGF0YSA9IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIoYnVmZmVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIG91dDogYnVmZmVyRGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2NyZWF0ZSc6IHtcbiAgICAgICAgY29uc3Qge21vZGVsLCBvcHRpb25zfSA9IG1lc3NhZ2UhO1xuICAgICAgICBjcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgc2Vzc2lvbk1ldGFkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdyZWxlYXNlJzpcbiAgICAgICAgcmVsZWFzZVNlc3Npb24obWVzc2FnZSEpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZX0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3J1bic6IHtcbiAgICAgICAgY29uc3Qge3Nlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnN9ID0gbWVzc2FnZSE7XG4gICAgICAgIHJ1bihzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBuZXcgQXJyYXkob3V0cHV0SW5kaWNlcy5sZW5ndGgpLmZpbGwobnVsbCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBvdXRwdXRzID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXRzLnNvbWUobyA9PiBvWzNdICE9PSAnY3B1JykpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycjogJ1Byb3h5IGRvZXMgbm90IHN1cHBvcnQgbm9uLWNwdSB0ZW5zb3IgbG9jYXRpb24uJ30pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB7dHlwZSwgb3V0OiBvdXRwdXRzfSBhcyBPcnRXYXNtTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzKG91dHB1dHMgYXMgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdlbmQtcHJvZmlsaW5nJzpcbiAgICAgICAgZW5kUHJvZmlsaW5nKG1lc3NhZ2UhKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGV9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICB9XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUFhLFVBQWtDLGNBQXNDO0FBQXJGO0FBQUE7QUFBTyxNQUFNLFdBQVc7QUFBaUIsTUFBTSxlQUFlO0FBQWlCLE1BQU0sbUJBQW1CO0FBQUE7QUFBQTs7O0FDQXhHO0FBQUE7QUFBQSxnQkFBQUE7QUFBQTtBQUFBLE1BQWFBO0FBQWI7QUFBQTtBQUFPLE1BQU1BLFFBQU87QUFBQTtBQUFBOzs7QUNBcEI7QUFBQTtBQUFBO0FBQ0EsVUFBSSxXQUFXLE1BQU07QUFDbkIsWUFBSSxhQUFhLE9BQU8sYUFBYSxlQUFlLFNBQVMsZ0JBQWdCLFNBQVMsY0FBYyxNQUFNO0FBQzFHLFlBQUksT0FBTyxlQUFlO0FBQWEsdUJBQWEsY0FBYztBQUNsRSxlQUNGLFNBQVMsWUFBWSxDQUFDLEdBQUc7QUFFekIsY0FBSSxJQUFFLFdBQVUsSUFBRztBQUFFLFlBQUUsUUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFFLE1BQUk7QUFBQyxpQkFBRztBQUFFLGdCQUFFO0FBQUEsVUFBQyxDQUFDO0FBQUUsY0FBSSxLQUFHLE9BQU8sT0FBTyxDQUFDLEdBQUUsQ0FBQyxHQUFFLEtBQUcsa0JBQWlCLEtBQUcsWUFBVSxPQUFPLFFBQU8sSUFBRSxjQUFZLE9BQU8sZUFBYyxLQUFHLFlBQVUsT0FBTyxXQUFTLFlBQVUsT0FBTyxRQUFRLFlBQVUsWUFBVSxPQUFPLFFBQVEsU0FBUyxNQUFLLElBQUUsSUFBRyxJQUFHLEdBQUU7QUFDMVIsY0FBRyxJQUFHO0FBQUMsZ0JBQUksS0FBRyx1Q0FBYyxLQUFHO0FBQWdCLGdCQUFFLElB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QUM7QUFBRyxnQkFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQUUsZ0JBQUcsQ0FBQztBQUFFLHFCQUFPO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFHLElBQUUsSUFBRSxFQUFFO0FBQVcscUJBQU87QUFBRSxnQkFBRztBQUFDLHFCQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsR0FBRSxJQUFFLENBQUMsR0FBRSxNQUFJLE1BQUksQ0FBQyxHQUFFO0FBQUEsWUFBQyxRQUFNO0FBQUMscUJBQU87QUFBQSxZQUFDO0FBQUEsVUFBQyxFQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFO0FBQUMsaUJBQUssS0FBRyxJQUFFO0FBQUcsaUJBQUssS0FBRyxTQUFTLEdBQUU7QUFBQyxnQkFBRSxLQUFLLEtBQUcsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBRSxpQkFBSyxLQUFHLFNBQVMsR0FBRTtBQUFDLGdCQUFFLEtBQUssS0FBRyxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUEsWUFBQztBQUFFLGlCQUFLLEtBQUcsU0FBUyxHQUFFLEdBQUU7QUFBQyxtQkFBSyxHQUFHO0FBQUUsbUJBQUssR0FBRyxDQUFDO0FBQUUsbUJBQUssR0FBRyxDQUFDO0FBQUEsWUFBQztBQUFFLGlCQUFLLEtBQUcsV0FBVTtBQUFDLGdCQUFFLEtBQUssS0FBRyxPQUFLLE1BQUksQ0FBQyxJQUFFO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFDdGQsY0FBSSxLQUFHLEdBQUUsS0FBRyxHQUFFLEtBQUcsZUFBYSxPQUFPLGNBQVksSUFBSSxZQUFZLE1BQU0sSUFBRSxRQUFPLEtBQUcsQ0FBQyxHQUFFLEdBQUUsTUFBSTtBQUFDLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxJQUFFO0FBQUUsaUJBQUksSUFBRSxHQUFFLEVBQUUsQ0FBQyxLQUFHLEVBQUUsS0FBRztBQUFJLGdCQUFFO0FBQUUsZ0JBQUcsS0FBRyxJQUFFLEtBQUcsRUFBRSxVQUFRO0FBQUcscUJBQU8sR0FBRyxPQUFPLEVBQUUsU0FBUyxHQUFFLENBQUMsQ0FB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QUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBRSxFQUFFO0FBQUcsbUJBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLEtBQUc7QUFBSSxxQkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyx1QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUcsRUFBRSxLQUFHLEdBQUUsTUFBSSxFQUFFLEVBQUUsS0FBRyxJQUFJLElBQUUsS0FBRyxJQUFJLEdBQUc7QUFBRTtBQUFDLHFCQUFPLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE1BQUksTUFBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSyxNQUFLLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxNQUFJLEtBQUssTUFBSyxPQUFHLEVBQUUsTUFBSSxHQUFFLE1BQUssT0FBRyxFQUFFLEtBQUssT0FBTyxFQUFFLEtBQUcsSUFBRSxFQUFFLE1BQUksQ0FBQyxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQ25mO0FBQUMsa0JBQUksSUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFHLEtBQUcsRUFBRSxLQUFHLEtBQUcsS0FBRyxDQUFDO0FBQUUsb0JBQUksRUFBRSxLQUFHLE1BQUksRUFBRSxLQUFHLEtBQUcsS0FBRztBQUFJLGtCQUFHO0FBQUUsc0JBQUksTUFBSSxL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R0FBRTtBQUFDLHFCQUN2ZjtBQUFFLHFCQUFLO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxHQUFHLEdBQUUsV0FBVztBQUFFLHFCQUFPLEdBQUcsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxrQkFBRSxFQUFFLE1BQUksQ0FBQztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUscUJBQU8sRUFBRSxNQUFLLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxxQkFBSztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxHQUFHLENBQUM7QUFBRSxxQkFBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxFQUFFLENBQUM7QUFBRSxxQkFBTyxLQUFHO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFHLE1BQUk7QUFBRSx1QkFBTyxFQUFFLEdBQUcsQ0FBQztBQUFFLGtCQUFFLEdBQUcsQ0FBQztBQUFFLHFCQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRTtBQUFDLGtCQUFFLEdBQUcsR0FBRSxNQUFJLENBQUM7QUFBRSxrQkFBSSxJQUFFLEVBQUUsTUFBTTtBQUFFO0FBQUksa0JBQUksSUFBRSx5REFBd0QsSUFBRSxHQUFFLElBQUUsQ0FB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QUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLGdCQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsS0FBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGdCQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLEtBQUcsRUFBRSxrQkFBa0I7QUFBRyxrQkFBSSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0IsR0FBRSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxnQkFBRSxJQUNuZixPQUFLLE1BQUksQ0FBQyxLQUFHLEtBQUcsS0FBRyxFQUFFLGtCQUFrQixLQUFHLEtBQUssSUFBSSxHQUFFLENBQUMsS0FBRztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBSSxJQUFFLElBQUksS0FBSyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxNQUFLLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxDQUFDLEdBQUUsSUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFFLEVBQUUsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDO0FBQUUsa0JBQUUsSUFBRSxFQUFFLElBQUUs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QkFBSSxJQUFFLEVBQUUsR0FBRztBQUFFLGtCQUFHLElBQUUsS0FBSTtBQUFDLG9CQUFJLElBQUUsRUFBRSxHQUFHLElBQUU7QUFBRyxvQkFBRyxRQUFNLElBQUU7QUFBSyx1QkFBRyxPQUFPLGNBQWMsSUFBRSxPQUFLLElBQUUsQ0FBQztBQUFBLHFCQUFNO0FBQUMsc0JBQUksSUFBRSxFQUFFLEdBQUcsSUFBRTtBQUFHLHNCQUFFLFFBQU0sSUFBRSxRQUFNLElBQUUsT0FBSyxLQUFHLEtBQUcsSUFBRSxLQUFHLElBQUUsTUFBSSxLQUFHLEtBQUcsS0FBRyxLQUFHLElBQUUsRUFBRSxHQUFHLElBQUU7QUFBRywwQkFBTSxJQUFFLEtBQUcsT0FBTyxhQUFhLENBQUMsS0FBRyxLQUFHLE9BQU0sS0FBRyxPQUFPLGFBQWEsUUFBTSxLQUFHLElBQUcsUUFBTSxJQUFFLElBQUk7QUFBQSxnQkFBRTtBQUFBLGNBQUM7QUFBTSxxQkFBRyxPQUFPLGFBQWEsQ0FBQztBQUFBLFlBQUM7QUFBQyxtQkFBTztBQUFBLFVBQUMsR0FBRSxJQUFFLENBQUMsR0FBRSxPQUFLLE9BQUssS0FBRyxHQUFHLEVBQUUsR0FBRSxHQUFFLENBQUMsSUFBRSxJQUFHLEtBQUcsT0FBRztBQUFDLGdCQUFJLElBQUUsR0FBRztBQUFFLGdCQUFFLEVBQUU7QUFBRSxlQUFHLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFDOVksbUJBQVMsRUFBRSxHQUFFLEdBQUU7QUFBQyxnQkFBSSxJQUFFLFVBQVUsU0FBTyxHQUFFLElBQUU7QUFBVSxtQkFBTyxHQUFHLE1BQUk7QUFBQyx1QkFBUSxJQUFFLElBQUUsR0FBRSxJQUFFLEdBQUcsSUFBRSxDQUFDLEdBQUUsSUFBRSxNQUFJLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsb0JBQUksSUFBRSxFQUFFLElBQUUsQ0FBQztBQUFFLDRCQUFVLE9BQU8sS0FBRyxFQUFFLElBQUUsSUFBRSxDQUFDLElBQUUsSUFBRyxFQUFFLElBQUUsSUFBRSxJQUFFLENBQUMsSUFBRSxNQUFJ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QyxJQUFFLE1BQUksSUFBRTtBQUFBLGNBQUU7QUFBQSxZQUFDO0FBQUMsY0FBRSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPLElBQUU7QUFBQSxVQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsR0FBRSxNQUFJLEdBQUcsR0FBRSxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFD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QUFBQyxrQkFBSSxJQUFFLElBQUU7QUFBRSxrQkFBRSxFQUFFLEVBQUUsSUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBSSxJQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sRUFBRTtBQUFFLGtCQUFFLEVBQUUsUUFBTSxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVcsQ0FBQztBQUFFLGdCQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFHLEVBQUUsU0FBTztBQUFBLFlBQUMsQ0FBQztBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLENBQUM7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxHQUFHO0FBQUUsY0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRTtBQUFPLGdCQUFJLElBQUU7QUFBRSxjQUFFLFFBQVEsT0FBRyxLQUFHLEVBQUUsU0FBTyxDQUFDO0FBQUUsY0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBTyxJQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFDcGMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFFO0FBQUMsY0FBSSxLQUFHLENBQUMsTUFBSyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxx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QUUsRUFBQyxJQUFHLEVBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsSUFBRSxFQUFFLENBQUMsSUFBRSxHQUFFO0FBQUUsZ0JBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQUU7QUFBQSxjQUFDLE1BQUs7QUFBQSxjQUF1QixNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBSyxNQUFLO0FBQUEsY0FBYyxNQUFLO0FBQUEsY0FBUSxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FDbmYsTUFBSztBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLFlBQUk7QUFBRSxxQkFBUSxLQUFLO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsQ0FBQztBQUFFLGdCQUFJLElBQUUsMkRBQTJELE1BQU0sR0FBRyxHQUFFLElBQUUsd0ZBQXdGLE1BQU0sR0FBRztBQUFFLGdCQUFFLEVBQUMsTUFBSyxPQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQ3pmLEVBQUUsRUFBRSxFQUFFLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEVBQUUsR0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEtBQUcsUUFBTSxNQUFJLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsa0JBQUUsRUFBRTtBQUFHLG1CQUFHLElBQUUsSUFBRSxLQUFHLEtBQUcsTUFBSSxLQUFHO0FBQUkscUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHO0FBQUMsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyxxQkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxZQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDLEdBQUUsTUFBSyxNQUFJ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QjtBQUNqQiwwQkFBWSxFQUFDLE1BQU0sS0FBSyxnQkFBZSxDQUFtQjtBQUFBLFlBQzVEO0FBQUEsWUFDQSxTQUFPO0FBQ0wsMEJBQVksRUFBQyxNQUFNLElBQUcsQ0FBQztBQUFBLFlBQ3pCO0FBQUEsVUFBQztBQUNUO0FBQUEsUUFDRjtBQUFBLFFBQ0EsS0FBSztBQUNILHlCQUFlLE9BQVE7QUFDdkIsc0JBQVksRUFBQyxLQUFJLENBQUM7QUFDbEI7QUFBQSxRQUNGLEtBQUssT0FBTztBQUNWLGdCQUFNLEVBQUMsV0FBVyxjQUFjLFFBQVEsZUFBZSxRQUFPLElBQUk7QUFDbEUsY0FBSSxXQUFXLGNBQWMsUUFBUSxlQUFlLElBQUksTUFBTSxjQUFjLE1BQU0sRUFBRSxLQUFLLElBQUksR0FBRyxPQUFPLEVBQ2xHO0FBQUEsWUFDRyxhQUFXO0FBQ1Qsa0JBQUksUUFBUSxLQUFLLE9BQUssRUFBRSxDQUFDLE1BQU0sS0FBSyxHQUFHO0FBQ3JDLDRCQUFZLEVBQUMsTUFBTSxLQUFLLGtEQUFpRCxDQUFDO0FBQUEsY0FDNUUsT0FBTztBQUNMO0FBQUEsa0JBQ0ksRUFBQyxNQUFNLEtBQUssUUFBTztBQUFBLGtCQUNuQiwyQkFBMkIsT0FBdUM7QUFBQSxnQkFBQztBQUFBLGNBQ3pFO0FBQUEsWUFDRjtBQUFBLFlBQ0EsU0FBTztBQUNMLDBCQUFZLEVBQUMsTUFBTSxJQUFHLENBQUM7QUFBQSxZQUN6QjtBQUFBLFVBQUM7QUFDVDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLEtBQUs7QUFDSCx1QkFBYSxPQUFRO0FBQ3JCLHNCQUFZLEVBQUMsS0FBSSxDQUFDO0FBQ2xCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFNBQVMsS0FBSztBQUNaLGtCQUFZLEVBQUMsTUFBTSxJQUFHLENBQW1CO0FBQUEsSUFDM0M7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJqb2luIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInJlYWRGaWxlIiwgInJlYWRGaWxlIiwgIndhc20iLCAidGVuc29yIiwgImVycm9yQ29kZSIsICJpIl0KfQo=\n';
  }
});

// web/lib/wasm/proxy-wrapper.ts
var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, queuedCallbacks, enqueueCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
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
    queuedCallbacks = /* @__PURE__ */ new Map();
    enqueueCallbacks = (type, callbacks) => {
      const queue = queuedCallbacks.get(type);
      if (queue) {
        queue.push(callbacks);
      } else {
        queuedCallbacks.set(type, [callbacks]);
      }
    };
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
        case "init-ep":
        case "copy-from":
        case "create":
        case "release":
        case "run":
        case "end-profiling": {
          const callbacks = queuedCallbacks.get(ev.data.type);
          if (ev.data.err) {
            callbacks.shift()[1](ev.data.err);
          } else {
            callbacks.shift()[0](ev.data.out);
          }
          break;
        }
        default:
      }
    };
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
    initializeWebAssemblyAndOrtRuntime = async () => {
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
      if (isProxy()) {
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
          const message = { type: "init-wasm", in: env2 };
          proxyWorker.postMessage(message);
        });
      } else {
        try {
          await initializeWebAssembly(env2.wasm);
          await initRuntime(env2);
          initialized2 = true;
        } catch (e) {
          aborted2 = true;
          throw e;
        } finally {
          initializing2 = false;
        }
      }
    };
    initializeOrtEp = async (epName) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("init-ep", [resolve, reject]);
          const message = { type: "init-ep", in: { epName, env: env2 } };
          proxyWorker.postMessage(message);
        });
      } else {
        await initEp(env2, epName);
      }
    };
    copyFromExternalBuffer2 = async (buffer) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("copy-from", [resolve, reject]);
          const message = { type: "copy-from", in: { buffer } };
          proxyWorker.postMessage(message, [buffer.buffer]);
        });
      } else {
        return copyFromExternalBuffer(buffer);
      }
    };
    createSession2 = async (model, options) => {
      if (isProxy()) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("create", [resolve, reject]);
          const message = { type: "create", in: { model, options } };
          const transferable = [];
          if (model instanceof Uint8Array) {
            transferable.push(model.buffer);
          }
          proxyWorker.postMessage(message, transferable);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("release", [resolve, reject]);
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
          enqueueCallbacks("run", [resolve, reject]);
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
          enqueueCallbacks("end-profiling", [resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
  }
});

// web/lib/wasm/session-handler-inference.ts
var encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    init_wasm_utils_load_file();
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
      async fetchModelAndCopyToWasmMemory(path) {
        return copyFromExternalBuffer2(await loadFile(path));
      }
      async loadModel(pathOrBuffer, options) {
        TRACE_FUNC_BEGIN();
        let model;
        if (typeof pathOrBuffer === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            model = await loadFile(pathOrBuffer);
          } else {
            model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
          }
        } else {
          model = pathOrBuffer;
        }
        [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
        TRACE_FUNC_END();
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        TRACE_FUNC_BEGIN();
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
        TRACE_FUNC_END();
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
      if (typeof env2.wasm.trace !== "boolean") {
        env2.wasm.trace = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      /**
       * This function initializes the WebAssembly backend.
       *
       * This function will be called only once for each backend name. It will be called the first time when
       * `ort.InferenceSession.create()` is called with a registered backend name.
       *
       * @param backendName - the registered backend name.
       */
      async init(backendName) {
        initializeFlags();
        await initializeWebAssemblyAndOrtRuntime();
        await initializeOrtEp(backendName);
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
var lib_exports = {};
__export(lib_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
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
  const wasmBackend2 = true ? (init_backend_wasm_inference(), __toCommonJS(backend_wasm_inference_exports)).wasmBackend : null.wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
    registerBackend("webnn", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });