import { useRef, useState } from "react";
import { Button, Modal as MDL } from "antd";
import Draggable from "react-draggable";

const Modal = ({
  isOpen,
  size = 800,
  title,
  onClose = () => {},
  onSubmit = () => {},
  children,
  loading,
  footer,
  mode = "add",
  className,
  ...rest
}) => {
  const dragRef = useRef(null);

  const [disabled, setDisabled] = useState(true);

  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });

  const onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = document.documentElement;

    const targetRect = dragRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const modalFooter = footer
    ? [
        <Button key="submit" type="primary" loading={loading} onClick={onSubmit}>
          {mode === "edit" ? "ویرایش" : "تایید"}
        </Button>,
        <Button key="back" onClick={onClose}>
          بستن
        </Button>,
      ]
    : null;

  return (
    <MDL
      open={isOpen}
      width={size}
      title={
        <div
          style={{
            width: "100%",
            cursor: "move",
            userSelect: "none",
          }}
        >
          {title}
        </div>
      }
      centered
      onCancel={onClose}
      onOk={onSubmit}
      className={className}
      footer={modalFooter}
      destroyOnClose
      {...rest}
      modalRender={(modal) => (
        <Draggable
          nodeRef={dragRef}
          disabled={disabled}
          bounds={bounds}
          onStart={onStart}
        >
          <div ref={dragRef}>
            <div
              onMouseEnter={() => setDisabled(false)}
              onMouseLeave={() => setDisabled(true)}
            >
              {modal}
            </div>
          </div>
        </Draggable>
      )}
    >
      {children}
    </MDL>
  );
};

export default Modal;