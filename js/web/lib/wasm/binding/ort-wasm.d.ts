// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import type {Tensor} from 'onnxruntime-common';

export declare namespace JSEP {
  type BackendType = unknown;
  type AllocFunction = (size: number) => number;
  type FreeFunction = (size: number) => number;
  type UploadFunction = (dataOffset: number, gpuDataId: number, size: number) => void;
  type DownloadFunction = (gpuDataId: number, dataOffset: number, size: number) => Promise<void>;
  type CreateKernelFunction = (name: string, kernel: number, attribute: unknown) => void;
  type ReleaseKernelFunction = (kernel: number) => void;
  type RunFunction =
      (kernel: number, contextDataOffset: number, sessionHandle: number, errors: Array<Promise<string|null>>) => number;
}

export interface OrtWasmModule extends EmscriptenModule {
  // #region emscripten functions
  stackSave(): number;
  stackRestore(stack: number): void;
  stackAlloc(size: number): number;

  UTF8ToString(offset: number, maxBytesToRead?: number): string;
  lengthBytesUTF8(str: string): number;
  stringToUTF8(str: string, offset: number, maxBytes: number): void;
  // #endregion

  // #region ORT APIs
  _OrtInit(numThreads: number, loggingLevel: number): number;

  _OrtGetLastError(errorCodeOffset: number, errorMessageOffset: number): void;

  _OrtCreateSession(dataOffset: number, dataLength: number, sessionOptionsHandle: number): number;
  _OrtReleaseSession(sessionHandle: number): void;
  _OrtGetInputOutputCount(sessionHandle: number, inputCountOffset: number, outputCountOffset: number): number;
  _OrtGetInputName(sessionHandle: number, index: number): number;
  _OrtGetOutputName(sessionHandle: number, index: number): number;

  _OrtFree(stringHandle: number): void;

  _OrtCreateTensor(
      dataType: number, dataOffset: number, dataLength: number, dimsOffset: number, dimsLength: number,
      dataLocation: number): number;
  _OrtGetTensorData(tensorHandle: number, dataType: number, dataOffset: number, dimsOffset: number, dimsLength: number):
      number;
  _OrtReleaseTensor(tensorHandle: number): void;
  _OrtCreateBinding(sessionHandle: number): number;
  _OrtBindInput(bindingHandle: number, nameOffset: number, tensorHandle: number): Promise<number>;
  _OrtBindOutput(bindingHandle: number, nameOffset: number, tensorHandle: number, location: number): number;
  _OrtClearBoundOutputs(ioBindingHandle: number): void;
  _OrtReleaseBinding(ioBindingHandle: number): void;
  _OrtRunWithBinding(
      sessionHandle: number, ioBindingHandle: number, outputCount: number, outputsOffset: number,
      runOptionsHandle: number): Promise<number>;
  _OrtRun(
      sessionHandle: number, inputNamesOffset: number, inputsOffset: number, inputCount: number,
      outputNamesOffset: number, outputCount: number, outputsOffset: number, runOptionsHandle: number): Promise<number>;

  _OrtCreateSessionOptions(
      graphOptimizationLevel: number, enableCpuMemArena: boolean, enableMemPattern: boolean, executionMode: number,
      enableProfiling: boolean, profileFilePrefix: number, logId: number, logSeverityLevel: number,
      logVerbosityLevel: number, optimizedModelFilePath: number): number;
  _OrtAppendExecutionProvider(sessionOptionsHandle: number, name: number): number;
  _OrtAddFreeDimensionOverride(sessionOptionsHandle: number, name: number, dim: number): number;
  _OrtAddSessionConfigEntry(sessionOptionsHandle: number, configKey: number, configValue: number): number;
  _OrtReleaseSessionOptions(sessionOptionsHandle: number): void;

  _OrtCreateRunOptions(logSeverityLevel: number, logVerbosityLevel: number, terminate: boolean, tag: number): number;
  _OrtAddRunConfigEntry(runOptionsHandle: number, configKey: number, configValue: number): number;
  _OrtReleaseRunOptions(runOptionsHandle: number): void;

  _OrtEndProfiling(sessionHandle: number): number;
  // #endregion

  // #region ORT Training APIs
  _OrtTrainingLoadCheckpoint?(dataOffset: number, dataLength: number): number;

  _OrtTrainingReleaseCheckpoint?(checkpointHandle: number): void;

  _OrtTrainingCreateSession?
      (sessionOptionsHandle: number, checkpointHandle: number, trainOffset: number, trainLength: number,
       evalOffset: number, evalLength: number, optimizerOffset: number, optimizerLength: number): number;

  _OrtTrainingLazyResetGrad?(trainingHandle: number): number;

  _OrtTrainingRunTrainStep?
      (trainingHandle: number, inputsOffset: number, inputCount: number, outputsOffset: number, outputCount: number,
       runOptionsHandle: number): number;

  _OrtTrainingOptimizerStep?(trainingHandle: number, runOptionsHandle: number): number;

  _OrtTrainingEvalStep?
      (trainingHandle: number, inputsOffset: number, inputCount: number, outputsOffset: number, outputCount: number,
       runOptionsHandle: number): number;

  _OrtTrainingGetParametersSize?(trainingHandle: number, paramSizeT: number, trainableOnly: boolean): number;

  _OrtTrainingCopyParametersToBuffer?
      (trainingHandle: number, parametersBuffer: number, parameterCount: number, trainableOnly: boolean): number;

  _OrtTrainingCopyParametersFromBuffer?
      (trainingHandle: number, parametersBuffer: number, parameterCount: number, trainableOnly: boolean): number;

  _OrtTrainingReleaseSession?(trainingHandle: number): void;
  // #endregion

  // #region config
  mainScriptUrlOrBlob?: string|Blob;
  // #endregion

  // #region JSEP
  jsepInit?
      (backend: JSEP.BackendType, alloc: JSEP.AllocFunction, free: JSEP.FreeFunction, upload: JSEP.UploadFunction,
       download: JSEP.DownloadFunction, createKernel: JSEP.CreateKernelFunction,
       releaseKernel: JSEP.ReleaseKernelFunction, run: JSEP.RunFunction): void;

  _JsepOutput(context: number, index: number, data: number): number;
  _JsepGetNodeName(kernel: number): number;

  jsepRegisterBuffer: (sessionId: number, index: number, buffer: GPUBuffer, size: number) => number;
  jsepUnregisterBuffers?: (sessionId: number) => void;
  jsepGetBuffer: (dataId: number) => GPUBuffer;
  jsepCreateDownloader:
      (gpuBuffer: GPUBuffer, size: number,
       type: Tensor.GpuBufferDataTypes) => () => Promise<Tensor.DataTypeMap[Tensor.GpuBufferDataTypes]>;
  // #endregion
}

declare const moduleFactory: EmscriptenModuleFactory<OrtWasmModule>;
export default moduleFactory;
