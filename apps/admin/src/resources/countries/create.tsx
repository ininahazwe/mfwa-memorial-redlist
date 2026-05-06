// ============================================
// COUNTRY CREATION - IMPROVED VERSION
// ============================================
// Geographic validation, clear messages
// Location: apps/admin/src/resources/countries/create.tsx

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Row, Col, Card, Alert, Divider, Typography } from 'antd';

const { Text } = Typography;

// ============================================
// COMPONENT
// ============================================

export const CountryCreate = () => {
    const { formProps, saveButtonProps } = useForm();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">

                <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            🌍 General Information
          </span>
                </Divider>

                {/* General Information */}
                <Card
                    type="inner"
                    style={{ marginBottom: 16, border: '1px solid #e8dcc8' }}
                >
                    <Row gutter={16}>
                        <Col span={16}>
                            {/* Country Name */}
                            <Form.Item
                                label="Country Name *"
                                name="name"
                                rules={[
                                    { required: true, message: '❌ Name is required' },
                                    { min: 2, message: '❌ At least 2 characters' },
                                ]}
                            >
                                <Input
                                    placeholder="e.g., Mali"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            {/* ISO Code */}
                            <Form.Item
                                label="ISO Code *"
                                name="code"
                                rules={[
                                    { required: true, message: '❌ Code is required' },
                                    {
                                        len: 2,
                                        message: '❌ Exactly 2 letters (e.g., ML)'
                                    },
                                    {
                                        pattern: /^[A-Z]{2}$/,
                                        message: '❌ Uppercase letters only (A-Z)',
                                    },
                                ]}
                                tooltip="ISO 3166-1 alpha-2 code"
                            >
                                <Input
                                    placeholder="ML"
                                    maxLength={2}
                                    style={{ textTransform: 'uppercase' }}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            📍 Geographic Coordinates
          </span>
                </Divider>

                {/* Coordinates Info Alert */}
                <Alert
                    message="Use Google Maps to find the coordinates of the country's center"
                    description="Format: Latitude (-90 to 90), Longitude (-180 to 180)"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                {/* Geographic Coordinates */}
                <Card
                    type="inner"
                    style={{ marginBottom: 16, border: '1px solid #e8dcc8' }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Latitude *"
                                name={['coords', 'lat']}
                                rules={[
                                    { required: true, message: '❌ Latitude is required' },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    step={0.01}
                                    placeholder="17.57"
                                    min={-90}
                                    max={90}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Longitude *"
                                name={['coords', 'lng']}
                                rules={[
                                    { required: true, message: '❌ Longitude is required' },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    step={0.01}
                                    placeholder="-4.0"
                                    min={-180}
                                    max={180}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            ⚠️ Press Context
          </span>
                </Divider>

                {/* Context and Risk */}
                <Card
                    type="inner"
                    style={{ border: '1px solid #e8dcc8' }}
                >
                    {/* Risk Level */}
                    <Form.Item
                        label="Risk Level *"
                        name="riskLevel"
                        rules={[{ required: true, message: '❌ Level is required' }]}
                    >
                        <Select
                            placeholder="Select a risk level"
                            size="large"
                            options={[
                                {
                                    value: 'high',
                                    label: '🟡 High - Frequent pressure and threats',
                                },
                                {
                                    value: 'critical',
                                    label: '🟠 Critical - Regular violence, impunity',
                                },
                                {
                                    value: 'extreme',
                                    label: '🔴 Extreme - Conflict zone, deadly danger',
                                },
                            ]}
                        />
                    </Form.Item>

                    {/* Description */}
                    <Form.Item
                        label="Context Description *"
                        name="description"
                        rules={[
                            { required: true, message: '❌ Description is required' },
                            { min: 20, message: '❌ At least 20 characters' },
                        ]}
                        extra="Describe the press freedom situation in this country"
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="e.g., Armed conflict zone since 2012. Journalists covering the northern part of the country are particularly exposed to armed groups and retaliation."
                            maxLength={1000}
                            showCount
                            size="large"
                        />
                    </Form.Item>
                </Card>

            </Form>
        </Create>
    );
};

export default CountryCreate;