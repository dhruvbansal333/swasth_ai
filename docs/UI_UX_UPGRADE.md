# SWASTH AI — Frontend UI/UX Modernization Architecture

**Release:** Version 2.1.0  
**Design Inspiration:** Apple Health, Linear, Stripe Dashboard, Modern Medical SaaS Platforms  
**Palette:** Dark Navy & Deep Slate (`#020617`, `#0f172a`, `#1e293b`), Cyan/Blue Accents (`#38bdf8`, `#2563eb`), Emerald/Amber/Rose Risk Badges  

---

## 1. Visual Hierarchy & Design System

The Swasth AI user interface was comprehensively overhauled from a dated light-gray layout into a modern, dynamic, dark-slate clinical healthcare interface.

### Core Visual Principles
- **Minimalist Sophistication:** High-contrast typography, deep slate backgrounds, subtle border strokes (`border-slate-800`), and soft ambient glows.
- **Micro-Interactions & Transitions:** Fluid progress meters, interactive SVG charts, pulse dots, hover states, and smooth multi-step wizards.
- **Clinical Readability:** Strict separation between raw laboratory reference values (e.g. ADA fasting glucose $<100\text{ mg/dL}$) and model statistical probabilities (e.g. $7.2\%$).
- **Zero Fabricated Visuals:** Every chart and trend line maps strictly to real recorded patient inputs and database assessments.

---

## 2. Page-by-Page Modernization Overview

### A. Navigation Bar (`Navbar.jsx`)
- **Sticky Glassmorphism Header:** `bg-slate-950/90 backdrop-blur-md` with dynamic scroll detection and subtle drop shadow.
- **Brand Identity:** Multi-color gradient icon with glowing status pulse indicating production pipeline v2.1.0 online.
- **Active Navigation Indicators:** Pill highlights with gradient bottom accent lines indicating active routes.
- **Patient Profile Dropdown:** Displays initials avatar, patient full name, email, quick links to Profile and Timeline, and secure Sign Out.
- **Responsive Drawer:** Slide-over navigation for mobile devices with one-click Quick Assessment CTA.

### B. Landing Page (`Home.jsx`)
- **Hero Section:** Dynamic animated headline with gradient text clipping, live system status pill, and dual primary CTAs (*"Basic Assessment"* & *"Upload Lab Report"*).
- **Verified Benchmark Grid:** 4 metric cards displaying real evaluation statistics (Hypertension ROC-AUC: 95.2%, Coronary CAD ROC-AUC: 93.2%, Diabetes ROC-AUC: 81.8%, 5,926 patient cases).
- **Target Disease Cards:** 3 gradient-bordered cards detailing Type 2 Diabetes, Coronary Heart Disease CAD, and Clinical Hypertension with evaluated features and model types.
- **Dual Assessment Path Showcase:** Clear side-by-side comparison between Path A (Guided Vitals) and Path B (Lab Report Extraction).
- **Security & Ethics Section:** Highlights local SQLite storage isolation, JWT authorization, and HIPAA/GDPR-ready data wipe capabilities.

### C. Basic Assessment Wizard (`BasicAssessment.jsx`)
- **4-Step Guided Medical Intake:**
  - *Step 1: Demographics & Anthropometry:* Age, biological sex, height, weight, real-time auto-computed BMI with WHO category classification badge, and female-conditional pregnancy intake.
  - *Step 2: Vitals & Metabolic Biomarkers:* Systolic & diastolic blood pressure with AHA reference badges, blood glucose, and total cholesterol.
  - *Step 3: Cardiac & Lifestyle:* Resting pulse, regular smoking toggle, clinical chest discomfort patterns (distinguishing general screening from silent ischemia), and exertional angina toggle.
  - *Step 4: Clinical Review Screen:* Full summary table of all entered parameters with missing data completeness checks prior to execution.
- **Interactive Multi-Model Output Dashboard:**
  - Overall Composite Health Stratification banner with clinical guidance.
  - Out-of-Range Clinical Biomarker Alerts (comparing inputs against AHA/ADA reference guidelines).
  - 3 independent Disease Risk Cards displaying calibrated probability percentages, risk tier badges, model metadata, and explainable positive/protective factors.

### D. Advanced Diagnostic Report Assessment (`AdvancedAssessment.jsx`)
- **Drag-and-Drop Intake Zone:** Modern dashed dropzone supporting PDF lab reports, text results, and scanned images with animated upload feedback.
- **Extracted Biomarker Tags:** Real-time pills showcasing extracted readings with standard units (mg/dL, mmHg, %).
- **Interactive Editable Verification Table:** Allows patients to inspect, edit, or supply missing laboratory numbers before running AI inference.
- **Comprehensive Scorecards:** Displays multi-disease risk synthesis alongside specific lab biomarkers utilized by each pipeline.

### E. Health Analytics Dashboard (`Analytics.jsx`)
- **Longitudinal Trend Tracking:** Real-time multi-point SVG charts for Systolic Blood Pressure, Blood Glucose, Cholesterol, and BMI with clinical target reference dashed guidelines.
- **Recent Assessment Overview:** Detailed overview card highlighting overall risk tier, date, and baseline vitals.
- **Disease-Specific In-Depth Cards:** Probability percentages, risk tier badges, explainable factor contributions, and cohort source citations.
- **Model Calibration Explanation Card:** Transparent explanation of Platt scaling, cross-validated sigmoid transformations, and population cohort mappings.
- **Beautiful Empty State:** Professional empty state for new patients without historical assessments.

### F. Health Companion (`Guidance.jsx`)
- **Interactive Daily Habit Tracker:** Allows patients to check off daily preventive practices (hydration, 30-min walking, Mediterranean meals, BP monitoring) with real-time toggle persistence to the backend database.
- **Daily Progress Bar:** Visual completion percentage indicator.
- **Disease-Specific Action Plans:** Categorized priority actions and red-flag clinical threshold alerts based on the patient's actual risk tiers.
- **Diet & Exercise Protocols:** Structured DASH diet recommendations, foods to moderate, and physical activity guidelines.

### G. History & Profile (`History.jsx`, `Profile.jsx`)
- **History Timeline:** Chronological list of past assessments with filter pills (*All*, *Basic*, *Diagnostic Lab*), detail inspection modal, individual delete actions, and full GDPR/HIPAA database wipe modal.
- **Patient Profile:** Editable physical baseline (height, weight, blood group), auto-computed BMI, account security information, and data privacy controls.

### H. Authentication Portal (`Login.jsx`)
- **Split-Screen Modern Layout:** Left panel showcasing platform architecture, clinical metrics, and security guarantees; right panel with clean tabs for Sign In and Register.
- **Input Enhancements:** Password show/hide toggle eye, client-side validation feedback, loading state spinners, and guest bypass links.
