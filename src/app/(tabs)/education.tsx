import React, { useState } from 'react';
import {
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
  Apple,
  Baby,
  Bookmark,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  PlayCircle,
  Radio,
  Search,
  Sparkles,
} from 'lucide-react-native';
import { BottomTabInset, Fonts, PALETTE } from '@/constants/theme';

interface Article {
  id: string;
  category: string;
  title: string;
  kinyarwandaTitle: string;
  summary: string;
  readTime: string;
  accent: string;
  cardBg: string;
  icon: 'heart' | 'apple' | 'baby' | 'calendar';
}

const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'Pregnancy Care',
    title: 'The 8 Antenatal Care (ANC) Visits Schedule',
    kinyarwandaTitle: 'Gahunda y’inshuro 8 zo kwipimisha kwa muganga',
    summary:
      'Attending all 8 contacts ensures early detection of potential risks, prenatal ultrasound screening, and timely interventions.',
    readTime: '4 min read',
    accent: PALETTE.electricPurple,
    cardBg: PALETTE.cardSurface,
    icon: 'calendar',
  },
  {
    id: '2',
    category: 'Nutrition & Diet',
    title: 'Iron, Folic Acid & Balanced Rwandan Foods',
    kinyarwandaTitle: 'Imirire yuzuye, ubutare na vitamine ku mubyeyi',
    summary:
      'How to combine local nutrient-dense foods like isombe, amashaza, beans, eggs, and seasonal fruits to prevent maternal anemia.',
    readTime: '3 min read',
    accent: PALETTE.goldenYellow,
    cardBg: PALETTE.cardAmber,
    icon: 'apple',
  },
  {
    id: '3',
    category: 'Emergency Guide',
    title: '5 Maternal Danger Signs You Should Never Ignore',
    kinyarwandaTitle: 'Ibimenyetso 5 by’ingorane ku mubyeyi utwite',
    summary:
      'Severe headache, sudden blurred vision, vaginal bleeding, fever, and reduced baby kicks require immediate emergency triage.',
    readTime: '5 min read',
    accent: PALETTE.vibrantCrimson,
    cardBg: PALETTE.cardPeach,
    icon: 'heart',
  },
  {
    id: '4',
    category: 'Postnatal & Newborn',
    title: 'The Golden Hour: Skin-to-Skin & Early Breastfeeding',
    kinyarwandaTitle: 'Konski no kwita ku ruhinja mu masaha ya mbere',
    summary:
      'Why immediate skin-to-skin contact regulates your newborn’s temperature, bonds baby, and kickstarts natural colostrum immunity.',
    readTime: '4 min read',
    accent: PALETTE.deepViolet,
    cardBg: PALETTE.cardLavender,
    icon: 'baby',
  },
];

const CATEGORIES = ['All', 'Pregnancy Care', 'Nutrition & Diet', 'Emergency Guide', 'Postnatal & Newborn'];

