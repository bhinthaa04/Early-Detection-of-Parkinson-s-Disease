# Parkinson Monitoring System Updates - Implementation TODO

## Status: STARTED (0/8 Complete)

### ✅ 1. Doctors Map Page (find-specialist.tsx)
- [x] Remove "Back to Home" button
- [x] Add phone & address to doctor list cards
- [x] Add "View on Map" button to list cards
- [x] Change layout: Full width map → Doctors list below (remove grid layout whitespace)
- [x] Implement "View on Map" functionality (highlight marker, center map)

### 2. Navigation Menu Update (NavigationSidebar.tsx)
- [ ] Add "Patient History" item under Dashboard section
- [ ] Path: `/patient-history`

### 3. Add Route (App.tsx)
- [x] Import Dashboard if needed
- [x] Add `<Route path="/patient-history" component={Dashboard} />`

### 4. Patient History UI (dashboard.tsx)
- [x] Add "Recent Patients (last 10)" section at top
  - Table: Patient Name/ID, Test Date, Confidence, Risk, Result, Stage
- [x] Ensure "All Patient Records" full table below
- [x] Update page title/header for "Patient History" context
- [x] Test limit=10 for recent

### 5. Test Data Storage
- [x] Already implemented ✅ (prediction.tsx calls createPatientTest)

### 6. Dashboard Auto Update
- [x] Already implemented ✅ (listens to event, refetches)

### 7. Database
- [x] Already exists ✅ (patient_tests table + APIs)

### 8. Testing & Verification
- [ ] Run new test → verify saves to DB
- [ ] Check dashboard stats update
- [ ] Test Patient History shows records
- [ ] Test Map "View on Map" button
- [ ] npm run build && npm start

**Next Step**: Edit find-specialist.tsx for layout/back button + list improvements

**Instructions**: Update this TODO.md after each completed step. Use `attempt_completion` when ALL done.

