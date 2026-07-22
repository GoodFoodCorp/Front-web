import { AppProviders } from './providers';
import { AppRouter } from './router';

/** Root component: providers + route table. */
export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
