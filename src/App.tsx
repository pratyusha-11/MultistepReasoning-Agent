import { useEffect, useState } from 'react';
import { HomePage } from '@/pages/HomePage';
import { ScoutPage } from '@/pages/ScoutPage';
import { PilotPage } from '@/pages/PilotPage';

type Route = 'home' | 'scout' | 'pilot';

function getRoute(): Route {
  const path = window.location.pathname.replace(/^\//, '');
  if (path === 'scout') return 'scout';
  if (path === 'pilot') return 'pilot';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute());
  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  if (route === 'scout') return <ScoutPage />;
  if (route === 'pilot') return <PilotPage />;
  return <HomePage />;
}
