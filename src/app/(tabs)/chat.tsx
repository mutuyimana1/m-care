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
  CheckCheck,
  Phone,
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
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'provider',
    text: 'Muraho! Hello, I am Midwife Mukamana from Muhima Health Center. How are you and your baby feeling today?',
    time: '10:15 AM',
  },
  {
    id: '2',
    sender: 'user',
    text: 'Hello nurse, I am in week 28 and experiencing mild cramps in my lower abdomen. Is this normal?',
    time: '10:18 AM',
  },
  {
    id: '3',
    sender: 'provider',
    text: 'Mild, irregular tightness can be normal Braxton-Hicks contractions. However, if they become regular, painful, or accompanied by any fluid leakage or bleeding, you must come to the health center immediately. Are you resting and drinking water?',
    time: '10:20 AM',
  },
];

const SUGGESTIONS = [
  'How many baby kicks per day?',
  'When is my next ANC visit?',
  'Foods rich in iron & folic acid',
  'Signs that labor is starting',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated midwife response
    setTimeout(() => {
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'provider',
        text: 'Thank you for updating me. I have noted this in your health file. If you experience severe symptoms, tap the Emergency Call button above.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  const handleCall = () => {
    Alert.alert(
      'Call Health Provider',
      'Connecting to Duty Midwife Mukamana at Muhima Maternity Ward (+250 788 123 456)'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={[styles.container, isWide && styles.containerWide]}>
          {/* Header Card */}
          <View style={styles.header}>
            <View style={styles.providerInfo}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <UserCheck size={22} color={PALETTE.white} />
                </View>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.providerText}>
                <Text style={styles.providerName}>Midwife Mukamana</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.providerRole}>Muhima Health Center · </Text>
                  <Text style={styles.onlineStatus}>Online Now</Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call healthcare provider"
              style={styles.callButton}
              onPress={handleCall}
            >
              <Phone size={18} color={PALETTE.white} />
            </Pressable>
          </View>

          {/* Privacy Note */}
          <View style={styles.securityPill}>
            <ShieldCheck size={14} color={PALETTE.deepViolet} />
            <Text style={styles.securityText}>
              Encrypted health consultation with verified MOH providers
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
                      {isUser && <CheckCheck size={13} color="rgba(255,255,255,0.7)" />}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Quick Inquiry Suggestions */}
            <View style={styles.suggestionsSection}>
              <View style={styles.suggestionsHeader}>
                <Sparkles size={14} color={PALETTE.electricPurple} />
                <Text style={styles.suggestionsTitle}>Suggested Inquiries</Text>
              </View>
              <View style={styles.suggestionsWrap}>
                {SUGGESTIONS.map((s, idx) => (
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
              placeholder="Ask a question about your pregnancy..."
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
  },
  containerWide: {
    maxWidth: 820,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF5FE',
    borderBottomWidth: 1.5,
    borderBottomColor: '#DFCEFA',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: PALETTE.white,
  },
  providerText: {
    gap: 2,
  },
  providerName: {
    fontFamily: Fonts.bold,
    fontSize: 15.5,
    color: PALETTE.black,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRole: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    color: PALETTE.gray500,
  },
  onlineStatus: {
    fontFamily: Fonts.bold,
    fontSize: 11.5,
    color: '#059669',
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PALETTE.vibrantCrimson,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.vibrantCrimson,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E7DCF8',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  securityText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: PALETTE.deepViolet,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageListContent: {
    paddingTop: 16,
    gap: 12,
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
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: PALETTE.electricPurple,
    borderBottomRightRadius: 4,
  },
  bubbleProvider: {
    backgroundColor: '#EDE4FA',
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: '#DFCEFA',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontFamily: Fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
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
    marginTop: 6,
  },
  timeText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  timeTextUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeTextProvider: {
    color: PALETTE.gray500,
  },
  suggestionsSection: {
    marginTop: 20,
    backgroundColor: PALETTE.cardPeach,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFD3CA',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: PALETTE.vibrantCrimson,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: '#FFD3CA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  suggestionText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#63473D',
  },
  inputBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF5FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#DFCEFA',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    maxHeight: 80,
    fontFamily: Fonts.regular,
    fontSize: 13.5,
    color: PALETTE.black,
    paddingVertical: 6,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PALETTE.electricPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: PALETTE.gray300,
  },
});
