
import React, { useState, useEffect } from 'react';
import { Table, Input, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const DynamicTable = ({ mode }) => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([
    { key: 1, FileName: 'File1.txt', Notes: 'Note 1' },
    { key: 2, FileName: 'File2.txt', Notes: 'Note 2' },
  ]);

  useEffect(() => {
    if (mode === 'edit') {
      const newColumn = {
        dataIndex: `column${columns.length + 1}`,
        render: (_, record) => (
          <div>
            <Input
              value={record[`column${columns.length + 1}`]}
              onChange={e => handleInputChange(e, record, `column${columns.length + 1}`)}
            />
            <Button type="link" icon={<DeleteOutlined />} />
          </div>
        ),
      };

      const newData = data.map(row => {
        return {
          ...row,
          [`column${columns.length + 1}`]: '',
        };
      });

      setColumns([...columns, newColumn]);
      setData(newData);
    }
  }, [mode]);

  const handleInputChange = (e, record, dataIndex) => {
    const newValue = e.target.value;
    const updatedData = data.map(row =>
      row.key === record.key ? { ...row, [dataIndex]: newValue } : row
    );
    setData(updatedData);
  };

  const generateColumns = () => {
    const inputColumns = columns.map(column => ({
      ...column,
      render: (_, record) => (
        <div>
          {column.dataIndex === 'FileName' || column.dataIndex === 'Notes' ? (
            <Input
              value={record[column.dataIndex]}
              onChange={e => handleInputChange(e, record, column.dataIndex)}
            />
          ) : (
            <Input
              value={record[column.dataIndex]}
              onChange={e => handleInputChange(e, record, column.dataIndex)}
              style={{ visibility: 'hidden' }}
            />
          )}
          <Button type="link" icon={<DeleteOutlined />} />
        </div>
      ),
    }));

    return [...inputColumns, ...columns];
  };

  return (
    <div>
      <Table dataSource={data} columns={generateColumns()} showHeader={false} />
    </div>
  );
};

export default DynamicTable;
