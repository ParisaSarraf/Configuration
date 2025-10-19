import { message, Modal } from "antd";
import {
  useDeletePersonalityProduct,
  usePersonalityProductList,
} from "../../../../../QueryServises/personalityQuery";
import Tree from "../../../../../components/Tree/index";

const PersonalityTree = ({
  setModal,
  setPersonalityId,
  setSelectedPersonalityLabel,
}) => {
  const { data, isFetching, isError, refetch } = usePersonalityProductList();
  const { mutate: deletePersonality, isPending: isDeleting } =
    useDeletePersonalityProduct();

  const transformDataToTreeFormat = (PersonalityData) => {
    if (!PersonalityData) return [];

    return PersonalityData.map((item) => ({
      title: (
        <span>
          {item?.name ? ` ${item.name}  (${item.warehouse_code})` : node.name}
        </span>
      ),
      key: `personality-${item.id}`,
      id: item.id,
      name: item.name,
      parentId: item.parent,
      children:
        item.children && item.children.length > 0
          ? transformDataToTreeFormat(item.children)
          : undefined,
      isLeaf: !item.children || item.children.length === 0,
    }));
  };
  const handleRightClickAction = (actionKey, node) => {
    const personalityId = node.id;
    if (actionKey === "delete") {
      Modal.confirm({
        title: "حذف هویت",
        content: "آیا از حذف این هویت مطمئن هستید؟",
        okText: "بله",
        cancelText: "خیر",
        okType: "danger",
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
      });
    } else if (actionKey === "edit") {
      setModal({
        mode: "edit",
        data: {
          id: node.id,
          name: node.name,
          parentId: node.parentId,
        },
        type: "addPersonality",
      });
    }
  };

  return (
    <Tree
      //   className="custom-product-tree"
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
        emptyText: "هیچ چرخه عمر محصولی یافت نشد",
      }}
      onSelect={(selectedKeys, info) => {
        if (info.node && info.node.id) {
          setPersonalityId(info.node.id);
          setSelectedPersonalityLabel(info?.node?.name);
        } else {
          setPersonalityId(null);
        }
      }}
    />
  );
};

export default PersonalityTree;
