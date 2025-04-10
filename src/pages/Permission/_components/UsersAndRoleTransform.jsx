import { Transfer } from "antd"

const UsersAndRoleTransform = () => {
    return (
        <Transfer
            // dataSource={formattedPermissions}
            // targetKeys={targetKeys}
            // onChange={(newTargetKeys) => {
                // setTargetKeys(newTargetKeys);
                // form.setFieldValue('permissions_ids', newTargetKeys);
            // }}
            // render={item => item.title}
            titles={['لیست دسترسی‌ها', 'دسترسی‌های انتخاب شده']}
            listStyle={{
                width: '100%',
                height: 400,
            }}
            locale={{
                itemUnit: 'مورد',
                itemsUnit: 'موارد',
                searchPlaceholder: 'جستجو',
                notFoundContent: 'موردی یافت نشد',
            }}
            className="[&_.ant-transfer-operation]:rotate-180"
            showSearch
            // filterOption={(inputValue, option) =>
                // option.title.toLowerCase().includes(inputValue.toLowerCase()) ||
                // option.description.toLowerCase().includes(inputValue.toLowerCase())
            // }
        />
    )
}

export default UsersAndRoleTransform
