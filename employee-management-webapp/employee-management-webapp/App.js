public FileMapResponseDTO getOneFileMap(Integer fileMapID, String navigateType) {
        LOGGER.info("CMT:Entered getOneFileMap fileMapID={}", fileMapID);
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
        LOGGER.info("CMT:Exiting getOneFileMap fileMapID={}", fileMapID);
        return fileMapResponseDTO;
    }
