import React, { useState } from "react";
import {
    Table, Icon, Popconfirm, Menu, Dropdown, Button, Modal, Input, notification, Select
} from "antd";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {EditableColumnProps} from "antd-editable-component/cell";
import styled from "styled-components";
import {connect} from "react-redux";
import {isEqual} from "lodash";
import {DraggableBodyRow, EditableCell,} from "./DraggableTable";
import {DelimitedFileColumn, FixedLengthFileSegment} from "../../../types";
import MapColumn from "../../../types/map/children/MapColumn";
import FileType from "../../../types/enums/FileType";
import TargetDetails from "../../../types/map/children/TargetDetails";
import FileColumnProperty from "../../../types/map/children/FileColumnProperty";
import {Link} from "react-router-dom";
import {sign} from "crypto";
import { DeleteOutlined } from "@ant-design/icons";
import ViewButtons from "../../view/components/ViewButtons";
const { confirm } = Modal;

class TypedTable extends Table<MapDetailsRow> {
}

const StyledTable = styled(TypedTable)`
   .ant-table-tbody{
    background-color: white;
  }
  .ant-table-thead{
    position:sticky;
    top:0;
    z-index:9;
  }
  tr.drop-over-downward td {
    border-bottom: 2px dashed #1890ff;
  }

  tr.drop-over-upward td {
    border-top: 2px dashed #1890ff;
  }
`;

const ViewMatcherDetailsTable = ({mapdataSource}) =>
{
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
 title: 'Notes',
 dataIndex: 'notes',
 key: 'notes',
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

//  const fileNameMatchers = mapdataSource?.fileNameMatchers || [];

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

                   <Select
                    defaultValue="view"
                    onChange={handleModeChange}
                    style={{ width: 120 }}>

                    <Option value="view">
                    <Icon type="eye" style={{marginRight: "5px"}}/>
                    View
                    </Option>
                    <Option value="edit">
                    <Icon type="edit" style={{marginRight: "5px"}}/>
                     Edit
                     </Option>
                     </Select>
                    {mode === 'edit' && (
                          <div>
                              <Button>Cancel</Button>
                              <Button type="primary">Add</Button>
                              <Button>Upload</Button>
                              <Button>Save</Button>
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
