# QuickNotes System Design

QuickNotes is moving from a browser-only app to an online service for 1 million people. This repository has two parts: a small browser client that talks to a practice API (JSONPlaceholder) using `fetch`, and the design documents the backend team will use to build the real service.

## How to run the API client

1. Clone the repository:

```bash
git clone https://github.com/Lb1rd2/quicknotes-system-design.git
```

2. Open the folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Click **Load notes** to fetch 10 notes, use the form to add a note, and click **Delete** to remove one.

JSONPlaceholder does not really save changes. It only pretends to, so created notes appear in the list but are not stored on the server.

## Design documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- How to use `fetch` with `async` and `await`, and how to check `response.ok` and handle errors with `try`, `catch` and `finally`.
- How to show loading, success, error and empty states, and disable buttons during requests.
- How to design a REST API with the right methods, paths, status codes and error bodies.
- How a many-to-many relationship needs a join table, and how to write the SQL for it.
- How a CDN, load balancer, cache, read replica and queue work together, and how to avoid single points of failure.