const EventSource = require('eventsource');

console.log('🔗 Testing SSE Connection Tracking...');

// Create multiple SSE connections to test
const connections = [];

// Test 1: Admin connection
const adminSSE = new EventSource(
  'http://localhost:3000/api/teams/events?team=admin&round=all',
);
connections.push(adminSSE);

adminSSE.onopen = () => {
  console.log('✅ Admin SSE connected');
};

adminSSE.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Admin received:', data.type);
};

// Test 2: Team connection
const teamSSE = new EventSource(
  'http://localhost:3000/api/teams/events?team=team1&round=r1',
);
connections.push(teamSSE);

teamSSE.onopen = () => {
  console.log('✅ Team1 SSE connected');
};

teamSSE.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Team1 received:', data.type);
};

// Test 3: Another team connection
const team2SSE = new EventSource(
  'http://localhost:3000/api/teams/events?team=team2&round=r2',
);
connections.push(team2SSE);

team2SSE.onopen = () => {
  console.log('✅ Team2 SSE connected');
};

team2SSE.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Team2 received:', data.type);
};

// Check metrics after 5 seconds
setTimeout(async () => {
  console.log('\n📊 Checking SSE Metrics...');

  try {
    const response = await fetch('http://localhost:3000/api/admin/sse-metrics');
    const data = await response.json();
    console.log('SSE Metrics:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
  }

  // Check logs
  console.log('\n📋 Checking SSE Logs...');
  try {
    const response = await fetch('http://localhost:3000/api/admin/sse-logs');
    const data = await response.json();
    console.log('SSE Logs:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to fetch logs:', error);
  }

  // Close connections
  console.log('\n🔌 Closing connections...');
  connections.forEach((conn) => conn.close());

  console.log('✅ Test completed');
  process.exit(0);
}, 5000);

// Handle errors
connections.forEach((conn) => {
  conn.onerror = (error) => {
    console.error('❌ SSE Error:', error);
  };
});
