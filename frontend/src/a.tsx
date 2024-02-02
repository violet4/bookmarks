
// src/App.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { components } from './openapi';
// import BookmarkList from './components/BookmarkList';
// import BookmarkForm from './components/BookmarkForm';
type BookmarkCreate = components['schemas']['BookmarkCreate'];
type MediaType = components['schemas']['MediaType'];
type Bookmark = components['schemas']['BookmarkOut'];


namespace api {
  const api = axios.create({ baseURL: 'http://127.0.0.1:8000' });
  export const createBookmark = async (data: components['schemas']['BookmarkCreate']) => {
    return await api.post('/bookmarks/', data);
  };
  
  export const getBookmarks = async () => {
    return await api.get<components['schemas']['BookmarkOut'][]>('/bookmarks/');
  };
  export const updateBookmark = async (
    id: number,
    data: components['schemas']['BookmarkUpdate']
  ) => {
    return await api.put(`/bookmarks/${id}/`, data);
  };
  
  export const deleteBookmark = async (id: number) => {
    return await api.delete(`/bookmarks/${id}/`);
  };
  
}


function App() {
  const [bookmarks, setBookmarks] = useState<components['schemas']['BookmarkOut'][]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const result = await api.getBookmarks();
      setBookmarks(result.data);
    };
    fetchBookmarks();
  }, []);

  const createBookmark = async (data: components['schemas']['BookmarkCreate']) => {
    const result = await api.createBookmark(data);
    setBookmarks([...bookmarks, result.data]);
  };
  const updateBookmark = async (
    id: number,
    data: components['schemas']['BookmarkUpdate']
  ) => {
    const result = await api.updateBookmark(id, data);
    setBookmarks(
      bookmarks.map((b) => (b.id === id ? result.data : b))
    );
  };

  const deleteBookmark = async (bookmarkId: number) => {
    await api.deleteBookmark(bookmarkId);
    setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
  };

  return (
    <div>
      <h1>Bookmarks</h1>
      <BookmarkList bookmarks={bookmarks} onDelete={deleteBookmark} onUpdate={updateBookmark} />
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
  const [mediaType, setMediaType] = useState<MediaType>('tv_show');
  const [bookmarkString, setBookmarkString] = useState('');

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const bookmarkData = {
  //     name,
  //     media_type: mediaType,
  //     bookmark: bookmarkString.split(',').map(Number),
  //   };
  //   onSubmit(bookmarkData);
  //   // ... reset form fields
  // };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bookmarkData: components['schemas']['BookmarkCreate'] = {
      name,
      media_type: mediaType as components['schemas']['MediaType'], // Cast to valid MediaType
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
