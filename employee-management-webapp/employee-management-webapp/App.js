class YourComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transformations: {}, // Your transformations state
      dateError: false,
      dateErrorMessage: "", // Error message for date
    };
  }

  handleDateChange = (e, index, uniqueID, key, condIndex) => {
    const transformations = { ...this.state.transformations };

    if (isNaN(e.key) && key === "elselnd") {
      // Format the entered date as "MM-DD-YYYY" format
      if (
        (e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105)
      ) {
        const rawDate = e.target.value;
        const formattedDate = rawDate
          .replace(/\D/g, '') // Remove non-numeric characters
          .slice(0, 8) // Limit to 8 characters (MMDDYYYY)
          .replace(/(\d{2})(\d{2})(\d{4})/, '$1-$2-$3'); // Format as MM-DD-YYYY
        e.target.value = formattedDate;

        // Check if the formatted date is valid
        const isValidDate = !isNaN(Date.parse(formattedDate));

        if (!isValidDate) {
          // Display an error message for an invalid date
          this.setState({
            dateError: true,
            dateErrorMessage: "Invalid date format (MM-DD-YYYY)",
          });
          return; // Exit the function, don't update state with an invalid date
        }
      } else {
        this.setState({
          dateError: false,
          dateErrorMessage: "", // Reset error message
        });
      }

      // Update the transformations state based on the 'key' and other logic
      if (key === "mappedValue") {
        transformations[uniqueID].valueTransformation[index].mappedValue =
          e.target.value;
      } else if (key === "thenValue") {
        transformations[uniqueID].logicalDerivationRowsets[index].thenValue =
          e.target.value;
      } else if (key === "elselnd") {
        transformations[uniqueID].elseValue = e.target.value;
      } else if (key === "comparisonValue") {
        transformations[uniqueID].logicalTransformation[index].comparisonValue =
          e.target.value;
      } else if (key === "comparisonValueDer") {
        transformations[uniqueID].logicalDerivationRowsets[condIndex]
          .comparisonValue = e.target.value;
      }

      // Rest of your code for handling date changes and updating state...

      this.setState({ transformations: transformations });
    }
  };

  render() {
    return (
      <div>
        <input
          type="text"
          onChange={(e) =>
            this.handleDateChange(e, index, uniqueID, key, condIndex)
          }
        />
        {this.state.dateError && (
          <div style={{ color: "red" }}>
            {this.state.dateErrorMessage}
          </div>
        )}
        {/* Rest of your component's rendering */}
      </div>
    );
  }
}

export default YourComponent;
 
