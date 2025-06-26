// ==============================
// 🩸 Donor Form Submission
// ==============================
document.getElementById("donorForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const donorData = {
    name: document.getElementById("donorName").value,
    bloodGroup: document.getElementById("donorBlood").value,
    location: document.getElementById("donorLocation").value,
    email: document.getElementById("donorEmail").value,
    phone: document.getElementById("donorMobile").value
  };

  // ✅ Validate email and phone
  if (!validateEmail(donorData.email) || !validateMobile(donorData.phone)) {
    alert("❌ Please enter a valid email and 10-digit mobile number.");
    return;
  }

  try {
    const response = await fetch("/donor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(donorData)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      document.getElementById("donorForm").reset(); // ✅ Reset form
    } else {
      alert("⚠️ " + result.message);
    }
  } catch (error) {
    alert("❌ Error registering donor");
    console.error("Donor Error:", error);
  }
});


// ==============================
// 🚑 Request Form Submission
// ==============================
document.getElementById("requestForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const requestData = {
    bloodGroup: document.getElementById("requestBlood").value.trim(),
    location: document.getElementById("requestLocation").value.trim(),
    email: document.getElementById("requestEmail").value.trim(),
    phone: document.getElementById("requestMobile").value.trim()
  };

  // ✅ Validate request email & phone
  if (!validateEmail(requestData.email) || !validateMobile(requestData.phone)) {
    alert("❌ Please enter a valid email and 10-digit phone number.");
    return;
  }

  try {
    const donorDiv = document.getElementById("matchedDonors");
    donorDiv.innerHTML = "<p>🔍 Searching for matching donors...</p>";

    const response = await fetch("/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    donorDiv.innerHTML = ""; // clear previous

    if (response.ok && result.donors && result.donors.length > 0) {
      donorDiv.innerHTML = `
        <h3>🩸 Matched Donors:</h3>
        <ul style="list-style:none;padding:0;">
          ${result.donors.map(d => `
            <li style="background:#fff;padding:10px;margin:5px;border:1px solid #ccc;border-radius:5px;">
              <strong>${d.name}</strong> - ${d.bloodGroup} - ${d.location}<br>
              📧 ${d.email} | 📱 ${d.phone}
            </li>`).join("")}
        </ul>`;
      alert(result.message);
    } else {
      donorDiv.innerHTML = "<p style='color:red;'>No matching donors found.</p>";
      alert(result.message || "No donors found.");
    }

    document.getElementById("requestForm").reset(); // ✅ Reset form
  } catch (error) {
    console.error("Request error:", error);
    alert("❌ Error submitting blood request");
  }
});


// ==============================
// ✅ Helper Functions
// ==============================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}
