import { Button, Form, message, Modal, Select, Spin } from "antd";
import { useCreateProductAccess, useUpdateProductAccess } from "../../QueryServises/productAccessQuery";
import { useUserList } from "../../QueryServises/userQuery";
import { useRoleList } from "../../QueryServises/roleQuery";
import { useProductList } from "../../QueryServises/productQuery";

const ProductAccessModal = ({ isOpen, modalMode, modalData, closeModal, setModal }) => {
    const { isPending: isCreating, mutateAsync: createProductAccess } = useCreateProductAccess();
    const { isPending: isUpdating, mutateAsync: updateProductAccess } = useUpdateProductAccess();
    const { isFetching: userFetching, data: userData } = useUserList();
    const { isFetching: roleFetching, data: roleData } = useRoleList();
    const { isFetching: productFetching, data: productData } = useProductList();
    const [form] = Form.useForm();

    const selectRoleOptions = roleData ? roleData.map(role => ({
        value: role.id,
        label: role.name
    })) : [];
    
    const selectUserOptions = userData ? userData.map(user => ({
        value: user.id,
        label: user.username
    })) : [];
    
    const selectProductOptions = productData ? productData.map(product => ({
        value: product.id,
        label: product.name
    })) : [];

    const onFinish = async (values) => {
        const payload = {
            user_id: values.user_id,
            role_id: values.role_id,
            product_id: values.product_id
        };
        
        try {
            if (modalMode === "edit") {
                await updateProductAccess({ id: modalData.id, ...payload });
                message.success("با موفقیت ویرایش شد.");
            } else {
                await createProductAccess(payload);
                message.success("با موفقیت اضافه شد.");
            }
            closeModal();
        } catch (error) {
            console.error("خطا در ارسال فرم:", error);
            message.error("خطا در ارسال فرم!");
        }
    };

    return (
        <Modal
            title={`${modalMode === "edit" ? "ویرایش دسترسی محصول" : "افزودن دسترسی محصول"}`}
            open={isOpen}
            onCancel={closeModal}
            footer={[
                <Button key="back" onClick={closeModal}>
                    انصراف
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isCreating || isUpdating}
                    onClick={() => form.submit()}
                >
                    {modalMode === "edit" ? "به‌روزرسانی" : "تایید"}
                </Button>,
            ]}
        >
            <Form
                form={form}
                onFinish={onFinish}
                initialValues={modalData || {}}
                className="w-full"
                layout="vertical"
            >
                <div className="flex flex-col gap-4">
                    {userFetching ? (
                        <Spin size="large" className="w-full" />
                    ) : (
                        <Form.Item
                            name="user_id"
                            label="کاربر"
                            rules={[{ required: true, message: "لطفاً کاربر را انتخاب کنید" }]}
                        >
                            <Select
                                className="w-full"
                                options={selectUserOptions}
                                placeholder="انتخاب کاربر"
                            />
                        </Form.Item>
                    )}
                    
                    {roleFetching ? (
                        <Spin size="large" className="w-full" />
                    ) : (
                        <Form.Item
                            name="role_id"
                            label="سمت"
                            rules={[{ required: true, message: "لطفاً سمت را انتخاب کنید" }]}
                        >
                            <Select
                                className="w-full"
                                options={selectRoleOptions}
                                placeholder="انتخاب سمت"
                            />
                        </Form.Item>
                    )}
                    
                    {productFetching ? (
                        <Spin size="large" className="w-full" />
                    ) : (
                        <Form.Item
                            name="product_id"
                            label="محصول"
                            rules={[{ required: true, message: "لطفاً محصول را انتخاب کنید" }]}
                        >
                            <Select
                                className="w-full"
                                options={selectProductOptions}
                                placeholder="انتخاب محصول"
                            />
                        </Form.Item>
                    )}
                </div>
            </Form>
        </Modal>
    );
};

export default ProductAccessModal;