const url = "https://wdmemkffaqbzvvbhckfq.supabase.co/rest/v1/todos?select=*";
const key = "sb_publishable_jU3xoYJ6ZbJ816t9iOh-hg_Cvgv7p8V";

async function testSupabase() {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error connecting to Supabase:", response.status, response.statusText, errorText);
      return;
    }

    const data = await response.json();
    console.log("Successfully fetched data! Result:");
    console.log(data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testSupabase();
