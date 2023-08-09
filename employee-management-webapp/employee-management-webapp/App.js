import React, { useState } from 'react';
import { Select, Button, Table, Input, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const App = () => {
  const [mode, setMode] = useState('view');

  const handleModeChange = value => {
    setMode(value);
  };

  const columns = [
    {
      title: 'Row',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'FileName',
      dataIndex: 'FileName',
      key: 'FileName',
      render: (text, record) =>
        mode === 'edit' ? (
          <Input
            value={text}
            onChange={e => handleInputChange(e, record.key, 'FileName')}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Notes',
      dataIndex: 'Notes',
      key: 'Notes',
      render: (text, record) =>
        mode === 'edit' ? (
          <Input
            value={text}
            onChange={e => handleInputChange(e, record.key, 'Notes')}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) =>
        mode === 'edit' ? (
          <Space size="middle">
            <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteRow(record.key)} />
          </Space>
        ) : null,
    },
  ];

  const data = [
    { key: 1, FileName: 'File1.txt', Notes: 'Note 1' },
    { key: 2, FileName: 'File2.txt', Notes: 'Note 2' },
    { key: 3, FileName: 'File3.txt', Notes: 'Note 3' },
  ];

  const handleInputChange = (e, key, dataIndex) => {
    const updatedData = data.map(row =>
      row.key === key ? { ...row, [dataIndex]: e.target.value } : row
    );
    setData(updatedData);
  };

  const handleDeleteRow = key => {
    const updatedData = data.filter(row => row.key !== key);
    setData(updatedData);
  };

  const [data, setData] = useState(data);

  return (
    <div>
      <Select value={mode} onChange={handleModeChange} style={{ width: 120 }}>
        <Option value="view">View</Option>
        <Option value="edit">Edit</Option>
      </Select>

      {mode === 'edit' && (
        <div>
          <Button type="primary">Cancel</Button>
          <Button type="primary">Add</Button>
          <Button type="primary">Upload</Button>
          <Button type="primary">Save</Button>
        </div>
      )}

      <Table dataSource={data} columns={columns} />
    </div>
  );
};

export default App;

