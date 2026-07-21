export const ALL_STATES = [null, 10, 20, 30, 40];

export const stateLabels = {
    null: 'همه اسناد',
    10: 'تعریف نشده ',
    20: 'تهیه شده',
    30: 'تایید شده',
    40: 'تصویب شده',
};

export const getStateColor = (state) => {
    const colors = {
        10: '#f5222d',
        20: '#faad14',
        30: '#52c41a',
        40: '#722ed1',
        // 50: '#722ed1',
    };
    return colors[state] || 'gray';
};

export const getStateBackgroundColor = (state) => {
    const backgroundColors = {
        10: '#ffd2d1',
        20: 'rgb(255,230,170)',
        30: '#caffe4',
        40: '#d8bfff',
    };
    return backgroundColors[state] || '#fafafa';
};

export const flatten = (items) => {
    return items?.reduce((acc, item) => {
        acc.push(item);
        if (Array.isArray(item?.children) && item?.children?.length > 0) {
            acc = acc.concat(flatten(item?.children));
        }
        return acc;
    }, []);
};
