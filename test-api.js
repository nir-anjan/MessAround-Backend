// Test script for MessAround API
// Run with: node test-api.js

const BASE_URL = "http://localhost:3000";

let messOwnerToken = "";
let userToken = "";
let messId = "";
let planId = "";
let subscriptionId = "";

// Helper function for API calls
async function apiCall(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));

    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { status: 0, data: null };
  }
}

// Test suite
async function runTests() {
  console.log("🧪 Starting MessAround API Tests\n");
  console.log("=".repeat(60));

  try {
    // 1. Health Check
    console.log("\n📍 1. HEALTH CHECK");
    await apiCall("GET", "/health");

    // 2. Register Mess Owner
    console.log("\n📍 2. REGISTER MESS OWNER");
    const ownerRegister = await apiCall("POST", "/api/auth/register", {
      name: "Jane Owner",
      email: `jane${Date.now()}@example.com`,
      password: "password123",
      role: "mess_owner",
      phone: "+1234567890",
    });

    if (ownerRegister.data?.data?.token) {
      messOwnerToken = ownerRegister.data.data.token;
      console.log("✅ Mess owner registered successfully");
    }

    // 3. Register Regular User
    console.log("\n📍 3. REGISTER REGULAR USER");
    const userRegister = await apiCall("POST", "/api/auth/register", {
      name: "John User",
      email: `john${Date.now()}@example.com`,
      password: "password123",
      role: "user",
    });

    if (userRegister.data?.data?.token) {
      userToken = userRegister.data.data.token;
      console.log("✅ User registered successfully");
    }

    // 4. Get Profile (Mess Owner)
    console.log("\n📍 4. GET PROFILE (Mess Owner)");
    await apiCall("GET", "/api/auth/me", null, messOwnerToken);

    // 5. Create Mess
    console.log("\n📍 5. CREATE MESS");
    const messCreate = await apiCall(
      "POST",
      "/api/messes",
      {
        name: "Jane's Healthy Kitchen",
        description: "Delicious home-cooked meals",
        location: "123 Downtown Street",
        vegAvailable: true,
        nonvegAvailable: false,
      },
      messOwnerToken,
    );

    if (messCreate.data?.data?.id) {
      messId = messCreate.data.data.id;
      console.log("✅ Mess created successfully");
    }

    // 6. Get All Messes (Public)
    console.log("\n📍 6. GET ALL MESSES (Public)");
    await apiCall("GET", "/api/messes");

    // 7. Get My Messes
    console.log("\n📍 7. GET MY MESSES");
    await apiCall("GET", "/api/messes/my", null, messOwnerToken);

    // 8. Get Mess by ID
    console.log("\n📍 8. GET MESS BY ID");
    if (messId) {
      await apiCall("GET", `/api/messes/${messId}`);
    }

    // 9. Create Plan
    console.log("\n📍 9. CREATE PLAN");
    if (messId) {
      const planCreate = await apiCall(
        "POST",
        `/api/messes/${messId}/plans`,
        {
          name: "Monthly Veg Plan",
          price: 3000,
          durationType: "monthly",
          mealType: "veg",
          mealsPerDay: 2,
        },
        messOwnerToken,
      );

      if (planCreate.data?.data?.id) {
        planId = planCreate.data.data.id;
        console.log("✅ Plan created successfully");
      }
    }

    // 10. Get Plans for Mess
    console.log("\n📍 10. GET PLANS FOR MESS");
    if (messId) {
      await apiCall("GET", `/api/messes/${messId}/plans`);
    }

    // 11. Create Subscription
    console.log("\n📍 11. CREATE SUBSCRIPTION");
    if (planId) {
      const subCreate = await apiCall(
        "POST",
        "/api/subscriptions",
        {
          planId: planId,
          startDate: new Date().toISOString(),
        },
        userToken,
      );

      if (subCreate.data?.data?.id) {
        subscriptionId = subCreate.data.data.id;
        console.log("✅ Subscription created successfully");
      }
    }

    // 12. Get My Subscriptions
    console.log("\n📍 12. GET MY SUBSCRIPTIONS");
    await apiCall("GET", "/api/subscriptions/my", null, userToken);

    // 13. Mark Attendance
    console.log("\n📍 13. MARK ATTENDANCE");
    if (subscriptionId) {
      await apiCall(
        "POST",
        `/api/subscriptions/${subscriptionId}/attendance`,
        {
          breakfast: true,
          lunch: true,
          dinner: false,
        },
        userToken,
      );
    }

    // 14. Get Attendance
    console.log("\n📍 14. GET ATTENDANCE");
    if (subscriptionId) {
      await apiCall(
        "GET",
        `/api/subscriptions/${subscriptionId}/attendance`,
        null,
        userToken,
      );
    }

    // 15. Today's Summary (Dashboard)
    console.log("\n📍 15. TODAY'S SUMMARY (Dashboard)");
    if (messId) {
      await apiCall(
        "GET",
        `/api/messes/${messId}/today-summary`,
        null,
        messOwnerToken,
      );
    }

    // 16. Cancel Subscription
    console.log("\n📍 16. CANCEL SUBSCRIPTION");
    if (subscriptionId) {
      await apiCall(
        "PATCH",
        `/api/subscriptions/${subscriptionId}/cancel`,
        null,
        userToken,
      );
    }

    // 17. Test Authorization - Try to create mess without token
    console.log("\n📍 17. TEST AUTH - Create Mess Without Token (Should Fail)");
    await apiCall("POST", "/api/messes", {
      name: "Unauthorized Mess",
      location: "Nowhere",
    });

    // 18. Test Authorization - Regular user tries to create mess (Should Fail)
    console.log("\n📍 18. TEST RBAC - User Tries to Create Mess (Should Fail)");
    await apiCall(
      "POST",
      "/api/messes",
      {
        name: "Unauthorized Mess",
        location: "Nowhere",
      },
      userToken,
    );

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests completed!");
    console.log("\n📊 Summary:");
    console.log(`   Mess Owner Token: ${messOwnerToken ? "✅" : "❌"}`);
    console.log(`   User Token: ${userToken ? "✅" : "❌"}`);
    console.log(`   Mess ID: ${messId || "N/A"}`);
    console.log(`   Plan ID: ${planId || "N/A"}`);
    console.log(`   Subscription ID: ${subscriptionId || "N/A"}`);
  } catch (error) {
    console.error("\n❌ Test suite failed:", error.message);
  }
}

// Run tests
runTests();
