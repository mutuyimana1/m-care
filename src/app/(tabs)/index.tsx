
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#087F8C',
  primaryDark: '#075D68',
  primaryLight: '#E5F5F4',
  background: '#F5F8FA',
  white: '#FFFFFF',
  text: '#18343B',
  muted: '#71848A',
  border: '#E4EBEE',
  warning: '#9A5A08',
  warningBg: '#FFF3DD',
  success: '#26734D',
  successBg: '#E7F6ED',
  coral: '#D96C56',
  lavender: '#F0ECFF',
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function ActionCard({
  icon,
  title,
  description,
  background,
  iconColor,
  isWide,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  background: string;
  iconColor: string;
  isWide?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        isWide && styles.actionCardWide,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: background }]}>
        <Ionicons name={icon} size={23} color={iconColor} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color={COLORS.muted} />
    </Pressable>
  );
}

function EducationCard({
  icon,
  title,
  background,
  iconColor,
  onPress,
}: {
  icon: IconName;
  title: string;
  background: string;
  iconColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.educationCard,
        { backgroundColor: background },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={27} color={iconColor} />
      <Text style={styles.educationCardTitle}>{title}</Text>
      <Ionicons
        name="arrow-forward"
        size={18}
        color={iconColor}
        style={styles.educationArrow}
      />
    </Pressable>
  );
}

