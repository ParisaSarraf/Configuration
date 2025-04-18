import { Form, Select, Spin, message } from "antd";
import { useState } from "react";
import { usePersonalityProductList } from "../../QueryServises/personalityQuery";

const PersonalityModels = () => {
    const { data: personalityData, isLoading } = usePersonalityProductList();


    const [typeOptions] = useState([
        { value: 'made', label: 'ساخت' },
        { value: 'standard', label: 'استاندارد' },
        { value: 'non-standard', label: 'غیراستاندارد' },
    ]);
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const flattenTreeWithHierarchy = (items, parentNames = []) => {
        return items.reduce((acc, item) => {
            const currentPath = [...parentNames, item.name];
            const label = currentPath.join('/');
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

        if (value && personalityData) {
            const flattenedOptions = flattenTreeWithHierarchy(personalityData);
            setDynamicOptions(flattenedOptions);

            if (value === 'non-standard') {
                message.info('هیچ موردی برای غیراستاندارد وجود ندارد');
            }
        } else {
            setDynamicOptions([]);
        }
    };

    const handleItemChange = (value) => {
        setSelectedItems(value);
    };

    return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Form.Item name="personality_type">
                <Select
                    placeholder="نوع هویت"
                    options={typeOptions}
                    onChange={handleTypeChange}
                    value={selectedType}
                    allowClear
                    style={{ width: 200 }}
                    loading={isLoading}
                />
            </Form.Item>
            <Form.Item name="personality_ids">

                {selectedType === 'standard' && (
                    <Select
                        placeholder="یک مورد انتخاب کنید"
                        options={dynamicOptions}
                        onChange={handleItemChange}
                        value={selectedItems}
                        allowClear
                        style={{ width: 300 }}
                        loading={isLoading}
                        optionFilterProp="label"
                        showSearch
                        notFoundContent={isLoading ? <Spin size="small" /> : "موردی یافت نشد"}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                )}

                {selectedType === 'made' && (
                    <Select
                        mode="multiple"
                        placeholder="چند مورد انتخاب کنید"
                        options={dynamicOptions}
                        onChange={handleItemChange}
                        value={selectedItems}
                        allowClear
                        style={{ width: 300 }}
                        loading={isLoading}
                        optionFilterProp="label"
                        showSearch
                        notFoundContent={isLoading ? <Spin size="small" /> : "موردی یافت نشد"}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        maxTagCount="responsive"
                    />
                )}

                {selectedType === 'non-standard' && (
                    <Select
                        disabled
                        placeholder="انتخاب کنید"
                        options={dynamicOptions}
                        onChange={handleItemChange}
                        value={selectedItems}
                        allowClear
                        style={{ width: 300 }}
                        loading={isLoading}
                        optionFilterProp="label"
                        showSearch
                        notFoundContent={isLoading ? <Spin size="small" /> : "هیچ موردی وجود ندارد"}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                )}
            </Form.Item>

        </div>
    );
};

export default PersonalityModels;