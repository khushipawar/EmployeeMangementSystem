package com.optum.cirrus.isl.member.edi.service.v1.impl;

import com.optum.cirrus.isl.member.edi.config.SecurityUtil;
import com.optum.cirrus.isl.member.edi.data.v1.FileMap.FileCompareExport;
import com.optum.cirrus.isl.member.edi.data.v1.FileMap.FileCompareExportEntryData;
import com.optum.cirrus.isl.member.edi.data.v1.FileMap.FileCompareRowData;
import com.optum.cirrus.isl.member.edi.data.v1.FileMap.FileMapCompare;
import com.optum.cirrus.isl.member.edi.data.v1.FileMap.FileMapRequestDTO;
import com.optum.cirrus.isl.member.edi.data.v1.FileMap.FileMapResponseDTO;
import com.optum.cirrus.isl.member.edi.data.v1.FileMap.FileMapVersionsResponseDTO;
import com.optum.cirrus.isl.member.edi.data.v1.FileNameMatcher.FileNameMatcherReqDTO;
import com.optum.cirrus.isl.member.edi.data.v1.HeaderDTO;
import com.optum.cirrus.isl.member.edi.data.v1.InternalDataModel.TargetValueDTO;
import com.optum.cirrus.isl.member.edi.data.v1.LimitedFileMapDTO;
import com.optum.cirrus.isl.member.edi.data.v1.PagedDTO;
import com.optum.cirrus.isl.member.edi.data.v1.TableFilter;
import com.optum.cirrus.isl.member.edi.exception.DuplicateColumnNameException;
import com.optum.cirrus.isl.member.edi.exception.FileMapDeletionErrorException;
import com.optum.cirrus.isl.member.edi.exception.FileMapNotFoundException;
import com.optum.cirrus.isl.member.edi.exception.FileMapVersionNotFoundException;
import com.optum.cirrus.isl.member.edi.exception.FileNameMatcherDuplicateException;
import com.optum.cirrus.isl.member.edi.exception.MissingFileAttributesException;
import com.optum.cirrus.isl.member.edi.exception.MissingSegmentLengthException;
import com.optum.cirrus.isl.member.edi.exception.MissingSourceNameException;
import com.optum.cirrus.isl.member.edi.exception.MissingTargetValueException;
import com.optum.cirrus.isl.member.edi.exception.TargetValueNotFoundException;
import com.optum.cirrus.isl.member.edi.mapper.FileMapMapper;
import com.optum.cirrus.isl.member.edi.mapper.TargetValueMapper;
import com.optum.cirrus.isl.member.edi.model.v1.DelimitedFileColumn;
import com.optum.cirrus.isl.member.edi.model.v1.FileMap;
import com.optum.cirrus.isl.member.edi.model.v1.FileMapId;
import com.optum.cirrus.isl.member.edi.model.v1.FixedLengthFileSegment;
import com.optum.cirrus.isl.member.edi.model.v1.FileMapMatcherView;
import com.optum.cirrus.isl.member.edi.model.v1.LogicalTransform;
import com.optum.cirrus.isl.member.edi.model.v1.LogicalDerivationRowset;
import com.optum.cirrus.isl.member.edi.model.v1.LogicalDerivationCondition;
import com.optum.cirrus.isl.member.edi.model.v1.TargetValue;
import com.optum.cirrus.isl.member.edi.model.v1.FileNameMatcher;
import com.optum.cirrus.isl.member.edi.model.v1.FileColumnPropertyJoin;
import com.optum.cirrus.isl.member.edi.model.v1.HardcodedValue;
import com.optum.cirrus.isl.member.edi.model.v1.ColumnTransform;
import com.optum.cirrus.isl.member.edi.repository.v1.FileMapMatcherViewRepo;
import com.optum.cirrus.isl.member.edi.repository.v1.FileMapRepository;
import com.optum.cirrus.isl.member.edi.repository.v1.FileNameMatcherRepository;
import com.optum.cirrus.isl.member.edi.repository.v1.TargetValueRepository;
import com.optum.cirrus.isl.member.edi.service.v1.FileMapService;
import com.optum.cirrus.isl.member.edi.util.enums.FileType;
import com.optum.cirrus.isl.member.edi.util.enums.MapActionType;
import com.optum.cirrus.isl.member.edi.util.enums.MapStatusType;
import com.optum.cirrus.isl.member.edi.util.excel.FileMapExcelGenerator;
import com.optum.cirrus.metrics.micrometer.annotations.Timed;
import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import lombok.AllArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FileMapServiceImpl implements FileMapService {
    private static final Logger LOGGER = LoggerFactory.getLogger(FileMapServiceImpl.class);
    public static final String DATA_ORDER = "Data Order";
    public static final String DATE_FORMAT = "MM/dd/yyyy HH:mm";
    public static final String STATUS = "status";

    public static final String TRANSFORMATION = "Transformation";
    public static final String MAPPED_VALUE = " mapped-> Blank";
    public static final String BLANK_VALUE = "Blank";
    public static final String THEN_VALUE = "thenValue -> ";
    @Autowired
    private final FileMapMapper fileMapMapper;
    @Autowired
    private final TargetValueMapper targetValueMapper;
    @Autowired
    private final FileMapRepository fileMapRepository;
    @Autowired
    private final TargetValueRepository targetValueRepository;
    @Autowired
    private final FileNameMatcherRepository fileNameMatcherRepository;
    @PersistenceContext
    private final EntityManager em;
    @Autowired
    private final SpecialRowServiceImpl specialRowServiceImpl;
    @Autowired
    private final AttributeValueServiceImpl attributeValueServiceImpl;
    @Autowired
    private final FileMapUserServiceImpl fileMapUserServiceImpl;
    @Autowired
    private final FileMapMatcherViewRepo fileMapMatcherViewRepo;

    public FileMapResponseDTO getOneFileMap(Integer fileMapID) {
        LOGGER.info("CMT:Entered getOneFileMap fileMapID={}", fileMapID);
        List<FileMap> listFileMaps = fileMapRepository.findByFileMapID(fileMapID).orElseThrow(() -> new FileMapNotFoundException(fileMapID));

        FileMap fileMap = listFileMaps.get(0);
        LOGGER.info("CMT:Exiting getOneFileMap fileMapID={}", fileMapID);
        /** prevent attribute rows from returning as file segments/columns .*/
        return getFileMapResponseDTO(fileMap);
    }

    public FileMapResponseDTO getOneMapByVersion(Integer fileMapID, Integer version) {
        LOGGER.info("CMT:Entered getOneMapByVersion fileMapID={}", fileMapID);
        FileMap fileMap = fileMapRepository.findByFileMapIDANDVersion(fileMapID, version);
        FileMapResponseDTO fileMapResponseDTO = fileMapMapper.map(fileMap);
        fileMapResponseDTO.setRole(fileMapUserServiceImpl.getRole(fileMapResponseDTO.getFileMapID()));
        LOGGER.info("CMT:Exiting getOneMapByVersion fileMapID={}", fileMapID);
        return fileMapResponseDTO;
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
        }
        else {
//            List<FileNameMatcher> matcherList = listFileMaps.get(1).getFileNameMatchers();
//            buildingFileMap.setFileNameMatchers(matcherList);
//            file = buildingFileMap;
//            List<FileNameMatcher> matchers = activeMap.getFileNameMatchers();
            List<FileNameMatcher> matchers = fileMap.getFileNameMatchers();
            List<FileNameMatcher> copiedMatchers = new ArrayList<>(matchers);
            buildingFileMap.setFileNameMatchers(copiedMatchers);
            file = buildingFileMap;
//            fileMap = file;
        }

        LOGGER.info("CMT:Exiting getFileMapFromCondition.");
        return file;
    }

    private FileMap getFileMapNoBuild(FileMap inactiveMap, Integer version) {
        LOGGER.info("CMT:Entered getFileMapNoBuild.");
        FileMap file = null;
        if (inactiveMap != null) {
            file = generateIntermediateFilemapVersion(inactiveMap, version);
        }
        LOGGER.info("CMT:Entered getFileMapNoBuild.");
        return file;
    }

    private FileMap getFileMap(FileMap fileMap, FileMap inactiveMap, Integer version) {
        LOGGER.info("CMT:Entered getFileMap MapName with version.");
        FileMap file = null;
        if (fileMap != null && !fileMap.getArchived()) {
            file = generateIntermediateFilemapVersion(fileMap, version);
        } else {
            if (inactiveMap != null) {
                Integer newVersion = version == null ? null : inactiveMap.getVersion();
                file = generateIntermediateFilemapVersion(inactiveMap, newVersion);
            }
        }
        LOGGER.info("CMT:Entered getFileMap MapName with version.");
        return file;
    }

    private Integer getCorrectVersion(Integer aVersion, Integer bVersion) {
        LOGGER.info("CMT:Entered getCorrectVersion aVersion={} with bVersion={}", aVersion, bVersion);
        Integer version = null;
        if (aVersion != null && bVersion != null) {
            if (aVersion > bVersion) {
                version = aVersion;
            } else {
                version = bVersion;
            }
        } else {
            if (aVersion == null && bVersion != null) {
                version = bVersion;
            } else if (aVersion != null) {
                version = aVersion;
            }
        }
        LOGGER.info("CMT:Exiting getCorrectVersion aVersion={} with bVersion={}", aVersion, bVersion);
        return version;
    }

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
        FileMap createFileMap = new FileMap(fileMap);  //copyingedit check if works
        createFileMap.setFileNameMatchers(fileMap.getFileNameMatchers());
        createFileMap.setFileMapID(fileMap.getFileMapID());
        createFileMap.setVersion(newVersionNumber);
        createFileMap.setCreatedById(SecurityUtil.getUsername());
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

    public FileMapResponseDTO getOneFileMap(Integer fileMapID, Integer version) {
        LOGGER.info("CMT:Entered getOneFileMap fileMapID={} with version={}", fileMapID, version);
        FileMap fileMap = fileMapRepository.findById(new FileMapId(fileMapID, version)).orElseThrow(() -> new FileMapVersionNotFoundException(fileMapID, version));
        LOGGER.info("CMT:Exiting getOneFileMap fileMapID={} with version={}", fileMapID, version);
        /** prevent attribute rows from returning as file segments/columns .*/
        return getFileMapResponseDTO(fileMap);
    }

    public FileMapResponseDTO getFileMapStatusByIDAndVersion(Integer fileMapID, Integer version) {
        LOGGER.info("CMT:Entered getFileMapStatusByIDAndVersion fileMapID={} with version={}", fileMapID, version);
        FileMap fileMap = fileMapRepository.findById(new FileMapId(fileMapID, version)).orElseThrow(() -> new FileMapNotFoundException(fileMapID));
        LOGGER.info("CMT:Exiting getFileMapStatusByIDAndVersion fileMapID={} with version={}", fileMapID, version);
        /** prevent attribute rows from returning as file segments/columns .*/
        return getFileMapResponseDTO(fileMap);
    }

    @Override
    public PagedDTO<LimitedFileMapDTO> getPaginatedFileMapsformatchers(Integer page, Integer pageSize, List<TableFilter> filters) {
        return null;
    }

    private FileMapResponseDTO getFileMapResponseDTO(FileMap fileMap) {
        LOGGER.info("CMT:Entered getFileMapResponseDTO MapName={}.", fileMap.getMapName());
        fileMap.setDelimitedFileColumns(
                fileMap.getDelimitedFileColumns().stream()
                        .filter(col -> col.getSpecialRowID() == null).collect(Collectors.toList()));
        fileMap.setFixedLengthFileSegments(
                fileMap.getFixedLengthFileSegments().stream()
                        .filter(col -> col.getSpecialRowID() == null).collect(Collectors.toList()));
        fileMap.setFileNameMatchers(fileMap.getFileNameMatchers());
        FileMapResponseDTO fileMapResponseDTO = fileMapMapper.map(fileMap);
        fileMapResponseDTO.setRole(fileMapUserServiceImpl.getRole(fileMapResponseDTO.getFileMapID()));
        LOGGER.info("CMT:Exiting getFileMapResponseDTO MapName={}.", fileMap.getMapName());
        return fileMapResponseDTO;
    }

    public FileMapResponseDTO getOneFileMapbyName(String mapName) {
        LOGGER.info("CMT:Exiting getOneFileMapbyName MapName={}.", mapName);
        long mapCount = fileMapRepository.countBymapName(mapName);
        LOGGER.info("CMT:Count of maps" + mapCount);
        //  boolean flag = fileMapRepository.findBymapName(mapName).isPresent();
        if (mapCount > 0) {
            LOGGER.info("CMT:Throwing FileMapVersionNotFoundException as Map Count={}.", mapCount);
            throw new FileMapVersionNotFoundException(mapName);
        } else {
            return null;
        }
    }

    /**
     * use limited file map for smaller transmission size if sending a list of maps and don't need all info.
     */
    public LimitedFileMapDTO getOneLimitedFileMap(Integer fileMapID) {
        LOGGER.info("CMT:Entered getOneLimitedFileMap FileMapID={}.", fileMapID);
        List<FileMap> listFileMaps = fileMapRepository.findByFileMapID(fileMapID).orElseThrow(() -> new FileMapNotFoundException(fileMapID));
        FileMap fileMap = listFileMaps.get(0);
        LimitedFileMapDTO limitedFileMapDTO = fileMapMapper.mapToLimited(fileMap);
        limitedFileMapDTO.setRole(fileMapUserServiceImpl.getRole(fileMap.getFileMapID()));
        LOGGER.info("CMT:Exiting getOneLimitedFileMap FileMapID={}.", fileMapID);
        return limitedFileMapDTO;
    }

    /**
     * use limited file map for smaller transmission size if sending a list of maps and don't need all info.
     */
    public LimitedFileMapDTO getOneLimitedFileMap(Integer fileMapID, Integer version) {
        LOGGER.info("CMT:Entered getOneLimitedFileMap FileMapID={} with version={}.", fileMapID, version);
        FileMap fileMap = fileMapRepository.findById(new FileMapId(fileMapID, version)).orElseThrow(() -> new FileMapVersionNotFoundException(fileMapID, version));
        LimitedFileMapDTO limitedFileMapDTO = fileMapMapper.mapToLimited(fileMap);
        limitedFileMapDTO.setRole(fileMapUserServiceImpl.getRole(fileMap.getFileMapID()));
        LOGGER.info("CMT:Exiting getOneLimitedFileMap FileMapID={} with version={}.", fileMapID, version);
        return limitedFileMapDTO;
    }

    public PagedDTO<LimitedFileMapDTO> getPaginatedFileMaps(Integer page, Integer pageSize, List<TableFilter> filters) {
        LOGGER.info("CMT:Entered getPaginatedFileMaps page={} with pageSize={}.", page, pageSize);
        boolean inactive = false;
        /** remove page being 1 indexed .*/
        if (page == null || page == 0) {
            page = 0;
        } else {
            page--;
        }
        if (pageSize == null) {
            pageSize = 10;
        }
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<FileMapMatcherView> fileMapQuery = cb.createQuery(FileMapMatcherView.class);
        Root<FileMapMatcherView> fileMapRoot = fileMapQuery.from(FileMapMatcherView.class);
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<FileMapMatcherView> countRoot = countQuery.from(FileMapMatcherView.class);
        ArrayList<Predicate> predicates = new ArrayList<>();
        ArrayList<Predicate> countPredicates = new ArrayList<>();

        /** Add a filter to remove archived maps.*/
        TableFilter<Boolean> archived = new TableFilter<>();
        archived.setProperty("archived");
        archived.setValue(false);
        archived.setFilterType("boolean");
        //    filters.add(archived);

        for (int i = 0; i < filters.size(); i++) {
            if (filters.get(i).getProperty().equalsIgnoreCase(MapStatusType.INACTIVE.toString())) {
                inactive = true;
                filters.remove(i);
            }
        }

        /** map table filters to predicates and add them to our predicate list*/
        for (TableFilter tableFilter : filters) {
            predicates.add(tableFilter.createPredicate(cb, fileMapRoot));
            countPredicates.add(tableFilter.createPredicate(cb, countRoot));
        }

        if (!inactive) {
            predicates.add(fileMapRoot.get(STATUS).in(MapStatusType.INACTIVE.toString()).not());
        }
        predicates.add(fileMapRoot.get(STATUS).in(MapStatusType.ARCHIVED.toString()).not());
        fileMapQuery.orderBy(cb.desc(fileMapRoot.get("mapUpdateTime")));
        fileMapQuery.distinct(true).where(cb.and(predicates.toArray(new Predicate[]{})));

        /** create query, run SELECT, get count for page info */

        fileMapQuery.select(fileMapRoot)
                .groupBy(fileMapRoot.get("fileMapID"),fileMapRoot.get("version"));
        List<FileMapMatcherView> fileMaps = em.createQuery(fileMapQuery)
                .setFirstResult(pageSize * page)
                .setMaxResults(pageSize)
                .getResultList();
        countQuery.select(cb.count(fileMapRoot)).where(cb.and(countPredicates.toArray(new Predicate[]{})));
        Long count = em.createQuery(countQuery).getSingleResult();
        List<LimitedFileMapDTO> fileMapDTOs = new ArrayList<>();

        if (inactive) {
            getInactive(fileMaps);
        }

        /** map file maps into the DTOs */
        fileMaps.forEach(fileMap -> fileMapDTOs.add(getOneLimitedFileMap(fileMap.getFileMapID(), fileMap.getVersion())));
        Map<String, List<LimitedFileMapDTO>> getFileMapDTOs = fileMapDTOs.stream()
                .sorted(Comparator.nullsLast(Comparator.comparing(LimitedFileMapDTO::getMapUpdateTime).reversed()))
                .collect(Collectors.groupingBy(LimitedFileMapDTO::getMapName,
                        LinkedHashMap::new,
                        Collectors.toList()));
        List<LimitedFileMapDTO> retFileMapDTOList = getFileMapDTOs.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());

        /** return page number to being 1 indexed */
        page = page + 1;
        LOGGER.info("CMT:Entered getPaginatedFileMaps page={} with pageSize={}.", page, pageSize);
        return new PagedDTO<>(retFileMapDTOList, page, pageSize, count);
    }

    private void getInactive(List<FileMapMatcherView> fileMaps) {
        LOGGER.info("CMT:Entered getInactive.");
        List<FileMapMatcherView> inactiveArr = new ArrayList<>();
        List<Integer> uniqueId = new ArrayList<>();
        for (FileMapMatcherView f : fileMaps) {
            if (f.getStatus().equalsIgnoreCase("inactive")) {
                inactiveArr.add(f);
            }
        }
        for (FileMapMatcherView a : inactiveArr) {
            fileMaps.remove(a);
            if (!uniqueId.contains(a.getFileMapID())) {
                if (fileMapRepository.countByActive(a.getFileMapID()) < 1 && fileMapRepository.countByBuildingNotArchived(a.getFileMapID()) < 1) {
                    uniqueId.add(a.getFileMapID());
                }

            }
        }
        for (Integer f : uniqueId) {
            List<FileMapMatcherView> fil = fileMapMatcherViewRepo.getAllInactive(f);
            if (fil.size() > 1) {
                FileMapMatcherView fil1 = fil.get(fil.size() - 1);
                fil.clear();
                fil.add(fil1);
            }
            fileMaps.addAll(fil);
        }
        LOGGER.info("CMT:Exiting getInactive.");
    }

    @Transactional
    public FileMapResponseDTO createFileMap(FileMapRequestDTO fileMapRequestDTO) {
        LOGGER.info("CMT:Entered createFileMap MapName={}.", fileMapRequestDTO.getMapName());
        FileMap existingFileMap = fileMapRepository.findById(new FileMapId(fileMapRequestDTO.getFileMapID(), fileMapRequestDTO.getVersion())).orElse(null);
        FileMap newFileMap;
        if (existingFileMap != null && fileMapUserServiceImpl.hasPermissionToPerformAction(existingFileMap.getFileMapID(), MapActionType.COPY_MAP)) {
            /** only Editor or Owner of the map can copy the map */
            newFileMap = new FileMap(existingFileMap);
            //newFileMap = existingFileMap;
            newFileMap.setStatus("Building");
            newFileMap.setCreatedById(SecurityUtil.getUsername());
            newFileMap.setMapName(fileMapRequestDTO.getMapName());
            newFileMap.setVersion(0);
            newFileMap.setFileMapID((fileMapRepository.getMaxFileMapID() == null ? 0 : fileMapRepository.getMaxFileMapID()) + 1);
            if (newFileMap.getArchived()) {
                newFileMap.setArchived(false);
            }
            newFileMap = fileMapRepository.save(newFileMap);
            fileMapUserServiceImpl.addUserToNewMap(newFileMap.getFileMapID(), SecurityUtil.getUsername());
            return fileMapMapper.map(newFileMap);
        } else {
            newFileMap = fileMapMapper.map(fileMapRequestDTO);
            newFileMap.setAttributeRelationField();
            newFileMap.setCreatedById(SecurityUtil.getUsername());
            newFileMap.setFileMapID((fileMapRepository.getMaxFileMapID() == null ? 0 : fileMapRepository.getMaxFileMapID()) + 1);
            newFileMap.setVersion(0);
            newFileMap = fileMapRepository.save(newFileMap);
            fileMapUserServiceImpl.addUserToNewMap(newFileMap.getFileMapID(), SecurityUtil.getUsername());
            FileMapResponseDTO newFileMapResponseDTO = fileMapMapper.map(newFileMap);
            newFileMapResponseDTO.setRole(fileMapUserServiceImpl.getRole(newFileMapResponseDTO.getFileMapID()));
            LOGGER.info("CMT:Exiting createFileMap MapName={}.", fileMapRequestDTO.getMapName());
            return newFileMapResponseDTO;
        }
    }

    @Transactional
    public FileMapResponseDTO updateFileMap(FileMapRequestDTO fileMapRequestDTO) {
        LOGGER.info("CMT:Entered updateFileMap MapName={}.", fileMapRequestDTO.getMapName());
        FileMap savedFileMap = fileMapRepository.findById(new FileMapId(
                fileMapRequestDTO.getFileMapID(), fileMapRequestDTO.getVersion())
        ).orElseThrow(() -> new FileMapVersionNotFoundException(fileMapRequestDTO.getFileMapID(), fileMapRequestDTO.getVersion()));
        generateFileMapVersion(savedFileMap, fileMapRequestDTO);
        FileMap fileMap = fileMapMapper.map(fileMapRequestDTO);
        if(fileMap.getDelimitedFileColumns()!=null) {
            fileMap.getDelimitedFileColumns().forEach(delimitedFileColumn -> delimitedFileColumn.getFileColumnProperties().forEach(fileColumnPropertyJoin -> {
                if (fileColumnPropertyJoin.getLogicalDerivationRowsets()!= null && fileColumnPropertyJoin.getLogicalDerivationRowsets().size()>0 ) {
                    fileColumnPropertyJoin.getLogicalDerivationRowsets().forEach(logicalDerivationRowset -> logicalDerivationRowset.getLogicalDerivationConditions().forEach(logicalDerivationCondition ->
                            logicalDerivationCondition.setLogicalDerivationRowset(logicalDerivationRowset)));
                }
            }));
        }
        long testcount = fileMapRepository.countByBuilding(fileMapRequestDTO.getFileMapID());
        boolean buildflag = false;
        if (testcount > 0) {
            buildflag = true;
        }

        if (fileMapRequestDTO.getIsActive() != null && fileMapRequestDTO.getIsActive()) {
            LOGGER.info("CMT:Active Map at updateFileMap MapName={}.", fileMapRequestDTO.getMapName());
            savedFileMap.setStatus(fileMap.getStatus());
            List<FileNameMatcher> matchers = fileMap.getFileNameMatchers();
            List<FileNameMatcher> copiedMatchers = new ArrayList<>(matchers);
            savedFileMap.setFileNameMatchers(copiedMatchers);
            savedFileMap.setAttributeRelationField();
            savedFileMap.setCreatedById(savedFileMap.getCreatedById());
            savedFileMap.setModifiedById(SecurityUtil.getUsername());
            Timestamp timestamp = new Timestamp(new Date().getTime());
            savedFileMap.setMapUpdateTime(timestamp);
            FileMap updatedFileMap = fileMapRepository.save(savedFileMap);
            FileMapResponseDTO updatedFileMapResponseDTO = fileMapMapper.map(updatedFileMap);
            updatedFileMapResponseDTO.setRole(fileMapUserServiceImpl.getRole(updatedFileMapResponseDTO.getFileMapID()));
            updatedFileMapResponseDTO.setBuildcheck(buildflag);
            LOGGER.info("CMT:Exiting updateFileMap MapName={}.", fileMapRequestDTO.getMapName());
            return updatedFileMapResponseDTO;
        } else {
            LOGGER.info("CMT:not Active Map at updateFileMap MapName={}.", fileMapRequestDTO.getMapName());
            if (!CollectionUtils.isEmpty(fileMap.getFileNameMatchers())) {
                fileMap.getFileNameMatchers().forEach(fn -> fn.getFileMap().setVersion(fileMapRequestDTO.getVersion()));
                fileMap.updateFileNameMatcher(fileMap.getFileNameMatchers());
            }
            //resetAnyMissingIdsToNull(fileMap);
            fileMap.setAttributeRelationField();
            fileMap.setCreatedById(savedFileMap.getCreatedById());
            fileMap.setModifiedById(SecurityUtil.getUsername());
            Timestamp timestamp = new Timestamp(new Date().getTime());
            fileMap.setMapUpdateTime(timestamp);
            validateSourceName(fileMap);
            validateDuplicateSourceName(fileMap);
            FileMap updatedFileMap = fileMapRepository.save(fileMap);
            FileMapResponseDTO updatedFileMapResponseDTO = fileMapMapper.map(updatedFileMap); //can be used
            updatedFileMapResponseDTO.setRole(fileMapUserServiceImpl.getRole(updatedFileMapResponseDTO.getFileMapID()));
            updatedFileMapResponseDTO.setBuildcheck(buildflag);
            LOGGER.info("CMT:Exiting updateFileMap MapName={}.", fileMapRequestDTO.getMapName());
            return updatedFileMapResponseDTO;
        }
    }

    @Transactional
    public FileMapResponseDTO updateTransforms(FileMapRequestDTO fileMapRequestDTO) {
        LOGGER.info("CMT:Entering updateTransforms MapName={}.", fileMapRequestDTO.getMapName());
        FileMap existingFileMap = fileMapRepository.findByFileMapIDANDVersion(fileMapRequestDTO.getFileMapID(), fileMapRequestDTO.getVersion());

        FileMap copiedMap = fileMapRepository.findBymapName(fileMapRequestDTO.getMapName()).orElse(null);
        //    FileMap copiedMap = fileMapRepository.findBymapNameandVersion(fileMapRequestDTO.getMapName(),fileMapRequestDTO.getVersion()).orElse(null);
        List<DelimitedFileColumn> isDelimited = new ArrayList<>();
        List<FixedLengthFileSegment> isFixed = new ArrayList<>();

        final Integer[] logicalFileColumnId = new Integer[1];
        final Integer[] index = new Integer[1];

        //for delimited
        if (copiedMap.getFileType().equals(FileType.DELIMITED.toString())) {
            isDelimited = copiedMap.getDelimitedFileColumns();
            performCopyLogicalDelimiters(isDelimited, existingFileMap, logicalFileColumnId, index);
            logicForCopyLogicalDerivation(isDelimited, existingFileMap, logicalFileColumnId, index);
        }

        //for fixed
        if (copiedMap.getFileType().equals(FileType.FIXED.toString())) {
            isFixed = copiedMap.getFixedLengthFileSegments();
            performCopyLogicalFixedColumn(isFixed, existingFileMap, logicalFileColumnId, index);
            logicforCopylogicalDerivationfixed(isFixed, existingFileMap, logicalFileColumnId, index);
        }
        FileMap updatedFileMap = fileMapRepository.save(copiedMap);
        LOGGER.info("CMT:Exiting updateTransforms MapName={}.", fileMapRequestDTO.getMapName());
        return fileMapMapper.map(updatedFileMap);
    }

    //Logic for copying delimited LT
    private void performCopyLogicalDelimiters(List<DelimitedFileColumn> isDelimited, FileMap existingFileMap, final Integer[] logicalFileColumnId, final Integer[] index) {
        LOGGER.info("CMT:Entering performCopyLogicalDelimiters MapName={}.", existingFileMap.getMapName());
        for (int i = 0; i < isDelimited.size(); i++) {
            List<DelimitedFileColumn> finalIsDelimited = isDelimited;
            isDelimited.get(i).getFileColumnProperties().forEach(fileProperty -> {
                if (CollectionUtils.isNotEmpty(fileProperty.getLogicalTransforms())) {
                    for (LogicalTransform logical : fileProperty.getLogicalTransforms()) {
                        compareAndCopyDelimiter(existingFileMap, logical, logicalFileColumnId, index, finalIsDelimited);
                    }
                }
            });
        }
        LOGGER.info("CMT:Exiting performCopyLogicalDelimiters MapName={}.", existingFileMap.getMapName());
    }

    private void compareAndCopyDelimiter(FileMap existingFileMap, LogicalTransform logical, final Integer[] logicalFileColumnId, final Integer[] index,
                                         List<DelimitedFileColumn> finalIsDelimited) {
        LOGGER.info("CMT:Entering compareAndCopyDelimiter MapName={}.", existingFileMap.getMapName());
        for (DelimitedFileColumn existingDelimited : existingFileMap.getDelimitedFileColumns()) {
            for (int x = 0; x < existingDelimited.getFileColumnProperties().size(); x++) {
                performReplaceDelimiter(existingDelimited, logical, x, logicalFileColumnId, index, finalIsDelimited);
            }
        }
        LOGGER.info("CMT:Exiting compareAndCopyDelimiter MapName={}.", existingFileMap.getMapName());
    }

    public void logicForCopyLogicalDerivation(List<DelimitedFileColumn> isDelimited, FileMap existingFileMap, final Integer[] logicalFileColumnId, final Integer[] index) {
        for (int i = 0; i < isDelimited.size(); i++) {
            List<DelimitedFileColumn> finalIsDelimited = isDelimited;
            isDelimited.get(i).getFileColumnProperties().forEach(fileProperty -> {
                for (LogicalDerivationRowset logical : fileProperty.getLogicalDerivationRowsets()) {
                    compareAndCopydel(existingFileMap, logical, logicalFileColumnId, index, finalIsDelimited);
                }
            });
        }
    }

    private void compareAndCopydel(FileMap existingFileMap, LogicalDerivationRowset logical, final Integer[] logicalFileColumnId, final Integer[] index,
                                   List<DelimitedFileColumn> finalIsDelimited) {

        for (DelimitedFileColumn existingDelimited : existingFileMap.getDelimitedFileColumns()) {
            for(LogicalDerivationCondition condition : logical.getLogicalDerivationConditions()) {
                for (int x = 0; x < existingDelimited.getFileColumnProperties().size(); x++) {
                    checkandReplacedel(existingDelimited, condition, x, logicalFileColumnId, index, finalIsDelimited);
                }
            }
        }
    }

    private void checkandReplacedel(DelimitedFileColumn existingDelimited, LogicalDerivationCondition logical, int x, final Integer[] logicalFileColumnId, final Integer[] index,
                                    List<DelimitedFileColumn> finalIsDelimited) {
        if (existingDelimited.getFileColumnProperties().get(x).getFileColumnTargetValueID().equals(logical.getComparisonFileColumnTargetValueID())) {
            logicalFileColumnId[0] = existingDelimited.getFileColumnProperties().get(x).getTargetValueID();
            index[0] = x;
            int compareBasesequence = existingDelimited.getSequence();
            for (DelimitedFileColumn delimitedFileColumn : finalIsDelimited) {
                int compareNewsequence = delimitedFileColumn.getSequence();
                for (int l = 0; l < delimitedFileColumn.getFileColumnProperties().size(); l++) {
                    if (delimitedFileColumn.getFileColumnProperties().get(l).getTargetValueID().equals(logicalFileColumnId[0]) && index[0].equals(l) && compareBasesequence == compareNewsequence) {
                        int comp = delimitedFileColumn.getFileColumnProperties().get(l).getFileColumnTargetValueID();
                        logical.setComparisonFileColumnTargetValueID(comp);

                    }
                }
            }

        }
    }

    public void logicforCopylogicalDerivationfixed(List<FixedLengthFileSegment> isFixed, FileMap existingFileMap, final Integer[] logicalFileColumnId, final Integer[] index) {
        for (int i = 0; i < isFixed.size(); i++) {
            List<FixedLengthFileSegment> finalIsFixed = isFixed;
            isFixed.get(i).getFileColumnProperties().forEach(fileProperty -> {
                for (LogicalDerivationRowset logical : fileProperty.getLogicalDerivationRowsets()) {
                    compareAndCopyfixed(existingFileMap, logicalFileColumnId, logical, index, finalIsFixed);
                }
            });
        }
    }

    private void compareAndCopyfixed(FileMap existingFileMap, final Integer[] logicalFileColumnId, LogicalDerivationRowset logical, final Integer[] index, List<FixedLengthFileSegment> finalIsFixed) {
        for (FixedLengthFileSegment existingFixed : existingFileMap.getFixedLengthFileSegments()) {
            for(LogicalDerivationCondition condition : logical.getLogicalDerivationConditions()) {
                for (int x = 0; x < existingFixed.getFileColumnProperties().size(); x++) {
                    checkReplacefixed(existingFixed, x, condition, logicalFileColumnId, index, finalIsFixed);
                }
            }
        }
    }

    private void checkReplacefixed(FixedLengthFileSegment existingFixed, int x, LogicalDerivationCondition logical, final Integer[] logicalFileColumnId, final Integer[] index, List<FixedLengthFileSegment> finalIsFixed) {
        if (existingFixed.getFileColumnProperties().get(x).getFileColumnTargetValueID().equals(logical.getComparisonFileColumnTargetValueID())) {
            logicalFileColumnId[0] = existingFixed.getFileColumnProperties().get(x).getTargetValueID();
            index[0] = x;
            int compareBasesequence = existingFixed.getSequence();
            for (FixedLengthFileSegment fixedLengthFileSegment : finalIsFixed) {
                int compareNewsequence = fixedLengthFileSegment.getSequence();
                for (int l = 0; l < fixedLengthFileSegment.getFileColumnProperties().size(); l++) {
                    if (fixedLengthFileSegment.getFileColumnProperties().get(l).getTargetValueID().equals(logicalFileColumnId[0]) && index[0].equals(l) && compareBasesequence == compareNewsequence) {
                        int comp = fixedLengthFileSegment.getFileColumnProperties().get(l).getFileColumnTargetValueID();
                        logical.setComparisonFileColumnTargetValueID(comp);
                    }

                }

            }
        }
    }


    private void performReplaceDelimiter(DelimitedFileColumn existingDelimited, LogicalTransform logical, int x, final Integer[] logicalFileColumnId, final Integer[] index,
                                         List<DelimitedFileColumn> finalIsDelimited) {
        LOGGER.info("CMT:Entering performReplaceDelimiter delimitedFileColumnID={}.", existingDelimited.getDelimitedFileColumnID());
        if (CollectionUtils.isNotEmpty(existingDelimited.getFileColumnProperties()) && existingDelimited.getFileColumnProperties().get(x) != null
                && logical.getComparisonFileColumnTargetValueID() != null && existingDelimited.getFileColumnProperties().get(x).getFileColumnTargetValueID() != null
                && existingDelimited.getFileColumnProperties().get(x).getFileColumnTargetValueID().compareTo(logical.getComparisonFileColumnTargetValueID()) == 0) {
            logicalFileColumnId[0] = existingDelimited.getFileColumnProperties().get(x).getTargetValueID();
            index[0] = x;
            int compareBasesequence = existingDelimited.getSequence();
            for (DelimitedFileColumn delimitedFileColumn : finalIsDelimited) {
                for (int l = 0; l < delimitedFileColumn.getFileColumnProperties().size(); l++) {
                    if (delimitedFileColumn.getFileColumnProperties().get(l).getTargetValueID().equals(logicalFileColumnId[0]) && index[0].equals(l)
                            && compareBasesequence == delimitedFileColumn.getSequence()) {
                        int comp = delimitedFileColumn.getFileColumnProperties().get(l).getFileColumnTargetValueID();
                        logical.setComparisonFileColumnTargetValueID(comp);

                    }
                }
            }
        }
        LOGGER.info("CMT:Exiting performReplaceDelimiter delimitedFileColumnID={}.", existingDelimited.getDelimitedFileColumnID());
    }

    //Logic for copying fixed LT
    private void performCopyLogicalFixedColumn(List<FixedLengthFileSegment> isFixed, FileMap existingFileMap, final Integer[] logicalFileColumnId, final Integer[] index) {
        LOGGER.info("CMT:Entering performCopyLogicalFixedColumn delimitedFileColumnID={}.", existingFileMap.getMapName());
        for (int i = 0; i < isFixed.size(); i++) {
            List<FixedLengthFileSegment> finalIsFixed = isFixed;
            isFixed.get(i).getFileColumnProperties().forEach(fileProperty -> {
                if (CollectionUtils.isNotEmpty(fileProperty.getLogicalTransforms())) {
                    for (LogicalTransform logical : fileProperty.getLogicalTransforms()) {
                        compareAndCopyfixed(existingFileMap, logicalFileColumnId, logical, index, finalIsFixed);
                    }
                }
            });
        }
        LOGGER.info("CMT:Exiting performCopyLogicalFixedColumn delimitedFileColumnID={}.", existingFileMap.getMapName());
    }

    private void compareAndCopyfixed(FileMap existingFileMap, final Integer[] logicalFileColumnId, LogicalTransform logical, final Integer[] index, List<FixedLengthFileSegment> finalIsFixed) {
        for (FixedLengthFileSegment existingFixed : existingFileMap.getFixedLengthFileSegments()) {
            for (int x = 0; x < existingFixed.getFileColumnProperties().size(); x++) {
                checkAndReplaceFixed(existingFixed, x, logical, logicalFileColumnId, index, finalIsFixed);
            }

        }
    }

    private void checkAndReplaceFixed(FixedLengthFileSegment existingFixed, int x, LogicalTransform logical, final Integer[] logicalFileColumnId, final Integer[] index, List<FixedLengthFileSegment> finalIsFixed) {
        LOGGER.info("CMT:Entering checkAndReplaceFixed FileMapID={}.", existingFixed.getFileMapID());
        if (existingFixed.getFileColumnProperties() != null &&
                existingFixed.getFileColumnProperties().get(x) != null && existingFixed.getFileColumnProperties().get(x).getFileColumnTargetValueID() != null
                && existingFixed.getFileColumnProperties().get(x).getFileColumnTargetValueID().equals(logical.getComparisonFileColumnTargetValueID())) {
            logicalFileColumnId[0] = existingFixed.getFileColumnProperties().get(x).getTargetValueID();
            index[0] = x;
            int compareBasesequence = existingFixed.getSequence();
            for (FixedLengthFileSegment fixedLengthFileSegment : finalIsFixed) {
                int compareNewsequence = fixedLengthFileSegment.getSequence();
                for (int l = 0; l < fixedLengthFileSegment.getFileColumnProperties().size(); l++) {
                    if (fixedLengthFileSegment.getFileColumnProperties().get(l).getTargetValueID().equals(logicalFileColumnId[0])
                            && index[0].equals(l) && compareBasesequence == compareNewsequence) {
                        int comp = fixedLengthFileSegment.getFileColumnProperties().get(l).getFileColumnTargetValueID();
                        logical.setComparisonFileColumnTargetValueID(comp);
                    }
                }
            }
        }
        LOGGER.info("CMT:Exiting checkAndReplaceFixed FileMapID={}.", existingFixed.getFileMapID());
    }

    public FileMapResponseDTO archiveFileMap(Integer fileMapId) {
        LOGGER.info("CMT:Entering archiveFileMap fileMapId={}.", fileMapId);
        List<FileMap> listFileMaps = fileMapRepository.findByFileMapID(fileMapId).orElseThrow(() -> new FileMapNotFoundException(fileMapId));
        FileMap fileMap = listFileMaps.get(0);

        fileMap.setArchived(true);
        fileMap.updateFileNameMatcher(new ArrayList<>());
        try {
            FileMap archivedFileMap = fileMapRepository.save(fileMap);
            LOGGER.info("CMT:Exiting archiveFileMap fileMapId={}.", fileMapId);
            return fileMapMapper.map(archivedFileMap);
        } catch (Exception e) {
            LOGGER.info("CMT:Throwing Exception at archiveFileMap fileMapId={}.", fileMapId);
            throw new FileMapDeletionErrorException(fileMapId);
        }
    }

    public FileMapResponseDTO archiveFileMap(Integer fileMapId, Integer version) {
        LOGGER.info("CMT:Entered archiveFileMap fileMapId={} with version={}.", fileMapId, version);
        FileMap fileMap = fileMapRepository.findById(new FileMapId(
                fileMapId, version)
        ).orElseThrow(() -> new FileMapVersionNotFoundException(fileMapId, version));
        fileMap.setArchived(true);
        fileMap.setStatus("Inactive");
        fileMap.updateFileNameMatcher(new ArrayList<>());
        try {
            FileMap archivedFileMap = fileMapRepository.save(fileMap);
            LOGGER.info("CMT:Existing archiveFileMap fileMapId={} with version={}.", fileMapId, version);
            return fileMapMapper.map(archivedFileMap);
        } catch (Exception e) {
            LOGGER.info("CMT:Throwing Exception at archiveFileMap fileMapId={} with version={}.", fileMapId, version);
            throw new FileMapDeletionErrorException(fileMapId);
        }
    }

    public InputStreamResource exportFileMapAsExcel(Integer fileMapId) {
        LOGGER.info("CMT:Entered exportFileMapAsExcel fileMapId={}.", fileMapId);
        List<FileMap> listFileMaps = fileMapRepository.findByFileMapID(fileMapId).orElseThrow(() -> new FileMapNotFoundException(fileMapId));
        FileMap fileMap = listFileMaps.get(0);
        FileMapExcelGenerator fileMapExcelGenerator = new FileMapExcelGenerator(fileMap, targetValueRepository);
        LOGGER.info("CMT:Exiting exportFileMapAsExcel fileMapId={}.", fileMapId);
        return fileMapExcelGenerator.generateExcel();
    }

    public InputStreamResource exportFileMapAsExcel(Integer fileMapId, Integer version) {
        LOGGER.info("CMT:Entered exportFileMapAsExcel fileMapId={} with version={}.", fileMapId, version);
        FileMap fileMap = fileMapRepository.findById(new FileMapId(fileMapId, version)).orElseThrow(() -> new FileMapVersionNotFoundException(fileMapId, version));
        FileMapExcelGenerator fileMapExcelGenerator = new FileMapExcelGenerator(fileMap, targetValueRepository);
        LOGGER.info("CMT:Exiting exportFileMapAsExcel fileMapId={} with version={}.", fileMapId, version);
        return fileMapExcelGenerator.generateExcel();
    }

    private FileMap mapHeadersToTargetValue(FileMap fileMap, List<String[]> headers) {
        LOGGER.info("CMT:Entered mapHeadersToTargetValue MapName={}.", fileMap.getMapName());
        /* flatten the array */
        List<String> flattened = new ArrayList<>();
        headers.forEach(row -> flattened.addAll(Arrays.asList(row)));
        List<TargetValueDTO> targetValueDTOs = targetValueRepository.findAllTargetValueDTO();
        Map<Integer, Integer> headerToMaxTokenList = intelligentMatch(targetValueDTOs, flattened);

        /* for each, match a target value, if there is one create a column with that valueID, else null
         * use hashset to prevent duplicates from occurring in non list target values. */
        Set<TargetValue> usedTargetValues = new HashSet<>();
        for (int i = 0; i < flattened.size(); i++) {
            String header = flattened.get(i);
            if (headerToMaxTokenList.containsKey(i)) {
                int topMatch = headerToMaxTokenList.get(i);
                TargetValueDTO targetValueDTO = targetValueDTOs.get(topMatch);
                TargetValue targetValue = targetValueMapper.mapToTargetValue(targetValueDTO);
                if (!usedTargetValues.contains(targetValue) || targetValue.getDuplicable()) {
                    usedTargetValues.add(targetValue);
                    validateFileType(fileMap, header, i, targetValue);
                } else {
                    // Default to no target.
                    defaultNoTargetValidator(fileMap, header, i);
                }
            } else {
                // Default to no target.
                defaultNoTargetValidator(fileMap, header, i);
            }
        }
        LOGGER.info("CMT:Exiting mapHeadersToTargetValue MapName={}.", fileMap.getMapName());
        return fileMap;
    }

    /**
     * Takes in all target values and the column headers and finds the best target for each one. It does this by tokenizing
     * the target name and the header and finding the target with the highest token overlap for a given header.
     *
     * @param targetValueDTOs all target values.
     * @param flattened       the column headers.
     * @return a map of headers to the index of the target value with the highest match.
     */
    private Map<Integer, Integer> intelligentMatch(List<TargetValueDTO> targetValueDTOs, List<String> flattened) {
        LOGGER.info("CMT:Entered intelligentMatch.");
        List<List<String>> tokenList = new ArrayList<>();
        targetValueDTOs.forEach(targetValueDTO -> {
            String name = targetValueDTO.getName();
            List<String> tokens = new ArrayList<>();
            StringTokenizer tokenizer = new StringTokenizer(name, " ");
            while (tokenizer.hasMoreElements()) {
                tokens.add(tokenizer.nextToken());
            }
            tokens = tokens
                    .stream()
                    .filter(token -> token.matches("[a-zA-Z]+"))
                    .map(String::toLowerCase)
                    .distinct()
                    .collect(Collectors.toList());
            tokenList.add(tokens);
        });
        Map<Integer, Integer> headerToMaxTokenList = new HashMap<>();
        Map<Integer, Integer> headerToMaxCount = new HashMap<>();
        for (int i = 0; i < tokenList.size(); i++) {
            for (int j = 0; j < flattened.size(); j++) {
                StringTokenizer tokenizer = new StringTokenizer(flattened.get(j), " ");
                List<String> tokens = new ArrayList<>();
                while (tokenizer.hasMoreElements()) {
                    tokens.add(tokenizer.nextToken());
                }
                tokens = tokens
                        .stream()
                        .filter(token -> token.matches("[a-zA-Z]+"))
                        .map(String::toLowerCase)
                        .distinct()
                        .collect(Collectors.toList());
                List<String> intersect = tokenList.get(i).stream()
                        .filter(tokens::contains)
                        .collect(Collectors.toList());
                if (intersect.size() > headerToMaxCount.getOrDefault(j, 0)) {
                    headerToMaxCount.put(j, intersect.size());
                    headerToMaxTokenList.put(j, i);
                }
            }
        }
        LOGGER.info("CMT:Exiting intelligentMatch.");
        return headerToMaxTokenList;
    }

    @Timed
    @Transactional
    public FileMapResponseDTO parseHeaderFileAndCreateOrUpdateFileMap(FileMapRequestDTO fileMapRequestDTO, MultipartFile multipartFile, HeaderDTO headerDTO) throws IOException {
        LOGGER.info("CMT:Entering parseHeaderFileAndCreateOrUpdateFileMap MapName={}.", fileMapRequestDTO.getMapName());
        /** parse out file using a few different delimiters*/
        FileMap fileMap = fileMapMapper.map(fileMapRequestDTO);
        CsvParserSettings csvParserSettings = new CsvParserSettings();
        csvParserSettings.detectFormatAutomatically(',', '|', ':', '/', '\\');
        csvParserSettings.setMaxColumns(2048);
        CsvParser parser = new CsvParser(csvParserSettings);
        InputStream inputStream = multipartFile.getInputStream();
        parser.beginParsing(inputStream);
        parser.getDetectedFormat();
        List<String[]> headers = new ArrayList<>();
        fileMap.setDelimitedFileColumns(new ArrayList<>());
        fileMap.setFixedLengthFileSegments(new ArrayList<>());
        fileMap.setCreatedById(SecurityUtil.getUsername());
        fileMap.getSpecialRow();
        Timestamp timestamp = new Timestamp(new Date().getTime());
        fileMap.setMapUpdateTime(timestamp);
        fileMap.setVersion(0);
        fileMap.setFileMapID((fileMapRepository.getMaxFileMapID() == null ? 0 : fileMapRepository.getMaxFileMapID()) + 1);

        fileMap = fileMapRepository.save(fileMap);
        fileMapUserServiceImpl.addUserToNewMap(fileMap.getFileMapID(), SecurityUtil.getUsername());
        /** if we have a headerDTO and row number, parse only that line */
        if (headerDTO != null && headerDTO.getRowNumber() != null) {

            //Error handling enhancement - if the file is a spreadsheet, throw an exceltion...
            String filename = multipartFile.getOriginalFilename();
            String filetype = multipartFile.getContentType();
            checkFileNameAndType(filename, filetype);

            this.checkForExcelFile(filetype, filename);  // throws runtime exception if excel file is provided.

            try (InputStream headerInputStream = multipartFile.getInputStream()) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(headerInputStream));
                List<String> line = reader.lines().skip(headerDTO.getRowNumber() - 1).limit(1).collect(Collectors.toList());
                CsvParser specificLineParserForHeader = new CsvParser(csvParserSettings);
                headers.add(specificLineParserForHeader.parseLine(line.get(0)));
                specificLineParserForHeader.stopParsing();
                for (int ind = 0; ind < headers.size(); ind++) {
                    List<String> list = new ArrayList<>();
                    for (String s : headers.get(ind)) {
                        if (s != null) {
                            list.add(s);
                        }
                    }
                    final int listLen = list.size();
                    headers.set(ind, list.toArray(new String[listLen]));
                }
            }
            /** else parse the whole file, assuming that this file is a column of headers*/
        } else {
            headers = parser.parseAll();
        }
        FileMap mappedTargetValueFileMap = mapHeadersToTargetValue(fileMap, headers);
        FileMap savedFileMap = fileMapRepository.save(mappedTargetValueFileMap);
        inputStream.close();
        LOGGER.info("CMT:Exiting parseHeaderFileAndCreateOrUpdateFileMap MapName={}.", fileMapRequestDTO.getMapName());
        return fileMapMapper.map(savedFileMap);
    }

    private void checkFileNameAndType(String filename, String filetype) {
        LOGGER.info("CMT:Entering checkFileNameAndType filename={} and filetype={}.", filename, filetype);
        if ((filename != null && filename.contains(".xls")) &&
                (filetype != null && filetype.contains("spreadsheet"))) {
            LOGGER.error(" CMT:Throwing exception as its not supportive on checkFileNameAndType filename={} and filetype={}.", filename, filetype);
            throw new RuntimeException("The uploaded file was a .xls or.xlsx file type which isn't supported by CMT. The preferred format is .csv");
        }
        LOGGER.info("CMT:Exiting checkFileNameAndType filename={} and filetype={}.", filename, filetype);
    }

    private boolean validateFileMapColumnsBeforeActivate(FileMap fileMap) {
        LOGGER.info("CMT:Entering validateFileMapColumnsBeforeActivate MapName={}.", fileMap.getMapName());
        if (fileMap.getFileType().equals(FileType.FIXED.toString())) {
            LOGGER.info("CMT:Entering FIXED condition validateFileMapColumnsBeforeActivate MapName={}.", fileMap.getMapName());
            validateFileMapforFixedType(fileMap);
            List<TargetValue> targetValueIDs = fileMap
                    .getFixedLengthFileSegments()
                    .stream().filter(fixedLengthFileSegment -> !fixedLengthFileSegment.getNotMapped())
                    .map(FixedLengthFileSegment::getTargetValues)
                    .flatMap(Collection::stream)
                    .collect(Collectors.toList());
        } else if (fileMap.getFileType().equals(FileType.DELIMITED.toString())) {
            LOGGER.info("CMT:Entering DELIMITED condition validateFileMapColumnsBeforeActivate MapName={}.", fileMap.getMapName());
            fileMap.getDelimitedFileColumns().forEach(column -> {
                if (column.getTargetValues().isEmpty() && !column.getNotMapped()) {
                    throw new MissingTargetValueException();
                }
            });
            List<TargetValue> targetValueIDs = fileMap
                    .getDelimitedFileColumns()
                    .stream().filter(delimitedFileColumn -> !delimitedFileColumn.getNotMapped())
                    .map(DelimitedFileColumn::getTargetValues)
                    .flatMap(Collection::stream)
                    .collect(Collectors.toList());
        } else {
            LOGGER.info("CMT:Exiting validateFileMapColumnsBeforeActivate MapName={} returning false.", fileMap.getMapName());
            return false;
        }
        LOGGER.info("CMT:Exiting validateFileMapColumnsBeforeActivate MapName={} returning true.", fileMap.getMapName());
        return true;
    }

    private void updateBooleanToTrue(Map<Integer, Boolean> map, int targetValueID) {
        map.computeIfPresent(targetValueID, (k, v) -> true);
    }

    /**
     * Validates that the file map columns have certain fields filled in at time of making the map active
     * Validation is done here because this is when we exit "draft" mode
     *
     * @param fileMap fileMap to be validated
     * @return true/false if valid
     */
    private boolean validateFileAttriBeforeActivate(FileMap fileMap) {
        LOGGER.info("CMT:Entering validateFileAttriBeforeActivate MapName={}.", fileMap.getMapName());
        final String[] verifyList = {"File Date", "File Type", "Member Count"}; //TODO include Migration Indicator and Submission ID
        Map<Integer, Boolean> map = new HashMap<>();

        /** a map that has TargetValue name has key and boolean as values .*/
        for (String label : verifyList) {
            map.put(targetValueRepository.findByName(label).orElseThrow(TargetValueNotFoundException::new).getTargetValueID(), false);
        }

        /** check fileMap specialRows or attributeValues .*/
        if (!fileMap.getSpecialRows().isEmpty() && fileMap.getSpecialRows().get(0) != null) {
            if (fileMap.getFileType().equals(FileType.FIXED.toString())) {
                fileMap.getSpecialRows().get(0).getFixedLengthFileSegments().forEach(col -> this.updateBooleanToTrue(map, col.getTargetValues().get(0).getTargetValueID()));
            } else if (fileMap.getFileType().equals(FileType.DELIMITED.toString())) {
                fileMap.getSpecialRows().get(0).getDelimitedFileColumns().forEach(col -> this.updateBooleanToTrue(map, col.getTargetValues().get(0).getTargetValueID()));
            }
        }

        if (!fileMap.getAttributeValues().isEmpty()) {
            fileMap.getAttributeValues().forEach(attributeValue -> this.updateBooleanToTrue(map, attributeValue.getTargetValueID()));
        }
        if (CollectionUtils.isEmpty(fileMap.getAttributeValues()) && CollectionUtils.isEmpty(fileMap.getSpecialRows())) {
            LOGGER.info("CMT:Throwing MissingFileAttributesException on validateFileAttriBeforeActivate MapName={}.", fileMap.getMapName());
            throw new MissingFileAttributesException();
        }
        LOGGER.info("CMT:Exiting validateFileAttriBeforeActivate MapName={}.", fileMap.getMapName());
        /** all map entries need to be all true to have map activated */
        return !map.containsValue(false);
    }

    @Override
    public FileMapResponseDTO addAndUpdateMatchers(FileNameMatcherReqDTO fileNameMatcherReqDTO) {
        LOGGER.info("CMT:Entering addAndUpdateMatchers MapName={}.", fileNameMatcherReqDTO.getFileMapID());
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
            }
            else if (duplicatedFileNameMatcher.isPresent() && duplicatedFileNameMatcher.get().getFileMap().getFileMapID() == fileMapID) {
                fileNameMatcher.setFileNameMatcherID(duplicatedFileNameMatcher.get().getFileNameMatcherID());
            }
            else if (duplicatedFileNameMatcher.isPresent() && duplicatedFileNameMatcher.get().getFileMap().getFileMapID() == currFileMap.getFileMapID() && duplicatedFileNameMatcher.get().getFileMap().getStatus() !=currFileMap.getStatus() ) {
                fileNameMatcher.getFileNameMatcherID();
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

    @Override
    public List<FileMapVersionsResponseDTO> getFileMapVersions(Integer fileMapID) {
        LOGGER.info("CMT:At getFileMapVersions fileMapID={}.", fileMapID);
        return fileMapRepository.getFileMapVersions(fileMapID);
    }

    private void validateFileType(FileMap fileMap, String header, int i, TargetValue targetValue) {
        LOGGER.info("CMT:Entering validateFileType MapName={}.", fileMap.getMapName());
        if (fileMap.getFileType().equals(FileType.DELIMITED.toString())) {
            fileMap.addDelimitedFileColumn(
                    new DelimitedFileColumn(header.trim(), i, i,null,Collections.singletonList(targetValue), fileMap)
            );
        } else {
            fileMap.addFixedLengthFileSegment(
                    new FixedLengthFileSegment(header.trim(), i,i,null, Collections.singletonList(targetValue), fileMap)
            );
        }
        LOGGER.info("CMT:Exiting validateFileType MapName={}.", fileMap.getMapName());
    }

    private void defaultNoTargetValidator(FileMap fileMap, String header, int i) {
        LOGGER.info("CMT:Entering defaultNoTargetValidator MapName={}.", fileMap.getMapName());
        if (fileMap.getFileType().equals(FileType.DELIMITED.toString())) {
            fileMap.addDelimitedFileColumn(
                    new DelimitedFileColumn(header.trim(), i,i,null, new ArrayList<>(), fileMap)
            );
        } else {
            fileMap.addFixedLengthFileSegment(
                    new FixedLengthFileSegment(header.trim(), i,i,null, new ArrayList<>(), fileMap)
            );
        }
        LOGGER.info("CMT:Exiting defaultNoTargetValidator MapName={}.", fileMap.getMapName());
    }

    private void validateFileMapforFixedType(FileMap fileMap) {
        LOGGER.info("CMT:Entering validateFileMapforFixedType MapName={}.", fileMap.getMapName());
        fileMap.getFixedLengthFileSegments().forEach(column -> {
            if (!column.getNotMapped()) {
                if (column.getTargetValues().isEmpty()) {
                    throw new MissingTargetValueException();
                }
                if (column.getSegmentLength() == null) {
                    throw new MissingSegmentLengthException();
                }
            }
        });
        LOGGER.info("CMT:Exiting validateFileMapforFixedType MapName={}.", fileMap.getMapName());
    }

    private void generateFileMapVersion(FileMap savedFileMap, FileMapRequestDTO fileMapRequestDTO) {
        LOGGER.info("CMT:Entering generateFileMapVersion MapName={}.", savedFileMap.getMapName());
        String OldStatus = savedFileMap.getStatus();
        String newStatus = fileMapRequestDTO.getStatus();

        if (OldStatus.equalsIgnoreCase(MapStatusType.ACTIVE.name()) && newStatus.equalsIgnoreCase(MapStatusType.BUILDING.name())) {
            Integer newVersionNumber = savedFileMap.getVersion() + 1;
            populateFileMapAndVersion(fileMapRequestDTO, savedFileMap.getFileMapID(), newVersionNumber);
        }
        LOGGER.info("CMT:Exiting generateFileMapVersion MapName={}.", savedFileMap.getMapName());
    }

    private void populateFileMapAndVersion(FileMapRequestDTO fileMapRequestDTO, Integer fileMapID, Integer newVersionNumber) {
        LOGGER.info("CMT:Entering populateFileMapAndVersion MapName={} and fileMapID={}.", fileMapRequestDTO.getMapName(), fileMapID);
        fileMapRequestDTO.setVersion(newVersionNumber);
        fileMapRequestDTO.setFileMapID(fileMapID);
        if (!CollectionUtils.isEmpty(fileMapRequestDTO.getDelimitedFileColumns())) {
            fileMapRequestDTO.getDelimitedFileColumns().forEach(e -> {
                e.setVersion(newVersionNumber);
                e.setFileMapID(fileMapID);

            });
        }
        if (!CollectionUtils.isEmpty(fileMapRequestDTO.getFixedLengthFileSegments())) {
            fileMapRequestDTO.getFixedLengthFileSegments().forEach(e -> {
                e.setVersion(newVersionNumber);
                e.setFileMapID(fileMapID);
            });
        }
        if (fileMapRequestDTO.getFixedLengthFileMapAttribute() != null) {
            fileMapRequestDTO.getFixedLengthFileMapAttribute().setFixedLengthFileMapAttributeID(null);
            fileMapRequestDTO.getFixedLengthFileMapAttribute().setVersion(newVersionNumber);
            fileMapRequestDTO.getFixedLengthFileMapAttribute().setFileMapID(fileMapID);
        }
        if (fileMapRequestDTO.getDelimitedFileMapAttribute() != null) {
            fileMapRequestDTO.getDelimitedFileMapAttribute().setDelimitedFileMapAttributeID(null);
            fileMapRequestDTO.getDelimitedFileMapAttribute().setVersion(newVersionNumber);
            fileMapRequestDTO.getDelimitedFileMapAttribute().setFileMapID(fileMapID);
        }
        if (!CollectionUtils.isEmpty(fileMapRequestDTO.getFileNameMatchers())) {
            fileMapRequestDTO.getFileNameMatchers().forEach(e -> {
                e.setFileNameMatcherID(null);
                e.setVersion(newVersionNumber);
                e.setFileMapID(fileMapID);
                e.setMatcher(null);
            });
        }
        if (!CollectionUtils.isEmpty(fileMapRequestDTO.getSpecialRows())) {
            fileMapRequestDTO.getSpecialRows().forEach(e -> {
                e.setVersion(newVersionNumber);
                e.setFileMapID(fileMapID);
                e.setSpecialRowID(null);
                e.getDelimitedFileColumns().forEach(d -> {
                    d.setVersion(newVersionNumber);
                    d.setFileMapID(fileMapID);
                    d.setDelimitedFileColumnID(null);
                });
                e.getFixedLengthFileSegments().forEach(f -> {
                    f.setVersion(newVersionNumber);
                    f.setFileMapID(fileMapID);
                    f.setFixedLengthFileSegmentID(null);
                });
            });
        }
        if (!CollectionUtils.isEmpty(fileMapRequestDTO.getAttributeValues())) {
            fileMapRequestDTO.getAttributeValues().forEach(e -> {
                e.setVersion(newVersionNumber);
                e.setFileMapID(fileMapID);
                e.setAttributeValueID(null);
            });
        }
        LOGGER.info("CMT:Exiting populateFileMapAndVersion MapName={} and fileMapID={}.", fileMapRequestDTO.getMapName(), fileMapID);
    }

    private void updateFileMapToInActive(FileMap currFileMap) {
        LOGGER.info("CMT:Entering updateFileMapToInActive MapName={}.", currFileMap.getMapName());
        List<FileMap> listOfMaps = fileMapRepository.getAllFileMapsWithActive(currFileMap.getFileMapID(), currFileMap.getVersion());
        listOfMaps.forEach(f -> {
            f.setStatus(MapStatusType.INACTIVE.toString());
            if (!CollectionUtils.isEmpty(f.getFileNameMatchers())) {
                f.getFileNameMatchers().forEach(fm -> fm.setMatcher(null));
            }
            f.setModifiedById(SecurityUtil.getUsername());
            Timestamp timestamp = new Timestamp(new Date().getTime());
            f.setMapUpdateTime(timestamp);
            fileMapRepository.save(f);
        });
        LOGGER.info("CMT:Exiting updateFileMapToInActive MapName={}.", currFileMap.getMapName());
    }

    private void checkForExcelFile(String filetype, String filename) {
        LOGGER.info("CMT:Entering checkForExcelFile filename={} and filetype={}.", filename, filetype);
        if ((filename != null && filename.contains(".xls")) &&
                (filetype != null && (filetype.contains("spreadsheet") || filetype.contains("excel")))) {
            LOGGER.info("CMT:Throwing RuntimeException on checkForExcelFile filename={} and filetype={}.", filename, filetype);
            throw new RuntimeException("The uploaded file was a .xls or.xlsx file type which isn't supported by CMT. The preferred format is .csv");
        }
        LOGGER.info("CMT:Exiting checkForExcelFile filename={} and filetype={}.", filename, filetype);
    }

    private void validateDuplicateSourceName(FileMap fileMap) {
        LOGGER.info("CMT:Entering validateDuplicateSourceName MapName={}.", fileMap.getMapName());
        if (fileMap.getFileMapID() != null && fileMap.getFileType().equals(FileType.DELIMITED.toString())) {
            List<String> sourceName = fileMap.delimitedFileColumns.stream().map(DelimitedFileColumn::getColumnName).collect(Collectors.toList());
            List<String> distinctColumnName = sourceName
                    .stream()
                    .distinct()
                    .collect(Collectors.toList());
            for (String duplicateColumn : distinctColumnName) {
                sourceName.remove(duplicateColumn);
            }
            List<String> duplicateList = sourceName.stream().distinct().collect(Collectors.toList());
            if (!duplicateList.isEmpty()) {
                LOGGER.info("CMT:Throwing DuplicateColumnNameException validateDuplicateSourceName MapName={}.", fileMap.getMapName());
                throw new DuplicateColumnNameException(duplicateList);
            }
        } else if (fileMap.getFileMapID() != null && fileMap.getFileType().equals(FileType.FIXED.toString())) {
            List<String> sourceName = fileMap.fixedLengthFileSegments.stream().map(FixedLengthFileSegment::getColumnName).collect(Collectors.toList());
            List<String> distinctColumnName = sourceName
                    .stream()
                    .distinct()
                    .collect(Collectors.toList());
            for (String duplicateColumn : distinctColumnName) {
                sourceName.remove(duplicateColumn);
            }
            List<String> duplicateList = sourceName.stream().distinct().collect(Collectors.toList());
            if (!duplicateList.isEmpty()) {
                LOGGER.info("CMT:Throwing DuplicateColumnNameException validateDuplicateSourceName MapName={}.", fileMap.getMapName());
                throw new DuplicateColumnNameException(duplicateList);
            }
        }
        LOGGER.info("CMT:Exiting validateDuplicateSourceName MapName={}.", fileMap.getMapName());
    }

    private void validateSourceName(FileMap fileMap) {
        LOGGER.info("CMT:Entering validateSourceName MapName={}.", fileMap.getMapName());
        if (fileMap.getFileType().equals(FileType.DELIMITED.toString())) {
            fileMap.getDelimitedFileColumns().forEach(column -> {
                if (fileMap.getFileMapID() != null &&
                        column.getColumnName().isEmpty()) {
                    LOGGER.info("CMT:Throwing MissingSourceNameException validateSourceName on DELIMITED MapName={}.", fileMap.getMapName());
                    throw new MissingSourceNameException();
                }
            });
        } else if (fileMap.getFileType().equals(FileType.FIXED.toString())) {
            fileMap.getFixedLengthFileSegments().forEach(fixed -> {
                if (fileMap.getFileMapID() != null &&
                        fixed.getColumnName().isEmpty()) {
                    LOGGER.info("CMT:Throwing MissingSourceNameException validateSourceName on FIXED MapName={}.", fileMap.getMapName());
                    throw new MissingSourceNameException();
                }
            });
        }
        LOGGER.info("CMT:Exiting validateSourceName MapName={}.", fileMap.getMapName());
    }

    @Override
    public InputStreamResource compareAndExportFileMapAsExcel(Integer fileMapId, Integer firstVersion, Integer secondVersion) {
        LOGGER.info("CMT:Entering compareAndExportFileMapAsExcel fileMapId={}.", fileMapId);
        FileMap fileMap1 = null;
        FileMap fileMap2 = null;
        String date1 = "";
        String date2 = "";
        Integer firstMapVersion = firstVersion;
        Integer secondMapVersion = firstMapVersion + 1;
        List<FileCompareExport> fileCompareExportList = new ArrayList<FileCompareExport>();
        while (secondMapVersion <= secondVersion) {
            Integer finalFirstMapVersion = firstMapVersion;
            fileMap1 = fileMapRepository.findById(new FileMapId(fileMapId, firstMapVersion)).
                    orElseThrow(() -> new FileMapVersionNotFoundException(fileMapId, finalFirstMapVersion));
            Integer finalSecondMapVersion = secondMapVersion;
            fileMap2 = fileMapRepository.findById(new FileMapId(fileMapId, secondMapVersion)).
                    orElseThrow(() -> new FileMapVersionNotFoundException(fileMapId, finalSecondMapVersion));
            if (String.valueOf(firstVersion).equals(String.valueOf(firstMapVersion))) {
                date1 = new SimpleDateFormat(DATE_FORMAT).format(fileMap1.getChangeDateTime());
            }
            if (String.valueOf(secondVersion).equals(String.valueOf(secondMapVersion))) {
                date2 = new SimpleDateFormat(DATE_FORMAT).format(fileMap2.getChangeDateTime());
            }

            FileCompareExport fileCompareExport = compareFileMaps(fileMap1, fileMap2);
            fileCompareExportList.add(fileCompareExport);
            firstMapVersion = secondMapVersion;
            secondMapVersion++;
        }
        FileMapExcelGenerator fileMapExcelGenerator = new FileMapExcelGenerator(fileMap1, targetValueRepository);
        LOGGER.info("CMT:Exiting compareAndExportFileMapAsExcel fileMapId={}.", fileMapId);
        return fileMapExcelGenerator.generateExcelForCompareVersion(fileCompareExportList, firstVersion, secondVersion, date1, date2);
    }

    private FileCompareExport compareFileMaps(FileMap fileMap1, FileMap fileMap2) {
        LOGGER.info("CMT:Entering compareFileMaps fileMapId1={} and fileMapId2={}.", fileMap1.getMapName(), fileMap2.getMapName());
        FileCompareExport fileCompareExport = new FileCompareExport();
        FileMapCompare fileMapCompare1 = new FileMapCompare();
        FileMapCompare fileMapCompare2 = new FileMapCompare();
        Map<Integer, Integer> orderMap = null;
        List<FileCompareRowData> fileCompareRowDataList1 = null;
        List<FileCompareRowData> fileCompareRowDataList2 = null;
        List<FileCompareRowData> fileCompareRowDataList1Copy = null;
        //setting  map attributes start
        Map<String, String> mapAttributes1 = getMapAttributes(fileMap1);
        Map<String, String> mapAttributes2 = getMapAttributes(fileMap2);
        Map<String, String> mapAttributes1Copy = new HashMap<>(mapAttributes1);

        mapAttributes1 = updateFileMapAttributes(mapAttributes1, mapAttributes2);
        mapAttributes2 = updateFileMapAttributes(mapAttributes2, mapAttributes1Copy);

        fileMapCompare1.setMapAttributes(mapAttributes1);
        fileMapCompare2.setMapAttributes(mapAttributes2);
        fileMapCompare1.setVersion(fileMap1.getVersion());
        fileMapCompare2.setVersion(fileMap2.getVersion());
        fileMapCompare1.setDtModified(new SimpleDateFormat(DATE_FORMAT).format(fileMap1.getChangeDateTime()));
        fileMapCompare1.setModifiedById(fileMap1.getModifiedById());
        fileMapCompare2.setDtModified(new SimpleDateFormat(DATE_FORMAT).format(fileMap2.getChangeDateTime()));
        fileMapCompare2.setModifiedById(fileMap2.getModifiedById());
        //setting  map attributes end

        // file map attributes start
        Map<String, String> fileAttributes1 = getFileAttributes(fileMap1);
        Map<String, String> fileAttributes2 = getFileAttributes(fileMap2);
        Map<String, String> fileAttributes1Copy = new LinkedHashMap<>(fileAttributes1);
        fileAttributes1.entrySet().removeAll(fileAttributes2.entrySet());
        fileAttributes2.entrySet().removeAll(fileAttributes1Copy.entrySet());

        fileMapCompare1.setFileAttributes(fileAttributes1);
        fileMapCompare2.setFileAttributes(fileAttributes2);

        // file map attributes end

        // delimited/fixed type start
        if (fileMap1.getFileType().equals("Delimited")) {
            fileCompareRowDataList1 = getCompareDataFromDelimitedColumnList(fileMap1);
            fileCompareRowDataList2 = getCompareDataFromDelimitedColumnList(fileMap2);

        } else {
            fileCompareRowDataList1 = getFileCompareRowBySegment(fileMap1.getFixedLengthFileSegments());
            fileCompareRowDataList2 = getFileCompareRowBySegment(fileMap2.getFixedLengthFileSegments());
            fileCompareRowDataList1Copy = new ArrayList<>(fileCompareRowDataList1);
        }
        // delimited/fixed type end
        fileCompareRowDataList1Copy = new ArrayList<>(fileCompareRowDataList1);
        orderMap = findChangeInOrder(fileCompareRowDataList1, fileCompareRowDataList2);
        fileCompareRowDataList1.removeAll(fileCompareRowDataList2);
        fileCompareRowDataList2.removeAll(fileCompareRowDataList1Copy);
        fileMapCompare1.setFileCompareRowDataList(fileCompareRowDataList1);
        fileMapCompare2.setFileCompareRowDataList(fileCompareRowDataList2);

        List<FileMapCompare> fileCompareList = new ArrayList<>();
        fileCompareList.add(fileMapCompare1);
        fileCompareList.add(fileMapCompare2);
        fileCompareExport.setFileMapCompareList(fileCompareList);
        fileCompareExport.setNewEntries(new ArrayList<>());
        fileCompareExport.setDeletedTransform(new ArrayList<>());
        fileCompareExport.setUpdatedTransform(new ArrayList<>());
        getNewEntriesFromRowData(fileCompareRowDataList1, fileCompareRowDataList2, fileCompareExport);
        fileCompareExport.setMapId(fileMap1.getFileMapID());
        LOGGER.info("CMT:Exiting compareFileMaps fileMapId1={} and fileMapId2={}.", fileMap1.getMapName(), fileMap2.getMapName());
        return fileCompareExport;
    }

    private void getNewEntriesFromRowData(List<FileCompareRowData> fileCompareRowDataList1, List<FileCompareRowData> fileCompareRowDataList2,
                                          FileCompareExport fileCompareExport) {
        LOGGER.info("CMT:Entering getNewEntriesFromRowData.");
        int size = fileCompareRowDataList1.size() > fileCompareRowDataList2.size() ? fileCompareRowDataList2.size() : fileCompareRowDataList1.size();
        for (int i = 0; i < size; i++) {
            addExcelContentforVersionCompare(fileCompareRowDataList1, fileCompareRowDataList2, fileCompareExport, i);
        }
        LOGGER.info("CMT:Entering getNewEntriesFromRowData.");
    }

    private void addExcelContentforVersionCompare(List<FileCompareRowData> fileCompareRowDataList1,
                                                  List<FileCompareRowData> fileCompareRowDataList2, FileCompareExport fileCompareExport, int i) {
        LOGGER.info("CMT:Entering addExcelContentforVersionCompare.");
        Map<String, List<String>> returnDataMap;
        returnDataMap = new LinkedHashMap<>();
        FileCompareRowData fileCompareRowData = fileCompareRowDataList1.get(i);
        FileCompareRowData fileCompareRowData2 = fileCompareRowDataList2.get(i);

        if (fileCompareRowData.getTargetValues() == null && fileCompareRowData2.getTargetValues() != null) {
            returnDataMap = fileCompareRowData2.getTargetValues();
            List<FileCompareExportEntryData> newEntries = getFileCompareExportEntryData(fileCompareRowData2, returnDataMap, fileCompareExport.getFileMapCompareList().get(1));
            fileCompareExport.getNewEntries().addAll(newEntries);
        } else if (fileCompareRowData2.getTargetValues() == null && fileCompareRowData.getTargetValues() != null) {
            returnDataMap = fileCompareRowData.getTargetValues();
            List<FileCompareExportEntryData> deletedEntries = getFileCompareExportEntryData(fileCompareRowData2, returnDataMap, fileCompareExport.getFileMapCompareList().get(1));
            fileCompareExport.getDeletedTransform().addAll(deletedEntries);
        } else {
            for (Map.Entry<String, List<String>> entry : fileCompareRowData.getTargetValues().entrySet()) {

                if (fileCompareRowData2.getTargetValues().containsKey(entry.getKey()) &&
                        fileCompareRowData2.getTargetValues().get(entry.getKey()) != entry.getValue()) {
                    updateExportData(fileCompareRowData, entry.getValue(), fileCompareRowData2.getTargetValues().get(entry.getKey()), fileCompareExport, entry.getKey());
                } else if (!fileCompareRowData2.getTargetValues().containsKey(entry.getKey())) {
                    prepareExportEntryDataForDeletedTransforms(fileCompareExport, fileCompareRowData, entry);

                }
            }
        }
        LOGGER.info("CMT:Exiting addExcelContentforVersionCompare.");
    }

    private void prepareExportEntryDataForDeletedTransforms(FileCompareExport fileCompareExport, FileCompareRowData fileCompareRowData, Map.Entry<String, List<String>> entry) {
        LOGGER.info("CMT:Entering prepareExportEntryDataForDeletedTransforms.");
        FileCompareExportEntryData fileCompareExportEntryData = new FileCompareExportEntryData();

        for (String str : entry.getValue()) {
            fileCompareExportEntryData = new FileCompareExportEntryData();
            fileCompareExportEntryData.setFrom(str);
            fileCompareExportEntryData.setSourceName(fileCompareRowData.getSourceName());
            fileCompareExportEntryData.setTargetName(entry.getKey());
            fileCompareExportEntryData.setTimestamp(fileCompareExport.getFileMapCompareList().get(1).getDtModified());
            fileCompareExportEntryData.setTo("NA");
            fileCompareExportEntryData.setUserId(fileCompareExport.getFileMapCompareList().get(1).getModifiedById());
            fileCompareExportEntryData.setVersion(fileCompareExport.getFileMapCompareList().get(1).getVersion());
            fileCompareExportEntryData.setWhatChaged(TRANSFORMATION);
            fileCompareExport.getDeletedTransform().add(fileCompareExportEntryData);
        }
        LOGGER.info("CMT:Exiting prepareExportEntryDataForDeletedTransforms.");
    }

    private List<FileCompareExportEntryData> getFileCompareExportEntryData(FileCompareRowData fileCompareRowData,
                                                                           Map<String, List<String>> returnDataMap, FileMapCompare fileMapCompare) {
        LOGGER.info("CMT:Entering getFileCompareExportEntryData.");
        List<FileCompareExportEntryData> list = new ArrayList<>();
        FileCompareExportEntryData fileCompareExportEntryData;

        for (Map.Entry<String, List<String>> entry : returnDataMap.entrySet()) {
            for (String targetVal : entry.getValue()) {
                fileCompareExportEntryData = new FileCompareExportEntryData();
                fileCompareExportEntryData.setFrom("NA");
                fileCompareExportEntryData.setSourceName(fileCompareRowData.getSourceName());
                fileCompareExportEntryData.setTargetName(entry.getKey());
                fileCompareExportEntryData.setTimestamp(fileMapCompare.getDtModified());
                fileCompareExportEntryData.setTo(targetVal);
                fileCompareExportEntryData.setUserId(fileMapCompare.getModifiedById());
                fileCompareExportEntryData.setVersion(fileMapCompare.getVersion());
                fileCompareExportEntryData.setWhatChaged(TRANSFORMATION);
                list.add(fileCompareExportEntryData);
            }
        }
        LOGGER.info("CMT:Exiting getFileCompareExportEntryData.");
        return list;
    }

    private void updateExportData(FileCompareRowData fileCompareRowData, List<String> old, List<String> newVals, FileCompareExport fileCompareExport, String targetName) {
        LOGGER.info("CMT:Entering updateExportData.");
        List<String> resultList = new ArrayList<>();
        if (old.size() > newVals.size()) {
            updateDeletedEntriesVersionExport(fileCompareRowData, old, newVals, fileCompareExport, targetName, resultList);

        } else if (old.size() < newVals.size()) {
            updateDeletedVersionCompareExport(fileCompareRowData, old, newVals, fileCompareExport, targetName, resultList);
        } else {
            for (int i = 0; i < old.size(); i++) {
                if (!old.get(i).equals(newVals.get(i))) {
                    resultList.add(newVals.get(i));
                    addDataInUpdateTransformlist(fileCompareRowData, fileCompareExport, targetName, old.get(i), newVals.get(i),
                            fileCompareExport.getUpdatedTransform());
                }
            }
        }
        LOGGER.info("CMT:Entering updateExportData.");
    }

    private void updateDeletedVersionCompareExport(FileCompareRowData fileCompareRowData, List<String> old, List<String> newVals,
                                                   FileCompareExport fileCompareExport,
                                                   String targetName, List<String> resultList) {
        LOGGER.info("CMT:Entering updateDeletedVersionCompareExport.");
        for (int i = 0; i < old.size(); i++) {
            if (!old.get(i).equals(newVals.get(i))) {
                resultList.add(newVals.get(i));
                addDataInUpdateTransformlist(fileCompareRowData, fileCompareExport, targetName, old.get(i), newVals.get(i),
                        fileCompareExport.getUpdatedTransform());
            }
        }
        List<String> newEntries = newVals.subList(old.size(), newVals.size());
        updateDeletedEntriesforCompareExport(fileCompareRowData, fileCompareExport, targetName, newEntries);
        LOGGER.info("CMT:Entering updateDeletedVersionCompareExport.");
    }
    private void updateDeletedEntriesVersionExport(FileCompareRowData fileCompareRowData, List<String> old, List<String> newVals, FileCompareExport fileCompareExport, String targetName, List<String> resultList) {
        LOGGER.info("CMT:Entering updateDeletedEntriesVersionExport.");
        for (int i = 0; i < newVals.size(); i++) {
            if (!old.get(i).equals(newVals.get(i))) {
                resultList.add(newVals.get(i));
                addDataInUpdateTransformlist(fileCompareRowData, fileCompareExport, targetName, old.get(i), newVals.get(i),
                        fileCompareExport.getUpdatedTransform());
            }
        }

        List<String> deletedEntries = old.subList(newVals.size(), old.size());
        updateDeletedEntriesforCompareExport2(fileCompareRowData, fileCompareExport, targetName, deletedEntries);
        LOGGER.info("CMT:Exiting updateDeletedEntriesVersionExport.");
    }
    private void updateDeletedEntriesforCompareExport(FileCompareRowData fileCompareRowData, FileCompareExport fileCompareExport, String targetName, List<String> newEntries) {
        LOGGER.info("CMT:Entering updateDeletedEntriesforCompareExport.");
        for (String str : newEntries) {
            FileCompareExportEntryData fileCompareExportEntryData = new FileCompareExportEntryData();
            fileCompareExportEntryData.setFrom("NA");
            fileCompareExportEntryData.setSourceName(fileCompareRowData.getSourceName());
            fileCompareExportEntryData.setTargetName(targetName);
            fileCompareExportEntryData.setTimestamp(fileCompareExport.getFileMapCompareList().get(1).getDtModified());
            fileCompareExportEntryData.setTo(str);
            fileCompareExportEntryData.setUserId(fileCompareExport.getFileMapCompareList().get(1).getModifiedById());
            fileCompareExportEntryData.setVersion(fileCompareExport.getFileMapCompareList().get(1).getVersion());
            fileCompareExportEntryData.setWhatChaged(TRANSFORMATION);
            fileCompareExport.getNewEntries().add(fileCompareExportEntryData);
        }
        LOGGER.info("CMT:Exiting updateDeletedEntriesforCompareExport.");
    }

    void updateDeletedEntriesforCompareExport2(FileCompareRowData fileCompareRowData, FileCompareExport fileCompareExport, String targetName, List<String> deletedEntries) {
        LOGGER.info("CMT:Entering updateDeletedEntriesforCompareExport2.");
        for (String str : deletedEntries) {
            FileCompareExportEntryData fileCompareExportEntryData = new FileCompareExportEntryData();
            fileCompareExportEntryData.setFrom(str);
            fileCompareExportEntryData.setSourceName(fileCompareRowData.getSourceName());
            fileCompareExportEntryData.setTargetName(targetName);
            fileCompareExportEntryData.setTimestamp(fileCompareExport.getFileMapCompareList().get(1).getDtModified());
            fileCompareExportEntryData.setTo("NA");
            fileCompareExportEntryData.setUserId(fileCompareExport.getFileMapCompareList().get(1).getModifiedById());
            fileCompareExportEntryData.setVersion(fileCompareExport.getFileMapCompareList().get(1).getVersion());
            fileCompareExportEntryData.setWhatChaged(TRANSFORMATION);
            fileCompareExport.getDeletedTransform().add(fileCompareExportEntryData);
        }
        LOGGER.info("CMT:Exiting updateDeletedEntriesforCompareExport2.");
    }

    private void addDataInUpdateTransformlist(FileCompareRowData fileCompareRowData, FileCompareExport fileCompareExport, String targetName, String s, String s2, List<FileCompareExportEntryData> updatedTransform) {
        LOGGER.info("CMT:Entering addDataInUpdateTransformlist.");
        FileCompareExportEntryData fileCompareExportEntryData = new FileCompareExportEntryData();
        fileCompareExportEntryData.setFrom(s);
        fileCompareExportEntryData.setSourceName(fileCompareRowData.getSourceName());
        fileCompareExportEntryData.setTargetName(targetName);
        fileCompareExportEntryData.setTimestamp(fileCompareExport.getFileMapCompareList().get(1).getDtModified());
        fileCompareExportEntryData.setTo(Objects.equals(s2, "") ?"<Blank>":s2);
        fileCompareExportEntryData.setUserId(fileCompareExport.getFileMapCompareList().get(1).getModifiedById());
        fileCompareExportEntryData.setVersion(fileCompareExport.getFileMapCompareList().get(1).getVersion());
        fileCompareExportEntryData.setWhatChaged(TRANSFORMATION);
        updatedTransform.add(fileCompareExportEntryData);
        LOGGER.info("CMT:Exiting addDataInUpdateTransformlist.");
    }

    private List<FileCompareRowData> getFileCompareRowBySegment(List<FixedLengthFileSegment> fixedLengthFileSegments) {

        LOGGER.info("CMT:Entering getFileCompareRowBySegment.");
        List<FileCompareRowData> fileCompareRowDataList = new ArrayList<>();
        FileCompareRowData fileCompareRowData = null;

        for (FixedLengthFileSegment fixedLengthFileSegment : fixedLengthFileSegments) {
            fileCompareRowData = new FileCompareRowData();
            fileCompareRowData.setSourceName(fixedLengthFileSegment.getColumnName());
            fileCompareRowData.setNotMapped(fixedLengthFileSegment.getNotMapped());
            Map<String, List<String>> targetValMap = new LinkedHashMap<>();
            for (FileColumnPropertyJoin fileColumnPropertyJoin : fixedLengthFileSegment.getFileColumnProperties()) {
                if (!fileColumnPropertyJoin.getColumnTransforms().isEmpty()) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            getColumnTransformData(fileColumnPropertyJoin.getColumnTransforms()));
                } else if (!fileColumnPropertyJoin.getHardcodedValues().isEmpty()) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            getHardcodedData(fileColumnPropertyJoin.getHardcodedValues()));
                }
                else if (CollectionUtils.isNotEmpty(fileColumnPropertyJoin.getLogicalTransforms())) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            getLogicalTransformForFixed(fileColumnPropertyJoin.getLogicalTransforms(), fixedLengthFileSegments));
                } else if (CollectionUtils.isNotEmpty(fileColumnPropertyJoin.getLogicalDerivationRowsets())) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            getLogicalDerivationForFixed(fileColumnPropertyJoin.getLogicalDerivationRowsets(), fixedLengthFileSegments,fileColumnPropertyJoin));
                }
                else {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            new ArrayList<String>());
                }
                fileCompareRowData.setTargetValues(targetValMap);
            }
            fileCompareRowDataList.add(fileCompareRowData);
        }
        LOGGER.info("CMT:Exiting getFileCompareRowBySegment.");
        return fileCompareRowDataList;
    }

    private Map<Integer, Integer> findChangeInOrder(List<FileCompareRowData> fileCompareData1, List<FileCompareRowData> fileCompareData2) {
        LOGGER.info("CMT:Entering findChangeInOrder.");
        Map<Integer, Integer> returnMap = new LinkedHashMap<>();
        int size = fileCompareData1.size() > fileCompareData2.size() ? fileCompareData2.size() : fileCompareData1.size();

        for (int i = 0; i < size; i++) {
            if (fileCompareData2.contains(fileCompareData1.get(i)) &&
                    fileCompareData2.indexOf(fileCompareData1.get(i)) != i) {
                returnMap.put(i, fileCompareData2.indexOf(fileCompareData1.get(i)));
            }
        }
        LOGGER.info("CMT:Exiting findChangeInOrder.");
        return returnMap;
    }

    private List<FileCompareRowData> getCompareDataFromDelimitedColumnList(FileMap fileMap) {
        LOGGER.info("CMT:Entering getCompareDataFromDelimitedColumnList.");
        List<String> removalList =
                Arrays.asList("Migration Indicator,Submission ID,File Type,File Date,Member Count".split(","));
        List<DelimitedFileColumn> delimitedFileColumnList = fileMap.getDelimitedFileColumns().stream().
                filter(data -> !removalList.contains(data.getColumnName())).collect(Collectors.toList());
        List<FileCompareRowData> returnList = getFileCompareRowDataList(delimitedFileColumnList);
        LOGGER.info("CMT:Exiting getCompareDataFromDelimitedColumnList.");
        return returnList;
    }

    private List<FileCompareRowData> getFileCompareRowDataList(List<DelimitedFileColumn> delimitedFileColumnList) {
        LOGGER.info("CMT:Entering getFileCompareRowDataList.");
        List<FileCompareRowData> fileCompareRowDataList = new ArrayList<>();
        FileCompareRowData fileCompareRowData = null;

        for (DelimitedFileColumn delimitedFileColumn : delimitedFileColumnList) {
            fileCompareRowData = new FileCompareRowData();
            fileCompareRowData.setSourceName(delimitedFileColumn.getColumnName());
            fileCompareRowData.setNotMapped(delimitedFileColumn.getNotMapped());
            Map<String, List<String>> targetValMap = new LinkedHashMap<>();
            for (FileColumnPropertyJoin fileColumnPropertyJoin : delimitedFileColumn.getFileColumnProperties()) {
                if (!fileColumnPropertyJoin.getColumnTransforms().isEmpty()) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            getColumnTransformData(fileColumnPropertyJoin.getColumnTransforms()));
                } else if (!fileColumnPropertyJoin.getHardcodedValues().isEmpty()) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            getHardcodedData(fileColumnPropertyJoin.getHardcodedValues()));
                } else if (!fileColumnPropertyJoin.getLogicalTransforms().isEmpty()) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            getLogicalTransformData(fileColumnPropertyJoin.getLogicalTransforms(), delimitedFileColumnList));
                }
                else if (CollectionUtils.isNotEmpty(fileColumnPropertyJoin.getLogicalDerivationRowsets())) {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),

                            getLogicalDerivationForDelimited(fileColumnPropertyJoin.getLogicalDerivationRowsets(),
                                    delimitedFileColumnList,fileColumnPropertyJoin));
                                }
                else {
                    targetValMap.put(fileColumnPropertyJoin.getTargetValue().getName(),
                            new ArrayList<String>());
                }
                fileCompareRowData.setTargetValues(targetValMap);
            }
            fileCompareRowDataList.add(fileCompareRowData);
        }
        LOGGER.info("CMT:Exiting getFileCompareRowDataList.");
        return fileCompareRowDataList;
    }

    private List<String> getHardcodedData(List<HardcodedValue> hardcodedValues) {
        LOGGER.info("CMT:Entering getHardcodedData.");
        List<String> returnData = new ArrayList<>();
        String data = null;

        for (HardcodedValue hardcodedValue : hardcodedValues) {
            data = hardcodedValue.getValue();
            returnData.add(data);
        }
        LOGGER.info("CMT:Exiting getHardcodedData.");
        return returnData;
    }

    private List<String> getColumnTransformData(List<ColumnTransform> columnTransforms) {
        LOGGER.info("CMT:Entering getColumnTransformData.");
        List<String> returnData = new ArrayList<>();
        String data = null;
        for (ColumnTransform columnTransform : columnTransforms) {
            data = "value " + columnTransform.getValue() + (StringUtils.isEmpty(columnTransform.getMappedValue()) ? (MAPPED_VALUE) : (" mapped->" + columnTransform.getMappedValue()));
            returnData.add(data);
        }
        LOGGER.info("CMT:Entering getColumnTransformData.");
        return returnData;
    }

    private String getDelimitedFileColumnSourceName(Integer fctv,List<DelimitedFileColumn> delimitedFileColumns) {
        String delimitedColumn = StringUtils.EMPTY;
        for (DelimitedFileColumn delimitedFileColumn : delimitedFileColumns) {
            for (FileColumnPropertyJoin fileColumnProperty : delimitedFileColumn.getFileColumnProperties()) {
                if (fileColumnProperty.getFileColumnTargetValueID().equals(fctv)) {
                    delimitedColumn = delimitedFileColumn.getColumnName() + " - " + fileColumnProperty.getTargetValue().getName();
                    break;
                }
            }
        }
        return delimitedColumn;
    }
    private String getFixedFileSourceName(Integer fctv, List<FixedLengthFileSegment> fixedLengthFileSegments) {
        String fixedFileColumn = StringUtils.EMPTY;
        for (FixedLengthFileSegment fixedLengthFileSegment: fixedLengthFileSegments) {
            for (FileColumnPropertyJoin fileColumnProperty : fixedLengthFileSegment.getFileColumnProperties()) {
                if (fileColumnProperty.getFileColumnTargetValueID().equals(fctv)) {
                    fixedFileColumn = fixedLengthFileSegment.getColumnName() + " - " + fileColumnProperty.getTargetValue().getName();
                    break;
                }
            }
        }
        return fixedFileColumn;
    }

    // getting values for logical transformation
    private List<String> getLogicalTransformData(List<LogicalTransform> logicalTransformList, List<DelimitedFileColumn> delimitedFileColumnsList) {
        List<String> returnData = new ArrayList<>();
        for (LogicalTransform logicalTransform : logicalTransformList) {
            StringBuilder sb = new StringBuilder();
            sb.append("Logical Target Name: ");
            sb.append(getDelimitedFileColumnSourceName(logicalTransform.getComparisonFileColumnTargetValueID(),delimitedFileColumnsList));
            sb.append(StringUtils.isEmpty(logicalTransform.getComparisonValue()) ? (" mapped -> Blank") : ("  mapped ->  " + logicalTransform.getLogicOperator() + " " + logicalTransform.getComparisonValue()));
            if (logicalTransform.getFileColumnPropertyJoin().getLogicalRelation() != null) {
                sb.append(" , Logical Relation -> ").append(logicalTransform.getFileColumnPropertyJoin().getLogicalRelation());
            }
            String data = sb.toString();
            returnData.add(data);
        }
        return returnData;
    }
    private List<String> getLogicalTransformForFixed(List<LogicalTransform> logicalTransformList, List<FixedLengthFileSegment> fixedLengthFileSegments) {
        List<String> returnData = new ArrayList<>();

        logicalTransformList.forEach(logicalTransform -> {
            StringBuilder sb = new StringBuilder();
            sb.append("Logical Target Name: ");
            sb.append(getFixedFileSourceName(logicalTransform.getComparisonFileColumnTargetValueID(), fixedLengthFileSegments));
            sb.append(StringUtils.isEmpty(logicalTransform.getComparisonValue()) ? (MAPPED_VALUE) : ("  mapped ->  " + logicalTransform.getLogicOperator() + " " + logicalTransform.getComparisonValue()));
            if (logicalTransform.getFileColumnPropertyJoin().getLogicalRelation() != null) {
                sb.append(" , Logical Relation -> ").append(logicalTransform.getFileColumnPropertyJoin().getLogicalRelation());
            }
            String data = sb.toString();
            returnData.add(data);
        });
        return returnData;
    }

    private List<String> fetchLogicalDerivationFixedData(List<LogicalDerivationRowset> logicalDerivationRowsets, FileColumnPropertyJoin fileColumnPropertyJoin,
                                                         List<FixedLengthFileSegment> fixedLengthFileSegments) {
        List<String> returnData = returnElseValueForFixed(fileColumnPropertyJoin);
        logicalDerivationRowsets.forEach(logicalDerivationRowset -> logicalDerivationRowset.getLogicalDerivationConditions().forEach(logicalDerivationCondition -> {
            if ((logicalDerivationRowset.getRowSetID()).equals(logicalDerivationCondition.getRowSetID())) {
                StringBuilder sb = new StringBuilder();

                sb.append("Logical Derivation Name: ");
                sb.append(getFixedFileSourceName(logicalDerivationCondition.getComparisonFileColumnTargetValueID(), fixedLengthFileSegments));
                sb.append(StringUtils.isEmpty(logicalDerivationCondition.getComparisonValue()) ? (" mapped -> " + logicalDerivationCondition.getLogicalOperator() + BLANK_VALUE) : ("  mapped -> " +
                        logicalDerivationCondition.getLogicalOperator() + logicalDerivationCondition.getComparisonValue()));

                  getThenValue(returnData,logicalDerivationRowset,sb);
            }
        }));
        return returnData;
    }

    @NotNull
    private List<String> returnElseValueForFixed(FileColumnPropertyJoin fileColumnPropertyJoin) {
        List<String> returnData = new ArrayList<>();
        String elseValue =  getElseValue(fileColumnPropertyJoin.getFixedLengthFileSegment().getFileColumnProperties());
        returnData.add("elseValue -> " + elseValue);
        return returnData;
    }
    @NotNull
    private List<String> returnElseValueForDelimited(FileColumnPropertyJoin fileColumnPropertyJoin) {
        List<String> returnData = new ArrayList<>();
        String elseValue =  getElseValue(fileColumnPropertyJoin.getDelimitedFileColumn().getFileColumnProperties());
        returnData.add("elseValue -> " + elseValue);
        return returnData;
    }
    private List<String> getLogicalDerivationData(List<LogicalDerivationRowset> logicalDerivationRowsets, FileColumnPropertyJoin fileColumnPropertyJoin,
                                                  List<DelimitedFileColumn> delimitedFileColumnList) {
        List<String> returnData = returnElseValueForDelimited(fileColumnPropertyJoin);
        logicalDerivationRowsets.forEach(logicalDerivationRowset -> logicalDerivationRowset.getLogicalDerivationConditions().forEach(logicalDerivationCondition -> {
            if ((logicalDerivationRowset.getRowSetID()).equals(logicalDerivationCondition.getRowSetID())) {
                StringBuilder sb = new StringBuilder();

                sb.append("Logical Derivation Name: ");
                sb.append(getDelimitedFileColumnSourceName(logicalDerivationCondition.getComparisonFileColumnTargetValueID(), delimitedFileColumnList));
                sb.append(StringUtils.isEmpty(logicalDerivationCondition.getComparisonValue()) ?
                        (" mapped -> " + logicalDerivationCondition.getLogicalOperator() + BLANK_VALUE) : ("  mapped -> " +
                        logicalDerivationCondition.getLogicalOperator() + logicalDerivationCondition.getComparisonValue()));
                getThenValue(returnData, logicalDerivationRowset, sb);
            }
        }));

        return returnData;
    }

    private void getThenValue(List<String> returnData, LogicalDerivationRowset logicalDerivationRowset, StringBuilder sb) {
        String data = sb.toString();

        if (StringUtils.isNotEmpty(data)) {
            returnData.add(data);
            returnData.add(THEN_VALUE + (StringUtils.isEmpty(logicalDerivationRowset.getThenValue())
                    ? BLANK_VALUE : logicalDerivationRowset.getThenValue()));
        }
    }

    private String getElseValue(List<FileColumnPropertyJoin> fileColumnPropertyJoins) {
        String elseValue = StringUtils.EMPTY;
        if (CollectionUtils.isNotEmpty(fileColumnPropertyJoins) && elseValue !=null) {
            elseValue = fileColumnPropertyJoins.stream().map(FileColumnPropertyJoin::getElseValue).
                    filter(StringUtils::isNotEmpty).findFirst().orElse(BLANK_VALUE);
        }
        return elseValue;
    }

    private List<String> getLogicalDerivationForDelimited(List<LogicalDerivationRowset> logicalDerivationRowsets, List<DelimitedFileColumn> delimitedFileColumnList,
                                                          FileColumnPropertyJoin fileColumnPropertyJoin) {
        List<String> returnValue;
        returnValue = getLogicalDerivationData(logicalDerivationRowsets, fileColumnPropertyJoin, delimitedFileColumnList);

        return returnValue;
    }

    private List<String> getLogicalDerivationForFixed(List<LogicalDerivationRowset> logicalDerivationRowsets, List<FixedLengthFileSegment> fixedLengthFileSegments, FileColumnPropertyJoin fileColumnPropertyJoin) {
        List<String> returnValue;
        returnValue = fetchLogicalDerivationFixedData(logicalDerivationRowsets, fileColumnPropertyJoin, fixedLengthFileSegments);

        return returnValue;
    }

    private Map<String, String> getFileAttributes(FileMap fileMap) {
        LOGGER.info("CMT:Entering getFileAttributes.");
        Map<Integer, String> targetMapping = null;
        Map<String, String> fileAttributes = new LinkedHashMap<>();
        List<TargetValue> targetValues = null;

        if (fileMap.getAttributeValues() != null && !fileMap.getAttributeValues().isEmpty()) {

            fileAttributes.put(DATA_ORDER, "Hardcoded");
            targetValues = targetValueRepository.findAll();
            targetMapping = targetValues.stream().collect(Collectors.toMap(TargetValue::getTargetValueID, TargetValue::getName));
            Map<Integer, String> finalTargetMapping = targetMapping;
            fileMap.getAttributeValues().stream().forEach(data -> fileAttributes.put(finalTargetMapping.get(data.getTargetValueID()), data.getValue()));

        } else if (fileMap.getSpecialRows() != null && !fileMap.getSpecialRows().isEmpty()) {
            fileAttributes.put(DATA_ORDER, "Present in File");
            if (fileMap.getFileType().equals("Fixed")) {
                fileAttributes.putAll(getFixedFileTypeAttributes(fileMap));
            } else {
                fileMap.getSpecialRows().get(0).getDelimitedFileColumns().stream().forEach(data -> fileAttributes.put(data.getColumnName(), data.getNotes()));
            }
        } else {
            fileAttributes.put(DATA_ORDER, "None");
        }
        LOGGER.info("CMT:Exiting getFileAttributes.");
        return fileAttributes;
    }

    private Map<String, String> getFixedFileTypeAttributes(FileMap fileMap) {
        LOGGER.info("CMT:Entering getFixedFileTypeAttributes.");
        Map<String, String> fixedFileTypeAttributesMap = new LinkedHashMap<>();

        Optional<FixedLengthFileSegment> migrationIndicator = fileMap.getSpecialRows().get(0).
                getFixedLengthFileSegments().stream().filter(data -> data.getColumnName().
                        equals("Migration Indicator")).findAny();

        if (migrationIndicator.isPresent()) {
            fixedFileTypeAttributesMap.put(migrationIndicator.get().getColumnName(), migrationIndicator.get().getNotes());
        }

        fileMap.getSpecialRows().get(0).getFixedLengthFileSegments().stream().filter(data -> !data.getColumnName().
                equals("Migration Indicator")).forEach(data -> fixedFileTypeAttributesMap.put(data.getColumnName(), String.valueOf(data.getSegmentLength())));
        LOGGER.info("CMT:Exiting getFixedFileTypeAttributes.");
        return fixedFileTypeAttributesMap;
    }

    private Map<String, String> updateFileMapAttributes(Map<String, String> first, Map<String, String> second) {
        LOGGER.info("CMT:Entering updateFileMapAttributes.");
        Map<String, String> returnMap = new HashMap<>(first);
        returnMap.entrySet().removeAll(second.entrySet());
        LOGGER.info("CMT:Exiting updateFileMapAttributes.");
        return returnMap;
    }

    private Map<String, String> getMapAttributes(FileMap fileMap) {
        LOGGER.info("CMT:Entering getMapAttributes.");
        Map<String, String> fileAttributes = new HashMap<>();

        // fileAttributes.put("Last Modified", fileMap.getMapUpdateTime().toString().substring(0, 10));
        fileAttributes.put("Status", fileMap.getStatus());
       /* fileAttributes.put("File Type", fileMap.getFileType());
        fileAttributes.put("Last Modified By", fileMap.getModifiedById());
        fileAttributes.put("File Name", fileMap.getFileNameMatchers().stream().
                map(matcher -> matcher.getMatcher()).collect(Collectors.joining()));*/
        LOGGER.info("CMT:Exiting getMapAttributes.");
        return fileAttributes;
    }
}
