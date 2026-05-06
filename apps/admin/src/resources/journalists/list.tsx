import {
    List,
    useTable,
    EditButton,
    CreateButton,
} from '@refinedev/antd';
import {
    Table,
    Space,
    Image,
    Badge,
    Typography,
    Button,
    Popconfirm,
    message,
    Input,
} from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useDelete } from '@refinedev/core';
import { useEffect, useState } from 'react';

const { Text } = Typography;

export const JournalistList = () => {
    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<any[]>([]);

    // Fetch raw data
    const { tableProps } = useTable({
        syncWithLocation: true,
        pagination: {
            pageSize: 100, // Load more data for search
        },
    });

    const { mutate: deleteJournalist } = useDelete();

    // Effect to filter data when search changes
    useEffect(() => {
        if (!tableProps.dataSource) {
            setFilteredData([]);
            return;
        }

        // If no search, show all
        if (!searchTerm.trim()) {
            // @ts-ignore
            setFilteredData(tableProps.dataSource);
            return;
        }

        // Filter journalists by name, country or role
        const term = searchTerm.toLowerCase();
        const filtered = tableProps.dataSource.filter((journalist: any) => {
            const name = journalist.name?.toLowerCase() || '';
            const country = journalist.countryName?.toLowerCase() || '';
            const role = journalist.role?.toLowerCase() || '';

            return (
                name.includes(term) ||
                country.includes(term) ||
                role.includes(term)
            );
        });

        setFilteredData(filtered);
    }, [searchTerm, tableProps.dataSource]);

    // Delete handler
    const handleDelete = (id: string, name: string) => {
        deleteJournalist(
            { resource: 'journalists', id },
            {
                onSuccess: () => message.success(`✓ ${name} has been deleted`),
                onError: (error: any) => message.error(`✗ Error: ${error?.message}`),
            }
        );
    };

    return (
        <List
            headerProps={{
                extra: (
                    <Space size="middle">
                        {/* Search field */}
                        <Input
                            placeholder="Search name, country, role..."
                            prefix={<SearchOutlined style={{ color: '#c4a77d' }} />}
                            allowClear
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: 350 }}
                        />

                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {filteredData.length} / {tableProps.dataSource?.length || 0} journalists
                        </Text>
                        <CreateButton type="primary" style={{ color: "white" }} />
                    </Space>
                ),
            }}
        >
            <Table
                {...tableProps}
                dataSource={filteredData} // Use filtered data
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} journalists displayed`,
                }}
            >
                <Table.Column
                    dataIndex="photoUrl"
                    title="Photo"
                    width={70}
                    render={(value, record: any) => (
                        <Image
                            src={value}
                            alt={record.name}
                            width={50}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #e8dcc8' }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6ZAAAASklEQVR42u3QMQEAAAiDMH+/6KFfWwAA4NkLrLiNiAACCCCCgEAAAsgAgEAAAsgAgEAAAsgAgEAAAsgAgEAA/QEEEQEAJQPBjQIGESkc0QAAAAASUVORK5CYII="
                        />
                    )}
                />

                <Table.Column
                    dataIndex="name"
                    title="Name"
                    render={(value) => <Text strong style={{ color: '#2a2a2a' }}>{value}</Text>}
                    sorter={(a: any, b: any) =>
                        (a.name || '').localeCompare(b.name || '')
                    }
                />

                <Table.Column
                    dataIndex="countryName"
                    title="Country"
                    render={(value) => (
                        <Badge color="#c4a77d" text={<span style={{ color: '#666' }}>{value}</span>} />
                    )}
                    sorter={(a: any, b: any) =>
                        (a.countryName || '').localeCompare(b.countryName || '')
                    }
                />

                <Table.Column
                    dataIndex="role"
                    title="Role"
                    render={(value) => <Text type="secondary" style={{ fontSize: 12 }}>{value}</Text>}
                />

                <Table.Column
                    dataIndex="yearOfDeath"
                    title="Year"
                    width={100}
                    render={(value) => <Text strong style={{ color: '#c4a77d' }}>✦ {value}</Text>}
                    sorter={(a: any, b: any) => (a.yearOfDeath || 0) - (b.yearOfDeath || 0)}
                />

                <Table.Column
                    dataIndex="isPublished"
                    title="Status"
                    render={(value) => (
                        <Badge
                            status={value ? 'success' : 'processing'}
                            text={value ? 'Published' : 'Draft'}
                        />
                    )}
                />

                <Table.Column
                    title="Actions"
                    width={120}
                    fixed="right"
                    render={(_, record: any) => (
                        <Space size="small">
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <Popconfirm
                                title="Delete?"
                                description={`Delete ${record.name}?`}
                                onConfirm={() => handleDelete(record.id, record.name)}
                                okText="Yes"
                                cancelText="No"
                                okType="danger"
                            >
                                <Button danger type="text" size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};

export default JournalistList;