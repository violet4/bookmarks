import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import BookmarkApp from './components/BookmarkApp.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BookmarkApp />
  </React.StrictMode>,
)
