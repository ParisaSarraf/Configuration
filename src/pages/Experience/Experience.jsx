// Experience.js
import { Card, Table, Button } from 'antd'
import { usExperienceList } from '../../QueryServises/experienceQuery';
import { useProductContext } from '../../Services/Context/ProductContext';
import ExperienceModal from './components/ExperienceModal';
import ExperienceCol from './components/ExperienceCol';
import { mockData } from './mockData';
import useModal from '../../hooks/useModal';

const Experience = () => {
    const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();
    // const { refetch } = usExperienceList()
    const { currentProduct } = useProductContext();

    return (
        <Card
            title={` اسناد ${currentProduct?.name || ''}`}
            extra={
                <>
                    <ExperienceModal
                        currentProduct={currentProduct}
                        isOpen={isOpen && modalType === 'add'}
                        modalMode={modalMode}
                        modalData={modalData}
                        modalType={modalType}
                        closeModal={closeModal}
                        setModal={setModal}
                        // refetch={refetch}
                    />
                </>
            }
        >
            <Table
                // columns={ExperienceCol()}
                // dataSource={mockData}
                // locale={{ emptyText: 'هیچ داده ای وجود ندارد' }}
            />
        </Card >
    )
}

export default Experience