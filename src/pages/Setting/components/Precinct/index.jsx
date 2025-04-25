import { Card, Spin } from 'antd';
import useModal from '../../../../hooks/useModal';
import {
    useCoreSettingsList,
    useDeleteCoreSetting
} from '../../../../QueryServises/settingQuery';
import PrecinctModal from './components/PrecinctModal';
import PrecinctTree from './components/PrecinctTree';

const Precinct = () => {
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
                title="مدیریت حوزه تجارب"
                extra={
                    <PrecinctModal
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
                <PrecinctTree setModal={setModal} />
            </Card>
        </Spin>
    );
};

export default Precinct;