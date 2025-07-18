import { Button, Card, Modal, Spin, Table } from 'antd';
import useModal from '../../../../hooks/useModal';
import {
    useCoreSettingsList,
    useDeleteCoreSetting
} from '../../../../QueryServises/settingQuery';
import StandardCodeModal from './components/standardCode/StandardCodeModal';
import PersonalityModal from './components/Personality/PersonalityModal';
import PersonalityTree from './components/PersonalityTree';
import { PlusOutlined } from '@ant-design/icons';
import { StandardCodeCol } from './components/standardCode/StandardCodeCol';
import { useState } from 'react';
import { useDeletePersonalityProduct } from '../../../../QueryServises/personalityQuery';
import { useDeleteStandardCode, useStandardCodePersonalityById } from '../../../../QueryServises/StandardCodeQuery';

const Personality = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal, modalType } = useModal();
    const {
        data,
        isFetching,
        refetch
    } = useCoreSettingsList();
    const [PersonalityId, setPersonalityId] = useState(null);
    const { mutateAsync: deleteStandardCode } = useDeleteStandardCode();

    const { data: StandardPersonalityCodeList, refetch: standardRefetch } = useStandardCodePersonalityById(PersonalityId)

    const { isPending: isDeleting } = useDeleteCoreSetting();

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'حذف کد استاندارد',
            content: 'آیا از حذف این کد استاندارد مطمئن هستید؟',
            okText: 'بله',
            cancelText: 'خیر',
            okType: 'danger',
            async onOk() {
                try {
                    await deleteStandardCode(id)
                    message.success("کد استاندارد با موفقیت حذف شد");
                    await standardRefetch();
                } catch (error) {
                    message.error("حذف کد استاندارد با خطا مواجه شد");
                    console.error("Delete error:", error);
                }
            },
            onCancel() {
                console.log('حذف لغو شد');
            },
        });
    };
    const handleEdit = (record) => {
        setModal({
            mode: 'edit',
            data: record,
            type: 'addStandardCode'
        });
    }



    return (
        <Spin spinning={isFetching && !data} tip="در حال دریافت اطلاعات..." >
            <div className='w-full flex justify-between gap-2'>
                <Card
                    className='w-full'
                    title="مدیریت هویت"
                    extra={
                        <Button
                            className="modal-button"
                            icon={<PlusOutlined className="text-center" />}
                            onClick={() => setModal({ mode: "add", data: null, type: 'addPersonality' })}
                        />
                    }
                    loading={isFetching || isDeleting}
                >
                    <PersonalityTree setModal={setModal} setPersonalityId={setPersonalityId} />
                </Card>
                <Card
                    className='w-full'
                    title='کد های استاندارد هویت'
                    extra={
                        <Button
                            className="modal-button"
                            icon={<PlusOutlined className="text-center" />}
                            onClick={() => setModal({ mode: "add", data: null, type: 'addStandardCode' })}
                        />
                    }
                >
                    <Table
                        columns={StandardCodeCol({ handleDelete, handleEdit })}
                        dataSource={StandardPersonalityCodeList?.personality_codes || []}
                        rowKey="id"
                        loading={!StandardPersonalityCodeList?.personality_codes}
                        locale={
                            { emptyText: 'هیچ کد استانداردی برای این هویت وجود ندارد' }
                        }
                        size='small'
                    />
                </Card>


                <PersonalityModal
                    isOpen={modalType === 'addPersonality' && isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                    refetch={refetch}
                    modalType={modalType}
                />


                <StandardCodeModal
                    isOpen={modalType === 'addStandardCode' && isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                    standardRefetch={standardRefetch}
                    modalType={modalType}
                />



            </div>
        </Spin >
    );
};

export default Personality;