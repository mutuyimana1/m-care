import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { LocalizedText as Text } from '@/components/localized-text';
import {
  Card,
  Field,
  Page,
  PageHeader,
  PrimaryButton,
  SectionHeading,
  UI,
} from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic, type NutritionCheckIn } from '@/contexts/clinic-context';

type Trimester = 1 | 2 | 3;

type FoodPhoto = 'beans' | 'eggs' | 'greens' | 'mango' | 'milk' | 'sweetPotatoes';

type FoodItem = {
  title: string;
  detail: string;
  photo: FoodPhoto;
};

type FoodPlan = {
  label: string;
  range: string;
  focus: string;
  foods: FoodItem[];
};

const foodPhotos: Record<FoodPhoto, number> = {
  beans: require('@/assets/images/nutrition/beans.jpg'),
  eggs: require('@/assets/images/nutrition/eggs.jpg'),
  greens: require('@/assets/images/nutrition/greens.jpg'),
  mango: require('@/assets/images/nutrition/mango.jpg'),
  milk: require('@/assets/images/nutrition/milk.jpg'),
  sweetPotatoes: require('@/assets/images/nutrition/sweet-potatoes.jpg'),
};

const trimesterPlans: Record<Trimester, FoodPlan> = {
  1: {
    label: 'First trimester',
    range: 'Weeks 1–13',
    focus: 'Try beans or peas with maize, leafy greens, mangoes and eggs. If you feel nauseated, try small meals or snacks.',
    foods: [
      { title: 'Beans, peas or lentils', detail: 'Add to a stew or serve with maize or sweet potato.', photo: 'beans' },
      { title: 'Amaranth, dodo or leafy greens', detail: 'Cook well and add to beans, rice or another family meal.', photo: 'greens' },
      { title: 'Mangoes or other seasonal fruit', detail: 'Choose ripe fruit as a snack or with a meal.', photo: 'mango' },
      { title: 'Eggs', detail: 'Cook eggs fully and serve with a familiar staple.', photo: 'eggs' },
      { title: 'Sweet potatoes', detail: 'Boil, roast or mash and serve with your usual meal.', photo: 'sweetPotatoes' },
    ],
  },
  2: {
    label: 'Second trimester',
    range: 'Weeks 14–27',
    focus: 'Build meals from beans, eggs, sweet potatoes, leafy greens, mangoes and pasteurized milk or yogurt.',
    foods: [
      { title: 'Beans and lentils', detail: 'Serve with maize, rice or sweet potatoes.', photo: 'beans' },
      { title: 'Amaranth or other leafy greens', detail: 'Cook and add to beans, rice or another family meal.', photo: 'greens' },
      { title: 'Mangoes or other seasonal fruit', detail: 'Choose ripe fruit to enjoy with meals or as a snack.', photo: 'mango' },
      { title: 'Pasteurized milk or yogurt', detail: 'Choose pasteurized dairy or a suitable fortified alternative.', photo: 'milk' },
      { title: 'Eggs', detail: 'Cook eggs through and serve with a familiar staple.', photo: 'eggs' },
    ],
  },
  3: {
    label: 'Third trimester',
    range: 'Weeks 28–birth',
    focus: 'Add beans, eggs, leafy greens, mangoes and sweet potatoes to familiar meals.',
    foods: [
      { title: 'Beans and lentils', detail: 'Serve with maize, rice or sweet potatoes.', photo: 'beans' },
      { title: 'Leafy greens', detail: 'Cook local greens and add to your usual meals.', photo: 'greens' },
      { title: 'Mangoes or other seasonal fruit', detail: 'Enjoy ripe fruit with meals or as a snack.', photo: 'mango' },
      { title: 'Eggs', detail: 'Cook eggs through and serve with a familiar staple.', photo: 'eggs' },
      { title: 'Sweet potatoes', detail: 'Boil, roast or mash and serve with your usual meal.', photo: 'sweetPotatoes' },
      { title: 'Pasteurized milk or yogurt', detail: 'Choose pasteurized dairy or a suitable fortified alternative.', photo: 'milk' },
    ],
  },
};

