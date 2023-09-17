componentDidUpdate(prevProps) {
  const { dataSource, index, mode, datalndex } = this.props;
  const prevMode = prevProps.mode;

  if (mode === "edit" && mode !== prevMode) {
    // Recheck conditions as in componentDidMount
    const hardcodedData =
      dataSource &&
      dataSource[index]?.fileColumnProperties
        .filter((property) => property.hardcodedValue !== null)
        .map((property) => property.hardcodedValue).length > 0;

    const logicalTransformsData =
      dataSource &&
      dataSource[index]?.fileColumnProperties.filter(
        (property) => property.logicalTransforms
      ).length > 0;

    const logicalTransformationLength = logicalTransformsData
      ? dataSource[index]?.fileColumnProperties.filter(
          (property) => property.logicalTransforms
        ).length
      : 0;

    const logicalDerivationData =
      dataSource &&
      dataSource[index]?.fileColumnProperties.filter(
        (property) => property.logicalDerivationRowsets
      ).length > 0;

    const logicalDerivationLength = logicalDerivationData
      ? dataSource[index]?.fileColumnProperties.filter(
          (property) => property.logicalDerivationRowsets
        ).length
      : 0;

    if (
      dataSource &&
      dataSource[index]?.fileColumnProperties
        .flatMap((property) => property.columnTransforms).length > 0 ||
      (dataSource[index]?.fileColumnProperties.filter(
        (property) => property.logicalTransforms
      ).length > 0 &&
        logicalTransformationLength > 0) ||
      (dataSource[index]?.fileColumnProperties.filter(
        (property) => property.logicalDerivationRowsets
      ).length > 0 &&
        logicalDerivationLength > 0) ||
      (dataSource[index]?.fileColumnProperties
        .filter((property) => property.hardcodedValue !== null)
        .map((property) => property.hardcodedValue).length > 0 &&
        hardcodedData > 0)
    ) {
      this.setAssigned(true);
    } else {
      this.setAssigned(false);
    }
  }
}
