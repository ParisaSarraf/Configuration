import { useState } from "react";

const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    modalType: null,
    modalMode: null,
    modalData: null,
  });

  const setModal = ({ type, mode, data }) => {
    setModalState({
      isOpen: true,
      modalType: type,
      modalMode: mode,
      modalData: data,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      modalType: null,
      modalMode: null,
      modalData: null,
    });
  };

  return {
    ...modalState,
    setModal,
    closeModal,
  };
};
export default useModal;
