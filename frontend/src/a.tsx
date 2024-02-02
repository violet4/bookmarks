import React, { useState, useEffect } from 'react';
import axios, {AxiosResponse} from 'axios';
import { components } from './openapi';
type BookmarkCreate = components['schemas']['BookmarkCreate'];
type MediaType = components['schemas']['MediaType'];
type Bookmark = components['schemas']['BookmarkOut'];


namespace api {
  const api = axios.create({ baseURL: 'http://127.0.0.1:8000' });

  export const getBookmarks = async (): Promise<AxiosResponse<components['schemas']['BookmarkOut'][]>> => {
    return await api.get(`/bookmarks/`);
  };

  export const createBookmark = async (data: components['schemas']['BookmarkCreate']): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.post('/bookmarks/', data);
  };
  
  export const getBookmark = async (id: number): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.get(`/bookmarks/${id}`);
  };

  export const updateBookmark = async (id: number, data: components['schemas']['BookmarkUpdate']): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.put(`/bookmarks/${id}`, data);
  };
  
  export const deleteBookmark = async (id: number): Promise<AxiosResponse> => {
    return await api.delete(`/bookmarks/${id}`);
  };
    
}

function App() {
  const [bookmarks, setBookmarks] = useState<components['schemas']['BookmarkOut'][]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      // good job catching errors
      try {
        const response = await api.getBookmarks(); // uses api.getBookmarks but never defined it..
        setBookmarks(response.data);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    };
    fetchBookmarks();
  }, []);

  const createBookmark = async (newBookmark: components['schemas']['BookmarkCreate']) => {
    // good job catching errors
    try {
      const response = await api.createBookmark(newBookmark);
      setBookmarks([...bookmarks, response.data]);
    } catch (error) {
      console.error('Error creating bookmark:', error);
    }
  };

  const updateBookmark = async (updatedBookmark: components['schemas']['BookmarkUpdate']) => {
    try {
      const response = await api.updateBookmark(updatedBookmark.id, updatedBookmark);
      setBookmarks(bookmarks.map(b => b.id === updatedBookmark.id ? response.data : b));
    } catch (error) {
       console.error('Error updating bookmark:', error);
    }
  };

  const deleteBookmark = async (bookmarkId: number) => {
    try {
      await api.deleteBookmark(bookmarkId);
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== bookmarkId));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
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
  onUpdate: (updatedBookmark: components['schemas']['BookmarkUpdate']) => Promise<void>;
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


interface BookmarkItemProps {
  bookmark: Bookmark;
  onDelete: (bookmarkId: number) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onDelete }) => {

  return (
    <li>
      {bookmark.name} ({bookmark.media_type}) - Bookmarks: {bookmark.bookmark.join(', ')}
      <button onClick={() => onDelete(bookmark.id)}>Delete</button>
    </li>
  );
};


interface BookmarkFormProps {
  onSubmit: (bookmark: BookmarkCreate) => void;
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
