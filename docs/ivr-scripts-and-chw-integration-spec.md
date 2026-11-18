# M-CARE: Telnyx IVR Voice Scripts & CHW Integration Specification

## 1. Overview & Low-Literacy Voice Principles

This document provides the production-ready voice scripts (in **Kinyarwanda** and **English**), DTMF keypad interaction logic, Telnyx webhook architecture, and Community Health Worker (CHW) dashboard integration for M-CARE's automated outbound Interactive Voice Response (IVR) system.

### Core Design Principles for Rural & Low-Literacy Callers
1. **Maximum 3 Keypad Choices:** Never overwhelm the parent with complex number menus.
2. **Consistent Action Mapping Across All Calls:**
   * **Key 1:** Positive / Safe / Healthy / Confirmation (*"Meze neza / Nzaza"*)
   * **Key 2:** Danger / Pain / Problem / Reschedule (*"Mfite ikibazo / Ndi kurwara"*)
   * **Key 3:** Speak to Human Care Worker (*"Vugana n'umujyanama wawe"*)
3. **Pre-recorded Human Audio (`gather_using_audio`):** Pre-recorded by a native Kinyarwanda maternal nurse in a warm, reassuring, maternal tone. Cloud synthetic TTS is kept strictly as a fallback.
4. **Auto-Repeat on Silence:** If no key is pressed within 5 seconds, repeat the question once; if still no answer, log as *"Unanswered - Retry scheduled"* and notify the CHW.

---

## 2. Complete IVR Call Scripts (Kinyarwanda & English)

### Flow 1: Routine Gestational Health Check-In (Bi-weekly)
**Trigger:** Automatically initiated on Tuesday/Thursday mornings based on mother's gestational week.

```
[Phone Rings] -> [Mother Answers]
```

#### Audio Prompt (Gather)
* **Kinyarwanda:**
  > *"Muraho {Name}! Uyu ni M-Care ikwifuriza kumererwa neza mu cyumweru cya {Week} cy'inda yawe.*
  > 
  > *Niba umeze neza nta kibazo ufite, kanda **1**.*
  > *Niba ufite uburibwe bukomeye, umuriro, cyangwa amaraso, kanda **2**.*
  > *Niba ukeneye ko umujyanama wawe {CHW_Name} agufasha, kanda **3**."*
* **English:**
  > *"Hello {Name}! This is M-Care checking on you in week {Week} of your pregnancy.*
  > 
  > *If you are feeling healthy with no issues, press **1**.*
  > *If you have severe pain, fever, or bleeding, press **2**.*
  > *If you want to speak with your health worker {CHW_Name}, press **3**."*

#### Keypad Responses:
* **Key 1 (Healthy):**
  * *Audio:* *"Murakoze! Umuryango wawe ukomeze kumera neza. M-Care izongera kuguhamagara mu byumweru bibiri. Murabeho!"*
  * *Backend Action:* Log check-in status as `Healthy / Routine OK` in patient record.
* **Key 2 (Danger Sign):**
  * *Audio:* *"Ihute! Ibyo bimenyetso bisaba ubutabazi bwihuse. Tugiye kumenyesha umujyanama wawe {CHW_Name} ako kanya. Niba urembye cyane, hamagara 114 ako kanya. Murakoze."*
  * *Backend Action:* Fire **High-Priority Critical Alert (Level Red)** to assigned CHW with SMS escalation.
* **Key 3 (Transfer to CHW):**
  * *Audio:* *"Tugiye kuguhuza na {CHW_Name}. Tegereza gato..."*
  * *Backend Action:* Telnyx issues `calls.actions.transfer` bridging the call to `{CHW_Phone}`.

---

### Flow 2: Upcoming Clinic Visit (ANC) Reminder
**Trigger:** Initiated 48 hours prior to an Antenatal Care (ANC) appointment at the health facility.

#### Audio Prompt (Gather)
* **Kinyarwanda:**
  > *"Muraho {Name}! M-Care irakwibutsa ko ufite gahunda yo gusura ivuriro rya {Facility} ku wa {Date}.*
  > 
  > *Niba uzajyayo nk'uko bisanzwe, kanda **1**.*
  > *Niba utazaboneka cyangwa ukeneye guhindura itariki, kanda **2**.*
  > *Niba ukeneye ko umujyanama wawe {CHW_Name} agufasha, kanda **3**."*
* **English:**
  > *"Hello {Name}! M-Care is reminding you of your clinic visit at {Facility} on {Date}.*
  > 
  > *If you will attend as scheduled, press **1**.*
  > *If you cannot attend and need to reschedule, press **2**.*
  > *If you need assistance from your health worker {CHW_Name}, press **3**."*

#### Keypad Responses:
* **Key 1:** *"Murakoze kwemeza. Ntuzibagirwe kwitwaza ikarita yawe ya muganga. Murabeho!"* (Logged as `Visit Confirmed`).
* **Key 2:** *"Turakumenyesha ko umujyanama wawe {CHW_Name} ari bugufashe guhindura gahunda. Murabeho."* (Flags CHW to reschedule).
* **Key 3:** Bridges call to CHW.

---

### Flow 3: Missed Appointment Follow-up
**Trigger:** Initiated 24 hours after a scheduled ANC visit if the clinic did not mark attendance.

