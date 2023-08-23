function modeViewOrEdit(map: FileMap | null ,value: any, setMode: (value: (((prevState: string) => string) | string)) => void,  setMap: (value: (((prevState: (FileMap | null)) => (FileMap | null)) | FileMap | null)) => void, setCopyName: (value: (((prevState: string) => string) | string)) => void, setSpecialId) {
  if (value === "view") {
    setMode(value);
  }
  if(value==="edit")
  {
    fetchMapByMode(map.fileMapID,value).then((res) => {
      res.originalMap.fileNameMatchers=[];
      mapFetch(res, setMap, setCopyName, setSpecialId);
    });
    setMode(value);
  }
}



export const fetchMapByMode = (mapId: number, mode:any) => instance
  .get<FileMap>(`/fileMap/${mapId}`, { params: { navigateType: mode } })
  .then((res) => {
    if (res.status === 200) {
      const originalMap = res.data;
      const formattedMap = formatMap(res.data);
      return { originalMap, formattedMap };
    }
    throw new Error("Error getting map from server.");
  })
  .catch((error) => {
    history.push("/view");
    handleError(error);
  });
