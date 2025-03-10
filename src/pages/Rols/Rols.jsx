import React from 'react'
import RoleModal from './_components/RoleModal'
import { Table } from 'antd'
import { roleColumns } from './_components/roleColumns'

function Rols() {
  return (
    <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 p-6 border border-gray-400 shadow-sm drop-shadow-xl rounded-lg">
      <RoleModal />
      <Table columns={roleColumns}/>
    </div>
  )
}

export default Rols
