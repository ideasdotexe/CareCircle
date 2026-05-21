# CareCircle Canada — Foundation: Patient Health Profile
## Product Requirements Document

**Component:** Foundation — Patient Health Profile
**Platform:** Mobile app (iOS-first)
**Primary User:** Family member managing health for a loved one (B2C) — "Priya"
**Stage:** Phase 2 — Self-Testing | Submission deadline May 14, 2026
**Date:** May 2026

---

# CONTENTS

1. Abstract
2. Business Objectives
3. KPI
4. Success Criteria
5. User Journeys
6. Scenarios
7. User Flow
8. Functional Requirements
9. Model Requirements
10. Data Requirements
11. Prompt Requirements
12. Testing & Measurement
13. Risks & Mitigations
14. Costs
15. Assumptions & Dependencies
16. Compliance / Privacy / Legal
17. GTM / Rollout Plan

---

## 📝 Abstract

The Patient Health Profile is the foundational data layer of CareCircle Canada. It stores a structured, always-current record for each care recipient — covering demographics, medications, conditions, allergies, care team contacts, vitals history, and emergency contacts. Every other component (document ingestion, care intelligence, alert generation) depends on this profile existing and being accurate.

This PRD covers the mobile onboarding flow and ongoing profile management experience for the B2C user — a family member managing health for a parent, spouse, or child. Key design decisions:
- **Onboarding is 2 steps only:** account creation (Google, Apple, or email) + one care recipient (name + relationship). Everything else is optional and added later.
- **All details are progressive:** medications, conditions, allergies, care team, vitals — all added from the dashboard at the user's own pace via a "Complete your profile" prompt system.
- **Multi-person management:** a single account can hold multiple profiles (e.g. Father, Mother, Spouse, Child). New profiles are added from the dashboard at any time.
- PSW access, caregiver portal, and B2B agency features are out of scope for v1 — deferred to a future caregiver-side portal.

---

## 🎯 Business Objectives

- Remove all friction from first launch: a new user should be on their dashboard with at least one profile created in under 2 minutes.
- Enable progressive profile completion: users who start with just a name can return to add medications, conditions, and contacts over days or weeks as they gather information — without feeling penalized for skipping at onboarding.
- Support multi-person management from a single account — one user may be managing a parent, a spouse, and a child simultaneously. New profiles are added from the dashboard, not during onboarding.
- Create the data foundation required to demo Task 1 (document ingestion) and Task 2 (care intelligence) within 30 days of profile launch.
- Establish Canadian PHI-compliant data infrastructure (AWS ca-central-1) before any sensitive data is collected.

---

## 📊 KPI

| GOAL | METRIC | QUESTION |
|---|---|---|
| Frictionless onboarding | % of users who reach dashboard in under 2 minutes | Are 80%+ of new users through signup + first profile in under 2 minutes? |
| Deferred completion | % of users who fill medications + conditions within 7 days | Do 60%+ of users return to complete health details post-onboarding? |
| Multi-person adoption | % of accounts with 2+ profiles | Are users managing more than one person from a single account? |
| Ongoing vitals engagement | Vitals entries per profile per week | Are users logging vitals 3+ times/week after setup? |
| Pipeline readiness | % of profiles used as context by Task 1 or 2 | Are 80%+ of profiles connected to at least one ingestion or intelligence event within 30 days? |

---

## 🏆 Success Criteria

- **Onboarding speed:** 80%+ of beta users reach their dashboard with a first profile created in under 2 minutes.
- **No forced fields:** Zero users report feeling blocked during onboarding because they didn't have information on hand.
- **Deferred completion:** 60%+ of users return within 7 days to add medications, conditions, or allergies they skipped at onboarding.
- **First vitals entry:** 50%+ of users log at least one vitals reading within their first 7 days.
- **Multi-person usage:** 30%+ of beta accounts add a second profile within 30 days.
- **Downstream readiness:** Every profile — even a minimal one (name only) — successfully feeds Task 1 ingestion context within the beta window.

---

## 🚶 User Journeys

