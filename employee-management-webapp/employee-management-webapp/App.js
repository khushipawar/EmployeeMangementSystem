import FileAttributeOrder from "../../types/enums/FileAttributeOrder";
import SpecialRowType from "../../types/enums/SpecialRowType";
import FileType from "../../types/enums/FileType";

export const getFilesAttributePresentInFileValueList = (form, props) => {
    const filesAttributeValues = []
    props.fileAttributes.forEach((attribute, index) => {
      const attributeId = attribute.name.toLowerCase().replace(/ /g, "_")
      const fieldDecoratorID = `attribute_${attributeId}`;
      if (form.getFieldValue(attributeId) === FileAttributeOrder.PRESENT_IN_FILE) {
        filesAttributeValues.push({
          "columnName": attribute.name,
          "startPosition": form.getFieldValue(`${fieldDecoratorID}_start`),
          "sequence": index,
           "sequenceOverride": index,
          "required": true,
          "notMapped": false,
          "segmentLength": form.getFieldValue(`${fieldDecoratorID}_length`),
          "fileColumnProperties": [
            {
              "targetValueID": attribute.targetValueID
            }
          ]
        })
      }

    });
    return filesAttributeValues
  }
 export const formatColumns = (type: string, columns: any): Array<Partial<FixedLengthFileSegment | DelimitedFileColumn>> => {

     return columns.map(
         (row: any, index: number) => {
           let fileColumn = {
             sequence: row.sequence,
             afterColumnIndex: row.afterColumnIndex,
             notMapped: row.notMapped,
             required: row.required,
             notes: row.notes,
             columnName: row.columnName,
             fileColumnProperties: row.fileColumnProperties,
           };
           if (type === FileType.DELIMITED) {
             fileColumn = fileColumn as DelimitedFileColumn;
           } else if (type === FileType.FIXED_WIDTH) {
             fileColumn = {
               ...fileColumn,
               segmentLength: row.segmentLength,
             } as FixedLengthFileSegment;
           }
           return fileColumn;
         },
     );
   };
