# Mother App Scope (Phase 1)

This document narrows system requirements to the **mother mobile app only** for the current development phase.

## In Scope Now (Mother-Facing)

- **FREQ-2 User Authentication**  
  Mother can log in securely (current implementation uses credential login; OTP can be added next).

- **FREQ-4 User Profile Management (partial)**  
  Mother profile entry point exists; full edit flow is planned.

- **FREQ-8 Gestational Age Calculation**  
  Pregnancy week/trimester display is supported from stored mother data.

- **FREQ-10 Symptom & Health Logging**  
  Mother health and symptom logging UI is available in `My Health`.

- **FREQ-11 AI-Based Risk Detection (basic app-side support)**  
  Risk level and AI suggestions are shown using current data.

- **FREQ-12 Maternal Health Data Recording (mother view/input)**  
  Mother health metrics interface is available for tracking.

- **FREQ-13 Appointment Scheduling**  
  Mother app supports booking, rescheduling, viewing, and canceling appointments.

- **FREQ-14 Reminder Notifications (app behavior)**  
  Reminder workflow is integrated in appointment interactions.

- **FREQ-21 Pregnancy Guidance**  
  Weekly guidance is shown in mother-facing screens.

- **FREQ-23, FREQ-25 Vaccination Schedule/Reminders (planned module)**  
  Vaccination entry point is visible; full workflow is pending.

- **FREQ-26 Emergency SOS Request**  
  Emergency SOS action is enabled with confirmation flow.

- **FREQ-39 SMS Notification Support (integration-ready messaging behavior)**  
  SMS reminder messaging is represented in current interactions; provider integration to SMS gateway is next.

- **FREQ-40 Emergency Contact Alert (basic app behavior)**  
  SOS flow notifies that family/caregiver alerts are triggered (backend automation pending).

## Out of Scope for This Phase

Provider/admin/woreda features are intentionally deferred:

- FREQ-1, FREQ-3, FREQ-5, FREQ-6, FREQ-7, FREQ-9
- FREQ-15 to FREQ-20
- FREQ-24, FREQ-27 to FREQ-38
- FREQ-41 to FREQ-46

## Development Rule for Current Phase

When implementing features in this phase, prioritize **mother role UX and workflows only**.  
Do not add provider/admin screens until mother phase is stable.
