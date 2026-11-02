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
  AlertTriangle,
  CheckCheck,
  Clock,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react-native';
import { BottomTabInset, Fonts, PALETTE } from '@/constants/theme';

interface Message {
  id: string;
  sender: 'user' | 'provider';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'provider',
    text: 'Muraho Aline! I am Midwife Mukamana on duty at Muhima Health Center. How are you and your baby feeling today?',
    time: '10:15 AM',
  },
  {
    id: '2',
    sender: 'user',
    text: 'Hello nurse, I am in week 28 and experiencing mild cramps in my lower abdomen. Is this normal?',
    time: '10:18 AM',
    status: 'read',
  },
  {
    id: '3',
    sender: 'provider',
    text: 'Mild, irregular tightness can be normal Braxton-Hicks contractions. However, if they become regular, painful, or accompanied by any bleeding or fluid leak, you must come to the health center immediately. Are you resting and drinking clean water?',
    time: '10:20 AM',
  },
];

const SUGGESTIONS = {
  EN: [
    'How many baby kicks per day?',
    'When is my next ANC visit?',
    'Foods rich in iron & folic acid',
    'Signs that labor is starting',
  ],
  RW: [
    'Imigeri y’umwana ingana iki ku munsi?',
    'Gahunda ikurikira yo kwisuzumisha?',
    'Ibiryo bikungahaye ku butare?',
    'Ibimenyetso byo gutangira kunda?',
  ],
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [lang, setLang] = useState<'EN' | 'RW'>('EN');

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate delivery receipt after 400ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 400);

    // Simulate midwife reading and reply after 1200ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );

      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'provider',
        text:
          lang === 'EN'
            ? 'Thank you for updating me, Aline. I have noted this in your health passport file. If pain sharpens or you notice any fluid, call 114 immediately.'
            : 'Murakoze kumpa amakuru Aline. Mbyanditse mu idosiye yawe y’ubuzima. Niba ububabare bwiyongereye, hamagara 114 ako kanya.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1400);
  };

  const handleCall = () => {
    Alert.alert(
      lang === 'EN' ? 'Duty Midwife Call' : 'Guhamagara Umubyaza',
      lang === 'EN'
        ? 'Connecting to Duty Midwife Mukamana at Muhima Maternity Ward (+250 788 123 456)...'
        : 'Guhuza na muganga w’umubyaza Mukamana mu bitaro bya Muhima (+250 788 123 456)...'
    );
  };

  const t = {
    EN: {
      providerName: 'Midwife Mukamana',
      providerRole: 'Muhima Health Center Catchment',
      onDutyStatus: 'On Duty · 08:00 - 18:00 CAT',
      safetyBannerTitle: 'Non-Emergency Clinical Advice Only',
      safetyBannerText:
        'Emergencies must NOT wait for chat replies. If bleeding, convulsions, or severe breathlessness occur, call 114 immediately.',
      sosBtn: 'Call 114',
      avgResponse: 'Avg Response: < 15 mins',
      suggestionsTitle: 'Suggested Inquiries',
      inputPlaceholder: 'Ask a health question in English or Kinyarwanda...',
    },
    RW: {
      providerName: 'Umubyaza Mukamana',
      providerRole: 'Ikigo Nderabuzima cya Muhima',
      onDutyStatus: 'Ari ku Kazi · 08:00 - 18:00 CAT',
      safetyBannerTitle: 'Inama z’Ubuzima Gisanzwe Gusa',
      safetyBannerText:
        'Ubutabazi bwihuse ntibugomba gutegereza ubutumwa bwa chat. Niba uva amaraso cyangwa uribwa cyane, hamagara 114 ako kanya.',
      sosBtn: 'Hamagara 114',
      avgResponse: 'Gusubiza mu munsi: < iminota 15',
      suggestionsTitle: 'Ibibazo Bikunze Kubazwa',
      inputPlaceholder: 'Baza ikibazo mu Kinyarwanda cyangwa Icyongereza...',
    },
  }[lang];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={[styles.container, isWide && styles.containerWide]}>
          {/* Header Card with Midwife Details & Emergency Call */}
          <View style={styles.header}>
            <View style={styles.providerInfo}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <UserCheck size={22} color={PALETTE.white} />
                </View>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.providerText}>
                <Text style={styles.providerName}>{t.providerName}</Text>
                <Text style={styles.providerRole}>{t.providerRole}</Text>
                <View style={styles.dutyPill}>
                  <Clock size={10} color="#166534" />
                  <Text style={styles.dutyText}>{t.onDutyStatus}</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={styles.langPill}
                onPress={() => setLang(lang === 'EN' ? 'RW' : 'EN')}
              >
                <Text style={styles.langPillText}>
                  {lang === 'EN' ? '🇷🇼 RW' : '🇬🇧 EN'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Call healthcare provider"
                style={styles.callButton}
                onPress={handleCall}
              >
                <Phone size={16} color={PALETTE.white} />
              </Pressable>
            </View>
          </View>

          {/* CLINICAL SAFETY BANNER (PRD §8 Safety Requirement) */}
          <View style={styles.safetyBanner}>
            <View style={styles.safetyIconBox}>
              <AlertTriangle size={16} color={PALETTE.vibrantCrimson} />
            </View>
            <View style={styles.safetyTextWrap}>
              <Text style={styles.safetyTitle}>{t.safetyBannerTitle}</Text>
              <Text style={styles.safetyDesc}>{t.safetyBannerText}</Text>
            </View>
            <Pressable
              style={styles.sosQuickBtn}
              onPress={() =>
                Alert.alert(
                  'Emergency Dispatch 114',
                  'Calling Rwanda National Emergency Dispatch (SAMU)...'
                )
              }
            >
              <PhoneCall size={12} color={PALETTE.white} />
              <Text style={styles.sosQuickText}>{t.sosBtn}</Text>
            </Pressable>
          </View>

          {/* Security & Verified MOH Banner */}
          <View style={styles.securityPill}>
            <ShieldCheck size={13} color={PALETTE.deepViolet} />
            <Text style={styles.securityText}>
              Verified MOH Human-to-Human Clinical Guidance · {t.avgResponse}
            </Text>
          </View>

          {/* Message Thread */}
          <ScrollView
            style={styles.messageList}
            contentContainerStyle={[
              styles.messageListContent,
              { paddingBottom: BottomTabInset + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((item) => {
              const isUser = item.sender === 'user';
              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowProvider,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.miniAvatar}>
                      <User size={12} color={PALETTE.white} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleProvider,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isUser ? styles.bubbleTextUser : styles.bubbleTextProvider,
                      ]}
                    >
                      {item.text}
                    </Text>
                    <View style={styles.timeRow}>
                      <Text
                        style={[
                          styles.timeText,
                          isUser ? styles.timeTextUser : styles.timeTextProvider,
                        ]}
                      >
                        {item.time}
                      </Text>

                      {/* Delivery Status Receipts (PRD §4.A) */}
                      {isUser && (
                        <View style={styles.receiptBox}>
                          <CheckCheck
                            size={13}
                            color={
                              item.status === 'read'
                                ? '#86EFAC'
                                : 'rgba(255,255,255,0.7)'
                            }
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Quick Inquiry Suggestions */}
            <View style={styles.suggestionsSection}>
              <View style={styles.suggestionsHeader}>
                <Sparkles size={14} color={PALETTE.electricPurple} />
                <Text style={styles.suggestionsTitle}>{t.suggestionsTitle}</Text>
              </View>
              <View style={styles.suggestionsWrap}>
                {SUGGESTIONS[lang].map((s, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.suggestionChip}
                    onPress={() => setInputText(s)}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Input Bar */}
          <View
            style={[
              styles.inputBar,
              { bottom: BottomTabInset + (Platform.OS === 'ios' ? 8 : 12) },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder={t.inputPlaceholder}
              placeholderTextColor={PALETTE.gray400}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <Pressable
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send size={18} color={PALETTE.white} />
            </Pressable>
          </View>
        </View>
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
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  containerWide: {
    maxWidth: 820,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.deepViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: PALETTE.cardSurface,
  },
  providerText: {
    flex: 1,
    minWidth: 0,
  },
  providerName: {
    fontFamily: Fonts.bold,
    fontSize: 14.5,
    color: PALETTE.black,
  },
  providerRole: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray500,
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  dutyText: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    color: '#166534',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPill: {
    backgroundColor: PALETTE.cardLavender,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  langPillText: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    color: PALETTE.deepViolet,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETTE.electricPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.electricPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Safety Banner */
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    padding: 10,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#FFD4DC',
    gap: 8,
  },
  safetyIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  safetyTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  safetyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.vibrantCrimson,
  },
  safetyDesc: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: PALETTE.gray600,
    lineHeight: 13,
  },
  sosQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  sosQuickText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: PALETTE.white,
  },

  /* Security Pill */
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3EDFD',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  securityText: {
    fontFamily: Fonts.medium,
    fontSize: 10.5,
    color: PALETTE.deepViolet,
  },

  /* Messages */
  messageList: {
    flex: 1,
    marginTop: 8,
  },
  messageListContent: {
    gap: 12,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowProvider: {
    justifyContent: 'flex-start',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PALETTE.deepViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: PALETTE.deepViolet,
    borderBottomRightRadius: 4,
  },
  bubbleProvider: {
    backgroundColor: PALETTE.cardSurface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8DDF8',
  },
  bubbleText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextUser: {
    color: PALETTE.white,
  },
  bubbleTextProvider: {
    color: PALETTE.black,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 9.5,
  },
  timeTextUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeTextProvider: {
    color: PALETTE.gray500,
  },
  receiptBox: {
    marginLeft: 2,
  },

  /* Suggestions */
  suggestionsSection: {
    marginTop: 10,
    gap: 8,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionsTitle: {
    fontFamily: Fonts.bold,
    fontSize: 11.5,
    color: PALETTE.deepViolet,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: PALETTE.cardLavender,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  suggestionText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },

  /* Input Bar */
  inputBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.cardSurface,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    gap: 8,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.black,
    maxHeight: 70,
    paddingVertical: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETTE.deepViolet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: PALETTE.gray300,
  },
});