**Journey 1 — First-time setup, no info on hand (Priya, rushing)**
Priya downloaded CareCircle after her father was discharged from hospital. She's in the parking lot with 3 minutes. She opens the app, taps "Continue with Apple", enters her father's name, selects "Father" as the relationship, and is on her dashboard in under 90 seconds. A "Complete Dad's profile" card sits on the dashboard — she ignores it for now. That evening, from her couch, she taps the card and adds his 4 medications and 2 conditions in a second session.

**Journey 2 — First-time setup, info in hand (Priya, prepared)**
Priya sits down with her father's pharmacy printout and discharge papers. She signs in with Google, enters his name, then immediately taps "Complete his profile" and fills in medications, conditions, and one care team contact — about 7 minutes total. She lands on a populated profile summary and feels relief that it's all in one place for the first time.

**Journey 3 — Adding a second profile (Mother)**
Two weeks later, Priya's mother has a GP appointment and Priya wants to track her medications too. She opens the dashboard, taps "+ Add person", enters her mother's name, selects "Mother", and creates the second profile in 30 seconds. Both profiles appear on the dashboard as separate cards. She can switch between them with one tap.

**Journey 4 — Updating a medication**
Her father's GP adds a new medication. Priya opens his profile, navigates to medications, and adds the new drug in under 2 minutes. The change is timestamped. Task 2 (care intelligence) is triggered automatically.

---

## 📖 Scenarios

1. User sets up a new profile for a parent after a hospital discharge — needs to capture medications from a printout quickly.
2. User adds a new diagnosis after a specialist appointment.
3. User edits an existing medication (dose changed by GP).
4. User logs a blood pressure reading after using a home cuff.
5. User views a 30-day blood pressure trend chart.
6. User adds an emergency contact mid-setup and returns to finish later.
7. User deletes an old medication and the system timestamps the removal.
8. User adds a second profile (e.g. spouse) from the dashboard without going through onboarding again.

---

## 🕹️ User Flow

### Onboarding Flow (2 steps, under 2 minutes)

1. **Sign-up / Sign-in screen**
   - "Continue with Apple" (primary CTA — top of screen)
   - "Continue with Google"
   - "Continue with email" (secondary, below)
   - Existing users: "Sign in" link — takes them to login, same 3 options

2. **Add your first person** *(only required onboarding screen)*
   - "Who are you caring for?" — name field + relationship picker
   - Relationship options: Mother / Father / Spouse / Child / Myself / Other
   - Optional: Date of birth (single field, can skip)
   - CTA: "Create profile" → lands on dashboard immediately

3. **Dashboard** — first view
   - Care recipient card (e.g. "Dad · Profile 10% complete")
   - "Complete Dad's profile →" action card (persistent until profile reaches 80%)
   - "+ Add another person" button (always visible)
   - Quick-add vitals widget
   - Empty state for documents (hooks into Task 1 later)

---

### Progressive Profile Completion (from dashboard, any time)

Tapping "Complete [name]'s profile" opens a section checklist. Each section is independent — user can fill any section in any order, skip any section, and return anytime.

| Section | Required at onboarding? | Fields |
|---|---|---|
| Basic info | Name only | DOB, sex, weight, height |
| Conditions | No | Diagnosed conditions (suggested list + free text), past surgeries |
| Allergies | No | Medication / food / environmental allergies + severity |
| Medications | No | Name (autocomplete), dosage, frequency, prescribing doctor, start date |
| Care team | No | GP, specialists, pharmacy — name + phone |
| Emergency contacts | No | Name, relationship, contact channel |
| Vitals | No | Logged anytime from dashboard; not part of profile checklist |

---

### Multi-Person Management (dashboard)

- Dashboard shows all care recipient profiles as swipeable cards
- "+ Add person" always accessible from dashboard — same 2-step flow as onboarding
- Tapping a card opens that person's full profile
- No limit on number of profiles per account in v1

---

### Key Alternatives

- User exits mid-section → progress saved automatically, section marked "In progress"
- User has no medication info → skips entirely, dashboard shows nudge prompt
- User returns days later → dashboard shows exactly which sections are incomplete with one-tap shortcuts

