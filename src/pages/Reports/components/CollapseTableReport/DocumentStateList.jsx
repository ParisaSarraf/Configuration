import {useState} from "react";
import {Collapse} from "antd";
import {CaretRightOutlined} from "@ant-design/icons";
import StateSpecificTable from "./StateSpecificTable.jsx";
import {ALL_STATES, getStateBackgroundColor, getStateColor, stateLabels} from "@/pages/Reports/components/utils.js";

export const DocumentStateList = ({productId}) => {
    const [activeKeys, setActiveKeys] = useState([]);

    return (
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
                        header={<span>وضعیت: {stateLabels[state]}</span>}
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
                        />
                    </Collapse.Panel>
                );
            })}
        </Collapse>
    );
};