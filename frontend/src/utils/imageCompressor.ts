/**
 * Ultra-fast Client-Side Image Pre-Compressor
 * Resizes and compresses heavy camera/gallery photos (e.g. 5MB-15MB)
 * down to ~50KB-120KB in browser memory BEFORE uploading over the network.
 */

export interface CompressionResult {
  file: Blob;
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  reductionPercentage: number;
}

export async function compressImageBeforeUpload(
  fileOrBlob: File | Blob,
  maxDimension = 1200,
  quality = 0.80
): Promise<CompressionResult> {
  const originalBytes = fileOrBlob.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect ratio downscaling
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context not available.'));
        }

        // High quality bicubic downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP first; fallback to JPEG if canvas doesn't support webp export
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Convert dataUrl to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to compress image canvas to blob.'));
            }

            const compressedBytes = blob.size;
            const reduction = Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100));

            console.log(
              `[imageCompressor] Pre-compressed before upload: ${(originalBytes / 1024).toFixed(1)}KB -> ${(compressedBytes / 1024).toFixed(1)}KB (${reduction}% reduction)`
            );

            resolve({
              file: blob,
              dataUrl,
              originalBytes,
              compressedBytes,
              width,
              height,
              reductionPercentage: reduction,
            });
          },
          dataUrl.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg',
          quality
        );
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
