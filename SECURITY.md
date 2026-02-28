# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.

# Security Practices for Parking Management System

## 1. OTP (One-Time Password) Usage

- OTP is used for **mobile verification** during signup and login.
- OTP is **6-digit numeric code** generated randomly.
- OTP is **valid for 5 minutes** from the time of generation.
- OTP is **sent only via SMS** to the registered mobile number.
- OTP is stored temporarily in **backend with expiry timestamp** for validation.
- OTP is **never stored in plaintext in frontend or database** permanently.

### Example OTP Flow

1. User enters mobile number in signup form.
2. Backend generates OTP:
    ```text
    Example: 123456
    ```
3. OTP sent via SMS using secure API (Twilio / Fast2SMS / etc.).
4. User enters OTP in form.
5. Backend validates OTP:
    - If OTP matches and is not expired → verification success.
    - Else → verification failed.

---

## 2. Password Security

- Passwords must be **minimum 6 characters**.
- Passwords should be **hashed** using a secure hashing algorithm (bcrypt recommended) before storing in database.

---

## 3. Session & Login Security

- Sessions use **JWT or secure cookies**.
- Admin and User sessions are separated.
- Login attempts are **rate-limited** to prevent brute-force attacks.

---

## 4. General Security Guidelines

- Sensitive operations (OTP generation, login, password reset) should **always happen on backend**.
- Never expose API keys for SMS or email in frontend code.
- Always use HTTPS for communication.
