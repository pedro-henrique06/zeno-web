import { AccessoryWidgetBackground, Gauge, ProgressView, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  opacity,
  progressViewStyle,
  tint,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { GoalWidgetProps } from './types';

/**
 * "Meta" widget: the goal's progress bar, percent and saved amount. Taps open the goals screen.
 * On the Lock Screen it becomes a progress ring or a short card, without brand colours.
 */
const GoalWidget = (props: Partial<GoalWidgetProps>, environment: WidgetEnvironment) => {
  'widget';
  const navy = '#1B2D48';
  const teal = '#5ECCC8';
  const white = '#FFFFFF';
  const fill = frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' });
  const showGoal = !!props.ready && !!props.hasGoal;
  const url = widgetURL(props.ready ? 'zeno://goals' : 'zeno://');

  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('clear', 'widget'), url]}>
        <AccessoryWidgetBackground />
        {showGoal ? (
          <Gauge
            value={props.progress ?? 0}
            modifiers={[gaugeStyle('circularCapacity')]}
            currentValueLabel={
              <Text modifiers={[font({ size: 14, weight: 'bold', design: 'rounded' }), lineLimit(1), minimumScaleFactor(0.5)]}>
                {props.percentText ?? ''}
              </Text>
            }
          />
        ) : (
          <Text modifiers={[font({ size: 12, weight: 'bold' })]}>Zeno</Text>
        )}
      </ZStack>
    );
  }

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[frame({ maxWidth: 10000, alignment: 'leading' }), containerBackground('clear', 'widget'), url]}
      >
        <Text modifiers={[font({ size: 12, weight: 'semibold' }), opacity(0.7), lineLimit(1)]}>
          {showGoal ? (props.name ?? '') : (props.title ?? 'Zeno')}
        </Text>
        {showGoal ? (
          <VStack alignment="leading" spacing={2}>
            <Text modifiers={[font({ size: 20, weight: 'bold', design: 'rounded' }), lineLimit(1)]}>
              {props.percentText ?? ''}
            </Text>
            <ProgressView value={props.progress ?? 0} modifiers={[progressViewStyle('linear')]} />
          </VStack>
        ) : (
          <Text modifiers={[font({ size: 12 }), opacity(0.7), lineLimit(2)]}>{props.emptyText ?? ''}</Text>
        )}
      </VStack>
    );
  }

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
