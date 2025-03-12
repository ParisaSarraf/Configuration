import React from "react";
import RoleModal from "./_components/RoleModal";
import { Table } from "antd";
import { roleColumns } from "./_components/roleColumns";
import { useRoleList } from "../../QueryServises/roleQuery";

function Rols() {
  const { isFetching, data, refetch } = useRoleList();

  return (
    <div className="card">
      <div className="flex flex-row gap-2">
        <RoleModal />
      </div>
      <Table
        columns={roleColumns()}
        dataSource={isFetching ? [] : data}
        loading={isFetching}
        rowKey="id"
        scroll={{ x: true }}
        responsive={{
          small: { columnWidth: 100 },
          middle: { columnWidth: 150 },
          large: { columnWidth: 200 },
        }}
      />
    </div>
  );
}

export default Rols;
