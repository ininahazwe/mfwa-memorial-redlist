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
import { ConfigProvider, App as AntdApp } from 'antd';

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
                            {/* 1. ROUTES PROTÉGÉES (Layout + Sidebar) */}
                            <Route
                                element={
                                    <Authenticated
                                        key="authenticated-inner"
                                        fallback={<NavigateToResource resource="login" />}
                                    >
                                        <ThemedLayoutV2
                                            Sider={(props) => <ThemedSiderV2 {...props} Title={SidebarTitle} />}
                                        >
                                            <Outlet />
                                        </ThemedLayoutV2>
                                    </Authenticated>
                                }
                            >
                                {/* Redirection racine vers journalistes */}
                                <Route index element={<NavigateToResource resource="journalists" />} />

                                <Route path="/journalists">
                                    <Route index element={<JournalistList />} />
                                    <Route path="create" element={<JournalistCreate />} />
                                    <Route path="edit/:id" element={<JournalistEdit />} />
                                </Route>

                                <Route path="/countries">
                                    <Route index element={<CountryList />} />
                                    <Route path="create" element={<CountryCreate />} />
                                    <Route path="edit/:id" element={<CountryEdit />} />
                                </Route>
                            </Route>

                            {/* 2. ROUTE PUBLIQUE (Login) */}
                            <Route
                                element={
                                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                                        <NavigateToResource resource="journalists" />
                                    </Authenticated>
                                }
                            >
                                <Route path="/login" element={<LoginPage />} />
                            </Route>

                            {/* 3. ERREUR 404 */}
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