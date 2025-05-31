import { Button, Card, message, Modal, Space } from 'antd'
import { useProductContext } from '../../../Services/Context/ProductContext';
import { DeleteOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import Tree from '../../../components/Tree';
import useModal from '../../../hooks/useModal';
import DescribeTheRequirementModal from './DescribeTheRequirementModal';
import AcknowledgmentOfRequirement from './AcknowledgmentOfRequirement';
import { useDeleteProductRequirement, useProductRequirementList } from '../../../QueryServises/productRequirementQuery';

const ProductRequirementTree = () => {
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();
    const { currentProduct } = useProductContext();
    const { data: requirementList, isLoading, isError, refetch } = useProductRequirementList(currentProduct?.id);
    const { mutateAsync: deleteProductRequirement } = useDeleteProductRequirement();


    const handleDelete = (node) => {
        const NodeId = node?.product_requirements[0]?.id
        Modal.confirm({
            title: "حذف الزام",
            content: "از حذف مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            onOk() {
                try {
                    deleteProductRequirement(NodeId)
                    message.success("نسخه با موفقیت حذف شد");
                    refetch();
                } catch (error) {
                    message.error(error?.detail);
                    console.error(error);
                }
            },
            onCancel() {
                message.warning("عملیات حذف لغو شد");
            }
        });

    }

    const transformDataToTreeView = (requirementList) => {
        if (!requirementList) return [];
        const transformNode = (node) => ({
            title: (
                <div
                    className="flex flex-row -mt-2 justify-between items-center w-full h-3"
                    onDoubleClick={() => {
                        setModal({ mode: 'view', data: node, type: 'AcknowledgmentOfRequirement' })
                    }}
                >
                    <span className="mr-8 -mt-5">{node.persian_title}</span>
                    <Space className="-mt-4">
                        <Button
                            type="text"
                            icon={<RightOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setModal({ mode: 'add', data: null, type: 'AcknowledgmentOfRequirement' })
                            }}
                            className="text-yellow-500 hover:text-yellow-700 "
                        />
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(node)
                            }}
                        />
                        <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setModal({ mode: 'add', data: null, type: 'DescribeTheRequirementModal' })
                            }}
                            className="text-blue-500 hover:text-blue-700"
                        />
                    </Space>
                </div>
            ),
            english_title: node.english_title,
            id: node.id,
            is_definable: node.is_definable,
            code: node.code,
            life_cycle: node.life_cycle,
            children: node.children && node.children.length > 0
                ? node.children.map(child => transformNode(child))
                : undefined,
        });

        const productDoc = Array.isArray(requirementList) ? requirementList : [requirementList];
        return productDoc.map((document) => transformNode(document));
    };

    const treeData = transformDataToTreeView(requirementList);


    return (
        <Card title={`الزامات محصول ${currentProduct?.name || ''}`} extra={
            <>
                <Button icon={<PlusOutlined />} onClick={() => setModal({ mode: 'add', data: null, type: "DescribeTheRequirementModal" })} />
            </>
        }>
            <Tree
                mode="tree"
                data={treeData}
                isLoading={isLoading}
                isError={isError}
                showLine={true}
                checkable={true}
                onSelect={(selectedKeys, { node }) => {
                }}
                onDoubleClick={(event, node) => {
                    setModal({ mode: 'view', data: node, type: 'AcknowledgmentOfRequirement' })
                }}
            />
            {modalType === 'DescribeTheRequirementModal' && (
                <DescribeTheRequirementModal
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    setModal={setModal}
                    closeModal={closeModal}
                    currentProduct={currentProduct}
                />
            )}
            {modalType === 'AcknowledgmentOfRequirement' && (
                <AcknowledgmentOfRequirement
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                    currentProduct={currentProduct}
                />
            )}

        </Card>
    )
}

export default ProductRequirementTree
