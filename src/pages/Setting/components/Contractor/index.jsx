import { Card, Modal, Table } from "antd"
import ContractorModal from "./components/ContractorModal"
import { useProductContext } from "../../../../Services/Context/ProductContext";
import { useContractorProductList, useDeleteContractorProduct } from "../../../../QueryServises/ProductContractorQuery";
import useModal from "../../../../hooks/useModal";
import { ContractorCols } from "./components/ContractorCols";

const Contractor = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const { data: contractorData, refetch } = useContractorProductList()
    const { currentProduct } = useProductContext();
    const { mutateAsync: deleteContractor } = useDeleteContractorProduct()


    console.log(contractorData);


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
            onCancel() {
                console.log('حذف لغو شد');
            },
        });
    }

    const handleEdit = (record) => {
        setModal({ mode: 'edit', data: record })
    }
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
            <Table
                dataSource={contractorData} columns={ContractorCols({ handleDelete, handleEdit })} size="small" />
        </Card>
    )
}

export default Contractor
