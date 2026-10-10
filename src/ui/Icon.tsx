import { SymbolView, type SFSymbol, type SymbolWeight } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';

export type IonName = keyof typeof Ionicons.glyphMap;

/** An SF Symbol on iOS (the system's own icons), with an Ionicons twin for web and Android. */
export function Icon({
  sf,
  ion,
  size = 20,
  color,
  weight = 'semibold',
}: {
  sf: SFSymbol;
  ion: IonName;
  size?: number;
  color: string;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      name={sf}
      size={size}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
      fallback={<Ionicons name={ion} size={size} color={color} />}
    />
  );
}
