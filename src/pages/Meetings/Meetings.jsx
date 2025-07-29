import {Button, Card, Tabs} from "antd";
import useModal from "@/hooks/useModal.js";
import MeetingsModal from "@/pages/Meetings/components/MeetingsModal.jsx";
import {useDeleteMeeting, useGetProductMeetings} from "@/QueryServises/MeetingQuery/index.js";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import IndependentMinutes from "@/pages/Meetings/components/IndependentMinutes/IndependentMinutes.jsx";
import MinutesRelatedToActivities
    from "@/pages/Meetings/components/MinutesRelatedToActivities/MinutesRelatedToActivities.jsx";
import {PlusOutlined} from "@ant-design/icons";
import DetailModal from "./components/DetailModal";
import ActivityModal from "@/pages/Activity/components/ActivityModal.jsx";

const Meetings = () => {
    const {currentProduct} = useProductContext();
    const {setModal, closeModal, isOpen, modalData, modalMode, modalType} = useModal();

    const {data: meetingData, refetch} = useGetProductMeetings(currentProduct?.id);
    const {mutateAsync: deleteMeeting} = useDeleteMeeting()
    const safeMeetingData = meetingData || [];

    const meetingsWithActivities = safeMeetingData?.filter(item => item.meeting_activities?.length > 0);
    const independentMeetings = safeMeetingData?.filter(item => !item.meeting_activities?.length);

    const items = [
        {
            label: "مصوبات",
            key: '1',
            children:
                <MinutesRelatedToActivities
                    currentProduct={currentProduct}
                    setModal={setModal}
                    meetingData={meetingsWithActivities}
                    deleteMeeting={deleteMeeting}
                    refetch={refetch}
                />
        },
        {
            label: `صورتجلسات`,
            key: '2',
            children:
                <IndependentMinutes
                    currentProduct={currentProduct}
                    setModal={setModal}
                    meetingData={independentMeetings}
                    deleteMeeting={deleteMeeting}
                    refetch={refetch}
                />,
        }
    ];

    return (
        <Card title='صورت جلسات'
              extra={
                  <Button
                      className={'modal-button'}
                      onClick={() => setModal({mode: 'add', data: null, type: 'addOrEdirMeeting'})}
                      icon={<PlusOutlined/>}
                      title='صورت جلسات'
                  />
              }>
            <Tabs items={items} type="card"/>

            <MeetingsModal
                isOpen={modalType === 'addOrEdirMeeting' && isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                modalType={modalType}
                refetch={refetch}
                currentProduct={currentProduct}
            />

            <DetailModal
                isOpen={modalType === 'detailModal' && isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                modalType={modalType}
            />

            <ActivityModal
                isOpen={modalType === 'addActivitiesMeetings' && isOpen}
                currentProduct={currentProduct}
                closeModal={closeModal}
                modalMode={modalMode}
                modalData={modalData}
                refetch={refetch}
                modalType={modalType}
            />
        </Card>
    );
};

export default Meetings;