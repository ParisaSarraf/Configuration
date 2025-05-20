import { Button, Card, List, Space } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';

const CTransfer = ({
    leftDataSource = [],
    rightDataSource = [],
    onChange,
    onSelectLeftChange,
    onSelectRightChange,
    selectedLeftKeys = [],
    selectedRightKeys = [],
    leftTitle = 'لیست منابع',
    rightTitle = 'لیست انتخاب‌ها',
    showSelectAll = true,
    onAdd,
    onDelete,
    style,
    className
}) => {
    const handleLeftSelect = (key) => {
        if (selectedLeftKeys.includes(key)) {
            onSelectLeftChange(selectedLeftKeys.filter((k) => k !== key));
        } else {
            onSelectLeftChange([...selectedLeftKeys, key]);
        }
    };

    const handleRightSelect = (key) => {
        if (selectedRightKeys.includes(key)) {
            onSelectRightChange(selectedRightKeys.filter((k) => k !== key));
        } else {
            onSelectRightChange([...selectedRightKeys, key]);
        }
    };

    return (
        <div className={`custom-transfer ${className || ''}`} style={style}>
            <div
                className="transfer-content"
                style={{
                    display: 'flex',
                    height: '100%',
                    gap: '16px',
                    alignItems: 'center',
                }}
            >

                <Card title={rightTitle} style={{ flex: 1, height: '100%' }}>
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
                                    padding: '8px',
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
                        icon={< RightOutlined />}
                        onClick={onAdd}
                        disabled={selectedLeftKeys.length === 0}
                    />
                    <Button
                        type="primary"
                        icon={< LeftOutlined />}
                        onClick={onDelete}
                        disabled={selectedRightKeys.length === 0}
                    />
                </Space>


                <Card title={leftTitle} style={{ flex: 1, height: '100%' }}>
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
                                    opacity: item.disabled ? 0.5 : 1,
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
