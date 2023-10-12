
    handleOk = () => {
        const {setVisible, save} = this.props;

        this.setState({validations: this.getValidation(this.state.transformations)}, () => {
            if (!this.state.isError){
                setVisible(false);
                // Save the row.
                if (save) save(null, AssignActions.UPDATE_ASSIGN, this.state.transformations);

            }
        })

    };
 handleCancel = () => {
        this.props.setVisible(false);
      };

formItems = (uniqueID: any, targetDetail: any) => {
        const {transformations} = this.state;
        const {editing} = this.props;
        const hardcoded = transformations[uniqueID] && transformations[uniqueID].hardcodedValue && transformations[uniqueID].hardcodedValue.value
        return (<div>
            <Formik initialValues={transformations[uniqueID]} onSubmit={this.handleOk}>
                {({
                      values,
                      _handleChange,
                      handleBlur,
                      _handleSubmit,
                      _isSubmitting,
                  }) => (
                    <Form layout="inline">
                        {this.getValueTransformation(values).map((item, index) => (
                            <Row style={{marginBottom: 12}}>
                                <Col span={8}>
                                    <Input
                                        type="text"
                                        name={`valueTransformation.[${index}].value`}
                                        style={{width: 200, marginRight: 10}}
                                        placeholder="Map From"
                                        onChange={e => this.handleChange(e, index, uniqueID, "value")}
                                        value={item.value}
                                        disabled={this.getDisabled(item.value, item.blank, hardcoded, "value") || !editing}
                                        onBlur={handleBlur}
                                        allowClear
                                    />

                                    {this.state.validations && this.state.validations[uniqueID] &&
                                    this.state.validations[uniqueID].valueTransformation &&
                                    this.state.validations[uniqueID].valueTransformation[index] && this.state.validations[uniqueID].valueTransformation[index].value ?
                                        <p style={{color: 'red', marginLeft: 5}}>{this.state.validations[uniqueID].valueTransformation[index].value}</p> : null
                                    }


                                </Col>
                                <Col span={1}>
                                    <Icon type="arrow-right" style={{marginTop: 10, marginLeft: 10}}/>
                                </Col>
                                <Col span={9}>
                                    {this.inputContent(targetDetail, uniqueID, index, item,1)}
                                    {this.state.validations && this.state.validations[uniqueID] &&
                                    this.state.validations[uniqueID].valueTransformation &&
                                    this.state.validations[uniqueID].valueTransformation[index] && this.state.validations[uniqueID].valueTransformation[index].mappedValue ?
                                        <p style={{color: 'red', marginLeft: 15}}>{this.state.validations[uniqueID].valueTransformation[index].mappedValue}</p> : null
                                    }


                                </Col>
                                <Col span={4}>
                                    {this.getBlankCheck(uniqueID, index, item, "value")}
                                </Col>
                                <Col span={1}>
                                   {editing? <Icon
                                        className="dynamic-delete-button"
                                        type="minus-circle-o"
                                        style={{marginTop: 10}}
                                        onClick={() => this.remove(index, uniqueID, "value")}
                                    />: null}
                                </Col>

                            </Row>
                        ))}

                        {transformations[uniqueID] && transformations[uniqueID].logicalTransformation.length > 1 ?
                            <Col>
                                <Select
                                allowClear
                                showSearch
                                dropdownMatchSelectWidth={false}
                                style={{width: 120}}
                                placeholder="AND/OR"
                                optionFilterProp="children"
                                name={`logicalRelation`}
                                onChange={(event) => this.handleChangeSelect(event, 0, uniqueID, "logicalRelation")}
                                value={transformations[uniqueID] && transformations[uniqueID].logicalRelation}
                                disabled = {!editing}
                                >
                                <Option value="AND">AND</Option>
                                <Option value="OR">OR</Option>
                            </Select>

                                {(this.state.validations && this.state.validations[uniqueID] &&
                                    this.state.validations[uniqueID].logicalRelation)
                                    ?
                                    <p style={{
                                        color: 'red',
                                        marginLeft: 15
                                    }}>{this.state.validations[uniqueID].logicalRelation}</p> : null
                                }
                            </Col>
                                : null
                        }

                        {transformations[uniqueID] && transformations[uniqueID].logicalTransformation.length > 1 ?
                            <Icon
                                style={{marginLeft: 5, marginTop: 10}}
                                className="dynamic-delete-button"
                                type="question-circle-o"
                                title="AND evaluates all conditions must be true for the overall condition to be true. OR evaluates that one of the conditions must be true for the overall condition to be true."
                            /> : null
                        }

                        {values  && values.logicalTransformation && values.logicalTransformation.map((item, index) => (<>
                       <Row style={{marginBottom: 10}}><Col span={8}>
                                    <span>IF</span>

                                    <Select
                                        showSearch
                                        allowClear
                                        style={{width: 180}}
                                        optionFilterProp="children"
                                        disabled={this.getDisabled(item.comparisonFileColumnTargetValueID, item.blank, hardcoded, 'targetValue') || !editing}
                                        name={`LogicalTransformation.[${index}].comparisonFileColumnTargetValueID`}
                                        onChange={(event) => {this.handleChangeSelect(event, index, uniqueID, "targetValue")}}
                                        value={item.comparisonFileColumnTargetValueID? item.comparisonFileColumnTargetValueID: this.props.fileColumnProperties.logicalTransformation && this.props.fileColumnProperties.logicalTransformation[index].comparisonFileColumnTargetValueID}
                                    >
                                        {this.checkTargets(this.state.mappedTargets).map((target, i) =>

                                            <Option
                                                value={target.comparisonFileColumnTargetValueID}
                                                key={i}
                                            >
                                               {/* {target.name}*/}
                                                {target.columnName + "-" + target.name}
                                            </Option>
                                        )}
                                    </Select>
                                    {(this.state.validations && this.state.validations[uniqueID] &&
                                        this.state.validations[uniqueID].logicalTransformation &&
                                        this.state.validations[uniqueID].logicalTransformation[index] &&
                                        this.state.validations[uniqueID].logicalTransformation[index].comparisonFileColumnTargetValueID) ?
                                        <p style={{color: 'red', marginLeft: 15}}>{this.state.validations[uniqueID].logicalTransformation[index].comparisonFileColumnTargetValueID}</p> : null
                                    }

                                </Col>
                           {this.state.isRestrict == true ?
                               <Col span = {4}>
                                   <Select
                                       allowClear
                                       showSearch
                                       dropdownMatchSelectWidth={false}
                                       style={{width: 60}}
                                       placeholder="Condition"
                                       optionFilterProp="children"
                                       onChange={(event) => this.handleChangeSelect(event, index, uniqueID, "logicOperator")}
                                       disabled={this.getDisabled(item.logicOperator, item.blank, hardcoded, 'logicOperator') || !editing}
                                       name={`LogicalTransformation.[${index}].logicOperator`}
                                       //                     onBlur={handleBlur}
                                       value={item.logicOperator}>
                                       <Option value="=" title="Equal to">{"="}</Option>
                                       <Option value="<>" title="Not Equal to">{"<>"}</Option>
                                   </Select>
                                   {(this.state.validations && this.state.validations[uniqueID] &&
                                       this.state.validations[uniqueID].logicalTransformation &&
                                       this.state.validations[uniqueID].logicalTransformation[index] && this.state.validations[uniqueID].logicalTransformation[index].logicOperator) ?
                                       <p style={{color: 'red'}}>{this.state.validations[uniqueID].logicalTransformation[index].logicOperator}</p> : null
                                   }

                               </Col>
                               :
                               <Col span={4}>
                                   <Select
                                       allowClear
                                       showSearch
                                       dropdownMatchSelectWidth={false}
                                       style={{width: 60}}
                                       placeholder="Condition"
                                       optionFilterProp="children"
                                       onChange={(event) => this.handleChangeSelect(event, index, uniqueID, "logicOperator")}
                                       disabled={this.getDisabled(item.logicOperator, item.blank, hardcoded, 'logicOperator') || !editing}
                                       name={`LogicalTransformation.[${index}].logicOperator`}
                                       //                     onBlur={handleBlur}
                                       value={item.logicOperator}>
                                       <Option value="=" title="Equal to">{"="}</Option>
                                       <Option value="<" title="Smaller than">{"<"}</Option>
                                       <Option value=">" title="Greater than">{">"}</Option>
                                       <Option value="<>" title="Not Equal to">{"<>"}</Option>
                                   </Select>
                                   {(this.state.validations && this.state.validations[uniqueID] &&
                                       this.state.validations[uniqueID].logicalTransformation &&
                                       this.state.validations[uniqueID].logicalTransformation[index] && this.state.validations[uniqueID].logicalTransformation[index].logicOperator) ?
                                       <p style={{color: 'red'}}>{this.state.validations[uniqueID].logicalTransformation[index].logicOperator}</p> : null
                                   }
                               </Col>
                           }
                                    {this.state.logicalEnumOptions && this.state.logicalEnumOptions.length > 0 && this.state.logicalIndex == index
                                        ?
                                        <Col span={7}>
                                            <Select
                                                allowClear
                                                showSearch
                                                dropdownMatchSelectWidth={false}
                                                style={{width: 180}}
                                                placeholder="value"
                                                optionFilterProp="children"
                                                disabled={this.getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
                                                name={`logicalTransformation.[${index}].comparisonValue`}
                                                onChange={e => this.handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                onFocus={e => this.handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                value={item.comparisonValue}
                                            >
                                                {this.state.logicalEnumOptions?.map((enumOption) => (<Option value={enumOption}>{enumOption}</Option>))}
                                            </Select>

                                            {(this.state.validations && this.state.validations[uniqueID] &&
                                                this.state.validations[uniqueID].logicalTransformation &&
                                                this.state.validations[uniqueID].logicalTransformation[index] &&
                                                this.state.validations[uniqueID].logicalTransformation[index].comparisonValue)
                                                ?
                                                <p style={{color: 'red', marginLeft: 15}}>{this.state.validations[uniqueID].logicalTransformation[index].comparisonValue}</p> : null
                                            }
                                        </Col> :this.state.logicalDate && this.state.logicalIndex == index
                                                  ?
                                                  <>
                                                  <Col span={7}>
                                                   <Input
                                                   type="text"
                                                   name={`logicalTransformation.[${index}].comparisonValue`}
                                                   style={{width: 155}}
                                                   placeholder="value"
                                                   onChange={e => this.handleChange(e, index, uniqueID, "comparisonValue")}
                                                   value={item.comparisonValue}
                                                   onKeyUp = {(e: any) => this.handleDateChange(e, index, uniqueID, "comparisonValue")}
                                                   allowClear
                                                   disabled={this.getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
                                                   />
                                                    {(this.state.validations && this.state.validations[uniqueID] &&
                                                        this.state.validations[uniqueID].logicalTransformation &&
                                                        this.state.validations[uniqueID].logicalTransformation[index] &&
                                                        this.state.validations[uniqueID].logicalTransformation[index].comparisonValue)
                                                        ?
                                                        <p style={{color: 'red', marginLeft: 15}}>{this.state.validations[uniqueID].logicalTransformation[index].comparisonValue}</p> : null
                                                    }
                                             </Col>

                                             </> :this.state.logicalBoolean && this.state.logicalIndex == index ?
                                               <>
                                               <Col span={7}>
                                                    <Select
                                                        allowClear
                                                        showSearch
                                                        dropdownMatchSelectWidth={false}
                                                        style={{width: 180}}
                                                        placeholder="value"
                                                        optionFilterProp="children"
                                                        disabled={this.getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
                                                        name={`logicalTransformation.[${index}].comparisonValue`}
                                                        onChange={e => this.handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                        onFocus={e => this.handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                        value={item.comparisonValue}
                                                    >
                                                        <Option value="1">True</Option>
                                                        <Option value="0">False</Option>
                                                    </Select>

                                                    {(this.state.validations && this.state.validations[uniqueID] &&
                                                        this.state.validations[uniqueID].logicalTransformation &&
                                                        this.state.validations[uniqueID].logicalTransformation[index] &&
                                                        this.state.validations[uniqueID].logicalTransformation[index].comparisonValue)
                                                        ?
                                                        <p style={{
                                                            color: 'red',
                                                            marginLeft: 15
                                                        }}>{this.state.validations[uniqueID].logicalTransformation[index].comparisonValue}</p> : null
                                                    }
                                                </Col>
                                            </>
                                            :
                                            <Col span={7}>
                                                <Input
                                                    type="text"
                                                    name={`logicalTransformation.[${index}].comparisonValue`}
                                                    style={{width: 155}}
                                                    placeholder="value"
                                                    onChange={e => this.handleChange(e, index, uniqueID, "comparisonValue")}
                                                    onFocus={e => this.handleChange(e, index, uniqueID, "comparisonValue")}
                                                    value={(item.comparisonValue == 1 && this.state.logicalTransformBoolean.includes(item.comparisonFileColumnTargetValueID)) ? "True" : (item.comparisonValue == null && item.comparisonValue == '') ? null : (item.comparisonValue == 0 && item.comparisonValue != '' && this.state.logicalTransformBoolean.includes(item.comparisonFileColumnTargetValueID)) ? "False" : item.comparisonValue}
                                                    allowClear
                                                    disabled={this.getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
                                                />
                                                    {(this.state.validations && this.state.validations[uniqueID] &&
                                                    this.state.validations[uniqueID].logicalTransformation &&
                                                    this.state.validations[uniqueID].logicalTransformation[index] &&
                                                    this.state.validations[uniqueID].logicalTransformation[index].comparisonValue)
                                                    ?
                                                    <p style={{
                                                        color: 'red',
                                                        marginLeft: 15
                                                    }}>{this.state.validations[uniqueID].logicalTransformation[index].comparisonValue}</p> : null
                                                }
                                            </Col>
                                    }


                                    <Col span={5}>
                                        {this.getBlankCheck(uniqueID, index, item, "logical")}

                                       { editing?<Icon
                                            className="dynamic-delete-button"
                                            type="minus-circle-o"
                                            style={{marginLeft: 5, marginTop: 10}}
                                            onClick={() => this.remove(index, uniqueID, "logical")}
                                        /> : null}
                                    </Col>
                                </Row>


                            </>
                        ))}
                        {values && values.logicalDerivationRowsets && values.logicalDerivationRowsets.map((item,key)=>(
                        <LogicalDerivations
                        item={item}
                        index= {key}
                        uniqueID= {uniqueID}
                        hardcoded= {hardcoded}
                        checkTargets= {this.checkTargets}
                        validations={this.state.validations}
                        handleChangeSelect={this.handleChangeSelect}
                        handleChange ={this.handleChange}
                        logicalDerEnumOptions= {this.state.logicalDerEnumOptions}
                        logicalDerIndex={ this.state.logicalDerIndex}
                        logicalDerBoolean= {this.state.logicalDerBoolean}
                        logicalDeriveBoolean = {this.state.logicalDeriveBoolean}
                        getBlankCheck= {this.getBlankCheck}
                        remove = {this.remove}
                        mappedTargets={this.state.mappedTargets}
                        getDisabled= {this.getDisabled}
                        fileColumnProperties= {this.props.fileColumnProperties}
                        inputContent ={this.inputContent}
                        targetDetail= {targetDetail}
                        addDerConditions= {this.addDerConditions}
                        editing = {this.props.editing}
                        logicalDerDate = {this.state.logicalDerDate}
                        handleDateChange = {this.handleDateChange}
                        />
                        ))}
                        {this.state.transformations[uniqueID] && this.state.transformations[uniqueID].logicalDerivationRowsets && this.state.transformations[uniqueID].logicalDerivationRowsets.length>0 &&<Row style={{marginBottom:10}}>
                        <Col span ={10}>
                        <span>ELSE</span>
                        {this.inputContent(targetDetail, uniqueID, null, values, 3)}
                        {<p style={{color:"red", marginLeft:'40px'}}>{this.state.validations?.[uniqueID]?.elseValue}</p>}
                        </Col>
                             <Col span={4}>
                             {this.getBlankCheck(uniqueID, null, values, "elseInd")}
                              </Col>
                       </Row>}
                        <div>
                            <Dropdown overlay={this.menu(uniqueID)} disabled = {!editing}>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                                <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()} data-cy="addMappings">
                                    <span>Add Transformation(s)</span>
                                    <Icon type="down"/>
                                </a>
                            </Dropdown>

                        </div>
                        <div>
                            <label htmlFor="HardCoded">Hardcoded:</label>
                            <Input
                                type="text"
                                name={`hardcodedValue.value`}
                                style={{width: 200, marginLeft: 10}}
                                onChange={e => this.handleChange(e, null, uniqueID, "hardcoded")}
                                onBlur={handleBlur}
                                value={values && values.hardcodedValue ? values.hardcodedValue.value : null}
                                disabled={(values?.hardcodedValue && values?.hardcodedValue?.blank) || (transformations[uniqueID]?.logicalTransformation?.length) || (transformations[uniqueID]?.valueTransformation?.length) || (transformations[uniqueID]?.logicalDerivationRowsets?.length) || !editing}
                            />
                         {/* {this.getBlankCheck(uniqueID, null, null, "hardcoded")} */}
                        </div>

                    </Form>
                )}
            </Formik>
        </div>)
    }

    render() {
        const {fileColumnProperties, assignVisible ,  } = this.props;
        const {targetDetails, validationsLoading} = this.state;

        return (<>
            <Modal
                title="Value Transformation"
                visible={assignVisible}
                width={720}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                destroyOnClose
                maskClosable={false}
            >

                <>
                    {!validationsLoading ? (
                        <Collapse defaultActiveKey={[fileColumnProperties[0].uniqueID]}>
                            {
                                fileColumnProperties.map((colProperty) => {
                                    // will need to be updated if we switch to multiple of the same targetValues on one mapping
                                    const {targetValueID, uniqueID} = colProperty;

                                    const targetDetail = targetDetails.find((target) => target.targetValueID === targetValueID);

                                    return (
                                        targetDetail && (
                                            <Collapse.Panel header={targetDetail?.name} key={uniqueID}>

                                                {this.parseValidationRules(targetDetail)?.map((validation) => {
                                                    if (validation.message) return <ul>
                                                        <li>{validation.message}</li>
                                                    </ul>;
                                                    return null;
                                                })}
                                                {this.formItems(uniqueID, targetDetail)}
                                            </Collapse.Panel>
                                        )
                                    );
                                })
                            }
                        </Collapse>

                    ) : null}
                </>
            </Modal>

            </>
        )

    }
}

