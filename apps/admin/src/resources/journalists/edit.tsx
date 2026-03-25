// ============================================
// JOURNALIST EDIT — Upload local
// Location: apps/admin/src/resources/journalists/edit.tsx
// ============================================

import { Edit, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, InputNumber, Select, Switch, Upload, Button, Image, message, Alert, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const PHOTO_MAX_SIZE     = 2 * 1024 * 1024;
const ALLOWED_FORMATS    = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const API_URL            = import.meta.env.VITE_API_URL ?? 'http://localhost:4321';

export const JournalistEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm();
  const [uploading, setUploading] = useState(false);

  const journalist = queryResult?.data?.data;

  const { selectProps: countrySelectProps } = useSelect({
    resource:     'countries',
    optionLabel:  'name',
    optionValue:  'id',
    defaultValue: journalist?.countryId,
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

      message.success('✅ Photo uploadée avec succès');
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
      formProps.form?.setFieldValue('photoUrl', url);
    }
    return false;
  };

  // ============================================
  // RENDER
  // ============================================

  if (!journalist) return <div>Chargement...</div>;

  return (
      <Edit saveButtonProps={saveButtonProps} title={`Modifier : ${journalist.name}`}>
        <Form {...formProps} layout="vertical">

          {/* ====== INFORMATIONS DE BASE ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📋 Informations</span>
          </Divider>

          <Form.Item
              label="Journaliste *"
              name="name"
              rules={[
                { required: true, message: '❌ Nom requis' },
                { min: 2, message: '❌ Au moins 2 caractères' },
              ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
              label="Pays *"
              name="countryId"
              rules={[{ required: true, message: '❌ Pays requis' }]}
          >
            <Select
                {...countrySelectProps}
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
              rules={[{ required: true, message: '❌ Rôle requis' }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
              label="Année de décès *"
              name="yearOfDeath"
              rules={[{ required: true, message: '❌ Année requise' }]}
          >
            <InputNumber
                min={1900}
                max={new Date().getFullYear()}
                size="large"
                style={{ width: '100%' }}
            />
          </Form.Item>

          {/* ====== PHOTO ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📸 Portrait</span>
          </Divider>

          <Alert message="Format JPG ou PNG • Max 2 MB" type="info" showIcon style={{ marginBottom: 16 }} />

          {journalist?.photoUrl && (
              <Form.Item label="Photo actuelle">
                <Image
                    src={journalist.photoUrl}
                    alt={journalist.name}
                    width={150}
                    height={180}
                    style={{ objectFit: 'cover', borderRadius: 8, border: '2px solid #c4a77d' }}
                    preview={{ mask: 'Aperçu' }}
                />
              </Form.Item>
          )}

          <Form.Item
              label="URL de la photo *"
              name="photoUrl"
              rules={[
                { required: true, message: '❌ Photo requise' },
                { pattern: /^https?:\/\/.+/, message: '❌ URL valide requise' },
              ]}
          >
            <Input placeholder="https://..." size="large" />
          </Form.Item>

          <Form.Item label="Remplacer la photo">
            <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={beforeUpload}
                accept={ALLOWED_EXTENSIONS.join(',')}
                disabled={uploading}
            >
              <Button icon={<UploadOutlined />} loading={uploading} size="large">
                {uploading ? 'Upload en cours...' : 'Choisir une nouvelle photo'}
              </Button>
            </Upload>
          </Form.Item>

          {/* ====== DÉTAILS ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>📝 Détails</span>
          </Divider>

          <Form.Item label="Background" name="bio">
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>

          {/*<Form.Item label="Lieu du décès" name="placeOfDeath">
            <Input size="large" />
          </Form.Item>*/}

          <Form.Item label="Status" name="circumstances">
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>

          {/* ====== PUBLICATION ====== */}
          <Divider orientation="left">
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2a2a2a' }}>🔓 Publication</span>
          </Divider>

          <Form.Item
              label="Publier sur le site"
              name="isPublished"
              valuePropName="checked"
              extra="Si désactivé, le journaliste n'apparaîtra pas sur le site public"
          >
            <Switch checkedChildren="✓ Publié" unCheckedChildren="⊘ Brouillon" />
          </Form.Item>

          {journalist?.createdAt && (
              <Form.Item label="Créé le">
                <Input disabled value={new Date(journalist.createdAt).toLocaleString('fr-FR')} size="large" />
              </Form.Item>
          )}

          {journalist?.updatedAt && (
              <Form.Item label="Dernière modification">
                <Input disabled value={new Date(journalist.updatedAt).toLocaleString('fr-FR')} size="large" />
              </Form.Item>
          )}

        </Form>
      </Edit>
  );
};

export default JournalistEdit;