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
                                        </Col> : this.state.logicalBoolean && this.state.logicalIndex == index ?
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
