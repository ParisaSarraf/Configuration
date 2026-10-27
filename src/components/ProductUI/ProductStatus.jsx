const STATUS_LABELS = {
    active: 'فعال',
    inactive: 'غیرفعال',
    draft: 'پیش‌نویس',
};

const ProductStatus = ({status}) => (
    <span className={`pw-status pw-status--${Object.hasOwn(STATUS_LABELS, status) ? status : 'unknown'}`}>
        <span className="pw-status-dot" aria-hidden="true"/>
        {STATUS_LABELS[status] || 'بدون وضعیت'}
    </span>
);

export default ProductStatus;
