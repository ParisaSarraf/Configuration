import { Table } from "antd";

export const TableAntd = ({
  columns,
  dataSource,
  components,
  loading,
  rowKey = "id",
  page,
  setPage,
  pageSize,
  setPageSize,
  totalItems,
  className = "",
  rowSelection,
  expandable,
  footer,
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
        scroll={{ x: "max-content" }}
        loading={loading}
        rowKey={rowKey}
        locale={{ filterConfirm: "اعمال", filterReset: "ریست" }}
        expandable={expandable}
        rowSelection={rowSelection}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: totalItems,
          showTotal: (total) => `تعداد کل: ${total}`,
          showSizeChanger: true,
          defaultPageSize: 5,
          size: "small",
          pageSizeOptions: ["10", "20", "45", "100"],
          locale: {
            items_per_page: "",
            page: "صفحه",
            jump_to: "برو به صفحه",
            jump_to_confirm: "برو",
          },
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
        }}
      />
    </div>
  );
};
