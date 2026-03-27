// ============================================
// PAGE DE CONNEXION - VERSION SIMPLE ET ROBUSTE
// ============================================
// Formulaire de login personnalisé (pas de AuthPage Refine)

import { useLogin } from '@refinedev/core';
import { Form, Input, Button, Card, message } from 'antd';
import { useState } from 'react';

console.log('🔐 [LOGIN] login.tsx module loaded');

export const LoginPage = () => {
    console.log('🔐 [LOGIN] LoginPage component rendering');

    const { mutate: login, isLoading } = useLogin();
    const [form] = Form.useForm();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: any) => {
        console.log('🔐 [LOGIN] Form submitted with email:', values.email);
        setError(null);

        login(
            {
                email: values.email,
                password: values.password,
            },
            {
                onError: (error: any) => {
                    console.error('🔴 [LOGIN] Login error:', error);
                    setError(error?.message || 'Connection error');
                },
                onSuccess: () => {
                    console.log('🟢 [LOGIN] Login successful');
                    message.success('Successful connection!');
                },
            }
        );
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px',
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
            >
                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
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

                {/* ERROR MESSAGE */}
                {error && (
                    <div style={{
                        marginBottom: 16,
                        padding: 12,
                        backgroundColor: '#fff1f0',
                        borderRadius: 4,
                        color: '#d4380d',
                        border: '1px solid #ffccc7',
                    }}>
                        {error}
                    </div>
                )}

                {/* FORM */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {/* EMAIL */}
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Email required' },
                            { type: 'email', message: 'Invalid email' }
                        ]}
                    >
                        <Input
                            type="email"
                            placeholder="votre@email.com"
                            disabled={isLoading}
                        />
                    </Form.Item>

                    {/* PASSWORD */}
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Password required' }
                        ]}
                    >
                        <Input.Password
                            placeholder="Password"
                            disabled={isLoading}
                        />
                    </Form.Item>

                    {/* SUBMIT BUTTON */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            size="large"
                        >
                            {isLoading ? 'Connecting...' : 'Connect'}
                        </Button>
                    </Form.Item>
                </Form>

                {/* FOOTER */}
                <div style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#999',
                    marginTop: 16,
                }}>
                    <p>Reserved to admins</p>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
