import { message, Modal } from "antd";
import Tree from "../../../../../components/Tree";
import { useDeletePersonalityProduct, usePersonalityProductList } from "../../../../../QueryServises/personalityQuery";

const PersonalityTree = ({ setModal }) => {
    const {
        data,
        isFetching,
        isError,
        refetch
    } = usePersonalityProductList();
    const { mutate: deletePersonality, isPending: isDeleting } = useDeletePersonalityProduct();



    const transformDataToTreeFormat = (PersonalityData) => {
        if (!PersonalityData) return [];
        return PersonalityData.map(item => ({
            title: item.name,
            key: `personality-${item.id}`,
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
        const personalityId = node.id;
        if (actionKey === "delete") {
            Modal.confirm({
                title: 'حذف هویت',
                content: 'آیا از حذف این هویت مطمئن هستید؟',
                okText: 'بله',
                cancelText: 'خیر',
                okType: 'danger',
                onOk() {
                    return new Promise((resolve, reject) => {
                        deletePersonality(personalityId, {
                            onSuccess: () => {
                                message.success("هویت با موفقیت حذف شد");
                                refetch();
                                resolve();
                            },
                            onError: () => {
                                message.error("حذف هویت با خطا مواجه شد");
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
            locale={{
                emptyText: 'هیچ چرخه عمر محصولی یافت نشد'
            }}
        />
    );
}

export default PersonalityTree;