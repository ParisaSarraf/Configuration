import { Button, Flex, Tooltip } from "antd";

export const DocumentCol = [
    {
        title: 'کد',
        dataIndex: 'code',
        key: 'code',
    },
    {
        title: 'نام فارسی',
        dataIndex: 'persianTitle',
        key: 'persianTitle',
    },
    {
        title: 'نام انگلیسی',
        dataIndex: 'englishTitle',
        key: 'englishTitle',
    },
    {
        title: 'برچسب',
        dataIndex: ['tag', 'title'],
        key: 'tag',
    },
    {
        title: 'قابل استفاده',
        dataIndex: 'isUsable',
        key: 'isUsable',
        render: (value) => (value ? 'Yes' : 'No'),
    },
    // {
    //     title: 'عملیات',
    //     key: 'Actions',
    //     render: (_, record) => (
    //         <Flex gap={4}>
    //             <Tooltip >
    //                 <Button danger >حذف</Button>
    //             </Tooltip>
    //             <Tooltip>
    //                 <Button className="text-green-700 border-green-700">ویرایش</Button>
    //             </Tooltip>
    //         </Flex>
    //     )
    // },
];