#### Audio Prompt (Gather)
* **Kinyarwanda:**
  > *"Muraho {Name}! Twabonye ko utageze ku ivuriro ejo hashize. Ubugenzuzi bw'inda yawe ni ingenzi cyane.*
  > 
  > *Niba uzajyayo uyu munsi cyangwa ejo, kanda **1**.*
  > *Niba wari urwaye bikakubuza kugenda, kanda **2**.*
  > *Niba ukeneye ko umujyanama wawe akugendera, kanda **3**."*

---

### Flow 4: Postpartum & Newborn Health Check (Days 3, 7, and 28)
**Trigger:** Initiated automatically for registered mothers in postpartum status.

#### Audio Prompt (Gather)
* **Kinyarwanda:**
  > *"Muraho {Name}! M-Care ikwifuriza ishya n'ihirwe n'umwana wawe.*
  > 
  > *Niba wowe n'umwana mumeze neza kandi umwana yonka neza, kanda **1**.*
  > *Niba ufite amaraso menshi, umuriro, cyangwa umwana yanze konka, kanda **2**.*
  > *Niba ukeneye ubufasha bw'umujyanama, kanda **3**."*

---

## 3. Telnyx Webhook Architecture & Code Pattern

```
                       +-----------------------------+
                       |    M-CARE Backend Node.js   |
                       +-----------------------------+
                        |                          ^
     1. calls.create()  |                          | 3. Webhook Events
                        v                          |    (call.answered,
                       +-----------------------------+   call.gather.ended)
                       |     Telnyx Voice Engine     |
                       +-----------------------------+
                        |                          ^
   2. Outbound Ring &   |                          | 4. DTMF Key Press
      Audio Playback    v                          |    (1, 2, or 3)
                       +-----------------------------+
                       |   Parent's Cellular Phone   |
                       |      (Feature or Smart)     |
                       +-----------------------------+
```

### Express / Telnyx Webhook Implementation Example

```typescript
import express, { Request, Response } from 'express';
import Telnyx from 'telnyx';

const app = express();
app.use(express.json());

const telnyx = new Telnyx(process.env.TELNYX_API_KEY!);
const S3_AUDIO_BASE = 'https://cdn.mcare.rw/audio/rw';

// 1. Webhook Endpoint registered in Telnyx Mission Control Portal
app.post('/api/webhooks/telnyx/voice', async (req: Request, res: Response) => {
  const { data } = req.body;
  const eventType = data.event_type;
  const callControlId = data.payload?.call_control_id;
  const clientState = data.payload?.client_state ? JSON.parse(Buffer.from(data.payload.client_state, 'base64').toString()) : {};

  try {
    switch (eventType) {
      // Step A: Call was answered by the parent
      case 'call.answered': {
        const audioUrl = `${S3_AUDIO_BASE}/routine_checkin_week${clientState.week || 21}.mp3`;
        
        await telnyx.calls.actions.gatherUsingAudio(callControlId, {
          audio_url: audioUrl,
          valid_digits: '123',
          minimum_digits: 1,
          maximum_digits: 1,
          timeout_millis: 6000,
          inter_digit_timeout_millis: 2000,
        });
        break;
      }

      // Step B: Parent pressed a digit on the phone keypad
      case 'call.gather.ended': {
        const digit = data.payload.digits;
        const patientId = clientState.patientId;
        const chwPhone = clientState.chwPhone || '+250788123456';

        if (digit === '1') {
          // Healthy Routine
          await logPatientCheckin(patientId, 'Healthy', 'IVR Automated Call - Key 1');
          await telnyx.calls.actions.playbackStart(callControlId, {
            audio_url: `${S3_AUDIO_BASE}/thank_you_healthy.mp3`
          });
        } else if (digit === '2') {
          // Urgent Danger Sign
          await triggerChwAlert(patientId, 'DANGER_SIGN', 'Reported severe pain/fever/bleeding via IVR key 2');
          await telnyx.calls.actions.playbackStart(callControlId, {
            audio_url: `${S3_AUDIO_BASE}/danger_sign_warning.mp3`
          });
        } else if (digit === '3') {
          // Transfer to Community Health Worker
          await telnyx.calls.actions.playbackStart(callControlId, {
            audio_url: `${S3_AUDIO_BASE}/transferring_to_chw.mp3`
          });
          await telnyx.calls.actions.transfer(callControlId, {
            to: chwPhone
          });
        }
        break;
      }

      // Step C: Call hung up
      case 'call.hangup': {
        console.log(`Call ${callControlId} ended. Duration: ${data.payload.duration_secs}s`);
        break;
      }
    }
  } catch (error) {
    console.error('Error handling Telnyx webhook:', error);
  }

  res.sendStatus(200);
});
```

---

## 4. CHW Screen Integration in M-CARE App

Community Health Workers (CHWs) need real-time visibility into these calls:
1. **Under Assigned Mothers:**
   * An on-demand button: `Trigger Automated IVR Call` (allows the CHW to trigger an automated check-in call with 1 tap).
   * Status badge showing the latest call date and outcome (`IVR: Healthy (Today 10:15)` or `IVR: Missed Call`).
2. **Under Notifications & Alerts:**
   * Danger-sign reports generated by IVR key `2` appear with an unmistakable `IVR Keypad Alert` badge.
   * Direct callback button to call the mother immediately.
3. **Summary Metric:**
   * A metric counter: `IVR Check-ins Today` to track reach across mothers without smartphones.
