import React, { useState } from 'react';
import { Table, Button, Popconfirm } from 'antd';
import Header from '../shared/Header';

interface DataType {
  key: string;
  row: number;
  filename: string;
  notes: string;
}

interface ViewTableProps {
  data?: DataType[];
}

const View: React.FC<ViewTableProps> = ({ data = [] }) => {
  const [edit, setEdit] = useState('');

  const handleExternalButtonClick = () => {
    setEdit('edit');
  };

  const handleCancelClick = () => {
    setEdit('');
  };

  const handleAddClick = () => {
    // Implement adding new row functionality
  };

  const handleUploadClick = () => {
    // Implement upload functionality
  };

  const handleSaveClick = () => {
    // Implement save functionality
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
      editable: edit === 'edit',
      render: (text: string, record: DataType) => (
        <div contentEditable={edit === 'edit'}>{text}</div>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      editable: edit === 'edit',
      render: (text: string, record: DataType) => (
        <div contentEditable={edit === 'edit'}>{text}</div>
      ),
    },
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
  ];

  return (
    <>
      <Button onClick={handleExternalButtonClick}>Enable Edit</Button>
      {edit === 'edit' && (
        <>
          <Button onClick={handleCancelClick}>Cancel</Button>
          <Button onClick={handleAddClick}>Add</Button>
          <Button onClick={handleUploadClick}>Upload</Button>
          <Button onClick={handleSaveClick}>Save</Button>
        </>
      )}
      <Header display="inline-block" header="File Names" />
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 10 }} // Change pageSize as needed
        rowClassName={(record) => (edit === 'edit' ? 'editable-row' : '')}
      />
    </>
  );
};

export default View;

