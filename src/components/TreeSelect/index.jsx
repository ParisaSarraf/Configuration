import {TreeSelect} from "antd";
import {useState} from "react";

const TS = ({
                data,
                placeholder = "لطفا انتخاب کنید",
                allowClear = true,
                treeIcon = true,
                treeLine = true,
                showSearch = true,
                modalMode,
                modalData,
                value,
                labelInValue = false,
                onChange,
                treeCheckable = false,
            }) => {
    const [searchValue, setSearchValue] = useState('');

    const getTreeSelectOptions = (items) => {
        return items.map(item => {
            const titleFields = [
                'persian_title',
                'title',
                'name',
                'label',
                'display_name',
                'code'
            ];
            let title = 'بدون عنوان';

            for (const field of titleFields) {
                if (item[field]) {
                    title = item[field];
                    if (field !== 'code' && item.code) {
                        title = `${item.code} - ${title}`;
                    }
                    break;
                }
            }

            return {
                title: title,
                value: item.id,
                children: item.children ? getTreeSelectOptions(item.children) : [],
                disabled: modalMode === "edit" && item.id === modalData?.id
            };
        });
    };

    const onSearch = (value) => {
        setSearchValue(value);
    };

    return (
        <TreeSelect
            treeData={getTreeSelectOptions(data || [])}
            placeholder={placeholder}
            allowClear={allowClear}
            treeIcon={treeIcon}
            labelInValue={labelInValue}
            treeLine={treeLine}
            showSearch={showSearch}
            treeCheckable={treeCheckable}
            searchValue={searchValue}
            onSearch={onSearch}
            filterTreeNode={(inputValue, treeNode) => {
                return treeNode.title.toLowerCase().includes(inputValue.toLowerCase());
            }}
            value={value}
            onChange={onChange}
            maxTagCount="responsive"
            style={{width: '100%'}}
        />
    );
};

export default TS;