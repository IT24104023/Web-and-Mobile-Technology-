import fetch from "node-fetch";

const testEndpoint = async () => {
  try {
    console.log("\n📡 Testing /api/analytics/admin/dashboard endpoint...\n");
    
    // Note: This endpoint might require authentication token
    const response = await fetch("http://localhost:5000/api/analytics/admin/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer dummy-token" // Try with a token
      }
    });

    const data = await response.json();
    
    console.log("Status:", response.status);
    console.log("\nResponse:");
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testEndpoint();
