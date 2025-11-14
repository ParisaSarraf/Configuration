import { Button, Card } from 'antd';
import RecursiveTable from './RecursiveTable';
import ProductCols from '../components/ProductCols';
import { handleDownload } from "@utils/HandleDownload.js";
import { FileExcelOutlined } from '@ant-design/icons';
import { useExportExcelProductTable } from '../../../QueryServises/ExcelExporterQuery';

const SubProductsTable = ({ productData, currentProduct }) => {
    const { isLoading: isExporting, refetch } = useExportExcelProductTable(currentProduct?.id, {
        enabled: false
    });

    if (!productData || productData.length === 0) {
        return null;
    }

    const handleExcelExport = async () => {
        if (!currentProduct?.id) {
            console.error('Product ID is required for export');
            return;
        }
        try {
            const result = await refetch();

            if (result.data) {
                handleDownload(result.data, `_محصولات_زیر_مجموعه_${currentProduct.id}.csv`);
            }
        } catch (error) {
            console.error('Error in Excel export:', error);
        }
    };

    return (
        <Card
            title="محصولات زیرمجموعه"
            extra={
                <Button
                    title={'خروجی اکسل'}
                    className={'text-green-500 border-green-500'}
                    onClick={handleExcelExport}
                    icon={<FileExcelOutlined />}
                    loading={isExporting}
                />
            }
        >
            <RecursiveTable dataSource={productData} columns={ProductCols()} />
        </Card>
    );
};

export default SubProductsTable;