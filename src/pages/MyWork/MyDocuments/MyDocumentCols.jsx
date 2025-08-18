export const MyDocumentCols = () => {
    return (
        [{
           title: 'نام محصول',
           dataIndex: ['product_document', 'product', 'persian_title'] ,
           key: 'persian_title',
           width: 100,
        },{
           title: 'کد محصول',
           dataIndex: ['product_document', 'product', 'code'] ,
           key: 'code',
           width: 100,
        },{
            title: 'نام سند',
            dataIndex: ['product_document', 'title'] ,
            key: 'title',
            width: 100,
        },{
           title: 'نام سند اصلی',
           dataIndex: ['product_document', 'document', 'persianTitle'] ,
           key: 'persianTitle',
           width: 100,
        },{
           title: 'کد سند اصلی',
           dataIndex: ['product_document', 'document', 'code'] ,
           key: 'code-document',
           width: 100,
        },{
           title: 'نام نسخه',
           dataIndex: 'edition' ,
           key: 'edition',
           width: 100,
        },{
           title: 'شرح نسخه',
           dataIndex: ['description'] ,
           key: 'description',
           width: 100,
        },{
           title: 'تاریخ سند',
           dataIndex: ['survey_date'] ,
           key: 'survey_date',
           width: 100,
        },
        ]
    )
}