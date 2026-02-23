// ============================================
// ÉDITION D'UN PAYS - VERSION AMÉLIORÉE
// ============================================
// Preview coordonnées, validation ISO
// Location: apps/admin/src/resources/countries/edit.tsx

import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select, InputNumber, Row, Col, Card, Alert, Divider, Typography } from 'antd';

const { Text } = Typography;

// ============================================
// COMPOSANT
// ============================================

export const CountryEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  
  // Données actuelles du pays
  const country = queryResult?.data?.data;

  return (
    <Edit 
      saveButtonProps={saveButtonProps}
      title={country?.name ? `Edit : ${country.name}` : 'Edit a country'}
    >
      <Form {...formProps} layout="vertical">
        
        <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            🌍 General infos
          </span>
        </Divider>

        {/* Informations générales */}
        <Card 
          type="inner"
          style={{ marginBottom: 16, border: '1px solid #e8dcc8' }}
        >
          <Row gutter={16}>
            <Col span={16}>
              {/* Nom du pays */}
              <Form.Item
                label="Name *"
                name="name"
                rules={[
                  { required: true, message: '❌ The name is required' },
                  { min: 2, message: '❌ 2 caracters at least' },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              {/* Code ISO */}
              <Form.Item
                label="Code ISO *"
                name="code"
                rules={[
                  { required: true, message: '❌ The code is required' },
                  { 
                    len: 2, 
                    message: '❌ 2 letters only'
                  },
                  {
                    pattern: /^[A-Z]{2}$/,
                    message: '❌ Capital letters only',
                  },
                ]}
                tooltip="Code ISO 3166-1 alpha-2"
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
            📍 Location
          </span>
        </Divider>

        {/* Alert info coordonnées */}
        <Alert
          message="Edit country location"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Coordonnées géographiques */}
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
                  { required: true, message: '❌ La latitude est requise' },
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
                  { required: true, message: '❌ La longitude est requise' },
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
          
          {/* Affichage des coordonnées actuelles */}
          {country?.coords && (
            <div style={{ 
              padding: '12px 16px',
              backgroundColor: '#f5f5f0',
              borderRadius: 6,
              border: '1px solid #e8dcc8',
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                📍 Position actuelle : <strong>{country.coords.lat.toFixed(4)}</strong>, <strong>{country.coords.lng.toFixed(4)}</strong>
              </Text>
            </div>
          )}
        </Card>

        <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            ⚠️ Contexte de la presse
          </span>
        </Divider>

        {/* Contexte et risque */}
        <Card 
          type="inner"
          style={{ border: '1px solid #e8dcc8' }}
        >
          {/* Niveau de risque */}
          <Form.Item
            label="Niveau de risque *"
            name="riskLevel"
            rules={[{ required: true, message: '❌ The risk is required' }]}
          >
            <Select 
              size="large"
              options={[
                { 
                  value: 'high',
                  label: '🟡 Élevé - Pressions et menaces fréquentes',
                },
                { 
                  value: 'critical',
                  label: '🟠 Critique - Violences régulières, impunité',
                },
                { 
                  value: 'extreme',
                  label: '🔴 Extrême - Zone de conflit, danger mortel',
                },
              ]}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description du contexte *"
            name="description"
            rules={[
              { required: true, message: '❌ La description est requise' },
              { min: 20, message: '❌ Au minimum 20 caractères' },
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

        {/* Dates */}
        <Divider orientation="left">
          <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>
            ℹ️ Métadonnées
          </span>
        </Divider>

        {country?.createdAt && (
          <Form.Item label="Créé le">
            <Input
              disabled
              value={new Date(country.createdAt).toLocaleString('fr-FR')}
              size="large"
            />
          </Form.Item>
        )}

        {country?.updatedAt && (
          <Form.Item label="Las edit">
            <Input
              disabled
              value={new Date(country.updatedAt).toLocaleString('en-EN')}
              size="large"
            />
          </Form.Item>
        )}

      </Form>
    </Edit>
  );
};

export default CountryEdit;