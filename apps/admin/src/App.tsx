// apps/admin/src/App.tsx

import { Refine, Authenticated } from '@refinedev/core';
import {
    ThemedLayoutV2,
    ThemedSiderV2,
    useNotificationProvider,
    ErrorComponent,
} from '@refinedev/antd';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import routerBindings, {
    NavigateToResource,
    UnsavedChangesNotifier
} from '@refinedev/react-router-v6';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';

// Providers
import { firestoreDataProvider } from './providers/firestoreDataProvider';
import { authProvider } from './providers/authProvider';

// Pages
import { LoginPage } from './pages/login';

// Resources - Journalistes
import { JournalistList } from './resources/journalists/list';
import { JournalistCreate } from './resources/journalists/create';
import { JournalistEdit } from './resources/journalists/edit';

// Resources - Pays
import { CountryList } from './resources/countries/list';
import { CountryCreate } from './resources/countries/create';
import { CountryEdit } from './resources/countries/edit';

// Styles Ant Design
import '@refinedev/antd/dist/reset.css';

console.log('🟠 [APP] App component loading...');

// LOADING SCREEN
const LoadingScreen = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f5f5f5',
    }}>
        <Spin size="large" tip="Chargement..." />
    </div>
);

// LOGIN LAYOUT (sans sidebar)
const LoginLayout = () => {
    console.log('🔐 [APP] Rendering LoginLayout');
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f5f5f5',
        }}>
            <Outlet />
        </div>
    );
};

// Titre personnalisé pour la Sidebar
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

const App = () => {
    console.log('🟠 [APP] App component rendering');

    return (
        <BrowserRouter>
            <ConfigProvider>
                <AntdApp>
                    <Refine
                        dataProvider={firestoreDataProvider}
                        authProvider={authProvider}
                        notificationProvider={useNotificationProvider}
                        routerProvider={routerBindings}
                        resources={[
                            {
                                name: 'journalists',
                                list: '/journalists',
                                create: '/journalists/create',
                                edit: '/journalists/edit/:id',
                                meta: { label: 'Journalistes' },
                            },
                            {
                                name: 'countries',
                                list: '/countries',
                                create: '/countries/create',
                                edit: '/countries/edit/:id',
                                meta: { label: 'Pays' },
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
                                        fallback={<NavigateToResource resource="login" />}
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
                                {/* Index - redirect to journalists */}
                                <Route index element={<NavigateToResource resource="journalists" />} />

                                {/* Journalists CRUD */}
                                <Route path="journalists">
                                    <Route index element={<JournalistList />} />
                                    <Route path="create" element={<JournalistCreate />} />
                                    <Route path="edit/:id" element={<JournalistEdit />} />
                                </Route>

                                {/* Countries CRUD */}
                                <Route path="countries">
                                    <Route index element={<CountryList />} />
                                    <Route path="create" element={<CountryCreate />} />
                                    <Route path="edit/:id" element={<CountryEdit />} />
                                </Route>
                            </Route>

                            {/* ===== PUBLIC ROUTES ===== */}
                            <Route
                                element={
                                    <Authenticated
                                        key="public-routes"
                                        fallback={<LoginLayout />}
                                        loading={<LoadingScreen />}
                                    >
                                        {/* Si authentifié, redirect vers journalistes */}
                                        <NavigateToResource resource="journalists" />
                                    </Authenticated>
                                }
                            >
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="*" element={<LoginPage />} />
                            </Route>

                            {/* ===== 404 FALLBACK ===== */}
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
