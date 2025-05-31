import { Card, List } from "antd";
import { useProductList } from "../../../QueryServises/productQuery";

const ListOfProductsAcceptingTheRequirement = () => {
    const { data: productList, isLoading } = useProductList();

    return (
        <Card
            title="لیست محصولات پذیرنده الزام"
            loading={isLoading}
        >
            <List
                dataSource={productList}
                renderItem={(item) => (
                    <List.Item>
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span> - {item.persian_title} ({item.code})</span>
                            </div>

                            {item.children && item.children.length > 0 && (
                                <List
                                    dataSource={item.children}
                                    renderItem={(child) => (
                                        <List.Item style={{ paddingRight: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <span> - {child.persian_title} ({child.code})</span>
                                            </div>
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