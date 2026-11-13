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
import { router } from 'expo-router';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Baby,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Footprints,
  Hospital,
  MapPin,
  Mic,
  PhoneCall,
  Send,
  ShieldAlert,
  Thermometer,
  UserCheck,
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
  { id: '8', iconType: 'waves', en: 'Water Break / Fluid', rw: 'Amazi Yamanutse', danger: true },
];

export default function ReportScreen() {
  const [lang, setLang] = useState<'EN' | 'RW'>('EN');
  const [stage, setStage] = useState<'pregnant' | 'postpartum'>('pregnant');
  const [district, setDistrict] = useState<'Kicukiro' | 'Nyagatare'>('Kicukiro');
  const [onset, setOnset] = useState<'<2h' | 'today' | '1-2d' | '>2d'>('<2h');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['1']);
  const [urgency, setUrgency] = useState<'emergency' | 'urgent' | 'routine'>('emergency');
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      // Auto-adjust protocol urgency if danger signs selected
      const hasDanger = next.some((item) => SYMPTOMS.find((s) => s.id === item)?.danger);
      if (hasDanger || onset === '<2h') {
        setUrgency('emergency');
      }
      return next;
    });
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

  const caseId = district === 'Kicukiro' ? 'MC-KCK-2026-8841' : 'MC-NYG-2026-4412';
  const catchmentCenter =
    district === 'Kicukiro' ? 'Muhima Health Center (Kicukiro)' : 'Rukomo Health Center (Nyagatare)';
  const referralHospital =
    district === 'Kicukiro' ? 'CHUK Maternity Wing / Masaka' : 'Nyagatare District Hospital';

  const t = {
    EN: {
      title: 'Report Maternal Concern',
      subtitle: 'Triage alert dispatched to CHW & Health Center',
      stageLabel: 'Maternal Stage',
      pregnantOpt: 'Pregnant (Wk 28)',
      postpartumOpt: 'Postpartum (0–6 Wks)',
      districtLabel: 'Pilot Catchment',
      onsetLabel: 'When did this concern begin?',
      onsetLess2h: 'Just now (< 2h)',
      onsetToday: 'Earlier today',
      onset12d: '1–2 days ago',
      onsetMore2d: '> 2 days ago',
      emergencyBannerTitle: 'Life-Threatening Emergency? Call 114 / 912',
      emergencyBannerSub: 'Emergency instructions do not depend on chat response. Free 24/7 SAMU ambulance dispatch.',
      callNow: 'Call 114 Now',
      symptomsTitle: 'Select Observed Symptoms',
      symptomsSubtitle: 'Tap all danger signs that apply to your current condition',
      dangerAlert: 'Warning: Maternal danger sign selected. Immediate CHW triage is being triggered.',
      urgencyTitle: 'Protocol Urgency Level',
      routine: 'Routine',
      urgent: 'Urgent',
      emergency: 'Critical Alert',
      notesLabel: 'Additional Details / Voice Note',
      notesPlaceholder: 'Describe pain intensity, baby movement changes, or color of fluid...',
      voiceNote: 'Record voice note (Kinyarwanda / English)',
      recording: 'Recording audio note...',
      locationTag: `Catchment: ${catchmentCenter}`,
      submitBtn: 'Transmit Maternal Alert',
      successTitle: 'Alert Triaged & Dispatched',
      successSub: `Your report has been received by ${catchmentCenter} and assigned to Community Health Worker Mukamana.`,
      refNumber: `Case Reference: ${caseId}`,
      actionAdvice: 'Protocol Guidance: Stay seated, do not exert yourself, and hydrate. If bleeding increases or convulsions occur, call 114 immediately.',
      assignedChw: 'Assigned CHW: Mukamana (+250 788 123 456)',
      slaTime: 'Response SLA: Contact within 30 minutes',
      doneBtn: 'Submit Another Report',
      viewRecordsBtn: 'View Active Case in Records',
    },
    RW: {
      title: 'Tanga Impuruza y’Ubuzima',
      subtitle: 'Impuruza yoherezwa ku mukozi w’ubuzima n’ikigo nderabuzima',
      stageLabel: 'Uko umeze ubu',
      pregnantOpt: 'Ntwite (Icyumweru 28)',
      postpartumOpt: 'Nabyaye (Ibyumweru 0–6)',
      districtLabel: 'Akarere k’Icyitegererezo',
      onsetLabel: 'Byatangiye ryari?',
      onsetLess2h: 'Ubu (< amasaha 2)',
      onsetToday: 'Uyu munsi',
      onset12d: 'Iminsi 1–2 ishize',
      onsetMore2d: '> Iminsi 2',
      emergencyBannerTitle: 'Ni Ubutabazi Bwihuse? Hamagara 114 / 912',
      emergencyBannerSub: 'Ubutabazi bwa gisirikare n’ubw’ubuzima (SAMU) buraherereye amasaha 24/7.',
      callNow: 'Hamagara 114',
      symptomsTitle: 'Hitamo Ibimenyetso Ufite',
      symptomsSubtitle: 'Kanda ku kimenyetso cyose cy’ingorane ubona kigaragara',
      dangerAlert: 'Iburira: Wahisemo ikimenyetso gikomeye. Umujyanama w’ubuzima aratabarizwa ako kanya.',
      urgencyTitle: 'Urugero rw’Ubwihutirwe',
      routine: 'Bisanzwe',
      urgent: 'Byihutirwa',
      emergency: 'Biteye Inkeke',
      notesLabel: 'Andi Makuru / Ijwi',
      notesPlaceholder: 'Sobanura ubukana bw’ububabare, imigeri y’umwana, cyangwa uko amaraso ameze...',
      voiceNote: 'Fata ijwi (Kinyarwanda / English)',
      recording: 'Gufata ijwi...',
      locationTag: `Ahantu: ${catchmentCenter}`,
      submitBtn: 'Ohereza Impuruza Ako Kanya',
      successTitle: 'Impuruza Yoherejwe Neza',
      successSub: `Raporo yawe yakiriwe na ${catchmentCenter} kandi yahawe umujyanama w’ubuzima Mukamana.`,
      refNumber: `Nimero y’Impuruza: ${caseId}`,
      actionAdvice: 'Amabwiriza: Ihangane wicare hamwe, nywa amazi meza. Niba amaraso yiyongereye, hamagara 114 ako kanya.',
      assignedChw: 'Umujyanama: Mukamana (+250 788 123 456)',
      slaTime: 'Igihe cyo Gukurikiranwa: Mu minota 30',
      doneBtn: 'Tanga Indi Mpuruza',
      viewRecordsBtn: 'Kureba Dosiye mu Bitaro',
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
              /* ======================================================== */
              /* SUBMISSION CONFIRMATION & GUIDANCE (PRD §4.A, §5 & §8)  */
              /* ======================================================== */
              <View style={styles.successCard}>
                <View style={styles.successIconBox}>
                  <CheckCircle2 size={40} color={PALETTE.electricPurple} />
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

                {/* Assigned CHW and SLA */}
                <View style={styles.assignedCard}>
                  <View style={styles.assignedRow}>
                    <UserCheck size={16} color={PALETTE.deepViolet} />
                    <Text style={styles.assignedText}>{t.assignedChw}</Text>
                  </View>
                  <View style={styles.assignedRow}>
                    <Clock size={16} color={PALETTE.vibrantCrimson} />
                    <Text style={styles.slaText}>{t.slaTime}</Text>
                  </View>
                  <View style={styles.assignedRow}>
                    <Hospital size={16} color={PALETTE.deepViolet} />
                    <Text style={styles.assignedText}>Referral Hospital: {referralHospital}</Text>
                  </View>
                </View>

                <View style={styles.adviceBox}>
                  <AlertCircle size={20} color={PALETTE.vibrantCrimson} />
                  <Text style={styles.adviceText}>{t.actionAdvice}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={styles.recordsButton}
                  onPress={() => router.push('/records' as any)}
                >
                  <Text style={styles.recordsButtonText}>{t.viewRecordsBtn}</Text>
                  <ArrowRight size={16} color={PALETTE.white} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={styles.resetButton}
                  onPress={handleReset}
                >
                  <Text style={styles.resetButtonText}>{t.doneBtn}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* EMERGENCY SAFETY BANNER (PRD §8) */}
                <View style={styles.emergencyBanner}>
                  <View style={styles.emergencyLeft}>
                    <View style={styles.emergencyIconBox}>
                      <ShieldAlert size={24} color={PALETTE.white} />
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
                        'Emergency Call 114',
                        'Calling Rwanda National Ambulance Service (SAMU 114 / 912)...'
                      )
                    }
                  >
                    <PhoneCall size={15} color={PALETTE.white} />
                    <Text style={styles.emergencyCallText}>{t.callNow}</Text>
                  </Pressable>
                </View>

                {/* PILOT DISTRICT & STAGE SELECTORS (PRD §4.A & §11) */}
                <View style={styles.sectionCard}>
                  {/* Maternal Stage */}
                  <Text style={styles.sectionHeading}>{t.stageLabel}</Text>
                  <View style={styles.segmentRow}>
                    <Pressable
                      style={[
                        styles.segmentBtn,
                        stage === 'pregnant' && styles.segmentBtnActive,
                      ]}
                      onPress={() => setStage('pregnant')}
                    >
                      <Baby
                        size={14}
                        color={stage === 'pregnant' ? PALETTE.white : PALETTE.gray600}
                      />
                      <Text
                        style={[
                          styles.segmentBtnText,
                          stage === 'pregnant' && styles.segmentBtnTextActive,
                        ]}
                      >
                        {t.pregnantOpt}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.segmentBtn,
                        stage === 'postpartum' && styles.segmentBtnActive,
                      ]}
                      onPress={() => setStage('postpartum')}
                    >
                      <Activity
                        size={14}
                        color={stage === 'postpartum' ? PALETTE.white : PALETTE.gray600}
                      />
                      <Text
                        style={[
                          styles.segmentBtnText,
                          stage === 'postpartum' && styles.segmentBtnTextActive,
                        ]}
                      >
                        {t.postpartumOpt}
                      </Text>
                    </Pressable>
                  </View>

                  {/* District Catchment */}
                  <View style={styles.districtRow}>
                    <Text style={styles.subHeading}>{t.districtLabel}:</Text>
                    <View style={styles.districtChips}>
                      <Pressable
                        style={[
                          styles.districtChip,
                          district === 'Kicukiro' && styles.districtChipActive,
                        ]}
                        onPress={() => setDistrict('Kicukiro')}
                      >
                        <MapPin
                          size={12}
                          color={district === 'Kicukiro' ? PALETTE.white : PALETTE.deepViolet}
                        />
                        <Text
                          style={[
                            styles.districtChipText,
                            district === 'Kicukiro' && styles.districtChipTextActive,
                          ]}
                        >
                          Kicukiro District
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.districtChip,
                          district === 'Nyagatare' && styles.districtChipActive,
                        ]}
                        onPress={() => setDistrict('Nyagatare')}
                      >
                        <MapPin
                          size={12}
                          color={district === 'Nyagatare' ? PALETTE.white : PALETTE.deepViolet}
                        />
                        <Text
                          style={[
                            styles.districtChipText,
                            district === 'Nyagatare' && styles.districtChipTextActive,
                          ]}
                        >
                          Nyagatare District
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* ONSET QUESTION (PRD §4.A & §8) */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeading}>{t.onsetLabel}</Text>
                  <View style={styles.onsetGrid}>
                    {[
                      { key: '<2h', label: t.onsetLess2h },
                      { key: 'today', label: t.onsetToday },
                      { key: '1-2d', label: t.onset12d },
                      { key: '>2d', label: t.onsetMore2d },
                    ].map((item) => {
                      const isSelected = onset === item.key;
                      return (
                        <Pressable
                          key={item.key}
                          style={[
                            styles.onsetChip,
                            isSelected && styles.onsetChipActive,
                          ]}
                          onPress={() => {
                            setOnset(item.key as any);
                            if (item.key === '<2h' || hasDangerSigns) {
                              setUrgency('emergency');
                            }
                          }}
                        >
                          <Clock
                            size={12}
                            color={isSelected ? PALETTE.white : PALETTE.deepViolet}
                          />
                          <Text
                            style={[
                              styles.onsetChipText,
                              isSelected && styles.onsetChipTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Danger Signs Warning */}
                {hasDangerSigns && (
                  <View style={styles.dangerAlertBox}>
                    <AlertTriangle size={20} color={PALETTE.vibrantCrimson} />
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
                    numberOfLines={3}
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
                  <Send size={18} color={PALETTE.white} />
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
    gap: 14,
  },
  containerWide: {
    maxWidth: 780,
  },
  header: {
    gap: 5,
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
    backgroundColor: '#FFE8EC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD4DC',
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.vibrantCrimson,
    letterSpacing: 0.6,
  },
  langToggle: {
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  langToggleText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: PALETTE.black,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12.5,
    color: PALETTE.gray600,
    lineHeight: 18,
  },

  /* Emergency Hotline Banner */
  emergencyBanner: {
    backgroundColor: PALETTE.vibrantCrimson,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'column',
    gap: 12,
    shadowColor: PALETTE.vibrantCrimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emergencyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.white,
  },
  emergencySub: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: '#FFE4E8',
    marginTop: 2,
    lineHeight: 16,
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.white,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  emergencyCallText: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.vibrantCrimson,
  },

  /* Section Cards */
  sectionCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 10,
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.black,
  },
  sectionDescription: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: PALETTE.gray500,
    marginTop: -4,
  },
  subHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: PALETTE.gray600,
  },

  /* Stage & District Segment Styles */
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: PALETTE.bgCanvas,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  segmentBtnActive: {
    backgroundColor: PALETTE.deepViolet,
    borderColor: PALETTE.deepViolet,
  },
  segmentBtnText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.gray600,
  },
  segmentBtnTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
  },
  districtRow: {
    flexDirection: 'column',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0EAF8',
  },
  districtChips: {
    flexDirection: 'row',
    gap: 8,
  },
  districtChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: PALETTE.cardLavender,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  districtChipActive: {
    backgroundColor: PALETTE.electricPurple,
    borderColor: PALETTE.electricPurple,
  },
  districtChipText: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.deepViolet,
  },
  districtChipTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
  },

  /* Onset Grid */
  onsetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  onsetChip: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.bgCanvas,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  onsetChipActive: {
    backgroundColor: PALETTE.deepViolet,
    borderColor: PALETTE.deepViolet,
  },
  onsetChipText: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.deepViolet,
  },
  onsetChipTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
  },

  /* Danger Alert Box */
  dangerAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF0F3',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFD4DC',
  },
  dangerAlertText: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: PALETTE.vibrantCrimson,
    lineHeight: 17,
  },

  /* Symptom Chips */
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: PALETTE.bgCanvas,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  chipIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: PALETTE.electricPurple,
    borderColor: PALETTE.electricPurple,
  },
  chipDanger: {
    backgroundColor: PALETTE.vibrantCrimson,
    borderColor: PALETTE.vibrantCrimson,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.black,
  },
  chipTextSelected: {
    color: PALETTE.white,
    fontFamily: Fonts.bold,
  },

  /* Urgency Level */
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    backgroundColor: PALETTE.bgCanvas,
  },
  urgencyBtnRoutine: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
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
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.gray600,
  },
  urgencyTextActive: {
    color: PALETTE.white,
    fontFamily: Fonts.bold,
  },

  /* Text Area & Voice */
  textArea: {
    backgroundColor: PALETTE.bgCanvas,
    borderRadius: 14,
    padding: 12,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.black,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    minHeight: 70,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.cardLavender,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  voiceBtnRecording: {
    backgroundColor: '#FFE8EC',
    borderColor: PALETTE.vibrantCrimson,
  },
  voiceBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: PALETTE.deepViolet,
  },

  /* Location Box */
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  locationText: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.deepViolet,
  },

  /* Submit Button */
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.deepViolet,
    paddingVertical: 13,
    borderRadius: 18,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDanger: {
    backgroundColor: PALETTE.vibrantCrimson,
    shadowColor: PALETTE.vibrantCrimson,
  },
  submitButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: PALETTE.white,
    letterSpacing: 0.2,
  },

  /* Success Confirmation Card (PRD §4.A) */
  successCard: {
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDE4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
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
    backgroundColor: PALETTE.bgCanvas,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  refText: {
    fontFamily: Fonts.bold,
    fontSize: 12.5,
    color: PALETTE.deepViolet,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: PALETTE.deepViolet,
  },
  assignedCard: {
    width: '100%',
    backgroundColor: '#F5EFFC',
    borderRadius: 16,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E4D5F8',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignedText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.black,
  },
  slaText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: PALETTE.vibrantCrimson,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF0F3',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD4DC',
    width: '100%',
  },
  adviceText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    color: PALETTE.vibrantCrimson,
    lineHeight: 16,
  },
  recordsButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.deepViolet,
    paddingVertical: 12,
    borderRadius: 16,
  },
  recordsButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: PALETTE.white,
  },
  resetButton: {
    paddingVertical: 6,
  },
  resetButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: PALETTE.gray500,
  },
});
