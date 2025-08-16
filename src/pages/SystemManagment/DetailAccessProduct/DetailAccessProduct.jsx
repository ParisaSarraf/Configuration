import {Button, Card, message, Select, Spin, Table} from 'antd'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useGetAccessOfProductById} from '../../../QueryServises/productAccessQuery'
import {useProductList} from '../../../QueryServises/productQuery'
import {AccessProductCol} from './AccessProductCol'

const DetailAccessProduct = () => {
    const navigate = useNavigate()
    const {data: listOfProductData, isLoading: isProductsLoading} = useProductList()
    const [selectedProductId, setSelectedProductId] = useState(null)

    const {
        data: accessData = [],
        isLoading: isAccessLoading,
        isError,
    } = useGetAccessOfProductById(selectedProductId)

    console.log('Access Data:', accessData);

    const handleProductChange = (productId) => {
        setSelectedProductId(productId)
    }

    if (isError) {
        message.error('خطا در دریافت اطلاعات دسترسی محصول')
    }

    const tableData = Array.isArray(accessData) ? accessData : [];

    return (
        <div className="min-h-screen bg-Main p-2">
            <div className="my-1 p-2 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/panel/system-managment")}
                >
                    بازگشت به صفحه اصلی
                </Button>
            </div>

            <Card
                title="جزئیات سمت - محصولات - کاربران"
                className='w-full flex flex-col gap-5'
                loading={isProductsLoading}
            >
                <div className='mb-4'>
                    <h1>انتخاب محصول</h1>
                    <Select
                        title='انتخاب محصول'
                        className='w-full'
                        placeholder="یک محصول انتخاب کنید"
                        onChange={handleProductChange}
                        loading={isProductsLoading}
                        options={listOfProductData?.map((item) => ({
                            label: `${item.persian_title} (کد: ${item.code})`,
                            value: item.id
                        }))}
                    />
                </div>

                <Spin spinning={isAccessLoading}>
                    <Table
                        columns={AccessProductCol()}
                        dataSource={tableData}
                        loading={isAccessLoading}
                        rowKey={(record) => `${record.user?.id}-${record.role?.id}`}
                        locale={{
                            emptyText: selectedProductId
                                ? 'هیچ داده‌ای یافت نشد'
                                : 'لطفاً یک محصول انتخاب کنید'
                        }}
                    />
                </Spin>
            </Card>
        </div>
    )
}

export default DetailAccessProduct