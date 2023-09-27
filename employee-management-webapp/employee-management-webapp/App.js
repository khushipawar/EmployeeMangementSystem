handleDateChange = (e, index, uniqueID, key, conindex) => {
  // Make copies of state objects
  const transformations = { ...this.state.transformations };
  const dateError = { ...this.state.dateError };

  // Flag to track if any error is triggered
  let errorTriggered = false;

  // Check if key is "elselnd" and input is not a number
  if (key === "elselnd" && isNaN(e.key)) {
    dateError.dateErrorElse = true; // Set the specific error flag
    errorTriggered = true;

    // Additional logic for date formatting
    if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
      const size = e.target.value.length;
      if ((size === 2 && e.target.value < 13) || (size === 5 && Number(e.target.value.split('-')[7]) < 32)) {
        e.target.value += '-';
      }
    }
  }

  // Handle other keys and update transformations
  if (key === "mappedValue") {
    transformations[uniqueID].valueTransformation[index].mappedValue = e.target.value;
    dateError.dateErrorMappedValue = true;
    errorTriggered = true;
  } else if (key === "thenValue") {
    transformations[uniqueID].logicalDerivationRowsets[index].thenValue = e.target.value;
    dateError.dateErrorThenValue = true;
    errorTriggered = true;
  } else if (key === "elseInd") {
    transformations[uniqueID].elseValue = e.target.value;
    dateError.dateErrorElseInd = true;
    errorTriggered = true;
  } else if (key === "comparisonValue") {
    transformations[uniqueID].logicalTransformation[index].comparisonValue = e.target.value;
    dateError.dateErrorComparisonValue = true;
    errorTriggered = true;
  } else if (key === "comparisonValueDer") {
    transformations[uniqueID].logicalDerivationRowsets[conindex].comparisonValue = e.target.value;
    dateError.dateErrorComparisonValueDer = true;
    errorTriggered = true;
  }

  // If any error was triggered, update state
  if (errorTriggered) {
    this.setState({
      transformations: transformations,
      dateError: dateError,
    });
  }
};

