import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/index.css';
import App from './App.jsx';
import TravelerAuthProvider from './context/TravelerAuthProvider';
import WishlistProvider from './context/WishlistProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TravelerAuthProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </TravelerAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
