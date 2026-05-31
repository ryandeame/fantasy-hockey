import { View } from 'react-native';

import { RenderedAlphaMask } from '@/components/collision/alpha-mask-collision';

type AlphaMaskDebugProjectionProps = {
  mask: RenderedAlphaMask | null;
  size?: number;
};

export function AlphaMaskDebugProjection(_props: AlphaMaskDebugProjectionProps) {
  return <View pointerEvents="none" />;
}
