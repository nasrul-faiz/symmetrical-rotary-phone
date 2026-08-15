import sharp from 'sharp';

const CELL_SIZE = 720;
const BACKGROUND_COLOR = { r: 255, g: 255, b: 255, alpha: 1 };

async function normalizeImageForGrid(imageBuffer, width = CELL_SIZE, height = CELL_SIZE) {
  return sharp(imageBuffer)
    .rotate()
    .resize(width, height, {
      fit: 'cover',
      position: 'centre',
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}

function buildLayoutSlots(imageCount) {
  if (imageCount <= 1) {
    return {
      width: CELL_SIZE,
      height: CELL_SIZE,
      slots: [{ left: 0, top: 0, width: CELL_SIZE, height: CELL_SIZE }],
    };
  }

  if (imageCount === 2) {
    return {
      width: CELL_SIZE * 2,
      height: CELL_SIZE,
      slots: [
        { left: 0, top: 0, width: CELL_SIZE, height: CELL_SIZE },
        { left: CELL_SIZE, top: 0, width: CELL_SIZE, height: CELL_SIZE },
      ],
    };
  }

  if (imageCount === 3) {
    return {
      width: CELL_SIZE * 2,
      height: CELL_SIZE * 2,
      slots: [
        { left: 0, top: 0, width: CELL_SIZE, height: CELL_SIZE },
        { left: CELL_SIZE, top: 0, width: CELL_SIZE, height: CELL_SIZE },
        { left: 0, top: CELL_SIZE, width: CELL_SIZE * 2, height: CELL_SIZE },
      ],
    };
  }

  const rows = Math.ceil(imageCount / 2);
  const slots = [];

  for (let i = 0; i < imageCount; i += 1) {
    const row = Math.floor(i / 2);
    const isLastSingle = imageCount % 2 === 1 && i === imageCount - 1;

    if (isLastSingle) {
      slots.push({ left: 0, top: row * CELL_SIZE, width: CELL_SIZE * 2, height: CELL_SIZE });
      continue;
    }

    const col = i % 2;
    slots.push({
      left: col * CELL_SIZE,
      top: row * CELL_SIZE,
      width: CELL_SIZE,
      height: CELL_SIZE,
    });
  }

  return {
    width: CELL_SIZE * 2,
    height: rows * CELL_SIZE,
    slots,
  };
}

export async function buildImageGridCommandReply(imageBuffers) {
  const sourceImages = Array.isArray(imageBuffers)
    ? imageBuffers.filter((item) => Buffer.isBuffer(item))
    : (Buffer.isBuffer(imageBuffers) ? [imageBuffers] : []);

  if (sourceImages.length === 0) {
    return {
      type: 'image-grid',
      imageBuffer: null,
      mimetype: 'image/jpeg',
      caption: 'Sila hantar sekurang-kurangnya satu gambar bersama caption .grid.',
    };
  }

  try {
    const layout = buildLayoutSlots(sourceImages.length);

    const normalizedImages = await Promise.all(
      sourceImages.map((imageBuffer, index) => {
        const slot = layout.slots[index];
        return normalizeImageForGrid(imageBuffer, slot.width, slot.height);
      }),
    );

    const composites = normalizedImages.map((input, index) => {
      const slot = layout.slots[index];
      return {
        input,
        left: slot.left,
        top: slot.top,
      };
    });

    const output = await sharp({
      create: {
        width: layout.width,
        height: layout.height,
        channels: 4,
        background: BACKGROUND_COLOR,
      },
    })
      .composite(composites)
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      type: 'image-grid',
      imageBuffer: output,
      mimetype: 'image/jpeg',
      caption: undefined,
    };
  } catch {
    return {
      type: 'image-grid',
      imageBuffer: null,
      mimetype: 'image/jpeg',
      caption: 'Gagal gabung gambar.',
    };
  }
}
