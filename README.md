# AeroIndex Mobile App

> **A Hyper-Local Air Quality Monitoring & Spike Detection System**
>
> *This repository contains the mobile application implementation for the AeroIndex research initiative, designed to provide real-time, high-fidelity indoor and outdoor air quality monitoring using low-cost hardware sensors.*

## Overview

AeroIndex (connecting to **AeroContext** hardware) is a cross-platform mobile application built with React Native and Expo. It interfaces directly with an ESP32-based multi-sensor array via **Bluetooth Low Energy (BLE)**. 

The primary research objective of this application is to move beyond generalized, city-wide Air Quality Index (AQI) data by providing users with **hyper-local, real-time context**. The system employs an adaptive baseline algorithm to detect sudden particulate matter (PM2.5/PM10) "spikes," categorizing potential pollution sources and securely logging the data for longitudinal analysis.

## Key Features

- **Real-Time BLE Telemetry**: Interfaces with ESP32 microcontrollers to stream PM2.5, PM10, Temperature, and Humidity at high frequencies.
- **Adaptive Spike Detection**: Implements a rolling baseline algorithm to instantly detect and alert users of sudden deviations in air quality.
- **Dynamic AQI Calculation**: Automatically translates raw PM2.5 µg/m³ concentrations into standardized US EPA Air Quality Index values.
- **Cloud Synchronization**: Securely logs historical pollution events and sensor data to Firebase Firestore, tied to secure user accounts via Firebase Authentication.
- **High-Performance Visualizations**: Utilizes `@shopify/react-native-skia` to render smooth, 60fps real-time data charts.

## Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (SDK 54)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State & BLE**: `react-native-ble-plx` for robust Bluetooth Low Energy communication.
- **Animations & Graphics**: `react-native-reanimated` & `react-native-skia`
- **Backend & Auth**: Firebase (Authentication & Firestore)

## Hardware Integration (AeroContext)

The app is designed to pair with the **AeroContext ESP32 Firmware**.
- **BLE Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
- **Data Payload**: Transmits base64 encoded JSON containing `pm25`, `pm10`, `temp`, `humidity`, `isSpike`, `delta`, `baseline`, and predicted `source`.

## Installation & Local Development

### Direct Download (Pre-compiled APK)
If you simply want to test the app without building from source, you can download the latest pre-compiled Android `.apk` file directly from the [GitHub Releases](https://github.com/iamfardinn/Aero-Index-App/releases) page. Install the APK and ensure that **Bluetooth** and **Location Services** are enabled on your device.

### 1. Prerequisites
- Node.js (v18+)
- Expo CLI
- An Android device (BLE features require a physical device; they will not work in an emulator).

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/aero-index-app.git
cd aero-index-app

# Install dependencies
npm install
```

### 3. Running the App
To start the development server:
```bash
npx expo start
```
*Note: Because this project uses custom native modules (`react-native-ble-plx`), you must use a development build or a standalone APK to test Bluetooth features, rather than standard Expo Go.*

### 4. Compiling the Android APK
This project uses **Expo Application Services (EAS)** for continuous native generation.
```bash
# Trigger a cloud build for Android
eas build -p android --profile preview
```
Once the build completes, download the generated `.apk` and install it on your Android device. Ensure that **Bluetooth** and **Location Services** are enabled.

## License
This project is part of ongoing research.
