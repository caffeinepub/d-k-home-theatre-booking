# Specification

## Summary
**Goal:** Fix three reservation/booking bugs in the D.K Home Theatre Booking admin panel: blocked users retaining active bookings, stale UI after ticket accept/deny actions, and slow ticket acceptance flow.

**Planned changes:**
- When an admin blocks a user, automatically cancel and remove all their existing reservations and bookings in the backend, freeing up their seats
- Reject any new reservation attempts from blocked users on the backend
- After accepting or denying a reservation in ReservationManager, immediately invalidate and refetch reservation list and seat plan React Query caches so the UI updates without a page reload
- Apply optimistic UI updates on ticket accept/deny so the status changes instantly on click, with rollback and error toast on failure
- Show a loading/spinner state on action buttons during mutation and disable them to prevent duplicate submissions
- After an admin blocks a user, invalidate the frontend React Query cache for reservations and seat plans so blocked users' bookings disappear from the UI immediately

**User-visible outcome:** Admins will see reservation lists and seat maps update instantly after accepting, denying, or blocking users, with no stale data or manual reloads required, and blocked users' bookings are automatically removed.
