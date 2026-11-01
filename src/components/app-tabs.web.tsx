import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import {
  Home,
  AlertCircle,
  MessageCircle,
  BookOpen,
  ClipboardList,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, MaxContentWidth, PALETTE } from '@/constants/theme';

interface TabButtonProps extends TabTriggerSlotProps {
  label: string;
  badge?: boolean;
  activeColor?: string;
  icon: (props: { color: string; size: number; focused: boolean }) => React.ReactNode;
}

export function TabButton({
  label,
  badge,
  activeColor = PALETTE.goldenYellow,
  icon,
  isFocused,
  ref: _ref,
  ...props
}: TabButtonProps) {
  const iconColor = isFocused ? activeColor : '#A794CF';
  const textColor = isFocused ? PALETTE.white : '#A794CF';

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconPill,
          isFocused && {
            backgroundColor:
              activeColor === PALETTE.vibrantCrimson
                ? 'rgba(255, 25, 59, 0.25)'
                : 'rgba(149, 41, 255, 0.35)',
          },
        ]}
      >
        {icon({ color: iconColor, size: 21, focused: !!isFocused })}
        {badge && <View style={styles.badgeDot} />}
      </View>
      <Text
        style={[
          styles.tabLabel,
          { color: textColor },
          isFocused && styles.tabLabelFocused,
        ]}
      >
        {label}
      </Text>
      {isFocused && (
        <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
      )}
    </Pressable>
  );
}

export function BottomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View
      {...props}
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View style={styles.tabBarInner}>{props.children}</View>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <BottomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton
              label="Home"
              activeColor={PALETTE.goldenYellow}
              icon={({ color, size, focused }) => (
                <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              )}
            />
          </TabTrigger>

          <TabTrigger name="report" href={'/(tabs)/report' as any} asChild>
            <TabButton
              label="Report"
              badge
              activeColor={PALETTE.vibrantCrimson}
              icon={({ color, size, focused }) => (
                <AlertCircle size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              )}
            />
          </TabTrigger>

          <TabTrigger name="chat" href={'/(tabs)/chat' as any} asChild>
            <TabButton
              label="Chat"
              activeColor={PALETTE.goldenYellow}
              icon={({ color, size, focused }) => (
                <MessageCircle size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              )}
            />
          </TabTrigger>

          <TabTrigger name="education" href={'/(tabs)/education' as any} asChild>
            <TabButton
              label="Education"
              activeColor={PALETTE.goldenYellow}
              icon={({ color, size, focused }) => (
                <BookOpen size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              )}
            />
          </TabTrigger>

          <TabTrigger name="records" href={'/(tabs)/records' as any} asChild>
            <TabButton
              label="Records"
              activeColor={PALETTE.goldenYellow}
              icon={({ color, size, focused }) => (
                <ClipboardList size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
              )}
            />
          </TabTrigger>
        </BottomTabList>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderTopWidth: 1.5,
    shadowColor: '#12042B',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 100,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
    minWidth: 0,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
  iconPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PALETTE.vibrantCrimson,
    borderWidth: 1.5,
    borderColor: '#260F56',
  },
  tabLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  tabLabelFocused: {
    fontFamily: Fonts.bold,
  },
  activeIndicator: {
    width: 12,
    height: 2.5,
    borderRadius: 2,
    marginTop: 2,
  },
});
