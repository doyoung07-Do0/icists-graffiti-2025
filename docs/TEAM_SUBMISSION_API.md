# Team Submission API Endpoints

This document describes the API endpoints for managing team submission status across all rounds.

## Overview

The API provides endpoints to check and toggle the `submitted` field for each team across all rounds (r1, r2, r3, r4). Each team table (`team_r1`, `team_r2`, `team_r3`, `team_r4`) has a `submitted` boolean field that indicates whether a team has submitted their portfolio for that round.

## Endpoints

### 1. Get Team Submission Status

**Endpoint:** `GET /api/admin/teams/[round]/[team]/submission-status`

**Description:** Get the current submission status for a specific team in a specific round.

**Parameters:**

- `round`: The round identifier (r1, r2, r3, or r4)
- `team`: The team identifier (team1-team16)

**Example Request:**

```bash
GET /api/admin/teams/r1/team5/submission-status
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "team": "team5",
    "round": "r1",
    "submitted": false,
    "teamData": {
      "team": "team5",
      "s1": 100,
      "s2": 200,
      "s3": 0,
      "s4": 0,
      "pre_fund": 1000,
      "post_fund": null,
      "submitted": false
    }
  }
}
```

### 2. Toggle Team Submission Status

**Endpoint:** `POST /api/admin/teams/[round]/[team]/toggle-submission`

**Description:** Toggle the submission status for a specific team in a specific round.

**Parameters:**

- `round`: The round identifier (r1, r2, r3, or r4)
- `team`: The team identifier (team1-team16)

**Example Request:**

```bash
POST /api/admin/teams/r1/team5/toggle-submission
```

**Example Response:**

```json
{
  "success": true,
  "message": "Successfully toggled submission status for team5 in r1",
  "data": {
    "team": "team5",
    "round": "r1",
    "previousStatus": false,
    "currentStatus": true,
    "updatedTeamData": {
      "team": "team5",
      "s1": 100,
      "s2": 200,
      "s3": 0,
      "s4": 0,
      "pre_fund": 1000,
      "post_fund": null,
      "submitted": true
    }
  }
}
```

## Error Responses

### Invalid Round Parameter

```json
{
  "success": false,
  "error": "Invalid round parameter. Must be r1, r2, r3, or r4."
}
```

### Invalid Team Parameter

```json
{
  "success": false,
  "error": "Invalid team parameter. Must be team1-team16."
}
```

### Team Not Found

```json
{
  "success": false,
  "error": "Team not found in this round"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Failed to toggle team submission status"
}
```

## Usage Examples

### JavaScript/TypeScript

```javascript
// Get submission status
const getStatus = async (round, team) => {
  const response = await fetch(
    `/api/admin/teams/${round}/${team}/submission-status`
  );
  const result = await response.json();
  return result;
};

// Toggle submission status
const toggleStatus = async (round, team) => {
  const response = await fetch(
    `/api/admin/teams/${round}/${team}/toggle-submission`,
    {
      method: "POST",
    }
  );
  const result = await response.json();
  return result;
};

// Example usage
const status = await getStatus("r1", "team5");
console.log(`Team 5 submission status: ${status.data.submitted}`);

const toggleResult = await toggleStatus("r1", "team5");
console.log(`Previous status: ${toggleResult.data.previousStatus}`);
console.log(`Current status: ${toggleResult.data.currentStatus}`);
```

### cURL

```bash
# Get submission status
curl -X GET "http://localhost:3000/api/admin/teams/r1/team5/submission-status"

# Toggle submission status
curl -X POST "http://localhost:3000/api/admin/teams/r1/team5/toggle-submission"
```

## Database Schema

Each round has its own team table with the following schema:

```sql
CREATE TABLE team_r1 (
  team varchar(10) PRIMARY KEY NOT NULL,  -- team1-team16
  s1 integer DEFAULT 0 NOT NULL,
  s2 integer DEFAULT 0 NOT NULL,
  s3 integer DEFAULT 0 NOT NULL,
  s4 integer DEFAULT 0 NOT NULL,
  pre_fund integer,
  post_fund integer,
  submitted boolean DEFAULT false NOT NULL
);
```

The same schema applies to `team_r2`, `team_r3`, and `team_r4`.

## Notes

- The API validates both round and team parameters before processing
- Team names must follow the pattern `team1` through `team16`
- Round names must be `r1`, `r2`, `r3`, or `r4`
- The toggle operation switches the boolean value (true ↔ false)
- All endpoints return consistent JSON responses with success/error indicators
