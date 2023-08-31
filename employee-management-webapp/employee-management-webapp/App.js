 private FileMap generateIntermediateFilemapVersion(FileMap fileMap, Integer version) {
        LOGGER.info("CMT:Entered generateIntermediateFilemapVersion.");
        Integer newVersionNumber;
        final Integer[] logicalFileColumnId = new Integer[1];
        final Integer[] index = new Integer[1];
        int filemaprepoid = fileMap.getFileMapID();
        int maxversion = fileMapRepository.getMaxversion(filemaprepoid);
        LOGGER.debug(" CMT:Max version:{}.", maxversion);
        if (version != null) {
            newVersionNumber = maxversion + 1;
        } else {
            newVersionNumber = fileMap.getVersion() + 1;
        }
        Integer fileMapId = fileMap.getFileMapID();
        FileMap createFileMap = new FileMap(fileMap);
        createFileMap.setVersion(newVersionNumber);
        //copyingedit check if works
        List<FileNameMatcher> matchers = fileMap.getFileNameMatchers();
        List<FileNameMatcher> finalMatchers = new ArrayList<>();
        for (FileNameMatcher matcherList : matchers) {
            String formattedMatcher = matcherList.getMatcher().trim().toUpperCase();
            Optional<FileNameMatcher> duplicatedFileNameMatcher = fileNameMatcherRepository.findByMatcher(formattedMatcher);
            FileNameMatcher newMatcher = new FileNameMatcher();
            newMatcher.setFileMap(createFileMap);

            newMatcher.setCreatedById(SecurityUtil.getUsername());
            newMatcher.setModifiedById(SecurityUtil.getUsername());
            newMatcher.setMatcher(formattedMatcher);
            finalMatchers.add(newMatcher);
        }
        createFileMap.setFileNameMatchers(finalMatchers);
//        createFileMap = fileMapRepository.save(createFileMap);

        createFileMap.setStatus(MapStatusType.BUILDING.toString());
        if (createFileMap.getArchived()) {
            createFileMap.setArchived(false);
        }
        createFileMap.getAttributeValues().forEach(at -> {
            at.setVersion(newVersionNumber);
            at.setFileMapID(fileMapId);
        });
        createFileMap.getDelimitedFileColumns().forEach(at -> {
            at.setVersion(newVersionNumber);
            at.setFileMapID(fileMapId);
        });
        createFileMap.getFixedLengthFileSegments().forEach(at -> {
            at.setVersion(newVersionNumber);
            at.setFileMapID(fileMapId);
        });
        createFileMap.getSpecialRows().forEach(s -> {
            s.setFileMapID(fileMapId);
            s.setVersion(newVersionNumber);
            if (s.getDelimitedFileColumns() != null && s.getDelimitedFileColumns().size() > 0) {
                s.getDelimitedFileColumns().forEach(at -> {
                    at.setVersion(newVersionNumber);
                    at.setFileMapID(fileMapId);
                });
            }
            if (s.getFixedLengthFileSegments() != null && s.getFixedLengthFileSegments().size() > 0) {
                s.getFixedLengthFileSegments().forEach(at -> {
                    at.setVersion(newVersionNumber);
                    at.setFileMapID(fileMapId);
                });
            }
        });

        fileMapRepository.save(createFileMap);
        FileMap copiedMap = fileMapRepository.findBymapNameandVersion(createFileMap.getMapName(), createFileMap.getVersion()).orElse(null);

        if (copiedMap.getFileType().equals(FileType.DELIMITED.toString())) {
            LOGGER.debug(" CMT:Delimited map");
            List<DelimitedFileColumn> isDelimited = new ArrayList<>();
            isDelimited = copiedMap.getDelimitedFileColumns();
            performCopyLogicalDelimiters(isDelimited, fileMap, logicalFileColumnId, index);
            logicForCopyLogicalDerivation(isDelimited, fileMap, logicalFileColumnId, index);
        } else if (copiedMap.getFileType().equals(FileType.FIXED.toString())) {
            LOGGER.debug(" CMT:Fixed map");
            List<FixedLengthFileSegment> isFixed = new ArrayList<>();
            isFixed = copiedMap.getFixedLengthFileSegments();
            performCopyLogicalFixedColumn(isFixed, fileMap, logicalFileColumnId, index);
            logicforCopylogicalDerivationfixed(isFixed, fileMap, logicalFileColumnId, index);
        }
        LOGGER.info("CMT:Exiting generateIntermediateFilemapVersion MapName={} with version={}", fileMap.getMapName(), version);
        return fileMapRepository.save(copiedMap);
    }
