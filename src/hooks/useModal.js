import {useReducer} from "react";

const initialState = {
    isOpen: false,
    modalType: null,
    modalMode: null,
    modalData: null,
};

function modalReducer(state, action) {
    switch (action.type) {
        case 'OPEN_MODAL':
            return {
                ...state,
                isOpen: true,
                modalType: action.payload.type,
                modalMode: action.payload.mode,
                modalData: action.payload.data,
            };
        case 'CLOSE_MODAL':
            return initialState;
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

const useModal = () => {
    const [state, dispatch] = useReducer(modalReducer, initialState);

    const setModal = (payload) => dispatch({type: 'OPEN_MODAL', payload});
    const closeModal = () => dispatch({type: 'CLOSE_MODAL'});

    return {
        ...state,
        setModal,
        closeModal,
    };
};
export default useModal;