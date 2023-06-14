package com.example.springboot.models;

public class Employee {
    private Long id;
    private String name;
    private String email;
    private String jobTitle;

    public Employee() {
    }

    public Employee(Long id, String name, String email, String jobTitle) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.jobTitle = jobTitle;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
}
