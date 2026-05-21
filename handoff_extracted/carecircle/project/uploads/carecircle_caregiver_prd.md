# CareCircle Canada — Caregiver Portal
## Product Requirements Document

**Component:** Caregiver Portal — Shared Access & Contribution Layer
**Platform:** Mobile app (iOS-first) — same app as user, role-aware view
**Primary Users:** (1) The user who owns a profile and invites caregivers. (2) The caregiver — a family member, friend, or professional PSW — who receives access.
**Stage:** Pre-build
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

The Caregiver Portal extends CareCircle Canada from a personal health tracker into a coordinated care network. It allows the profile owner (the user) to invite family members, friends, or professional PSWs into a shared view of a loved one's health — with full control over what each person can see and do.

Caregivers use the same CareCircle app. When they log in, the app detects their role and shows a caregiver view instead of the owner view. A caregiver can hold multiple shared profiles (e.g. helping with both a parent and a grandparent) and an owner can have multiple caregivers with different permission sets.

The portal solves the core coordination gap: the user is not always present, but care continues. Notes get logged, vitals get recorded, medications get confirmed — and the user sees everything that happened, timestamped, when they check in.

**What's in scope for v1:**
- Invite flow with role assignment and granular section permissions
- Caregiver dashboard — role-aware view of shared profiles
- Shift/visit notes
- Vitals logging on behalf of the person
- Document upload (feeds Task 1 extraction pipeline)
- Medication confirmation (taken / not taken per medication per day)
- Activity feed for the profile owner
- Caregiver-to-owner visit notes
- Multiple caregivers per profile with different permissions
- Revoke access

**What's deferred:**
- Caregiver-to-caregiver coordination and handoff notes
- Agency/coordinator multi-patient dashboard (B2B)
- In-app messaging between user and caregiver
- Caregiver shift scheduling

---

## 🎯 Business Objectives

- Transform CareCircle from a solo tool into a care network — the stickiest version of the product is one where multiple people depend on it.
- Give the profile owner full transparency and control over who sees what — without making sharing feel risky or complicated.
- Make the caregiver experience genuinely useful, not just a read-only window — caregivers who can contribute (notes, vitals, meds) create the data that makes Task 2 intelligence and Task 3 alerts work.
- Unlock the B2B surface area: professional PSWs who use CareCircle for one client will request it for others.
- Increase daily active usage — caregivers logging vitals or notes daily drive retention on both sides of the relationship.

---

## 📊 KPI

| GOAL | METRIC | QUESTION |
|---|---|---|
| Invite adoption | % of profiles with at least 1 caregiver invited | Do 40%+ of users invite a caregiver within 14 days of setup? |
| Caregiver activation | % of invited caregivers who log in within 48 hours | Are 70%+ of invited caregivers activating their access? |
| Caregiver contribution | Caregiver-logged events per profile per week (notes + vitals + med confirmations) | Are caregivers contributing 3+ events/week after activation? |
| Owner engagement | % of owners who check activity feed within 24 hours of a caregiver action | Are owners staying informed through the feed? |
| Retention impact | D30 retention of profiles with 1+ active caregiver vs. profiles without | Does having an active caregiver increase owner retention? |

---

## 🏆 Success Criteria

- **Invite flow:** 80%+ of users who start an invite complete it in under 3 minutes.
- **Permission control:** Zero caregivers report seeing a section the owner did not intend to share (permission enforcement is airtight).
- **Caregiver activation:** 70%+ of invited caregivers log in and complete their first action within 48 hours of receiving the invite.
- **Contribution rate:** Profiles with an active caregiver have 3+ caregiver-logged events per week (notes, vitals, med confirmations).
- **Owner visibility:** 80%+ of owners open the activity feed within 24 hours of a caregiver logging something.
- **Revoke reliability:** Access revocation takes effect instantly — revoked caregiver cannot load any profile data after removal.

---

## 🚶 User Journeys

**Journey 1 — User invites a family member (sister)**
Priya's sister Maya lives closer to their father and visits three times a week. Priya opens her father's profile, taps "Share & Caregivers", taps "+ Invite caregiver", enters Maya's email, selects "Family / Friend" as the role, and sets permissions: medications ✓, vitals ✓, visit notes ✓, conditions ✓, documents ✓ — all view + contribute. She sends the invite. Maya receives an email, taps the link, downloads CareCircle, creates an account, and lands directly on her caregiver view of their father's profile.

