import { createHashRouter, RouterProvider, useRouteError, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
// import Settings from './pages/Settings'; // Replaced by Modal
import ApiProxy from './pages/ApiProxy';
import Monitor from './pages/Monitor';
import TokenStats from './pages/TokenStats';
import ThemeManager from './components/common/ThemeManager';
// import { UpdateNotification } from './components/UpdateNotification';
import { useEffect } from 'react';
import { useConfigStore } from './stores/useConfigStore';
import { useAccountStore } from './stores/useAccountStore';
import { useUIStore } from './stores/useUIStore';
import { useTranslation } from 'react-i18next';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { SettingsDialog } from './components/settings/SettingsDialog';

// Error Boundary Component
function ErrorPage() {
  const error: any = useRouteError();
  console.error('[Route Error]', error);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50 dark:bg-slate-900">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Oops!</h1>
      <p className="text-xl mb-4 text-slate-700 dark:text-slate-300">Sorry, an unexpected error has occurred.</p>
      <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-lg text-left max-w-2xl overflow-auto group">
        <code className="text-sm text-red-600 dark:text-red-400">
          {error.statusText || error.message || "Unknown routing error"}
        </code>
      </div>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-8 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
      >
        Go to Home
      </button>
    </div>
  );
}

// Dummy components for missing routes to prevent 404
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p>Coming soon...</p>
  </div>
);

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'api-proxy',
        element: <ApiProxy />,
      },
      {
        path: 'monitor',
        element: <Monitor />,
      },
      {
        path: 'token-stats',
        element: <TokenStats />,
      },
      /*
      {
        path: 'settings',
        element: <Settings />,
      },
      */
      {
        path: 'docs',
        element: <Placeholder title="Documentation" />,
      },
      {
        path: 'faq',
        element: <Placeholder title="FAQ" />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  const { config } = useConfigStore();
  const { fetchCurrentAccount, fetchAccounts } = useAccountStore();
  const { i18n } = useTranslation();
  const { isSettingsOpen } = useUIStore(); // CRITICAL FIX: Subscribe to state changes!

  // Initial boot sequence
  useEffect(() => {
    // Use getState() to avoid dependency loop if loadConfig isn't memoized correctly
    useConfigStore.getState().loadConfig();
  }, []);

  // Sync language from config
  useEffect(() => {
    if (config?.language) {
      i18n.changeLanguage(config.language);
    }
  }, [config?.language, i18n]);

  // Listen for tray events
  useEffect(() => {
    const unlistenPromises: Promise<() => void>[] = [];

    // 监听托盘切换账号事件
    unlistenPromises.push(
      listen('tray://account-switched', () => {
        console.log('[App] Tray account switched, refreshing...');
        fetchCurrentAccount();
        fetchAccounts();
      })
    );

    // 监听托盘刷新事件
    unlistenPromises.push(
      listen('tray://refresh-current', () => {
        console.log('[App] Tray refresh triggered, refreshing...');
        fetchCurrentAccount();
        fetchAccounts();
      })
    );

    // Cleanup
    return () => {
      Promise.all(unlistenPromises).then(unlisteners => {
        unlisteners.forEach(unlisten => unlisten());
      });
    };
  }, [fetchCurrentAccount, fetchAccounts]);

  // Update notification state
  // const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Check for updates on startup
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        console.log('[App] Checking if we should check for updates...');
        const shouldCheck = await invoke<boolean>('should_check_updates');
        console.log('[App] Should check updates:', shouldCheck);

        if (shouldCheck) {
          // setShowUpdateNotification(true);
          // 我们这里只负责显示通知组件，通知组件内部会去调用 check_for_updates
          // 我们在显示组件后，标记已经检查过了（即便失败或无更新，组件内部也会处理）
          await invoke('update_last_check_time');
          console.log('[App] Update check cycle initiated and last check time updated.');
        }
      } catch (error) {
        console.error('Failed to check update settings:', error);
      }
    };

    // Delay check to avoid blocking initial render
    const timer = setTimeout(checkUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ThemeManager />
      {/* 
      {showUpdateNotification && (
        <UpdateNotification onClose={() => setShowUpdateNotification(false)} />
      )}
      */}
      <RouterProvider router={router} />
      {isSettingsOpen && <SettingsDialog />}
    </>
  );
}

export default App;