import { Card, List } from "antd";
import { useProductChildren } from "../../../QueryServises/productQuery";
import { useMemo } from "react";

const ListOfProductsAcceptingTheRequirement = ({ currentProduct }) => {
    const { data: productList = [], isLoading } = useProductChildren(currentProduct?.id);

    const groupedProducts = useMemo(() => {
        if (!Array.isArray(productList)) return [];
        const map = new Map();
        productList.forEach((product) => {
            if (!product.parent) {
                map.set(product.id, { ...product, children: [] });
            }
        });
        productList.forEach((product) => {
            if (product.parent && map.has(product.parent)) {
                map.get(product.parent).children.push(product);
            }
        });
        return Array.from(map.values());
    }, [productList]);

    return (
        <Card title="لیست محصولات پذیرنده الزام" loading={isLoading}>
            <List
                dataSource={groupedProducts}
                renderItem={(item) => (
                    <List.Item>
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span> - {item.persian_title} ({item.code})</span>
                            </div>

                            {item.children && item.children.length > 0 && (
                                <List
                                    size="small"
                                    dataSource={item.children}
                                    renderItem={(child) => (
                                        <List.Item style={{ paddingRight: '24px' }}>
                                            <span> - {child.persian_title} ({child.code})</span>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </div>
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default ListOfProductsAcceptingTheRequirement;
