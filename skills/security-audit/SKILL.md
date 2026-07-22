---
name: security-audit
description: Pre-release security checklist for Contact Keep. Run before deployment or after auth, config, dependency, workflow, or API changes.
disable-model-invocation: true
argument-hint: "[focus-area]"
---

# Security Audit

$ARGUMENTS

## Checklist

### 1. Secrets And Config
- [ ] No real secrets are committed.
- [ ] `.env.example` documents variable names only.
- [ ] `JWT_SECRET` and `MONGO_URI` are server-only.
- [ ] Test config uses disposable local values.

### 2. Auth
- [ ] Auth middleware rejects missing and invalid tokens.
- [ ] Login and registration are rate-limited.
- [ ] Password hashes are never returned.
- [ ] Token expiry is documented and tested.

### 3. Contact Ownership
- [ ] Contact reads are scoped to `req.user.id`.
- [ ] Update/delete reject contacts owned by another user.
- [ ] ObjectId errors produce safe client responses.

### 4. Input Validation
- [ ] User registration validates name, email, and password length.
- [ ] Login validates email and password presence.
- [ ] Contact creation validates required fields and allowed `type` values.
- [ ] Malformed payloads return 400 with useful messages.

### 5. HTTP Hardening
- [ ] Security headers are enabled.
- [ ] JSON body size is limited.
- [ ] CORS is not opened with wildcard credentials.
- [ ] Production errors do not expose stack traces.

### 6. Dependency Audit
- [ ] `npm audit` reviewed for high/critical findings.
- [ ] Dependency upgrades are covered by tests.

### 7. CI Gate
- [ ] API tests pass.
- [ ] E2E tests pass or have a documented environment blocker.
- [ ] Client build passes.
