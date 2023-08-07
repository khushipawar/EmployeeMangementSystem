import React, { useState } from 'react';
import { Table, Input, Button, Form, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}: any) => {
  const inputNode =
    inputType === 'textarea' ? <Input.TextArea /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
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

const TablePage: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState(initialData);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: any) => record.key === editingKey;

  const edit = (record: any) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
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
    },
    {
      title: 'Notes',
      dataIndex: 'Notes',
      key: 'Notes',
      editable: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button type="primary" onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </Button>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button>Cancel</Button>
            </Popconfirm>
          </span>
        ) : (
          <>
            <Button type="primary" onClick={() => edit(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Sure to delete?"
              // Add delete functionality here
              // onConfirm={() => deleteRow(record.key)}
            >
              <Button type="primary" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const save = async (key: any) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: col.dataIndex === 'Notes' ? 'textarea' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      <h1>File Names</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button>Cancel</Button>
        <Button type="primary" style={{ marginLeft: 8 }}>Add</Button>
        <Button type="primary" style={{ marginLeft: 8 }}>Update</Button>
        <Button type="primary" style={{ marginLeft: 8 }}>Save</Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName={(record) => (isEditing(record) ? 'editable-row' : '')}
          pagination={{ pageSize: 10 }} // Change pageSize as needed
        />
      </Form>
    </div>
  );
};

export default TablePage;
