public FileMapResponseDTO getOneFileMap(Integer fileMapID, String navigateType) {
        
        List<FileMap> listFileMaps = fileMapRepository.findByFileMapID(fileMapID).orElseThrow(() -> new FileMapNotFoundException(fileMapID));
        FileMap fileMap = listFileMaps.stream().filter(f -> MapStatusType.ACTIVE.toString().equalsIgnoreCase(f.getStatus())).reduce((first, last) -> last).orElse(null);
        long testcount = fileMapRepository.countByBuilding(fileMapID);
        boolean buildflag = false;
        if (testcount > 0) {
            buildflag = true;
        }

        if ("edit".equalsIgnoreCase(navigateType)) {
            fileMap = getFileMapFromCondition(fileMap, listFileMaps);
        } else {
            FileMap buildingFileMap = listFileMaps.stream().filter(f -> MapStatusType.BUILDING.toString().equalsIgnoreCase(f.getStatus())).findFirst().orElse(null);
            if (fileMap == null || (fileMap != null && buildingFileMap != null && fileMap.getArchived())) {
                fileMap = listFileMaps.stream().filter(f -> MapStatusType.BUILDING.toString().equalsIgnoreCase(f.getStatus())).findFirst().orElse(null);
            }
        }
        FileMapResponseDTO fileMapResponseDTO = new FileMapResponseDTO();
        /** prevent attribute rows from returning as file segments/columns .*/
        if (fileMap != null) {
            fileMap.setDelimitedFileColumns(
                    fileMap.getDelimitedFileColumns().stream()
                            .filter(col -> col.getSpecialRowID() == null).collect(Collectors.toList()));
            fileMap.setFixedLengthFileSegments(
                    fileMap.getFixedLengthFileSegments().stream()
                            .filter(col -> col.getSpecialRowID() == null).collect(Collectors.toList()));
            fileMapResponseDTO = fileMapMapper.map(fileMap);
            fileMapResponseDTO.setRole(fileMapUserServiceImpl.getRole(fileMapResponseDTO.getFileMapID()));
            fileMapResponseDTO.setBuildcheck(buildflag);
        }
        //write update transforms here

        return fileMapResponseDTO;
    }

 private FileMap getFileMapFromCondition(FileMap fileMap, List<FileMap> listFileMaps) {
       
        FileMap file = null;
        FileMap buildingFileMap = listFileMaps.stream().filter(f -> MapStatusType.BUILDING.toString().equalsIgnoreCase(f.getStatus())).reduce((first, last) -> last).orElse(null);
        FileMap inactiveMap = listFileMaps.stream().filter(f -> MapStatusType.INACTIVE.toString().equalsIgnoreCase(f.getStatus())).reduce((first, last) -> last).orElse(null);
        FileMap activeMap = listFileMaps.stream().filter(f -> MapStatusType.ACTIVE.toString().equalsIgnoreCase(f.getStatus())).reduce((first, last) -> last).orElse(null);
        final Integer[] logicalFileColumnId = new Integer[1];
        final Integer[] index = new Integer[1];

        Integer bVersion = buildingFileMap != null ? buildingFileMap.getVersion() : null;
        Integer aVersion = fileMap != null ? fileMap.getVersion() : null;
        Integer version = getCorrectVersion(aVersion, bVersion);
        if (buildingFileMap != null && buildingFileMap.getArchived() && inactiveMap != null && (fileMap == null || fileMap.getArchived())) {
            file = generateIntermediateFilemapVersion(inactiveMap, version);
        } else if (buildingFileMap == null && inactiveMap != null && activeMap == null) {
            file = getFileMapNoBuild(inactiveMap, version);
        } else if (buildingFileMap == null && inactiveMap != null) {
            file = getFileMapNoBuild(activeMap, version);
        } else if (buildingFileMap == null && inactiveMap == null) {
            //here
            file = generateIntermediateFilemapVersion(fileMap, version);

        } else if (buildingFileMap == null || buildingFileMap.getArchived() && fileMap != null && inactiveMap != null) {
            file = getFileMap(fileMap, inactiveMap, version);
        } else {
            file = buildingFileMap;
        }
        
        return file;
    }
