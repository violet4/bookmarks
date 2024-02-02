import React, { useState, useEffect } from 'react';
import axios, {AxiosResponse} from 'axios';
import { components } from './openapi';
type BookmarkCreate = components['schemas']['BookmarkCreate'];
type BookmarkUpdate = components['schemas']['BookmarkUpdate']; // had to add this manually
type MediaType = components['schemas']['MediaType'];
type Bookmark = components['schemas']['BookmarkOut'];
type BookmarkOut = Bookmark;

namespace api {
  const api = axios.create({ baseURL: 'http://http://127.0.0.1:8000' });
  export const createBookmark = async (data: BookmarkCreate) => {
    return await api.post('/bookmarks/', data);
  };

  export const getBookmark = async (id: number): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.get(`/bookmarks/${id}`);
  };
  
  
  export const updateBookmark = async (id: number, data: BookmarkUpdate) => {
    return await api.put(`/bookmarks/${id}`, data);
  };
  export const deleteBookmark = async (id: number) => {
    return await api.delete(`/bookmarks/${id}`);
  };
}

function App() {
  const [bookmarks, setBookmarks] = useState<BookmarkOut[]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const result = await axios.get('/bookmarks/');
      setBookmarks(result.data);
    };
    fetchBookmarks();
  }, []);

  const createBookmark = async (bookmarkData: BookmarkCreate) => {
    const result = await api.createBookmark(bookmarkData);
    setBookmarks([...bookmarks, result.data]);
  };

  const updateBookmark = async (bookmarkData: BookmarkUpdate) => {
    const result = await api.updateBookmark(bookmarkData.id, bookmarkData);
    setBookmarks(
      bookmarks.map((b) => (b.id === result.data.id ? result.data : b))
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


interface BookmarkItemProps { // model A didn't update with onUpdate
  bookmark: Bookmark;
  onDelete: (bookmarkId: number) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onDelete, onUpdate }) => {
  // model a lazed out here..

  return (
    <li>
      {bookmark.name} ({bookmark.media_type}) - Bookmarks: {bookmark.bookmark.join(', ')}
      <button onClick={() => onDelete(bookmark.id)}>Delete</button>
      {/* aside from the fact that this isn't fully implemented, this has its merits.. */}
      {isEditing && (
        <BookmarkForm
          initialValues={bookmark} // Provide initial values for editing
          onSubmit={(updatedData) => {
            onUpdate(updatedData);
            setIsEditing(false);
          }}
        />
      )}
    </li>
  );
};


interface BookmarkFormProps {
  onSubmit: (bookmark: Bookmark) => void;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('podcast');
  const [bookmarkString, setBookmarkString] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bookmarkData: BookmarkCreate = {
      name,
      media_type: mediaType,
      bookmark: bookmarkString.split(',').map(Number),
    };
    onSubmit(bookmarkData);
  };


  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  );
};
