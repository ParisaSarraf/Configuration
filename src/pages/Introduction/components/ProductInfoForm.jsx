import {useEffect, useRef, useState} from 'react';
import {Button, Form, Input} from 'antd';
import ProductImageHandler from './ProductImageHandler';
import {getProductImageUrl} from '@/utils/productImage.js';

const ProductInfoForm = ({product, onFinish, onDeleteImage, isSubmitting, isDeleting}) => {
    const [form] = Form.useForm();
    const initializedProduct = useRef(null);
    const [isDirty, setDirty] = useState(false);

    useEffect(() => {
        if (initializedProduct.current === product?.id && isDirty) return;
        initializedProduct.current = product?.id;
        form.setFieldsValue({user_description: product?.user_description || '', user_image: []});
        setDirty(false);
    }, [product?.id, product?.user_description, product?.user_image, form, isDirty]);

    const initialImageUrl = getProductImageUrl(product?.user_image);

    const handleFinish = async (values) => {
        const saved = await onFinish(values);
        if (saved) setDirty(false);
    };

    return (
        <Form className="pw-product-info-form" form={form} layout="vertical" onFinish={handleFinish} onValuesChange={() => setDirty(true)}>
            <div className="pw-introduction-grid">
                <section className="pw-card pw-description-card" aria-labelledby="product-description-title">
                    <header className="pw-card-heading">
                        <h2 id="product-description-title">توضیحات محصول</h2>
                        <p>شرح، ویژگی‌ها و نکات تکمیلی محصول</p>
                    </header>
                    <div className="pw-description-body">
                        <Form.Item name="user_description">
                            <Input.TextArea
                                aria-labelledby="product-description-title"
                                autoSize={{minRows: 8, maxRows: 18}}
                                placeholder="توضیحات محصول را وارد کنید"
                                disabled={isSubmitting}
                            />
                        </Form.Item>
                    </div>
                </section>
                <section className="pw-card pw-image-card" aria-labelledby="product-image-title">
                    <header className="pw-card-heading">
                        <h2 id="product-image-title">تصویر محصول</h2>
                        <p>تصویر شاخص در فهرست و گزارش‌ها نمایش داده می‌شود.</p>
                    </header>
                    <div className="pw-image-body">
                        <Form.Item name="user_image" className="pw-image-field">
                            <ProductImageHandler initialImageUrl={initialImageUrl} onDeleteFromServer={onDeleteImage} disabled={isSubmitting || isDeleting}/>
                        </Form.Item>
                    </div>
                </section>
            </div>
            {isDirty && <div className="pw-save-row">
                <span role="status">تغییرات ذخیره نشده</span>
                <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isDeleting}>ذخیره تغییرات</Button>
            </div>}
        </Form>
    );
};

export default ProductInfoForm;
