import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AppProvider } from './context/AppContext';
import { KioskViewport } from './components/KioskViewport';

export default function App() {
  return (
    <AppProvider>
      <KioskViewport>
        <RouterProvider router={router} />
      </KioskViewport>
    </AppProvider>
  );
}
