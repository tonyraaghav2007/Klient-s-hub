# Klient's Hub — Packaging, Labeling & Design

A responsive front-end web application for Klient's Hub, offering premium packaging, labeling, and package design services.

## Features
- **Modern Responsive Design**: Clean aesthetic with light and dark mode toggles.
- **Interactive Order Calculator**: Real-time quote estimation based on dimensions, materials, finishes, and quantities.
- **Order Tracking**: Simulated client-side order tracking flow.
- **Admin Management Portal**: Order monitoring and status management dashboard.
- **Micro-interactions**: Particle effects, floating navbar, and smooth transitions.

## Project Structure
- `index.html` — Main customer-facing website and quote calculator.
- `index.css` — Design system, typography, and light/dark theme styles.
- `script.js` — Interactive UI behaviors, calculators, and modals.
- `admin.html` & `admin.js` — Client-side administrative order overview.
- `assets/` — Image assets for packaging, labeling, and design services.

## Running Locally
Serve the files using any static local web server:
```bash
npx serve .
# or
npx http-server . -p 8080
```
