let members = [];

const tableBody = document.getElementById("memberTableBody");

const searchInput = document.getElementById("memberSearch");

async function loadMembers() {
  try {
    const response = await fetch("/api/members");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load members.");
    }

    members = data;

    displayMembers();
  } catch (error) {
    console.error(error);

    tableBody.innerHTML =
      "<tr><td colspan='6'>Failed to load members.</td></tr>";
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function displayMembers() {
  const searchText = searchInput.value.toLowerCase().trim();

  tableBody.innerHTML = "";

  const filteredMembers = members.filter(function (member) {
    return (
      member.name.toLowerCase().includes(searchText) ||
      member.email.toLowerCase().includes(searchText) ||
      member.id.toLowerCase().includes(searchText)
    );
  });

  filteredMembers.forEach(function (member) {
    const row = document.createElement("tr");

    row.innerHTML =
      "<td>" +
      escapeHTML(member.id) +
      "</td>" +
      "<td>" +
      escapeHTML(member.name) +
      "</td>" +
      "<td>" +
      escapeHTML(member.email) +
      "</td>" +
      "<td>" +
      escapeHTML(member.phone) +
      "</td>" +
      "<td>" +
      escapeHTML(member.date) +
      "</td>" +
      "<td>" +
      '<button class="action-button" onclick="editMember(\'' +
      member.id +
      "')\">Edit</button>" +
      '<button class="action-button delete-button" onclick="deleteMember(\'' +
      member.id +
      "')\">Delete</button>" +
      "</td>";

    tableBody.appendChild(row);
  });
}

async function addMember() {
  const name = prompt("Enter member name:");

  if (!name) {
    return;
  }

  const email = prompt("Enter member email:");

  if (!email) {
    return;
  }

  const phone = prompt("Enter member phone:");

  if (!phone) {
    return;
  }

  try {
    const response = await fetch("/api/members", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to add member.");
    }

    await loadMembers();
  } catch (error) {
    alert(error.message);
  }
}

async function editMember(id) {
  const member = members.find(function (item) {
    return item.id === id;
  });

  if (!member) {
    return;
  }

  const name = prompt("Enter member name:", member.name);

  if (!name) {
    return;
  }

  const email = prompt("Enter member email:", member.email);

  if (!email) {
    return;
  }

  const phone = prompt("Enter member phone:", member.phone);

  if (!phone) {
    return;
  }

  try {
    const response = await fetch("/api/members/" + id, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update member.");
    }

    await loadMembers();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteMember(id) {
  const confirmation = confirm("Are you sure you want to delete this member?");

  if (!confirmation) {
    return;
  }

  try {
    const response = await fetch("/api/members/" + id, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete member.");
    }

    await loadMembers();
  } catch (error) {
    alert(error.message);
  }
}

document.getElementById("addMemberButton").addEventListener("click", addMember);

searchInput.addEventListener("input", displayMembers);

loadMembers();
