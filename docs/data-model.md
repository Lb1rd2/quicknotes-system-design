# QuickNotes Data Model

## Entities

### users
| Column | Type | Key / rule |
|--------|------|------------|
| id | INTEGER | Primary key |
| name | TEXT | Required |
| email | TEXT | Required, unique |
| password_hash | TEXT | Required |
| created_at | TEXT | Required, defaults to now |

### notes
| Column | Type | Key / rule |
|--------|------|------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users(id), required |
| title | TEXT | Required, 100 characters at most |
| body | TEXT | Optional |
| created_at | TEXT | Required, defaults to now |
| updated_at | TEXT | Required, defaults to now |

### tags
| Column | Type | Key / rule |
|--------|------|------------|
| id | INTEGER | Primary key |
| name | TEXT | Required, unique |

### note_tags
| Column | Type | Key / rule |
|--------|------|------------|
| note_id | INTEGER | Foreign key to notes(id) |
| tag_id | INTEGER | Foreign key to tags(id) |
| (note_id, tag_id) | | Primary key together, so a note cannot get the same tag twice |

## Relationships

- **users to notes (one-to-many):** one user has many notes, and each note belongs to exactly one user. The `user_id` column in `notes` holds this link.
- **notes to tags (many-to-many):** one note can have many tags, and one tag can be on many notes. A single column cannot hold a list, so the join table `note_tags` stores one row for each note-and-tag pair.

## CREATE TABLE statements

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT NOT NULL CHECK (length(title) <= 100),
  body       TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id  INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_note_tags_tag ON note_tags(tag_id);
```

## Example queries

**1. All notes for one user (JOIN):**

```sql
SELECT n.title, n.created_at
FROM notes n
JOIN users u ON u.id = n.user_id
WHERE u.email = 'amina@example.com'
ORDER BY n.created_at DESC;
```

**2. All notes with the tag "work" (three tables joined):**

```sql
SELECT n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t       ON t.id = nt.tag_id
WHERE t.name = 'work';
```

**3. Number of notes per user, including users with none:**

```sql
SELECT u.name, COUNT(n.id) AS number_of_notes
FROM users u
LEFT JOIN notes n ON n.user_id = u.id
GROUP BY u.id, u.name;
```

## Indexes

- **`idx_notes_user_created` on `notes(user_id, created_at DESC)`:** the most common request is "show this user's newest notes". Without the index, the database reads every note in the table. With it, the database jumps straight to that user's notes, already sorted by date. This matters most with 1 million users.
- **`idx_note_tags_tag` on `note_tags(tag_id)`:** the primary key already speeds up searches by note. This index speeds up "all notes with this tag".

## SQL or NoSQL?

I choose **SQL**. QuickNotes data is structured and has clear relationships: users own notes, and notes have tags. SQL joins answer questions like "all notes with the tag work" easily. SQL also protects the data: unique emails, no duplicate tags on a note, and foreign keys so a note cannot point to a user who does not exist. Notes must never be lost, so the safety of transactions matters. NoSQL is better when data has no fixed shape or must be spread across very many servers, and 1 million users does not need that. The read replica in the architecture handles our heavy reading.