/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const PALETTE = {
  deepViolet: '#421196',
  electricPurple: '#9529FF',
  goldenYellow: '#FFC719',
  vibrantCrimson: '#FF193B',
  deepRuby: '#B8001C',
  black: '#140826',
  white: '#FFFFFF',

  // Rich warm pastel card fills (reduces sterile whites)
  bgCanvas: '#F3EDFD',
  cardSurface: '#FAF6FE',
  cardLavender: '#ECE4FA',
  cardPeach: '#FFE8E4',
  cardAmber: '#FFF5D6',
  cardViolet: '#E2D6FB',
  cardRuby: '#FFE8EC',
  cardDeepViolet: '#331070',

  // Soft tints for badges and highlights
  purpleLight: '#EDE2FF',
  purpleSubtle: '#F4EEFD',
  yellowLight: '#FEF3C7',
  crimsonLight: '#FFE4E8',
  rubyLight: '#FCE7F3',

  // Neutral slate & warm violet scales
  gray50: '#F5EFFC',
  gray100: '#EDE4F7',
  gray200: '#DFCFF2',
  gray300: '#C5B2DF',
  gray400: '#9480B5',
  gray500: '#685685',
  gray600: '#4D3C66',
  gray700: '#382850',
  gray800: '#26183B',
  gray900: '#180D2C',
} as const;

export const Colors = {
  light: {
    text: '#180D2C',
    textSecondary: '#5E4D78',
    background: '#F3EDFD',
    backgroundElement: '#FAF6FE',
    backgroundSelected: '#E8DCFC',
    border: '#DFD2F5',
    primary: '#9529FF',
    primaryDark: '#421196',
    accentYellow: '#FFC719',
    accentCrimson: '#FF193B',
    accentRuby: '#B8001C',
    tabBarBackground: '#260F56',
    tabBarBorder: '#38167C',
    tabBarActive: '#FFC719',
    tabBarInactive: '#A994D4',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B9A7D9',
    background: '#0D051C',
    backgroundElement: '#1A0C38',
    backgroundSelected: '#2C145C',
    border: '#321669',
    primary: '#9529FF',
    primaryDark: '#421196',
    accentYellow: '#FFC719',
    accentCrimson: '#FF193B',
    accentRuby: '#B8001C',
    tabBarBackground: '#160833',
    tabBarBorder: '#2E1266',
    tabBarActive: '#FFC719',
    tabBarInactive: '#8A73B3',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extraBold: 'Poppins_800ExtraBold',
    sans: 'Poppins_400Regular',
    serif: 'ui-serif',
    rounded: 'Poppins_600SemiBold',
    mono: 'ui-monospace',
  },
  android: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extraBold: 'Poppins_800ExtraBold',
    sans: 'Poppins_400Regular',
    serif: 'serif',
    rounded: 'Poppins_600SemiBold',
    mono: 'monospace',
  },
  web: {
    regular: 'Poppins, -apple-system, sans-serif',
    medium: 'Poppins, -apple-system, sans-serif',
    semiBold: 'Poppins, -apple-system, sans-serif',
    bold: 'Poppins, -apple-system, sans-serif',
    extraBold: 'Poppins, -apple-system, sans-serif',
    sans: 'Poppins, var(--font-display), sans-serif',
    serif: 'var(--font-serif)',
    rounded: 'Poppins, var(--font-rounded), sans-serif',
    mono: 'var(--font-mono)',
  },
  default: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extraBold: 'Poppins_800ExtraBold',
    sans: 'Poppins_400Regular',
    serif: 'serif',
    rounded: 'Poppins_600SemiBold',
    mono: 'monospace',
  },
}) as {
  regular: string;
  medium: string;
  semiBold: string;
  bold: string;
  extraBold: string;
  sans: string;
  serif: string;
  rounded: string;
  mono: string;
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 84, android: 72, web: 76, default: 72 }) ?? 72;
export const MaxContentWidth = 800;

