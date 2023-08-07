
import React from 'react';
import { Table, Button, Popconfirm, Input } from 'antd';
import Header from '../shared/Header';

interface DataType {
  key: string;
  row: number;
  filename: string;
  notes: string;
}

interface ViewTableProps {
  data?: DataType[];
  value: string;
}

const View: React.FC<ViewTableProps> = ({ data = [], value }) => {
  const handleAddClick = () => {
    // Implement adding new row functionality
  };

  const handleUploadClick = () => {
    // Implement upload functionality
  };

  const handleSaveClick = () => {
    // Implement save functionality
  };

  const handleCancelClick = () => {
    // Implement cancel functionality
  };

  const handleDeleteClick = (key: string) => {
    // Implement delete functionality
  };

  const columns = [
    {
      title: 'Row',
      dataIndex: 'row',
      key: 'row',
    },
    {
      title: 'File Name',
      dataIndex: 'filename',
      key: 'filename',
      width: '50%',
      render: (text: string, record: DataType) =>
        value === 'edit' ? (
          <Input value={text} />
        ) : (
          <div>{text}</div>
        ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text: string, record: DataType) =>
        value === 'edit' ? (
          <Input.TextArea value={text} />
        ) : (
          <div>{text}</div>
        ),
    },
    ...(value === 'edit'
      ? [
          {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record: DataType) => {
              return (
                <Popconfirm
                  title="Sure to delete?"
                  onConfirm={() => handleDeleteClick(record.key)}
                >
                  <Button type="primary" danger>
                    Delete
                  </Button>
                </Popconfirm>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <div>
      {value === 'edit' && (
        <>
          <Button onClick={handleAddClick}>Add</Button>
          <Button onClick={handleUploadClick}>Upload</Button>
          <Button onClick={handleSaveClick}>Save</Button>
          <Button onClick={handleCancelClick}>Cancel</Button>
        </>
      )}
      <Header display="inline-block" header="File Names" />
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 10 }} // Change pageSize as needed
        rowClassName={value === 'edit' ? 'editable-row' : ''}
      />
    </div>
  );
};

export default View;

