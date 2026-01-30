import React, { useEffect, useRef, useState } from 'react';

interface AnimationData {
  start: number;
  end: number;
  fps: number;
}

interface SpriteMetadata {
  meta: {
    image: string;
    frameWidth: number;
    frameHeight: number;
    columns: number;
    totalFrames: number;
  };
  animations: {
    [key: string]: AnimationData;
  };
}

interface SpriteAnimatorProps {
  spriteSheet: string;
  metadata: SpriteMetadata;
  animation: string;
  width?: number;
  height?: number;
  loop?: boolean;
  onComplete?: () => void;
  paused?: boolean;
}

export const SpriteAnimator: React.FC<SpriteAnimatorProps> = ({
  spriteSheet,
  metadata,
  animation,
  width = 64,
  height = 64,
  loop = true,
  onComplete,
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameIndexRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const [currentAnim, setCurrentAnim] = useState(animation);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Load sprite sheet image
  useEffect(() => {
    const img = new Image();
    img.src = `/${spriteSheet}`;
    img.onload = () => {
      console.log(`✅ Loaded sprite sheet: ${spriteSheet}`, img.width, 'x', img.height);
      imageRef.current = img;
      setIsImageLoaded(true);
    };
    img.onerror = (e) => {
      console.error(`❌ Failed to load sprite sheet: ${spriteSheet}`, e);
    };
  }, [spriteSheet]);

  // Reset frame index when animation changes
  useEffect(() => {
    if (animation !== currentAnim) {
      frameIndexRef.current = 0;
      setCurrentAnim(animation);
    }
  }, [animation, currentAnim]);

  // Animation rendering loop
  useEffect(() => {
    if (!isImageLoaded || !imageRef.current || !canvasRef.current || paused) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animData = metadata.animations[animation];
    if (!animData) {
      console.warn(`Animation "${animation}" not found in metadata`);
      return;
    }

    const frameCount = animData.end - animData.start + 1;
    const frameDuration = 1000 / animData.fps;

    const render = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameDuration) {
        // Update frame
        frameIndexRef.current++;

        if (frameIndexRef.current >= frameCount) {
          if (loop) {
            frameIndexRef.current = 0;
          } else {
            frameIndexRef.current = frameCount - 1;
            if (onComplete) {
              onComplete();
            }
            return;
          }
        }

        lastFrameTimeRef.current = timestamp;
      }

      // Calculate frame position in sprite sheet
      const absoluteFrameIndex = animData.start + frameIndexRef.current;
      
      // Clamp frame index to valid range
      const clampedFrameIndex = Math.max(0, Math.min(absoluteFrameIndex, metadata.meta.totalFrames - 1));
      
      const col = clampedFrameIndex % metadata.meta.columns;
      const row = Math.floor(clampedFrameIndex / metadata.meta.columns);

      const sx = col * metadata.meta.frameWidth;
      const sy = row * metadata.meta.frameHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw frame
      try {
        ctx.drawImage(
          imageRef.current!,
          sx,
          sy,
          metadata.meta.frameWidth,
          metadata.meta.frameHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } catch (error) {
        console.error('Error drawing frame:', error);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isImageLoaded, animation, metadata, loop, onComplete, paused]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};
