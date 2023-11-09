logicalDate && logicalIndex === index ?
<Col span={7}>
<Input
    type="text"
    style={{width: 155}}
    placeholder="Enter Value"
    onKeyUp={(e: any) => handleKey(e, index, uniqueID, "comparisonForLogical")}
    onChange= {e => handleChange(e, index, uniqueID, "comparisonValue")}
    value={item.comparisonValue}
    disabled={getDisabled(item.comparisonValue, item.blank, hardcoded, 'comparisonValue') || !editing}
    name={`logicalTransformation.[${index}].comparisonValue`}
    />
    {(validations?.[uniqueID]?.logicalTransformation?.[index]?.comparisonValue)
        ?
        <p style={{
            color: 'red',
            marginLeft: 15
        }}>{validations?.[uniqueID]?.logicalTransformation?.[index]?.comparisonValue}</p> : null
    }
</Col>
  handleChange = (e, index, uniqueID, key,conIndex) => {
        const transformations = Object.assign({},this.state.transformations)
        if (key == "value") {
            transformations[uniqueID].valueTransformation[index].blank = false
            transformations[uniqueID].valueTransformation[index].checked = false
            transformations[uniqueID].valueTransformation[index].value = e.target.value;
        }
        if (key == "mappedValue") {
            transformations[uniqueID].valueTransformation[index].blank = false
            transformations[uniqueID].valueTransformation[index].checked = false
            transformations[uniqueID].valueTransformation[index].mappedValue = e.target.value;
        }
        if (key == "thenValue") {
            transformations[uniqueID].logicalDerivationRowsets[index].thenValue = e.target.value;
        }
        if (key == "mappedValueDate") {
            transformations[uniqueID].valueTransformation[index].mappedValue = e.target.value;
        }
        if (key == "elseInd") {
            transformations[uniqueID].elseValue = e.target.value;
        }
        if (key == "thenValue") {
            transformations[uniqueID].logicalDerivationRowsets[index].thenValue = e.target.value;
       }
        if (key == "comparisonValue") {
        let targetId
        this.props.dataSource.forEach(data=>{
        data.fileColumnProperties.forEach(fileProps=>{
        if(fileProps.fileColumnTargetValueID=== transformations[uniqueID].logicalTransformation[index].comparisonFileColumnTargetValueID){
        targetId = fileProps.targetValueID
        }
        })
        })
//             let targetId = transformations[uniqueID].logicalTransformation[index].targetValue.targetValueID
            if (targetId != null) {
                fetchTargetValidations(targetId)
                    .then((targetDetail) => {
                        if (targetDetail) {
                            const enumOptions = this.parseEnumOptions(targetDetail);
                            let isEnumhasNoNumericValues = false;
                            if(enumOptions !== undefined && typeof enumOptions === 'object'){
                            isEnumhasNoNumericValues = Object.values(enumOptions).every(option => isNaN(option) || Number.isInteger(Number (option)));
                            }
                            const isString = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.LENGTH) && [168, 169, 170, 171, 172, 228, 237].includes(targetDetail.targetValueID);
                            const isBoolean = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.BOOLEAN);
                            const isDate = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.DATE);
                            this.setState({
                                logicalEnumOptions: enumOptions,
                                logicalEnum: isEnumhasNoNumericValues,
                                logicalString: isString,
                                logicalBoolean: isBoolean,
                                logicalIndex: index,
                                logicalDate: isDate
                            });
                        }
                    });
            }

            transformations[uniqueID].logicalTransformation[index].blank = false
            transformations[uniqueID].logicalTransformation[index].checked = false
            transformations[uniqueID].logicalTransformation[index].comparisonValue = e.target.value;
        }
           if (key == "comparisonValueDer") {
                let targetId
                   this.props.dataSource.forEach(data=>{
                   data.fileColumnProperties.forEach(fileProps=>{
                   if(fileProps.fileColumnTargetValueID=== transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].comparisonFileColumnTargetValueID){
                   targetId = fileProps.targetValueID
                   }
                   })
                   })
                    if (targetId != null) {
                        fetchTargetValidations(targetId)
                            .then((targetDetail) => {
                                if (targetDetail) {
                                    let isEnumhasNoNumericValues = false;
                                    const enumOptions = this.parseEnumOptions(targetDetail);
                                    if(enumOptions !== undefined && typeof enumOptions === 'object'){
                                    isEnumhasNoNumericValues = Object.values(enumOptions).every(option => isNaN(option) || !Number.isInteger(Number (option)));
                                    }
                                    const isString = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.LENGTH) && [168, 169, 170, 171, 172, 228, 237].includes(targetDetail.targetValueID);
                                    const isBoolean = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.BOOLEAN);
                                    const isDate = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.DATE);
                                    this.setState({
                                        logicalDerEnumOptions: enumOptions,
                                        logicalDerBoolean: isBoolean,
                                        logicalDerString: isString,
                                        logicalDerEnum: isEnumhasNoNumericValues,
                                        logicalDerIndex: conIndex,
                                        logicalDerDate: isDate
                                    });
                                }
                            });
                    }
            transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].comparisonValue = e.target.value;

                }
        if (key == "hardcoded") {
            transformations[uniqueID].hardcodedValue = {...transformations[uniqueID].hardcodedValue, value: e.target.value}
        }
        if (key === "value_blank") {
            transformations[uniqueID].valueTransformation[index].blank = e.target.checked;
            transformations[uniqueID].valueTransformation[index].checked = e.target.checked;
        }
        if (key === "logical_blank") {
            transformations[uniqueID].logicalTransformation[index].blank = e.target.checked;
            transformations[uniqueID].logicalTransformation[index].checked = e.target.checked;
        }
        if (key === "derivationCon_blank") {
                    transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].blankInd = e.target.checked;
                    transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].checked = e.target.checked;
        }
        if (key === "derThen") {
                            transformations[uniqueID].logicalDerivationRowsets[index].blankInd = e.target.checked;
                            transformations[uniqueID].logicalDerivationRowsets[index].checked = e.target.checked;
        }
        if (key === "elseBlank") {
                            transformations[uniqueID].blankInd = e.target.checked;
                            transformations[uniqueID].checked = e.target.checked;
        }
        if (key == "hardcoded_blank") {
            transformations[uniqueID].hardcodedValue = {...transformations[uniqueID].hardcodedValue, blank: e.target.checked, checked: e.target.checked}
        }

        this.setState({transformations: transformations})
        this.setState({validations: this.getValidation(transformations)})

    }
  handleKey = (e, index, uniqueID, type, conIndex) => {
   const transformations= {...this.state.transformations};
        if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
            let size = e.target.value.length;
            if ((size == 2 && e.target.value < 13) || (size == 5 && Number(e.target.value.split('-')[1]) < 32)) {
                e.target.value += '-';
            }
        }
        if(type === "comparisonForLogical"){
        transformations[uniqueID].logicalTransformation[index].comparisonValue=e.target.value;
        }
        else if(type === "valueTransformation"){
        let valueArr;
        if(!this.state.valueDateUniqueId?.includes(uniqueID)){
        valueArr =[...this.state?.valueDateUniqueId, uniqueID]
        this.setState({dateError: true, valueDateUniqueId:valueArr});
        }
        transformations[uniqueID].valueTransformation[index].mappedValue= e.target.value;
        }
        else if(type === "elseInd"){
        if(!this.state.elseDateUniqueId?.includes(uniqueID)){
        this.setState({elseDateUniqueId: [...this.state.elseDateUniqueId, uniqueID]})
        }
        transformations[uniqueID].elseValue= e.target.value;
        this.setState({elseDateInd:true})
        }
        else if(type === "thenValue"){
        if(!this.state.thenDateUniqueId?.includes(uniqueID)){
           this.setState({thenDateUniqueId: [...this.state.thenDateUniqueId, uniqueID]})
        }
        transformations[uniqueID].logicalDerivationRowsets[index].thenValue= e.target.value;
        this.setState({thenDateInd:true})
        }
        else if(type === "comparisonForDer"){

        if(!this.state.thenDateUniqueId?.includes(uniqueID)){
           this.setState({derDateUniqueId: [...this.state.derDateUniqueId, uniqueID]})
        }
        transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].comparisonValue = e.target.value;
        this.setState({derDateIndex: index, conIndex: conIndex, isDerDate:true})
        }
this.setState({transformations:transformations})
    }
