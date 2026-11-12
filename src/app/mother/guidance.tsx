import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Page, PageHeader, SectionHeading, UI } from '@/components/mcare-ui';

const guidanceItems = [
  {
    icon: 'nutrition-outline' as const,
    title: 'Food and hydration',
    text: 'Choose a variety of familiar foods when available, including vegetables, beans or other protein, and whole grains. Drink safe water regularly.',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Antenatal visits',
    text: 'Keep the appointment schedule agreed with your health team. Ask about test results, screening, and any questions you have.',
  },
  {
    icon: 'medkit-outline' as const,
    title: 'Medicines and supplements',
    text: 'Use medicines and supplements only as prescribed or confirmed by your healthcare professional. Ask before starting or stopping a medicine.',
  },
  {
    icon: 'fitness-outline' as const,
    title: 'Checks and screening',
    text: 'Attend the checks recommended by your health team. Ask them to explain your blood pressure and test results; this app does not interpret them.',
  },
  {
    icon: 'shield-outline' as const,
    title: 'Preventing infections',
    text: 'Ask your health team which infection screening and prevention steps are right for you. Follow the advice given by your local facility.',
  },
  {
    icon: 'heart-outline' as const,
    title: 'Emotional wellbeing',
    text: 'Rest when you can and share concerns with someone you trust or your healthcare professional.',
  },
  {
    icon: 'alert-circle-outline' as const,
    title: 'When to seek urgent help',
    text: 'For heavy bleeding, severe pain, severe headache, vision changes, convulsions, trouble breathing, fever, or another urgent concern, contact your local health facility or emergency service now. Do not wait for an app or chat reply.',
  },
  {
    icon: 'briefcase-outline' as const,
    title: 'Getting ready for birth',
    text: 'Ask your health team when to plan for birth, where to go, how to get there, and whom to contact. Follow the plan agreed with your facility.',
  },
];

export default function MotherGuidanceScreen() {
  return (
    <Page>
      <PageHeader
        eyebrow="YOUR LEARNING SPACE"
        title="Guidance for you"
        subtitle="Simple, practical information to discuss with your care team."
      />

      <View style={styles.languageBanner}>
        <Ionicons name="language-outline" size={19} color={UI.accentDark} />
        <Text style={styles.languageText}>
          Your preferred language is recorded on your profile. This demo guidance is in English and requires review and translation by your local care team before clinical use.
        </Text>
      </View>

      {guidanceItems.map((item) => (
        <Card key={item.title}>
          <View style={styles.heading}>
            <View style={styles.icon}>
              <Ionicons name={item.icon} size={20} color={item.title.startsWith('When') ? UI.red : UI.accentDark} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Text style={styles.copy}>{item.text}</Text>
        </Card>
      ))}

      <SectionHeading title="After delivery" />
      <Card>
        <Text style={styles.title}>Your care continues postpartum</Text>
        <Text style={styles.copy}>
          Stay connected with your health facility after birth. Ask your care team about your
          postpartum check, recovery, feeding support, and newborn care.
        </Text>
      </Card>

      <Text style={styles.disclaimer}>
        Educational content in this prototype is illustrative and should be reviewed and approved
        by local clinical teams before use.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  languageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    borderRadius: 14,
    backgroundColor: UI.lavender,
  },
  languageText: { color: UI.accentDark, fontSize: 12, fontWeight: '700', flex: 1 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: UI.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: UI.ink, fontSize: 15, fontWeight: '800', flex: 1 },
  copy: { color: UI.muted, fontSize: 13, lineHeight: 20 },
  disclaimer: { color: UI.muted, fontSize: 11, lineHeight: 17, paddingHorizontal: 2 },
});
