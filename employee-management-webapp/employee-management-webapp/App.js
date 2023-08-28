@Override
    public FileMapResponseDTO addAndUpdateMatchers(FileNameMatcherReqDTO fileNameMatcherReqDTO) {
    
        int fileMapID = fileNameMatcherReqDTO.getFileMapID();
        int version = fileNameMatcherReqDTO.getVersion();
        FileMap currFileMap = fileMapRepository.findById(new FileMapId(fileMapID, version)).orElseThrow(() -> new FileMapVersionNotFoundException(fileMapID, version));
        List<FileNameMatcher> fileNameMatcherList = new ArrayList<>();
        fileNameMatcherReqDTO.getMatchers().forEach(matcher -> {
            String formattedMatcher = matcher.trim().toUpperCase();
            Optional<FileNameMatcher> duplicatedFileNameMatcher = fileNameMatcherRepository.findByMatcher(formattedMatcher);
            FileNameMatcher fileNameMatcher = new FileNameMatcher();
            if (duplicatedFileNameMatcher.isPresent() && duplicatedFileNameMatcher.get().getFileMap().getFileMapID() != fileMapID) {
                throw new FileNameMatcherDuplicateException(matcher, duplicatedFileNameMatcher.get().fileMap.getMapName());
            } else if (duplicatedFileNameMatcher.isPresent() && duplicatedFileNameMatcher.get().getFileMap().getFileMapID() == fileMapID) {
                fileNameMatcher.setFileNameMatcherID(duplicatedFileNameMatcher.get().getFileNameMatcherID());
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
        
        return fileMapMapper.map(updatedMap);
    }