export default function HomeScreen() {
  const [language, setLanguage] = useState<'EN' | 'RW'>('EN');
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const copy = {
    EN: {
      greeting: 'Hello, welcome to',
      subtitle: 'Your maternal health companion',
      healthTitle: 'Your health matters',
      healthDescription:
        'Have a health concern? Share it with your healthcare team.',
      report: 'Report a concern',
      support: 'Professional support',
      education: 'Health education',
      followup: 'My follow-ups',
      quickActions: 'How can we help you?',
      quickDescription:
        'Choose a service to get started.',
      careTitle: 'Your care and follow-up',
      careDescription:
        'Keep track of your reported concerns and referrals.',
      viewDetails: 'View details',
      educationTitle: 'Learn about your health',
      educationDescription:
        'Explore pregnancy and postnatal health information.',
      pregnancy: 'Pregnancy care',
      nutrition: 'Nutrition',
      postnatal: 'Postnatal care',
      supportTitle: 'Need someone to talk to?',
      supportDescription:
        'Connect with a qualified healthcare professional for guidance.',
      chatNow: 'Contact a professional',
      privacy: 'Your privacy matters',
      privacyDescription:
        'Your health information should only be accessible to authorized people.',
      demo: 'Prototype preview',
      demoDescription:
        'This screen uses sample information. Health services and alerts must be connected and verified before real-world use.',
      status: 'No live updates',
    },
    RW: {
      greeting: 'Muraho, karibu kuri',
      subtitle: 'Umufasha wawe mu buzima bw’umubyeyi',
      healthTitle: 'Ubuzima bwawe ni ingenzi',
      healthDescription:
        'Ufite ikibazo cy’ubuzima? Kigeze ku itsinda ry’abaganga bakwitaho.',
      report: 'Tanga amakuru',
      support: 'Ubufasha bw’abaganga',
      education: 'Inyigisho z’ubuzima',
      followup: 'Gukurikirana ubuvuzi',
      quickActions: 'Twagufasha dute?',
      quickDescription: 'Hitamo serivisi ukeneye.',
      careTitle: 'Ubuvuzi bwawe',
      careDescription:
        'Kurikirana ibibazo watanze n’uburyo bwo koherezwa ku yindi serivisi.',
      viewDetails: 'Reba ibisobanuro',
      educationTitle: 'Menya ibijyanye n’ubuzima bwawe',
      educationDescription:
        'Soma amakuru ajyanye no gutwita no kwita ku mwana nyuma yo kubyara.',
      pregnancy: 'Kwita ku utwite',
      nutrition: 'Imirire',
      postnatal: 'Kwita ku mubyeyi nyuma yo kubyara',
      supportTitle: 'Ukeneye umuntu muganira?',
      supportDescription:
        'Vugana n’umuganga ubifitiye ubumenyi kugira ngo akugire inama.',
      chatNow: 'Vugana n’umuganga',
      privacy: 'Ibanga ry’amakuru yawe ni ingenzi',
      privacyDescription:
        'Amakuru y’ubuzima bwawe agomba kubonwa n’ababyemerewe gusa.',
      demo: 'Urugero rw’imikorere ya porogaramu',
      demoDescription:
        'Aya makuru ni ayo kugerageza. Serivisi z’ubuzima n’amatangazo bigomba kubanza guhuzwa no kugenzurwa mbere yo gukoreshwa.',
      status: 'Nta makuru mashya ahari',
    },
  }[language];

  const navigate = (path: string) => {
    // Connect these destinations to the corresponding screens
    // when their Expo Router files are implemented.
    try {
      router.push(path as never);
    } catch {
      Alert.alert(
        'Coming soon',
        'This service will be available when its screen is connected.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
     <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.page, isWide && styles.pageWide]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Ionicons
                  name="heart"
                  size={23}
                  color={COLORS.white}
                />
                <View style={styles.logoPlus}>
                  <Ionicons name="add" size={12} color={COLORS.primary} />
                </View>
              </View>

              <View>
                <Text style={styles.brandName}>M-CARE</Text>
                <Text style={styles.brandSubtitle}>Maternal care & support</Text>
              </View>
            </View>
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Open profile menu"
  // onPress={() => setProfileMenuVisible((visible) => !visible)}
  // style={styles.profileButton}
>
  <Ionicons name="person-outline" size={23} color="#087F8C" />
</Pressable>
            <View style={styles.headerActions}>
              <View style={styles.languageToggle}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Use English"
                  onPress={() => setLanguage('EN')}
                  style={[
                    styles.languageButton,
                    language === 'EN' && styles.languageActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.languageText,
                      language === 'EN' && styles.languageTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Use Kinyarwanda"
                  onPress={() => setLanguage('RW')}
                  style={[
                    styles.languageButton,
                    language === 'RW' && styles.languageActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.languageText,
                      language === 'RW' && styles.languageTextActive,
                    ]}
                  >
                    RW
                  </Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                onPress={() =>
                  Alert.alert(
                    'Notifications',
                    'Live notifications are not connected in this prototype.',
                  )
                }
                style={styles.notificationButton}
              >
                <Ionicons
                  name="notifications-outline"
                  size={23}
                  color={COLORS.text}
                />
              </Pressable>
            </View>
          </View>

          {/* Welcome */}
          <View style={styles.welcome}>
            <Text style={styles.greeting}>{copy.greeting}</Text>
            <Text style={styles.welcomeTitle}>M-CARE</Text>
            <Text style={styles.welcomeSubtitle}>{copy.subtitle}</Text>
          </View>

          {/* Main hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Ionicons
                  name="heart-circle-outline"
                  size={17}
                  color={COLORS.primaryDark}
                />
                <Text style={styles.heroBadgeText}>Care starts with you</Text>
              </View>

              <Text style={styles.heroTitle}>{copy.healthTitle}</Text>
              <Text style={styles.heroDescription}>
                {copy.healthDescription}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigate('/report-symptoms')}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.primaryButtonText}>{copy.report}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.white}
                />
              </Pressable>
            </View>

            <View style={styles.heroIllustration}>
              <View style={styles.heroCircle}>
                <Ionicons
                  name="heart"
                  size={66}
                  color={COLORS.primary}
                />
                <View style={styles.heroSparkle}>
                  <Ionicons
                    name="medical"
                    size={24}
                    color={COLORS.coral}
                  />
                </View>
              </View>
              <View style={styles.heroSmallCircle}>
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={COLORS.success}
                />
              </View>
            </View>
          </View>

          {/* Prototype status */}
          <View style={styles.demoNotice}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.warning}
            />
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>{copy.demo}</Text>
              <Text style={styles.noticeDescription}>
                {copy.demoDescription}
              </Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionTitle}>{copy.quickActions}</Text>
                <Text style={styles.sectionSubtitle}>
                  {copy.quickDescription}
                </Text>
              </View>
              <Ionicons
                name="apps-outline"
                size={23}
                color={COLORS.primary}
              />
            </View>

            <View style={[styles.actionGrid, isWide && styles.actionGridWide]}>
              <ActionCard
                icon="chatbox-ellipses-outline"
                title={copy.report}
                description="Share a health concern"
                background={COLORS.primaryLight}
                iconColor={COLORS.primary}
                isWide={isWide}
                onPress={() => navigate('/report-symptoms')}
              />

              <ActionCard
                icon="chatbubbles-outline"
                title={copy.support}
                description="Message a health professional"
                background={COLORS.lavender}
                iconColor="#6951B8"
                isWide={isWide}
                onPress={() => navigate('/chat')}
              />

              <ActionCard
                icon="book-outline"
                title={copy.education}
                description="Read trusted health information"
                background="#FFF0E8"
                iconColor={COLORS.coral}
                isWide={isWide}
                onPress={() => navigate('/education')}
              />

              <ActionCard
                icon="clipboard-outline"
                title={copy.followup}
                description="Review follow-ups and referrals"
                background={COLORS.successBg}
                iconColor={COLORS.success}
                isWide={isWide}
                onPress={() => navigate('/referrals')}
              />
            </View>
          </View>

          {/* Follow-up */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionTitle}>{copy.careTitle}</Text>
                <Text style={styles.sectionSubtitle}>
                  {copy.careDescription}
                </Text>
              </View>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigate('/referrals')}
              style={({ pressed }) => [
                styles.followupCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.followupIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={25}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.followupText}>
                <Text style={styles.followupTitle}>{copy.followup}</Text>
                <Text style={styles.followupDescription}>
                  {copy.status}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.muted}
              />
            </Pressable>
          </View>

          {/* Health education */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionTitle}>{copy.educationTitle}</Text>
                <Text style={styles.sectionSubtitle}>
                  {copy.educationDescription}
                </Text>
              </View>
            </View>

            <View style={[styles.educationGrid, isWide && styles.educationGridWide]}>
              <EducationCard
                icon="heart-outline"
                title={copy.pregnancy}
                background={COLORS.primaryLight}
                iconColor={COLORS.primaryDark}
                onPress={() => navigate('/education')}
              />
              <EducationCard
                icon="nutrition-outline"
                title={copy.nutrition}
                background="#FFF0E8"
                iconColor={COLORS.coral}
                onPress={() => navigate('/education')}
              />
              <EducationCard
                icon="flower-outline"
                title={copy.postnatal}
                background={COLORS.lavender}
                iconColor="#6951B8"
                onPress={() => navigate('/education')}
              />
            </View>
          </View>

          {/* Professional support */}
          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Ionicons
                name="people-outline"
                size={29}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.supportTitle}>{copy.supportTitle}</Text>
            <Text style={styles.supportDescription}>
              {copy.supportDescription}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigate('/chat')}
              style={({ pressed }) => [
                styles.supportButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.supportButtonText}>{copy.chatNow}</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={COLORS.white}
              />
            </Pressable>
          </View>

          {/* Privacy */}
          <View style={styles.privacyCard}>
            <Ionicons
              name="lock-closed-outline"
              size={23}
              color={COLORS.success}
            />
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>{copy.privacy}</Text>
              <Text style={styles.privacyDescription}>
                {copy.privacyDescription}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerBrand}>
              <Ionicons
                name="heart"
                size={15}
                color={COLORS.primary}
              />
              <Text style={styles.footerBrandText}>M-CARE</Text>
            </View>
            <Text style={styles.footerText}>
              Maternal Community Alert, Response and Referral System
            </Text>
            <Text style={styles.footerText}>Rwanda · {new Date().getFullYear()}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  page: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  pageWide: {
    maxWidth: 1000,
    paddingHorizontal: 32,
  },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlus: {
    position: 'absolute',
    right: -3,
    top: -3,
    backgroundColor: COLORS.white,
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.text,
  },
  brandSubtitle: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  languageToggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    backgroundColor: '#E9EFF1',
  },
  languageButton: {
    minWidth: 36,
    minHeight: 32,
    paddingHorizontal: 7,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageActive: {
    backgroundColor: COLORS.white,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  languageTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  notificationButton: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcome: {
    paddingTop: 16,
    paddingBottom: 21,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.muted,
  },
  welcomeTitle: {
    marginTop: 4,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  welcomeSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.muted,
  },
  heroCard: {
    backgroundColor: '#E5F5F3',
    borderRadius: 25,
    padding: 21,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 10,
  },
  heroContent: {
    flex: 1,
    minWidth: 0,
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: '#FFFFFFB8',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  heroTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 16,
    letterSpacing: -0.4,
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#526A70',
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 13,
    minHeight: 46,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  heroIllustration: {
    width: 105,
    height: 135,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#FFFFFFB8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSparkle: {
    position: 'absolute',
    top: 5,
    right: 3,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSmallCircle: {
    position: 'absolute',
    bottom: 3,
    left: 1,
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  demoNotice: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    backgroundColor: COLORS.warningBg,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F3E0B9',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.warning,
  },
  noticeDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#795D35',
    marginTop: 4,
  },
  section: {
    marginTop: 29,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 15,
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    marginTop: 4,
  },
  actionGrid: {
    gap: 11,
  },
  actionGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    minHeight: 91,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
  },
  actionCardWide: {
    width: '48%',
    flexGrow: 1,
  },
  actionIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  actionDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
  },
  followupCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followupIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followupText: {
    flex: 1,
    gap: 5,
  },
  followupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  followupDescription: {
    fontSize: 11,
    color: COLORS.muted,
  },
  educationGrid: {
    gap: 10,
  },
  educationGridWide: {
    flexDirection: 'row',
  },
  educationCard: {
    minHeight: 78,
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  educationCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 19,
  },
  educationArrow: {
    marginLeft: 'auto',
  },
  supportCard: {
    marginTop: 29,
    padding: 23,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  supportIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  supportDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 310,
  },
  supportButton: {
    marginTop: 18,
    width: '100%',
    minHeight: 48,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  supportButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  privacyCard: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.successBg,
    padding: 15,
    borderRadius: 16,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.success,
  },
  privacyDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#426A56',
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 27,
    gap: 6,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerBrandText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.text,
  },
  footerText: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    color: COLORS.muted,
  },
  pressed: {
    opacity: 0.78,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
