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
