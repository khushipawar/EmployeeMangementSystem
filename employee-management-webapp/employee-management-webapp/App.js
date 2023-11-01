import React from 'react';
import {
    Form, Input, Icon, Modal, Select, Spin, Dropdown, Menu, Collapse, Checkbox, Col, Row, SubMenu
} from "antd";
const LogicalDerivations =(props)=>{
const {index, item, handleChange, getDisabled, uniqueID, targetValue, fileColumnProperties,hardcoded,
checkTargets , mappedTargets, validations, handleChangeSelect, remove, logicalDeriveBoolean,
getDisabled, logicalDerIndex, logicalDerEnumOptions, logicalDerBoolean, getBlankCheck, inputContent, targetDetail, addDerConditions, editing, handleKey, logicalDerDate, isRestrict} = props;


return (<>
{item && item.logicalDerivationConditions && item.logicalDerivationConditions.map((conItems,keys)=>(<>
    <Row style={{marginBottom: 10}}><Col span={8}>
                                    <span>IF</span>

                                    <Select
                                        showSearch
                                        allowClear
                                        style={{width: 180}}
                                        optionFilterProp="children"
                                        disabled={getDisabled(conItems.comparisonFileColumnTargetValueID, conItems.blank, hardcoded, 'targetValueDer') || !editing}
                                        name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].comparisonFileColumnTargetValueID`}
                                        onChange={(event) => {handleChangeSelect(event, index, uniqueID, "targetValueDer", keys)}}
                                        value={conItems.comparisonFileColumnTargetValueID? conItems.comparisonFileColumnTargetValueID: fileColumnProperties.logicalDerivation && this.props.fileColumnProperties.logicalDerivation[index].comparisonFileColumnTargetValueID}
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
                                        validations[uniqueID].logicalDerivationRowsets &&
                                        validations[uniqueID].logicalDerivationRowsets[index] &&
                                        validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions &&
                                        validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys]) ?
                                        <p style={{color: 'red', marginLeft: 15}}>
                                        {validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys].comparisonFileColumnTargetValueID}</p> : null
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
                                      onChange={(event) => handleChangeSelect(event, index, uniqueID, "logicOperatorDer",keys)}
                                      disabled={getDisabled(conItems.logicalOperator, conItems.blank, hardcoded, 'logicOperatorDer') || !editing}
                                      name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].logicalOperator`}
                                      value={conItems.logicalOperator}>
                                      <Option value="=" title="Equal to">{"="}</Option>
                                      <Option value="<>" title="Not Equal to">{"<>"}</Option>
                                      </Select>
                                      {(validations && validations[uniqueID] &&
                                      validations[uniqueID].logicalDerivationRowsets &&
                                      validations[uniqueID].logicalDerivationRowsets[index] &&
                                      validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions &&
                                      validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys]) ?
                                      <p style={{color: 'red', marginLeft: 15}}>
                                      {validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys].comparisonFileColumnTargetValueID}</p> : null
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
                                            onChange={(event) => handleChangeSelect(event, index, uniqueID, "logicOperatorDer",keys)}
                                            disabled={getDisabled(conItems.logicalOperator, conItems.blank, hardcoded, 'logicOperatorDer') || !editing}
                                            name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].logicalOperator`}
                                            //                     onBlur={handleBlur}
                                            value={conItems.logicalOperator}
                                        >
                                            <Option value="=" title="Equal to">{"="}</Option>
                                            <Option value="<" title="Smaller than">{"<"}</Option>
                                            <Option value=">" title="Greater than">{">"}</Option>
                                            <Option value="<>" title="Not Equal to">{"<>"}</Option>
                                        </Select>
                                        {(validations && validations[uniqueID] &&
                                         validations[uniqueID].logicalDerivationRowsets &&
                                         validations[uniqueID].logicalDerivationRowsets[index] &&
                                         validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions &&
                                         validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys]) ?
                                          <p style={{color: 'red', marginLeft: 15}}>
                                          {validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys].logicalOperator}</p> : null
                                       }
                                    </Col>
                                    }
                                    {logicalDerEnumOptions && logicalDerEnumOptions.length > 0 && logicalDerIndex == keys
                                        ?
                                        <Col span={7}>
                                            <Select
                                                allowClear
                                                showSearch
                                                dropdownMatchSelectWidth={false}
                                                style={{width: 155}}
                                                placeholder="value"
                                                optionFilterProp="children"
                                                disabled={getDisabled(conItems.comparisonValue, conItems.blankInd, hardcoded, 'comparisonValueDer') || !editing}
                                                name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].comparisonValue`}
                                                onChange={e => handleChangeSelect(e, index, uniqueID, "comparisonValueDer", keys)}
                                                onFocus={e => handleChangeSelect(e, index, uniqueID, "comparisonValueDer", keys)}
                                                value={conItems.comparisonValue}
                                            >
                                                {logicalDerEnumOptions?.map((enumOption) => (<Option value={enumOption}>{enumOption}</Option>))}
                                            </Select>
                                        {(validations && validations[uniqueID] &&
                                                                                validations[uniqueID].logicalDerivationRowsets &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index] &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys]) ?
                                                                                <p style={{color: 'red', marginLeft: 15}}>
                                                                                {validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys].comparisonValue}</p> : null
                                       }

                                        </Col> : logicalDerBoolean && logicalDerIndex == keys ?
                                            <>
                                                <Col span={7}>
                                                    <Select
                                                        allowClear
                                                        showSearch
                                                        dropdownMatchSelectWidth={false}
                                                        style={{width: 155}}
                                                        placeholder="value"
                                                        optionFilterProp="children"
                                                        disabled={getDisabled(conItems.comparisonValue, conItems.blankInd, hardcoded, 'comparisonValueDer') || !editing}
                                                        name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].comparisonValue`}
                                                        onChange={e => handleChangeSelect(e, index, uniqueID, "comparisonValueDer", keys)}
                                                        onFocus={e => handleChangeSelect(e, index, uniqueID, "comparisonValueDer", keys)}
                                                        value={conItems.comparisonValue}
                                                    >
                                                        <Option value="1">True</Option>
                                                        <Option value="0">False</Option>
                                                    </Select>
                               {(validations && validations[uniqueID] &&
                                                                                validations[uniqueID].logicalDerivationRowsets &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index] &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys]) ?
                                                                                <p style={{color: 'red', marginLeft: 15}}>
                                                                                {validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys].comparisonValue}</p> : null
                                       }
                                                </Col>
                                            </>
                                    : logicalDerDate && logicalDerIndex === keys ?
                                            <Col span={7}>
                                            <Input
                                                type="text"
                                                style={{width: 155}}
                                                placeholder="Enter Value"
                                                onKeyUp={(e: any) => handleKey(e, index, uniqueID, "comparisonForDer", keys)}
                                                onChange= {e =>handleChange(e, index, uniqueID, "comparisonValueDer", keys)}
                                                value={conItems.comparisonValue}
                                                disabled={getDisabled(conItems.comparisonValue, conItems.blankInd, hardcoded, 'comparisonValueDer') || !editing}
                                                name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].comparisonValue`}
                                                />
                                                {(validations?.[uniqueID]?.logicalDerivationRowsets?.[index]?.logicalDerivationConditions?.[keys]?.comparisonValue)
                                                    ?
                                                    <p style={{
                                                        color: 'red',
                                                        marginLeft: 15
                                                    }}>{validations?.[uniqueID]?.logicalDerivationRowsets?.[index]?.logicalDerivationConditions?.[keys]?.comparisonValue}</p> : null
                                                }
                                            </Col>
                                            :
                                            <Col span={7}>
                                                <Input
                                                    type="text"
                                                    name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].comparisonValue`}
                                                    style={{width: 155}}
                                                    placeholder="value"
                                                    onChange={e => handleChange(e, index, uniqueID, "comparisonValueDer",keys)}
                                                    onFocus={e => handleChange(e, index, uniqueID, "comparisonValueDer", keys)}
                                                    value={(conItems.comparisonValue == 1 && logicalDeriveBoolean.includes(conItems.comparisonFileColumnTargetValueID)) ? "True" : (conItems.comparisonValue == null && conItems.comparisonValue == '') ? null : (conItems.comparisonValue == 0 && item.comparisonValue != '' && logicalDeriveBoolean.includes(conItems.comparisonFileColumnTargetValueID)) ? "False" : conItems.comparisonValue}
                                                    allowClear
                                                    disabled={getDisabled(conItems.comparisonValue, conItems.blankInd, hardcoded, 'comparisonValueDer') || !editing}
                                                />
                               {(validations && validations[uniqueID] &&
                                                                                validations[uniqueID].logicalDerivationRowsets &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index] &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions &&
                                                                                validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys]) ?
                                                                                <p style={{color: 'red', marginLeft: 15}}>
                                                                                {validations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[keys].comparisonValue}</p> : null
                                       }
                                            </Col>
                                    }


                                    <Col span={5}>
                                        {getBlankCheck(uniqueID, index, conItems, "derivationCon", keys)}
                                       {editing && <>{keys === 0 && <Icon
                                            className="dynamic-delete-button"
                                            type="plus-circle-o"
                                            style={{marginLeft: 5, marginTop: 10}}
                                            onClick={() => addDerConditions(index, uniqueID)}
                                            />}
                                        <Icon
                                            className="dynamic-delete-button"
                                            type="minus-circle-o"
                                            style={{marginLeft: 5, marginTop: 10}}
                                            onClick={() => remove(index, uniqueID, keys===0? "logicalDer" : "derCondition",keys)}
                                        />
                                        </>}
                                    </Col>
                                </Row>

</>))}
<Row style={{marginBottom:10}}>
<Col span ={10}>
<span> THEN</span>

{inputContent(targetDetail, uniqueID, index, item, 2)}
{ validations?.[uniqueID]?.logicalDerivationRowsets?.[index] ?
<p style={{color: 'red', marginLeft: 15}}>
{validations[uniqueID].logicalDerivationRowsets[index].thenValue}</p> : null
                                          }
     </Col>
     <Col span={4}>
     {getBlankCheck(uniqueID, index, item, "derThen")}
      </Col>
    </Row>


                     </>
)

}
export default LogicalDerivations;
