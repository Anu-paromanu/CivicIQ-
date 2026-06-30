# Security Specification: CivicIQ Firestore Rules

## 1. Data Invariants
- **A report is valid** if it contains non-empty fields like title, description, category, latitude, longitude, status, and reporterName.
- **State Integrity**: An issue's status can only transition through recognized statuses (`Reported`, `Verified`, `Assigned`, `Accepted`, `In Progress`, `Completed`, `Citizen Confirmed`, `Archived`).
- **Identity Integrity**: Citizens cannot modify admin-only metadata such as `isVerified`, `fraudDetected`, or `severity` directly unless validated.
- **Budget Integrity**: The estimated cost and assigned contractors are restricted to verified or official agency transitions.

## 2. The "Dirty Dozen" Payloads
1. **Malicious ID injection**: Attempting to create a report with document ID `../../../illegal_override` to overwrite other database parts.
2. **Anonymous Admin Spoof**: Modifying a report status to "Archived" with no authenticated user credentials.
3. **Privilege Escalation**: Attempting to set `isVerified: true` as a generic citizen.
4. **Fraud Flag Resetting**: Resetting `fraudDetected` to `false` for a reported issue flagged by AI.
5. **Contractor Self-Assignment**: Setting a high-value contract allocation to an unauthorized developer account.
6. **Negative Budget Injection**: Attempting to set `estimatedCost` to `-99999` to compromise accounting.
7. **Severity Poisoning**: Submitting a severity score of `1000` (max limit is 100).
8. **Null Timestamp Spoof**: Overriding `reportedAt` with a future date like `2035-12-31`.
9. **Sentiment Manipulation**: Modifying safety assessment flags to cover up hazardous conditions.
10. **Orphaned Workflow History**: Adding history tracking steps with blank descriptions or future timestamps.
11. **Malicious GPS Manipulation**: Injecting latitude coordinates like `999.999` (outside range [-90, 90]).
12. **Mass Citizen Upvote Poisoning**: Upvoting an issue by `+10000` in a single un-audited request.

## 3. Recommended Security Test Definitions (firestore.rules.test.ts)
A test suite should mock public writes and verified workflows to ensure that standard role limits are strictly enforced and all malicious states are blocked by the firewall.
