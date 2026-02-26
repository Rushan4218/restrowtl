# QR-Based Table Ordering System - Architecture & Implementation Guide

## 1. System Architecture Overview

### Frontend Architecture
```
/hooks
  ├── useTableLock.tsx          (Main table locking logic with 5-min countdown)
  ├── useTemporarySession.tsx   (Temporary user session management)
  └── use-table.tsx             (Already exists - enhanced)

/services
  ├── tableService.ts           (Already exists - extended)
  ├── sessionService.ts         (NEW - Session management)
  └── tableLockService.ts       (NEW - Lock coordination)

/contexts
  ├── SessionContext.tsx        (NEW - Global session state)
  └── TableLockContext.tsx      (NEW - Global lock state)

/components
  ├── QRScannerWrapper.tsx      (NEW - QR code scanning UI)
  ├── TableLockAlertDialog.tsx  (NEW - Lock validation feedback)
  └── SessionTimer.tsx          (NEW - Countdown display)
```

---

## 2. Data Structures

### Table Lock Object
```typescript
interface TableLock {
  tableId: string;
  temporaryUserId: string;
  reservationStartTime: string;
  expiresAt: string;           // 5 min from reservation start
  paymentStatus: "pending" | "completed" | "expired";
}
```

### Temporary Session Object
```typescript
interface TemporarySession {
  id: string;
  tableId: string;
  createdAt: string;
  expiresAt: string;           // 5 minutes from creation
  paymentStatus: "pending" | "completed" | "expired";
  userId: string;              // Optional: if customer logs in
  orders: string[];            // Order IDs in this session
}
```

---

## 3. QR Scan Flow (Step-by-Step)

### Step 1: User scans QR code
- QR contains: `table_id` and `table_token`
- URL redirects to: `/menu?table={tableToken}`

### Step 2: Frontend receives token
- `TableProvider` extracts token from URL
- Calls `getTableByToken(token)`
- Validates table exists and is enabled

### Step 3: Check existing lock
- Before creating session:
  - Call `getTableLock(tableId)`
  - If lock exists and NOT expired → Show error "Table reserved"
  - If lock expired → Auto-release and allow new lock

### Step 4: Create temporary session
- Generate `temporaryUserId` (UUID)
- Store in session storage: `{temporaryUserId, tableId, createdAt}`
- Create lock record in localStorage with 5-min expiration
- Start countdown timer

### Step 5: Lock acquired
- Show table info
- Allow ordering
- Start auto-release countdown

### Step 6: Payment or expiration
- **Payment completed:** Destroy session immediately
- **5 min passes:** Auto-release lock, allow new users to reserve

---

## 4. Implementation Details

### 4.1 MockAPI Structure

#### Tables Endpoint (Extended)
```json
{
  "id": "t_001",
  "name": "Table 1",
  "capacity": 4,
  "isEnabled": true,
  "token": "abc123xyz...",
  "currentLockId": null              // NEW
}
```

#### Locks Endpoint (NEW)
```json
{
  "id": "lock_001",
  "tableId": "t_001",
  "temporaryUserId": "user_123",
  "reservationStartTime": "2024-02-18T10:00:00Z",
  "expiresAt": "2024-02-18T10:05:00Z",
  "paymentStatus": "pending"
}
```

#### Temporary Sessions Endpoint (NEW)
```json
{
  "id": "sess_001",
  "tableId": "t_001",
  "temporaryUserId": "user_123",
  "createdAt": "2024-02-18T10:00:00Z",
  "expiresAt": "2024-02-18T10:05:00Z",
  "paymentStatus": "pending",
  "orders": ["order_101", "order_102"]
}
```

---

## 5. Core Hooks Implementation

### useTableLock Hook
- Manages: lock state, countdown timer, auto-release
- Provides: lockTable(), releaseTable(), checkLockStatus()
- Auto-checks lock every 10 seconds
- Triggers auto-release after 5 minutes

### useTemporarySession Hook
- Manages: session creation, persistence, destruction
- Provides: createSession(), destroySession(), getSessionData()
- Handles page refresh: restores session from sessionStorage
- Handles browser close: auto-expires on new tab/device

---

## 6. Race Condition Prevention

### Problem
- Two users scan simultaneously
- Both see table as available
- Both try to lock

### Solution
```
User A                          User B
|                               |
v                               v
Scan QR                     Scan QR
|                               |
v                               v
GET /table-lock?tableId=t1 (returns null)
|                               |
v                               v
                        GET /table-lock?tableId=t1 (returns null)
|                               |
v (Creates lock)                v (Creates lock - RACE!)
POST /lock (User A)             POST /lock (User B)
|                               |
v (Lock acquired)               v (Fails - Already locked)
|                               |
Show "Ordering..."              Show "Table reserved"
```

### Frontend-Safe Mitigation
1. **Re-fetch before creating lock:**
   ```javascript
   const existingLock = await getTableLock(tableId);
   if (existingLock && !isExpired(existingLock)) {
     throw new Error("Table already locked");
   }
   ```

