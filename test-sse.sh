#!/bin/bash

echo "🔗 Testing SSE Connection Tracking..."

# Start multiple SSE connections in background
echo "📡 Starting SSE connections..."

# Connection 1: Admin
curl -N "http://localhost:3000/api/teams/events?team=admin&round=all" > /dev/null 2>&1 &
ADMIN_PID=$!

# Connection 2: Team1
curl -N "http://localhost:3000/api/teams/events?team=team1&round=r1" > /dev/null 2>&1 &
TEAM1_PID=$!

# Connection 3: Team2
curl -N "http://localhost:3000/api/teams/events?team=team2&round=r2" > /dev/null 2>&1 &
TEAM2_PID=$!

echo "✅ Started 3 SSE connections (PIDs: $ADMIN_PID, $TEAM1_PID, $TEAM2_PID)"

# Wait a bit for connections to establish
sleep 3

echo ""
echo "📊 Checking SSE Metrics..."
curl -s http://localhost:3000/api/admin/sse-metrics | jq .

echo ""
echo "📋 Checking SSE Logs..."
curl -s http://localhost:3000/api/admin/sse-logs | jq .

# Kill the connections
echo ""
echo "🔌 Closing connections..."
kill $ADMIN_PID $TEAM1_PID $TEAM2_PID 2>/dev/null

echo "✅ Test completed" 