/*!
 * ONNX Runtime Web v1.17.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var ort = (() => {
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

  // common/dist/esm/inference-session-impl.js
  var InferenceSession;
  var init_inference_session_impl = __esm({
    "common/dist/esm/inference-session-impl.js"() {
      "use strict";
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
  var TrainingSession;
  var init_training_session_impl = __esm({
    "common/dist/esm/training-session-impl.js"() {
      "use strict";
      TrainingSession = class {
        constructor(handler) {
          this.handler = handler;
        }
        get inputNames() {
          return this.handler.inputNames;
        }
        get outputNames() {
          return this.handler.outputNames;
        }
        static async create(_trainingOptions, _sessionOptions) {
          throw new Error("Method not implemented");
        }
        async loadParametersBuffer(_array, _trainableOnly) {
          throw new Error("Method not implemented.");
        }
        async getContiguousParameters(_trainableOnly) {
          throw new Error("Method not implemented.");
        }
        async runTrainStep(_feeds, _fetches, _options) {
          throw new Error("Method not implemented.");
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
  var init_esm = __esm({
    "common/dist/esm/index.js"() {
      "use strict";
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
          var h = moduleArg, aa, ba;
          h.ready = new Promise((a, b) => {
            aa = a;
            ba = b;
          });
          var ca = Object.assign({}, h), da = "./this.program", ea = "object" == typeof window, m = "function" == typeof importScripts, fa = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, p = "", ha, t, w;
          if (fa) {
            var fs = (init_fs(), __toCommonJS(fs_exports)), ia = (init_path(), __toCommonJS(path_exports));
            p = m ? ia.dirname(p) + "/" : __dirname + "/";
            ha = (a, b) => {
              a = a.startsWith("file://") ? new URL(a) : ia.normalize(a);
              return fs.readFileSync(a, b ? void 0 : "utf8");
            };
            w = (a) => {
              a = ha(a, true);
              a.buffer || (a = new Uint8Array(a));
              return a;
            };
            t = (a, b, c, d = true) => {
              a = a.startsWith("file://") ? new URL(a) : ia.normalize(a);
              fs.readFile(a, d ? void 0 : "utf8", (e, g) => {
                e ? c(e) : b(d ? g.buffer : g);
              });
            };
            !h.thisProgram && 1 < process.argv.length && (da = process.argv[1].replace(/\\/g, "/"));
            process.argv.slice(2);
            h.inspect = () => "[Emscripten Module object]";
          } else if (ea || m)
            m ? p = self.location.href : "undefined" != typeof document && document.currentScript && (p = document.currentScript.src), _scriptDir && (p = _scriptDir), 0 !== p.indexOf("blob:") ? p = p.substr(0, p.replace(/[?#].*/, "").lastIndexOf("/") + 1) : p = "", ha = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.send(null);
              return b.responseText;
            }, m && (w = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.responseType = "arraybuffer";
              b.send(null);
              return new Uint8Array(b.response);
            }), t = (a, b, c) => {
              var d = new XMLHttpRequest();
              d.open("GET", a, true);
              d.responseType = "arraybuffer";
              d.onload = () => {
                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
              };
              d.onerror = c;
              d.send(null);
            };
          var ja = console.log.bind(console), x = console.error.bind(console);
          Object.assign(h, ca);
          ca = null;
          "object" != typeof WebAssembly && ka("no native wasm support detected");
          var z, la = false, A, B, C, D, E, G, ma, na, oa, pa;
          function qa() {
            var a = z.buffer;
            h.HEAP8 = A = new Int8Array(a);
            h.HEAP16 = C = new Int16Array(a);
            h.HEAPU8 = B = new Uint8Array(a);
            h.HEAPU16 = D = new Uint16Array(a);
            h.HEAP32 = E = new Int32Array(a);
            h.HEAPU32 = G = new Uint32Array(a);
            h.HEAPF32 = ma = new Float32Array(a);
            h.HEAPF64 = pa = new Float64Array(a);
            h.HEAP64 = na = new BigInt64Array(a);
            h.HEAPU64 = oa = new BigUint64Array(a);
          }
          var ra = [], sa = [], ta = [], I = 0, ua = null, J = null;
          function ka(a) {
            a = "Aborted(" + a + ")";
            x(a);
            la = true;
            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
            ba(a);
            throw a;
          }
          function va(a) {
            return a.startsWith("data:application/octet-stream;base64,");
          }
          var K;
          K = "ort-wasm.wasm";
          if (!va(K)) {
            var wa = K;
            K = h.locateFile ? h.locateFile(wa, p) : p + wa;
          }
          function xa(a) {
            if (w)
              return w(a);
            throw "both async and sync fetching of the wasm failed";
          }
          function ya(a) {
            if (ea || m) {
              if ("function" == typeof fetch && !a.startsWith("file://"))
                return fetch(a, { credentials: "same-origin" }).then((b) => {
                  if (!b.ok)
                    throw "failed to load wasm binary file at '" + a + "'";
                  return b.arrayBuffer();
                }).catch(() => xa(a));
              if (t)
                return new Promise((b, c) => {
                  t(a, (d) => b(new Uint8Array(d)), c);
                });
            }
            return Promise.resolve().then(() => xa(a));
          }
          function za(a, b, c) {
            return ya(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
              x(`failed to asynchronously prepare wasm: ${d}`);
              ka(d);
            });
          }
          function Aa(a, b) {
            var c = K;
            return "function" != typeof WebAssembly.instantiateStreaming || va(c) || c.startsWith("file://") || fa || "function" != typeof fetch ? za(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
              x(`wasm streaming compile failed: ${e}`);
              x("falling back to ArrayBuffer instantiation");
              return za(c, a, b);
            }));
          }
          function Ba(a) {
            this.Va = a - 24;
            this.fb = function(b) {
              G[this.Va + 4 >>> 2 >>> 0] = b;
            };
            this.eb = function(b) {
              G[this.Va + 8 >>> 2 >>> 0] = b;
            };
            this.Za = function(b, c) {
              this.$a();
              this.fb(b);
              this.eb(c);
            };
            this.$a = function() {
              G[this.Va + 16 >>> 2 >>> 0] = 0;
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
                var g = a[b++] & 63;
                if (192 == (e & 224))
                  d += String.fromCharCode((e & 31) << 6 | g);
                else {
                  var l = a[b++] & 63;
                  e = 224 == (e & 240) ? (e & 15) << 12 | g << 6 | l : (e & 7) << 18 | g << 12 | l << 6 | a[b++] & 63;
                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
                }
              } else
                d += String.fromCharCode(e);
            }
            return d;
          }, L = (a, b) => (a >>>= 0) ? Fa(B, a, b) : "", M = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            return b;
          }, N = (a, b, c, d) => {
            c >>>= 0;
            if (!(0 < d))
              return 0;
            var e = c;
            d = c + d - 1;
            for (var g = 0; g < a.length; ++g) {
              var l = a.charCodeAt(g);
              if (55296 <= l && 57343 >= l) {
                var k = a.charCodeAt(++g);
                l = 65536 + ((l & 1023) << 10) | k & 1023;
              }
              if (127 >= l) {
                if (c >= d)
                  break;
                b[c++ >>> 0] = l;
              } else {
                if (2047 >= l) {
                  if (c + 1 >= d)
                    break;
                  b[c++ >>> 0] = 192 | l >> 6;
                } else {
                  if (65535 >= l) {
                    if (c + 2 >= d)
                      break;
                    b[c++ >>> 0] = 224 | l >> 12;
                  } else {
                    if (c + 3 >= d)
                      break;
                    b[c++ >>> 0] = 240 | l >> 18;
                    b[c++ >>> 0] = 128 | l >> 12 & 63;
                  }
                  b[c++ >>> 0] = 128 | l >> 6 & 63;
                }
                b[c++ >>> 0] = 128 | l & 63;
              }
            }
            b[c >>> 0] = 0;
            return c - e;
          }, Ga = (a) => {
            if (null === a)
              return "null";
            var b = typeof a;
            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
          }, Ha, O = (a) => {
            for (var b = ""; B[a >>> 0]; )
              b += Ha[B[a++ >>> 0]];
            return b;
          }, Ia = {}, Ja = {}, Ka = {}, P;
          function La(a, b, c = {}) {
            var d = b.name;
            if (!a)
              throw new P(`type "${d}" must have a positive integer typeid pointer`);
            if (Ja.hasOwnProperty(a)) {
              if (c.gb)
                return;
              throw new P(`Cannot register type '${d}' twice`);
            }
            Ja[a] = b;
            delete Ka[a];
            Ia.hasOwnProperty(a) && (b = Ia[a], delete Ia[a], b.forEach((e) => e()));
          }
          function Q(a, b, c = {}) {
            if (!("argPackAdvance" in b))
              throw new TypeError("registerType registeredInstance requires argPackAdvance");
            La(a, b, c);
          }
          var Ma = (a, b, c) => {
            switch (b) {
              case 1:
                return c ? (d) => A[d >>> 0 >>> 0] : (d) => B[d >>> 0 >>> 0];
              case 2:
                return c ? (d) => C[d >>> 1 >>> 0] : (d) => D[d >>> 1 >>> 0];
              case 4:
                return c ? (d) => E[d >>> 2 >>> 0] : (d) => G[d >>> 2 >>> 0];
              case 8:
                return c ? (d) => na[d >>> 3] : (d) => oa[d >>> 3];
              default:
                throw new TypeError(`invalid integer width (${b}): ${a}`);
            }
          };
          function Na() {
            this.Sa = [void 0];
            this.bb = [];
          }
          var R = new Na();
          function Oa(a) {
            a >>>= 0;
            a >= R.Va && 0 === --R.get(a).cb && R.$a(a);
          }
          var S = (a) => {
            if (!a)
              throw new P("Cannot use deleted val. handle = " + a);
            return R.get(a).value;
          }, T = (a) => {
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
                return R.Za({ cb: 1, value: a });
            }
          };
          function Pa(a) {
            return this.fromWireType(E[a >>> 2 >>> 0]);
          }
          var Qa = (a, b) => {
            switch (b) {
              case 4:
                return function(c) {
                  return this.fromWireType(ma[c >>> 2 >>> 0]);
                };
              case 8:
                return function(c) {
                  return this.fromWireType(pa[c >>> 3 >>> 0]);
                };
              default:
                throw new TypeError(`invalid float width (${b}): ${a}`);
            }
          };
          function Ra(a) {
            return this.fromWireType(G[a >>> 2 >>> 0]);
          }
          var Sa = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ta = (a, b) => {
            var c = a >> 1;
            for (var d = c + b / 2; !(c >= d) && D[c >>> 0]; )
              ++c;
            c <<= 1;
            if (32 < c - a && Sa)
              return Sa.decode(B.subarray(a >>> 0, c >>> 0));
            c = "";
            for (d = 0; !(d >= b / 2); ++d) {
              var e = C[a + 2 * d >>> 1 >>> 0];
              if (0 == e)
                break;
              c += String.fromCharCode(e);
            }
            return c;
          }, Ua = (a, b, c) => {
            void 0 === c && (c = 2147483647);
            if (2 > c)
              return 0;
            c -= 2;
            var d = b;
            c = c < 2 * a.length ? c / 2 : a.length;
            for (var e = 0; e < c; ++e)
              C[b >>> 1 >>> 0] = a.charCodeAt(e), b += 2;
            C[b >>> 1 >>> 0] = 0;
            return b - d;
          }, Va = (a) => 2 * a.length, Wa = (a, b) => {
            for (var c = 0, d = ""; !(c >= b / 4); ) {
              var e = E[a + 4 * c >>> 2 >>> 0];
              if (0 == e)
                break;
              ++c;
              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
            }
            return d;
          }, Xa = (a, b, c) => {
            b >>>= 0;
            void 0 === c && (c = 2147483647);
            if (4 > c)
              return 0;
            var d = b;
            c = d + c - 4;
            for (var e = 0; e < a.length; ++e) {
              var g = a.charCodeAt(e);
              if (55296 <= g && 57343 >= g) {
                var l = a.charCodeAt(++e);
                g = 65536 + ((g & 1023) << 10) | l & 1023;
              }
              E[b >>> 2 >>> 0] = g;
              b += 4;
              if (b + 4 > c)
                break;
            }
            E[b >>> 2 >>> 0] = 0;
            return b - d;
          }, Ya = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              55296 <= d && 57343 >= d && ++c;
              b += 4;
            }
            return b;
          }, V = (a, b) => {
            var c = Ja[a];
            if (void 0 === c)
              throw a = Za(a), c = O(a), U(a), new P(b + " has unknown type " + c);
            return c;
          }, $a = {}, W = (a) => {
            var b = $a[a];
            return void 0 === b ? O(a) : b;
          }, X = [], bb = () => "object" == typeof globalThis ? globalThis : Function("return this")(), cb = (a) => {
            var b = X.length;
            X.push(a);
            return b;
          }, db = (a, b) => {
            for (var c = Array(a), d = 0; d < a; ++d)
              c[d] = V(G[b + 4 * d >>> 2 >>> 0], "parameter " + d);
            return c;
          }, eb = (a) => {
            if (void 0 === a)
              return "_unknown";
            a = a.replace(/[^a-zA-Z0-9_]/g, "$");
            var b = a.charCodeAt(0);
            return 48 <= b && 57 >= b ? `_${a}` : a;
          }, fb = {};
          function gb(a, b) {
            a = eb(a);
            return { [a]: function() {
              return b.apply(this, arguments);
            } }[a];
          }
          function hb(a) {
            var b = Function;
            if (!(b instanceof Function))
              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
            var c = gb(b.name || "unknownFunctionName", function() {
            });
            c.prototype = b.prototype;
            c = new c();
            a = b.apply(c, a);
            return a instanceof Object ? a : c;
          }
          var ib = (a) => {
            for (var b = "", c = 0; c < a; ++c)
              b += (0 !== c ? ", " : "") + "arg" + c;
            var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\n  var HEAPU32 = getMemory();\n";
            for (c = 0; c < a; ++c)
              d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], 'parameter " + c + "');\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\nargs += argType" + c + "['argPackAdvance'];\nargTypes += 4;\n";
            return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\nreturn valueToHandle(obj);\n}\n"))(V, h, T, () => G);
          }, jb = {}, Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), kb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], lb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], nb = (a) => {
            var b = M(a) + 1, c = mb(b);
            c && N(a, B, c, b);
            return c;
          }, ob = {}, qb = () => {
            if (!pb) {
              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: da || "./this.program" }, b;
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
            var b = Array(M(a) + 1);
            N(a, b, 0, b.length);
            return b;
          }
          function vb(a, b, c, d) {
            function e(f, r, u) {
              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )
                f = u[0] + f;
              return f;
            }
            function g(f, r) {
              return e(f, r, "0");
            }
            function l(f, r) {
              function u(ab) {
                return 0 > ab ? -1 : 0 < ab ? 1 : 0;
              }
              var H;
              0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));
              return H;
            }
            function k(f) {
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
            function n(f) {
              var r = f.Ta;
              for (f = new Date(new Date(f.Ua + 1900, 0, 1).getTime()); 0 < r; ) {
                var u = f.getMonth(), H = (Y(f.getFullYear()) ? sb : tb)[u];
                if (r > H - f.getDate())
                  r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
                else {
                  f.setDate(f.getDate() + r);
                  break;
                }
              }
              u = new Date(f.getFullYear() + 1, 0, 4);
              r = k(new Date(
                f.getFullYear(),
                0,
                4
              ));
              u = k(u);
              return 0 >= l(r, f) ? 0 >= l(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            var q = G[d + 40 >>> 2 >>> 0];
            d = { kb: E[d >>> 2 >>> 0], jb: E[d + 4 >>> 2 >>> 0], Xa: E[d + 8 >>> 2 >>> 0], ab: E[d + 12 >>> 2 >>> 0], Ya: E[d + 16 >>> 2 >>> 0], Ua: E[d + 20 >>> 2 >>> 0], Oa: E[d + 24 >>> 2 >>> 0], Ta: E[d + 28 >>> 2 >>> 0], mb: E[d + 32 >>> 2 >>> 0], ib: E[d + 36 >>> 2 >>> 0], lb: q ? L(q) : "" };
            c = L(c);
            q = {
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
            for (var v in q)
              c = c.replace(new RegExp(v, "g"), q[v]);
            var y = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), F = "January February March April May June July August September October November December".split(" ");
            q = { "%a": (f) => y[f.Oa].substring(0, 3), "%A": (f) => y[f.Oa], "%b": (f) => F[f.Ya].substring(0, 3), "%B": (f) => F[f.Ya], "%C": (f) => g((f.Ua + 1900) / 100 | 0, 2), "%d": (f) => g(f.ab, 2), "%e": (f) => e(f.ab, 2, " "), "%g": (f) => n(f).toString().substring(2), "%G": (f) => n(f), "%H": (f) => g(f.Xa, 2), "%I": (f) => {
              f = f.Xa;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return g(f, 2);
            }, "%j": (f) => {
              for (var r = 0, u = 0; u <= f.Ya - 1; r += (Y(f.Ua + 1900) ? sb : tb)[u++])
                ;
              return g(f.ab + r, 3);
            }, "%m": (f) => g(f.Ya + 1, 2), "%M": (f) => g(f.jb, 2), "%n": () => "\n", "%p": (f) => 0 <= f.Xa && 12 > f.Xa ? "AM" : "PM", "%S": (f) => g(f.kb, 2), "%t": () => "	", "%u": (f) => f.Oa || 7, "%U": (f) => g(Math.floor((f.Ta + 7 - f.Oa) / 7), 2), "%V": (f) => {
              var r = Math.floor((f.Ta + 7 - (f.Oa + 6) % 7) / 7);
              2 >= (f.Oa + 371 - f.Ta - 2) % 7 && r++;
              if (r)
                53 == r && (u = (f.Oa + 371 - f.Ta) % 7, 4 == u || 3 == u && Y(f.Ua) || (r = 1));
              else {
                r = 52;
                var u = (f.Oa + 7 - f.Ta - 1) % 7;
                (4 == u || 5 == u && Y(f.Ua % 400 - 1)) && r++;
              }
              return g(r, 2);
            }, "%w": (f) => f.Oa, "%W": (f) => g(Math.floor((f.Ta + 7 - (f.Oa + 6) % 7) / 7), 2), "%y": (f) => (f.Ua + 1900).toString().substring(2), "%Y": (f) => f.Ua + 1900, "%z": (f) => {
              f = f.ib;
              var r = 0 <= f;
              f = Math.abs(f) / 60;
              return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            }, "%Z": (f) => f.lb, "%%": () => "%" };
            c = c.replace(/%%/g, "\0\0");
            for (v in q)
              c.includes(v) && (c = c.replace(new RegExp(v, "g"), q[v](d)));
            c = c.replace(/\0\0/g, "%");
            v = ub(c);
            if (v.length > b)
              return 0;
            A.set(v, a >>> 0);
            return v.length - 1;
          }
          for (var wb = Array(256), xb = 0; 256 > xb; ++xb)
            wb[xb] = String.fromCharCode(xb);
          Ha = wb;
          P = h.BindingError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "BindingError";
            }
          };
          h.InternalError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "InternalError";
            }
          };
          Object.assign(Na.prototype, { get(a) {
            return this.Sa[a];
          }, has(a) {
            return void 0 !== this.Sa[a];
          }, Za(a) {
            var b = this.bb.pop() || this.Sa.length;
            this.Sa[b] = a;
            return b;
          }, $a(a) {
            this.Sa[a] = void 0;
            this.bb.push(a);
          } });
          R.Sa.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
          R.Va = R.Sa.length;
          h.count_emval_handles = () => {
            for (var a = 0, b = R.Va; b < R.Sa.length; ++b)
              void 0 !== R.Sa[b] && ++a;
            return a;
          };
          var yb = { a: function(a, b, c) {
            a >>>= 0;
            new Ba(a).Za(b >>> 0, c >>> 0);
            Ca = a;
            Da++;
            throw Ca;
          }, v: function() {
            return 0;
          }, ba: function() {
          }, N: function() {
          }, P: function() {
          }, H: function() {
            return 0;
          }, $: function() {
          }, V: function() {
          }, _: function() {
          }, A: function() {
          }, O: function() {
          }, L: function() {
          }, aa: function() {
          }, M: function() {
          }, D: function(a, b, c, d, e) {
            b >>>= 0;
            b = O(b);
            var g = -1 != b.indexOf("u");
            g && (e = (1n << 64n) - 1n);
            Q(a >>> 0, { name: b, fromWireType: (l) => l, toWireType: function(l, k) {
              if ("bigint" != typeof k && "number" != typeof k)
                throw new TypeError(`Cannot convert "${Ga(k)}" to ${this.name}`);
              if (k < d || k > e)
                throw new TypeError(`Passing a number "${Ga(k)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
              return k;
            }, argPackAdvance: 8, readValueFromPointer: Ma(b, c >>> 0, !g), Wa: null });
          }, ea: function(a, b, c, d) {
            b = O(b >>> 0);
            Q(a >>> 0, { name: b, fromWireType: function(e) {
              return !!e;
            }, toWireType: function(e, g) {
              return g ? c : d;
            }, argPackAdvance: 8, readValueFromPointer: function(e) {
              return this.fromWireType(B[e >>> 0]);
            }, Wa: null });
          }, da: function(a, b) {
            b = O(b >>> 0);
            Q(a >>> 0, {
              name: b,
              fromWireType: (c) => {
                var d = S(c);
                Oa(c);
                return d;
              },
              toWireType: (c, d) => T(d),
              argPackAdvance: 8,
              readValueFromPointer: Pa,
              Wa: null
            });
          }, C: function(a, b, c) {
            b = O(b >>> 0);
            Q(a >>> 0, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Qa(b, c >>> 0), Wa: null });
          }, p: function(a, b, c, d, e) {
            a >>>= 0;
            c >>>= 0;
            b = O(b >>> 0);
            -1 === e && (e = 4294967295);
            e = (k) => k;
            if (0 === d) {
              var g = 32 - 8 * c;
              e = (k) => k << g >>> g;
            }
            var l = b.includes("unsigned") ? function(k, n) {
              return n >>> 0;
            } : function(k, n) {
              return n;
            };
            Q(a, {
              name: b,
              fromWireType: e,
              toWireType: l,
              argPackAdvance: 8,
              readValueFromPointer: Ma(b, c, 0 !== d),
              Wa: null
            });
          }, l: function(a, b, c) {
            function d(g) {
              return new e(A.buffer, G[g + 4 >>> 2 >>> 0], G[g >>> 2 >>> 0]);
            }
            var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
            c = O(c >>> 0);
            Q(a >>> 0, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { gb: true });
          }, E: function(a, b) {
            b = O(b >>> 0);
            var c = "std::string" === b;
            Q(a >>> 0, { name: b, fromWireType: function(d) {
              var e = G[d >>> 2 >>> 0], g = d + 4;
              if (c)
                for (var l = g, k = 0; k <= e; ++k) {
                  var n = g + k;
                  if (k == e || 0 == B[n >>> 0]) {
                    l = L(l, n - l);
                    if (void 0 === q)
                      var q = l;
                    else
                      q += String.fromCharCode(0), q += l;
                    l = n + 1;
                  }
                }
              else {
                q = Array(e);
                for (k = 0; k < e; ++k)
                  q[k] = String.fromCharCode(B[g + k >>> 0]);
                q = q.join("");
              }
              U(d);
              return q;
            }, toWireType: function(d, e) {
              e instanceof ArrayBuffer && (e = new Uint8Array(e));
              var g = "string" == typeof e;
              if (!(g || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                throw new P("Cannot pass non-string to std::string");
              var l = c && g ? M(e) : e.length;
              var k = mb(4 + l + 1), n = k + 4;
              G[k >>> 2 >>> 0] = l;
              if (c && g)
                N(e, B, n, l + 1);
              else if (g)
                for (g = 0; g < l; ++g) {
                  var q = e.charCodeAt(g);
                  if (255 < q)
                    throw U(n), new P("String has UTF-16 code units that do not fit in 8 bits");
                  B[n + g >>> 0] = q;
                }
              else
                for (g = 0; g < l; ++g)
                  B[n + g >>> 0] = e[g];
              null !== d && d.push(U, k);
              return k;
            }, argPackAdvance: 8, readValueFromPointer: Ra, Wa(d) {
              U(d);
            } });
          }, x: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            c = O(c);
            if (2 === b) {
              var d = Ta;
              var e = Ua;
              var g = Va;
              var l = () => D;
              var k = 1;
            } else
              4 === b && (d = Wa, e = Xa, g = Ya, l = () => G, k = 2);
            Q(a >>> 0, { name: c, fromWireType: (n) => {
              for (var q = G[n >>> 2 >>> 0], v = l(), y, F = n + 4, f = 0; f <= q; ++f) {
                var r = n + 4 + f * b;
                if (f == q || 0 == v[r >>> k])
                  F = d(F, r - F), void 0 === y ? y = F : (y += String.fromCharCode(0), y += F), F = r + b;
              }
              U(n);
              return y;
            }, toWireType: (n, q) => {
              if ("string" != typeof q)
                throw new P(`Cannot pass non-string to C++ string type ${c}`);
              var v = g(q), y = mb(4 + v + b);
              G[y >>> 2] = v >> k;
              e(q, y + 4, v + b);
              null !== n && n.push(U, y);
              return y;
            }, argPackAdvance: 8, readValueFromPointer: Pa, Wa(n) {
              U(n);
            } });
          }, fa: function(a, b) {
            b = O(b >>> 0);
            Q(a >>> 0, { hb: true, name: b, argPackAdvance: 0, fromWireType: () => {
            }, toWireType: () => {
            } });
          }, ca: () => true, o: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = S(a >>> 0);
            b = V(b, "emval::as");
            var d = [], e = T(d);
            G[c >>> 2 >>> 0] = e;
            return b.toWireType(d, a);
          }, h: function(a, b, c, d, e) {
            c >>>= 0;
            d >>>= 0;
            e >>>= 0;
            a = X[a >>> 0];
            b = S(b >>> 0);
            c = W(c);
            var g = [];
            G[d >>> 2 >>> 0] = T(g);
            return a(b, c, g, e);
          }, r: function(a, b, c, d) {
            c >>>= 0;
            d >>>= 0;
            a = X[a >>> 0];
            b = S(b >>> 0);
            c = W(c);
            a(b, c, null, d);
          }, b: Oa, F: function(a, b) {
            b >>>= 0;
            a = S(a >>> 0);
            b = S(b);
            return a == b;
          }, u: function(a) {
            a >>>= 0;
            if (0 === a)
              return T(bb());
            a = W(a);
            return T(bb()[a]);
          }, g: function(a, b) {
            var c = db(a, b >>> 0), d = c[0];
            b = d.name + "_$" + c.slice(1).map(function(v) {
              return v.name;
            }).join("_") + "$";
            var e = fb[b];
            if (void 0 !== e)
              return e;
            e = ["retType"];
            for (var g = [d], l = "", k = 0; k < a - 1; ++k)
              l += (0 !== k ? ", " : "") + "arg" + k, e.push("argType" + k), g.push(c[1 + k]);
            var n = "return function " + eb("methodCaller_" + b) + "(handle, name, destructors, args) {\n", q = 0;
            for (k = 0; k < a - 1; ++k)
              n += "    var arg" + k + " = argType" + k + ".readValueFromPointer(args" + (q ? "+" + q : "") + ");\n", q += c[k + 1].argPackAdvance;
            n += "    var rv = handle[name](" + l + ");\n";
            for (k = 0; k < a - 1; ++k)
              c[k + 1].deleteObject && (n += "    argType" + k + ".deleteObject(arg" + k + ");\n");
            d.hb || (n += "    return retType.toWireType(destructors, rv);\n");
            e.push(n + "};\n");
            a = hb(e).apply(null, g);
            e = cb(a);
            return fb[b] = e;
          }, q: function(a, b) {
            b >>>= 0;
            a = S(a >>> 0);
            b = S(b);
            return T(a[b]);
          }, c: function(a) {
            a >>>= 0;
            4 < a && (R.get(a).cb += 1);
          }, G: function(a, b, c, d) {
            c >>>= 0;
            d >>>= 0;
            a = S(a >>> 0);
            var e = jb[b];
            e || (e = ib(b), jb[b] = e);
            return e(a, c, d);
          }, s: function() {
            return T([]);
          }, k: function(a) {
            a = S(a >>> 0);
            for (var b = Array(a.length), c = 0; c < a.length; c++)
              b[c] = a[c];
            return T(b);
          }, d: function(a) {
            return T(W(a >>> 0));
          }, j: function() {
            return T({});
          }, f: function(a) {
            a >>>= 0;
            for (var b = S(a); b.length; ) {
              var c = b.pop();
              b.pop()(c);
            }
            Oa(a);
          }, i: function(a, b, c) {
            b >>>= 0;
            c >>>= 0;
            a = S(a >>> 0);
            b = S(b);
            c = S(c);
            a[b] = c;
          }, e: function(a, b) {
            b >>>= 0;
            a = V(a >>> 0, "_emval_take_value");
            a = a.readValueFromPointer(b);
            return T(a);
          }, S: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            E[b >>> 2 >>> 0] = a.getUTCSeconds();
            E[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
            E[b + 8 >>> 2 >>> 0] = a.getUTCHours();
            E[b + 12 >>> 2 >>> 0] = a.getUTCDate();
            E[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
            E[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
            E[b + 24 >>> 2 >>> 0] = a.getUTCDay();
            E[b + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
          }, T: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            b >>>= 0;
            a = new Date(1e3 * a);
            E[b >>> 2 >>> 0] = a.getSeconds();
            E[b + 4 >>> 2 >>> 0] = a.getMinutes();
            E[b + 8 >>> 2 >>> 0] = a.getHours();
            E[b + 12 >>> 2 >>> 0] = a.getDate();
            E[b + 16 >>> 2 >>> 0] = a.getMonth();
            E[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
            E[b + 24 >>> 2 >>> 0] = a.getDay();
            E[b + 28 >>> 2 >>> 0] = (Y(a.getFullYear()) ? kb : lb)[a.getMonth()] + a.getDate() - 1 | 0;
            E[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            var c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(), d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            E[b + 32 >>> 2 >>> 0] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
          }, U: function(a) {
            a >>>= 0;
            var b = new Date(E[a + 20 >>> 2 >>> 0] + 1900, E[a + 16 >>> 2 >>> 0], E[a + 12 >>> 2 >>> 0], E[a + 8 >>> 2 >>> 0], E[a + 4 >>> 2 >>> 0], E[a >>> 2 >>> 0], 0), c = E[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), l = Math.min(
              g,
              e
            );
            0 > c ? E[a + 32 >>> 2 >>> 0] = Number(e != g && l == d) : 0 < c != (l == d) && (e = Math.max(g, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? l : e) - d)));
            E[a + 24 >>> 2 >>> 0] = b.getDay();
            E[a + 28 >>> 2 >>> 0] = (Y(b.getFullYear()) ? kb : lb)[b.getMonth()] + b.getDate() - 1 | 0;
            E[a >>> 2 >>> 0] = b.getSeconds();
            E[a + 4 >>> 2 >>> 0] = b.getMinutes();
            E[a + 8 >>> 2 >>> 0] = b.getHours();
            E[a + 12 >>> 2 >>> 0] = b.getDate();
            E[a + 16 >>> 2 >>> 0] = b.getMonth();
            E[a + 20 >>> 2 >>> 0] = b.getYear();
            return BigInt(b.getTime() / 1e3);
          }, Q: function() {
            return -52;
          }, R: function() {
          }, J: function(a, b, c) {
            function d(n) {
              return (n = n.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? n[1] : "GMT";
            }
            c >>>= 0;
            var e = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(e, 0, 1), l = new Date(e, 6, 1);
            e = g.getTimezoneOffset();
            var k = l.getTimezoneOffset();
            G[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(e, k);
            E[b >>> 0 >>> 2 >>> 0] = Number(e != k);
            a = d(g);
            b = d(l);
            a = nb(a);
            b = nb(b);
            k < e ? (G[c >>> 2 >>> 0] = a, G[c + 4 >>> 2 >>> 0] = b) : (G[c >>> 2 >>> 0] = b, G[c + 4 >>> 2 >>> 0] = a);
          }, t: () => {
            ka("");
          }, B: () => Date.now(), K: function() {
            return 4294901760;
          }, n: () => performance.now(), Z: function(a, b, c) {
            b >>>= 0;
            return B.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
          }, I: function(a) {
            a >>>= 0;
            var b = B.length;
            if (4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var e = Math;
              d = Math.max(a, d);
              a: {
                e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - z.buffer.byteLength + 65535) / 65536;
                try {
                  z.grow(e);
                  qa();
                  var g = 1;
                  break a;
                } catch (l) {
                }
                g = void 0;
              }
              if (g)
                return true;
            }
            return false;
          }, X: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = 0;
            qb().forEach((d, e) => {
              var g = b + c;
              e = G[a + 4 * e >>> 2 >>> 0] = g;
              for (g = 0; g < d.length; ++g)
                A[e++ >>> 0 >>> 0] = d.charCodeAt(g);
              A[e >>> 0 >>> 0] = 0;
              c += d.length + 1;
            });
            return 0;
          }, Y: function(a, b) {
            a >>>= 0;
            b >>>= 0;
            var c = qb();
            G[a >>> 2 >>> 0] = c.length;
            var d = 0;
            c.forEach((e) => d += e.length + 1);
            G[b >>> 2 >>> 0] = d;
            return 0;
          }, w: () => 52, z: function() {
            return 52;
          }, W: function() {
            return 70;
          }, y: function(a, b, c, d) {
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            for (var e = 0, g = 0; g < c; g++) {
              var l = G[b >>> 2 >>> 0], k = G[b + 4 >>> 2 >>> 0];
              b += 8;
              for (var n = 0; n < k; n++) {
                var q = B[l + n >>> 0], v = rb[a];
                0 === q || 10 === q ? ((1 === a ? ja : x)(Fa(v, 0)), v.length = 0) : v.push(q);
              }
              e += k;
            }
            G[d >>> 2 >>> 0] = e;
            return 0;
          }, ga: vb, m: function(a, b, c, d) {
            return vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          } }, Z = function() {
            var a = { a: yb };
            I++;
            Aa(a, function(b) {
              Z = b.instance.exports;
              Z = zb();
              z = Z.ha;
              qa();
              sa.unshift(Z.ia);
              I--;
              0 == I && (null !== ua && (clearInterval(ua), ua = null), J && (b = J, J = null, b()));
            }).catch(ba);
            return {};
          }();
          h._OrtInit = (a, b) => (h._OrtInit = Z.ja)(a, b);
          h._OrtGetLastError = (a, b) => (h._OrtGetLastError = Z.ka)(a, b);
          h._OrtCreateSessionOptions = (a, b, c, d, e, g, l, k, n, q) => (h._OrtCreateSessionOptions = Z.la)(a, b, c, d, e, g, l, k, n, q);
          h._OrtAppendExecutionProvider = (a, b) => (h._OrtAppendExecutionProvider = Z.ma)(a, b);
          h._OrtAddFreeDimensionOverride = (a, b, c) => (h._OrtAddFreeDimensionOverride = Z.na)(a, b, c);
          h._OrtAddSessionConfigEntry = (a, b, c) => (h._OrtAddSessionConfigEntry = Z.oa)(a, b, c);
          h._OrtReleaseSessionOptions = (a) => (h._OrtReleaseSessionOptions = Z.pa)(a);
          h._OrtCreateSession = (a, b, c) => (h._OrtCreateSession = Z.qa)(a, b, c);
          h._OrtReleaseSession = (a) => (h._OrtReleaseSession = Z.ra)(a);
          h._OrtGetInputOutputCount = (a, b, c) => (h._OrtGetInputOutputCount = Z.sa)(a, b, c);
          h._OrtGetInputName = (a, b) => (h._OrtGetInputName = Z.ta)(a, b);
          h._OrtGetOutputName = (a, b) => (h._OrtGetOutputName = Z.ua)(a, b);
          h._OrtFree = (a) => (h._OrtFree = Z.va)(a);
          h._OrtCreateTensor = (a, b, c, d, e, g) => (h._OrtCreateTensor = Z.wa)(a, b, c, d, e, g);
          h._OrtGetTensorData = (a, b, c, d, e) => (h._OrtGetTensorData = Z.xa)(a, b, c, d, e);
          h._OrtReleaseTensor = (a) => (h._OrtReleaseTensor = Z.ya)(a);
          h._OrtCreateRunOptions = (a, b, c, d) => (h._OrtCreateRunOptions = Z.za)(a, b, c, d);
          h._OrtAddRunConfigEntry = (a, b, c) => (h._OrtAddRunConfigEntry = Z.Aa)(a, b, c);
          h._OrtReleaseRunOptions = (a) => (h._OrtReleaseRunOptions = Z.Ba)(a);
          h._OrtCreateBinding = (a) => (h._OrtCreateBinding = Z.Ca)(a);
          h._OrtBindInput = (a, b, c) => (h._OrtBindInput = Z.Da)(a, b, c);
          h._OrtBindOutput = (a, b, c, d) => (h._OrtBindOutput = Z.Ea)(a, b, c, d);
          h._OrtClearBoundOutputs = (a) => (h._OrtClearBoundOutputs = Z.Fa)(a);
          h._OrtReleaseBinding = (a) => (h._OrtReleaseBinding = Z.Ga)(a);
          h._OrtRunWithBinding = (a, b, c, d, e) => (h._OrtRunWithBinding = Z.Ha)(a, b, c, d, e);
          h._OrtRun = (a, b, c, d, e, g, l, k) => (h._OrtRun = Z.Ia)(a, b, c, d, e, g, l, k);
          h._OrtEndProfiling = (a) => (h._OrtEndProfiling = Z.Ja)(a);
          var mb = h._malloc = (a) => (mb = h._malloc = Z.Ka)(a), U = h._free = (a) => (U = h._free = Z.La)(a), Za = (a) => (Za = Z.Ma)(a);
          h.__embind_initialize_bindings = () => (h.__embind_initialize_bindings = Z.Na)();
          var Ab = () => (Ab = Z.Pa)(), Bb = (a) => (Bb = Z.Qa)(a), Cb = (a) => (Cb = Z.Ra)(a);
          function zb() {
            var a = Z;
            a = Object.assign({}, a);
            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
            a.__errno_location = b(a.__errno_location);
            a.Ka = c(a.Ka);
            a.Ma = c(a.Ma);
            a.Pa = b(a.Pa);
            a.Ra = c(a.Ra);
            return a;
          }
          h.stackAlloc = Cb;
          h.stackSave = Ab;
          h.stackRestore = Bb;
          h.UTF8ToString = L;
          h.stringToUTF8 = (a, b, c) => N(a, B, b, c);
          h.lengthBytesUTF8 = M;
          var Db;
          J = function Eb() {
            Db || Fb();
            Db || (J = Eb);
          };
          function Fb() {
            if (!(0 < I)) {
              for (; 0 < ra.length; )
                ra.shift()(h);
              if (!(0 < I || Db || (Db = true, h.calledRun = true, la))) {
                for (; 0 < sa.length; )
                  sa.shift()(h);
                for (aa(h); 0 < ta.length; )
                  ta.shift()(h);
              }
            }
          }
          Fb();
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
          function h() {
            m.buffer != n.buffer && p();
            return n;
          }
          function t() {
            m.buffer != n.buffer && p();
            return aa;
          }
          function v() {
            m.buffer != n.buffer && p();
            return ba;
          }
          function ca() {
            m.buffer != n.buffer && p();
            return da;
          }
          function w() {
            m.buffer != n.buffer && p();
            return ea;
          }
          function z() {
            m.buffer != n.buffer && p();
            return fa;
          }
          function ha() {
            m.buffer != n.buffer && p();
            return ia;
          }
          var A = moduleArg, ja, ka;
          A.ready = new Promise((a, b) => {
            ja = a;
            ka = b;
          });
          var la = Object.assign({}, A), ma = "./this.program", na = (a, b) => {
            throw b;
          }, oa = "object" == typeof window, B = "function" == typeof importScripts, D = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, E = A.ENVIRONMENT_IS_PTHREAD || false, F = "";
          function pa(a) {
            return A.locateFile ? A.locateFile(a, F) : F + a;
          }
          var qa, ra, sa;
          if (D) {
            var fs = (init_fs(), __toCommonJS(fs_exports)), ta = (init_path(), __toCommonJS(path_exports));
            F = B ? ta.dirname(F) + "/" : __dirname + "/";
            qa = (b, c) => {
              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);
              return fs.readFileSync(b, c ? void 0 : "utf8");
            };
            sa = (b) => {
              b = qa(b, true);
              b.buffer || (b = new Uint8Array(b));
              return b;
            };
            ra = (b, c, d, e = true) => {
              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);
              fs.readFile(b, e ? void 0 : "utf8", (f, k) => {
                f ? d(f) : c(e ? k.buffer : k);
              });
            };
            !A.thisProgram && 1 < process.argv.length && (ma = process.argv[1].replace(/\\/g, "/"));
            process.argv.slice(2);
            na = (b, c) => {
              process.exitCode = b;
              throw c;
            };
            A.inspect = () => "[Emscripten Module object]";
            let a;
            try {
              a = require_worker_threads();
            } catch (b) {
              throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'), b;
            }
            global.Worker = a.Worker;
          } else if (oa || B)
            B ? F = self.location.href : "undefined" != typeof document && document.currentScript && (F = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (F = _scriptDir), 0 !== F.indexOf("blob:") ? F = F.substr(0, F.replace(/[?#].*/, "").lastIndexOf("/") + 1) : F = "", D || (qa = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.send(null);
              return b.responseText;
            }, B && (sa = (a) => {
              var b = new XMLHttpRequest();
              b.open("GET", a, false);
              b.responseType = "arraybuffer";
              b.send(null);
              return new Uint8Array(b.response);
            }), ra = (a, b, c) => {
              var d = new XMLHttpRequest();
              d.open("GET", a, true);
              d.responseType = "arraybuffer";
              d.onload = () => {
                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
              };
              d.onerror = c;
              d.send(null);
            });
          D && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
          var ua = console.log.bind(console), va = console.error.bind(console);
          D && (ua = (...a) => fs.writeSync(1, a.join(" ") + "\n"), va = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
          var wa = ua, G = va;
          Object.assign(A, la);
          la = null;
          var noExitRuntime = true;
          "object" != typeof WebAssembly && H("no native wasm support detected");
          var m, xa, ya = false, I, n, aa, ba, da, ea, fa, za, J, Aa, ia;
          function p() {
            var a = m.buffer;
            A.HEAP8 = n = new Int8Array(a);
            A.HEAP16 = ba = new Int16Array(a);
            A.HEAPU8 = aa = new Uint8Array(a);
            A.HEAPU16 = da = new Uint16Array(a);
            A.HEAP32 = ea = new Int32Array(a);
            A.HEAPU32 = fa = new Uint32Array(a);
            A.HEAPF32 = za = new Float32Array(a);
            A.HEAPF64 = ia = new Float64Array(a);
            A.HEAP64 = J = new BigInt64Array(a);
            A.HEAPU64 = Aa = new BigUint64Array(a);
          }
          var Ba = 16777216;
          5242880 <= Ba || H("INITIAL_MEMORY should be larger than STACK_SIZE, was " + Ba + "! (STACK_SIZE=5242880)");
          if (E)
            m = A.wasmMemory;
          else if (m = new WebAssembly.Memory({ initial: Ba / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))
            throw G("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), D && G("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
          p();
          Ba = m.buffer.byteLength;
          var Ca = [], Da = [], Ea = [], Fa = 0;
          function Ga() {
            return noExitRuntime || 0 < Fa;
          }
          var K = 0, Ha = null, L = null;
          function Ia() {
            K--;
            if (0 == K && (null !== Ha && (clearInterval(Ha), Ha = null), L)) {
              var a = L;
              L = null;
              a();
            }
          }
          function H(a) {
            a = "Aborted(" + a + ")";
            G(a);
            ya = true;
            I = 1;
            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
            ka(a);
            throw a;
          }
          function Ja(a) {
            return a.startsWith("data:application/octet-stream;base64,");
          }
          var M;
          M = "ort-wasm-threaded.wasm";
          Ja(M) || (M = pa(M));
          function Ka(a) {
            if (sa)
              return sa(a);
            throw "both async and sync fetching of the wasm failed";
          }
          function La(a) {
            if (oa || B) {
              if ("function" == typeof fetch && !a.startsWith("file://"))
                return fetch(a, { credentials: "same-origin" }).then((b) => {
                  if (!b.ok)
                    throw "failed to load wasm binary file at '" + a + "'";
                  return b.arrayBuffer();
                }).catch(() => Ka(a));
              if (ra)
                return new Promise((b, c) => {
                  ra(a, (d) => b(new Uint8Array(d)), c);
                });
            }
            return Promise.resolve().then(() => Ka(a));
          }
          function Ma(a, b, c) {
            return La(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {
              G(`failed to asynchronously prepare wasm: ${d}`);
              H(d);
            });
          }
          function Na(a, b) {
            var c = M;
            return "function" != typeof WebAssembly.instantiateStreaming || Ja(c) || c.startsWith("file://") || D || "function" != typeof fetch ? Ma(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
              G(`wasm streaming compile failed: ${e}`);
              G("falling back to ArrayBuffer instantiation");
              return Ma(c, a, b);
            }));
          }
          function Oa(a) {
            this.name = "ExitStatus";
            this.message = `Program terminated with exit(${a})`;
            this.status = a;
          }
          var Pa = (a) => {
            a.terminate();
            a.onmessage = () => {
            };
          }, Qa = (a) => {
            if (0 == O.qb.length) {
              var b = pa("ort-wasm-threaded.worker.js");
              b = new Worker(b);
              O.qb.push(b);
              O.Jb(O.qb[0]);
            }
            b = O.qb.pop();
            if (!b)
              return 6;
            O.nb.push(b);
            O.jb[a.mb] = b;
            b.mb = a.mb;
            var c = { cmd: "run", start_routine: a.Mb, arg: a.Fb, pthread_ptr: a.mb };
            D && b.unref();
            b.postMessage(c, a.Sb);
            return 0;
          }, Ra = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Sa = (a, b, c) => {
            b >>>= 0;
            var d = b + c;
            for (c = b; a[c] && !(c >= d); )
              ++c;
            if (16 < c - b && a.buffer && Ra)
              return Ra.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
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
          }, Ta = (a, b) => (a >>>= 0) ? Sa(t(), a, b) : "";
          function Ua(a) {
            if (E)
              return P(0, 1, a);
            I = a;
            Ga() || (O.Nb(), ya = true);
            na(a, new Oa(a));
          }
          var Wa = (a) => {
            I = a;
            if (E)
              throw Va(a), "unwind";
            Ua(a);
          };
          function Xa() {
            Ca.unshift(() => {
              K++;
              Ia();
            });
          }
          var O = { qb: [], nb: [], Eb: [], jb: {}, vb() {
            E ? (O.receiveObjectTransfer = O.Lb, O.threadInitTLS = O.Db, O.setExitStatus = O.Cb, noExitRuntime = false) : Xa();
          }, Cb: (a) => {
            I = a;
          }, Vb: ["$terminateWorker"], Nb: () => {
            for (var a of O.nb)
              Pa(a);
            for (a of O.qb)
              Pa(a);
            O.qb = [];
            O.nb = [];
            O.jb = [];
          }, Bb: (a) => {
            var b = a.mb;
            delete O.jb[b];
            O.qb.push(a);
            O.nb.splice(O.nb.indexOf(a), 1);
            a.mb = 0;
            Ya(b);
          }, Lb() {
          }, Db() {
            O.Eb.forEach((a) => a());
          }, Jb: (a) => new Promise((b) => {
            a.onmessage = (f) => {
              f = f.data;
              var k = f.cmd;
              if (f.targetThread && f.targetThread != Za()) {
                var l = O.jb[f.targetThread];
                l ? l.postMessage(f, f.transferList) : G(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);
              } else if ("checkMailbox" === k)
                $a();
              else if ("spawnThread" === k)
                Qa(f);
              else if ("cleanupThread" === k)
                (f = O.jb[f.thread]) || H(), O.Bb(f);
              else if ("killThread" === k)
                f = f.thread, k = O.jb[f], delete O.jb[f], Pa(k), Ya(f), O.nb.splice(O.nb.indexOf(k), 1), k.mb = 0;
              else if ("cancelThread" === k)
                O.jb[f.thread].postMessage({ cmd: "cancel" });
              else if ("loaded" === k)
                a.loaded = true, b(a);
              else if ("alert" === k)
                alert(`Thread ${f.threadId}: ${f.text}`);
              else if ("setimmediate" === f.target)
                a.postMessage(f);
              else if ("callHandler" === k)
                A[f.handler](...f.args);
              else
                k && G(`worker sent an unknown command ${k}`);
            };
            a.onerror = (f) => {
              G(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);
              throw f;
            };
            D && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));
            var c = [], d = [], e;
            for (e of d)
              A.hasOwnProperty(e) && c.push(e);
            a.postMessage({
              cmd: "load",
              handlers: c,
              urlOrBlob: A.mainScriptUrlOrBlob || _scriptDir,
              wasmMemory: m,
              wasmModule: xa
            });
          }) };
          A.PThread = O;
          var ab = (a) => {
            for (; 0 < a.length; )
              a.shift()(A);
          };
          A.establishStackSpace = () => {
            var a = Za(), b = z()[a + 52 >>> 2 >>> 0];
            a = z()[a + 56 >>> 2 >>> 0];
            bb(b, b - a);
            cb(b);
          };
          function Va(a) {
            if (E)
              return P(1, 0, a);
            Wa(a);
          }
          var db = [], eb;
          A.invokeEntryPoint = (a, b) => {
            var c = db[a];
            c || (a >= db.length && (db.length = a + 1), db[a] = c = eb.get(a));
            a = c(b);
            Ga() ? O.Cb(a) : fb(a);
          };
          function gb(a) {
            this.sb = a - 24;
            this.Kb = function(b) {
              z()[this.sb + 4 >>> 2 >>> 0] = b;
            };
            this.xb = function(b) {
              z()[this.sb + 8 >>> 2 >>> 0] = b;
            };
            this.vb = function(b, c) {
              this.wb();
              this.Kb(b);
              this.xb(c);
            };
            this.wb = function() {
              z()[this.sb + 16 >>> 2 >>> 0] = 0;
            };
          }
          var hb = 0, ib = 0;
          function jb(a, b, c, d) {
            return E ? P(2, 1, a, b, c, d) : kb(a, b, c, d);
          }
          function kb(a, b, c, d) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            if ("undefined" == typeof SharedArrayBuffer)
              return G("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
            var e = [];
            if (E && 0 === e.length)
              return jb(a, b, c, d);
            a = { Mb: c, mb: a, Fb: d, Sb: e };
            return E ? (a.Ub = "spawnThread", postMessage(a, e), 0) : Qa(a);
          }
          function lb(a, b, c) {
            return E ? P(3, 1, a, b, c) : 0;
          }
          function mb(a, b) {
            if (E)
              return P(4, 1, a, b);
          }
          var nb = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            return b;
          }, ob = (a, b, c, d) => {
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
          }, pb = (a, b, c) => ob(a, t(), b, c);
          function qb(a, b) {
            if (E)
              return P(5, 1, a, b);
          }
          function rb(a, b, c) {
            if (E)
              return P(6, 1, a, b, c);
          }
          function sb(a, b, c) {
            return E ? P(7, 1, a, b, c) : 0;
          }
          function tb(a, b) {
            if (E)
              return P(8, 1, a, b);
          }
          function ub(a, b, c) {
            if (E)
              return P(9, 1, a, b, c);
          }
          function vb(a, b, c, d) {
            if (E)
              return P(10, 1, a, b, c, d);
          }
          function wb(a, b, c, d) {
            if (E)
              return P(11, 1, a, b, c, d);
          }
          function xb(a, b, c, d) {
            if (E)
              return P(12, 1, a, b, c, d);
          }
          function yb(a) {
            if (E)
              return P(13, 1, a);
          }
          function zb(a, b) {
            if (E)
              return P(14, 1, a, b);
          }
          function Ab(a, b, c) {
            if (E)
              return P(15, 1, a, b, c);
          }
          var Bb = (a) => {
            if (null === a)
              return "null";
            var b = typeof a;
            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
          }, Cb, R = (a) => {
            for (var b = ""; t()[a >>> 0]; )
              b += Cb[t()[a++ >>> 0]];
            return b;
          }, Db = {}, Eb = {}, Fb = {}, S;
          function Gb(a, b, c = {}) {
            var d = b.name;
            if (!a)
              throw new S(`type "${d}" must have a positive integer typeid pointer`);
            if (Eb.hasOwnProperty(a)) {
              if (c.Hb)
                return;
              throw new S(`Cannot register type '${d}' twice`);
            }
            Eb[a] = b;
            delete Fb[a];
            Db.hasOwnProperty(a) && (b = Db[a], delete Db[a], b.forEach((e) => e()));
          }
          function T(a, b, c = {}) {
            if (!("argPackAdvance" in b))
              throw new TypeError("registerType registeredInstance requires argPackAdvance");
            Gb(a, b, c);
          }
          var Hb = (a, b, c) => {
            switch (b) {
              case 1:
                return c ? (d) => h()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];
              case 2:
                return c ? (d) => v()[d >>> 1 >>> 0] : (d) => ca()[d >>> 1 >>> 0];
              case 4:
                return c ? (d) => w()[d >>> 2 >>> 0] : (d) => z()[d >>> 2 >>> 0];
              case 8:
                return c ? (d) => J[d >>> 3] : (d) => Aa[d >>> 3];
              default:
                throw new TypeError(`invalid integer width (${b}): ${a}`);
            }
          };
          function Ib() {
            this.lb = [void 0];
            this.zb = [];
          }
          var U = new Ib();
          function Jb(a) {
            a >>>= 0;
            a >= U.sb && 0 === --U.get(a).Ab && U.xb(a);
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
                return U.wb({ Ab: 1, value: a });
            }
          };
          function Kb(a) {
            return this.fromWireType(w()[a >>> 2 >>> 0]);
          }
          var Lb = (a, b) => {
            switch (b) {
              case 4:
                return function(c) {
                  var d = this.fromWireType;
                  m.buffer != n.buffer && p();
                  return d.call(this, za[c >>> 2 >>> 0]);
                };
              case 8:
                return function(c) {
                  return this.fromWireType(ha()[c >>> 3 >>> 0]);
                };
              default:
                throw new TypeError(`invalid float width (${b}): ${a}`);
            }
          };
          function Mb(a) {
            return this.fromWireType(z()[a >>> 2 >>> 0]);
          }
          var Nb = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ob = (a, b) => {
            var c = a >> 1;
            for (var d = c + b / 2; !(c >= d) && ca()[c >>> 0]; )
              ++c;
            c <<= 1;
            if (32 < c - a && Nb)
              return Nb.decode(t().slice(a, c));
            c = "";
            for (d = 0; !(d >= b / 2); ++d) {
              var e = v()[a + 2 * d >>> 1 >>> 0];
              if (0 == e)
                break;
              c += String.fromCharCode(e);
            }
            return c;
          }, Pb = (a, b, c) => {
            void 0 === c && (c = 2147483647);
            if (2 > c)
              return 0;
            c -= 2;
            var d = b;
            c = c < 2 * a.length ? c / 2 : a.length;
            for (var e = 0; e < c; ++e) {
              var f = a.charCodeAt(e);
              v()[b >>> 1 >>> 0] = f;
              b += 2;
            }
            v()[b >>> 1 >>> 0] = 0;
            return b - d;
          }, Qb = (a) => 2 * a.length, Rb = (a, b) => {
            for (var c = 0, d = ""; !(c >= b / 4); ) {
              var e = w()[a + 4 * c >>> 2 >>> 0];
              if (0 == e)
                break;
              ++c;
              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
            }
            return d;
          }, Sb = (a, b, c) => {
            b >>>= 0;
            void 0 === c && (c = 2147483647);
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
              w()[b >>> 2 >>> 0] = f;
              b += 4;
              if (b + 4 > c)
                break;
            }
            w()[b >>> 2 >>> 0] = 0;
            return b - d;
          }, Tb = (a) => {
            for (var b = 0, c = 0; c < a.length; ++c) {
              var d = a.charCodeAt(c);
              55296 <= d && 57343 >= d && ++c;
              b += 4;
            }
            return b;
          }, Ub = (a) => {
            if (!ya)
              try {
                if (a(), !Ga())
                  try {
                    E ? fb(I) : Wa(I);
                  } catch (b) {
                    b instanceof Oa || "unwind" == b || na(1, b);
                  }
              } catch (b) {
                b instanceof Oa || "unwind" == b || na(1, b);
              }
          };
          function Vb(a) {
            a >>>= 0;
            "function" === typeof Atomics.Tb && (Atomics.Tb(w(), a >>> 2, a).value.then($a), a += 128, Atomics.store(w(), a >>> 2, 1));
          }
          A.__emscripten_thread_mailbox_await = Vb;
          var $a = () => {
            var a = Za();
            a && (Vb(a), Ub(() => Wb()));
          };
          A.checkMailbox = $a;
          var Yb = (a) => {
            var b = Xb();
            a = a();
            cb(b);
            return a;
          };
          function P(a, b) {
            var c = arguments.length - 2, d = arguments;
            return Yb(() => {
              for (var e = 2 * c, f = Zb(8 * e), k = f >>> 3, l = 0; l < c; l++) {
                var q = d[2 + l];
                "bigint" == typeof q ? (J[k + 2 * l] = 1n, J[k + 2 * l + 1] = q) : (J[k + 2 * l] = 0n, ha()[k + 2 * l + 1 >>> 0] = q);
              }
              return $b(a, e, f, b);
            });
          }
          var ac = [], cc = (a, b) => {
            var c = Eb[a];
            if (void 0 === c)
              throw a = bc(a), c = R(a), X(a), new S(b + " has unknown type " + c);
            return c;
          }, dc = {}, ec = (a) => {
            var b = dc[a];
            return void 0 === b ? R(a) : b;
          }, fc = [], gc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), hc = (a) => {
            var b = fc.length;
            fc.push(a);
            return b;
          }, ic = (a, b) => {
            for (var c = Array(a), d = 0; d < a; ++d)
              c[d] = cc(z()[b + 4 * d >>> 2 >>> 0], "parameter " + d);
            return c;
          }, jc = (a) => {
            if (void 0 === a)
              return "_unknown";
            a = a.replace(/[^a-zA-Z0-9_]/g, "$");
            var b = a.charCodeAt(0);
            return 48 <= b && 57 >= b ? `_${a}` : a;
          }, lc = {};
          function mc(a, b) {
            a = jc(a);
            return { [a]: function() {
              return b.apply(this, arguments);
            } }[a];
          }
          function nc(a) {
            var b = Function;
            if (!(b instanceof Function))
              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);
            var c = mc(b.name || "unknownFunctionName", function() {
            });
            c.prototype = b.prototype;
            c = new c();
            a = b.apply(c, a);
            return a instanceof Object ? a : c;
          }
          var oc = (a) => {
            for (var b = "", c = 0; c < a; ++c)
              b += (0 !== c ? ", " : "") + "arg" + c;
            var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\n  var HEAPU32 = getMemory();\n";
            for (c = 0; c < a; ++c)
              d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], 'parameter " + c + "');\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\nargs += argType" + c + "['argPackAdvance'];\nargTypes += 4;\n";
            return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\nreturn valueToHandle(obj);\n}\n"))(cc, A, W, () => z());
          }, pc = {}, Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), qc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], rc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
          function sc(a, b, c, d, e, f, k) {
            return E ? P(16, 1, a, b, c, d, e, f, k) : -52;
          }
          function tc(a, b, c, d, e, f) {
            if (E)
              return P(17, 1, a, b, c, d, e, f);
          }
          var vc = (a) => {
            var b = nb(a) + 1, c = uc(b);
            c && pb(a, c, b);
            return c;
          }, wc = {}, yc = () => {
            if (!xc) {
              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ma || "./this.program" }, b;
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
            if (E)
              return P(18, 1, a, b);
            a >>>= 0;
            b >>>= 0;
            var c = 0;
            yc().forEach((d, e) => {
              var f = b + c;
              e = z()[a + 4 * e >>> 2 >>> 0] = f;
              for (f = 0; f < d.length; ++f)
                h()[e++ >>> 0 >>> 0] = d.charCodeAt(f);
              h()[e >>> 0 >>> 0] = 0;
              c += d.length + 1;
            });
            return 0;
          }
          function Ac(a, b) {
            if (E)
              return P(19, 1, a, b);
            a >>>= 0;
            b >>>= 0;
            var c = yc();
            z()[a >>> 2 >>> 0] = c.length;
            var d = 0;
            c.forEach((e) => d += e.length + 1);
            z()[b >>> 2 >>> 0] = d;
            return 0;
          }
          function Bc(a) {
            return E ? P(20, 1, a) : 52;
          }
          function Cc(a, b, c, d) {
            return E ? P(21, 1, a, b, c, d) : 52;
          }
          function Dc(a, b, c, d) {
            return E ? P(22, 1, a, b, c, d) : 70;
          }
          var Ec = [null, [], []];
          function Fc(a, b, c, d) {
            if (E)
              return P(23, 1, a, b, c, d);
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            for (var e = 0, f = 0; f < c; f++) {
              var k = z()[b >>> 2 >>> 0], l = z()[b + 4 >>> 2 >>> 0];
              b += 8;
              for (var q = 0; q < l; q++) {
                var r = t()[k + q >>> 0], x = Ec[a];
                0 === r || 10 === r ? ((1 === a ? wa : G)(Sa(x, 0)), x.length = 0) : x.push(r);
              }
              e += l;
            }
            z()[d >>> 2 >>> 0] = e;
            return 0;
          }
          var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          function Ic(a) {
            var b = Array(nb(a) + 1);
            ob(a, b, 0, b.length);
            return b;
          }
          var Jc = (a, b) => {
            h().set(a, b >>> 0);
          };
          function Kc(a, b, c, d) {
            function e(g, u, y) {
              for (g = "number" == typeof g ? g.toString() : g || ""; g.length < u; )
                g = y[0] + g;
              return g;
            }
            function f(g, u) {
              return e(g, u, "0");
            }
            function k(g, u) {
              function y(kc) {
                return 0 > kc ? -1 : 0 < kc ? 1 : 0;
              }
              var Q;
              0 === (Q = y(g.getFullYear() - u.getFullYear())) && 0 === (Q = y(g.getMonth() - u.getMonth())) && (Q = y(g.getDate() - u.getDate()));
              return Q;
            }
            function l(g) {
              switch (g.getDay()) {
                case 0:
                  return new Date(g.getFullYear() - 1, 11, 29);
                case 1:
                  return g;
                case 2:
                  return new Date(g.getFullYear(), 0, 3);
                case 3:
                  return new Date(
                    g.getFullYear(),
                    0,
                    2
                  );
                case 4:
                  return new Date(g.getFullYear(), 0, 1);
                case 5:
                  return new Date(g.getFullYear() - 1, 11, 31);
                case 6:
                  return new Date(g.getFullYear() - 1, 11, 30);
              }
            }
            function q(g) {
              var u = g.ob;
              for (g = new Date(new Date(g.pb + 1900, 0, 1).getTime()); 0 < u; ) {
                var y = g.getMonth(), Q = (Y(g.getFullYear()) ? Gc : Hc)[y];
                if (u > Q - g.getDate())
                  u -= Q - g.getDate() + 1, g.setDate(1), 11 > y ? g.setMonth(y + 1) : (g.setMonth(0), g.setFullYear(g.getFullYear() + 1));
                else {
                  g.setDate(g.getDate() + u);
                  break;
                }
              }
              y = new Date(g.getFullYear() + 1, 0, 4);
              u = l(new Date(
                g.getFullYear(),
                0,
                4
              ));
              y = l(y);
              return 0 >= k(u, g) ? 0 >= k(y, g) ? g.getFullYear() + 1 : g.getFullYear() : g.getFullYear() - 1;
            }
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            var r = z()[d + 40 >>> 2 >>> 0];
            d = { Qb: w()[d >>> 2 >>> 0], Pb: w()[d + 4 >>> 2 >>> 0], tb: w()[d + 8 >>> 2 >>> 0], yb: w()[d + 12 >>> 2 >>> 0], ub: w()[d + 16 >>> 2 >>> 0], pb: w()[d + 20 >>> 2 >>> 0], kb: w()[d + 24 >>> 2 >>> 0], ob: w()[d + 28 >>> 2 >>> 0], Wb: w()[d + 32 >>> 2 >>> 0], Ob: w()[d + 36 >>> 2 >>> 0], Rb: r ? Ta(r) : "" };
            c = Ta(c);
            r = {
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
            for (var x in r)
              c = c.replace(new RegExp(x, "g"), r[x]);
            var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");
            r = { "%a": (g) => C[g.kb].substring(0, 3), "%A": (g) => C[g.kb], "%b": (g) => N[g.ub].substring(0, 3), "%B": (g) => N[g.ub], "%C": (g) => f((g.pb + 1900) / 100 | 0, 2), "%d": (g) => f(g.yb, 2), "%e": (g) => e(g.yb, 2, " "), "%g": (g) => q(g).toString().substring(2), "%G": (g) => q(g), "%H": (g) => f(g.tb, 2), "%I": (g) => {
              g = g.tb;
              0 == g ? g = 12 : 12 < g && (g -= 12);
              return f(g, 2);
            }, "%j": (g) => {
              for (var u = 0, y = 0; y <= g.ub - 1; u += (Y(g.pb + 1900) ? Gc : Hc)[y++])
                ;
              return f(g.yb + u, 3);
            }, "%m": (g) => f(g.ub + 1, 2), "%M": (g) => f(g.Pb, 2), "%n": () => "\n", "%p": (g) => 0 <= g.tb && 12 > g.tb ? "AM" : "PM", "%S": (g) => f(g.Qb, 2), "%t": () => "	", "%u": (g) => g.kb || 7, "%U": (g) => f(Math.floor((g.ob + 7 - g.kb) / 7), 2), "%V": (g) => {
              var u = Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7);
              2 >= (g.kb + 371 - g.ob - 2) % 7 && u++;
              if (u)
                53 == u && (y = (g.kb + 371 - g.ob) % 7, 4 == y || 3 == y && Y(g.pb) || (u = 1));
              else {
                u = 52;
                var y = (g.kb + 7 - g.ob - 1) % 7;
                (4 == y || 5 == y && Y(g.pb % 400 - 1)) && u++;
              }
              return f(u, 2);
            }, "%w": (g) => g.kb, "%W": (g) => f(Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7), 2), "%y": (g) => (g.pb + 1900).toString().substring(2), "%Y": (g) => g.pb + 1900, "%z": (g) => {
              g = g.Ob;
              var u = 0 <= g;
              g = Math.abs(g) / 60;
              return (u ? "+" : "-") + String("0000" + (g / 60 * 100 + g % 60)).slice(-4);
            }, "%Z": (g) => g.Rb, "%%": () => "%" };
            c = c.replace(/%%/g, "\0\0");
            for (x in r)
              c.includes(x) && (c = c.replace(new RegExp(x, "g"), r[x](d)));
            c = c.replace(/\0\0/g, "%");
            x = Ic(c);
            if (x.length > b)
              return 0;
            Jc(x, a);
            return x.length - 1;
          }
          O.vb();
          for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)
            Lc[Mc] = String.fromCharCode(Mc);
          Cb = Lc;
          S = A.BindingError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "BindingError";
            }
          };
          A.InternalError = class extends Error {
            constructor(a) {
              super(a);
              this.name = "InternalError";
            }
          };
          Object.assign(Ib.prototype, { get(a) {
            return this.lb[a];
          }, has(a) {
            return void 0 !== this.lb[a];
          }, wb(a) {
            var b = this.zb.pop() || this.lb.length;
            this.lb[b] = a;
            return b;
          }, xb(a) {
            this.lb[a] = void 0;
            this.zb.push(a);
          } });
          U.lb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
          U.sb = U.lb.length;
          A.count_emval_handles = () => {
            for (var a = 0, b = U.sb; b < U.lb.length; ++b)
              void 0 !== U.lb[b] && ++a;
            return a;
          };
          var Nc = [Ua, Va, jb, lb, mb, qb, rb, sb, tb, ub, vb, wb, xb, yb, zb, Ab, sc, tc, zc, Ac, Bc, Cc, Dc, Fc], Pc = {
            b: function(a, b, c) {
              a >>>= 0;
              new gb(a).vb(b >>> 0, c >>> 0);
              hb = a;
              ib++;
              throw hb;
            },
            ea: function(a) {
              Oc(a >>> 0, !B, 1, !oa, 131072, false);
              O.Db();
            },
            D: function(a) {
              a >>>= 0;
              E ? postMessage({ cmd: "cleanupThread", thread: a }) : ((a = O.jb[a]) || H(), O.Bb(a));
            },
            W: kb,
            y: lb,
            ka: mb,
            S: qb,
            U: rb,
            L: sb,
            ia: tb,
            ba: ub,
            ha: vb,
            F: wb,
            T: xb,
            Q: yb,
            ja: zb,
            R: Ab,
            I: function(a, b, c, d, e) {
              a >>>= 0;
              b >>>= 0;
              c >>>= 0;
              b = R(b);
              var f = -1 != b.indexOf("u");
              f && (e = (1n << 64n) - 1n);
              T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {
                if ("bigint" != typeof l && "number" != typeof l)
                  throw new TypeError(`Cannot convert "${Bb(l)}" to ${this.name}`);
                if (l < d || l > e)
                  throw new TypeError(`Passing a number "${Bb(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);
                return l;
              }, argPackAdvance: 8, readValueFromPointer: Hb(b, c, !f), rb: null });
            },
            qa: function(a, b, c, d) {
              a >>>= 0;
              b = R(b >>> 0);
              T(a, {
                name: b,
                fromWireType: function(e) {
                  return !!e;
                },
                toWireType: function(e, f) {
                  return f ? c : d;
                },
                argPackAdvance: 8,
                readValueFromPointer: function(e) {
                  return this.fromWireType(t()[e >>> 0]);
                },
                rb: null
              });
            },
            pa: function(a, b) {
              a >>>= 0;
              b = R(b >>> 0);
              T(a, { name: b, fromWireType: (c) => {
                var d = V(c);
                Jb(c);
                return d;
              }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Kb, rb: null });
            },
            H: function(a, b, c) {
              a >>>= 0;
              c >>>= 0;
              b = R(b >>> 0);
              T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Lb(b, c), rb: null });
            },
            t: function(a, b, c, d, e) {
              a >>>= 0;
              c >>>= 0;
              b = R(b >>> 0);
              -1 === e && (e = 4294967295);
              e = (l) => l;
              if (0 === d) {
                var f = 32 - 8 * c;
                e = (l) => l << f >>> f;
              }
              var k = b.includes("unsigned") ? function(l, q) {
                return q >>> 0;
              } : function(l, q) {
                return q;
              };
              T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Hb(b, c, 0 !== d), rb: null });
            },
            m: function(a, b, c) {
              function d(f) {
                var k = z()[f >>> 2 >>> 0];
                f = z()[f + 4 >>> 2 >>> 0];
                return new e(h().buffer, f, k);
              }
              a >>>= 0;
              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
              c = R(c >>> 0);
              T(
                a,
                { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d },
                { Hb: true }
              );
            },
            J: function(a, b) {
              a >>>= 0;
              b = R(b >>> 0);
              var c = "std::string" === b;
              T(a, { name: b, fromWireType: function(d) {
                var e = z()[d >>> 2 >>> 0], f = d + 4;
                if (c)
                  for (var k = f, l = 0; l <= e; ++l) {
                    var q = f + l;
                    if (l == e || 0 == t()[q >>> 0]) {
                      k = Ta(k, q - k);
                      if (void 0 === r)
                        var r = k;
                      else
                        r += String.fromCharCode(0), r += k;
                      k = q + 1;
                    }
                  }
                else {
                  r = Array(e);
                  for (l = 0; l < e; ++l)
                    r[l] = String.fromCharCode(t()[f + l >>> 0]);
                  r = r.join("");
                }
                X(d);
                return r;
              }, toWireType: function(d, e) {
                e instanceof ArrayBuffer && (e = new Uint8Array(e));
                var f = "string" == typeof e;
                if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))
                  throw new S("Cannot pass non-string to std::string");
                var k = c && f ? nb(e) : e.length;
                var l = uc(4 + k + 1), q = l + 4;
                z()[l >>> 2 >>> 0] = k;
                if (c && f)
                  pb(e, q, k + 1);
                else if (f)
                  for (f = 0; f < k; ++f) {
                    var r = e.charCodeAt(f);
                    if (255 < r)
                      throw X(q), new S("String has UTF-16 code units that do not fit in 8 bits");
                    t()[q + f >>> 0] = r;
                  }
                else
                  for (f = 0; f < k; ++f)
                    t()[q + f >>> 0] = e[f];
                null !== d && d.push(X, l);
                return l;
              }, argPackAdvance: 8, readValueFromPointer: Mb, rb(d) {
                X(d);
              } });
            },
            A: function(a, b, c) {
              a >>>= 0;
              b >>>= 0;
              c >>>= 0;
              c = R(c);
              if (2 === b) {
                var d = Ob;
                var e = Pb;
                var f = Qb;
                var k = () => ca();
                var l = 1;
              } else
                4 === b && (d = Rb, e = Sb, f = Tb, k = () => z(), l = 2);
              T(a, {
                name: c,
                fromWireType: (q) => {
                  for (var r = z()[q >>> 2 >>> 0], x = k(), C, N = q + 4, g = 0; g <= r; ++g) {
                    var u = q + 4 + g * b;
                    if (g == r || 0 == x[u >>> l])
                      N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;
                  }
                  X(q);
                  return C;
                },
                toWireType: (q, r) => {
                  if ("string" != typeof r)
                    throw new S(`Cannot pass non-string to C++ string type ${c}`);
                  var x = f(r), C = uc(4 + x + b);
                  z()[C >>> 2] = x >> l;
                  e(r, C + 4, x + b);
                  null !== q && q.push(X, C);
                  return C;
                },
                argPackAdvance: 8,
                readValueFromPointer: Kb,
                rb(q) {
                  X(q);
                }
              });
            },
            ra: function(a, b) {
              a >>>= 0;
              b = R(b >>> 0);
              T(a, { Ib: true, name: b, argPackAdvance: 0, fromWireType: () => {
              }, toWireType: () => {
              } });
            },
            na: () => true,
            O: function(a, b) {
              a >>>= 0;
              a == b >>> 0 ? setTimeout(() => $a()) : E ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = O.jb[a]) && a.postMessage({ cmd: "checkMailbox" });
            },
            X: function(a, b, c, d) {
              b >>>= 0;
              c /= 2;
              ac.length = c;
              d = d >>> 0 >>> 3;
              for (var e = 0; e < c; e++)
                ac[e] = J[d + 2 * e] ? J[d + 2 * e + 1] : ha()[d + 2 * e + 1 >>> 0];
              a = Nc[a];
              O.Gb = b;
              b = a.apply(null, ac);
              O.Gb = 0;
              return b;
            },
            da: Vb,
            ma: function(a) {
              D && O.jb[a >>> 0].ref();
            },
            r: function(a, b, c) {
              b >>>= 0;
              c >>>= 0;
              a = V(a >>> 0);
              b = cc(b, "emval::as");
              var d = [], e = W(d);
              z()[c >>> 2 >>> 0] = e;
              return b.toWireType(d, a);
            },
            i: function(a, b, c, d, e) {
              c >>>= 0;
              d >>>= 0;
              e >>>= 0;
              a = fc[a >>> 0];
              b = V(b >>> 0);
              c = ec(c);
              var f = [];
              z()[d >>> 2 >>> 0] = W(f);
              return a(b, c, f, e);
            },
            u: function(a, b, c, d) {
              c >>>= 0;
              d >>>= 0;
              a = fc[a >>> 0];
              b = V(b >>> 0);
              c = ec(c);
              a(b, c, null, d);
            },
            c: Jb,
            K: function(a, b) {
              b >>>= 0;
              a = V(a >>> 0);
              b = V(b);
              return a == b;
            },
            o: function(a) {
              a >>>= 0;
              if (0 === a)
                return W(gc());
              a = ec(a);
              return W(gc()[a]);
            },
            h: function(a, b) {
              var c = ic(a, b >>> 0), d = c[0];
              b = d.name + "_$" + c.slice(1).map(function(x) {
                return x.name;
              }).join("_") + "$";
              var e = lc[b];
              if (void 0 !== e)
                return e;
              e = ["retType"];
              for (var f = [d], k = "", l = 0; l < a - 1; ++l)
                k += (0 !== l ? ", " : "") + "arg" + l, e.push("argType" + l), f.push(c[1 + l]);
              var q = "return function " + jc("methodCaller_" + b) + "(handle, name, destructors, args) {\n", r = 0;
              for (l = 0; l < a - 1; ++l)
                q += "    var arg" + l + " = argType" + l + ".readValueFromPointer(args" + (r ? "+" + r : "") + ");\n", r += c[l + 1].argPackAdvance;
              q += "    var rv = handle[name](" + k + ");\n";
              for (l = 0; l < a - 1; ++l)
                c[l + 1].deleteObject && (q += "    argType" + l + ".deleteObject(arg" + l + ");\n");
              d.Ib || (q += "    return retType.toWireType(destructors, rv);\n");
              e.push(q + "};\n");
              a = nc(e).apply(null, f);
              e = hc(a);
              return lc[b] = e;
            },
            q: function(a, b) {
              b >>>= 0;
              a = V(a >>> 0);
              b = V(b);
              return W(a[b]);
            },
            d: function(a) {
              a >>>= 0;
              4 < a && (U.get(a).Ab += 1);
            },
            x: function(a, b, c, d) {
              c >>>= 0;
              d >>>= 0;
              a = V(a >>> 0);
              var e = pc[b];
              e || (e = oc(b), pc[b] = e);
              return e(a, c, d);
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
            e: function(a) {
              return W(ec(a >>> 0));
            },
            k: function() {
              return W({});
            },
            g: function(a) {
              a >>>= 0;
              for (var b = V(a); b.length; ) {
                var c = b.pop();
                b.pop()(c);
              }
              Jb(a);
            },
            j: function(a, b, c) {
              b >>>= 0;
              c >>>= 0;
              a = V(a >>> 0);
              b = V(b);
              c = V(c);
              a[b] = c;
            },
            f: function(a, b) {
              b >>>= 0;
              a = cc(a >>> 0, "_emval_take_value");
              a = a.readValueFromPointer(b);
              return W(a);
            },
            _: function(a, b) {
              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
              b >>>= 0;
              a = new Date(1e3 * a);
              w()[b >>> 2 >>> 0] = a.getUTCSeconds();
              w()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();
              w()[b + 8 >>> 2 >>> 0] = a.getUTCHours();
              w()[b + 12 >>> 2 >>> 0] = a.getUTCDate();
              w()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();
              w()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
              w()[b + 24 >>> 2 >>> 0] = a.getUTCDay();
              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
              w()[b + 28 >>> 2 >>> 0] = a;
            },
            $: function(a, b) {
              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
              b >>>= 0;
              a = new Date(1e3 * a);
              w()[b >>> 2 >>> 0] = a.getSeconds();
              w()[b + 4 >>> 2 >>> 0] = a.getMinutes();
              w()[b + 8 >>> 2 >>> 0] = a.getHours();
              w()[b + 12 >>> 2 >>> 0] = a.getDate();
              w()[b + 16 >>> 2 >>> 0] = a.getMonth();
              w()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
              w()[b + 24 >>> 2 >>> 0] = a.getDay();
              var c = (Y(a.getFullYear()) ? qc : rc)[a.getMonth()] + a.getDate() - 1 | 0;
              w()[b + 28 >>> 2 >>> 0] = c;
              w()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
              c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
              a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
              w()[b + 32 >>> 2 >>> 0] = a;
            },
            aa: function(a) {
              a >>>= 0;
              var b = new Date(w()[a + 20 >>> 2 >>> 0] + 1900, w()[a + 16 >>> 2 >>> 0], w()[a + 12 >>> 2 >>> 0], w()[a + 8 >>> 2 >>> 0], w()[a + 4 >>> 2 >>> 0], w()[a >>> 2 >>> 0], 0), c = w()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);
              0 > c ? w()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));
              w()[a + 24 >>> 2 >>> 0] = b.getDay();
              c = (Y(b.getFullYear()) ? qc : rc)[b.getMonth()] + b.getDate() - 1 | 0;
              w()[a + 28 >>> 2 >>> 0] = c;
              w()[a >>> 2 >>> 0] = b.getSeconds();
              w()[a + 4 >>> 2 >>> 0] = b.getMinutes();
              w()[a + 8 >>> 2 >>> 0] = b.getHours();
              w()[a + 12 >>> 2 >>> 0] = b.getDate();
              w()[a + 16 >>> 2 >>> 0] = b.getMonth();
              w()[a + 20 >>> 2 >>> 0] = b.getYear();
              return BigInt(b.getTime() / 1e3);
            },
            Y: sc,
            Z: tc,
            N: function(a, b, c) {
              function d(r) {
                return (r = r.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? r[1] : "GMT";
              }
              a >>>= 0;
              b >>>= 0;
              c >>>= 0;
              var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(e, 6, 1);
              e = f.getTimezoneOffset();
              var l = k.getTimezoneOffset(), q = Math.max(e, l);
              z()[a >>> 2 >>> 0] = 60 * q;
              w()[b >>> 2 >>> 0] = Number(e != l);
              a = d(f);
              b = d(k);
              a = vc(a);
              b = vc(b);
              l < e ? (z()[c >>> 2 >>> 0] = a, z()[c + 4 >>> 2 >>> 0] = b) : (z()[c >>> 2 >>> 0] = b, z()[c + 4 >>> 2 >>> 0] = a);
            },
            n: () => {
              H("");
            },
            E: () => {
            },
            G: () => Date.now(),
            la: () => {
              Fa += 1;
              throw "unwind";
            },
            P: function() {
              return 4294901760;
            },
            s: () => performance.timeOrigin + performance.now(),
            w: () => D ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,
            M: function(a) {
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
                    p();
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
            fa: zc,
            ga: Ac,
            V: Wa,
            z: Bc,
            C: Cc,
            ca: Dc,
            B: Fc,
            a: m || A.wasmMemory,
            oa: Kc,
            p: function(a, b, c, d) {
              return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
            }
          }, Z = function() {
            var a = { a: Pc };
            K++;
            Na(a, function(b) {
              var c = b.module;
              Z = b.instance.exports;
              Z = Qc();
              O.Eb.push(Z.Xa);
              eb = Z._a;
              Da.unshift(Z.sa);
              xa = c;
              Ia();
            }).catch(ka);
            return {};
          }();
          A._OrtInit = (a, b) => (A._OrtInit = Z.ta)(a, b);
          A._OrtGetLastError = (a, b) => (A._OrtGetLastError = Z.ua)(a, b);
          A._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, q, r) => (A._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, q, r);
          A._OrtAppendExecutionProvider = (a, b) => (A._OrtAppendExecutionProvider = Z.wa)(a, b);
          A._OrtAddFreeDimensionOverride = (a, b, c) => (A._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);
          A._OrtAddSessionConfigEntry = (a, b, c) => (A._OrtAddSessionConfigEntry = Z.ya)(a, b, c);
          A._OrtReleaseSessionOptions = (a) => (A._OrtReleaseSessionOptions = Z.za)(a);
          A._OrtCreateSession = (a, b, c) => (A._OrtCreateSession = Z.Aa)(a, b, c);
          A._OrtReleaseSession = (a) => (A._OrtReleaseSession = Z.Ba)(a);
          A._OrtGetInputOutputCount = (a, b, c) => (A._OrtGetInputOutputCount = Z.Ca)(a, b, c);
          A._OrtGetInputName = (a, b) => (A._OrtGetInputName = Z.Da)(a, b);
          A._OrtGetOutputName = (a, b) => (A._OrtGetOutputName = Z.Ea)(a, b);
          A._OrtFree = (a) => (A._OrtFree = Z.Fa)(a);
          A._OrtCreateTensor = (a, b, c, d, e, f) => (A._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);
          A._OrtGetTensorData = (a, b, c, d, e) => (A._OrtGetTensorData = Z.Ha)(a, b, c, d, e);
          A._OrtReleaseTensor = (a) => (A._OrtReleaseTensor = Z.Ia)(a);
          A._OrtCreateRunOptions = (a, b, c, d) => (A._OrtCreateRunOptions = Z.Ja)(a, b, c, d);
          A._OrtAddRunConfigEntry = (a, b, c) => (A._OrtAddRunConfigEntry = Z.Ka)(a, b, c);
          A._OrtReleaseRunOptions = (a) => (A._OrtReleaseRunOptions = Z.La)(a);
          A._OrtCreateBinding = (a) => (A._OrtCreateBinding = Z.Ma)(a);
          A._OrtBindInput = (a, b, c) => (A._OrtBindInput = Z.Na)(a, b, c);
          A._OrtBindOutput = (a, b, c, d) => (A._OrtBindOutput = Z.Oa)(a, b, c, d);
          A._OrtClearBoundOutputs = (a) => (A._OrtClearBoundOutputs = Z.Pa)(a);
          A._OrtReleaseBinding = (a) => (A._OrtReleaseBinding = Z.Qa)(a);
          A._OrtRunWithBinding = (a, b, c, d, e) => (A._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);
          A._OrtRun = (a, b, c, d, e, f, k, l) => (A._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);
          A._OrtEndProfiling = (a) => (A._OrtEndProfiling = Z.Ta)(a);
          var Za = A._pthread_self = () => (Za = A._pthread_self = Z.Ua)(), uc = A._malloc = (a) => (uc = A._malloc = Z.Va)(a), X = A._free = (a) => (X = A._free = Z.Wa)(a);
          A.__emscripten_tls_init = () => (A.__emscripten_tls_init = Z.Xa)();
          var bc = (a) => (bc = Z.Ya)(a);
          A.__embind_initialize_bindings = () => (A.__embind_initialize_bindings = Z.Za)();
          var Oc = A.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = A.__emscripten_thread_init = Z.$a)(a, b, c, d, e, f);
          A.__emscripten_thread_crashed = () => (A.__emscripten_thread_crashed = Z.ab)();
          var $b = (a, b, c, d) => ($b = Z.bb)(a, b, c, d), Ya = (a) => (Ya = Z.cb)(a), fb = A.__emscripten_thread_exit = (a) => (fb = A.__emscripten_thread_exit = Z.db)(a), Wb = A.__emscripten_check_mailbox = () => (Wb = A.__emscripten_check_mailbox = Z.eb)(), bb = (a, b) => (bb = Z.fb)(a, b), Xb = () => (Xb = Z.gb)(), cb = (a) => (cb = Z.hb)(a), Zb = (a) => (Zb = Z.ib)(a);
          function Qc() {
            var a = Z;
            a = Object.assign({}, a);
            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;
            a.__errno_location = b(a.__errno_location);
            a.Ua = b(a.Ua);
            a.Va = c(a.Va);
            a.Ya = c(a.Ya);
            a.gb = b(a.gb);
            a.ib = c(a.ib);
            return a;
          }
          A.keepRuntimeAlive = Ga;
          A.wasmMemory = m;
          A.stackAlloc = Zb;
          A.stackSave = Xb;
          A.stackRestore = cb;
          A.UTF8ToString = Ta;
          A.stringToUTF8 = pb;
          A.lengthBytesUTF8 = nb;
          A.ExitStatus = Oa;
          A.PThread = O;
          var Rc;
          L = function Sc() {
            Rc || Tc();
            Rc || (L = Sc);
          };
          function Tc() {
            0 < K || (E ? (ja(A), E || ab(Da), startWorker(A)) : (ab(Ca), 0 < K || Rc || (Rc = true, A.calledRun = true, ya || (E || ab(Da), ja(A), E || ab(Ea)))));
          }
          Tc();
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
      module.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\n';
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
  var getSessionInputOutputCount, initOrt, initRuntime, activeSessions, createSessionAllocate, createSessionFinalize, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
  var init_wasm_core_impl = __esm({
    "web/lib/wasm/wasm-core-impl.ts"() {
      "use strict";
      init_run_options();
      init_session_options();
      init_wasm_common();
      init_wasm_factory();
      init_wasm_utils();
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
      };
      activeSessions = /* @__PURE__ */ new Map();
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
      module.exports = '/*!\n * ONNX Runtime Web v1.17.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    readFile: () => readFile\n  });\n  var readFile;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm.js\n  var require_ort_wasm = __commonJS({\n    "web/lib/wasm/binding/ort-wasm.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          var h = moduleArg, aa, ba;\n          h.ready = new Promise((a, b) => {\n            aa = a;\n            ba = b;\n          });\n          var ca = Object.assign({}, h), da = "./this.program", ea = "object" == typeof window, m = "function" == typeof importScripts, fa = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, p = "", ha, t, w;\n          if (fa) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), ia = (init_path(), __toCommonJS(path_exports));\n            p = m ? ia.dirname(p) + "/" : __dirname + "/";\n            ha = (a, b) => {\n              a = a.startsWith("file://") ? new URL(a) : ia.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            w = (a) => {\n              a = ha(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            t = (a, b, c, d = true) => {\n              a = a.startsWith("file://") ? new URL(a) : ia.normalize(a);\n              fs.readFile(a, d ? void 0 : "utf8", (e, g) => {\n                e ? c(e) : b(d ? g.buffer : g);\n              });\n            };\n            !h.thisProgram && 1 < process.argv.length && (da = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            h.inspect = () => "[Emscripten Module object]";\n          } else if (ea || m)\n            m ? p = self.location.href : "undefined" != typeof document && document.currentScript && (p = document.currentScript.src), _scriptDir && (p = _scriptDir), 0 !== p.indexOf("blob:") ? p = p.substr(0, p.replace(/[?#].*/, "").lastIndexOf("/") + 1) : p = "", ha = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, m && (w = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), t = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            };\n          var ja = console.log.bind(console), x = console.error.bind(console);\n          Object.assign(h, ca);\n          ca = null;\n          "object" != typeof WebAssembly && ka("no native wasm support detected");\n          var z, la = false, A, B, C, D, E, G, ma, na, oa, pa;\n          function qa() {\n            var a = z.buffer;\n            h.HEAP8 = A = new Int8Array(a);\n            h.HEAP16 = C = new Int16Array(a);\n            h.HEAPU8 = B = new Uint8Array(a);\n            h.HEAPU16 = D = new Uint16Array(a);\n            h.HEAP32 = E = new Int32Array(a);\n            h.HEAPU32 = G = new Uint32Array(a);\n            h.HEAPF32 = ma = new Float32Array(a);\n            h.HEAPF64 = pa = new Float64Array(a);\n            h.HEAP64 = na = new BigInt64Array(a);\n            h.HEAPU64 = oa = new BigUint64Array(a);\n          }\n          var ra = [], sa = [], ta = [], I = 0, ua = null, J = null;\n          function ka(a) {\n            a = "Aborted(" + a + ")";\n            x(a);\n            la = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            ba(a);\n            throw a;\n          }\n          function va(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var K;\n          K = "ort-wasm.wasm";\n          if (!va(K)) {\n            var wa = K;\n            K = h.locateFile ? h.locateFile(wa, p) : p + wa;\n          }\n          function xa(a) {\n            if (w)\n              return w(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function ya(a) {\n            if (ea || m) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => xa(a));\n              if (t)\n                return new Promise((b, c) => {\n                  t(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => xa(a));\n          }\n          function za(a, b, c) {\n            return ya(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              x(`failed to asynchronously prepare wasm: ${d}`);\n              ka(d);\n            });\n          }\n          function Aa(a, b) {\n            var c = K;\n            return "function" != typeof WebAssembly.instantiateStreaming || va(c) || c.startsWith("file://") || fa || "function" != typeof fetch ? za(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {\n              x(`wasm streaming compile failed: ${e}`);\n              x("falling back to ArrayBuffer instantiation");\n              return za(c, a, b);\n            }));\n          }\n          function Ba(a) {\n            this.Va = a - 24;\n            this.fb = function(b) {\n              G[this.Va + 4 >>> 2 >>> 0] = b;\n            };\n            this.eb = function(b) {\n              G[this.Va + 8 >>> 2 >>> 0] = b;\n            };\n            this.Za = function(b, c) {\n              this.$a();\n              this.fb(b);\n              this.eb(c);\n            };\n            this.$a = function() {\n              G[this.Va + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var Ca = 0, Da = 0, Ea = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Fa = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ea)\n              return Ea.decode(a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var e = a[b++];\n              if (e & 128) {\n                var g = a[b++] & 63;\n                if (192 == (e & 224))\n                  d += String.fromCharCode((e & 31) << 6 | g);\n                else {\n                  var l = a[b++] & 63;\n                  e = 224 == (e & 240) ? (e & 15) << 12 | g << 6 | l : (e & 7) << 18 | g << 12 | l << 6 | a[b++] & 63;\n                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));\n                }\n              } else\n                d += String.fromCharCode(e);\n            }\n            return d;\n          }, L = (a, b) => (a >>>= 0) ? Fa(B, a, b) : "", M = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, N = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var e = c;\n            d = c + d - 1;\n            for (var g = 0; g < a.length; ++g) {\n              var l = a.charCodeAt(g);\n              if (55296 <= l && 57343 >= l) {\n                var k = a.charCodeAt(++g);\n                l = 65536 + ((l & 1023) << 10) | k & 1023;\n              }\n              if (127 >= l) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = l;\n              } else {\n                if (2047 >= l) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | l >> 6;\n                } else {\n                  if (65535 >= l) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | l >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | l >> 18;\n                    b[c++ >>> 0] = 128 | l >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | l >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | l & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - e;\n          }, Ga = (a) => {\n            if (null === a)\n              return "null";\n            var b = typeof a;\n            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;\n          }, Ha, O = (a) => {\n            for (var b = ""; B[a >>> 0]; )\n              b += Ha[B[a++ >>> 0]];\n            return b;\n          }, Ia = {}, Ja = {}, Ka = {}, P;\n          function La(a, b, c = {}) {\n            var d = b.name;\n            if (!a)\n              throw new P(`type "${d}" must have a positive integer typeid pointer`);\n            if (Ja.hasOwnProperty(a)) {\n              if (c.gb)\n                return;\n              throw new P(`Cannot register type \'${d}\' twice`);\n            }\n            Ja[a] = b;\n            delete Ka[a];\n            Ia.hasOwnProperty(a) && (b = Ia[a], delete Ia[a], b.forEach((e) => e()));\n          }\n          function Q(a, b, c = {}) {\n            if (!("argPackAdvance" in b))\n              throw new TypeError("registerType registeredInstance requires argPackAdvance");\n            La(a, b, c);\n          }\n          var Ma = (a, b, c) => {\n            switch (b) {\n              case 1:\n                return c ? (d) => A[d >>> 0 >>> 0] : (d) => B[d >>> 0 >>> 0];\n              case 2:\n                return c ? (d) => C[d >>> 1 >>> 0] : (d) => D[d >>> 1 >>> 0];\n              case 4:\n                return c ? (d) => E[d >>> 2 >>> 0] : (d) => G[d >>> 2 >>> 0];\n              case 8:\n                return c ? (d) => na[d >>> 3] : (d) => oa[d >>> 3];\n              default:\n                throw new TypeError(`invalid integer width (${b}): ${a}`);\n            }\n          };\n          function Na() {\n            this.Sa = [void 0];\n            this.bb = [];\n          }\n          var R = new Na();\n          function Oa(a) {\n            a >>>= 0;\n            a >= R.Va && 0 === --R.get(a).cb && R.$a(a);\n          }\n          var S = (a) => {\n            if (!a)\n              throw new P("Cannot use deleted val. handle = " + a);\n            return R.get(a).value;\n          }, T = (a) => {\n            switch (a) {\n              case void 0:\n                return 1;\n              case null:\n                return 2;\n              case true:\n                return 3;\n              case false:\n                return 4;\n              default:\n                return R.Za({ cb: 1, value: a });\n            }\n          };\n          function Pa(a) {\n            return this.fromWireType(E[a >>> 2 >>> 0]);\n          }\n          var Qa = (a, b) => {\n            switch (b) {\n              case 4:\n                return function(c) {\n                  return this.fromWireType(ma[c >>> 2 >>> 0]);\n                };\n              case 8:\n                return function(c) {\n                  return this.fromWireType(pa[c >>> 3 >>> 0]);\n                };\n              default:\n                throw new TypeError(`invalid float width (${b}): ${a}`);\n            }\n          };\n          function Ra(a) {\n            return this.fromWireType(G[a >>> 2 >>> 0]);\n          }\n          var Sa = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ta = (a, b) => {\n            var c = a >> 1;\n            for (var d = c + b / 2; !(c >= d) && D[c >>> 0]; )\n              ++c;\n            c <<= 1;\n            if (32 < c - a && Sa)\n              return Sa.decode(B.subarray(a >>> 0, c >>> 0));\n            c = "";\n            for (d = 0; !(d >= b / 2); ++d) {\n              var e = C[a + 2 * d >>> 1 >>> 0];\n              if (0 == e)\n                break;\n              c += String.fromCharCode(e);\n            }\n            return c;\n          }, Ua = (a, b, c) => {\n            void 0 === c && (c = 2147483647);\n            if (2 > c)\n              return 0;\n            c -= 2;\n            var d = b;\n            c = c < 2 * a.length ? c / 2 : a.length;\n            for (var e = 0; e < c; ++e)\n              C[b >>> 1 >>> 0] = a.charCodeAt(e), b += 2;\n            C[b >>> 1 >>> 0] = 0;\n            return b - d;\n          }, Va = (a) => 2 * a.length, Wa = (a, b) => {\n            for (var c = 0, d = ""; !(c >= b / 4); ) {\n              var e = E[a + 4 * c >>> 2 >>> 0];\n              if (0 == e)\n                break;\n              ++c;\n              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);\n            }\n            return d;\n          }, Xa = (a, b, c) => {\n            b >>>= 0;\n            void 0 === c && (c = 2147483647);\n            if (4 > c)\n              return 0;\n            var d = b;\n            c = d + c - 4;\n            for (var e = 0; e < a.length; ++e) {\n              var g = a.charCodeAt(e);\n              if (55296 <= g && 57343 >= g) {\n                var l = a.charCodeAt(++e);\n                g = 65536 + ((g & 1023) << 10) | l & 1023;\n              }\n              E[b >>> 2 >>> 0] = g;\n              b += 4;\n              if (b + 4 > c)\n                break;\n            }\n            E[b >>> 2 >>> 0] = 0;\n            return b - d;\n          }, Ya = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              55296 <= d && 57343 >= d && ++c;\n              b += 4;\n            }\n            return b;\n          }, V = (a, b) => {\n            var c = Ja[a];\n            if (void 0 === c)\n              throw a = Za(a), c = O(a), U(a), new P(b + " has unknown type " + c);\n            return c;\n          }, $a = {}, W = (a) => {\n            var b = $a[a];\n            return void 0 === b ? O(a) : b;\n          }, X = [], bb = () => "object" == typeof globalThis ? globalThis : Function("return this")(), cb = (a) => {\n            var b = X.length;\n            X.push(a);\n            return b;\n          }, db = (a, b) => {\n            for (var c = Array(a), d = 0; d < a; ++d)\n              c[d] = V(G[b + 4 * d >>> 2 >>> 0], "parameter " + d);\n            return c;\n          }, eb = (a) => {\n            if (void 0 === a)\n              return "_unknown";\n            a = a.replace(/[^a-zA-Z0-9_]/g, "$");\n            var b = a.charCodeAt(0);\n            return 48 <= b && 57 >= b ? `_${a}` : a;\n          }, fb = {};\n          function gb(a, b) {\n            a = eb(a);\n            return { [a]: function() {\n              return b.apply(this, arguments);\n            } }[a];\n          }\n          function hb(a) {\n            var b = Function;\n            if (!(b instanceof Function))\n              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);\n            var c = gb(b.name || "unknownFunctionName", function() {\n            });\n            c.prototype = b.prototype;\n            c = new c();\n            a = b.apply(c, a);\n            return a instanceof Object ? a : c;\n          }\n          var ib = (a) => {\n            for (var b = "", c = 0; c < a; ++c)\n              b += (0 !== c ? ", " : "") + "arg" + c;\n            var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\\n  var HEAPU32 = getMemory();\\n";\n            for (c = 0; c < a; ++c)\n              d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], \'parameter " + c + "\');\\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\\nargs += argType" + c + "[\'argPackAdvance\'];\\nargTypes += 4;\\n";\n            return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\\nreturn valueToHandle(obj);\\n}\\n"))(V, h, T, () => G);\n          }, jb = {}, Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), kb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], lb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], nb = (a) => {\n            var b = M(a) + 1, c = mb(b);\n            c && N(a, B, c, b);\n            return c;\n          }, ob = {}, qb = () => {\n            if (!pb) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: da || "./this.program" }, b;\n              for (b in ob)\n                void 0 === ob[b] ? delete a[b] : a[b] = ob[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              pb = c;\n            }\n            return pb;\n          }, pb, rb = [null, [], []], sb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], tb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function ub(a) {\n            var b = Array(M(a) + 1);\n            N(a, b, 0, b.length);\n            return b;\n          }\n          function vb(a, b, c, d) {\n            function e(f, r, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < r; )\n                f = u[0] + f;\n              return f;\n            }\n            function g(f, r) {\n              return e(f, r, "0");\n            }\n            function l(f, r) {\n              function u(ab) {\n                return 0 > ab ? -1 : 0 < ab ? 1 : 0;\n              }\n              var H;\n              0 === (H = u(f.getFullYear() - r.getFullYear())) && 0 === (H = u(f.getMonth() - r.getMonth())) && (H = u(f.getDate() - r.getDate()));\n              return H;\n            }\n            function k(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function n(f) {\n              var r = f.Ta;\n              for (f = new Date(new Date(f.Ua + 1900, 0, 1).getTime()); 0 < r; ) {\n                var u = f.getMonth(), H = (Y(f.getFullYear()) ? sb : tb)[u];\n                if (r > H - f.getDate())\n                  r -= H - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + r);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              r = k(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = k(u);\n              return 0 >= l(r, f) ? 0 >= l(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var q = G[d + 40 >>> 2 >>> 0];\n            d = { kb: E[d >>> 2 >>> 0], jb: E[d + 4 >>> 2 >>> 0], Xa: E[d + 8 >>> 2 >>> 0], ab: E[d + 12 >>> 2 >>> 0], Ya: E[d + 16 >>> 2 >>> 0], Ua: E[d + 20 >>> 2 >>> 0], Oa: E[d + 24 >>> 2 >>> 0], Ta: E[d + 28 >>> 2 >>> 0], mb: E[d + 32 >>> 2 >>> 0], ib: E[d + 36 >>> 2 >>> 0], lb: q ? L(q) : "" };\n            c = L(c);\n            q = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var v in q)\n              c = c.replace(new RegExp(v, "g"), q[v]);\n            var y = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), F = "January February March April May June July August September October November December".split(" ");\n            q = { "%a": (f) => y[f.Oa].substring(0, 3), "%A": (f) => y[f.Oa], "%b": (f) => F[f.Ya].substring(0, 3), "%B": (f) => F[f.Ya], "%C": (f) => g((f.Ua + 1900) / 100 | 0, 2), "%d": (f) => g(f.ab, 2), "%e": (f) => e(f.ab, 2, " "), "%g": (f) => n(f).toString().substring(2), "%G": (f) => n(f), "%H": (f) => g(f.Xa, 2), "%I": (f) => {\n              f = f.Xa;\n              0 == f ? f = 12 : 12 < f && (f -= 12);\n              return g(f, 2);\n            }, "%j": (f) => {\n              for (var r = 0, u = 0; u <= f.Ya - 1; r += (Y(f.Ua + 1900) ? sb : tb)[u++])\n                ;\n              return g(f.ab + r, 3);\n            }, "%m": (f) => g(f.Ya + 1, 2), "%M": (f) => g(f.jb, 2), "%n": () => "\\n", "%p": (f) => 0 <= f.Xa && 12 > f.Xa ? "AM" : "PM", "%S": (f) => g(f.kb, 2), "%t": () => "	", "%u": (f) => f.Oa || 7, "%U": (f) => g(Math.floor((f.Ta + 7 - f.Oa) / 7), 2), "%V": (f) => {\n              var r = Math.floor((f.Ta + 7 - (f.Oa + 6) % 7) / 7);\n              2 >= (f.Oa + 371 - f.Ta - 2) % 7 && r++;\n              if (r)\n                53 == r && (u = (f.Oa + 371 - f.Ta) % 7, 4 == u || 3 == u && Y(f.Ua) || (r = 1));\n              else {\n                r = 52;\n                var u = (f.Oa + 7 - f.Ta - 1) % 7;\n                (4 == u || 5 == u && Y(f.Ua % 400 - 1)) && r++;\n              }\n              return g(r, 2);\n            }, "%w": (f) => f.Oa, "%W": (f) => g(Math.floor((f.Ta + 7 - (f.Oa + 6) % 7) / 7), 2), "%y": (f) => (f.Ua + 1900).toString().substring(2), "%Y": (f) => f.Ua + 1900, "%z": (f) => {\n              f = f.ib;\n              var r = 0 <= f;\n              f = Math.abs(f) / 60;\n              return (r ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n            }, "%Z": (f) => f.lb, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (v in q)\n              c.includes(v) && (c = c.replace(new RegExp(v, "g"), q[v](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            v = ub(c);\n            if (v.length > b)\n              return 0;\n            A.set(v, a >>> 0);\n            return v.length - 1;\n          }\n          for (var wb = Array(256), xb = 0; 256 > xb; ++xb)\n            wb[xb] = String.fromCharCode(xb);\n          Ha = wb;\n          P = h.BindingError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "BindingError";\n            }\n          };\n          h.InternalError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "InternalError";\n            }\n          };\n          Object.assign(Na.prototype, { get(a) {\n            return this.Sa[a];\n          }, has(a) {\n            return void 0 !== this.Sa[a];\n          }, Za(a) {\n            var b = this.bb.pop() || this.Sa.length;\n            this.Sa[b] = a;\n            return b;\n          }, $a(a) {\n            this.Sa[a] = void 0;\n            this.bb.push(a);\n          } });\n          R.Sa.push({ value: void 0 }, { value: null }, { value: true }, { value: false });\n          R.Va = R.Sa.length;\n          h.count_emval_handles = () => {\n            for (var a = 0, b = R.Va; b < R.Sa.length; ++b)\n              void 0 !== R.Sa[b] && ++a;\n            return a;\n          };\n          var yb = { a: function(a, b, c) {\n            a >>>= 0;\n            new Ba(a).Za(b >>> 0, c >>> 0);\n            Ca = a;\n            Da++;\n            throw Ca;\n          }, v: function() {\n            return 0;\n          }, ba: function() {\n          }, N: function() {\n          }, P: function() {\n          }, H: function() {\n            return 0;\n          }, $: function() {\n          }, V: function() {\n          }, _: function() {\n          }, A: function() {\n          }, O: function() {\n          }, L: function() {\n          }, aa: function() {\n          }, M: function() {\n          }, D: function(a, b, c, d, e) {\n            b >>>= 0;\n            b = O(b);\n            var g = -1 != b.indexOf("u");\n            g && (e = (1n << 64n) - 1n);\n            Q(a >>> 0, { name: b, fromWireType: (l) => l, toWireType: function(l, k) {\n              if ("bigint" != typeof k && "number" != typeof k)\n                throw new TypeError(`Cannot convert "${Ga(k)}" to ${this.name}`);\n              if (k < d || k > e)\n                throw new TypeError(`Passing a number "${Ga(k)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);\n              return k;\n            }, argPackAdvance: 8, readValueFromPointer: Ma(b, c >>> 0, !g), Wa: null });\n          }, ea: function(a, b, c, d) {\n            b = O(b >>> 0);\n            Q(a >>> 0, { name: b, fromWireType: function(e) {\n              return !!e;\n            }, toWireType: function(e, g) {\n              return g ? c : d;\n            }, argPackAdvance: 8, readValueFromPointer: function(e) {\n              return this.fromWireType(B[e >>> 0]);\n            }, Wa: null });\n          }, da: function(a, b) {\n            b = O(b >>> 0);\n            Q(a >>> 0, {\n              name: b,\n              fromWireType: (c) => {\n                var d = S(c);\n                Oa(c);\n                return d;\n              },\n              toWireType: (c, d) => T(d),\n              argPackAdvance: 8,\n              readValueFromPointer: Pa,\n              Wa: null\n            });\n          }, C: function(a, b, c) {\n            b = O(b >>> 0);\n            Q(a >>> 0, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Qa(b, c >>> 0), Wa: null });\n          }, p: function(a, b, c, d, e) {\n            a >>>= 0;\n            c >>>= 0;\n            b = O(b >>> 0);\n            -1 === e && (e = 4294967295);\n            e = (k) => k;\n            if (0 === d) {\n              var g = 32 - 8 * c;\n              e = (k) => k << g >>> g;\n            }\n            var l = b.includes("unsigned") ? function(k, n) {\n              return n >>> 0;\n            } : function(k, n) {\n              return n;\n            };\n            Q(a, {\n              name: b,\n              fromWireType: e,\n              toWireType: l,\n              argPackAdvance: 8,\n              readValueFromPointer: Ma(b, c, 0 !== d),\n              Wa: null\n            });\n          }, l: function(a, b, c) {\n            function d(g) {\n              return new e(A.buffer, G[g + 4 >>> 2 >>> 0], G[g >>> 2 >>> 0]);\n            }\n            var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];\n            c = O(c >>> 0);\n            Q(a >>> 0, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { gb: true });\n          }, E: function(a, b) {\n            b = O(b >>> 0);\n            var c = "std::string" === b;\n            Q(a >>> 0, { name: b, fromWireType: function(d) {\n              var e = G[d >>> 2 >>> 0], g = d + 4;\n              if (c)\n                for (var l = g, k = 0; k <= e; ++k) {\n                  var n = g + k;\n                  if (k == e || 0 == B[n >>> 0]) {\n                    l = L(l, n - l);\n                    if (void 0 === q)\n                      var q = l;\n                    else\n                      q += String.fromCharCode(0), q += l;\n                    l = n + 1;\n                  }\n                }\n              else {\n                q = Array(e);\n                for (k = 0; k < e; ++k)\n                  q[k] = String.fromCharCode(B[g + k >>> 0]);\n                q = q.join("");\n              }\n              U(d);\n              return q;\n            }, toWireType: function(d, e) {\n              e instanceof ArrayBuffer && (e = new Uint8Array(e));\n              var g = "string" == typeof e;\n              if (!(g || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))\n                throw new P("Cannot pass non-string to std::string");\n              var l = c && g ? M(e) : e.length;\n              var k = mb(4 + l + 1), n = k + 4;\n              G[k >>> 2 >>> 0] = l;\n              if (c && g)\n                N(e, B, n, l + 1);\n              else if (g)\n                for (g = 0; g < l; ++g) {\n                  var q = e.charCodeAt(g);\n                  if (255 < q)\n                    throw U(n), new P("String has UTF-16 code units that do not fit in 8 bits");\n                  B[n + g >>> 0] = q;\n                }\n              else\n                for (g = 0; g < l; ++g)\n                  B[n + g >>> 0] = e[g];\n              null !== d && d.push(U, k);\n              return k;\n            }, argPackAdvance: 8, readValueFromPointer: Ra, Wa(d) {\n              U(d);\n            } });\n          }, x: function(a, b, c) {\n            b >>>= 0;\n            c >>>= 0;\n            c = O(c);\n            if (2 === b) {\n              var d = Ta;\n              var e = Ua;\n              var g = Va;\n              var l = () => D;\n              var k = 1;\n            } else\n              4 === b && (d = Wa, e = Xa, g = Ya, l = () => G, k = 2);\n            Q(a >>> 0, { name: c, fromWireType: (n) => {\n              for (var q = G[n >>> 2 >>> 0], v = l(), y, F = n + 4, f = 0; f <= q; ++f) {\n                var r = n + 4 + f * b;\n                if (f == q || 0 == v[r >>> k])\n                  F = d(F, r - F), void 0 === y ? y = F : (y += String.fromCharCode(0), y += F), F = r + b;\n              }\n              U(n);\n              return y;\n            }, toWireType: (n, q) => {\n              if ("string" != typeof q)\n                throw new P(`Cannot pass non-string to C++ string type ${c}`);\n              var v = g(q), y = mb(4 + v + b);\n              G[y >>> 2] = v >> k;\n              e(q, y + 4, v + b);\n              null !== n && n.push(U, y);\n              return y;\n            }, argPackAdvance: 8, readValueFromPointer: Pa, Wa(n) {\n              U(n);\n            } });\n          }, fa: function(a, b) {\n            b = O(b >>> 0);\n            Q(a >>> 0, { hb: true, name: b, argPackAdvance: 0, fromWireType: () => {\n            }, toWireType: () => {\n            } });\n          }, ca: () => true, o: function(a, b, c) {\n            b >>>= 0;\n            c >>>= 0;\n            a = S(a >>> 0);\n            b = V(b, "emval::as");\n            var d = [], e = T(d);\n            G[c >>> 2 >>> 0] = e;\n            return b.toWireType(d, a);\n          }, h: function(a, b, c, d, e) {\n            c >>>= 0;\n            d >>>= 0;\n            e >>>= 0;\n            a = X[a >>> 0];\n            b = S(b >>> 0);\n            c = W(c);\n            var g = [];\n            G[d >>> 2 >>> 0] = T(g);\n            return a(b, c, g, e);\n          }, r: function(a, b, c, d) {\n            c >>>= 0;\n            d >>>= 0;\n            a = X[a >>> 0];\n            b = S(b >>> 0);\n            c = W(c);\n            a(b, c, null, d);\n          }, b: Oa, F: function(a, b) {\n            b >>>= 0;\n            a = S(a >>> 0);\n            b = S(b);\n            return a == b;\n          }, u: function(a) {\n            a >>>= 0;\n            if (0 === a)\n              return T(bb());\n            a = W(a);\n            return T(bb()[a]);\n          }, g: function(a, b) {\n            var c = db(a, b >>> 0), d = c[0];\n            b = d.name + "_$" + c.slice(1).map(function(v) {\n              return v.name;\n            }).join("_") + "$";\n            var e = fb[b];\n            if (void 0 !== e)\n              return e;\n            e = ["retType"];\n            for (var g = [d], l = "", k = 0; k < a - 1; ++k)\n              l += (0 !== k ? ", " : "") + "arg" + k, e.push("argType" + k), g.push(c[1 + k]);\n            var n = "return function " + eb("methodCaller_" + b) + "(handle, name, destructors, args) {\\n", q = 0;\n            for (k = 0; k < a - 1; ++k)\n              n += "    var arg" + k + " = argType" + k + ".readValueFromPointer(args" + (q ? "+" + q : "") + ");\\n", q += c[k + 1].argPackAdvance;\n            n += "    var rv = handle[name](" + l + ");\\n";\n            for (k = 0; k < a - 1; ++k)\n              c[k + 1].deleteObject && (n += "    argType" + k + ".deleteObject(arg" + k + ");\\n");\n            d.hb || (n += "    return retType.toWireType(destructors, rv);\\n");\n            e.push(n + "};\\n");\n            a = hb(e).apply(null, g);\n            e = cb(a);\n            return fb[b] = e;\n          }, q: function(a, b) {\n            b >>>= 0;\n            a = S(a >>> 0);\n            b = S(b);\n            return T(a[b]);\n          }, c: function(a) {\n            a >>>= 0;\n            4 < a && (R.get(a).cb += 1);\n          }, G: function(a, b, c, d) {\n            c >>>= 0;\n            d >>>= 0;\n            a = S(a >>> 0);\n            var e = jb[b];\n            e || (e = ib(b), jb[b] = e);\n            return e(a, c, d);\n          }, s: function() {\n            return T([]);\n          }, k: function(a) {\n            a = S(a >>> 0);\n            for (var b = Array(a.length), c = 0; c < a.length; c++)\n              b[c] = a[c];\n            return T(b);\n          }, d: function(a) {\n            return T(W(a >>> 0));\n          }, j: function() {\n            return T({});\n          }, f: function(a) {\n            a >>>= 0;\n            for (var b = S(a); b.length; ) {\n              var c = b.pop();\n              b.pop()(c);\n            }\n            Oa(a);\n          }, i: function(a, b, c) {\n            b >>>= 0;\n            c >>>= 0;\n            a = S(a >>> 0);\n            b = S(b);\n            c = S(c);\n            a[b] = c;\n          }, e: function(a, b) {\n            b >>>= 0;\n            a = V(a >>> 0, "_emval_take_value");\n            a = a.readValueFromPointer(b);\n            return T(a);\n          }, S: function(a, b) {\n            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n            b >>>= 0;\n            a = new Date(1e3 * a);\n            E[b >>> 2 >>> 0] = a.getUTCSeconds();\n            E[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n            E[b + 8 >>> 2 >>> 0] = a.getUTCHours();\n            E[b + 12 >>> 2 >>> 0] = a.getUTCDate();\n            E[b + 16 >>> 2 >>> 0] = a.getUTCMonth();\n            E[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n            E[b + 24 >>> 2 >>> 0] = a.getUTCDay();\n            E[b + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n          }, T: function(a, b) {\n            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n            b >>>= 0;\n            a = new Date(1e3 * a);\n            E[b >>> 2 >>> 0] = a.getSeconds();\n            E[b + 4 >>> 2 >>> 0] = a.getMinutes();\n            E[b + 8 >>> 2 >>> 0] = a.getHours();\n            E[b + 12 >>> 2 >>> 0] = a.getDate();\n            E[b + 16 >>> 2 >>> 0] = a.getMonth();\n            E[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n            E[b + 24 >>> 2 >>> 0] = a.getDay();\n            E[b + 28 >>> 2 >>> 0] = (Y(a.getFullYear()) ? kb : lb)[a.getMonth()] + a.getDate() - 1 | 0;\n            E[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n            var c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(), d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n            E[b + 32 >>> 2 >>> 0] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;\n          }, U: function(a) {\n            a >>>= 0;\n            var b = new Date(E[a + 20 >>> 2 >>> 0] + 1900, E[a + 16 >>> 2 >>> 0], E[a + 12 >>> 2 >>> 0], E[a + 8 >>> 2 >>> 0], E[a + 4 >>> 2 >>> 0], E[a >>> 2 >>> 0], 0), c = E[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), l = Math.min(\n              g,\n              e\n            );\n            0 > c ? E[a + 32 >>> 2 >>> 0] = Number(e != g && l == d) : 0 < c != (l == d) && (e = Math.max(g, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? l : e) - d)));\n            E[a + 24 >>> 2 >>> 0] = b.getDay();\n            E[a + 28 >>> 2 >>> 0] = (Y(b.getFullYear()) ? kb : lb)[b.getMonth()] + b.getDate() - 1 | 0;\n            E[a >>> 2 >>> 0] = b.getSeconds();\n            E[a + 4 >>> 2 >>> 0] = b.getMinutes();\n            E[a + 8 >>> 2 >>> 0] = b.getHours();\n            E[a + 12 >>> 2 >>> 0] = b.getDate();\n            E[a + 16 >>> 2 >>> 0] = b.getMonth();\n            E[a + 20 >>> 2 >>> 0] = b.getYear();\n            return BigInt(b.getTime() / 1e3);\n          }, Q: function() {\n            return -52;\n          }, R: function() {\n          }, J: function(a, b, c) {\n            function d(n) {\n              return (n = n.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? n[1] : "GMT";\n            }\n            c >>>= 0;\n            var e = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(e, 0, 1), l = new Date(e, 6, 1);\n            e = g.getTimezoneOffset();\n            var k = l.getTimezoneOffset();\n            G[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(e, k);\n            E[b >>> 0 >>> 2 >>> 0] = Number(e != k);\n            a = d(g);\n            b = d(l);\n            a = nb(a);\n            b = nb(b);\n            k < e ? (G[c >>> 2 >>> 0] = a, G[c + 4 >>> 2 >>> 0] = b) : (G[c >>> 2 >>> 0] = b, G[c + 4 >>> 2 >>> 0] = a);\n          }, t: () => {\n            ka("");\n          }, B: () => Date.now(), K: function() {\n            return 4294901760;\n          }, n: () => performance.now(), Z: function(a, b, c) {\n            b >>>= 0;\n            return B.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n          }, I: function(a) {\n            a >>>= 0;\n            var b = B.length;\n            if (4294901760 < a)\n              return false;\n            for (var c = 1; 4 >= c; c *= 2) {\n              var d = b * (1 + 0.2 / c);\n              d = Math.min(d, a + 100663296);\n              var e = Math;\n              d = Math.max(a, d);\n              a: {\n                e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - z.buffer.byteLength + 65535) / 65536;\n                try {\n                  z.grow(e);\n                  qa();\n                  var g = 1;\n                  break a;\n                } catch (l) {\n                }\n                g = void 0;\n              }\n              if (g)\n                return true;\n            }\n            return false;\n          }, X: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            qb().forEach((d, e) => {\n              var g = b + c;\n              e = G[a + 4 * e >>> 2 >>> 0] = g;\n              for (g = 0; g < d.length; ++g)\n                A[e++ >>> 0 >>> 0] = d.charCodeAt(g);\n              A[e >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }, Y: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = qb();\n            G[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((e) => d += e.length + 1);\n            G[b >>> 2 >>> 0] = d;\n            return 0;\n          }, w: () => 52, z: function() {\n            return 52;\n          }, W: function() {\n            return 70;\n          }, y: function(a, b, c, d) {\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var e = 0, g = 0; g < c; g++) {\n              var l = G[b >>> 2 >>> 0], k = G[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var n = 0; n < k; n++) {\n                var q = B[l + n >>> 0], v = rb[a];\n                0 === q || 10 === q ? ((1 === a ? ja : x)(Fa(v, 0)), v.length = 0) : v.push(q);\n              }\n              e += k;\n            }\n            G[d >>> 2 >>> 0] = e;\n            return 0;\n          }, ga: vb, m: function(a, b, c, d) {\n            return vb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n          } }, Z = function() {\n            var a = { a: yb };\n            I++;\n            Aa(a, function(b) {\n              Z = b.instance.exports;\n              Z = zb();\n              z = Z.ha;\n              qa();\n              sa.unshift(Z.ia);\n              I--;\n              0 == I && (null !== ua && (clearInterval(ua), ua = null), J && (b = J, J = null, b()));\n            }).catch(ba);\n            return {};\n          }();\n          h._OrtInit = (a, b) => (h._OrtInit = Z.ja)(a, b);\n          h._OrtGetLastError = (a, b) => (h._OrtGetLastError = Z.ka)(a, b);\n          h._OrtCreateSessionOptions = (a, b, c, d, e, g, l, k, n, q) => (h._OrtCreateSessionOptions = Z.la)(a, b, c, d, e, g, l, k, n, q);\n          h._OrtAppendExecutionProvider = (a, b) => (h._OrtAppendExecutionProvider = Z.ma)(a, b);\n          h._OrtAddFreeDimensionOverride = (a, b, c) => (h._OrtAddFreeDimensionOverride = Z.na)(a, b, c);\n          h._OrtAddSessionConfigEntry = (a, b, c) => (h._OrtAddSessionConfigEntry = Z.oa)(a, b, c);\n          h._OrtReleaseSessionOptions = (a) => (h._OrtReleaseSessionOptions = Z.pa)(a);\n          h._OrtCreateSession = (a, b, c) => (h._OrtCreateSession = Z.qa)(a, b, c);\n          h._OrtReleaseSession = (a) => (h._OrtReleaseSession = Z.ra)(a);\n          h._OrtGetInputOutputCount = (a, b, c) => (h._OrtGetInputOutputCount = Z.sa)(a, b, c);\n          h._OrtGetInputName = (a, b) => (h._OrtGetInputName = Z.ta)(a, b);\n          h._OrtGetOutputName = (a, b) => (h._OrtGetOutputName = Z.ua)(a, b);\n          h._OrtFree = (a) => (h._OrtFree = Z.va)(a);\n          h._OrtCreateTensor = (a, b, c, d, e, g) => (h._OrtCreateTensor = Z.wa)(a, b, c, d, e, g);\n          h._OrtGetTensorData = (a, b, c, d, e) => (h._OrtGetTensorData = Z.xa)(a, b, c, d, e);\n          h._OrtReleaseTensor = (a) => (h._OrtReleaseTensor = Z.ya)(a);\n          h._OrtCreateRunOptions = (a, b, c, d) => (h._OrtCreateRunOptions = Z.za)(a, b, c, d);\n          h._OrtAddRunConfigEntry = (a, b, c) => (h._OrtAddRunConfigEntry = Z.Aa)(a, b, c);\n          h._OrtReleaseRunOptions = (a) => (h._OrtReleaseRunOptions = Z.Ba)(a);\n          h._OrtCreateBinding = (a) => (h._OrtCreateBinding = Z.Ca)(a);\n          h._OrtBindInput = (a, b, c) => (h._OrtBindInput = Z.Da)(a, b, c);\n          h._OrtBindOutput = (a, b, c, d) => (h._OrtBindOutput = Z.Ea)(a, b, c, d);\n          h._OrtClearBoundOutputs = (a) => (h._OrtClearBoundOutputs = Z.Fa)(a);\n          h._OrtReleaseBinding = (a) => (h._OrtReleaseBinding = Z.Ga)(a);\n          h._OrtRunWithBinding = (a, b, c, d, e) => (h._OrtRunWithBinding = Z.Ha)(a, b, c, d, e);\n          h._OrtRun = (a, b, c, d, e, g, l, k) => (h._OrtRun = Z.Ia)(a, b, c, d, e, g, l, k);\n          h._OrtEndProfiling = (a) => (h._OrtEndProfiling = Z.Ja)(a);\n          var mb = h._malloc = (a) => (mb = h._malloc = Z.Ka)(a), U = h._free = (a) => (U = h._free = Z.La)(a), Za = (a) => (Za = Z.Ma)(a);\n          h.__embind_initialize_bindings = () => (h.__embind_initialize_bindings = Z.Na)();\n          var Ab = () => (Ab = Z.Pa)(), Bb = (a) => (Bb = Z.Qa)(a), Cb = (a) => (Cb = Z.Ra)(a);\n          function zb() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.Ka = c(a.Ka);\n            a.Ma = c(a.Ma);\n            a.Pa = b(a.Pa);\n            a.Ra = c(a.Ra);\n            return a;\n          }\n          h.stackAlloc = Cb;\n          h.stackSave = Ab;\n          h.stackRestore = Bb;\n          h.UTF8ToString = L;\n          h.stringToUTF8 = (a, b, c) => N(a, B, b, c);\n          h.lengthBytesUTF8 = M;\n          var Db;\n          J = function Eb() {\n            Db || Fb();\n            Db || (J = Eb);\n          };\n          function Fb() {\n            if (!(0 < I)) {\n              for (; 0 < ra.length; )\n                ra.shift()(h);\n              if (!(0 < I || Db || (Db = true, h.calledRun = true, la))) {\n                for (; 0 < sa.length; )\n                  sa.shift()(h);\n                for (aa(h); 0 < ta.length; )\n                  ta.shift()(h);\n              }\n            }\n          }\n          Fb();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : void 0;\n        if (typeof __filename !== "undefined")\n          _scriptDir = _scriptDir || __filename;\n        return function(moduleArg = {}) {\n          function h() {\n            m.buffer != n.buffer && p();\n            return n;\n          }\n          function t() {\n            m.buffer != n.buffer && p();\n            return aa;\n          }\n          function v() {\n            m.buffer != n.buffer && p();\n            return ba;\n          }\n          function ca() {\n            m.buffer != n.buffer && p();\n            return da;\n          }\n          function w() {\n            m.buffer != n.buffer && p();\n            return ea;\n          }\n          function z() {\n            m.buffer != n.buffer && p();\n            return fa;\n          }\n          function ha() {\n            m.buffer != n.buffer && p();\n            return ia;\n          }\n          var A = moduleArg, ja, ka;\n          A.ready = new Promise((a, b) => {\n            ja = a;\n            ka = b;\n          });\n          var la = Object.assign({}, A), ma = "./this.program", na = (a, b) => {\n            throw b;\n          }, oa = "object" == typeof window, B = "function" == typeof importScripts, D = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, E = A.ENVIRONMENT_IS_PTHREAD || false, F = "";\n          function pa(a) {\n            return A.locateFile ? A.locateFile(a, F) : F + a;\n          }\n          var qa, ra, sa;\n          if (D) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), ta = (init_path(), __toCommonJS(path_exports));\n            F = B ? ta.dirname(F) + "/" : __dirname + "/";\n            qa = (b, c) => {\n              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);\n              return fs.readFileSync(b, c ? void 0 : "utf8");\n            };\n            sa = (b) => {\n              b = qa(b, true);\n              b.buffer || (b = new Uint8Array(b));\n              return b;\n            };\n            ra = (b, c, d, e = true) => {\n              b = b.startsWith("file://") ? new URL(b) : ta.normalize(b);\n              fs.readFile(b, e ? void 0 : "utf8", (f, k) => {\n                f ? d(f) : c(e ? k.buffer : k);\n              });\n            };\n            !A.thisProgram && 1 < process.argv.length && (ma = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            na = (b, c) => {\n              process.exitCode = b;\n              throw c;\n            };\n            A.inspect = () => "[Emscripten Module object]";\n            let a;\n            try {\n              a = require_worker_threads();\n            } catch (b) {\n              throw console.error(\'The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?\'), b;\n            }\n            global.Worker = a.Worker;\n          } else if (oa || B)\n            B ? F = self.location.href : "undefined" != typeof document && document.currentScript && (F = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (F = _scriptDir), 0 !== F.indexOf("blob:") ? F = F.substr(0, F.replace(/[?#].*/, "").lastIndexOf("/") + 1) : F = "", D || (qa = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, B && (sa = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), ra = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          D && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var ua = console.log.bind(console), va = console.error.bind(console);\n          D && (ua = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), va = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var wa = ua, G = va;\n          Object.assign(A, la);\n          la = null;\n          var noExitRuntime = true;\n          "object" != typeof WebAssembly && H("no native wasm support detected");\n          var m, xa, ya = false, I, n, aa, ba, da, ea, fa, za, J, Aa, ia;\n          function p() {\n            var a = m.buffer;\n            A.HEAP8 = n = new Int8Array(a);\n            A.HEAP16 = ba = new Int16Array(a);\n            A.HEAPU8 = aa = new Uint8Array(a);\n            A.HEAPU16 = da = new Uint16Array(a);\n            A.HEAP32 = ea = new Int32Array(a);\n            A.HEAPU32 = fa = new Uint32Array(a);\n            A.HEAPF32 = za = new Float32Array(a);\n            A.HEAPF64 = ia = new Float64Array(a);\n            A.HEAP64 = J = new BigInt64Array(a);\n            A.HEAPU64 = Aa = new BigUint64Array(a);\n          }\n          var Ba = 16777216;\n          5242880 <= Ba || H("INITIAL_MEMORY should be larger than STACK_SIZE, was " + Ba + "! (STACK_SIZE=5242880)");\n          if (E)\n            m = A.wasmMemory;\n          else if (m = new WebAssembly.Memory({ initial: Ba / 65536, maximum: 65536, shared: true }), !(m.buffer instanceof SharedArrayBuffer))\n            throw G("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), D && G("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          p();\n          Ba = m.buffer.byteLength;\n          var Ca = [], Da = [], Ea = [], Fa = 0;\n          function Ga() {\n            return noExitRuntime || 0 < Fa;\n          }\n          var K = 0, Ha = null, L = null;\n          function Ia() {\n            K--;\n            if (0 == K && (null !== Ha && (clearInterval(Ha), Ha = null), L)) {\n              var a = L;\n              L = null;\n              a();\n            }\n          }\n          function H(a) {\n            a = "Aborted(" + a + ")";\n            G(a);\n            ya = true;\n            I = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            ka(a);\n            throw a;\n          }\n          function Ja(a) {\n            return a.startsWith("data:application/octet-stream;base64,");\n          }\n          var M;\n          M = "ort-wasm-threaded.wasm";\n          Ja(M) || (M = pa(M));\n          function Ka(a) {\n            if (sa)\n              return sa(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function La(a) {\n            if (oa || B) {\n              if ("function" == typeof fetch && !a.startsWith("file://"))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw "failed to load wasm binary file at \'" + a + "\'";\n                  return b.arrayBuffer();\n                }).catch(() => Ka(a));\n              if (ra)\n                return new Promise((b, c) => {\n                  ra(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => Ka(a));\n          }\n          function Ma(a, b, c) {\n            return La(a).then((d) => WebAssembly.instantiate(d, b)).then((d) => d).then(c, (d) => {\n              G(`failed to asynchronously prepare wasm: ${d}`);\n              H(d);\n            });\n          }\n          function Na(a, b) {\n            var c = M;\n            return "function" != typeof WebAssembly.instantiateStreaming || Ja(c) || c.startsWith("file://") || D || "function" != typeof fetch ? Ma(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {\n              G(`wasm streaming compile failed: ${e}`);\n              G("falling back to ArrayBuffer instantiation");\n              return Ma(c, a, b);\n            }));\n          }\n          function Oa(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          var Pa = (a) => {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }, Qa = (a) => {\n            if (0 == O.qb.length) {\n              var b = pa("ort-wasm-threaded.worker.js");\n              b = new Worker(b);\n              O.qb.push(b);\n              O.Jb(O.qb[0]);\n            }\n            b = O.qb.pop();\n            if (!b)\n              return 6;\n            O.nb.push(b);\n            O.jb[a.mb] = b;\n            b.mb = a.mb;\n            var c = { cmd: "run", start_routine: a.Mb, arg: a.Fb, pthread_ptr: a.mb };\n            D && b.unref();\n            b.postMessage(c, a.Sb);\n            return 0;\n          }, Ra = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Sa = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && Ra)\n              return Ra.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var e = a[b++];\n              if (e & 128) {\n                var f = a[b++] & 63;\n                if (192 == (e & 224))\n                  d += String.fromCharCode((e & 31) << 6 | f);\n                else {\n                  var k = a[b++] & 63;\n                  e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | k : (e & 7) << 18 | f << 12 | k << 6 | a[b++] & 63;\n                  65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));\n                }\n              } else\n                d += String.fromCharCode(e);\n            }\n            return d;\n          }, Ta = (a, b) => (a >>>= 0) ? Sa(t(), a, b) : "";\n          function Ua(a) {\n            if (E)\n              return P(0, 1, a);\n            I = a;\n            Ga() || (O.Nb(), ya = true);\n            na(a, new Oa(a));\n          }\n          var Wa = (a) => {\n            I = a;\n            if (E)\n              throw Va(a), "unwind";\n            Ua(a);\n          };\n          function Xa() {\n            Ca.unshift(() => {\n              K++;\n              Ia();\n            });\n          }\n          var O = { qb: [], nb: [], Eb: [], jb: {}, vb() {\n            E ? (O.receiveObjectTransfer = O.Lb, O.threadInitTLS = O.Db, O.setExitStatus = O.Cb, noExitRuntime = false) : Xa();\n          }, Cb: (a) => {\n            I = a;\n          }, Vb: ["$terminateWorker"], Nb: () => {\n            for (var a of O.nb)\n              Pa(a);\n            for (a of O.qb)\n              Pa(a);\n            O.qb = [];\n            O.nb = [];\n            O.jb = [];\n          }, Bb: (a) => {\n            var b = a.mb;\n            delete O.jb[b];\n            O.qb.push(a);\n            O.nb.splice(O.nb.indexOf(a), 1);\n            a.mb = 0;\n            Ya(b);\n          }, Lb() {\n          }, Db() {\n            O.Eb.forEach((a) => a());\n          }, Jb: (a) => new Promise((b) => {\n            a.onmessage = (f) => {\n              f = f.data;\n              var k = f.cmd;\n              if (f.targetThread && f.targetThread != Za()) {\n                var l = O.jb[f.targetThread];\n                l ? l.postMessage(f, f.transferList) : G(`Internal error! Worker sent a message "${k}" to target pthread ${f.targetThread}, but that thread no longer exists!`);\n              } else if ("checkMailbox" === k)\n                $a();\n              else if ("spawnThread" === k)\n                Qa(f);\n              else if ("cleanupThread" === k)\n                (f = O.jb[f.thread]) || H(), O.Bb(f);\n              else if ("killThread" === k)\n                f = f.thread, k = O.jb[f], delete O.jb[f], Pa(k), Ya(f), O.nb.splice(O.nb.indexOf(k), 1), k.mb = 0;\n              else if ("cancelThread" === k)\n                O.jb[f.thread].postMessage({ cmd: "cancel" });\n              else if ("loaded" === k)\n                a.loaded = true, b(a);\n              else if ("alert" === k)\n                alert(`Thread ${f.threadId}: ${f.text}`);\n              else if ("setimmediate" === f.target)\n                a.postMessage(f);\n              else if ("callHandler" === k)\n                A[f.handler](...f.args);\n              else\n                k && G(`worker sent an unknown command ${k}`);\n            };\n            a.onerror = (f) => {\n              G(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);\n              throw f;\n            };\n            D && (a.on("message", (f) => a.onmessage({ data: f })), a.on("error", (f) => a.onerror(f)));\n            var c = [], d = [], e;\n            for (e of d)\n              A.hasOwnProperty(e) && c.push(e);\n            a.postMessage({\n              cmd: "load",\n              handlers: c,\n              urlOrBlob: A.mainScriptUrlOrBlob || _scriptDir,\n              wasmMemory: m,\n              wasmModule: xa\n            });\n          }) };\n          A.PThread = O;\n          var ab = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(A);\n          };\n          A.establishStackSpace = () => {\n            var a = Za(), b = z()[a + 52 >>> 2 >>> 0];\n            a = z()[a + 56 >>> 2 >>> 0];\n            bb(b, b - a);\n            cb(b);\n          };\n          function Va(a) {\n            if (E)\n              return P(1, 0, a);\n            Wa(a);\n          }\n          var db = [], eb;\n          A.invokeEntryPoint = (a, b) => {\n            var c = db[a];\n            c || (a >= db.length && (db.length = a + 1), db[a] = c = eb.get(a));\n            a = c(b);\n            Ga() ? O.Cb(a) : fb(a);\n          };\n          function gb(a) {\n            this.sb = a - 24;\n            this.Kb = function(b) {\n              z()[this.sb + 4 >>> 2 >>> 0] = b;\n            };\n            this.xb = function(b) {\n              z()[this.sb + 8 >>> 2 >>> 0] = b;\n            };\n            this.vb = function(b, c) {\n              this.wb();\n              this.Kb(b);\n              this.xb(c);\n            };\n            this.wb = function() {\n              z()[this.sb + 16 >>> 2 >>> 0] = 0;\n            };\n          }\n          var hb = 0, ib = 0;\n          function jb(a, b, c, d) {\n            return E ? P(2, 1, a, b, c, d) : kb(a, b, c, d);\n          }\n          function kb(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return G("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var e = [];\n            if (E && 0 === e.length)\n              return jb(a, b, c, d);\n            a = { Mb: c, mb: a, Fb: d, Sb: e };\n            return E ? (a.Ub = "spawnThread", postMessage(a, e), 0) : Qa(a);\n          }\n          function lb(a, b, c) {\n            return E ? P(3, 1, a, b, c) : 0;\n          }\n          function mb(a, b) {\n            if (E)\n              return P(4, 1, a, b);\n          }\n          var nb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, ob = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var e = c;\n            d = c + d - 1;\n            for (var f = 0; f < a.length; ++f) {\n              var k = a.charCodeAt(f);\n              if (55296 <= k && 57343 >= k) {\n                var l = a.charCodeAt(++f);\n                k = 65536 + ((k & 1023) << 10) | l & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - e;\n          }, pb = (a, b, c) => ob(a, t(), b, c);\n          function qb(a, b) {\n            if (E)\n              return P(5, 1, a, b);\n          }\n          function rb(a, b, c) {\n            if (E)\n              return P(6, 1, a, b, c);\n          }\n          function sb(a, b, c) {\n            return E ? P(7, 1, a, b, c) : 0;\n          }\n          function tb(a, b) {\n            if (E)\n              return P(8, 1, a, b);\n          }\n          function ub(a, b, c) {\n            if (E)\n              return P(9, 1, a, b, c);\n          }\n          function vb(a, b, c, d) {\n            if (E)\n              return P(10, 1, a, b, c, d);\n          }\n          function wb(a, b, c, d) {\n            if (E)\n              return P(11, 1, a, b, c, d);\n          }\n          function xb(a, b, c, d) {\n            if (E)\n              return P(12, 1, a, b, c, d);\n          }\n          function yb(a) {\n            if (E)\n              return P(13, 1, a);\n          }\n          function zb(a, b) {\n            if (E)\n              return P(14, 1, a, b);\n          }\n          function Ab(a, b, c) {\n            if (E)\n              return P(15, 1, a, b, c);\n          }\n          var Bb = (a) => {\n            if (null === a)\n              return "null";\n            var b = typeof a;\n            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;\n          }, Cb, R = (a) => {\n            for (var b = ""; t()[a >>> 0]; )\n              b += Cb[t()[a++ >>> 0]];\n            return b;\n          }, Db = {}, Eb = {}, Fb = {}, S;\n          function Gb(a, b, c = {}) {\n            var d = b.name;\n            if (!a)\n              throw new S(`type "${d}" must have a positive integer typeid pointer`);\n            if (Eb.hasOwnProperty(a)) {\n              if (c.Hb)\n                return;\n              throw new S(`Cannot register type \'${d}\' twice`);\n            }\n            Eb[a] = b;\n            delete Fb[a];\n            Db.hasOwnProperty(a) && (b = Db[a], delete Db[a], b.forEach((e) => e()));\n          }\n          function T(a, b, c = {}) {\n            if (!("argPackAdvance" in b))\n              throw new TypeError("registerType registeredInstance requires argPackAdvance");\n            Gb(a, b, c);\n          }\n          var Hb = (a, b, c) => {\n            switch (b) {\n              case 1:\n                return c ? (d) => h()[d >>> 0 >>> 0] : (d) => t()[d >>> 0 >>> 0];\n              case 2:\n                return c ? (d) => v()[d >>> 1 >>> 0] : (d) => ca()[d >>> 1 >>> 0];\n              case 4:\n                return c ? (d) => w()[d >>> 2 >>> 0] : (d) => z()[d >>> 2 >>> 0];\n              case 8:\n                return c ? (d) => J[d >>> 3] : (d) => Aa[d >>> 3];\n              default:\n                throw new TypeError(`invalid integer width (${b}): ${a}`);\n            }\n          };\n          function Ib() {\n            this.lb = [void 0];\n            this.zb = [];\n          }\n          var U = new Ib();\n          function Jb(a) {\n            a >>>= 0;\n            a >= U.sb && 0 === --U.get(a).Ab && U.xb(a);\n          }\n          var V = (a) => {\n            if (!a)\n              throw new S("Cannot use deleted val. handle = " + a);\n            return U.get(a).value;\n          }, W = (a) => {\n            switch (a) {\n              case void 0:\n                return 1;\n              case null:\n                return 2;\n              case true:\n                return 3;\n              case false:\n                return 4;\n              default:\n                return U.wb({ Ab: 1, value: a });\n            }\n          };\n          function Kb(a) {\n            return this.fromWireType(w()[a >>> 2 >>> 0]);\n          }\n          var Lb = (a, b) => {\n            switch (b) {\n              case 4:\n                return function(c) {\n                  var d = this.fromWireType;\n                  m.buffer != n.buffer && p();\n                  return d.call(this, za[c >>> 2 >>> 0]);\n                };\n              case 8:\n                return function(c) {\n                  return this.fromWireType(ha()[c >>> 3 >>> 0]);\n                };\n              default:\n                throw new TypeError(`invalid float width (${b}): ${a}`);\n            }\n          };\n          function Mb(a) {\n            return this.fromWireType(z()[a >>> 2 >>> 0]);\n          }\n          var Nb = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ob = (a, b) => {\n            var c = a >> 1;\n            for (var d = c + b / 2; !(c >= d) && ca()[c >>> 0]; )\n              ++c;\n            c <<= 1;\n            if (32 < c - a && Nb)\n              return Nb.decode(t().slice(a, c));\n            c = "";\n            for (d = 0; !(d >= b / 2); ++d) {\n              var e = v()[a + 2 * d >>> 1 >>> 0];\n              if (0 == e)\n                break;\n              c += String.fromCharCode(e);\n            }\n            return c;\n          }, Pb = (a, b, c) => {\n            void 0 === c && (c = 2147483647);\n            if (2 > c)\n              return 0;\n            c -= 2;\n            var d = b;\n            c = c < 2 * a.length ? c / 2 : a.length;\n            for (var e = 0; e < c; ++e) {\n              var f = a.charCodeAt(e);\n              v()[b >>> 1 >>> 0] = f;\n              b += 2;\n            }\n            v()[b >>> 1 >>> 0] = 0;\n            return b - d;\n          }, Qb = (a) => 2 * a.length, Rb = (a, b) => {\n            for (var c = 0, d = ""; !(c >= b / 4); ) {\n              var e = w()[a + 4 * c >>> 2 >>> 0];\n              if (0 == e)\n                break;\n              ++c;\n              65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);\n            }\n            return d;\n          }, Sb = (a, b, c) => {\n            b >>>= 0;\n            void 0 === c && (c = 2147483647);\n            if (4 > c)\n              return 0;\n            var d = b;\n            c = d + c - 4;\n            for (var e = 0; e < a.length; ++e) {\n              var f = a.charCodeAt(e);\n              if (55296 <= f && 57343 >= f) {\n                var k = a.charCodeAt(++e);\n                f = 65536 + ((f & 1023) << 10) | k & 1023;\n              }\n              w()[b >>> 2 >>> 0] = f;\n              b += 4;\n              if (b + 4 > c)\n                break;\n            }\n            w()[b >>> 2 >>> 0] = 0;\n            return b - d;\n          }, Tb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              55296 <= d && 57343 >= d && ++c;\n              b += 4;\n            }\n            return b;\n          }, Ub = (a) => {\n            if (!ya)\n              try {\n                if (a(), !Ga())\n                  try {\n                    E ? fb(I) : Wa(I);\n                  } catch (b) {\n                    b instanceof Oa || "unwind" == b || na(1, b);\n                  }\n              } catch (b) {\n                b instanceof Oa || "unwind" == b || na(1, b);\n              }\n          };\n          function Vb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.Tb && (Atomics.Tb(w(), a >>> 2, a).value.then($a), a += 128, Atomics.store(w(), a >>> 2, 1));\n          }\n          A.__emscripten_thread_mailbox_await = Vb;\n          var $a = () => {\n            var a = Za();\n            a && (Vb(a), Ub(() => Wb()));\n          };\n          A.checkMailbox = $a;\n          var Yb = (a) => {\n            var b = Xb();\n            a = a();\n            cb(b);\n            return a;\n          };\n          function P(a, b) {\n            var c = arguments.length - 2, d = arguments;\n            return Yb(() => {\n              for (var e = 2 * c, f = Zb(8 * e), k = f >>> 3, l = 0; l < c; l++) {\n                var q = d[2 + l];\n                "bigint" == typeof q ? (J[k + 2 * l] = 1n, J[k + 2 * l + 1] = q) : (J[k + 2 * l] = 0n, ha()[k + 2 * l + 1 >>> 0] = q);\n              }\n              return $b(a, e, f, b);\n            });\n          }\n          var ac = [], cc = (a, b) => {\n            var c = Eb[a];\n            if (void 0 === c)\n              throw a = bc(a), c = R(a), X(a), new S(b + " has unknown type " + c);\n            return c;\n          }, dc = {}, ec = (a) => {\n            var b = dc[a];\n            return void 0 === b ? R(a) : b;\n          }, fc = [], gc = () => "object" == typeof globalThis ? globalThis : Function("return this")(), hc = (a) => {\n            var b = fc.length;\n            fc.push(a);\n            return b;\n          }, ic = (a, b) => {\n            for (var c = Array(a), d = 0; d < a; ++d)\n              c[d] = cc(z()[b + 4 * d >>> 2 >>> 0], "parameter " + d);\n            return c;\n          }, jc = (a) => {\n            if (void 0 === a)\n              return "_unknown";\n            a = a.replace(/[^a-zA-Z0-9_]/g, "$");\n            var b = a.charCodeAt(0);\n            return 48 <= b && 57 >= b ? `_${a}` : a;\n          }, lc = {};\n          function mc(a, b) {\n            a = jc(a);\n            return { [a]: function() {\n              return b.apply(this, arguments);\n            } }[a];\n          }\n          function nc(a) {\n            var b = Function;\n            if (!(b instanceof Function))\n              throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);\n            var c = mc(b.name || "unknownFunctionName", function() {\n            });\n            c.prototype = b.prototype;\n            c = new c();\n            a = b.apply(c, a);\n            return a instanceof Object ? a : c;\n          }\n          var oc = (a) => {\n            for (var b = "", c = 0; c < a; ++c)\n              b += (0 !== c ? ", " : "") + "arg" + c;\n            var d = "return function emval_allocator_" + a + "(constructor, argTypes, args) {\\n  var HEAPU32 = getMemory();\\n";\n            for (c = 0; c < a; ++c)\n              d += "var argType" + c + " = requireRegisteredType(HEAPU32[((argTypes)>>>2)], \'parameter " + c + "\');\\nvar arg" + c + " = argType" + c + ".readValueFromPointer(args);\\nargs += argType" + c + "[\'argPackAdvance\'];\\nargTypes += 4;\\n";\n            return new Function("requireRegisteredType", "Module", "valueToHandle", "getMemory", d + ("var obj = new constructor(" + b + ");\\nreturn valueToHandle(obj);\\n}\\n"))(cc, A, W, () => z());\n          }, pc = {}, Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), qc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], rc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function sc(a, b, c, d, e, f, k) {\n            return E ? P(16, 1, a, b, c, d, e, f, k) : -52;\n          }\n          function tc(a, b, c, d, e, f) {\n            if (E)\n              return P(17, 1, a, b, c, d, e, f);\n          }\n          var vc = (a) => {\n            var b = nb(a) + 1, c = uc(b);\n            c && pb(a, c, b);\n            return c;\n          }, wc = {}, yc = () => {\n            if (!xc) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ma || "./this.program" }, b;\n              for (b in wc)\n                void 0 === wc[b] ? delete a[b] : a[b] = wc[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              xc = c;\n            }\n            return xc;\n          }, xc;\n          function zc(a, b) {\n            if (E)\n              return P(18, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            yc().forEach((d, e) => {\n              var f = b + c;\n              e = z()[a + 4 * e >>> 2 >>> 0] = f;\n              for (f = 0; f < d.length; ++f)\n                h()[e++ >>> 0 >>> 0] = d.charCodeAt(f);\n              h()[e >>> 0 >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Ac(a, b) {\n            if (E)\n              return P(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = yc();\n            z()[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((e) => d += e.length + 1);\n            z()[b >>> 2 >>> 0] = d;\n            return 0;\n          }\n          function Bc(a) {\n            return E ? P(20, 1, a) : 52;\n          }\n          function Cc(a, b, c, d) {\n            return E ? P(21, 1, a, b, c, d) : 52;\n          }\n          function Dc(a, b, c, d) {\n            return E ? P(22, 1, a, b, c, d) : 70;\n          }\n          var Ec = [null, [], []];\n          function Fc(a, b, c, d) {\n            if (E)\n              return P(23, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var e = 0, f = 0; f < c; f++) {\n              var k = z()[b >>> 2 >>> 0], l = z()[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var q = 0; q < l; q++) {\n                var r = t()[k + q >>> 0], x = Ec[a];\n                0 === r || 10 === r ? ((1 === a ? wa : G)(Sa(x, 0)), x.length = 0) : x.push(r);\n              }\n              e += l;\n            }\n            z()[d >>> 2 >>> 0] = e;\n            return 0;\n          }\n          var Gc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Hc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Ic(a) {\n            var b = Array(nb(a) + 1);\n            ob(a, b, 0, b.length);\n            return b;\n          }\n          var Jc = (a, b) => {\n            h().set(a, b >>> 0);\n          };\n          function Kc(a, b, c, d) {\n            function e(g, u, y) {\n              for (g = "number" == typeof g ? g.toString() : g || ""; g.length < u; )\n                g = y[0] + g;\n              return g;\n            }\n            function f(g, u) {\n              return e(g, u, "0");\n            }\n            function k(g, u) {\n              function y(kc) {\n                return 0 > kc ? -1 : 0 < kc ? 1 : 0;\n              }\n              var Q;\n              0 === (Q = y(g.getFullYear() - u.getFullYear())) && 0 === (Q = y(g.getMonth() - u.getMonth())) && (Q = y(g.getDate() - u.getDate()));\n              return Q;\n            }\n            function l(g) {\n              switch (g.getDay()) {\n                case 0:\n                  return new Date(g.getFullYear() - 1, 11, 29);\n                case 1:\n                  return g;\n                case 2:\n                  return new Date(g.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    g.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(g.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(g.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(g.getFullYear() - 1, 11, 30);\n              }\n            }\n            function q(g) {\n              var u = g.ob;\n              for (g = new Date(new Date(g.pb + 1900, 0, 1).getTime()); 0 < u; ) {\n                var y = g.getMonth(), Q = (Y(g.getFullYear()) ? Gc : Hc)[y];\n                if (u > Q - g.getDate())\n                  u -= Q - g.getDate() + 1, g.setDate(1), 11 > y ? g.setMonth(y + 1) : (g.setMonth(0), g.setFullYear(g.getFullYear() + 1));\n                else {\n                  g.setDate(g.getDate() + u);\n                  break;\n                }\n              }\n              y = new Date(g.getFullYear() + 1, 0, 4);\n              u = l(new Date(\n                g.getFullYear(),\n                0,\n                4\n              ));\n              y = l(y);\n              return 0 >= k(u, g) ? 0 >= k(y, g) ? g.getFullYear() + 1 : g.getFullYear() : g.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var r = z()[d + 40 >>> 2 >>> 0];\n            d = { Qb: w()[d >>> 2 >>> 0], Pb: w()[d + 4 >>> 2 >>> 0], tb: w()[d + 8 >>> 2 >>> 0], yb: w()[d + 12 >>> 2 >>> 0], ub: w()[d + 16 >>> 2 >>> 0], pb: w()[d + 20 >>> 2 >>> 0], kb: w()[d + 24 >>> 2 >>> 0], ob: w()[d + 28 >>> 2 >>> 0], Wb: w()[d + 32 >>> 2 >>> 0], Ob: w()[d + 36 >>> 2 >>> 0], Rb: r ? Ta(r) : "" };\n            c = Ta(c);\n            r = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var x in r)\n              c = c.replace(new RegExp(x, "g"), r[x]);\n            var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), N = "January February March April May June July August September October November December".split(" ");\n            r = { "%a": (g) => C[g.kb].substring(0, 3), "%A": (g) => C[g.kb], "%b": (g) => N[g.ub].substring(0, 3), "%B": (g) => N[g.ub], "%C": (g) => f((g.pb + 1900) / 100 | 0, 2), "%d": (g) => f(g.yb, 2), "%e": (g) => e(g.yb, 2, " "), "%g": (g) => q(g).toString().substring(2), "%G": (g) => q(g), "%H": (g) => f(g.tb, 2), "%I": (g) => {\n              g = g.tb;\n              0 == g ? g = 12 : 12 < g && (g -= 12);\n              return f(g, 2);\n            }, "%j": (g) => {\n              for (var u = 0, y = 0; y <= g.ub - 1; u += (Y(g.pb + 1900) ? Gc : Hc)[y++])\n                ;\n              return f(g.yb + u, 3);\n            }, "%m": (g) => f(g.ub + 1, 2), "%M": (g) => f(g.Pb, 2), "%n": () => "\\n", "%p": (g) => 0 <= g.tb && 12 > g.tb ? "AM" : "PM", "%S": (g) => f(g.Qb, 2), "%t": () => "	", "%u": (g) => g.kb || 7, "%U": (g) => f(Math.floor((g.ob + 7 - g.kb) / 7), 2), "%V": (g) => {\n              var u = Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7);\n              2 >= (g.kb + 371 - g.ob - 2) % 7 && u++;\n              if (u)\n                53 == u && (y = (g.kb + 371 - g.ob) % 7, 4 == y || 3 == y && Y(g.pb) || (u = 1));\n              else {\n                u = 52;\n                var y = (g.kb + 7 - g.ob - 1) % 7;\n                (4 == y || 5 == y && Y(g.pb % 400 - 1)) && u++;\n              }\n              return f(u, 2);\n            }, "%w": (g) => g.kb, "%W": (g) => f(Math.floor((g.ob + 7 - (g.kb + 6) % 7) / 7), 2), "%y": (g) => (g.pb + 1900).toString().substring(2), "%Y": (g) => g.pb + 1900, "%z": (g) => {\n              g = g.Ob;\n              var u = 0 <= g;\n              g = Math.abs(g) / 60;\n              return (u ? "+" : "-") + String("0000" + (g / 60 * 100 + g % 60)).slice(-4);\n            }, "%Z": (g) => g.Rb, "%%": () => "%" };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (x in r)\n              c.includes(x) && (c = c.replace(new RegExp(x, "g"), r[x](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            x = Ic(c);\n            if (x.length > b)\n              return 0;\n            Jc(x, a);\n            return x.length - 1;\n          }\n          O.vb();\n          for (var Lc = Array(256), Mc = 0; 256 > Mc; ++Mc)\n            Lc[Mc] = String.fromCharCode(Mc);\n          Cb = Lc;\n          S = A.BindingError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "BindingError";\n            }\n          };\n          A.InternalError = class extends Error {\n            constructor(a) {\n              super(a);\n              this.name = "InternalError";\n            }\n          };\n          Object.assign(Ib.prototype, { get(a) {\n            return this.lb[a];\n          }, has(a) {\n            return void 0 !== this.lb[a];\n          }, wb(a) {\n            var b = this.zb.pop() || this.lb.length;\n            this.lb[b] = a;\n            return b;\n          }, xb(a) {\n            this.lb[a] = void 0;\n            this.zb.push(a);\n          } });\n          U.lb.push({ value: void 0 }, { value: null }, { value: true }, { value: false });\n          U.sb = U.lb.length;\n          A.count_emval_handles = () => {\n            for (var a = 0, b = U.sb; b < U.lb.length; ++b)\n              void 0 !== U.lb[b] && ++a;\n            return a;\n          };\n          var Nc = [Ua, Va, jb, lb, mb, qb, rb, sb, tb, ub, vb, wb, xb, yb, zb, Ab, sc, tc, zc, Ac, Bc, Cc, Dc, Fc], Pc = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new gb(a).vb(b >>> 0, c >>> 0);\n              hb = a;\n              ib++;\n              throw hb;\n            },\n            ea: function(a) {\n              Oc(a >>> 0, !B, 1, !oa, 131072, false);\n              O.Db();\n            },\n            D: function(a) {\n              a >>>= 0;\n              E ? postMessage({ cmd: "cleanupThread", thread: a }) : ((a = O.jb[a]) || H(), O.Bb(a));\n            },\n            W: kb,\n            y: lb,\n            ka: mb,\n            S: qb,\n            U: rb,\n            L: sb,\n            ia: tb,\n            ba: ub,\n            ha: vb,\n            F: wb,\n            T: xb,\n            Q: yb,\n            ja: zb,\n            R: Ab,\n            I: function(a, b, c, d, e) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              b = R(b);\n              var f = -1 != b.indexOf("u");\n              f && (e = (1n << 64n) - 1n);\n              T(a, { name: b, fromWireType: (k) => k, toWireType: function(k, l) {\n                if ("bigint" != typeof l && "number" != typeof l)\n                  throw new TypeError(`Cannot convert "${Bb(l)}" to ${this.name}`);\n                if (l < d || l > e)\n                  throw new TypeError(`Passing a number "${Bb(l)}" from JS side to C/C++ side to an argument of type "${b}", which is outside the valid range [${d}, ${e}]!`);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Hb(b, c, !f), rb: null });\n            },\n            qa: function(a, b, c, d) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, {\n                name: b,\n                fromWireType: function(e) {\n                  return !!e;\n                },\n                toWireType: function(e, f) {\n                  return f ? c : d;\n                },\n                argPackAdvance: 8,\n                readValueFromPointer: function(e) {\n                  return this.fromWireType(t()[e >>> 0]);\n                },\n                rb: null\n              });\n            },\n            pa: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (c) => {\n                var d = V(c);\n                Jb(c);\n                return d;\n              }, toWireType: (c, d) => W(d), argPackAdvance: 8, readValueFromPointer: Kb, rb: null });\n            },\n            H: function(a, b, c) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              T(a, { name: b, fromWireType: (d) => d, toWireType: (d, e) => e, argPackAdvance: 8, readValueFromPointer: Lb(b, c), rb: null });\n            },\n            t: function(a, b, c, d, e) {\n              a >>>= 0;\n              c >>>= 0;\n              b = R(b >>> 0);\n              -1 === e && (e = 4294967295);\n              e = (l) => l;\n              if (0 === d) {\n                var f = 32 - 8 * c;\n                e = (l) => l << f >>> f;\n              }\n              var k = b.includes("unsigned") ? function(l, q) {\n                return q >>> 0;\n              } : function(l, q) {\n                return q;\n              };\n              T(a, { name: b, fromWireType: e, toWireType: k, argPackAdvance: 8, readValueFromPointer: Hb(b, c, 0 !== d), rb: null });\n            },\n            m: function(a, b, c) {\n              function d(f) {\n                var k = z()[f >>> 2 >>> 0];\n                f = z()[f + 4 >>> 2 >>> 0];\n                return new e(h().buffer, f, k);\n              }\n              a >>>= 0;\n              var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];\n              c = R(c >>> 0);\n              T(\n                a,\n                { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d },\n                { Hb: true }\n              );\n            },\n            J: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              var c = "std::string" === b;\n              T(a, { name: b, fromWireType: function(d) {\n                var e = z()[d >>> 2 >>> 0], f = d + 4;\n                if (c)\n                  for (var k = f, l = 0; l <= e; ++l) {\n                    var q = f + l;\n                    if (l == e || 0 == t()[q >>> 0]) {\n                      k = Ta(k, q - k);\n                      if (void 0 === r)\n                        var r = k;\n                      else\n                        r += String.fromCharCode(0), r += k;\n                      k = q + 1;\n                    }\n                  }\n                else {\n                  r = Array(e);\n                  for (l = 0; l < e; ++l)\n                    r[l] = String.fromCharCode(t()[f + l >>> 0]);\n                  r = r.join("");\n                }\n                X(d);\n                return r;\n              }, toWireType: function(d, e) {\n                e instanceof ArrayBuffer && (e = new Uint8Array(e));\n                var f = "string" == typeof e;\n                if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array))\n                  throw new S("Cannot pass non-string to std::string");\n                var k = c && f ? nb(e) : e.length;\n                var l = uc(4 + k + 1), q = l + 4;\n                z()[l >>> 2 >>> 0] = k;\n                if (c && f)\n                  pb(e, q, k + 1);\n                else if (f)\n                  for (f = 0; f < k; ++f) {\n                    var r = e.charCodeAt(f);\n                    if (255 < r)\n                      throw X(q), new S("String has UTF-16 code units that do not fit in 8 bits");\n                    t()[q + f >>> 0] = r;\n                  }\n                else\n                  for (f = 0; f < k; ++f)\n                    t()[q + f >>> 0] = e[f];\n                null !== d && d.push(X, l);\n                return l;\n              }, argPackAdvance: 8, readValueFromPointer: Mb, rb(d) {\n                X(d);\n              } });\n            },\n            A: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              c = R(c);\n              if (2 === b) {\n                var d = Ob;\n                var e = Pb;\n                var f = Qb;\n                var k = () => ca();\n                var l = 1;\n              } else\n                4 === b && (d = Rb, e = Sb, f = Tb, k = () => z(), l = 2);\n              T(a, {\n                name: c,\n                fromWireType: (q) => {\n                  for (var r = z()[q >>> 2 >>> 0], x = k(), C, N = q + 4, g = 0; g <= r; ++g) {\n                    var u = q + 4 + g * b;\n                    if (g == r || 0 == x[u >>> l])\n                      N = d(N, u - N), void 0 === C ? C = N : (C += String.fromCharCode(0), C += N), N = u + b;\n                  }\n                  X(q);\n                  return C;\n                },\n                toWireType: (q, r) => {\n                  if ("string" != typeof r)\n                    throw new S(`Cannot pass non-string to C++ string type ${c}`);\n                  var x = f(r), C = uc(4 + x + b);\n                  z()[C >>> 2] = x >> l;\n                  e(r, C + 4, x + b);\n                  null !== q && q.push(X, C);\n                  return C;\n                },\n                argPackAdvance: 8,\n                readValueFromPointer: Kb,\n                rb(q) {\n                  X(q);\n                }\n              });\n            },\n            ra: function(a, b) {\n              a >>>= 0;\n              b = R(b >>> 0);\n              T(a, { Ib: true, name: b, argPackAdvance: 0, fromWireType: () => {\n              }, toWireType: () => {\n              } });\n            },\n            na: () => true,\n            O: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(() => $a()) : E ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = O.jb[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            X: function(a, b, c, d) {\n              b >>>= 0;\n              c /= 2;\n              ac.length = c;\n              d = d >>> 0 >>> 3;\n              for (var e = 0; e < c; e++)\n                ac[e] = J[d + 2 * e] ? J[d + 2 * e + 1] : ha()[d + 2 * e + 1 >>> 0];\n              a = Nc[a];\n              O.Gb = b;\n              b = a.apply(null, ac);\n              O.Gb = 0;\n              return b;\n            },\n            da: Vb,\n            ma: function(a) {\n              D && O.jb[a >>> 0].ref();\n            },\n            r: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = cc(b, "emval::as");\n              var d = [], e = W(d);\n              z()[c >>> 2 >>> 0] = e;\n              return b.toWireType(d, a);\n            },\n            i: function(a, b, c, d, e) {\n              c >>>= 0;\n              d >>>= 0;\n              e >>>= 0;\n              a = fc[a >>> 0];\n              b = V(b >>> 0);\n              c = ec(c);\n              var f = [];\n              z()[d >>> 2 >>> 0] = W(f);\n              return a(b, c, f, e);\n            },\n            u: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = fc[a >>> 0];\n              b = V(b >>> 0);\n              c = ec(c);\n              a(b, c, null, d);\n            },\n            c: Jb,\n            K: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return a == b;\n            },\n            o: function(a) {\n              a >>>= 0;\n              if (0 === a)\n                return W(gc());\n              a = ec(a);\n              return W(gc()[a]);\n            },\n            h: function(a, b) {\n              var c = ic(a, b >>> 0), d = c[0];\n              b = d.name + "_$" + c.slice(1).map(function(x) {\n                return x.name;\n              }).join("_") + "$";\n              var e = lc[b];\n              if (void 0 !== e)\n                return e;\n              e = ["retType"];\n              for (var f = [d], k = "", l = 0; l < a - 1; ++l)\n                k += (0 !== l ? ", " : "") + "arg" + l, e.push("argType" + l), f.push(c[1 + l]);\n              var q = "return function " + jc("methodCaller_" + b) + "(handle, name, destructors, args) {\\n", r = 0;\n              for (l = 0; l < a - 1; ++l)\n                q += "    var arg" + l + " = argType" + l + ".readValueFromPointer(args" + (r ? "+" + r : "") + ");\\n", r += c[l + 1].argPackAdvance;\n              q += "    var rv = handle[name](" + k + ");\\n";\n              for (l = 0; l < a - 1; ++l)\n                c[l + 1].deleteObject && (q += "    argType" + l + ".deleteObject(arg" + l + ");\\n");\n              d.Ib || (q += "    return retType.toWireType(destructors, rv);\\n");\n              e.push(q + "};\\n");\n              a = nc(e).apply(null, f);\n              e = hc(a);\n              return lc[b] = e;\n            },\n            q: function(a, b) {\n              b >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              return W(a[b]);\n            },\n            d: function(a) {\n              a >>>= 0;\n              4 < a && (U.get(a).Ab += 1);\n            },\n            x: function(a, b, c, d) {\n              c >>>= 0;\n              d >>>= 0;\n              a = V(a >>> 0);\n              var e = pc[b];\n              e || (e = oc(b), pc[b] = e);\n              return e(a, c, d);\n            },\n            v: function() {\n              return W([]);\n            },\n            l: function(a) {\n              a = V(a >>> 0);\n              for (var b = Array(a.length), c = 0; c < a.length; c++)\n                b[c] = a[c];\n              return W(b);\n            },\n            e: function(a) {\n              return W(ec(a >>> 0));\n            },\n            k: function() {\n              return W({});\n            },\n            g: function(a) {\n              a >>>= 0;\n              for (var b = V(a); b.length; ) {\n                var c = b.pop();\n                b.pop()(c);\n              }\n              Jb(a);\n            },\n            j: function(a, b, c) {\n              b >>>= 0;\n              c >>>= 0;\n              a = V(a >>> 0);\n              b = V(b);\n              c = V(c);\n              a[b] = c;\n            },\n            f: function(a, b) {\n              b >>>= 0;\n              a = cc(a >>> 0, "_emval_take_value");\n              a = a.readValueFromPointer(b);\n              return W(a);\n            },\n            _: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              w()[b >>> 2 >>> 0] = a.getUTCSeconds();\n              w()[b + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              w()[b + 8 >>> 2 >>> 0] = a.getUTCHours();\n              w()[b + 12 >>> 2 >>> 0] = a.getUTCDate();\n              w()[b + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              w()[b + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              w()[b + 24 >>> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              w()[b + 28 >>> 2 >>> 0] = a;\n            },\n            $: function(a, b) {\n              a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);\n              b >>>= 0;\n              a = new Date(1e3 * a);\n              w()[b >>> 2 >>> 0] = a.getSeconds();\n              w()[b + 4 >>> 2 >>> 0] = a.getMinutes();\n              w()[b + 8 >>> 2 >>> 0] = a.getHours();\n              w()[b + 12 >>> 2 >>> 0] = a.getDate();\n              w()[b + 16 >>> 2 >>> 0] = a.getMonth();\n              w()[b + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              w()[b + 24 >>> 2 >>> 0] = a.getDay();\n              var c = (Y(a.getFullYear()) ? qc : rc)[a.getMonth()] + a.getDate() - 1 | 0;\n              w()[b + 28 >>> 2 >>> 0] = c;\n              w()[b + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;\n              w()[b + 32 >>> 2 >>> 0] = a;\n            },\n            aa: function(a) {\n              a >>>= 0;\n              var b = new Date(w()[a + 20 >>> 2 >>> 0] + 1900, w()[a + 16 >>> 2 >>> 0], w()[a + 12 >>> 2 >>> 0], w()[a + 8 >>> 2 >>> 0], w()[a + 4 >>> 2 >>> 0], w()[a >>> 2 >>> 0], 0), c = w()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), k = Math.min(f, e);\n              0 > c ? w()[a + 32 >>> 2 >>> 0] = Number(e != f && k == d) : 0 < c != (k == d) && (e = Math.max(f, e), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : e) - d)));\n              w()[a + 24 >>> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? qc : rc)[b.getMonth()] + b.getDate() - 1 | 0;\n              w()[a + 28 >>> 2 >>> 0] = c;\n              w()[a >>> 2 >>> 0] = b.getSeconds();\n              w()[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              w()[a + 8 >>> 2 >>> 0] = b.getHours();\n              w()[a + 12 >>> 2 >>> 0] = b.getDate();\n              w()[a + 16 >>> 2 >>> 0] = b.getMonth();\n              w()[a + 20 >>> 2 >>> 0] = b.getYear();\n              return BigInt(b.getTime() / 1e3);\n            },\n            Y: sc,\n            Z: tc,\n            N: function(a, b, c) {\n              function d(r) {\n                return (r = r.toTimeString().match(/\\(([A-Za-z ]+)\\)$/)) ? r[1] : "GMT";\n              }\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              var e = (/* @__PURE__ */ new Date()).getFullYear(), f = new Date(e, 0, 1), k = new Date(e, 6, 1);\n              e = f.getTimezoneOffset();\n              var l = k.getTimezoneOffset(), q = Math.max(e, l);\n              z()[a >>> 2 >>> 0] = 60 * q;\n              w()[b >>> 2 >>> 0] = Number(e != l);\n              a = d(f);\n              b = d(k);\n              a = vc(a);\n              b = vc(b);\n              l < e ? (z()[c >>> 2 >>> 0] = a, z()[c + 4 >>> 2 >>> 0] = b) : (z()[c >>> 2 >>> 0] = b, z()[c + 4 >>> 2 >>> 0] = a);\n            },\n            n: () => {\n              H("");\n            },\n            E: () => {\n            },\n            G: () => Date.now(),\n            la: () => {\n              Fa += 1;\n              throw "unwind";\n            },\n            P: function() {\n              return 4294901760;\n            },\n            s: () => performance.timeOrigin + performance.now(),\n            w: () => D ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,\n            M: function(a) {\n              a >>>= 0;\n              var b = t().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var e = Math;\n                d = Math.max(a, d);\n                a: {\n                  e = (e.min.call(e, 4294901760, d + (65536 - d % 65536) % 65536) - m.buffer.byteLength + 65535) / 65536;\n                  try {\n                    m.grow(e);\n                    p();\n                    var f = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  f = void 0;\n                }\n                if (f)\n                  return true;\n              }\n              return false;\n            },\n            fa: zc,\n            ga: Ac,\n            V: Wa,\n            z: Bc,\n            C: Cc,\n            ca: Dc,\n            B: Fc,\n            a: m || A.wasmMemory,\n            oa: Kc,\n            p: function(a, b, c, d) {\n              return Kc(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            var a = { a: Pc };\n            K++;\n            Na(a, function(b) {\n              var c = b.module;\n              Z = b.instance.exports;\n              Z = Qc();\n              O.Eb.push(Z.Xa);\n              eb = Z._a;\n              Da.unshift(Z.sa);\n              xa = c;\n              Ia();\n            }).catch(ka);\n            return {};\n          }();\n          A._OrtInit = (a, b) => (A._OrtInit = Z.ta)(a, b);\n          A._OrtGetLastError = (a, b) => (A._OrtGetLastError = Z.ua)(a, b);\n          A._OrtCreateSessionOptions = (a, b, c, d, e, f, k, l, q, r) => (A._OrtCreateSessionOptions = Z.va)(a, b, c, d, e, f, k, l, q, r);\n          A._OrtAppendExecutionProvider = (a, b) => (A._OrtAppendExecutionProvider = Z.wa)(a, b);\n          A._OrtAddFreeDimensionOverride = (a, b, c) => (A._OrtAddFreeDimensionOverride = Z.xa)(a, b, c);\n          A._OrtAddSessionConfigEntry = (a, b, c) => (A._OrtAddSessionConfigEntry = Z.ya)(a, b, c);\n          A._OrtReleaseSessionOptions = (a) => (A._OrtReleaseSessionOptions = Z.za)(a);\n          A._OrtCreateSession = (a, b, c) => (A._OrtCreateSession = Z.Aa)(a, b, c);\n          A._OrtReleaseSession = (a) => (A._OrtReleaseSession = Z.Ba)(a);\n          A._OrtGetInputOutputCount = (a, b, c) => (A._OrtGetInputOutputCount = Z.Ca)(a, b, c);\n          A._OrtGetInputName = (a, b) => (A._OrtGetInputName = Z.Da)(a, b);\n          A._OrtGetOutputName = (a, b) => (A._OrtGetOutputName = Z.Ea)(a, b);\n          A._OrtFree = (a) => (A._OrtFree = Z.Fa)(a);\n          A._OrtCreateTensor = (a, b, c, d, e, f) => (A._OrtCreateTensor = Z.Ga)(a, b, c, d, e, f);\n          A._OrtGetTensorData = (a, b, c, d, e) => (A._OrtGetTensorData = Z.Ha)(a, b, c, d, e);\n          A._OrtReleaseTensor = (a) => (A._OrtReleaseTensor = Z.Ia)(a);\n          A._OrtCreateRunOptions = (a, b, c, d) => (A._OrtCreateRunOptions = Z.Ja)(a, b, c, d);\n          A._OrtAddRunConfigEntry = (a, b, c) => (A._OrtAddRunConfigEntry = Z.Ka)(a, b, c);\n          A._OrtReleaseRunOptions = (a) => (A._OrtReleaseRunOptions = Z.La)(a);\n          A._OrtCreateBinding = (a) => (A._OrtCreateBinding = Z.Ma)(a);\n          A._OrtBindInput = (a, b, c) => (A._OrtBindInput = Z.Na)(a, b, c);\n          A._OrtBindOutput = (a, b, c, d) => (A._OrtBindOutput = Z.Oa)(a, b, c, d);\n          A._OrtClearBoundOutputs = (a) => (A._OrtClearBoundOutputs = Z.Pa)(a);\n          A._OrtReleaseBinding = (a) => (A._OrtReleaseBinding = Z.Qa)(a);\n          A._OrtRunWithBinding = (a, b, c, d, e) => (A._OrtRunWithBinding = Z.Ra)(a, b, c, d, e);\n          A._OrtRun = (a, b, c, d, e, f, k, l) => (A._OrtRun = Z.Sa)(a, b, c, d, e, f, k, l);\n          A._OrtEndProfiling = (a) => (A._OrtEndProfiling = Z.Ta)(a);\n          var Za = A._pthread_self = () => (Za = A._pthread_self = Z.Ua)(), uc = A._malloc = (a) => (uc = A._malloc = Z.Va)(a), X = A._free = (a) => (X = A._free = Z.Wa)(a);\n          A.__emscripten_tls_init = () => (A.__emscripten_tls_init = Z.Xa)();\n          var bc = (a) => (bc = Z.Ya)(a);\n          A.__embind_initialize_bindings = () => (A.__embind_initialize_bindings = Z.Za)();\n          var Oc = A.__emscripten_thread_init = (a, b, c, d, e, f) => (Oc = A.__emscripten_thread_init = Z.$a)(a, b, c, d, e, f);\n          A.__emscripten_thread_crashed = () => (A.__emscripten_thread_crashed = Z.ab)();\n          var $b = (a, b, c, d) => ($b = Z.bb)(a, b, c, d), Ya = (a) => (Ya = Z.cb)(a), fb = A.__emscripten_thread_exit = (a) => (fb = A.__emscripten_thread_exit = Z.db)(a), Wb = A.__emscripten_check_mailbox = () => (Wb = A.__emscripten_check_mailbox = Z.eb)(), bb = (a, b) => (bb = Z.fb)(a, b), Xb = () => (Xb = Z.gb)(), cb = (a) => (cb = Z.hb)(a), Zb = (a) => (Zb = Z.ib)(a);\n          function Qc() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (e) => d(e) >>> 0;\n            a.__errno_location = b(a.__errno_location);\n            a.Ua = b(a.Ua);\n            a.Va = c(a.Va);\n            a.Ya = c(a.Ya);\n            a.gb = b(a.gb);\n            a.ib = c(a.ib);\n            return a;\n          }\n          A.keepRuntimeAlive = Ga;\n          A.wasmMemory = m;\n          A.stackAlloc = Zb;\n          A.stackSave = Xb;\n          A.stackRestore = cb;\n          A.UTF8ToString = Ta;\n          A.stringToUTF8 = pb;\n          A.lengthBytesUTF8 = nb;\n          A.ExitStatus = Oa;\n          A.PThread = O;\n          var Rc;\n          L = function Sc() {\n            Rc || Tc();\n            Rc || (L = Sc);\n          };\n          function Tc() {\n            0 < K || (E ? (ja(A), E || ab(Da), startWorker(A)) : (ab(Ca), 0 < K || Rc || (Rc = true, A.calledRun = true, ya || (E || ab(Da), ja(A), E || ab(Ea)))));\n          }\n          Tc();\n          return moduleArg.ready;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>(0,eval)(fs.readFileSync(f,"utf8")+"//# sourceURL="+f),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){Module["__embind_initialize_bindings"]();initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (false) {\n    ortWasmFactory = null;\n  } else {\n    ortWasmFactory = true ? require_ort_wasm() : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = () => {\n    try {\n      if (typeof SharedArrayBuffer === "undefined") {\n        return false;\n      }\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (false) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = numThreads > 1 && isMultiThreadSupported();\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "xnnpack":\n          epName = "XNNPACK";\n          break;\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "int32" || type === "int64" || type === "bool" || type === "float16" || type === "uint32";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n    if (false) {\n      const initJsep = null.init;\n      await initJsep(getInstance(), env);\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var createSessionAllocate = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSessionFinalize = (modelData, options) => {\n    const wasm2 = getInstance();\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      sessionHandle = wasm2._OrtCreateSession(modelData[0], modelData[1], sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(sessionHandle, [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState]);\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelData[0]);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n    }\n  };\n  var createSession = (model, options) => {\n    const modelData = createSessionAllocate(model);\n    return createSessionFinalize(modelData, options);\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    if (ioBindingState) {\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepUnregisterBuffers?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      rawData = wasm2.jsepRegisterBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState] = session;\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(inputTensors[i], inputTensorHandles, inputOutputAllocs, sessionId, inputIndices[i]);\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i]\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n      }\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const gpuBuffer = wasm2.jsepGetBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    switch (ev.data.type) {\n      case "init-wasm":\n        try {\n          initializeWebAssembly(ev.data.in).then(\n            () => postMessage({ type: "init-wasm" }),\n            (err) => postMessage({ type: "init-wasm", err })\n          );\n        } catch (err) {\n          postMessage({ type: "init-wasm", err });\n        }\n        break;\n      case "init-ort":\n        try {\n          initRuntime(ev.data.in).then(() => postMessage({ type: "init-ort" }), (err) => postMessage({\n            type: "init-ort",\n            err\n          }));\n        } catch (err) {\n          postMessage({ type: "init-ort", err });\n        }\n        break;\n      case "create_allocate":\n        try {\n          const { model } = ev.data.in;\n          const modeldata = createSessionAllocate(model);\n          postMessage({ type: "create_allocate", out: modeldata });\n        } catch (err) {\n          postMessage({ type: "create_allocate", err });\n        }\n        break;\n      case "create_finalize":\n        try {\n          const { modeldata, options } = ev.data.in;\n          const sessionMetadata = createSessionFinalize(modeldata, options);\n          postMessage({ type: "create_finalize", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create_finalize", err });\n        }\n        break;\n      case "create":\n        try {\n          const { model, options } = ev.data.in;\n          const sessionMetadata = createSession(model, options);\n          postMessage({ type: "create", out: sessionMetadata });\n        } catch (err) {\n          postMessage({ type: "create", err });\n        }\n        break;\n      case "release":\n        try {\n          const handler = ev.data.in;\n          releaseSession(handler);\n          postMessage({ type: "release" });\n        } catch (err) {\n          postMessage({ type: "release", err });\n        }\n        break;\n      case "run":\n        try {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = ev.data.in;\n          run(sessionId, inputIndices, inputs, outputIndices, options).then(\n            (outputs) => {\n              postMessage({ type: "run", out: outputs }, extractTransferableBuffers(outputs));\n            },\n            (err) => {\n              postMessage({ type: "run", err });\n            }\n          );\n        } catch (err) {\n          postMessage({ type: "run", err });\n        }\n        break;\n      case "end-profiling":\n        try {\n          const handler = ev.data.in;\n          endProfiling(handler);\n          postMessage({ type: "end-profiling" });\n        } catch (err) {\n          postMessage({ type: "end-profiling", err });\n        }\n        break;\n      default:\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS5qcyIsICJub2RlanMtaWdub3JlOndvcmtlcl90aHJlYWRzIiwgIm5vZGVqcy1pZ25vcmU6cGVyZl9ob29rcyIsICJub2RlanMtaWdub3JlOm9zIiwgIi4uL2xpYi93YXNtL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQuanMiLCAiLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMiLCAibm9kZWpzLWlnbm9yZTpub2RlOnBhdGgiLCAiLi4vbGliL3dhc20vd2FzbS1mYWN0b3J5LnRzIiwgIi4uL2xpYi93YXNtL3dhc20tdXRpbHMudHMiLCAiLi4vbGliL3dhc20vcnVuLW9wdGlvbnMudHMiLCAiLi4vbGliL3dhc20vc2Vzc2lvbi1vcHRpb25zLnRzIiwgIi4uL2xpYi93YXNtL3dhc20tY29tbW9uLnRzIiwgIi4uL2xpYi93YXNtL3dhc20tY29yZS1pbXBsLnRzIiwgIi4uL2xpYi93YXNtL3Byb3h5LXdvcmtlci9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7IiwgImV4cG9ydCBjb25zdCBqb2luID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9PSAndW5kZWZpbmVkJykgX3NjcmlwdERpciA9IF9zY3JpcHREaXIgfHwgX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbnZhciBoPW1vZHVsZUFyZyxhYSxiYTtoLnJlYWR5PW5ldyBQcm9taXNlKChhLGIpPT57YWE9YTtiYT1ifSk7dmFyIGNhPU9iamVjdC5hc3NpZ24oe30saCksZGE9XCIuL3RoaXMucHJvZ3JhbVwiLGVhPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3csbT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpbXBvcnRTY3JpcHRzLGZhPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSxwPVwiXCIsaGEsdCx3O1xuaWYoZmEpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksaWE9cmVxdWlyZShcInBhdGhcIik7cD1tP2lhLmRpcm5hbWUocCkrXCIvXCI6X19kaXJuYW1lK1wiL1wiO2hhPShhLGIpPT57YT1hLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpP25ldyBVUkwoYSk6aWEubm9ybWFsaXplKGEpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYSxiP3ZvaWQgMDpcInV0ZjhcIil9O3c9YT0+e2E9aGEoYSwhMCk7YS5idWZmZXJ8fChhPW5ldyBVaW50OEFycmF5KGEpKTtyZXR1cm4gYX07dD0oYSxiLGMsZD0hMCk9PnthPWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik/bmV3IFVSTChhKTppYS5ub3JtYWxpemUoYSk7ZnMucmVhZEZpbGUoYSxkP3ZvaWQgMDpcInV0ZjhcIiwoZSxnKT0+e2U/YyhlKTpiKGQ/Zy5idWZmZXI6Zyl9KX07IWgudGhpc1Byb2dyYW0mJjE8cHJvY2Vzcy5hcmd2Lmxlbmd0aCYmKGRhPXByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csXCIvXCIpKTtwcm9jZXNzLmFyZ3Yuc2xpY2UoMik7aC5pbnNwZWN0PSgpPT5cIltFbXNjcmlwdGVuIE1vZHVsZSBvYmplY3RdXCJ9ZWxzZSBpZihlYXx8XG5tKW0/cD1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYocD1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksX3NjcmlwdERpciYmKHA9X3NjcmlwdERpciksMCE9PXAuaW5kZXhPZihcImJsb2I6XCIpP3A9cC5zdWJzdHIoMCxwLnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpOnA9XCJcIixoYT1hPT57dmFyIGI9bmV3IFhNTEh0dHBSZXF1ZXN0O2Iub3BlbihcIkdFVFwiLGEsITEpO2Iuc2VuZChudWxsKTtyZXR1cm4gYi5yZXNwb25zZVRleHR9LG0mJih3PWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Iuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYi5yZXNwb25zZSl9KSx0PShhLGIsYyk9Pnt2YXIgZD1uZXcgWE1MSHR0cFJlcXVlc3Q7ZC5vcGVuKFwiR0VUXCIsYSwhMCk7ZC5yZXNwb25zZVR5cGU9XG5cImFycmF5YnVmZmVyXCI7ZC5vbmxvYWQ9KCk9PnsyMDA9PWQuc3RhdHVzfHwwPT1kLnN0YXR1cyYmZC5yZXNwb25zZT9iKGQucmVzcG9uc2UpOmMoKX07ZC5vbmVycm9yPWM7ZC5zZW5kKG51bGwpfTt2YXIgamE9Y29uc29sZS5sb2cuYmluZChjb25zb2xlKSx4PWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtPYmplY3QuYXNzaWduKGgsY2EpO2NhPW51bGw7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZrYShcIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWRcIik7dmFyIHosbGE9ITEsQSxCLEMsRCxFLEcsbWEsbmEsb2EscGE7XG5mdW5jdGlvbiBxYSgpe3ZhciBhPXouYnVmZmVyO2guSEVBUDg9QT1uZXcgSW50OEFycmF5KGEpO2guSEVBUDE2PUM9bmV3IEludDE2QXJyYXkoYSk7aC5IRUFQVTg9Qj1uZXcgVWludDhBcnJheShhKTtoLkhFQVBVMTY9RD1uZXcgVWludDE2QXJyYXkoYSk7aC5IRUFQMzI9RT1uZXcgSW50MzJBcnJheShhKTtoLkhFQVBVMzI9Rz1uZXcgVWludDMyQXJyYXkoYSk7aC5IRUFQRjMyPW1hPW5ldyBGbG9hdDMyQXJyYXkoYSk7aC5IRUFQRjY0PXBhPW5ldyBGbG9hdDY0QXJyYXkoYSk7aC5IRUFQNjQ9bmE9bmV3IEJpZ0ludDY0QXJyYXkoYSk7aC5IRUFQVTY0PW9hPW5ldyBCaWdVaW50NjRBcnJheShhKX12YXIgcmE9W10sc2E9W10sdGE9W10sST0wLHVhPW51bGwsSj1udWxsO1xuZnVuY3Rpb24ga2EoYSl7YT1cIkFib3J0ZWQoXCIrYStcIilcIjt4KGEpO2xhPSEwO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTtiYShhKTt0aHJvdyBhO31mdW5jdGlvbiB2YShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgSztLPVwib3J0LXdhc20ud2FzbVwiO2lmKCF2YShLKSl7dmFyIHdhPUs7Sz1oLmxvY2F0ZUZpbGU/aC5sb2NhdGVGaWxlKHdhLHApOnArd2F9ZnVuY3Rpb24geGEoYSl7aWYodylyZXR1cm4gdyhhKTt0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjt9XG5mdW5jdGlvbiB5YShhKXtpZihlYXx8bSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZmV0Y2gmJiFhLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKXJldHVybiBmZXRjaChhLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KS50aGVuKGI9PntpZighYi5vayl0aHJvd1wiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnXCIrYStcIidcIjtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PnhhKGEpKTtpZih0KXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3QoYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT54YShhKSl9ZnVuY3Rpb24gemEoYSxiLGMpe3JldHVybiB5YShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9Pnt4KGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7a2EoZCl9KX1cbmZ1bmN0aW9uIEFhKGEsYil7dmFyIGM9SztyZXR1cm5cImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8dmEoYyl8fGMuc3RhcnRzV2l0aChcImZpbGU6Ly9cIil8fGZhfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD96YShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihlKXt4KGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtlfWApO3goXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gemEoYyxhLGIpfSkpfVxuZnVuY3Rpb24gQmEoYSl7dGhpcy5WYT1hLTI0O3RoaXMuZmI9ZnVuY3Rpb24oYil7R1t0aGlzLlZhKzQ+Pj4yPj4+MF09Yn07dGhpcy5lYj1mdW5jdGlvbihiKXtHW3RoaXMuVmErOD4+PjI+Pj4wXT1ifTt0aGlzLlphPWZ1bmN0aW9uKGIsYyl7dGhpcy4kYSgpO3RoaXMuZmIoYik7dGhpcy5lYihjKX07dGhpcy4kYT1mdW5jdGlvbigpe0dbdGhpcy5WYSsxNj4+PjI+Pj4wXT0wfX1cbnZhciBDYT0wLERhPTAsRWE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLEZhPShhLGIsYyk9PntiPj4+PTA7dmFyIGQ9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1kKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJkVhKXJldHVybiBFYS5kZWNvZGUoYS5zdWJhcnJheShiLGMpKTtmb3IoZD1cIlwiO2I8Yzspe3ZhciBlPWFbYisrXTtpZihlJjEyOCl7dmFyIGc9YVtiKytdJjYzO2lmKDE5Mj09KGUmMjI0KSlkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKChlJjMxKTw8NnxnKTtlbHNle3ZhciBsPWFbYisrXSY2MztlPTIyND09KGUmMjQwKT8oZSYxNSk8PDEyfGc8PDZ8bDooZSY3KTw8MTh8Zzw8MTJ8bDw8NnxhW2IrK10mNjM7NjU1MzY+ZT9kKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpOihlLT02NTUzNixkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGU+PjEwLDU2MzIwfGUmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGR9LFxuTD0oYSxiKT0+KGE+Pj49MCk/RmEoQixhLGIpOlwiXCIsTT1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sTj0oYSxiLGMsZCk9PntjPj4+PTA7aWYoISgwPGQpKXJldHVybiAwO3ZhciBlPWM7ZD1jK2QtMTtmb3IodmFyIGc9MDtnPGEubGVuZ3RoOysrZyl7dmFyIGw9YS5jaGFyQ29kZUF0KGcpO2lmKDU1Mjk2PD1sJiY1NzM0Mz49bCl7dmFyIGs9YS5jaGFyQ29kZUF0KCsrZyk7bD02NTUzNisoKGwmMTAyMyk8PDEwKXxrJjEwMjN9aWYoMTI3Pj1sKXtpZihjPj1kKWJyZWFrO2JbYysrPj4+MF09bH1lbHNle2lmKDIwNDc+PWwpe2lmKGMrMT49ZClicmVhaztiW2MrKz4+PjBdPTE5MnxsPj42fWVsc2V7aWYoNjU1MzU+PWwpe2lmKGMrMj49ZClicmVhaztiW2MrKz4+PjBdPTIyNHxsPj4xMn1lbHNle2lmKGMrMz49XG5kKWJyZWFrO2JbYysrPj4+MF09MjQwfGw+PjE4O2JbYysrPj4+MF09MTI4fGw+PjEyJjYzfWJbYysrPj4+MF09MTI4fGw+PjYmNjN9YltjKys+Pj4wXT0xMjh8bCY2M319YltjPj4+MF09MDtyZXR1cm4gYy1lfSxHYT1hPT57aWYobnVsbD09PWEpcmV0dXJuXCJudWxsXCI7dmFyIGI9dHlwZW9mIGE7cmV0dXJuXCJvYmplY3RcIj09PWJ8fFwiYXJyYXlcIj09PWJ8fFwiZnVuY3Rpb25cIj09PWI/YS50b1N0cmluZygpOlwiXCIrYX0sSGEsTz1hPT57Zm9yKHZhciBiPVwiXCI7QlthPj4+MF07KWIrPUhhW0JbYSsrPj4+MF1dO3JldHVybiBifSxJYT17fSxKYT17fSxLYT17fSxQO1xuZnVuY3Rpb24gTGEoYSxiLGM9e30pe3ZhciBkPWIubmFtZTtpZighYSl0aHJvdyBuZXcgUChgdHlwZSBcIiR7ZH1cIiBtdXN0IGhhdmUgYSBwb3NpdGl2ZSBpbnRlZ2VyIHR5cGVpZCBwb2ludGVyYCk7aWYoSmEuaGFzT3duUHJvcGVydHkoYSkpe2lmKGMuZ2IpcmV0dXJuO3Rocm93IG5ldyBQKGBDYW5ub3QgcmVnaXN0ZXIgdHlwZSAnJHtkfScgdHdpY2VgKTt9SmFbYV09YjtkZWxldGUgS2FbYV07SWEuaGFzT3duUHJvcGVydHkoYSkmJihiPUlhW2FdLGRlbGV0ZSBJYVthXSxiLmZvckVhY2goZT0+ZSgpKSl9ZnVuY3Rpb24gUShhLGIsYz17fSl7aWYoIShcImFyZ1BhY2tBZHZhbmNlXCJpbiBiKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVnaXN0ZXJUeXBlIHJlZ2lzdGVyZWRJbnN0YW5jZSByZXF1aXJlcyBhcmdQYWNrQWR2YW5jZVwiKTtMYShhLGIsYyl9XG52YXIgTWE9KGEsYixjKT0+e3N3aXRjaChiKXtjYXNlIDE6cmV0dXJuIGM/ZD0+QVtkPj4+MD4+PjBdOmQ9PkJbZD4+PjA+Pj4wXTtjYXNlIDI6cmV0dXJuIGM/ZD0+Q1tkPj4+MT4+PjBdOmQ9PkRbZD4+PjE+Pj4wXTtjYXNlIDQ6cmV0dXJuIGM/ZD0+RVtkPj4+Mj4+PjBdOmQ9PkdbZD4+PjI+Pj4wXTtjYXNlIDg6cmV0dXJuIGM/ZD0+bmFbZD4+PjNdOmQ9Pm9hW2Q+Pj4zXTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgaW50ZWdlciB3aWR0aCAoJHtifSk6ICR7YX1gKTt9fTtmdW5jdGlvbiBOYSgpe3RoaXMuU2E9W3ZvaWQgMF07dGhpcy5iYj1bXX12YXIgUj1uZXcgTmE7ZnVuY3Rpb24gT2EoYSl7YT4+Pj0wO2E+PVIuVmEmJjA9PT0tLVIuZ2V0KGEpLmNiJiZSLiRhKGEpfVxudmFyIFM9YT0+e2lmKCFhKXRocm93IG5ldyBQKFwiQ2Fubm90IHVzZSBkZWxldGVkIHZhbC4gaGFuZGxlID0gXCIrYSk7cmV0dXJuIFIuZ2V0KGEpLnZhbHVlfSxUPWE9Pntzd2l0Y2goYSl7Y2FzZSB2b2lkIDA6cmV0dXJuIDE7Y2FzZSBudWxsOnJldHVybiAyO2Nhc2UgITA6cmV0dXJuIDM7Y2FzZSAhMTpyZXR1cm4gNDtkZWZhdWx0OnJldHVybiBSLlphKHtjYjoxLHZhbHVlOmF9KX19O2Z1bmN0aW9uIFBhKGEpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShFW2E+Pj4yPj4+MF0pfXZhciBRYT0oYSxiKT0+e3N3aXRjaChiKXtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShtYVtjPj4+Mj4+PjBdKX07Y2FzZSA4OnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUocGFbYz4+PjM+Pj4wXSl9O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBmbG9hdCB3aWR0aCAoJHtifSk6ICR7YX1gKTt9fTtcbmZ1bmN0aW9uIFJhKGEpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShHW2E+Pj4yPj4+MF0pfVxudmFyIFNhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGYtMTZsZVwiKTp2b2lkIDAsVGE9KGEsYik9Pnt2YXIgYz1hPj4xO2Zvcih2YXIgZD1jK2IvMjshKGM+PWQpJiZEW2M+Pj4wXTspKytjO2M8PD0xO2lmKDMyPGMtYSYmU2EpcmV0dXJuIFNhLmRlY29kZShCLnN1YmFycmF5KGE+Pj4wLGM+Pj4wKSk7Yz1cIlwiO2ZvcihkPTA7IShkPj1iLzIpOysrZCl7dmFyIGU9Q1thKzIqZD4+PjE+Pj4wXTtpZigwPT1lKWJyZWFrO2MrPVN0cmluZy5mcm9tQ2hhckNvZGUoZSl9cmV0dXJuIGN9LFVhPShhLGIsYyk9Pnt2b2lkIDA9PT1jJiYoYz0yMTQ3NDgzNjQ3KTtpZigyPmMpcmV0dXJuIDA7Yy09Mjt2YXIgZD1iO2M9YzwyKmEubGVuZ3RoP2MvMjphLmxlbmd0aDtmb3IodmFyIGU9MDtlPGM7KytlKUNbYj4+PjE+Pj4wXT1hLmNoYXJDb2RlQXQoZSksYis9MjtDW2I+Pj4xPj4+MF09MDtyZXR1cm4gYi1kfSxWYT1hPT4yKmEubGVuZ3RoLFdhPShhLGIpPT5cbntmb3IodmFyIGM9MCxkPVwiXCI7IShjPj1iLzQpOyl7dmFyIGU9RVthKzQqYz4+PjI+Pj4wXTtpZigwPT1lKWJyZWFrOysrYzs2NTUzNjw9ZT8oZS09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxlPj4xMCw1NjMyMHxlJjEwMjMpKTpkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBkfSxYYT0oYSxiLGMpPT57Yj4+Pj0wO3ZvaWQgMD09PWMmJihjPTIxNDc0ODM2NDcpO2lmKDQ+YylyZXR1cm4gMDt2YXIgZD1iO2M9ZCtjLTQ7Zm9yKHZhciBlPTA7ZTxhLmxlbmd0aDsrK2Upe3ZhciBnPWEuY2hhckNvZGVBdChlKTtpZig1NTI5Njw9ZyYmNTczNDM+PWcpe3ZhciBsPWEuY2hhckNvZGVBdCgrK2UpO2c9NjU1MzYrKChnJjEwMjMpPDwxMCl8bCYxMDIzfUVbYj4+PjI+Pj4wXT1nO2IrPTQ7aWYoYis0PmMpYnJlYWt9RVtiPj4+Mj4+PjBdPTA7cmV0dXJuIGItZH0sWWE9YT0+e2Zvcih2YXIgYj0wLGM9MDtjPGEubGVuZ3RoOysrYyl7dmFyIGQ9YS5jaGFyQ29kZUF0KGMpO1xuNTUyOTY8PWQmJjU3MzQzPj1kJiYrK2M7Yis9NH1yZXR1cm4gYn0sVj0oYSxiKT0+e3ZhciBjPUphW2FdO2lmKHZvaWQgMD09PWMpdGhyb3cgYT1aYShhKSxjPU8oYSksVShhKSxuZXcgUChiK1wiIGhhcyB1bmtub3duIHR5cGUgXCIrYyk7cmV0dXJuIGN9LCRhPXt9LFc9YT0+e3ZhciBiPSRhW2FdO3JldHVybiB2b2lkIDA9PT1iP08oYSk6Yn0sWD1bXSxiYj0oKT0+XCJvYmplY3RcIj09dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczpGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCksY2I9YT0+e3ZhciBiPVgubGVuZ3RoO1gucHVzaChhKTtyZXR1cm4gYn0sZGI9KGEsYik9Pntmb3IodmFyIGM9QXJyYXkoYSksZD0wO2Q8YTsrK2QpY1tkXT1WKEdbYis0KmQ+Pj4yPj4+MF0sXCJwYXJhbWV0ZXIgXCIrZCk7cmV0dXJuIGN9LGViPWE9PntpZih2b2lkIDA9PT1hKXJldHVyblwiX3Vua25vd25cIjthPWEucmVwbGFjZSgvW15hLXpBLVowLTlfXS9nLFwiJFwiKTt2YXIgYj1hLmNoYXJDb2RlQXQoMCk7cmV0dXJuIDQ4PD1cbmImJjU3Pj1iP2BfJHthfWA6YX0sZmI9e307ZnVuY3Rpb24gZ2IoYSxiKXthPWViKGEpO3JldHVybntbYV06ZnVuY3Rpb24oKXtyZXR1cm4gYi5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fVthXX1mdW5jdGlvbiBoYihhKXt2YXIgYj1GdW5jdGlvbjtpZighKGIgaW5zdGFuY2VvZiBGdW5jdGlvbikpdGhyb3cgbmV3IFR5cGVFcnJvcihgbmV3XyBjYWxsZWQgd2l0aCBjb25zdHJ1Y3RvciB0eXBlICR7dHlwZW9mIGJ9IHdoaWNoIGlzIG5vdCBhIGZ1bmN0aW9uYCk7dmFyIGM9Z2IoYi5uYW1lfHxcInVua25vd25GdW5jdGlvbk5hbWVcIixmdW5jdGlvbigpe30pO2MucHJvdG90eXBlPWIucHJvdG90eXBlO2M9bmV3IGM7YT1iLmFwcGx5KGMsYSk7cmV0dXJuIGEgaW5zdGFuY2VvZiBPYmplY3Q/YTpjfVxudmFyIGliPWE9Pntmb3IodmFyIGI9XCJcIixjPTA7YzxhOysrYyliKz0oMCE9PWM/XCIsIFwiOlwiXCIpK1wiYXJnXCIrYzt2YXIgZD1cInJldHVybiBmdW5jdGlvbiBlbXZhbF9hbGxvY2F0b3JfXCIrYStcIihjb25zdHJ1Y3RvciwgYXJnVHlwZXMsIGFyZ3MpIHtcXG4gIHZhciBIRUFQVTMyID0gZ2V0TWVtb3J5KCk7XFxuXCI7Zm9yKGM9MDtjPGE7KytjKWQrPVwidmFyIGFyZ1R5cGVcIitjK1wiID0gcmVxdWlyZVJlZ2lzdGVyZWRUeXBlKEhFQVBVMzJbKChhcmdUeXBlcyk+Pj4yKV0sICdwYXJhbWV0ZXIgXCIrYytcIicpO1xcbnZhciBhcmdcIitjK1wiID0gYXJnVHlwZVwiK2MrXCIucmVhZFZhbHVlRnJvbVBvaW50ZXIoYXJncyk7XFxuYXJncyArPSBhcmdUeXBlXCIrYytcIlsnYXJnUGFja0FkdmFuY2UnXTtcXG5hcmdUeXBlcyArPSA0O1xcblwiO3JldHVybihuZXcgRnVuY3Rpb24oXCJyZXF1aXJlUmVnaXN0ZXJlZFR5cGVcIixcIk1vZHVsZVwiLFwidmFsdWVUb0hhbmRsZVwiLFwiZ2V0TWVtb3J5XCIsZCsoXCJ2YXIgb2JqID0gbmV3IGNvbnN0cnVjdG9yKFwiK1xuYitcIik7XFxucmV0dXJuIHZhbHVlVG9IYW5kbGUob2JqKTtcXG59XFxuXCIpKSkoVixoLFQsKCk9PkcpfSxqYj17fSxZPWE9PjA9PT1hJTQmJigwIT09YSUxMDB8fDA9PT1hJTQwMCksa2I9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sbGI9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF0sbmI9YT0+e3ZhciBiPU0oYSkrMSxjPW1iKGIpO2MmJk4oYSxCLGMsYik7cmV0dXJuIGN9LG9iPXt9LHFiPSgpPT57aWYoIXBiKXt2YXIgYT17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpkYXx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIG9iKXZvaWQgMD09PVxub2JbYl0/ZGVsZXRlIGFbYl06YVtiXT1vYltiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7cGI9Y31yZXR1cm4gcGJ9LHBiLHJiPVtudWxsLFtdLFtdXSxzYj1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLHRiPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gdWIoYSl7dmFyIGI9QXJyYXkoTShhKSsxKTtOKGEsYiwwLGIubGVuZ3RoKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIHZiKGEsYixjLGQpe2Z1bmN0aW9uIGUoZixyLHUpe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPHI7KWY9dVswXStmO3JldHVybiBmfWZ1bmN0aW9uIGcoZixyKXtyZXR1cm4gZShmLHIsXCIwXCIpfWZ1bmN0aW9uIGwoZixyKXtmdW5jdGlvbiB1KGFiKXtyZXR1cm4gMD5hYj8tMTowPGFiPzE6MH12YXIgSDswPT09KEg9dShmLmdldEZ1bGxZZWFyKCktci5nZXRGdWxsWWVhcigpKSkmJjA9PT0oSD11KGYuZ2V0TW9udGgoKS1yLmdldE1vbnRoKCkpKSYmKEg9dShmLmdldERhdGUoKS1yLmdldERhdGUoKSkpO3JldHVybiBIfWZ1bmN0aW9uIGsoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBuKGYpe3ZhciByPWYuVGE7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuVWErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8cjspe3ZhciB1PWYuZ2V0TW9udGgoKSxIPShZKGYuZ2V0RnVsbFllYXIoKSk/c2I6dGIpW3VdO2lmKHI+SC1mLmdldERhdGUoKSlyLT1ILWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnU/Zi5zZXRNb250aCh1KzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStyKTticmVha319dT1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3I9ayhuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt1PWsodSk7cmV0dXJuIDA+PWwocixmKT8wPj1sKHUsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgcT1HW2QrNDA+Pj4yPj4+MF07ZD17a2I6RVtkPj4+Mj4+PjBdLGpiOkVbZCs0Pj4+Mj4+PjBdLFhhOkVbZCs4Pj4+Mj4+PjBdLGFiOkVbZCsxMj4+PjI+Pj4wXSxZYTpFW2QrMTY+Pj4yPj4+MF0sVWE6RVtkKzIwPj4+Mj4+PjBdLE9hOkVbZCsyND4+PjI+Pj4wXSxUYTpFW2QrMjg+Pj4yPj4+MF0sbWI6RVtkKzMyPj4+Mj4+PjBdLGliOkVbZCszNj4+PjI+Pj4wXSxsYjpxP0wocSk6XCJcIn07Yz1MKGMpO3E9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcIiVYXCI6XCIlSDolTTolU1wiLFxuXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgdiBpbiBxKWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodixcImdcIikscVt2XSk7dmFyIHk9XCJTdW5kYXkgTW9uZGF5IFR1ZXNkYXkgV2VkbmVzZGF5IFRodXJzZGF5IEZyaWRheSBTYXR1cmRheVwiLnNwbGl0KFwiIFwiKSxGPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTtxPXtcIiVhXCI6Zj0+eVtmLk9hXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zj0+eVtmLk9hXSxcIiViXCI6Zj0+XG5GW2YuWWFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT5GW2YuWWFdLFwiJUNcIjpmPT5nKChmLlVhKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpmPT5nKGYuYWIsMiksXCIlZVwiOmY9PmUoZi5hYiwyLFwiIFwiKSxcIiVnXCI6Zj0+bihmKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zj0+bihmKSxcIiVIXCI6Zj0+ZyhmLlhhLDIpLFwiJUlcIjpmPT57Zj1mLlhhOzA9PWY/Zj0xMjoxMjxmJiYoZi09MTIpO3JldHVybiBnKGYsMil9LFwiJWpcIjpmPT57Zm9yKHZhciByPTAsdT0wO3U8PWYuWWEtMTtyKz0oWShmLlVhKzE5MDApP3NiOnRiKVt1KytdKTtyZXR1cm4gZyhmLmFiK3IsMyl9LFwiJW1cIjpmPT5nKGYuWWErMSwyKSxcIiVNXCI6Zj0+ZyhmLmpiLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zj0+MDw9Zi5YYSYmMTI+Zi5YYT9cIkFNXCI6XCJQTVwiLFwiJVNcIjpmPT5nKGYua2IsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpmPT5mLk9hfHw3LFwiJVVcIjpmPT5nKE1hdGguZmxvb3IoKGYuVGErNy1mLk9hKS83KSwyKSxcIiVWXCI6Zj0+XG57dmFyIHI9TWF0aC5mbG9vcigoZi5UYSs3LShmLk9hKzYpJTcpLzcpOzI+PShmLk9hKzM3MS1mLlRhLTIpJTcmJnIrKztpZihyKTUzPT1yJiYodT0oZi5PYSszNzEtZi5UYSklNyw0PT11fHwzPT11JiZZKGYuVWEpfHwocj0xKSk7ZWxzZXtyPTUyO3ZhciB1PShmLk9hKzctZi5UYS0xKSU3Oyg0PT11fHw1PT11JiZZKGYuVWElNDAwLTEpKSYmcisrfXJldHVybiBnKHIsMil9LFwiJXdcIjpmPT5mLk9hLFwiJVdcIjpmPT5nKE1hdGguZmxvb3IoKGYuVGErNy0oZi5PYSs2KSU3KS83KSwyKSxcIiV5XCI6Zj0+KGYuVWErMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmY9PmYuVWErMTkwMCxcIiV6XCI6Zj0+e2Y9Zi5pYjt2YXIgcj0wPD1mO2Y9TWF0aC5hYnMoZikvNjA7cmV0dXJuKHI/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZi82MCoxMDArZiU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmY9PmYubGIsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO2Zvcih2IGluIHEpYy5pbmNsdWRlcyh2KSYmXG4oYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh2LFwiZ1wiKSxxW3ZdKGQpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt2PXViKGMpO2lmKHYubGVuZ3RoPmIpcmV0dXJuIDA7QS5zZXQodixhPj4+MCk7cmV0dXJuIHYubGVuZ3RoLTF9Zm9yKHZhciB3Yj1BcnJheSgyNTYpLHhiPTA7MjU2PnhiOysreGIpd2JbeGJdPVN0cmluZy5mcm9tQ2hhckNvZGUoeGIpO0hhPXdiO1A9aC5CaW5kaW5nRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihhKXtzdXBlcihhKTt0aGlzLm5hbWU9XCJCaW5kaW5nRXJyb3JcIn19O2guSW50ZXJuYWxFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkludGVybmFsRXJyb3JcIn19O1xuT2JqZWN0LmFzc2lnbihOYS5wcm90b3R5cGUse2dldChhKXtyZXR1cm4gdGhpcy5TYVthXX0saGFzKGEpe3JldHVybiB2b2lkIDAhPT10aGlzLlNhW2FdfSxaYShhKXt2YXIgYj10aGlzLmJiLnBvcCgpfHx0aGlzLlNhLmxlbmd0aDt0aGlzLlNhW2JdPWE7cmV0dXJuIGJ9LCRhKGEpe3RoaXMuU2FbYV09dm9pZCAwO3RoaXMuYmIucHVzaChhKX19KTtSLlNhLnB1c2goe3ZhbHVlOnZvaWQgMH0se3ZhbHVlOm51bGx9LHt2YWx1ZTohMH0se3ZhbHVlOiExfSk7Ui5WYT1SLlNhLmxlbmd0aDtoLmNvdW50X2VtdmFsX2hhbmRsZXM9KCk9Pntmb3IodmFyIGE9MCxiPVIuVmE7YjxSLlNhLmxlbmd0aDsrK2Ipdm9pZCAwIT09Ui5TYVtiXSYmKythO3JldHVybiBhfTtcbnZhciB5Yj17YTpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wOyhuZXcgQmEoYSkpLlphKGI+Pj4wLGM+Pj4wKTtDYT1hO0RhKys7dGhyb3cgQ2E7fSx2OmZ1bmN0aW9uKCl7cmV0dXJuIDB9LGJhOmZ1bmN0aW9uKCl7fSxOOmZ1bmN0aW9uKCl7fSxQOmZ1bmN0aW9uKCl7fSxIOmZ1bmN0aW9uKCl7cmV0dXJuIDB9LCQ6ZnVuY3Rpb24oKXt9LFY6ZnVuY3Rpb24oKXt9LF86ZnVuY3Rpb24oKXt9LEE6ZnVuY3Rpb24oKXt9LE86ZnVuY3Rpb24oKXt9LEw6ZnVuY3Rpb24oKXt9LGFhOmZ1bmN0aW9uKCl7fSxNOmZ1bmN0aW9uKCl7fSxEOmZ1bmN0aW9uKGEsYixjLGQsZSl7Yj4+Pj0wO2I9TyhiKTt2YXIgZz0tMSE9Yi5pbmRleE9mKFwidVwiKTtnJiYoZT0oMW48PDY0biktMW4pO1EoYT4+PjAse25hbWU6Yixmcm9tV2lyZVR5cGU6bD0+bCx0b1dpcmVUeXBlOmZ1bmN0aW9uKGwsayl7aWYoXCJiaWdpbnRcIiE9dHlwZW9mIGsmJlwibnVtYmVyXCIhPXR5cGVvZiBrKXRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBjb252ZXJ0IFwiJHtHYShrKX1cIiB0byAke3RoaXMubmFtZX1gKTtcbmlmKGs8ZHx8az5lKXRocm93IG5ldyBUeXBlRXJyb3IoYFBhc3NpbmcgYSBudW1iZXIgXCIke0dhKGspfVwiIGZyb20gSlMgc2lkZSB0byBDL0MrKyBzaWRlIHRvIGFuIGFyZ3VtZW50IG9mIHR5cGUgXCIke2J9XCIsIHdoaWNoIGlzIG91dHNpZGUgdGhlIHZhbGlkIHJhbmdlIFske2R9LCAke2V9XSFgKTtyZXR1cm4ga30sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpNYShiLGM+Pj4wLCFnKSxXYTpudWxsfSl9LGVhOmZ1bmN0aW9uKGEsYixjLGQpe2I9TyhiPj4+MCk7UShhPj4+MCx7bmFtZTpiLGZyb21XaXJlVHlwZTpmdW5jdGlvbihlKXtyZXR1cm4hIWV9LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZSxnKXtyZXR1cm4gZz9jOmR9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKEJbZT4+PjBdKX0sV2E6bnVsbH0pfSxkYTpmdW5jdGlvbihhLGIpe2I9TyhiPj4+MCk7UShhPj4+MCx7bmFtZTpiLFxuZnJvbVdpcmVUeXBlOmM9Pnt2YXIgZD1TKGMpO09hKGMpO3JldHVybiBkfSx0b1dpcmVUeXBlOihjLGQpPT5UKGQpLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6UGEsV2E6bnVsbH0pfSxDOmZ1bmN0aW9uKGEsYixjKXtiPU8oYj4+PjApO1EoYT4+PjAse25hbWU6Yixmcm9tV2lyZVR5cGU6ZD0+ZCx0b1dpcmVUeXBlOihkLGUpPT5lLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6UWEoYixjPj4+MCksV2E6bnVsbH0pfSxwOmZ1bmN0aW9uKGEsYixjLGQsZSl7YT4+Pj0wO2M+Pj49MDtiPU8oYj4+PjApOy0xPT09ZSYmKGU9NDI5NDk2NzI5NSk7ZT1rPT5rO2lmKDA9PT1kKXt2YXIgZz0zMi04KmM7ZT1rPT5rPDxnPj4+Z312YXIgbD1iLmluY2x1ZGVzKFwidW5zaWduZWRcIik/ZnVuY3Rpb24oayxuKXtyZXR1cm4gbj4+PjB9OmZ1bmN0aW9uKGssbil7cmV0dXJuIG59O1EoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTplLHRvV2lyZVR5cGU6bCxhcmdQYWNrQWR2YW5jZTo4LFxucmVhZFZhbHVlRnJvbVBvaW50ZXI6TWEoYixjLDAhPT1kKSxXYTpudWxsfSl9LGw6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoZyl7cmV0dXJuIG5ldyBlKEEuYnVmZmVyLEdbZys0Pj4+Mj4+PjBdLEdbZz4+PjI+Pj4wXSl9dmFyIGU9W0ludDhBcnJheSxVaW50OEFycmF5LEludDE2QXJyYXksVWludDE2QXJyYXksSW50MzJBcnJheSxVaW50MzJBcnJheSxGbG9hdDMyQXJyYXksRmxvYXQ2NEFycmF5LEJpZ0ludDY0QXJyYXksQmlnVWludDY0QXJyYXldW2JdO2M9TyhjPj4+MCk7UShhPj4+MCx7bmFtZTpjLGZyb21XaXJlVHlwZTpkLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZH0se2diOiEwfSl9LEU6ZnVuY3Rpb24oYSxiKXtiPU8oYj4+PjApO3ZhciBjPVwic3RkOjpzdHJpbmdcIj09PWI7UShhPj4+MCx7bmFtZTpiLGZyb21XaXJlVHlwZTpmdW5jdGlvbihkKXt2YXIgZT1HW2Q+Pj4yPj4+MF0sZz1kKzQ7aWYoYylmb3IodmFyIGw9ZyxrPTA7azw9ZTsrK2spe3ZhciBuPVxuZytrO2lmKGs9PWV8fDA9PUJbbj4+PjBdKXtsPUwobCxuLWwpO2lmKHZvaWQgMD09PXEpdmFyIHE9bDtlbHNlIHErPVN0cmluZy5mcm9tQ2hhckNvZGUoMCkscSs9bDtsPW4rMX19ZWxzZXtxPUFycmF5KGUpO2ZvcihrPTA7azxlOysraylxW2tdPVN0cmluZy5mcm9tQ2hhckNvZGUoQltnK2s+Pj4wXSk7cT1xLmpvaW4oXCJcIil9VShkKTtyZXR1cm4gcX0sdG9XaXJlVHlwZTpmdW5jdGlvbihkLGUpe2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciYmKGU9bmV3IFVpbnQ4QXJyYXkoZSkpO3ZhciBnPVwic3RyaW5nXCI9PXR5cGVvZiBlO2lmKCEoZ3x8ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fGUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8ZSBpbnN0YW5jZW9mIEludDhBcnJheSkpdGhyb3cgbmV3IFAoXCJDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIHN0ZDo6c3RyaW5nXCIpO3ZhciBsPWMmJmc/TShlKTplLmxlbmd0aDt2YXIgaz1tYig0K2wrMSksbj1rKzQ7R1trPj4+Mj4+PjBdPWw7XG5pZihjJiZnKU4oZSxCLG4sbCsxKTtlbHNlIGlmKGcpZm9yKGc9MDtnPGw7KytnKXt2YXIgcT1lLmNoYXJDb2RlQXQoZyk7aWYoMjU1PHEpdGhyb3cgVShuKSxuZXcgUChcIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0c1wiKTtCW24rZz4+PjBdPXF9ZWxzZSBmb3IoZz0wO2c8bDsrK2cpQltuK2c+Pj4wXT1lW2ddO251bGwhPT1kJiZkLnB1c2goVSxrKTtyZXR1cm4ga30sYXJnUGFja0FkdmFuY2U6OCxyZWFkVmFsdWVGcm9tUG9pbnRlcjpSYSxXYShkKXtVKGQpfX0pfSx4OmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7Yz4+Pj0wO2M9TyhjKTtpZigyPT09Yil7dmFyIGQ9VGE7dmFyIGU9VWE7dmFyIGc9VmE7dmFyIGw9KCk9PkQ7dmFyIGs9MX1lbHNlIDQ9PT1iJiYoZD1XYSxlPVhhLGc9WWEsbD0oKT0+RyxrPTIpO1EoYT4+PjAse25hbWU6Yyxmcm9tV2lyZVR5cGU6bj0+e2Zvcih2YXIgcT1HW24+Pj4yPj4+MF0sdj1sKCkseSxGPW4rNCxmPVxuMDtmPD1xOysrZil7dmFyIHI9bis0K2YqYjtpZihmPT1xfHwwPT12W3I+Pj5rXSlGPWQoRixyLUYpLHZvaWQgMD09PXk/eT1GOih5Kz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLHkrPUYpLEY9citifVUobik7cmV0dXJuIHl9LHRvV2lyZVR5cGU6KG4scSk9PntpZihcInN0cmluZ1wiIT10eXBlb2YgcSl0aHJvdyBuZXcgUChgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHtjfWApO3ZhciB2PWcocSkseT1tYig0K3YrYik7R1t5Pj4+Ml09dj4+aztlKHEseSs0LHYrYik7bnVsbCE9PW4mJm4ucHVzaChVLHkpO3JldHVybiB5fSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOlBhLFdhKG4pe1Uobil9fSl9LGZhOmZ1bmN0aW9uKGEsYil7Yj1PKGI+Pj4wKTtRKGE+Pj4wLHtoYjohMCxuYW1lOmIsYXJnUGFja0FkdmFuY2U6MCxmcm9tV2lyZVR5cGU6KCk9Pnt9LHRvV2lyZVR5cGU6KCk9Pnt9fSl9LGNhOigpPT4hMCxvOmZ1bmN0aW9uKGEsYixcbmMpe2I+Pj49MDtjPj4+PTA7YT1TKGE+Pj4wKTtiPVYoYixcImVtdmFsOjphc1wiKTt2YXIgZD1bXSxlPVQoZCk7R1tjPj4+Mj4+PjBdPWU7cmV0dXJuIGIudG9XaXJlVHlwZShkLGEpfSxoOmZ1bmN0aW9uKGEsYixjLGQsZSl7Yz4+Pj0wO2Q+Pj49MDtlPj4+PTA7YT1YW2E+Pj4wXTtiPVMoYj4+PjApO2M9VyhjKTt2YXIgZz1bXTtHW2Q+Pj4yPj4+MF09VChnKTtyZXR1cm4gYShiLGMsZyxlKX0scjpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO2E9WFthPj4+MF07Yj1TKGI+Pj4wKTtjPVcoYyk7YShiLGMsbnVsbCxkKX0sYjpPYSxGOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9UyhhPj4+MCk7Yj1TKGIpO3JldHVybiBhPT1ifSx1OmZ1bmN0aW9uKGEpe2E+Pj49MDtpZigwPT09YSlyZXR1cm4gVChiYigpKTthPVcoYSk7cmV0dXJuIFQoYmIoKVthXSl9LGc6ZnVuY3Rpb24oYSxiKXt2YXIgYz1kYihhLGI+Pj4wKSxkPWNbMF07Yj1kLm5hbWUrXCJfJFwiK2Muc2xpY2UoMSkubWFwKGZ1bmN0aW9uKHYpe3JldHVybiB2Lm5hbWV9KS5qb2luKFwiX1wiKStcblwiJFwiO3ZhciBlPWZiW2JdO2lmKHZvaWQgMCE9PWUpcmV0dXJuIGU7ZT1bXCJyZXRUeXBlXCJdO2Zvcih2YXIgZz1bZF0sbD1cIlwiLGs9MDtrPGEtMTsrK2spbCs9KDAhPT1rP1wiLCBcIjpcIlwiKStcImFyZ1wiK2ssZS5wdXNoKFwiYXJnVHlwZVwiK2spLGcucHVzaChjWzEra10pO3ZhciBuPVwicmV0dXJuIGZ1bmN0aW9uIFwiK2ViKFwibWV0aG9kQ2FsbGVyX1wiK2IpK1wiKGhhbmRsZSwgbmFtZSwgZGVzdHJ1Y3RvcnMsIGFyZ3MpIHtcXG5cIixxPTA7Zm9yKGs9MDtrPGEtMTsrK2spbis9XCIgICAgdmFyIGFyZ1wiK2srXCIgPSBhcmdUeXBlXCIraytcIi5yZWFkVmFsdWVGcm9tUG9pbnRlcihhcmdzXCIrKHE/XCIrXCIrcTpcIlwiKStcIik7XFxuXCIscSs9Y1trKzFdLmFyZ1BhY2tBZHZhbmNlO24rPVwiICAgIHZhciBydiA9IGhhbmRsZVtuYW1lXShcIitsK1wiKTtcXG5cIjtmb3Ioaz0wO2s8YS0xOysrayljW2srMV0uZGVsZXRlT2JqZWN0JiYobis9XCIgICAgYXJnVHlwZVwiK2srXCIuZGVsZXRlT2JqZWN0KGFyZ1wiK2srXCIpO1xcblwiKTtkLmhifHxcbihuKz1cIiAgICByZXR1cm4gcmV0VHlwZS50b1dpcmVUeXBlKGRlc3RydWN0b3JzLCBydik7XFxuXCIpO2UucHVzaChuK1wifTtcXG5cIik7YT1oYihlKS5hcHBseShudWxsLGcpO2U9Y2IoYSk7cmV0dXJuIGZiW2JdPWV9LHE6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1TKGE+Pj4wKTtiPVMoYik7cmV0dXJuIFQoYVtiXSl9LGM6ZnVuY3Rpb24oYSl7YT4+Pj0wOzQ8YSYmKFIuZ2V0KGEpLmNiKz0xKX0sRzpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO2E9UyhhPj4+MCk7dmFyIGU9amJbYl07ZXx8KGU9aWIoYiksamJbYl09ZSk7cmV0dXJuIGUoYSxjLGQpfSxzOmZ1bmN0aW9uKCl7cmV0dXJuIFQoW10pfSxrOmZ1bmN0aW9uKGEpe2E9UyhhPj4+MCk7Zm9yKHZhciBiPUFycmF5KGEubGVuZ3RoKSxjPTA7YzxhLmxlbmd0aDtjKyspYltjXT1hW2NdO3JldHVybiBUKGIpfSxkOmZ1bmN0aW9uKGEpe3JldHVybiBUKFcoYT4+PjApKX0sajpmdW5jdGlvbigpe3JldHVybiBUKHt9KX0sZjpmdW5jdGlvbihhKXthPj4+PVxuMDtmb3IodmFyIGI9UyhhKTtiLmxlbmd0aDspe3ZhciBjPWIucG9wKCk7Yi5wb3AoKShjKX1PYShhKX0saTpmdW5jdGlvbihhLGIsYyl7Yj4+Pj0wO2M+Pj49MDthPVMoYT4+PjApO2I9UyhiKTtjPVMoYyk7YVtiXT1jfSxlOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9VihhPj4+MCxcIl9lbXZhbF90YWtlX3ZhbHVlXCIpO2E9YS5yZWFkVmFsdWVGcm9tUG9pbnRlcihiKTtyZXR1cm4gVChhKX0sUzpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+YXx8OTAwNzE5OTI1NDc0MDk5MjxhP05hTjpOdW1iZXIoYSk7Yj4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0VbYj4+PjI+Pj4wXT1hLmdldFVUQ1NlY29uZHMoKTtFW2IrND4+PjI+Pj4wXT1hLmdldFVUQ01pbnV0ZXMoKTtFW2IrOD4+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7RVtiKzEyPj4+Mj4+PjBdPWEuZ2V0VVRDRGF0ZSgpO0VbYisxNj4+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7RVtiKzIwPj4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS1cbjE5MDA7RVtiKzI0Pj4+Mj4+PjBdPWEuZ2V0VVRDRGF5KCk7RVtiKzI4Pj4+Mj4+PjBdPShhLmdldFRpbWUoKS1EYXRlLlVUQyhhLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRFNXwwfSxUOmZ1bmN0aW9uKGEsYil7YT0tOTAwNzE5OTI1NDc0MDk5Mj5hfHw5MDA3MTk5MjU0NzQwOTkyPGE/TmFOOk51bWJlcihhKTtiPj4+PTA7YT1uZXcgRGF0ZSgxRTMqYSk7RVtiPj4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO0VbYis0Pj4+Mj4+PjBdPWEuZ2V0TWludXRlcygpO0VbYis4Pj4+Mj4+PjBdPWEuZ2V0SG91cnMoKTtFW2IrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7RVtiKzE2Pj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTtFW2IrMjA+Pj4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7RVtiKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7RVtiKzI4Pj4+Mj4+PjBdPShZKGEuZ2V0RnVsbFllYXIoKSk/a2I6bGIpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0VbYiszNj4+PlxuMj4+PjBdPS0oNjAqYS5nZXRUaW1lem9uZU9mZnNldCgpKTt2YXIgYz0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCksZD0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDAsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7RVtiKzMyPj4+Mj4+PjBdPShjIT1kJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGQsYykpfDB9LFU6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW5ldyBEYXRlKEVbYSsyMD4+PjI+Pj4wXSsxOTAwLEVbYSsxNj4+PjI+Pj4wXSxFW2ErMTI+Pj4yPj4+MF0sRVthKzg+Pj4yPj4+MF0sRVthKzQ+Pj4yPj4+MF0sRVthPj4+Mj4+PjBdLDApLGM9RVthKzMyPj4+Mj4+PjBdLGQ9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGU9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGc9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGw9TWF0aC5taW4oZyxcbmUpOzA+Yz9FW2ErMzI+Pj4yPj4+MF09TnVtYmVyKGUhPWcmJmw9PWQpOjA8YyE9KGw9PWQpJiYoZT1NYXRoLm1heChnLGUpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/bDplKS1kKSkpO0VbYSsyND4+PjI+Pj4wXT1iLmdldERheSgpO0VbYSsyOD4+PjI+Pj4wXT0oWShiLmdldEZ1bGxZZWFyKCkpP2tiOmxiKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDtFW2E+Pj4yPj4+MF09Yi5nZXRTZWNvbmRzKCk7RVthKzQ+Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7RVthKzg+Pj4yPj4+MF09Yi5nZXRIb3VycygpO0VbYSsxMj4+PjI+Pj4wXT1iLmdldERhdGUoKTtFW2ErMTY+Pj4yPj4+MF09Yi5nZXRNb250aCgpO0VbYSsyMD4+PjI+Pj4wXT1iLmdldFllYXIoKTtyZXR1cm4gQmlnSW50KGIuZ2V0VGltZSgpLzFFMyl9LFE6ZnVuY3Rpb24oKXtyZXR1cm4tNTJ9LFI6ZnVuY3Rpb24oKXt9LEo6ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQobil7cmV0dXJuKG49bi50b1RpbWVTdHJpbmcoKS5tYXRjaCgvXFwoKFtBLVphLXogXSspXFwpJC8pKT9cbm5bMV06XCJHTVRcIn1jPj4+PTA7dmFyIGU9KG5ldyBEYXRlKS5nZXRGdWxsWWVhcigpLGc9bmV3IERhdGUoZSwwLDEpLGw9bmV3IERhdGUoZSw2LDEpO2U9Zy5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBrPWwuZ2V0VGltZXpvbmVPZmZzZXQoKTtHW2E+Pj4wPj4+Mj4+PjBdPTYwKk1hdGgubWF4KGUsayk7RVtiPj4+MD4+PjI+Pj4wXT1OdW1iZXIoZSE9ayk7YT1kKGcpO2I9ZChsKTthPW5iKGEpO2I9bmIoYik7azxlPyhHW2M+Pj4yPj4+MF09YSxHW2MrND4+PjI+Pj4wXT1iKTooR1tjPj4+Mj4+PjBdPWIsR1tjKzQ+Pj4yPj4+MF09YSl9LHQ6KCk9PntrYShcIlwiKX0sQjooKT0+RGF0ZS5ub3coKSxLOmZ1bmN0aW9uKCl7cmV0dXJuIDQyOTQ5MDE3NjB9LG46KCk9PnBlcmZvcm1hbmNlLm5vdygpLFo6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtyZXR1cm4gQi5jb3B5V2l0aGluKGE+Pj4wPj4+MCxiPj4+MCxiKyhjPj4+MCk+Pj4wKX0sSTpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9Qi5sZW5ndGg7XG5pZig0Mjk0OTAxNzYwPGEpcmV0dXJuITE7Zm9yKHZhciBjPTE7ND49YztjKj0yKXt2YXIgZD1iKigxKy4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGU9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7ZT0oZS5taW4uY2FsbChlLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLXouYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXt6Lmdyb3coZSk7cWEoKTt2YXIgZz0xO2JyZWFrIGF9Y2F0Y2gobCl7fWc9dm9pZCAwfWlmKGcpcmV0dXJuITB9cmV0dXJuITF9LFg6ZnVuY3Rpb24oYSxiKXthPj4+PTA7Yj4+Pj0wO3ZhciBjPTA7cWIoKS5mb3JFYWNoKChkLGUpPT57dmFyIGc9YitjO2U9R1thKzQqZT4+PjI+Pj4wXT1nO2ZvcihnPTA7ZzxkLmxlbmd0aDsrK2cpQVtlKys+Pj4wPj4+MF09ZC5jaGFyQ29kZUF0KGcpO0FbZT4+PjA+Pj4wXT0wO2MrPWQubGVuZ3RoKzF9KTtyZXR1cm4gMH0sWTpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9XG5xYigpO0dbYT4+PjI+Pj4wXT1jLmxlbmd0aDt2YXIgZD0wO2MuZm9yRWFjaChlPT5kKz1lLmxlbmd0aCsxKTtHW2I+Pj4yPj4+MF09ZDtyZXR1cm4gMH0sdzooKT0+NTIsejpmdW5jdGlvbigpe3JldHVybiA1Mn0sVzpmdW5jdGlvbigpe3JldHVybiA3MH0seTpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtmb3IodmFyIGU9MCxnPTA7ZzxjO2crKyl7dmFyIGw9R1tiPj4+Mj4+PjBdLGs9R1tiKzQ+Pj4yPj4+MF07Yis9ODtmb3IodmFyIG49MDtuPGs7bisrKXt2YXIgcT1CW2wrbj4+PjBdLHY9cmJbYV07MD09PXF8fDEwPT09cT8oKDE9PT1hP2phOngpKEZhKHYsMCkpLHYubGVuZ3RoPTApOnYucHVzaChxKX1lKz1rfUdbZD4+PjI+Pj4wXT1lO3JldHVybiAwfSxnYTp2YixtOmZ1bmN0aW9uKGEsYixjLGQpe3JldHVybiB2YihhPj4+MCxiPj4+MCxjPj4+MCxkPj4+MCl9fSxaPWZ1bmN0aW9uKCl7dmFyIGE9e2E6eWJ9O0krKztBYShhLGZ1bmN0aW9uKGIpe1o9Yi5pbnN0YW5jZS5leHBvcnRzO1xuWj16YigpO3o9Wi5oYTtxYSgpO3NhLnVuc2hpZnQoWi5pYSk7SS0tOzA9PUkmJihudWxsIT09dWEmJihjbGVhckludGVydmFsKHVhKSx1YT1udWxsKSxKJiYoYj1KLEo9bnVsbCxiKCkpKX0pLmNhdGNoKGJhKTtyZXR1cm57fX0oKTtoLl9PcnRJbml0PShhLGIpPT4oaC5fT3J0SW5pdD1aLmphKShhLGIpO2guX09ydEdldExhc3RFcnJvcj0oYSxiKT0+KGguX09ydEdldExhc3RFcnJvcj1aLmthKShhLGIpO2guX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShhLGIsYyxkLGUsZyxsLGssbixxKT0+KGguX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPVoubGEpKGEsYixjLGQsZSxnLGwsayxuLHEpO2guX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4oaC5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9Wi5tYSkoYSxiKTtoLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGEsYixjKT0+KGguX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1aLm5hKShhLGIsYyk7XG5oLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGEsYixjKT0+KGguX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1aLm9hKShhLGIsYyk7aC5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihoLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Wi5wYSkoYSk7aC5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4oaC5fT3J0Q3JlYXRlU2Vzc2lvbj1aLnFhKShhLGIsYyk7aC5fT3J0UmVsZWFzZVNlc3Npb249YT0+KGguX09ydFJlbGVhc2VTZXNzaW9uPVoucmEpKGEpO2guX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KGguX09ydEdldElucHV0T3V0cHV0Q291bnQ9Wi5zYSkoYSxiLGMpO2guX09ydEdldElucHV0TmFtZT0oYSxiKT0+KGguX09ydEdldElucHV0TmFtZT1aLnRhKShhLGIpO2guX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihoLl9PcnRHZXRPdXRwdXROYW1lPVoudWEpKGEsYik7aC5fT3J0RnJlZT1hPT4oaC5fT3J0RnJlZT1aLnZhKShhKTtcbmguX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxlLGcpPT4oaC5fT3J0Q3JlYXRlVGVuc29yPVoud2EpKGEsYixjLGQsZSxnKTtoLl9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxkLGUpPT4oaC5fT3J0R2V0VGVuc29yRGF0YT1aLnhhKShhLGIsYyxkLGUpO2guX09ydFJlbGVhc2VUZW5zb3I9YT0+KGguX09ydFJlbGVhc2VUZW5zb3I9Wi55YSkoYSk7aC5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZCk9PihoLl9PcnRDcmVhdGVSdW5PcHRpb25zPVouemEpKGEsYixjLGQpO2guX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9PihoLl9PcnRBZGRSdW5Db25maWdFbnRyeT1aLkFhKShhLGIsYyk7aC5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KGguX09ydFJlbGVhc2VSdW5PcHRpb25zPVouQmEpKGEpO2guX09ydENyZWF0ZUJpbmRpbmc9YT0+KGguX09ydENyZWF0ZUJpbmRpbmc9Wi5DYSkoYSk7XG5oLl9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KGguX09ydEJpbmRJbnB1dD1aLkRhKShhLGIsYyk7aC5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9PihoLl9PcnRCaW5kT3V0cHV0PVouRWEpKGEsYixjLGQpO2guX09ydENsZWFyQm91bmRPdXRwdXRzPWE9PihoLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1aLkZhKShhKTtoLl9PcnRSZWxlYXNlQmluZGluZz1hPT4oaC5fT3J0UmVsZWFzZUJpbmRpbmc9Wi5HYSkoYSk7aC5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGQsZSk9PihoLl9PcnRSdW5XaXRoQmluZGluZz1aLkhhKShhLGIsYyxkLGUpO2guX09ydFJ1bj0oYSxiLGMsZCxlLGcsbCxrKT0+KGguX09ydFJ1bj1aLklhKShhLGIsYyxkLGUsZyxsLGspO2guX09ydEVuZFByb2ZpbGluZz1hPT4oaC5fT3J0RW5kUHJvZmlsaW5nPVouSmEpKGEpO1xudmFyIG1iPWguX21hbGxvYz1hPT4obWI9aC5fbWFsbG9jPVouS2EpKGEpLFU9aC5fZnJlZT1hPT4oVT1oLl9mcmVlPVouTGEpKGEpLFphPWE9PihaYT1aLk1hKShhKTtoLl9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3M9KCk9PihoLl9fZW1iaW5kX2luaXRpYWxpemVfYmluZGluZ3M9Wi5OYSkoKTt2YXIgQWI9KCk9PihBYj1aLlBhKSgpLEJiPWE9PihCYj1aLlFhKShhKSxDYj1hPT4oQ2I9Wi5SYSkoYSk7ZnVuY3Rpb24gemIoKXt2YXIgYT1aO2E9T2JqZWN0LmFzc2lnbih7fSxhKTt2YXIgYj1kPT4oKT0+ZCgpPj4+MCxjPWQ9PmU9PmQoZSk+Pj4wO2EuX19lcnJub19sb2NhdGlvbj1iKGEuX19lcnJub19sb2NhdGlvbik7YS5LYT1jKGEuS2EpO2EuTWE9YyhhLk1hKTthLlBhPWIoYS5QYSk7YS5SYT1jKGEuUmEpO3JldHVybiBhfWguc3RhY2tBbGxvYz1DYjtoLnN0YWNrU2F2ZT1BYjtoLnN0YWNrUmVzdG9yZT1CYjtoLlVURjhUb1N0cmluZz1MO1xuaC5zdHJpbmdUb1VURjg9KGEsYixjKT0+TihhLEIsYixjKTtoLmxlbmd0aEJ5dGVzVVRGOD1NO3ZhciBEYjtKPWZ1bmN0aW9uIEViKCl7RGJ8fEZiKCk7RGJ8fChKPUViKX07ZnVuY3Rpb24gRmIoKXtpZighKDA8SSkpe2Zvcig7MDxyYS5sZW5ndGg7KXJhLnNoaWZ0KCkoaCk7aWYoISgwPEl8fERifHwoRGI9ITAsaC5jYWxsZWRSdW49ITAsbGEpKSl7Zm9yKDswPHNhLmxlbmd0aDspc2Euc2hpZnQoKShoKTtmb3IoYWEoaCk7MDx0YS5sZW5ndGg7KXRhLnNoaWZ0KCkoaCl9fX1GYigpO1xuXG5cbiAgcmV0dXJuIG1vZHVsZUFyZy5yZWFkeVxufVxuXG4pO1xufSkoKTtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbTtcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSlcbiAgZGVmaW5lKFtdLCAoKSA9PiBvcnRXYXNtKTtcbiIsICIiLCAiIiwgImV4cG9ydCBjb25zdCBjcHVzID0gdW5kZWZpbmVkOyIsICJcbnZhciBvcnRXYXNtVGhyZWFkZWQgPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuY3VycmVudFNjcmlwdCA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjIDogdW5kZWZpbmVkO1xuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT09ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyID0gX3NjcmlwdERpciB8fCBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxuZnVuY3Rpb24gaCgpe20uYnVmZmVyIT1uLmJ1ZmZlciYmcCgpO3JldHVybiBufWZ1bmN0aW9uIHQoKXttLmJ1ZmZlciE9bi5idWZmZXImJnAoKTtyZXR1cm4gYWF9ZnVuY3Rpb24gdigpe20uYnVmZmVyIT1uLmJ1ZmZlciYmcCgpO3JldHVybiBiYX1mdW5jdGlvbiBjYSgpe20uYnVmZmVyIT1uLmJ1ZmZlciYmcCgpO3JldHVybiBkYX1mdW5jdGlvbiB3KCl7bS5idWZmZXIhPW4uYnVmZmVyJiZwKCk7cmV0dXJuIGVhfWZ1bmN0aW9uIHooKXttLmJ1ZmZlciE9bi5idWZmZXImJnAoKTtyZXR1cm4gZmF9ZnVuY3Rpb24gaGEoKXttLmJ1ZmZlciE9bi5idWZmZXImJnAoKTtyZXR1cm4gaWF9dmFyIEE9bW9kdWxlQXJnLGphLGthO0EucmVhZHk9bmV3IFByb21pc2UoKGEsYik9PntqYT1hO2thPWJ9KTtcbnZhciBsYT1PYmplY3QuYXNzaWduKHt9LEEpLG1hPVwiLi90aGlzLnByb2dyYW1cIixuYT0oYSxiKT0+e3Rocm93IGI7fSxvYT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LEI9XCJmdW5jdGlvblwiPT10eXBlb2YgaW1wb3J0U2NyaXB0cyxEPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSxFPUEuRU5WSVJPTk1FTlRfSVNfUFRIUkVBRHx8ITEsRj1cIlwiO2Z1bmN0aW9uIHBhKGEpe3JldHVybiBBLmxvY2F0ZUZpbGU/QS5sb2NhdGVGaWxlKGEsRik6RithfXZhciBxYSxyYSxzYTtcbmlmKEQpe3ZhciBmcz1yZXF1aXJlKFwiZnNcIiksdGE9cmVxdWlyZShcInBhdGhcIik7Rj1CP3RhLmRpcm5hbWUoRikrXCIvXCI6X19kaXJuYW1lK1wiL1wiO3FhPShiLGMpPT57Yj1iLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpP25ldyBVUkwoYik6dGEubm9ybWFsaXplKGIpO3JldHVybiBmcy5yZWFkRmlsZVN5bmMoYixjP3ZvaWQgMDpcInV0ZjhcIil9O3NhPWI9PntiPXFhKGIsITApO2IuYnVmZmVyfHwoYj1uZXcgVWludDhBcnJheShiKSk7cmV0dXJuIGJ9O3JhPShiLGMsZCxlPSEwKT0+e2I9Yi5zdGFydHNXaXRoKFwiZmlsZTovL1wiKT9uZXcgVVJMKGIpOnRhLm5vcm1hbGl6ZShiKTtmcy5yZWFkRmlsZShiLGU/dm9pZCAwOlwidXRmOFwiLChmLGspPT57Zj9kKGYpOmMoZT9rLmJ1ZmZlcjprKX0pfTshQS50aGlzUHJvZ3JhbSYmMTxwcm9jZXNzLmFyZ3YubGVuZ3RoJiYobWE9cHJvY2Vzcy5hcmd2WzFdLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikpO3Byb2Nlc3MuYXJndi5zbGljZSgyKTtuYT0oYixjKT0+e3Byb2Nlc3MuZXhpdENvZGU9XG5iO3Rocm93IGM7fTtBLmluc3BlY3Q9KCk9PlwiW0Vtc2NyaXB0ZW4gTW9kdWxlIG9iamVjdF1cIjtsZXQgYTt0cnl7YT1yZXF1aXJlKFwid29ya2VyX3RocmVhZHNcIil9Y2F0Y2goYil7dGhyb3cgY29uc29sZS5lcnJvcignVGhlIFwid29ya2VyX3RocmVhZHNcIiBtb2R1bGUgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIG5vZGUuanMgYnVpbGQgLSBwZXJoYXBzIGEgbmV3ZXIgdmVyc2lvbiBpcyBuZWVkZWQ/JyksYjt9Z2xvYmFsLldvcmtlcj1hLldvcmtlcn1lbHNlIGlmKG9hfHxCKUI/Rj1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoRj1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksKHR5cGVvZiBfc2NyaXB0RGlyICE9PSBcInVuZGVmaW5lZFwiICYmIF9zY3JpcHREaXIpJiYoRj1fc2NyaXB0RGlyKSwwIT09Ri5pbmRleE9mKFwiYmxvYjpcIik/Rj1GLnN1YnN0cigwLEYucmVwbGFjZSgvWz8jXS4qLyxcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikrMSk6Rj1cIlwiLER8fChxYT1hPT57dmFyIGI9XG5uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sQiYmKHNhPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiO2Iuc2VuZChudWxsKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYi5yZXNwb25zZSl9KSxyYT0oYSxiLGMpPT57dmFyIGQ9bmV3IFhNTEh0dHBSZXF1ZXN0O2Qub3BlbihcIkdFVFwiLGEsITApO2QucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIjtkLm9ubG9hZD0oKT0+ezIwMD09ZC5zdGF0dXN8fDA9PWQuc3RhdHVzJiZkLnJlc3BvbnNlP2IoZC5yZXNwb25zZSk6YygpfTtkLm9uZXJyb3I9YztkLnNlbmQobnVsbCl9KTtEJiZcInVuZGVmaW5lZFwiPT10eXBlb2YgcGVyZm9ybWFuY2UmJihnbG9iYWwucGVyZm9ybWFuY2U9cmVxdWlyZShcInBlcmZfaG9va3NcIikucGVyZm9ybWFuY2UpO1xudmFyIHVhPWNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksdmE9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO0QmJih1YT0oLi4uYSk9PmZzLndyaXRlU3luYygxLGEuam9pbihcIiBcIikrXCJcXG5cIiksdmE9KC4uLmEpPT5mcy53cml0ZVN5bmMoMixhLmpvaW4oXCIgXCIpK1wiXFxuXCIpKTt2YXIgd2E9dWEsRz12YTtPYmplY3QuYXNzaWduKEEsbGEpO2xhPW51bGw7dmFyIG5vRXhpdFJ1bnRpbWU9ITA7XCJvYmplY3RcIiE9dHlwZW9mIFdlYkFzc2VtYmx5JiZIKFwibm8gbmF0aXZlIHdhc20gc3VwcG9ydCBkZXRlY3RlZFwiKTt2YXIgbSx4YSx5YT0hMSxJLG4sYWEsYmEsZGEsZWEsZmEsemEsSixBYSxpYTtcbmZ1bmN0aW9uIHAoKXt2YXIgYT1tLmJ1ZmZlcjtBLkhFQVA4PW49bmV3IEludDhBcnJheShhKTtBLkhFQVAxNj1iYT1uZXcgSW50MTZBcnJheShhKTtBLkhFQVBVOD1hYT1uZXcgVWludDhBcnJheShhKTtBLkhFQVBVMTY9ZGE9bmV3IFVpbnQxNkFycmF5KGEpO0EuSEVBUDMyPWVhPW5ldyBJbnQzMkFycmF5KGEpO0EuSEVBUFUzMj1mYT1uZXcgVWludDMyQXJyYXkoYSk7QS5IRUFQRjMyPXphPW5ldyBGbG9hdDMyQXJyYXkoYSk7QS5IRUFQRjY0PWlhPW5ldyBGbG9hdDY0QXJyYXkoYSk7QS5IRUFQNjQ9Sj1uZXcgQmlnSW50NjRBcnJheShhKTtBLkhFQVBVNjQ9QWE9bmV3IEJpZ1VpbnQ2NEFycmF5KGEpfXZhciBCYT0xNjc3NzIxNjs1MjQyODgwPD1CYXx8SChcIklOSVRJQUxfTUVNT1JZIHNob3VsZCBiZSBsYXJnZXIgdGhhbiBTVEFDS19TSVpFLCB3YXMgXCIrQmErXCIhIChTVEFDS19TSVpFPTUyNDI4ODApXCIpO1xuaWYoRSltPUEud2FzbU1lbW9yeTtlbHNlIGlmKG09bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDpCYS82NTUzNixtYXhpbXVtOjY1NTM2LHNoYXJlZDohMH0pLCEobS5idWZmZXIgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikpdGhyb3cgRyhcInJlcXVlc3RlZCBhIHNoYXJlZCBXZWJBc3NlbWJseS5NZW1vcnkgYnV0IHRoZSByZXR1cm5lZCBidWZmZXIgaXMgbm90IGEgU2hhcmVkQXJyYXlCdWZmZXIsIGluZGljYXRpbmcgdGhhdCB3aGlsZSB0aGUgYnJvd3NlciBoYXMgU2hhcmVkQXJyYXlCdWZmZXIgaXQgZG9lcyBub3QgaGF2ZSBXZWJBc3NlbWJseSB0aHJlYWRzIHN1cHBvcnQgLSB5b3UgbWF5IG5lZWQgdG8gc2V0IGEgZmxhZ1wiKSxEJiZHKFwiKG9uIG5vZGUgeW91IG1heSBuZWVkOiAtLWV4cGVyaW1lbnRhbC13YXNtLXRocmVhZHMgLS1leHBlcmltZW50YWwtd2FzbS1idWxrLW1lbW9yeSBhbmQvb3IgcmVjZW50IHZlcnNpb24pXCIpLEVycm9yKFwiYmFkIG1lbW9yeVwiKTtcbnAoKTtCYT1tLmJ1ZmZlci5ieXRlTGVuZ3RoO3ZhciBDYT1bXSxEYT1bXSxFYT1bXSxGYT0wO2Z1bmN0aW9uIEdhKCl7cmV0dXJuIG5vRXhpdFJ1bnRpbWV8fDA8RmF9dmFyIEs9MCxIYT1udWxsLEw9bnVsbDtmdW5jdGlvbiBJYSgpe0stLTtpZigwPT1LJiYobnVsbCE9PUhhJiYoY2xlYXJJbnRlcnZhbChIYSksSGE9bnVsbCksTCkpe3ZhciBhPUw7TD1udWxsO2EoKX19ZnVuY3Rpb24gSChhKXthPVwiQWJvcnRlZChcIithK1wiKVwiO0coYSk7eWE9ITA7ST0xO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTtrYShhKTt0aHJvdyBhO31mdW5jdGlvbiBKYShhKXtyZXR1cm4gYS5zdGFydHNXaXRoKFwiZGF0YTphcHBsaWNhdGlvbi9vY3RldC1zdHJlYW07YmFzZTY0LFwiKX12YXIgTTtNPVwib3J0LXdhc20tdGhyZWFkZWQud2FzbVwiO0phKE0pfHwoTT1wYShNKSk7XG5mdW5jdGlvbiBLYShhKXtpZihzYSlyZXR1cm4gc2EoYSk7dGhyb3dcImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkXCI7fWZ1bmN0aW9uIExhKGEpe2lmKG9hfHxCKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIWEuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93XCJmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICdcIithK1wiJ1wiO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+S2EoYSkpO2lmKHJhKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e3JhKGEsZD0+YihuZXcgVWludDhBcnJheShkKSksYyl9KX1yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKT0+S2EoYSkpfVxuZnVuY3Rpb24gTWEoYSxiLGMpe3JldHVybiBMYShhKS50aGVuKGQ9PldlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGQsYikpLnRoZW4oZD0+ZCkudGhlbihjLGQ9PntHKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7SChkKX0pfVxuZnVuY3Rpb24gTmEoYSxiKXt2YXIgYz1NO3JldHVyblwiZnVuY3Rpb25cIiE9dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nfHxKYShjKXx8Yy5zdGFydHNXaXRoKFwiZmlsZTovL1wiKXx8RHx8XCJmdW5jdGlvblwiIT10eXBlb2YgZmV0Y2g/TWEoYyxhLGIpOmZldGNoKGMse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oZD0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcoZCxhKS50aGVuKGIsZnVuY3Rpb24oZSl7Ryhgd2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICR7ZX1gKTtHKFwiZmFsbGluZyBiYWNrIHRvIEFycmF5QnVmZmVyIGluc3RhbnRpYXRpb25cIik7cmV0dXJuIE1hKGMsYSxiKX0pKX1mdW5jdGlvbiBPYShhKXt0aGlzLm5hbWU9XCJFeGl0U3RhdHVzXCI7dGhpcy5tZXNzYWdlPWBQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCR7YX0pYDt0aGlzLnN0YXR1cz1hfVxudmFyIFBhPWE9PnthLnRlcm1pbmF0ZSgpO2Eub25tZXNzYWdlPSgpPT57fX0sUWE9YT0+e2lmKDA9PU8ucWIubGVuZ3RoKXt2YXIgYj1wYShcIm9ydC13YXNtLXRocmVhZGVkLndvcmtlci5qc1wiKTtiPW5ldyBXb3JrZXIoYik7Ty5xYi5wdXNoKGIpO08uSmIoTy5xYlswXSl9Yj1PLnFiLnBvcCgpO2lmKCFiKXJldHVybiA2O08ubmIucHVzaChiKTtPLmpiW2EubWJdPWI7Yi5tYj1hLm1iO3ZhciBjPXtjbWQ6XCJydW5cIixzdGFydF9yb3V0aW5lOmEuTWIsYXJnOmEuRmIscHRocmVhZF9wdHI6YS5tYn07RCYmYi51bnJlZigpO2IucG9zdE1lc3NhZ2UoYyxhLlNiKTtyZXR1cm4gMH0sUmE9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0ZjhcIik6dm9pZCAwLFNhPShhLGIsYyk9PntiPj4+PTA7dmFyIGQ9YitjO2ZvcihjPWI7YVtjXSYmIShjPj1kKTspKytjO2lmKDE2PGMtYiYmYS5idWZmZXImJlJhKXJldHVybiBSYS5kZWNvZGUoYS5idWZmZXIgaW5zdGFuY2VvZlxuU2hhcmVkQXJyYXlCdWZmZXI/YS5zbGljZShiLGMpOmEuc3ViYXJyYXkoYixjKSk7Zm9yKGQ9XCJcIjtiPGM7KXt2YXIgZT1hW2IrK107aWYoZSYxMjgpe3ZhciBmPWFbYisrXSY2MztpZigxOTI9PShlJjIyNCkpZCs9U3RyaW5nLmZyb21DaGFyQ29kZSgoZSYzMSk8PDZ8Zik7ZWxzZXt2YXIgaz1hW2IrK10mNjM7ZT0yMjQ9PShlJjI0MCk/KGUmMTUpPDwxMnxmPDw2fGs6KGUmNyk8PDE4fGY8PDEyfGs8PDZ8YVtiKytdJjYzOzY1NTM2PmU/ZCs9U3RyaW5nLmZyb21DaGFyQ29kZShlKTooZS09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxlPj4xMCw1NjMyMHxlJjEwMjMpKX19ZWxzZSBkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBkfSxUYT0oYSxiKT0+KGE+Pj49MCk/U2EodCgpLGEsYik6XCJcIjtmdW5jdGlvbiBVYShhKXtpZihFKXJldHVybiBQKDAsMSxhKTtJPWE7R2EoKXx8KE8uTmIoKSx5YT0hMCk7bmEoYSxuZXcgT2EoYSkpfVxudmFyIFdhPWE9PntJPWE7aWYoRSl0aHJvdyBWYShhKSxcInVud2luZFwiO1VhKGEpfTtmdW5jdGlvbiBYYSgpe0NhLnVuc2hpZnQoKCk9PntLKys7SWEoKX0pfVxudmFyIE89e3FiOltdLG5iOltdLEViOltdLGpiOnt9LHZiKCl7RT8oTy5yZWNlaXZlT2JqZWN0VHJhbnNmZXI9Ty5MYixPLnRocmVhZEluaXRUTFM9Ty5EYixPLnNldEV4aXRTdGF0dXM9Ty5DYixub0V4aXRSdW50aW1lPSExKTpYYSgpfSxDYjphPT57ST1hfSxWYjpbXCIkdGVybWluYXRlV29ya2VyXCJdLE5iOigpPT57Zm9yKHZhciBhIG9mIE8ubmIpUGEoYSk7Zm9yKGEgb2YgTy5xYilQYShhKTtPLnFiPVtdO08ubmI9W107Ty5qYj1bXX0sQmI6YT0+e3ZhciBiPWEubWI7ZGVsZXRlIE8uamJbYl07Ty5xYi5wdXNoKGEpO08ubmIuc3BsaWNlKE8ubmIuaW5kZXhPZihhKSwxKTthLm1iPTA7WWEoYil9LExiKCl7fSxEYigpe08uRWIuZm9yRWFjaChhPT5hKCkpfSxKYjphPT5uZXcgUHJvbWlzZShiPT57YS5vbm1lc3NhZ2U9Zj0+e2Y9Zi5kYXRhO3ZhciBrPWYuY21kO2lmKGYudGFyZ2V0VGhyZWFkJiZmLnRhcmdldFRocmVhZCE9WmEoKSl7dmFyIGw9Ty5qYltmLnRhcmdldFRocmVhZF07bD9cbmwucG9zdE1lc3NhZ2UoZixmLnRyYW5zZmVyTGlzdCk6RyhgSW50ZXJuYWwgZXJyb3IhIFdvcmtlciBzZW50IGEgbWVzc2FnZSBcIiR7a31cIiB0byB0YXJnZXQgcHRocmVhZCAke2YudGFyZ2V0VGhyZWFkfSwgYnV0IHRoYXQgdGhyZWFkIG5vIGxvbmdlciBleGlzdHMhYCl9ZWxzZSBpZihcImNoZWNrTWFpbGJveFwiPT09aykkYSgpO2Vsc2UgaWYoXCJzcGF3blRocmVhZFwiPT09aylRYShmKTtlbHNlIGlmKFwiY2xlYW51cFRocmVhZFwiPT09aykoZj1PLmpiW2YudGhyZWFkXSl8fEgoKSxPLkJiKGYpO2Vsc2UgaWYoXCJraWxsVGhyZWFkXCI9PT1rKWY9Zi50aHJlYWQsaz1PLmpiW2ZdLGRlbGV0ZSBPLmpiW2ZdLFBhKGspLFlhKGYpLE8ubmIuc3BsaWNlKE8ubmIuaW5kZXhPZihrKSwxKSxrLm1iPTA7ZWxzZSBpZihcImNhbmNlbFRocmVhZFwiPT09aylPLmpiW2YudGhyZWFkXS5wb3N0TWVzc2FnZSh7Y21kOlwiY2FuY2VsXCJ9KTtlbHNlIGlmKFwibG9hZGVkXCI9PT1rKWEubG9hZGVkPSEwLGIoYSk7ZWxzZSBpZihcImFsZXJ0XCI9PT1cbmspYWxlcnQoYFRocmVhZCAke2YudGhyZWFkSWR9OiAke2YudGV4dH1gKTtlbHNlIGlmKFwic2V0aW1tZWRpYXRlXCI9PT1mLnRhcmdldClhLnBvc3RNZXNzYWdlKGYpO2Vsc2UgaWYoXCJjYWxsSGFuZGxlclwiPT09aylBW2YuaGFuZGxlcl0oLi4uZi5hcmdzKTtlbHNlIGsmJkcoYHdvcmtlciBzZW50IGFuIHVua25vd24gY29tbWFuZCAke2t9YCl9O2Eub25lcnJvcj1mPT57RyhgJHtcIndvcmtlciBzZW50IGFuIGVycm9yIVwifSAke2YuZmlsZW5hbWV9OiR7Zi5saW5lbm99OiAke2YubWVzc2FnZX1gKTt0aHJvdyBmO307RCYmKGEub24oXCJtZXNzYWdlXCIsZj0+YS5vbm1lc3NhZ2Uoe2RhdGE6Zn0pKSxhLm9uKFwiZXJyb3JcIixmPT5hLm9uZXJyb3IoZikpKTt2YXIgYz1bXSxkPVtdLGU7Zm9yKGUgb2YgZClBLmhhc093blByb3BlcnR5KGUpJiZjLnB1c2goZSk7YS5wb3N0TWVzc2FnZSh7Y21kOlwibG9hZFwiLGhhbmRsZXJzOmMsdXJsT3JCbG9iOkEubWFpblNjcmlwdFVybE9yQmxvYnx8X3NjcmlwdERpcixcbndhc21NZW1vcnk6bSx3YXNtTW9kdWxlOnhhfSl9KX07QS5QVGhyZWFkPU87dmFyIGFiPWE9Pntmb3IoOzA8YS5sZW5ndGg7KWEuc2hpZnQoKShBKX07QS5lc3RhYmxpc2hTdGFja1NwYWNlPSgpPT57dmFyIGE9WmEoKSxiPXooKVthKzUyPj4+Mj4+PjBdO2E9eigpW2ErNTY+Pj4yPj4+MF07YmIoYixiLWEpO2NiKGIpfTtmdW5jdGlvbiBWYShhKXtpZihFKXJldHVybiBQKDEsMCxhKTtXYShhKX12YXIgZGI9W10sZWI7QS5pbnZva2VFbnRyeVBvaW50PShhLGIpPT57dmFyIGM9ZGJbYV07Y3x8KGE+PWRiLmxlbmd0aCYmKGRiLmxlbmd0aD1hKzEpLGRiW2FdPWM9ZWIuZ2V0KGEpKTthPWMoYik7R2EoKT9PLkNiKGEpOmZiKGEpfTtcbmZ1bmN0aW9uIGdiKGEpe3RoaXMuc2I9YS0yNDt0aGlzLktiPWZ1bmN0aW9uKGIpe3ooKVt0aGlzLnNiKzQ+Pj4yPj4+MF09Yn07dGhpcy54Yj1mdW5jdGlvbihiKXt6KClbdGhpcy5zYis4Pj4+Mj4+PjBdPWJ9O3RoaXMudmI9ZnVuY3Rpb24oYixjKXt0aGlzLndiKCk7dGhpcy5LYihiKTt0aGlzLnhiKGMpfTt0aGlzLndiPWZ1bmN0aW9uKCl7eigpW3RoaXMuc2IrMTY+Pj4yPj4+MF09MH19dmFyIGhiPTAsaWI9MDtmdW5jdGlvbiBqYihhLGIsYyxkKXtyZXR1cm4gRT9QKDIsMSxhLGIsYyxkKTprYihhLGIsYyxkKX1cbmZ1bmN0aW9uIGtiKGEsYixjLGQpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIpcmV0dXJuIEcoXCJDdXJyZW50IGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgU2hhcmVkQXJyYXlCdWZmZXIsIHB0aHJlYWRzIGFyZSBub3QgYXZhaWxhYmxlIVwiKSw2O3ZhciBlPVtdO2lmKEUmJjA9PT1lLmxlbmd0aClyZXR1cm4gamIoYSxiLGMsZCk7YT17TWI6YyxtYjphLEZiOmQsU2I6ZX07cmV0dXJuIEU/KGEuVWI9XCJzcGF3blRocmVhZFwiLHBvc3RNZXNzYWdlKGEsZSksMCk6UWEoYSl9ZnVuY3Rpb24gbGIoYSxiLGMpe3JldHVybiBFP1AoMywxLGEsYixjKTowfWZ1bmN0aW9uIG1iKGEsYil7aWYoRSlyZXR1cm4gUCg0LDEsYSxiKX1cbnZhciBuYj1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0sb2I9KGEsYixjLGQpPT57Yz4+Pj0wO2lmKCEoMDxkKSlyZXR1cm4gMDt2YXIgZT1jO2Q9YytkLTE7Zm9yKHZhciBmPTA7ZjxhLmxlbmd0aDsrK2Ype3ZhciBrPWEuY2hhckNvZGVBdChmKTtpZig1NTI5Njw9ayYmNTczNDM+PWspe3ZhciBsPWEuY2hhckNvZGVBdCgrK2YpO2s9NjU1MzYrKChrJjEwMjMpPDwxMCl8bCYxMDIzfWlmKDEyNz49ayl7aWYoYz49ZClicmVhaztiW2MrKz4+PjBdPWt9ZWxzZXtpZigyMDQ3Pj1rKXtpZihjKzE+PWQpYnJlYWs7YltjKys+Pj4wXT0xOTJ8az4+Nn1lbHNle2lmKDY1NTM1Pj1rKXtpZihjKzI+PWQpYnJlYWs7YltjKys+Pj4wXT0yMjR8az4+MTJ9ZWxzZXtpZihjKzM+PWQpYnJlYWs7YltjKys+Pj4wXT0yNDB8az4+XG4xODtiW2MrKz4+PjBdPTEyOHxrPj4xMiY2M31iW2MrKz4+PjBdPTEyOHxrPj42JjYzfWJbYysrPj4+MF09MTI4fGsmNjN9fWJbYz4+PjBdPTA7cmV0dXJuIGMtZX0scGI9KGEsYixjKT0+b2IoYSx0KCksYixjKTtmdW5jdGlvbiBxYihhLGIpe2lmKEUpcmV0dXJuIFAoNSwxLGEsYil9ZnVuY3Rpb24gcmIoYSxiLGMpe2lmKEUpcmV0dXJuIFAoNiwxLGEsYixjKX1mdW5jdGlvbiBzYihhLGIsYyl7cmV0dXJuIEU/UCg3LDEsYSxiLGMpOjB9ZnVuY3Rpb24gdGIoYSxiKXtpZihFKXJldHVybiBQKDgsMSxhLGIpfWZ1bmN0aW9uIHViKGEsYixjKXtpZihFKXJldHVybiBQKDksMSxhLGIsYyl9ZnVuY3Rpb24gdmIoYSxiLGMsZCl7aWYoRSlyZXR1cm4gUCgxMCwxLGEsYixjLGQpfWZ1bmN0aW9uIHdiKGEsYixjLGQpe2lmKEUpcmV0dXJuIFAoMTEsMSxhLGIsYyxkKX1mdW5jdGlvbiB4YihhLGIsYyxkKXtpZihFKXJldHVybiBQKDEyLDEsYSxiLGMsZCl9XG5mdW5jdGlvbiB5YihhKXtpZihFKXJldHVybiBQKDEzLDEsYSl9ZnVuY3Rpb24gemIoYSxiKXtpZihFKXJldHVybiBQKDE0LDEsYSxiKX1mdW5jdGlvbiBBYihhLGIsYyl7aWYoRSlyZXR1cm4gUCgxNSwxLGEsYixjKX12YXIgQmI9YT0+e2lmKG51bGw9PT1hKXJldHVyblwibnVsbFwiO3ZhciBiPXR5cGVvZiBhO3JldHVyblwib2JqZWN0XCI9PT1ifHxcImFycmF5XCI9PT1ifHxcImZ1bmN0aW9uXCI9PT1iP2EudG9TdHJpbmcoKTpcIlwiK2F9LENiLFI9YT0+e2Zvcih2YXIgYj1cIlwiO3QoKVthPj4+MF07KWIrPUNiW3QoKVthKys+Pj4wXV07cmV0dXJuIGJ9LERiPXt9LEViPXt9LEZiPXt9LFM7XG5mdW5jdGlvbiBHYihhLGIsYz17fSl7dmFyIGQ9Yi5uYW1lO2lmKCFhKXRocm93IG5ldyBTKGB0eXBlIFwiJHtkfVwiIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXJgKTtpZihFYi5oYXNPd25Qcm9wZXJ0eShhKSl7aWYoYy5IYilyZXR1cm47dGhyb3cgbmV3IFMoYENhbm5vdCByZWdpc3RlciB0eXBlICcke2R9JyB0d2ljZWApO31FYlthXT1iO2RlbGV0ZSBGYlthXTtEYi5oYXNPd25Qcm9wZXJ0eShhKSYmKGI9RGJbYV0sZGVsZXRlIERiW2FdLGIuZm9yRWFjaChlPT5lKCkpKX1mdW5jdGlvbiBUKGEsYixjPXt9KXtpZighKFwiYXJnUGFja0FkdmFuY2VcImluIGIpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJyZWdpc3RlclR5cGUgcmVnaXN0ZXJlZEluc3RhbmNlIHJlcXVpcmVzIGFyZ1BhY2tBZHZhbmNlXCIpO0diKGEsYixjKX1cbnZhciBIYj0oYSxiLGMpPT57c3dpdGNoKGIpe2Nhc2UgMTpyZXR1cm4gYz9kPT5oKClbZD4+PjA+Pj4wXTpkPT50KClbZD4+PjA+Pj4wXTtjYXNlIDI6cmV0dXJuIGM/ZD0+digpW2Q+Pj4xPj4+MF06ZD0+Y2EoKVtkPj4+MT4+PjBdO2Nhc2UgNDpyZXR1cm4gYz9kPT53KClbZD4+PjI+Pj4wXTpkPT56KClbZD4+PjI+Pj4wXTtjYXNlIDg6cmV0dXJuIGM/ZD0+SltkPj4+M106ZD0+QWFbZD4+PjNdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke2J9KTogJHthfWApO319O2Z1bmN0aW9uIEliKCl7dGhpcy5sYj1bdm9pZCAwXTt0aGlzLnpiPVtdfXZhciBVPW5ldyBJYjtmdW5jdGlvbiBKYihhKXthPj4+PTA7YT49VS5zYiYmMD09PS0tVS5nZXQoYSkuQWImJlUueGIoYSl9XG52YXIgVj1hPT57aWYoIWEpdGhyb3cgbmV3IFMoXCJDYW5ub3QgdXNlIGRlbGV0ZWQgdmFsLiBoYW5kbGUgPSBcIithKTtyZXR1cm4gVS5nZXQoYSkudmFsdWV9LFc9YT0+e3N3aXRjaChhKXtjYXNlIHZvaWQgMDpyZXR1cm4gMTtjYXNlIG51bGw6cmV0dXJuIDI7Y2FzZSAhMDpyZXR1cm4gMztjYXNlICExOnJldHVybiA0O2RlZmF1bHQ6cmV0dXJuIFUud2Ioe0FiOjEsdmFsdWU6YX0pfX07ZnVuY3Rpb24gS2IoYSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKHcoKVthPj4+Mj4+PjBdKX1cbnZhciBMYj0oYSxiKT0+e3N3aXRjaChiKXtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKGMpe3ZhciBkPXRoaXMuZnJvbVdpcmVUeXBlO20uYnVmZmVyIT1uLmJ1ZmZlciYmcCgpO3JldHVybiBkLmNhbGwodGhpcyx6YVtjPj4+Mj4+PjBdKX07Y2FzZSA4OnJldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUoaGEoKVtjPj4+Mz4+PjBdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke2J9KTogJHthfWApO319O2Z1bmN0aW9uIE1iKGEpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZSh6KClbYT4+PjI+Pj4wXSl9XG52YXIgTmI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0Zi0xNmxlXCIpOnZvaWQgMCxPYj0oYSxiKT0+e3ZhciBjPWE+PjE7Zm9yKHZhciBkPWMrYi8yOyEoYz49ZCkmJmNhKClbYz4+PjBdOykrK2M7Yzw8PTE7aWYoMzI8Yy1hJiZOYilyZXR1cm4gTmIuZGVjb2RlKHQoKS5zbGljZShhLGMpKTtjPVwiXCI7Zm9yKGQ9MDshKGQ+PWIvMik7KytkKXt2YXIgZT12KClbYSsyKmQ+Pj4xPj4+MF07aWYoMD09ZSlicmVhaztjKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGUpfXJldHVybiBjfSxQYj0oYSxiLGMpPT57dm9pZCAwPT09YyYmKGM9MjE0NzQ4MzY0Nyk7aWYoMj5jKXJldHVybiAwO2MtPTI7dmFyIGQ9YjtjPWM8MiphLmxlbmd0aD9jLzI6YS5sZW5ndGg7Zm9yKHZhciBlPTA7ZTxjOysrZSl7dmFyIGY9YS5jaGFyQ29kZUF0KGUpO3YoKVtiPj4+MT4+PjBdPWY7Yis9Mn12KClbYj4+PjE+Pj4wXT0wO3JldHVybiBiLWR9LFFiPWE9PjIqYS5sZW5ndGgsXG5SYj0oYSxiKT0+e2Zvcih2YXIgYz0wLGQ9XCJcIjshKGM+PWIvNCk7KXt2YXIgZT13KClbYSs0KmM+Pj4yPj4+MF07aWYoMD09ZSlicmVhazsrK2M7NjU1MzY8PWU/KGUtPTY1NTM2LGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8ZT4+MTAsNTYzMjB8ZSYxMDIzKSk6ZCs9U3RyaW5nLmZyb21DaGFyQ29kZShlKX1yZXR1cm4gZH0sU2I9KGEsYixjKT0+e2I+Pj49MDt2b2lkIDA9PT1jJiYoYz0yMTQ3NDgzNjQ3KTtpZig0PmMpcmV0dXJuIDA7dmFyIGQ9YjtjPWQrYy00O2Zvcih2YXIgZT0wO2U8YS5sZW5ndGg7KytlKXt2YXIgZj1hLmNoYXJDb2RlQXQoZSk7aWYoNTUyOTY8PWYmJjU3MzQzPj1mKXt2YXIgaz1hLmNoYXJDb2RlQXQoKytlKTtmPTY1NTM2KygoZiYxMDIzKTw8MTApfGsmMTAyM313KClbYj4+PjI+Pj4wXT1mO2IrPTQ7aWYoYis0PmMpYnJlYWt9dygpW2I+Pj4yPj4+MF09MDtyZXR1cm4gYi1kfSxUYj1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1cbmEuY2hhckNvZGVBdChjKTs1NTI5Njw9ZCYmNTczNDM+PWQmJisrYztiKz00fXJldHVybiBifSxVYj1hPT57aWYoIXlhKXRyeXtpZihhKCksIUdhKCkpdHJ5e0U/ZmIoSSk6V2EoSSl9Y2F0Y2goYil7YiBpbnN0YW5jZW9mIE9hfHxcInVud2luZFwiPT1ifHxuYSgxLGIpfX1jYXRjaChiKXtiIGluc3RhbmNlb2YgT2F8fFwidW53aW5kXCI9PWJ8fG5hKDEsYil9fTtmdW5jdGlvbiBWYihhKXthPj4+PTA7XCJmdW5jdGlvblwiPT09dHlwZW9mIEF0b21pY3MuVGImJihBdG9taWNzLlRiKHcoKSxhPj4+MixhKS52YWx1ZS50aGVuKCRhKSxhKz0xMjgsQXRvbWljcy5zdG9yZSh3KCksYT4+PjIsMSkpfUEuX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0PVZiO3ZhciAkYT0oKT0+e3ZhciBhPVphKCk7YSYmKFZiKGEpLFViKCgpPT5XYigpKSl9O0EuY2hlY2tNYWlsYm94PSRhO3ZhciBZYj1hPT57dmFyIGI9WGIoKTthPWEoKTtjYihiKTtyZXR1cm4gYX07XG5mdW5jdGlvbiBQKGEsYil7dmFyIGM9YXJndW1lbnRzLmxlbmd0aC0yLGQ9YXJndW1lbnRzO3JldHVybiBZYigoKT0+e2Zvcih2YXIgZT0yKmMsZj1aYig4KmUpLGs9Zj4+PjMsbD0wO2w8YztsKyspe3ZhciBxPWRbMitsXTtcImJpZ2ludFwiPT10eXBlb2YgcT8oSltrKzIqbF09MW4sSltrKzIqbCsxXT1xKTooSltrKzIqbF09MG4saGEoKVtrKzIqbCsxPj4+MF09cSl9cmV0dXJuICRiKGEsZSxmLGIpfSl9XG52YXIgYWM9W10sY2M9KGEsYik9Pnt2YXIgYz1FYlthXTtpZih2b2lkIDA9PT1jKXRocm93IGE9YmMoYSksYz1SKGEpLFgoYSksbmV3IFMoYitcIiBoYXMgdW5rbm93biB0eXBlIFwiK2MpO3JldHVybiBjfSxkYz17fSxlYz1hPT57dmFyIGI9ZGNbYV07cmV0dXJuIHZvaWQgMD09PWI/UihhKTpifSxmYz1bXSxnYz0oKT0+XCJvYmplY3RcIj09dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczpGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCksaGM9YT0+e3ZhciBiPWZjLmxlbmd0aDtmYy5wdXNoKGEpO3JldHVybiBifSxpYz0oYSxiKT0+e2Zvcih2YXIgYz1BcnJheShhKSxkPTA7ZDxhOysrZCljW2RdPWNjKHooKVtiKzQqZD4+PjI+Pj4wXSxcInBhcmFtZXRlciBcIitkKTtyZXR1cm4gY30samM9YT0+e2lmKHZvaWQgMD09PWEpcmV0dXJuXCJfdW5rbm93blwiO2E9YS5yZXBsYWNlKC9bXmEtekEtWjAtOV9dL2csXCIkXCIpO3ZhciBiPWEuY2hhckNvZGVBdCgwKTtyZXR1cm4gNDg8PWImJjU3Pj1iP2BfJHthfWA6XG5hfSxsYz17fTtmdW5jdGlvbiBtYyhhLGIpe2E9amMoYSk7cmV0dXJue1thXTpmdW5jdGlvbigpe3JldHVybiBiLmFwcGx5KHRoaXMsYXJndW1lbnRzKX19W2FdfWZ1bmN0aW9uIG5jKGEpe3ZhciBiPUZ1bmN0aW9uO2lmKCEoYiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSl0aHJvdyBuZXcgVHlwZUVycm9yKGBuZXdfIGNhbGxlZCB3aXRoIGNvbnN0cnVjdG9yIHR5cGUgJHt0eXBlb2YgYn0gd2hpY2ggaXMgbm90IGEgZnVuY3Rpb25gKTt2YXIgYz1tYyhiLm5hbWV8fFwidW5rbm93bkZ1bmN0aW9uTmFtZVwiLGZ1bmN0aW9uKCl7fSk7Yy5wcm90b3R5cGU9Yi5wcm90b3R5cGU7Yz1uZXcgYzthPWIuYXBwbHkoYyxhKTtyZXR1cm4gYSBpbnN0YW5jZW9mIE9iamVjdD9hOmN9XG52YXIgb2M9YT0+e2Zvcih2YXIgYj1cIlwiLGM9MDtjPGE7KytjKWIrPSgwIT09Yz9cIiwgXCI6XCJcIikrXCJhcmdcIitjO3ZhciBkPVwicmV0dXJuIGZ1bmN0aW9uIGVtdmFsX2FsbG9jYXRvcl9cIithK1wiKGNvbnN0cnVjdG9yLCBhcmdUeXBlcywgYXJncykge1xcbiAgdmFyIEhFQVBVMzIgPSBnZXRNZW1vcnkoKTtcXG5cIjtmb3IoYz0wO2M8YTsrK2MpZCs9XCJ2YXIgYXJnVHlwZVwiK2MrXCIgPSByZXF1aXJlUmVnaXN0ZXJlZFR5cGUoSEVBUFUzMlsoKGFyZ1R5cGVzKT4+PjIpXSwgJ3BhcmFtZXRlciBcIitjK1wiJyk7XFxudmFyIGFyZ1wiK2MrXCIgPSBhcmdUeXBlXCIrYytcIi5yZWFkVmFsdWVGcm9tUG9pbnRlcihhcmdzKTtcXG5hcmdzICs9IGFyZ1R5cGVcIitjK1wiWydhcmdQYWNrQWR2YW5jZSddO1xcbmFyZ1R5cGVzICs9IDQ7XFxuXCI7cmV0dXJuKG5ldyBGdW5jdGlvbihcInJlcXVpcmVSZWdpc3RlcmVkVHlwZVwiLFwiTW9kdWxlXCIsXCJ2YWx1ZVRvSGFuZGxlXCIsXCJnZXRNZW1vcnlcIixkKyhcInZhciBvYmogPSBuZXcgY29uc3RydWN0b3IoXCIrXG5iK1wiKTtcXG5yZXR1cm4gdmFsdWVUb0hhbmRsZShvYmopO1xcbn1cXG5cIikpKShjYyxBLFcsKCk9PnooKSl9LHBjPXt9LFk9YT0+MD09PWElNCYmKDAhPT1hJTEwMHx8MD09PWElNDAwKSxxYz1bMCwzMSw2MCw5MSwxMjEsMTUyLDE4MiwyMTMsMjQ0LDI3NCwzMDUsMzM1XSxyYz1bMCwzMSw1OSw5MCwxMjAsMTUxLDE4MSwyMTIsMjQzLDI3MywzMDQsMzM0XTtmdW5jdGlvbiBzYyhhLGIsYyxkLGUsZixrKXtyZXR1cm4gRT9QKDE2LDEsYSxiLGMsZCxlLGYsayk6LTUyfWZ1bmN0aW9uIHRjKGEsYixjLGQsZSxmKXtpZihFKXJldHVybiBQKDE3LDEsYSxiLGMsZCxlLGYpfVxudmFyIHZjPWE9Pnt2YXIgYj1uYihhKSsxLGM9dWMoYik7YyYmcGIoYSxjLGIpO3JldHVybiBjfSx3Yz17fSx5Yz0oKT0+e2lmKCF4Yyl7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86bWF8fFwiLi90aGlzLnByb2dyYW1cIn0sYjtmb3IoYiBpbiB3Yyl2b2lkIDA9PT13Y1tiXT9kZWxldGUgYVtiXTphW2JdPXdjW2JdO3ZhciBjPVtdO2ZvcihiIGluIGEpYy5wdXNoKGAke2J9PSR7YVtiXX1gKTt4Yz1jfXJldHVybiB4Y30seGM7XG5mdW5jdGlvbiB6YyhhLGIpe2lmKEUpcmV0dXJuIFAoMTgsMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9MDt5YygpLmZvckVhY2goKGQsZSk9Pnt2YXIgZj1iK2M7ZT16KClbYSs0KmU+Pj4yPj4+MF09Zjtmb3IoZj0wO2Y8ZC5sZW5ndGg7KytmKWgoKVtlKys+Pj4wPj4+MF09ZC5jaGFyQ29kZUF0KGYpO2goKVtlPj4+MD4+PjBdPTA7Yys9ZC5sZW5ndGgrMX0pO3JldHVybiAwfWZ1bmN0aW9uIEFjKGEsYil7aWYoRSlyZXR1cm4gUCgxOSwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz15YygpO3ooKVthPj4+Mj4+PjBdPWMubGVuZ3RoO3ZhciBkPTA7Yy5mb3JFYWNoKGU9PmQrPWUubGVuZ3RoKzEpO3ooKVtiPj4+Mj4+PjBdPWQ7cmV0dXJuIDB9ZnVuY3Rpb24gQmMoYSl7cmV0dXJuIEU/UCgyMCwxLGEpOjUyfWZ1bmN0aW9uIENjKGEsYixjLGQpe3JldHVybiBFP1AoMjEsMSxhLGIsYyxkKTo1Mn1cbmZ1bmN0aW9uIERjKGEsYixjLGQpe3JldHVybiBFP1AoMjIsMSxhLGIsYyxkKTo3MH12YXIgRWM9W251bGwsW10sW11dO2Z1bmN0aW9uIEZjKGEsYixjLGQpe2lmKEUpcmV0dXJuIFAoMjMsMSxhLGIsYyxkKTtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtmb3IodmFyIGU9MCxmPTA7ZjxjO2YrKyl7dmFyIGs9eigpW2I+Pj4yPj4+MF0sbD16KClbYis0Pj4+Mj4+PjBdO2IrPTg7Zm9yKHZhciBxPTA7cTxsO3ErKyl7dmFyIHI9dCgpW2srcT4+PjBdLHg9RWNbYV07MD09PXJ8fDEwPT09cj8oKDE9PT1hP3dhOkcpKFNhKHgsMCkpLHgubGVuZ3RoPTApOngucHVzaChyKX1lKz1sfXooKVtkPj4+Mj4+PjBdPWU7cmV0dXJuIDB9dmFyIEdjPVszMSwyOSwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV0sSGM9WzMxLDI4LDMxLDMwLDMxLDMwLDMxLDMxLDMwLDMxLDMwLDMxXTtmdW5jdGlvbiBJYyhhKXt2YXIgYj1BcnJheShuYihhKSsxKTtvYihhLGIsMCxiLmxlbmd0aCk7cmV0dXJuIGJ9XG52YXIgSmM9KGEsYik9PntoKCkuc2V0KGEsYj4+PjApfTtcbmZ1bmN0aW9uIEtjKGEsYixjLGQpe2Z1bmN0aW9uIGUoZyx1LHkpe2ZvcihnPVwibnVtYmVyXCI9PXR5cGVvZiBnP2cudG9TdHJpbmcoKTpnfHxcIlwiO2cubGVuZ3RoPHU7KWc9eVswXStnO3JldHVybiBnfWZ1bmN0aW9uIGYoZyx1KXtyZXR1cm4gZShnLHUsXCIwXCIpfWZ1bmN0aW9uIGsoZyx1KXtmdW5jdGlvbiB5KGtjKXtyZXR1cm4gMD5rYz8tMTowPGtjPzE6MH12YXIgUTswPT09KFE9eShnLmdldEZ1bGxZZWFyKCktdS5nZXRGdWxsWWVhcigpKSkmJjA9PT0oUT15KGcuZ2V0TW9udGgoKS11LmdldE1vbnRoKCkpKSYmKFE9eShnLmdldERhdGUoKS11LmdldERhdGUoKSkpO3JldHVybiBRfWZ1bmN0aW9uIGwoZyl7c3dpdGNoKGcuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZy5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZztjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGcuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZy5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGcuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZy5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZy5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBxKGcpe3ZhciB1PWcub2I7Zm9yKGc9bmV3IERhdGUoKG5ldyBEYXRlKGcucGIrMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8dTspe3ZhciB5PWcuZ2V0TW9udGgoKSxRPShZKGcuZ2V0RnVsbFllYXIoKSk/R2M6SGMpW3ldO2lmKHU+US1nLmdldERhdGUoKSl1LT1RLWcuZ2V0RGF0ZSgpKzEsZy5zZXREYXRlKDEpLDExPnk/Zy5zZXRNb250aCh5KzEpOihnLnNldE1vbnRoKDApLGcuc2V0RnVsbFllYXIoZy5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2cuc2V0RGF0ZShnLmdldERhdGUoKSt1KTticmVha319eT1uZXcgRGF0ZShnLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3U9bChuZXcgRGF0ZShnLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt5PWwoeSk7cmV0dXJuIDA+PWsodSxnKT8wPj1rKHksZyk/Zy5nZXRGdWxsWWVhcigpKzE6Zy5nZXRGdWxsWWVhcigpOmcuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgcj16KClbZCs0MD4+PjI+Pj4wXTtkPXtRYjp3KClbZD4+PjI+Pj4wXSxQYjp3KClbZCs0Pj4+Mj4+PjBdLHRiOncoKVtkKzg+Pj4yPj4+MF0seWI6dygpW2QrMTI+Pj4yPj4+MF0sdWI6dygpW2QrMTY+Pj4yPj4+MF0scGI6dygpW2QrMjA+Pj4yPj4+MF0sa2I6dygpW2QrMjQ+Pj4yPj4+MF0sb2I6dygpW2QrMjg+Pj4yPj4+MF0sV2I6dygpW2QrMzI+Pj4yPj4+MF0sT2I6dygpW2QrMzY+Pj4yPj4+MF0sUmI6cj9UYShyKTpcIlwifTtjPVRhKGMpO3I9e1wiJWNcIjpcIiVhICViICVkICVIOiVNOiVTICVZXCIsXCIlRFwiOlwiJW0vJWQvJXlcIixcIiVGXCI6XCIlWS0lbS0lZFwiLFwiJWhcIjpcIiViXCIsXCIlclwiOlwiJUk6JU06JVMgJXBcIixcIiVSXCI6XCIlSDolTVwiLFwiJVRcIjpcIiVIOiVNOiVTXCIsXCIleFwiOlwiJW0vJWQvJXlcIixcblwiJVhcIjpcIiVIOiVNOiVTXCIsXCIlRWNcIjpcIiVjXCIsXCIlRUNcIjpcIiVDXCIsXCIlRXhcIjpcIiVtLyVkLyV5XCIsXCIlRVhcIjpcIiVIOiVNOiVTXCIsXCIlRXlcIjpcIiV5XCIsXCIlRVlcIjpcIiVZXCIsXCIlT2RcIjpcIiVkXCIsXCIlT2VcIjpcIiVlXCIsXCIlT0hcIjpcIiVIXCIsXCIlT0lcIjpcIiVJXCIsXCIlT21cIjpcIiVtXCIsXCIlT01cIjpcIiVNXCIsXCIlT1NcIjpcIiVTXCIsXCIlT3VcIjpcIiV1XCIsXCIlT1VcIjpcIiVVXCIsXCIlT1ZcIjpcIiVWXCIsXCIlT3dcIjpcIiV3XCIsXCIlT1dcIjpcIiVXXCIsXCIlT3lcIjpcIiV5XCJ9O2Zvcih2YXIgeCBpbiByKWM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeCxcImdcIiksclt4XSk7dmFyIEM9XCJTdW5kYXkgTW9uZGF5IFR1ZXNkYXkgV2VkbmVzZGF5IFRodXJzZGF5IEZyaWRheSBTYXR1cmRheVwiLnNwbGl0KFwiIFwiKSxOPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTtyPXtcIiVhXCI6Zz0+Q1tnLmtiXS5zdWJzdHJpbmcoMCwzKSxcIiVBXCI6Zz0+XG5DW2cua2JdLFwiJWJcIjpnPT5OW2cudWJdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpnPT5OW2cudWJdLFwiJUNcIjpnPT5mKChnLnBiKzE5MDApLzEwMHwwLDIpLFwiJWRcIjpnPT5mKGcueWIsMiksXCIlZVwiOmc9PmUoZy55YiwyLFwiIFwiKSxcIiVnXCI6Zz0+cShnKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcIiVHXCI6Zz0+cShnKSxcIiVIXCI6Zz0+ZihnLnRiLDIpLFwiJUlcIjpnPT57Zz1nLnRiOzA9PWc/Zz0xMjoxMjxnJiYoZy09MTIpO3JldHVybiBmKGcsMil9LFwiJWpcIjpnPT57Zm9yKHZhciB1PTAseT0wO3k8PWcudWItMTt1Kz0oWShnLnBiKzE5MDApP0djOkhjKVt5KytdKTtyZXR1cm4gZihnLnliK3UsMyl9LFwiJW1cIjpnPT5mKGcudWIrMSwyKSxcIiVNXCI6Zz0+ZihnLlBiLDIpLFwiJW5cIjooKT0+XCJcXG5cIixcIiVwXCI6Zz0+MDw9Zy50YiYmMTI+Zy50Yj9cIkFNXCI6XCJQTVwiLFwiJVNcIjpnPT5mKGcuUWIsMiksXCIldFwiOigpPT5cIlxcdFwiLFwiJXVcIjpnPT5nLmtifHw3LFwiJVVcIjpnPT5mKE1hdGguZmxvb3IoKGcub2IrNy1nLmtiKS9cbjcpLDIpLFwiJVZcIjpnPT57dmFyIHU9TWF0aC5mbG9vcigoZy5vYis3LShnLmtiKzYpJTcpLzcpOzI+PShnLmtiKzM3MS1nLm9iLTIpJTcmJnUrKztpZih1KTUzPT11JiYoeT0oZy5rYiszNzEtZy5vYiklNyw0PT15fHwzPT15JiZZKGcucGIpfHwodT0xKSk7ZWxzZXt1PTUyO3ZhciB5PShnLmtiKzctZy5vYi0xKSU3Oyg0PT15fHw1PT15JiZZKGcucGIlNDAwLTEpKSYmdSsrfXJldHVybiBmKHUsMil9LFwiJXdcIjpnPT5nLmtiLFwiJVdcIjpnPT5mKE1hdGguZmxvb3IoKGcub2IrNy0oZy5rYis2KSU3KS83KSwyKSxcIiV5XCI6Zz0+KGcucGIrMTkwMCkudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlWVwiOmc9PmcucGIrMTkwMCxcIiV6XCI6Zz0+e2c9Zy5PYjt2YXIgdT0wPD1nO2c9TWF0aC5hYnMoZykvNjA7cmV0dXJuKHU/XCIrXCI6XCItXCIpK1N0cmluZyhcIjAwMDBcIisoZy82MCoxMDArZyU2MCkpLnNsaWNlKC00KX0sXCIlWlwiOmc9PmcuUmIsXCIlJVwiOigpPT5cIiVcIn07Yz1jLnJlcGxhY2UoLyUlL2csXCJcXHgwMFxceDAwXCIpO1xuZm9yKHggaW4gciljLmluY2x1ZGVzKHgpJiYoYz1jLnJlcGxhY2UobmV3IFJlZ0V4cCh4LFwiZ1wiKSxyW3hdKGQpKSk7Yz1jLnJlcGxhY2UoL1xcMFxcMC9nLFwiJVwiKTt4PUljKGMpO2lmKHgubGVuZ3RoPmIpcmV0dXJuIDA7SmMoeCxhKTtyZXR1cm4geC5sZW5ndGgtMX1PLnZiKCk7Zm9yKHZhciBMYz1BcnJheSgyNTYpLE1jPTA7MjU2Pk1jOysrTWMpTGNbTWNdPVN0cmluZy5mcm9tQ2hhckNvZGUoTWMpO0NiPUxjO1M9QS5CaW5kaW5nRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihhKXtzdXBlcihhKTt0aGlzLm5hbWU9XCJCaW5kaW5nRXJyb3JcIn19O0EuSW50ZXJuYWxFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKGEpe3N1cGVyKGEpO3RoaXMubmFtZT1cIkludGVybmFsRXJyb3JcIn19O1xuT2JqZWN0LmFzc2lnbihJYi5wcm90b3R5cGUse2dldChhKXtyZXR1cm4gdGhpcy5sYlthXX0saGFzKGEpe3JldHVybiB2b2lkIDAhPT10aGlzLmxiW2FdfSx3YihhKXt2YXIgYj10aGlzLnpiLnBvcCgpfHx0aGlzLmxiLmxlbmd0aDt0aGlzLmxiW2JdPWE7cmV0dXJuIGJ9LHhiKGEpe3RoaXMubGJbYV09dm9pZCAwO3RoaXMuemIucHVzaChhKX19KTtVLmxiLnB1c2goe3ZhbHVlOnZvaWQgMH0se3ZhbHVlOm51bGx9LHt2YWx1ZTohMH0se3ZhbHVlOiExfSk7VS5zYj1VLmxiLmxlbmd0aDtBLmNvdW50X2VtdmFsX2hhbmRsZXM9KCk9Pntmb3IodmFyIGE9MCxiPVUuc2I7YjxVLmxiLmxlbmd0aDsrK2Ipdm9pZCAwIT09VS5sYltiXSYmKythO3JldHVybiBhfTtcbnZhciBOYz1bVWEsVmEsamIsbGIsbWIscWIscmIsc2IsdGIsdWIsdmIsd2IseGIseWIsemIsQWIsc2MsdGMsemMsQWMsQmMsQ2MsRGMsRmNdLFBjPXtiOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7KG5ldyBnYihhKSkudmIoYj4+PjAsYz4+PjApO2hiPWE7aWIrKzt0aHJvdyBoYjt9LGVhOmZ1bmN0aW9uKGEpe09jKGE+Pj4wLCFCLDEsIW9hLDEzMTA3MiwhMSk7Ty5EYigpfSxEOmZ1bmN0aW9uKGEpe2E+Pj49MDtFP3Bvc3RNZXNzYWdlKHtjbWQ6XCJjbGVhbnVwVGhyZWFkXCIsdGhyZWFkOmF9KTooKGE9Ty5qYlthXSl8fEgoKSxPLkJiKGEpKX0sVzprYix5OmxiLGthOm1iLFM6cWIsVTpyYixMOnNiLGlhOnRiLGJhOnViLGhhOnZiLEY6d2IsVDp4YixROnliLGphOnpiLFI6QWIsSTpmdW5jdGlvbihhLGIsYyxkLGUpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO2I9UihiKTt2YXIgZj0tMSE9Yi5pbmRleE9mKFwidVwiKTtmJiYoZT0oMW48PDY0biktMW4pO1QoYSx7bmFtZTpiLGZyb21XaXJlVHlwZTprPT5cbmssdG9XaXJlVHlwZTpmdW5jdGlvbihrLGwpe2lmKFwiYmlnaW50XCIhPXR5cGVvZiBsJiZcIm51bWJlclwiIT10eXBlb2YgbCl0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3QgY29udmVydCBcIiR7QmIobCl9XCIgdG8gJHt0aGlzLm5hbWV9YCk7aWYobDxkfHxsPmUpdGhyb3cgbmV3IFR5cGVFcnJvcihgUGFzc2luZyBhIG51bWJlciBcIiR7QmIobCl9XCIgZnJvbSBKUyBzaWRlIHRvIEMvQysrIHNpZGUgdG8gYW4gYXJndW1lbnQgb2YgdHlwZSBcIiR7Yn1cIiwgd2hpY2ggaXMgb3V0c2lkZSB0aGUgdmFsaWQgcmFuZ2UgWyR7ZH0sICR7ZX1dIWApO3JldHVybiBsfSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOkhiKGIsYywhZikscmI6bnVsbH0pfSxxYTpmdW5jdGlvbihhLGIsYyxkKXthPj4+PTA7Yj1SKGI+Pj4wKTtUKGEse25hbWU6Yixmcm9tV2lyZVR5cGU6ZnVuY3Rpb24oZSl7cmV0dXJuISFlfSx0b1dpcmVUeXBlOmZ1bmN0aW9uKGUsZil7cmV0dXJuIGY/YzpkfSxhcmdQYWNrQWR2YW5jZTo4LFxucmVhZFZhbHVlRnJvbVBvaW50ZXI6ZnVuY3Rpb24oZSl7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKHQoKVtlPj4+MF0pfSxyYjpudWxsfSl9LHBhOmZ1bmN0aW9uKGEsYil7YT4+Pj0wO2I9UihiPj4+MCk7VChhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmM9Pnt2YXIgZD1WKGMpO0piKGMpO3JldHVybiBkfSx0b1dpcmVUeXBlOihjLGQpPT5XKGQpLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6S2IscmI6bnVsbH0pfSxIOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yz4+Pj0wO2I9UihiPj4+MCk7VChhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmQ9PmQsdG9XaXJlVHlwZTooZCxlKT0+ZSxhcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOkxiKGIsYykscmI6bnVsbH0pfSx0OmZ1bmN0aW9uKGEsYixjLGQsZSl7YT4+Pj0wO2M+Pj49MDtiPVIoYj4+PjApOy0xPT09ZSYmKGU9NDI5NDk2NzI5NSk7ZT1sPT5sO2lmKDA9PT1kKXt2YXIgZj0zMi04KmM7ZT1sPT5cbmw8PGY+Pj5mfXZhciBrPWIuaW5jbHVkZXMoXCJ1bnNpZ25lZFwiKT9mdW5jdGlvbihsLHEpe3JldHVybiBxPj4+MH06ZnVuY3Rpb24obCxxKXtyZXR1cm4gcX07VChhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmUsdG9XaXJlVHlwZTprLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6SGIoYixjLDAhPT1kKSxyYjpudWxsfSl9LG06ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoZil7dmFyIGs9eigpW2Y+Pj4yPj4+MF07Zj16KClbZis0Pj4+Mj4+PjBdO3JldHVybiBuZXcgZShoKCkuYnVmZmVyLGYsayl9YT4+Pj0wO3ZhciBlPVtJbnQ4QXJyYXksVWludDhBcnJheSxJbnQxNkFycmF5LFVpbnQxNkFycmF5LEludDMyQXJyYXksVWludDMyQXJyYXksRmxvYXQzMkFycmF5LEZsb2F0NjRBcnJheSxCaWdJbnQ2NEFycmF5LEJpZ1VpbnQ2NEFycmF5XVtiXTtjPVIoYz4+PjApO1QoYSx7bmFtZTpjLGZyb21XaXJlVHlwZTpkLGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZH0sXG57SGI6ITB9KX0sSjpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPVIoYj4+PjApO3ZhciBjPVwic3RkOjpzdHJpbmdcIj09PWI7VChhLHtuYW1lOmIsZnJvbVdpcmVUeXBlOmZ1bmN0aW9uKGQpe3ZhciBlPXooKVtkPj4+Mj4+PjBdLGY9ZCs0O2lmKGMpZm9yKHZhciBrPWYsbD0wO2w8PWU7KytsKXt2YXIgcT1mK2w7aWYobD09ZXx8MD09dCgpW3E+Pj4wXSl7az1UYShrLHEtayk7aWYodm9pZCAwPT09cil2YXIgcj1rO2Vsc2Ugcis9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSxyKz1rO2s9cSsxfX1lbHNle3I9QXJyYXkoZSk7Zm9yKGw9MDtsPGU7KytsKXJbbF09U3RyaW5nLmZyb21DaGFyQ29kZSh0KClbZitsPj4+MF0pO3I9ci5qb2luKFwiXCIpfVgoZCk7cmV0dXJuIHJ9LHRvV2lyZVR5cGU6ZnVuY3Rpb24oZCxlKXtlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXImJihlPW5ldyBVaW50OEFycmF5KGUpKTt2YXIgZj1cInN0cmluZ1wiPT10eXBlb2YgZTtpZighKGZ8fGUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHxcbmUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8ZSBpbnN0YW5jZW9mIEludDhBcnJheSkpdGhyb3cgbmV3IFMoXCJDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIHN0ZDo6c3RyaW5nXCIpO3ZhciBrPWMmJmY/bmIoZSk6ZS5sZW5ndGg7dmFyIGw9dWMoNCtrKzEpLHE9bCs0O3ooKVtsPj4+Mj4+PjBdPWs7aWYoYyYmZilwYihlLHEsaysxKTtlbHNlIGlmKGYpZm9yKGY9MDtmPGs7KytmKXt2YXIgcj1lLmNoYXJDb2RlQXQoZik7aWYoMjU1PHIpdGhyb3cgWChxKSxuZXcgUyhcIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0c1wiKTt0KClbcStmPj4+MF09cn1lbHNlIGZvcihmPTA7ZjxrOysrZil0KClbcStmPj4+MF09ZVtmXTtudWxsIT09ZCYmZC5wdXNoKFgsbCk7cmV0dXJuIGx9LGFyZ1BhY2tBZHZhbmNlOjgscmVhZFZhbHVlRnJvbVBvaW50ZXI6TWIscmIoZCl7WChkKX19KX0sQTpmdW5jdGlvbihhLGIsYyl7YT4+Pj0wO2I+Pj49MDtcbmM+Pj49MDtjPVIoYyk7aWYoMj09PWIpe3ZhciBkPU9iO3ZhciBlPVBiO3ZhciBmPVFiO3ZhciBrPSgpPT5jYSgpO3ZhciBsPTF9ZWxzZSA0PT09YiYmKGQ9UmIsZT1TYixmPVRiLGs9KCk9PnooKSxsPTIpO1QoYSx7bmFtZTpjLGZyb21XaXJlVHlwZTpxPT57Zm9yKHZhciByPXooKVtxPj4+Mj4+PjBdLHg9aygpLEMsTj1xKzQsZz0wO2c8PXI7KytnKXt2YXIgdT1xKzQrZypiO2lmKGc9PXJ8fDA9PXhbdT4+PmxdKU49ZChOLHUtTiksdm9pZCAwPT09Qz9DPU46KEMrPVN0cmluZy5mcm9tQ2hhckNvZGUoMCksQys9TiksTj11K2J9WChxKTtyZXR1cm4gQ30sdG9XaXJlVHlwZToocSxyKT0+e2lmKFwic3RyaW5nXCIhPXR5cGVvZiByKXRocm93IG5ldyBTKGBDYW5ub3QgcGFzcyBub24tc3RyaW5nIHRvIEMrKyBzdHJpbmcgdHlwZSAke2N9YCk7dmFyIHg9ZihyKSxDPXVjKDQreCtiKTt6KClbQz4+PjJdPXg+Pmw7ZShyLEMrNCx4K2IpO251bGwhPT1xJiZxLnB1c2goWCxDKTtyZXR1cm4gQ30sXG5hcmdQYWNrQWR2YW5jZTo4LHJlYWRWYWx1ZUZyb21Qb2ludGVyOktiLHJiKHEpe1gocSl9fSl9LHJhOmZ1bmN0aW9uKGEsYil7YT4+Pj0wO2I9UihiPj4+MCk7VChhLHtJYjohMCxuYW1lOmIsYXJnUGFja0FkdmFuY2U6MCxmcm9tV2lyZVR5cGU6KCk9Pnt9LHRvV2lyZVR5cGU6KCk9Pnt9fSl9LG5hOigpPT4hMCxPOmZ1bmN0aW9uKGEsYil7YT4+Pj0wO2E9PWI+Pj4wP3NldFRpbWVvdXQoKCk9PiRhKCkpOkU/cG9zdE1lc3NhZ2Uoe3RhcmdldFRocmVhZDphLGNtZDpcImNoZWNrTWFpbGJveFwifSk6KGE9Ty5qYlthXSkmJmEucG9zdE1lc3NhZ2Uoe2NtZDpcImNoZWNrTWFpbGJveFwifSl9LFg6ZnVuY3Rpb24oYSxiLGMsZCl7Yj4+Pj0wO2MvPTI7YWMubGVuZ3RoPWM7ZD1kPj4+MD4+PjM7Zm9yKHZhciBlPTA7ZTxjO2UrKylhY1tlXT1KW2QrMiplXT9KW2QrMiplKzFdOmhhKClbZCsyKmUrMT4+PjBdO2E9TmNbYV07Ty5HYj1iO2I9YS5hcHBseShudWxsLGFjKTtPLkdiPTA7cmV0dXJuIGJ9LFxuZGE6VmIsbWE6ZnVuY3Rpb24oYSl7RCYmTy5qYlthPj4+MF0ucmVmKCl9LHI6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtjPj4+PTA7YT1WKGE+Pj4wKTtiPWNjKGIsXCJlbXZhbDo6YXNcIik7dmFyIGQ9W10sZT1XKGQpO3ooKVtjPj4+Mj4+PjBdPWU7cmV0dXJuIGIudG9XaXJlVHlwZShkLGEpfSxpOmZ1bmN0aW9uKGEsYixjLGQsZSl7Yz4+Pj0wO2Q+Pj49MDtlPj4+PTA7YT1mY1thPj4+MF07Yj1WKGI+Pj4wKTtjPWVjKGMpO3ZhciBmPVtdO3ooKVtkPj4+Mj4+PjBdPVcoZik7cmV0dXJuIGEoYixjLGYsZSl9LHU6ZnVuY3Rpb24oYSxiLGMsZCl7Yz4+Pj0wO2Q+Pj49MDthPWZjW2E+Pj4wXTtiPVYoYj4+PjApO2M9ZWMoYyk7YShiLGMsbnVsbCxkKX0sYzpKYixLOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9VihhPj4+MCk7Yj1WKGIpO3JldHVybiBhPT1ifSxvOmZ1bmN0aW9uKGEpe2E+Pj49MDtpZigwPT09YSlyZXR1cm4gVyhnYygpKTthPWVjKGEpO3JldHVybiBXKGdjKClbYV0pfSxoOmZ1bmN0aW9uKGEsXG5iKXt2YXIgYz1pYyhhLGI+Pj4wKSxkPWNbMF07Yj1kLm5hbWUrXCJfJFwiK2Muc2xpY2UoMSkubWFwKGZ1bmN0aW9uKHgpe3JldHVybiB4Lm5hbWV9KS5qb2luKFwiX1wiKStcIiRcIjt2YXIgZT1sY1tiXTtpZih2b2lkIDAhPT1lKXJldHVybiBlO2U9W1wicmV0VHlwZVwiXTtmb3IodmFyIGY9W2RdLGs9XCJcIixsPTA7bDxhLTE7KytsKWsrPSgwIT09bD9cIiwgXCI6XCJcIikrXCJhcmdcIitsLGUucHVzaChcImFyZ1R5cGVcIitsKSxmLnB1c2goY1sxK2xdKTt2YXIgcT1cInJldHVybiBmdW5jdGlvbiBcIitqYyhcIm1ldGhvZENhbGxlcl9cIitiKStcIihoYW5kbGUsIG5hbWUsIGRlc3RydWN0b3JzLCBhcmdzKSB7XFxuXCIscj0wO2ZvcihsPTA7bDxhLTE7KytsKXErPVwiICAgIHZhciBhcmdcIitsK1wiID0gYXJnVHlwZVwiK2wrXCIucmVhZFZhbHVlRnJvbVBvaW50ZXIoYXJnc1wiKyhyP1wiK1wiK3I6XCJcIikrXCIpO1xcblwiLHIrPWNbbCsxXS5hcmdQYWNrQWR2YW5jZTtxKz1cIiAgICB2YXIgcnYgPSBoYW5kbGVbbmFtZV0oXCIraytcIik7XFxuXCI7XG5mb3IobD0wO2w8YS0xOysrbCljW2wrMV0uZGVsZXRlT2JqZWN0JiYocSs9XCIgICAgYXJnVHlwZVwiK2wrXCIuZGVsZXRlT2JqZWN0KGFyZ1wiK2wrXCIpO1xcblwiKTtkLklifHwocSs9XCIgICAgcmV0dXJuIHJldFR5cGUudG9XaXJlVHlwZShkZXN0cnVjdG9ycywgcnYpO1xcblwiKTtlLnB1c2gocStcIn07XFxuXCIpO2E9bmMoZSkuYXBwbHkobnVsbCxmKTtlPWhjKGEpO3JldHVybiBsY1tiXT1lfSxxOmZ1bmN0aW9uKGEsYil7Yj4+Pj0wO2E9VihhPj4+MCk7Yj1WKGIpO3JldHVybiBXKGFbYl0pfSxkOmZ1bmN0aW9uKGEpe2E+Pj49MDs0PGEmJihVLmdldChhKS5BYis9MSl9LHg6ZnVuY3Rpb24oYSxiLGMsZCl7Yz4+Pj0wO2Q+Pj49MDthPVYoYT4+PjApO3ZhciBlPXBjW2JdO2V8fChlPW9jKGIpLHBjW2JdPWUpO3JldHVybiBlKGEsYyxkKX0sdjpmdW5jdGlvbigpe3JldHVybiBXKFtdKX0sbDpmdW5jdGlvbihhKXthPVYoYT4+PjApO2Zvcih2YXIgYj1BcnJheShhLmxlbmd0aCksYz0wO2M8YS5sZW5ndGg7YysrKWJbY109XG5hW2NdO3JldHVybiBXKGIpfSxlOmZ1bmN0aW9uKGEpe3JldHVybiBXKGVjKGE+Pj4wKSl9LGs6ZnVuY3Rpb24oKXtyZXR1cm4gVyh7fSl9LGc6ZnVuY3Rpb24oYSl7YT4+Pj0wO2Zvcih2YXIgYj1WKGEpO2IubGVuZ3RoOyl7dmFyIGM9Yi5wb3AoKTtiLnBvcCgpKGMpfUpiKGEpfSxqOmZ1bmN0aW9uKGEsYixjKXtiPj4+PTA7Yz4+Pj0wO2E9VihhPj4+MCk7Yj1WKGIpO2M9VihjKTthW2JdPWN9LGY6ZnVuY3Rpb24oYSxiKXtiPj4+PTA7YT1jYyhhPj4+MCxcIl9lbXZhbF90YWtlX3ZhbHVlXCIpO2E9YS5yZWFkVmFsdWVGcm9tUG9pbnRlcihiKTtyZXR1cm4gVyhhKX0sXzpmdW5jdGlvbihhLGIpe2E9LTkwMDcxOTkyNTQ3NDA5OTI+YXx8OTAwNzE5OTI1NDc0MDk5MjxhP05hTjpOdW1iZXIoYSk7Yj4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3coKVtiPj4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO3coKVtiKzQ+Pj4yPj4+MF09YS5nZXRVVENNaW51dGVzKCk7dygpW2IrOD4+PjI+Pj4wXT1cbmEuZ2V0VVRDSG91cnMoKTt3KClbYisxMj4+PjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTt3KClbYisxNj4+PjI+Pj4wXT1hLmdldFVUQ01vbnRoKCk7dygpW2IrMjA+Pj4yPj4+MF09YS5nZXRVVENGdWxsWWVhcigpLTE5MDA7dygpW2IrMjQ+Pj4yPj4+MF09YS5nZXRVVENEYXkoKTthPShhLmdldFRpbWUoKS1EYXRlLlVUQyhhLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRFNXwwO3coKVtiKzI4Pj4+Mj4+PjBdPWF9LCQ6ZnVuY3Rpb24oYSxiKXthPS05MDA3MTk5MjU0NzQwOTkyPmF8fDkwMDcxOTkyNTQ3NDA5OTI8YT9OYU46TnVtYmVyKGEpO2I+Pj49MDthPW5ldyBEYXRlKDFFMyphKTt3KClbYj4+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTt3KClbYis0Pj4+Mj4+PjBdPWEuZ2V0TWludXRlcygpO3coKVtiKzg+Pj4yPj4+MF09YS5nZXRIb3VycygpO3coKVtiKzEyPj4+Mj4+PjBdPWEuZ2V0RGF0ZSgpO3coKVtiKzE2Pj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTt3KClbYisyMD4+PlxuMj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO3coKVtiKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7dmFyIGM9KFkoYS5nZXRGdWxsWWVhcigpKT9xYzpyYylbYS5nZXRNb250aCgpXSthLmdldERhdGUoKS0xfDA7dygpW2IrMjg+Pj4yPj4+MF09Yzt3KClbYiszNj4+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yz0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGQ9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO2E9KGMhPWQmJmEuZ2V0VGltZXpvbmVPZmZzZXQoKT09TWF0aC5taW4oZCxjKSl8MDt3KClbYiszMj4+PjI+Pj4wXT1hfSxhYTpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9bmV3IERhdGUodygpW2ErMjA+Pj4yPj4+MF0rMTkwMCx3KClbYSsxNj4+PjI+Pj4wXSx3KClbYSsxMj4+PjI+Pj4wXSx3KClbYSs4Pj4+Mj4+PjBdLHcoKVthKzQ+Pj4yPj4+MF0sdygpW2E+Pj5cbjI+Pj4wXSwwKSxjPXcoKVthKzMyPj4+Mj4+PjBdLGQ9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGU9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGY9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oZixlKTswPmM/dygpW2ErMzI+Pj4yPj4+MF09TnVtYmVyKGUhPWYmJms9PWQpOjA8YyE9KGs9PWQpJiYoZT1NYXRoLm1heChmLGUpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/azplKS1kKSkpO3coKVthKzI0Pj4+Mj4+PjBdPWIuZ2V0RGF5KCk7Yz0oWShiLmdldEZ1bGxZZWFyKCkpP3FjOnJjKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDt3KClbYSsyOD4+PjI+Pj4wXT1jO3coKVthPj4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO3coKVthKzQ+Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7dygpW2ErOD4+PjI+Pj4wXT1iLmdldEhvdXJzKCk7dygpW2ErMTI+Pj5cbjI+Pj4wXT1iLmdldERhdGUoKTt3KClbYSsxNj4+PjI+Pj4wXT1iLmdldE1vbnRoKCk7dygpW2ErMjA+Pj4yPj4+MF09Yi5nZXRZZWFyKCk7cmV0dXJuIEJpZ0ludChiLmdldFRpbWUoKS8xRTMpfSxZOnNjLFo6dGMsTjpmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChyKXtyZXR1cm4ocj1yLnRvVGltZVN0cmluZygpLm1hdGNoKC9cXCgoW0EtWmEteiBdKylcXCkkLykpP3JbMV06XCJHTVRcIn1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDt2YXIgZT0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksZj1uZXcgRGF0ZShlLDAsMSksaz1uZXcgRGF0ZShlLDYsMSk7ZT1mLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGw9ay5nZXRUaW1lem9uZU9mZnNldCgpLHE9TWF0aC5tYXgoZSxsKTt6KClbYT4+PjI+Pj4wXT02MCpxO3coKVtiPj4+Mj4+PjBdPU51bWJlcihlIT1sKTthPWQoZik7Yj1kKGspO2E9dmMoYSk7Yj12YyhiKTtsPGU/KHooKVtjPj4+Mj4+PjBdPWEseigpW2MrND4+PjI+Pj4wXT1iKTooeigpW2M+Pj5cbjI+Pj4wXT1iLHooKVtjKzQ+Pj4yPj4+MF09YSl9LG46KCk9PntIKFwiXCIpfSxFOigpPT57fSxHOigpPT5EYXRlLm5vdygpLGxhOigpPT57RmErPTE7dGhyb3dcInVud2luZFwiO30sUDpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxzOigpPT5wZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpLHc6KCk9PkQ/cmVxdWlyZShcIm9zXCIpLmNwdXMoKS5sZW5ndGg6bmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3ksTTpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9dCgpLmxlbmd0aDtpZihhPD1ifHw0Mjk0OTAxNzYwPGEpcmV0dXJuITE7Zm9yKHZhciBjPTE7ND49YztjKj0yKXt2YXIgZD1iKigxKy4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGU9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7ZT0oZS5taW4uY2FsbChlLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLW0uYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXttLmdyb3coZSk7XG5wKCk7dmFyIGY9MTticmVhayBhfWNhdGNoKGspe31mPXZvaWQgMH1pZihmKXJldHVybiEwfXJldHVybiExfSxmYTp6YyxnYTpBYyxWOldhLHo6QmMsQzpDYyxjYTpEYyxCOkZjLGE6bXx8QS53YXNtTWVtb3J5LG9hOktjLHA6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIEtjKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFo9ZnVuY3Rpb24oKXt2YXIgYT17YTpQY307SysrO05hKGEsZnVuY3Rpb24oYil7dmFyIGM9Yi5tb2R1bGU7Wj1iLmluc3RhbmNlLmV4cG9ydHM7Wj1RYygpO08uRWIucHVzaChaLlhhKTtlYj1aLl9hO0RhLnVuc2hpZnQoWi5zYSk7eGE9YztJYSgpfSkuY2F0Y2goa2EpO3JldHVybnt9fSgpO0EuX09ydEluaXQ9KGEsYik9PihBLl9PcnRJbml0PVoudGEpKGEsYik7QS5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4oQS5fT3J0R2V0TGFzdEVycm9yPVoudWEpKGEsYik7XG5BLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxlLGYsayxsLHEscik9PihBLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1aLnZhKShhLGIsYyxkLGUsZixrLGwscSxyKTtBLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj0oYSxiKT0+KEEuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPVoud2EpKGEsYik7QS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihBLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9Wi54YSkoYSxiLGMpO0EuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT0oYSxiLGMpPT4oQS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PVoueWEpKGEsYixjKTtBLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9YT0+KEEuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1aLnphKShhKTtBLl9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9PihBLl9PcnRDcmVhdGVTZXNzaW9uPVouQWEpKGEsYixjKTtcbkEuX09ydFJlbGVhc2VTZXNzaW9uPWE9PihBLl9PcnRSZWxlYXNlU2Vzc2lvbj1aLkJhKShhKTtBLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PShhLGIsYyk9PihBLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PVouQ2EpKGEsYixjKTtBLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihBLl9PcnRHZXRJbnB1dE5hbWU9Wi5EYSkoYSxiKTtBLl9PcnRHZXRPdXRwdXROYW1lPShhLGIpPT4oQS5fT3J0R2V0T3V0cHV0TmFtZT1aLkVhKShhLGIpO0EuX09ydEZyZWU9YT0+KEEuX09ydEZyZWU9Wi5GYSkoYSk7QS5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxkLGUsZik9PihBLl9PcnRDcmVhdGVUZW5zb3I9Wi5HYSkoYSxiLGMsZCxlLGYpO0EuX09ydEdldFRlbnNvckRhdGE9KGEsYixjLGQsZSk9PihBLl9PcnRHZXRUZW5zb3JEYXRhPVouSGEpKGEsYixjLGQsZSk7QS5fT3J0UmVsZWFzZVRlbnNvcj1hPT4oQS5fT3J0UmVsZWFzZVRlbnNvcj1aLklhKShhKTtcbkEuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGEsYixjLGQpPT4oQS5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1aLkphKShhLGIsYyxkKTtBLl9PcnRBZGRSdW5Db25maWdFbnRyeT0oYSxiLGMpPT4oQS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9Wi5LYSkoYSxiLGMpO0EuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9PihBLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1aLkxhKShhKTtBLl9PcnRDcmVhdGVCaW5kaW5nPWE9PihBLl9PcnRDcmVhdGVCaW5kaW5nPVouTWEpKGEpO0EuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4oQS5fT3J0QmluZElucHV0PVouTmEpKGEsYixjKTtBLl9PcnRCaW5kT3V0cHV0PShhLGIsYyxkKT0+KEEuX09ydEJpbmRPdXRwdXQ9Wi5PYSkoYSxiLGMsZCk7QS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KEEuX09ydENsZWFyQm91bmRPdXRwdXRzPVouUGEpKGEpO0EuX09ydFJlbGVhc2VCaW5kaW5nPWE9PihBLl9PcnRSZWxlYXNlQmluZGluZz1aLlFhKShhKTtcbkEuX09ydFJ1bldpdGhCaW5kaW5nPShhLGIsYyxkLGUpPT4oQS5fT3J0UnVuV2l0aEJpbmRpbmc9Wi5SYSkoYSxiLGMsZCxlKTtBLl9PcnRSdW49KGEsYixjLGQsZSxmLGssbCk9PihBLl9PcnRSdW49Wi5TYSkoYSxiLGMsZCxlLGYsayxsKTtBLl9PcnRFbmRQcm9maWxpbmc9YT0+KEEuX09ydEVuZFByb2ZpbGluZz1aLlRhKShhKTt2YXIgWmE9QS5fcHRocmVhZF9zZWxmPSgpPT4oWmE9QS5fcHRocmVhZF9zZWxmPVouVWEpKCksdWM9QS5fbWFsbG9jPWE9Pih1Yz1BLl9tYWxsb2M9Wi5WYSkoYSksWD1BLl9mcmVlPWE9PihYPUEuX2ZyZWU9Wi5XYSkoYSk7QS5fX2Vtc2NyaXB0ZW5fdGxzX2luaXQ9KCk9PihBLl9fZW1zY3JpcHRlbl90bHNfaW5pdD1aLlhhKSgpO3ZhciBiYz1hPT4oYmM9Wi5ZYSkoYSk7QS5fX2VtYmluZF9pbml0aWFsaXplX2JpbmRpbmdzPSgpPT4oQS5fX2VtYmluZF9pbml0aWFsaXplX2JpbmRpbmdzPVouWmEpKCk7XG52YXIgT2M9QS5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9KGEsYixjLGQsZSxmKT0+KE9jPUEuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PVouJGEpKGEsYixjLGQsZSxmKTtBLl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD0oKT0+KEEuX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPVouYWIpKCk7dmFyICRiPShhLGIsYyxkKT0+KCRiPVouYmIpKGEsYixjLGQpLFlhPWE9PihZYT1aLmNiKShhKSxmYj1BLl9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1hPT4oZmI9QS5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9Wi5kYikoYSksV2I9QS5fX2Vtc2NyaXB0ZW5fY2hlY2tfbWFpbGJveD0oKT0+KFdiPUEuX19lbXNjcmlwdGVuX2NoZWNrX21haWxib3g9Wi5lYikoKSxiYj0oYSxiKT0+KGJiPVouZmIpKGEsYiksWGI9KCk9PihYYj1aLmdiKSgpLGNiPWE9PihjYj1aLmhiKShhKSxaYj1hPT4oWmI9Wi5pYikoYSk7XG5mdW5jdGlvbiBRYygpe3ZhciBhPVo7YT1PYmplY3QuYXNzaWduKHt9LGEpO3ZhciBiPWQ9PigpPT5kKCk+Pj4wLGM9ZD0+ZT0+ZChlKT4+PjA7YS5fX2Vycm5vX2xvY2F0aW9uPWIoYS5fX2Vycm5vX2xvY2F0aW9uKTthLlVhPWIoYS5VYSk7YS5WYT1jKGEuVmEpO2EuWWE9YyhhLllhKTthLmdiPWIoYS5nYik7YS5pYj1jKGEuaWIpO3JldHVybiBhfUEua2VlcFJ1bnRpbWVBbGl2ZT1HYTtBLndhc21NZW1vcnk9bTtBLnN0YWNrQWxsb2M9WmI7QS5zdGFja1NhdmU9WGI7QS5zdGFja1Jlc3RvcmU9Y2I7QS5VVEY4VG9TdHJpbmc9VGE7QS5zdHJpbmdUb1VURjg9cGI7QS5sZW5ndGhCeXRlc1VURjg9bmI7QS5FeGl0U3RhdHVzPU9hO0EuUFRocmVhZD1PO3ZhciBSYztMPWZ1bmN0aW9uIFNjKCl7UmN8fFRjKCk7UmN8fChMPVNjKX07XG5mdW5jdGlvbiBUYygpezA8S3x8KEU/KGphKEEpLEV8fGFiKERhKSxzdGFydFdvcmtlcihBKSk6KGFiKENhKSwwPEt8fFJjfHwoUmM9ITAsQS5jYWxsZWRSdW49ITAseWF8fChFfHxhYihEYSksamEoQSksRXx8YWIoRWEpKSkpKX1UYygpO1xuXG5cbiAgcmV0dXJuIG1vZHVsZUFyZy5yZWFkeVxufVxuXG4pO1xufSkoKTtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbVRocmVhZGVkO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc21UaHJlYWRlZCk7XG4iLCAiXCJ1c2Ugc3RyaWN0XCI7dmFyIE1vZHVsZT17fTt2YXIgRU5WSVJPTk1FTlRfSVNfTk9ERT10eXBlb2YgcHJvY2Vzcz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnM9PVwib2JqZWN0XCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGU9PVwic3RyaW5nXCI7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7dmFyIG5vZGVXb3JrZXJUaHJlYWRzPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTt2YXIgcGFyZW50UG9ydD1ub2RlV29ya2VyVGhyZWFkcy5wYXJlbnRQb3J0O3BhcmVudFBvcnQub24oXCJtZXNzYWdlXCIsZGF0YT0+b25tZXNzYWdlKHtkYXRhOmRhdGF9KSk7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKTtPYmplY3QuYXNzaWduKGdsb2JhbCx7c2VsZjpnbG9iYWwscmVxdWlyZTpyZXF1aXJlLE1vZHVsZTpNb2R1bGUsbG9jYXRpb246e2hyZWY6X19maWxlbmFtZX0sV29ya2VyOm5vZGVXb3JrZXJUaHJlYWRzLldvcmtlcixpbXBvcnRTY3JpcHRzOmY9PigwLGV2YWwpKGZzLnJlYWRGaWxlU3luYyhmLFwidXRmOFwiKStcIi8vIyBzb3VyY2VVUkw9XCIrZikscG9zdE1lc3NhZ2U6bXNnPT5wYXJlbnRQb3J0LnBvc3RNZXNzYWdlKG1zZykscGVyZm9ybWFuY2U6Z2xvYmFsLnBlcmZvcm1hbmNlfHx7bm93OkRhdGUubm93fX0pfXZhciBpbml0aWFsaXplZEpTPWZhbHNlO2Z1bmN0aW9uIHRocmVhZFByaW50RXJyKCl7dmFyIHRleHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKFwiIFwiKTtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXtmcy53cml0ZVN5bmMoMix0ZXh0K1wiXFxuXCIpO3JldHVybn1jb25zb2xlLmVycm9yKHRleHQpfWZ1bmN0aW9uIHRocmVhZEFsZXJ0KCl7dmFyIHRleHQ9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKFwiIFwiKTtwb3N0TWVzc2FnZSh7Y21kOlwiYWxlcnRcIix0ZXh0OnRleHQsdGhyZWFkSWQ6TW9kdWxlW1wiX3B0aHJlYWRfc2VsZlwiXSgpfSl9dmFyIGVycj10aHJlYWRQcmludEVycjtzZWxmLmFsZXJ0PXRocmVhZEFsZXJ0O01vZHVsZVtcImluc3RhbnRpYXRlV2FzbVwiXT0oaW5mbyxyZWNlaXZlSW5zdGFuY2UpPT57dmFyIG1vZHVsZT1Nb2R1bGVbXCJ3YXNtTW9kdWxlXCJdO01vZHVsZVtcIndhc21Nb2R1bGVcIl09bnVsbDt2YXIgaW5zdGFuY2U9bmV3IFdlYkFzc2VtYmx5Lkluc3RhbmNlKG1vZHVsZSxpbmZvKTtyZXR1cm4gcmVjZWl2ZUluc3RhbmNlKGluc3RhbmNlKX07c2VsZi5vbnVuaGFuZGxlZHJlamVjdGlvbj1lPT57dGhyb3cgZS5yZWFzb258fGV9O2Z1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoZSl7dHJ5e2lmKGUuZGF0YS5jbWQ9PT1cImxvYWRcIil7bGV0IG1lc3NhZ2VRdWV1ZT1bXTtzZWxmLm9ubWVzc2FnZT1lPT5tZXNzYWdlUXVldWUucHVzaChlKTtzZWxmLnN0YXJ0V29ya2VyPWluc3RhbmNlPT57TW9kdWxlPWluc3RhbmNlO3Bvc3RNZXNzYWdlKHtcImNtZFwiOlwibG9hZGVkXCJ9KTtmb3IobGV0IG1zZyBvZiBtZXNzYWdlUXVldWUpe2hhbmRsZU1lc3NhZ2UobXNnKX1zZWxmLm9ubWVzc2FnZT1oYW5kbGVNZXNzYWdlfTtNb2R1bGVbXCJ3YXNtTW9kdWxlXCJdPWUuZGF0YS53YXNtTW9kdWxlO2Zvcihjb25zdCBoYW5kbGVyIG9mIGUuZGF0YS5oYW5kbGVycyl7TW9kdWxlW2hhbmRsZXJdPSguLi5hcmdzKT0+e3Bvc3RNZXNzYWdlKHtjbWQ6XCJjYWxsSGFuZGxlclwiLGhhbmRsZXI6aGFuZGxlcixhcmdzOmFyZ3N9KX19TW9kdWxlW1wid2FzbU1lbW9yeVwiXT1lLmRhdGEud2FzbU1lbW9yeTtNb2R1bGVbXCJidWZmZXJcIl09TW9kdWxlW1wid2FzbU1lbW9yeVwiXS5idWZmZXI7TW9kdWxlW1wiRU5WSVJPTk1FTlRfSVNfUFRIUkVBRFwiXT10cnVlO2lmKHR5cGVvZiBlLmRhdGEudXJsT3JCbG9iPT1cInN0cmluZ1wiKXtpbXBvcnRTY3JpcHRzKGUuZGF0YS51cmxPckJsb2IpfWVsc2V7dmFyIG9iamVjdFVybD1VUkwuY3JlYXRlT2JqZWN0VVJMKGUuZGF0YS51cmxPckJsb2IpO2ltcG9ydFNjcmlwdHMob2JqZWN0VXJsKTtVUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVybCl9b3J0V2FzbVRocmVhZGVkKE1vZHVsZSl9ZWxzZSBpZihlLmRhdGEuY21kPT09XCJydW5cIil7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9pbml0XCJdKGUuZGF0YS5wdGhyZWFkX3B0ciwvKmlzX21haW49Ki8wLC8qaXNfcnVudGltZT0qLzAsLypjYW5fYmxvY2s9Ki8xKTtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXRcIl0oZS5kYXRhLnB0aHJlYWRfcHRyKTtNb2R1bGVbXCJlc3RhYmxpc2hTdGFja1NwYWNlXCJdKCk7TW9kdWxlW1wiUFRocmVhZFwiXS5yZWNlaXZlT2JqZWN0VHJhbnNmZXIoZS5kYXRhKTtNb2R1bGVbXCJQVGhyZWFkXCJdLnRocmVhZEluaXRUTFMoKTtpZighaW5pdGlhbGl6ZWRKUyl7TW9kdWxlW1wiX19lbWJpbmRfaW5pdGlhbGl6ZV9iaW5kaW5nc1wiXSgpO2luaXRpYWxpemVkSlM9dHJ1ZX10cnl7TW9kdWxlW1wiaW52b2tlRW50cnlQb2ludFwiXShlLmRhdGEuc3RhcnRfcm91dGluZSxlLmRhdGEuYXJnKX1jYXRjaChleCl7aWYoZXghPVwidW53aW5kXCIpe3Rocm93IGV4fX19ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjYW5jZWxcIil7aWYoTW9kdWxlW1wiX3B0aHJlYWRfc2VsZlwiXSgpKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXRcIl0oLTEpfX1lbHNlIGlmKGUuZGF0YS50YXJnZXQ9PT1cInNldGltbWVkaWF0ZVwiKXt9ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjaGVja01haWxib3hcIil7aWYoaW5pdGlhbGl6ZWRKUyl7TW9kdWxlW1wiY2hlY2tNYWlsYm94XCJdKCl9fWVsc2UgaWYoZS5kYXRhLmNtZCl7ZXJyKGB3b3JrZXIuanMgcmVjZWl2ZWQgdW5rbm93biBjb21tYW5kICR7ZS5kYXRhLmNtZH1gKTtlcnIoZS5kYXRhKX19Y2F0Y2goZXgpe2lmKE1vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZFwiXSl7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkXCJdKCl9dGhyb3cgZXh9fXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2U7XG4iLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQge0Vudn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtPcnRXYXNtTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20nO1xuaW1wb3J0IHtPcnRXYXNtVGhyZWFkZWRNb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cbmxldCBvcnRXYXNtRmFjdG9yeTogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT47XG5cbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gIG9ydFdhc21GYWN0b3J5ID0gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC10cmFpbmluZy13YXNtLXNpbWQuanMnKTtcbn0gZWxzZSB7XG4gIG9ydFdhc21GYWN0b3J5ID1cbiAgICAgIEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20uanMnKSA6IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLmpzZXAuanMnKTtcbn1cblxuY29uc3Qgb3J0V2FzbUZhY3RvcnlUaHJlYWRlZDogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT4gPSAhQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEID9cbiAgICAoQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcycpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAuanMnKSkgOlxuICAgIG9ydFdhc21GYWN0b3J5O1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5cbmxldCB3YXNtOiBPcnRXYXNtTW9kdWxlfHVuZGVmaW5lZDtcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xubGV0IGFib3J0ZWQgPSBmYWxzZTtcblxuY29uc3QgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBJZiAnU2hhcmVkQXJyYXlCdWZmZXInIGlzIG5vdCBhdmFpbGFibGUsIFdlYkFzc2VtYmx5IHRocmVhZHMgd2lsbCBub3Qgd29yay5cbiAgICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIHRyYW5zZmVyYWJpbGl0eSBvZiBTQUJzIChmb3IgYnJvd3NlcnMuIG5lZWRlZCBmb3IgRmlyZWZveClcbiAgICAvLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhbXNnL21vemlsbGEuZGV2LnBsYXRmb3JtL0lIa0JabEhFVHBBL2R3c01OY2hXRVFBSlxuICAgIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBuZXcgTWVzc2FnZUNoYW5uZWwoKS5wb3J0MS5wb3N0TWVzc2FnZShuZXcgU2hhcmVkQXJyYXlCdWZmZXIoMSkpO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IHRocmVhZHMgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyB0aHJlYWRlZCBpbnN0cnVjdGlvbnMuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcbiAgICAgIDAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgIDAsICAwLCAxLCA0LCAxLCAgOTYsIDAsICAgMCwgIDMsIDIsIDEsICAwLCA1LFxuICAgICAgNCwgMSwgIDMsICAgMSwgICAxLCAxMCwgMTEsIDEsIDksIDAsIDY1LCAwLCAgMjU0LCAxNiwgMiwgMCwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBpc1NpbWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgU0lNRCBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIFNJTUQgaW5zdHJ1Y3Rpb25zLlxuXG4gICAgLy8gVGhlIGJpbmFyeSBkYXRhIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBmb2xsb3dpbmcgY29kZSBieSB3YXQyd2FzbTpcbiAgICAvL1xuICAgIC8vIChtb2R1bGVcbiAgICAvLyAgICh0eXBlICR0MCAoZnVuYykpXG4gICAgLy8gICAoZnVuYyAkZjAgKHR5cGUgJHQwKVxuICAgIC8vICAgICAoZHJvcFxuICAgIC8vICAgICAgIChpMzJ4NC5kb3RfaTE2eDhfc1xuICAgIC8vICAgICAgICAgKGk4eDE2LnNwbGF0XG4gICAgLy8gICAgICAgICAgIChpMzIuY29uc3QgMCkpXG4gICAgLy8gICAgICAgICAodjEyOC5jb25zdCBpMzJ4NCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwKSkpKSlcblxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCAgIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgNCwgMSwgOTYsIDAsIDAsIDMsIDIsIDEsIDAsIDEwLCAzMCwgMSwgICAyOCwgIDAsIDY1LCAwLFxuICAgICAgMjUzLCAxNSwgMjUzLCAxMiwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgIDI1MywgMTg2LCAxLCAyNiwgMTFcbiAgICBdKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGdldFdhc21GaWxlTmFtZSA9ICh1c2VTaW1kOiBib29sZWFuLCB1c2VUaHJlYWRzOiBib29sZWFuKSA9PiB7XG4gIGlmICh1c2VTaW1kKSB7XG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcbiAgICAgIHJldHVybiAnb3J0LXRyYWluaW5nLXdhc20tc2ltZC53YXNtJztcbiAgICB9XG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS1zaW1kLndhc20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXRocmVhZGVkLndhc20nIDogJ29ydC13YXNtLndhc20nO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5ID0gYXN5bmMoZmxhZ3M6IEVudi5XZWJBc3NlbWJseUZsYWdzKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmIChpbml0aWFsaXplZCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICBpZiAoaW5pdGlhbGl6aW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtdWx0aXBsZSBjYWxscyB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBkZXRlY3RlZC4nKTtcbiAgfVxuICBpZiAoYWJvcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJldmlvdXMgY2FsbCB0byBcXCdpbml0aWFsaXplV2ViQXNzZW1ibHkoKVxcJyBmYWlsZWQuJyk7XG4gIH1cblxuICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gIC8vIHdhc20gZmxhZ3MgYXJlIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgY29uc3QgdGltZW91dCA9IGZsYWdzLmluaXRUaW1lb3V0ITtcbiAgY29uc3QgbnVtVGhyZWFkcyA9IGZsYWdzLm51bVRocmVhZHMhO1xuICBjb25zdCBzaW1kID0gZmxhZ3Muc2ltZCE7XG5cbiAgY29uc3QgdXNlVGhyZWFkcyA9IG51bVRocmVhZHMgPiAxICYmIGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQoKTtcbiAgY29uc3QgdXNlU2ltZCA9IHNpbWQgJiYgaXNTaW1kU3VwcG9ydGVkKCk7XG5cbiAgY29uc3Qgd2FzbVBhdGhzID0gZmxhZ3Mud2FzbVBhdGhzO1xuICBjb25zdCB3YXNtUHJlZml4T3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnc3RyaW5nJyA/IHdhc21QYXRocyA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgd2FzbUZpbGVOYW1lID0gZ2V0V2FzbUZpbGVOYW1lKHVzZVNpbWQsIHVzZVRocmVhZHMpO1xuICBjb25zdCB3YXNtUGF0aE92ZXJyaWRlID0gdHlwZW9mIHdhc21QYXRocyA9PT0gJ29iamVjdCcgPyB3YXNtUGF0aHNbd2FzbUZpbGVOYW1lXSA6IHVuZGVmaW5lZDtcblxuICBsZXQgaXNUaW1lb3V0ID0gZmFsc2U7XG5cbiAgY29uc3QgdGFza3M6IEFycmF5PFByb21pc2U8dm9pZD4+ID0gW107XG5cbiAgLy8gcHJvbWlzZSBmb3IgdGltZW91dFxuICBpZiAodGltZW91dCA+IDApIHtcbiAgICB0YXNrcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaXNUaW1lb3V0ID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgdGltZW91dCk7XG4gICAgfSkpO1xuICB9XG5cbiAgLy8gcHJvbWlzZSBmb3IgbW9kdWxlIGluaXRpYWxpemF0aW9uXG4gIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZhY3RvcnkgPSB1c2VUaHJlYWRzID8gb3J0V2FzbUZhY3RvcnlUaHJlYWRlZCA6IG9ydFdhc21GYWN0b3J5O1xuICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPcnRXYXNtTW9kdWxlPiA9IHtcbiAgICAgIGxvY2F0ZUZpbGU6IChmaWxlTmFtZTogc3RyaW5nLCBzY3JpcHREaXJlY3Rvcnk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzICYmIGZpbGVOYW1lLmVuZHNXaXRoKCcud29ya2VyLmpzJykgJiZcbiAgICAgICAgICAgIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFxuICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgLy8gVGhpcyByZXF1aXJlKCkgZnVuY3Rpb24gaXMgaGFuZGxlZCBieSBlc2J1aWxkIHBsdWdpbiB0byBsb2FkIGZpbGUgY29udGVudCBhcyBzdHJpbmcuXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQud29ya2VyLmpzJylcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGVOYW1lLmVuZHNXaXRoKCcud2FzbScpKSB7XG4gICAgICAgICAgaWYgKHdhc21QYXRoT3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIHJldHVybiB3YXNtUGF0aE92ZXJyaWRlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHdhc21QcmVmaXhPdmVycmlkZSA/PyBzY3JpcHREaXJlY3Rvcnk7XG5cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgICAgIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc20nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwcmVmaXggKyB3YXNtRmlsZU5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NyaXB0RGlyZWN0b3J5ICsgZmlsZU5hbWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgQmxvYiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnb3J0LXdhc20tdGhyZWFkZWQuanMnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNjcmlwdFNvdXJjZUNvZGUgPSBgdmFyIG9ydFdhc21UaHJlYWRlZD0ke2ZhY3RvcnkudG9TdHJpbmcoKX07YDtcbiAgICAgICAgY29uZmlnLm1haW5TY3JpcHRVcmxPckJsb2IgPSBuZXcgQmxvYihbc2NyaXB0U291cmNlQ29kZV0sIHt0eXBlOiAndGV4dC9qYXZhc2NyaXB0J30pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZhY3RvcnkoY29uZmlnKS50aGVuKFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgbW9kdWxlID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgd2FzbSA9IG1vZHVsZTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGZhaWxlZCB0byBpbml0aWFsaXplXG4gICAgICAgICh3aGF0KSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgcmVqZWN0KHdoYXQpO1xuICAgICAgICB9KTtcbiAgfSkpO1xuXG4gIGF3YWl0IFByb21pc2UucmFjZSh0YXNrcyk7XG5cbiAgaWYgKGlzVGltZW91dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgV2ViQXNzZW1ibHkgYmFja2VuZCBpbml0aWFsaXppbmcgZmFpbGVkIGR1ZSB0byB0aW1lb3V0OiAke3RpbWVvdXR9bXNgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEluc3RhbmNlID0gKCk6IE9ydFdhc21Nb2R1bGUgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgd2FzbSkge1xuICAgIHJldHVybiB3YXNtO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdXZWJBc3NlbWJseSBpcyBub3QgaW5pdGlhbGl6ZWQgeWV0LicpO1xufTtcblxuZXhwb3J0IGNvbnN0IGRpc3Bvc2UgPSAoKTogdm9pZCA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiAhaW5pdGlhbGl6aW5nICYmICFhYm9ydGVkKSB7XG4gICAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAgICh3YXNtIGFzIE9ydFdhc21UaHJlYWRlZE1vZHVsZSkuUFRocmVhZD8udGVybWluYXRlQWxsVGhyZWFkcygpO1xuICAgIHdhc20gPSB1bmRlZmluZWQ7XG5cbiAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICBpbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIGFib3J0ZWQgPSB0cnVlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5cbmV4cG9ydCBjb25zdCBhbGxvY1dhc21TdHJpbmcgPSAoZGF0YTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogbnVtYmVyID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3QgZGF0YUxlbmd0aCA9IHdhc20ubGVuZ3RoQnl0ZXNVVEY4KGRhdGEpICsgMTtcbiAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhkYXRhTGVuZ3RoKTtcbiAgd2FzbS5zdHJpbmdUb1VURjgoZGF0YSwgZGF0YU9mZnNldCwgZGF0YUxlbmd0aCk7XG4gIGFsbG9jcy5wdXNoKGRhdGFPZmZzZXQpO1xuXG4gIHJldHVybiBkYXRhT2Zmc2V0O1xufTtcblxuaW50ZXJmYWNlIEV4dHJhT3B0aW9uc0hhbmRsZXIge1xuICAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IGl0ZXJhdGVFeHRyYU9wdGlvbnMgPVxuICAgIChvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcHJlZml4OiBzdHJpbmcsIHNlZW46IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICAgICBoYW5kbGVyOiBFeHRyYU9wdGlvbnNIYW5kbGVyKTogdm9pZCA9PiB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoc2Vlbi5oYXMob3B0aW9ucykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NpcmN1bGFyIHJlZmVyZW5jZSBpbiBvcHRpb25zJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2Vlbi5hZGQob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSAocHJlZml4KSA/IHByZWZpeCArIGtleSA6IGtleTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBuYW1lICsgJy4nLCBzZWVuLCBoYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgaGFuZGxlcihuYW1lLCAodmFsdWUpID8gJzEnIDogJzAnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGhhbmRsZSBleHRyYSBjb25maWcgdHlwZTogJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbi8qKlxuICogY2hlY2sgd2ViIGFzc2VtYmx5IEFQSSdzIGxhc3QgZXJyb3IgYW5kIHRocm93IGVycm9yIGlmIGFueSBlcnJvciBvY2N1cnJlZC5cbiAqIEBwYXJhbSBtZXNzYWdlIGEgbWVzc2FnZSB1c2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJyZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBjaGVja0xhc3RFcnJvciA9IChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IHBhcmFtc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg4KTtcbiAgICB3YXNtLl9PcnRHZXRMYXN0RXJyb3IocGFyYW1zT2Zmc2V0LCBwYXJhbXNPZmZzZXQgKyA0KTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLkhFQVAzMltwYXJhbXNPZmZzZXQgLyA0XTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2VQb2ludGVyID0gd2FzbS5IRUFQVTMyW3BhcmFtc09mZnNldCAvIDQgKyAxXTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2VQb2ludGVyID8gd2FzbS5VVEY4VG9TdHJpbmcoZXJyb3JNZXNzYWdlUG9pbnRlcikgOiAnJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gRVJST1JfQ09ERTogJHtlcnJvckNvZGV9LCBFUlJPUl9NRVNTQUdFOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtnZXRJbnN0YW5jZX0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHthbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5leHBvcnQgY29uc3Qgc2V0UnVuT3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBbbnVtYmVyLCBudW1iZXJbXV0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgcnVuT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0cnkge1xuICAgIGlmIChvcHRpb25zPy5sb2dTZXZlcml0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA9IDI7ICAvLyBEZWZhdWx0IHRvIHdhcm5pbmdcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwpIHx8XG4gICAgICAgIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmxvZ1ZlcmJvc2l0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPSAwOyAgLy8gRGVmYXVsdCB0byAwXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHZlcmJvc2l0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8udGVybWluYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMudGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHRhZ0RhdGFPZmZzZXQgPSAwO1xuICAgIGlmIChvcHRpb25zPy50YWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFnRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhvcHRpb25zLnRhZywgYWxsb2NzKTtcbiAgICB9XG5cbiAgICBydW5PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlUnVuT3B0aW9ucyhcbiAgICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsISwgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCEsICEhcnVuT3B0aW9ucy50ZXJtaW5hdGUhLCB0YWdEYXRhT2Zmc2V0KTtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIHJ1biBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKG9wdGlvbnMuZXh0cmEsICcnLCBuZXcgV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oKSwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhrZXksIGFsbG9jcyk7XG4gICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh2YWx1ZSwgYWxsb2NzKTtcblxuICAgICAgICBpZiAod2FzbS5fT3J0QWRkUnVuQ29uZmlnRW50cnkocnVuT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBydW4gY29uZmlnIGVudHJ5OiAke2tleX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtydW5PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VSdW5PcHRpb25zKHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmNvbnN0IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbCA9IChncmFwaE9wdGltaXphdGlvbkxldmVsOiBzdHJpbmd8dW5rbm93bik6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCkge1xuICAgIGNhc2UgJ2Rpc2FibGVkJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2Jhc2ljJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2V4dGVuZGVkJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2FsbCc6XG4gICAgICByZXR1cm4gOTk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZ3JhcGggb3B0aW1pemF0aW9uIGxldmVsOiAke2dyYXBoT3B0aW1pemF0aW9uTGV2ZWx9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGdldEV4ZWN1dGlvbk1vZGUgPSAoZXhlY3V0aW9uTW9kZTogJ3NlcXVlbnRpYWwnfCdwYXJhbGxlbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGV4ZWN1dGlvbk1vZGUpIHtcbiAgICBjYXNlICdzZXF1ZW50aWFsJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ3BhcmFsbGVsJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGV4ZWN1dGlvbiBtb2RlOiAke2V4ZWN1dGlvbk1vZGV9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGFwcGVuZERlZmF1bHRPcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiB2b2lkID0+IHtcbiAgaWYgKCFvcHRpb25zLmV4dHJhKSB7XG4gICAgb3B0aW9ucy5leHRyYSA9IHt9O1xuICB9XG4gIGlmICghb3B0aW9ucy5leHRyYS5zZXNzaW9uKSB7XG4gICAgb3B0aW9ucy5leHRyYS5zZXNzaW9uID0ge307XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbiA9IG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBpZiAoIXNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkgPSAnMSc7XG4gIH1cblxuICAvLyBpZiB1c2luZyBKU0VQIHdpdGggV2ViR1BVLCBhbHdheXMgZGlzYWJsZSBtZW1vcnkgcGF0dGVyblxuICBpZiAob3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgJiZcbiAgICAgIG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLnNvbWUoZXAgPT4gKHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWUpID09PSAnd2ViZ3B1JykpIHtcbiAgICBvcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4gPSBmYWxzZTtcbiAgfVxufTtcblxuY29uc3Qgc2V0RXhlY3V0aW9uUHJvdmlkZXJzID1cbiAgICAoc2Vzc2lvbk9wdGlvbnNIYW5kbGU6IG51bWJlciwgZXhlY3V0aW9uUHJvdmlkZXJzOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLkV4ZWN1dGlvblByb3ZpZGVyQ29uZmlnW10sXG4gICAgIGFsbG9jczogbnVtYmVyW10pOiB2b2lkID0+IHtcbiAgICAgIGZvciAoY29uc3QgZXAgb2YgZXhlY3V0aW9uUHJvdmlkZXJzKSB7XG4gICAgICAgIGxldCBlcE5hbWUgPSB0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lO1xuXG4gICAgICAgIC8vIGNoZWNrIEVQIG5hbWVcbiAgICAgICAgc3dpdGNoIChlcE5hbWUpIHtcbiAgICAgICAgICBjYXNlICd4bm5wYWNrJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdYTk5QQUNLJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3dlYm5uJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCB3ZWJubk9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LmRldmljZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdkZXZpY2VUeXBlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLmRldmljZVR5cGUsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZGV2aWNlVHlwZScgLSAke3dlYm5uT3B0aW9ucy5kZXZpY2VUeXBlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ubnVtVGhyZWFkcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1UaHJlYWRzID0gd2Vibm5PcHRpb25zLm51bVRocmVhZHM7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCBpZ25vcmUgaW52YWxpZCB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcy5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bVRocmVhZHMgIT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIobnVtVGhyZWFkcykgfHwgbnVtVGhyZWFkcyA8IDApIHtcbiAgICAgICAgICAgICAgICAgIG51bVRocmVhZHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdudW1UaHJlYWRzJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobnVtVGhyZWFkcy50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ251bVRocmVhZHMnIC0gJHt3ZWJubk9wdGlvbnMubnVtVGhyZWFkc30uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LnBvd2VyUHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ3Bvd2VyUHJlZmVyZW5jZScsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYm5uT3B0aW9ucy5wb3dlclByZWZlcmVuY2UsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncG93ZXJQcmVmZXJlbmNlJyAtICR7d2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZX0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3ZWJncHUnOlxuICAgICAgICAgICAgZXBOYW1lID0gJ0pTJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYmdwdU9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucz8ucHJlZmVycmVkTGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0ICE9PSAnTkNIVycgJiYgd2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOSFdDJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcmVmZXJyZWRMYXlvdXQgbXVzdCBiZSBlaXRoZXIgJ05DSFcnIG9yICdOSFdDJzogJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncHJlZmVycmVkTGF5b3V0JywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncHJlZmVycmVkTGF5b3V0JyAtICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2FzbSc6XG4gICAgICAgICAgY2FzZSAnY3B1JzpcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vdCBzdXBwb3J0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVwTmFtZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoZXBOYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXIoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGVwTmFtZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFwcGVuZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbmV4cG9ydCBjb25zdCBzZXRTZXNzaW9uT3B0aW9ucyA9IChvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBhcHBlbmREZWZhdWx0T3B0aW9ucyhzZXNzaW9uT3B0aW9ucyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBncmFwaE9wdGltaXphdGlvbkxldmVsID0gZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsKHNlc3Npb25PcHRpb25zLmdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPz8gJ2FsbCcpO1xuICAgIGNvbnN0IGV4ZWN1dGlvbk1vZGUgPSBnZXRFeGVjdXRpb25Nb2RlKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvbk1vZGUgPz8gJ3NlcXVlbnRpYWwnKTtcbiAgICBjb25zdCBsb2dJZERhdGFPZmZzZXQgPVxuICAgICAgICB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMubG9nSWQgPT09ICdzdHJpbmcnID8gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLmxvZ0lkLCBhbGxvY3MpIDogMDtcblxuICAgIGNvbnN0IGxvZ1NldmVyaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID8/IDI7ICAvLyBEZWZhdWx0IHRvIDIgLSB3YXJuaW5nXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1NldmVyaXR5TGV2ZWwpIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nVmVyYm9zaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA/PyAwOyAgLy8gRGVmYXVsdCB0byAwIC0gdmVyYm9zZVxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dWZXJib3NpdHlMZXZlbCkgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPCAwIHx8IGxvZ1ZlcmJvc2l0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0ID0gdHlwZW9mIHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGggPT09ICdzdHJpbmcnID9cbiAgICAgICAgYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGgsIGFsbG9jcykgOlxuICAgICAgICAwO1xuXG4gICAgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucyhcbiAgICAgICAgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVDcHVNZW1BcmVuYSwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuLCBleGVjdXRpb25Nb2RlLFxuICAgICAgICAhIXNlc3Npb25PcHRpb25zLmVuYWJsZVByb2ZpbGluZywgMCwgbG9nSWREYXRhT2Zmc2V0LCBsb2dTZXZlcml0eUxldmVsLCBsb2dWZXJib3NpdHlMZXZlbCxcbiAgICAgICAgb3B0aW1pemVkTW9kZWxGaWxlUGF0aE9mZnNldCk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgc2Vzc2lvbiBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgIHNldEV4ZWN1dGlvblByb3ZpZGVycyhzZXNzaW9uT3B0aW9uc0hhbmRsZSwgc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc2Vzc2lvbk9wdGlvbnMuZnJlZURpbWVuc2lvbk92ZXJyaWRlcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nOiAke25hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsdWUpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgdmFsdWUgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWVPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobmFtZSwgYWxsb2NzKTtcbiAgICAgICAgaWYgKHdhc20uX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZShzZXNzaW9uT3B0aW9uc0hhbmRsZSwgbmFtZU9mZnNldCwgdmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIGZyZWUgZGltZW5zaW9uIG92ZXJyaWRlOiAke25hbWV9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhzZXNzaW9uT3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbi8vIFRoaXMgZmlsZSBpbmNsdWRlcyBjb21tb24gZGVmaW5pdGlvbnMuIFRoZXkgZG8gTk9UIGhhdmUgZGVwZW5kZW5jeSBvbiB0aGUgV2ViQXNzZW1ibHkgaW5zdGFuY2UuXG5cbi8qKlxuICogQ29waWVkIGZyb20gT05OWCBkZWZpbml0aW9uLiBVc2UgdGhpcyB0byBkcm9wIGRlcGVuZGVuY3kgJ29ubnhfcHJvdG8nIHRvIGRlY3JlYXNlIGNvbXBpbGVkIC5qcyBmaWxlIHNpemUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIERhdGFUeXBlIHtcbiAgdW5kZWZpbmVkID0gMCxcbiAgZmxvYXQgPSAxLFxuICB1aW50OCA9IDIsXG4gIGludDggPSAzLFxuICB1aW50MTYgPSA0LFxuICBpbnQxNiA9IDUsXG4gIGludDMyID0gNixcbiAgaW50NjQgPSA3LFxuICBzdHJpbmcgPSA4LFxuICBib29sID0gOSxcbiAgZmxvYXQxNiA9IDEwLFxuICBkb3VibGUgPSAxMSxcbiAgdWludDMyID0gMTIsXG4gIHVpbnQ2NCA9IDEzLFxuICBjb21wbGV4NjQgPSAxNCxcbiAgY29tcGxleDEyOCA9IDE1LFxuICBiZmxvYXQxNiA9IDE2XG59XG5cbi8qKlxuICogTWFwIHN0cmluZyB0ZW5zb3IgZGF0YSB0byBlbnVtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSA9ICh0eXBlOiBzdHJpbmcpOiBEYXRhVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDg7XG4gICAgY2FzZSAndWludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ4O1xuICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmJvb2w7XG4gICAgY2FzZSAnaW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDE2O1xuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDE2O1xuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQzMjtcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQzMjtcbiAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDE2O1xuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0O1xuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmRvdWJsZTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnN0cmluZztcbiAgICBjYXNlICdpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50NjQ7XG4gICAgY2FzZSAndWludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NjQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgZW51bSB2YWx1ZSB0byBzdHJpbmcgdGVuc29yIGRhdGFcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nID0gKHR5cGVQcm90bzogRGF0YVR5cGUpOiBUZW5zb3IuVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZVByb3RvKSB7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ4OlxuICAgICAgcmV0dXJuICdpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ4OlxuICAgICAgcmV0dXJuICd1aW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS5ib29sOlxuICAgICAgcmV0dXJuICdib29sJztcbiAgICBjYXNlIERhdGFUeXBlLmludDE2OlxuICAgICAgcmV0dXJuICdpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MTY6XG4gICAgICByZXR1cm4gJ3VpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQzMjpcbiAgICAgIHJldHVybiAnaW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDMyOlxuICAgICAgcmV0dXJuICd1aW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQxNjpcbiAgICAgIHJldHVybiAnZmxvYXQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDpcbiAgICAgIHJldHVybiAnZmxvYXQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5kb3VibGU6XG4gICAgICByZXR1cm4gJ2Zsb2F0NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUuc3RyaW5nOlxuICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50NjQ6XG4gICAgICByZXR1cm4gJ2ludDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ2NDpcbiAgICAgIHJldHVybiAndWludDY0JztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlUHJvdG99YCk7XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IHRlbnNvciBlbGVtZW50IHNpemUgaW4gYnl0ZXMgYnkgdGhlIGdpdmVuIGRhdGEgdHlwZVxuICogQHJldHVybnMgc2l6ZSBpbiBpbnRlZ2VyIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGF0YSB0eXBlIGlzIG5vdCBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFRlbnNvckVsZW1lbnRTaXplID0gKGRhdGVUeXBlOiBudW1iZXIpOiBudW1iZXJ8XG4gICAgdW5kZWZpbmVkID0+IFt1bmRlZmluZWQsIDQsIDEsIDEsIDIsIDIsIDQsIDgsIHVuZGVmaW5lZCwgMSwgMiwgOCwgNCwgOCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1bZGF0ZVR5cGVdO1xuXG4vKipcbiAqIGdldCB0eXBlZCBhcnJheSBjb25zdHJ1Y3RvciBieSB0aGUgZ2l2ZW4gdGVuc29yIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3RvciA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yfFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxcbiAgICBJbnQ4QXJyYXlDb25zdHJ1Y3RvcnxVaW50MTZBcnJheUNvbnN0cnVjdG9yfEludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnSW50NjRBcnJheUNvbnN0cnVjdG9yfFxuICAgIFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxGbG9hdDY0QXJyYXlDb25zdHJ1Y3RvcnxVaW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ1VpbnQ2NEFycmF5Q29uc3RydWN0b3IgPT4ge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcbiAgICAgICAgY2FzZSAndWludDgnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdpbnQ4JzpcbiAgICAgICAgICByZXR1cm4gSW50OEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MTYnOlxuICAgICAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnaW50MTYnOlxuICAgICAgICAgIHJldHVybiBJbnQxNkFycmF5O1xuICAgICAgICBjYXNlICdpbnQzMic6XG4gICAgICAgICAgcmV0dXJuIEludDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgICAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgICAgICByZXR1cm4gRmxvYXQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50MzInOlxuICAgICAgICAgIHJldHVybiBVaW50MzJBcnJheTtcbiAgICAgICAgY2FzZSAnaW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdJbnQ2NEFycmF5O1xuICAgICAgICBjYXNlICd1aW50NjQnOlxuICAgICAgICAgIHJldHVybiBCaWdVaW50NjRBcnJheTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgIH1cbiAgICB9O1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgbG9nIGxldmVsIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ0xldmVsU3RyaW5nVG9FbnVtID0gKGxvZ0xldmVsPzogJ3ZlcmJvc2UnfCdpbmZvJ3wnd2FybmluZyd8J2Vycm9yJ3wnZmF0YWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2dMZXZlbCkge1xuICAgIGNhc2UgJ3ZlcmJvc2UnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2ZhdGFsJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGxvZ2dpbmcgbGV2ZWw6ICR7bG9nTGV2ZWx9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGVuc29yIHR5cGUgaXMgc3VwcG9ydGVkIGJ5IEdQVSBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IHR5cGUgaXMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9PiB0eXBlID09PSAnZmxvYXQzMicgfHxcbiAgICB0eXBlID09PSAnaW50MzInIHx8IHR5cGUgPT09ICdpbnQ2NCcgfHwgdHlwZSA9PT0gJ2Jvb2wnIHx8IHR5cGUgPT09ICdmbG9hdDE2JyB8fCB0eXBlID09PSAndWludDMyJztcblxuLyoqXG4gKiBNYXAgc3RyaW5nIGRhdGEgbG9jYXRpb24gdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtID0gKGxvY2F0aW9uOiBUZW5zb3IuRGF0YUxvY2F0aW9uKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2NhdGlvbikge1xuICAgIGNhc2UgJ25vbmUnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAndGV4dHVyZSc6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgbG9jYXRpb246ICR7bG9jYXRpb259YCk7XG4gIH1cbn07XG5cbi8qKlxuICogTWFwIGludGVnZXIgZGF0YSBsb2NhdGlvbiB0byBzdHJpbmcgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGRhdGFMb2NhdGlvbkVudW1Ub1N0cmluZyA9IChsb2NhdGlvbjogbnVtYmVyKTogVGVuc29yLkRhdGFMb2NhdGlvbnx1bmRlZmluZWQgPT5cbiAgICAoWydub25lJywgJ2NwdScsICdjcHUtcGlubmVkJywgJ3RleHR1cmUnLCAnZ3B1LWJ1ZmZlciddIGFzIGNvbnN0KVtsb2NhdGlvbl07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7RW52LCBJbmZlcmVuY2VTZXNzaW9uLCBUZW5zb3J9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7U2VyaWFsaXphYmxlTW9kZWxkYXRhLCBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEsIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhLCBUZW5zb3JNZXRhZGF0YX0gZnJvbSAnLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge3NldFJ1bk9wdGlvbnN9IGZyb20gJy4vcnVuLW9wdGlvbnMnO1xuaW1wb3J0IHtzZXRTZXNzaW9uT3B0aW9uc30gZnJvbSAnLi9zZXNzaW9uLW9wdGlvbnMnO1xuaW1wb3J0IHtkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0sIGdldFRlbnNvckVsZW1lbnRTaXplLCBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUsIGxvZ0xldmVsU3RyaW5nVG9FbnVtLCB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZywgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0sIHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcn0gZnJvbSAnLi93YXNtLWNvbW1vbic7XG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3J9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbi8qKlxuICogZ2V0IHRoZSBpbnB1dC9vdXRwdXQgY291bnQgb2YgdGhlIHNlc3Npb24uXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxuICogQHJldHVybnMgYSB0dXBsZSBpbmNsdWRpbmcgMiBudW1iZXJzLCByZXByZXNlbnRpbmcgdGhlIGlucHV0IGNvdW50IGFuZCBvdXRwdXQgY291bnQuXG4gKi9cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoOCk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlLCBkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgNCk7XG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IHNlc3Npb24gaW5wdXQvb3V0cHV0IGNvdW50LicpO1xuICAgIH1cbiAgICByZXR1cm4gW3dhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0XSwgd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDQgKyAxXV07XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIGluaXRpYWxpemUgT1JUIGVudmlyb25tZW50LlxuICogQHBhcmFtIG51bVRocmVhZHMgU2V0R2xvYmFsSW50cmFPcE51bVRocmVhZHMobnVtVGhyZWFkcylcbiAqIEBwYXJhbSBsb2dnaW5nTGV2ZWwgQ3JlYXRlRW52KHN0YXRpY19jYXN0PE9ydExvZ2dpbmdMZXZlbD4obG9nZ2luZ19sZXZlbCkpXG4gKi9cbmNvbnN0IGluaXRPcnQgPSAobnVtVGhyZWFkczogbnVtYmVyLCBsb2dnaW5nTGV2ZWw6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCBlcnJvckNvZGUgPSBnZXRJbnN0YW5jZSgpLl9PcnRJbml0KG51bVRocmVhZHMsIGxvZ2dpbmdMZXZlbCk7XG4gIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBpbml0aWFsaXplIG9ubnhydW50aW1lLicpO1xuICB9XG59O1xuXG4vKipcbiAqIGludGlhbGl6ZSBydW50aW1lIGVudmlyb25tZW50LlxuICogQHBhcmFtIGVudiBwYXNzZWQgaW4gdGhlIGVudmlyb25tZW50IGNvbmZpZyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0UnVudGltZSA9IGFzeW5jKGVudjogRW52KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXQgT1JUXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xuXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgIC8vIGluaXQgSlNFUCBpZiBhdmFpbGFibGVcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gICAgY29uc3QgaW5pdEpzZXAgPSByZXF1aXJlKCcuL2pzZXAvaW5pdCcpLmluaXQ7XG4gICAgYXdhaXQgaW5pdEpzZXAoZ2V0SW5zdGFuY2UoKSwgZW52KTtcbiAgfVxufTtcblxuLyoqXG4gKiB2YWxpZCBkYXRhIGxvY2F0aW9ucyBmb3IgaW5wdXQvb3V0cHV0IHRlbnNvcnMuXG4gKi9cbnR5cGUgU3VwcG9ydGVkVGVuc29yRGF0YUxvY2F0aW9uRm9ySW5wdXRPdXRwdXQgPSAnY3B1J3wnY3B1LXBpbm5lZCd8J2dwdS1idWZmZXInO1xuXG50eXBlIElPQmluZGluZ1N0YXRlID0ge1xuICAvKipcbiAgICogdGhlIGhhbmRsZSBvZiBJTyBiaW5kaW5nLlxuICAgKi9cbiAgcmVhZG9ubHkgaGFuZGxlOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICpcbiAgICogdmFsdWUgaXMgb25lIG9mICdjcHUnLCAnY3B1LXBpbm5lZCcsICdncHUtYnVmZmVyJy5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uczogcmVhZG9ubHkgU3VwcG9ydGVkVGVuc29yRGF0YUxvY2F0aW9uRm9ySW5wdXRPdXRwdXRbXTtcblxuICAvKipcbiAgICogZW51bSB2YWx1ZSBvZiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiByZWFkb25seSBudW1iZXJbXTtcbn07XG5cbi8qKlxuICogIHR1cGxlIGVsZW1lbnRzIGFyZTogSW5mZXJlbmNlU2Vzc2lvbiBJRDsgaW5wdXROYW1lc1VURjhFbmNvZGVkOyBvdXRwdXROYW1lc1VURjhFbmNvZGVkOyBiaW5kaW5nU3RhdGVcbiAqL1xudHlwZSBTZXNzaW9uTWV0YWRhdGEgPSBbXG4gIGluZmVyZW5jZVNlc3Npb25JZDogbnVtYmVyLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSxcbiAgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsXG5dO1xuXG5jb25zdCBhY3RpdmVTZXNzaW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBTZXNzaW9uTWV0YWRhdGE+KCk7XG5cbi8qKlxuICogYWxsb2NhdGUgdGhlIG1lbW9yeSBhbmQgbWVtY3B5IHRoZSBtb2RlbCBieXRlcywgcHJlcGFyaW5nIGZvciBjcmVhdGluZyBhbiBpbnN0YW5jZSBvZiBJbmZlcmVuY2VTZXNzaW9uLlxuICogQHJldHVybnMgYSAyLWVsZW1lbnRzIHR1cGxlIC0gdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIGFsbG9jYXRlZCBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb25BbGxvY2F0ZSA9IChtb2RlbDogVWludDhBcnJheSk6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3QgbW9kZWxEYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKG1vZGVsLmJ5dGVMZW5ndGgpO1xuICBpZiAobW9kZWxEYXRhT2Zmc2V0ID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBjcmVhdGUgYSBzZXNzaW9uLiBmYWlsZWQgdG8gYWxsb2NhdGUgYSBidWZmZXIgb2Ygc2l6ZSAke21vZGVsLmJ5dGVMZW5ndGh9LmApO1xuICB9XG4gIHdhc20uSEVBUFU4LnNldChtb2RlbCwgbW9kZWxEYXRhT2Zmc2V0KTtcbiAgcmV0dXJuIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsLmJ5dGVMZW5ndGhdO1xufTtcblxuLyoqXG4gKiBjcmVhdGUgYW4gaW5mZXJlbmNlIHNlc3Npb24gdXNpbmcgdGhlIHByZXBhcmVkIGJ1ZmZlciBjb250YWluaW5nIHRoZSBtb2RlbCBkYXRhLlxuICogQHBhcmFtIG1vZGVsRGF0YSBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgbW9kZWwgZGF0YSBidWZmZXIuXG4gKiBAcGFyYW0gb3B0aW9ucyBhbiBvcHRpb25hbCBzZXNzaW9uIG9wdGlvbnMgb2JqZWN0LlxuICogQHJldHVybnMgYSAzLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgW3Nlc3Npb24gaGFuZGxlLCBpbnB1dCBuYW1lcywgb3V0cHV0IG5hbWVzXVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbkZpbmFsaXplID1cbiAgICAobW9kZWxEYXRhOiBTZXJpYWxpemFibGVNb2RlbGRhdGEsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhID0+IHtcbiAgICAgIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gICAgICBsZXQgc2Vzc2lvbkhhbmRsZSA9IDA7XG4gICAgICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICAgICAgbGV0IGlvQmluZGluZ0hhbmRsZSA9IDA7XG4gICAgICBsZXQgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgY29uc3QgaW5wdXROYW1lc1VURjhFbmNvZGVkID0gW107XG4gICAgICBjb25zdCBvdXRwdXROYW1lc1VURjhFbmNvZGVkID0gW107XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXSA9IHNldFNlc3Npb25PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIHNlc3Npb25IYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uKG1vZGVsRGF0YVswXSwgbW9kZWxEYXRhWzFdLCBzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgICAgIGlmIChzZXNzaW9uSGFuZGxlID09PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIGEgc2Vzc2lvbi4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFtpbnB1dENvdW50LCBvdXRwdXRDb3VudF0gPSBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlKTtcblxuICAgICAgICBjb25zdCBpbnB1dE5hbWVzID0gW107XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVzID0gW107XG4gICAgICAgIGNvbnN0IG91dHB1dFByZWZlcnJlZExvY2F0aW9uczogU3VwcG9ydGVkVGVuc29yRGF0YUxvY2F0aW9uRm9ySW5wdXRPdXRwdXRbXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRJbnB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICAgICAgaWYgKG5hbWUgPT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBpbnB1dCBuYW1lLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lKTtcbiAgICAgICAgICBpbnB1dE5hbWVzLnB1c2god2FzbS5VVEY4VG9TdHJpbmcobmFtZSkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRPdXRwdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgICAgIGlmIChuYW1lID09PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gb3V0cHV0IG5hbWUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lKTtcbiAgICAgICAgICBjb25zdCBuYW1lU3RyaW5nID0gd2FzbS5VVEY4VG9TdHJpbmcobmFtZSk7XG4gICAgICAgICAgb3V0cHV0TmFtZXMucHVzaChuYW1lU3RyaW5nKTtcblxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0eXBlb2Ygb3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24gPT09ICdzdHJpbmcnID9cbiAgICAgICAgICAgICAgICBvcHRpb25zLnByZWZlcnJlZE91dHB1dExvY2F0aW9uIDpcbiAgICAgICAgICAgICAgICBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbj8uW25hbWVTdHJpbmddID8/ICdjcHUnO1xuICAgICAgICAgICAgaWYgKGxvY2F0aW9uICE9PSAnY3B1JyAmJiBsb2NhdGlvbiAhPT0gJ2NwdS1waW5uZWQnICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb3Qgc3VwcG9ydGVkIHByZWZlcnJlZCBvdXRwdXQgbG9jYXRpb246ICR7bG9jYXRpb259LmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnB1c2gobG9jYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVzZSBJTyBiaW5kaW5nIG9ubHkgd2hlbiBhdCBsZWFzdCBvbmUgb3V0cHV0IGlzIHByZWZmZXJlZCB0byBiZSBvbiBHUFUuXG4gICAgICAgIGxldCBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwgPSBudWxsO1xuICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnNvbWUobCA9PiBsID09PSAnZ3B1LWJ1ZmZlcicpKSB7XG4gICAgICAgICAgaW9CaW5kaW5nSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlQmluZGluZyhzZXNzaW9uSGFuZGxlKTtcbiAgICAgICAgICBpZiAoaW9CaW5kaW5nSGFuZGxlID09PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgSU8gYmluZGluZy4nKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBiaW5kaW5nU3RhdGUgPSB7XG4gICAgICAgICAgICBoYW5kbGU6IGlvQmluZGluZ0hhbmRsZSxcbiAgICAgICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucyxcbiAgICAgICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5tYXAobCA9PiBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obCkpLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbkhhbmRsZSwgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgYmluZGluZ1N0YXRlXSk7XG4gICAgICAgIHJldHVybiBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lcywgb3V0cHV0TmFtZXNdO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuXG4gICAgICAgIGlmIChpb0JpbmRpbmdIYW5kbGUgIT09IDApIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdIYW5kbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlc3Npb25IYW5kbGUgIT09IDApIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgd2FzbS5fZnJlZShtb2RlbERhdGFbMF0pO1xuICAgICAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgICAgICB9XG4gICAgICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICAgIH1cbiAgICB9O1xuXG5cbi8qKlxuICogY3JlYXRlIGFuIGluc3RhbmNlIG9mIEluZmVyZW5jZVNlc3Npb24uXG4gKiBAcmV0dXJucyB0aGUgbWV0YWRhdGEgb2YgSW5mZXJlbmNlU2Vzc2lvbi4gMC12YWx1ZSBoYW5kbGUgZm9yIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID1cbiAgICAobW9kZWw6IFVpbnQ4QXJyYXksIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhID0+IHtcbiAgICAgIGNvbnN0IG1vZGVsRGF0YTogU2VyaWFsaXphYmxlTW9kZWxkYXRhID0gY3JlYXRlU2Vzc2lvbkFsbG9jYXRlKG1vZGVsKTtcbiAgICAgIHJldHVybiBjcmVhdGVTZXNzaW9uRmluYWxpemUobW9kZWxEYXRhLCBvcHRpb25zKTtcbiAgICB9O1xuXG5leHBvcnQgY29uc3QgcmVsZWFzZVNlc3Npb24gPSAoc2Vzc2lvbklkOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgaWYgKCFzZXNzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcmVsZWFzZSBzZXNzaW9uLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlXSA9IHNlc3Npb247XG5cbiAgaWYgKGlvQmluZGluZ1N0YXRlKSB7XG4gICAgd2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nU3RhdGUuaGFuZGxlKTtcbiAgfVxuXG4gIHdhc20uanNlcFVucmVnaXN0ZXJCdWZmZXJzPy4oc2Vzc2lvbklkKTtcblxuICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKTtcbiAgYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG59O1xuXG5jb25zdCBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IgPVxuICAgICh0ZW5zb3I6IFRlbnNvck1ldGFkYXRhfG51bGwsIHRlbnNvckhhbmRsZXM6IG51bWJlcltdLCBhbGxvY3M6IG51bWJlcltdLCBzZXNzaW9uSWQ6IG51bWJlciwgaW5kZXg6IG51bWJlcik6XG4gICAgICAgIHZvaWQgPT4ge1xuICAgICAgICAgIGlmICghdGVuc29yKSB7XG4gICAgICAgICAgICB0ZW5zb3JIYW5kbGVzLnB1c2goMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcbiAgICAgICAgICBjb25zdCBkaW1zID0gdGVuc29yWzFdO1xuICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGVuc29yWzNdO1xuXG4gICAgICAgICAgbGV0IHJhd0RhdGE6IG51bWJlcjtcbiAgICAgICAgICBsZXQgZGF0YUJ5dGVMZW5ndGg6IG51bWJlcjtcblxuICAgICAgICAgIGlmIChkYXRhVHlwZSA9PT0gJ3N0cmluZycgJiYgbG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgb24gR1BVLicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICBjb25zdCBncHVCdWZmZXIgPSB0ZW5zb3JbMl0uZ3B1QnVmZmVyIGFzIEdQVUJ1ZmZlcjtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTaXplSW5CeXRlcyA9IGdldFRlbnNvckVsZW1lbnRTaXplKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSkhO1xuICAgICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSBkaW1zLnJlZHVjZSgoYSwgYikgPT4gYSAqIGIsIDEpICogZWxlbWVudFNpemVJbkJ5dGVzO1xuICAgICAgICAgICAgcmF3RGF0YSA9IHdhc20uanNlcFJlZ2lzdGVyQnVmZmVyKHNlc3Npb25JZCwgaW5kZXgsIGdwdUJ1ZmZlciwgZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gdGVuc29yWzJdO1xuXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAvLyBzdHJpbmcgdGVuc29yXG4gICAgICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gNCAqIGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgICAgIGxldCBkYXRhSW5kZXggPSByYXdEYXRhIC8gNDtcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdGVuc29yIGRhdGEgYXQgaW5kZXggJHtpfSBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2FzbS5IRUFQVTMyW2RhdGFJbmRleCsrXSA9IGFsbG9jV2FzbVN0cmluZyhkYXRhW2ldLCBhbGxvY3MpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRhdGEuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgICAgICB3YXNtLkhFQVBVOC5zZXQobmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YUJ5dGVMZW5ndGgpLCByYXdEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gICAgICAgICAgY29uc3QgZGltc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogZGltcy5sZW5ndGgpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgZGltSW5kZXggPSBkaW1zT2Zmc2V0IC8gNDtcbiAgICAgICAgICAgIGRpbXMuZm9yRWFjaChkID0+IHdhc20uSEVBUDMyW2RpbUluZGV4KytdID0gZCk7XG4gICAgICAgICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXG4gICAgICAgICAgICAgICAgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpLCByYXdEYXRhLCBkYXRhQnl0ZUxlbmd0aCwgZGltc09mZnNldCwgZGltcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGxvY2F0aW9uKSk7XG4gICAgICAgICAgICBpZiAodGVuc29yID09PSAwKSB7XG4gICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBjcmVhdGUgdGVuc29yIGZvciBpbnB1dC9vdXRwdXQuIHNlc3Npb249JHtzZXNzaW9uSWR9LCBpbmRleD0ke2luZGV4fS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCh0ZW5zb3IpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4vKipcbiAqIHBlcmZvcm0gaW5mZXJlbmNlIHJ1blxuICovXG5leHBvcnQgY29uc3QgcnVuID0gYXN5bmMoXG4gICAgc2Vzc2lvbklkOiBudW1iZXIsIGlucHV0SW5kaWNlczogbnVtYmVyW10sIGlucHV0VGVuc29yczogVGVuc29yTWV0YWRhdGFbXSwgb3V0cHV0SW5kaWNlczogbnVtYmVyW10sXG4gICAgb3V0cHV0VGVuc29yczogQXJyYXk8VGVuc29yTWV0YWRhdGF8bnVsbD4sIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8VGVuc29yTWV0YWRhdGFbXT4gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCBydW4gaW5mZXJlbmNlLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlXSA9IHNlc3Npb247XG5cbiAgY29uc3QgaW5wdXRDb3VudCA9IGlucHV0SW5kaWNlcy5sZW5ndGg7XG4gIGNvbnN0IG91dHB1dENvdW50ID0gb3V0cHV0SW5kaWNlcy5sZW5ndGg7XG5cbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgcnVuT3B0aW9uc0FsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBpbnB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IG91dHB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGlucHV0T3V0cHV0QWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGJlZm9yZVJ1blN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgY29uc3QgaW5wdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIDQpO1xuICBjb25zdCBpbnB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiA0KTtcbiAgY29uc3Qgb3V0cHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG4gIGNvbnN0IG91dHB1dE5hbWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XG5cbiAgdHJ5IHtcbiAgICBbcnVuT3B0aW9uc0hhbmRsZSwgcnVuT3B0aW9uc0FsbG9jc10gPSBzZXRSdW5PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgLy8gY3JlYXRlIGlucHV0IHRlbnNvcnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKGlucHV0VGVuc29yc1tpXSwgaW5wdXRUZW5zb3JIYW5kbGVzLCBpbnB1dE91dHB1dEFsbG9jcywgc2Vzc2lvbklkLCBpbnB1dEluZGljZXNbaV0pO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBvdXRwdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICAgIG91dHB1dFRlbnNvcnNbaV0sIG91dHB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0Q291bnQgKyBvdXRwdXRJbmRpY2VzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgaW5wdXRWYWx1ZXNJbmRleCA9IGlucHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgaW5wdXROYW1lc0luZGV4ID0gaW5wdXROYW1lc09mZnNldCAvIDQ7XG4gICAgbGV0IG91dHB1dFZhbHVlc0luZGV4ID0gb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNDtcbiAgICBsZXQgb3V0cHV0TmFtZXNJbmRleCA9IG91dHB1dE5hbWVzT2Zmc2V0IC8gNDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0VmFsdWVzSW5kZXgrK10gPSBpbnB1dFRlbnNvckhhbmRsZXNbaV07XG4gICAgICB3YXNtLkhFQVBVMzJbaW5wdXROYW1lc0luZGV4KytdID0gaW5wdXROYW1lc1VURjhFbmNvZGVkW2lucHV0SW5kaWNlc1tpXV07XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5IRUFQVTMyW291dHB1dFZhbHVlc0luZGV4KytdID0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXTtcbiAgICAgIHdhc20uSEVBUFUzMltvdXRwdXROYW1lc0luZGV4KytdID0gb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtvdXRwdXRJbmRpY2VzW2ldXTtcbiAgICB9XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGNvbnN0IHtoYW5kbGUsIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucywgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZH0gPSBpb0JpbmRpbmdTdGF0ZTtcblxuICAgICAgaWYgKGlucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGggIT09IGlucHV0Q291bnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnB1dCBjb3VudCBmcm9tIGZlZWRzICgke1xuICAgICAgICAgICAgaW5wdXRDb3VudH0pIGlzIGV4cGVjdGVkIHRvIGJlIGFsd2F5cyBlcXVhbCB0byBtb2RlbCdzIGlucHV0IGNvdW50ICgke2lucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGh9KS5gKTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBpbnB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaW5wdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRCaW5kSW5wdXQoaGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBpbnB1dFRlbnNvckhhbmRsZXNbaV0pO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgaW5wdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgcHJlLWFsbG9jYXRlZCBvdXRwdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBvdXRwdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IG91dHB1dFRlbnNvcnNbaV0/LlszXTsgIC8vIHVuZGVmaW5lZCBtZWFucyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuXG5cbiAgICAgICAgaWYgKGxvY2F0aW9uKSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIHByZS1hbGxvY2F0ZWQuIGJpbmQgdGhlIHRlbnNvci5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRCaW5kT3V0cHV0KGhhbmRsZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIG91dHB1dFRlbnNvckhhbmRsZXNbaV0sIDApO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIHByZS1hbGxvY2F0ZWQgb3V0cHV0WyR7aX1dIGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLiByZXNldCBwcmVmZXJyZWQgbG9jYXRpb24uXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID1cbiAgICAgICAgICAgICAgd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCAwLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkW2luZGV4XSk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgb3V0cHV0WyR7aX1dIHRvICR7b3V0cHV0UHJlZmVycmVkTG9jYXRpb25zW2ldfSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGVycm9yQ29kZTogbnVtYmVyO1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlKSB7XG4gICAgICBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRSdW5XaXRoQmluZGluZyhcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpb0JpbmRpbmdTdGF0ZS5oYW5kbGUsIG91dHB1dENvdW50LCBvdXRwdXRWYWx1ZXNPZmZzZXQsIHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRSdW4oXG4gICAgICAgICAgc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc09mZnNldCwgaW5wdXRWYWx1ZXNPZmZzZXQsIGlucHV0Q291bnQsIG91dHB1dE5hbWVzT2Zmc2V0LCBvdXRwdXRDb3VudCxcbiAgICAgICAgICBvdXRwdXRWYWx1ZXNPZmZzZXQsIHJ1bk9wdGlvbnNIYW5kbGUpO1xuICAgIH1cblxuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdmYWlsZWQgdG8gY2FsbCBPcnRSdW4oKS4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRwdXQ6IFRlbnNvck1ldGFkYXRhW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgdGVuc29yID0gd2FzbS5IRUFQVTMyW291dHB1dFZhbHVlc09mZnNldCAvIDQgKyBpXTtcbiAgICAgIGlmICh0ZW5zb3IgPT09IG91dHB1dFRlbnNvckhhbmRsZXNbaV0pIHtcbiAgICAgICAgLy8gb3V0cHV0IHRlbnNvciBpcyBwcmUtYWxsb2NhdGVkLiBubyBuZWVkIHRvIGNvcHkgZGF0YS5cbiAgICAgICAgb3V0cHV0LnB1c2gob3V0cHV0VGVuc29yc1tpXSEpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYmVmb3JlR2V0VGVuc29yRGF0YVN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgIC8vIHN0YWNrIGFsbG9jYXRlIDQgcG9pbnRlciB2YWx1ZVxuICAgICAgY29uc3QgdGVuc29yRGF0YU9mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogNCk7XG5cbiAgICAgIGxldCBrZWVwT3V0cHV0VGVuc29yID0gZmFsc2U7XG4gICAgICBsZXQgdHlwZTogVGVuc29yLlR5cGV8dW5kZWZpbmVkLCBkYXRhT2Zmc2V0ID0gMDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldFRlbnNvckRhdGEoXG4gICAgICAgICAgICB0ZW5zb3IsIHRlbnNvckRhdGFPZmZzZXQsIHRlbnNvckRhdGFPZmZzZXQgKyA0LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgOCwgdGVuc29yRGF0YU9mZnNldCArIDEyKTtcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhY2Nlc3Mgb3V0cHV0IHRlbnNvciBkYXRhIG9uIGluZGV4ICR7aX0uYCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRlbnNvckRhdGFJbmRleCA9IHRlbnNvckRhdGFPZmZzZXQgLyA0O1xuICAgICAgICBjb25zdCBkYXRhVHlwZSA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGRhdGFPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltc0xlbmd0aCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1zTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBkaW1zLnB1c2god2FzbS5IRUFQVTMyW2RpbXNPZmZzZXQgLyA0ICsgaV0pO1xuICAgICAgICB9XG4gICAgICAgIHdhc20uX09ydEZyZWUoZGltc09mZnNldCk7XG5cbiAgICAgICAgY29uc3Qgc2l6ZSA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSk7XG4gICAgICAgIHR5cGUgPSB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZyhkYXRhVHlwZSk7XG5cbiAgICAgICAgY29uc3QgcHJlZmVycmVkTG9jYXRpb24gPSBpb0JpbmRpbmdTdGF0ZT8ub3V0cHV0UHJlZmVycmVkTG9jYXRpb25zW291dHB1dEluZGljZXNbaV1dO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmIChwcmVmZXJyZWRMb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHN0cmluZ0RhdGE6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgbGV0IGRhdGFJbmRleCA9IGRhdGFPZmZzZXQgLyA0O1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdO1xuICAgICAgICAgICAgY29uc3QgbWF4Qnl0ZXNUb1JlYWQgPSBpID09PSBzaXplIC0gMSA/IHVuZGVmaW5lZCA6IHdhc20uSEVBUFUzMltkYXRhSW5kZXhdIC0gb2Zmc2V0O1xuICAgICAgICAgICAgc3RyaW5nRGF0YS5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG9mZnNldCwgbWF4Qnl0ZXNUb1JlYWQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIHN0cmluZ0RhdGEsICdjcHUnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgYSBjZXJ0YWluIG91dHB1dCdzIHByZWZlcnJlZCBsb2NhdGlvbiBpcyBHUFUgYnV0IHRoZSB0ZW5zb3IgaXMgZW1wdHksIHdlIHN0aWxsIG5lZWQgdG8gY3JlYXRlIGEgQ1BVXG4gICAgICAgICAgLy8gdGVuc29yIGZvciBpdC4gVGhlcmUgaXMgbm8gbWFwcGluZyBHUFUgYnVmZmVyIGZvciBhbiBlbXB0eSB0ZW5zb3IuXG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicgJiYgc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHdhc20uanNlcEdldEJ1ZmZlcihkYXRhT2Zmc2V0KTtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTaXplID0gZ2V0VGVuc29yRWxlbWVudFNpemUoZGF0YVR5cGUpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRTaXplID09PSB1bmRlZmluZWQgfHwgIWlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBkbyBub3QgcmVsZWFzZSB0aGUgdGVuc29yIHJpZ2h0IG5vdy4gaXQgd2lsbCBiZSByZWxlYXNlZCB3aGVuIHVzZXIgY2FsbHMgdGVuc29yLmRpc3Bvc2UoKS5cbiAgICAgICAgICAgIGtlZXBPdXRwdXRUZW5zb3IgPSB0cnVlO1xuXG4gICAgICAgICAgICBvdXRwdXQucHVzaChbXG4gICAgICAgICAgICAgIHR5cGUsIGRpbXMsIHtcbiAgICAgICAgICAgICAgICBncHVCdWZmZXIsXG4gICAgICAgICAgICAgICAgZG93bmxvYWQ6IHdhc20uanNlcENyZWF0ZURvd25sb2FkZXIoZ3B1QnVmZmVyLCBzaXplICogZWxlbWVudFNpemUsIHR5cGUpLFxuICAgICAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdncHUtYnVmZmVyJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcih0eXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgdHlwZWRBcnJheUNvbnN0cnVjdG9yKHNpemUpO1xuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKVxuICAgICAgICAgICAgICAgIC5zZXQod2FzbS5IRUFQVTguc3ViYXJyYXkoZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIGRhdGEuYnl0ZUxlbmd0aCkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIGRhdGEsICdjcHUnXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2spO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgZGF0YU9mZnNldCkge1xuICAgICAgICAgIHdhc20uX2ZyZWUoZGF0YU9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZWVwT3V0cHV0VGVuc29yKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlvQmluZGluZ1N0YXRlKSB7XG4gICAgICB3YXNtLl9PcnRDbGVhckJvdW5kT3V0cHV0cyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoYmVmb3JlUnVuU3RhY2spO1xuXG4gICAgaW5wdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBvdXRwdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBpbnB1dE91dHB1dEFsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG5cbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIHJ1bk9wdGlvbnNBbGxvY3MuZm9yRWFjaChwID0+IHdhc20uX2ZyZWUocCkpO1xuICB9XG59O1xuXG4vKipcbiAqIGVuZCBwcm9maWxpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGVuZFByb2ZpbGluZyA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2Vzc2lvbiBpZCcpO1xuICB9XG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xuXG4gIC8vIHByb2ZpbGUgZmlsZSBuYW1lIGlzIG5vdCB1c2VkIHlldCwgYnV0IGl0IG11c3QgYmUgZnJlZWQuXG4gIGNvbnN0IHByb2ZpbGVGaWxlTmFtZSA9IHdhc20uX09ydEVuZFByb2ZpbGluZyhzZXNzaW9uSGFuZGxlKTtcbiAgaWYgKHByb2ZpbGVGaWxlTmFtZSA9PT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBwcm9maWxlIGZpbGUgbmFtZS4nKTtcbiAgfVxuICB3YXNtLl9PcnRGcmVlKHByb2ZpbGVGaWxlTmFtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMgPSAodGVuc29yczogcmVhZG9ubHkgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSk6IEFycmF5QnVmZmVyTGlrZVtdID0+IHtcbiAgY29uc3QgYnVmZmVyczogQXJyYXlCdWZmZXJMaWtlW10gPSBbXTtcbiAgZm9yIChjb25zdCB0ZW5zb3Igb2YgdGVuc29ycykge1xuICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpICYmICdidWZmZXInIGluIGRhdGEpIHtcbiAgICAgIGJ1ZmZlcnMucHVzaChkYXRhLmJ1ZmZlcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBidWZmZXJzO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgbGliPVwid2Vid29ya2VyXCIgLz5cblxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZX0gZnJvbSAnLi4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHtjcmVhdGVTZXNzaW9uLCBjcmVhdGVTZXNzaW9uQWxsb2NhdGUsIGNyZWF0ZVNlc3Npb25GaW5hbGl6ZSwgZW5kUHJvZmlsaW5nLCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycywgaW5pdFJ1bnRpbWUsIHJlbGVhc2VTZXNzaW9uLCBydW59IGZyb20gJy4uL3dhc20tY29yZS1pbXBsJztcbmltcG9ydCB7aW5pdGlhbGl6ZVdlYkFzc2VtYmx5fSBmcm9tICcuLi93YXNtLWZhY3RvcnknO1xuXG5zZWxmLm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50PE9ydFdhc21NZXNzYWdlPik6IHZvaWQgPT4ge1xuICBzd2l0Y2ggKGV2LmRhdGEudHlwZSkge1xuICAgIGNhc2UgJ2luaXQtd2FzbSc6XG4gICAgICB0cnkge1xuICAgICAgICBpbml0aWFsaXplV2ViQXNzZW1ibHkoZXYuZGF0YS5pbilcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHBvc3RNZXNzYWdlKHt0eXBlOiAnaW5pdC13YXNtJ30gYXMgT3J0V2FzbU1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgIGVyciA9PiBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtd2FzbScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtd2FzbScsIGVycn0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW5pdC1vcnQnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgaW5pdFJ1bnRpbWUoZXYuZGF0YS5pbikudGhlbigoKSA9PiBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtb3J0J30gYXMgT3J0V2FzbU1lc3NhZ2UpLCBlcnIgPT4gcG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2luaXQtb3J0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gYXMgT3J0V2FzbU1lc3NhZ2UpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2luaXQtb3J0JywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGVfYWxsb2NhdGUnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge21vZGVsfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBtb2RlbGRhdGEgPSBjcmVhdGVTZXNzaW9uQWxsb2NhdGUobW9kZWwpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2NyZWF0ZV9hbGxvY2F0ZScsIG91dDogbW9kZWxkYXRhfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfYWxsb2NhdGUnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NyZWF0ZV9maW5hbGl6ZSc6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7bW9kZWxkYXRhLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBzZXNzaW9uTWV0YWRhdGEgPSBjcmVhdGVTZXNzaW9uRmluYWxpemUobW9kZWxkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGVfZmluYWxpemUnLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlX2ZpbmFsaXplJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3Qge21vZGVsLCBvcHRpb25zfSA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBjb25zdCBzZXNzaW9uTWV0YWRhdGEgPSBjcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdjcmVhdGUnLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnY3JlYXRlJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZWxlYXNlJzpcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBldi5kYXRhLmluITtcbiAgICAgICAgcmVsZWFzZVNlc3Npb24oaGFuZGxlcik7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncmVsZWFzZSd9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ3JlbGVhc2UnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3J1bic6XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7c2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3B0aW9uc30gPSBldi5kYXRhLmluITtcbiAgICAgICAgcnVuKHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBvdXRwdXRzID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncnVuJywgb3V0OiBvdXRwdXRzfSBhcyBPcnRXYXNtTWVzc2FnZSwgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMob3V0cHV0cykpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAncnVuJywgZXJyfSBhcyBPcnRXYXNtTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGU6ICdydW4nLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VuZC1wcm9maWxpbmcnOlxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IGV2LmRhdGEuaW4hO1xuICAgICAgICBlbmRQcm9maWxpbmcoaGFuZGxlcik7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlOiAnZW5kLXByb2ZpbGluZyd9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZTogJ2VuZC1wcm9maWxpbmcnLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gIH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBYTtBQUFiO0FBQUE7QUFBTyxNQUFNLFdBQVc7QUFBQTtBQUFBOzs7QUNBeEI7QUFBQTtBQUFBLGdCQUFBQTtBQUFBO0FBQUEsTUFBYUE7QUFBYjtBQUFBO0FBQU8sTUFBTUEsUUFBTztBQUFBO0FBQUE7OztBQ0FwQjtBQUFBO0FBQUE7QUFDQSxVQUFJLFdBQVcsTUFBTTtBQUNuQixZQUFJLGFBQWEsT0FBTyxhQUFhLGVBQWUsU0FBUyxnQkFBZ0IsU0FBUyxjQUFjLE1BQU07QUFDMUcsWUFBSSxPQUFPLGVBQWU7QUFBYSx1QkFBYSxjQUFjO0FBQ2xFLGVBQ0YsU0FBUyxZQUFZLENBQUMsR0FBRztBQUV6QixjQUFJLElBQUUsV0FBVSxJQUFHO0FBQUcsWUFBRSxRQUFNLElBQUksUUFBUSxDQUFDLEdBQUUsTUFBSTtBQUFDLGlC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SSxPQUFPLEdBQUUsR0FBRyxHQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUUsZ0JBQUksSUFBRSwyREFBMkQsTUFBTSxHQUFHLEdBQUUsSUFBRSx3RkFBd0YsTUFBTSxHQUFHO0FBQUUsZ0JBQUUsRUFBQyxNQUFLLE9BQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FDemYsRUFBRSxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsS0FBRyxRQUFNLE1BQUksR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHLEdBQUUsTUFBSyxPQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBRSxFQUFFO0FBQUcsbUJBQUcsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLEtBQUc7QUFBSSxxQkFBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyx1QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUcsRUFBRSxLQUFHLEdBQUUsTUFBSSxFQUFFLEVBQUUsS0FBRyxJQUFJLElBQUUsS0FBRyxJQUFJLEdBQUc7QUFBRTtBQUFDLHFCQUFPLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLFlBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDLEdBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE1BQUksTUFBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxF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Z0JBQUUsRUFBQyxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEVBQUM7QUFBRSxtQkFBTyxLQUFHLEVBQUUsS0FBRyxlQUFjLFlBQVksR0FBRSxDQUFDLEdBQUUsS0FBRyxHQUFHLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUM1WSxjQUFJLEtBQUcsT0FBRztBQUFDLHFCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sRUFBRSxHQUFFO0FBQUMsa0JBQUksSUFBRSxFQUFFLFdBQVcsQ0FBQztBQUFFLHFCQUFLLElBQUUsTUFBSSxRQUFNLElBQUUsS0FBRyxJQUFFLFNBQU8sS0FBRyxTQUFPLEtBQUcsS0FBRyxHQUFFLEVBQUUsS0FBRyxLQUFHO0FBQUEsWUFBQztBQUFDLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLEdBQUUsR0FBRSxNQUFJO0FBQUMsbUJBQUs7QUFBRSxnQkFBRyxFQUFFLElBQUU7QUFBRyxxQkFBTztBQUFFLGdCQUFJLElBQUU7QUFBRSxnQkFBRSxJQUFFLElBQUU7QUFBRSxxQkFBUSxJQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sRUFBRSxHQUFFO0FBQUMsa0JBQUksSUFBRSxFQUFFLFdBQVcsQ0FBQztBQUFFLGtCQUFHLFNBQU8sS0FBRyxTQUFPLEdBQUU7QUFBQyxvQkFBSSxJQUFFLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFBRSxvQkFBRSxVQUFRLElBQUUsU0FBTyxNQUFJLElBQUU7QUFBQSxjQUFJO0FBQUMsa0JBQUcsT0FBSyxHQUFFO0FBQUMsb0JBQUcsS0FBRztBQUFFO0FBQU0sa0JBQUUsUUFBTSxDQUFDLElBQUU7QUFBQSxjQUFDLE9BQUs7QUFBQyxvQkFBRyxRQUFNLEdBQUU7QUFBQyxzQkFBRyxJQUFFLEtBQUc7QUFBRTtBQUFNLG9CQUFFLFFBQU0sQ0FBQyxJQUFFLE1BQUksS0FBRztBQUFBLGdCQUFDLE9BQUs7QUFBQyxzQkFBRyxTQUFPLEdBQUU7QUFBQyx3QkFBRyxJQUFFLEtBQUc7QUFBRTtBQUFNLHNCQUFFLFFBQU0sQ0FBQyxJQUFFLE1BQUksS0FBRztBQUFBLGtCQUFFLE9BQUs7QUFBQyx3QkFBRyxJQUFFLEtBQUc7QUFBRTtBQUFNLHNCQUFFLFFBQU0sQ0FBQyxJQUFFLE1BQUksS0FDcGY7QUFBRyxzQkFBRSxRQUFNLENBQUMsSUFBRSxNQUFJLEtBQUcsS0FBRztBQUFBLGtCQUFFO0FBQUMsb0JBQUUsUUFBTSxDQUFDLElBQUUsTUFBSSxLQUFHLElBQUU7QUFBQSxnQkFBRTtBQUFDLGtCQUFFLFFBQU0sQ0FBQyxJQUFFLE1BQUksSUFBRTtBQUFBLGNBQUU7QUFBQSxZQUFDO0FBQUMsY0FBRSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPLElBQUU7QUFBQSxVQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsR0FBRSxNQUFJLEdBQUcsR0FBRSxFQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQzdkLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsQ0FBQztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUFDLGNBQUksS0FBRyxPQUFHO0FBQUMsZ0JBQUcsU0FBTztBQUFFLHFCQUFNO0FBQU8sZ0JBQUksSUFBRSxPQUFPO0FBQUUsbUJBQU0sYUFBVyxLQUFHLFlBQVUsS0FBRyxlQUFhLElBQUUsRUFBRSxTQUFTLElBQUUsS0FBRztBQUFBLFVBQUMsR0FBRSxJQUFHLElBQUUsT0FBRztBQUFDLHFCQUFRLElBQUUsSUFBRyxFQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUcsbUJBQUcsR0FBRyxFQUFFLEVBQUUsUUFBTSxDQUFDLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRTtBQUNuVSxtQkFBUyxHQUFHLEdBQUUsR0FBRSxJQUFFLENBQUMsR0FBRTtBQUFDLGdCQUFJLElBQUUsRUFBRTtBQUFLLGdCQUFHLENBQUM7QUFBRSxvQkFBTSxJQUFJLEVBQUUsU0FBUyxDQUFDLCtDQUErQztBQUFFLGdCQUFHLEdBQUcsZUFBZSxDQUFDLEdBQUU7QUFBQyxrQkFBRyxFQUFFO0FBQUc7QUFBTyxvQkFBTSxJQUFJLEVBQUUseUJBQXlCLENBQUMsU0FBUztBQUFBLFlBQUU7QUFBQyxlQUFHLENBQUMsSUFBRTtBQUFFLG1CQUFPLEdBQUcsQ0FBQztBQUFFLGVBQUcsZUFBZSxDQUFDLE1BQUksSUFBRSxHQUFHLENBQUMsR0FBRSxPQUFPLEdBQUcsQ0FBQyxHQUFFLEVBQUUsUUFBUSxPQUFHLEVBQUUsQ0FBQztBQUFBLFVBQUU7QUFBQyxtQkFBUyxFQUFFLEdBQUUsR0FBRSxJQUFFLENBQUMsR0FBRTtBQUFDLGdCQUFHLEVBQUUsb0JBQW1CO0FBQUcsb0JBQU0sSUFBSSxVQUFVLHlEQUF5RDtBQUFFLGVBQUcsR0FBRSxHQUFFLENBQUM7QUFBQSxVQUFDO0FBQ3RhLGNBQUksS0FBRyxDQUFDLEdBQUUsR0FBRSxNQUFJO0FBQUMsb0JBQU8sR0FBRTtBQUFBLGNBQUMsS0FBSztBQUFFLHVCQUFPLElBQUUsT0FBRyxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxPQUFHLEVBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQztBQUFBLGNBQUUsS0FBSztBQUFFLHVCQUFPLElBQUUsT0FBRyxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxPQUFHLEdBQUcsRUFBRSxNQUFJLE1BQUksQ0FBQztBQUFBLGNBQUUsS0FBSztBQUFFLHVCQUFPLElBQUUsT0FBRyxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxPQUFHLEVBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQztBQUFBLGNBQUUsS0FBSztBQUFFLHVCQUFPLElBQUUsT0FBRyxFQUFFLE1BQUksQ0FBQyxJQUFFLE9BQUcsR0FBRyxNQUFJLENBQUM7QUFBQSxjQUFFO0FBQVEsc0JBQU0sSUFBSSxVQUFVLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQUEsWUFBRTtBQUFBLFVBQUM7QUFBRSxtQkFBUyxLQUFJO0FBQUMsaUJBQUssS0FBRyxDQUFDLE1BQU07QUFBRSxpQkFBSyxLQUFHLENBQUM7QUFBQSxVQUFDO0FBQUMsY0FBSSxJQUFFLElBQUk7QUFBRyxtQkFBUyxHQUFHLEdBQUU7QUFBQyxtQkFBSztBQUFFLGlCQUFHLEVBQUUsTUFBSSxNQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxNQUFJLEVBQUUsR0FBRyxDQUFDO0FBQUEsVUFBQztBQUN0WixjQUFJLElBQUUsT0FBRztBQUFDLGdCQUFHLENBQUM7QUFBRSxvQkFBTSxJQUFJLEVBQUUsc0NBQW9DLENBQUM7QUFBRSxtQkFBTyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQUEsVUFBSyxHQUFFLElBQUUsT0FBRztBQUFDLG9CQUFPLEdBQUU7QUFBQSxjQUFDLEtBQUs7QUFBTyx1QkFBTztBQUFBLGNBQUUsS0FBSztBQUFLLHVCQUFPO0FBQUEsY0FBRSxLQUFLO0FBQUcsdUJBQU87QUFBQSxjQUFFLEtBQUs7QUFBRyx1QkFBTztBQUFBLGNBQUU7QUFBUSx1QkFBTyxFQUFFLEdBQUcsRUFBQyxJQUFHLEdBQUUsT0FBTSxFQUFDLENBQUM7QUFBQSxZQUFDO0FBQUEsVUFBQztBQUFFLG1CQUFTLEdBQUcsR0FBRTtBQUFDLG1CQUFPLEtBQUssYUFBYSxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsQ0FBQztBQUFBLFVBQUM7QUFDalIsY0FBSSxLQUFHLENBQUMsR0FBRSxNQUFJO0FBQUMsb0JBQU8sR0FBRTtBQUFBLGNBQUMsS0FBSztBQUFFLHVCQUFPLFNBQVMsR0FBRTtBQUFDLHNCQUFJLElBQUUsS0FBSztBQUFhLG9CQUFFLFVBQVEsRUFBRSxVQUFRLEVBQUU7QUFBRSx5QkFBTyxFQUFFLEtBQUssTUFBSyxHQUFHLE1BQUksTUFBSSxDQUFDLENBQUM7QUFBQSxnQkFBQztBQUFBLGNBQUUsS0FBSztBQUFFLHVCQUFPLFNBQVMsR0FBRTtBQUFDLHlCQUFPLEtBQUssYUFBYSxHQUFHLEVBQUUsTUFBSSxNQUFJLENBQUMsQ0FBQztBQUFBLGdCQUFDO0FBQUEsY0FBRTtBQUFRLHNCQUFNLElBQUksVUFBVSx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUFBLFlBQUU7QUFBQSxVQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFO0FBQUMsbUJBQU8sS0FBSyxhQUFhLEVBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxDQUFDO0FBQUEsVUFBQztBQUNyVSxjQUFJLEtBQUcsZUFBYSxPQUFPLGNBQVksSUFBSSxZQUFZLFVBQVUsSUFBRSxRQUFPLEtBQUcsQ0FBQyxHQUFFLE1BQUk7QUFBQyxnQkFBSSxJQUFFLEtBQUc7QUFBRSxxQkFBUSxJQUFFLElBQUUsSUFBRSxHQUFFLEVBQUUsS0FBRyxNQUFJLEdBQUcsRUFBRSxNQUFJLENBQUM7QUFBRyxnQkFBRTtBQUFFLGtCQUFJO0FBQUUsZ0JBQUcsS0FBRyxJQUFFLEtBQUc7QUFBRyxxQkFBTyxHQUFHLE9BQU8sRUFBRSxFQUFFLE1BQU0sR0FBRSxDQUFDLENBQUM7QUFBRSxnQkFBRTtBQUFHLGlCQUFJLElBQUUsR0FBRSxFQUFFLEtBQUcsSUFBRSxJQUFHLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQztBQUFFLGtCQUFHLEtBQUc7QUFBRTtBQUFNLG1CQUFHLE9BQU8sYUFBYSxDQUFDO0FBQUEsWUFBQztBQUFDLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLEdBQUUsTUFBSTtBQUFDLHVCQUFTLE1BQUksSUFBRTtBQUFZLGdCQUFHLElBQUU7QUFBRSxxQkFBTztBQUFFLGlCQUFHO0FBQUUsZ0JBQUksSUFBRTtBQUFFLGdCQUFFLElBQUUsSUFBRSxFQUFFLFNBQU8sSUFBRSxJQUFFLEVBQUU7QUFBTyxxQkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxnQkFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBRztBQUFBLFlBQUM7QUFBQyxjQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPLElBQUU7QUFBQSxVQUFDLEdBQUUsS0FBRyxPQUFHLElBQUUsRUFBRSxRQUMvZSxLQUFHLENBQUMsR0FBRSxNQUFJO0FBQUMscUJBQVEsSUFBRSxHQUFFLElBQUUsSUFBRyxFQUFFLEtBQUcsSUFBRSxNQUFJO0FBQUMsa0JBQUksSUFBRSxFQUFFLEVBQUUsSUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDO0FBQUUsa0JBQUcsS0FBRztBQUFFO0FBQU0sZ0JBQUU7QUFBRSx1QkFBTyxLQUFHLEtBQUcsT0FBTSxLQUFHLE9BQU8sYUFBYSxRQUFNLEtBQUcsSUFBRyxRQUFNLElBQUUsSUFBSSxLQUFHLEtBQUcsT0FBTyxhQUFhLENBQUM7QUFBQSxZQUFDO0FBQUMsbUJBQU87QUFBQSxVQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsR0FBRSxNQUFJO0FBQUMsbUJBQUs7QUFBRSx1QkFBUyxNQUFJLElBQUU7QUFBWSxnQkFBRyxJQUFFO0FBQUUscUJBQU87QUFBRSxnQkFBSSxJQUFFO0FBQUUsZ0JBQUUsSUFBRSxJQUFFO0FBQUUscUJBQVEsSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLEVBQUUsR0FBRTtBQUFDLGtCQUFJLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxrQkFBRyxTQUFPLEtBQUcsU0FBTyxHQUFFO0FBQUMsb0JBQUksSUFBRSxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBQUUsb0JBQUUsVUFBUSxJQUFFLFNBQU8sTUFBSSxJQUFFO0FBQUEsY0FBSTtBQUFDLGdCQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFHO0FBQUUsa0JBQUcsSUFBRSxJQUFFO0FBQUU7QUFBQSxZQUFLO0FBQUMsY0FBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBTyxJQUFFO0FBQUEsVUFBQyxHQUFFLEtBQUcsT0FBRztBQUFDLHFCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBRSxFQUFFLFFBQU8sRUFBRSxHQUFFO0FBQUMsa0JBQUksSUFDdmYsRUFBRSxXQUFXLENBQUM7QUFBRSx1QkFBTyxLQUFHLFNBQU8sS0FBRyxFQUFFO0FBQUUsbUJBQUc7QUFBQSxZQUFDO0FBQUMsbUJBQU87QUFBQSxVQUFDLEdBQUUsS0FBRyxPQUFHO0FBQUMsZ0JBQUcsQ0FBQztBQUFHLGtCQUFHO0FBQUMsb0JBQUcsRUFBRSxHQUFFLENBQUMsR0FBRztBQUFFLHNCQUFHO0FBQUMsd0JBQUUsR0FBRyxDQUFDLElBQUUsR0FBRyxDQUFDO0FBQUEsa0JBQUMsU0FBTyxHQUFFO0FBQUMsaUNBQWEsTUFBSSxZQUFVLEtBQUcsR0FBRyxHQUFFLENBQUM7QUFBQSxrQkFBQztBQUFBLGNBQUMsU0FBTyxHQUFFO0FBQUMsNkJBQWEsTUFBSSxZQUFVLEtBQUcsR0FBRyxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsVUFBQztBQUFFLG1CQUFTLEdBQUcsR0FBRTtBQUFDLG1CQUFLO0FBQUUsMkJBQWEsT0FBTyxRQUFRLE9BQUssUUFBUSxHQUFHLEVBQUUsR0FBRSxNQUFJLEdBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxFQUFFLEdBQUUsS0FBRyxLQUFJLFFBQVEsTUFBTSxFQUFFLEdBQUUsTUFBSSxHQUFFLENBQUM7QUFBQSxVQUFFO0FBQUMsWUFBRSxvQ0FBa0M7QUFBRyxjQUFJLEtBQUcsTUFBSTtBQUFDLGdCQUFJLElBQUUsR0FBRztBQUFFLGtCQUFJLEdBQUcsQ0FBQyxHQUFFLEdBQUcsTUFBSSxHQUFHLENBQUM7QUFBQSxVQUFFO0FBQUUsWUFBRSxlQUFhO0FBQUcsY0FBSSxLQUFHLE9BQUc7QUFBQyxnQkFBSSxJQUFFLEdBQUc7QUFBRSxnQkFBRSxFQUFFO0FBQUUsZUFBRyxDQUFDO0FBQUUsbUJBQU87QUFBQSxVQUFDO0FBQzdkLG1CQUFTLEVBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUksSUFBRSxVQUFVLFNBQU8sR0FBRSxJQUFFO0FBQVUsbUJBQU8sR0FBRyxNQUFJO0FBQUMsdUJBQVEsSUFBRSxJQUFFLEdBQUUsSUFBRSxHQUFHLElBQUUsQ0FBQyxHQUFFLElBQUUsTUFBSSxHQUFFLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLG9CQUFJLElBQUUsRUFBRSxJQUFFLENBQUM7QUFBRSw0QkFBVSxPQUFPLEtBQUcsRUFBRSxJQUFFLElBQUUsQ0FBQyxJQUFFLElBQUcsRUFBRSxJQUFFLElBQUUsSUFBRSxDQUFDLElBQUUsTUFBSSxFQUFFLElBQUUsSUFBRSxDQUFDLElBQUUsSUFBRyxHQUFHLEVBQUUsSUFBRSxJQUFFLElBQUUsTUFBSSxDQUFDLElBQUU7QUFBQSxjQUFFO0FBQUMscUJBQU8sR0FBRyxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxDQUFDO0FBQUEsVUFBQztBQUNsTyxjQUFJLEtBQUcsQ0FBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLE1BQUk7QUFBQyxnQkFBSSxJQUFFLEdBQUcsQ0FBQztBQUFFLGdCQUFHLFdBQVM7QUFBRSxvQkFBTSxJQUFFLEdBQUcsQ0FBQyxHQUFFLElBQUUsRUFBRSxDQUFDLEdBQUUsRUFBRSxDQUFDLEdBQUUsSUFBSSxFQUFFLElBQUUsdUJBQXFCLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLE9BQUc7QUFBQyxnQkFBSSxJQUFFLEdBQUcsQ0FBQztBQUFFLG1CQUFPLFdBQVMsSUFBRSxFQUFFLENBQUMsSUFBRTtBQUFBLFVBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLE1BQUksWUFBVSxPQUFPLGFBQVcsYUFBVyxTQUFTLGFBQWEsRUFBRSxHQUFFLEtBQUcsT0FBRztBQUFDLGdCQUFJLElBQUUsR0FBRztBQUFPLGVBQUcsS0FBSyxDQUFDO0FBQUUsbUJBQU87QUFBQSxVQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsTUFBSTtBQUFDLHFCQUFRLElBQUUsTUFBTSxDQUFDLEdBQUUsSUFBRSxHQUFFLElBQUUsR0FBRSxFQUFFO0FBQUUsZ0JBQUUsQ0FBQyxJQUFFLEdBQUcsRUFBRSxFQUFFLElBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLGVBQWEsQ0FBQztBQUFFLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEtBQUcsT0FBRztBQUFDLGdCQUFHLFdBQVM7QUFBRSxxQkFBTTtBQUFXLGdCQUFFLEVBQUUsUUFBUSxrQkFBaUIsR0FBRztBQUFFLGdCQUFJLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxtQkFBTyxNQUFJLEtBQUcsTUFBSSxJQUFFLElBQUksQ0FBQyxLQUN0ZjtBQUFBLFVBQUMsR0FBRSxLQUFHLENBQUM7QUFBRSxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFFLEdBQUcsQ0FBQztBQUFFLG1CQUFNLEVBQUMsQ0FBQyxDQUFDLEdBQUUsV0FBVTtBQUFDLHFCQUFPLEVBQUUsTUFBTSxNQUFLLFNBQVM7QUFBQSxZQUFDLEVBQUMsRUFBRSxDQUFDO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRTtBQUFDLGdCQUFJLElBQUU7QUFBUyxnQkFBRyxFQUFFLGFBQWE7QUFBVSxvQkFBTSxJQUFJLFVBQVUscUNBQXFDLE9BQU8sQ0FBQywwQkFBMEI7QUFBRSxnQkFBSSxJQUFFLEdBQUcsRUFBRSxRQUFNLHVCQUFzQixXQUFVO0FBQUEsWUFBQyxDQUFDO0FBQUUsY0FBRSxZQUFVLEVBQUU7QUFBVSxnQkFBRSxJQUFJO0FBQUUsZ0JBQUUsRUFBRSxNQUFNLEdBQUUsQ0FBQztBQUFFLG1CQUFPLGFBQWEsU0FBTyxJQUFFO0FBQUEsVUFBQztBQUNyWCxjQUFJLEtBQUcsT0FBRztBQUFDLHFCQUFRLElBQUUsSUFBRyxJQUFFLEdBQUUsSUFBRSxHQUFFLEVBQUU7QUFBRSxvQkFBSSxNQUFJLElBQUUsT0FBSyxNQUFJLFFBQU07QUFBRSxnQkFBSSxJQUFFLHFDQUFtQyxJQUFFO0FBQWtFLGlCQUFJLElBQUUsR0FBRSxJQUFFLEdBQUUsRUFBRTtBQUFFLG1CQUFHLGdCQUFjLElBQUUsb0VBQWtFLElBQUUsaUJBQWUsSUFBRSxlQUFhLElBQUUsa0RBQWdELElBQUU7QUFBd0MsbUJBQU8sSUFBSSxTQUFTLHlCQUF3QixVQUFTLGlCQUFnQixhQUFZLEtBQUcsK0JBQ2plLElBQUUsc0NBQXNDLEVBQUcsSUFBRyxHQUFFLEdBQUUsTUFBSSxFQUFFLENBQUM7QUFBQSxVQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsSUFBRSxPQUFHLE1BQUksSUFBRSxNQUFJLE1BQUksSUFBRSxPQUFLLE1BQUksSUFBRSxNQUFLLEtBQUcsQ0FBQyxHQUFFLElBQUcsSUFBRyxJQUFHLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksR0FBRyxHQUFFLEtBQUcsQ0FBQyxHQUFFLElBQUcsSUFBRyxJQUFHLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksR0FBRztBQUFFLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRztBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxnQkFBRztBQUFFLHFCQUFPLEVBQUUsSUFBRyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUEsVUFBQztBQUM3VCxjQUFJLEtBQUcsT0FBRztBQUFDLGdCQUFJLElBQUUsR0FBRyxDQUFDLElBQUUsR0FBRSxJQUFFLEdBQUcsQ0FBQztBQUFFLGlCQUFHLEdBQUcsR0FBRSxHQUFFLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLE1BQUk7QUFBQyxnQkFBRyxDQUFDLElBQUc7QUFBQyxrQkFBSSxJQUFFLEVBQUMsTUFBSyxZQUFXLFNBQVEsWUFBVyxNQUFLLEtBQUksS0FBSSxLQUFJLE1BQUssa0JBQWlCLE9BQU0sWUFBVSxPQUFPLGFBQVcsVUFBVSxhQUFXLFVBQVUsVUFBVSxDQUFDLEtBQUcsS0FBSyxRQUFRLEtBQUksR0FBRyxJQUFFLFVBQVMsR0FBRSxNQUFJLGlCQUFnQixHQUFFO0FBQUUsbUJBQUksS0FBSztBQUFHLDJCQUFTLEdBQUcsQ0FBQyxJQUFFLE9BQU8sRUFBRSxDQUFDLElBQUUsRUFBRSxDQUFDLElBQUUsR0FBRyxDQUFDO0FBQUUsa0JBQUksSUFBRSxDQUFDO0FBQUUsbUJBQUksS0FBSztBQUFFLGtCQUFFLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRTtBQUFFLG1CQUFHO0FBQUEsWUFBQztBQUFDLG1CQUFPO0FBQUEsVUFBRSxHQUFFO0FBQ3BaLG1CQUFTLEdBQUcsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLENBQUM7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUsZ0JBQUksSUFBRTtBQUFFLGVBQUcsRUFBRSxRQUFRLENBQUMsR0FBRSxNQUFJO0FBQUMsa0JBQUksSUFBRSxJQUFFO0FBQUUsa0JBQUUsRUFBRSxFQUFFLElBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUUsbUJBQUksSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPLEVBQUU7QUFBRSxrQkFBRSxFQUFFLFFBQU0sTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXLENBQUM7QUFBRSxnQkFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUU7QUFBRSxtQkFBRyxFQUFFLFNBQU87QUFBQSxZQUFDLENBQUM7QUFBRSxtQkFBTztBQUFBLFVBQUM7QUFBQyxtQkFBUyxHQUFHLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsR0FBRztBQUFFLGNBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUU7QUFBTyxnQkFBSSxJQUFFO0FBQUUsY0FBRSxRQUFRLE9BQUcsS0FBRyxFQUFFLFNBQU8sQ0FBQztBQUFFLGNBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUUsbUJBQU87QUFBQSxVQUFDO0FBQUMsbUJBQVMsR0FBRyxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLElBQUcsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFFO0FBQUMsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLElBQUU7QUFBQSxVQUFFO0FBQ3BjLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLGNBQUksS0FBRyxDQUFDLE1BQUssQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUFFLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLGdCQUFHO0FBQUUscUJBQU8sRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLHFCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUk7QUFBQyxrQkFBSSxJQUFFLEVBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUM7QUFBRSxtQkFBRztBQUFFLHVCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLG9CQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxDQUFDLEdBQUUsSUFBRSxHQUFHLENBQUM7QUFBRSxzQkFBSSxLQUFHLE9BQUssTUFBSSxNQUFJLElBQUUsS0FBRyxHQUFHLEdBQUcsR0FBRSxDQUFDLENBQUMsR0FBRSxFQUFFLFNB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Q0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUcsR0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxHQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssT0FBRztBQUFDLGtCQUFFLEVBQUU7QUFBRyxtQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHFCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRztBQUFDLHVCQUFRLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBRyxFQUFFLEtBQUcsR0FBRSxNQUFJLEVBQUUsRUFBRSxLQUFHLElBQUksSUFBRSxLQUFHLElBQUksR0FBRztBQUFFO0FBQUMscUJBQU8sRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsWUFBQyxHQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQyxHQUFFLE1BQUssTUFBSSxNQUFLLE1BQUssT0FBRyxLQUFHLEVBQUUsTUFBSSxLQUFHLEVBQUUsS0FBRyxPQUFLLE1BQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUMsR0FBRSxNQUFLLE1BQUksS0FBSyxNQUFLLE9BQUcsRUFBRSxNQUFJLEdBQUUsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxJQUFFLEVBQUUsTUFDcGYsQ0FBQyxHQUFFLENBQUMsR0FBRSxNQUFLLE9BQUc7QUFBQyxrQkFBSSxJQUFFLEtBQUssT0FBTyxFQUFFLEtBQUcsS0FBRyxFQUFFLEtBQUcsS0FBRyxLQUFHLENBQUM7QUFBRSxvQkFBSSxFQUFFLEtBQUcsTUFBSSxFQUFFLEtBQUcsS0FBRyxLQUFHO0FBQUksa0JBQUc7QUFBRSxzQkFBSSxNQUFJLEtBQUcsRUFBRSxLQUFHLE1BQUksRUFBRSxNQUFJLEdBQUUs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QUFHLENBQUMsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLEVBQUUsR0FBRSxLQUFHO0FBQUEsWUFBQyxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLGNBQUMsSUFBSSxHQUFHLENBQUMsRUFBRyxHQUFHLE1BQUksR0FBRSxNQUFJLENBQUM7QUFBRSxtQkFBRztBQUFFO0FBQUssb0JBQU07QUFBQSxZQUFHO0FBQUEsWUFBRSxJQUFHLFNBQVMsR0FBRTtBQUFDLGlCQUFHLE1BQUksR0FBRSxDQUFDLEdBQUUsR0FBRSxDQUFDLElBQUcsUUFBTyxLQUFFO0FBQUUsZ0JBQUUsR0FBRztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBRSxZQUFZLEVBQUMsS0FBSSxpQkFBZ0IsUUFBTyxFQUFDLENBQUMsTUFBSSxJQUFFLEVBQUUsR0FBRyxDQUFDLE1BQUksRUFBRSxHQUFFLEVBQUUsR0FBRyxDQUFDO0FBQUEsWUFBRTtBQUFBLFlBQUUsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsSUFBRztBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxxQkFBSztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLGtCQUFJLElBQUUsTUFBSSxFQUFFLFFBQVEsR0FBRztBQUFFLG9CQUFJLEtBQUcsTUFBSSxP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QUcsRUFBRSxHQUFHLE1BQUksQ0FBQyxFQUFFLElBQUk7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLHFCQUFLO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxHQUFHLEdBQUUsV0FBVztBQUFFLGtCQUFJLElBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFO0FBQUUscUJBQU8sRUFBRSxXQUFXLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQyxxQkFBSztBQUFFLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxrQkFBRSxHQUFHLE1BQUksQ0FBQztBQUFFLGtCQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUUsa0JBQUUsR0FBRyxDQUFDO0FBQUUsa0JBQUksSUFBRSxDQUFDO0FBQUUsZ0JBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEVBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMscUJBQUs7QUFBRSxxQkFBSztBQUFFLGtCQUFFLEdBQUcsTUFBSSxDQUFDO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxHQUFHLENBQUM7QUFBRSxnQkFBRSxHQUFFLEdBQUUsTUFBSyxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSxrQkFBRSxFQUFFLENBQUM7QUFBRSxxQkFBTyxLQUFHO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLGtCQUFHLE1BQUk7QUFBRSx1QkFBTyxFQUFFLEdBQUcsQ0FBQztBQUFFLGtCQUFFLEdBQUcsQ0FBQztBQUFFLHFCQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUM3ZixHQUFFO0FBQUMsa0JBQUksSUFBRSxHQUFHLEdBQUUsTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLENBQUM7QUFBRSxrQkFBRSxFQUFFLE9BQUssT0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksU0FBUyxHQUFFO0FBQUMsdUJBQU8sRUFBRTtBQUFBLGNBQUksQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFFO0FBQUksa0JBQUksSUFBRSxHQUFHLENBQUM7QUFBRSxrQkFBRyxXQUFTO0FBQUUsdUJBQU87QUFBRSxrQkFBRSxDQUFDLFNBQVM7QUFBRSx1QkFBUSxJQUFFLENBQUMsQ0FBQyxHQUFFLElBQUUsSUFBRyxJQUFFLEdBQUUsSUFBRSxJQUFFLEdBQUUsRUFBRTtBQUFFLHNCQUFJLE1BQUksSUFBRSxPQUFLLE1BQUksUUFBTSxHQUFFLEVBQUUsS0FBSyxZQUFVLENBQUMsR0FBRSxFQUFFLEtBQUssRUFBRSxJQUFFLENBQUMsQ0FBQztBQUFFLGtCQUFJLElBQUUscUJBQW1CLEdBQUcsa0JBQWdCLENBQUMsSUFBRSx5Q0FBd0MsSUFBRTtBQUFFLG1CQUFJLElBQUUsR0FBRSxJQUFFLElBQUUsR0FBRSxFQUFFO0FBQUUscUJBQUcsZ0JBQWMsSUFBRSxlQUFhLElBQUUsZ0NBQThCLElBQUUsTUFBSSxJQUFFLE1BQUksUUFBTyxLQUFHLEVBQUUsSUFBRSxDQUFDLEVBQUU7QUFBZSxtQkFBRywrQkFBNkIsSUFBRTtBQUM5ZSxtQkFBSSxJQUFFLEdBQUUsSUFBRSxJQUFFLEdBQUUsRUFBRTtBQUFFLGtCQUFFLElBQUUsQ0FBQyxFQUFFLGlCQUFlLEtBQUcsZ0JBQWMsSUFBRSxzQkFBb0IsSUFBRTtBQUFRLGdCQUFFLE9BQUssS0FBRztBQUFxRCxnQkFBRSxLQUFLLElBQUUsTUFBTTtBQUFFLGtCQUFFLEdBQUcsQ0FBQyxFQUFFLE1BQU0sTUFBSyxDQUFDO0FBQUUsa0JBQUUsR0FBRyxDQUFDO0FBQUUscUJBQU8sR0FBRyxDQUFDLElBQUU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBRSxFQUFFLE1BQUksQ0FBQztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLHFCQUFLO0FBQUUsa0JBQUUsTUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQUk7QUFBQSxZQUFFO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLHFCQUFLO0FBQUUscUJBQUs7QUFBRSxrQkFBRSxFQUFFLE1BQUksQ0FBQztBQUFFLGtCQUFJLElBQUUsR0FBRyxDQUFDO0FBQUUsb0JBQUksSUFBRSxHQUFHLENBQUMsR0FBRSxHQUFHLENBQUMsSUFBRTtBQUFHLHFCQUFPLEVBQUUsR0FBRSxHQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFdBQVU7QUFBQyxxQkFBTyxFQUFFLENBQUMsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMsa0JBQUUsRUFBRSxNQUFJLENBQUM7QUFBRSx1QkFBUSxJQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUUsSUFBRSxHQUFFLElBQUUsRUFBRSxRQUFPO0FBQUksa0JBQUUsQ0FBQyxJQUMvZixFQUFFLENBQUM7QUFBRSxxQkFBTyxFQUFFLENBQUM7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLHFCQUFPLEVBQUUsR0FBRyxNQUFJLENBQUMsQ0FBQztBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsV0FBVTtBQUFDLHFCQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRSxTQUFTLEdBQUU7QUFBQyxxQkFBSztBQUFFLHVC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QW1CO0FBQUEsUUFDdEUsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLFVBQVUsSUFBRyxDQUFtQjtBQUFBLFFBQ3JEO0FBQ0E7QUFBQSxNQUNGLEtBQUs7QUFDSCxZQUFJO0FBQ0YsZ0JBQU0sVUFBVSxHQUFHLEtBQUs7QUFDeEIseUJBQWUsT0FBTztBQUN0QixzQkFBWSxFQUFDLE1BQU0sVUFBUyxDQUFtQjtBQUFBLFFBQ2pELFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSxXQUFXLElBQUcsQ0FBbUI7QUFBQSxRQUN0RDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNLEVBQUMsV0FBVyxjQUFjLFFBQVEsZUFBZSxRQUFPLElBQUksR0FBRyxLQUFLO0FBQzFFLGNBQUksV0FBVyxjQUFjLFFBQVEsZUFBZSxPQUFPLEVBQ3REO0FBQUEsWUFDRyxhQUFXO0FBQ1QsMEJBQVksRUFBQyxNQUFNLE9BQU8sS0FBSyxRQUFPLEdBQXFCLDJCQUEyQixPQUFPLENBQUM7QUFBQSxZQUNoRztBQUFBLFlBQ0EsU0FBTztBQUNMLDBCQUFZLEVBQUMsTUFBTSxPQUFPLElBQUcsQ0FBbUI7QUFBQSxZQUNsRDtBQUFBLFVBQUM7QUFBQSxRQUNYLFNBQVMsS0FBSztBQUNaLHNCQUFZLEVBQUMsTUFBTSxPQUFPLElBQUcsQ0FBbUI7QUFBQSxRQUNsRDtBQUNBO0FBQUEsTUFDRixLQUFLO0FBQ0gsWUFBSTtBQUNGLGdCQUFNLFVBQVUsR0FBRyxLQUFLO0FBQ3hCLHVCQUFhLE9BQU87QUFDcEIsc0JBQVksRUFBQyxNQUFNLGdCQUFlLENBQW1CO0FBQUEsUUFDdkQsU0FBUyxLQUFLO0FBQ1osc0JBQVksRUFBQyxNQUFNLGlCQUFpQixJQUFHLENBQW1CO0FBQUEsUUFDNUQ7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFsiam9pbiIsICJ3YXNtIiwgIndhc20iLCAid2FzbSIsICJ3YXNtIiwgInRlbnNvciIsICJlcnJvckNvZGUiLCAiaSJdCn0K\n';
    }
  });

  // web/lib/wasm/proxy-wrapper.ts
  var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, initOrtCallbacks, createSessionAllocateCallbacks, createSessionFinalizeCallbacks, createSessionCallbacks, releaseSessionCallbacks, runCallbacks, endProfilingCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyInstance, initializeRuntime, createSessionAllocate2, createSessionFinalize2, createSession2, releaseSession2, run2, endProfiling2;
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
    }
  });

  // nodejs-ignore:node:fs/promises
  var readFile2;
  var init_promises = __esm({
    "nodejs-ignore:node:fs/promises"() {
      readFile2 = void 0;
    }
  });

  // web/lib/wasm/session-handler.ts
  var runtimeInitialized, runtimeInitializationPromise, encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
  var init_session_handler = __esm({
    "web/lib/wasm/session-handler.ts"() {
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
          if (!runtimeInitialized) {
            if (!runtimeInitializationPromise) {
              runtimeInitializationPromise = initializeRuntime(env2);
            }
            await runtimeInitializationPromise;
            runtimeInitializationPromise = void 0;
            runtimeInitialized = true;
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
      init_session_handler();
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
  var lib_exports = {};
  __export(lib_exports, {
    InferenceSession: () => InferenceSession2,
    Tensor: () => Tensor2,
    TrainingSession: () => TrainingSession2,
    env: () => env2,
    registerBackend: () => registerBackend
  });
  init_esm();
  init_esm();

  // web/lib/version.ts
  var version2 = "1.17.0";

  // web/lib/index.ts
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
  return __toCommonJS(lib_exports);
})();