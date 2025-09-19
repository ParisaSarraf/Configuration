import {useEffect, useState} from "react";
import {useUnAccessProductsByUserAndRoleId} from "../../../QueryServises/accsessQuery";
import {Alert, Button, Checkbox, Empty, List, Spin} from "antd";

const ProductSelectionPanel = ({
                                   selectedUserId,
                                   selectedRoleId,
                                   onSelectionChange,
                                   onAssign,
                                   isAssigning,
                                   selectedProductCount
                               }) => {
    const [checkedProducts, setCheckedProducts] = useState(new Set());

    const {data: products, isLoading, error} = useUnAccessProductsByUserAndRoleId(
        selectedUserId && selectedRoleId ? {user_id: selectedUserId, role_id: selectedRoleId} : null,
        {enabled: !!(selectedUserId && selectedRoleId)}
    );

    useEffect(() => {
        setCheckedProducts(new Set());
        onSelectionChange([]);
    }, [selectedUserId, selectedRoleId, onSelectionChange]);

    const handleCheckChange = (productId, isChecked) => {
        const newCheckedProducts = new Set(checkedProducts);
        if (isChecked) {
            newCheckedProducts.add(productId);
        } else {
            newCheckedProducts.delete(productId);
        }
        setCheckedProducts(newCheckedProducts);
        onSelectionChange(Array.from(newCheckedProducts));
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
                !products || products.length === 0 ? <div className="flex-1 flex justify-center items-center"><Empty
                        description="محصول جدیدی برای افزودن یافت نشد."/></div> :
                    <>
                        <List
                            className="p-2 flex-1 overflow-y-auto"
                            dataSource={products}
                            renderItem={(product) => (
                                <List.Item className="!p-0">
                                    <Checkbox
                                        checked={checkedProducts.has(product.id)}
                                        onChange={(e) => handleCheckChange(product.id, e.target.checked)}
                                        className="w-full p-3 rounded-lg hover:bg-slate-50"
                                    >
                                        {product.persian_title}
                                    </Checkbox>
                                </List.Item>
                            )}
                        />
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