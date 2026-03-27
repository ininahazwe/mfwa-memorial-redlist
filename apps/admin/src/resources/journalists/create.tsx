// ============================================
// JOURNALIST CREATION — Upload local
// Location: apps/admin/src/resources/journalists/create.tsx
// ============================================

import { Create, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, InputNumber, Select, Switch, Upload, Button, message, Alert, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const PHOTO_MAX_SIZE      = 2 * 1024 * 1024;
const ALLOWED_FORMATS     = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS  = ['.jpg', '.jpeg', '.png'];
const API_URL             = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const JournalistCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const [uploading, setUploading]     = useState(false);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);

  const { selectProps: countrySelectProps } = useSelect({
    resource:    'countries',
    optionLabel: 'name',
    optionValue: 'id',
  });

  // ============================================
  // UPLOAD LOCAL via /api/upload
  // ============================================

  const CLOUDINARY_CLOUD = 'dv8nrv6zt';
  const CLOUDINARY_PRESET = 'memorial_upload'; // on va créer ça

  const handleUpload = async (file: File): Promise<string | null> => {
    if (file.size > PHOTO_MAX_SIZE) {
      message.error('❌ La photo ne doit pas dépasser 2 MB');
      return null;
    }
    if (!ALLOWED_FORMATS.includes(file.type)) {
      message.error('❌ Format accepté : JPG ou PNG uniquement');
      return null;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
          { method: 'POST', body: formData }
      );

      const json = await res.json();

      if (!res.ok) {
        message.error(`❌ ${json.error?.message}`);
        return null;
      }

      message.success('✅ Photo uploaded successfully');
      return json.secure_url;

    } catch (error: any) {
      message.error(`❌ Erreur upload : ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = async (file: File) => {
    const url = await handleUpload(file);
    if (url) {
      setPreviewUrl(url);
      formProps.form?.setFieldValue('photoUrl', url);
    }
    return false;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">

          {/* ====== INFORMATIONS DE BASE ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📋 Information</span>
          </Divider>

          <Form.Item
              label="Journalist *"
              name="name"
              rules={[
                { required: true, message: '❌ Required' },
                { min: 2, message: '❌ At least 2 characters' },
              ]}
          >
            <Input placeholder="Ex: Amadou Diallo" size="large" />
          </Form.Item>

          <Form.Item
              label="Countries *"
              name="countryId"
              rules={[{ required: true, message: '❌ Required' }]}
          >
            <Select
                {...countrySelectProps}
                placeholder="Select a country"
                size="large"
                onChange={(value, option: any) => {
                  formProps.form?.setFieldValue('countryName', option?.label);
                }}
            />
          </Form.Item>

          <Form.Item name="countryName" hidden>
            <Input />
          </Form.Item>

          <Form.Item
              label="Situation *"
              name="role"
              rules={[{ required: true, message: '❌ required' }]}
          >
            <Input placeholder="Ex: Reporter" size="large" />
          </Form.Item>

          <Form.Item
              label="Year of death *"
              name="yearOfDeath"
              rules={[{ required: true, message: '❌ Required' }]}
          >
            <InputNumber
                min={1900}
                max={new Date().getFullYear()}
                placeholder="Ex: 2023"
                size="large"
                style={{ width: '100%' }}
            />
          </Form.Item>

          {/* ====== PHOTO ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📸 Portrait</span>
          </Divider>

          <Alert message="Format JPG ou PNG • Max 2 MB" type="info" showIcon style={{ marginBottom: 16 }} />

          <Form.Item
              label="URL de la photo *"
              name="photoUrl"
              rules={[
                { required: true, message: '❌ required' },
                { pattern: /^https?:\/\/.+/, message: '❌ URL valide requise (http(s)://...)' },
              ]}
              extra="Saisissez une URL ou uploadez une image ci-dessous"
          >
            <Input placeholder="https://..." size="large" />
          </Form.Item>

          <Form.Item label="Upload a picture">
            <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={beforeUpload}
                accept={ALLOWED_EXTENSIONS.join(',')}
                disabled={uploading}
            >
              <Button icon={<UploadOutlined />} loading={uploading} size="large">
                {uploading ? 'Uploading...' : 'Choose a picture'}
              </Button>
            </Upload>
          </Form.Item>

          {previewUrl && (
              <div style={{ marginBottom: 16 }}>
                <img
                    src={previewUrl}
                    alt="Aperçu"
                    style={{
                      maxWidth: 150,
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid #c4a77d',
                    }}
                />
              </div>
          )}

          {/* ====== DÉTAILS ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📝 Détails</span>
          </Divider>

          <Form.Item label="Background" name="bio" extra="Parcours professionnel, médias...">
            <Input.TextArea rows={3} placeholder="Max 1000 caractères" maxLength={1000} showCount />
          </Form.Item>

          <Form.Item label="Place of death" name="placeOfDeath">
            <Input placeholder="Ex: Tombouctou, Mali" size="large" />
          </Form.Item>

          <Form.Item label="Circumstances" name="circumstances" extra="Statut du dossier">
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>

          {/* ====== PUBLICATION ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>🔓 Publication</span>
          </Divider>

          <Form.Item
              label="Publish"
              name="isPublished"
              valuePropName="checked"
              initialValue={false}
              extra="If activated, the journalist will appear on the website"
          >
            <Switch checkedChildren="✓ Published" unCheckedChildren="⊘ Draft" />
          </Form.Item>

        </Form>
      </Create>
  );
};

export default JournalistCreate;