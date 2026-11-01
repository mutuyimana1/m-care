# M-CARE: Product Requirements Document (PRD)

**Product**: Maternal Community Alert, Response and Referral System (M-CARE)  
**Document version**: 1.0 — Front-End Prototype  
**Target audience**: Front-end developers, UI/UX designers, and project stakeholders  
**Initial pilot context**: Kicukiro and Nyagatare Districts, Rwanda  

---

## 1. Product Overview

M-CARE is a digital maternal-health support platform that enables pregnant and postpartum women to report symptoms, communicate with qualified healthcare professionals, receive approved health information, and connect with community health workers (CHWs) and health facilities when follow-up or referral is required.

The interface must support a clear, accessible user experience across different levels of digital literacy and phone access.

---

## 2. Product Objectives

1. Enable women to report maternal health concerns outside routine antenatal care visits.
2. Help healthcare professionals identify and respond to submitted alerts.
3. Support communication between women and qualified healthcare professionals.
4. Track referrals, follow-up actions, and case status.
5. Provide approved nutrition, pregnancy, and postnatal education.
6. Support a smartphone app while accommodating basic-phone users through future SMS/USSD integration.

---

## 3. User Roles and Permissions

| User Role | Main Activities |
| :--- | :--- |
| **Pregnant / postpartum woman** | Register, report symptoms, request professional advice, view guidance, and follow up on status. |
| **Community Health Worker (CHW / Animateur de Santé)** | View assigned cases, contact women, document follow-up, and escalate concerns. |
| **Health post / health center staff** | Review assigned cases, assess referral requests, update care and referral status. |
| **Hospital / receiving facility staff** | Review incoming referrals, confirm receipt, and update referral outcomes. |
| **Healthcare professional** | Respond to health questions through human-to-human messaging and provide approved guidance within their professional scope. |
| **System administrator** | Manage authorized accounts, roles, approved content, and system configuration. |

> *Users must only access information and functions permitted by their assigned role.*

---

## 4. Minimum Viable Product (MVP) Features

### A. Women’s Interface
- **Registration and consent**: Collect essential information, preferred language, pregnancy/postpartum status, and contact details. Explain data use and obtain appropriate consent.
- **Home dashboard**: Display key actions, relevant reminders, available support, and current follow-up status.
- **Symptom reporting**: Provide a simple guided form with symptom selection, onset, severity-related questions, and relevant pregnancy information, based on clinically approved requirements.
- **Confirmation and guidance**: Confirm successful submission and show approved next steps. Urgent instructions must be prominent when triggered by an approved protocol.
- **Professional chat**: Allow women to send messages to qualified healthcare professionals, view replies, and see whether a message has been received or answered.
- **Health education**: Display approved pregnancy nutrition and postnatal information.
- **Notifications and follow-up**: Show appropriate reminders, case updates, and referral information.

### B. Healthcare Worker Interface
- **Login and role-based dashboard**.
- **Alert inbox**: List assigned cases by protocol-defined priority and status.
- **Case details**: Display only the information needed to review and respond to a case.
- **Case actions**: Acknowledge alerts, document contact attempts, record follow-up, and escalate cases according to approved procedures.
- **Referral management**: View referral details, destination facility, status, and confirmation of receipt.
- **Messaging**: Respond to women’s questions within the professional’s authorized role.
- **Reporting overview**: Display basic operational indicators, such as open alerts, response times, and referral completion.

---

## 5. Required Screens

| Screen | Key Interface Elements |
| :--- | :--- |
| **Welcome & onboarding** | Product introduction, language selection, consent |
| **Registration / login** | Essential fields, validation, and error messages |
| **Woman’s home** | Report concern, professional chat, health education, follow-up status |
| **Symptom questionnaire** | Guided questions, progress indicator, submit action |
| **Submission result** | Confirmation, next steps, and urgent guidance where applicable |
| **Professional chat** | Message history, text input, send status, provider info |
| **Health education** | Topics, readable content, and navigation |
| **Worker dashboard** | Alert counts, priority/status filters, and assigned cases |
| **Case details** | Reported concern, timeline, permitted actions, and escalation |
| **Referral tracking** | Receiving facility, referral status, and follow-up |
| **Admin screens** | Authorized user and approved-content management |

---

## 6. User Interface and Design Requirements

