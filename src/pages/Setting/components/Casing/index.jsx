import { Card, Table, Typography } from 'antd'
import React from 'react'
import { casingCol } from './components/casingCol';

const Casing = () => {

    const data = [
        {
            "id": 1,
            "name": "string",
        }
    ];

    const handleEdit = (record) => {
        console.log(record)
    }

    const handleDelete = (record) => {
        console.log(record);
    }


    return (

        <Card className=" bg-white shadow-md rounded-lg">
            {/* <Typography>پوشش */}
                <Table
                    columns={casingCol({ handleDelete, handleEdit })}
                    dataSource={data}
                    rowKey="id"
                    scroll={{ x: true }}
                    responsive={{
                        small: { columnWidth: 100 },
                        middle: { columnWidth: 150 },
                        large: { columnWidth: 200 },
                    }}
                />
            {/* </Typography>   */}
             </Card>

    )
}

export default Casing