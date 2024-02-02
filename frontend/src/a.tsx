/*
Here's the breakdown of creating the web app:

Components:

    App.tsx:
        Houses the main app logic, state management, and API calls.
        Renders the BookmarkList and BookmarkForm components.
    BookmarkList.tsx:
        Displays the list of bookmarks.
        Renders BookmarkItem components for each bookmark.
    BookmarkItem.tsx:
        Represents a single bookmark.
        Handles editing and deletion.
    BookmarkForm.tsx:
        Form for adding and editing bookmarks.


API Calls:

    Use axios or fetch to make requests to the FastAPI endpoints:
        GET /bookmarks/: Fetch all bookmarks.
        POST /bookmarks/: Create a new bookmark.
        PUT /bookmarks/{bookmark_id}/: Update a bookmark.
        DELETE /bookmarks/{bookmark_id}/: Delete a bookmark.


State Management:

    You can use useState for basic state within components.
    For more complex state or sharing data across components, consider useContext or a library like Redux.


Code Structure:
*/
// src/App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import BookmarkList from './components/BookmarkList';
// import BookmarkForm from './components/BookmarkForm';

interface Bookmark {
  id: number;
  name: string;
  media_type: string;
  bookmark: number[];
}

function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const result = await axios.get('/bookmarks/');
      setBookmarks(result.data);
    };
    fetchBookmarks();
  }, []);

  // ... other API call functions (createBookmark, updateBookmark, deleteBookmark)

  return (
    <div>
      <h1>Bookmarks</h1>
      <BookmarkList bookmarks={bookmarks} onDelete={deleteBookmark} />
      <BookmarkForm onSubmit={createBookmark} />
    </div>
  );
}

export default App;

// src/components/BookmarkList.tsx
// import React from 'react';
// import BookmarkItem from './BookmarkItem';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (bookmarkId: number) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete }) => {
  return (
    <ul>
      {bookmarks.map((bookmark) => (
        <BookmarkItem key={bookmark.id} bookmark={bookmark} onDelete={onDelete} />
      ))}
    </ul>
  );
};

// export default BookmarkList;

// src/components/BookmarkItem.tsx
// import React from 'react';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onDelete: (bookmarkId: number) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onDelete }) => {
  // ... handle editing logic (omitted for brevity)

  return (
    <li>
      {bookmark.name} ({bookmark.media_type}) - Bookmarks: {bookmark.bookmark.join(', ')}
      <button onClick={() => onDelete(bookmark.id)}>Delete</button>
      {/* ... editing controls */}
    </li>
  );
};

// export default BookmarkItem;

// src/components/BookmarkForm.tsx
// import React, { useState } from 'react';

interface BookmarkFormProps {
  onSubmit: (bookmark: Bookmark) => void;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [bookmarkString, setBookmarkString] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bookmarkData = {
      name,
      media_type: mediaType,
      bookmark: bookmarkString.split(',').map(Number),
    };
    onSubmit(bookmarkData);
    // ... reset form fields
  };

  // ... input change handlers

  return (
    <form onSubmit={handleSubmit}>
      {/* ... input fields and submit button */}
    </form>
  );
};

// export default BookmarkForm;


// Remember to fill in the API call functions, error handling,
