# Server-Sent Events (SSE) Implementation Guide

## What is Server-Sent Events?

**Server-Sent Events (SSE)** is a web standard that enables servers to push real-time updates to web clients over a single HTTP connection. Unlike WebSockets, SSE is:

- **Unidirectional**: Server → Client only
- **HTTP-based**: Works through proxies and firewalls
- **Automatic reconnection**: Built-in retry mechanism
- **Simple text format**: Easy to implement and debug

## When to Use SSE

**Use SSE for:**

- Real-time dashboards
- Live notifications
- Live feeds and updates
- Progress indicators
- Any server → client updates

**Use WebSockets for:**

- Bidirectional communication
- Low-latency gaming
- Complex real-time interactions

## SSE Implementation in Our Investment Game

### 1. Server-Side Implementation

#### SSE Endpoint (`/api/teams/events`)

```typescript
// app/api/teams/events/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team") || "admin";
  const round = searchParams.get("round") || "r1";

  const stream = new ReadableStream({
    start(controller) {
      // Add client to connected clients set
      const client = {
        id: clientId,
        controller,
        team,
        round,
        ip,
        userAgent,
        connectedAt: new Date(),
      };

      sseClients.add(client);

      // Send initial connection message
      const initialMessage = {
        type: "connected",
        clientId,
        team,
        round,
        timestamp: new Date().toISOString(),
      };

      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(initialMessage)}\n\n`)
      );

      // Handle disconnect
      request.signal.addEventListener("abort", () => {
        sseClients.delete(client);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

#### Broadcasting Messages

```typescript
// lib/sse.ts
export function sendTeamUpdate(team: string, round: string, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  sseClients.forEach((client) => {
    try {
      // Send to specific team and admin clients
      if (
        (client.team === team || client.team === "admin") &&
        client.round === round
      ) {
        client.controller.enqueue(new TextEncoder().encode(message));
      }
    } catch (error) {
      // Handle broken connections
      sseClients.delete(client);
    }
  });
}
```

### 2. Client-Side Implementation

#### React Hook (`useSSE`)

```typescript
// hooks/useSSE.ts
export function useSSE(options: SSEOptions = {}) {
  const { team, round, onMessage, onError, onOpen } = options;

  const connect = useCallback(() => {
    const url = `/api/teams/events?team=${team}&round=${round}`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      onOpen?.();
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    };

    eventSource.onerror = (error) => {
      onError?.(error);
    };
  }, [team, round, onMessage, onError, onOpen]);

  // Auto-reconnect logic
  // Connection management
  // Cleanup on unmount
}
```

#### Using the Hook

```typescript
// In your component
const { isConnected, error } = useSSE({
  team: "admin",
  round: "r1",
  onMessage: (data) => {
    if (data.type === "team_updated") {
      // Refresh team data
      fetchTeamData();
    } else if (data.type === "round_status_updated") {
      // Update round status
      setRoundStatus((prev) => ({
        ...prev,
        [data.round]: { status: data.status },
      }));
    }
  },
  onError: (error) => {
    console.error("SSE error:", error);
  },
});
```

## Step-by-Step Implementation Guide

### Step 1: Create the SSE Endpoint

1. **Create the API route** (`app/api/teams/events/route.ts`)
2. **Set up client tracking** (store connected clients)
3. **Handle connection lifecycle** (connect, disconnect, cleanup)

### Step 2: Create the SSE Library

1. **Client management** (`lib/sse.ts`)
2. **Message broadcasting functions**
3. **Connection cleanup utilities**

### Step 3: Create the React Hook

1. **EventSource setup** (`hooks/useSSE.ts`)
2. **Auto-reconnection logic**
3. **Error handling**
4. **Cleanup on unmount**

### Step 4: Use in Components

1. **Import the hook**
2. **Configure message handlers**
3. **Display connection status**
4. **Handle errors gracefully**

## Message Format

SSE messages follow this format:

```
data: {"type": "team_updated", "team": "team1", "round": "r1", "timestamp": "2024-01-01T00:00:00.000Z"}

data: {"type": "round_status_updated", "round": "r1", "status": "open", "timestamp": "2024-01-01T00:00:00.000Z"}

data: {"type": "ping", "timestamp": "2024-01-01T00:00:00.000Z"}
```

## Best Practices

### 1. Connection Management

- **Track all connected clients**
- **Clean up dead connections**
- **Handle reconnection automatically**

### 2. Error Handling

- **Graceful degradation**
- **User-friendly error messages**
- **Automatic retry with backoff**

### 3. Performance

- **Limit message size**
- **Use efficient data formats**
- **Implement message filtering**

### 4. Security

- **Validate client parameters**
- **Rate limiting**
- **Authentication checks**

## Testing SSE

### 1. Manual Testing

```bash
# Test SSE endpoint directly
curl -N "http://localhost:3000/api/teams/events?team=admin&round=r1"
```

### 2. Browser Testing

```javascript
// In browser console
const eventSource = new EventSource("/api/teams/events?team=admin&round=r1");
eventSource.onmessage = (event) => console.log(JSON.parse(event.data));
```

### 3. Component Testing

- Use the `SSEExample` component
- Open admin dashboard in another tab
- Trigger events and watch for updates

## Common Issues and Solutions

### 1. Connection Drops

**Problem**: SSE connections sometimes drop
**Solution**: Implement auto-reconnection with exponential backoff

### 2. Memory Leaks

**Problem**: Clients not properly cleaned up
**Solution**: Always remove clients from tracking on disconnect

### 3. Message Ordering

**Problem**: Messages arrive out of order
**Solution**: Include timestamps and sequence numbers

### 4. Browser Limits

**Problem**: Too many concurrent connections
**Solution**: Limit connections per user and implement connection pooling

## Advanced Features

### 1. Message Filtering

```typescript
// Only send relevant messages to clients
if (client.team === team || client.team === "admin") {
  client.controller.enqueue(message);
}
```

### 2. Connection Statistics

```typescript
export function getConnectionStats() {
  return {
    totalConnections: sseClients.size,
    connectionsByTeam: /* grouped by team */,
    connectionsByRound: /* grouped by round */
  };
}
```

### 3. Heartbeat/Ping

```typescript
// Keep connections alive
setInterval(() => {
  sendPingToAll();
}, 30000); // Every 30 seconds
```

## Integration with Investment Game

In our investment game, SSE is used for:

1. **Real-time team updates**: When teams submit portfolios
2. **Round status changes**: When admin opens/closes rounds
3. **Live dashboard updates**: Admin sees team progress instantly
4. **Team notifications**: Teams see round status changes immediately

This creates a responsive, real-time experience where all participants see updates instantly without refreshing the page.

## Conclusion

SSE provides a simple, reliable way to implement real-time updates in web applications. It's perfect for scenarios where you need server-to-client communication without the complexity of WebSockets. The implementation in our investment game demonstrates how SSE can create engaging, real-time user experiences.
