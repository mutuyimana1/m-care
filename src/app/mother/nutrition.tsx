import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { LocalizedText as Text } from '@/components/localized-text';
import { Card, Field, Page, PageHeader, PrimaryButton, SectionHeading, UI } from '@/components/mcare-ui';
import { useAuth } from '@/contexts/auth-context';
import { useClinic, type NutritionCheckIn } from '@/contexts/clinic-context';

type Trimester = 1 | 2 | 3;

type FoodItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  detail: string;
};

type FoodPlan = {
  label: string;
  range: string;
  focus: string;
  foods: FoodItem[];
};

const trimesterPlans: Record<Trimester, FoodPlan> = {
  1: {
    label: 'First trimester',
    range: 'Weeks 1–13',
    focus: 'Choose a variety of folate- and iron-containing foods, with small meals if that feels more comfortable.',
    foods: [
      { icon: 'leaf-outline', title: 'Beans, peas and lentils', detail: 'Plant-based protein, iron and folate.' },
      { icon: 'nutrition-outline', title: 'Dark leafy greens and citrus fruit', detail: 'Folate-rich vegetables with fruit as part of a varied diet.' },
      { icon: 'restaurant-outline', title: 'Fortified grains and well-cooked eggs', detail: 'Familiar staples with energy and protein.' },
      { icon: 'water-outline', title: 'Safe water and gentle snacks', detail: 'Try regular sips and small meals if nausea affects appetite.' },
    ],
  },
  2: {
    label: 'Second trimester',
    range: 'Weeks 14–27',
    focus: 'Include protein, iron, calcium-rich foods, fruit and vegetables across the day.',
    foods: [
      { icon: 'restaurant-outline', title: 'Beans, lentils, eggs and well-cooked meat', detail: 'Include a protein food with meals when available.' },
      { icon: 'leaf-outline', title: 'Leafy greens with fruit', detail: 'Try amaranth or other local greens with oranges or another fruit.' },
      { icon: 'nutrition-outline', title: 'Pasteurized milk or yogurt', detail: 'Or choose a calcium-fortified alternative.' },
      { icon: 'water-outline', title: 'Whole grains, vegetables and safe water', detail: 'Build meals around familiar staples such as maize, beans or sweet potato.' },
    ],
  },
  3: {
    label: 'Third trimester',
    range: 'Weeks 28–birth',
    focus: 'Keep meals varied and include protein, iron-rich foods, fiber and fluids.',
    foods: [
      { icon: 'restaurant-outline', title: 'Beans, lentils, eggs and well-cooked meat or fish', detail: 'Choose a protein food that is safe and available to you.' },
      { icon: 'leaf-outline', title: 'Leafy vegetables and fruit', detail: 'Add vegetables and fruit to meals and snacks.' },
      { icon: 'nutrition-outline', title: 'Whole grains and starchy vegetables', detail: 'Try whole grains, maize, potatoes or sweet potatoes.' },
      { icon: 'water-outline', title: 'Fiber-rich foods and safe water', detail: 'Beans, vegetables, fruit and water can support regular meals.' },
    ],
  },
};

const postpartumPlan: FoodPlan = {
  label: 'Postpartum nutrition',
  range: 'After delivery',
  focus: 'Choose varied meals and drinks that fit your needs, recovery and local food options.',
  foods: [
    { icon: 'restaurant-outline', title: 'Beans, eggs and well-cooked meat or fish', detail: 'Include protein foods as available.' },
    { icon: 'leaf-outline', title: 'Vegetables and fruit', detail: 'Choose a variety of seasonal produce.' },
    { icon: 'nutrition-outline', title: 'Whole grains and calcium-rich foods', detail: 'Try familiar staples and pasteurized dairy or fortified alternatives.' },
    { icon: 'water-outline', title: 'Safe water', detail: 'Drink regularly and follow advice from your care team.' },
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
            <View style={styles.focusHeading}>
              <View style={styles.focusIcon}>
                <Ionicons name="sparkles-outline" size={19} color={UI.accentDark} />
              </View>
              <Text style={styles.focusTitle}>Nutrition focus</Text>
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
      <View style={styles.foodIcon}>
        <Ionicons name={food.icon} size={20} color={UI.accentDark} />
      </View>
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
  foodList: { gap: 9 },
  foodCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 },
  foodIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: UI.lavender },
  foodCopy: { flex: 1, gap: 3 },
  foodTitle: { color: UI.ink, fontSize: 13, fontWeight: '800' },
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
