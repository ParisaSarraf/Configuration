import {useState} from 'react';
import {Col, ConfigProvider, message, Row} from 'antd';
import fa_IR from 'antd/locale/fa_IR';
import {useProductContext} from '../../Services/Context/ProductContext';
import {useDeleteProductImage, useProductChildren, useUpdateProductInfo} from '../../QueryServises/productQuery';
import ProductInfoForm from './components/ProductInfoForm';
import SubProductsTable from './components/SubProductsTable';

const Introduction = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const {currentProduct} = useProductContext();
    const {data: productData, refetch} = useProductChildren(currentProduct?.id, {
        enabled: !!currentProduct?.id,
    });
    const {mutateAsync: updateProductionInfo, isLoading: isUpdating} = useUpdateProductInfo();
    const {mutateAsync: deleteProductionImage} = useDeleteProductImage();

    const onFinish = async (values) => {
        const payload = {
            user_description: values.user_description || '',
        };
        if (values.user_image === null) {
            payload.user_image = null;
        } else if (values.user_image?.[0]?.originFileObj) {
            payload.user_image = values.user_image[0].originFileObj;
        } else if (values.user_image?.[0]) {
            payload.user_image = values.user_image[0];
        }
        try {
            await updateProductionInfo({
                productId: currentProduct?.id,
                ...payload
            });
            message.success('ذخیره با موفقیت انجام شد');
            await refetch();
        } catch (error) {
            console.error('Error details:', error);
            message.error("مشکلی در انجام عملیات پیش آمده است");
        }
    };
    const handleDeleteImage = async () => {
        setIsDeleting(true);
        try {
            await deleteProductionImage(currentProduct?.id);
            message.success('تصویر با موفقیت حذف شد');
            await refetch();
        } catch (error) {
            console.error('Delete error:', error);
            message.error("خطا در حذف تصویر");
        } finally {
            setIsDeleting(false);
        }
    };
    if (!currentProduct) {
        return <div className="text-center py-8">محصولی یافت نشد</div>;
    }

    return (
        <ConfigProvider direction="rtl" locale={fa_IR}>
            {/*<Spin spinning={isDeleting || isUpdating} tip={isDeleting ? "در حال حذف تصویر..." : "در حال ذخیره..."}>*/}
            <div style={{padding: 16}}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <ProductInfoForm
                            product={productData?.[0] || currentProduct}
                            onFinish={onFinish}
                            onDeleteImage={handleDeleteImage}
                            isSubmitting={isUpdating}
                        />
                    </Col>
                    <Col span={24}>
                        <SubProductsTable productData={productData} currentProduct={currentProduct}/>
                    </Col>
                </Row>
            </div>
            {/*</Spin>*/}
        </ConfigProvider>
    );
};

export default Introduction;