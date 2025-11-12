import { useEffect, useState } from "react";
import CTransfer from "../../../components/Transfer";
import {
    usePatchProductSerial,
    useProductSerialChildrenById,
    useProductSerialUnlinkedById
} from "../../../QueryServises/productSerialQuery";
import { Modal as Md, message } from "antd";

const ListOfProductsAttachedToSerialsTransfer = ({ selectedRowId, selectedParentId }) => {
    const { data: productSerialChildren, refetch: refetchChildren  , isLoading : Rightloading} = useProductSerialChildrenById(
        selectedRowId,
        { enabled: !!selectedRowId }
    );

    const { data: productSerialUnlinked, refetch: refetchUnlinked , isLoading : Leftloading} = useProductSerialUnlinkedById(
        selectedRowId,
        { enabled: !!selectedRowId }
    );

    const { mutateAsync: updateProductSerial } = usePatchProductSerial();

    const [leftData, setLeftData] = useState([]);
    const [rightData, setRightData] = useState([]);
    const [selectedLeftKeys, setSelectedLeftKeys] = useState([]);
    const [selectedRightKeys, setSelectedRightKeys] = useState([]);

    useEffect(() => {
        setLeftData([]);
        setRightData([]);
        setSelectedLeftKeys([]);
        setSelectedRightKeys([]);

        const processData = (data) => {
            if (!data) return [];
            if (Array.isArray(data)) {
                return data
                    .filter((item) => item?.id && item?.serial)
                    .map((item) => ({
                        key: item.id.toString(),
                        title: `${item.product?.persian_title || "محصول"}: ${item.serial}`,
                    }));
            }
            return Object.entries(data).flatMap(([personName, items]) =>
                (Array.isArray(items) ? items : []).map((item) => ({
                    key: item.id.toString(),
                    title: `${personName}: ${item.serial}`,
                }))
            );
        };

        const right = processData(productSerialChildren);
        const left = processData(productSerialUnlinked);
        setLeftData(left);
        setRightData(right);
    }, [selectedRowId, productSerialChildren, productSerialUnlinked]);

    const handleAdd = async () => {
        if (selectedLeftKeys.length === 0) return;
        Md.confirm({
            title: "اتصال سریال",
            content: "آیا از اتصال این سریال مطمئن هستید؟",
            okText: "بله",
            cancelText: "خیر",
            onOk: async () => {
                const payload = {
                    id: selectedLeftKeys,
                    parent_id: selectedParentId
                }
                try {
                    await updateProductSerial(payload);
                    await refetchChildren();
                    await refetchUnlinked();
                    setSelectedLeftKeys([]);
                    message.success("با موفقیت متصل شد.")

                } catch (error) {
                    console.error(error);
                }
            },
        });
    };

    const handleDelete = async () => {
        if (selectedRightKeys.length === 0) return;
        Md.confirm({
            title: "حذف سریال",
            content: "آیا از حذف این سریال مطمئن هستید؟",
            okText: "بله",
            cancelText: "خیر",
            onOk: async () => {
                const payload = {
                    id: selectedRightKeys,
                    parent_id: null
                }
                try {
                    await updateProductSerial(payload);
                    await refetchChildren();
                    await refetchUnlinked();
                    setSelectedRightKeys([]);
                } catch (error) {
                    console.error(error);
                }
            },
        });
    };

    return (
        <div className="h-full">
            <CTransfer
                leftDataSource={leftData}
                rightDataSource={rightData}
                Leftloading={Leftloading}
                Rightloading={Rightloading}
                selectedLeftKeys={selectedLeftKeys}
                selectedRightKeys={selectedRightKeys}
                onSelectLeftChange={setSelectedLeftKeys}
                onSelectRightChange={setSelectedRightKeys}
                onAdd={handleAdd}
                onDelete={handleDelete}
                rightTitle="سریال‌های متصل"
                leftTitle="سریال‌های نامتصل"
                style={{ height: "100%" }}
            />
        </div>
    );
};

export default ListOfProductsAttachedToSerialsTransfer;
