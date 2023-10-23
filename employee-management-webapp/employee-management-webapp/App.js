/* eslint-disable max-classes-per-file */
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


interface MapDetailsRow extends MapColumn {
    key: number,
}

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

interface EditableTableState {
    count: number,
    dataSource: Array<MapDetailsRow>,
    selectedTargets: Array<number>,
    pageNumber:number,
}

interface EditableTableStateProps {
    targets: TargetDetails[]
}

interface EditableTableOwnProps {
    mode: string,
    dataSource?: Array<DelimitedFileColumn | FixedLengthFileSegment>,
    updateTable: (rows: Array<DelimitedFileColumn | FixedLengthFileSegment>) => void,
    deletable: boolean,
    addable: boolean,
    mapType: string,
}

type EditableTableProps = EditableTableOwnProps & EditableTableStateProps;

class EditableTable extends React.Component<EditableTableProps, EditableTableState> {
    components = {
        body: {
            row: DraggableBodyRow,
            cell: EditableCell,
        },
    };

    tableTracker: Array<MapDetailsRow>;

    columns: EditableColumnProps<MapDetailsRow>[];

    constructor(props: EditableTableProps) {
        super(props);

        this.columns = [
            {
                title: "Row",
                dataIndex: "column",
                editable: true,
            },

            {
                title: "Not Mapped",
                dataIndex: "notMapped",
                editable: true,
            },
            {
                title: "Source Name",
                dataIndex: "columnName",
                editable: true,
            },
            {
                title: "Target Name",
                dataIndex: "targetValueKeys",
                editable: true,
            },
            {
                title: "Value Transformation",
                dataIndex: "columnValues",
                editable: true,
            },
            {
                title: "Processing Order",
                dataIndex: "sequenceOverride",
                editable: true,
             },
             {
                title: "Processing Order No.",
                dataIndex: "sequenceOverrideNo",
                editable: true,
             },
            {
                title: "Notes",
                dataIndex: "notes",
                editable: true,
            },
        ];

        this.state = {
            dataSource: [],
            selectedTargets: [],
            count: 0,
            pageNumber:1,
            removeProcess: false
        };
        this.tableTracker = [];
    }

    componentDidMount() {
        const {dataSource} = this.props;
        if (dataSource) {
            // get all the selected targets
            const selectedTargets = dataSource.filter((col) => col.fileColumnProperties.length > 0).flatMap((col) => col?.fileColumnProperties.map((property) => property.targetValueID));

            const tableRows: MapDetailsRow[] = dataSource.map((mapColumn: DelimitedFileColumn | FixedLengthFileSegment, index) => ({
                ...mapColumn,
                key: index,
                targetValueKeys: this.convertTargetIDToKey(mapColumn.fileColumnProperties),
            }));
            // Arrange in sequence.
            tableRows.sort((a, b) => ((a.sequence > b.sequence) ? 1 : -1));
            this.setState({dataSource: tableRows, count: tableRows.length, selectedTargets});
            this.tableTracker = tableRows;
        }
    }

    componentDidUpdate(prevProps: EditableTableProps, prevState: EditableTableState) {
        const {dataSource, targets} = this.props;
        if (dataSource && ((prevProps.targets.length !== targets.length) || (JSON.stringify(prevProps.dataSource) !== JSON.stringify(dataSource)))) {
            const tableRows: MapDetailsRow[] = dataSource.map((mapColumn: DelimitedFileColumn | FixedLengthFileSegment, index) => ({
                ...mapColumn,
                key: index,
                targetValueKeys: this.convertTargetIDToKey(mapColumn.fileColumnProperties),
            }));
            tableRows.sort((a, b) => ((a.sequence > b.sequence) ? 1 : -1));
            this.setState({dataSource: tableRows, count: tableRows.length});
            this.tableTracker = tableRows;
        }
        const {dataSource: dataSourceState} = this.state;
        if (dataSourceState && !isEqual(dataSourceState, prevState.dataSource)) {
            const selectedTargets = dataSourceState.filter((col) => col.fileColumnProperties.length > 0).flatMap((col) => col?.fileColumnProperties.map((property) => property.targetValueID));
            this.setState({selectedTargets});

        }
    }

    convertTargetIDToKey = (colProps: FileColumnProperty[]) => {
        const {targets} = this.props;
        const unique = new Set();
        return colProps?.map((colProp) => {
            const found = targets.find((target) => target.targetValueID === colProp.targetValueID);
            if (!unique.has(found?.selectKey)) {
                unique.add(found?.selectKey);
                return found?.selectKey;
            }
            for (let ind = 1; ind < 999; ind += 1) {
                const newKey = `${found?.selectKey}-${ind}`;
                if (!unique.has(newKey)) {
                    unique.add(newKey);
                    return newKey;
                }
            }
            return null;
        });
    };

