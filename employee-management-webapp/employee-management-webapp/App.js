import React from "react";
import {
    Table, Icon, Popconfirm, Menu, Dropdown, Button, Modal, Input, notification
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

 },
 {
 title: 'Notes',
 dataIndex: 'notes',
 key: 'notes',
 },

 ];

 const fileNameMatchers = mapdataSource?.fileNameMatchers || [];



 return (

 <StyledTable dataSource={fileNameMatchers} columns={columns} pagination={true} />
 );
};

export default ViewMatcherDetailsTable;
