
import React, { useState } from "react";
import { Table, Dropdown, Button, Menu, Input, Modal } from "antd";
import { EditOutlined, DeleteOutlined, SaveOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { DraggableBodyRow, EditableCell } from "./DraggableTable";

const { confirm } = Modal;

const TypedTable = Table;

const StyledTable = styled(TypedTable)`
   /* Your styling here */
`;

const ViewMatcherDetailsTable = ({ mapdataSource }) => {
    const [mode, setMode] = useState("view");
    const [editingRows, setEditingRows] = useState([]);
    const [newRowData, setNewRowData] = useState({});
    const [selectedRow, setSelectedRow] = useState(null);

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
                (mode === 'edit' && editingRows.includes(index)) ? (
                    <EditableCell
                        value={record.matcher}
                        onChange={value => handleMatcherChange(value, index)}
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
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record, index) => (
                mode === 'edit' ? (
                    editingRows.includes(index) ? (
                        <>
                            <Button icon={<SaveOutlined />} onClick={() => handleUpdate(index)}>Save</Button>
                            <Button icon={<CloseOutlined />} onClick={() => handleCancel(index)}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => handleEdit(index)}>Edit</Button>
                            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(index)}>Delete</Button>
                        </>
                    )
                ) : null
            ),
        },
    ];

    const fileNameMatchers = mapdataSource?.fileNameMatchers || [];

    const handleMatcherChange = (value, rowIndex) => {
        const updatedMatchers = [...fileNameMatchers];
        updatedMatchers[rowIndex].matcher = value;
        setEditingRows([...editingRows, rowIndex]);
    };

    const handleEdit = (index) => {
        setEditingRows([...editingRows, index]);
    };

    const handleCancel = (index) => {
        setEditingRows(editingRows.filter(row => row !== index));
    };

    const handleUpdate = (index) => {
        setEditingRows(editingRows.filter(row => row !== index));
        // Perform update logic here
    };

    const handleDelete = (index) => {
        confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this row?',
            onOk() {
                // Perform delete logic here
            },
        });
    };

    const handleAddNewRow = () => {
        const newData = { rowNumber: fileNameMatchers.length + 1, matcher: "", notes: "" };
        setNewRowData(newData);
        setSelectedRow(newData.rowNumber);
        setEditingRows([...editingRows, newData.rowNumber]);
    };

    return (
        <div>
            <Dropdown
                overlay={
                    <Menu>
                        <Menu.Item onClick={() => setMode('view')}>View Mode</Menu.Item>
                        <Menu.Item onClick={() => setMode('edit')}>Edit Mode</Menu.Item>
                    </Menu>
                }
                trigger={['click']}
                placement="topRight"
            >
                <Button>
                    Select Mode
                </Button>
            </Dropdown>

            {mode === 'edit' && (
                <Button icon={<PlusOutlined />} onClick={handleAddNewRow}>Add</Button>
            )}

            <StyledTable
                dataSource={mode === 'edit' ? [...fileNameMatchers, newRowData] : fileNameMatchers}
                columns={columns}
                pagination={false}
                components={{
                    body: {
                        row: DraggableBodyRow,
                    },
                }}
                rowClassName={(record, index) => (
                    selectedRow === record.rowNumber ? "selected-row" : ""
                )}
            />
        </div>
    );
};

export default ViewMatcherDetailsTable;
