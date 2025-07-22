import { Card, Table, Button, message, Modal } from 'antd'
import { useDeleteExperience, useProductExperienceById, usExperienceList } from '../../QueryServises/experienceQuery';
import { useProductContext } from '../../Services/Context/ProductContext';
import ExperienceModal from './components/ExperienceModal';
import ExperienceCol from './components/ExperienceCol';
import useModal from '../../hooks/useModal';
import ExperienceDetailViewModal from './components/ExperienceDetailViewModal';

const Experience = () => {
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();
    const { currentProduct } = useProductContext();
    const { data, refetch } = useProductExperienceById(currentProduct?.id)
    const { mutateAsync: deleteExperience } = useDeleteExperience()

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'آیا مطمئن هستید که می‌خواهید این تجربه را حذف کنید؟',
            content: 'این عمل قابل بازگشت نیست.',
            okText: 'حذف',
            okType: 'danger',
            cancelText: 'لغو',
            onOk: async () => {
                try {
                    await deleteExperience(id)
                    message.success('تجربه با موفقیت حذف شد');
                    refetch();
                } catch (error) {
                    console.error('error delete', error);
                    message.error('خطا در حذف تجربه');
                }
            }
        });
    }

    const handleEdit = (record) => {
        setModal({
            mode: 'edit',
            data: record,
            type: 'addOrEdit'
        })
    }

    const handleShowDetail = (record) => {
        setModal({ mode: 'view', data: record, type: 'detial' })
    }

    return (
        <Card
            title={` تجارب و خرابی ${currentProduct?.name || ''}`}
            extra={
                <>
                    <ExperienceModal
                        currentProduct={currentProduct}
                        isOpen={modalType === 'addOrEdit' && isOpen}
                        modalMode={modalMode}
                        modalData={modalData}
                        modalType={modalType}
                        closeModal={closeModal}
                        setModal={setModal}
                        refetch={refetch}
                    />
                </>
            }
        >
            <Table
                columns={ExperienceCol({ handleDelete, handleEdit, handleShowDetail })}
                dataSource={data}
                locale={{ emptyText: 'هیچ داده ای وجود ندارد' }}
            />

            <ExperienceDetailViewModal
                isOpen={modalType === 'detial' && isOpen}
                modalMode={modalMode}
                modalType={modalType}
                modalData={modalData}
                closeModal={closeModal}
            />

        </Card>
    )
}

export default Experience