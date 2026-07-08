import { Table } from "antd";

export const TableAntd = ({
  columns,
  dataSource,
  components,
  loading,
  rowKey = "id",
  page,
  pageSize,
  totalItems,
  className = "",
  rowSelection,
  expandable,
  footer,
  locale,
  scroll,       
  tableLayout,  
}) => {
  return (
    <div className={`rtl-table ${className}`}>
      <Table
        size="small"
        bordered
        footer={footer}
        columns={columns}
        components={components}
        dataSource={dataSource}
        scroll={scroll !== undefined ? scroll : { x: "max-content" }}
        tableLayout={tableLayout}
        loading={loading}
        rowKey={rowKey}
        locale={{ filterConfirm: "اعمال", filterReset: "ریست" } || locale}
        expandable={expandable}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: totalItems,
          showTotal: (total) => `تعداد کل: ${total}`,
          showSizeChanger: true,
          defaultPageSize: 5,
          pageSizeOptions: [10, 20, 45, 100],
          size: "small",
          showSizeChanger: true,
          locale: {
            items_per_page: "",
            page: "صفحه",
            jump_to: "برو به صفحه",
            jump_to_confirm: "برو",
          },
        }}
      />
    </div>
  );
};