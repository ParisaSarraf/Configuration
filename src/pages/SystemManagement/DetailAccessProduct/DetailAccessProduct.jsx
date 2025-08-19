import {Card, message, Spin, Table} from 'antd'
import {useGetAccessOfProductById} from '../../../QueryServises/productAccessQuery'
import {AccessProductCol} from './AccessProductCol'
import {useProductContext} from "@/Services/Context/ProductContext.jsx";

const DetailAccessProduct = () => {
    const {currentProduct} = useProductContext();

    const {
        data: accessData = {},
        isLoading: isAccessLoading,
        isError,
    } = useGetAccessOfProductById(currentProduct?.id)

    if (isError) {
        message.error('خطا در دریافت اطلاعات دسترسی محصول')
    }


    const tableData = accessData?.length
        ? accessData.flatMap((product) =>
            product.roles.flatMap((item) =>
                item.users.map((user) => ({
                    id: user.id,
                    user,
                    role: item.role,
                    product,
                }))
            )
        )
        : [];

    return (
        <Card
            title="جزئیات توزیع نقش ها"
            className='w-full flex flex-col gap-5'
            loading={isAccessLoading}
        >
            <Spin spinning={isAccessLoading}>
                <Table
                    columns={AccessProductCol()}
                    dataSource={tableData}
                    loading={isAccessLoading}
                    rowKey={(record) => record.id}
                    locale={{
                        emptyText: currentProduct
                            ? 'هیچ داده‌ای یافت نشد'
                            : 'لطفاً یک محصول انتخاب کنید'
                    }}
                    size="small"
                />
            </Spin>
        </Card>
    );
};


export default DetailAccessProduct