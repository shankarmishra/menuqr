/**
 * Browser adapter for the logo pipeline.
 *
 * Reads an uploaded logo File or Blob, decodes it into RGBA pixels via standard browser
 * canvas/ImageData APIs with EXIF orientation handling (via createImageBitmap), runs
 * the deterministic logo pipeline, and converts the resulting transparent image (and
 * any mono variants) into PNG Blobs for preview and upload.
 *
 * Never throws: returns a discriminated union result ({ ok: true, ... } | { ok: false, error: string }).
 */

import { processLogoPixels } from './pipeline.ts';
import type { LogoAnalysis, LogoPipelineOptions, RgbaImage } from './types.ts';

export type LogoProcessSuccess = {
  ok: true;
  /** The processed logo as a transparent PNG blob */
  blob: Blob;
  /** Alias for blob: the processed logo as a transparent PNG blob */
  mainBlob: Blob;
  /** The processed RGBA pixel buffer */
  image: RgbaImage;
  /** One-colour variants as PNG blobs, when requested and available */
  variants: {
    monoLightBlob: Blob;
    monoDarkBlob: Blob;
  } | null;
  /** Logo analysis metadata */
  analysis: LogoAnalysis;
};

export type LogoProcessFailure = {
  ok: false;
  error: string;
};

export type LogoProcessResult = LogoProcessSuccess | LogoProcessFailure;

/** Convert an RgbaImage pixel buffer to a PNG Blob using browser canvas APIs. */
export async function rgbaImageToBlob(img: RgbaImage): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas 2D context.');
    const clamped = new Uint8ClampedArray(img.width * img.height * 4);
    clamped.set(img.data);
    const id = new ImageData(clamped, img.width, img.height);
    ctx.putImageData(id, 0, 0);
    return canvas.convertToBlob({ type: 'image/png' });
  } else if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2D context.');
    const id = ctx.createImageData(img.width, img.height);
    id.data.set(img.data);
    ctx.putImageData(id, 0, 0);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode canvas to PNG blob.'));
      }, 'image/png');
    });
  } else {
    throw new Error('Canvas API is not available in the current environment.');
  }
}

/** Rasterize an SVG safely in a browser environment to RGBA pixels. */
async function rasterizeSvgInBrowser(blob: Blob): Promise<RgbaImage> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG into Image element.'));
      img.src = url;
    });

    let w = img.naturalWidth || img.width || 800;
    let h = img.naturalHeight || img.height || 800;

    // Constrain safe max dimensions (prevent excessive canvas memory consumption)
    const MAX_DIM = 2048;
    if (w > MAX_DIM || h > MAX_DIM) {
      const scale = MAX_DIM / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return { width: canvas.width, height: canvas.height, data: id.data };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Decode a raster image Blob or File into RGBA pixels with EXIF orientation. */
async function rasterToRgbaImage(blob: Blob): Promise<RgbaImage> {
  if (typeof createImageBitmap === 'function') {
    let bitmap: ImageBitmap;
    try {
      // Standard EXIF orientation handling
      bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch {
      // Fallback without dictionary options if browser does not support imageOrientation
      bitmap = await createImageBitmap(blob);
    }

    try {
      const w = bitmap.width;
      const h = bitmap.height;
      if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(w, h);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get OffscreenCanvas 2D context.');
        ctx.drawImage(bitmap, 0, 0);
        const id = ctx.getImageData(0, 0, w, h);
        return { width: w, height: h, data: id.data };
      } else if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas 2D context.');
        ctx.drawImage(bitmap, 0, 0);
        const id = ctx.getImageData(0, 0, w, h);
        return { width: w, height: h, data: id.data };
      } else {
        throw new Error('Neither OffscreenCanvas nor DOM canvas is available.');
      }
    } finally {
      bitmap.close();
    }
  } else if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas 2D context.');
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return { width: canvas.width, height: canvas.height, data: id.data };
    } finally {
      URL.revokeObjectURL(url);
    }
  } else {
    throw new Error('Canvas and createImageBitmap are unavailable in this environment.');
  }
}

/**
 * Process an uploaded logo file or blob.
 *
 * Extracts pixel data with correct EXIF orientation, handles SVGs safely, executes
 * the background detection and cut-out pipeline, and returns the transparent result.
 * Never throws an uncaught error.
 */
export async function processLogoFile(
  file: File | Blob,
  options: LogoPipelineOptions = {}
): Promise<LogoProcessResult> {
  try {
    if (!file || typeof (file as Blob).size !== 'number') {
      return { ok: false, error: 'No valid file or blob provided.' };
    }
    if ((file as Blob).size === 0) {
      return { ok: false, error: 'The provided image file is empty (0 bytes).' };
    }

    const isSvg =
      file.type === 'image/svg+xml' ||
      (file instanceof File && file.name.toLowerCase().endsWith('.svg'));

    const rgba = isSvg && typeof document !== 'undefined'
      ? await rasterizeSvgInBrowser(file)
      : await rasterToRgbaImage(file);

    const pipelineResult = processLogoPixels(rgba, options);

    const mainBlob = await rgbaImageToBlob(pipelineResult.image);

    let variantsBlobs: { monoLightBlob: Blob; monoDarkBlob: Blob } | null = null;
    if (pipelineResult.variants) {
      const [monoLightBlob, monoDarkBlob] = await Promise.all([
        rgbaImageToBlob(pipelineResult.variants.monoLight),
        rgbaImageToBlob(pipelineResult.variants.monoDark),
      ]);
      variantsBlobs = { monoLightBlob, monoDarkBlob };
    }

    return {
      ok: true,
      blob: mainBlob,
      mainBlob,
      image: pipelineResult.image,
      variants: variantsBlobs,
      analysis: pipelineResult.analysis,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
