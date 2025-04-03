import { message, Modal } from "antd";
import { useDeleteGenusProduct, useGenusProductList } from "../../../../../QueryServises/genusQuery";
import Tree from "../../../../../components/Tree";

const GenusTree = ({ setModal }) => {
    const {
        data,
        isFetching,
        isError,
        refetch
    } = useGenusProductList();
    const { mutate: deleteGenus, isPending: isDeleting } = useDeleteGenusProduct();

    const transformDataToTreeFormat = (genusData) => {
        if (!genusData) return [];
        return genusData.map(item => ({
            title: item.name,
            key: `genus-${item.id}`,
            id: item.id,
            name: item.name,
            parentId: item.parent,
            children: item.children && item.children.length > 0
                ? transformDataToTreeFormat(item.children)
                : undefined,
            isLeaf: !item.children || item.children.length === 0
        }));
    };


    const handleRightClickAction = (actionKey, node) => {
        const genusId = node.id;
        if (actionKey === "delete") {
            Modal.confirm({
                title: 'حذف جنس',
                content: 'آیا از حذف این جنس مطمئن هستید؟',
                okText: 'بله',
                cancelText: 'خیر',
                okType: 'danger',
                onOk() {
                    return new Promise((resolve, reject) => {
                        deleteGenus(genusId, {
                            onSuccess: () => {
                                message.success("جنس با موفقیت حذف شد");
                                refetch();
                                resolve();
                            },
                            onError: () => {
                                message.error("حذف جنس با خطا مواجه شد");
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
                    name: node.name,
                    parentId: node.parentId
                }
            });
        }
    };

    return (
        <Tree
            className="custom-tree"
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

export default GenusTree;