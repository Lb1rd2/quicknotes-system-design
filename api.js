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

function createNote(note) {
  return request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(note)
  });
}

// JSONPlaceholder is a practice API: it answers "OK" but does not really
// store or remove anything. Every note we create also gets the same id (101).
// So after the server answers OK, we remove that exact note from our own
// notes array (by the object itself, not by id) and draw the list again.
function removeNoteRequest(id) {
  return request(API_URL + "/" + id, { method: "DELETE" });
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

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      handleDelete(note, deleteBtn);
    });

    li.append(title, body, deleteBtn);
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
    showStatus("Sorry, we could not load your notes. " + error.message, "error");
  } finally {
    loadBtn.disabled = false;
  }
}

// ---------- 6. Create a note (POST) ----------
async function handleSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (title === "") {
    showStatus("Please type a title first.", "error");
    return;
  }
  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    return;
  }

  showStatus("Saving note...", "loading");
  submitBtn.disabled = true;

  try {
    const result = await createNote({ title: title, body: body, userId: 1 });
    notes.unshift(result.data);
    render();
    form.reset();
    showStatus(
      "Note created (status " + result.status + ", id " + result.data.id + ").",
      "success"
    );
  } catch (error) {
    showStatus("Sorry, we could not save your note. " + error.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
}

// ---------- 7. Delete a note (DELETE) ----------
async function handleDelete(note, button) {
  showStatus("Deleting note...", "loading");
  button.disabled = true;

  try {
    await removeNoteRequest(note.id);
    notes = notes.filter(function (item) {
      return item !== note;
    });
    render();
    showStatus("Note deleted.", "success");
  } catch (error) {
    button.disabled = false;
    showStatus("Sorry, we could not delete that note. " + error.message, "error");
  }
}

// ---------- 8. Start ----------
loadBtn.addEventListener("click", handleLoad);
form.addEventListener("submit", handleSubmit);
render();