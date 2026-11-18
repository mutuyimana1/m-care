# M-CARE: Simplified Parent Home Screen & Voice Removal Plan

## Executive Summary
This document outlines the architectural and UX redesign plan for the Mother/Parent landing experience in M-CARE, based on the following user directives:
1. **Remove the voice feature completely** (remove `expo-speech`, audio read-aloud buttons, and voice note recording).
2. **De-clutter the post-login landing screen**: Eliminate decision paralysis, complex medical vitals, and hospital metrics that confuse parents.
3. **Actionable, single-screen UX**: Ensure the screen fits within standard mobile viewports without unnecessary scrolling.
4. **Reference Google Drive Project Summary**: Align with the project objectives while streamlining for low-literacy parents and everyday caregivers.

---

## 1. Problem Analysis: The Current Landing Screen

### What is currently overwhelming parents:
1. **Cognitive Overload (12+ competing visual items):**
   - Realistic fetal image, two glass circular stat rings ("Completed 21", "Remaining 19"), unit switcher ("Weeks / Months").
   - Fetal statistics: "Baby weight 450 g" and "Baby BPM 140 bpm".
   - Clinical vitals grid: Heart Rate (bpm), Oxygen saturation (SpO₂), Blood pressure (systolic/diastolic mmHg), Temperature (°C).
   - Four large action cards ("How do you feel today?", "Talk to Care Worker", "Next Clinic Visit", "Healthy Food").
   - Emergency SOS banner.
   - Redundant audio speaker buttons beside every piece of text.
2. **Medical Jargon & Anxiety:**
   - In low-literacy or standard parental contexts, displaying raw numbers like `98 SpO₂` or `120/80 mmHg` has no actionable value for a mother at home. These are readings taken during clinical ANC visits and belong in the **Records** tab for doctors/CHWs, not on the daily home screen.
3. **Endless Scrolling:**
   - Users are forced to scroll past 600+ vertical pixels of cards to reach emergency contacts or action items, obscuring what matters most.

---

## 2. Redesign Principles: Essential & Actionable

A parent opening the app should instantly answer three questions in 3 seconds:
1. **"Where am I right now?"** → Current pregnancy week / baby milestone.
2. **"What do I need to do next?"** → Next upcoming clinic appointment.
3. **"What if something is wrong?"** → Report a symptom or call care worker / 114 emergency.

### What Stays on the Home Screen:
| Section | Purpose | Actionability |
| :--- | :--- | :--- |
| **Top Bar** | Greeting ("Hello Aline 👋") + Settings/Language modal button | Fast language switch (Kinyarwanda / English) |
| **Stage Milestone Card** | "Week 21 • 2nd Trimester" with visual milestone & progress indicator | Warm reassurance; tap to view stages |
| **Upcoming Visit Card** | "Next Clinic Visit: Friday, Nov 21" at Kacyiru Health Center | Tap to see clinic location or reminder |
| **Primary Action A** | "I'm Not Feeling Well" (Report Symptoms) | 1-tap route to visual symptom triage |
| **Primary Action B** | "Call Care Worker" (Direct contact with assigned CHW) | 1-tap direct phone call or message |
| **Emergency SOS Strip** | One-tap emergency call to Rwanda 114 ambulance line | Immediate emergency safety net |

### What Moves to Dedicated Tabs (No Duplication):
- **Clinical Vitals (BP, SpO₂, BPM, Weight)** → Already accessible in the **Records** tab.
- **Nutrition Tips & Recipes** → Already accessible in the **Nutrition** tab.
- **Full Consultation / Request History** → Already accessible in the **Care** tab.
- **Profile & Account Info** → Accessible in the **Profile** tab.

---

## 3. Visual Wireframe (Non-Scrollable Single Screen)

```
+-------------------------------------------------------------+
|  [Avatar] Hello Aline!                     [Settings / Lang] |
+-------------------------------------------------------------+
|                                                             |
|  +-------------------------------------------------------+  |
|  |  🌸 WEEK 21 OF 40 • 2nd Trimester                     |  |
|  |  "Your baby is growing strong and hearing sounds."     |  |
|  |  [==== Progress Bar: 52% =========================]   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  📅 NEXT CLINIC VISIT                                 |  |
|  |  Friday, 21 November 2026                             |  |
|  |  📍 Kacyiru Health Center • ANC Visit 3                |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +---------------------------+ +-------------------------+  |
|  |  🚨 NOT FEELING WELL      | |  👩‍⚕️ CALL CARE WORKER    |  |
|  |  Report symptoms          | |  CHW Marie (0788123456) |  |
|  +---------------------------+ +-------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  🆘 EMERGENCY: CALL 114 (Free Rwanda Ambulance)       |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
| [ Home ]   [ Nutrition ]   [ Care ]   [ Records ]  [ Profile] |
+-------------------------------------------------------------+
```

---

## 4. Complete Voice Feature Removal Plan

### Step-by-Step Execution:
1. **Uninstall `expo-speech`**:
   - Remove from `package.json` and `package-lock.json`.
2. **Clean `src/components/mcare-ui.tsx`**:
   - Delete `AudioReadButton` component and its import of `expo-speech`.
   - Remove `audioText` prop from `VisualActionCard`, `PictorialSymptomTile`, and `EmergencySOSBanner`.
3. **Clean `src/app/mother-symptoms.tsx`**:
   - Remove `AudioReadButton` components and imports.
   - Remove voice note attachment checkbox and references to `voiceNotes`.
4. **Clean `src/app/mother/care.tsx`**:
   - Remove `AudioReadButton` and speaker icons.
   - Remove `expo-audio` voice note recording interface (`useAudioRecorder`, recording controls, voice note preview player). Keep simple text messaging / follow-up requests.
5. **Clean `src/app/mother/nutrition.tsx` and `src/app/mother/reminders.tsx`**:
   - Remove `AudioReadButton` instances.
6. **Clean `src/contexts/clinic-context.tsx`**:
   - Remove `voiceNotes` state and `saveVoiceNote` method to prevent unused code.

---

## 5. Google Drive Integration Note
- Document: `M-Care Project Summary.docx` (File ID: `1rToI22B12ktt8ntcs2llP8V_Upu3oM4_`).
- Authentication status: Google Drive OAuth link opened in browser; waiting for account authorization callback.
- Once authenticated, we will cross-reference any additional specific requirements from the project summary docx.
