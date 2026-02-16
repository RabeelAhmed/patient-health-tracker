# Patient Health Tracking App

## Overview
A robust, local-storage-based Patient Health Tracking application. It features a modern, responsive UI with a medical theme, supported by Tailwind CSS.

## Features Implemented
- **Data Persistence**: Uses Local Data Storage to save records indefinitely on the device.
- **Smart Data Entry**: 
  - Allows partial entries (e.g., entering BP in the morning and Sugar levels later).
  - Merges data intelligently for the same date.
- **Dashboard Summary**:
  - Displays instantaneous averages for Blood Pressure and Sugar Levels.
  - Color-coded indicators (Green/Yellow/Red) based on health standards.
- **Visual Trends**:
  - Interactive Line Charts using Chart.js to visualize health progress over time.
- **Data Management**:
  - Full Table view of history.
  - Edit and Delete capabilities.
  - Month-based filtering.
- **Dark Mode**:
  - Fully integrated dark mode toggle for nighttime usage.
- **Responsive Design**:
  - Optimized for Mobile, Tablet, and Desktop.

## Usage Guide
1. **Open the App**: Open `index.html` in any modern web browser.
2. **Add Entry**: 
   - Select a Date.
   - Enter standard metrics (BP, Fasting Sugar, Post-meal Sugar).
   - Add optional notes.
   - Click "Save Record".
3. **View Trends**: Scroll down to see the auto-updating charts and average summaries.
4. **Manage Data**: Use the Table below to Edit errors or Delete old records. Use the dropdown to filter by month.

## Deployment to GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to **Settings > Pages**.
3. Select `main` branch and `/root` folder.
4. Save. Your site will be live in minutes!

## Project Structure
- `index.html`: Main structure.
- `js/app.js`: Core logic and event listeners.
- `js/storage.js`: Data handling and persistence.
- `js/ui.js`: UI rendering and updates.
- `js/charts.js`: Chart visualization logic.
- `css/style.css`: Custom overrides and animations.
