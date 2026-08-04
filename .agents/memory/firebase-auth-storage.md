---
name: Firebase auth and public study files
description: Firebase Google sign-in and public PDF storage depend on console configuration as well as application code.
---

Google sign-in is not enabled by client code alone: the Firebase project must enable Google as a provider and authorize the published domain. Public study files should use object storage serving paths, while admin writes must validate Firebase ID-token signatures server-side and restrict the email claim.

**Why:** Firebase console settings and deployment domains are external to the repository, so an otherwise complete implementation can still appear broken at sign-in or after publishing.

**How to apply:** When changing auth or file visibility, verify provider status, authorized domains, and server-side token validation together; never trust an email-only request header for admin operations.