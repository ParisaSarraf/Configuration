export const ALL_STATES = [10, 20, 30];

export const stateLabels = {
    10: 'تهیه ',
    20: 'تصویب',
    30: 'تصدیق',
    // 40: 'تصویب',
};

export const getStateColor = (state) => {
    const colors = {
        10: '#1890ff',
        20: '#52c41a',
        30: '#faad14',
        40: '#f5222d',
        50: '#722ed1',
    };
    return colors[state] || 'gray';
};

export const getStateBackgroundColor = (state) => {
    const backgroundColors = {
        10: '#e6f7ff',
        20: '#f6ffed',
        30: '#fffbe6',
        40: '#fff1f0',
        50: '#f9f0ff',
    };
    return backgroundColors[state] || '#fafafa';
};