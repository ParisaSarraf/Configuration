import {message, Modal, Table, Tag} from "antd";
import {useConfirmProductPurchaseById, useDeleteProductPurchase} from "@/QueryServises/productPurchase/index.js";
import ListOfRequestsMadeCol from "./ListOfRequestsMadeCol";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";
import {flattenDataForExcel} from "@utils/flattenData.js";
import {exportToExcel} from "@utils/ExportExcel.js";


const ListOfRequestsMade = ({currentProduct, refetch}) => {
    const {data: purchaseData, refetch: purchaseDataRefetch} = useConfirmProductPurchaseById(currentProduct?.id);
    const {mutateAsync: deleteProductPurchase} = useDeleteProductPurchase(currentProduct?.id);


    const expandedRowRender = (record) => {
        const nestedColumns = [
            {
                title: 'نام محصول',
                dataIndex: ['product', 'persian_title'],
                key: 'persian_title',
            },
            {
                title: 'کد محصول',
                dataIndex: ['product', 'code'],
                key: 'code',
                render: (record) => {
                    return (<Tag color={'orange'}>{record}</Tag>)
                }
            },
            {
                title: 'تعداد تایید شده',
                dataIndex: 'confirmed_number',
                key: 'confirmed_number',
            }, {
                title: 'تاریخ تایید',
                dataIndex: 'date',
                key: 'date',
                render: (text) => {
                    return (
                        <Tag color={'green'}>{georgianDateToJalaliDate(text)}</Tag>
                    )
                }
            },
        ];

        const nestedDataSource = record.product_purchase_numbers.map(item => ({
            key: item.id,
            product: item.product,
            confirmed_number: item.confirmed_number,
            date: item.date
        }));

        return (
            <Table
                columns={nestedColumns}
                dataSource={nestedDataSource}
                pagination={false}
                rowKey="key"
                size={'small'}
            />
        );
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'حذف درخواست خرید',
            content: 'آیا از حذف این درخواست خرید مطمئن هستید؟',
            okText: 'بله',
            cancelText: 'خیر',
            okType: 'danger',
            async onOk() {
                try {
                    await deleteProductPurchase(record?.id);
                    message.success("درخواست خرید با موفقیت حذف شد");
                    await (refetch() && purchaseDataRefetch())
                } catch (error) {
                    message.error("حذف درخواست خرید با خطا مواجه شد");
                    throw error;
                }
            },
        });
    };

    const handleHide = (record) => {
        console.log(record);
    }

    const handleExcelExportForRow = (record) => {
        try {
            const dataToExport = [record];
            const flatData = flattenDataForExcel(dataToExport);
            const excelColumns = ListOfRequestsMadeCol({}).filter(col => col.key !== 'actions');
            const fileName = `درخواست_${record.product.code || record.id}.xlsx`;
            exportToExcel(flatData, excelColumns, fileName);
            message.success("خروجی اکسل با موفقیت ایجاد شد.");
        } catch (error) {
            message.error("خطا در ایجاد خروجی اکسل.");
            console.error("Single row export error:", error);
        }
    };

    return (
        <div className={'w-full flex flex-col'}>
            <Table
                columns={ListOfRequestsMadeCol({handleDelete, handleHide, handleExcelExportForRow})}
                dataSource={purchaseData || []}
                pagination={false}
                rowKey='id'
                bordered
                size={'small'}
                expandedRowRender={expandedRowRender}
            />
        </div>
    );
};

export default ListOfRequestsMade;