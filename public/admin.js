// Fetch and display donors
async function fetchDonors() {
  const res = await fetch("/admin/donors");
  const donors = await res.json();
  const donorList = document.getElementById("donorList");
  donorList.innerHTML = "";

  donors.forEach(d => {
    donorList.innerHTML += `
      <li>
        <strong>${d.name}</strong> (${d.bloodGroup}, ${d.location})<br>
        📧 ${d.email} | 📱 ${d.phone}
        <button onclick="deleteDonor('${d._id}')">❌ Delete</button>
      </li>`;
  });
}

// Fetch and display requests
async function fetchRequests() {
  const res = await fetch("/admin/requests");
  const requests = await res.json();
  const requestList = document.getElementById("requestList");
  requestList.innerHTML = "";

  requests.forEach(r => {
    requestList.innerHTML += `
      <li>
        <strong>Need ${r.bloodGroup}</strong> at ${r.location}<br>
        📧 ${r.email} | 📱 ${r.phone}
        <button onclick="deleteRequest('${r._id}')">❌ Delete</button>
      </li>`;
  });
}

// Delete donor
async function deleteDonor(id) {
  if (confirm("Are you sure to delete this donor?")) {
    await fetch(`/admin/donors/${id}`, { method: "DELETE" });
    fetchDonors(); // refresh
  }
}

// Delete request
async function deleteRequest(id) {
  if (confirm("Are you sure to delete this request?")) {
    await fetch(`/admin/requests/${id}`, { method: "DELETE" });
    fetchRequests(); // refresh
  }
}

// On page load
window.onload = function () {
  fetchDonors();
  fetchRequests();
};