    handleDelete = (key: number, dataSource: any) => {
    console.log("Key :"+ key);
        let comparisonId = null;
        let isLogicalExist = false;
        let logicalMessage = null;
        dataSource.fileColumnProperties.map(fileProperty =>{
            if(fileProperty.fileColumnTargetValueID != null){
                comparisonId = fileProperty.fileColumnTargetValueID;

                this.state.dataSource.map(datasource => {
                    datasource.fileColumnProperties.map(fileProperty =>{
                        if(fileProperty.logicalTransforms != null && fileProperty.logicalTransforms.length > 0){
                            fileProperty.logicalTransforms.map(logicalColumn=>{
                                const compareId = logicalColumn.comparisonFileColumnTargetValueID;
                                if(compareId == comparisonId){
                                    isLogicalExist = true;
                                    logicalMessage = `This row can not be deleted because it is being used in some logical transformation`;
                                }
                            })
                        }
                    });
                });

                 }
                    });
            if(isLogicalExist){
                            notification.error({
                                message: 'Error',
                                description: `${logicalMessage}`,
                             });
           }
           else
           {
           const newData=this.state.dataSource;
            const removed = newData.filter((item) => item.key !== key).map((row, index) => ({
                ...row,
                sequence: index,
            }));
            this.tableTracker = removed;
            this.props.updateTable(removed);
        this.setState({dataSource: removed})

            }
        }
    console.log("DataSource: "+ JSON.stringify(dataSource));

    };

    handleAdd = ({key}: { key: string }) => {
    console.log("KEY : "+ key);
        const {count, dataSource} = this.state;
//         const count = dataSource.length;
        console.log("Count : "+ count);
        // Determine number to add.
        const toAdd = parseInt(key, 10);
        const newData: MapDetailsRow = {
            fileMapID: null,
            required: false,
            columnName: "",
            notes: "",
            notMapped: false,
            assigned: false,
            fileColumnProperties: [],
            key: 0,
            sequence: 0,
            sequenceOverride: 0,
        };

        let newRows = new Array(toAdd).fill(newData);
        console.log("new Rows : "+ newRows);
        // Set key and sequence based on position in array.
        newRows = newRows.map((row, index) => ({
            ...row,
            key: count + index,
            sequence: dataSource.length + index,
            sequenceOverride: dataSource.length + index,
        }));
        const updatedRows = dataSource.concat(newRows);
        this.setState({
            dataSource: updatedRows,
            count: updatedRows.length,

        });
        this.tableTracker = updatedRows;
        this.props.updateTable(updatedRows);
        console.log("DataSource : "+ JSON.stringify(dataSource));
        console.log("Updataed Rows : "+ JSON.stringify(updatedRows))
    };

    handleSave = (row: MapDetailsRow) => {
        const newData = [...this.tableTracker];
        const index = newData.findIndex((item) => row.key === item.key);
        const oldRow = newData[index];
        newData.splice(index, 1, {
            ...oldRow,
            ...row,
        });

     if (!isEqual(row, oldRow)) {
        this.setState({ dataSource: newData });
        this.tableTracker = newData;
        this.props.updateTable(newData);
        }
    };
    moveTooRow = (event: any, fromIndex: any, toIndex: any) => {
        let moveToIndex
        if(toIndex === 0){
            moveToIndex = 0;
        }
        else if(toIndex >= this.tableTracker.length){
            moveToIndex = this.tableTracker.length - 1;
        }
        else{
            moveToIndex = toIndex - 1;
        }
        let arr = []
        const arr1 = [...this.tableTracker]
        arr = arr1.splice(fromIndex, 1)
        arr1.splice(moveToIndex, 0, ...arr)
        this.tableTracker = [...arr1]
        this.setState({dataSource: this.tableTracker});
        for (let i = 0; i < this.tableTracker.length; i++) {
            this.tableTracker[i].sequence = i;
            this.tableTracker[i].sequenceOverride = i;
        }
        this.props.updateTable(arr1);
    }
    updateRemoveProcess =() =>{
    this.setState({removeProcess: false})
    }
    checkOverrideValues =(fromIndex: number, toIndex: number)=>{

          const checkValue= (element, index, array) =>{
          if(element.afterColumnIndex !== null ||(element.sequence !== element.sequenceOverride)){
          return true;
          }
          }
          const processAssigned= this.state.dataSource.some(checkValue)
          if(!processAssigned ){
          this.moveRow(fromIndex, toIndex)
           }
           else{
            confirm({
            title:"Hey, you already have some processing order. Press OK if you want to continue.",
            content: "All processing order assignments will be removed if you change the sequence.",
            onOk:()=>{
            for(let i=0; i<this.tableTracker.length;i++)
            {
            if(this.tableTracker[i].afterColumnIndex!= null){
            this.tableTracker[i].afterColumnIndex =null
            }
            }
            this.setState({removeProcess:true})
            this.moveRow(fromIndex,toIndex)
            this.setState({dataSource: this.tableTracker});
            },
            onCancel: ()=>{
            console.log("cancelled")
            },
            })
           }

    }
    /**
     * Moves a row from x to y, updates the rows between them, rerenders the table, updates props
     * @param fromIndex index of the row that is being dragged
     * @param toIndex index of where the row is dropped
     */

    moveRow = (fromIndex: number, toIndex: number) => {
      const size=100;
      const fromIndexUpdate= (fromIndex+((this.state.pageNumber-1)*size));
      const toIndexUpdate= (toIndex+((this.state.pageNumber-1)*size));

        const fromRow = this.tableTracker[fromIndexUpdate];
        this.tableTracker[fromIndexUpdate].sequence = toIndexUpdate;
        this.tableTracker[fromIndexUpdate].sequenceOverride = toIndexUpdate;
        const sign = Math.sign(fromIndexUpdate - toIndexUpdate); // +1 or -1
        // iterate from fromIndex to toIndex, either increment or decrement the values between tableTracker[fromIndex] and tableTracker[toIndex]
        for (let i = fromIndexUpdate; i !== toIndexUpdate; i -= sign) {
            this.tableTracker[i] = this.tableTracker[i - sign];
            this.tableTracker[i].sequence = i;
        }
         this.tableTracker[toIndexUpdate] = fromRow;
         for(let i=0;i<this.tableTracker.length;i++){
            this.tableTracker[i].sequenceOverride= this.tableTracker[i].sequence
         }


        // update state for rerender and update props
        this.setState({dataSource: this.tableTracker});
        this.props.updateTable(this.tableTracker);
    };

    render() {
        const {dataSource, selectedTargets} = this.state;
        const {
            mode, deletable, addable, mapType, targets,
        } = this.props;

        // Adjust columns depending on the mode.
        let columnSet = [...this.columns];
        if (mapType === FileType.FIXED_WIDTH) {
            // Add the segment length field onto the map if fixed.
            columnSet.splice(5, 0, {
                title: "Segment Length",
                dataIndex: "segmentLength",
                editable: true,
            });
        }
        if (mode === "edit") {
            columnSet = [{
                title: "Sort",
                dataIndex: "sort",
                width: 65,
                className: "drag-visible",
                render: () => <Icon type="menu"/>,
            }, ...columnSet];
        }

        if (deletable && (mode === "edit")) {
            columnSet = [...columnSet,
                {
                    title: "",
                    dataIndex: "operation",
                    render: (_, record) => (this.state.dataSource.length >= 1 ? (
                        <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key,record)}>
                            <Icon type="delete"/>
                        </Popconfirm>
                    ) : null),
                }];
        }

        const columns = columnSet.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: (record: MapDetailsRow) => ({
                    mode,
                    record,
                    targets,
                    selectedTargets,
                    dataSource,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                    index: record.sequence,
                    moveTooRow: this.moveTooRow,
                    removeProcess:this.state.removeProcess,
                    updateRemoveProcess: this.updateRemoveProcess

                }),
            };
        });
        const menu = (
            <Menu onClick={this.handleAdd}>
                <Menu.Item key="1">Add a Row</Menu.Item>
                <Menu.Item key="5">Add 5 Rows</Menu.Item>
                <Menu.Item key="10">Add 10 Rows</Menu.Item>
                <Menu.Item key="25">Add 25 Rows</Menu.Item>
            </Menu>
        );

        const renderFooter = () => (
            <Dropdown overlay={menu}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()} data-cy="addRows">
                    Add Row(s)
                    {" "}
                    <Icon type="down"/>
                </a>
            </Dropdown>
        );
        let footerProps = {};
        if (addable) {
            footerProps = {
                footer: renderFooter,
            };
        }
        return (
            <div>
                <DndProvider backend={HTML5Backend}>
                    <StyledTable
                        data-cy="view-one-table"
                        components={this.components}
                        rowClassName={() => "editable-row"}
                        dataSource={dataSource}
                        columns={columns}
                        style={{marginTop: "10px"}}
                        onRow={(_record, index) => ({
                            index,
                            mode,
                            moveRow: this.checkOverrideValues,
                            updateTable: this.props.updateTable,
                        })}
                        pagination={true}

             pagination={{pageSize:100,onChange: (page)=>{this.setState({pageNumber:page})}}}

                        {...footerProps}
                    />
                </DndProvider>
            </div>
        );
    }
}

const mapStateToProps = (state: any) => ({
    targets: state.map.targets,
});

const mapDispatchToProps = () => ({});
export default connect<EditableTableStateProps, {}, EditableTableOwnProps>(mapStateToProps, mapDispatchToProps)(EditableTable);
