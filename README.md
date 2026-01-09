# Secret Calculator

A calculator app with a hidden notes vault. Looks and works like a normal calculator, but entering a secret code reveals a private notes section.

## Features

- Full calculator with operator precedence (2+3*4 = 14, not 20)
- Calculation history (last 10 calculations)
- Hidden notes vault with create, edit, delete
- Notes persist locally on device
- Works on Android and Web

## Secret Code

Type `69/67` then press `=` to access the hidden notes.

Tap the grid icon to return to the calculator.

---

## Download

### Android
Download the APK from [Releases](../../releases) and install it on your device.

### Web
Use the web version: [Live Demo](https://secret-calculator.onrender.com)

---

## For Developers

### Run Locally

```bash
npm install
npm start
```

Then scan the QR code with **Expo Go** on Android.

### Run on Web

```bash
npm run web
```

---

## Tech Stack

- React Native / Expo
- TypeScript
- AsyncStorage for local persistence
- React Navigation

## License

MIT
