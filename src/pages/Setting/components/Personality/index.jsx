import { Button, Card, message, Modal, Spin, Table } from "antd";
import useModal from "../../../../hooks/useModal";
import {
  useCoreSettingsList,
  useDeleteCoreSetting,
} from "@/QueryServises/settingQuery/index.js";
import StandardCodeModal from "./components/standardCode/StandardCodeModal";
import PersonalityModal from "./components/Personality/PersonalityModal";
import PersonalityTree from "./components/PersonalityTree";
import { PlusOutlined } from "@ant-design/icons";
import { StandardCodeCol } from "./components/standardCode/StandardCodeCol";
import { useState } from "react";
import {
  useDeleteStandardCode,
  useStandardCodePersonalityById,
} from "@/QueryServises/StandardCodeQuery/index.js";

const Personality = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal, modalType } =
    useModal();
  const { data, isFetching, refetch } = useCoreSettingsList();
  const [PersonalityId, setPersonalityId] = useState(null);
  const { mutateAsync: deleteStandardCode } = useDeleteStandardCode();

  const { data: StandardPersonalityCodeList, refetch: standardRefetch } =
    useStandardCodePersonalityById(PersonalityId);
  const TableData = StandardPersonalityCodeList?.personality_codes?.map(
    (item) => ({
      ...item,
      parentData: StandardPersonalityCodeList,
    })
  );

  const { isPending: isDeleting } = useDeleteCoreSetting();
  const [selectedPersonalityLabel, setSelectedPersonalityLabel] = useState("");

  const handleDelete = (id) => {
    Modal.confirm({
      title: "حذف کد استاندارد",
      content: "آیا از حذف این کد استاندارد مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      async onOk() {
        try {
          await deleteStandardCode(id);
          message.success("کد استاندارد با موفقیت حذف شد");
          await standardRefetch();
          await refetch();
          closeModal();
        } catch (error) {
          message.error("حذف کد استاندارد با خطا مواجه شد");
          console.error("Delete error:", error);
        }
      },
    });
  };

  const handleEdit = (record) => {
    setModal({
      mode: "edit",
      data: { ...record },
      type: "addStandardCode",
    });
  };

  return (
    <Spin spinning={isFetching && !data} tip="در حال دریافت اطلاعات...">
      <div className="w-full flex justify-between gap-2">
        <Card
          className="w-full"
          title="مدیریت هویت"
          extra={
            <Button
              className="modal-button"
              icon={<PlusOutlined className="text-center" />}
              onClick={() =>
                setModal({ mode: "add", data: null, type: "addPersonality" })
              }
            />
          }
          loading={isFetching || isDeleting}
        >
          <PersonalityTree
            setModal={setModal}
            setPersonalityId={setPersonalityId}
            setSelectedPersonalityLabel={setSelectedPersonalityLabel}
          />
        </Card>
        <Card
          className="w-full"
          title="کد های استاندارد هویت"
          extra={
            <Button
              className="modal-button"
              icon={<PlusOutlined className="text-center" />}
              onClick={() =>
                setModal({ mode: "add", data: null, type: "addStandardCode" })
              }
            />
          }
        >
          <Table
            columns={StandardCodeCol({ handleDelete, handleEdit })}
            dataSource={TableData || []}
            rowKey="id"
            locale={{ emptyText: "هیچ کد استانداردی برای این هویت وجود ندارد" }}
            size="small"
            pagination={{
              defaultPageSize: 5,
              pageSizeOptions: [10, 20, 45, 100],
              size: "small",
              showSizeChanger: true,
            }}
          />
        </Card>

        <PersonalityModal
          isOpen={modalType === "addPersonality" && isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          setModal={setModal}
          refetch={refetch}
          modalType={modalType}
        />

        <StandardCodeModal
          PersonalityId={PersonalityId}
          selectedPersonalityLabel={selectedPersonalityLabel}
          isOpen={modalType === "addStandardCode" && isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          setModal={setModal}
          standardRefetch={standardRefetch}
          modalType={modalType}
        />
      </div>
    </Spin>
  );
};

export default Personality;