**Journey 2 — User invites a professional PSW**
Their father now has a PSW named James who visits on weekday mornings. Priya invites James by email, selects "Professional PSW" as role, and sets tighter permissions: medications ✓ (view only), allergies ✓ (view only), visit notes ✓ (contribute), vitals ✓ (contribute). Conditions, documents, and care team are left off. James receives the invite, logs in, and sees a focused shift view — today's medications, allergies, and a notes field.

**Journey 3 — Caregiver logs a visit note + vitals**
Maya visits their father on a Tuesday evening. She opens CareCircle, sees her caregiver dashboard showing her father's profile. She taps "Log visit", adds a note: "Dad ate a full dinner. Took all evening medications. Seemed a bit tired but in good spirits." She also logs his blood pressure: 136/84. Both entries save with a timestamp and her name. Priya sees them in her activity feed that evening.

**Journey 4 — Caregiver confirms medications**
James arrives for the morning shift. He opens CareCircle and sees today's medication checklist for their father. He administers Metformin and Amlodipine and taps ✓ on each. The third medication (Rosuvastatin) is evening-only — greyed out. He taps "Done". Priya's dashboard shows "Morning medications confirmed · James · 9:14 AM".

**Journey 5 — Caregiver uploads a prescription**
Their father saw a new specialist who added a medication. Maya photographed the prescription. She opens CareCircle, taps "Upload document" in her caregiver view, selects the photo. Task 1 extracts the medication details. Maya sees a "Review before saving" screen, confirms the extraction looks correct, and submits. Priya receives a notification: "Maya uploaded a new prescription — review the extracted medication."

**Journey 6 — User revokes access**
James's contract ends. Priya opens her father's profile, taps "Share & Caregivers", finds James's entry, taps "Remove access". Confirmation prompt appears. She confirms. James's access is revoked instantly — next time he opens the app, the shared profile is gone.

**Journey 7 — Caregiver manages multiple profiles**
Maya is also helping care for her mother-in-law, who uses CareCircle separately. She has been invited to both profiles. Her caregiver dashboard shows two cards — one for each person. She switches between them with one tap. Each has independent permissions set by each profile owner.

---

## 📖 Scenarios

1. User invites a sibling who lives nearby to contribute vitals and visit notes.
2. User invites a professional PSW with restricted permissions (medications view only, no conditions or documents).
3. Caregiver logs a visit note after an evening visit.
4. Caregiver confirms morning medications as administered.
5. Caregiver logs blood pressure and blood sugar on behalf of the person.
6. Caregiver uploads a prescription photo — Task 1 extracts it — owner reviews and approves.
7. Owner checks activity feed to see everything the caregiver did in the last 24 hours.
8. Owner updates a caregiver's permissions mid-relationship (e.g. adds document upload access).
9. Owner removes a caregiver's access after a PSW's contract ends.
10. Caregiver receives a notification that a new medication has been added to the profile by the owner.

---

## 🕹️ User Flow

### Owner Side — Inviting a Caregiver

1. Owner opens a profile → taps **"Share & Caregivers"**
2. Taps **"+ Invite caregiver"**
3. Enters caregiver's email address
4. Selects **caregiver type:**
   - Family / Friend
   - Professional PSW
5. Sets **section permissions** — toggle each section on/off:
   - Medications | Vitals | Visit notes | Conditions | Allergies | Documents | Care team
6. Sets **access level per section:**
   - View only
   - View + Contribute
7. Taps **"Send invite"** → email sent with deep link
8. Returns to **"Share & Caregivers"** screen showing pending invite

**Manage caregivers screen (owner)**
- Lists all caregivers with role, permission summary, last active date
- Tap any caregiver → edit permissions or revoke access
- Revoke → instant, confirmed by prompt

---

### Caregiver Side — Onboarding

1. Caregiver receives invite email → taps **"Accept invite"**
2. If no account: sign up (Apple / Google / email) — same flow as owner onboarding, 2 steps
3. If existing account: log in → shared profile appears automatically on dashboard
4. App detects caregiver role → loads **caregiver view** (not owner view)

---

### Caregiver Dashboard

- Shows all shared profiles as cards (name, relationship to them, profile owner name)
- Each card shows only permitted sections
- Quick actions visible per card:
  - **Log visit** (if visit notes permitted)
  - **Confirm medications** (if medications permitted + contributor)
  - **Log vitals** (if vitals permitted + contributor)
  - **Upload document** (if documents permitted + contributor)

---

### Caregiver Actions

**Log visit note**
- Free text field (500 char max)
- Optional: attach to a specific date/time (defaults to now)
- Saves with caregiver name + timestamp
- Visible to owner in activity feed immediately

