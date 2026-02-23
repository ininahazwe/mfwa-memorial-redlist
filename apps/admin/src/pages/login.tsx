// ============================================
// PAGE DE CONNEXION
// ============================================
// Formulaire de login avec le branding Mémoire Vive

import { AuthPage } from '@refinedev/antd';

export const LoginPage = () => {
    console.log('🔐 [LOGIN] LoginPage rendering');
  return (
    <AuthPage
      type="login"
      // ----------------------------------------
      // Logo et titre personnalisés
      // ----------------------------------------
      title={
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {/* Logo */}
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 32,
              margin: 0,
              letterSpacing: '0.1em',
            }}
          >
            Mémoire{' '}
            <span style={{ color: '#c4a77d' }}>Vive</span>
          </h1>

          {/* Sous-titre */}
          <p
            style={{
              color: '#888',
              fontSize: 12,
              marginTop: 8,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Administration
          </p>
        </div>
      }
      // ----------------------------------------
      // Configuration du formulaire
      // ----------------------------------------
      formProps={{
        initialValues: {
          email: '',
          password: ''
        },
      }}
      // ----------------------------------------
      // Textes personnalisés
      // ----------------------------------------
      contentProps={{
        style: {
          maxWidth: 400,
        },
      }}
      // Masquer les options non utilisées
      registerLink={false}
      forgotPasswordLink={false}
      rememberMe={false}
    />
  );
};

export default LoginPage;
