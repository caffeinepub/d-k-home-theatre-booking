# Specification

## Summary
**Goal:** Grant the admin role to the current deployer/user so they can access the AdminPanel in the D.K Home Theatre app.

**Planned changes:**
- Add a backend function (`setAdmin` or equivalent) to assign the admin role to a given principal.
- On canister initialization, automatically assign the admin role to the deployer's principal.
- Add a "Claim Admin Access" button on the Admin page for authenticated users who are not yet admins, which calls the backend grant-admin function.
- On a successful claim, refresh admin status and grant immediate access to the AdminPanel without a page reload.
- Show an error toast if the claim fails (e.g., admin slot already taken).

**User-visible outcome:** A logged-in user can visit the Admin page and claim admin access if no admin exists yet, gaining immediate access to the AdminPanel.
