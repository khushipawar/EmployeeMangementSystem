getValidation = (values) => {
        let isErr = false
        let errors = {}
        const x = []
        const ids = Object.keys(values);

        ids && ids.map(uniqueID => {

            errors[uniqueID] = {valueTransformation: [], logicalTransformation: [], logicalRelation: "", logicalDerivationRowsets: []}
            if (values[uniqueID].hardcodedValue && values[uniqueID].hardcodedValue.value) {
                isErr = false
            } else {
                values[uniqueID] && values[uniqueID].valueTransformation && values[uniqueID].valueTransformation.forEach(item => {
                    const errorVal = {}

                        if (!item.mappedValue && !item.blank) {
                            errorVal.mappedValue = "Map to is required."
                            isErr = true
                        }
                        if (this.state.dateError == true) {
                        let reg=/^[0-9-]+$/;

                            if (item.mappedValue.split("-")[0] > 12 || item.mappedValue.split("-")[1] > 31 || item.mappedValue.split("-")[2] < 1920 || item.mappedValue.split("-")[2] > 9999) {
                                errorVal.mappedValue = "Invalid Date."
                                isErr = true
                            }
                            if(!reg.test(item.mappedValue) && item.mappedValue)
                            {
                             errorVal.mappedValue = "Invalid Date."
                             isErr = true
                            }

                        }
                        if (!item.value) {
                            errorVal.value = "Map from is required."
                            isErr = true
                        }
                    x.push(item.value)
                    errors[uniqueID].valueTransformation.push(errorVal)
                })

                values[uniqueID] && values[uniqueID].logicalTransformation && values[uniqueID].logicalTransformation.forEach(item => {
                    const errorLogical = {}
                     if (!item.comparisonValue && !item.blank) {
                            isErr = true;
                            errorLogical.comparisonValue = "value or blank is required."
                        }
                     if (this.state.dateError == true) {
                              let reg=/^[0-9-]+$/;

                                  if (item.mappedValue.split("-")[0] > 12 || item.mappedValue.split("-")[1] > 31 || item.mappedValue.split("-")[2] < 1920 || item.mappedValue.split("-")[2] > 9999) {
                                       errorVal.mappedValue = "Invalid Date."
                                       isErr = true
                                      }
                                  if(!reg.test(item.mappedValue) && item.mappedValue)
                                    {
                                      errorVal.mappedValue = "Invalid Date."
                                      isErr = true
                                       }
                     }
                     if (!item.comparisonFileColumnTargetValueID || item.comparisonFileColumnTargetValueID ==="") {
                            isErr = true;
                            errorLogical.comparisonFileColumnTargetValueID = "Target is required."
                        }
                    if (!item.logicOperator) {
                            isErr = true;
                            errorLogical.logicOperator = "Condition is required."
                        }
                        errors[uniqueID].logicalTransformation.push(errorLogical)
                })
                values[uniqueID] && values[uniqueID].logicalDerivationRowsets && values[uniqueID].logicalDerivationRowsets.forEach(item => {
                 const errorDeriveCondition = {logicalDerivationConditions : []}

                    item.logicalDerivationConditions.forEach((conItem) =>{
                   let errorCon={}
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
                    if(!item.thenValue && !item.blankInd){
                    errorDeriveCondition.thenValue = "value or blank is required."
                    }
                 errors[uniqueID].logicalDerivationRowsets.push(errorDeriveCondition)
                })

                let errorLogicalRelation = ""

                if( values[uniqueID] && values[uniqueID].logicalTransformation.length > 1 && values[uniqueID].logicalRelation == null){
                    isErr = true;

                    errorLogicalRelation = "Condition is required"
                    errors[uniqueID].logicalRelation = errorLogicalRelation
                    {<p> errorLogicalRelation</p>}

                }
            }
        })

        this.setState({isError: isErr})
        return errors;
    }
