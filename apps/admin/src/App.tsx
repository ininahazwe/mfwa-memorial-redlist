// apps/admin/src/App.tsx

import { Refine, Authenticated } from '@refinedev/core';
import {
    ThemedLayoutV2,
    ThemedSiderV2,
    useNotificationProvider,
    ErrorComponent,
} from '@refinedev/antd';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import routerBindings, {
    NavigateToResource,
    UnsavedChangesNotifier
} from '@refinedev/react-router-v6';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';

// Providers
import { restDataProvider } from './providers/restDataProvider';
import { authProvider } from './providers/authProvider';

// Pages
import { LoginPage } from './pages/login';

// Resources - Journalists
import { JournalistList } from './resources/journalists/list';
import { JournalistCreate } from './resources/journalists/create';
import { JournalistEdit } from './resources/journalists/edit';

// Resources - Pays
import { CountryList } from './resources/countries/list';
import { CountryCreate } from './resources/countries/create';
import { CountryEdit } from './resources/countries/edit';

// Styles Ant Design
import '@refinedev/antd/dist/reset.css';

// ============================================
// LOADING SCREEN
// ============================================
const LoadingScreen = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f5f5f5',
    }}>
        <Spin size="large" tip="Loading..." fullscreen />
    </div>
);

// ============================================
// SIDEBAR TITLE
// ============================================
const SidebarTitle = ({ collapsed }: { collapsed: boolean }) => (
    <div style={{
        padding: '12px',
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-start',
        alignItems: 'center'
    }}>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1890ff' }}>
            {collapsed ? 'MV' : 'MÉMOIRE VIVE'}
        </span>
    </div>
);

// ============================================
// APP COMPONENT
// basename="/admin" → indispensable pour le sous-dossier cPanel
// ============================================
const App = () => {
    return (
        // ↓ basename="/admin" dit à React Router que l'app tourne sous /admin/
        <BrowserRouter
            basename="/admin"
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <ConfigProvider>
                <AntdApp>
                    <Refine
                        dataProvider={restDataProvider}
                        authProvider={authProvider}
                        notificationProvider={useNotificationProvider}
                        routerProvider={routerBindings}
                        resources={[
                            {
                                name: 'journalists',
                                list: '/journalists',
                                create: '/journalists/create',
                                edit: '/journalists/edit/:id',
                                meta: { label: 'Journalists' },
                            },
                            {
                                name: 'countries',
                                list: '/countries',
                                create: '/countries/create',
                                edit: '/countries/edit/:id',
                                meta: { label: 'Countries' },
                            },
                        ]}
                        options={{
                            syncWithLocation: true,
                            warnWhenUnsavedChanges: true,
                        }}
                    >
                        <Routes>
                            {/* ===== AUTHENTICATED ROUTES ===== */}
                            <Route
                                element={
                                    <Authenticated
                                        key="authenticated-layout"
                                        fallback={<Navigate to="/login" replace />}
                                        loading={<LoadingScreen />}
                                    >
                                        <ThemedLayoutV2
                                            Sider={(props) => (
                                                <ThemedSiderV2 {...props} Title={SidebarTitle} />
                                            )}
                                        >
                                            <Outlet />
                                        </ThemedLayoutV2>
                                    </Authenticated>
                                }
                            >
                                <Route index element={<NavigateToResource resource="journalists" />} />

                                <Route path="journalists">
                                    <Route index element={<JournalistList />} />
                                    <Route path="create" element={<JournalistCreate />} />
                                    <Route path="edit/:id" element={<JournalistEdit />} />
                                </Route>

                                <Route path="countries">
                                    <Route index element={<CountryList />} />
                                    <Route path="create" element={<CountryCreate />} />
                                    <Route path="edit/:id" element={<CountryEdit />} />
                                </Route>
                            </Route>

                            {/* ===== LOGIN ===== */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* ===== 404 ===== */}
                            <Route path="*" element={<ErrorComponent />} />
                        </Routes>

                        <UnsavedChangesNotifier />
                    </Refine>
                </AntdApp>
            </ConfigProvider>
        </BrowserRouter>
    );
};

export default App;