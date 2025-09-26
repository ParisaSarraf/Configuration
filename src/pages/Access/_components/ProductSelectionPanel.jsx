import {useEffect, useMemo, useState} from "react";
import {useUnAccessProductsByUserAndRoleId} from "../../../QueryServises/accsessQuery";
import {Alert, Button, Empty, Spin, Tree} from "antd";

const transformDataForTree = (products) => {
    if (!products) return [];
    return products.map(product => ({
        key: product.id,
        title: product.persian_title,
        has_access: product.has_access,
        children: product.children && product.children.length > 0 ? transformDataForTree(product.children) : [],
    }));
};

const ProductSelectionPanel = ({
                                   selectedUserId,
                                   selectedRoleId,
                                   onSelectionChange,
                                   onAssign,
                                   isAssigning,
                                   selectedProductCount
                               }) => {
    const [checkedKeys, setCheckedKeys] = useState({checked: [], halfChecked: []});

    const {data: products, isLoading, error} = useUnAccessProductsByUserAndRoleId(
        selectedUserId && selectedRoleId ? {user_id: selectedUserId, role_id: selectedRoleId} : null,
        {enabled: !!(selectedUserId && selectedRoleId)}
    );

    const treeData = useMemo(() => transformDataForTree(products), [products]);

    const getAccessibleKeys = (data) => {
        let accessibleKeys = [];
        const traverse = (items) => {
            items.forEach(item => {
                if (item.has_access) {
                    accessibleKeys.push(item.key);
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                }
            });
        };

        traverse(data);
        return accessibleKeys;
    };

    useEffect(() => {
        setCheckedKeys({checked: [], halfChecked: []});
        onSelectionChange([]);
    }, [selectedUserId, selectedRoleId, onSelectionChange]);

    useEffect(() => {
        if (treeData && treeData.length > 0) {
            const accessibleKeys = getAccessibleKeys(treeData);
            if (accessibleKeys.length > 0) {
                setCheckedKeys({checked: accessibleKeys, halfChecked: []});
                onSelectionChange(accessibleKeys);
            }
        }
    }, [treeData, onSelectionChange]);

    const handleCheck = (checkedKeysValue, {checkedNodes, halfCheckedKeys}) => {
        const onlyCheckedKeys = checkedKeysValue.checked || checkedKeysValue;
        setCheckedKeys({checked: onlyCheckedKeys, halfChecked: halfCheckedKeys || []});
        onSelectionChange(onlyCheckedKeys);
    };

    const renderTitle = (nodeData) => {
        const hasAccess = nodeData.has_access;
        return (
            <span className={hasAccess ? "text-sky-600 font-semibold" : "text-gray-800"}>
                {nodeData.title}
            </span>
        );
    };

    if (!selectedUserId || !selectedRoleId) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-full">
                <div className="p-4 border-b border-slate-200"><h2 className="text-base font-semibold text-slate-800">۳.
                    انتخاب محصولات</h2></div>
                <div className="flex-1 flex justify-center items-center"><Empty
                    description="ابتدا کاربر و سمت را انتخاب کنید."/></div>
            </div>
        );
    }

    const PanelHeader = (
        <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">۳. انتخاب محصولات</h2>
        </div>
    );

    if (error) return <div className="p-4"><Alert message="خطا در بارگذاری محصولات" type="error"/></div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-full">
            {PanelHeader}
            {isLoading ? <div className="flex-1 flex justify-center items-center"><Spin/></div> :
                !treeData || treeData.length === 0 ? <div className="flex-1 flex justify-center items-center"><Empty
                        description="محصول جدیدی برای افزودن یافت نشد."/></div> :
                    <>
                        <div className="p-2 flex-1 overflow-y-auto">
                            <div className="
                                [&_.ant-tree-checkbox-checked_.ant-tree-checkbox-inner]:bg-sky-500
                                [&_.ant-tree-checkbox-checked_.ant-tree-checkbox-inner]:border-sky-500
                                [&_.ant-tree-checkbox-checked]:border-sky-500
                                [&_.ant-tree-checkbox-checked::after]:border-sky-500
                                [&_.ant-tree-checkbox:not(.ant-tree-checkbox-checked)_]:border-gray-300
                                [&_.ant-tree-checkbox:not(.ant-tree-checkbox-checked)_.ant-tree-checkbox-inner]:bg-gray-100
                                [&_.ant-tree-checkbox:not(.ant-tree-checkbox-checked)_.ant-tree-checkbox-inner]:border-gray-300
                                [&_.ant-tree-checkbox-wrapper:hover_.ant-tree-checkbox-inner]:border-sky-400
                                [&_.ant-tree-checkbox:hover_.ant-tree-checkbox-inner]:border-sky-400
                                [&_.ant-tree-checkbox-wrapper:hover_.ant-tree-checkbox:not(.ant-tree-checkbox-checked)_.ant-tree-checkbox-inner]:bg-sky-50
                                [&_.ant-tree-checkbox:hover:not(.ant-tree-checkbox-checked)_.ant-tree-checkbox-inner]:bg-sky-50
                            ">
                                <Tree
                                    checkable
                                    checkStrictly
                                    onCheck={handleCheck}
                                    checkedKeys={checkedKeys}
                                    treeData={treeData}
                                    defaultExpandAll={false}
                                    titleRender={renderTitle}
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200">
                            <Button type="primary" block onClick={onAssign} loading={isAssigning}
                                    disabled={selectedProductCount === 0}>
                                {`تخصیص ${selectedProductCount} محصول`}
                            </Button>
                        </div>
                    </>
            }
        </div>
    );
};

export default ProductSelectionPanel;