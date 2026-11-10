import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import Invitation from './Invitation';
import './invitation.css';

const root = document.getElementById('root')!;
if (root.querySelector('main')) hydrateRoot(root, <Invitation />);
else createRoot(root).render(<Invitation />);
