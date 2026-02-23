// ============================================
// COUNTRY LIST - IMPROVED VERSION
// ============================================
// Table with filters, actions, light theme styles
// Location: apps/admin/src/resources/countries/list.tsx

import {
    List,
    useTable,
    EditButton,
    DeleteButton,
    CreateButton,
} from '@refinedev/antd';
import { Table, Space, Badge, Typography, Button, Popconfirm, message, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDelete } from '@refinedev/core';

const { Text } = Typography;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Colors by risk level
const riskConfig: Record<string, { color: string; label: string; emoji: string }> = {
    high: { color: 'gold', label: 'High', emoji: '🟡' },
    critical: { color: 'orange', label: 'Critical', emoji: '🟠' },
    extreme: { color: 'red', label: 'Extreme', emoji: '🔴' },
};

// ============================================
// COMPONENT
// ============================================

export const CountryList = () => {
    const { tableProps, filters } = useTable({
        syncWithLocation: true,
    });

    const { mutate: deleteCountry } = useDelete();

    // Handle deletion with confirmation
    const handleDelete = (id: string, name: string) => {
        deleteCountry(
            { resource: 'countries', id },
            {
                onSuccess: () => {
                    message.success(`✅ ${name} has been deleted`);
                },
                onError: (error: any) => {
                    message.error(`❌ Error: ${error?.message || 'Unable to delete'}`);
                },
            }
        );
    };

    return (
        <List
            headerProps={{
                extra: (
                    <Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {tableProps.dataSource?.length || 0} countries
                        </Text>
                        <CreateButton type="primary" style={{ color: "white" }}/>
                    </Space>
                ),
            }}
        >
            <Table
                {...tableProps}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} countries`,
                }}
            >

                {/* Country Name */}
                <Table.Column
                    dataIndex="name"
                    title="Country"
                    width={140}
                    render={(value) => (
                        <Text strong style={{ color: '#2a2a2a' }}>
                            {value}
                        </Text>
                    )}
                    sorter={(a: any, b: any) => (a.name || '').localeCompare(b.name || '')}
                />

                {/* ISO Code */}
                <Table.Column
                    dataIndex="code"
                    title="ISO Code"
                    width={90}
                    render={(value) => (
                        <Tag
                            style={{
                                backgroundColor: '#f5f5f0',
                                color: '#2a2a2a',
                                border: '1px solid #e8dcc8',
                                fontSize: 11,
                            }}
                        >
                            {value}
                        </Tag>
                    )}
                    sorter={(a: any, b: any) => (a.code || '').localeCompare(b.code || '')}
                />

                {/* Coordinates */}
                <Table.Column
                    dataIndex="coords"
                    title="Position"
                    width={120}
                    render={(value) => (
                        value ? (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                {value.lat.toFixed(2)}, {value.lng.toFixed(2)}
                            </Text>
                        ) : (
                            <Text type="danger">-</Text>
                        )
                    )}
                />

                {/* Risk Level */}
                <Table.Column
                    dataIndex="riskLevel"
                    title="Risk Level"
                    width={140}
                    render={(value) => {
                        const config = riskConfig[value] || { color: 'default', label: 'Unknown', emoji: '❓' };
                        return (
                            <Badge
                                color={config.color}
                                text={<span style={{ fontSize: 12 }}>{config.emoji} {config.label}</span>}
                            />
                        );
                    }}
                    filters={[
                        { text: '🟡 High', value: 'high' },
                        { text: '🟠 Critical', value: 'critical' },
                        { text: '🔴 Extreme', value: 'extreme' },
                    ]}
                    onFilter={(value, record: any) => record.riskLevel === value}
                />

                {/* Description (truncated) */}
                <Table.Column
                    dataIndex="description"
                    title="Description"
                    ellipsis
                    render={(value) => (
                        <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                            ellipsis={{ tooltip: value }}
                        >
                            {value?.substring(0, 50)}...
                        </Text>
                    )}
                />

                {/* Actions */}
                <Table.Column
                    title="Actions"
                    width={100}
                    fixed="right"
                    render={(_, record: any) => (
                        <Space size="small">
                            <EditButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                                title="Edit"
                            />

                            <Popconfirm
                                title="Delete?"
                                description={`Are you sure you want to delete ${record.name}? Associated journalists will not be deleted.`}
                                okText="Yes, delete"
                                cancelText="Cancel"
                                okType="danger"
                                onConfirm={() => handleDelete(record.id, record.name)}
                            >
                                <Button
                                    danger
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    title="Delete"
                                />
                            </Popconfirm>
                        </Space>
                    )}
                />

            </Table>
        </List>
    );
};

export default CountryList;