import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  const root = createRoot(rootElement);
  
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}