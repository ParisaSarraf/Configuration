import {Card} from 'antd';
import RecursiveTable from './RecursiveTable';
import ProductCols from '../components/ProductCols';
import {useEffect, useState} from "react";
import {useExportExcelProductIntroduction,} from "@/QueryServises/ExcelExporterQuery/index.js";
import {handleDownload} from "@utils/HandleDownload.js";

const SubProductsTable = ({productData, currentProduct}) => {
    const [exportExcelData, setExportExcelData] = useState(null);
    const {data: exportExcel} = useExportExcelProductIntroduction(exportExcelData);

    useEffect(() => {
        if (exportExcel && exportExcelData) {
            handleDownload(exportExcel, `_محصولات زیر مجموعه${exportExcelData}.csv`);
        }
    }, [exportExcel, exportExcelData, handleDownload])

    if (!productData || productData.length === 0) {
        return null;
    }

    const handleExcelExportForRow = async (record) => {
        setExportExcelData(record);
    };

    return (
        <Card
            title="محصولات زیرمجموعه"
            // extra={
            //     <Button
            //         title={'خروجی اکسل'}
            //         className={'text-green-500 border-green-500'}
            //         onClick={() => handleExcelExportForRow(currentProduct?.id)}
            //         icon={<FileExcelOutlined/>}
            //     />
            // }
        >
            <RecursiveTable dataSource={productData} columns={ProductCols()}/>
        </Card>
    );
};

export default SubProductsTable;