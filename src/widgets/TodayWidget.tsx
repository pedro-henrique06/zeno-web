import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  opacity,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { TodayWidgetProps } from './types';

/**
 * "Hoje" widget: what is still available to spend today; the medium size adds the month balance.
 * The body runs in the widget extension (see the 'widget' directive), so colours live inside it.
 */
const TodayWidget = (props: Partial<TodayWidgetProps>, environment: WidgetEnvironment) => {
  'widget';
  const navy = '#1B2D48';
  const green = '#2DC579';
  const red = '#E86B52';
  const white = '#FFFFFF';
  const medium = environment.widgetFamily === 'systemMedium';

  if (!props.ready) {
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' }), containerBackground(navy, 'widget'), widgetURL('zeno://')]}
      >
        <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(white)]}>Zeno</Text>
        <Spacer />
        <Text modifiers={[font({ size: 13 }), foregroundStyle(white), opacity(0.7)]}>
          {props.emptyText ?? ''}
        </Text>
      </VStack>
    );
  }

  const today = (
    <VStack alignment="leading" spacing={4}>
      <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(white), opacity(0.6)]}>
        {props.todayLabel ?? ''}
      </Text>
      <Text
        modifiers={[
          font({ size: medium ? 30 : 26, weight: 'bold', design: 'rounded' }),
          foregroundStyle(props.todayNegative ? red : green),
          lineLimit(1),
          minimumScaleFactor(0.5),
        ]}
      >
        {props.todayValue ?? ''}
      </Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle(white), opacity(0.6), lineLimit(2), minimumScaleFactor(0.8)]}>
        {props.spentLine ?? ''}
      </Text>
    </VStack>
  );

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' }), containerBackground(navy, 'widget'), widgetURL('zeno://')]}
    >
      <Text modifiers={[font({ size: 13, weight: 'bold' }), foregroundStyle(white)]}>Zeno</Text>
      <Spacer />
      {medium ? (
        <HStack alignment="bottom" spacing={12}>
          {today}
          <Spacer />
          <VStack alignment="trailing" spacing={4}>
            <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(white), opacity(0.6)]}>
              {props.monthLabel ?? ''}
            </Text>
            <Text
              modifiers={[
                font({ size: 20, weight: 'bold', design: 'rounded' }),
                foregroundStyle(props.monthNegative ? red : white),
                lineLimit(1),
                minimumScaleFactor(0.5),
              ]}
            >
              {props.monthValue ?? ''}
            </Text>
          </VStack>
        </HStack>
      ) : (
        today
      )}
    </VStack>
  );
};

export default createWidget('ZenoToday', TodayWidget);
