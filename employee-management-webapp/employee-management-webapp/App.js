import React, { Component } from "react";
import {
  Table, Input, Button, Popconfirm, Form, Space
} from "antd";

const EditableContext = React.createContext<any>(null);
const fileNameMatchers = mapdataSource?.fileNameMatchers || [];
interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: string;
  record: EditableTableRowType;
  index: number;
  children: React.ReactNode;
  dataSource: fileNameMatchers;
}

interface EditableTableRowType {
  key: string;
  column: string;
  matchers: string;
  notes: string;
}

class EditableCell extends React.Component<EditableCellProps> {
  renderCell = ({ getFieldDecorator }: any) => {
    const {
      editing, dataIndex, title, inputType, record, index, children, ...restProps
    } = this.props;

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(<Input />)}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

interface EditableTableProps {
  dataSource: EditableTableRowType[];
  updateTable: (updatedData: EditableTableRowType[]) => void;
}

class EditableTable extends React.Component<EditableTableProps> {
  private columns = [
    {
      title: "Row",
      dataIndex: "column",
      width: "30%",
      editable: true,
    },
    {
      title: "Matcher",
      dataIndex: "matchers",
      width: "30%",
      editable: true,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      width: "30%",
      editable: true,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: EditableTableRowType) => {
        const editable = this.isEditing(record);
        return (
          <Space>
            {editable ? (
              <span>
                <EditableContext.Consumer>
                  {form => (
                    <Button
                      onClick={() => this.save(form, record.key)}
                      type="link"
                    >
                      Save
                    </Button>
                  )}
                </EditableContext.Consumer>
                <Popconfirm
                  title="Sure to cancel?"
                  onConfirm={() => this.cancel(record.key)}
                >
                  <Button type="link">Cancel</Button>
                </Popconfirm>
              </span>
            ) : (
              <Button
                type="link"
                onClick={() => this.edit(record.key)}
              >
                Edit
              </Button>
            )}
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record.key)}
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  state = { editingKey: "" };

  isEditing = (record: EditableTableRowType) => record.key === this.state.editingKey;

  edit(key: string) {
    this.setState({ editingKey: key });
  }

  save(form: any, key: string) {
    form.validateFields((error: any, row: EditableTableRowType) => {
      if (error) {
        return;
      }
      const newData = [...this.props.dataSource];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.props.updateTable(newData);
        this.setState({ editingKey: "" });
      }
    });
  }

  cancel = () => {
    this.setState({ editingKey: "" });
  };

  handleDelete = (key: string) => {
    const dataSource = [...this.props.dataSource];
    this.props.updateTable(dataSource.filter(item => item.key !== key));
  };

  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: EditableTableRowType) => ({
          record,
          inputType: "text",
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          components={components}
          bordered
          dataSource={fileNameMatchers}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
        />
      </EditableContext.Provider>
    );
  }
}

export default Form.create<EditableTableProps>({ name: "editable_table" })(EditableTable);
