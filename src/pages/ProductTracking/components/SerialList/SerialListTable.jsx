import { Button, Table, Tooltip } from 'antd'
import { SerialListCol } from './SerialListCol'
import { useProductSerialById } from '../../../../QueryServises/productSerialQuery'
import { PlusCircleOutlined } from '@ant-design/icons'

const SerialListTable = ({ isOpen, modalMode, modalData, closeModal, setModal, modalType, currentProduct }) => {
    const { data: productSerial, refetch } = useProductSerialById(currentProduct?.id)

    const handlAddProductSerial = () => {
        setModal({ mode: 'add', data: null, type: 'ProductSerial' })
    }

    return (
        <>
            <Tooltip title='افزودن سریال' className='mb-2'>
                <Button icon={<PlusCircleOutlined />} type='primary' onClick={handlAddProductSerial} />
            </Tooltip>
            <Table columns={SerialListCol} dataSource={productSerial} />
        </>
    )
}

export default SerialListTable
