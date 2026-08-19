export interface SequencePosition {
  currentIndex: number;
  nextIndex: number;
  blend: number;
}

export interface CoverRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getSequencePosition(progress: number, frameCount: number): SequencePosition {
  if (frameCount <= 1) return { currentIndex: 0, nextIndex: 0, blend: 0 };

  const scaled = clamp01(progress) * (frameCount - 1);
  const currentIndex = Math.floor(scaled);
  const nextIndex = Math.min(frameCount - 1, currentIndex + 1);

  return {
    currentIndex,
    nextIndex,
    blend: nextIndex === currentIndex ? 0 : scaled - currentIndex,
  };
}

export function getCoverRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): CoverRect {
  if (sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height,
  };
}
