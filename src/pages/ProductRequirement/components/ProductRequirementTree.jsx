import { Button, Card, message, Modal, Space } from 'antd'
import { useProductContext } from '../../../Services/Context/ProductContext';
import Icon, { DeleteOutlined, FileExclamationTwoTone, PlusOutlined, RightOutlined, SmileFilled } from '@ant-design/icons';
import Tree from '../../../components/Tree';
import useModal from '../../../hooks/useModal';
import DescribeTheRequirementModal from './DescribeTheRequirementModal';
import AcknowledgmentOfRequirement from './AcknowledgmentOfRequirement';
import { useDeleteProductRequirement, useProductRequirementList } from '../../../QueryServises/productRequirementQuery';
import { Chip, IconButton, SliderMarkLabel } from '@mui/material';

const ProductRequirementTree = ({ currentProduct, selectProduct, setSelectedProductRequirement }) => {
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();
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
                    className="w-full flex"
                    onDoubleClick={() => {
                        setModal({ mode: 'view', data: node, type: 'AcknowledgmentOfRequirement' })
                    }}
                >
                    <div className='flex justify-start'>
                        <span >{node.persian_title}</span>
                    </div>
                    <div className='flex justify-end'>

                        <Chip
                            icon={<RightOutlined size={'small'} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setModal({ mode: 'add', data: node, type: 'AcknowledgmentOfRequirement' })
                            }}
                            size='small'
                        // className="text-yellow-500 hover:text-yellow-700 "
                        />
                        <Chip
                            icon={<DeleteOutlined />}
                            color='primary'
                            // className="text-red-500 hover:text-red-700 "
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(node)
                            }}
                            size='small'

                        />
                        <Chip
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setModal({ mode: 'add', data: null, type: 'DescribeTheRequirementModal' })
                            }}
                            // className="text-blue-500 hover:text-blue-700 bg-white"
                            size='small'

                        />
                    </div>
                </div>
            ),
            english_title: node.english_title,
            id: node.id,
            is_definable: node.is_definable,
            code: node.code,
            life_cycle: node.life_cycle,
            product_requirements: node.product_requirements,  // ✅ اضافه شد
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
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => setModal({ mode: 'add', data: null, type: "DescribeTheRequirementModal" })}
                    className={'modal-button'}
                />
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
                    if (node?.product_requirements?.[0]?.id) {
                        setSelectedProductRequirement(node.product_requirements[0].id);
                    }
                }}
                onDoubleClick={(event, node) => {
                    setModal({ mode: 'add', data: node, type: 'AcknowledgmentOfRequirement' })
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