---

## 🧰 Functional Requirements

| SECTION | SUB-SECTION | USER STORY & EXPECTED BEHAVIORS | SCREENS |
|---|---|---|---|
| Auth | Apple sign-in | As Priya, I can sign up or log in with Apple in one tap. Displayed as primary CTA. Email/name pre-filled from Apple account. | Sign-up / Login screen |
| Auth | Google sign-in | As Priya, I can sign up or log in with Google in one tap. | Sign-up / Login screen |
| Auth | Email signup | As Priya, I can create an account with email + password if I don't want to use Apple or Google. 8-char min password. Confirmation email sent. | Sign-up screen |
| Auth | Login | As Priya, I can log back in with Apple, Google, or email. Session persists for 30 days. | Login screen |
| Auth | Forgot password | As Priya, I can reset my password via email link (email-auth users only). Link expires in 24 hours. | Forgot password screen |
| Onboarding | Add first person | As Priya, I enter a name and pick a relationship (Mother / Father / Spouse / Child / Myself / Other). DOB is optional. One tap creates the profile and takes me to dashboard. No other fields required. | Add person screen |
| Dashboard | Profile cards | As Priya, I see all my profiles as cards on the dashboard. Each card shows name, relationship, and profile completion %. Tapping opens that profile. | Dashboard |
| Dashboard | Add another person | As Priya, I can tap "+ Add person" from the dashboard at any time to create a second or third profile. Same 2-field flow as onboarding. | Dashboard → Add person |
| Dashboard | Completion prompt | As Priya, I see a "Complete [name]'s profile →" action card on the dashboard until the profile reaches 80% completion. The card shows which sections are missing. | Dashboard |
| Profile | Progressive sections | As Priya, I can open any profile section independently from a checklist and fill it in any order. I can save partial progress and return anytime. No section blocks another. | Profile checklist screen |
| Profile | Conditions | As Priya, I can type a condition name and select from a suggested list (common conditions pre-loaded). I can add multiples. | Conditions screen |
| Profile | Allergies | As Priya, I can add allergies with a severity tag (mild / severe / anaphylactic). Displayed prominently on profile summary. | Allergies screen |
| Profile | Medications | As Priya, I can add a medication with: name (autocomplete), dosage, frequency, prescribing doctor, start date. I can add multiples. I can mark a medication as stopped with a date. | Medications screen |
| Profile | Care team | As Priya, I can add care team members with role, name, and phone. All optional. | Care team screen |
| Profile | Emergency contacts | As Priya, I can add emergency contacts with name, relationship, and preferred contact channel. Optional during onboarding; prompted on dashboard. | Emergency contacts screen |
| Profile | Edit & version history | As Priya, I can edit any field after setup. All changes are timestamped. Previous values are retained and viewable. | Profile edit + history view |
| Vitals | Manual entry | As Priya, I can log blood pressure, blood sugar (fasting or post-meal), heart rate, and weight from the dashboard at any time. Each entry is timestamped. | Vitals entry screen |
| Vitals | Trend view | As Priya, I can see a 30-day chart for BP, blood sugar, and weight. Out-of-range readings are highlighted. | Vitals history screen |

---

## 📐 Model Requirements

No AI model is required for the Foundation Profile in v1. All data is user-entered and structured manually. The profile outputs a JSON object consumed by Task 1 and Task 2.

| SPECIFICATION | REQUIREMENT | RATIONALE |
|---|---|---|
| AI model | None in v1 | Profile is pure structured data entry; no inference needed |
| Autocomplete | Drug name lookup via static list or RxNorm API | Reduces typos in medication names; critical for downstream drug interaction detection |
| Future: OCR pre-fill | Vision LLM (Task 1 dependency) | In v2, prescription photo auto-fills medication fields; not in v1 scope |

---

## 🧮 Data Requirements

