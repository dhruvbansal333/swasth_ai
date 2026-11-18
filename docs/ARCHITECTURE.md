# SWASTH AI — System Architecture Specification

**Version:** 2.0.0  
**Stack:** React 19 + Vite + Tailwind CSS 3 (Frontend) | Flask + SQLite + Scikit-Learn + XGBoost (Backend)

---

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT TIER (React 19)                           │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Basic Assess │  │ Adv. Report  │  │ Health Analy │  │ Health Guidance │ │
│  │ Wizard (UI)  │  │ Upload / OCR │  │ Dashboard    │  │ & Action Plan   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│         │                 │                 │                   │           │
│         └─────────────────┼─────────────────┴───────────────────┘           │
│                           │ Axios / Fetch (JWT Bearer Token)                │
└───────────────────────────┼─────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────────────┐
│                        API & BACKEND TIER (Flask)                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Middleware: CORS, JWT Auth Guard, Request Logger, Error Handler       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│         │                           │                         │             │
│  ┌──────▼──────┐             ┌──────▼──────┐           ┌──────▼──────┐      │
│  │ Auth Routes │             │ Assessment  │           │ Report OCR  │      │
│  │ & Service   │             │ & Analytics │           │ Extractor   │      │
│  └──────┬──────┘             └──────┬──────┘           └──────┬──────┘      │
│         │                           │                         │             │
└─────────┼───────────────────────────┼─────────────────────────┼─────────────┘
          │                           │                         │
┌─────────▼──────────────┐     ┌──────▼─────────────────────────▼─────────────┐
│    DATABASE TIER       │     │              MACHINE LEARNING TIER           │
│  (SQLite Relational)   │     │                                              │
│                        │     │  ┌──────────────┐  ┌──────────────┐  ┌─────┐ │
│  - users               │     │  │ Diabetes ML  │  │ Heart ML     │  │ HTN │ │
│  - patient_profiles    │     │  │ Pipeline     │  │ Pipeline     │  │ ML  │ │
│  - assessments         │     │  └──────────────┘  └──────────────┘  └─────┘ │
│  - health_habits       │     │                                              │
│                        │     │  - Calibrated Probability Estimator          │
│                        │     │  - Feature Contribution / Explainability     │
└────────────────────────┘     └──────────────────────────────────────────────┘
```

---

## 2. Database Schema (SQLite)

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `email` | TEXT | UNIQUE NOT NULL | User account email |
| `password_hash` | TEXT | NOT NULL | Bcrypt salted password hash |
| `full_name` | TEXT | NOT NULL | Patient legal or preferred name |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

### Table: `patient_profiles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Profile identifier |
| `user_id` | INTEGER | FOREIGN KEY (`users.id`) ON DELETE CASCADE | Associated user |
| `age` | INTEGER | CHECK(age > 0 AND age < 130) | Patient age |
| `gender` | TEXT | CHECK(gender IN ('Male', 'Female', 'Other')) | Biological sex |
| `height_cm` | REAL | CHECK(height_cm > 40 AND height_cm < 260) | Height in centimeters |
| `weight_kg` | REAL | CHECK(weight_kg > 20 AND weight_kg < 350) | Weight in kilograms |
| `blood_group` | TEXT | NULLABLE | Blood group indicator |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last updated timestamp |

### Table: `assessments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Assessment session ID |
| `user_id` | INTEGER | FOREIGN KEY (`users.id`) ON DELETE CASCADE | Associated user |
| `assessment_type`| TEXT | CHECK(assessment_type IN ('basic', 'advanced')) | Assessment mode |
| `vitals_json` | TEXT | NOT NULL | JSON payload of submitted clinical inputs |
| `results_json` | TEXT | NOT NULL | JSON payload of predictions, probabilities, and risk tiers |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |

### Table: `habit_logs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Habit log ID |
| `user_id` | INTEGER | FOREIGN KEY (`users.id`) ON DELETE CASCADE | Associated user |
| `habit_key` | TEXT | NOT NULL | Habit identifier (e.g. `walk_30_min`, `water_2l`) |
| `completed_date`| TEXT | NOT NULL | ISO date string (YYYY-MM-DD) |
| `status` | INTEGER | DEFAULT 1 | 1 = Completed, 0 = Incomplete |

---

## 3. REST API Contract Specification

### 3.1 Authentication
- `POST /api/auth/register`: `{ email, password, full_name }` -> `{ token, user }`
- `POST /api/auth/login`: `{ email, password }` -> `{ token, user }`
- `GET /api/auth/me`: Headers: `Authorization: Bearer <token>` -> `{ user, profile }`
- `PUT /api/auth/profile`: Headers: `Authorization: Bearer <token>`, `{ age, gender, height_cm, weight_kg }` -> `{ profile }`

### 3.2 Predictions & Clinical Assessment
- `POST /api/predict/basic`:
  - Request: `{ age, sex, bp, glucose, cholesterol, bmi, heartRate, pregnancies, lifestyle: {...} }`
  - Response:
    ```json
    {
      "diabetes": { "riskTier": "Moderate", "probability": 0.42, "factors": [...] },
      "heart": { "riskTier": "Low", "probability": 0.18, "factors": [...] },
      "hypertension": { "riskTier": "High", "probability": 0.74, "factors": [...] },
      "overallSummary": "Elevated blood pressure indicates hypertensive risk.",
      "assessmentId": 14
    }
    ```
- `POST /api/predict/advanced`:
  - Request: Lab report biomarkers (HbA1c, Fasting Glucose, Lipid profile HDL/LDL/Triglycerides, etc.)
  - Response: Deep biomarker stratification + disease risk updates.
- `POST /api/report/extract`:
  - Request: `multipart/form-data` with medical report file (PDF / PNG / JPG).
  - Response: Structured extracted biomarker keys, values, standard units, and reference ranges.

### 3.3 Patient Health History & Actions
- `GET /api/assessments`: Retrieves user's historical assessment timeline.
- `GET /api/analytics/trends`: Computes time-series trends for BP, Glucose, BMI, and Risk scores.
- `GET /api/guidance`: Delivers personalized evidence-based recommendations based on latest assessment.
- `POST /api/habits/toggle`: Logs completion of daily preventive health actions.
- `DELETE /api/user/data`: Deletes all historical assessments and personal data (GDPR right-to-be-forgotten).

---

## 4. Security & Privacy Architecture

1. **Password Security:** Salted hashes generated with `bcrypt` (work factor: 12).
2. **Stateless Authorization:** Cryptographically signed JWT tokens (HMAC-SHA256) with 7-day expiration.
3. **Data Isolation:** Every database query filters strictly by `user_id` parsed from the authenticated JWT token.
4. **Environment Isolation:** Secrets (`SECRET_KEY`, `JWT_SECRET`, `DATABASE_PATH`) configured via `.env`.
5. **No Biological Zeroes:** Missing value handling managed via statistical imputation in pipelines, never zero-coercion.
