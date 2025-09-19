import {Button, Card, message, Modal, Space} from 'antd'
import {DeleteOutlined, PlusOutlined, RightOutlined} from '@ant-design/icons';
import Tree from '../../../components/Tree';
import useModal from '../../../hooks/useModal';
import DescribeTheRequirementModal from './DescribeTheRequirementModal';
import AcknowledgmentOfRequirement from './AcknowledgmentOfRequirement';
import {useDeleteProductRequirement, useProductRequirementList} from '../../../QueryServises/productRequirementQuery';

const ProductRequirementTree = ({currentProduct, selectProduct, setSelectedProductRequirement}) => {
    const {isOpen, modalMode, modalData, modalType, setModal, closeModal} = useModal();
    const {data: requirementList, isLoading, isError, refetch} = useProductRequirementList(currentProduct?.id);
    const {mutateAsync: deleteProductRequirement} = useDeleteProductRequirement();


    const handleDelete = (node) => {
        const NodeId = node?.product_requirements[0]?.id
        Modal.confirm({
            title: "حذف الزام",
            content: "از حذف مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            async onOk() {
                try {
                    await deleteProductRequirement(NodeId)
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

    const transformRequirementNode = (node) => {
        const req = node.product_requirements;
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;

        const baseNode = {
            key: `req-${node.id}`,
            title: (
                <div className="flex flex-row justify-between items-center w-full">
                        <span className='w-full gap-2'>
                    {req?.full_code
                        ? `${node.persian_title} - ${req.full_code}`
                        : node.persian_title}
                </span>
                    <Space>
                        <Button
                            size={'small'}
                            type={'text'}
                            icon={<RightOutlined/>}
                            onClick={(e) => {
                                e.stopPropagation();
                                setModal({mode: 'add', data: node, type: 'AcknowledgmentOfRequirement'})
                            }}
                            className="text-sky-500 hover:text-sky-700"
                        />
                        <Button
                            type={'text'}
                            size={'small'}
                            icon={<DeleteOutlined/>}
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(node)
                            }}
                        />
                        <Button
                            type={'text'}
                            size={'small'}
                            icon={<PlusOutlined/>}
                            onClick={(e) => {
                                e.stopPropagation();
                                setModal({mode: 'add', data: null, type: 'DescribeTheRequirementModal'})
                            }}
                            className="text-orange-500 hover:text-orange-700"
                        />
                    </Space>
                </div>
            ),
            id: node.id,
            requirement: req,
            is_definable: node.is_definable,
            children: []
        };

        if (hasChildren) {
            const childNodes = node.children.map((child) => transformRequirementNode(child));
            baseNode.children.push(...childNodes);
        }

        return baseNode;
    };

    const transformRequirementDataToTreeView = (data) => {
        if (!data) return [];
        return Array.isArray(data) ? data.map(transformRequirementNode) : [transformRequirementNode(data)];
    };

    const treeRequirementData = transformRequirementDataToTreeView(requirementList);


    return (
        <Card title={`الزامات محصول ${currentProduct?.name || ''}`} extra={
            <>
                <Button
                    icon={<PlusOutlined/>}
                    onClick={() => setModal({mode: 'add', data: null, type: "DescribeTheRequirementModal"})}
                    className={'modal-button'}
                />
            </>
        }>
            <Tree
                mode='tree'
                // className="custom-tree"
                data={treeRequirementData}
                isLoading={isLoading}
                isError={isError}
                showLine={true}
                checkable={false}
                onSelect={(selectedKeys, {node}) => {
                    if (node?.product_requirements?.[0]?.id) {
                        setSelectedProductRequirement(node.product_requirements[0].id);
                    }
                }}
                onDoubleClick={(event, node) => {
                    setModal({mode: 'add', data: node, type: 'AcknowledgmentOfRequirement'})
                }}
            />
            {modalType === 'DescribeTheRequirementModal' && (
                <DescribeTheRequirementModal
                    isOpen={isOpen}
                    selectProduct={selectProduct}
                    modalMode={modalMode}
                    modalData={modalData}
                    setModal={setModal}
                    closeModal={closeModal}
                    currentProduct={currentProduct}
                    refetch={refetch}
                />
            )}
            {modalType === 'AcknowledgmentOfRequirement' && (
                <AcknowledgmentOfRequirement
                    selectProduct={selectProduct}
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                    refetch={refetch}
                    currentProduct={currentProduct}
                />
            )}

        </Card>
    )
}

export default ProductRequirementTree
