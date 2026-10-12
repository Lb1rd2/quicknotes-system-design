# QuickNotes API Design

This is the real API the backend team should build. It is not JSONPlaceholder.

- **Base URL:** `https://api.quicknotes.example/v1`
- **Format:** JSON for requests and responses
- **Login:** every request sends `Authorization: Bearer <token>`. A user can only see and change their own notes.

## Endpoints

| Method | Path | Description | Success status |
|--------|------|-------------|----------------|
| GET | `/notes` | List the logged-in user's notes (optional `?tag=work&page=1`) | 200 OK |
| GET | `/notes/{id}` | Get one note | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{id}` | Update a note's title, body or tags | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List all tags | 200 OK |
| POST | `/notes/{id}/tags` | Add a tag to a note | 201 Created |

## Example: create a note

`POST /notes`

Request body:

```json
{
  "title": "Buy milk",
  "body": "Two litres, and bread",
  "tags": ["personal"]
}
```

Response: `201 Created`

```json
{
  "id": 42,
  "userId": 7,
  "title": "Buy milk",
  "body": "Two litres, and bread",
  "tags": ["personal"],
  "createdAt": "2026-10-12T09:30:00Z",
  "updatedAt": "2026-10-12T09:30:00Z"
}
```

## Example: list notes

`GET /notes?page=1`

Response: `200 OK`

```json
{
  "page": 1,
  "perPage": 10,
  "total": 2,
  "notes": [
    {
      "id": 42,
      "title": "Buy milk",
      "body": "Two litres, and bread",
      "tags": ["personal"],
      "createdAt": "2026-10-12T09:30:00Z"
    },
    {
      "id": 41,
      "title": "Finish report",
      "body": "Send to Grace by Friday",
      "tags": ["work"],
      "createdAt": "2026-10-11T14:05:00Z"
    }
  ]
}
```

## Error status codes

| Code | Meaning | Example of when it happens |
|------|---------|----------------------------|
| 400 Bad Request | The request is wrong or incomplete | `POST /notes` with no title, or a title longer than 100 characters |
| 401 Unauthorized | The user is not logged in | The token is missing, wrong or expired |
| 403 Forbidden | Logged in, but not allowed | A user tries to delete another user's note |
| 404 Not Found | The thing does not exist | `GET /notes/9999` when no note has that id |
| 500 Internal Server Error | A bug or failure on the server | The database is down while saving a note |

Example error body (400):

```json
{
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Title is required and must be 100 characters or fewer."
  }
}
```