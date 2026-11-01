import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Footprints,
  MapPin,
  Mic,
  PhoneCall,
  Send,
  ShieldAlert,
  Thermometer,
  Waves,
  Zap,
} from 'lucide-react-native';
import { BottomTabInset, Fonts, PALETTE } from '@/constants/theme';

type SymptomIconType =
  | 'droplets'
  | 'zap'
  | 'thermometer'
  | 'footprints'
  | 'activity'
  | 'eye'
  | 'waves'
  | 'alert-circle';

interface SymptomChip {
  id: string;
  iconType: SymptomIconType;
  en: string;
  rw: string;
  danger: boolean;
}

const SYMPTOMS: SymptomChip[] = [
  { id: '1', iconType: 'droplets', en: 'Heavy Bleeding', rw: 'Kuva Amaraso', danger: true },
  { id: '2', iconType: 'zap', en: 'Severe Headache', rw: 'Umutwe Ukabije', danger: true },
  { id: '3', iconType: 'thermometer', en: 'High Fever', rw: 'Umuriro Mwinshi', danger: true },
  { id: '4', iconType: 'footprints', en: 'Baby Not Kicking', rw: 'Umwana Ntakina', danger: true },
  { id: '5', iconType: 'activity', en: 'Severe Cramps', rw: 'Uburibwe bukabije', danger: true },
  { id: '6', iconType: 'eye', en: 'Blurred Vision', rw: 'Kutabona Neza', danger: true },
  { id: '7', iconType: 'alert-circle', en: 'Face/Hand Swelling', rw: 'Kubyimba Isura', danger: false },
  { id: '8', iconType: 'waves', en: 'Water Break', rw: 'Amazi Yamanutse', danger: true },
];

