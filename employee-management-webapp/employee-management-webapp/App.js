import React from "react";
import { Table, Input } from "antd";
import { DraggableBodyRow } from "./DraggableTable";

const TypedTable = Table;

const StyledTable = /* your styled component definition */;

const ViewMatcherDetailsTable = ({ mapdataSource, mode }) => {
    const [editingRows, setEditingRows] = useState([]);

    const columns = [
        {
            title: 'Row',
            dataIndex: 'rowNumber',
            key: 'rowNumber',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Matchers',
            dataIndex: 'matcher',
            key: 'matcher',
            render: (text, record, index) => (
                mode === 'edit' && editingRows.includes(index) ? (
                    <Input
                        value={record.matcher}
                        onChange={(e) => handleMatcherChange(e.target.value, index)}
                    />
                ) : (
                    record.matcher
                )
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
        },
    ];

    // Rest of your code

    return (
        <div>
            <StyledTable
                dataSource={fileNameMatchers}
                columns={columns}
                pagination={true}
                components={{
                    body: {
                        row: DraggableBodyRow,
                    },
                }}
            />
        </div>
    );
};

export default ViewMatcherDetailsTable;

