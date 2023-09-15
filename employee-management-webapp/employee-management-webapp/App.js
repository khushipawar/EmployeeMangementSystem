handleDateChange = (e, index, uniqueID, key,conIndex) => {
        const transformations = {...this.state.transformations}
          if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 &&
               e.keyCode <= 105)) {
               let size = e.target.value.length;
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
            if (targetId != null) {
                fetchTargetValidations(targetId)
                    .then((targetDetail) => {
                        if (targetDetail) {
                            const enumOptions = this.parseEnumOptions(targetDetail);
                            const isBoolean = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.BOOLEAN);
                            const isDate = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.DATE);
                            this.setState({
                                logicalEnumOptions: enumOptions,
                                logicalBoolean: isBoolean,
                                logicalDate : isDate,
                                logicalIndex: index
                            });
                        }
                    });
            }
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
                                    const enumOptions = this.parseEnumOptions(targetDetail);
                                    const isBoolean = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.BOOLEAN);
                                    const isDate = targetDetail.validations.some((validation) => validation.errorType === ValidationErrorType.DATE);
                                    this.setState({
                                        logicalDerEnumOptions: enumOptions,
                                        logicalDerBoolean: isBoolean,
                                        logicalDerDate: isDate,
                                        logicalDerIndex: conIndex
                                    });
                                }
                            });
                    }

                    transformations[uniqueID].logicalDerivationRowsets[index].logicalDerivationConditions[conIndex].comparisonValue = e.target.value;

                }
        this.setState({transformations: transformations})
        }
        this.setState({dateError: true})

    }








componentDidUpdate(prevProps: EditableCellProps) {                                                                                                                                                 
                                                                                                                                                                                                    
     const {dataSource, selectedTargets, index} = this.props;                                                                                                                                       
                         console.log("Hi I am Inside! Assign : "+ setAssigned);                                                                                                                     
     if (dataSource && (prevProps.dataSource[index]?.fileColumnProperties?.length !== dataSource[index]?.fileColumnProperties?.length)) {                                                           
                                                                                                                                                                                                    
         if (dataSource[index]?.fileColumnProperties.flatMap((property) => property.columnTransforms).length === 0 &&                                                                               
             dataSource[index]?.fileColumnProperties.flatMap((property) => property.logicalTransforms).length === 0  &&                                                                             
             dataSource[index]?.fileColumnProperties.flatMap((property) => property.logicalDerivationRowsets).length === 0  &&                                                                      
             dataSource[index]?.fileColumnProperties.flatMap((property) => property.elseValue === null)&&                                                                                           
             dataSource[index]?.fileColumnProperties.flatMap((property) => property.blankInd === true) &&                                                                                           
             dataSource[index].fileColumnProperties.filter((property) => property.hardcodedValue === null).map((property) => property.hardcodedValue).length === 0) {                               
             this.setAssigned(false);                                                                                                                                                               
                                                                                                                                                                                                    
         }                                                                                                                                                                                          
                                                                                                                                                                                                    
         if (dataSource &&(dataSource[index]?.fileColumnProperties.flatMap((property) => property.columnTransforms).length > 0 &&                                                                   
             dataSource[index]?.fileColumnProperties.filter((property) => property.logicalTransforms).length > 0 &&                                                                                 
             dataSource[index]?.fileColumnProperties.flatMap((property) => property.logicalDerivationRowsets).length> 0  &&                                                                         
             dataSource[index]?.fileColumnProperties.flatMap((property) => property.elseValue !== null) &&                                                                                          
             dataSource[index]?.fileColumnProperties.flatMap((property) => property.blankInd !== false) &&                                                                                          
             dataSource[index]?.fileColumnProperties.filter((property) => property.hardcodedValue !== null).map((property) => property.hardcodedValue).length > 0))                                 
         {                                                                                                                                                                                          
             this.setAssigned(true);                                                                                                                                                                
         }                                                                                                                                                                                          
                                                                                                                                                                                                    
     }                                                                                                                                                                                              
