/*!
 * ONNX Runtime Web v1.17.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";var e={},a="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node;if(a){var r=require("worker_threads"),t=r.parentPort;t.on("message",(e=>onmessage({data:e})));var s=require("fs");Object.assign(global,{self:global,require:require,Module:e,location:{href:__filename},Worker:r.Worker,importScripts:e=>(0,eval)(s.readFileSync(e,"utf8")+"//# sourceURL="+e),postMessage:e=>t.postMessage(e),performance:global.performance||{now:Date.now}})}var o=!1,d=function(){var e=Array.prototype.slice.call(arguments).join(" ");a?s.writeSync(2,e+"\n"):console.error(e)};self.alert=function(){var a=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:a,threadId:e._pthread_self()})},e.instantiateWasm=(a,r)=>{var t=e.wasmModule;return e.wasmModule=null,r(new WebAssembly.Instance(t,a))},self.onunhandledrejection=e=>{throw e.reason??e},self.onmessage=function a(r){try{if("load"===r.data.cmd){let s=[];self.onmessage=e=>s.push(e),self.startWorker=r=>{e=r,postMessage({cmd:"loaded"});for(let e of s)a(e);self.onmessage=a},e.wasmModule=r.data.wasmModule;for(const a of r.data.handlers)e[a]=(...e)=>{postMessage({cmd:"callHandler",handler:a,args:e})};if(e.wasmMemory=r.data.wasmMemory,e.buffer=e.wasmMemory.buffer,e.ENVIRONMENT_IS_PTHREAD=!0,"string"==typeof r.data.urlOrBlob)importScripts(r.data.urlOrBlob);else{var t=URL.createObjectURL(r.data.urlOrBlob);importScripts(t),URL.revokeObjectURL(t)}ortWasmThreaded(e)}else if("run"===r.data.cmd){e.__emscripten_thread_init(r.data.pthread_ptr,0,0,1),e.__emscripten_thread_mailbox_await(r.data.pthread_ptr),e.establishStackSpace(),e.PThread.receiveObjectTransfer(r.data),e.PThread.threadInitTLS(),o||(o=!0);try{e.invokeEntryPoint(r.data.start_routine,r.data.arg)}catch(e){if("unwind"!=e)throw e}}else"cancel"===r.data.cmd?e._pthread_self()&&e.__emscripten_thread_exit(-1):"setimmediate"===r.data.target||("checkMailbox"===r.data.cmd?o&&e.checkMailbox():r.data.cmd&&(d("worker.js received unknown command "+r.data.cmd),d(r.data)))}catch(a){throw e.__emscripten_thread_crashed&&e.__emscripten_thread_crashed(),a}};