- **Schema:** Structured JSON patient profile (see field list in Functional Requirements). All fields typed and validated. PHI fields encrypted at rest.
- **Storage:** AWS ca-central-1 (Canadian data residency). No PHI stored outside Canada.
- **Retention:** Profile data retained for the lifetime of the account. Deleted profiles purged within 30 days of account closure.
- **Version history:** Every field edit stored with timestamp and prior value. Minimum 12-month history retained.
- **Drug name reference list:** Pre-load a curated list of the 200 most common medications prescribed to elderly Canadians (including brand and generic names) to power autocomplete. Source: Canadian drug databases (Health Canada drug product database is publicly available).
- **Condition suggestion list:** Pre-load the 30 most common chronic conditions in the elderly Canadian population (diabetes, hypertension, COPD, heart disease, kidney disease, etc.).
- **No training data collected** from user profiles without explicit opt-in consent. Beta profiles are not used to train models.

---

## 💬 Prompt Requirements

No LLM prompts required for v1 Foundation Profile. Prompt requirements begin at Task 1 (document ingestion).

For the autocomplete drug name lookup:
- Match on both brand name and generic name
- Surface top 5 matches ranked by prevalence in elderly Canadian population
- Never suggest a drug name the user has not partially typed

---

## 🧪 Testing & Measurement

**Onboarding funnel tracking**
- Track conversion: app open → sign-up complete → first profile created → dashboard reached
- Target: 80%+ of users who open the app complete all 3 steps in one session
- Track time-to-dashboard (target: under 2 minutes for 50%+ of users)
- Alert if drop-off between sign-up and "Add person" screen exceeds 20%

**Progressive completion tracking**
- Track which sections users fill first after onboarding (reveals what they value most)
- Track 7-day return rate for users who skipped all health details at onboarding
- Alert if 7-day return rate falls below 40% (suggests dashboard prompts need to be stronger)

**Multi-person tracking**
- Track % of accounts that create a second profile within 30 days
- Track whether second-profile creation correlates with higher overall engagement

**Data quality checks**
- Flag profiles where medication name does not match any known drug (possible typo)
- Flag profiles with no sections completed after 14 days (may need a re-engagement nudge)

**Vitals engagement**
- Track vitals entries per patient per week from day 7 onward
- Track "any vitals in first 7 days" as leading indicator of habit formation
- Alert if a patient with diabetes or hypertension in their conditions has no vitals in 7 days

**Beta feedback**
- In-app thumbs up/down after first dashboard load
- Single-question NPS survey at day 7
- Qualitative interview with 5 beta users at end of week 4 — focus on onboarding speed and progressive completion experience

---

## ⚠️ Risks & Mitigations

| RISK | MITIGATION |
|---|---|
| Users don't have all medication info on hand during setup | Make all fields except name skippable; show "Finish your profile" prompt at next login |
| Medication name typos corrupt downstream drug interaction checks | Drug name autocomplete + validation against known drug list; flag unrecognised entries for review |
| User enters wrong dosage unit (mg vs mcg) | Show unit selector dropdown alongside dosage field; never free-text units |
| Profile data lost if user switches phones | Cloud sync on every save; no local-only storage |
| PHI data breach | Encryption at rest and in transit; ca-central-1 only; access logging; no PHI in logs |
| User enters a deceased person's profile and abandons | No data risk; monitor for profiles with zero activity after 14 days and send a single re-engagement nudge |

---

## 💰 Costs

**Development (one-time)**
- Mobile app build (iOS-first): onboarding flow, profile CRUD, vitals entry + trend chart, sharing — estimated 4–6 week solo dev sprint with React Native or Swift
- Backend: AWS ca-central-1 setup, encrypted storage, API layer — estimated 1–2 weeks
- Drug name reference data: Canadian drug database (Health Canada) is free; integration effort only

**Operational (ongoing)**
- AWS ca-central-1 hosting: minimal at beta scale (<$50/month for first 100 profiles)
- No LLM inference costs for Foundation Profile v1
- Drug autocomplete: static list in v1 (no API cost); RxNorm API is free for non-commercial use

---

## 🔗 Assumptions & Dependencies

