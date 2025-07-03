# Admin API Endpoints

This document outlines the API endpoints available for the Admin Dashboard.

## Round Status

### Get Round Status
- **Endpoint**: `GET /api/admin/round-status`
- **Description**: Get the status of all rounds (r1, r2, r3, r4)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      { "round": "r1", "status": "locked" },
      { "round": "r2", "status": "open" },
      { "round": "r3", "status": "locked" },
      { "round": "r4", "status": "locked" }
    ]
  }
  ```

## Teams

### Get Teams for Round
- **Endpoint**: `GET /api/admin/teams/:round`
- **Description**: Get all teams for a specific round
- **Parameters**:
  - `round`: The round identifier (r1, r2, r3, or r4)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
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
    ]
  }
  ```

### Update Team Data
- **Endpoint**: `POST /api/admin/teams/:round`
- **Description**: Update team data or toggle submission status
- **Parameters**:
  - `round`: The round identifier (r1, r2, r3, or r4)
- **Request Body**:
  - For toggling submission status:
    ```json
    {
      "team": "team1",
      "action": "toggle-submission",
      "data": {
        "currentStatus": false
      }
    }
    ```
  - For updating team data:
    ```json
    {
      "team": "team1",
      "action": "update",
      "data": {
        "s1": 100,
        "s2": 200,
        "s3": 300,
        "s4": 400,
        "post_fund": 1500
      }
    }
    ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      // Updated team data
    }
  }
  ```

## Reset Endpoints

### Reset Rounds Status
- **Endpoint**: `POST /api/admin/reset-rounds`
- **Description**: Reset all rounds status to 'locked'
- **Response**:
  ```json
  {
    "success": true,
    "message": "All rounds have been reset to locked status"
  }
  ```

### Reset Team Data
- **Endpoint**: `POST /api/admin/reset-teams`
- **Description**: Reset all team data for all rounds
- **Response**:
  ```json
  {
    "success": true,
    "message": "All team data has been reset"
  }
  ```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

### Common Error Status Codes
- `400 Bad Request`: Invalid input or missing required fields
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error occurred
