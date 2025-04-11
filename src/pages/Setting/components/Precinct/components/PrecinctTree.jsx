import { message, Modal } from "antd";
import Tree from "../../../../../components/Tree";
import { useDeletePrecinctProduct, usePrecinctProductList } from "../../../../../QueryServises/precinctQuery";

const PrecinctTree = ({ setModal }) => {
    const {
        data,
        isFetching,
        isError,
        refetch
    } = usePrecinctProductList();
    const { mutate: deletePrecinct, isPending: isDeleting } = useDeletePrecinctProduct();

    const transformDataToTreeFormat = (PrecinctData) => {
        if (!PrecinctData) return [];
        return PrecinctData.map(item => ({
            title: item.title,
            key: `Precinct-${item.id}`,
            id: item.id,
            name: item.name,
            parentId: item.parent || null,
            is_definable: item.is_definable || false,
            life_cycle_id: item.life_cycle_id || null,
            children: item.children && item.children.length > 0
                ? transformDataToTreeFormat(item.children)
                : undefined,
            isLeaf: !item.children || item.children.length === 0
        }));
    };

    const handleRightClickAction = (actionKey, node) => {
        const precinctId = node.id;
        if (actionKey === "delete") {
            Modal.confirm({
                title: 'حذف حوزه',
                content: 'آیا از حذف این حوزه مطمئن هستید؟',
                okText: 'بله',
                cancelText: 'خیر',
                okType: 'danger',
                onOk() {
                    return new Promise((resolve, reject) => {
                        deletePrecinct(precinctId, {
                            onSuccess: () => {
                                message.success("حوزه با موفقیت حذف شد");
                                refetch();
                                resolve();
                            },
                            onError: () => {
                                message.error("حذف حوزه با خطا مواجه شد");
                                reject();
                            },
                        });
                    });
                },
                onCancel() {
                    console.log('حذف لغو شد');
                },
            });
        } else if (actionKey === "edit") {
            setModal({
                mode: "edit",
                data: {
                    id: node.id,
                    title: node.title,
                    parent_id: node.parentId || null,
                    is_definable: node.is_definable || false,
                    life_cycle_id: node.life_cycle_id || null
                }
            });
        }
    }

    return (
        <Tree
            // className="custom-tree"
            data={transformDataToTreeFormat(data)}
            isLoading={isFetching || isDeleting}
            isError={isError}
            showLine
            blockNode
            checkable={false}
            showRightClickMenu={true}
            rightClickMenuItems={[
                { key: "edit", label: "ویرایش" },
                { key: "delete", label: "حذف", danger: true },
            ]}
            onRightClickAction={handleRightClickAction}
        />
    );
}

export default PrecinctTree;