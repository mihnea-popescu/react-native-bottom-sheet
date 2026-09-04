import {
  type AnimationCallback,
  type ReduceMotion,
  type WithSpringConfig,
  type WithTimingConfig,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ANIMATION_CONFIGS, ANIMATION_METHOD } from '../constants';

interface AnimateParams {
  point: number;
  velocity?: number;
  configs?: WithSpringConfig | WithTimingConfig;
  overrideReduceMotion?: ReduceMotion;
  onComplete?: AnimationCallback;
}

export const animate = ({
  point,
  configs,
  velocity = 0,
  overrideReduceMotion,
  onComplete,
}: AnimateParams) => {
  'worklet';

  /**
   * `configs` is either the shared `ANIMATION_CONFIGS` singleton - captured once
   * per runtime and used by every sheet in the app - or the caller's own memoized
   * `animationConfigs` object. Neither may be written into, so we keep a local
   * reference and copy before applying any override.
   */
  let _configs = configs ?? ANIMATION_CONFIGS;

  // Users might have an accessibility setting to reduce motion turned on.
  // This prevents the animation from running when presenting the sheet, which results in
  // the bottom sheet not even appearing so we need to override it to ensure the animation runs.
  // configs.reduceMotion = ReduceMotion.Never;

  if (overrideReduceMotion) {
    _configs = { ..._configs, reduceMotion: overrideReduceMotion };
  }

  // detect animation type
  const type =
    'duration' in _configs || 'easing' in _configs
      ? ANIMATION_METHOD.TIMING
      : ANIMATION_METHOD.SPRING;

  if (type === ANIMATION_METHOD.TIMING) {
    return withTiming(point, _configs as WithTimingConfig, onComplete);
  }

  return withSpring(
    point,
    Object.assign({ velocity }, _configs) as WithSpringConfig,
    onComplete
  );
};
