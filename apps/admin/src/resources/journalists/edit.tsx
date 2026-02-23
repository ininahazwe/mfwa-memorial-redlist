// ============================================
// JOURNALIST EDIT – IMPROVED VERSION
// ============================================
// Photo preview, replacement upload, deletion confirmation
// Location: apps/admin/src/resources/journalists/edit.tsx

import { Edit, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, InputNumber, Select, Switch, Upload, Button, Image, message, Alert, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase.ts';
import { useState } from 'react';

// ============================================
// UPLOAD CONFIGURATION
// ============================================

const PHOTO_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// ============================================
// COMPONENT
// ============================================

export const JournalistEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const [uploading, setUploading] = useState(false);

  // Current journalist data
  const journalist = queryResult?.data?.data;

  // Retrieve the list of countries for the select
  const { selectProps: countrySelectProps } = useSelect({
    resource: 'countries',
    optionLabel: 'name',
    optionValue: 'id',
    defaultValue: journalist?.countryId,
  });

  // ============================================
  // PHOTO UPLOAD
  // ============================================

  const handleUpload = async (file: File): Promise<string | null> => {
    // 1. Check file size
    if (file.size > PHOTO_MAX_SIZE) {
      message.error('❌ The photo must not exceed 2 MB');
      return null;
    }

    // 2. Check file format
    if (!ALLOWED_FORMATS.includes(file.type)) {
      message.error('❌ Accepted format: JPG or PNG only');
      return null;
    }

    // 3. Upload
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `journalists/${fileName}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      message.success('✅ Photo uploaded successfully');
      return url;
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(`❌ Error during upload: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Before upload – local validation
  const beforeUpload = async (file: File) => {
    const url = await handleUpload(file);

    if (url) {
      formProps.form?.setFieldValue('photoUrl', url);
    }

    return false; // Prevent Ant Design automatic upload
  };

  // ============================================
  // RENDER
  // ============================================

  if (!journalist) {
    return <div>Loading...</div>;
  }

  return (
      <Edit saveButtonProps={saveButtonProps} title={`Edit: ${journalist.name}`}>
        <Form {...formProps} layout="vertical">
          {/* ====== SECTION 1: BASIC INFORMATION ====== */}
          <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            📋 Basic information
          </span>
          </Divider>

          {/* Full name */}
          <Form.Item
              label="Journalist *"
              name="name"
              rules={[
                { required: true, message: '❌ Name is required' },
                { min: 2, message: '❌ At least 2 characters' },
              ]}
          >
            <Input size="large" />
          </Form.Item>

          {/* Country */}
          <Form.Item
              label="Country *"
              name="countryId"
              rules={[{ required: true, message: '❌ Country is required' }]}
          >
            <Select
                {...countrySelectProps}
                size="large"
                onChange={(value, option: any) => {
                  formProps.form?.setFieldValue('countryName', option?.label);
                }}
            />
          </Form.Item>

          {/* Hidden field for countryName */}
          <Form.Item name="countryName" hidden>
            <Input />
          </Form.Item>

          {/* Role / Position */}
          <Form.Item
              label="Situation *"
              name="role"
              rules={[{ required: true, message: '❌ Role is required' }]}
          >
            <Input size="large" />
          </Form.Item>

          {/* Year of death */}
          <Form.Item
              label="Year of death *"
              name="yearOfDeath"
              rules={[{ required: true, message: '❌ Year is required' }]}
          >
            <InputNumber
                min={1900}
                max={new Date().getFullYear()}
                size="large"
                style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            📸 Portrait photo
          </span>
          </Divider>

          {/* Photo info alert */}
          <Alert message="JPG or PNG format • Max 2 MB" type="info" showIcon style={{ marginBottom: 16 }} />

          {/* Current photo – preview */}
          {journalist?.photoUrl && (
              <Form.Item label="Current photo">
                <div style={{ marginBottom: 16 }}>
                  <Image
                      src={journalist.photoUrl}
                      alt={journalist.name}
                      width={150}
                      height={180}
                      style={{
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '2px solid #c4a77d',
                      }}
                      preview={{
                        mask: 'Preview',
                      }}
                  />
                </div>
              </Form.Item>
          )}

          {/* Photo URL */}
          <Form.Item
              label="Photo URL *"
              name="photoUrl"
              rules={[
                { required: true, message: '❌ Photo is required' },
                {
                  pattern: /^https?:\/\/.+/,
                  message: '❌ Valid URL required',
                },
              ]}
          >
            <Input placeholder="https://..." size="large" />
          </Form.Item>

          {/* Upload new photo */}
          <Form.Item label="Replace photo">
            <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={beforeUpload}
                accept={ALLOWED_EXTENSIONS.join(',')}
                disabled={uploading}
            >
              <Button icon={<UploadOutlined />} loading={uploading} size="large">
                {uploading ? 'Uploading...' : 'Choose a new photo'}
              </Button>
            </Upload>
          </Form.Item>

          <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            📝 Additional details
          </span>
          </Divider>

          {/* Biography */}
          <Form.Item label="Background" name="bio">
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>

          {/* Place of death */}
          <Form.Item label="Place of death" name="placeOfDeath">
            <Input size="large" />
          </Form.Item>

          {/* Circumstances */}
          <Form.Item label="Status" name="circumstances">
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>

          <Divider orientation="left">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>
            🔓 Publication
          </span>
          </Divider>

          {/* Publication status */}
          <Form.Item
              label="Publish on the site"
              name="isPublished"
              valuePropName="checked"
              extra="If disabled, the journalist will not appear on the public site"
          >
            <Switch checkedChildren="✓ Published" unCheckedChildren="⊘ Draft" />
          </Form.Item>

          {/* Dates */}
          {journalist?.createdAt && (
              <Form.Item label="Created on">
                <Input disabled value={new Date(journalist.createdAt).toLocaleString('en-US')} size="large" />
              </Form.Item>
          )}

          {journalist?.updatedAt && (
              <Form.Item label="Last updated">
                <Input disabled value={new Date(journalist.updatedAt).toLocaleString('en-US')} size="large" />
              </Form.Item>
          )}
        </Form>
      </Edit>
  );
};

export default JournalistEdit;