2. **Optimistic locking with timestamp check:**
   ```javascript
   const lock = await createLock({
     tableId,
     expectedCurrentLockId: null,  // Assert no lock exists
   });
   ```

3. **ClientID-based conflict detection:**
   - Each browser tab gets unique clientId
   - If same table locked by different clientId → show error
   - If same clientId → restore session

---

## 7. Countdown Timer Implementation

```typescript
// 5-minute countdown
const [timeRemaining, setTimeRemaining] = useState(300); // 300 seconds

useEffect(() => {
  const interval = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        onTimeExpired(); // Auto-release
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);

// Format: "4:55" (4 min 55 sec)
const formatted = `${Math.floor(timeRemaining / 60)}:${
  (timeRemaining % 60).toString().padStart(2, '0')
}`;
```

---

## 8. Edge Cases & Solutions

### Case 1: Page Refresh
**Problem:** User refreshes page → session lost
**Solution:** 
- Store session in sessionStorage with expiry
- On mount: check sessionStorage for valid session
- If valid: restore session
- If expired: show "Session expired" message

### Case 2: User Closes Tab
**Problem:** Lock remains active, table stays reserved
**Solution:**
- Lock has 5-min TTL (Time To Live)
- Auto-expires on backend
- Next user can lock after 5 min

### Case 3: Network Delay
**Problem:** User clicks "confirm order" but network is slow
**Solution:**
- Show "Confirming..." state
- Disable button during request
- On timeout (>10s): Show error with retry
- Preserve cart on error

### Case 4: Multiple Tabs
**Problem:** User opens same table in 2 tabs
**Solution:**
- Generate unique `tabId` on each tab
- Store in sessionStorage
- If same table + different tabId → show "Already open in another tab"

### Case 5: Countdown Sync After Reload
**Problem:** User reloads → countdown resets from 5 min
**Solution:**
- Store `reservationStartTime` in sessionStorage
- On mount: calculate elapsed time
- Set countdown to: `300 - elapsedSeconds`
- Display accurate remaining time

---

## 9. Payment Completion Flow

### Step 1: Payment Initiated
- User clicks "Proceed to Payment"
- Lock remains active (prevents new users)

### Step 2: Payment Success
- Backend updates Order status to `payment_done`
- Frontend calls `completeLockPayment(tableId)`

### Step 3: Destroy Session
- Remove from sessionStorage
- Call `releaseTableLock(tableId)`
- Show "Thank you, please collect receipt"
- Allow table to be locked by new users

### Step 4: Payment Failed/Cancelled
- Lock countdown continues
- User can retry payment
- If 5 min expires: session auto-destroyed

---

## 10. Validation UI States

### State 1: Scanning QR
```
[Scanning...]
Please scan table QR code
```

### State 2: Lock Acquired
```
✓ Table 3 Reserved
Orders expire in: 4:55
Continue ordering? [Yes] [Cancel]
```

### State 3: Lock Failed (Already Reserved)
```
⚠ Table Already Reserved
This table is already reserved by another user.
Please wait 5 minutes or select another table.
[Try Another Table] [Wait]
```

### State 4: Lock Expired
```
⏱ Your session has expired (5 min timeout)
Your cart has been saved.
[Continue Ordering] [View Cart] [Start Over]
```

---

## 11. Key Implementation Principles

1. **Frontend-First Approach:** All state management on client-side
2. **Optimistic UI:** Show success immediately, revert on error
3. **Graceful Degradation:** Works even with network delays
4. **User Transparency:** Show countdown, status, reasons for errors
5. **Session Persistence:** Survives page refresh, but not browser close
6. **Auto-Cleanup:** 5-min timeout prevents stale locks

---

## 12. Files to Create

```
/hooks
  ├── useTableLock.tsx
  ├── useTemporarySession.tsx
  └── useCountdownTimer.tsx

/services
  ├── tableLockService.ts
  ├── sessionService.ts
  └── concurrencyService.ts

/contexts
  ├── TableLockContext.tsx
  └── SessionContext.tsx

/components
  ├── QRTableValidator.tsx
  ├── TableLockStatus.tsx
  ├── CountdownTimer.tsx
  └── LockAlertDialog.tsx

/types (extend)
  - Add TableLock, TemporarySession interfaces
```

---

## 13. Testing Scenarios

```
1. Single user: Scan → Order → Pay → Release
2. Concurrent users: User A locks, User B gets error
3. Timeout: User A doesn't pay → Lock auto-releases after 5 min
4. Page refresh: User A reloads → Session restored
5. Multiple tabs: Same table in 2 tabs → Tab 2 shows error
6. Payment delay: User A clicks pay (network slow) → Retry works
7. Expired session: 5 min timeout → New user can lock
```

---

## Summary

This architecture provides:
- ✅ Temporary user sessions without backend user accounts
- ✅ 5-minute auto-release mechanism
- ✅ Race condition prevention (frontend-safe)
- ✅ Session persistence across page refresh
- ✅ Auto-cleanup of stale locks
- ✅ Clear user feedback at each step
- ✅ Edge case handling
- ✅ Payment completion logic
- ✅ Production-ready error handling
