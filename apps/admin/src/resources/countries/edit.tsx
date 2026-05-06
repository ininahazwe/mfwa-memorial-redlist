// ============================================
// EDIT A COUNTRY - IMPROVED VERSION
// ============================================
// Preview coordinates, ISO validation
// Location: apps/admin/src/resources/countries/edit.tsx

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Row, Col, Card, Alert, Divider, Typography } from 'antd';

const { Text } = Typography;

// ============================================
// COMPONENT
// ============================================

export const CountryEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();

  // Current country data
  const country = queryResult?.data?.data;

  return (
      <Edit
          saveButtonProps={saveButtonProps}
          title={country?.name ? `Edit: ${country.name}` : 'Edit a country'}
      >
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
                    label="Name *"
                    name="name"
                    rules={[
                      { required: true, message: '❌ Name is required' },
                      { min: 2, message: '❌ At least 2 characters' },
                    ]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>

              <Col span={8}>
                {/* ISO Code */}
                <Form.Item
                    label="ISO Code *"
                    name="code"
                    rules={[
                      { required: false, message: '❌ Code is required' },
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
                      min={-180}
                      max={180}
                      size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Display current coordinates */}
            {country?.coords && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f5f5f0',
                  borderRadius: 6,
                  border: '1px solid #e8dcc8',
                }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    📍 Current position: <strong>{country.coords.lat.toFixed(4)}</strong>, <strong>{country.coords.lng.toFixed(4)}</strong>
                  </Text>
                </div>
            )}
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
                  { required: false, message: '❌ Description is required' },
                  { min: 20, message: '❌ At least 20 characters' },
                ]}
            >
              <Input.TextArea
                  rows={4}
                  maxLength={1000}
                  showCount
                  size="large"
              />
            </Form.Item>
          </Card>

          {/* Metadata */}
          <Divider orientation="left">
          <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>
            ℹ️ Metadata
          </span>
          </Divider>

          {country?.createdAt && (
              <Form.Item label="Created on">
                <Input
                    disabled
                    value={new Date(country.createdAt).toLocaleString('en-US')}
                    size="large"
                />
              </Form.Item>
          )}

          {country?.updatedAt && (
              <Form.Item label="Last updated">
                <Input
                    disabled
                    value={new Date(country.updatedAt).toLocaleString('en-US')}
                    size="large"
                />
              </Form.Item>
          )}

        </Form>
      </Edit>
  );
};

export default CountryEdit;