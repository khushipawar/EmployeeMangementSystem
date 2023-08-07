
import React, { useState } from 'react';
import { Table, Input, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  onChange,
  ...restProps
}: any) => {
  const inputNode =
    inputType === 'textarea' ? (
      <Input.TextArea value={children} onChange={onChange} />
    ) : (
      <Input value={children} onChange={onChange} />
    );
  return <td {...restProps}>{editing ? inputNode : children}</td>;
};

const initialData = [
  {
    key: '1',
    FileName: 'File 1',
    Notes: 'Notes 1',
  },
  {
    key: '2',
    FileName: 'File 2',
    Notes: 'Notes 2',
  },
  // Add more data as needed
];

const EditMatcherListContainer: React.FC = () => {
  const [data, setData] = useState(initialData);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: any) => record.key === editingKey;

  const edit = (record: any) => {
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = (key: any) => {
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);

    if (index > -1) {
      const item = newData[index];
      setData(newData);
      setEditingKey('');
    } else {
      newData.push({ key, ...data[key] });
      setData(newData);
      setEditingKey('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, dataIndex: string, key: string) => {
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);

    if (index > -1) {
      newData[index][dataIndex] = e.target.value;
      setData(newData);
    }
  };

  const columns = [
    {
      title: 'Rows',
      dataIndex: 'key',
      key: 'key',
      render: (text: string, record: any) => data.indexOf(record) + 1,
    },
    {
      title: 'FileName',
      dataIndex: 'FileName',
      key: 'FileName',
      editable: true,
      onCell: (record: any) => ({
        record,
        inputType: 'text',
        dataIndex: 'FileName',
        title: 'FileName',
        editing: isEditing(record),
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(e, 'FileName', record.key),
      }),
    },
    {
      title: 'Notes',
      dataIndex: 'Notes',
      key: 'Notes',
      editable: true,
      onCell: (record: any) => ({
        record,
        inputType: 'textarea',
        dataIndex: 'Notes',
        title: 'Notes',
        editing: isEditing(record),
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(e, 'Notes', record.key),
      }),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, record: any) => {
        return (
          <Popconfirm
            title="Sure to delete?"
            // Add delete functionality here
            // onConfirm={() => deleteRow(record.key)}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      <h1>File Names</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button>Cancel</Button>
        <Button type="primary" style={{ marginLeft: 8 }}>Add</Button>
        <Button type="primary" style={{ marginLeft: 8 }}>Update</Button>
        <Button type="primary" style={{ marginLeft: 8 }}>Save</Button>
      </div>
      <Table
        bordered
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10 }} // Change pageSize as needed
        rowClassName={(record) => (isEditing(record) ? 'editable-row' : '')}
        onRow={(record) => ({
          onClick: () => {
            if (!isEditing(record)) {
              edit(record);
            }
          },
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
};

export default EditMatcherListContainer;
