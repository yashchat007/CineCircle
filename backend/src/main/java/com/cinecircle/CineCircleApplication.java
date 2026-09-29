package com.cinecircle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CineCircleApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineCircleApplication.class, args);
    }
}
