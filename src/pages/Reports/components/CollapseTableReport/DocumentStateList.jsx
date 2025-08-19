import {useState} from "react";
import {Card, Collapse} from "antd";
import {CaretRightOutlined} from "@ant-design/icons";
import StateSpecificTable from "./StateSpecificTable.jsx";
import {ALL_STATES, getStateBackgroundColor, getStateColor, stateLabels} from "@/pages/Reports/components/utils.js";

export const DocumentStateList = ({productId}) => {
    const [activeKeys, setActiveKeys] = useState([]);
    const [stateCounts, setStateCounts] = useState({});

    const handleCountChange = (state, count) => {
        setStateCounts(prev => ({...prev, [state]: count}));
    };


    return (
        <Card title={'وضعیت اسناد'}>
            <Collapse
                bordered={false}
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(keys)}
                expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}
            >
                {ALL_STATES?.map(state => {
                    const stateColor = getStateColor(state);
                    const backgroundColor = getStateBackgroundColor(state);
                    const isActive = activeKeys.includes(String(state));

                    return (
                        <Collapse.Panel
                            key={String(state)}
                            header={`${stateLabels[state]} (${stateCounts[state] || 0})`}
                            style={{
                                borderRight: `4px solid ${stateColor}`,
                                borderRadius: '4px',
                                background: backgroundColor,
                            }}

                        >
                            <StateSpecificTable
                                productId={productId}
                                state={state}
                                isActive={isActive}
                                onCountChange={handleCountChange}
                            />

                        </Collapse.Panel>
                    );
                })}
            </Collapse>
        </Card>
    );
};