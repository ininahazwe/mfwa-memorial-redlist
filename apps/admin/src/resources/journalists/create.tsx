// ============================================
// JOURNALIST CREATION — Default Avatar URL
// Location: apps/admin/src/resources/journalists/create.tsx
// ============================================

import { Create, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, InputNumber, Select, Switch, Upload, Button, message, Alert, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const PHOTO_MAX_SIZE      = 2 * 1024 * 1024;
const ALLOWED_FORMATS     = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS  = ['.jpg', '.jpeg', '.png'];
const API_URL             = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ============================================
// DEFAULT AVATAR URL
// ============================================
const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/dv8nrv6zt/image/upload/v1778796621/piafepppvt93mvqdn3xq.png';

export const JournalistCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const [uploading, setUploading]     = useState(false);
  const [previewUrl, setPreviewUrl]   = useState<string>(DEFAULT_AVATAR_URL);

  const { selectProps: countrySelectProps } = useSelect({
    resource:    'countries',
    optionLabel: 'name',
    optionValue: 'id',
  });

  // ============================================
  // EFFECT : Initialiser photoUrl au montage du formulaire
  // ============================================
  useEffect(() => {
    formProps.form?.setFieldValue('photoUrl', DEFAULT_AVATAR_URL);
  }, [formProps.form]);

  // ============================================
  // UPLOAD VIA CLOUDINARY (optionnel, pour remplacer l'avatar)
  // ============================================

  const CLOUDINARY_CLOUD = 'dv8nrv6zt';
  const CLOUDINARY_PRESET = 'memorial_upload';

  const handleUpload = async (file: File): Promise<string | null> => {
    if (file.size > PHOTO_MAX_SIZE) {
      message.error('❌ Photo must not exceed 2 MB');
      return null;
    }
    if (!ALLOWED_FORMATS.includes(file.type)) {
      message.error('❌ Only JPG or PNG formats accepted');
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
      message.error(`❌ Upload error: ${error.message}`);
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

          {/* ====== GENERAL INFORMATION ====== */}
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
            <Input placeholder="e.g., Amadou Diallo" size="large" />
          </Form.Item>

          <Form.Item
              label="Country *"
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
              label="Role *"
              name="role"
              rules={[{ required: true, message: '❌ Required' }]}
          >
            <Input placeholder="e.g., Reporter" size="large" />
          </Form.Item>

          <Form.Item
              label="Year of death *"
              name="yearOfDeath"
              rules={[{ required: true, message: '❌ Required' }]}
          >
            <InputNumber
                min={1900}
                max={new Date().getFullYear()}
                placeholder="e.g., 2023"
                size="large"
                style={{ width: '100%' }}
            />
          </Form.Item>

          {/* ====== PORTRAIT (DEFAULT AVATAR) ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📸 Portrait</span>
          </Divider>

          <Alert
              message="Format JPG or PNG • Max 2 MB. Default avatar assigned automatically."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
          />

          <Form.Item
              label="Photo URL *"
              name="photoUrl"
              rules={[
                { required: true, message: '❌ Required' },
                { pattern: /^https?:\/\/.+/, message: '❌ Valid URL required (http(s)://...)' },
              ]}
              extra="Modify the URL or upload a custom photo below"
          >
            <Input placeholder="https://..." size="large" />
          </Form.Item>

          {/* Preview de l'avatar */}
          {previewUrl && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 8 }}>
                  Preview:
                </p>
                <img
                    src={previewUrl}
                    alt="Avatar preview"
                    style={{
                      maxWidth: 150,
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid #c4a77d',
                    }}
                    onError={() => setPreviewUrl(DEFAULT_AVATAR_URL)}
                />
              </div>
          )}

          {/* Upload custom photo (optional) */}
          <Form.Item label="Upload a custom photo (optional)">
            <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={beforeUpload}
                accept={ALLOWED_EXTENSIONS.join(',')}
                disabled={uploading}
            >
              <Button icon={<UploadOutlined />} loading={uploading} size="large">
                {uploading ? 'Uploading...' : 'Choose a photo'}
              </Button>
            </Upload>
          </Form.Item>

          {/* ====== DETAILS ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📝 Details</span>
          </Divider>

          <Form.Item label="Background" name="bio" extra="Professional background, media outlet...">
            <Input.TextArea rows={3} placeholder="Max 2000 characters" maxLength={2000} showCount />
          </Form.Item>

          {/*<Form.Item label="Place of death" name="placeOfDeath">
            <Input placeholder="e.g., Timbuktu, Mali" size="large" />
          </Form.Item>*/}

          <Form.Item label="Status" name="circumstances" extra="Case status">
            <Input.TextArea rows={3} maxLength={2000} showCount />
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