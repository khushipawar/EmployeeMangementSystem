import React from "react";
import {Form, Input, Icon, Select,  Dropdown, Menu, Col, Row , Option} from "antd";

const {Option} = Select;
const LogicalTransformations =(props)=>{
const {index ,item, handleChange, handleChangeSelect, getDisabled, uniqueID, targetValue, hardcoded, validations, remove, getBlankCheck,
editing , isRestrict, logicalEnumOptions , logicalIndex ,logicalBoolean , logicalTransformBoolean , fileColumnProperties , checkTargets , mappedTargets , transformations} = props;
return (<div>

                        <Col>
                                <Select
                                allowClear
                                showSearch
                                dropdownMatchSelectWidth={false}
                                style={{width: 120}}
                                placeholder="AND/OR"
                                optionFilterProp="children"
                                name={`logicalRelation`}
                                onChange={(event) => handleChangeSelect(event, 0, uniqueID, "logicalRelation")}
                                value={transformations[uniqueID] && transformations[uniqueID].logicalRelation}
                                disabled = {!editing}
                                >
                                <Option value="AND">AND</Option>
                                <Option value="OR">OR</Option>
                            </Select>

                                {
                                validations &&
                                validations[uniqueID] &&
                                validations[uniqueID].logicalRelation ? (
                                <p style={{ color: 'red', marginLeft: 15 }}>
                                {validations[uniqueID].logicalRelation}
                                </p>
                                ) : null
                                }

                            </Col>


                        {transformations[uniqueID] && transformations[uniqueID].logicalTransformation.length > 1 ?
                            <Icon
                                style={{marginLeft: 5, marginTop: 10}}
                                className="dynamic-delete-button"
                                type="question-circle-o"
                                title="AND evaluates all conditions must be true for the overall condition to be true. OR evaluates that one of the conditions must be true for the overall condition to be true."
                            /> : null
                        }

                       <>
                       <Row style={{marginBottom: 10}}><Col span={8}>
                                    <span>IF</span>

                                    <Select
                                        showSearch
                                        allowClear
                                        style={{width: 180}}
                                        optionFilterProp="children"
                                        disabled={getDisabled(item.comparisonFileColumnTargetValueID, item.blank, hardcoded, 'targetValue') || !editing}
                                        name={`LogicalTransformation.[${index}].comparisonFileColumnTargetValueID`}
                                        onChange={(event) => {handleChangeSelect(event, index, uniqueID, "targetValue")}}
                                        value={item.comparisonFileColumnTargetValueID? item.comparisonFileColumnTargetValueID: fileColumnProperties.logicalTransformation && fileColumnProperties.logicalTransformation[index].comparisonFileColumnTargetValueID}
                                    >
                                        {checkTargets(mappedTargets).map((target, i) =>

                                            <Option
                                                value={target.comparisonFileColumnTargetValueID}
                                                key={i}
                                            >
                                               {/* {target.name}*/}
                                                {target.columnName + "-" + target.name}
                                            </Option>
                                        )}
                                    </Select>
                                    {(validations && validations[uniqueID] &&
                                      validations[uniqueID].logicalTransformation &&
                                      validations[uniqueID].logicalTransformation[index] &&
                                      validations[uniqueID].logicalTransformation[index].comparisonFileColumnTargetValueID) ?
                                        <p style={{color: 'red', marginLeft: 15}}>{validations[uniqueID].logicalTransformation[index].comparisonFileColumnTargetValueID}</p> : null
                                    }

                                </Col>
                           {isRestrict == true ?
                               <Col span = {4}>
                                   <Select
                                       allowClear
                                       showSearch
                                       dropdownMatchSelectWidth={false}
                                       style={{width: 60}}
                                       placeholder="Condition"
                                       optionFilterProp="children"
                                       onChange={(event) => handleChangeSelect(event, index, uniqueID, "logicOperator")}
                                       disabled={getDisabled(item.logicOperator, item.blank, hardcoded, 'logicOperator') || !editing}
                                       name={`LogicalTransformation.[${index}].logicOperator`}
                                       value={item.logicOperator}>
                                       <Option value="=" title="Equal to">{"="}</Option>
                                       <Option value="<>" title="Not Equal to">{"<>"}</Option>
                                   </Select>
                                   {(validations && validations[uniqueID] &&
                                       validations[uniqueID].logicalTransformation &&
                                       validations[uniqueID].logicalTransformation[index] && validations[uniqueID].logicalTransformation[index].logicOperator) ?
                                       <p style={{color: 'red'}}>{validations[uniqueID].logicalTransformation[index].logicOperator}</p> : null
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
                                       onChange={(event) => handleChangeSelect(event, index, uniqueID, "logicOperator")}
                                       disabled={getDisabled(item.logicOperator, item.blank, hardcoded, 'logicOperator') || !editing}
                                       name={`LogicalTransformation.[${index}].logicOperator`}
                                       //                     onBlur={handleBlur}
                                       value={item.logicOperator}>
                                       <Option value="=" title="Equal to">{"="}</Option>
                                       <Option value="<" title="Smaller than">{"<"}</Option>
                                       <Option value=">" title="Greater than">{">"}</Option>
                                       <Option value="<>" title="Not Equal to">{"<>"}</Option>
                                   </Select>
                                   {(validations && validations[uniqueID] &&
                                       validations[uniqueID].logicalTransformation &&
                                       validations[uniqueID].logicalTransformation[index] && validations[uniqueID].logicalTransformation[index].logicOperator) ?
                                       <p style={{color: 'red'}}>{validations[uniqueID].logicalTransformation[index].logicOperator}</p> : null
                                   }
                               </Col>
                           }
                                    {logicalEnumOptions && logicalEnumOptions.length > 0 && logicalIndex == index
                                        ?
                                        <Col span={7}>
                                            <Select
                                                allowClear
                                                showSearch
                                                dropdownMatchSelectWidth={false}
                                                style={{width: 180}}
                                                placeholder="value"
                                                optionFilterProp="children"
                                                disabled={getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
                                                name={`logicalTransformation.[${index}].comparisonValue`}
                                                onChange={e => handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                onFocus={e => handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                value={item.comparisonValue}
                                            >
                                                {logicalEnumOptions?.map((enumOption) => (<Option value={enumOption}>{enumOption}</Option>))}
                                            </Select>

                                            {(validations && validations[uniqueID] &&
                                                validations[uniqueID].logicalTransformation &&
                                                validations[uniqueID].logicalTransformation[index] &&
                                                validations[uniqueID].logicalTransformation[index].comparisonValue)
                                                ?
                                                <p style={{color: 'red', marginLeft: 15}}>{validations[uniqueID].logicalTransformation[index].comparisonValue}</p> : null
                                            }
                                        </Col> : logicalBoolean && logicalIndex == index ?
                                            <>
                                                <Col span={7}>
                                                    <Select
                                                        allowClear
                                                        showSearch
                                                        dropdownMatchSelectWidth={false}
                                                        style={{width: 180}}
                                                        placeholder="value"
                                                        optionFilterProp="children"
                                                        disabled={getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
                                                        name={`logicalTransformation.[${index}].comparisonValue`}
                                                        onChange={e => handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                        onFocus={e => handleChangeSelect(e, index, uniqueID, "comparisonValue")}
                                                        value={item.comparisonValue}
                                                    >
                                                        <Option value="1">True</Option>
                                                        <Option value="0">False</Option>
                                                    </Select>

                                                     {validations &&
                                                     validations[uniqueID] &&
                                                     validations[uniqueID].logicalTransformation &&
                                                     validations[uniqueID].logicalTransformation[index] &&
                                                     validations[uniqueID].logicalTransformation[index].comparisonValue ? (
                                                     <Col>
                                                     <p style={{ color: 'red', marginLeft: 15 }}>
                                                     {validations[uniqueID].logicalTransformation[index].comparisonValue}
                                                     </p>
                                                     </Col>
                                                     ) : null
                                                     }

                                                </Col>
                                            </>
                                            :
                                            <>
                                            <Col span={7}>
                                                <Input
                                                    type="text"
                                                    name={`logicalTransformation.[${index}].comparisonValue`}
                                                    style={{width: 155}}
                                                    placeholder="value"
                                                    onChange={e => handleChange(e, index, uniqueID, "comparisonValue")}
                                                    onFocus={e => handleChange(e, index, uniqueID, "comparisonValue")}
                                                    value={(item.comparisonValue == 1 && logicalTransformBoolean.includes(item.comparisonFileColumnTargetValueID)) ? "True" : (item.comparisonValue == null && item.comparisonValue == '') ? null : (item.comparisonValue == 0 && item.comparisonValue != '' && logicalTransformBoolean.includes(item.comparisonFileColumnTargetValueID)) ? "False" : item.comparisonValue}
                                                    allowClear
                                                    disabled={getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
                                                />
                                                    {validations && validations[uniqueID] && validations[uniqueID].logicalTransformation &&
                                                    validations[uniqueID].logicalTransformation[index] &&
                                                    validations[uniqueID].logicalTransformation[index].comparisonValue ? (
                                                    <Col style={{ marginLeft: 15 }}>
                                                    <p style={{ color: 'red' }}>
                                                    {validations[uniqueID].logicalTransformation[index].comparisonValue}
                                                    </p>
                                                    </Col>
                                                    ) : null}
                                            </Col>


                                    <Col span={5}>
                                        {getBlankCheck(uniqueID, index, item, "logical")}

                                       { editing?<Icon
                                            className="dynamic-delete-button"
                                            type="minus-circle-o"
                                            style={{marginLeft: 5, marginTop: 10}}
                                            onClick={() => remove(index, uniqueID, "logical")}
                                        /> : null
                                        }
                                    </Col>
                                    </>
                                    }
                                </Row>
                       </>:
   </div>
  )
  }
  export default LogicalTransformations;