export const   getAttributeValueList = (attributeValuesList, form, map, removeMigrationIndicator:boolean, props) => {
                 props.fileAttributes.forEach((attribute) => {
                   const attributeId = attribute.name.toLowerCase().replace(/ /g, "_")
                   const fieldDecoratorID = `attribute_${attributeId}`;
                   if (attribute.name === 'Migration Indicator') {
                     return
                   }
                   if(FileAttributeOrder.HARDCODED_VALUES === form.getFieldValue(attributeId)){
                   if (form.getFieldValue(fieldDecoratorID)) {
                     if (fieldDecoratorID === "attribute_file_date") {
                       const value = form.getFieldValue("attribute_file_date") === "RECEIVED_DATE"
                           ? form.getFieldValue("attribute_file_date")
                           : form.getFieldValue("attribute_file_date_value") && form.getFieldValue("attribute_file_date_value").format("YYYY-MM-DD");
                       const attributeValue: AttributeValue = {
                         fileMapID: map.fileMapID,
                         targetValueID: attribute.targetValueID,
                         value,
                       };
                       attributeValuesList.push(attributeValue);
                     } else {
                       const attributeValue: AttributeValue = {
                         fileMapID: map.fileMapID,
                         targetValueID: attribute.targetValueID,
                         value: form.getFieldValue(fieldDecoratorID),
                       };
                       attributeValuesList.push(attributeValue);
                     }
                     }
                   }
                 });
                 if (form.getFieldValue("migrationInd") != null && !removeMigrationIndicator) {
                   const attributeValue: AttributeValue = {
                     fileMapID: map.fileMapID,
                     targetValueID: 1883,
                     value: form.getFieldValue("migrationInd"),
                   };
                   attributeValuesList.push(attributeValue);
                 }

                 if (form.getFieldValue("preprocessorVersion") != null ) {
                   const attributeValue1: AttributeValue = {
                     fileMapID: map.fileMapID,
                     targetValueID: 1916,
                     value: form.getFieldValue("preprocessorVersion"),
                   };
                   attributeValuesList.push(attributeValue1);
                 }

                 if (form.getFieldValue("enablePreProcessor") != null) {
                   const attributeValue2: AttributeValue = {
                     fileMapID: map.fileMapID,
                     targetValueID: 1917,
                     value: form.getFieldValue("enablePreProcessor"),
                   };
                   attributeValuesList.push(attributeValue2);

                 }
                 return attributeValuesList;

};
export const formatFileMapAsMultipart = (form: any, fileMap: Partial<FileMap>, includeHeader: boolean): FormData => {
    const formData: FormData = new FormData();
    const fileMapParams = JSON.stringify(fileMap);
    const fileMapBlob: Blob = new Blob([fileMapParams], {
      type: "application/json",
    });
    formData.append("fileMapParams", fileMapBlob);
    if (form.getFieldValue("headerRadio") === "Yes") {
      const headerParams = JSON.stringify({
        rowNumber: form.getFieldValue("headerRowNum"),
      });
      if (includeHeader) {
        const headerBlob: Blob = new Blob([headerParams], {
          type: "application/json",
        });
        formData.append("headerFile", form.getFieldValue("uploadHeader")[0].originFileObj);
        formData.append("headerParams", headerBlob);
      }
    }
    return formData;
  };
  export const   getDelimitedAttributePresentInFileValueList = (form, props) => {
              const delimitedValues = []
              props.fileAttributes.forEach((attribute) => {
                const attributeId = attribute.name.toLowerCase().replace(/ /g, "_")
                const fieldDecoratorID = `attribute_${attributeId}`;
                if (form.getFieldValue(attributeId) === FileAttributeOrder.PRESENT_IN_FILE) {
                  delimitedValues.push({
                    "columnName": attribute.name,
                    "fileMapID": attribute.fileMapID,
                    "sequence": form.getFieldValue(fieldDecoratorID)-1,
                    "sequenceOverride": form.getFieldValue(fieldDecoratorID)-1,
                    "location": form.getFieldValue(fieldDecoratorID),
                    "required": true,
                    "notMapped": false,
                    "fileColumnProperties": [
                      {
                        "targetValueID": attribute.targetValueID
                      }
                    ]
                  })
                }

              });
              return delimitedValues
            }
  export const  getMapColumnsFromAttributesOrderedList = (newMap: Partial<FileMap>, addMigrationIndicatorInSpecialRow: boolean, specialRowID, props) => {
                   const { form } = props;
                   let specialRow: SpecialRow = {
                     fixedLengthFileSegments: [],
                     delimitedFileColumns: [],
                     type: SpecialRowType.ATTRIBUTE,
                     fileMapID: newMap.fileMapID ? newMap.fileMapID : null,
                     specialRowID: specialRowID
                   };
                   const fileAttributesPresent = form.getFieldValue("order") !== undefined && form.getFieldValue("order") !== FileAttributeOrder.NONE;
                   if (form.getFieldValue("attributesOrder")?.orderedList == null && fileAttributesPresent) {
                     form.setFieldsValue({ attributesOrder: { orderedList: this.props.fileAttributes, ignoredList: [] } });
                   }
                   // Adds a note to the migration indicator attribute column of it's value "TRUE" or "FALSE"
                   // We'll use the note field as a value field to encode the value it should be w/o using the HardcodedValue field
                   // mark not mapped so the parser doesn't try to parse it

                   const addEnablePreProcessor = form.getFieldValue("enablePreProcessor") !==null;
                   const addPreProcessorVersion = form.getFieldValue("preprocessorVersion") !==null;

                   // manually set migration indicator
                   const mapColumn: Partial<DelimitedFileColumn | FixedLengthFileSegment> = {};
                   const mapColumn1: Partial<DelimitedFileColumn | FixedLengthFileSegment> = {};
                   const mapColumn2: Partial<DelimitedFileColumn | FixedLengthFileSegment> = {};

                   if(addMigrationIndicatorInSpecialRow){
                     mapColumn.columnName = "Migration Indicator";
                     mapColumn.fileMapID = newMap.fileMapID;
                     mapColumn.sequence = 4; // set to length of list
                     mapColumn.sequenceOverride = mapColumn.sequence;
                     mapColumn.required = false;
                     mapColumn.notMapped = true; // never map Migration Indicator
                     mapColumn.notes = form.getFieldValue("migrationInd"); // check box ID
                     mapColumn.fileColumnProperties = [{
                       targetValueID: 1883,
                     }];
                  }

                   if(addPreProcessorVersion){
                     mapColumn1.columnName = "Preprocessor Version";
                     mapColumn1.fileMapID = null;
                     mapColumn1.sequence = 6 // set to length of list
                     mapColumn1.sequenceOverride = mapColumn1.sequence;
                     mapColumn1.required = false;
                     mapColumn1.notMapped = true; // never map Migration Indicator
                     mapColumn1.notes = form.getFieldValue("preprocessorVersion"); // check box ID
                     mapColumn1.fileColumnProperties = [{
                       targetValueID: 1916,
                     }];
                   }

                   if(addEnablePreProcessor){
                     mapColumn2.columnName = "Ignore Preprocessor";
                     mapColumn2.fileMapID = null;
                     mapColumn2.sequence = 7 // set to length of list
                     mapColumn2.sequenceOverride = mapColumn2.sequence;
                     mapColumn2.required = false;
                     mapColumn2.notMapped = true; // never map Migration Indicator
                     mapColumn2.notes = form.getFieldValue("enablePreProcessor"); // check box ID
                     mapColumn2.fileColumnProperties = [{
                       targetValueID: 1917,
                     }];
                   }


                   if (newMap.fileType === FileType.DELIMITED) {
                     if(addMigrationIndicatorInSpecialRow){
                       specialRow.delimitedFileColumns.push(mapColumn)
                     }
                     const delimitedAttributes: Partial<DelimitedFileColumn>[] = getDelimitedAttributePresentInFileValueList(form, props)
                     specialRow.delimitedFileColumns.push(...delimitedAttributes);
                   }
                   else if (newMap.fileType === FileType.FIXED_WIDTH) {
                     if(addMigrationIndicatorInSpecialRow){
                       specialRow.fixedLengthFileSegments.push(mapColumn)
                     }
                     if(addPreProcessorVersion){
                       specialRow.fixedLengthFileSegments.push(mapColumn1)
                     }
                     if(addEnablePreProcessor){
                       specialRow.fixedLengthFileSegments.push(mapColumn2)
                     }
                     const filesAttributes: Partial<FixedLengthFileSegment>[] = getFilesAttributePresentInFileValueList(form, props)
                     specialRow.fixedLengthFileSegments.push(...filesAttributes);

                   }

                   // loop through all the other values (non-migration indicator) and set them
                   form.getFieldValue("attributesOrder")?.orderedList.forEach((target: TargetDetails, index: number) => {
                     if (newMap.fileType === FileType.DELIMITED && target.name !== "Migration Indicator") {
                       const mapColumn: Partial<DelimitedFileColumn> = {};
                       mapColumn.columnName = target.name;
                       mapColumn.fileMapID = newMap.fileMapID;
                       mapColumn.sequence = index;
                       mapColumn.sequenceOverride = mapColumn.sequence;
                       mapColumn.required = true;
                       mapColumn.notMapped = false;
                       mapColumn.fileColumnProperties = [{
                         targetValueID: target.targetValueID,
                       }];
                       specialRow.delimitedFileColumns.push(mapColumn);
                     } else if (newMap.fileType === FileType.FIXED_WIDTH && target.name !== "Migration Indicator") {
                       const mapColumn: Partial<FixedLengthFileSegment> = {};
                       mapColumn.fileMapID = newMap.fileMapID;
                       mapColumn.columnName = target.name;
                       mapColumn.sequence = index;
                       mapColumn.sequenceOverride = mapColumn.sequence;
                       mapColumn.required = true;
                       mapColumn.notMapped = false;
                       mapColumn.segmentLength = form.getFieldValue(`segmentLength_${target.name.replace(/ /g, "_")}`);
                       mapColumn.fileColumnProperties = [{
                         targetValueID: target.targetValueID,
                       }];
                       specialRow.fixedLengthFileSegments.push(mapColumn);
                     }
                   });
                   return new Array<SpecialRow>(specialRow);
};