const postpartumPlan: FoodPlan = {
  label: 'Postpartum nutrition',
  range: 'After delivery',
  focus: 'For recovery, choose familiar meals with beans, eggs, leafy vegetables, seasonal fruit and sweet potatoes. Drink safe water regularly.',
  foods: [
    { title: 'Beans and lentils', detail: 'Cook until soft and add to a familiar meal.', photo: 'beans' },
    { title: 'Leafy vegetables', detail: 'Choose seasonal greens and cook them well.', photo: 'greens' },
    { title: 'Mangoes or other seasonal fruit', detail: 'Enjoy ripe fruit when available.', photo: 'mango' },
    { title: 'Eggs', detail: 'Cook eggs fully and add them to your usual meal.', photo: 'eggs' },
    { title: 'Sweet potatoes', detail: 'Boil, roast or mash and serve with your usual meal.', photo: 'sweetPotatoes' },
    { title: 'Pasteurized milk or yogurt', detail: 'Choose pasteurized dairy or a suitable fortified alternative.', photo: 'milk' },
  ],
};

type NutritionCheckInDraft = {
  ateToday: NutritionCheckIn['ateToday'] | '';
  ateFruitOrVegetables: NutritionCheckIn['ateFruitOrVegetables'] | '';
  nauseaOrEatingDifficulty: NutritionCheckIn['nauseaOrEatingDifficulty'] | '';
  foodAccessDifficulty: NutritionCheckIn['foodAccessDifficulty'] | '';
  notes: string;
};

const emptyCheckIn: NutritionCheckInDraft = {
  ateToday: '',
  ateFruitOrVegetables: '',
  nauseaOrEatingDifficulty: '',
  foodAccessDifficulty: '',
  notes: '',
};

function getTrimester(weeks: number): Trimester | null {
  if (!Number.isFinite(weeks) || weeks < 1 || weeks > 42) return null;
  if (weeks < 14) return 1;
  if (weeks < 28) return 2;
  return 3;
}

