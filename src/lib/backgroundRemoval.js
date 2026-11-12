let modulePromise;
const preparedModels = new Map();

function loadModule() {
  if (!modulePromise) {
    modulePromise = import('@imgly/background-removal').catch((error) => {
      modulePromise = null;
      throw error;
    });
  }
  return modulePromise;
}

function modelKey(model, device) {
  return `${model}:${device}`;
}

async function preloadOnce(module, model, device, onProgress) {
  const key = modelKey(model, device);
  if (!preparedModels.has(key)) {
    const preparation = module.preload({ model, device, progress: onProgress });
    preparedModels.set(key, preparation);
    preparation.catch(() => preparedModels.delete(key));
  }
  await preparedModels.get(key);
}

function runtimeMessage(error) {
  const message = String(error?.message || error || '');
  if (/fetch|network|load|cors|http/i.test(message)) {
    return 'The AI model could not be downloaded. Check your connection or content blocker, then try again.';
  }
  if (/memory|allocation|wasm|webgpu|gpu|device/i.test(message)) {
    return 'This browser could not run the AI model with its available memory or graphics support. Close other heavy tabs and retry; PixClear will also try the CPU runtime when GPU processing fails.';
  }
  return message || 'The background removal could not be completed. Try another image or browser.';
}

export async function removeImageBackground(file, { model, onProgress = () => {}, onStage = () => {} }) {
  const module = await loadModule();
  const preferredDevice = globalThis.navigator?.gpu ? 'gpu' : 'cpu';

  const run = async (device) => {
    onStage('preparing');
    await preloadOnce(module, model, device, onProgress);
    onStage('processing');
    return module.removeBackground(file, {
      model,
      device,
      output: { format: 'image/png', quality: 1, type: 'foreground' },
    });
  };

  try {
    return await run(preferredDevice);
  } catch (primaryError) {
    if (preferredDevice !== 'gpu') throw new Error(runtimeMessage(primaryError));
    try {
      return await run('cpu');
    } catch (fallbackError) {
      const primary = runtimeMessage(primaryError);
      const fallback = runtimeMessage(fallbackError);
      throw new Error(`GPU processing failed and the CPU fallback also failed. ${fallback || primary}`);
    }
  }
}
