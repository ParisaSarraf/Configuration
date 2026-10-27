import {useState} from 'react';
import {Button, Empty, message} from 'antd';
import {DoubleRightOutlined, FileExcelOutlined} from '@ant-design/icons';
import RecursiveTable from './RecursiveTable';
import ProductCols from './ProductCols';
import {handleDownload} from '@utils/HandleDownload.js';
import {useExportExcelProductTable} from '../../../QueryServises/ExcelExporterQuery';

const getExpandableKeys = (records = []) => records.flatMap((record) =>
    record.children?.length ? [record.id, ...getExpandableKeys(record.children)] : []
);

const SubProductsTable = ({productData, currentProduct}) => {
    const [expandedRowKeys, setExpandedRowKeys] = useState(() => getExpandableKeys(Array.isArray(productData) ? productData : []));
    const {isFetching: isExporting, refetch} = useExportExcelProductTable(currentProduct?.id, {enabled: false});
    const records = Array.isArray(productData) ? productData : [];
    const expandableKeys = getExpandableKeys(records);

    const handleExcelExport = async () => {
        if (!currentProduct?.id) return;
        try {
            const result = await refetch();
            if (result.isError || !result.data) throw new Error('Export failed');
            handleDownload(result.data, `_محصولات_زیر_مجموعه_${currentProduct.id}.csv`);
        } catch {
            message.error('خطا در دریافت خروجی اکسل؛ دوباره تلاش کنید.');
        }
    };

    return (
        <section className="pw-card pw-subproducts" aria-labelledby="subproducts-title">
            <header className="pw-table-heading">
                <div className="pw-title-line"><h2 id="subproducts-title">محصولات زیرمجموعه</h2><span className="pw-count">{records.length.toLocaleString('fa-IR')} مورد</span></div>
                <div className="pw-table-actions">
                    <Button icon={<DoubleRightOutlined rotate={90}/>} disabled={!expandableKeys.length} onClick={() => setExpandedRowKeys(expandedRowKeys.length ? [] : expandableKeys)}>
                        {expandedRowKeys.length ? 'جمع کردن همه' : 'باز کردن همه'}
                    </Button>
                    <Button className="pw-excel-button" icon={<FileExcelOutlined/>} loading={isExporting} disabled={!records.length} onClick={handleExcelExport}>خروجی اکسل</Button>
                </div>
            </header>
            <div className="pw-table-body">
                {records.length ? <RecursiveTable dataSource={records} columns={ProductCols()} expandedRowKeys={expandedRowKeys} onExpandedRowsChange={setExpandedRowKeys}/> : <Empty description="زیرمحصولی یافت نشد"/>}
            </div>
        </section>
    );
};

export default SubProductsTable;
