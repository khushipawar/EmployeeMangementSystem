package com.optum.cirrus.isl.member.edi.util.initialValidation;

import com.optum.cirrus.commons.logging.ConditionalLogger;
import com.optum.cirrus.isl.member.edi.data.v1.Validation.InitialDelimitedValidationResponseDTO;
import com.optum.cirrus.isl.member.edi.data.v1.Validation.InitialValidationRequestDTO;
import com.optum.cirrus.isl.member.edi.exception.ParserException;
import com.optum.cirrus.isl.member.edi.util.blunders.initial.DelimiterBlunder;
import com.optum.cirrus.isl.member.edi.util.blunders.initial.ElementMisalignedBlunder;
import com.optum.cirrus.isl.member.edi.util.blunders.initial.EscapeCharBlunder;
import com.optum.cirrus.isl.member.edi.util.blunders.initial.FileTypeBlunder;
import com.optum.cirrus.isl.member.edi.util.blunders.initial.LineTerminatorBlunder;
import com.optum.cirrus.isl.member.edi.util.blunders.initial.TextQualifierBlunder;
import com.optum.cirrus.isl.member.edi.util.enums.ValidationSeverity;
import com.univocity.parsers.common.TextParsingException;
import com.univocity.parsers.csv.CsvFormat;
import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import org.apache.commons.io.FilenameUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Scanner;
import java.util.Set;
import java.util.stream.Collectors;

public class DelimitedInitialValidation implements Parser<InitialDelimitedValidationResponseDTO> {
    private static final ConditionalLogger LOGGER = new ConditionalLogger(DelimitedInitialValidation.class);

    // Stanford NLP parser


    public DelimitedInitialValidation() {
        // Initialize Stanford NLP.
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,lemma,ner");
        props.setProperty("tokensregex.rules", "ner.rules");
        props.setProperty("tokensregex.matchedExpressionsAnnotationKey",
                "edu.stanford.nlp.examples.TokensRegexAnnotatorDemo$MyMatchedExpressionAnnotation");
    }

    @Override
    public List<String[]> parseFileAndValidate() {
        return Collections.emptyList();
    }

    @Override
    public List<String[]> parseHeaderFile() {
        return Collections.emptyList();
    }

    @Override
    public InitialDelimitedValidationResponseDTO runInitialValidation(InitialValidationRequestDTO initialValidationRequestDTO, MultipartFile file) {
        CsvParserSettings settings = new CsvParserSettings();
        settings.setMaxColumns(2048);
        String filename = file.getOriginalFilename();
        InitialDelimitedValidationResponseDTO response = new InitialDelimitedValidationResponseDTO();

        final String delimitedExtension = "csv";

        // Verify file extension.
        String fileExtenstion = FilenameUtils.getExtension(filename);
        if (!fileExtenstion.equals(delimitedExtension)) {
            response.setFileTypeBlunder(new FileTypeBlunder(delimitedExtension, fileExtenstion, ValidationSeverity.WARN));
            LOGGER.warn("WARNING: FILE EXTENSION IS INCORRECT");
        }

        try (InputStream fileInputStream = file.getInputStream()){
            // Perform auto detected parse.
            Reader autoDetectedReader = new InputStreamReader(fileInputStream, StandardCharsets.UTF_8);

            settings.detectFormatAutomatically();
            settings.setMaxColumns(2048);
            CsvParser parser = new CsvParser(settings);

            List<String[]> autoRows;
            autoRows = parser.parseAll(autoDetectedReader);
            CsvFormat detectedFormat = parser.getDetectedFormat();
            // Set to user specifications with null checks in place.
            CsvFormat userFormat = new CsvFormat();
            userFormat.setDelimiter(initialValidationRequestDTO.getColDelimiter());
            String lineSeparator = initialValidationRequestDTO.getLineSeparator();
            if (lineSeparator != null) {
                userFormat.setLineSeparator(lineSeparator);
            } else {
                userFormat.setLineSeparator("\n");
            }
            Character quote = initialValidationRequestDTO.getTextQualifier();
            if (quote != null) {
                userFormat.setQuote(quote);
            }
            Character quoteEscape = initialValidationRequestDTO.getEscapeChar();
            if (quoteEscape != null) {
                userFormat.setQuoteEscape(quoteEscape);
            }

            // Compare detected format to format supplied by the user.
            boolean probableFound = compareFormats(userFormat, detectedFormat, file, response);
            // If probable is found parsing is done.
            if (probableFound) {
                if (!verifyRowLengths(autoRows)) {
                    response.setElementMisalignedBlunder(new ElementMisalignedBlunder(ValidationSeverity.WARN));
                }
                return response;
            }

            // Continue with user settings if auto detect fails.
            try (InputStream userSettingsStream = file.getInputStream()) {
                Reader inputReader = new InputStreamReader(userSettingsStream, StandardCharsets.UTF_8);
                settings.setFormat(userFormat);
                settings.setMaxColumns(2048);
                parser = new CsvParser(settings);
                List<String[]> userRows = parser.parseAll(inputReader);

                if (!verifyRowLengths(userRows)) {
                    response.setElementMisalignedBlunder(new ElementMisalignedBlunder(ValidationSeverity.WARN));
                }
            }
            return response;
        } catch (IOException e) {
            throw new ParserException(filename);
        }
        catch (TextParsingException e) {
               LOGGER.info("CMT:FAILURE TO AUTODETECT FILE FORMAT. DEFAULTING TO USER SETTINGS.");
               return response;
            }
    }

