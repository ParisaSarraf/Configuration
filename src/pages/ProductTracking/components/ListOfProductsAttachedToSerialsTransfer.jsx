import { useEffect, useState } from "react";
import CTransfer from "../../../components/Transfer";
import {
    usePatchProductSerial,
    useProductSerialChildrenById,
    useProductSerialUnlinkedById,
    useExportSerialDescendantsCsv,
} from "../../../QueryServises/productSerialQuery";
import { Dropdown, Modal as Md, message } from "antd";
import { FileExcelOutlined, ApartmentOutlined } from "@ant-design/icons";
import { handleDownload } from "@/utils/HandleDownload";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import SerialTreeModal from "./SerialList/SerialTreeModal";

const ListOfProductsAttachedToSerialsTransfer = ({ selectedRowId, selectedParentId, currentProduct }) => {
    const { data: productSerialChildren, refetch: refetchChildren  , isLoading : Rightloading} = useProductSerialChildrenById(
        selectedRowId,
        { enabled: !!selectedRowId }
    );

    const { data: productSerialUnlinked, refetch: refetchUnlinked , isLoading : Leftloading} = useProductSerialUnlinkedById(
        selectedRowId,
        { enabled: !!selectedRowId }
    );

    const { mutateAsync: updateProductSerial } = usePatchProductSerial();
    const exportDescendants = useExportSerialDescendantsCsv();
    const [treeSerial, setTreeSerial] = useState(null);
    useEffect(() => {
        setTreeSerial(null);
    }, [currentProduct?.id, selectedRowId]);

    const handleExportSerial = async (serialId) => {
        if (!serialId || exportDescendants.isPending) return;
        try {
            const blob = await exportDescendants.mutateAsync(serialId);
            handleDownload(
                window.URL.createObjectURL(blob),
                `serial_${serialId}_descendants.csv`,
            );
        } catch (error) {
            message.error(getApiErrorMessage(error, "دریافت خروجی سریال و زیرمجموعه‌های آن انجام نشد."));
        }
    };

    const renderSerialItem = (item, row) => (
        <Dropdown
            key={item.key}
            trigger={["contextMenu"]}
            menu={{
                items: [{
                    key: "export-descendants",
                    icon: <FileExcelOutlined />,
                    label: "خروجی سریال به همراه زیر مجموعه‌ها",
                    disabled: !item.serialId || exportDescendants.isPending,
                }, {
                    key: "show-tree",
                    icon: <ApartmentOutlined />,
                    label: "نمایش درخت سریال",
                    disabled: !item.serialId,
                }],
                onClick: ({ key, domEvent }) => {
                    domEvent?.stopPropagation();
                    if (key === "export-descendants")
                        return handleExportSerial(item.serialId);
                    if (key === "show-tree" && item.serialId)
                        setTreeSerial({ id: item.serialId, label: item.title });
                },
            }}
        >
            {row}
        </Dropdown>
    );

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
                        serialId: item.id,
                        title: `${item.product?.persian_title || "محصول"}: ${item.serial}`,
                    }));
            }
            return Object.entries(data).flatMap(([personName, items]) =>
                (Array.isArray(items) ? items : []).map((item) => ({
                    key: item.id.toString(),
                    serialId: item.id,
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
                renderItemWrapper={renderSerialItem}
                rightTitle="سریال‌های متصل"
                leftTitle="سریال‌های نامتصل"
                style={{ height: "100%" }}
            />
            <SerialTreeModal
                open={Boolean(treeSerial)}
                serialId={treeSerial?.id}
                serialLabel={treeSerial?.label}
                productId={currentProduct?.id}
                onClose={() => setTreeSerial(null)}
            />
        </div>
    );
};

export default ListOfProductsAttachedToSerialsTransfer;
