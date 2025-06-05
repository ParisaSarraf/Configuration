import { Card, Table, Button, message, Modal } from 'antd'
import { useDeleteExperience, useProductExperienceById, usExperienceList } from '../../QueryServises/experienceQuery';
import { useProductContext } from '../../Services/Context/ProductContext';
import ExperienceModal from './components/ExperienceModal';
import ExperienceCol from './components/ExperienceCol';
import useModal from '../../hooks/useModal';

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
            type: 'add'
        })
    }


    return (
        <Card
            title={` اسناد ${currentProduct?.name || ''}`}
            extra={
                <>
                    <ExperienceModal
                        currentProduct={currentProduct}
                        isOpen={isOpen}
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
                columns={ExperienceCol({ handleDelete, handleEdit })}
                dataSource={data}
                locale={{ emptyText: 'هیچ داده ای وجود ندارد' }}
            />
        </Card >
    )
}

export default Experience