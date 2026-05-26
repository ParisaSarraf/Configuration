import {Spin, Table} from 'antd';
import {useGetProductDocumentReport} from '@/QueryServises/ReportsQuery/index.js';
import ReportCols from './ReportCols.jsx';
import useModal from '../../../../hooks/useModal.js';
import {useProductContext} from '../../../../Services/Context/ProductContext.jsx';
import CombineFiles from '../../../ProductDocument/components/CombineFiles/CombineFiles.jsx';
import DetailModal from '../../../../components/DetailModal/DetailModal.jsx';

const StateSpecificTable = ({productId, state, filters = {}}) => {
    const {setModal, modalData, modalMode, modalType, isOpen, closeModal} = useModal();
    const {currentProduct} = useProductContext();
    let finalFilters = {...filters};
    if (state !== null) {
        finalFilters.states = state;
    } else {
        delete finalFilters.states;
    }
    const {data: reportData, isLoading, refetch} = useGetProductDocumentReport(
        productId,
        finalFilters,
        {
            enabled: !!productId,
        }
    );
    if (isLoading) {
        return <div style={{textAlign: 'center', margin: '20px 0'}}><Spin/></div>;
    }
    const handleShowDetailEdition = (edition) => {
        setModal({
            mode: "add",
            data: edition,
            type: "SpecificEditionDetail",
        })
    }

    const handleAutomationFiles = (edition) => {
        setModal({mode: 'add', data: edition, type: "SpecificAutomationFiles"});
    }
    return (
        <>
            <Table
                size="small"
                scroll={{x: 'max-content'}}
                columns={ReportCols({handleShowDetailEdition, handleAutomationFiles})}
                    dataSource={reportData || []}
                bordered
                rowKey="id"
                pagination={{
                    defaultPageSize: 5,
                    pageSizeOptions: [10, 20, 45, 100],
                    size: "small",
                    showSizeChanger: true,
                }}
            />

            <CombineFiles
                isOpen={modalType === 'SpecificAutomationFiles' && isOpen}
                modalData={modalData}
                modalMode={modalMode}
                modalType={modalType}
                closeModal={closeModal}
                refetch={refetch}
                currentProduct={currentProduct}
            />

            <DetailModal
                isOpen={modalType === 'SpecificEditionDetail' && isOpen
                }
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                modalType={modalType}
            />
        </>
    );
};

export default StateSpecificTable;