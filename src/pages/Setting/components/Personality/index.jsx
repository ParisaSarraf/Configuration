import { Card, Spin } from 'antd';
import useModal from '../../../../hooks/useModal';
import {
    useCoreSettingsList,
    useDeleteCoreSetting
} from '../../../../QueryServises/settingQuery';
import PersonalityModal from './components/PersonalityModal';
import PersonalityTree from './components/PersonalityTree';

const Personality = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const {
        data,
        isFetching,
        refetch
    } = useCoreSettingsList();

    const { isPending: isDeleting } = useDeleteCoreSetting();


    return (
        <Spin spinning={isFetching && !data} tip="در حال دریافت اطلاعات...">
            <Card
                title="مدیریت هویت"
                extra={
                    <PersonalityModal
                        isOpen={isOpen}
                        modalMode={modalMode}
                        modalData={modalData}
                        closeModal={closeModal}
                        setModal={setModal}
                        refetch={refetch}
                    />
                }
                loading={isFetching || isDeleting}
            >
                <PersonalityTree setModal={setModal} />
            </Card>
        </Spin>
    );
};

export default Personality;