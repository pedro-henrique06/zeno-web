import { ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  opacity,
  progressViewStyle,
  tint,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget } from 'expo-widgets';
import type { GoalWidgetProps } from './types';

/** "Meta" widget: the goal's progress bar, percent and saved amount. Taps open the goals screen. */
const GoalWidget = (props: Partial<GoalWidgetProps>) => {
  'widget';
  const navy = '#1B2D48';
  const teal = '#5ECCC8';
  const white = '#FFFFFF';
  const fill = frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' });

  if (!props.ready || !props.hasGoal) {
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[fill, containerBackground(navy, 'widget'), widgetURL(props.ready ? 'zeno://goals' : 'zeno://')]}
      >
        <Text modifiers={[font({ size: 13, weight: 'bold' }), foregroundStyle(white)]}>{props.title ?? 'Zeno'}</Text>
        <Spacer />
        <Text modifiers={[font({ size: 13 }), foregroundStyle(white), opacity(0.7)]}>{props.emptyText ?? ''}</Text>
      </VStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={6} modifiers={[fill, containerBackground(navy, 'widget'), widgetURL('zeno://goals')]}>
      <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(white), opacity(0.6)]}>
        {props.title ?? ''}
      </Text>
      <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(white), lineLimit(2)]}>{props.name ?? ''}</Text>
      <Spacer />
      <Text
        modifiers={[font({ size: 28, weight: 'bold', design: 'rounded' }), foregroundStyle(teal), lineLimit(1), minimumScaleFactor(0.5)]}
      >
        {props.percentText ?? ''}
      </Text>
      <ProgressView value={props.progress ?? 0} modifiers={[progressViewStyle('linear'), tint(teal)]} />
      <Text modifiers={[font({ size: 11 }), foregroundStyle(white), opacity(0.6), lineLimit(1), minimumScaleFactor(0.6)]}>
        {props.amountsLine ?? ''}
      </Text>
    </VStack>
  );
};

export default createWidget('ZenoGoal', GoalWidget);
