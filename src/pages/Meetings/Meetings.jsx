import {Button, Card, Tabs} from "antd";
import useModal from "@/hooks/useModal.js";
import MeetingsModal from "@/pages/Meetings/components/MeetingsModal.jsx";
import {useDeleteMeeting, useGetProductMeetings} from "@/QueryServises/MeetingQuery/index.js";
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import IndependentMinutes from "@/pages/Meetings/components/IndependentMinutes/IndependentMinutes.jsx";
import MinutesRelatedToActivities
    from "@/pages/Meetings/components/MinutesRelatedToActivities/MinutesRelatedToActivities.jsx";

const Meetings = () => {
    const {currentProduct} = useProductContext();
    const {data: meetingData = [], refetch} = useGetProductMeetings(currentProduct?.id);
    const {mutateAsync: deleteMeeting} = useDeleteMeeting()

    const {setModal, closeModal, isOpen, modalData, modalMode, modalType} = useModal();

    const meetingsWithActivities = meetingData.filter(item => item.meeting_activities?.length > 0);
    const independentMeetings = meetingData.filter(item => !item.meeting_activities?.length);

    const items = [
        {
            label: "صورتجلسات مرتبط با فعالیت ها",
            key: '1',
            children: <MinutesRelatedToActivities
                currentProduct={currentProduct}
                setModal={setModal}
                meetingData={meetingsWithActivities}
                deleteMeeting={deleteMeeting}
                refetch={refetch}
            />
        },
        {
            label: `صورتجلسات مستقل`,
            key: '2',
            children: <IndependentMinutes
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
                  <Button className={'modal-button'} onClick={() => setModal({mode: 'add', data: null})}>
                      افزودن صورتجلسه
                  </Button>
              }>


            <Tabs items={items} type="card"
            />

            <MeetingsModal
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                modalType={modalType}
                refetch={refetch}
                currentProduct={currentProduct}
            />
        </Card>
    );
};

export default Meetings;