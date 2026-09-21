export const ALL_STATES = [null, 10, 20, 30, 40];

export const stateLabels = {
 null: 'همه اسناد',
 10: 'تعریف شده ',
 20: 'تهیه شده',
 30: 'تایید شده',
 40: 'تصویب شده',
};

export const getStateColor = (state) => {
 const colors = {
 10: '#DC4C4C',
 20: '#D97706',
 30: '#16A36A',
 40: '#315CFF',
 // 50: '#315CFF',
 };
 return colors[state] || 'gray';
};

export const getStateBackgroundColor = (state) => {
 const backgroundColors = {
 10: '#FFF0F0',
 20: '#FFF5E8',
 30: '#EAF7F1',
 40: '#DCE5FF',
 };
 return backgroundColors[state] || '#F8FAFC';
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
