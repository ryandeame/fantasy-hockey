import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { RenderedAlphaMask } from '@/components/collision/alpha-mask-collision';

type AlphaMaskDebugProjectionProps = {
  mask: RenderedAlphaMask | null;
};

export function AlphaMaskDebugProjection({ mask }: AlphaMaskDebugProjectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const width = mask?.width ?? 1;
  const height = mask?.height ?? 1;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);

    if (!mask) {
      context.fillStyle = '#39ff14';
      context.fillRect(0, 0, 1, 1);
      return;
    }

    const imageData = context.createImageData(mask.width, mask.height);

    for (let alphaIndex = 0, rgbaIndex = 0; alphaIndex < mask.alpha.length; alphaIndex += 1) {
      const alpha = mask.alpha[alphaIndex];
      imageData.data[rgbaIndex] = 57;
      imageData.data[rgbaIndex + 1] = 255;
      imageData.data[rgbaIndex + 2] = 20;
      imageData.data[rgbaIndex + 3] = alpha;
      rgbaIndex += 4;
    }

    context.putImageData(imageData, 0, 0);
  }, [height, mask, width]);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          height,
          marginLeft: -width / 2,
          marginTop: -height / 2,
          width,
        },
      ]}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          height,
          width,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 7,
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.9)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
