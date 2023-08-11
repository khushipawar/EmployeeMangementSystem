import React, { useState } from "react";
import { Button, Popconfirm } from "antd";
import { RouterProps } from "react-router";
import { RightAlignContainer } from "../../shared/Styled";
import { FileMap, MapStatus } from "../../../types";

interface ViewButtonProps extends RouterProps{
  map: FileMap;
  popconfirmVisible: boolean;
  setPopconfirmVisible: Function;
  popconfirmLoading: boolean;
  setPopconfirmLoading: Function;
  popConfirmWarningMessage: Function;
  saveMap: Function;
  closeWarning: Function;
  getUnansweredAttributes: Function;
}

/**
 * Save and cancel buttons on the view details page (single map)
 * @param props see above, controls the types of buttons and pop confirm
 * @constructor
 */
const ViewButtons: React.FC<ViewButtonProps> = (props: ViewButtonProps) => {
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [uploadLoading, setUploadLoading] = useState<boolean>(false);
    const [addLoading, setAddLoading] = useState<boolean>(false);
    
  const {
    map, popconfirmVisible, setPopconfirmVisible, popconfirmLoading, setPopconfirmLoading, popConfirmWarningMessage, saveMap, closeWarning, getUnansweredAttributes, history,
  } = props;
  return (
    <RightAlignContainer>
      <Popconfirm
        placement="topRight"
        title={popConfirmWarningMessage()}
        visible={popconfirmVisible}
        okText="Continue"
        okButtonProps={{
          loading: popconfirmLoading,
        }}
        onConfirm={() => {
          setPopconfirmLoading(true);
          saveMap(map, () => setSaveLoading(false));
          setPopconfirmVisible(false);
        }}
        onCancel={() => closeWarning(() => setSaveLoading(false))}
      >
      <Button
               type="primary"
               style={{ float: "right", marginTop: "2px", marginLeft: "10px" }}
               >
                Save
              </Button>

       <Button
               type="primary"
               style={{ float: "right", marginTop: "2px", marginLeft: "10px" }}
               >
                Upload
              </Button>

        <Button
               type="primary"
                style={{ float: "right", marginTop: "2px", marginLeft: "10px" }}
                
                >
                Add
                </Button>
      </Popconfirm>
      <Button onClick={() => history.push("/matcherView")} style={{ float: "right", marginTop: "2px" }}>Cancel</Button>
    </RightAlignContainer>
  );
};

export default ViewButtons;
