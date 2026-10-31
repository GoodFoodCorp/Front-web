import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { ChatWidget } from '../features/chat/components/ChatWidget';
import { RealtimeBridge } from '../features/notifications/RealtimeBridge';
import { Toaster } from '../features/notifications/Toaster';
import { AppProviders } from './providers';
import { AppRouter } from './router';

/** Root component: providers + route table. */
export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <RealtimeBridge />
      <Toaster />
      <ChatWidget />
      <WelcomeOverlay />
    </AppProviders>
  );
}