**Confirm medications**
- Shows today's medication list (owner-managed, view only for caregiver)
- Caregiver taps ✓ (given) or ✗ (not given) per medication
- Evening medications greyed out during morning; morning greyed out in evening
- Saves with timestamp and caregiver name

**Log vitals**
- Same vitals entry form as owner (BP, blood sugar, heart rate, weight)
- Entry tagged "logged by [caregiver name]"
- Appears in owner's vitals history and trend chart

**Upload document**
- Same upload UI as owner (JPG, PNG, PDF)
- Feeds Task 1 extraction pipeline
- Caregiver sees "Review before saving" screen
- Owner receives notification and must approve before data writes to profile

---

### Owner Activity Feed

- Chronological list of all caregiver actions on a profile
- Each entry shows: action type, caregiver name, timestamp
- Examples:
  - "Maya logged a visit note · Tue 8:42 PM"
  - "James confirmed morning medications · Wed 9:14 AM"
  - "Maya logged blood pressure: 136/84 · Tue 8:45 PM"
  - "Maya uploaded a prescription — tap to review · Mon 3:21 PM"
- Tapping any entry expands the full detail
- Feed is per-profile, accessible from the profile dashboard

---

## 🧰 Functional Requirements

| SECTION | SUB-SECTION | USER STORY & EXPECTED BEHAVIORS | SCREENS |
|---|---|---|---|
| Invite | Send invite | As Priya, I can invite a caregiver by email. I assign a role (Family/Friend or Professional PSW) and set section permissions and access level before sending. | Invite screen |
| Invite | Email delivery | Caregiver receives a branded email with their name, who invited them, whose profile, and a deep link. Link expires in 7 days if unused. | — |
| Invite | Accept invite | As Maya, I tap the invite link, create or log into my CareCircle account, and land directly on my caregiver dashboard showing the shared profile. | Onboarding / Login |
| Invite | Pending state | As Priya, I can see which invites are pending (sent but not yet accepted) on the "Share & Caregivers" screen. | Manage caregivers screen |
| Permissions | Section toggles | As Priya, I can turn each profile section on or off per caregiver independently. A caregiver with medications off sees no medication data at all. | Permission settings screen |
| Permissions | Access level | As Priya, I can set each permitted section to "view only" or "view + contribute" independently. | Permission settings screen |
| Permissions | Edit mid-relationship | As Priya, I can change a caregiver's permissions at any time. Changes take effect immediately on their next app load. | Manage caregivers screen |
| Permissions | Revoke access | As Priya, I can remove a caregiver's access instantly. Revoked caregiver cannot see the profile on their next app open. | Manage caregivers screen |
| Caregiver dashboard | Role detection | When a user who has been invited as a caregiver logs in, the app shows their caregiver view, not the owner view. If they are both an owner and a caregiver, they see both views with a toggle. | Dashboard |
| Caregiver dashboard | Multiple profiles | As Maya, I can see all profiles shared with me as separate cards on my dashboard. Each card shows only the sections I have permission to see. | Caregiver dashboard |
| Visit notes | Log note | As Maya, I can type a visit note (500 char max) and save it with today's date and time. I can optionally change the date (e.g. logging a note for yesterday). | Visit note screen |
| Visit notes | Owner visibility | As Priya, I can see all visit notes from all caregivers in chronological order on the activity feed and in a dedicated "Notes" tab on the profile. | Activity feed / Notes tab |
| Medication confirmation | Daily checklist | As James, I see today's medication list with a ✓ / ✗ toggle per medication. Medications scheduled for other times of day are greyed out. | Medication confirmation screen |
| Medication confirmation | Missed flag | If a medication is not confirmed by the end of its expected window, it is flagged as "unconfirmed" on the owner's dashboard. | Owner dashboard |
| Vitals | Log on behalf | As Maya, I can log BP, blood sugar, heart rate, or weight for the person. The entry is tagged with my name and a timestamp. | Vitals entry screen |
| Vitals | Attribution | As Priya, I can see in the vitals history which entries were logged by me vs. by a caregiver. | Vitals history screen |
| Document upload | Upload by caregiver | As Maya, I can upload a JPG, PNG, or PDF. It goes through Task 1 extraction. I see a "Review before saving" screen and submit for owner approval. | Upload screen |
| Document upload | Owner approval | As Priya, I receive a notification when a caregiver uploads a document. I review the extracted data and approve or reject before it writes to the profile. | Review screen |
| Activity feed | Feed display | As Priya, I see a chronological activity feed per profile showing all caregiver actions: notes, vitals, med confirmations, uploads — with caregiver name and timestamp. | Activity feed screen |
| Activity feed | Notifications | As Priya, I receive a push notification when a caregiver logs a visit note, confirms medications, logs vitals, or uploads a document. | Push notification |
| Caregiver notification | Profile updates | As Maya, I receive a push notification when the owner adds a new medication, updates a condition, or adds a document to a profile I have access to. | Push notification |
| Multiple caregivers | Per-profile list | As Priya, I can invite more than one caregiver to the same profile, each with different permission sets. | Manage caregivers screen |

