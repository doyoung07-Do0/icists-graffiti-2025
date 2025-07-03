'use client';

export default function TestAPIButton() {
  const testAPI = async (endpoint: string, data: any) => {
    try {
      console.log(`Sending test request to ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log(`Response status for ${endpoint}:`, response.status);
      const responseData = await response.json().catch(() => ({}));
      console.log(`Response data from ${endpoint}:`, responseData);
      
      return { success: response.ok, data: responseData };
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
      return { success: false, error };
    }
  };

  const handleTestClick = async () => {
    // Test the basic test endpoint
    await testAPI('/api/admin/test', { test: 'data' });
  };

  const handleTeamsTestClick = async () => {
    // Test the teams-test endpoint with the same data as the actual toggle
    const testData = {
      team: 'team15',
      action: 'toggle-submission',
      data: { currentStatus: false }
    };
    await testAPI('/api/admin/teams-test/r1', testData);
  };

  const handleActualTeamsClick = async () => {
    // Test the actual teams endpoint
    const testData = {
      team: 'team15',
      action: 'toggle-submission',
      data: { currentStatus: false }
    };
    await testAPI('/api/admin/teams/r1', testData);
  };

  const handleSimpleTeamsClick = async () => {
    // Test the simple teams endpoint (no dynamic params)
    const testData = {
      team: 'team15',
      action: 'test',
      data: { test: 'data' }
    };
    await testAPI('/api/admin/teams-simple', testData);
  };

  const handleTeamsV2Click = async () => {
    // Test the new teams-v2 endpoint with dynamic route parameter
    const testData = {
      team: 'team15',
      action: 'toggle-submission',
      data: { currentStatus: false }
    };
    await testAPI('/api/admin/teams-v2/r1', testData);
  };

  return (
    <div className="mt-4 p-4 border rounded space-y-4">
      <h3 className="text-lg font-semibold mb-2">API Test</h3>
      
      <div className="space-y-2">
        <button
          onClick={handleTestClick}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Basic API Endpoint
        </button>
        
        <button
          onClick={handleTeamsTestClick}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Teams-Test Endpoint (Dynamic Route)
        </button>
        
        <button
          onClick={handleActualTeamsClick}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Actual Teams Endpoint (Dynamic Route)
        </button>
        
        <button
          onClick={handleSimpleTeamsClick}
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Test Simple Teams Endpoint (No Dynamic Params)
        </button>
        
        <button
          onClick={handleTeamsV2Click}
          className="w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
        >
          Test Teams V2 Endpoint (New Dynamic Route)
        </button>
      </div>
      
      <p className="text-sm text-gray-400 mt-2">
        Check the browser console for detailed request/response logs
      </p>
    </div>
  );
}
