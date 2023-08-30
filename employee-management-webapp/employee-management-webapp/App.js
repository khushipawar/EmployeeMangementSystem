public FileMap copyFileNameMatchers(FileMap activeFileMap, FileMap buildingFileMap) {
    List<FileNameMatcher> activeMatchers = activeFileMap.getFileNameMatchers();
    List<FileNameMatcher> buildingMatchers = buildingFileMap.getFileNameMatchers();

    for (FileNameMatcher activeMatcher : activeMatchers) {
        String formattedMatcher = activeMatcher.getMatcher().trim().toUpperCase();
        Optional<FileNameMatcher> duplicatedFileNameMatcher = fileNameMatcherRepository.findByMatcher(formattedMatcher);

        if (duplicatedFileNameMatcher.isEmpty()) {
            FileNameMatcher newMatcher = new FileNameMatcher();
            newMatcher.setFileMap(buildingFileMap);
            newMatcher.setMatcher(formattedMatcher);
            newMatcher.setCreatedById(SecurityUtil.getUsername());
            newMatcher.setModifiedById(SecurityUtil.getUsername());
            buildingMatchers.add(newMatcher);
        }
    }

    return buildingFileMap;
}





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

    private FileMap getFileMapFromCondition(FileMap fileMap, List<FileMap> listFileMaps) {
        LOGGER.info("CMT:Entered getFileMapFromCondition.");
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
            file = copyFileNameMatchers(fileMap);
        }
        LOGGER.info("CMT:Exiting getFileMapFromCondition.");
        return file;
    }
  public FileMap copyFileNameMatchers(FileMap fileMap)
    {
        FileNameMatcherReqDTO fileNameMatcherReqDTO = new FileNameMatcherReqDTO();

        int fileMapId = fileMap.getFileMapID();
        int version = fileMap.getVersion();
        ArrayList<String> matcherList = new ArrayList<>();
        for(int i=0; i< fileMap.fileNameMatchers.size();i++)
        {
            String matchers = fileMap.getFileNameMatchers().get(i).getMatcher();
            matcherList.add(matchers);
            fileNameMatcherReqDTO.setMatchers(matcherList);
        }
        List<FileNameMatcher> fileNameMatcherList = new ArrayList<>();
        fileNameMatcherReqDTO.getMatchers().forEach(matcher -> {
            String formattedMatcher = matcher.trim().toUpperCase();
            Optional<FileNameMatcher> duplicatedFileNameMatcher = fileNameMatcherRepository.findByMatcher(formattedMatcher);
            FileNameMatcher fileNameMatcher = new FileNameMatcher();
            fileNameMatcher.setFileMap(fileMap);
            fileNameMatcher.setMatcher(formattedMatcher);
            fileNameMatcher.setCreatedById(SecurityUtil.getUsername());
            fileNameMatcher.setModifiedById(SecurityUtil.getUsername());
            fileNameMatcherList.add(fileNameMatcher);
        });
        return fileMap;
    }
