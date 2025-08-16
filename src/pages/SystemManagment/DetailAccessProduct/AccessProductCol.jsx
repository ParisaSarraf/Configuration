export const AccessProductCol = () => {
    return [
        {
            title: 'شناسه محصول',
            dataIndex: ['product', 'id'],
            key: 'product_id',
            render: (id) => `PI-${id}` 
        },
        {
            title: 'کد محصول',
            dataIndex: ['product', 'code'],
            key: 'product_code'
        },
        {
            title: 'عنوان فارسی',
            dataIndex: ['product', 'persian_title'],
            key: 'persian_title'
        },
        {
            title: 'عنوان سند',
            dataIndex: 'title',
            key: 'document_title'
        },
        {
            title: 'نوع سند',
            dataIndex: ['document', 'persianTitle'],
            key: 'document_type'
        },
        {
            title: 'کد سند',
            dataIndex: ['document', 'code'],
            key: 'document_code'
        },
        {
            title: 'قابل گزارش',
            dataIndex: 'is_reportable',
            key: 'is_reportable',
            render: (isReportable) => isReportable ? 'بله' : 'خیر'
        },
        {
            title: 'تاریخ بررسی',
            dataIndex: 'survey_date',
            key: 'survey_date'
        },
        {
            title: 'ویرایش‌ها',
            dataIndex: 'editions',
            key: 'editions',
            render: (editions) => editions?.length || 0
        }
    ]
}