---

## 📐 Model Requirements

| SPECIFICATION | REQUIREMENT | RATIONALE |
|---|---|---|
| AI model | Inherited from Task 1 pipeline | Document uploads by caregivers use the same extraction pipeline as owner uploads — no new model needed |
| Permission enforcement | Rule-based, not AI | Section visibility is a hard access control layer — deterministic, auditable, no inference |
| Notification triggers | Rule-based | Event-driven triggers (note logged, vitals saved, doc uploaded) — no AI needed |

---

## 🧮 Data Requirements

- **Permission schema:** Each caregiver-profile relationship stored as a permission object: `{ caregiver_id, profile_id, role, sections: { medications: { visible: true, contribute: true }, vitals: { visible: true, contribute: false }, ... } }`
- **Activity log:** Every caregiver action stored as an immutable event: `{ actor_id, actor_name, action_type, profile_id, timestamp, payload }`. Never deleted — owner always has a full audit trail.
- **Attribution tagging:** All vitals, notes, and med confirmations tagged with `logged_by: { user_id, name, role }` at write time.
- **Invite tokens:** Time-limited (7 days), single-use, tied to the invitee's email. Expired tokens cannot be reused.
- **Revocation:** Revocation writes `access_revoked: true` + timestamp to the relationship record. All subsequent API calls for that caregiver-profile pair return 403 immediately.
- **Storage:** All data on AWS ca-central-1. No PHI accessible cross-border.
- **Isolation:** A caregiver API call can only return data for sections explicitly permitted in their permission object. Server enforces this — client-side filtering alone is not sufficient.

---

## 💬 Prompt Requirements

No new prompts required specifically for the caregiver portal. Document uploads by caregivers use the existing Task 1 extraction prompts unchanged. The only addition is the owner-approval gate before extracted data writes to the profile.

---

## 🧪 Testing & Measurement

**Invite funnel**
- Track: invite initiated → permissions set → invite sent → caregiver accepted
- Alert if drop-off between "send invite" and caregiver acceptance exceeds 40% (suggests email delivery or onboarding friction)

**Permission enforcement testing (critical)**
- Before any beta: run a test matrix — for every section combination, verify that a caregiver with that section off cannot retrieve that data via any API call (not just UI)
- This is a safety and privacy requirement, not just a UX test

**Caregiver contribution tracking**
- Track events per caregiver per week: visit notes, vitals logged, med confirmations, uploads
- Alert if a caregiver has been active 0 times in 7 days after initial activation (may need a nudge)

**Owner feed engagement**
- Track % of owners who open the activity feed within 24 hours of a caregiver action
- Track notification open rate per action type (which actions drive owners back to the app?)

**Medication confirmation coverage**
- Track % of daily medications that get a confirmed/not-confirmed entry
- Flag profiles where medications are never confirmed (caregiver may not know about the feature)

**Beta feedback**
- Separate feedback surveys for owners and caregivers at day 7
- Key question for owners: "Do you feel informed about what's happening with your loved one?"
- Key question for caregivers: "Does the app make your visits easier or harder?"

---

## ⚠️ Risks & Mitigations

