import { Card } from 'antd';
import DataExporter from "@/components/DataExporter/DataExporter.jsx";
import RecursiveTable from './RecursiveTable';
import ProductCols from '../components/ProductCols'; // مسیر را متناسب با پروژه خود تنظیم کنید

const SubProductsTable = ({ productData }) => {
    if (!productData || productData.length === 0) {
        return null;
    }

    return (
        <Card
            title="محصولات زیرمجموعه"
            extra={
                <DataExporter
                    excelData={productData}
                    excelColumns={ProductCols()}
                    fileName="لیست محصولات زیرمجموعه"
                />
            }
        >
            <RecursiveTable dataSource={productData} columns={ProductCols()} />
        </Card>
    );
};

export default SubProductsTable;