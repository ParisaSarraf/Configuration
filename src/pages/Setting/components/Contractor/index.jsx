import {Card, message, Modal, Table, Tabs} from "antd"
import ContractorModal from "./components/ContractorModal"
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import {useContractorProductList, useDeleteContractorProduct} from "@/QueryServises/ProductContractorQuery/index.js";
import useModal from "../../../../hooks/useModal";
import {ContractorCols} from "./components/ContractorCols";

const Contractor = () => {
    const {isOpen, modalMode, modalData, setModal, closeModal} = useModal();
    const {data: contractorData, refetch} = useContractorProductList()
    const {currentProduct} = useProductContext();
    const {mutateAsync: deleteContractor} = useDeleteContractorProduct()

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'حذف فعالیت',
            content: 'آیا از حذف این پیمانکار/کارفرما مطمئن هستید؟',
            okText: 'بله',
            cancelText: 'خیر',
            okType: 'danger',
            onOk() {
                return new Promise((resolve, reject) => {
                    deleteContractor(id, {
                        onSuccess: () => {
                            message.success("پیمانکار/کارفرما با موفقیت حذف شد");
                            refetch();
                            resolve();
                        },
                        onError: () => {
                            message.error("حذف پیمانکار/کارفرما با خطا مواجه شد");
                            reject();
                        },
                    });
                });
            },
        });
    }

    const handleEdit = (record) => {
        setModal({mode: 'edit', data: record})
    }


    const employersData = contractorData?.filter(item => item.is_employer === true) || [];
    const contractorsData = contractorData?.filter(item => item.is_employer === false) || [];

    const tabItems = [
        {
            key: 'employers',
            label: 'کارفرمایان',
            children: (
                <Table
                    dataSource={employersData}
                    columns={ContractorCols({handleDelete, handleEdit})}
                    size="small"
                    bordered
                    pagination={{
                        defaultPageSize: 5,
                        pageSizeOptions: [10, 20, 45,100],
                        size: "small",
                        showSizeChanger: true,
                    }}
                />
            )
        },
        {
            key: 'contractors',
            label: 'پیمانکاران',
            children: (
                <Table
                    bordered
                    dataSource={contractorsData}
                    columns={ContractorCols({handleDelete, handleEdit})}
                    size="small"
                    pagination={{
                        defaultPageSize: 5,
                        pageSizeOptions: [10, 20, 45,100],
                        size: "small",
                        showSizeChanger: true,
                    }}
                />
            )
        }
    ];

    return (
        <Card title='کارفرمایان/پیمانکاران'
              extra={
                  <ContractorModal
                      currentProduct={currentProduct}
                      isOpen={isOpen}
                      modalMode={modalMode}
                      modalData={modalData}
                      closeModal={closeModal}
                      setModal={setModal}
                      refetch={refetch}
                  />
              }
        >
            <Tabs items={tabItems}/>
        </Card>
    )
}

export default Contractor