export default function EducationScreen() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(['1']);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const toggleBookmark = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredArticles = ARTICLES.filter((a) => {
    const matchesCat = selectedCat === 'All' || a.category === selectedCat;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.kinyarwandaTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getIcon = (type: Article['icon'], color: string) => {
    switch (type) {
      case 'heart':
        return <Heart size={20} color={color} />;
      case 'apple':
        return <Apple size={20} color={color} />;
      case 'baby':
        return <Baby size={20} color={color} />;
      case 'calendar':
        return <Calendar size={20} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, isWide && styles.containerWide]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Sparkles size={13} color={PALETTE.electricPurple} />
                <Text style={styles.badgeText}>RWANDA MOH VERIFIED GUIDANCE</Text>
              </View>
            </View>
            <Text style={styles.title}>Maternal Knowledge Hub</Text>
            <Text style={styles.subtitle}>
              Scientifically verified maternal care, antenatal health, and newborn wellness
            </Text>
          </View>

          {/* Search Bar with warm tint */}
          <View style={styles.searchBar}>
            <Search size={18} color={PALETTE.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search guides, symptoms, foods, ANC visits..."
              placeholderTextColor={PALETTE.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Daily Live Video Session Card - Inspired by the reference image */}
          <View style={styles.liveSessionCard}>
            <View style={styles.liveTopRow}>
              <View style={styles.livePill}>
                <Radio size={12} color={PALETTE.white} />
                <Text style={styles.livePillText}>LIVE SESSION</Text>
              </View>
              <Pressable
                accessibilityLabel="Save session"
                onPress={() => toggleBookmark('session-live')}
                style={styles.liveBookmark}
              >
                <Bookmark
                  size={16}
                  color={savedIds.includes('session-live') ? PALETTE.goldenYellow : 'rgba(255,255,255,0.7)'}
                  fill={savedIds.includes('session-live') ? PALETTE.goldenYellow : 'transparent'}
                />
              </Pressable>
            </View>

            <Text style={styles.liveTitle}>Breathing & Gentle Pelvic Exercises</Text>
            <Text style={styles.liveSpeaker}>
              Guided by Sr. Uwase Claire, Registered Midwife (CHUK)
            </Text>

            <View style={styles.liveMetaRow}>
              <View style={styles.liveMetaItem}>
                <Clock size={13} color={PALETTE.goldenYellow} />
                <Text style={styles.liveMetaText}>Today · 04:30 PM - 05:30 PM (CAT)</Text>
              </View>
            </View>

            <View style={styles.liveActionRow}>
              <View style={styles.liveJoinButton}>
                <PlayCircle size={18} color={PALETTE.deepViolet} />
                <Text style={styles.liveJoinText}>Join Live Broadcast</Text>
              </View>
              <Text style={styles.liveAttendees}>142 mothers listening</Text>
            </View>
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCat === cat;
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    active && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCat(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Section Heading */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Article & Clinical Guides</Text>
            <Text style={styles.articleCount}>{filteredArticles.length} guides available</Text>
          </View>

          {/* Articles List with warm pastel backgrounds */}
          <View style={styles.articlesList}>
            {filteredArticles.map((article) => {
              const isSaved = savedIds.includes(article.id);
              return (
                <View
                  key={article.id}
                  style={[styles.articleCard, { backgroundColor: article.cardBg }]}
                >
                  <View style={styles.articleTopRow}>
                    <View
                      style={[
                        styles.articleIconBox,
                        { backgroundColor: article.accent + '22' },
                      ]}
                    >
                      {getIcon(article.icon, article.accent)}
                    </View>

                    <View style={styles.articleMeta}>
                      <Text style={[styles.articleCategory, { color: article.accent }]}>
                        {article.category}
                      </Text>
                      <View style={styles.timeTag}>
                        <Clock size={11} color={PALETTE.gray500} />
                        <Text style={styles.timeTagText}>{article.readTime}</Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => toggleBookmark(article.id)}
                      hitSlop={8}
                      style={styles.articleBookmark}
                    >
                      <Bookmark
                        size={17}
                        color={isSaved ? PALETTE.electricPurple : PALETTE.gray400}
                        fill={isSaved ? PALETTE.electricPurple : 'transparent'}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleKinyarwanda}>
                    {article.kinyarwandaTitle}
                  </Text>
                  <Text style={styles.articleSummary}>{article.summary}</Text>

                  <View style={styles.cardDivider} />

                  <View style={styles.articleActionRow}>
                    <Text style={styles.readMoreText}>Read Clinical Guide</Text>
                    <ChevronRight size={16} color={PALETTE.electricPurple} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bgCanvas,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  container: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 16,
  },
  containerWide: {
    maxWidth: 820,
  },
  header: {
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.purpleLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: PALETTE.deepViolet,
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 26,
    color: PALETTE.black,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.gray600,
    lineHeight: 19,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: PALETTE.cardSurface,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: PALETTE.black,
  },
  liveSessionCard: {
    backgroundColor: PALETTE.cardDeepViolet,
    borderRadius: 24,
    padding: 20,
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 25, 0.25)',
  },
  liveTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.vibrantCrimson,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  livePillText: {
    fontFamily: Fonts.extraBold,
    fontSize: 10,
    color: PALETTE.white,
    letterSpacing: 0.8,
  },
  liveBookmark: {
    padding: 4,
  },
  liveTitle: {
    fontFamily: Fonts.bold,
    fontSize: 19,
    color: PALETTE.white,
    letterSpacing: -0.3,
  },
  liveSpeaker: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 4,
  },
  liveMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  liveMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveMetaText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.goldenYellow,
  },
  liveActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveJoinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PALETTE.goldenYellow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  liveJoinText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: PALETTE.deepViolet,
  },
  liveAttendees: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PALETTE.cardLavender,
    borderWidth: 1,
    borderColor: '#DFD2F5',
  },
  categoryChipActive: {
    backgroundColor: PALETTE.electricPurple,
    borderColor: PALETTE.electricPurple,
  },
  categoryText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: PALETTE.gray700,
  },
  categoryTextActive: {
    fontFamily: Fonts.bold,
    color: PALETTE.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionHeading: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: PALETTE.black,
  },
  articleCount: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: PALETTE.gray500,
  },
  articlesList: {
    gap: 14,
  },
  articleCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DFD2F5',
    shadowColor: PALETTE.deepViolet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  articleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  articleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleMeta: {
    flex: 1,
  },
  articleCategory: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeTagText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: PALETTE.gray500,
  },
  articleBookmark: {
    padding: 4,
  },
  articleTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: PALETTE.black,
    lineHeight: 22,
  },
  articleKinyarwanda: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: PALETTE.deepViolet,
    marginTop: 2,
    marginBottom: 6,
  },
  articleSummary: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: PALETTE.gray600,
    lineHeight: 18,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E4D6FA',
    marginVertical: 12,
  },
  articleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMoreText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: PALETTE.electricPurple,
  },
});
