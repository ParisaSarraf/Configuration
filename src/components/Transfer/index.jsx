import { Button, Card, List, Space } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const CTransfer = ({
    leftDataSource = [],
    rightDataSource = [],
    selectedLeftKeys = [],
    selectedRightKeys = [],
    onChange,
    onSelectLeftChange,
    onSelectRightChange,
    leftTitle = 'لیست منابع',
    rightTitle = 'لیست انتخاب‌ها',
    showSelectAll = true,
    style,
    className
}) => {
    const handleAdd = () => {
        const itemsToMove = leftDataSource.filter(item =>
            selectedLeftKeys.includes(item.key) && !item.disabled
        );
        const newRightData = [...rightDataSource, ...itemsToMove];
        onChange(newRightData);
        onSelectLeftChange([]);
    };

    const handleDelete = () => {
        const newRightData = rightDataSource.filter(item =>
            !selectedRightKeys.includes(item.key)
        );
        onChange(newRightData);
        onSelectRightChange([]);
    };

    const handleLeftSelect = (key) => {
        const newSelectedKeys = selectedLeftKeys.includes(key)
            ? selectedLeftKeys.filter(k => k !== key)
            : [...selectedLeftKeys, key];
        onSelectLeftChange(newSelectedKeys);
    };

    const handleRightSelect = (key) => {
        const newSelectedKeys = selectedRightKeys.includes(key)
            ? selectedRightKeys.filter(k => k !== key)
            : [...selectedRightKeys, key];
        onSelectRightChange(newSelectedKeys);
    };

    return (
        <div className={`custom-transfer ${className}`} style={style}>
            <div className="transfer-content" style={{
                display: 'flex',
                height: '100%',
                gap: '16px',
                alignItems: 'center'
            }}>
                <Card
                    title={leftTitle}
                    style={{ flex: 1, height: '100%' }}
                    headStyle={{ textAlign: 'right' }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={leftDataSource}
                        rowKey="key"
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => !item.disabled && handleLeftSelect(item.key)}
                                style={{
                                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                                    backgroundColor: selectedLeftKeys.includes(item.key)
                                        ? '#e6f7ff'
                                        : 'transparent',
                                    padding: '8px',
                                    opacity: item.disabled ? 0.5 : 1
                                }}
                            >
                                <List.Item.Meta
                                    title={item.title}
                                    description={item.description}
                                />
                            </List.Item>
                        )}
                    />
                </Card>

                <Space direction="vertical">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        disabled={selectedLeftKeys.length === 0}
                    />
                    <Button
                        type="primary"
                        icon={< DeleteOutlined />}
                        onClick={handleDelete}
                        disabled={selectedRightKeys.length === 0}
                    />
                </Space>

                <Card
                    title={rightTitle}
                    style={{ flex: 1, height: '100%' }}
                    headStyle={{ textAlign: 'right' }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={rightDataSource}
                        rowKey="key"
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => handleRightSelect(item.key)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: selectedRightKeys.includes(item.key)
                                        ? '#e6f7ff'
                                        : 'transparent',
                                    padding: '8px'
                                }}
                            >
                                <List.Item.Meta
                                    title={item.title}
                                    description={item.description}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </div>
        </div>
    );
};

export default CTransfer;