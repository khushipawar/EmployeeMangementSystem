<Col span={7}>
     <Input
       type="text"
       name={`logicalDerivationRowsets.[${index}].logicalDerivationConditions.[${keys}].comparisonValue`}
       style={{width: 155}}
       placeholder="value"
       onChange={e => handleChange(e, index, uniqueID, "comparisonValueDer",keys)}
       value={conItems.comparisonValue }
       onKeyUp = {(e: any) => this.handleDateChange(e, index, uniqueID, "LogicalDerivationsRowsets")}
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


values[uniqueID] && values[uniqueID].logicalDerivationRowsets && values[uniqueID].logicalDerivationRowsets.forEach(item => {
 const errorDeriveCondition = {logicalDerivationConditions : []}

    item.logicalDerivationConditions.forEach((conItem) =>{
   let errorCon={}
   if (this.state.dateError == true) {
      let reg=/^[0-9-]+$/;

      if (conItem.comparisonValue.split("-")[0] > 12 || conItem.comparisonValue.split("-")[1] > 31 || conItem.comparisonValue.split("-")[2] < 1920 || conItem.comparisonValue.split("-")[2] > 9999) {
         errorCon.comparisonValue = "Invalid Date."
         isErr = true
         }
      if(!reg.test(conItem.comparisonValue) && conItem.comparisonValue)
         {
           errorCon.comparisonValue = "Invalid Date."
           isErr = true
         }

      }
       if (!conItem.comparisonValue && !conItem.blankInd) {
                   isErr = true;
                   errorCon.comparisonValue = "value or blank is required."
         }
              if (!conItem.comparisonFileColumnTargetValueID || conItem.comparisonFileColumnTargetValueID ==="") {
                   isErr = true;
                   errorCon.comparisonFileColumnTargetValueID = "Target is required."
                   }
                   if (!conItem.logicalOperator) {
                    isErr = true;
                    errorCon.logicalOperator = "Condition is required."
                    }
                    errorDeriveCondition.logicalDerivationConditions.push(errorCon)
    })
    let errorCon={}
    if(!item.thenValue && !item.blankInd)

    {
    errorDeriveCondition.thenValue = "value or blank is required."
    }
 errors[uniqueID].logicalDerivationRowsets.push(errorDeriveCondition)
})


handleDateChange = (e, index, uniqueID, transformationType) =>{
if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 &&
    e.keyCode <= 105)) {
    let size = e.target.value.length;
if ((size === 2 && value < 13) || (size == 5 && Number(value.split('-')[1]) < 32)) {
        e.target.value += '-';
        const newState = {...this.state };
        const newValue = e.target.value;

if(transformationType === 'valueTransformation')
{
newState.transformations[uniqueID].valueTransformation[index].mappedValue = value;
}
else if(transformationType === 'logicalTransformation')
{
newState.transformations[uniqueID].logicalTransformation[index].comparisonValue = value;
}
else if(transformationType === 'LogicalDerivationsRowsets')
{
newState.transformations[uniqueID].logicalDerivationRowsets.comparisonValue = value;
}
 this.setState(newState);
}
}
this.setState({dateError: true});
};

