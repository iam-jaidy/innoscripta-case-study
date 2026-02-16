import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewsFeed from './features/feed/NewsFeed';
import { SideBar } from './components/SideBar';
import Filters from './features/feed/Filters';

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <header className="px-8 p-4 bg-background border-b border-border w-full shrink-0">
          <h1 className="text-2xl font-bold">NewsHub</h1>
        </header>
        <main className="flex flex-1 w-full overflow-hidden">
          <aside className="hidden md:block h-full shrink-0">
            <SideBar />
          </aside>
          <div className="flex flex-1 flex-col h-full">
            <div className="border-b bg-card p-6 w-full">
              <Filters />
            </div>
            <div className="p-3 flex-1 overflow-y-auto scroll-smooth">
              <NewsFeed />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