export default function ReportScreen() {
  const [lang, setLang] = useState<'EN' | 'RW'>('EN');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'emergency' | 'urgent' | 'routine'>('urgent');
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const hasDangerSigns = selectedSymptoms.some(
    (id) => SYMPTOMS.find((s) => s.id === id)?.danger
  );

  const renderSymptomIcon = (type: SymptomIconType, color: string, size = 15) => {
    switch (type) {
      case 'droplets':
        return <Droplets size={size} color={color} />;
      case 'zap':
        return <Zap size={size} color={color} />;
      case 'thermometer':
        return <Thermometer size={size} color={color} />;
      case 'footprints':
        return <Footprints size={size} color={color} />;
      case 'activity':
        return <Activity size={size} color={color} />;
      case 'eye':
        return <Eye size={size} color={color} />;
      case 'waves':
        return <Waves size={size} color={color} />;
      case 'alert-circle':
        return <AlertCircle size={size} color={color} />;
    }
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0 && !notes.trim()) {
      Alert.alert(
        lang === 'EN' ? 'Information needed' : 'Amakuru akenewe',
        lang === 'EN'
          ? 'Please select at least one symptom or describe what you feel.'
          : 'Hitamo ikimenyetso kimwe cyangwa wandike uko umerewe.'
      );
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setNotes('');
    setSubmitted(false);
  };

  const t = {
    EN: {
      title: 'Report a Health Concern',
      subtitle: 'Fast triage & immediate community response',
      emergencyBannerTitle: 'Critical Emergency? Call 114 or 912',
      emergencyBannerSub: 'Emergency medical dispatch available 24/7 in Rwanda',
      callNow: 'Call Emergency',
      symptomsTitle: 'Select Observed Symptoms',
      symptomsSubtitle: 'Tap all signs that apply to your current condition',
      dangerAlert: 'Warning: You selected a maternal danger sign. A midwife is being notified.',
      urgencyTitle: 'How urgent does this feel?',
      routine: 'Routine',
      urgent: 'Urgent',
      emergency: 'Critical',
      notesLabel: 'Additional Details (Optional)',
      notesPlaceholder: 'Describe when it started, severity, or any other notes...',
      voiceNote: 'Record voice note (Kinyarwanda / English)',
      recording: 'Recording audio...',
      locationTag: 'Location auto-tagged: Muhima Health Center catchment',
      submitBtn: 'Send Health Report',
      successTitle: 'Report Dispatched Successfully',
      successSub: 'A healthcare worker at your local health center has received your alert.',
      refNumber: 'Reference ID: MC-2026-8841',
      actionAdvice: 'Please stay seated and hydrate. If your condition worsens, call 114 immediately.',
      doneBtn: 'Submit Another Report',
    },
    RW: {
      title: 'Tanga Impuruza y’Ubuzima',
      subtitle: 'Kugenzura byihuse no gufashwa n’abajyanama b’ubuzima',
      emergencyBannerTitle: 'Ni ubutabazi bwihuse? Hamagara 114 cyangwa 912',
      emergencyBannerSub: 'Ubutabazi bwa gisirikare n’ubw’ubuzima buraherereye amasaha 24/7',
      callNow: 'Hamagara Ubutabazi',
      symptomsTitle: 'Hitamo Ibimenyetso Ufite',
      symptomsSubtitle: 'Kanda ku kimenyetso cyose ubona kigaragara kuri wowe',
      dangerAlert: 'Iburira: Wahisemo ikimenyetso cy’ingorane. Umubyaza ari kumenyeshwa ako kanya.',
      urgencyTitle: 'Bikabije bingana bite?',
      routine: 'Bisanzwe',
      urgent: 'Byihutirwa',
      emergency: 'Biteye Inkeke',
      notesLabel: 'Andi Makuru Yinyongera (Ubyifuza)',
      notesPlaceholder: 'Sobanura igihe byatangiriye, uko wiyumva...',
      voiceNote: 'Fata ijwi (Kinyarwanda / English)',
      recording: 'Gufata ijwi...',
      locationTag: 'Ahantu uri: Ikigo Nderabuzima cya Muhima',
      submitBtn: 'Ohereza Impuruza',
      successTitle: 'Impuruza Yoherejwe Neza',
      successSub: 'Umukozi w’ubuzima ku kigo nderabuzima cyawe yakiriye ubutumwa bwawe.',
      refNumber: 'Nimero y’ubutumwa: MC-2026-8841',
      actionAdvice: 'Ihangane wicare ahantu hatuje. Niba bikabije cyane, hamagara 114 ako kanya.',
      doneBtn: 'Tanga Indi Mpuruza',
    },
  }[lang];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, isWide && styles.containerWide]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.badge}>
                  <AlertCircle size={13} color={PALETTE.vibrantCrimson} />
                  <Text style={styles.badgeText}>RAPID TRIAGE DISPATCH</Text>
                </View>

                {/* Language Toggle Pill */}
                <Pressable
                  style={styles.langToggle}
                  onPress={() => setLang(lang === 'EN' ? 'RW' : 'EN')}
                >
                  <Text style={styles.langToggleText}>
                    {lang === 'EN' ? '🇷🇼 RW' : '🇬🇧 EN'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
            </View>

            {submitted ? (
              <View style={styles.successCard}>
                <View style={styles.successIconBox}>
                  <CheckCircle2 size={42} color={PALETTE.electricPurple} />
                </View>
                <Text style={styles.successTitle}>{t.successTitle}</Text>
                <Text style={styles.successSub}>{t.successSub}</Text>

                <View style={styles.refBox}>
                  <Text style={styles.refText}>{t.refNumber}</Text>
                  <View style={styles.statusPill}>
                    <Clock size={12} color={PALETTE.electricPurple} />
                    <Text style={styles.statusPillText}>DISPATCHED</Text>
                  </View>
                </View>

                <View style={styles.adviceBox}>
                  <AlertCircle size={20} color={PALETTE.vibrantCrimson} />
                  <Text style={styles.adviceText}>{t.actionAdvice}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={styles.resetButton}
                  onPress={handleReset}
                >
                  <Text style={styles.resetButtonText}>{t.doneBtn}</Text>
                  <ArrowRight size={18} color={PALETTE.white} />
                </Pressable>
              </View>
            ) : (
              <>
                {/* Emergency Hotline Banner */}
                <View style={styles.emergencyBanner}>
                  <View style={styles.emergencyLeft}>
                    <View style={styles.emergencyIconBox}>
                      <ShieldAlert size={26} color={PALETTE.white} />
                    </View>
                    <View style={styles.emergencyTextWrap}>
                      <Text style={styles.emergencyTitle}>
                        {t.emergencyBannerTitle}
                      </Text>
                      <Text style={styles.emergencySub}>
                        {t.emergencyBannerSub}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.emergencyCallBtn}
                    onPress={() =>
                      Alert.alert(
                        'Emergency Call',
                        'Dialing national toll-free ambulance / maternal dispatch: 114'
                      )
                    }
                  >
                    <PhoneCall size={16} color={PALETTE.white} />
                    <Text style={styles.emergencyCallText}>{t.callNow}</Text>
                  </Pressable>
                </View>

                {/* Danger Signs Warning */}
                {hasDangerSigns && (
                  <View style={styles.dangerAlertBox}>
                    <AlertTriangle size={22} color={PALETTE.vibrantCrimson} />
                    <Text style={styles.dangerAlertText}>{t.dangerAlert}</Text>
                  </View>
                )}

                {/* Symptom Selection with Professional Lucide Icons */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeading}>{t.symptomsTitle}</Text>
                  <Text style={styles.sectionDescription}>
                    {t.symptomsSubtitle}
                  </Text>

                  <View style={styles.chipsContainer}>
                    {SYMPTOMS.map((item) => {
                      const isSelected = selectedSymptoms.includes(item.id);
                      const iconColor = isSelected
                        ? PALETTE.white
                        : item.danger
                        ? PALETTE.vibrantCrimson
                        : PALETTE.deepViolet;

                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => toggleSymptom(item.id)}
                          style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                            item.danger && isSelected && styles.chipDanger,
                          ]}
                        >
                          <View style={styles.chipIconBox}>
                            {renderSymptomIcon(item.iconType, iconColor, 15)}
                          </View>
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextSelected,
                            ]}
                          >
                            {lang === 'EN' ? item.en : item.rw}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Urgency Level with Professional Lucide Icons */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeading}>{t.urgencyTitle}</Text>
                  <View style={styles.urgencyRow}>
                    <Pressable
                      style={[
                        styles.urgencyBtn,
                        urgency === 'routine' && styles.urgencyBtnRoutine,
                      ]}
                      onPress={() => setUrgency('routine')}
                    >
                      <CheckCircle2
                        size={14}
                        color={urgency === 'routine' ? PALETTE.white : PALETTE.gray500}
                      />
                      <Text
                        style={[
                          styles.urgencyText,
                          urgency === 'routine' && styles.urgencyTextActive,
                        ]}
                      >
                        {t.routine}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.urgencyBtn,
                        urgency === 'urgent' && styles.urgencyBtnUrgent,
                      ]}
                      onPress={() => setUrgency('urgent')}
                    >
                      <Clock
                        size={14}
                        color={urgency === 'urgent' ? PALETTE.white : PALETTE.goldenYellow}
                      />
                      <Text
                        style={[
                          styles.urgencyText,
                          urgency === 'urgent' && styles.urgencyTextActive,
                        ]}
                      >
                        {t.urgent}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.urgencyBtn,
                        urgency === 'emergency' && styles.urgencyBtnEmergency,
                      ]}
                      onPress={() => setUrgency('emergency')}
                    >
                      <AlertTriangle
                        size={14}
                        color={urgency === 'emergency' ? PALETTE.white : PALETTE.vibrantCrimson}
                      />
                      <Text
                        style={[
                          styles.urgencyText,
                          urgency === 'emergency' && styles.urgencyTextActive,
                        ]}
                      >
                        {t.emergency}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Notes Input */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeading}>{t.notesLabel}</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder={t.notesPlaceholder}
                    placeholderTextColor={PALETTE.gray400}
                    multiline
                    numberOfLines={4}
                    value={notes}
                    onChangeText={setNotes}
                    textAlignVertical="top"
                  />

                  {/* Audio note */}
                  <Pressable
                    style={[
                      styles.voiceBtn,
                      isRecording && styles.voiceBtnRecording,
                    ]}
                    onPress={() => setIsRecording(!isRecording)}
                  >
                    <Mic
                      size={18}
                      color={
                        isRecording
                          ? PALETTE.vibrantCrimson
                          : PALETTE.deepViolet
                      }
                    />
                    <Text
                      style={[
                        styles.voiceBtnText,
                        isRecording && { color: PALETTE.vibrantCrimson },
                      ]}
                    >
                      {isRecording ? t.recording : t.voiceNote}
                    </Text>
                  </Pressable>
                </View>

                {/* Location indicator */}
                <View style={styles.locationBox}>
                  <MapPin size={16} color={PALETTE.electricPurple} />
                  <Text style={styles.locationText}>{t.locationTag}</Text>
                </View>

                {/* Submit Button */}
                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.submitButton,
                    hasDangerSigns && styles.submitButtonDanger,
                  ]}
                  onPress={handleSubmit}
                >
                  <Send size={20} color={PALETTE.white} />
                  <Text style={styles.submitButtonText}>{t.submitBtn}</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bgCanvas,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  container: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: 16,
  },
  containerWide: {
    maxWidth: 780,
  },
  header: {
    gap: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.cardRuby,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: PALETTE.vibrantCrimson,
    letterSpacing: 0.6,
  },
  langToggle: {
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFCEFA',
  },
  langToggleText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 24,
    color: PALETTE.black,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.gray600,
    lineHeight: 18,
  },
  emergencyBanner: {
    backgroundColor: PALETTE.deepRuby,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: PALETTE.deepRuby,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: PALETTE.white,
  },
  emergencySub: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  emergencyCallText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.white,
  },
  dangerAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PALETTE.cardRuby,
    borderWidth: 1.5,
    borderColor: '#FECDD6',
    borderRadius: 16,
    padding: 14,
  },
  dangerAlertText: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 12.5,
    color: PALETTE.deepRuby,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#DFCEFA',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 15.5,
    color: PALETTE.black,
  },
  sectionDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: PALETTE.gray500,
    marginTop: 2,
    marginBottom: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ECE4FA',
    borderWidth: 1,
    borderColor: '#DACAF5',
  },
  chipSelected: {
    backgroundColor: PALETTE.electricPurple,
    borderColor: PALETTE.electricPurple,
  },
  chipDanger: {
    backgroundColor: PALETTE.vibrantCrimson,
    borderColor: PALETTE.vibrantCrimson,
  },
  chipIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: PALETTE.black,
  },
  chipTextSelected: {
    color: PALETTE.white,
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  urgencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ECE4FA',
    borderWidth: 1,
    borderColor: '#DACAF5',
  },
  urgencyBtnRoutine: {
    backgroundColor: PALETTE.deepViolet,
    borderColor: PALETTE.deepViolet,
  },
  urgencyBtnUrgent: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  urgencyBtnEmergency: {
    backgroundColor: PALETTE.vibrantCrimson,
    borderColor: PALETTE.vibrantCrimson,
  },
  urgencyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: PALETTE.black,
  },
  urgencyTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
  },
  textArea: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#DACAF5',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: PALETTE.black,
    fontFamily: Fonts.regular,
    backgroundColor: '#FAF7FE',
    marginTop: 12,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#ECE4FA',
    borderWidth: 1,
    borderColor: '#DACAF5',
  },
  voiceBtnRecording: {
    backgroundColor: '#FFE4E8',
    borderColor: PALETTE.vibrantCrimson,
  },
  voiceBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12.5,
    color: PALETTE.deepViolet,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  locationText: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: PALETTE.gray500,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PALETTE.electricPurple,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: PALETTE.electricPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  submitButtonDanger: {
    backgroundColor: PALETTE.vibrantCrimson,
    shadowColor: PALETTE.vibrantCrimson,
  },
  submitButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: PALETTE.white,
  },
  successCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#DFCEFA',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PALETTE.cardLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: PALETTE.black,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.gray600,
    textAlign: 'center',
    lineHeight: 18,
  },
  refBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#ECE4FA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  refText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.black,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: PALETTE.electricPurple,
    letterSpacing: 0.5,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: PALETTE.cardRuby,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECDD6',
    width: '100%',
  },
  adviceText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.deepRuby,
    lineHeight: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.deepViolet,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  resetButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.white,
  },
});
