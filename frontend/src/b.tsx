// src/App.tsx
import React, { useState, useEffect } from 'react';
import axios, {AxiosResponse} from 'axios';
// import BookmarkList from './components/BookmarkList';
// import BookmarkForm from './components/BookmarkForm';
import { components } from './openapi';
type BookmarkCreate = components['schemas']['BookmarkCreate'];
type MediaType = components['schemas']['MediaType'];
type Bookmark = components['schemas']['BookmarkOut'];


namespace api {
  const api = axios.create({ baseURL: 'http://http://127.0.0.1:8000' });

  export const createBookmark = async (data: components['schemas']['BookmarkCreate']): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.post('/bookmarks/', data);
  };
  // Cannot find namespace 'axios'.ts(2503)
  export const getBookmark = async (id: number): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.get(`/bookmarks/${id}`);
  };
  
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
  const [mediaType, setMediaType] = useState<MediaType>('podcast'); // Set a default media type
  const [bookmarkString, setBookmarkString] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bookmarkData: BookmarkCreate = {
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
      {/* ... input fields, consider adding select for mediaType */}
      <button type="submit">Submit</button>
    </form>
  );
};

// export default BookmarkForm;


// Remember to fill in the API call functions, error handling,
