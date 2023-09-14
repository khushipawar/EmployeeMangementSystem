  private checkMapping: boolean;                                                                                                                                                                               
  renderCell = (form: any) => {                                                                                                                                                                                
      this.form = form;                                                                                                                                                                                        
      const {                                                                                                                                                                                                  
          children, dataIndex, dataSource, index, record, mode, targets,                                                                                                                                       
      } = this.props;                                                                                                                                                                                          
      const {assigned, assignedViewVisible} = this.state;                                                                                                                                                      
      const editing = (mode === "edit");                                                                                                                                                                       
      let formInput;                                                                                                                                                                                           
      if (dataIndex === "notMapped") {                                                                                                                                                                         
          formInput = (                                                                                                                                                                                        
              <Checkbox                                                                                                                                                                                        
                  defaultChecked={!!record[dataIndex]}                                                                                                                                                         
                  ref={(node) => {                                                                                                                                                                             
                      this.input = node;                                                                                                                                                                       
                      return this.input;                                                                                                                                                                       
                  }}                                                                                                                                                                                           
                  onChange={(e) => this.save(e, null)}                                                                                                                                                         
              />                                                                                                                                                                                               
          );                                                                                                                                                                                                   
      }                                                                                                                                                                                                        
      if (dataIndex === "column") {                                                                                                                                                                            
          formInput = (<> <a onClick={this.openModal}>                                                                                                                                                         
                  <div>{record.sequence + 1}</div>                                                                                                                                                             
              </a>                                                                                                                                                                                             
                  <Modal title="Enter the row number"                                                                                                                                                          
                  visible={this.state.isModalVisible}                                                                                                                                                          
                  onCancel={this.closeModal}                                                                                                                                                                   
                  maskClosable={false}                                                                                                                                                                         
                  onOk={(e) => {                                                                                                                                                                               
                             this.props.moveTooRow(e, index, this.state.inputValue);                                                                                                                           
                             return  this.closeModal                                                                                                                                                           
                         }}                                                                                                                                                                                    
                  >                                                                                                                                                                                            
                  <Input type="number" onChange={this.getInputValue}/>                                                                                                                                         
                  </Modal></>                                                                                                                                                                                  
          )                                                                                                                                                                                                    
      }                                                                                                                                                                                                        
                                                                                                                                                                                                               
      else if (dataIndex === "columnName") {                                                                                                                                                                   
          formInput = (                                                                                                                                                                                        
              <Input                                                                                                                                                                                           
                  ref={(node) => {                                                                                                                                                                             
                      this.input = node;                                                                                                                                                                       
                      return this.input;                                                                                                                                                                       
                  }}                                                                                                                                                                                           
                  onPressEnter={(e) => this.save(e, null)}                                                                                                                                                     
                  onChange={(e) => this.save(e, null)}                                                                                                                                                         
              />                                                                                                                                                                                               
          );                                                                                                                                                                                                   
      } else if (dataIndex === "segmentLength") {                                                                                                                                                              
          formInput = (                                                                                                                                                                                        
              <InputNumber                                                                                                                                                                                     
                  min={1}                                                                                                                                                                                      
                  ref={(node) => {                                                                                                                                                                             
                      this.input = node;                                                                                                                                                                       
                      return this.input;                                                                                                                                                                       
                  }}                                                                                                                                                                                           
                  onPressEnter={(e) => this.save(e, null)}                                                                                                                                                     
                  // onBlur={this.save}                                                                                                                                                                        
                  onChange={(e) => this.save({                                                                                                                                                                 
                      target: {                                                                                                                                                                                
                          id: "segmentLength",                                                                                                                                                                 
                          type: "text",                                                                                                                                                                        
                          value: e,                                                                                                                                                                            
                      },                                                                                                                                                                                       
                  }, null)}                                                                                                                                                                                    
              />                                                                                                                                                                                               
          );                                                                                                                                                                                                   
      } else if (dataIndex === "targetValueKeys") {                                                                                                                                                            
          formInput = fromInTargetVal.call(this, formInput, index);                                                                                                                                            
      } else if (dataIndex === "notes") {                                                                                                                                                                      
          formInput = (                                                                                                                                                                                        
              <Input.TextArea                                                                                                                                                                                  
                  ref={(node) => {                                                                                                                                                                             
                      this.input = node;                                                                                                                                                                       
                      return this.input;                                                                                                                                                                       
                  }}                                                                                                                                                                                           
                  onPressEnter={(e) => this.save(e, null)}                                                                                                                                                     
                  onChange={(e) => this.save(e, null)}                                                                                                                                                         
              />                                                                                                                                                                                               
          );                                                                                                                                                                                                   
      }                                                                                                                                                                                                        
                                                                                                                                                                                                               
      // Disable assign button if no target is selected.                                                                                                                                                       
      const assignDisabled = record.fileColumnProperties.length < 1;                                                                                                                                           
      const processAssignedDisabled = record.fileColumnProperties < 1 || (record.fileColumnProperties  && record.fileColumnProperties[0] && record.fileColumnProperties[0].fileColumnTargetValueID === null)   
      const {assignVisible, isProcessVisible, processAssigned} = this.state;                                                                                                                                   
      if (dataIndex === "columnValues") {                                                                                                                                                                      
          return colValDataIndex.call(this, assignedViewVisible, assigned, assignDisabled, assignVisible, dataSource, index, form, editing);                                                                   
      }                                                                                                                                                                                                        
      if (dataIndex === "sequenceOverride") {                                                                                                                                                                  
          return colValDataIndexProcessOrder.call(this, processAssigned, processAssignedDisabled, assignVisible, dataSource, index, form, editing, isProcessVisible);                                          
      }                                                                                                                                                                                                        
      if(dataIndex === "sequenceOverrideNo"){                                                                                                                                                                  
     return <div>{record.sequenceOverride+1}</div>                                                                                                                                                             
      }                                                                                                                                                                                                        
      // Extra type checks required to enforce typescript restrictions.                                                                                                                                        
      this.checkMapping = dataIndex === "notMapped"                                                                                                                                                            
          || dataIndex === "columnName"                                                                                                                                                                        
          || dataIndex === "segmentLength"                                                                                                                                                                     
          || dataIndex === "notes"                                                                                                                                                                             
          || dataIndex === "column"                                                                                                                                                                            
          || dataIndex === "targetValueKeys";                                                                                                                                                                  
      if (editing && this.checkMapping) {                                                                                                                                                                      
          return mapping(dataIndex, index, form, record, formInput);                                                                                                                                           
          // View mode for required and mapped.                                                                                                                                                                
      }                                                                                                                                                                                                        
      if (dataIndex === "notMapped") {                                                                                                                                                                         
          return <Checkbox defaultChecked={!!record[dataIndex]} disabled/>;                                                                                                                                    
      }                                                                                                                                                                                                        
      if (dataIndex === "column") {                                                                                                                                                                            
          return <div>{index + 1}</div>                                                                                                                                                                        
      }                                                                                                                                                                                                        
                                                                                                                                                                                                               
      if (dataIndex === "targetValueKeys") {                                                                                                                                                                   
          return targetVal(record, dataIndex, targets);                                                                                                                                                        
      }                                                                                                                                                                                                        
      if (dataIndex === "notes") {                                                                                                                                                                             
          return (                                                                                                                                                                                             
              <div style={{whiteSpace: "pre-wrap"}}>                                                                                                                                                           
                  {record.notes}                                                                                                                                                                               
              </div>                                                                                                                                                                                           
          );                                                                                                                                                                                                   
      }                                                                                                                                                                                                        
      return children;                                                                                                                                                                                         
  };                                                                                                                                                                                                           
                                                                                                                                                                                                               
  render() {                                                                                                                                                                                                   
      const {                                                                                                                                                                                                  
          editable,                                                                                                                                                                                            
          dataIndex,                                                                                                                                                                                           
          title,                                                                                                                                                                                               
          index,                                                                                                                                                                                               
          children,                                                                                                                                                                                            
      } = this.props;                                                                                                                                                                                          
      const tdAttr = {index, title, dataIndex};                                                                                                                                                                
      return (                                                                                                                                                                                                 
          <td {...tdAttr}>                                                                                                                                                                                     
              {editable ? (                                                                                                                                                                                    
                  <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>                                                                                                                       
              ) : (                                                                                                                                                                                            
                  children                                                                                                                                                                                     
              )}                                                                                                                                                                                               
          </td>                                                                                                                                                                                                
      );      
  }
}

