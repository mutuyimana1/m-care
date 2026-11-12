import { NativeTabs } from 'expo-router/native-tabs';

import { UI } from '@/components/mcare-ui';
import { useLanguage } from '@/contexts/language-context';

export default function DoctorTabsLayout() {
  const { t } = useLanguage();

  return (
    <NativeTabs
      backgroundColor={UI.white}
      indicatorColor={UI.lavender}
      labelVisibilityMode="labeled"
      labelStyle={{
        default: { color: UI.muted },
        selected: { color: UI.accentDark },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('Overview')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="patients">
        <NativeTabs.Trigger.Label>{t('Patients')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="registration">
        <NativeTabs.Trigger.Label>{t('Register')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="review">
        <NativeTabs.Trigger.Label>{t('Follow-up')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