- Use a mobile-first, responsive design that works on smartphones and tablets.
- Use plain language, familiar icons, and short, guided forms.
- Provide clear visual distinctions between routine information, urgent alerts, and emergency instructions.
- Support English and Kinyarwanda, with translation and terminology validated by local stakeholders.
- Ensure readable text, sufficient contrast, keyboard navigation, and accessible form labels.
- Display clear loading, success, empty-state, and error messages.
- Prevent accidental duplicate submissions and warn users before losing unsaved information.
- Design screens to work on low-bandwidth connections where technically feasible.
- Do not rely on colour alone to communicate urgency or status.

---

## 7. Basic-Phone Support for Future

The smartphone interface is the primary front-end prototype. Basic-phone users must be included in the product design through a compatible service workflow.
- **SMS**: Support concise confirmations, approved notifications, and follow-up updates.
- **USSD**: Plan for a structured, text-based symptom-reporting journey.
- **Voice/IVR**: Consider for users who need spoken prompts or assisted communication.
- **Professional responses**: Where a woman cannot use app-based chat, provide an agreed alternative, such as a call-back or SMS workflow.

*Note: SMS/USSD interactions may require telecom gateway and backend integration; they should not be represented as fully operational until those services are connected and tested.*

---

## 8. Alert, Escalation and Referral Workflow

1. A woman submits a symptom report if she has a concern.
2. The system processes the report using rules approved by maternal-health professionals.
3. The appropriate authorized worker or facility receives the alert.
4. The recipient acknowledges and documents the action taken.
5. If an alert is not acknowledged within the approved timeframe, the system follows the configured escalation procedure.
6. Where referral is required, the receiving facility and referral status are recorded.
7. The case is closed only according to the approved workflow, with follow-up documented where required.

> **Emergency safety requirement**: Emergency instructions must **not** depend on a routine chat reply. The interface must clearly direct users to the approved emergency pathway (e.g. 114 / SAMU 912) when appropriate. Clinical thresholds, warning-sign wording, escalation timeframes, and referral decisions must be defined and validated by qualified maternal-health stakeholders.

---

## 9. Privacy and Security Requirements

- Use secure authentication for professional and administrative accounts.
- Enforce role-based access to sensitive maternal-health information.
- Avoid exposing sensitive details in notification previews or shared-device screens.
- Request only information necessary for the service.
- Provide appropriate consent and privacy information.
- Use secure communication with the backend and support session expiry where appropriate.
- Show clear logout controls and handle unauthorized access gracefully.
- *During prototype development, synthetic data will be used.*

---

## 10. Acceptance Criteria

The MVP is ready for stakeholder review when:
1. Each defined user role can access the appropriate screens and actions.
2. A woman can complete a symptom report and receive a clear submission confirmation.
3. A healthcare worker can view an assigned test alert, acknowledge it, and record follow-up.
4. A professional can exchange messages with a test user.
5. A referral can be created or updated and its status displayed.
6. Urgent guidance is displayed according to configured test scenarios.
7. Forms validate required fields and explain errors clearly.
8. The interface works on all mobile screen sizes.
9. Unauthorized users cannot access restricted screens through the interface, and the backend independently enforces permissions.
10. The prototype uses synthetic data and passes agreed functional, usability, and accessibility checks.

---

## 11. Pilot Context & Evaluation

**Pilot context**: Kicukiro and Nyagatare Districts, Rwanda.

During pilot testing, assess:
- Ease of registration and symptom reporting.
- Successful submission and alert acknowledgement rates.
- Time from alert submission to professional response.
- Referral completion and documented follow-up.
- Professional chat response times.
- Usability across languages, literacy levels, and device types.

*These measures will assess feasibility and service performance; the prototype should not claim to reduce maternal mortality without appropriate clinical evaluation.*

---

## 12. Items Requiring Stakeholder Confirmation

Before development is finalized, confirm:
- Approved symptom questions, clinical alert categories, and emergency instructions.
- Which user roles may access each category of information.
- Referral destinations and escalation responsibilities for each care level.
- Languages and exact translations required for the first release.
- SMS/USSD provider, messaging costs, and integration availability.
- Professional chat staffing, service hours, and expected response times.
- Applicable data-protection, consent, retention, and hosting requirements.
