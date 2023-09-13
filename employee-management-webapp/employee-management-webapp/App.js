handleKey = (e, index, uniqueID) => {
        if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 &&
            e.keyCode <= 105)) {
            let size = e.target.value.length;
            if ((size == 2 && e.target.value < 13) || (size == 5 && Number(e.target.value.split('-')[1]) < 32)) {
                e.target.value += '-';
                this.state.transformations[uniqueID].valueTransformation[index].mappedValue = e.target.value;
            }
        }
        this.setState({dateError: true});
    }
    handleDateChange = (e, index, uniqueID) => {
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 &&
                e.keyCode <= 105)) {
                let size = e.target.value.length;
                if ((size == 2 && e.target.value < 13) || (size == 5 && Number(e.target.value.split('-')[1]) < 32)) {
                    e.target.value += '-';
                    this.state.transformations[uniqueID].logicalTransformation[index].comparisonValue = e.target.value;
                }
            }
            this.setState({dateError: true});
        }
     handleDateChangeRowset = (e, index, uniqueID) => {
                if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 &&
                    e.keyCode <= 105)) {
                    let size = e.target.value.length;
                    if ((size == 2 && e.target.value < 13) || (size == 5 && Number(e.target.value.split('-')[1]) < 32)) {
                        e.target.value += '-';
                        this.state.transformations[uniqueID].logicalDerivationRowsets.comparisonValue = e.target.value;
                        this.state.transformations[uniqueID].logicalDerivationRowsets.thenValue = e.target.value;
                    }
                }
                this.setState({dateError: true});
            }
