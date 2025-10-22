import {Card, message, Spin, Table} from 'antd';
import {useGetAccessOfProductById} from '../../../QueryServises/productAccessQuery';
import {AccessProductCol} from './AccessProductCol';
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import {useMemo} from 'react';

const DetailAccessProduct = () => {
    const {currentProduct} = useProductContext();

    const {
        data: accessData = [],
        isLoading: isAccessLoading,
        isError,
        isFetching,
    } = useGetAccessOfProductById(currentProduct?.id);

    if (isError) {
        message.error('خطا در دریافت اطلاعات دسترسی محصول');
    }

    const tableData = useMemo(() => {
        return accessData?.length
            ? accessData.flatMap((product) =>
                product.roles.flatMap((item) =>
                    item.users.map((user) => ({
                        rowId: `${product.id}-${item.role.id}-${user.id}`,
                        user,
                        role: item.role,
                        product,
                    }))
                )
            )
            : [];
    }, [accessData]);

    const persianTableLocale = {
        filterTitle: 'منوی فیلتر',
        filterConfirm: 'اعمال',
        filterReset: 'پاک کردن',
        emptyText: 'هیچ داده‌ای یافت نشد',
    };

    const columns = useMemo(() => AccessProductCol(tableData), [tableData]);

    return (
        <Card
            title="جزئیات توزیع نقش ها"
            className='w-full flex flex-col gap-5'
            loading={isAccessLoading}
        >
            <Spin spinning={isAccessLoading || isFetching}>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    loading={isAccessLoading}
                    rowKey={(record) => record.rowId}
                    // locale={{
                    //     emptyText: currentProduct ? 'هیچ داده‌ای یافت نشد' : 'لطفاً یک محصول انتخاب کنید'
                    // }}
                    size="small"
                    pagination={{
                        defaultPageSize: 5,
                        pageSizeOptions: [10, 20, 45,100],
                        size: "small",
                        showSizeChanger: true,
                    }}
                    locale={persianTableLocale}

                />
            </Spin>
        </Card>
    );
};

export default DetailAccessProduct;