import { message, Modal } from "antd";
import { useDeleteRequirement, useRequirementList } from "../../../QueryServises/requirementQuery";

// Shared edit / delete handlers used by both the tree and the table.
const useRequirementActions = ({ setModal }) => {
    const { refetch } = useRequirementList();
    const { mutate: deleteRequirement } = useDeleteRequirement();

    const handleEdit = (node) => {
        setModal({
            mode: "edit",
            data: {
                id: node.id,
                code: node.code,
                persian_title: node.persian_title || node.title,
                english_title: node.english_title,
                life_cycle: node.life_cycle,
                is_definable: node.is_definable,
                parentId: node.parentId,
            },
        });
    };

    const handleDelete = (node) => {
        Modal.confirm({
            title: "حذف الزام",
            content: `آیا از حذف «${node.persian_title || node.title || ""}» مطمئن هستید؟`,
            okText: "بله، مطمئنم",
            cancelText: "خیر، منصرف شدم",
            okType: "danger",
            // returning a promise keeps the OK button in loading state, and the
            // dialog closes by itself once the promise settles
            onOk: () =>
                new Promise((resolve) => {
                    deleteRequirement(node.id, {
                        onSuccess: () => {
                            message.success("الزام با موفقیت حذف شد");
                            refetch();
                            resolve();
                        },
                        onError: (error) => {
                            const detail = error?.response?.data?.detail;
                            if (typeof detail === "string" && detail.includes("children")) {
                                message.error("این الزام دارای زیرمجموعه است");
                            } else {
                                message.error(
                                    typeof detail === "string" ? detail : "حذف الزام با خطا مواجه شد"
                                );
                            }
                            // resolve (not reject) so the dialog always closes
                            resolve();
                        },
                    });
                }),
        });
    };

    return { handleEdit, handleDelete };
};

export default useRequirementActions;
