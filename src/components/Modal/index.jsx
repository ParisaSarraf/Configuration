import {Modal as MDL, Button} from 'antd';

const Modal = ({
                   isOpen,
                   size = 200,
                   title,
                   onClose = () => {
                   },
                   onSubmit = () => {
                   },
                   children,
                   loading,
                   footer,
                   mode = 'add',
                   className
               }) => {


    const modalFooter = footer ? false : [
        <Button key="submit" type="primary" loading={loading} onClick={onSubmit}>
            {mode === 'edit' ? 'ویرایش' : 'تایید'}
        </Button>,
        <Button key="back" onClick={onClose}>
            بستن
        </Button>,
    ];
    return (
        <MDL
            open={isOpen}
            width={size}
            title={title}
            onClose={onClose}
            centered
            className={className}
            onOk={onSubmit}
            onCancel={onClose}
            footer={modalFooter}
            modalRender={(node) => (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backdropFilter: 'blur(2px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        }}
                    />
                    {node}
                </>
            )}
        >
            {children}
        </MDL>
    );
};
export default Modal;
