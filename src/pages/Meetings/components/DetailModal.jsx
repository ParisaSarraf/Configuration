import Modal from "../../../components/Modal";

const DetailModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
}) => {
    if (!modalData) return null;

    const { precinct, user, experiment_text, file, code, registration_date } = modalData;

    console.log(modalData);

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات تجارب ثبت شده"
            size={700}
            onClose={closeModal}
            footer={false}
            mode={modalMode}
        >
            {/* {
                { if(modalType === 'MeetingDetail') && {

            }
    
}} */}
        </Modal>
    )
}

export default DetailModal;