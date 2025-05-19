import { useEffect, useState } from "react";
import CTransfer from "../../../components/Transfer";
import { useProductSerialChildrenById, useProductSerialUnlinkedById } from "../../../QueryServises/productSerialQuery";

const ListOfProductsAttachedToSerialsTransfer = ({ selectedRowId }) => {
    // console.log(selectedRowId);

    const { data: productSerialChildren } = useProductSerialChildrenById(selectedRowId);
    const { data: productSerialUnlinked } = useProductSerialUnlinkedById(selectedRowId);

    const [leftData, setLeftData] = useState(productSerialChildren?.map(item => ({
        id: item.id.toString(),
        title: `${item.product.persian_title} (${item.serial})`,
        description: `کد محصول: ${item.product.code} | سریال: ${item.serial}`,
    })) || []);

    const [rightData, setRightData] = useState(productSerialUnlinked?.map(item => ({
        id: item.id.toString(),
        title: `${item.product.persian_title} (${item.serial})`,
        description: `کد محصول: ${item.product.code} | سریال: ${item.serial}`,
    })) || []);

    const [selectedLeftKeys, setSelectedLeftKeys] = useState([]);
    const [selectedRightKeys, setSelectedRightKeys] = useState([]);

    useEffect(() => {
        setLeftData(productSerialChildren?.map(item => ({
            id: item.id.toString(),
            title: `${item.product.persian_title} (${item.serial})`,
            description: `کد محصول: ${item.product.code} | سریال: ${item.serial}`,
        })) || []);
    }, [productSerialChildren]);

    useEffect(() => {
        setRightData(productSerialUnlinked?.map(item => ({
            id: item.id.toString(),
            title: `${item.product.persian_title} (${item.serial})`,
            description: `کد محصول: ${item.product.code} | سریال: ${item.serial}`,
        })) || []);
    }, [productSerialUnlinked]);

    const handleTransferChange = (newRightData) => {
        setRightData(newRightData);
        const movedIds = newRightData.map(item => item.id);
        setLeftData(prevLeft =>
            prevLeft.filter(item => !movedIds.includes(item.id)))
    };

    return (
        <div className="h-full">
            <CTransfer
                leftDataSource={leftData}
                rightDataSource={rightData}
                selectedLeftKeys={selectedLeftKeys}
                selectedRightKeys={selectedRightKeys}
                onChange={handleTransferChange}
                onSelectLeftChange={setSelectedLeftKeys}
                onSelectRightChange={setSelectedRightKeys}
                leftTitle="سریال های موجود"
                rightTitle="سریال های ناموجود انتخاب شده"
                style={{ height: '100%', border: '1px solid #f0f0f0', borderRadius: '8px' }}
            />
        </div>
    )
}

export default ListOfProductsAttachedToSerialsTransfer;