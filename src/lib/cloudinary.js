const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not compress that image.'));
        }
      },
      type,
      quality,
    );
  });
}

async function prepareImage(file, prefix = 'image') {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Choose a JPG, PNG or WebP image.');
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Image must be 5 MB or smaller.');
  }

  const image = await loadImage(file);
  const ratio = Math.min(
    1,
    MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not prepare that image.');
  }

  context.drawImage(image, 0, 0, width, height);
  let blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
  let extension = 'webp';

  if (!blob || blob.size === 0) {
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
    extension = 'jpg';
  }

  return new File(
    [blob],
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`,
    {
      type: blob.type,
    },
  );
}

async function uploadImage(file, onProgress, { preset, prefix }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName || !preset) {
    throw new Error('Cloudinary is not configured.');
  }

  const prepared = await prepareImage(file, prefix);

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', prepared);
    formData.append('upload_preset', preset);

    const request = new XMLHttpRequest();
    request.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    );

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      let payload;

      try {
        payload = JSON.parse(request.responseText);
      } catch {
        reject(new Error('Cloudinary returned an invalid response.'));
        return;
      }

      if (request.status < 200 || request.status >= 300) {
        reject(
          new Error(
            payload?.error?.message ?? 'Cloudinary could not upload that image.',
          ),
        );
        return;
      }

      resolve({
        url: payload.secure_url,
        publicId: payload.public_id,
        width: payload.width,
        height: payload.height,
        bytes: payload.bytes,
        format: payload.format,
      });
    };

    request.onerror = () => {
      reject(new Error('Network error while uploading the image.'));
    };

    request.send(formData);
  });
}

export function uploadDestinationImage(file, onProgress) {
  return uploadImage(file, onProgress, {
    preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    prefix: 'destination',
  });
}

export function uploadTourImage(file, onProgress) {
  return uploadImage(file, onProgress, {
    preset:
      import.meta.env.VITE_CLOUDINARY_TOUR_UPLOAD_PRESET ||
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    prefix: 'tour',
  });
}
