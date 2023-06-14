package com.example.springboot.controller;
import com.example.springboot.models.Employee;
import org.springframework.web.bind.annotation.*;
import  org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private  final List<Employee> employees = new ArrayList<>();

//    @GetMapping("/")
//    public List<Employee> getAllEmployees() {
//        return employees;
//    }
//
//    @PostMapping("/")
//    public Employee createEmployee(@RequestBody Employee employee) {
//        employees.add(employee);
//        return employee;
//    }
    public EmployeeController()
    {
        employees.add(new Employee(1L,"Khushi Pawar","khushipawar636@gmail.com","Software Engineer"));
        employees.add(new Employee(2L,"Akriti Singh","akritisingh1109@gmail.com","Software Developer"));

    }
    @CrossOrigin("http://localhost:3002")
    @GetMapping("/")
    public ResponseEntity<List<Employee>> getAllEmployees()
    {
        return  new ResponseEntity<>(employees,HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id)
    {
        Employee employee = findEmployeeById(id);
        if(employee!=null)
        {
            return new ResponseEntity<>(employee,HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @CrossOrigin("http://localhost:3002")
    @PostMapping("/")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee)
    {
        employee.setId(generateEmployeeId());
        employees.add(employee);
        return new ResponseEntity<>(employee,HttpStatus.CREATED);
    }
    @CrossOrigin("http://localhost:3002")
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id,@RequestBody Employee updatedEmployee)
    {
        Employee existingEmployee= findEmployeeById(id);
        if(existingEmployee!=null)
        {
            existingEmployee.setName(updatedEmployee.getName());
            existingEmployee.setEmail(updatedEmployee.getEmail());
            existingEmployee.setJobTitle(updatedEmployee.getJobTitle());
            return new ResponseEntity<>(existingEmployee,HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @CrossOrigin("http://localhost:3002")
@DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id)
{
    Employee employee = findEmployeeById(id);
    if(employee!=null)
    {
        employees.remove(employee);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    else
    {
        return  new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}

private Employee findEmployeeById(Long id)
{
    for(Employee employee :employees)
    {
        if(employee.getId().equals(id))
        {
            return employee;
        }
    }
    return null;
}
private Long generateEmployeeId()
{
    return System.currentTimeMillis();
}
//    @PutMapping("/{id}")
//    public Employee updateEmployee(@PathVariable String id, @RequestBody Employee updatedEmployee) {
//        Employee employee = findEmployeeById(id);
//        if (employee != null) {
//            employee.setName(updatedEmployee.getName());
//            employee.setEmail(updatedEmployee.getEmail());
//            employee.setJobTitle(updatedEmployee.getJobTitle());
//        }
//        return employee;
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteEmployee(@PathVariable String id) {
//        Employee employee = findEmployeeById(id);
//        if (employee != null) {
//            employees.remove(employee);
//        }
//    }
//
//    private Employee findEmployeeById(String id) {
//        for (Employee employee : employees) {
//            if (employee.getId().equals(id)) {
//                return employee;
//            }
//        }
//        return null;
//    }
}
