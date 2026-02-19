# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in next-url-state, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please send an email to the maintainers via the contact information in the [package.json](package.json) or open a private security advisory on GitHub:

1. Go to the [Security Advisories](https://github.com/DigitecGalaxus/next-url-state/security/advisories) page
2. Click **"New draft security advisory"**
3. Fill in the details of the vulnerability

### What to include

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested fixes (if applicable)

### What to expect

- We will acknowledge receipt within **3 business days**
- We will provide an initial assessment within **10 business days**
- We will work with you to understand and resolve the issue before any public disclosure

## Security Considerations

This library handles URL parameters, which are user-controlled input. While we take care to use safe APIs (e.g. `URLSearchParams` for encoding), consumers should be aware of the following:

- **Always validate and sanitize** parsed URL parameter values before using them in security-sensitive contexts (e.g. database queries, HTML rendering)
- **Custom `parse` functions** provided to hooks are the consumer's responsibility. Ensure they handle malformed or unexpected input gracefully
- **URL parameters are visible** to anyone with access to the URL. Do not store sensitive data (tokens, passwords, PII) in URL state

## Dependencies

This library has zero runtime dependencies beyond its peer dependencies (`react`, `react-dom`, `next`). We regularly review and update development dependencies to address known vulnerabilities.
