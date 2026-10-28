import { FileDoneOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

export const MyDocumentCols = (onOpenWorkflow) => {
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
        },{
           title: 'عملیات',
           key: 'workflow',
           width: 110,
           align: 'center',
           render: (_, record) => (
              <Tooltip title="مشاهده روال اسناد">
                <Button
                  size="small"
                  type="text"
                  aria-label="مشاهده روال اسناد"
                  icon={<FileDoneOutlined />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenWorkflow?.(record);
                  }}
                  disabled={!record?.id}
                  className="text-purple-600 hover:!text-purple-800"
                />
              </Tooltip>
           ),
        },
        ]
    )
}