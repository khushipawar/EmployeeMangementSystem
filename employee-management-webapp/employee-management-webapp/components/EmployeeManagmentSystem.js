import React from 'react';
import axios from 'axios';

class EmployeeManagementSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      employees: [],
      name: '',
      department: '',
      position: ''
    };
  }

  componentDidMount() {
    this.fetchEmployees();
  }

  fetchEmployees = () => {
    axios.get('http://localhost:8080/api/employees')
      .then(response => {
        this.setState({ employees: response.data });
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
      });
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleAddEmployee = (event) => {
    event.preventDefault();
    const { name, department, position } = this.state;

    const newEmployee = {
      name: name,
      department: department,
      position: position
    };

    axios.post('https://localhost:8080/employees/', newEmployee)
      .then(response => {
        this.setState(prevState => ({
          employees: [...prevState.employees, response.data],
          name: '',
          department: '',
          position: ''
        }));
      })
      .catch(error => {
        console.error('Error adding employee:', error);
      });
  };

  render() {
    const { employees, name, department, position } = this.state;

    return (
      <div>
      <header>
          <h1>Employee Management System</h1>
        </header>

        <main>
          {/* Employee List */}
          <section>
            <h2>Employee List</h2>
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>
                      {/* You can add action buttons here to edit or delete an employee */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Employee Details Form */}
          <section>
            <h2>Add Employee</h2>
            <form onSubmit={this.handleAddEmployee}>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={this.handleInputChange}
                required
              />

              <label htmlFor="department">Department:</label>
              <input
                type="text"
                id="department"
                name="department"
                value={department}
                onChange={this.handleInputChange}
                required
              />

              <label htmlFor="position">Position:</label>
              <input
                type="text"
                id="position"
                name="position"
                value={position}
                onChange={this.handleInputChange}
                required
              />

              <button type="submit">Add</button>
            </form>
          </section>
        </main>

        <footer>
          <p>Employee Management System &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    );
  }
}

export default EmployeeManagementSystem;
