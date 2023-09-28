getValidation = (values) => {
        let isErr = false
        let errors = {}
        const x = []
        const ids = Object.keys(values);
        ids && ids.map(uniqueID => {
            errors[uniqueID] = {valueTransformation: [], logicalTransformation: [], logicalRelation: "", logicalDerivationRowsets: [],elseValue:''}
            const {mappedIndx, logicalderIndx, logicalIndx, thenIndx,conIndx} = this.state;
Object.entries(values[uniqueID] && values[uniqueID].logicalDerivationRowsets && values[uniqueID].logicalDerivationRowsets).map(([key,item]) => {
                 const errorDeriveCondition = {logicalDerivationConditions : []}

                    item.logicalDerivationConditions.forEach((conItem) =>{

                   let errorCon={}
                       if (!conItem.comparisonValue && !conItem.blankInd) {
                                   isErr = true;
                                   errorCon.comparisonValue = "value or blank is required."
                                   }
                                    console.log("derValidation key :"+ key);
                                    console.log("derValidation uniqueID :"+ uniqueID);
                                    console.log("derValidation conIndex : "+ conItem);
                                    console.log("derValidation item:"+ item);
                                    console.log("derValidation :"+ this.state.conIndx);
                        if ( this.state.uniqueIdx == uniqueID && this.state.conIndx == key) {
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
                    console.log("Validation key :"+ key);
                    console.log("Validation uniqueID :"+ uniqueID);
                     if (this.state.thenIndx == key && this.state.uniqueIdx == uniqueID) {
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


  handleDateChange = (e, index, uniqueID, key,conIndex) => {
         const transformations = {...this.state.transformations}
       if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 &&
                   e.keyCode <= 105)) {
                   let size = e.target.value.length;
                   if ((size == 2 && e.target.value < 13) || (size == 5 && Number(e.target.value.split('-')[1]) < 32)) {
                       e.target.value += '-';
               }

          if (key == "comparisonValueDer") {
             transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].comparisonValue = e.target.value;
                this.setState({ conIndx:conIndex})
               this.setState({ uniqueIdx: uniqueID})
            }
            this.setState({transformations: transformations})
            }
                                                                                                                                               
                                                                                                                                               
                                                                                                                                               
