import {Button, Card, Tabs} from "antd";
import useModal from "@/hooks/useModal.js";
import {PlusOutlined} from "@ant-design/icons";
import RequestOfWarehouseModal from "@/pages/RequestOfWarehouse/components/RequestOfWarehouseModal.jsx";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import {
    useGetUnConfirmedWareRequestById
} from "@/QueryServises/RequestOfWarehouse/index.js";
import {useEffect, useState} from "react";

import RequestOfWarehousePage
    from "@/pages/RequestOfWarehouse/components/RequestOfWarehousePage/RequestOfWarehousePage.jsx";
import RequestWareHouseTable
    from "@/pages/RequestOfWarehouse/components/RequestWareHouseTable/RequestWareHouseTable.jsx";
import ListOfRequestOfWareHouseMade
    from "@/pages/RequestOfWarehouse/components/ListOfRequestOfWareHouseMade/ListOfRequestOfWareHouseMade.jsx";


const RequestOfWarehouse = () => {
    const {currentProduct} = useProductContext();
    const {setModal, isOpen, closeModal, modalData, modalMode, modalType} = useModal();
    const productId = currentProduct?.id;
    const {data: requestWareHouseData, refetch} = useGetUnConfirmedWareRequestById(productId)
    const [selectedWareHouseId, setSelectedWareHouseId] = useState(null)
    const [selectedWareHouseType, setSelectedWareHouseType] = useState(null)

    useEffect(() => {
        setSelectedWareHouseId(null);
    }, [currentProduct?.id]);


    const items = [
        {
            key: '1',
            label: 'لیست درخواست خرید کالا از انبار',
            children:
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="col-span-1">
                            <RequestWareHouseTable
                                setSelectedWareHouseType={setSelectedWareHouseType}
                                key={currentProduct?.id}
                                currentProduct={currentProduct}
                                setSelectedWareHouseId={setSelectedWareHouseId}
                                setModal={setModal}
                                requestWareHouseData={requestWareHouseData}
                            />
                        </div>
                        <div className="col-span-1">
                            <RequestOfWarehousePage
                                selectedWareHouseId={selectedWareHouseId}
                                selectedWareHouseType={selectedWareHouseType}
                                currentProduct={currentProduct}
                                refetchUnconfirmed={refetch}
                            />
                        </div>
                    </div>
                </>
        },
        {
            key: '2',
            label: 'درخواست های انجام شده',
            children:
                <div>
                    <ListOfRequestOfWareHouseMade currentProduct={currentProduct} refetch={refetch}/>
                </div>
            ,

        }
    ];

    return (
        <Card
            title={` درخواست خرید کالا از انبار ${currentProduct?.name || ''}`}
            extra={
                <Button
                    onClick={() => setModal({mode: 'add', data: null, type: 'RequestOfWarehouse'})}
                    className={'modal-button'}
                    icon={<PlusOutlined/>}
                    title={'درخواست خرید کالا از انبار'}
                />
            }
        >
            <div>
                <Tabs
                    items={items}
                    type="card"
                />

                <RequestOfWarehouseModal
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalType={modalType}
                    modalData={modalData}
                    closeModal={closeModal}
                    currentProduct={currentProduct}
                    refetch={refetch}
                />
            </div>
        </Card>
    )

}

export default RequestOfWarehouse