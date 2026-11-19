# 30-Day GitHub Daily Green Streak Guardian

## Context & Goal
The user is maintaining an active 30-day daily contribution streak on GitHub for this project (https://github.com/vaidiksingh54-web/all-in-one-calculator).

## Invariants & Behaviors
1. **Daily Check & Proactive Reminder**:
   - At the beginning of every session or when greeted, check the date of the last commit (`git log -1 --format="%cd"`).
   - If no genuine commit has been pushed today, recognize the user's daily streak goal and immediately offer/propose 1-2 small, useful, high-impact improvements (e.g. keyboard shortcuts tooltip, calculation history drawer, new converter unit, haptic/sound toggle, mobile touch optimization, or documentation enhancements).
2. **Execution Standard**:
   - Every daily change must be genuine, tested, and useful.
   - Never backdate commits. Keep timestamps real and authentic.
   - After user confirmation or request, implement the change, test in browser, commit with a clear descriptive message, and push directly to `origin/main`.
3. **Daily Accountability**:
   - Report the updated streak status with the latest commit link on GitHub.
