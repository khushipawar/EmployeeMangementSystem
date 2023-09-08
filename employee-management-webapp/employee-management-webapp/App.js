  if (dateFormat) {

            return (
                <Input
                    type="text"
                    name={key===3?`transformations[uniqueID].elseValue` : (key===2)?`logicalDerivationRowsets.[${index}].thenValue`:`valueTransformation.[${index}].mappedValue`}
                    style={{width: 180, marginLeft: 10}}
                    placeholder={(key===3)?"Else":key ===2?"Then":"Map to"}
                    onKeyUp={(e: any) => this.handleKey(e, index, uniqueID)}
                    onChange={(e: any) => key===3? this.handleChange(e, index, uniqueID, "elseInd") : key===2?this.handleChange(e, index, uniqueID, "thenValue"):this.handleChange(e, index, uniqueID, "mappedValue")}
                    value={key=== 3 ? this.getElse(item.elseValue, uniqueID) : key===2? item.thenValue:item.mappedValue}
                    allowClear
                    disabled={(key === 3 ? this.getDisabled(item.elseInd, item.blankInd, hardcoded, "elseInd")
                                                    :key===2 ? this.getDisabled(item.thenValue, item.blankInd, hardcoded, "thenValue")
                                                    :this.getDisabled(item.mappedValue, item.blank, hardcoded, "mappedValue")) || !editing}

                />
            );
        }
