import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type TextInputProps,
} from 'react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/localized-text';
import { useLanguage } from '@/contexts/language-context';

export const UI = {
  background: '#FBF8FD',
  white: '#FFFFFF',
  ink: '#211421',
  muted: '#77717C',
  accent: '#C486F8',
  accentDark: '#8F59BB',
  lavender: '#F2E6FC',
  border: '#EEE7F1',
  green: '#438875',
  greenLight: '#E8F4EF',
  amber: '#A56B26',
  amberLight: '#FFF4E4',
  red: '#B54F5A',
};

export function Page({ children, ...props }: ScrollViewProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        {...props}
        style={styles.scroll}
        contentContainerStyle={[styles.page, props.contentContainerStyle]}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel = 'Go back',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);

  const logout = () => {
    signOut();
  };

  return (
    <>
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={21} color={UI.accentDark} />
          </Pressable>
        ) : null}
        <View style={styles.headerCopy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Change language')}
            onPress={() => setLanguageMenuVisible(true)}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
            <Ionicons name="language-outline" size={20} color={UI.accentDark} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sign out ${user?.name ?? ''}`}
            onPress={logout}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
            <Ionicons name="log-out-outline" size={20} color={UI.accentDark} />
          </Pressable>
        </View>
      </View>
      <Modal
        visible={languageMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageMenuVisible(false)}>
        <View style={styles.languageOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Close language selection')}
            onPress={() => setLanguageMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.languageCard}>
            <Text style={styles.languageTitle}>Change language</Text>
            {(['en', 'rw'] as const).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: language === option }}
                onPress={() => {
                  setLanguage(option);
                  setLanguageMenuVisible(false);
                }}
                style={[
                  styles.languageOption,
                  language === option && styles.languageOptionSelected,
                ]}>
                <Text style={styles.languageOptionText}>
                  {option === 'en' ? 'English' : 'Kinyarwanda'}
                </Text>
                {language === option ? (
                  <Ionicons name="checkmark-circle" size={18} color={UI.accentDark} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  ...props
}: TextInputProps & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#A6A0AA"
        style={[styles.input, props.multiline && styles.multiline]}
        {...props}
      />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      {icon ? <Ionicons name={icon} size={18} color={UI.white} /> : null}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function StatusPill({
  label,
  tone = 'green',
}: {
  label: string;
  tone?: 'green' | 'amber' | 'lavender';
}) {
  const toneStyle =
    tone === 'amber' ? styles.pillAmber : tone === 'lavender' ? styles.pillLavender : styles.pillGreen;
  const textStyle =
    tone === 'amber'
      ? styles.pillAmberText
      : tone === 'lavender'
        ? styles.pillLavenderText
        : styles.pillGreenText;
  return (
    <View style={[styles.pill, toneStyle]}>
      <Text style={[styles.pillText, textStyle]}>{label}</Text>
    </View>
  );
}

export function IconTile({
  name,
  color = UI.accentDark,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
}) {
  return (
    <View style={styles.iconTile}>
      <Ionicons name={name} size={21} color={color} />
    </View>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not recorded'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  scroll: { flex: 1, backgroundColor: UI.background },
  page: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerActions: { flexDirection: 'row', gap: 7 },
  headerCopy: { flex: 1, gap: 4 },
  eyebrow: { color: UI.accentDark, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: UI.ink, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: UI.muted, fontSize: 14, lineHeight: 20, maxWidth: 540 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.lavender,
    borderWidth: 1,
    borderColor: '#E9D8F7',
  },
  languageOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22, backgroundColor: 'rgba(24,18,30,0.28)' },
  languageCard: { width: '100%', maxWidth: 360, padding: 16, gap: 8, borderRadius: 20, backgroundColor: UI.white, borderWidth: 1, borderColor: UI.border },
  languageTitle: { color: UI.ink, fontSize: 16, fontWeight: '800', paddingBottom: 4 },
  languageOption: { minHeight: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderRadius: 12 },
  languageOptionSelected: { backgroundColor: UI.lavender },
  languageOptionText: { flex: 1, color: UI.ink, fontSize: 13, fontWeight: '700' },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.lavender,
    borderWidth: 1,
    borderColor: '#E9D8F7',
  },
  avatarText: { color: UI.accentDark, fontWeight: '800', fontSize: 17 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: UI.ink, fontSize: 17, fontWeight: '800' },
  sectionAction: { color: UI.accentDark, fontSize: 13, fontWeight: '700' },
  card: {
    padding: 18,
    gap: 13,
    borderRadius: 20,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#31173B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 1,
  },
  label: { color: UI.ink, fontWeight: '800', fontSize: 14 },
  field: { gap: 7 },
  fieldLabel: { color: '#514B55', fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 13,
    color: UI.ink,
    backgroundColor: '#FFFEFF',
    fontSize: 14,
  },
  multiline: { minHeight: 86, paddingTop: 12, textAlignVertical: 'top' },
  primaryButton: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: UI.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButtonText: { color: UI.white, fontSize: 14, fontWeight: '800' },
  disabledButton: { backgroundColor: '#C7B5D3' },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E4D7EB',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.white,
  },
  secondaryButtonText: { color: UI.accentDark, fontWeight: '800', fontSize: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '800' },
  pillGreen: { backgroundColor: UI.greenLight },
  pillGreenText: { color: UI.green },
  pillAmber: { backgroundColor: UI.amberLight },
  pillAmberText: { color: UI.amber },
  pillLavender: { backgroundColor: UI.lavender },
  pillLavenderText: { color: UI.accentDark },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: UI.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 8 },
  infoLabel: { color: UI.muted, fontSize: 13, flex: 1 },
  infoValue: { color: UI.ink, fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' },
});
