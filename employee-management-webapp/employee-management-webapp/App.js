public FileMapResponseDTO addAndUpdateMatchers(FileNameMatcherReqDTO fileNameMatcherReqDTO) {
    LOGGER.info("CMT:Entering addAndUpdateMatchers MapName={}.", fileNameMatcherReqDTO.getFileMapID());
    int fileMapID = fileNameMatcherReqDTO.getFileMapID();
    int version = fileNameMatcherReqDTO.getVersion();
    
    // Retrieve the current map with the same ID but different versions and statuses
    List<FileMap> existingMaps = fileMapRepository.findByFileMapID(fileMapID);
    List<FileMap> mapsWithSameStatus = existingMaps.stream()
            .filter(map -> map.getVersion() != version)
            .filter(map -> !MapStatusType.ACTIVE.toString().equals(map.getStatus()))
            .collect(Collectors.toList());
    
    FileMap currFileMap = existingMaps.stream()
            .filter(map -> map.getVersion() == version)
            .findFirst()
            .orElseThrow(() -> new FileMapVersionNotFoundException(fileMapID, version));
    
    List<FileNameMatcher> fileNameMatcherList = new ArrayList<>();
    
    fileNameMatcherReqDTO.getMatchers().forEach(matcher -> {
        String formattedMatcher = matcher.trim().toUpperCase();
        Optional<FileNameMatcher> duplicatedFileNameMatcher = fileNameMatcherRepository.findByMatcher(formattedMatcher);
        FileNameMatcher fileNameMatcher = new FileNameMatcher();
        
        if (duplicatedFileNameMatcher.isPresent()) {
            FileNameMatcher existingMatcher = duplicatedFileNameMatcher.get();
            
            // Check if the existing matcher belongs to the same map with different versions and statuses
            if (existingMatcher.getFileMap().getFileMapID() == fileMapID && !existingMatcher.getFileMap().getStatus().equals(fileNameMatcherReqDTO.getStatus())) {
                currFileMap.setStatus(MapStatusType.BUILDING.toString()); // Set status to "BUILDING"
            }
            
            // Check if the existing matcher belongs to the same map with the same version and status
            if (existingMatcher.getFileMap().getFileMapID() == fileMapID && existingMatcher.getFileMap().getStatus().equals(fileNameMatcherReqDTO.getStatus())) {
                fileNameMatcher.setFileNameMatcherID(existingMatcher.getFileNameMatcherID());
                fileNameMatcher.setAssociatedMatchers(existingMatcher.getAssociatedMatchers());
            }
        }
        
        fileNameMatcher.setFileMap(currFileMap);
        fileNameMatcher.setMatcher(formattedMatcher);
        fileNameMatcher.setCreatedById(SecurityUtil.getUsername());
        fileNameMatcher.setModifiedById(SecurityUtil.getUsername());
        fileNameMatcherList.add(fileNameMatcher);
    });
    
    currFileMap.updateFileNameMatcher(fileNameMatcherList);
    
    if (!currFileMap.getStatus().equals(MapStatusType.ACTIVE.toString())
            && this.validateFileAttriBeforeActivate(currFileMap)
            && this.validateFileMapColumnsBeforeActivate(currFileMap)) {
        currFileMap.setStatus(MapStatusType.ACTIVE.toString());
    }
    
    FileMap updatedMap = fileMapRepository.save(currFileMap);
    updateFileMapToInActive(updatedMap);
    
    LOGGER.info("CMT:Exiting addAndUpdateMatchers MapName={}.", fileNameMatcherReqDTO.getFileMapID());
    return fileMapMapper.map(updatedMap);
}