export default function MotherNutritionScreen() {
  const { user } = useAuth();
  const { patients, nutritionCheckIns, submitNutritionCheckIn } = useClinic();
  const [checkIn, setCheckIn] = useState<NutritionCheckInDraft>(emptyCheckIn);
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);
  const patient = patients.find(
    (record) =>
      user?.email &&
      record.motherAccountEmail.toLowerCase() === user.email.toLowerCase() &&
      record.consent &&
      record.clinicianApproved,
  );
  const weeks = Number(patient?.gestationalAgeWeeks);
  const trimester = getTrimester(weeks);
  const isPostpartum = patient?.postpartumStatus === 'postpartum';
  const plan = isPostpartum ? postpartumPlan : trimester ? trimesterPlans[trimester] : null;
  const patientCheckIns = nutritionCheckIns.filter((entry) => entry.patientId === patient?.id);
  const latestCheckIn = patientCheckIns[0];
  const canSubmitCheckIn = Boolean(
    patient &&
      checkIn.ateToday &&
      checkIn.ateFruitOrVegetables &&
      checkIn.nauseaOrEatingDifficulty &&
      checkIn.foodAccessDifficulty,
  );

  const saveCheckIn = () => {
    if (
      !patient ||
      !checkIn.ateToday ||
      !checkIn.ateFruitOrVegetables ||
      !checkIn.nauseaOrEatingDifficulty ||
      !checkIn.foodAccessDifficulty
    ) return;
    submitNutritionCheckIn(patient.id, {
      ateToday: checkIn.ateToday,
      ateFruitOrVegetables: checkIn.ateFruitOrVegetables,
      nauseaOrEatingDifficulty: checkIn.nauseaOrEatingDifficulty,
      foodAccessDifficulty: checkIn.foodAccessDifficulty,
      notes: checkIn.notes.trim(),
    });
    setCheckIn(emptyCheckIn);
    setCheckInSubmitted(true);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="NOURISH YOURSELF"
        title="Nutrition"
        subtitle="Food ideas tailored to your recorded pregnancy stage."
      />

      <Card style={styles.hero}>
        <Image source={require('@/assets/images/baby2.jpg')} style={styles.heroImage} />
        <View style={styles.heroCopy}>
          <Text style={styles.demoLabel}>DEMO GUIDANCE</Text>
          <Text style={styles.heroTitle}>{plan?.label || 'Pregnancy nutrition'}</Text>
          <Text style={styles.heroDetail}>
            {isPostpartum
              ? 'Postpartum'
              : trimester
                ? `${plan?.range} · ${weeks} weeks recorded`
                : 'Ask your care team to confirm your current trimester.'}
          </Text>
        </View>
      </Card>

      {!isPostpartum && trimester ? (
        <View style={styles.trimesterTrack}>
          {([1, 2, 3] as const).map((item) => (
            <View key={item} style={[styles.trimesterStep, item === trimester && styles.trimesterStepActive]}>
              <Text style={[styles.trimesterText, item === trimester && styles.trimesterTextActive]}>
                {item === 1 ? '1st' : item === 2 ? '2nd' : '3rd'} trimester
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {plan ? (
        <>
          <Card style={styles.focusCard}>
            <View style={[styles.focusHeading, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 }}>
                <View style={styles.focusIcon}>
                  <Ionicons name="sparkles-outline" size={19} color={UI.accentDark} />
                </View>
                <Text style={styles.focusTitle}>Nutrition focus</Text>
              </View>
            </View>
            <Text style={styles.copy}>{plan.focus}</Text>
          </Card>

          <SectionHeading title="Recommended foods" />
          <View style={styles.foodList}>
            {plan.foods.map((food) => (
              <FoodRow key={food.title} food={food} />
            ))}
          </View>
        </>
      ) : (
        <Card>
          <Text style={styles.focusTitle}>Your trimester is not available</Text>
          <Text style={styles.copy}>
            Link an approved maternal record with a gestational age to see stage-specific suggestions.
          </Text>
        </Card>
      )}

      <Card style={styles.checkInCard}>
        <SectionHeading title="My nutrition check-in" />
        <Text style={styles.copy}>
          A few quick questions help your authorized care team understand any food or nutrition concerns.
        </Text>
        {patient ? (
          <>
            <CheckInQuestion
              label="Have you eaten today?"
              options={['Yes', 'No', 'Not sure']}
              value={checkIn.ateToday}
              onChange={(value) => setCheckIn((current) => ({ ...current, ateToday: value }))}
            />
            <CheckInQuestion
              label="Have you had fruit or vegetables?"
              options={['Yes', 'No', 'Not sure']}
              value={checkIn.ateFruitOrVegetables}
              onChange={(value) => setCheckIn((current) => ({ ...current, ateFruitOrVegetables: value }))}
            />
            <CheckInQuestion
              label="Any nausea or difficulty eating?"
              options={['Yes', 'No']}
              value={checkIn.nauseaOrEatingDifficulty}
              onChange={(value) => setCheckIn((current) => ({ ...current, nauseaOrEatingDifficulty: value }))}
            />
            <CheckInQuestion
              label="Any difficulty accessing food?"
              options={['Yes', 'No']}
              value={checkIn.foodAccessDifficulty}
              onChange={(value) => setCheckIn((current) => ({ ...current, foodAccessDifficulty: value }))}
            />
            <Field
              label="Anything else about food or eating?"
              value={checkIn.notes}
              onChangeText={(notes) => setCheckIn((current) => ({ ...current, notes }))}
              multiline
              numberOfLines={2}
              maxLength={300}
            />
            <PrimaryButton label="Save nutrition check-in" onPress={saveCheckIn} disabled={!canSubmitCheckIn} />
            {checkInSubmitted ? (
              <Text style={styles.checkInSuccess}>Your check-in was saved for your care team.</Text>
            ) : null}
            {latestCheckIn ? (
              <Text style={styles.checkInMeta}>
                Last check-in: {new Date(latestCheckIn.recordedAt).toLocaleDateString()}
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.copy}>Link an approved maternal record to save a nutrition check-in.</Text>
        )}
      </Card>

      <Card style={styles.safetyCard}>
        <View style={styles.focusHeading}>
          <Ionicons name="shield-checkmark-outline" size={20} color={UI.green} />
          <Text style={styles.safetyTitle}>Food safety</Text>
        </View>
        <Text style={styles.copy}>
          Wash produce, cook eggs, meat and fish thoroughly, choose pasteurized dairy and low-mercury fish. Avoid raw or undercooked animal foods. Take supplements only as advised by your care team.
        </Text>
        <Text style={styles.disclaimer}>
          General demo education only. Follow local clinical advice, especially for allergies, dietary restrictions or medical conditions.
        </Text>
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/mother/guidance')}
        style={({ pressed }) => [styles.guidanceLink, pressed && styles.pressed]}>
        <Text style={styles.guidanceText}>More pregnancy guidance</Text>
        <Ionicons name="arrow-forward" size={17} color={UI.accentDark} />
      </Pressable>
    </Page>
  );
}

function CheckInQuestion<T extends 'Yes' | 'No' | 'Not sure'>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | '';
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.checkInQuestion}>
      <Text style={styles.checkInLabel}>{label}</Text>
      <View style={styles.answerRow}>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: value === option }}
            onPress={() => onChange(option)}
            style={[styles.answerOption, value === option && styles.answerOptionSelected]}>
            <Text style={[styles.answerText, value === option && styles.answerTextSelected]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FoodRow({ food }: { food: FoodItem }) {
  return (
    <Card style={styles.foodCard}>
      <Image
        source={foodPhotos[food.photo]}
        style={styles.foodImage}
        resizeMode="cover"
        accessibilityLabel={food.title}
      />
      <View style={styles.foodCopy}>
        <Text style={styles.foodTitle}>{food.title}</Text>
        <Text style={styles.copy}>{food.detail}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FC', borderColor: '#EBDDFA' },
  heroImage: { width: 68, height: 74, borderRadius: 16 },
  heroCopy: { flex: 1, gap: 4 },
  demoLabel: { color: UI.accentDark, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: UI.ink, fontSize: 17, fontWeight: '800' },
  heroDetail: { color: UI.muted, fontSize: 11 },
  trimesterTrack: { flexDirection: 'row', gap: 7 },
  trimesterStep: { flex: 1, minHeight: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EDF4' },
  trimesterStepActive: { backgroundColor: UI.accent },
  trimesterText: { color: UI.muted, fontSize: 10, fontWeight: '700' },
  trimesterTextActive: { color: UI.white },
  focusCard: { backgroundColor: '#F8F3FB' },
  focusHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  focusIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.lavender },
  focusTitle: { color: UI.ink, fontSize: 14, fontWeight: '800' },
  copy: { color: UI.muted, fontSize: 12, lineHeight: 18 },
  foodList: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  foodCard: { width: '48%', gap: 8, padding: 10 },
  foodImage: { width: '100%', height: 96, borderRadius: 12, backgroundColor: UI.lavender },
  foodCopy: { flex: 1, gap: 3 },
  foodTitle: { color: UI.ink, fontSize: 12, lineHeight: 16, fontWeight: '800' },
  safetyCard: { backgroundColor: UI.greenLight, borderColor: '#DDEDE4' },
  checkInCard: { backgroundColor: '#F8F3FB' },
  checkInQuestion: { gap: 7 },
  checkInLabel: { color: UI.ink, fontSize: 12, fontWeight: '700' },
  answerRow: { flexDirection: 'row', gap: 7 },
  answerOption: { minHeight: 34, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#F1EDF4' },
  answerOptionSelected: { backgroundColor: UI.accentDark },
  answerText: { color: UI.muted, fontSize: 11, fontWeight: '700' },
  answerTextSelected: { color: UI.white },
  checkInSuccess: { color: UI.green, fontSize: 12, fontWeight: '700' },
  checkInMeta: { color: UI.muted, fontSize: 10 },
  safetyTitle: { color: UI.green, fontSize: 14, fontWeight: '800' },
  disclaimer: { color: UI.muted, fontSize: 10, lineHeight: 15 },
  guidanceLink: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  guidanceText: { color: UI.accentDark, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
