// ============================================
// APPLICATION ADMIN PRINCIPALE - MÉMOIRE VIVE
// ============================================
// Refine + Ant Design Light Theme + Firebase + Routes
// Location: apps/admin/src/App.tsx

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
import { ConfigProvider, App as AntdApp, theme } from 'antd';

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

// ============================================
// COMPOSANT TITRE SIDEBAR
// ============================================

const SidebarTitle = () => (
  <div 
    style={{ 
      padding: '20px 16px', 
      fontFamily: '"Cormorant Garamond", serif',
      fontSize: '20px',
      fontWeight: 300,
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e8dcc8',
    }}
  >
    Mémoire <span style={{ color: '#c4a77d' }}>Vive</span>
    <div 
      style={{
        fontSize: '10px',
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 400,
        letterSpacing: '0.15em',
        color: '#999',
        marginTop: '4px',
        textTransform: 'uppercase',
      }}
    >
      Admin
    </div>
  </div>
);

// ============================================
// CONFIGURATION LIGHT THEME
// ============================================

const lightThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Couleur primaire dorée (accent)
    colorPrimary: '#c4a77d',
    
    // Fonds clairs (light beige)
    colorBgContainer: '#fefdfb',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f0',
    
    // Texte
    colorText: '#2a2a2a',
    colorTextSecondary: '#666666',
    
    // Bordures
    colorBorder: '#e8dcc8',
    colorBorderSecondary: '#f0ebe0',
    
    // Design
    borderRadius: 8,
    fontFamily: '"DM Sans", sans-serif',
    fontSize: 14,
    
    // Spacing
    marginSM: 8,
    marginMD: 12,
    marginLG: 16,
    
    // Ombre douce
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  
  components: {
    Button: {
      primaryColor: '#c4a77d',
      controlHeight: 36,
      fontWeight: 500,
    },
    Input: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Select: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Table: {
      headerBg: '#f5f5f0',
      headerColor: '#2a2a2a',
      borderColor: '#e8dcc8',
      rowHoverBg: '#fafaf7',
    },
    Card: {
      colorBgContainer: '#ffffff',
      boxShadow: 'none',
      borderRadiusSM: 6,
    },
    Layout: {
      colorBgHeader: '#ffffff',
      colorBgBody: '#f5f5f0',
      colorBgTrigger: '#e8dcc8',
      borderColor: '#e8dcc8',
    },
  },
};

// ============================================
// APPLICATION
// ============================================

const App = () => {
  return (
    <BrowserRouter>
      {/* Configuration du thème Ant Design (Light) */}
      <ConfigProvider theme={lightThemeConfig}>
        <AntdApp>
          <Refine
            // ----------------------------------------
            // Providers
            // ----------------------------------------
            dataProvider={firestoreDataProvider}
            authProvider={authProvider}
            routerProvider={routerBindings}
            notificationProvider={useNotificationProvider}
            
            // ----------------------------------------
            // Resources (collections Firestore)
            // ----------------------------------------
            resources={[
              {
                name: 'journalists',
                list: '/journalists',
                create: '/journalists/create',
                edit: '/journalists/edit/:id',
                meta: { 
                  label: 'Journalists',
                  icon: '📰',
                },
              },
              {
                name: 'countries',
                list: '/countries',
                create: '/countries/create',
                edit: '/countries/edit/:id',
                meta: { 
                  label: 'Countries',
                  icon: '🌍',
                },
              },
            ]}
            
            // ----------------------------------------
            // Options
            // ----------------------------------------
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              {/* ====================================== */}
              {/* Routes protégées (nécessitent auth)   */}
              {/* ====================================== */}
              <Route
                element={
                  <Authenticated
                    key="authenticated"
                    fallback={<Outlet />}
                  >
                    <ThemedLayoutV2
                      Sider={() => (
                        <ThemedSiderV2 
                          Title={() => <SidebarTitle />}
                          render={({ items }) => (
                            <>
                              {items}
                              
                              {/* Lien vers le site public */}
                              <div 
                                style={{ 
                                  padding: '16px',
                                  borderTop: '1px solid #e8dcc8',
                                  marginTop: 'auto',
                                }}
                              >
                                <a 
                                  href="https://mfwa-memorial.vercel.app/" 
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ 
                                    color: '#999', 
                                    fontSize: '12px',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <span>↗</span>
                                  <span>Visit the public site</span>
                                </a>
                              </div>
                            </>
                          )}
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                {/* Redirection par défaut */}
                <Route index element={<NavigateToResource resource="journalists" />} />
                
                {/* ====== Routes Journalistes ====== */}
                <Route path="/journalists">
                  <Route index element={<JournalistList />} />
                  <Route path="create" element={<JournalistCreate />} />
                  <Route path="edit/:id" element={<JournalistEdit />} />
                </Route>
                
                {/* ====== Routes Pays ====== */}
                <Route path="/countries">
                  <Route index element={<CountryList />} />
                  <Route path="create" element={<CountryCreate />} />
                  <Route path="edit/:id" element={<CountryEdit />} />
                </Route>
                
                {/* 404 */}
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              
              {/* ====================================== */}
              {/* Route publique : Login                */}
              {/* ====================================== */}
              <Route path="/login" element={<LoginPage />} />
            </Routes>
            
            {/* Avertissement si modifications non sauvegardées */}
            <UnsavedChangesNotifier />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;