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
import { useDelete, HttpError } from '@refinedev/core';
import { useState, useEffect } from 'react';

const { Text } = Typography;

// Interface pour typer vos données (optionnel mais recommandé)
interface IJournalist {
    id: string;
    name: string;
    countryName: string;
    role: string;
    photoUrl: string;
    yearOfDeath: number;
    isPublished: boolean;
}

export const JournalistList = () => {
    // État local uniquement pour l'affichage de l'input
    const [searchValue, setSearchValue] = useState<string>("");

    const { tableProps, setFilters, filters } = useTable<IJournalist, HttpError>({
        syncWithLocation: true, // Crucial pour le retour à la page initiale
        pagination: {
            pageSize: 10,
        },
        sorters: {
            initial: [
                {
                    field: "name",
                    order: "asc",
                },
            ],
        },
    });

    const { mutate: deleteJournalist } = useDelete();

    // Synchroniser l'input si l'URL contient déjà un filtre au chargement
    useEffect(() => {
        const searchFilter = filters.find((f: any) => f.field === "q" || f.field === "name");
        if (searchFilter && 'value' in searchFilter) {
            setSearchValue(searchFilter.value);
        }
    }, [filters]);

    // Gestion de la recherche via Refine (impacte l'URL)
    const handleSearch = (value: string) => {
        setSearchValue(value);
        setFilters([
            {
                field: "name", // Ou "q" pour une recherche globale selon votre API
                operator: "contains",
                value: value || undefined,
            },
        ]);
    };

    // Handler de suppression
    const handleDelete = (id: string, name: string) => {
        deleteJournalist(
            { resource: 'journalists', id },
            {
                onSuccess: () => message.success(`✓ ${name} a été supprimé`),
                onError: (error) => message.error(`✗ Erreur: ${error?.message}`),
            }
        );
    };

    return (
        <List
            headerProps={{
                extra: (
                    <Space size="middle">
                        <Input
                            placeholder="Rechercher un nom, pays..."
                            prefix={<SearchOutlined style={{ color: '#c4a77d' }} />}
                            allowClear
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: 350 }}
                        />

                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Total : {
                            typeof tableProps.pagination !== "boolean"
                                ? tableProps.pagination?.total
                                : 0
                        } journalistes
                        </Text>
                        <CreateButton type="primary" style={{ color: "white" }} />
                    </Space>
                ),
            }}
        >
            <Table
                {...tableProps}
                rowKey="id"
                pagination={{
                    ...tableProps.pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `${total} journalistes au total`,
                }}
            >
                <Table.Column
                    dataIndex="photoUrl"
                    title="Photo"
                    width={70}
                    render={(value, record: IJournalist) => (
                        <Image
                            src={value}
                            alt={record.name}
                            width={50}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #e8dcc8' }}
                            fallback="https://via.placeholder.com/50x60?text=N/A"
                        />
                    )}
                />

                <Table.Column
                    dataIndex="name"
                    title="Nom"
                    render={(value) => <Text strong style={{ color: '#2a2a2a' }}>{value}</Text>}
                    sorter
                />

                <Table.Column
                    dataIndex="countryName"
                    title="Pays"
                    render={(value) => (
                        <Badge color="#c4a77d" text={<span style={{ color: '#666' }}>{value}</span>} />
                    )}
                    sorter
                />

                <Table.Column
                    dataIndex="role"
                    title="Rôle"
                    render={(value) => <Text type="secondary" style={{ fontSize: 12 }}>{value}</Text>}
                />

                <Table.Column
                    dataIndex="yearOfDeath"
                    title="Année"
                    width={100}
                    render={(value) => <Text strong style={{ color: '#c4a77d' }}>✦ {value}</Text>}
                    sorter
                />

                <Table.Column
                    dataIndex="isPublished"
                    title="Statut"
                    render={(value) => (
                        <Badge
                            status={value ? 'success' : 'processing'}
                            text={value ? 'Publié' : 'Brouillon'}
                        />
                    )}
                />

                <Table.Column
                    title="Actions"
                    width={120}
                    fixed="right"
                    render={(_, record: IJournalist) => (
                        <Space size="small">
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <Popconfirm
                                title="Supprimer ?"
                                description={`Supprimer ${record.name} ?`}
                                onConfirm={() => handleDelete(record.id, record.name)}
                                okText="Oui"
                                cancelText="Non"
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