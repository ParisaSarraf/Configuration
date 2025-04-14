import { Card, Empty, List, Spin, Checkbox } from "antd";
import { useUnAccessProductsByUserAndRoleId } from "../../../QueryServises/accsessQuery";
import { CheckBox } from "@mui/icons-material";
import { useState } from "react";

const ProductsList = ({ selectedUserAndRoleId }) => {
    const [checkedItems, setCheckedItems] = useState({});

    const { data, isLoading, error } = useUnAccessProductsByUserAndRoleId(
        selectedUserAndRoleId?.length === 2 ? {
            user_id: selectedUserAndRoleId[1],
            role_id: selectedUserAndRoleId[0]
        } : null
    );

    if (isLoading) return <Spin />;
    if (error) return <Alert message={`خطا: ${error.response?.data?.message || error.message}`} type="error" />;

    return (
        <Card>
            {data?.length > 0 ? (
                <List
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item>
                            <Checkbox
                                checked={checkedItems[item.id] || false}
                                // onChange={handleCheck(item.id)}
                            >
                                {item.persian_title}
                            </Checkbox>
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="محصولی یافت نشد" />
            )}
        </Card>
    );
};


export default ProductsList