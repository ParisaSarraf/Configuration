import {useState} from 'react';
import {Alert, message, Skeleton} from 'antd';
import {useProductContext} from '../../Services/Context/ProductContext';
import {useDeleteProductImage, useProductChildren, useUpdateProductInfo} from '../../QueryServises/productQuery';
import ProductInfoForm from './components/ProductInfoForm';
import SubProductsTable from './components/SubProductsTable';

const Introduction = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const {currentProduct} = useProductContext();
    const {data: productData, refetch, isLoading, isError} = useProductChildren(currentProduct?.id, {
        enabled: !!currentProduct?.id,
    });
    const {mutateAsync: updateProductionInfo, isPending: isUpdating} = useUpdateProductInfo();
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
            return true;
        } catch (error) {
            console.error('Error details:', error);
            message.error("مشکلی در انجام عملیات پیش آمده است");
            return false;
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
            throw error;
        } finally {
            setIsDeleting(false);
        }
    };
    if (!currentProduct) {
        return <div className="text-center py-8">محصولی یافت نشد</div>;
    }

    return (
        <div className="pw-introduction">
            {isError && <Alert type="error" showIcon message="اطلاعات محصول بارگذاری نشد" action={<button type="button" onClick={() => refetch()}>تلاش مجدد</button>}/>}
            {isLoading ? <Skeleton active/> : <>
                    <ProductInfoForm
                        product={productData?.[0] || currentProduct}
                        onFinish={onFinish}
                        onDeleteImage={handleDeleteImage}
                        isSubmitting={isUpdating}
                        isDeleting={isDeleting}
                    />
                <SubProductsTable key={currentProduct.id} productData={productData} currentProduct={currentProduct}/>
            </>}
        </div>
    );
};

export default Introduction;
