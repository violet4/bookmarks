import React, { useState, useEffect } from 'react';
import axios, {AxiosResponse} from 'axios';
import { components } from './openapi';
type BookmarkCreate = components['schemas']['BookmarkCreate'];
type MediaType = components['schemas']['MediaType'];
type Bookmark = components['schemas']['BookmarkOut'];


namespace api {
//  const api = axios.create({ baseURL: 'http://127.0.0.1:8000' });
  const api = axios.create();

  export const getBookmarks = async (): Promise<AxiosResponse<components['schemas']['BookmarkOut'][]>> => {
    return await api.get(`/bookmarks/`);
  };

  export const createBookmark = async (data: components['schemas']['BookmarkCreate']): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.post('/bookmarks/', data);
  };
  
  export const getBookmark = async (id: number): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
    return await api.get(`/bookmarks/${id}`);
  };

  export const updateBookmark = async (id: number, data: components['schemas']['BookmarkCreate']): Promise<AxiosResponse<components['schemas']['BookmarkOut']>> => {
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

  const updateBookmark = (bookmarkId: number, updatedData: components['schemas']['BookmarkCreate']) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.map((bookmark) =>
        bookmark.id === bookmarkId ? { ...bookmark, ...updatedData } : bookmark
      )
    );
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
  onUpdate: (bookmarkId: number, updatedBookmark: components['schemas']['BookmarkCreate']) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete, onUpdate }) => {
  return (
    <ul>
      {bookmarks.map((bookmark) => (
        <BookmarkItem key={bookmark.id} bookmark={bookmark} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </ul>
  );
};


interface BookmarkItemProps {
  bookmark: Bookmark;
  onDelete: (bookmarkId: number) => void;
  onUpdate: (bookmarkId: number, updatedBookmark: components['schemas']['BookmarkCreate']) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(bookmark.name);
  const [editBookmark, setEditBookmark] = useState(bookmark.bookmark.join(','));

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updatedData: components['schemas']['BookmarkCreate'] = {
      name: editName,
      media_type: bookmark.media_type, // Assuming we don't edit media_type
      bookmark: editBookmark.split(',').map(Number),
    };

    try {
      const response = await api.updateBookmark(bookmark.id, updatedData); // Assuming api.updateBookmark returns AxiosResponse
      if (response.status === 200) {
        onUpdate(bookmark.id, updatedData);
        setIsEditing(false); 
      } else {
        console.error('Update failed with status:', response.status);
      }
    } catch (error) {
      // Handle potential errors from the update request
      console.error('Update bookmark failed:', error); 
    }
  };
  return (
    <li>
      {isEditing ? (
        <>
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <input type="text" value={editBookmark} onChange={(e) => setEditBookmark(e.target.value)} />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          {bookmark.name} ({bookmark.media_type}) - Bookmarks: {bookmark.bookmark.join(',')}
          <button onClick={handleEdit}>Edit</button>
          <button onClick={() => onDelete(bookmark.id)}>Delete</button>
        </>
      )}
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
    // ... reset the form fields after submission
    setName(''); 
    setMediaType('podcast'); 
    setBookmarkString(''); 
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMediaType(e.target.value as MediaType); // Cast to MediaType
  };

  const handleBookmarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookmarkString(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} />
      </div>
      <div>
        <label htmlFor="media-type">Media Type:</label>
        <select id="media-type" value={mediaType} onChange={handleMediaTypeChange}>
          <option value="podcast">Podcast</option>
          <option value="tv_show">TV Show</option>
          <option value="book">Book</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="bookmarks">Bookmarks:</label>
        <input type="text" id="bookmarks" value={bookmarkString} onChange={handleBookmarkChange} />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

