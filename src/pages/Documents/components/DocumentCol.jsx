import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

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
        title: 'لاگ',
        dataIndex: 'log',
        key: 'log',
        render: (value) => (value ? <DoneIcon style={{color: "green"}}/> : <CloseIcon style={{color: "red"}}/>),
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

