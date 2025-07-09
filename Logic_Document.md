# 🧠 Logic_Document.md

This document explains the key implementation logic behind two core features of the Smart Task Board project: Smart Assign and Conflict Handling.

---

## 🧠 Smart Assign – Implementation Logic

The **Smart Assign** feature automatically assigns a task to the user with the fewest number of active (non-completed) tasks.

### Here's how it works:

1. When a user clicks **Smart Assign** on a task, the frontend triggers a POST request to the backend endpoint `/tasks/smart-assign/:id`.

2. On the backend, the system performs the following:
   - It queries the database to count how many active tasks each user has (`status !== 'done'`).
   - It identifies the user with the **lowest number of active tasks**.
   - It updates the target task’s `assignedUser` field with this user’s ID.

3. The updated task is saved, and an event is broadcast via Socket.IO to all connected clients, ensuring real-time UI sync.

This logic ensures **balanced workload distribution** across team members.

---

## ⚔️ Conflict Handling – Implementation Logic

Conflict handling prevents **accidental overwriting** of task data when two users attempt to update the same task simultaneously.

### Here's how it works:

1. Every task object has an `updatedAt` timestamp.
2. When a user submits an update to a task (e.g., changing its status or content), the request includes the current `updatedAt` value.
3. The backend compares the request’s timestamp to the latest version in the database.

### Conflict scenario:

- User A opens Task 1 at 2:00 PM.
- User B opens Task 1 at 2:01 PM.
- User A updates Task 1 and submits it at 2:02 PM — the task is saved and updatedAt changes.
- User B now tries to update the **older version** at 2:03 PM.
- The backend detects a mismatch in the `updatedAt` field and returns a `409 Conflict` response.

### Result:

- The frontend alerts User B:  
  _“Conflict detected — someone else updated this task.”_
- User B can now refresh or manually resolve the update conflict.

This logic ensures **data consistency** and avoids overwriting real-time changes.

---

✔️ Both of these systems support multi-user collaboration in a real-time task environment.