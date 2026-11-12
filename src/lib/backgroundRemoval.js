
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

async function preloadOnce(module, config, model, device) {
  const key = modelKey(model, device);

  if (!preparedModels.has(key)) {
    const preparation = module.preload(config);

    preparedModels.set(key, preparation);

    preparation.catch(() => {
      preparedModels.delete(key);
    });
  }

  await preparedModels.get(key);
}

function runtimeMessage(error) {
  const message = String(error?.message || error || '');

  if (/fetch|network|load|cors|http/i.test(message)) {
    return 'The AI model could not be downloaded. Check your connection or content blocker, then try again.';
  }

  if (/memory|allocation|wasm|webgpu|gpu|device/i.test(message)) {
    return 'Your browser could not run the AI model with its available memory or graphics support. Close other heavy tabs and try again.';
  }

  return message || 'Background removal failed. Please try another image.';
}

export async function removeImageBackground(
  file,
  {
    model,
    onProgress = () => {},
    onStage = () => {},
  }
) {
  const module = await loadModule();

  const preferredDevice = globalThis.navigator?.gpu
    ? 'gpu'
    : 'cpu';

  const run = async (device) => {
    // Use ONE identical configuration for preload and removal.
    const config = {
      model,
      device,
      progress: onProgress,
      output: {
        format: 'image/png',
        quality: 1,
        type: 'foreground',
      },
    };

    onStage('preparing');

    // Load the model once and reuse it.
    await preloadOnce(module, config, model, device);

    onStage('processing');

    // Process the selected image using the prepared model.
    return module.removeBackground(file, config);
  };

  try {
    return await run(preferredDevice);
  } catch (primaryError) {
    if (preferredDevice !== 'gpu') {
      throw new Error(runtimeMessage(primaryError));
    }

    try {
      return await run('cpu');
    } catch (fallbackError) {
      throw new Error(runtimeMessage(fallbackError));
    }
  }
}
