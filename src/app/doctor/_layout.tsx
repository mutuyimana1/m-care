import { NativeTabs } from 'expo-router/native-tabs';

import { UI } from '@/components/mcare-ui';

export default function DoctorTabsLayout() {
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
        <NativeTabs.Trigger.Label>Overview</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="patients">
        <NativeTabs.Trigger.Label>Patients</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="registration">
        <NativeTabs.Trigger.Label>Register</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="review">
        <NativeTabs.Trigger.Label>Follow-up</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
