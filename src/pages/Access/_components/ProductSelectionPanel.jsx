import {useEffect, useMemo, useState} from "react";
import {useUnAccessProductsByUserAndRoleId} from "../../../QueryServises/accsessQuery";
import {Alert, Button, Empty, Spin, Tree} from "antd";

const transformDataForTree = (products) => {
    if (!products) return [];
    return products.map(product => ({
        key: product.id,
        title: product.persian_title,
        children: product.children && product.children.length > 0 ? transformDataForTree(product.children) : [],
    }));
};

const ProductSelectionPanel = (
    {
        selectedUserId,
        selectedRoleId,
        onSelectionChange,
        onAssign,
        isAssigning,
        selectedProductCount
    }) => {
    const [checkedKeys, setCheckedKeys] = useState([]);

    const {data: products, isLoading, error} = useUnAccessProductsByUserAndRoleId(
        selectedUserId && selectedRoleId ? {user_id: selectedUserId, role_id: selectedRoleId} : null,
        {enabled: !!(selectedUserId && selectedRoleId)}
    );

    const treeData = useMemo(() => transformDataForTree(products), [products]);

    useEffect(() => {
        setCheckedKeys([]);
        onSelectionChange([]);
    }, [selectedUserId, selectedRoleId, onSelectionChange]);

    const handleCheck = (checkedKeysValue) => {
        setCheckedKeys(checkedKeysValue);
        onSelectionChange(checkedKeysValue);
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
                            <Tree
                                checkable
                                onCheck={handleCheck}
                                checkedKeys={checkedKeys}
                                treeData={treeData}
                                defaultExpandAll={true}
                            />
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