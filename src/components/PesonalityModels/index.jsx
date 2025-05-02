import { Form, Select, Spin, message, Tag, Row, Col } from "antd";
import { useState } from "react";
import { usePersonalityProductList } from "../../QueryServises/personalityQuery";

const PersonalityModels = ({ showAlongside = false, value }) => {
    const { data: personalityData, isLoading } = usePersonalityProductList();
    const [selectedType, setSelectedType] = useState(value?.personality_type || null);
    const [selectedItems, setSelectedItems] = useState(
        value?.product_personalities?.map(p => p.personality.id) || []
    );

    const typeOptions = [
        { value: 'made', label: 'ساخت' },
        { value: 'standard', label: 'استاندارد' },
        { value: 'non-standard', label: 'غیراستاندارد' },
    ];

    const flattenTreeWithHierarchy = (items, parentNames = []) => {
        return items.reduce((acc, item) => {
            const currentPath = [...parentNames, item.name];
            const label = currentPath.join(' / ');
            const newItem = {
                value: item.id,
                label: label,
                item: item
            };

            const children = item.children && item.children.length > 0
                ? flattenTreeWithHierarchy(item.children, currentPath)
                : [];

            return [...acc, newItem, ...children];
        }, []);
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setSelectedItems([]);
        if (value === 'non-standard') {
            message.info('هیچ موردی برای غیراستاندارد وجود ندارد');
        }
    };

    const handleItemChange = (value) => {
        setSelectedItems(value);
    };

    const dynamicOptions = selectedType && personalityData
        ? flattenTreeWithHierarchy(personalityData)
        : [];

    // Find the full label for a given value
    const getLabelForValue = (value) => {
        const option = dynamicOptions.find(opt => opt.value === value);
        return option ? option.label : String(value); // Fallback to string conversion
    };

    const renderContent = () => (
        <>
            <Form.Item
                name="personality_type"
                label="نوع هویت"
            >
                <Select
                    options={typeOptions}
                    onChange={handleTypeChange}
                    value={selectedType}
                    allowClear
                    loading={isLoading}
                    placeholder="انتخاب نوع هویت"
                />
            </Form.Item>

            {selectedType === 'standard' && (
                <Form.Item
                    name="personality_ids"
                    label="ویژگی استاندارد"
                >
                    <Select
                        options={dynamicOptions}
                        onChange={handleItemChange}
                        value={selectedItems}
                        allowClear
                        loading={isLoading}
                        placeholder="انتخاب ویژگی"
                        optionFilterProp="label"
                        showSearch
                        notFoundContent={isLoading ? <Spin size="small" /> : "موردی یافت نشد"}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
            )}

            {selectedType === 'made' && (
                <Form.Item
                    name="personality_ids"
                    label="ویژگی‌های ساخت"
                >
                    <Select
                        mode="multiple"
                        options={dynamicOptions}
                        onChange={handleItemChange}
                        value={selectedItems}
                        allowClear
                        loading={isLoading}
                        placeholder="انتخاب ویژگی‌ها"
                        optionFilterProp="label"
                        showSearch
                        notFoundContent={isLoading ? <Spin size="small" /> : "موردی یافت نشد"}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        maxTagCount="responsive"
                        maxTagTextLength={20}
                        tagRender={({ value, onClose }) => {
                            const label = getLabelForValue(value);
                            return (
                                <Tag closable onClose={onClose} style={{ marginRight: 3 }}>
                                    {typeof label === 'string' ? label.split(' / ').pop() : String(value)}
                                </Tag>
                            );
                        }}
                    />
                </Form.Item>
            )}
        </>
    );

    return (
        <div className="personality-container">
            {showAlongside ? (
                <>
                    {renderContent()}
                </>
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default PersonalityModels;