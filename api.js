// ---------- 1. Settings and elements ----------
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const form = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitBtn = document.querySelector("#submit-btn");

let notes = [];

// ---------- 2. Helpers ----------
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type;
}

// One reusable function for every request
async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Server answered with status " + response.status);
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { status: response.status, data: data };
}

// ---------- 3. API functions ----------
function getNotes() {
  return request(API_URL + "?_limit=10");
}

// ---------- 4. Draw the list ----------
function render() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No notes to show yet.";
    notesList.append(empty);
    return;
  }

  for (const note of notes) {
    const li = document.createElement("li");
    li.className = "note";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    li.append(title, body);
    notesList.append(li);
  }
}

// ---------- 5. Load notes (GET) ----------
async function handleLoad() {
  showStatus("Loading notes...", "loading");
  loadBtn.disabled = true;

  try {
    const result = await getNotes();
    notes = result.data;
    render();
    showStatus("Loaded " + notes.length + " notes from the server.", "success");
  } catch (error) {
    showStatus(
      "Sorry, we could not load your notes. " + error.message,
      "error",
    );
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", handleLoad);
render();
