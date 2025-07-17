# Testing the Updated "Reset All" Button

## Overview

The "Reset All" button in the Admin Dashboard has been updated to call both the `reset-rounds` and `reset-teams` APIs when clicked. This provides a complete reset of both round statuses and team data.

## What the Button Now Does

When the "Reset All" button is clicked, it performs the following operations in sequence:

1. **Shows confirmation dialog** - "Are you sure you want to reset all rounds? This will reset all team data and round statuses."
2. **Calls `/api/admin/reset-rounds`** - Resets all round statuses to 'locked'
3. **Calls `/api/admin/reset-teams`** - Resets all team data across all rounds
4. **Refreshes the UI** - Updates the dashboard to show the reset state
5. **Shows success message** - "Successfully reset all rounds and team data."

## How to Test

### Method 1: Using the Admin Dashboard UI

1. **Navigate to the Admin Dashboard**

   - Go to `/investment/play` in your browser
   - Make sure you're logged in as an admin

2. **Verify Current State**

   - Check that some teams have data (investments, funds, etc.)
   - Note the current round statuses
   - Take a screenshot for comparison

3. **Click "Reset All"**

   - Look for the red "Reset All" button in the top-right corner
   - Click it and confirm the dialog

4. **Verify the Reset**
   - All rounds should show "locked" status
   - All teams should show:
     - `s1`, `s2`, `s3`, `s4`: 0
     - `pre_fund`: 1000
     - `post_fund`: null
     - `submitted`: false
   - Success message should appear

### Method 2: Using Browser Developer Tools

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Click "Reset All" button**
4. **Verify API calls**:
   - Should see `POST /api/admin/reset-rounds`
   - Should see `POST /api/admin/reset-teams`
   - Both should return `200` status codes

### Method 3: Using cURL

```bash
# Test reset-rounds API
curl -X POST "http://localhost:3000/api/admin/reset-rounds"

# Test reset-teams API
curl -X POST "http://localhost:3000/api/admin/reset-teams"
```

## Expected Results

### Database State After Reset

**Round Status:**

- `r1`: locked
- `r2`: locked
- `r3`: locked
- `r4`: locked

**Team Data (for all rounds):**

```json
{
  "team": "team1",
  "s1": 0,
  "s2": 0,
  "s3": 0,
  "s4": 0,
  "pre_fund": 1000,
  "post_fund": null,
  "submitted": false
}
```

### UI State After Reset

- **Round tabs** should all show "locked" status
- **Team table** should show all teams with reset values
- **Status message** should show "Successfully reset all rounds and team data."
- **"Start Game" button** should be enabled (since r1 is locked)

## Error Handling

If either API call fails:

1. **Error message** will be displayed in the status area
2. **Button** will return to normal state (not disabled)
3. **Console** will show detailed error information

## Troubleshooting

### If Reset Doesn't Work

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API calls
3. **Verify database connection** is working
4. **Check server logs** for backend errors

### If Only Partial Reset

1. **Check if both APIs were called** in network tab
2. **Verify both APIs returned success** responses
3. **Refresh the page** to see if UI updates properly

## Rollback

If you need to restore data after a reset:

1. **Database backup** - Restore from backup if available
2. **Manual re-entry** - Re-enter team data manually
3. **Development data** - Use seed data if in development

## Notes

- **Destructive operation** - This completely wipes all game data
- **No undo** - There's no way to undo the reset
- **Confirmation required** - User must confirm before reset proceeds
- **Transaction safety** - Database operations use transactions for consistency
