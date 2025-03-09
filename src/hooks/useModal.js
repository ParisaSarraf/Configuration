import { useState } from "react";

function useModal () {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [modalData, setModalData] = useState(null);

  const setModal = ({ mode, data }) => {
    setModalMode(mode);
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalMode(null);
    setModalData(null);
  };

  return {
    isOpen,
    modalMode,
    modalData,
    setModal,
    closeModal,
  };
};


export default useModal