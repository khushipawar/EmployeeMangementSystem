
import React, { useState } from 'react';
import { Table  } from "antd";
import Header from "../shared/Header";
interface ViewTableProps {
data?: DataType[];
}
const View: React.FC<ViewTableProps> = ({data = []}) =>{
 <Header display="inline-block" header="File Names"/>
   const columns: ColumnsType<DataType> = [
      {
        title: 'Row',
        dataIndex: 'row',
        key: 'row',
        },
      {
        title: 'File Name',
        dataIndex: 'filename',
        key: 'filename',
        width: "50%",
       },
       {
        title: 'Notes',
        dataIndex: 'notes',
        key: 'notes',
       }
       ];

return (
<Table columns={columns}  dataSource={data} />
);
};
export default View;
