import {Tag} from 'antd';

const createUniqueFilters = (data, keyAccessor) => {
    const uniqueValues = [...new Set(data.map(keyAccessor).filter(Boolean))];
    return uniqueValues.map(value => ({
        text: value,
        value: value,
    }));
};

export const AccessProductCol = (data = []) => [
    {
        title: 'نام کاربر',
        key: 'user_name',
        dataIndex: ['user', 'id'],
        render: (_, record) => {
            const fullName = `${record.user?.name || ''} ${record.user?.last_name || ''}`.trim();
            return <Tag color={'orange'}>{fullName}</Tag>;
        },
        sorter: (a, b) => {
            const nameA = `${a.user?.name || ''} ${a.user?.last_name || ''}`;
            const nameB = `${b.user?.name || ''} ${b.user?.last_name || ''}`;
            return nameA.localeCompare(nameB, 'fa'); // 'fa' for correct Persian sorting
        },
        filters: createUniqueFilters(data, record => `${record.user?.name || ''} ${record.user?.last_name || ''}`.trim()),
        onFilter: (value, record) => {
            const fullName = `${record.user?.name || ''} ${record.user?.last_name || ''}`.trim();
            return fullName === value;

        },
    },
    {
        title: 'نقش',
        key: 'role_name',
        dataIndex: ['role', 'name'],
        render: (_, record) => {
            return <Tag color={'blue'}>{record.role?.name || 'ندارد'}</Tag>;
        },
        sorter: (a, b) => (a.role?.name || '').localeCompare(b.role?.name || '', 'fa'),
        filters: createUniqueFilters(data, record => record.role?.name),
        onFilter: (value, record) => (record.role?.name || '') === value,
    },
    {
        title: 'نام محصول',
        key: 'persian_title',
        dataIndex: ['product', 'persian_title'],
        render: (_, record) => {
            return <Tag color={'purple'}>{record.product?.persian_title || ''}</Tag>;
        },
        sorter: (a, b) => (a.product?.persian_title || '').localeCompare(b.product?.persian_title || '', 'fa'),
        filters: createUniqueFilters(data, record => record.product?.persian_title),
        onFilter: (value, record) => (record.product?.persian_title || '') === value,
        
    }
];