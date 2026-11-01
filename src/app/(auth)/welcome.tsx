import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

const COLORS = {
  ink: '#211421',
  accent: Colors.light.accent,
  paleMint: '#F8F1FD',
  palePink: '#F2E6FC',
};

export default function WelcomeScreen() {
  const { height, width } = useWindowDimensions();
  const compact = height < 720;
  const illustrationSize = Math.min(width * 0.67, compact ? 220 : 300);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.background} pointerEvents="none">
        <View style={styles.mintGlow} />
        <View style={styles.pinkGlow} />
        <View style={styles.softGlow} />
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationArea}>
          <View style={[styles.illustrationHalo, { width: illustrationSize, height: illustrationSize }]}>
            <Text
              accessibilityLabel="Illustration of a pregnant woman"
              style={[styles.illustration, { fontSize: illustrationSize * 0.82 }]}
            >
              🤰🏽
            </Text>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, compact && styles.compactTitle]}>
            Track Every{'\n'}Moment With
          </Text>
          <View style={styles.careLine}>
            <View style={styles.carePill}>
              <Text style={styles.motherEmoji}>🤱🏽</Text>
            </View>
            <Text style={[styles.title, compact && styles.compactTitle]}>Care</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination} accessibilityLabel="Welcome screen, step 1 of 3">
            <View style={styles.pageDot} />
            <View style={styles.pageDot} />
            <View style={styles.activePage} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue to login"
            onPress={() => router.replace('/(auth)/login')}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-forward" size={23} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.paleMint,
  },
  background: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  mintGlow: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 420,
    height: 480,
    borderRadius: 240,
    backgroundColor: '#F2E6FC',
  },
  pinkGlow: {
    position: 'absolute',
    right: -110,
    bottom: -180,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: COLORS.palePink,
  },
  softGlow: {
    position: 'absolute',
    left: -180,
    bottom: -225,
    width: 480,
    height: 440,
    borderRadius: 240,
    backgroundColor: '#FAF6FD',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 8,
  },
  illustrationArea: {
    flex: 1,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationHalo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  illustration: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  copy: {
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    color: COLORS.ink,
    fontSize: 35,
    lineHeight: 43,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  compactTitle: {
    fontSize: 30,
    lineHeight: 36,
  },
  careLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  carePill: {
    width: 116,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  motherEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  footer: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  activePage: {
    width: 29,
    height: 8,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  nextButton: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