| RISK | MITIGATION |
|---|---|
| Caregiver sees a section the owner didn't intend to share | Permission enforcement must be server-side, not client-side only. Audit every API endpoint before launch. |
| Invite link forwarded to an unintended person | Invite tokens are single-use and tied to the invitee's email. Account email must match invite email. |
| Caregiver uploads incorrect document — bad data enters profile | Owner must approve all caregiver-uploaded documents before they write to the profile. Owner can reject and delete. |
| Owner is not notified of caregiver actions in time | Push notifications sent immediately on every caregiver action. Owner can also check activity feed at any time. |
| Revocation not instant — revoked caregiver still sees data briefly | Revocation writes to database immediately. All API calls check revocation status server-side on every request. |
| Caregiver logs wrong vitals (e.g. wrong patient's numbers) | Attribution is clearly displayed on every entry. Owner can delete any caregiver-logged entry from their profile. |
| PSW uses access beyond their permitted scope | Role label (Professional PSW) displayed prominently on caregiver's view. Permissions are strictly enforced per section. |
| Caregiver account is compromised | Caregiver sessions expire after 30 days. Owner can revoke access at any time without needing caregiver's cooperation. |

---

## 💰 Costs

**Development (one-time)**
- Permission schema + invite flow + caregiver dashboard: estimated 2–3 week sprint
- Activity feed + notification layer: estimated 1 week
- Medication confirmation checklist: estimated 3–4 days
- Vitals attribution + caregiver logging: estimated 2–3 days (reuses existing vitals UI)
- Document upload + owner approval gate: estimated 3–4 days (reuses Task 1 pipeline)

**Operational (ongoing)**
- Push notifications: Firebase Cloud Messaging — free at beta scale
- Additional API calls per caregiver action: minimal cost at beta scale (<$10/month for first 100 profiles)
- No additional LLM inference cost — document extraction reuses Task 1 pipeline

---

## 🔗 Assumptions & Dependencies

- **[Assumption]** A caregiver who is also a profile owner (e.g. Priya's sister Maya who also manages her own parent) uses the same account. The app shows both views with a clear toggle: "My profiles" vs. "Profiles shared with me".
- **[Assumption]** Caregiver onboarding is the same 2-step flow as owner onboarding. No separate caregiver signup.
- **[Assumption]** Professional PSW and Family/Friend roles have the same permission options — role label is informational, not a hard capability restriction. Owner decides what each person can do.
- **[Assumption]** There is no limit on the number of caregivers per profile in v1.
- **[Assumption]** Caregiver cannot invite other caregivers. Only the profile owner can invite and manage caregivers.
- **[Assumption]** In-app messaging between owner and caregiver is deferred. Communication outside the app (phone, WhatsApp) is fine for v1.
- **[Dependency]** Task 1 document extraction pipeline must be live before the caregiver document upload feature works end-to-end.
- **[Dependency]** Push notification infrastructure (Firebase or equivalent) must be configured before caregiver activity notifications work.
- **[Dependency]** Foundation Profile JSON schema must include attribution fields (`logged_by`) before caregiver vitals and notes can be stored correctly.

---

## 🔒 Compliance / Privacy / Legal

- **Data residency:** All caregiver-logged data stored on AWS ca-central-1. No cross-border transfer.
- **Consent:** Profile owner provides explicit consent at invite time — they are affirming they have the right to share this person's health information with the named caregiver.
- **Minimum necessary principle:** Caregiver sees only the sections the owner explicitly enabled. No default full-access. Default is zero access until owner grants it.
- **Audit trail:** Every caregiver action is logged immutably with timestamp and actor ID. Owner can view the full history at any time. Logs retained for 12 months.
- **Revocation:** Owner can revoke caregiver access at any time. Revocation is immediate and permanent. Revoked caregiver retains no cached data.
- **PSW professional context:** Professional PSWs accessing health data in Ontario are subject to PHIPA obligations. CareCircle is the tool, not the data controller in that relationship. Legal review required to confirm platform liability boundary before PSW invites are enabled in production.
- **Right to deletion:** If the profile owner deletes their account, all caregiver access to that profile is revoked simultaneously. Caregiver-logged entries are deleted with the profile.
- **No PHI in notifications:** Push notification content must not include medication names, diagnoses, or any PHI. Notifications say "Maya logged a visit note" — not the content of the note.

---

## 📣 GTM / Rollout Plan

| PHASE | MILESTONE | TIMING |
|---|---|---|
| Phase 1 | Invite flow + permission schema + caregiver dashboard (view only) | Week 1–2 post-submission |
| Phase 2 | Visit notes + medication confirmation + vitals logging by caregiver | Week 3 |
| Phase 3 | Activity feed + owner notifications + caregiver notifications | Week 4 |
| Phase 4 | Document upload by caregiver + owner approval gate | Week 5 (requires Task 1 live) |
| Phase 5 | Internal self-test — run all 10 scenarios end-to-end | Week 5 |
| Phase 6 | Closed beta — recruit 5 owner + caregiver pairs (real relationships) | Week 6–7 |
| Phase 7 | Beta feedback synthesis, top fixes shipped | Week 8 |

**Build order rationale:** Invite + view-only first, because a caregiver who can see the profile is immediately useful even before contribution features are live. Contribution features (notes, vitals, meds) layer on top. Activity feed and notifications are the glue that makes the whole system feel alive to the owner.

**Beta recruitment:** Recruit owner + caregiver pairs together — not owners alone. The caregiver portal only proves its value when both sides are active. Target: 5 pairs where one is a family member caregiver and one is a professional PSW relationship.

---

*PRD generated from CareCircle Canada OPT Masterplan — May 2026*
*Anything marked [Assumption] can be revised.*