- **[Assumption]** Name + relationship is sufficient to create a profile. DOB is optional at creation. No other fields required at onboarding. If data shows users are confused by a completely empty profile, add one optional "quick details" prompt after profile creation.
- **[UPDATED]** ~~7-step onboarding~~ → 2-step onboarding (sign-up + add first person). All health details are progressive from dashboard.
- **[UPDATED]** ~~Google sign-in only~~ → Apple sign-in (primary) + Google sign-in + email. Apple required for iOS App Store guidelines.
- **[UPDATED]** ~~PSW / caregiver sharing~~ → deferred to future caregiver-side portal. Not in v1 scope.
- **[Assumption]** iOS-first. Android version follows in a subsequent sprint.
- **[Assumption]** No wearable device sync in v1. Vitals are entered manually only.
- **[Assumption]** No Apple Health / Google Fit integration in v1.
- **[Assumption]** No limit on the number of profiles per account in v1.
- **[Dependency]** AWS ca-central-1 account and PHIPA-compliant configuration must be in place before beta data collection begins.
- **[Dependency]** Health Canada drug product database (or equivalent) required for medication autocomplete before launch.
- **[Dependency]** Task 1 (document ingestion) must consume the profile JSON output — integration contract to be defined before Task 1 sprint begins.
- **[Dependency]** Apple Developer account required to implement Sign in with Apple.

---

## 🔒 Compliance / Privacy / Legal

- **Data residency:** All PHI stored exclusively on AWS ca-central-1. No cross-border data transfer.
- **Applicable regulations:** PHIPA (Ontario), PIPA (BC), PIPEDA (all provinces). Beta users must be informed which province's law applies to their data.
- **Consent:** Explicit informed consent collected at account creation. Users consent to: storing their family member's health information and receiving app notifications.
- **Encryption:** All PHI fields encrypted at rest (AES-256). All data in transit encrypted via TLS 1.2+.
- **Access logging:** All access to patient profiles logged with timestamp and user ID. Logs retained for 12 months.
- **Right to deletion:** Users can delete their account and all associated data. Deletion is permanent and confirmed within 30 days.
- **No advertising:** No PHI or behavioural data shared with advertisers or third parties. No ad network SDKs in the app.
- **SaMD classification:** Foundation Profile is a data storage and organization tool. It does not make clinical recommendations. No Health Canada SaMD registration required for this component.
- **Legal review:** Privacy policy and terms of service to be reviewed by a Canadian health privacy lawyer before beta launch.

---

## 📣 Build & Submission Plan

**Deadline:** May 14, 2026 — 100xEngineers Applied AI Capstone submission
**Testing:** Solo founder self-testing throughout. External beta testing deferred to post-submission.

| PHASE | MILESTONE | TARGET DATE | STATUS |
|---|---|---|---|
| Phase 0 | AWS ca-central-1 infrastructure + encrypted storage live | Done | ✅ Complete |
| Phase 1 | Onboarding flow + profile CRUD + vitals entry (iOS TestFlight) | Done | ✅ Complete |
| **Phase 2** | **Self-test all core flows end-to-end. Fix blocker bugs.** | **May 9** | 🔄 **In Progress** |
| **Phase 3** | **Task 1 — Document ingestion: prescription photo + lab PDF extraction** | **May 12** | 🔜 **Up Next** |
| Phase 4 | Polish + demo prep — working demo of Foundation + Task 1 for submission | May 13 | — |
| Phase 5 | Capstone submission | May 14 | — |

---

### 🔄 Phase 2 — Self-Testing Core Flows (Active, due May 9)

**Objective:** Confirm every Foundation feature works end-to-end before moving to Task 1 build. Solo founder testing only — no external users yet.

**Checklist**

| Flow | Test | Pass criteria |
|---|---|---|
| Auth | Sign up with Apple, Google, and email | All 3 create an account and land on dashboard |
| Onboarding | Create a profile (name + relationship only) | Dashboard reached in under 90 seconds |
| Progressive profile | Fill medications, conditions, allergies, care team from dashboard | Each section saves independently, completion % updates |
| Multi-person | Add a second profile from dashboard | Both profiles appear as separate cards, no data bleed between them |
| Edit + history | Change a medication dosage, verify old value is retained | Timestamp logged, prior value visible in history |
| Vitals | Log BP + blood sugar for 3 consecutive days | Entries appear in trend chart, out-of-range values highlighted |
| Data safety | Check error logs and analytics for any PHI fields | Zero PHI in logs |

