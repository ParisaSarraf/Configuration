export const ProductDocumentListSerialCol = [
    {
        title: "نام محصول",
        dataIndex: 'persian_title',
        key: "persian_title",
    },
    {
        title: "سریال/کد",
        dataIndex: 'code',
        key: "code",
        render: (text, record) => {
            const serial = record.documents
                ?.find(d => d.editions?.some(e => e.logs?.some(l => l.product_serial?.serial)))
                ?.editions?.find(e => e.logs?.some(l => l.product_serial?.serial))
                ?.logs?.find(l => l.product_serial?.serial)
                ?.product_serial?.serial;

            return `${record.code}${serial ? '/' + serial : ''}`;
        }
    }
];
