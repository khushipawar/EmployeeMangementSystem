package com.example.springboot.config;
import  org.springframework.context.annotation.Configuration;
import  org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import  org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class corsConfig implements WebMvcConfigurer {

public void addCorsMappings(CorsRegistry registry)
{
    registry.addMapping("/api/**")
            .allowedOrigins("http://10.97.112.9:3003")
            .allowedMethods("GET","POST","PUT","DELETE")
            .allowedHeaders("*");
}

    
}
