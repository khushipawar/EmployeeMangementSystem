import React, { useState } from "react";
import { Table, Input, Button, Dropdown, Menu } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { DraggableBodyRow } from "./DraggableTable";

const { confirm } = Modal;

const TypedTable = Table;

const StyledTable = styled(TypedTable)`
   /* Your styling here */
`;

const ViewMatcherDetailsTable = ({ mapdataSource }) => {
    const [mode, setMode] = useState("view");
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
                editingRows.includes(index) ? (
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
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record, index) => (
                mode === 'edit' && (
                    <>
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(index)}
                            danger
                        />
                    </>
                )
            ),
        },
    ];

    const fileNameMatchers = mapdataSource?.fileNameMatchers || [];

    const handleMatcherChange = (value, rowIndex) => {
        const updatedMatchers = [...fileNameMatchers];
        updatedMatchers[rowIndex].matcher = value;
        setEditingRows([...editingRows, rowIndex]);
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

    const handleDropdownChange = (newMode) => {
        setMode(newMode);
        setEditingRows([]); // Clear editing rows when changing mode
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item key="view" onClick={() => handleDropdownChange("view")}>
                                View Mode
                            </Menu.Item>
                            <Menu.Item key="edit" onClick={() => handleDropdownChange("edit")}>
                                Edit Mode
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={["click"]}
                >
                    <Button>
                        Select Mode
                    </Button>
                </Dropdown>
            </div>

            {mode === 'edit' && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                    <Button icon={<EditOutlined />}>Edit</Button>
                    <Button icon={<DeleteOutlined />} danger>Delete</Button>
                    <Button icon={<CloseOutlined />}>Cancel</Button>
                    <Button icon={<SaveOutlined />}>Save</Button>
                </div>
            )}

            <StyledTable
                dataSource={fileNameMatchers}
                columns={columns}
                pagination={false}
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