function mapping(dataIndex: string, index: number, form: any, record: DraggableTableRow, formInput) 
    return (                                                                                        
        <Form.Item style={{margin: 0}} id={`${dataIndex}-${index}`}>                                
            {form.getFieldDecorator(dataIndex, {                                                    
                validateTrigger: ["onChange", "onBlur"],                                            
                initialValue: record[dataIndex],                                                    
            })(formInput)}                                                                          
        </Form.Item>                                                                                
    );    

function targetVal(record: DraggableTableRow, dataIndex: string, targets: TargetDetails[]) {                                                       
    return (record[dataIndex]?.map((targetValue: string) => (                                                                                      
        <div>                                                                                                                                      
            {targetValue && targets.find((target: TargetDetails) => target.selectKey === targetValue.split("-")[0])?.name}                         
            {"\n"}                                                                                                                                 
        </div>                                                                                                                                     
    )));                                                                                                                                           
}   

const colValDataIndex = function (assignedViewVisible: boolean, assigned: boolean, assignDisabled: boolean, assignVisible: boolean, dataSource: MapColumn[], index: number, form: any, editing: boolean) {           
                                                                                                                                                                                                                     
    const assignButton = assigned ? (                                                                                                                                                                                
        <Button                                                                                                                                                                                                      
            data-cy="assignButton"                                                                                                                                                                                   
            onClick={this.handleAssignClick}                                                                                                                                                                         
            style={{backgroundColor: assignBackground, color: assignFontColor}}                                                                                                                                      
            disabled={assignDisabled}                                                                                                                                                                                
        >                                                                                                                                                                                                            
            Assigned                                                                                                                                                                                                 
        </Button>                                                                                                                                                                                                    
    ) : (                                                                                                                                                                                                            
        <Button                                                                                                                                                                                                      
            onClick={this.handleAssignClick}                                                                                                                                                                         
            style={{border: `1px solid ${outlineColor}`}}                                                                                                                                                            
            disabled={assignDisabled}                                                                                                                                                                                
        >                                                                                                                                                                                                            
            Assign                                                                                                                                                                                                   
        </Button>                                                                                                                                                                                                    
    );                                                                                                                                                                                                               
    const assignText = assigned ? (<span>Assigned <Icon type="search" onClick={this.handleSearchClick} /></span>) : "Not Assigned";                                                                                  
                                                                                                                                                                                                                     
    return (                                                                                                                                                                                                         
        <>                                                                                                                                                                                                           
            {                                                                                                                                                                                                        
                assignVisible && (                                                                                                                                                                                   
                    <AssignForm                                                                                                                                                                                      
                        targets={this.state.targetOptions}                                                                                                                                                           
                        dataSource={dataSource}                                                                                                                                                                      
                        assignVisible={assignVisible}                                                                                                                                                                
                        setVisible={this.setVisible}                                                                                                                                                                 
                        fileColumnProperties={dataSource[index]?.fileColumnProperties || []}                                                                                                                         
                        form={form}                                                                                                                                                                                  
                        save={this.save}                                                                                                                                                                             
                        delete={this.delete}                                                                                                                                                                         
                        style={{width:170}}                                                                                                                                                                          
                        editing ={true}                                                                                                                                                                              
                    />                                                                                                                                                                                               
                )                                                                                                                                                                                                    
            }                                                                                                                                                                                                        
                                                                                                                                                                                                                     
            {editing ? assignButton : assignText}                                                                                                                                                                    
            {assignedViewVisible &&(                                                                                                                                                                                 
            <AssignForm                                                                                                                                                                                              
                        targets={this.state.targetOptions}                                                                                                                                                           
                        dataSource={dataSource}                                                                                                                                                                      
                        assignVisible={assignedViewVisible}                                                                                                                                                          
                        setVisible={this.setMagnifyVisible}                                                                                                                                                          
                        fileColumnProperties={dataSource[index]?.fileColumnProperties || []}                                                                                                                         
                        form={form}                                                                                                                                                                                  
                        save={this.save}                                                                                                                                                                             
                        delete={this.delete}                                                                                                                                                                         
                        style={{width:170}}                                                                                                                                                                          
                        editing ={false}                                                                                                                                                                             
                    />                                                                                                                                                                                               
)}                                                                                                                                                                                                                   
                                                                                                                                                                                                                     
        </>                                                                                                                                                                                                          
    );                                                                                                                                                                                                               
};                                                                                                                                                                                                                   