    private boolean verifyRowLengths(List<String[]> parsedRows) {
        List<Integer> rowElements = parsedRows.stream().map(line -> line.length).collect(Collectors.toList());
        Set<Integer> uniqueRowCounts = new HashSet<>(rowElements);
        if (uniqueRowCounts.size() > 1) {
            LOGGER.warn("WARNING: ROWS ARE NOT MATCHING!");
            LOGGER.warn("FOUND ROW LENGTHS OF:" + Arrays.toString(uniqueRowCounts.toArray()));
            return false;
        }
        return true;
    }

    /**
     * Takes a newline character and converts to a user friendly form before returning to the app.
     *
     * @param newline the newline character
     * @return a user friendly newline
     */
    private String convertNewline(String newline) {
        switch (newline) {
            case "\n":
                return "Newline";
            case "\t":
                return "Tab";
            case "|":
                return "Pipe";
            case " ":
                return "Space";
            default:
                return "Unknown";
        }
    }

    /**
     * Compares the user supplied format to the auto detected format. If differences are found, errors are thrown.
     *
     * @param userFormat     the format supplied by the user on the app
     * @param detectedFormat the format auto detected by univocity
     * @param file           the user's file
     * @param response       the response object to update with errors
     * @return whether a probable format was found.
     */
    private boolean compareFormats(CsvFormat userFormat, CsvFormat detectedFormat, MultipartFile file, InitialDelimitedValidationResponseDTO response) {
        // If the detected delimiter is not space, we have found a highly probable format.
        if (detectedFormat.getDelimiter() != ' ') {
            boolean delimiterMatch = userFormat.getDelimiter() == detectedFormat.getDelimiter();
            boolean lineSepMatch = userFormat.getNormalizedNewline() == detectedFormat.getNormalizedNewline();


            try (InputStream fileInputStream = file.getInputStream()){
                // Determine if the quote char and escape char are present in the file.
                Scanner scanner = new Scanner(fileInputStream);
                boolean quoteFound = false;
                boolean escapeFound = false;
                while (scanner.hasNextLine()) {
                    String line = scanner.nextLine();
                    if (line.contains(String.valueOf(detectedFormat.getQuote()))) {
                        quoteFound = true;
                    }
                    if (line.contains(String.valueOf(detectedFormat.getQuoteEscape()))) {
                        escapeFound = true;
                    }
                }
                delimiterMatch1( response,  delimiterMatch, lineSepMatch, userFormat, detectedFormat,quoteFound,escapeFound);
            } catch (IOException e) {
                throw new ParserException(file.getOriginalFilename());
            }
            return true;
        }
        return false;
    }
  private void delimiterMatch1(InitialDelimitedValidationResponseDTO response, boolean delimiterMatch, boolean lineSepMatch,CsvFormat userFormat, CsvFormat detectedFormat,  boolean quoteFound,boolean escapeFound ){
      if (!delimiterMatch) {
          response.setDelimiterBlunder(
                  new DelimiterBlunder(userFormat.getDelimiterString(),
                          detectedFormat.getDelimiterString(),
                          ValidationSeverity.ERROR));
      }
      if (!lineSepMatch) {
          response.setLineTerminatorBlunder(
                  new LineTerminatorBlunder(convertNewline(userFormat.getLineSeparatorString()),
                          convertNewline(detectedFormat.getLineSeparatorString()),
                          ValidationSeverity.ERROR));
      }
      boolean quoteMatch = userFormat.getQuote() == detectedFormat.getQuote();
      if (quoteFound && !quoteMatch) {
          response.setTextQualifierBlunder(
                  new TextQualifierBlunder(String.valueOf(userFormat.getQuote()),
                          String.valueOf(detectedFormat.getQuote()),
                          ValidationSeverity.ERROR));
      }

      boolean escapeCharMatch = userFormat.getQuoteEscape() == detectedFormat.getQuoteEscape();
      if (escapeFound && !escapeCharMatch) {
          response.setEscapeCharBlunder(
                  new EscapeCharBlunder(String.valueOf(userFormat.getQuoteEscape()),
                          String.valueOf(detectedFormat.getQuoteEscape()),
                          ValidationSeverity.ERROR));
      }
  }
    /**
     * Use Stanford NER to determine probable column descriptors.
     *
     */

    @Override
    public void createSetting() {
        // required
    }

    @Override
    public Reader readFile(FileInputStream fileInputStream) {
        return null;
    }
}
