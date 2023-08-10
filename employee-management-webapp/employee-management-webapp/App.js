import React, { useState } from "react";
import { Table, Input, Button, Dropdown, Menu } from "antd";
import { SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import styled from "styled-components";

const StyledTable = styled(Table)`
   /* Your styling here */
`;

const ViewMatcherDetailsTable = ({ mapdataSource }) => {
    const [mode, setMode] = useState("view");
    const [data, setData] = useState([...(mapdataSource?.fileNameMatchers || [])]);

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
                mode === 'edit' ? (
                    <Input
                        value={record.matcher}
                        onChange={e => handleMatcherChange(e.target.value, index)}
                    />
                ) : (
                    record.matcher
                )
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record, index) => (
                mode === 'edit' ? (
                    <Button icon={<DeleteOutlined />} onClick={() => handleDelete(index)} />
                ) : null
            ),
        },
    ];

    const handleMatcherChange = (value, rowIndex) => {
        const updatedData = [...data];
        updatedData[rowIndex].matcher = value;
        setData(updatedData);
    };

    const handleDelete = (index) => {
        const updatedData = data.filter((_, i) => i !== index);
        setData(updatedData);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
    };

    return (
        <div>
            <Dropdown
                overlay={
                    <Menu>
                        <Menu.Item key="view" onClick={() => handleModeChange("view")}>
                            View Mode
                        </Menu.Item>
                        <Menu.Item key="edit" onClick={() => handleModeChange("edit")}>
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

            {mode === 'edit' && (
                <div>
                    <Button icon={<SaveOutlined />} />
                    <Button>Cancel</Button>
                    <Button>Add</Button>
                    <Button>Upload</Button>
                </div>
            )}

            <StyledTable
                dataSource={data}
                columns={columns}
                pagination={false}
            />
        </div>
    );
};

export default ViewMatcherDetailsTable;

