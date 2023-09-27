  handleDateChange = (e, index, uniqueID, key,conIndex) => {
            const transformations = {...this.state.transformations}
             const size = transformations[uniqueID].logicalDerivationRowsets.length;
//             if(!isArrayLogical)
//             { this.setState(prevState => ({
//              isArrayLogical:[...prevState.isArrayLogical.slice(0,size),
//              false,
//              ...prevState.isArrayLogical.slice(size +1)
//              ]
//              }));
//              }
            const isArrayLogical = [this.state.isArrayLogical];
            while(isArrayLogical.length >= index)
            {
                isArrayLogical.push(false);
            }
//             console.log("Values :"+isArrayLogical);
            if(isNaN(e.key) && key==="elseInd"){
            this.setState({dateErrorElse: true})
            }
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 &&
                   e.keyCode <= 105)) {
                   let size= e.target.value.length ;
                   if ((size == 2 && e.target.value < 13) || (size == 5 && Number(e.target.value.split('-')[1]) < 32)) {
                       e.target.value += '-';
               }
            if (key == "mappedValue") {
                 transformations[uniqueID].valueTransformation[index].mappedValue = e.target.value;
            }
            if (key == "thenValue") {
                  transformations[uniqueID].logicalDerivationRowsets[index].thenValue = e.target.value;
            }
            if (key == "elseInd") {
            transformations[uniqueID].elseValue = e.target.value;
            this.setState({dateErrorElse: true})
            }
            if (key == "comparisonValue") {
                transformations[uniqueID].logicalTransformation[index].comparisonValue = e.target.value;
                console.log("Comparison Value Index :" + index);
               isArrayLogical[index] = true;

            }
            if (key == "comparisonValueDer") {
             transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].comparisonValue = e.target.value;
            }
            this.setState({transformations: transformations})
            }
            this.setState({ isArrayLogical })
//             if(key === "mappedValue")
//             {
//               this.setState({dateErrorforMapped : true});
//             }
//             if(key == "thenValue")
//             {
//                this.setState({dateErrorforThen: true})
//             }
//             if(key == "comparisonValue")
//             {
//                this.setState({dateErrorforComparison: true})
//             }
//             if(key == "comparisonValueDer")
//             {
//                this.setState({dateErrorforComparisonDer: true})
//             }
        }


 getValidation = (values) => {
        let isErr = false
        let errors = {}
        const x = []
        const ids = Object.keys(values);
        ids && ids.map(uniqueID => {
            errors[uniqueID] = {valueTransformation: [], logicalTransformation: [], logicalRelation: "", logicalDerivationRowsets: [],elseValue:''}

             if(values?.[uniqueID]?.elseValue && this.state.dateErrorElse){
                          let reg=/^[0-9-]+$/;
                            if (values?.[uniqueID]?.elseValue.split("-")[0] > 12 ||
                                values?.[uniqueID]?.elseValue.split("-")[1] > 31 ||
                                values?.[uniqueID]?.elseValue.split("-")[2] < 1920 ||
                                values?.[uniqueID]?.elseValue.split("-")[2] > 9999) {
                                    errors[uniqueID].elseValue ="Invalid Date"
                                    isErr = true
                              }
                        if((!reg.test(values?.[uniqueID]?.elseValue) && values?.[uniqueID]?.elseValue) ||!isNaN(values?.[uniqueID]?.elseValue))
                             {
                                 errors[uniqueID].elseValue ="Invalid Date"
                                isErr = true
                             }

                        }
            if (values[uniqueID].hardcodedValue && values[uniqueID].hardcodedValue.value) {
                isErr = false
            } else {
               Object.entries(values[uniqueID] && values[uniqueID].valueTransformation && values[uniqueID].valueTransformation).map(([key,item]) => {
                    const errorVal = {}

                        if (!item.mappedValue && !item.blank) {
                            errorVal.mappedValue = "Map to is required."
                            isErr = true
                        }
                        if (this.state.dateErrorforMapped== true) {
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

                Object.entries(values[uniqueID] && values[uniqueID].logicalTransformation && values[uniqueID].logicalTransformation).map(([key,item]) => {
                    const errorLogical = {}
                     if (!item.comparisonValue && !item.blank) {
                            isErr = true;
                            errorLogical.comparisonValue = "value or blank is required."
                        }

                          if (item.comparisonValue && this.state.dateErrorforComparison == true) {
                                                    let reg=/^[0-9-]+$/;

                                                    if (item.comparisonValue.split("-")[0] > 12 || item.comparisonValue.split("-")[1] > 31 || item.comparisonValue.split("-")[2] < 1920 || item.comparisonValue.split("-")[2] > 9999) {
                                                               errorLogical.comparisonValue = "Invalid Date."
                                                                isErr = true
                                                          }
                                                    if(!reg.test(item.comparisonValue) && item.comparisonValue)
                                                         {
                                                            errorLogical.comparisonValue = "Invalid Date."
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
                Object.entries(values[uniqueID] && values[uniqueID].logicalDerivationRowsets && values[uniqueID].logicalDerivationRowsets).map(([key,item]) => {
                 const errorDeriveCondition = {logicalDerivationConditions : []}

                    item.logicalDerivationConditions.forEach((conItem) =>{
                   let errorCon={}
                       if (!conItem.comparisonValue && !conItem.blankInd) {
                                   isErr = true;
                                   errorCon.comparisonValue = "value or blank is required."
                                   }
                        if (isArrLogical[index] == uniqueId) {
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
                    isErr = true;
                    }
                     if (this.state.dateErrorforThen == true) {
                                              let reg=/^[0-9-]+$/;

                                              if (item.thenValue.split("-")[0] > 12 || item.thenValue.split("-")[1] > 31 || item.thenValue.split("-")[2] < 1920 || item.thenValue.split("-")[2] > 9999) {
                                                 errorDeriveCondition.thenValue = "Invalid Date."
                                                 isErr = true
                                                 }
                                              if(!reg.test(item.thenValue) && item.thenValue)
                                                 {
                                                   errorDeriveCondition.thenValue = "Invalid Date."
                                                   isErr = true
                                                 }

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