**Exit criteria → move to Phase 3**
- All checklist items pass
- No crash on any core flow
- Profile JSON output confirmed readable (manual check — needed before Task 1 connects to it)

---

### 🔜 Phase 3 — Task 1: Document Ingestion (Up Next, May 10–12)

**Objective:** Build and self-test the first AI-powered feature: extracting structured data from a prescription photo and a lab PDF. This is the demo-able moment — a raw photo in, clean structured record out. This is what makes the Foundation Profile feel alive rather than just a data entry form.

**Scope for submission (happy path only)**

| Input | Output |
|---|---|
| Prescription photo (JPG/PNG) | Medication name, dosage, frequency, prescribing doctor, date — auto-populated into profile |
| Lab PDF | Test names, values, reference ranges, out-of-range flags, collection date — added as a structured record |

**Out of scope before May 14**
- Voice note transcription (Whisper pipeline) — deferred post-submission
- Hospital discharge summary parsing — deferred post-submission
- Human review queue UI for low-confidence extractions — deferred post-submission
- Confidence scoring — deferred post-submission

**Build steps (May 10–12)**

1. File upload UI — accept JPG, PNG, PDF from dashboard
2. Document type classifier prompt — prescription vs lab report
3. Prescription extraction prompt → structured JSON output (medication name, dosage, frequency, doctor, date)
4. Lab report extraction prompt → structured JSON output (test name, value, reference range, flag)
5. Auto-populate extracted fields into patient profile
6. Show "Review before saving" confirmation screen — user confirms or corrects before data writes

**Self-test checklist for Phase 3**

| Test | Pass criteria |
|---|---|
| Upload a real prescription photo | All key fields extracted correctly (name, dosage, frequency, doctor) |
| Upload a real lab PDF | At least 3 test values extracted with reference ranges |
| Blurry or low-quality photo | System surfaces an error prompt, does not silently fail |
| Wrong document type uploaded | Classifier rejects gracefully, prompts user to try again |
| Extracted data written to profile | Profile medications list updates, change is timestamped |

**Exit criteria → Phase 4 (demo prep)**
- Prescription extraction works on at least 2 real Canadian prescription formats
- Lab PDF extraction works on at least 1 real MyChart or hospital PDF export
- No silent failures — every bad input surfaces a user-facing message
- End-to-end demo scriptable: photo upload → extraction → profile update in under 60 seconds

---

### Phase 4 — Demo Prep (May 13)

**Objective:** 30-minute focused session to make the submission demo clean and repeatable.

- Prepare one demo script: onboarding (90 seconds) → upload prescription photo → extracted data populates profile → vitals logged → dashboard summary view
- Use a real (anonymized) prescription and lab PDF as demo assets
- Record a short screen recording as backup in case of live demo issues
- Confirm TestFlight build is stable and shareable

---

### Post-Submission Roadmap (after May 14)

Deferred until after capstone — not blocking submission:

**Product**
- Task 1 full pipeline: voice notes, discharge summaries, confidence scoring, human review queue
- Task 2: Care intelligence — drug interaction detection, care gap monitoring, vital trend alerts
- Task 3: Alert and briefing generation — daily briefing, proactive alerts, crisis card
- Android version

**Future: Caregiver-Side Portal (separate workstream)**
- PSW / home care worker access — read-only shift view of medications and allergies
- Care agency coordinator dashboard — multi-patient aggregate view
- B2B agency onboarding flow
- Shared notes between family and PSW

**Go-to-market**
- External beta testing: 10–15 family members in Ontario and BC
- Public App Store listing post-beta

---

*PRD generated from CareCircle Canada OPT Masterplan — May 2026*
*Anything marked [Assumption] can be revised. Track changes in the Assumptions list above.*
