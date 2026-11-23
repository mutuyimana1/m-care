# Mobile Testing & Expo Go Guide

This guide explains how to run, view, and test the **M-CARE** mobile version on both iOS (iPhone) and Android devices, as well as via desktop mobile emulation.

---

## 1. Quick Access Summary

| Platform | Access Method | Target URL / Command |
| :--- | :--- | :--- |
| **iPhone (iOS)** | Expo Go / iOS Camera | Scan QR code or enter `exp://192.168.1.87:8081` |
| **Android** | Expo Go app | Scan QR code or enter `exp://192.168.1.87:8081` |
| **Web Browser** | Direct URL | [http://localhost:8081](http://localhost:8081) |
| **Web Mobile Emulation** | Chrome / Edge DevTools | Press `F12` -> `Ctrl+Shift+M` -> Select **iPhone 14** or **Pixel 7** |

> [!NOTE]
> The Expo development server serves **both mobile (Expo Go via Hermes JS engine)** and **web (React Native Web)** simultaneously on port `8081`.

---

## 2. Testing on Physical Mobile Devices

### A. Apple iPhone (iOS)
1. **Network Check:** Ensure your iPhone is connected to the same Wi-Fi network (`192.168.1.87`).
2. **Open Camera:** Open your iPhone's built-in **Camera** app.
3. **Scan Code:** Point your camera at the QR code below.
4. **Launch:** Tap the yellow prompt: **"Open in Expo Go"**.
   *(If the prompt does not appear, open the **Expo Go** app, select **"Enter URL manually"**, and paste `exp://192.168.1.87:8081`)*.

### B. Android Phone
1. **Network Check:** Ensure your Android device is on the same local Wi-Fi.
2. **Open Expo Go:** Launch the **Expo Go** app.
3. **Scan or Enter:** Tap **"Scan QR code"** and aim at the QR code below, or tap **"Enter URL manually"** and type `exp://192.168.1.87:8081`.

---

## 3. Scannable QR Code

![M-CARE Expo Go QR Code](./mobile-qr.svg)

```text
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █   █▄▄█▄██ ▄▄▄▄▄ █
█ █   █ █ ▀▄ █▀▄▄▄█ █   █ █
█ █▄▄▄█ █▀██▀▀█▀▄██ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄▀▄█ █▄█▄█▄▄▄▄▄▄▄█
█▄ ██ ▄▄▀█▀▀▄▀█▄ ███ ▀▄▄ ▄█
███ █ █▄ ██▀ ▄██ ▀▀ █▄  ▀██
█▀█▀ ▀▀▄█ █▄█▄▀▄▀▄▀▄▀▀▄ ▀██
████ ▀▀▄█▄ ▄█▀██▄▄▄█▄▀ ▀███
█▄▄▄▄██▄█▀▀ ▄▀█▄▄ ▄▄▄ ▀ ▄▄█
█ ▄▄▄▄▄ █▀▀▄ ▄██▀ █▄█ ▀▀█▀█
█ █   █ █▄ ▄█▄▀▄█▄▄ ▄▄▀   █
█ █▄▄▄█ █▀▄▄█▀█▀▄██▄▀█▀▀ ██
█▄▄▄▄▄▄▄█▄▄▄▄▄▄▄████▄▄▄▄▄▄█
```

---

## 4. Test User Credentials

| Role | Email | Password | Primary Workflow |
| :--- | :--- | :--- | :--- |
| **Mother / Parent** | `mother@mcare.demo` | `Mother123!` | Simplified home screen, pregnancy/child milestones, emergency hotline, symptoms reporting. |
| **Community Health Worker (CHW)** | `chw@mcare.demo` | `Chw123!` | Village triage, automated IVR check-ins, urgent home visits. |
| **Clinician / Doctor** | `doctor@mcare.demo` | `Doctor123!` | Clinical patient review, lab flags, prescription & care plans. |

---

## 5. Mobile UX Checklist Verified
- [x] SF Symbols on iOS navigation bar (`house`, `leaf`, `cross.case`, `doc.text`, `person`).
- [x] Material Icons on Android navigation bar (`home`, `nutrition`, `medical_services`, `description`, `person`).
- [x] Parent landing screen fitted to viewport without unneeded scrolling.
- [x] Voice feature removed completely from inputs, headers, and care guides.
- [x] Emergency SOS 114 hotline with instant call action.
