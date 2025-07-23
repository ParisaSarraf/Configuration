import Modal from "../../../components/Modal";

const DetailModal = ({
    isOpen,
    modalMode,
    modalData,
    closeModal,
}) => {
    if (!modalData) return null;

    console.log(modalData);

    const { precinct, user, experiment_text, file, code, registration_date } = modalData;

    return (
        <Modal
            isOpen={isOpen}
            title="جزئیات تجارب ثبت شده"
            size={700}
            onClose={closeModal}
            footer={false}
            mode={modalMode}
        >
            if(modalType === 'detailModal') {
                (
                    <>
                    </>
                )
            } else {
                (
                    <>
                    </>
                )
            }
        </Modal>
    )
}

export default DetailModal;