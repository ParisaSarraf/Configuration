import {useCallback, useEffect, useState} from "react";
import {Card, Collapse} from "antd";
import {CaretRightOutlined} from "@ant-design/icons";
import StateSpecificTable from "./StateSpecificTable.jsx";
import {ALL_STATES, getStateBackgroundColor, getStateColor, stateLabels} from "@/pages/Reports/components/utils.js";
import StateCountFetcher from "@/pages/Reports/components/StateCountFetcher.jsx";

export const DocumentStateList = ({productId, filters = {}}) => {
    const [activeKeys, setActiveKeys] = useState([]);
    const [stateCounts, setStateCounts] = useState({});

    const [loadingStates, setLoadingStates] = useState({});

    useEffect(() => {
        const initialLoadingStates = ALL_STATES.reduce((acc, state) => {
            acc[String(state)] = true;
            return acc;
        }, {});
        setLoadingStates(initialLoadingStates);
        setStateCounts({});
    }, [filters, productId]);

    const handleCountChange = useCallback((state, count) => {
        setStateCounts(prev => ({...prev, [String(state)]: count}));
        setLoadingStates(prev => ({...prev, [String(state)]: false}));
    }, []);

    return (
        <Card title={'وضعیت اسناد'}>
            {ALL_STATES.map(state => (
                <StateCountFetcher
                    key={`fetcher-${String(state)}`}
                    productId={productId}
                    state={state}
                    filters={filters}
                    onCountChange={handleCountChange}
                />
            ))}

            <Collapse
                bordered={false}
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(keys)}
                expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}
            >
                {ALL_STATES?.map(state => {
                    const stateColor = getStateColor(state);
                    const backgroundColor = getStateBackgroundColor(state);
                    const isLoading = loadingStates[String(state)];
                    const count = stateCounts[String(state)] || 0;

                    return (
                        <Collapse.Panel
                            key={String(state)}
                            header={`${stateLabels[state]} (${isLoading ? '...' : count})`}
                            style={{
                                borderRight: `4px solid ${stateColor}`,
                                borderRadius: '4px',
                                background: backgroundColor,
                                marginBottom: '8px'
                            }}
                        >
                            {activeKeys.includes(String(state)) && (
                                <StateSpecificTable
                                    productId={productId}
                                    state={state}
                                    filters={filters}
                                />
                            )}
                        </Collapse.Panel>
                    );
                })}
            </Collapse>
        </Card>
    );
};